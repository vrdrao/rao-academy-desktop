# FEEDBACK-PROTOCOL — lesson review triage and fix system

**Version:** `feedback-protocol-1` · **Date:** 2026-07-19
[src: chat-side ratification 2026-07-19, engine chat]

Governs how Venkat's lesson-review feedback becomes fixes, for every
grade. Subordinate to GRADE-ROLLOUT-PLAYBOOK.md; conflicts route to the
engine chat per playbook §10.

## 1. Input format (Venkat's side)

A feedback item = screenshot + one line + lesson name. Items arrive in
batches of any size. No triage duty on Venkat's side — classification is
the chat's job.

## 2. Triage classes — every item gets exactly one stamp

- **E — Engine.** Wrong behavior or rendering everywhere (interaction
  feel, layout, figure rendering, timing). Fix lives in engine files;
  all lessons inherit it. Only the engine chat designs E fixes. Every E
  fix is guard-first: a fixture question demonstrating the defect enters
  `_type-coverage.html`, shown to FAIL before the fix and PASS after.
- **P — Pattern.** Content defect repeated across 3+ lessons. Never
  fixed file-by-file: a sweep script enumerates every instance, the full
  list with counts goes to Venkat, then ONE batch brief fixes all
  instances. (Playbook §4: fix the general case; chase every number.)
- **L — Local.** One question, one defect, one commit. Address = lesson
  name + verbatim prompt snippet; a grep guard requires exactly one
  match; a revert never touches other items.
- **D — Working as designed.** Feedback that collides with design law
  (green-twice, one-spotlight, answer-leak, no intermediate surface,
  no-repaint). The chat answers NO with the law cited. Venkat may accept
  or overrule; an overrule becomes a spec/playbook amendment via the
  engine chat — never a quiet per-lesson exception.

## 3. Batch cycle

1. Venkat sends a batch of items.
2. Chat returns a numbered TRIAGE TABLE: item # · lesson · one-line
   defect · class stamp · root cause · proposed fix · blast radius
   (count of affected questions/lessons, stated as a number).
3. Venkat audits the table — especially every count — and replies with
   `y` (adopt all) or per-line overrides.
4. Briefs are issued IN LANE ORDER: all E first, then P, then L.
   Rationale: an engine fix can dissolve L items for free; sweeps run
   before spot fixes so the sweep cannot plow over fresh fixes. After
   each lane lands, the chat re-checks remaining items and retires any
   the earlier lane already fixed (retirements are listed, not silent).
5. D items are answered inline in the triage table, no brief.
6. Scoreboard closes every batch: items received / fixed by lane /
   retired / ruled D / deferred, with commit hashes. Numbers must
   reconcile to the batch total.

## 4. Commit and audit discipline

- One L item per commit. One P sweep per commit. E fixes commit per
  engine change with their fixture.
- Every brief report carries a mandatory Deviations section.
- Venkat pushes only after chat audit, enumerated, per playbook §1.

## 5. Cross-grade rule

E and P fixes may touch multiple grades' content only when the sweep
list says so and Venkat has seen the cross-grade counts. A grade chat
receiving feedback that triages to E routes it to the engine chat as an
ENGINE REQUEST (playbook §1); it never patches engine behavior locally.
