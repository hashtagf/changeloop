#!/usr/bin/env python3
"""Static state-coverage scan: which required UI states have any marker in the source.

Usage: python3 scripts/state_check.py <dir-or-file> [more files ...] [--json] [--need loading,empty,error,...] [--per-file] [--matrix]

Several paths are scanned together (check.py passes a page plus the local scripts and
stylesheets it links). Exit 0 when every needed state has a marker, 1 when any is missing.

--matrix: print a surface × state Markdown table (one row per source file), each cell
"Manual (marker)" or "missing", ready to paste into the review report.

--per-file: every file that fetches data must carry its own loading, error and empty
markers; forms need a busy/disabled state (and an unsaved-changes guard when long);
search/filter inputs need a no-match state; polling needs a refetch marker; an error
state needs a retry path. One mention elsewhere in the project does not count.

Looks for loading, empty, error, disabled, focus, selected, submitting, success,
hover, plus offline/permission when asked. A hit means a marker exists somewhere,
not that the state is reachable or correct; a miss means "unverified, review by
hand". Report results as Manual, never as "covered".

Exit: 0 every needed state has a marker (or no gaps with --per-file; always 0 with --matrix),
1 a state is missing / a gap found, 2 usage or input error (missing path, unknown state in --need, no source files
to scan). --matrix and --per-file scan every path given, like the default scan.
Writes nothing. Stdlib only.
"""
import argparse, json, os, re, sys

STATES = {
    "loading": r"skeleton|spinner|isLoading|loading|aria-busy|pending",
    "empty": r"empty|no[\s_-]?(data|results|items|records)|nothing (here|found)|zero[\s_-]?state",
    "error": r"error|failed|aria-invalid|role=.alert|catch\s*\(|onerror",
    "disabled": r"\bdisabled\b|aria-disabled",
    "focus": r":focus-visible|focus-visible:|:focus\b|focus:|\.focus\(",
    "selected": r"aria-selected|aria-current|aria-pressed|\bselected\b|\bis-active\b|\bactive\b",
    "submitting": r"submitting|isSubmitting|saving|isPending|aria-busy|is-busy|data-state=.submitting|class(Name)?=[\"'][^\"']*\bbusy\b|\.busy\b|\bbusy\s*[:=]",
    "success": r"success|saved|toast|confirmation|done|role=.status[^>]*>[^<]*(done|saved|added|แล้ว)|\bundo\b|เลิกทำ",
    "hover": r":hover|hover:",
    "offline": r"offline|navigator\.onLine|retry",
    "permission": r"forbidden|unauthori[sz]ed|permission|403|read-?only|not allowed",
}
DEFAULT = ["loading", "empty", "error", "disabled", "focus", "selected", "submitting", "success", "hover"]
EXT = (".tsx", ".ts", ".jsx", ".js", ".vue", ".svelte", ".html", ".css", ".astro")
SKIP = {"node_modules", "dist", "build", ".next", "reports", "evals", "__pycache__"}


def files(path):
    if os.path.isfile(path):
        yield path
        return
    for d, dirs, fs in os.walk(path):
        dirs[:] = [x for x in dirs if x not in SKIP and not x.startswith(".")]
        for f in fs:
            if f.endswith(EXT):
                yield os.path.join(d, f)


FETCH = r"\bfetch\(|useQuery|useSWR|axios|\$fetch|useFetch|\bload\s*\(|createResource"
RULES = [
    # (applies-when, required, message)
    (FETCH, STATES["loading"], "fetches data but has no loading marker"),
    (FETCH, STATES["error"], "fetches data but has no error marker"),
    (FETCH, STATES["empty"], "fetches data but has no empty marker"),
    (r"<form|onSubmit|on:submit|@submit", r"disabled|isSubmitting|submitting|aria-busy|isPending", "form without a busy/disabled state while submitting"),
    (r"type=[\"']?search|role=[\"']?search|(name|id)=[\"'][\w-]*(search|filter)|class=[\"'][^\"']*\bfilters?\b|[?&]q=", r"no[\s_-]?(match|results)|nothing found|ไม่พบ|(reset|clear) (filters|search)|empty[\s_-]?for", "search/filter without a no-match state"),
    (r"refetchInterval|setInterval\([^)]*fetch|polling", r"isFetching|isRefetching|stale|updated[\s_-]?at|last[\s_-]?updated", "polling/refetch without a refreshing or stale marker"),
    (r"isError|\bfetch\([^;]*\)\s*\.catch\(|\.then\([^;]*\.catch\(|failed to (load|fetch)|โหลด.{0,10}ไม่สำเร็จ", r"retry|try again|refetch|reload|ลองอีกครั้ง", "error state without a retry path"),
]


def sources(paths):
    """[(root, file)] for every path given, each file once (several paths are scanned together)."""
    out, seen = [], set()
    for p in paths:
        for f in files(p):
            if os.path.abspath(f) not in seen:
                seen.add(os.path.abspath(f))
                out.append((p, f))
    return out


