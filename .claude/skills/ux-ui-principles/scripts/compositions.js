/*
 * Composition templates for direction previews (and a starting point for real first screens).
 *
 * A direction (assets/directions/directions.json) supplies tokens: ground, surface, ink, muted, accent,
 * faces, weight, case, tracking, radius, button shape. A composition supplies the arrangement, and a
 * content pack (assets/directions/content-packs.json) supplies a real subject. Fourteen compositions (c1..c14), each
 * distilled from a studied reference (assets/references/README.md); they differ in structure, not paint:
 *
 *   c1 editorial   register strip, very large serif headline with one italic phrase, ledger, three pillars
 *   c2 collage     headline left, framed photographs with plate numbers over an accent disc, vertical rail
 *   c3 fullbleed   photograph to every edge, wordmark across it, statement and action in a corner
 *   c4 swiss       hairline header grid, one giant numeral, caps headline, spec table, drop-cap column
 *   c5 soft        floating pill nav, two-tone grotesk headline, stacked product fragments with real data
 *   c6 poster      inset photograph with caption marks, condensed capitals below, one accent line
 *   c7 question    the decision as a giant question, dark answer card, figures strip
 *   c8 centered    centred heavy headline, inline form, accent field with perspective grid and ticker
 *   c9 magazine    issue masthead, three-line serif headline, briefs in columns, pulled quote, side photo
 *   c10 board      sidebar, one-sentence finding with its number, serif figures, bars with one accent
 *   c11 nocturne   night photograph to every edge, light serif headline, a moon disc and one vertical glyph, chapters
 *   c12 portrait   three-line heavy headline (last line in accent), arched photo cut-out, sticker, ticker band
 *   c13 nature     centred serif sentence over a photograph of the place, pillars as quiet links at the foot
 *   c14 cover      report or deck cover: register line, very large serif title with an italic phrase, seal and meta
 *
 * render(direction, compositionId, pack, photos) -> full HTML document string (1440 wide).
 * photos: { key: url or data URI }. Standard library only; used by direction_preview.js.
 */

const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// luminance of a colour string (scripts/_color.js); 1 (treated as light) when it cannot be parsed
const { luminance } = require('./_color');
const lum = (c) => { const v = luminance(c); return v == null ? 1 : v; };

const SERIF = /serif|caslon|bodoni|fraunces|newsreader|vollkorn|prata|yeseva|spectral|zilla|young serif|hedvig|instrument serif|cormorant|playfair|libre|grenze|ultra/i;
const CONDENSED = /condensed|league gothic|six caps|anton|oswald|big shoulders|bebas|saira|barlow condensed|sofia sans extra/i;

function base(d, W, H) {
  const dark = lum(d.ground) < 0.2;
  const serif = SERIF.test(d.display);
  const btnR = ({ pill: 999, round: 10, square: 0 })[d.btn || (d.radius >= 14 ? 'pill' : d.radius ? 'round' : 'square')];
  return {
    dark, serif, condensed: CONDENSED.test(d.display), btnR,
    css: `
:root{--g:${d.ground};--s:${d.surface};--i:${d.ink};--m:${d.muted};--a:${d.accent};--ai:${d.accentInk};--r:${d.radius}px;--br:${btnR}px;
  --line:color-mix(in srgb,var(--i) 16%,transparent);--line2:color-mix(in srgb,var(--i) 32%,transparent);
  --disp:"${d.display}","Kanit",serif;--body:"${d.body}","Noto Sans Thai",system-ui,sans-serif;--mono:"JetBrains Mono",ui-monospace,monospace;
  --dw:${d.dw};--tr:${d.track};--case:${d.case}}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{background:var(--g);color:var(--i);font:400 17px/1.5 var(--body);-webkit-font-smoothing:antialiased}
.d{font-family:var(--disp);font-weight:var(--dw);letter-spacing:var(--tr);text-transform:var(--case);line-height:.96;text-wrap:balance}
.d em{font-style:${serif ? 'italic' : 'normal'};color:var(--a)}
.mono{font:500 11.5px/1.4 var(--mono);letter-spacing:.12em;text-transform:uppercase}
.m{color:var(--m)}
.btn{display:inline-flex;align-items:center;gap:10px;height:52px;padding:0 26px;border-radius:var(--br);background:var(--a);color:var(--ai);font:600 16px var(--body);white-space:nowrap}
.btn.ink{background:var(--i);color:var(--g)}
.lnk{font:600 16px var(--body);color:var(--i);text-decoration:underline;text-underline-offset:5px;text-decoration-thickness:1.5px}
.ph{background:var(--line) center/cover no-repeat}
.tag{position:absolute;right:16px;bottom:12px;font:500 11px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--m);opacity:.8}
`,
  };
}

const H1 = (p) => `${esc(p.h1[0])}<em>${esc(p.h1[1])}</em>${esc(p.h1[2])}`;
const regLine = (p) => p.reg.map(esc).join('<span class="sep">/</span>');
const photoOf = (photos, key) => (key && photos[key]) ? `background-image:url('${photos[key]}')` : '';

// A second section under every first screen: the subject's real list (menu, works, schedule, jobs),
// so a preview shows rhythm between sections instead of an empty lower half.
const MORE_TITLE = { cafe: 'This week at the bar', architecture: 'Selected work', saas: 'Jobs running now', clinic: 'Treatments and prices', dental: 'Prices before the chair',
  consultancy: 'Recent decisions', publisher: 'In this issue', festival: 'The weekend', streetfood: 'The five stalls', ceramics: 'From firing 41',
  fintech: 'This month', data: 'By region', school: 'Courses this term', retreat: 'Cabins and meals', bar: 'Tonight on the turntable' };
