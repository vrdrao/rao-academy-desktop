#!/usr/bin/env python3
"""Regression test for scope-css.py — Bug 5.

The scoper must scope selectors to .rao-lesson WITHOUT corrupting comments:
never split a comment on the commas inside it, never strand the .rao-lesson
prefix onto comment text, never leave the real selector unscoped.
"""
import importlib.util
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("scopecss", os.path.join(HERE, "scope-css.py"))
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
scope_css = mod.scope_css

fails = []
def check(name, cond, detail=""):
    print(("  ok  " if cond else " FAIL ") + name + ("" if cond else "  -- " + detail))
    if not cond:
        fails.append(name)

# 1. A comment BETWEEN two rules (preceded by a newline) must survive verbatim,
#    and the selector after it must be scoped.
src = ".a{color:red}\n/* keeps 2,860 questions honest, no Check */\n.explain{display:none}\n"
out = scope_css(src)
check("comment content preserved verbatim",
      "/* keeps 2,860 questions honest, no Check */" in out,
      out)
check("no .rao-lesson injected inside the comment",
      ".rao-lesson" not in out.split("*/")[0].split("/*")[1],
      out)
check(".explain after the comment is scoped",
      re.search(r"\.rao-lesson\s+\.explain\s*\{", out) is not None,
      out)
check(".a is scoped", ".rao-lesson .a{" in out, out)

# 2. A comment sitting immediately before a multi-part selector list must not
#    cause the list to be split on the comment's internal commas, and BOTH
#    parts of the list must be scoped.
src2 = "/* rapid, adaptive, or quiz */\n.opt.is-correct, .opt.is-wrong{color:blue}\n"
out2 = scope_css(src2)
check("selector list both parts scoped",
      ".rao-lesson .opt.is-correct" in out2 and ".rao-lesson .opt.is-wrong" in out2,
      out2)
check("list comment preserved",
      "/* rapid, adaptive, or quiz */" in out2, out2)

# 3. :root and [data-theme] stay global; @media inner rules get scoped.
src3 = ":root{--x:1}\n[data-theme=\"mint\"]{--brand:#0f0}\n@media(max-width:480px){.prompt{font-size:17px}}\n"
out3 = scope_css(src3)
check(":root stays global", ":root{--x:1}" in out3, out3)
check("[data-theme] stays global", "[data-theme=\"mint\"]{" in out3 and ".rao-lesson [data-theme" not in out3, out3)
check("@media inner rule scoped", ".rao-lesson .prompt{font-size:17px}" in out3, out3)

# 4. Idempotence: scoping an already-scoped sheet changes nothing.
check("idempotent", scope_css(out) == out, "second pass differs from first")

if fails:
    print(f"\n{len(fails)} FAILED: {fails}")
    sys.exit(1)
print("\nscope-css: all comment/selector invariants hold")
