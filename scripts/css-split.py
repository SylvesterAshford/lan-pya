"""Move rules that can only match on one side of the app into that side's stylesheet.

Mode signed-in (default) moves rules no public page can match; mode public
moves rules no signed-in screen can match.

usage: python3 scripts/css-split.py <repo> <globals.css> <out-globals.css> <out.css> [signed-in|public]

Public routes and signed-in routes are followed through their imports. A rule
moves when every selector in it needs a class that nothing reachable from a
public route names, so it cannot match anything a public page renders.
Comments directly above a moved rule move with it. Rules nested deeper than
one @media/@supports/@container level stay put.
"""
import os, re, sys
repo, src, out_globals, out_app = sys.argv[1:5]
MODE = sys.argv[5] if len(sys.argv) > 5 else "signed-in"
ALIAS = {"@/": repo + "/"}
EXTS = ["", ".tsx", ".ts", ".js", ".mjs", "/index.tsx", "/index.ts"]

def resolve(spec, from_file):
    if spec.startswith("@/"):
        base = os.path.join(repo, spec[2:])
    elif spec.startswith("."):
        base = os.path.normpath(os.path.join(os.path.dirname(from_file), spec))
    else:
        return None
    for ext in EXTS:
        p = base + ext
        if os.path.isfile(p) and not p.endswith(".css"):
            return p
    return None

IMPORT = re.compile(r'''(?:from|import)\s*\(?\s*["']([^"']+)["']''')
def closure(entries):
    seen, stack = set(), [os.path.join(repo, e) for e in entries]
    while stack:
        f = stack.pop()
        if f in seen or not os.path.isfile(f): continue
        seen.add(f)
        for spec in IMPORT.findall(open(f, encoding="utf-8", errors="ignore").read()):
            r = resolve(spec, f)
            if r: stack.append(r)
    return seen

PUBLIC = ["app/[locale]/layout.tsx", "app/[locale]/page.tsx", "app/[locale]/demo/page.tsx", "app/[locale]/login/page.tsx", "app/[locale]/pricing/page.tsx", "app/[locale]/proof/view/[shareId]/page.tsx"]
SIGNED_IN = ["app/[locale]/layout.tsx", "app/[locale]/app/layout.tsx", "app/[locale]/onboarding/page.tsx"] + [
    os.path.relpath(os.path.join(r, f), repo) for r, _, fs in os.walk(os.path.join(repo, "app/[locale]/app")) for f in fs if f in ("page.tsx", "layout.tsx")]
pub_files, app_files = closure(PUBLIC), closure(SIGNED_IN)
def tokens(files):
    t = set()
    for f in files: t.update(re.findall(r"[A-Za-z_][\w-]*", open(f, encoding="utf-8", errors="ignore").read()))
    return t
def prefixes(files):
    p = set()
    for f in files:
        t = open(f, encoding="utf-8", errors="ignore").read()
        p.update(re.findall(r"([A-Za-z_][\w-]*-)\$\{", t)); p.update(re.findall(r"""["']([A-Za-z_][\w-]*-)["']\s*\+""", t))
    return p
other = app_files if MODE == "public" else pub_files
pub_tok, pub_pre = tokens(other), prefixes(other)
def public_can_match(selector):
    classes = re.findall(r"\.([A-Za-z_][\w-]*)", re.sub(r":(not|is|where|has)\([^)]*\)", "", selector))
    return all(c in pub_tok or any(c.startswith(p) for p in pub_pre) for c in classes)

s = open(src, encoding="utf-8").read()
plain = re.sub(r"/\*.*?\*/", lambda m: " " * len(m.group(0)), s, flags=re.S)

def block_end(j):
    depth, k = 0, j
    while True:
        c = plain[k]
        if c == "{": depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0: return k
        k += 1

moves = []  # (start, end, wrapper or None)
def walk(a, b, wrapper):
    i = a
    while i < b:
        j = plain.find("{", i)
        if j < 0 or j >= b: break
        semi = plain.find(";", i)
        if 0 <= semi < j and plain[i:semi].strip().startswith("@"):
            i = semi + 1; continue
        sel = plain[i:j].strip()
        k = block_end(j)
        if sel.startswith("@"):
            if wrapper is None and sel.startswith(("@media", "@supports", "@container")):
                walk(j + 1, k, sel)
        elif "{" not in plain[j + 1:k]:
            if not any(public_can_match(p) for p in sel.split(",")) and re.search(r"\.[A-Za-z_]", sel):
                moves.append((i, k + 1, wrapper))
        i = k + 1
walk(0, len(plain), None)

# Build the signed-in stylesheet in source order, regrouping wrapped rules.
parts, current_wrapper = [], None
for start, end, wrapper in moves:
    text = s[start:end].strip("\n")
    if wrapper != current_wrapper:
        if current_wrapper: parts.append("}\n")
        if wrapper: parts.append(f"\n{wrapper} {{\n")
        current_wrapper = wrapper
    parts.append(text + "\n")
if current_wrapper: parts.append("}\n")
header = """/* Styles that only signed-in screens use: the app shell and every page under
   /app, plus onboarding. Split from app/globals.css so the landing page, login
   and pricing do not download them (PERF.md #10). Imported by
   app/[locale]/app/layout.tsx and app/[locale]/onboarding/page.tsx, so it loads
   after globals.css: a rule here wins a tie with a global rule. */
"""
if MODE == "public":
    header = """/* Styles that only public pages use: the landing page, login, pricing, the
   demo and shared proof pages. Split from app/globals.css so signed-in screens
   do not download them (PERF.md #10). Imported by those pages, so it loads
   after globals.css: a rule here wins a tie with a global rule. */
"""
app_css = header + "".join(parts)
out = s
for start, end, _ in sorted(moves, reverse=True):
    out = out[:start] + out[end:]
out = re.sub(r"(@(?:media|supports|container)[^{]*)\{\s*\}", "", out)
out = re.sub(r"\n{3,}", "\n\n", out)
app_css = re.sub(r"\n{3,}", "\n\n", app_css)
open(out_globals, "w", encoding="utf-8").write(out)
open(out_app, "w", encoding="utf-8").write(app_css)
print(f"public files {len(pub_files)}, signed-in files {len(app_files)}; moved {len(moves)} rules; "
      f"globals {len(s)} -> {len(out)} bytes, app {len(app_css)} bytes")
