# GUIDED-SOLVE REBUILD NOTE — carry this to the living chat (2026-07-17)

**What happened:** the original guided-solve file (Robo's real reaction ladder) could
not be found — five conversation searches across sessions found no chat that created
or received it, and the strongest record says it came with the Robo asset package on
Venkat's machine. On Venkat's explicit instruction ("Just create it right here"), the
**sanctioned rebuild fallback** (defined in the mascot-3 session) was invoked.

**The artifact:** `guided-solve-rebuilt-v1.html` — md5
`362ca7c1940e1cb8bb09ab3403fdbc65`, 1,795,641 bytes. Base: the signed-off
calm-card-v36 (so rig, card, praise wiring, and all v25–v36 behaviour are identical);
the `mood-demo-*` stand-ins were REPLACED with six finished reactions, prefix
`mood-solve-*`: encourage (dip → determined double fist-pump, thoughtful mouth, never
sad), happy (three decaying squash-and-stretch hops + cheek flare + double-blink),
celebrate (arms up held with victory waves, two jumps, star glint, blush, dust puff),
hyped (anticipation crouch → 360° with overshoot settle, arms out, star flash ×2,
cape flutter), shook (wide-eyed recoil, pupils up, happy shivers, late cheek flare,
O mouth), sleepy (held sway + breathing rise, wakes on any touch). MOUTH RULE 1 and
TONE RULES held. Hold timings: 2100/1600/2200/2000/1900/held.

**Status: NOT YET CANONICAL.** It becomes the canonical ladder only after Venkat's
per-reaction browser review (dev drawer buttons preview each mood individually) and
approval. It must never be represented as the original file — the header comment
inside the file states its rebuild provenance permanently.

**QA:** 9/9 — all six moods fire on the correct events (wrong / correct / streak 3 /
streak 5 / comeback / 45s idle with wake-on-touch), praise bubble draws from the exact
pool with streak suffix, walkthrough silence holds (fail-proofed: with the quiet guard
removed, a mood demonstrably fired mid-walkthrough), drawer buttons drive each rebuilt
mood, zero JS errors.

**Next steps (in the living chat):** 1) Venkat reviews each reaction in his browser →
per-reaction verdicts or one `y`. 2) On approval: stage as
`incoming/guided-solve-rebuilt-v1.html`, commit + push, and record IN HANDOFF that the
7.7 gate is satisfied by the REBUILD (update Brief 7.7's blank path accordingly and
note the provenance). 3) If the original ever resurfaces, Venkat chooses which ladder
is canonical — the rebuild does not silently overwrite history.
