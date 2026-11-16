import test from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import { join, dirname } from "node:path";
import { homedir, tmpdir } from "node:os";
import { createRequire, stripTypeScriptTypes } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";

test("upgrading a running extension escapes cached legacy ESM and reloads bridge dependencies", async t => {
  const root=dirname(dirname(fileURLToPath(import.meta.url)));
  const temp=await fs.mkdtemp(join(tmpdir(),"pi-webui-reload-"));
  t.after(()=>fs.rm(temp,{recursive:true,force:true}));
  const names=["bridge","extension-ui","workspace","registry","history","server","hub","attachments","jobs","task-store","task-extension","task-panel","task-tui","changeloop-tasks","task-graph","task-planning","activity","legacy-activity","tool-guide","task-context"];
  const sources=new Map(await Promise.all(names.map(async name=>[name,await fs.readFile(join(root,name+".ts"),"utf8")])));
  const entry=await fs.readFile(join(root,"extension.ts"),"utf8");
  const legacy=text=>{for(const name of names)text=text.replaceAll(name+".ts",name+".mjs");return text;};
  // Legacy generations were plain JavaScript; strip type annotations so native ESM can import them.
  const native=text=>legacy(stripTypeScriptTypes(text));
  for(const [name,text]of sources)await fs.writeFile(join(temp,name+".mjs"),native(name==="bridge"?text.replace("    input(event) {","    legacyInput(event) {"):text));
  await fs.writeFile(join(temp,"extension.ts"),legacy(entry).replace("bridge.input(event)","bridge.legacyInput(event)"));
  // Native ESM retains its imported module even when the on-disk file changes.
  const cached=await import(pathToFileURL(join(temp,"bridge.mjs")).href);
  assert.equal(typeof cached.createBridge({}).legacyInput,"function");
  const install=join(homedir(),".pi/agent/install");
  const version=(await fs.readFile(join(install,"current-version"),"utf8")).trim();
  const require=createRequire(join(install,"releases",version,"node_modules/@earendil-works/pi-coding-agent/dist/index.js"));
  const {createJiti}=require("jiti");
  const load=async()=>{
    const events=new Map();
    const factory=await createJiti(import.meta.url,{moduleCache:false,tryNative:false,alias:{typebox:require.resolve('typebox'),'@earendil-works/pi-tui':require.resolve('@earendil-works/pi-tui')}}).import(join(temp,"extension.ts"),{default:true});
    factory({events:{on(){return()=>{};}},registerTool(){},registerShortcut(){},registerFlag(){},registerCommand(){},on(name,handler){events.set(name,handler);}});
    return events.get("input");
  };
  // Load and exercise the old generation.
  await (await load())({source:"interactive",text:"before update"});
  for(const [name,text]of sources)await fs.writeFile(join(temp,name+".ts"),text);
  await fs.writeFile(join(temp,"bridge.mjs"),native(sources.get("bridge")));
  assert.equal((await import(pathToFileURL(join(temp,"bridge.mjs")).href)).createBridge({}).input,undefined);
  await fs.writeFile(join(temp,"extension.ts"),entry);
  await (await load())({source:"interactive",text:"after migration"});
  // A later edit at the same TS path must also be visible on the next reload.
  await fs.writeFile(join(temp,"bridge.ts"),sources.get("bridge").replace("    input(event) {","    reloadedInput(event) {"));
  await fs.writeFile(join(temp,"extension.ts"),entry.replace("bridge.input(event)","bridge.reloadedInput(event)"));
  await (await load())({source:"interactive",text:"after second reload"});
});
