import {build} from 'esbuild';
import {writeFile,readFile} from 'node:fs/promises';
// Run from pi-extensions/ (npm run build:renderers); dev dependencies live there.
const vendor='team-webui/web/vendor';
await build({stdin:{contents:"export {marked} from 'marked'; export {default as DOMPurify} from 'dompurify';",resolveDir:process.cwd()},bundle:true,minify:true,format:'esm',platform:'browser',outfile:`${vendor}/markdown.js`,legalComments:'eof'});
await build({stdin:{contents:"export {default} from 'mermaid';",resolveDir:process.cwd()},bundle:true,minify:true,format:'esm',platform:'browser',outfile:`${vendor}/mermaid.js`,legalComments:'eof'});
const names=['marked','dompurify','mermaid'];
const info=await Promise.all(names.map(async name=>{const p=JSON.parse(await readFile(`node_modules/${name}/package.json`,'utf8'));return `${name} ${p.version} · ${p.license} · ${typeof p.repository==='string'?p.repository:p.repository?.url}`;}));
await writeFile(`${vendor}/RENDERERS.txt`,info.join('\n')+'\nBuilt locally with team-webui/scripts/build-renderers.mjs (npm run build:renderers); dependencies pinned in package-lock.json.\nThird-party license notices are embedded in each bundle.\n');