const MORE_CSS = `
.more{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:56px;padding:64px 64px 0}
.more .mono{color:var(--a);margin-bottom:12px}.more h2{font-size:52px;line-height:1}
.more ol{list-style:none;border-top:1px solid var(--i)}
.more li{display:grid;grid-template-columns:2.2rem minmax(0,1.2fr) minmax(0,1fr) auto;gap:20px;align-items:baseline;padding:15px 0;border-bottom:1px solid var(--line)}
.more li .n{font:500 12px var(--mono);color:var(--m)}.more li b{font:var(--dw) 22px/1.2 var(--disp);letter-spacing:var(--tr);text-transform:var(--case)}
.more li span{color:var(--m);font-size:15px}.more li i{font-style:normal;font-variant-numeric:tabular-nums;font-weight:600}`;
const more = (p, subject) => `<section class="more"><div><p class="mono">${esc(p.reg[0])}</p><h2 class="d">${esc(MORE_TITLE[subject] || 'More')}</h2></div>
<ol>${p.list.map((r, i) => `<li><span class="n">${String(i + 1).padStart(2, '0')}</span><b>${esc(r[0])}</b><span>${esc(r[1])}</span><i>${esc(r[2])}</i></li>`).join('')}</ol></section>`;

// ---------------------------------------------------------------- compositions
const C = {};

C.c1 = (d, p, ph, b) => ({
  css: `
.reg{display:flex;gap:28px;padding:14px 64px;border-bottom:1px solid var(--line);color:var(--m)}.reg .sep{opacity:.4;margin:0 2px}.reg b{margin-left:auto;color:var(--i)}
nav{display:flex;align-items:baseline;gap:36px;padding:26px 64px}nav .brand{font:var(--dw) 30px/1 var(--disp);letter-spacing:var(--tr);text-transform:var(--case)}nav a{color:var(--m);font-size:15px}nav .sp{margin-left:auto}
main{display:grid;grid-template-columns:minmax(0,8fr) minmax(0,4fr);gap:64px;padding:56px 64px 0;align-items:end}
.kick{display:flex;align-items:center;gap:14px;color:var(--m);margin-bottom:28px}.kick:before{content:"";width:48px;height:1px;background:var(--i)}
h1{font-size:${b.condensed ? 150 : 124}px;line-height:${b.serif ? .97 : .92};max-width:16ch}
.sub{font-size:21px;line-height:1.5;color:var(--m);max-width:40ch;margin:34px 0 34px}
.cta{display:flex;align-items:center;gap:28px}
.ledger{border-top:2px solid var(--i);padding-top:14px}.ledger .mono{color:var(--m);margin-bottom:6px}
.ledger div{display:flex;justify-content:space-between;align-items:baseline;padding:16px 0;border-bottom:1px solid var(--line)}
.ledger b{font:var(--dw) 40px/1 var(--disp);letter-spacing:var(--tr)}.ledger span{color:var(--m);font-size:14px;max-width:16ch;text-align:right}
.pill{display:grid;grid-template-columns:repeat(3,1fr);gap:48px;margin:84px 64px 0;padding-top:26px;border-top:1px solid var(--line)}
.pill .mono{color:var(--a);margin-bottom:12px}.pill h3{font:var(--dw) 26px/1.15 var(--disp);letter-spacing:var(--tr);text-transform:var(--case);margin-bottom:8px}.pill p{color:var(--m);font-size:16px;max-width:34ch}`,
  html: `<div class="reg mono">${regLine(p)}<b>${esc(p.brand)}</b></div>
<nav><span class="brand">${esc(p.brand)}</span><a>Work</a><a>About</a><a>Journal</a><span class="sp"></span><a class="lnk">${esc(p.cta2)}</a></nav>
<main><div><p class="kick mono">${esc(p.kicker)}</p><h1 class="d">${H1(p)}</h1><p class="sub">${esc(p.sub)}</p><div class="cta"><a class="btn">${esc(p.cta)}</a></div></div>
<aside class="ledger"><p class="mono">At a glance</p>${p.figs.map((f) => `<div><b>${esc(f[0])}</b><span>${esc(f[1])}</span></div>`).join('')}</aside></main>
<section class="pill">${p.pillars.map((x, i) => `<div><p class="mono">No. ${i + 1}</p><h3>${esc(x[0])}</h3><p>${esc(x[1])}</p></div>`).join('')}</section>`,
});

C.c2 = (d, p, ph, b) => ({
  css: `
nav{display:flex;align-items:center;gap:30px;padding:24px 64px;border-bottom:1px solid var(--line)}nav .brand{font:var(--dw) 22px/1 var(--disp);letter-spacing:var(--tr);text-transform:var(--case)}nav a{font-size:15px;color:var(--m)}nav .sp{margin-left:auto}
.mast{display:flex;justify-content:center;gap:40px;padding:10px 64px;color:var(--m);border-bottom:1px solid var(--line)}.mast .sep{margin:0 8px;opacity:.4}
main{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:40px;padding:0 64px;height:860px}
.l{align-self:center;padding-bottom:40px}
.kick{color:var(--a);margin-bottom:26px}
h1{font-size:${b.condensed ? 132 : 104}px;max-width:11ch}
.sub{font-size:19px;color:var(--m);max-width:38ch;margin:30px 0}
.cta{display:flex;gap:22px;align-items:center}
.r{position:relative}
.disc{position:absolute;width:520px;height:520px;border-radius:50%;background:var(--a);right:30px;top:150px;opacity:.95}
.f1,.f2{position:absolute;background:var(--s);padding:12px;border:1px solid var(--line2);box-shadow:0 30px 60px -30px rgba(0,0,0,.45)}
.f1{width:430px;height:540px;right:90px;top:110px;rotate:-2.5deg}.f2{width:250px;height:300px;left:20px;bottom:70px;rotate:3deg}
.f1 i,.f2 i{display:block;width:100%;height:calc(100% - 26px)}.f1 span,.f2 span{display:block;margin-top:8px;color:var(--m)}
.rail{position:absolute;right:0;top:120px;writing-mode:vertical-rl;color:var(--m)}
.foot{position:absolute;left:64px;bottom:48px;display:flex;gap:48px}.foot b{display:block;font:var(--dw) 34px/1 var(--disp);letter-spacing:var(--tr)}.foot span{color:var(--m);font-size:14px}`,
  html: `<nav><span class="brand">${esc(p.brand)}</span><span class="sp"></span><a>Work</a><a>Shop</a><a>Visit</a><a class="btn" style="height:42px;padding:0 18px">${esc(p.cta)}</a></nav>
<div class="mast mono">${regLine(p)}</div>
<main><div class="l"><p class="kick mono">${esc(p.kicker)}</p><h1 class="d">${H1(p)}</h1><p class="sub">${esc(p.sub)}</p><div class="cta"><a class="btn">${esc(p.cta)}</a><a class="lnk">${esc(p.cta2)}</a></div></div>
<div class="r"><div class="disc"></div><figure class="f1"><i class="ph" style="${photoOf(ph, p.photo)}"></i><span class="mono">Plate 01 — ${esc(p.reg[0])}</span></figure>
<figure class="f2"><i class="ph" style="${photoOf(ph, p.photo2 || p.photo)};${p.photo2 ? '' : 'background-position:20% 70%'}"></i><span class="mono">Plate 02</span></figure>
<div class="rail mono">${regLine(p)}</div></div>
<div class="foot">${p.figs.map((f) => `<div><b>${esc(f[0])}</b><span>${esc(f[1])}</span></div>`).join('')}</div></main>`,
});

