from playwright.sync_api import sync_playwright,expect
from pathlib import Path
import sys,json
out=Path(__file__).resolve().parent.parent/'reports'
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
 page=browser.new_page(viewport={'width':1280,'height':900});page.set_default_timeout(15000)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 base=sys.argv[1];page.goto(base+'/#preview-only');page.locator('#name').fill('Graph Tester');page.locator('#login-form button').click()
 page.locator('#view-tasks').click();expect(page.locator('#task-project option')).to_have_count(2);expect(page.locator('.task-column')).to_have_count(10);project=page.locator('#task-project').input_value()
 def post(body):
  r=page.request.post(base+'/api/tasks',headers={'Origin':base},data={'project':project,**body});assert r.status==200,r.text();return r.json()['task']
 a=post({'action':'create','key':'design','title':'Design contract','status':'plan'})
 b=post({'action':'create','key':'build','title':'Implement contract','nextStep':'Build after design review'})
 page.locator('#task-refresh').click();card=page.locator('.task-card').filter(has_text='Implement contract');card.click()
 page.locator('summary').filter(has_text='Dependencies').click()
 page.locator('[data-dependency-id="'+a['id']+'"]').check()
 page.locator('#task-save').click();expect(page.locator('#task-dialog')).not_to_be_visible();expect(card).to_contain_text('Waiting for 1 dependencies')
 page.locator('#task-graph-toggle').click();expect(page.locator('.task-graph-layer')).to_have_count(2)
 expect(page.locator('#task-columns')).not_to_be_visible()
 expect(page.locator('.task-graph-edges path')).to_have_count(1)
 expect(page.locator('#task-graph')).to_contain_text('Design contract → this task · requires Review')
 page.screenshot(path=str(out/'task-graph-desktop.png'))
 page.locator('[data-graph-task-id="'+a['id']+'"]').click();page.locator('summary').filter(has_text='Dependencies').click()
 page.locator('[data-dependency-id="'+b['id']+'"]').check();page.locator('#task-save').click();expect(page.locator('#task-edit-error')).to_contain_text('cycle')
 page.locator('[data-dependency-id="'+b['id']+'"]').uncheck();page.locator('[name=status]').select_option('review');page.locator('#task-save').click()
 expect(page.locator('#task-dialog')).not_to_be_visible();expect(page.locator('[data-graph-task-id="'+b['id']+'"]')).to_contain_text('Dependencies ready')
 page.locator('[data-graph-task-id="'+b['id']+'"]').click()
 page.locator('[name=ownerSessionId]').select_option('preview-review');page.locator('[name=nextStep]').fill('Review this contract and save findings on this card')
 page.locator('#task-handoff').click();expect(page.locator('#task-dialog')).not_to_be_visible()
 response=page.request.get(base+'/api/tasks',params={'project':project,'id':b['id']}).json()
 assert response['task']['ownerSessionId']=='preview-review'
 assert response['task']['nextStep']=='Review this contract and save findings on this card'
 page.set_viewport_size({'width':390,'height':844});expect(page.locator('#task-graph')).to_be_visible()
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.screenshot(path=str(out/'task-graph-mobile.png'))
 assert not errors,errors
 report={'passed':True,'checks':['dependency editor','DAG layers','cycle rejection preserves draft','readiness recalculation','handoff to existing session','desktop/mobile graph'],'model_requests':0}
 (out/'task-graph-browser.json').write_text(json.dumps(report,indent=2));print(json.dumps(report));browser.close()
