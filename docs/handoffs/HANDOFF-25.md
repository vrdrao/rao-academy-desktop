# HANDOFF-25 — BRIEF-RENDER-1 executed (rao-master-22), KEY-AUDIT + ORDER-ENUM delivered

**Session:** 2026-07-20 (overnight). **Engine:** `rao-master-22`. **NOT PUSHED —**
six local commits await Venkat's chat audit, per the brief. The pre-push hook will
run the full suite (including the deferred full format sweep) at push time.

## The commit stack (local, on top of FR-2's `71f3d76`)

| commit | what |
|---|---|
| `faa1fc3` | C1 — line-plot marks: discrete brand ✕ per filled slot, never a solid block; legend recoloured to match. (+ `.gitignore tools/scratch/`) |
| `d726abe` | C2 — line-plot source table beside the plot (flex-wrap; measured breakpoint ≈540px card container / ~650px viewport; stacked at 390px) |
| `6ccee58` | C3 — vertical-multiply boxes: 44px tap floor honoured by widening columns (52px/48px); gaps +8px/+4px; rule line now stretches via flex |
| `d82c8d3` | C4 — thousands commas understated (.72em, w500, muted, 9px/8px column) in vcol AND vmul; phone cross-row misalignment fixed (36px mobile cell override removed) |
| `feb0ffc` | C5 — wide-stimulus figure upscale scoped to `svg:not([width])` + `svg[width="100%"]`; authored-size figures (Q19-class) keep authored size |
| `748cd22` | Closing — version bump, 118 reviews regenerated (measured), deploy-drop md5-refreshed + DEPLOY.md pinned, brief archived, RENDER-1 fixtures relocated to the fixture tail |

Every C-commit carries its fixture in `lessons/_type-coverage.html` and its
computed-style guard in `tools/verify-styles.js` (`checkRender1`, fast path
`--render1-only`) — each proven RED against the unfixed engine before the fix.
Full `npm test` on the final tree: exit 0, zero FAIL lines.

## Also delivered this session (untracked by design, for Venkat's review)

- `docs/audits/KEY-AUDIT-2026-07-19.md` — BRIEF-AUDIT-KEYS (read-only): 3,075
  questions; 516 machine-checkable, **0 defects**; checks proven live by 156
  caught mutations. **Q19's key is A (correct) in the tree and always has been**
  — the wrong-key sighting is most consistent with a stale browser cache.
  Touch-drag: all three in-repo drag paths PASS under real CDP touch at 390px;
  **construct is UNVERIFIED — `raoGeoEngine.js` is not in this repo** (review
  pages show "Geometry engine not loaded"), 30 real questions ride on it.
- `docs/audits/ORDER-ENUM-2026-07-19.md` — Phase R: all 153 order questions
  enumerated; **15 in the defect intersection** (prompt says "work out" but
  tiles are bare results — the answer leaks); 58 magnitude-spread retarget
  candidates. Input for the P sweep; Venkat audits before it is briefed.

## Deviations worth knowing at audit time

1. First full-suite run went red: the four new fixtures had been inserted
   mid-file, shifting `verify-reset`'s positional frame map (frames 9–12).
   Fixed by relocating them before the final ladder fixture (verify-touch needs
   the ladder last). A first piped invocation masked the exit code (my pipe, not
   a gate bug — `verify-reset` standalone exits 1 correctly when red).
2. `.gitignore` gained `tools/scratch/` — the read-only audit's scratch scripts
   are mandated-untracked, and `verify-tracked` blocks commits otherwise.
3. C5 survey: 46 fixed-px wide-viewBox figures across 8 lessons now render at
   authored size (were upscaled to 520px); 223 `width="100%"` figures keep the
   520px cap deliberately (54 have no inline max-width and would balloon).
4. Counted, not fixed (chat decision pending): the table-above-interactive
   pattern outside line-plot — frequency_tables.html bar-graph q2/q15 (directly
   analogous) + 16 table-as-stimulus questions in the same lesson.

## Next

- Venkat: audit the six commits + the two audit reports, then push.
- Pending brief on deck: `BRIEF-L1-ASMD.md` (untracked, repo root).
- P sweep to be briefed AFTER Venkat audits ORDER-ENUM.