C.c3 = (d, p, ph, b) => {
  const word = p.brand.split(' ')[0];
  const size = Math.min(300, Math.round(1312 / (word.length * (b.condensed ? 0.42 : 0.62))));
  return {
    css: `
.hero{position:relative;height:900px;color:#fff}
.hero .ph{position:absolute;inset:0}
.hero:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,0) 30%,rgba(0,0,0,0) 55%,rgba(0,0,0,.6))}
nav{position:relative;z-index:2;display:flex;align-items:center;gap:28px;padding:26px 64px}nav .brand{font:600 18px var(--body)}nav a{font-size:15px;opacity:.85}nav .sp{margin-left:auto}
.word{position:relative;z-index:2;padding:10px 56px 0;font-size:${size}px;line-height:.82;color:#fff;letter-spacing:${b.condensed ? '0' : '-0.04em'}}
.word em{color:#fff}
.low{position:absolute;z-index:2;left:64px;right:64px;bottom:48px;display:flex;justify-content:space-between;align-items:flex-end;gap:48px}
.low .mono{display:flex;gap:26px;opacity:.9}
.card{background:var(--g);color:var(--i);padding:28px;border-radius:var(--r);width:470px}
.card h1{font-size:40px;margin-bottom:14px;max-width:none}.card p{color:var(--m);font-size:16px;margin-bottom:22px}
.strip{display:grid;grid-template-columns:repeat(3,1fr);padding:40px 64px;gap:40px;border-bottom:1px solid var(--line)}
.strip b{display:block;font:var(--dw) 52px/1 var(--disp);letter-spacing:var(--tr);text-transform:var(--case)}.strip span{color:var(--m)}`,
    html: `<section class="hero"><div class="ph" style="${photoOf(ph, p.photo)}"></div>
<nav><span class="brand">${esc(p.brand)}</span><span class="sp"></span><a>Stay</a><a>Story</a><a>Journal</a><a>Contact</a></nav>
<div class="word d">${esc(word)}</div>
<div class="low"><div class="mono">${p.reg.map((r) => `<span>${esc(r)}</span>`).join('')}</div>
<div class="card"><h1 class="d">${H1(p)}</h1><p>${esc(p.sub)}</p><a class="btn">${esc(p.cta)}</a></div></div></section>
<section class="strip">${p.figs.map((f) => `<div><b>${esc(f[0])}</b><span>${esc(f[1])}</span></div>`).join('')}</section>`,
  };
};

C.c4 = (d, p, ph, b) => ({
  css: `
.grid{display:grid;grid-template-columns:2fr repeat(4,1fr);border-bottom:2px solid var(--i)}
.grid div{padding:12px 20px;border-right:1px solid var(--line2)}.grid div:last-child{border-right:0}.grid small{display:block;color:var(--m);font:500 10px var(--mono);letter-spacing:.14em;text-transform:uppercase;margin-bottom:2px}
.grid .brand{font:var(--dw) 24px/1.1 var(--disp);letter-spacing:var(--tr);text-transform:var(--case);padding-left:40px}
main{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);border-bottom:1px solid var(--i)}
.num{border-right:1px solid var(--i);padding:10px 40px 0;position:relative;overflow:hidden;height:600px}
.num b{display:block;font:800 ${p.big.length > 4 ? 300 : 440}px/0.8 var(--disp);letter-spacing:-.06em;margin-top:40px;white-space:nowrap}
.num i{position:absolute;right:40px;top:44px;width:62px;height:62px;border-radius:50%;border:5px solid var(--a);display:grid;place-items:center;font:800 24px var(--body);color:var(--a);font-style:normal}
.r{padding:40px 48px 0}
.r .mono{color:var(--a);margin-bottom:18px}
h1{font-size:${b.condensed ? 92 : 64}px;line-height:.95;margin-bottom:30px;text-transform:uppercase}
h1 em{color:var(--a)}
table{width:100%;border-collapse:collapse}td{padding:11px 0;border-top:1px solid var(--line2);font-size:15px}td:first-child{font:500 11px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--m);width:34%}
.low{display:grid;grid-template-columns:1fr 2fr 1fr;gap:40px;padding:34px 40px}
.low p.drop{font-size:18px;line-height:1.55;column-count:2;column-gap:40px}.low p.drop:first-letter{float:left;font:800 74px/.8 var(--disp);margin:6px 10px 0 0}
.low .mono{color:var(--m);line-height:2}
.cta{display:flex;flex-direction:column;gap:14px;align-items:flex-start}`,
  html: `<div class="grid"><div class="brand">${esc(p.brand)}</div>${p.reg.map((r, i) => `<div><small>${['Vol', 'Issue', 'Where', 'Status'][i]}</small>${esc(r)}</div>`).join('')}</div>
<main><div class="num"><b>${esc(p.big)}</b><i>®</i></div>
<div class="r"><p class="mono">[ ${esc(p.kicker)} ]</p><h1 class="d">${H1(p)}</h1>
<table>${p.rows.map((r) => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</table></div></main>
<section class="low"><div class="mono">${p.pillars.map((x) => esc(x[0])).join('<br>')}</div><p class="drop">${esc(p.sub)} ${esc(p.pillars[0][1])}</p><div class="cta"><a class="btn ink">${esc(p.cta)}</a><a class="lnk">${esc(p.cta2)}</a></div></section>`,
});

