#!/usr/bin/env python3
"""
scope-css.py — make rao.css safe to load in a real app.

PROBLEM: rao.css currently contains global rules:
    * { margin:0; padding:0; box-sizing:border-box; }   <- wipes the HOST APP's spacing
    body { font-family:...; background:...; }           <- overrides the HOST APP's body
    .q { display:none; }                                <- HIDES any app element with class="q"

Loading it in the app therefore damages the app. Proven: a host page with its own
<div class="q">Quantity: 5</div> was hidden outright.

FIX: rewrite every selector so it can only match inside .rao-lesson.
    *            ->  .rao-lesson *
    body         ->  .rao-lesson
    .q           ->  .rao-lesson .q
    .rao-lesson  ->  .rao-lesson            (already scoped, left alone)

:root is KEPT GLOBAL on purpose — CSS custom properties must be inheritable from the
document root, and they cannot "leak" (a variable nobody reads does nothing). Theme
blocks ([data-theme="mint"]) stay unscoped for the same reason: the app may put the
attribute on <html>, <body>, or the lesson wrapper, and all three must work.

@keyframes bodies are never touched (0%/100% are not selectors).
"""
import re
import sys

# Selectors that must NOT be scoped — these only define variables, never paint anything.
KEEP_GLOBAL = re.compile(r'^\s*(:root|\[data-theme=|html\[data-theme=)')

# The wrapper every lesson is rendered inside.
SCOPE = '.rao-lesson'


def scope_selector(sel: str) -> str:
    sel = sel.strip()
    if not sel:
        return sel

    # 1. variable-only blocks stay global
    if KEEP_GLOBAL.match(sel):
        # html[data-theme="dark"] .tile  ->  html[data-theme="dark"] .rao-lesson .tile
        m = re.match(r'^(html\[data-theme=[^\]]+\])\s+(.+)$', sel)
        if m and m.group(2).strip() not in ('', SCOPE):
            inner = m.group(2).strip()
            if inner.startswith(SCOPE):
                return sel
            return f'{m.group(1)} {SCOPE} {inner}'
        return sel

    # 2. already scoped
    if sel.startswith(SCOPE):
        return sel

    # 3. the universal reset — confine it
    if sel == '*':
        return f'{SCOPE} *'

    # 4. body / html become the wrapper itself
    if sel in ('body', 'html', 'html body'):
        return SCOPE

    # 5. body.foo / body .foo
    if sel.startswith('body'):
        rest = sel[4:].lstrip()
        return f'{SCOPE}{rest}' if rest.startswith(('.', ':', '[')) else (f'{SCOPE} {rest}' if rest else SCOPE)

    # 6. everything else: nest under the wrapper
    return f'{SCOPE} {sel}'


def scope_css(css: str) -> str:
    # normalise the malformed literal backslash-n that browsers choke on
    css = css.replace('\\n', '\n')

    out = []
    i = 0
    n = len(css)
    in_keyframes = False
    depth = 0

    while i < n:
        # Consume any leading whitespace up front and emit it verbatim, so the three
        # branches below always see their token (comment / at-rule / selector) AT the
        # cursor. Both the comment branch and the at-rule branch used to require their
        # token to begin *exactly* at `i`; but after a rule closes, `i` sits on the
        # newline before the next token. So a comment got swallowed into the following
        # `SELECTOR { ... }` read and split on the commas inside its own prose ("2,860
        # questions" -> "2, .rao-lesson 860"), and an `@media` got read as a selector
        # and `.rao-lesson`-prefixed into a dead rule. That is Bug 5, both halves.
        ws_end = i
        while ws_end < n and css[ws_end] in ' \t\r\n\f':
            ws_end += 1
        if ws_end > i:
            out.append(css[i:ws_end])
            i = ws_end
            if i >= n:
                break

        # comments pass through verbatim
        if css.startswith('/*', i):
            j = css.find('*/', i + 2)
            j = n if j < 0 else j + 2
            out.append(css[i:j])
            i = j
            continue

        # at-rules
        if css[i] == '@':
            m = re.match(r'@[\w-]+', css[i:])
            at = m.group(0) if m else '@'
            head_end = i
            while head_end < n and css[head_end] not in '{;':
                head_end += 1
            head = css[i:head_end]

            if head_end < n and css[head_end] == ';':          # @import / @charset
                out.append(css[i:head_end + 1])
                i = head_end + 1
                continue

            out.append(head + '{')
            if at in ('@keyframes', '@-webkit-keyframes', '@font-face', '@supports'):
                # keyframe steps (0%, from, to) are NOT selectors — copy the whole body
                depth2 = 1
                k = head_end + 1
                while k < n and depth2:
                    if css[k] == '{':
                        depth2 += 1
                    elif css[k] == '}':
                        depth2 -= 1
                    k += 1
                out.append(css[head_end + 1:k])                # includes the closing }
                i = k
                continue

            # @media / @container: recurse into the body so inner rules get scoped
            depth2 = 1
            k = head_end + 1
            start = k
            while k < n and depth2:
                if css[k] == '{':
                    depth2 += 1
                elif css[k] == '}':
                    depth2 -= 1
                k += 1
            inner = css[start:k - 1]
            out.append(scope_css(inner))
            out.append('}')
            i = k
            continue

        # a normal rule: SELECTOR { ... }
        brace = css.find('{', i)
        if brace < 0:
            out.append(css[i:])
            break
        sel_raw = css[i:brace]
        # preserve leading whitespace/newlines exactly
        lead = sel_raw[:len(sel_raw) - len(sel_raw.lstrip())]
        # Strip any comment out of the SELECTOR before we split it on commas, so a
        # comma inside a comment can never be mistaken for a selector-list separator
        # (defense in depth alongside the leading-comment skip above).
        sel = re.sub(r'/\*.*?\*/', ' ', sel_raw, flags=re.S).strip()

        close = brace + 1
        d = 1
        while close < n and d:
            if css[close] == '{':
                d += 1
            elif css[close] == '}':
                d -= 1
            close += 1
        body = css[brace + 1:close - 1]

        if sel:
            scoped = ', '.join(scope_selector(p) for p in sel.split(',') if p.strip())
            out.append(f'{lead}{scoped}{{{body}}}')
        else:
            out.append(css[i:close])
        i = close

    return ''.join(out)


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'engine/rao.css'
    dst = sys.argv[2] if len(sys.argv) > 2 else src
    css = open(src, encoding='utf-8').read()
    scoped = scope_css(css)
    open(dst, 'w', encoding='utf-8').write(scoped)
    print(f'scoped {src} -> {dst}  ({len(css):,} -> {len(scoped):,} bytes)')