def per_file(paths):
    gaps = []
    for _, f in sources(paths if isinstance(paths, (list, tuple)) else [paths]):
        if f.endswith(".css"):
            continue
        try:
            text = open(f, encoding="utf-8", errors="replace").read()
        except OSError:
            continue
        # fold in local scripts and relative imports: a page's states often live in its module
        base = os.path.dirname(f)
        for ref in re.findall(r"<script[^>]+src=[\"']([^\"':]+)[\"']|from\s+[\"'](\.{1,2}/[^\"']+)[\"']|import\([\"'](\.{1,2}/[^\"']+)[\"']\)", text):
            r = next(x for x in ref if x)
            for cand in (r, r + ".js", r + ".ts", r + ".tsx", r + ".jsx", os.path.join(r, "index.ts")):
                q = os.path.normpath(os.path.join(base, cand))
                if os.path.isfile(q):
                    text += "\n" + open(q, encoding="utf-8", errors="replace").read()
                    break
        for when, need, msg in RULES:
            if re.search(when, text, re.I) and not re.search(need, text, re.I):
                gaps.append({"file": f, "gap": msg})
        if len(re.findall(r"<textarea\b|<input\b(?![^>]*type=[\"']?(search|checkbox|radio|hidden|submit|button))", text, re.I)) >= 6 and not re.search(r"isDirty|beforeunload|unsaved", text, re.I):
            gaps.append({"file": f, "gap": "long form without an unsaved-changes guard"})
    return gaps


def main(argv):
    ap = argparse.ArgumentParser(prog="state_check.py", description="Static state-coverage scan (see the module docstring).")
    ap.add_argument("paths", nargs="+", metavar="PATH", help="directory or files to scan")
    ap.add_argument("--json", action="store_true", help="machine-readable output")
    ap.add_argument("--need", metavar="STATES", help="comma list of states: " + ",".join(STATES))
    ap.add_argument("--per-file", action="store_true")
    ap.add_argument("--matrix", action="store_true")
    a = ap.parse_args(argv)
    args = a.paths
    need = DEFAULT
    if a.need is not None:
        need = [x.strip() for x in a.need.split(",") if x.strip()]
        unknown = [x for x in need if x not in STATES]
        if unknown or not need:
            print(f"error: unknown state in --need: {','.join(unknown) or '(empty)'} (known: {','.join(STATES)})", file=sys.stderr)
            return 2
    gone = [x for x in args if not os.path.exists(x)]
    if gone:
        print(f"error: path not found: {gone[0]} (pass a source directory or file)", file=sys.stderr)
        return 2
    src = sources(args)
    if not src:
        print(f"error: no source files to scan in {', '.join(args)} (looked for {' '.join(EXT)})", file=sys.stderr)
        return 2
    if a.matrix:
        rows = []
        for root, f in src:
            if f.endswith(".css"):
                continue
            try:
                text = open(f, encoding="utf-8", errors="replace").read()
            except OSError:
                continue
            cells = ["Manual (marker)" if re.search(STATES[s], text, re.I) else "missing" for s in need]
            rows.append((os.path.relpath(f, root) if os.path.isdir(root) else os.path.basename(f), cells))
        note = "Marker present != state verified: render each cell before marking it Ran."
        if a.json:
            print(json.dumps({"states": need, "rows": [{"surface": n, **dict(zip(need, c))} for n, c in rows], "note": note}, indent=2, ensure_ascii=False))
            return 0
        print("| Surface | " + " | ".join(need) + " |")
        print("|---|" + "---|" * len(need))
        for n, cells in rows:
            print(f"| {n} | " + " | ".join(cells) + " |")
        print("\n" + note)
        return 0
    if a.per_file:
        gaps = per_file(args)
        if a.json:
            print(json.dumps({"gaps": gaps, "note": "Static markers only; label results Manual."}, indent=2, ensure_ascii=False))
        else:
            for g in gaps:
                print(f"  GAP {g['file']}: {g['gap']}")
            print(f"{len(gaps)} gap(s). Static markers only; label results Manual.")
        return 1 if gaps else 0
    hits = {s: [] for s in need}
    n = 0
    for _, f in src:
        n += 1
        try:
            text = open(f, encoding="utf-8", errors="replace").read()
        except OSError:
            continue
        for s in need:
            if re.search(STATES[s], text, re.I):
                hits[s].append(f)
    missing = [s for s in need if not hits[s]]
    rep = {"files": n, "found": {s: len(v) for s, v in hits.items() if v}, "missing": missing,
           "note": "Marker present != state reachable or correct; missing = unverified. Label results Manual."}
    if a.json:
        print(json.dumps(rep, indent=2))
    else:
        print(f"{n} files scanned")
        for s in need:
            print(f"  {'ok ' if hits[s] else 'MISS'} {s}" + (f" ({len(hits[s])} files)" if hits[s] else ""))
        print(rep["note"])
    return 1 if missing else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