C.c5 = (d, p, ph, b) => ({
  css: `
nav{display:flex;align-items:center;gap:26px;margin:26px auto 0;width:max-content;padding:8px 8px 8px 22px;border-radius:999px;background:var(--s);box-shadow:0 0 0 1px var(--line),0 10px 30px -12px rgba(0,0,0,.25)}
nav .brand{font:700 17px var(--body);display:flex;align-items:center;gap:8px}nav .brand:before{content:"";width:18px;height:18px;border-radius:50%;background:var(--a)}nav a{font-size:14px;color:var(--m)}
nav .btn{height:38px;padding:0 16px;font-size:14px;border-radius:999px}
main{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:56px;padding:90px 72px 0;align-items:center}
.chip{display:inline-flex;gap:10px;align-items:center;padding:6px 12px;border-radius:999px;background:var(--s);box-shadow:0 0 0 1px var(--line);color:var(--m);margin-bottom:30px}.chip:before{content:"";width:7px;height:7px;border-radius:50%;background:var(--a)}
h1{font-size:${b.condensed ? 120 : 92}px;line-height:.96;text-transform:var(--case)}
h1 em,h1 span{color:var(--m);font-style:normal}
.sub{font-size:19px;color:var(--m);max-width:42ch;margin:30px 0 32px}
.cta{display:flex;gap:20px;align-items:center}.cta .btn:after{content:"↗";display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:color-mix(in srgb,var(--ai) 18%,transparent);margin-right:-12px}
.stack{display:grid;gap:14px}
.card{background:var(--s);border-radius:calc(var(--r) + 6px);padding:20px 22px;box-shadow:0 0 0 1px var(--line),0 24px 50px -30px rgba(0,0,0,.4)}
.card .mono{color:var(--m);font-size:10.5px;margin-bottom:10px;display:flex;justify-content:space-between}
.rows div{display:flex;justify-content:space-between;padding:7px 0;border-top:1px solid var(--line);font-size:15px}.rows div:first-child{border-top:0}.rows span{color:var(--m)}
.two{display:grid;grid-template-columns:1fr 1fr;gap:14px}.two b{display:block;font:var(--dw) 40px/1 var(--disp);letter-spacing:var(--tr)}.two span{color:var(--m);font-size:13px}
.ok{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--a);margin-right:8px}
.list div{display:grid;grid-template-columns:1fr auto;gap:14px;padding:8px 0;border-top:1px solid var(--line);font-size:14px}.list div:first-child{border-top:0}.list small{color:var(--m);display:block;font-size:12px}
.logos{display:flex;gap:56px;padding:76px 72px 0;color:var(--m)}`,
  html: `<nav><span class="brand">${esc(p.brand)}</span><a>Product</a><a>Pricing</a><a>Docs</a><a>Changelog</a><a class="btn">${esc(p.cta)}</a></nav>
<main><div><span class="chip mono">${esc(p.reg[0])}</span><h1 class="d">${esc(p.h1[0])}<span>${esc(p.h1[1])}${esc(p.h1[2])}</span></h1><p class="sub">${esc(p.sub)}</p><div class="cta"><a class="btn">${esc(p.cta)}</a><a class="lnk">${esc(p.cta2)}</a></div></div>
<div class="stack"><div class="card"><p class="mono"><span>${esc(p.rows[0][1])}</span><span><i class="ok"></i>live</span></p><div class="rows">${p.rows.slice(1).map((r) => `<div><span>${esc(r[0])}</span><b>${esc(r[1])}</b></div>`).join('')}</div></div>
<div class="two">${p.figs.slice(0, 2).map((f) => `<div class="card"><p class="mono">${esc(f[1])}</p><b>${esc(f[0])}</b></div>`).join('')}</div>
<div class="card list">${p.list.slice(0, 3).map((r) => `<div><div>${esc(r[0])}<small>${esc(r[1])}</small></div><b>${esc(r[2])}</b></div>`).join('')}</div></div></main>
<div class="logos mono">${p.reg.slice(1).map(esc).join('<span>·</span>')}</div>`,
});

C.c6 = (d, p, ph, b) => ({
  css: `
nav{display:flex;align-items:center;gap:26px;padding:22px 56px}nav .brand{display:flex;align-items:center;gap:10px;font:var(--dw) 22px/1 var(--disp);letter-spacing:var(--tr);text-transform:uppercase}nav .brand:before{content:"";width:22px;height:22px;background:var(--a)}
nav .mono{color:var(--m)}nav .sp{margin-left:auto}
.frame{position:relative;margin:0 56px;height:560px;border-radius:var(--r);overflow:hidden}
.frame .ph{position:absolute;inset:0}
.frame .mono{position:absolute;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.5)}.tl{left:20px;top:18px}.tr{right:20px;top:18px}.bl{left:20px;bottom:18px}.br{right:20px;bottom:18px}
.low{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,.9fr);gap:48px;padding:36px 56px 0;align-items:end}
.kick{color:var(--a);margin-bottom:12px}
h1{font-size:${b.condensed ? 158 : 112}px;line-height:.86;text-transform:uppercase;letter-spacing:${b.condensed ? '0' : '-0.035em'}}
h1 em{font-style:italic;color:var(--a)}
.side p{font-size:18px;color:var(--m);margin-bottom:24px}
.tags{display:flex;gap:10px;padding:30px 56px}.tags span{border:1.5px solid var(--i);padding:5px 12px;border-radius:var(--br)}`,
  html: `<nav><span class="brand">${esc(p.brand)}</span><span class="mono">${esc(p.reg[0])}</span><span class="sp"></span><span class="mono">Line-up</span><span class="mono">Tickets</span><span class="mono">Info</span></nav>
<div class="frame"><div class="ph" style="${photoOf(ph, p.photo)}"></div><span class="mono tl">${esc(p.reg[1])}</span><span class="mono tr">${esc(p.reg[2])}</span><span class="mono bl">${esc(p.brand)}</span><span class="mono br">${esc(p.reg[3])}</span></div>
<div class="low"><div><p class="kick mono">— ${esc(p.kicker)}</p><h1 class="d">${H1(p)}</h1></div><div class="side"><p>${esc(p.sub)}</p><a class="btn">${esc(p.cta)}</a></div></div>
<div class="tags mono">${p.figs.map((f) => `<span>${esc(f[0])} ${esc(f[1])}</span>`).join('')}</div>`,
});

