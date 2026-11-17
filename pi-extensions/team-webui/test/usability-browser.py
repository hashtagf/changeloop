# preview-env: PI_PREVIEW_RICH=1 PI_PREVIEW_CHANGELOOP=1
"""Persona usability regressions (WEBUI-01..15) against the local preview fixture.
Run: node team-webui/test/browser-run.mjs team-webui/test/usability-browser.py  (no model calls)."""
from playwright.sync_api import sync_playwright, expect
from pathlib import Path
import json, sys, re

base = sys.argv[1]
out = Path(__file__).resolve().parent.parent / "reports"; out.mkdir(exist_ok=True)
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
checks = []

def login(page, name="Tester", code="preview-only"):
    page.goto(base + "/#" + code)
    page.locator("#name").fill(name)
    page.locator("#login-form button").click()
    expect(page.locator("#workspace")).to_be_visible()
    page.wait_for_selector(".session", state="attached")

def ok(name): checks.append(name); print("PASS", name, flush=True)

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME)
    errors = []

    # WEBUI-04 wrong code message
    page = browser.new_page(viewport={"width": 1280, "height": 800}); page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(base + "/"); page.locator("#name").fill("Newbie"); page.locator("#token").fill("wrong-code"); page.locator("#login-form button").click()
    expect(page.locator("#login-error")).to_have_text("Access code is invalid or expired. Ask the host for a new invite.")
    ok("WEBUI-04 wrong access code explains recovery")

    # WEBUI-05 first-run tips + help
    page.locator("#token").fill("preview-only"); page.locator("#login-form button").click()
    expect(page.locator("#workspace")).to_be_visible()
    page.wait_for_selector(".session", state="attached")
    # WEBUI-08 skip link is the first Tab stop
    page.locator("body").focus(); page.keyboard.press("Tab")
    assert page.evaluate("document.activeElement.id") == "skip-link", page.evaluate("document.activeElement.outerHTML")
    ok("WEBUI-08 skip link is first Tab stop")
    # First-run tips stay visible after a live session is auto-selected, until dismissed.
    expect(page.locator("#chat-title")).not_to_be_empty()
    expect(page.locator("#welcome-tips")).to_be_visible()
    expect(page.locator("#welcome-tips li:visible")).to_have_count(3)
    page.locator("#tips-done").click(); expect(page.locator("#welcome-tips")).to_be_hidden()
    page.reload(); expect(page.locator("#chat-title")).not_to_be_empty()
    page.wait_for_timeout(500); expect(page.locator("#welcome-tips")).to_be_hidden()
    ok("WEBUI-05 first-run tips visible with a live session, dismissed for good")
    page.locator("#help").click(); expect(page.locator("#help-dialog")).to_be_visible()
    for term in ["Main", "Sub", "Working", "Idle", "Queue after task", "Steer next turn", "Viewer"]:
        expect(page.locator("#help-dialog")).to_contain_text(term)
    page.locator("#help-close").click()
    ok("WEBUI-05 help explains sessions, delivery, stages and roles")

    # WEBUI-15 tooltip path shortened
    title = page.locator(".session").first.get_attribute("title")
    assert "…/" in title and "/var/folders" not in title and "/private/" not in title, title
    ok("WEBUI-15 session tooltip hides full path")

    # WEBUI-08 aria: tabs, headings, checkbox names, live region
    assert page.locator("[role=tab][aria-controls=inspector-body]").count() == 5
    expect(page.locator("#messages h3").filter(has_text="Rich response")).to_be_visible()
    assert page.locator("h1:visible").count() == 1, page.evaluate("[...document.querySelectorAll('h1')].filter(h=>h.offsetParent).map(h=>h.textContent)")
    names = page.locator("#messages input[type=checkbox]").evaluate_all("n=>n.map(i=>i.getAttribute('aria-label'))")
    assert all(n and n.strip() for n in names), names
    ok("WEBUI-08 tabs linked, one page h1, named checkboxes")

    # WEBUI-10 empty send disabled
    page.locator(".session").first.click(); expect(page.locator("#chat-title")).not_to_be_empty()
    page.locator("#prompt").fill("")
    expect(page.locator("#send")).to_be_disabled()
    page.locator("#prompt").fill("   "); expect(page.locator("#send")).to_be_disabled()
    page.locator("#prompt").fill("hello"); expect(page.locator("#send")).to_be_enabled()
    ok("WEBUI-10 Send disabled while empty")
    page.locator("#send").click()
    expect(page.locator("#announcer")).to_contain_text("New reply", timeout=8000)
    ok("WEBUI-08 live region announces finished reply")

    # WEBUI-09 partial attachments
    page.locator("#file-input").set_input_files([{"name": f"f{i}.txt", "mimeType": "text/plain", "buffer": b"hi"} for i in range(12)])
    expect(page.locator(".attachment")).to_have_count(10, timeout=15000)
    expect(page.locator("#toast")).to_contain_text("Skipped 2 files")
    for _ in range(10): page.locator(".attachment button").first.click()
    page.locator("#file-input").set_input_files([{"name": "big.bin", "mimeType": "application/octet-stream", "buffer": b"x" * (21 * 1024 * 1024)},
                                               {"name": "note.txt", "mimeType": "text/plain", "buffer": b"hi"}])
    expect(page.locator(".attachment")).to_have_count(1, timeout=15000)
    expect(page.locator("#toast")).to_contain_text("big.bin: limit is 20 MB.")
    page.locator(".attachment button").first.click()
    ok("WEBUI-09 attach first 10 and report skipped files")

    # WEBUI-11 in-app git dialogs
    dialogs = []; page.on("dialog", lambda d: (dialogs.append(d.type), d.dismiss()))
    page.locator("#toggle-inspector").click(); page.get_by_role("tab", name="Git", exact=True).click()
    page.get_by_role("button", name="+ New worktree").click()
    expect(page.locator("#git-dialog")).to_be_visible()
    page.locator("#git-branch-name").fill("bad name.."); page.locator("#git-submit").click()
    expect(page.locator("#git-dialog-error")).to_contain_text("Invalid branch name")
    page.locator("#git-cancel").click(); expect(page.locator("#git-dialog")).to_be_hidden()
    page.get_by_role("button", name="+ New worktree").click()
    page.locator("#git-branch-name").fill("feature/x"); page.locator("#git-submit").click()
    expect(page.locator("#toast")).to_contain_text("Created …/", timeout=10000)
    assert "prompt" not in dialogs, dialogs
    page.locator("#close-inspector").click()
    ok("WEBUI-11 branch/worktree dialogs validate without window.prompt")

    # WEBUI-01 / WEBUI-02 / WEBUI-13 tasks on desktop 1366
    page.set_viewport_size({"width": 1366, "height": 768})
    page.locator("#view-tasks").click()
    expect(page.locator("#task-stages button")).to_have_count(10)
    option = page.locator("#task-project option").first
    text = option.inner_text()
    assert "…/" in text and "/var/folders" not in text and "/private/" not in text, text
    assert option.get_attribute("title").startswith("/")
    ok("WEBUI-01 project select shows name and short path")
    expect(page.locator("[data-stage=land] .task-stage-count")).to_have_text("1")
    page.locator("[data-stage=land]").click(); page.wait_for_timeout(700)
    box = page.locator(".task-column[data-status=land]").bounding_box(); board = page.locator("#task-columns").bounding_box()
    assert box["x"] >= board["x"] - 1 and box["x"] + 50 <= board["x"] + board["width"], (box, board)
    expect(page.locator(".task-column[data-status=prove] .task-stage-desc")).to_contain_text("evidence")
    ok("WEBUI-02/13 stage chips reveal off-screen column and stages are explained")

    # WEBUI-06 locale toggle
    page.locator("#locale").select_option("th")
    expect(page.locator(".task-heading h1")).to_have_text("งานของโปรเจกต์")
    assert page.evaluate("document.documentElement.lang") == "th"
    expect(page.locator(".task-column[data-status=prove] .task-stage-desc")).to_contain_text("ขั้นตรวจหลักฐาน")
    page.locator("#view-chat").click()
    expect(page.locator("#messages")).to_contain_text("แยกการทำงาน")
    expect(page.locator("#messages")).to_contain_text("Rich response")
    page.locator("#view-tasks").click()
    page.screenshot(path=str(out / "usability-tasks-th.png"))
    page.locator("#locale").select_option("en")
    expect(page.locator(".task-heading h1")).to_have_text("Project tasks")
    assert page.evaluate("document.documentElement.lang") == "en"
    ok("WEBUI-06 EN/TH toggle with matching html lang; chat untouched")

    # WEBUI-07 access dialog: create viewer invite, audit, revoke
    page.locator("#invite").click(); expect(page.locator("#access-dialog")).to_be_visible()
    page.context.grant_permissions(["clipboard-read", "clipboard-write"])
    created = page.request.post(base + "/api/access", headers={"Origin": base}, data={"action": "create", "role": "viewer", "hours": 24}).json()
    page.locator("#access-close").click(); page.locator("#invite").click()
    expect(page.locator(f"[data-invite-id='{created['id']}']")).to_contain_text("viewer")
    viewer_ctx = browser.new_context(viewport={"width": 1280, "height": 800}); viewer = viewer_ctx.new_page()
    viewer.goto(created["url"]); viewer.locator("#name").fill("PM viewer"); viewer.locator("#login-form button").click()
    expect(viewer.locator("#role-badge")).to_be_visible()
    viewer.wait_for_selector(".session", state="attached"); viewer.locator(".session").first.click()
    expect(viewer.locator("#send")).to_be_disabled(); expect(viewer.locator("#invite")).to_be_hidden()
    viewer.locator("#view-tasks").click(); expect(viewer.locator("#task-add")).to_be_hidden()
    denied = viewer.request.post(base + "/api/tasks", headers={"Origin": base}, data={"action": "create", "project": "x", "title": "x"})
    assert denied.status == 403, denied.status
    page.locator("#access-close").click(); page.locator("#invite").click()
    expect(page.locator("#access-body .audit-list")).to_contain_text("PM viewer")
    page.locator(f"[data-invite-id='{created['id']}'] button").click()
    expect(page.locator(f"[data-invite-id='{created['id']}']")).to_have_count(0)
    assert viewer.request.get(base + "/api/state").status == 401
    page.locator("#access-close").click(); viewer_ctx.close()
    ok("WEBUI-07 viewer is read-only, audited and revocable")

    # WEBUI-12 city count
    page.locator("#view-city").click()
    expect(page.locator("#city-summary")).to_contain_text(re.compile(r"^6 agents"))
    page.locator("#city-search").fill("no-such-agent")
    expect(page.locator("#city-summary")).to_contain_text(re.compile(r"^0 agents"))
    page.locator("#city-search").fill(""); page.locator("#view-chat").click()
    ok("WEBUI-12 city heading uses live counts")

    # WEBUI-15 minor: stylesheet in head, inline code contrast
    assert page.evaluate("[...document.querySelectorAll('link[rel=stylesheet]')].every(l=>l.parentElement===document.head)")
    ratio = page.evaluate("""(()=>{const c=document.querySelector('.message-body :not(pre)>code');const s=getComputedStyle(c);
      const lum=v=>{const a=v.match(/[\\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4)});return .2126*a[0]+.7152*a[1]+.0722*a[2]};
      const f=lum(s.color),b=lum(s.backgroundColor);return (Math.max(f,b)+.05)/(Math.min(f,b)+.05)})()""")
    assert ratio >= 4.5, ratio
    ok("minor: stylesheets in head; inline code contrast >= 4.5")

    # WEBUI-02 / 03 / 14 / 08 on a phone
    phone_ctx = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    phone = phone_ctx.new_page(); phone.on("pageerror", lambda e: errors.append(str(e)))
    login(phone, "Lead")
    phone.locator("#show-sidebar").tap(); phone.locator(".session").nth(2).tap()
    expect(phone.locator("#sidebar")).to_be_hidden()
    expect(phone.locator("#session-title")).to_have_text("Edge cases · cancellation")
    width = phone.locator("#session-title").bounding_box()["width"]
    assert width >= 120, width
    expect(phone.locator("#background-count")).to_have_text(re.compile(r"^\d+$"))
    expect(phone.locator(".background-short")).to_be_visible(); expect(phone.locator(".background-label")).to_be_hidden()
    assert phone.locator("#open-background").bounding_box()["width"] >= 44
    small = phone.evaluate("[...document.querySelectorAll('.topbar button')].filter(b=>b.offsetParent).map(b=>[b.textContent.trim(),Math.round(b.getBoundingClientRect().height)]).filter(x=>x[1]<44)")
    assert not small, small
    phone.locator("#show-sidebar").tap(); phone.locator(".session.selected").tap()
    expect(phone.locator("#sidebar")).to_be_hidden()
    ok("WEBUI-03/14 readable mobile header, 44px targets, drawer closes on current session")
    phone.locator("#view-tasks").tap()
    expect(phone.locator(".task-column")).to_have_count(1)
    expect(phone.locator(".task-column")).to_have_attribute("data-status", "land")
    expect(phone.locator(".task-card")).to_have_count(1)
    assert phone.evaluate("document.documentElement.scrollWidth <= innerWidth")
    phone.locator("[data-stage=open]").tap()
    expect(phone.locator(".task-column")).to_have_attribute("data-status", "open")
    expect(phone.locator(".task-column")).to_contain_text("No tasks in this stage")
    expect(phone.locator("[data-stage=land] .task-stage-count")).to_have_text("1")
    phone.screenshot(path=str(out / "usability-mobile-tasks.png"))
    ok("WEBUI-02 phone shows one stage at a time without horizontal overflow")
    phone_ctx.close()

    assert not errors, errors
    (out / "usability-browser.json").write_text(json.dumps({"passed": True, "checks": checks, "model_requests": 0}, indent=2))
    print(json.dumps({"passed": True, "checks": len(checks)}))
    browser.close()
