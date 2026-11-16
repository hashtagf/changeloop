import assert from "node:assert/strict";
import test from "node:test";
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import net from "node:net";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const executable = process.env.PI_EXECUTABLE || "pi";
const available = spawnSync(executable, ["--version"], { encoding: "utf8" });

test("real Pi autostarts the room, receives a web message in its input pipeline, and stops without model calls", {
  skip: available.error?.code === "ENOENT" ? "Install Pi to run the real SDK integration test" : false,
  timeout: 30000,
}, async (t) => {
  const temp = mkdtempSync(join(tmpdir(), "pi-team-runtime-"));
  t.after(() => rmSync(temp, { recursive: true, force: true }));
  const spy = join(temp, "input-spy.ts");
  writeFileSync(spy, `export default function(pi: any) {
    pi.registerCommand("webui-reload-test", { handler: async (_args: any, ctx: any) => { await ctx.reload(); } });
    pi.registerCommand("webui-confirm-test", { handler: async (_args: any, ctx: any) => {
      const accepted = await ctx.ui.confirm("Real SDK dialog", "Continue?");
      ctx.ui.notify("PI_WEBUI_DIALOG_RESULT:" + accepted, "info");
    } });
    pi.on("input", (event: any, ctx: any) => {
      if (event.source === "extension" && event.text.startsWith("[Team Web UI:")) {
        ctx.ui.notify("PI_WEBUI_TEST_INGRESS:" + event.text + " [images:" + (event.images?.length || 0) + "]", "info");
        return { action: "handled" };
      }
    });
  }`);
  const reservation = net.createServer();
  await new Promise((done) => reservation.listen(0, "127.0.0.1", done));
  const port = reservation.address().port;
  await new Promise((done) => reservation.close(done));
  const args = ["--mode", "rpc", "--no-session", "--offline", "--no-extensions", "--no-mcp",
    "--no-skills", "--no-prompt-templates", "--no-themes", "--no-context-files", "--approve",
    "-e", join(root, "extension.ts"), "-e", spy, "--serve", "--serve-port", String(port)];
  const options = {
    cwd: temp, env: { ...process.env, PI_CODING_AGENT_DIR: join(temp, "profile"), PI_OFFLINE: "1" },
    stdio: ["pipe", "pipe", "pipe"],
  };
  const child = spawn(executable,args,options);
  const rows = []; const listeners = new Set(); let buffer = "", stderr = "";
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  child.stdout.on("data", (chunk) => {
    buffer += chunk;
    while (buffer.includes("\n")) {
      const at = buffer.indexOf("\n"), line = buffer.slice(0, at); buffer = buffer.slice(at + 1);
      try { const row = JSON.parse(line); rows.push(row); for (const callback of listeners) callback(row); } catch { /* non-protocol notices */ }
    }
  });
  t.after(async () => {
    if (child.exitCode === null) child.kill("SIGTERM");
    await Promise.race([new Promise((done) => child.once("exit", done)), new Promise((done) => setTimeout(done, 2000).unref())]);
    if (child.exitCode === null) child.kill("SIGKILL");
  });
  const wait = (predicate) => new Promise((done, reject) => {
    const existing = rows.find(predicate); if (existing) { done(existing); return; }
    const timer = setTimeout(() => { listeners.delete(receive); reject(new Error(`Pi response timed out. ${stderr.slice(0, 400)}`)); }, 15000);
    const receive = (row) => { if (predicate(row)) { clearTimeout(timer); listeners.delete(receive); done(row); } };
    listeners.add(receive);
  });
  const rpc = async (id, type, extra = {}, target = child) => {
    target.stdin.write(JSON.stringify({ id, type, ...extra }) + "\n");
    return wait((row) => row.id === id && row.type === "response");
  };
  const commands = await rpc("commands", "get_commands");
  assert.equal(commands.success, true); assert.ok(commands.data.commands.some((item) => item.name === "serve"));
  const notice = await wait((row) => row.type === "extension_ui_request" && row.method === "notify" && /http:\/\/127\.0\.0\.1:\d+\/#/.test(row.message || ""));
  const match = notice.message.match(/(http:\/\/127\.0\.0\.1:\d+)\/#([a-zA-Z0-9_-]+)/);
  assert.ok(match);
  const [, base, token] = match;
  const login = await fetch(base + "/api/login", { method: "POST", headers: { "Content-Type": "application/json", Origin: base }, body: JSON.stringify({ token, name: "Runtime Tester" }) });
  assert.equal(login.status, 200);
  const cookie = login.headers.get("set-cookie").split(";")[0];
  const response = await fetch(base + "/api/messages", { method: "POST", headers: { "Content-Type": "application/json", Origin: base, Cookie: cookie },
    body: JSON.stringify({ id: "real-sdk-request", text: "deterministic test message" }) });
  assert.equal(response.status, 202);
  const received = await wait((row) => row.method === "notify" && (row.message || "").startsWith("PI_WEBUI_TEST_INGRESS:"));
  assert.match(received.message, /Runtime Tester/); assert.match(received.message, /deterministic test message/);
  assert.equal(rows.filter((row) => row.type === "agent_start").length, 0, "input spy handles the request before any model run");
  const firstCatalog=await (await fetch(base+"/api/state",{headers:{Cookie:cookie}})).json();
  const route="/api/sessions/"+firstCatalog.sessions.find((s)=>s.online).key+"/";
  const webPost=async(action,body)=>fetch(base+route+action,{method:"POST",headers:{"Content-Type":"application/json",Origin:base,Cookie:cookie},body:JSON.stringify(body)});
  const upload=await (await webPost("upload",{name:"pixel.png",mimeType:"image/png",data:"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a30sAAAAASUVORK5CYII="})).json();
  assert.equal((await webPost("message",{id:"real-sdk-image-request",text:"Inspect fixture",attachments:[upload.id]})).status,200);
  await wait(row=>row.method==="notify"&&(row.message||"").includes("real-sdk-image-request")&&(row.message||"").includes("[images:1]"));
  assert.equal((await webPost("command",{text:"/webui-confirm-test"})).status,200);
  let dialog;
  for(let i=0;i<40;i++) {
    const detail=await (await fetch(base+route+"state",{headers:{Cookie:cookie}})).json();dialog=detail.extensionUI.dialogs[0];
    if(dialog)break;await new Promise(done=>setTimeout(done,50));
  }
  assert.equal(dialog?.title,"Real SDK dialog");
  assert.equal((await webPost("ui",{id:dialog.id,value:true})).status,200);
  await wait(row=>row.method==="notify"&&row.message==="PI_WEBUI_DIALOG_RESULT:true");
  assert.equal(rows.filter(row=>row.type==="agent_start").length,0);
  assert.equal((await rpc("reload-owner", "prompt", {message:"/webui-reload-test"})).success,true);
  assert.equal((await rpc("commands-after-reload", "get_commands")).success,true);
  for(let i=0;i<60;i++) {
    const ready=await fetch(base+route+"state",{headers:{Cookie:cookie}});
    await ready.arrayBuffer();if(ready.ok)break;
    await new Promise(done=>setTimeout(done,100));
  }
  assert.equal((await webPost("message",{id:"real-sdk-after-reload",text:"Input after reload"})).status,200);
  await wait(row=>row.method==="notify"&&(row.message||"").includes("real-sdk-after-reload"));
  // A second Pi reuses the same hub; shutting down its creator must not stop it.
  const second = spawn(executable,args,options);
  t.after(()=>{if(second.exitCode===null)second.kill("SIGTERM");});
  let secondBuffer="";
  second.stderr.on("data",chunk=>{stderr+=chunk;});
  second.stdout.on("data",chunk=>{
    secondBuffer+=chunk;
    while(secondBuffer.includes("\n")){
      const at=secondBuffer.indexOf("\n"),line=secondBuffer.slice(0,at);secondBuffer=secondBuffer.slice(at+1);
      try{const row={...JSON.parse(line),fromSecond:true};rows.push(row);for(const callback of listeners)callback(row);}catch{}
    }
  });
  await wait(row=>row.fromSecond&&row.method==="notify"&&(row.message||"").includes(base));
  let catalog;
  for(let i=0;i<40;i++) {
    catalog=await (await fetch(base+"/api/state",{headers:{Cookie:cookie}})).json();
    if(catalog.sessions.filter(s=>s.online).length===2)break;
    await new Promise(done=>setTimeout(done,100));
  }
  assert.equal(catalog.sessions.filter(s=>s.online).length,2);
  child.kill("SIGTERM");
  await new Promise(done=>child.once("exit",done));
  assert.equal((await fetch(base+"/health")).status,200,"hub survives creator exit");
  assert.equal((await rpc("second-alive","get_commands",{},second)).success,true);
  assert.equal((await rpc("stop", "prompt", { message: "/serve stop" },second)).success, true);
  await assert.rejects(fetch(base + "/health"));
  assert.equal((await rpc("still-alive", "get_commands",{},second)).success, true);
});
