from playwright.sync_api import sync_playwright,expect
from pathlib import Path
import sys,json
out=Path(__file__).resolve().parent.parent/"reports"
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
 page=browser.new_page(viewport={"width":1280,"height":900});errors=[];page.on("pageerror",lambda e:errors.append(str(e)))
 page.goto(sys.argv[1]+"/#preview-only");page.locator("#name").fill("Tree tester");page.locator("#login-form button").click()
 page.get_by_role("button",name="Main · extension refactor",exact=False).first.click();page.locator("#toggle-inspector").click()
 src=page.locator("[role=treeitem][data-path=src]");src.click();expect(src).to_have_attribute("aria-expanded","true")
 child=page.locator("[role=treeitem][data-path=\"src/index.ts\"]");expect(child).to_be_visible()
 expect(page.locator("[data-path=\"README.md\"]")).to_be_visible()
 src.click();expect(child).not_to_be_visible();src.focus();page.keyboard.press("ArrowRight");expect(child).to_be_visible()
 page.keyboard.press("ArrowRight");expect(child).to_be_focused();page.keyboard.press("ArrowLeft");expect(src).to_be_focused()
 child.click();expect(page.locator("#file-text")).to_be_visible();page.get_by_role("button",name="← Files").click()
 expect(page.locator("[data-path=\"src/index.ts\"]")).to_be_visible()
 page.screenshot(path=str(out/"tree-desktop.png"))
 page.get_by_role("button",name="Collapse all").click();expect(page.locator("[data-path=src]")).to_have_attribute("aria-expanded","false")
 page.set_viewport_size({"width":390,"height":844});page.locator("[data-path=src]").click();expect(page.locator("[data-path=\"src/index.ts\"]")).to_be_visible()
 assert page.evaluate("document.documentElement.scrollWidth<=innerWidth")
 page.screenshot(path=str(out/"tree-mobile.png"));assert not errors,errors
 print(json.dumps({"passed":True,"checks":["inline expansion","collapse","keyboard arrows","preserved expansion after file preview","collapse all","mobile overflow"],"errors":errors}));browser.close()
