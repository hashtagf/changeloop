const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {publishResult} = require('./economy.ts');
test('reports preserve first outcome, new work, new prompt, failures and durable retries', () => {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'pi-economy-'));
 try {
 let sent=0; const send=()=>sent++;
 const result={text:'No update needed.'};
 assert.equal(publishResult(root,'one',result,{},send),true);
 assert.equal(publishResult(root,'one',result,{},send),false);
 assert.equal(publishResult(root,'one',result,{usedTools:true},send),true);
 assert.equal(publishResult(root,'one',{text:'Fixed A'}, {prompt:'task A'},send),true);
 assert.equal(publishResult(root,'one',{text:'Fixed A'}, {prompt:'task A'},send),false);
 assert.equal(publishResult(root,'one',{text:'Fixed A'}, {prompt:'task B'},send),true);
 assert.equal(publishResult(root,'one',{text:'No update needed. But a test failed.'},{},send),true);
 assert.equal(publishResult(root,'one',{...result,error:'failure'},{},send),true);
 assert.equal(publishResult(root,'one',{...result,aborted:true},{},send),true);
 assert.throws(()=>publishResult(root,'one',{text:'New result'},{},()=>{throw Error('disk');}));
 assert.equal(publishResult(root,'one',{text:'New result'},{},send),true);
 } finally {fs.rmSync(root,{recursive:true,force:true});}
});
