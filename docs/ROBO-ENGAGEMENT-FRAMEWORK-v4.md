# ROBO ENGAGEMENT FRAMEWORK — v4

Supersedes v3. Ratified by Venkat 2026-07-17 across the v25–v36 session; design
sign-off on the v36 demo recorded in HANDOFF-12. Everything in v3 carries unchanged
unless amended here (identity law, reaction ladder + praise pools + comeback pool +
name personalization, milestone motions, drag/yield/persistence, mobile touch law,
responsive size law, restraint charter incl. no-guilt and no-currency). The guided-solve
file remains the ONLY source for the real reaction ladder — hard gate, never rebuilt
from memory. All durations × slow() where the demo's slow-motion factor exists.

## A. Personality pack (v25 — "naughty on the child's terms")

Design principle: mischief the child invites or catches, never mischief aimed AT the
child. Two features are child-initiated, one runs before work starts, one only in
genuinely idle moments. The never-interrupt law is untouched.

**A1. Sneak-peek entrance (once per session).** On first load: dock positioned so
only ~a third of Robo shows past the right edge (`left = innerWidth − 0.34·W`,
`top = 0.32·innerHeight`). At 350ms his pupils dart left-right-left (1000ms WAAPI).
At 1400ms a committed little lean further in (rotate −6°, translateX −6px, 600ms).
At 2150ms he zips to his dock via flyTo; position persisted after the standard 700ms.
Session flag `roboEntered` set at start; a persisted `roboPos` (returning child)
suppresses the entrance entirely. Runs BEFORE any work, so never-interrupt holds.

**A2. Poke personality ladder (rebuilt — reverses the pre-v17 "escalation closed"
ruling, re-ratified with the anti-addiction cooldown the old one lacked).**
Consecutive pokes ≤8s apart climb; a gap >8s resets to stage 1:
1. wobble (`mood-poked`, 500ms, blip chirp)
2. giggle-shimmy (`mood-shimmy`, 650ms, two rising chirps, cheeks flare)
3. spin-away + tongue out (`mood-tease`, 900ms, 360° spin, grin+tongue at the end,
   whoosh + cheeky sweep chirp)
4. play dead (`mood-dead`, 2600ms: slumps, lids shut, ONE eye peeks at ~60%,
   comic power-down chirp + peek blip) — then ladder resets AND locks for
   **30s cooldown** during which every poke is a plain stage-1 wobble.
Rationale for the cooldown: poking must never out-compete the math. Each stage is
busy-guarded (`clapBusy`) like every other motion.

**A3. Idle mischief (caught-in-the-act, silent).** One beat per idle period at the
**22s** mark, capped at **one per 90s** overall, pool-no-repeat until it cycles:
- `mood-mischief-bolt` 2600ms — spanner appears from behind, right arm reaches up,
  he tightens his own antenna bolt (squint lids).
- `mood-mischief-jugg` 2800ms — juggles three bolts with quick alternating arms;
  drops one (see B below); sheepish pout at the end.
- `mood-mischief-mag` 2600ms — magnifying glass out, leans toward the card
  (±6°/5px WAAPI, direction computed from card vs dock centres), right-eye squint.
Guards (all hard): never while `quiet` (walkthrough), **never while `hadWrong`**
(a struggling child watching Robo juggle reads as mockery — this is the stuck-child
guard, fail-proofed in QA), never while busy, cancelled INSTANTLY by any
pointerdown/keydown (wake). Doze at 45s outranks a lingering beat. Beats are
soundless by design. Props used are inside his SVG except the stage bolt (B).

**A4. Carry flail + dust-off.** While `robo-carried`: arms flail in a 340ms panic
loop, worried O-mouth replaces the smile. On a clean drop (yield rule did NOT need
to fly him): `mood-dust` 700ms — two alternating arm brushes + dust puffs at his
feet. If the yield fly fires instead, no dust-off.

## B. Amended stage-prop law (Venkat, 2026-07-17) + the stage bolt

Props MAY live on the stage, outside Robo's body, provided ALL of:
1. They are Robo's things — never the child's controls; nothing clickable/draggable
   during problem-solving (`pointer-events:none`).
2. **No-fly zone wider than the yield rule:** a prop may never overlap the CARD BODY
   (not just interactive elements) nor any interactive element — the prompt is the
   most sacred pixel on screen. The check covers the prop's ENTIRE motion path
   (e.g. the full fall column), not just its resting spot. Occupied → the prop simply
   doesn't spawn (behaviour degrades to the in-rig version).
3. Transient: enters with a Robo moment, gone when it ends; nothing accumulates.
4. Silence laws outrank: no props in walkthrough; none while stuck (inherited from
   the beats that spawn them).
5. The feed-apple stays retired (its sin was demanding the child's hands during work).

**Exemplar — the stage bolt (v27):** during the juggle beat, at 1700ms the in-rig
third bolt hands off (`has-stage-bolt` swaps its keyframe to vanish at the drop point
instead of falling) to a real 18px fixed-position bolt at `dock.left + 0.22·W`,
falling from `dock.top + 0.35·H` to `floor = min(viewportH − 26, dock.bottom + 26)`
over 900ms with two bounces and an 18px/360° roll (z-index 7). At beat-end − 700ms
Robo bends toward it (−8°/5px, 700ms) and the bolt clears 420ms in ("in his hand").
Any interaction removes bolt + hand-off class instantly. If the fall column check
fails, no spawn and the classic in-rig fall plays.

## C. Attention gaze (v26) + silence-law clarification

**The signaling principle:** when help appears — any `.cc-msg` (hint bubble or
walkthrough step) added to the DOM — Robo's pupils lock onto the NEWEST bubble and
hold: `translate(nx·3.2px, ny·2.6px)` where nx/ny = (target − dock centre)/260,
clamped ±1; target y capped 40px into tall bubbles. Implemented via MutationObserver
on `.cc-msg` additions; re-aimed on scroll/resize and as Robo moves; pointer
eye-tracking YIELDS while a gaze target is held ("the lesson outranks the pointer");
self-releases if the target leaves the DOM; released on a correct answer (that moment
belongs to the celebration, not the card).

**Ruling (logged):** walkthrough silence bans REACTIONS — bubbles, moods, motions.
Gaze is ambient posture, like float and blink, which have always run through
walkthroughs; therefore gaze legally follows each step while Robo stays otherwise
totally silent. (Venkat may still order frozen eyes in walkthrough — one word.)

## D. Palette tint (v33) — Robo wears the kid's theme

Robo's body family follows the selected palette; his identity anchors NEVER change
(red cape, plum face lines, amber star, pink cheeks — that constancy is what keeps
him Robo-in-your-colours rather than a different robot per theme). Derivation
formulas, grape pinning, the tropic==grape coincidence, and the scoped
attribute-selector mechanism are specified in MASTER-SPEC §2 items 3–4 and are
normative. Verified property: light-belly/dark-arms shade ordering holds for every
palette.

## E. Restraint charter (v4 = v3 + additions in bold)

One motion at a time; drop, don't queue. Never interrupts work; **mischief only in
true idle, cancelled by any touch, never on a stuck child**. **Poke escalation is
cooldown-capped so playing with Robo cannot out-compete the lesson.** No guilt
mechanics; no reward currency; anger = authored villain beats only; audio synth-only
and respects mute; **mischief beats are soundless**. Walkthrough: fully silent
(gaze excepted per §C). **Props obey the amended stage-prop law (§B) — nothing ever
lies on the lesson.**