C.c7 = (d, p, ph, b) => ({
  css: `
.top{display:flex;align-items:center;gap:22px;padding:22px 64px;border-bottom:1px solid var(--line)}.top .brand{font:var(--dw) 20px var(--disp);letter-spacing:var(--tr)}.top .mono{color:var(--m)}.top .sp{margin-left:auto}
main{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);gap:56px;padding:56px 64px 0}
.chips{display:flex;gap:10px;margin-bottom:34px}.chips span{padding:6px 12px;border:1px solid var(--line2);border-radius:var(--br);color:var(--m)}.chips span:first-child{border-color:var(--a);color:var(--a)}
h1{font-size:${b.condensed ? 112 : 80}px;line-height:1;text-transform:var(--case)}
h1 em{color:inherit;font-style:${b.serif ? 'italic' : 'normal'}}
.sub{font-size:19px;color:var(--m);max-width:48ch;margin-top:30px}
.ans{background:var(--i);color:var(--g);border-radius:var(--r);padding:34px;align-self:start;margin-top:30px}
.ans .mono{opacity:.65;margin-bottom:18px}.ans p.big{font:var(--dw) 30px/1.25 var(--disp);letter-spacing:var(--tr);text-transform:none;margin-bottom:26px}
.ans .btn{background:var(--a);color:var(--ai)}
.ans .why{margin-top:26px;padding-top:18px;border-top:1px solid color-mix(in srgb,var(--g) 25%,transparent);font-size:15px;opacity:.85}
.figs{display:grid;grid-template-columns:repeat(4,1fr);margin:70px 64px 0;border-top:2px solid var(--i)}
.figs div{padding:20px 20px 0 0}.figs b{display:block;font:var(--dw) 54px/1 var(--disp);letter-spacing:var(--tr)}.figs span{color:var(--m);font-size:15px}`,
  html: `<div class="top"><span class="brand">${esc(p.brand)}</span><span class="mono">${esc(p.reg[0])}</span><span class="sp"></span><span class="mono">${esc(p.reg[1])}</span><span class="mono">${esc(p.reg[2])}</span></div>
<main><div><div class="chips mono"><span>Recommendation</span><span>${esc(p.reg[3])}</span></div><h1 class="d"><em>${esc(p.q)}</em></h1><p class="sub">${esc(p.sub)}</p></div>
<aside class="ans"><p class="mono">Our answer</p><p class="big">${esc(p.answer)}</p><a class="btn">${esc(p.cta)}</a><p class="why">${esc(p.pillars[2][0])}: ${esc(p.pillars[2][1])}</p></aside></main>
<section class="figs">${p.figs.map((f) => `<div><b>${esc(f[0])}</b><span>${esc(f[1])}</span></div>`).join('')}<div><b>${esc(p.rows[0][1])}</b><span>${esc(p.rows[0][0])}</span></div></section>`,
});

C.c8 = (d, p, ph, b) => ({
  css: `
nav{display:flex;align-items:center;gap:12px;padding:24px 48px}nav .mk{width:34px;height:34px;border-radius:50%;background:var(--a);color:var(--ai);display:grid;place-items:center;font:800 14px var(--body)}nav .brand{font:700 17px var(--body)}nav .sp{margin-left:auto}nav a{font-size:15px;color:var(--m);margin-left:22px}
.c{text-align:center;padding:60px 80px 0}
.kick{color:var(--m);margin-bottom:26px}
h1{font-size:${b.condensed ? 170 : 128}px;line-height:.9;margin:0 auto;max-width:13ch}
.sub{font-size:20px;color:var(--m);max-width:46ch;margin:28px auto 30px}
form{display:inline-flex;gap:10px;padding:8px;border-radius:calc(var(--br) + 8px);background:var(--s);box-shadow:0 0 0 1px var(--line)}
form i{display:block;width:300px;height:48px;border-radius:var(--br);background:var(--g);text-align:left;padding:13px 18px;color:var(--m);font-style:normal}
form .btn{height:48px}
.field{position:absolute;left:0;right:0;bottom:0;height:330px;background:var(--a);overflow:hidden}
.field svg{position:absolute;inset:0;width:100%;height:100%}
.tick{position:absolute;left:0;right:0;bottom:0;height:42px;background:var(--i);color:var(--g);display:flex;align-items:center;gap:30px;white-space:nowrap;overflow:hidden;padding-left:20px}
.sun{position:absolute;left:50%;top:-150px;width:300px;height:300px;margin-left:-150px;border-radius:50%;background:var(--g);opacity:.9}`,
  html: `<nav><span class="mk">${esc(p.brand.slice(0, 2))}</span><span class="brand">${esc(p.brand)}</span><span class="sp"></span><a>How it works</a><a>Prices</a><a>FAQ</a></nav>
<div class="c"><p class="kick mono">${esc(p.kicker)}</p><h1 class="d">${H1(p)}</h1><p class="sub">${esc(p.sub)}</p><form><i>Your email</i><a class="btn">${esc(p.cta)}</a></form></div>
<div class="field"><div class="sun"></div><svg viewBox="0 0 1440 330" preserveAspectRatio="none">${Array.from({ length: 19 }, (_, i) => `<line x1="720" y1="0" x2="${-900 + i * 180}" y2="330" stroke="${d.accentInk}" stroke-opacity=".28"/>`).join('')}${[30, 70, 125, 200, 290].map((y) => `<line x1="0" x2="1440" y1="${y}" y2="${y}" stroke="${d.accentInk}" stroke-opacity=".28"/>`).join('')}</svg>
<div class="tick mono">${Array.from({ length: 6 }, () => p.reg.map(esc).join('<span>✦</span>')).join('<span>✦</span>')}</div></div>`,
});

