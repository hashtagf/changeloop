import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {homedir,tmpdir} from 'node:os';
import {pathToFileURL,fileURLToPath} from 'node:url';
// This test lives in <repo>/pi-extensions/team-webui/test.
const repo=join(fileURLToPath(import.meta.url),'../../../..');

test('installed Pi reload replaces a cached Change Loop adapter instead of retaining slash-only consent',async t=>{
 const root=mkdtempSync(join(tmpdir(),'pi-land-loader-'));
 t.after(()=>rmSync(root,{recursive:true,force:true}));
 mkdirSync(join(root,'.pi/extensions'),{recursive:true});mkdirSync(join(root,'.claude/harness/adapters'),{recursive:true});
 const entry=join(root,'.pi/extensions/changeloop.ts'),adapter=join(root,'.claude/harness/adapters/pi-extension.mjs');
 writeFileSync(entry,readFileSync(join(repo,'.pi/extensions/changeloop.ts'),'utf8'));
 mkdirSync(join(root,'.pi/lib'),{recursive:true});writeFileSync(join(root,'.pi/lib/native-import.mjs'),readFileSync(join(repo,'.pi/lib/native-import.mjs'),'utf8'));
 const source=version=>`export default function install(pi){pi.on('input',event=>({version:'${version}',accepted:${version==='natural'}&&event.text==='land ได้เลย'}));}`;
 writeFileSync(adapter,source('slash-only'));await import(pathToFileURL(adapter).href);
 const version=readFileSync(join(homedir(),'.pi/agent/install/current-version'),'utf8').trim();
 const {loadExtensions,createExtensionRuntime,clearExtensionCache}=await import(join(homedir(),`.pi/agent/install/releases/${version}/node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js`));
 async function load(){clearExtensionCache();const result=await loadExtensions([entry],root,undefined,createExtensionRuntime());assert.deepEqual(result.errors,[]);return result.extensions[0].handlers.get('input')[0]({source:'interactive',text:'land ได้เลย'},{});}
 assert.equal((await load()).accepted,false);
 writeFileSync(adapter,source('natural'));
 assert.deepEqual(await load(),{version:'natural',accepted:true});
 assert.deepEqual(await load(),{version:'natural',accepted:true});
});
