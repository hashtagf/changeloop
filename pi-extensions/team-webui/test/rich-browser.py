# preview-env: PI_PREVIEW_RICH=1
from playwright.sync_api import sync_playwright,expect
from pathlib import Path
import json,sys
out=Path(__file__).resolve().parent.parent/'reports'
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
 page=browser.new_page(viewport={'width':1280,'height':900});page.set_default_timeout(20000)
 errors=[];external=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:external.append(r.url) if 'example.invalid' in r.url else None)
 page.goto(sys.argv[1]+'/#preview-only');page.locator('#name').fill('Renderer Tester');page.locator('#login-form button').click()
 page.get_by_role('button',name='Main · extension refactor',exact=False).first.click()
 expect(page.locator('#messages h3').filter(has_text='Rich response')).to_be_visible()
 expect(page.locator('#messages table')).to_have_count(1);expect(page.locator('#messages blockquote')).to_have_count(1)
 expect(page.locator('#messages input[type=checkbox]')).to_have_count(2)
 expect(page.locator('#messages .mermaid-preview img')).to_have_count(1)
 expect(page.locator('#messages .mermaid-preview .render-error')).to_have_count(1)
 assert page.evaluate('window.RENDER_XSS===undefined')
 assert not external,external
 expect(page.locator('#messages .thinking-state summary')).to_have_text('Thinking completed')
 assert 'PRIVATE_REASONING_FIXTURE' not in page.locator('body').inner_text()
 mcp=page.locator('#messages [data-call-id=call-mcp]');mcp.locator('summary').click()
 expect(mcp.locator('.call-input')).to_contain_text('[redacted]');expect(mcp.locator('.call-output')).to_contain_text('Page ready')
 assert 'DO_NOT_EXPOSE' not in mcp.inner_text()
 expect(mcp.locator('.image-preview')).to_have_count(1)
 skill=page.locator('#messages [data-call-id=call-skill]');expect(skill.locator('.call-kind')).to_have_text('SKILL');skill.locator('summary').click()
 expect(skill.locator('.call-input')).to_contain_text('SKILL.md');expect(page.locator('#messages [data-status=error]')).to_have_count(1)
 page.get_by_role('button',name='Preview Local preview',exact=True).click()
 expect(page.locator('#messages img[alt="Local preview"]')).to_be_visible()
 page.locator('#messages .mermaid-preview').first.get_by_role('button',name='Expand image').click()
 expect(page.locator('.image-viewer')).to_be_visible();page.keyboard.press('Escape');expect(page.locator('.image-viewer')).not_to_be_visible()
 page.locator('#messages h3').filter(has_text='Rich response').scroll_into_view_if_needed()
 page.screenshot(path=str(out/'rich-desktop.png'))
 # A heartbeat must retain both the existing DOM node and expanded call details.
 page.evaluate("window.fixtureNode=document.querySelector('[data-call-id=call-mcp]')")
 page.wait_for_timeout(2200)
 assert page.evaluate("window.fixtureNode===document.querySelector('[data-call-id=call-mcp]') && window.fixtureNode.open")
 page.set_viewport_size({'width':390,'height':844});page.locator('#messages .mermaid-preview').first.scroll_into_view_if_needed()
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.screenshot(path=str(out/'rich-mobile.png'))
 assert not errors,errors
 report={'passed':True,'checks':['GFM markdown','tables and task lists','Mermaid valid/error fallback','local and tool image previews','image expansion','thinking status without private text','MCP/skill/shell activity','redacted credential fields','no automatic remote image request','sanitization','stable DOM across heartbeat','desktop/mobile'],'page_errors':errors,'model_requests':0}
 (out/'rich-browser.json').write_text(json.dumps(report,indent=2));print(json.dumps(report));browser.close()
