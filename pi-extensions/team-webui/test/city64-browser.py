# preview-env: PI_PREVIEW_CITY64=1
from playwright.sync_api import sync_playwright,expect
from pathlib import Path
import sys,json
out=Path(__file__).resolve().parent.parent/'reports';base=sys.argv[1]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args=['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 page=browser.new_page(viewport={'width':1440,'height':1050});page.set_default_timeout(25000)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(base+'/#preview-only');page.locator('#name').fill('City 64 tester');page.locator('#login-form button').click()
 expect(page.locator('#workspace')).to_be_visible()
 assigned=page.request.get(base+'/api/city').json()['assignments'];first=next(t for t in assigned if t['ownerSessionId']=='preview-main')
 if first['status']!='open':
  original=page.request.get(base+'/api/tasks',params={'project':first['project'],'id':first['id']}).json()['task']
  reset=page.request.post(base+'/api/tasks',headers={'Origin':base},data={'action':'update','project':first['project'],'id':first['id'],'version':original['version'],'status':'open'});assert reset.status==200
 page.locator('#view-city').click();canvas=page.locator('#city-stage canvas')
 expect(canvas).to_have_attribute('data-agents','64');expect(page.locator('#city-roster button')).to_have_count(64)
 expect(page.locator('[data-district]')).to_have_count(10)
 expect(page.locator('[data-district=open]')).to_contain_text('7')
 expect(page.locator('#city-error')).to_be_hidden();page.wait_for_timeout(700)
 before=float(canvas.get_attribute('data-motion'));page.wait_for_timeout(800);assert float(canvas.get_attribute('data-motion'))>before
 draw_calls=int(canvas.get_attribute('data-draw-calls'));assert draw_calls<80,draw_calls
 page.screenshot(path=str(out/'city64-overview.png'))
 page.locator('[data-district=build]').click();page.wait_for_timeout(400);page.screenshot(path=str(out/'city64-build.png'))
 page.locator('#city-roster button').filter(has_text='Agent 01').click();expect(page.locator('#city-agent-meta')).to_contain_text('Kanban:')
 result=page.request.get(base+'/api/city').json();task=next(t for t in result['assignments'] if t['ownerSessionId']=='preview-main')
 full=page.request.get(base+'/api/tasks',params={'project':task['project'],'id':task['id']}).json()['task']
 response=page.request.post(base+'/api/tasks',headers={'Origin':base},data={'action':'update','project':task['project'],'id':task['id'],'version':full['version'],'status':'prove'})
 assert response.status==200,response.text()
 expect(page.locator('#city-agent-meta')).to_contain_text('ทดสอบ',timeout=10000)
 expect(page.locator('[data-district=open]')).to_contain_text('6');expect(page.locator('[data-district=verify]')).to_contain_text('7')
 page.locator('#city-pause').click();frozen=canvas.get_attribute('data-motion');page.wait_for_timeout(400);assert canvas.get_attribute('data-motion')==frozen
 current=page.request.get(base+'/api/tasks',params={'project':task['project'],'id':task['id']}).json()['task']
 change=page.request.post(base+'/api/tasks',headers={'Origin':base},data={'action':'update','project':task['project'],'id':task['id'],'version':current['version'],'status':'change'});assert change.status==200
 expect(page.locator('#city-agent-meta')).to_contain_text('ออกแบบ',timeout=10000);assert canvas.get_attribute('data-motion')==frozen
 page.locator('#city-pause').click();page.wait_for_timeout(300)
 page.locator('#view-chat').click();frozen=canvas.get_attribute('data-motion');page.wait_for_timeout(700);assert canvas.get_attribute('data-motion')==frozen
 page.locator('#view-city').click();page.set_viewport_size({'width':390,'height':844});page.locator('[data-district=verify]').click()
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.locator('#city-stage').scroll_into_view_if_needed();page.screenshot(path=str(out/'city64-mobile.png'))
 assert not errors,errors
 report={'passed':True,'agents':64,'districts':10,'draw_calls':draw_calls,'checks':['all 64 visible','animated poses','Kanban assignment polling','status change updates district','district/agent focus','pause','hidden view stops animation','mobile overflow'],'model_requests':0,'page_errors':errors}
 (out/'city64-browser.json').write_text(json.dumps(report,indent=2));print(json.dumps(report));browser.close()
