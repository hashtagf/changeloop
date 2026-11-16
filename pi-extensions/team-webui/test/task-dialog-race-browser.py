from playwright.sync_api import sync_playwright,expect
import sys,json
from pathlib import Path
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
 page=browser.new_page(viewport={'width':1280,'height':900});base=sys.argv[1]
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(base+'/#preview-only');page.locator('#name').fill('Race tester');page.locator('#login-form button').click()
 page.locator('#view-tasks').click();expect(page.locator('#task-add')).to_be_enabled()
 project=page.locator('#task-project').input_value()
 def create(key,title):
  r=page.request.post(base+'/api/tasks',headers={'Origin':base},data={'project':project,'action':'create','key':key,'title':title})
  assert r.status==200,r.text()
  return r.json()['task']
 a=create('race-a','Race task A');b=create('race-b','Race task B');page.locator('#task-refresh').click()
 expect(page.locator('[data-task-id="'+a['id']+'"]')).to_be_visible()
 page.evaluate('''id=>{const original=window.fetch;window.testFetch=original;window.fetch=async(...args)=>{
   const response=await original(...args);
   if(String(args[0]).includes('id='+id))await new Promise(r=>setTimeout(r,900));
   return response;
 }}''',a['id'])
 page.locator('[data-task-id="'+a['id']+'"]').click();page.locator('[data-task-id="'+b['id']+'"]').click()
 expect(page.locator('#task-dialog')).to_be_visible();expect(page.locator('[name=title]')).to_have_value('Race task B')
 page.wait_for_timeout(1100);expect(page.locator('[name=title]')).to_have_value('Race task B')
 page.evaluate('''()=>{window.mutations=0;window.fetch=async(...args)=>{
  if(args[1]?.method==='POST'&&String(args[0])==='/api/tasks'){window.mutations++;await new Promise(r=>setTimeout(r,700));}
  return window.testFetch(...args);
 }}''')
 page.locator('[name=nextStep]').fill('Saved once');page.locator('#task-save').click()
 for selector in ['#task-save','#task-delete','#task-reload','#task-handoff','#task-close','[name=title]']:
  expect(page.locator(selector)).to_be_disabled()
 page.locator('#task-form').evaluate('(form)=>form.requestSubmit()')
 expect(page.locator('#task-dialog')).not_to_be_visible();assert page.evaluate('window.mutations')==1
 saved=page.request.get(base+'/api/tasks',params={'project':project,'id':b['id']}).json()['task'];assert saved['nextStep']=='Saved once'
 page.evaluate('''id=>{window.fetch=async(...args)=>{const response=await window.testFetch(...args);if(String(args[0]).includes('id='+id))await new Promise(r=>setTimeout(r,600));return response;}}''',b['id'])
 page.locator('[data-task-id="'+b['id']+'"]').click();page.locator('#view-chat').click()
 page.wait_for_timeout(800);expect(page.locator('#task-dialog')).not_to_be_visible()
 assert not errors,errors
 report={'passed':True,'checks':['latest selected task wins delayed response','mutation locks controls','duplicate submit suppressed','correct task saved','leaving board cancels pending dialog'],'page_errors':errors}
 (Path(__file__).resolve().parent.parent/'reports/task-dialog-race-browser.json').write_text(json.dumps(report,indent=2));print(json.dumps(report));browser.close()
