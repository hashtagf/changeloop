#!/usr/bin/env node
// Renders PRD.md (or any document in the same Markdown subset) to one
// self-contained HTML file: a contents sidebar, readable Thai type, tables
// that scroll on a phone, evidence labels as badges, and Mermaid diagrams
// (rendered by Mermaid from a CDN when online; the source shows offline).
// Node built-ins only.
//
//   node prd-html.mjs PRD.md [out.html]        default out: prd.html beside it
import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const escape = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function inline(text) {
  const codes = [];
  let out = escape(String(text).replace(/`([^`]+)`/g, (_, code) => `\u0000${codes.push(code) - 1}\u0000`));
  out = out
    .replace(/\[(Data|Assumption|Decision)\]/g, (_, label) => `<span class="tag tag-${label.toLowerCase()}">${label}</span>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => `<a href="${href}">${label}</a>`)
    .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2">$2</a>')
    .replace(/\\([*_\[\]])/g, "$1");
  return out.replace(/\u0000(\d+)\u0000/g, (_, index) => {
    const code = codes[Number(index)];
    const label = code.match(/^\[(Data|Assumption|Decision)\]$/);
    return label ? `<span class="tag tag-${label[1].toLowerCase()}">${label[1]}</span>` : `<code>${escape(code)}</code>`;
  });
}

const cells = (line) => line.trim().replace(/^\||\|$/g, "").split(/(?<!\\)\|/).map((cell) => cell.trim().replace(/\\\|/g, "|"));

export function render(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  const toc = [];
  let index = 0;
  let paragraph = [];
  const flush = () => { if (paragraph.length) html.push(`<p>${inline(paragraph.join(" "))}</p>`); paragraph = []; };
  while (index < lines.length) {
    const line = lines[index];
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      flush();
      const body = [];
      for (index += 1; index < lines.length && !/^```\s*$/.test(lines[index]); index += 1) body.push(lines[index]);
      index += 1;
      html.push(fence[1] === "mermaid" ? `<pre class="mermaid">${escape(body.join("\n"))}</pre>`
        : `<pre><code>${escape(body.join("\n"))}</code></pre>`);
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flush();
      const level = heading[1].length;
      if (level === 2) {
        const id = `s${toc.length}`;
        toc.push({ id, title: heading[2] });
        html.push(`<h2 id="${id}">${inline(heading[2])}</h2>`);
      } else html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }
    if (/^\|.*\|\s*$/.test(line) && /^\|?\s*:?-{2,}/.test(lines[index + 1] || "")) {
      flush();
      const head = cells(line);
      const rows = [];
      for (index += 2; index < lines.length && /^\|.*\|\s*$/.test(lines[index]); index += 1) rows.push(cells(lines[index]));
      html.push(`<div class="table"><table><thead><tr>${head.map((cell) => `<th>${inline(cell)}</th>`).join("")}</tr></thead><tbody>${
        rows.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
      continue;
    }
    const item = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (item) {
      flush();
      const ordered = /\d/.test(item[2]);
      const items = [];
      while (index < lines.length) {
        const current = lines[index].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
        if (current) { items.push(current[3]); index += 1; continue; }
        if (/^\s{2,}\S/.test(lines[index]) && items.length) { items[items.length - 1] += ` ${lines[index].trim()}`; index += 1; continue; }
        break;
      }
      const tag = ordered ? "ol" : "ul";
      html.push(`<${tag}>${items.map((text) => {
        const box = text.match(/^\[( |x)\]\s+(.*)$/i);
        return box ? `<li class="task"><input type="checkbox" disabled${box[1] === " " ? "" : " checked"}> ${inline(box[2])}</li>` : `<li>${inline(text)}</li>`;
      }).join("")}</${tag}>`);
      continue;
    }
    if (/^---+\s*$/.test(line)) { flush(); html.push("<hr>"); index += 1; continue; }
    if (!line.trim()) { flush(); index += 1; continue; }
    paragraph.push(line.trim());
    index += 1;
  }
  flush();
  return { body: html.join("\n"), toc };
}

export function page(markdown) {
  const { body, toc } = render(markdown);
  const title = (markdown.match(/^#\s+(.+)$/m) || [, "PRD"])[1];
  return `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title>
<style>
:root{--ink:#1b1c21;--muted:#5a5c66;--line:#e2ded5;--paper:#faf8f4;--card:#fff;--accent:#7a5a12;--accent-soft:#f5eedb;--data:#1d6b4f;--assumption:#a3122a;--decision:#1f4fa8}
*{box-sizing:border-box}
body{margin:0;font-family:"IBM Plex Sans Thai","Noto Sans Thai",system-ui,sans-serif;line-height:1.7;color:var(--ink);background:var(--paper)}
.layout{display:grid;grid-template-columns:260px minmax(0,1fr);max-width:1280px;margin:0 auto}
nav{position:sticky;top:0;align-self:start;max-height:100vh;overflow:auto;padding:24px 16px;border-right:1px solid var(--line);font-size:14px}
nav a{display:block;padding:6px 8px;min-height:32px;color:var(--ink);text-decoration:none;border-radius:6px}
nav a:hover,nav a:focus-visible{background:var(--accent-soft);outline:2px solid var(--accent);outline-offset:-2px}
main{padding:32px 40px 80px;min-width:0}
h1{font-size:30px;line-height:1.3;margin:0 0 16px}
h2{font-size:22px;margin:48px 0 12px;padding-top:12px;border-top:2px solid var(--accent)}
h3{font-size:17px;margin:28px 0 8px}
.table{overflow-x:auto;margin:12px 0;border:1px solid var(--line);border-radius:8px;background:var(--card)}
table{border-collapse:collapse;width:100%;font-size:14px}
th,td{padding:8px 12px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
th{background:var(--accent-soft);font-weight:600}
tbody tr:last-child td{border-bottom:0}
code{font-family:ui-monospace,Menlo,monospace;font-size:.9em;background:#efebe2;padding:1px 5px;border-radius:4px}
pre{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:16px;overflow-x:auto}
pre code{background:none;padding:0}
.tag{display:inline-block;font-size:12px;font-weight:600;padding:0 8px;border-radius:999px;border:1px solid;white-space:nowrap}
.tag-data{color:var(--data)}.tag-assumption{color:var(--assumption)}.tag-decision{color:var(--decision)}
li.task{list-style:none;margin-left:-1.2em}
a{color:var(--decision)}
@media (max-width:900px){.layout{grid-template-columns:1fr}nav{position:static;max-height:none;border-right:0;border-bottom:1px solid var(--line)}main{padding:24px 16px}}
@media print{nav{display:none}.layout{display:block}}
</style>
</head>
<body>
<div class="layout">
<nav aria-label="Contents">
${toc.map(({ id, title: text }) => `<a href="#${id}">${inline(text)}</a>`).join("\n")}
</nav>
<main>
${body}
</main>
</div>
<script type="module">
try {
  const { default: mermaid } = await import("https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs");
  mermaid.initialize({ startOnLoad: false, theme: "neutral" });
  await mermaid.run({ querySelector: "pre.mermaid" });
} catch { /* offline: the diagram source stays readable */ }
</script>
</body>
</html>
`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  const [source, target] = process.argv.slice(2);
  if (!source) { console.error("usage: prd-html.mjs PRD.md [out.html]"); process.exit(2); }
  const out = target || join(dirname(source), "prd.html");
  const html = page(readFileSync(source, "utf8"));
  writeFileSync(out, html);
  console.log(`prd html: ${out} (${html.length} bytes)`);
}
