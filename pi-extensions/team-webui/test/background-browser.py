from playwright.sync_api import sync_playwright,expect
from pathlib import Path
import json,sys,os
out=Path(__file__).resolve().parent.parent/"reports"
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
 page=browser.new_page(viewport={"width":1280,"height":800})
 page.set_default_timeout(15000)
 errors=[];page.on("pageerror",lambda e:errors.append(str(e)))
 page.goto(sys.argv[1]+"/#preview-only");page.locator("#name").fill("Job Tester");page.locator("#login-form button").click()
 expect(page.locator("#background-count")).to_have_text("1",timeout=15000)
 page.locator("#open-background").click()
 expect(page.locator(".job-output")).to_contain_text("Build started")
 expect(page.locator(".job-row")).to_have_count(1)
 expect(page.locator(".job-meta")).to_contain_text("running")
 page.screenshot(path=str(out/"background-desktop.png"))
 page.get_by_role("button",name="Stop job").click()
 expect(page.locator(".job-meta")).to_contain_text("stopped",timeout=15000)
 expect(page.locator(".job-output")).to_contain_text("Build started")
 page.locator("#close-inspector").click();page.locator("#open-background").click()
 expect(page.locator("#inspector-body")).to_contain_text("No running background jobs.")
 page.get_by_role("button",name="Show finished",exact=True).click()
 expect(page.locator(".job-row")).to_have_count(2)
 page.locator(".job-row").filter(has_text="Old verification").click()
 expect(page.locator(".job-meta")).to_contain_text("failed")
 expect(page.locator(".job-meta")).to_contain_text("exit 7")
 expect(page.locator(".job-output")).to_contain_text("Old verification complete")
 with page.expect_download() as info:page.get_by_role("link",name="Download log").click()
 download=info.value;assert download.suggested_filename.endswith(".log")
 page.set_viewport_size({"width":390,"height":844});page.screenshot(path=str(out/"background-mobile.png"))
 assert page.evaluate("document.documentElement.scrollWidth<=innerWidth")
 page.locator("#close-inspector").click();page.locator("#show-sidebar").click()
 page.locator("#projects").get_by_text("API · authentication",exact=True).click()
 page.locator("#open-background").click()
 expect(page.locator(".job-row")).to_have_count(0)
 expect(page.locator("#inspector-body")).to_contain_text("No saved jobs")
 assert not errors,errors
 report={"passed":True,"viewports":[[1280,800],[390,844]],"checks":["direct entry and running count","live log","stop real fixture process","finished jobs hidden by default","history and failed exit code","download","session isolation","mobile no overflow"],"page_errors":errors,"model_requests":0}
 (out/"background-browser.json").write_text(json.dumps(report,indent=2))
 print(json.dumps(report),flush=True)
 # Closing pages first avoids the local Chrome build hanging during browser teardown.
 page.close();browser.close()