C.c9 = (d, p, ph, b) => ({
  css: `
.mast{display:flex;justify-content:space-between;align-items:baseline;padding:22px 64px 16px;border-bottom:3px double var(--i)}
.mast .brand{font:var(--dw) 40px/1 var(--disp);letter-spacing:var(--tr);text-transform:var(--case)}.mast .mono{color:var(--m)}
main{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:56px;padding:44px 64px 0}
.kick{color:var(--a);margin-bottom:22px}
h1{font-size:${b.condensed ? 150 : 112}px;line-height:.94;max-width:14ch}
.by{display:flex;gap:28px;color:var(--m);margin:28px 0 30px;padding-bottom:22px;border-bottom:1px solid var(--line)}
.cols{display:grid;grid-template-columns:repeat(2,1fr);gap:36px}
.cols .mono{color:var(--a);margin-bottom:8px}.cols h3{font:var(--dw) 25px/1.15 var(--disp);letter-spacing:var(--tr);text-transform:var(--case);margin-bottom:8px}.cols p{color:var(--m);font-size:15.5px}
.q{border:1px solid var(--i);padding:16px 18px;font:500 13px/1.6 var(--mono);margin-top:4px}
.side .ph{height:470px;border-radius:var(--r);margin-bottom:14px}.side .mono{color:var(--m)}
.side ol{list-style:none;margin-top:18px;border-top:1px solid var(--i)}.side li{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid var(--line);font-size:14.5px}.side li span{color:var(--m);white-space:nowrap}`,
  html: `<div class="mast"><span class="brand">${esc(p.brand)}</span><span class="mono">${regLine(p)}</span></div>
<main><div><p class="kick mono">${esc(p.kicker)}</p><h1 class="d">${H1(p)}</h1><p class="by mono"><span>${esc(p.reg[0])}</span><span>${esc(p.reg[2])}</span><span>${esc(p.figs[2][0])} ${esc(p.figs[2][1])}</span></p>
<div class="cols"><div><p class="mono">01 — ${esc(p.pillars[0][0])}</p><h3>${esc(p.sub.split('. ')[0])}.</h3><p>${esc(p.pillars[0][1])} ${esc(p.pillars[1][1])}</p></div><div><p class="mono">02 — Pulled quote</p><p class="q">“${esc(p.answer)}”</p><p style="margin-top:14px"><a class="btn">${esc(p.cta)}</a></p></div></div></div>
<aside class="side"><div class="ph" style="${photoOf(ph, p.photo)}"></div><p class="mono">Plate — ${esc(p.reg[1])}</p><ol>${p.list.slice(0, 4).map((r) => `<li>${esc(r[0])}<span>${esc(r[2])}</span></li>`).join('')}</ol></aside></main>`,
});

C.c10 = (d, p, ph, b) => {
  const s = p.series || [44, 51, 39, 62, 58, 47, 66, 71, 55, 49, 60, 74];
  const mx = Math.max(...s), bi = s.indexOf(b.serif || !p.series ? mx : Math.min(...s));
  return {
    css: `
body{display:grid;grid-template-columns:240px 1fr}
aside{border-right:1px solid var(--line);padding:26px 22px;height:${1240}px}
aside .brand{font:var(--dw) 28px/1 var(--disp);letter-spacing:var(--tr);margin-bottom:6px}aside .mono{color:var(--m);font-size:10px;margin:26px 0 10px}
aside div{display:flex;justify-content:space-between;padding:7px 0;font-size:14.5px}aside div.on{color:var(--a);font-weight:600}aside span{color:var(--m)}
main{padding:24px 44px 0}
.top{display:flex;justify-content:space-between;color:var(--m);padding-bottom:14px;border-bottom:1px solid var(--line)}
h1{font-size:54px;line-height:1.02;max-width:20ch;margin:34px 0 10px}
h1 em{font-style:${b.serif ? 'italic' : 'normal'};color:var(--a)}
.sub{color:var(--m);max-width:62ch;font-size:17px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin-top:30px;border-top:1px solid var(--line)}
.grid div{padding:20px 22px 22px 0;border-bottom:1px solid var(--line)}.grid .mono{color:var(--m);font-size:10px}
.grid b{display:block;font:${b.serif ? 400 : 'var(--dw)'} 58px/1.05 var(--disp);letter-spacing:var(--tr);margin:6px 0 2px}.grid i{color:var(--m);font-size:14px}
.chart{margin-top:30px}.chart .mono{color:var(--m);display:flex;justify-content:space-between;margin-bottom:14px}
.bars{display:flex;align-items:flex-end;gap:14px;height:250px;border-bottom:1.5px solid var(--i)}
.bars i{flex:1;background:var(--i);border-radius:2px 2px 0 0;opacity:.88}.bars i.hi{background:var(--a);opacity:1}`,
    html: `<aside><p class="brand">${esc(p.brand)}</p><p class="m" style="font-size:13px">${esc(p.reg[0])}</p><p class="mono">Views</p>${p.list.map((r, i) => `<div class="${i === 0 ? 'on' : ''}">${esc(r[0])}<span>${esc(r[2])}</span></div>`).join('')}<p class="mono">Archive</p><div>${esc(p.reg[1])}<span>›</span></div><div>${esc(p.reg[2])}<span>›</span></div></aside>
<main><div class="top mono"><span>${esc(p.reg[1])} · ${esc(p.reg[2])}</span><span>${esc(p.reg[3])}</span></div>
<h1 class="d">${H1(p)}</h1><p class="sub">${esc(p.sub)}</p>
<div class="grid">${p.figs.concat(p.list.slice(0, 3).map((r) => [r[2], r[0]])).slice(0, 6).map((f) => `<div><p class="mono">${esc(f[1])}</p><b>${esc(f[0])}</b><i>${esc(p.reg[1])}</i></div>`).join('')}</div>
<div class="chart"><p class="mono"><span>Last 12 weeks</span><span>${esc(p.figs[0][1])}</span></p><div class="bars">${s.map((v, i) => `<i class="${i === bi ? 'hi' : ''}" style="height:${Math.round(v / mx * 100)}%"></i>`).join('')}</div></div></main>`,
  };
};


