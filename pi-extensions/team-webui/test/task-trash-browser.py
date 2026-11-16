from playwright.sync_api import sync_playwright,expect
from pathlib import Path
import json,sys
out=Path(__file__).resolve().parent.parent/'reports'
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
 page=browser.new_page(viewport={'width':1280,'height':800});page.set_default_timeout(15000)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 base=sys.argv[1];page.goto(base+'/#preview-only');page.locator('#name').fill('Trash Tester');page.locator('#login-form button').click()
 page.locator('#view-tasks').click();expect(page.locator('#task-add')).to_be_enabled()
 project=page.locator('#task-project').input_value()
 def post(body):
  return page.request.post(base+'/api/tasks',headers={'Origin':base},data={'project':project,**body})
 a=post({'action':'create','key':'trash-a','title':'Trash prerequisite'}).json()['task']
 b=post({'action':'create','key':'trash-b','title':'Trash dependent','dependsOn':[{'id':a['id'],'status':'land'}]}).json()['task']
 page.locator('#task-refresh').click();card=page.locator('[data-task-id="'+a['id']+'"]');expect(card).to_be_visible();card.click()
 page.once('dialog',lambda d:d.accept());page.locator('#task-delete').click();expect(page.locator('#task-edit-error')).to_contain_text('Remove dependencies')
 page.locator('#task-close').click()
 assert post({'action':'update','id':b['id'],'version':b['version'],'dependsOn':[]}).status==200
 card.click();page.once('dialog',lambda d:d.dismiss());page.locator('#task-delete').click();expect(page.locator('#task-dialog')).to_be_visible()
 page.once('dialog',lambda d:d.accept());page.locator('#task-delete').click();expect(page.locator('#task-dialog')).not_to_be_visible();expect(card).to_have_count(0)
 page.locator('#task-trash-toggle').click();expect(card).to_be_visible();card.click()
 expect(page.locator('#task-delete')).to_have_text('Restore task');expect(page.locator('#task-save')).to_be_disabled();expect(page.locator('[name=title]')).to_be_disabled()
 page.screenshot(path=str(out/'task-trash-desktop.png'))
 page.locator('#task-delete').click();expect(page.locator('#task-dialog')).not_to_be_visible();expect(card).to_have_count(0)
 page.locator('#task-trash-toggle').click();expect(card).to_be_visible()
 # A newer edit must not be lost when deleting a stale modal.
 card.click();latest=page.request.get(base+'/api/tasks',params={'project':project,'id':a['id']}).json()['task']
 assert post({'action':'update','id':a['id'],'version':latest['version'],'nextStep':'New work from another session'}).status==200
 page.once('dialog',lambda d:d.accept());page.locator('#task-delete').click();expect(page.locator('#task-edit-error')).to_contain_text('changed')
 page.once('dialog',lambda d:d.accept());page.locator('#task-reload').click();expect(page.locator('[name=nextStep]')).to_have_value('New work from another session')
 page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.screenshot(path=str(out/'task-trash-mobile.png'))
 assert not errors,errors
 report={'passed':True,'checks':['dependent blocks delete','cancel preserves card','delete to trash','read-only trash details','restore same card','stale deletion rejected','desktop/mobile'],'page_errors':errors,'model_requests':0}
 (out/'task-trash-browser.json').write_text(json.dumps(report,indent=2));print(json.dumps(report));browser.close()
