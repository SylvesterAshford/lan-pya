"""Find rules in a CSS file whose selectors need a class no source file names.

usage: deadcss.py <repo> <css> [--write out.css]
A selector is dead when one of its classes appears in no source file as a
literal token and starts with no dynamic prefix (`foo-${...}`). A rule is
dead when all its selectors are. Conservative on purpose.
"""
import os, re, sys, json
repo, css_path = sys.argv[1], sys.argv[2]
write = sys.argv[sys.argv.index('--write')+1] if '--write' in sys.argv else None
SRC_DIRS = ['app', 'components', 'lib', 'i18n', 'hooks', 'messages', 'public']
EXT = ('.tsx', '.ts', '.js', '.mjs', '.jsx', '.json', '.html', '.svg')
tokens, prefixes, texts = set(), set(), []
for d in SRC_DIRS:
    for root, _, files in os.walk(os.path.join(repo, d)):
        for f in files:
            if not f.endswith(EXT): continue
            t = open(os.path.join(root, f), encoding='utf-8', errors='ignore').read()
            texts.append(t)
            tokens.update(re.findall(r'[A-Za-z_][\w-]*', t))
            # `prefix-${...}` and "prefix-" + x
            prefixes.update(re.findall(r'([A-Za-z_][\w-]*-)\$\{', t))
            prefixes.update(re.findall(r'["\']([A-Za-z_][\w-]*-)["\']\s*\+', t))
def used(cls):
    return cls in tokens or any(cls.startswith(p) for p in prefixes)
s = open(css_path, encoding='utf-8').read()

def strip_comments(x):
    return re.sub(r'/\*.*?\*/', lambda m: ' ' * len(m.group(0)), x, flags=re.S)
plain = strip_comments(s)

# walk rules, recording (start, end, selector, depth-context)
dead_spans, kept, total_rules, dead_rules, dead_bytes = [], [], 0, 0, 0
partial = []  # (sel_start, sel_end, new_selector)
def walk(a, b, in_keyframes=False):
    global total_rules, dead_rules, dead_bytes
    i = a
    while i < b:
        j = plain.find('{', i)
        if j < 0 or j >= b: break
        semi = plain.find(';', i)
        if 0 <= semi < j and plain[i:semi].strip().startswith('@'):  # @import / @layer x;
            i = semi + 1; continue
        sel_start = i; sel = plain[i:j].strip()
        depth, k = 0, j
        while True:
            c = plain[k]
            if c == '{': depth += 1
            elif c == '}':
                depth -= 1
                if depth == 0: break
            k += 1
        if sel.startswith('@'):
            if sel.startswith(('@media', '@supports', '@container', '@layer')):
                walk(j + 1, k)
        elif not in_keyframes and '{' not in plain[j+1:k]:
            total_rules += 1
            parts = [p.strip() for p in sel.split(',')]
            alive = []
            for p in parts:
                classes = re.findall(r'\.([A-Za-z_][\w-]*)', re.sub(r':(not|is|where|has)\([^)]*\)', '', p))
                if all(used(c) for c in classes): alive.append(p)
            if not alive:
                dead_rules += 1; dead_bytes += k + 1 - sel_start
                dead_spans.append((sel_start, k + 1, sel))
            elif len(alive) < len(parts):
                partial.append((sel_start, j, ',\n'.join(alive)))
        i = k + 1
walk(0, len(plain))
print(json.dumps({'rules': total_rules, 'dead_rules': dead_rules, 'dead_bytes': dead_bytes, 'partial_lists': len(partial), 'css_bytes': len(s)}))
for a, b, sel in dead_spans[:400]:
    print('DEAD', s.count('\n', 0, a) + 1, sel[:110].replace('\n', ' '))
HEADER = re.compile(r'/\*\s*(={3,}|-{3,})')
def lead(a, j):
    """Whitespace and comments between the previous rule and this selector."""
    sel_at = a + len(plain[a:j]) - len(plain[a:j].lstrip())
    return s[a:sel_at], sel_at
if write:
    edits = []
    for a, b, _ in dead_spans:
        pre, _ = lead(a, plain.find('{', a))
        # Keep section headers; drop the comments that described this rule.
        headers = [m.group(0) for m in re.finditer(r'/\*.*?\*/', pre, re.S) if HEADER.match(m.group(0))]
        edits.append((a, b, ''.join('\n\n' + h for h in headers)))
    for a, j, sel in partial:
        pre, sel_at = lead(a, j)
        indent = s[s.rfind('\n', 0, sel_at) + 1:sel_at]
        indent = indent if not indent.strip() else ''
        edits.append((sel_at, j, (',\n' + indent).join(x.strip() for x in sel.split(',\n')) + ' '))
    edits.sort(key=lambda e: e[0], reverse=True)
    out = s
    for a, b, rep in edits: out = out[:a] + rep + out[b:]
    out = re.sub(r'\n{3,}', '\n\n', out)
    open(write, 'w', encoding='utf-8').write(out)
