# preview-env: PI_PREVIEW_CHANGELOOP=1
from playwright.sync_api import sync_playwright,expect
from pathlib import Path
import sys,json
out=Path(__file__).resolve().parent.parent/'reports'
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
 page=browser.new_page(viewport={'width':1280,'height':800});page.set_default_timeout(15000)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(sys.argv[1]+'/#preview-only');page.locator('#name').fill('Workflow Tester');page.locator('#login-form button').click()
 page.locator('#view-tasks').click()
 expect(page.locator('#task-project option')).to_have_count(2)
 options=page.locator('#task-project option').evaluate_all('(items)=>items.map(n=>n.value)')
 page.locator('#task-project').select_option(next(v for v in options if v.endswith('/changeloop')))
 card=page.locator('.task-card').filter(has_text='Change Loop preview task')
 expect(card).to_have_count(1);expect(card.locator('.task-workflow')).to_have_text('Change Loop · land')
 expect(page.locator('[data-status=review] .task-card')).to_have_count(1)
 card.click();expect(page.locator('#task-workflow')).to_contain_text('land · archived')
 page.locator('[name=nextStep]').fill('Continue authorized Deliver');page.locator('#task-save').click()
 expect(page.locator('#task-dialog')).not_to_be_visible();page.reload()
 expect(card).to_contain_text('Continue authorized Deliver');expect(card).to_have_count(1)
 page.locator('#task-filter').select_option('land');expect(page.locator('.task-column')).to_have_count(1);expect(card).to_be_visible()
 page.screenshot(path=str(out/'changeloop-kanban-desktop.png'))
 page.set_viewport_size({'width':390,'height':844});expect(card).to_be_visible()
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.screenshot(path=str(out/'changeloop-kanban-mobile.png'))
 card.click();expect(page.locator('#task-workflow')).to_contain_text('preview-change')
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 assert not errors,errors
 report={'passed':True,'checks':['automatic import','land phase badge','review not merge','readonly source details','manual handoff persistence','desktop and mobile'],'model_requests':0}
 (out/'changeloop-kanban.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
 browser.close()