C.c11 = (d, p, ph, b) => ({
  css: `
.night{position:relative;height:900px;color:#f4efe6;overflow:hidden}
.night .ph{position:absolute;inset:0;filter:brightness(.62) saturate(.9)}
.night:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(6,8,16,.78),rgba(6,8,16,.15) 60%,rgba(6,8,16,.4))}
.night nav{position:relative;z-index:2;display:flex;align-items:center;gap:26px;padding:26px 64px}.night nav .brand{font:var(--dw) 22px/1 var(--disp);letter-spacing:var(--tr)}.night nav .sp{margin-left:auto}.night nav .mono{opacity:.75}
.moon{position:absolute;z-index:1;right:220px;top:120px;width:150px;height:150px;border-radius:50%;background:var(--a);box-shadow:0 0 80px color-mix(in srgb,var(--a) 60%,transparent)}
.glyph{position:absolute;z-index:2;right:96px;top:310px;writing-mode:vertical-rl;text-orientation:upright;font:400 120px/1.05 var(--disp);color:#f4efe6;opacity:.85;letter-spacing:.04em}
.copy{position:absolute;z-index:2;left:64px;bottom:120px;max-width:680px}
.copy .mono{opacity:.75;margin-bottom:22px}
.copy h1{font-size:${b.condensed ? 120 : 92}px;line-height:1;color:#f4efe6;font-weight:${b.serif ? 400 : 'var(--dw)'}}
.copy h1 em{color:var(--a)}
.copy p.s{font-size:18px;opacity:.85;max-width:44ch;margin:26px 0 30px}
.copy .ghost{display:inline-flex;align-items:center;height:50px;padding:0 24px;border:1px solid rgba(244,239,230,.6);border-radius:var(--br);font:600 15px var(--body)}
.chap{position:absolute;z-index:2;left:64px;right:64px;bottom:36px;display:flex;gap:44px;border-top:1px solid rgba(244,239,230,.35);padding-top:16px}
.chap span{opacity:.8}.chap b{color:var(--a);margin-right:8px}`,
  html: `<section class="night"><div class="ph" style="${photoOf(ph, p.photo)}"></div><div class="moon"></div><div class="glyph">${esc(p.brand.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase())}</div>
<nav><span class="brand">${esc(p.brand)}</span><span class="sp"></span>${['01', '02', '03', '04'].map((n) => `<span class="mono">${n}</span>`).join('')}</nav>
<div class="copy"><p class="mono">${esc(p.reg[0])} — ${esc(p.reg[1])}</p><h1 class="d">${H1(p)}</h1><p class="s">${esc(p.sub)}</p><a class="ghost">${esc(p.cta)}</a></div>
<div class="chap mono">${p.pillars.map((x, i) => `<span><b>0${i + 1}</b>${esc(x[0])}</span>`).join('')}</div></section>`,
});

C.c12 = (d, p, ph, b) => ({
  css: `
nav{display:flex;align-items:center;gap:28px;padding:24px 56px}nav .brand{font:var(--dw) 20px/1 var(--disp);letter-spacing:var(--tr);text-transform:uppercase}nav .sp{margin-left:auto}nav .mono{color:var(--m)}
main{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:24px;padding:40px 56px 0;height:800px}
.kick{color:var(--m);margin-bottom:22px}
h1{font-size:${b.condensed ? 170 : 132}px;line-height:.88;letter-spacing:${b.condensed ? '0' : '-0.045em'}}
h1 span{display:block}h1 span:last-child{color:var(--a)}
.sub{font-size:19px;color:var(--m);max-width:40ch;margin:28px 0}
.r{position:relative}
.disc{position:absolute;right:20px;top:20px;width:400px;height:400px;border-radius:50%;background:var(--a)}
.cut{position:absolute;right:60px;top:70px;width:380px;height:560px;border-radius:200px 200px var(--r) var(--r);overflow:hidden;box-shadow:0 30px 60px -30px rgba(0,0,0,.5)}
.cut .ph{width:100%;height:100%}
.small{position:absolute;left:0;bottom:60px;width:210px;height:250px;border:8px solid var(--s);rotate:-4deg;box-shadow:0 20px 40px -20px rgba(0,0,0,.45)}.small .ph{width:100%;height:100%}
.stk{position:absolute;right:10px;bottom:120px;width:150px;height:150px;border-radius:50%;background:var(--i);color:var(--g);display:grid;place-items:center;text-align:center;padding:18px;rotate:12deg;font:700 13px/1.25 var(--body);text-transform:uppercase;letter-spacing:.06em}
.tick{position:absolute;left:0;right:0;bottom:0;height:52px;background:var(--a);color:var(--ai);display:flex;align-items:center;gap:34px;white-space:nowrap;overflow:hidden;padding-left:24px}
body{position:relative}`,
  html: `<nav><span class="brand">${esc(p.brand)}</span><span class="sp"></span><span class="mono">Work</span><span class="mono">Practice</span><span class="mono">Notes</span><span class="mono">Contact</span></nav>
<main><div><p class="kick mono">${esc(p.kicker)}</p><h1 class="d">${p.h1.filter(Boolean).map((t) => `<span>${esc(t.trim())}</span>`).join('')}</h1><p class="sub">${esc(p.sub)}</p><a class="btn">${esc(p.cta)}</a></div>
<div class="r"><div class="disc"></div><div class="cut"><div class="ph" style="${photoOf(ph, p.photo)}"></div></div><div class="small"><div class="ph" style="${photoOf(ph, p.photo2 || p.photo)}"></div></div><div class="stk">${esc(p.reg[3])}</div></div></main>
<div class="tick mono" style="top:${1240 - 52}px">${Array.from({ length: 5 }, () => p.pillars.map((x) => esc(x[0])).join('<span>✦</span>')).join('<span>✦</span>')}</div>`,
});

