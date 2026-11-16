from playwright.sync_api import sync_playwright, expect
from pathlib import Path
import sys,json
base=sys.argv[1]
out=Path(__file__).resolve().parent.parent/'reports'
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args=['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 page=browser.new_page(viewport={'width':1440,'height':1050},device_scale_factor=1)
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(base+'/#preview-only')
 page.locator('#name').fill('City tester');page.locator('#login-form button').click()
 expect(page.locator('#chat-title')).not_to_be_empty()
 page.locator('#prompt').fill('Preserved city draft')
 page.locator('#view-city').click()
 expect(page.locator('#city-stage canvas')).to_be_visible()
 expect(page.locator('#city-loading')).to_be_hidden()
 expect(page.locator('#city-error')).to_be_hidden()
 expect(page.locator('#city-roster button')).to_have_count(6)
 expect(page.locator('#conversation')).to_be_hidden()
 page.wait_for_timeout(1000)
 page.screenshot(path=str(out/'city-desktop.png'),full_page=True)
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.locator('#city-saved').check();expect(page.locator('#city-roster button')).to_have_count(7)
 page.locator('#city-search').fill('Completed');expect(page.locator('#city-roster button')).to_have_count(1)
 expect(page.locator('#city-offline')).to_have_text('1')
 page.locator('#city-search').fill('no-match-agent');expect(page.locator('#city-empty')).to_be_visible()
 page.locator('#city-search').fill('');page.locator('#city-saved').uncheck()
 page.locator('#city-project').select_option(label='claude-foundation');expect(page.locator('#city-roster button')).to_have_count(1)
 page.locator('#city-roster button').focus();page.keyboard.press('Enter');expect(page.locator('#city-detail')).to_be_visible()
 page.locator('#city-open-chat').click();expect(page.locator('#conversation')).to_be_visible()
 expect(page.locator('#chat-title')).to_have_text('API · authentication')
 page.get_by_text('Main · extension refactor',exact=True).first.click();expect(page.locator('#prompt')).to_have_value('Preserved city draft')
 page.locator('#view-city').click();page.locator('#city-project').select_option('')
 page.locator('#city-pause').click();expect(page.locator('#city-pause')).to_have_attribute('aria-pressed','true')
 page.locator('#city-left').click();page.locator('#city-zoom-in').click();page.locator('#city-reset').click()
 page.set_viewport_size({'width':390,'height':844});page.locator('#city-reset').click()
 page.screenshot(path=str(out/'city-mobile.png'),full_page=True)
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.reload();expect(page.locator('#city-stage canvas')).to_be_visible();expect(page.locator('#view-city')).to_have_attribute('aria-pressed','true')
 page.locator('#view-chat').click();expect(page.locator('#conversation')).to_be_visible()
 # Loss of WebGL stays recoverable via Chat.
 page.locator('#view-city').click()
 page.locator('#city-stage canvas').evaluate("c=>c.dispatchEvent(new Event('webglcontextlost',{cancelable:true}))")
 expect(page.locator('#city-error')).to_be_visible();page.locator('#view-chat').click();expect(page.locator('#conversation')).to_be_visible()
 assert not errors,errors
 # Browser without WebGL can still use the original chat.
 fallback=browser.new_page(viewport={'width':1280,'height':800})
 fallback.add_init_script("HTMLCanvasElement.prototype.getContext=function(){return null}")
 fallback.goto(base+'/#preview-only');fallback.locator('#name').fill('Fallback tester');fallback.locator('#login-form button').click()
 expect(fallback.locator('#chat-title')).not_to_be_empty();fallback.locator('#view-city').click()
 expect(fallback.locator('#city-error')).to_be_visible();fallback.locator('#view-chat').click();expect(fallback.locator('#conversation')).to_be_visible()
 print(json.dumps({'passed':['3D render','desktop/mobile overflow','live roster','offline/search/project filters','empty state','keyboard selection','open correct chat','draft preservation','pause/camera controls','view persistence','WebGL loss and unavailable fallback'],'pageErrors':errors}))
 browser.close()
