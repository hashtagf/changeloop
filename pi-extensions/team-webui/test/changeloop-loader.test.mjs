import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {homedir,tmpdir} from 'node:os';
import {pathToFileURL,fileURLToPath} from 'node:url';
// This test lives in <repo>/pi-extensions/team-webui/test.
const repo=join(fileURLToPath(import.meta.url),'../../../..');

const copyLib=root=>{for(const name of ['native-import.mjs','revision-import.mjs'])writeFileSync(join(root,'.pi/lib',name),readFileSync(join(repo,'.pi/lib',name),'utf8'));};
async function piLoader(){
 const version=readFileSync(join(homedir(),'.pi/agent/install/current-version'),'utf8').trim();
 return import(join(homedir(),`.pi/agent/install/releases/${version}/node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js`));
}

test('installed Pi reload replaces a cached Change Loop adapter instead of retaining slash-only consent',async t=>{
 const root=mkdtempSync(join(tmpdir(),'pi-land-loader-'));
 t.after(()=>rmSync(root,{recursive:true,force:true}));
 mkdirSync(join(root,'.pi/extensions'),{recursive:true});mkdirSync(join(root,'.claude/harness/adapters'),{recursive:true});
 const entry=join(root,'.pi/extensions/changeloop.ts'),adapter=join(root,'.claude/harness/adapters/pi-extension.mjs');
 writeFileSync(entry,readFileSync(join(repo,'.pi/extensions/changeloop.ts'),'utf8'));
 mkdirSync(join(root,'.pi/lib'),{recursive:true});copyLib(root);
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

test('installed Pi reload refreshes modules the adapter imports, not only the adapter entry',async t=>{
 const root=mkdtempSync(join(tmpdir(),'pi-land-loader-deps-'));
 t.after(()=>rmSync(root,{recursive:true,force:true}));
 for(const dir of ['.pi/extensions','.pi/lib','.claude/harness/adapters','.claude/harness/runtime/core'])mkdirSync(join(root,dir),{recursive:true});
 const entry=join(root,'.pi/extensions/changeloop.ts');
 writeFileSync(entry,readFileSync(join(repo,'.pi/extensions/changeloop.ts'),'utf8'));
 copyLib(root);
 writeFileSync(join(root,'.claude/harness/adapters/pi-extension.mjs'),`import * as dep from '../runtime/core/dep.mjs';\nexport default function install(pi){pi.on('input',()=>({names:Object.keys(dep).sort()}));}`);
 const dep=join(root,'.claude/harness/runtime/core/dep.mjs');
 const version=readFileSync(join(homedir(),'.pi/agent/install/current-version'),'utf8').trim();
 const {loadExtensions,createExtensionRuntime,clearExtensionCache}=await import(join(homedir(),`.pi/agent/install/releases/${version}/node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js`));
 async function load(){clearExtensionCache();const result=await loadExtensions([entry],root,undefined,createExtensionRuntime());assert.deepEqual(result.errors,[]);return result.extensions[0].handlers.get('input')[0]({source:'interactive',text:'x'},{});}
 writeFileSync(dep,'export const landRequest=1;');
 assert.deepEqual(await load(),{names:['landRequest']});
 writeFileSync(dep,'export const landRequest=1;export const deliverRequest=2;');
 assert.deepEqual(await load(),{names:['deliverRequest','landRequest']});
});

test('reload works while Pi holds a stale native-import helper and picks up loader edits',async t=>{
 const root=mkdtempSync(join(tmpdir(),'pi-land-loader-stale-'));
 t.after(()=>rmSync(root,{recursive:true,force:true}));
 for(const dir of ['.pi/extensions','.pi/lib','.claude/harness/adapters'])mkdirSync(join(root,dir),{recursive:true});
 const entry=join(root,'.pi/extensions/changeloop.ts'),helper=join(root,'.pi/lib/native-import.mjs'),loader=join(root,'.pi/lib/revision-import.mjs');
 writeFileSync(entry,readFileSync(join(repo,'.pi/extensions/changeloop.ts'),'utf8'));
 copyLib(root);
 // Simulate a Pi that cached an older helper exporting only importNative.
 writeFileSync(helper,'export const importNative = url => import(url);');
 await import(pathToFileURL(helper).href);
 writeFileSync(helper,'export const importNative = () => { throw new Error("helper edits must never be needed"); };');
 writeFileSync(join(root,'.claude/harness/adapters/pi-extension.mjs'),`export default function install(pi){pi.on('input',()=>({tag:globalThis.__changeloopLoaderTag}));}`);
 const {loadExtensions,createExtensionRuntime,clearExtensionCache}=await piLoader();
 async function load(){clearExtensionCache();const result=await loadExtensions([entry],root,undefined,createExtensionRuntime());assert.deepEqual(result.errors,[]);return result.extensions[0].handlers.get('input')[0]({source:'interactive',text:'x'},{});}
 const original=readFileSync(loader,'utf8');
 writeFileSync(loader,`globalThis.__changeloopLoaderTag='a';\n${original}`);
 assert.deepEqual(await load(),{tag:'a'});
 writeFileSync(loader,`globalThis.__changeloopLoaderTag='b';\n${original}`);
 assert.deepEqual(await load(),{tag:'b'});
});