C.c13 = (d, p, ph, b) => ({
  css: `
.nat{position:relative;height:920px;overflow:hidden;color:#fff;text-align:center}
.nat .ph{position:absolute;inset:0}
.nat:after{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 50% 42%,rgba(0,0,0,.08),rgba(0,0,0,.45) 75%)}
.nat nav{position:relative;z-index:2;display:flex;justify-content:space-between;padding:26px 56px}.nat nav .brand{font:var(--dw) 22px var(--disp);letter-spacing:var(--tr)}
.c{position:relative;z-index:2;padding-top:170px}
.c .mono{opacity:.85;margin-bottom:22px}
.c h1{font-size:${b.condensed ? 130 : 104}px;line-height:1;max-width:12ch;margin:0 auto;font-weight:${b.serif ? 400 : 'var(--dw)'};text-shadow:0 2px 30px rgba(0,0,0,.35)}
.c h1 em{color:#fff;font-style:${b.serif ? 'italic' : 'normal'}}
.c p.s{font-size:19px;max-width:46ch;margin:26px auto 30px;opacity:.92}
.dots{position:absolute;z-index:2;left:0;right:0;bottom:34px;display:flex;justify-content:center;gap:40px}.dots span{opacity:.85;border-bottom:1px solid rgba(255,255,255,.5);padding-bottom:6px}`,
  html: `<section class="nat"><div class="ph" style="${photoOf(ph, p.photo)}"></div>
<nav><span class="brand">${esc(p.brand)}</span><span class="mono">${esc(p.reg[0])} · ${esc(p.reg[1])}</span></nav>
<div class="c"><p class="mono">${esc(p.kicker)}</p><h1 class="d">${H1(p)}</h1><p class="s">${esc(p.sub)}</p><a class="btn">${esc(p.cta)}</a></div>
<div class="dots mono">${p.pillars.map((x) => `<span>${esc(x[0])}</span>`).join('')}</div></section>`,
});

C.c14 = (d, p, ph, b) => ({
  css: `
.cov{position:relative;height:900px;padding:34px 72px;display:flex;flex-direction:column;border-bottom:1px solid var(--line)}
.cov .top{display:flex;justify-content:space-between;color:var(--a)}.cov .top span:last-child{color:var(--m)}
.cov .mid{margin-top:auto;margin-bottom:auto}
.cov .brand{color:var(--m);margin-bottom:26px}
.cov h1{font-size:${b.condensed ? 150 : 118}px;line-height:.98;max-width:15ch;font-weight:${b.serif ? 400 : 'var(--dw)'}}
.cov h1 em{color:var(--a);font-style:${b.serif ? 'italic' : 'normal'}}
.cov h1 span{opacity:.55}
.cov p.s{font-size:20px;color:var(--m);max-width:56ch;margin-top:28px}
.cov .foot{display:flex;align-items:center;gap:18px;color:var(--m)}
.seal{width:44px;height:44px;border-radius:50%;border:1.5px solid var(--a);color:var(--a);display:grid;place-items:center;font:600 15px var(--disp)}`,
  html: `<section class="cov"><div class="top mono"><span>${esc(p.kicker)}</span><span>${esc(p.reg[0])} / ${esc(p.reg[1])}</span></div>
<div class="mid"><p class="brand mono">${esc(p.brand)}</p><h1 class="d">${esc(p.h1[0])}<em>${esc(p.h1[1])}</em><span>${esc(p.h1[2])}</span></h1><p class="s">${esc(p.sub)}</p></div>
<div class="foot mono"><span class="seal">${esc(p.brand.slice(0, 1))}</span><span>Prepared for ${esc(p.reg[2])}</span><span>·</span><span>${esc(p.reg[3])}</span></div></section>`,
});

const COMPS = {
  c1: 'editorial', c2: 'collage', c3: 'fullbleed', c4: 'swiss', c5: 'soft', c6: 'poster', c7: 'question', c8: 'centered', c9: 'magazine', c10: 'board',
  c11: 'nocturne', c12: 'portrait', c13: 'nature', c14: 'cover',
};

function render(d, comp, pack, photos, opts = {}) {
  const subject = opts.subject || d.subject;
  const W = opts.width || 1440, H = opts.height || 1240;
  const b = base(d, W, H);
  const part = (C[comp] || C.c1)(d, pack, photos || {}, b);
  // One family per link, three forms each: Google Fonts rejects a whole request when a weight or the italic
  // axis does not exist for that family, so the plainer links still load the face.
  const enc = (f) => f.replace(/ /g, '+');
  const links = [...new Set([d.display, d.body])].flatMap((f) => [
    `family=${enc(f)}:ital,wght@0,400;0,${d.dw};1,400;1,${d.dw}`, `family=${enc(f)}:wght@400;${d.dw}`, `family=${enc(f)}`])
    .concat(['family=JetBrains+Mono:wght@500', 'family=Noto+Sans+Thai:wght@400;600'])
    .map((q) => `<link href="https://fonts.googleapis.com/css2?${q}&display=swap" rel="stylesheet">`).join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
${links}
<style>${b.css}${MORE_CSS}${part.css}${opts.photoFilter ? `.ph{filter:${opts.photoFilter}}` : ''}</style></head>
<body>${part.html}${['c8', 'c10', 'c12'].includes(comp) ? '' : more(pack, subject)}<span class="tag">${esc(d.name)} · ${COMPS[comp] || comp} · sample content</span></body></html>`;
}

module.exports = { render, COMPS, lum };
