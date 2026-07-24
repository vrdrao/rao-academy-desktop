/* ============================================================================
   rao-card.js — THE CARD RENDERER. A real shared asset, exactly like rao-card.css.

   Turns an engine-built question ({markup, behavior, answer, hint}) into a full
   student card: the gradient .pv-frame, the .pv-head progress ring, the question
   body, the hint panel, and the [Hint] … [Check] footer — then wires the CALM
   CARD behavior (Brief 7.6, rao-master-16, signed off in calm-card-v36.html).

   THE LAWS this file enforces (each has a guard in tools/verify-calm.js):
     1. TASK IMMUTABILITY — prompt + options never dim, fade or recolor. Only
        card chrome (.pv-tlabel, .pv-ring) quiets (.cc-dim) in feedback states.
     2. NO ANSWER REVEAL while attempting is possible. No green, no correct
        highlight, no reveal text. The reveal happens ONCE, at the walkthrough's
        final step (or on a correct answer).
     3. WRONG IS A WHISPER (amended by BRIEF FR-2, 2026-07-19, per HANDOFF-24
        rulings 1–4 — reverses FR-1's no-mark wording, supersedes Brief 7.6's
        "✕ persists"). A wrong SELECTION is marked with a small red ✕ glyph
        before its text — never on a correct selection, never on an unselected
        option; multi-select marks EVERY wrong selection. Fill-blanks get NO
        glyph: the wrong blank tints softly red (border + text). The typed value
        SURVIVES the Check that produced the wrong verdict — the child must see
        the answer they are being told is wrong — but is CLEARED to empty on the
        "Try again" tap (AMENDED by BRIEF-RETRY-STATE-2, 2026-07-23, Venkat's #88
        ruling — REVERSES the old "the typed value is NEVER cleared"; a deliberate
        reversal, not drift — do not restore it). No is-wrong red flood.
        AMENDED by BRIEF-NOTQUITE-1 (RULED by Venkat 2026-07-24 — REVERSES the
        old "no shake, no 'Not quite' pill in adaptive mode; the bubble carries
        the feedback" clause): a wrong Check now shows an INSTANT playful pill
        (.cc-pill — grade-keyed engine lines, NOTQUITE_POOLS) and ONE gentle
        card shake (.cc-shake) — young children did not register the quiet
        feedback as "wrong". The pill clears on Try again / new selection; do
        not restore the old no-pill clause from a stale note.
        On "Try again" every ✕/tint clears and the task
        returns to its first-attempt state — restored from a snapshot taken at
        mount, with fill-blanks typed values now CLEARED (guard:
        tools/verify-reset.js A1–A5, amended same brief).
     4. HELP ACCUMULATES — hint bubbles and walkthrough steps only ever stack;
        nothing the card has told the child disappears while the question lives.
        AMENDED by BRIEF-G3-ENGINE-1 (Item 63): opening the solution is the ONE
        sanctioned exception — the accumulated hint/whyWrong bubbles clear at that
        point so the panel stands alone (openWalkthrough / revealSolution). The
        question DOM is still untouched; only the bubble stream (outside .qbody)
        is removed, so the no-repaint law holds.
     5. TWO SEPARATE STREAMS — hints and whyWrong are labelled apart (AMENDED by
        BRIEF-G3-ENGINE-1, Item 66; REVERSES the old "whyWrong IS the next hint
        rung"). A whyWrong message renders with the chip "Not quite" and does NOT
        consume a hint number: after it, the next hint the child asks for is still
        "Hint 1". Why: two adults on this project misread a whyWrong message as a
        leaking hint rung on consecutive days, and a child would misread it every
        time. Presentation: typed tutor bubbles (RaoSolution.bubbles — ONE copy,
        shared with the steps); the whyWrong bubble carries .cc-msg-why (warning
        tint), the hint bubble does not.
     6. WALKTHROUGH commit (amended by BRIEF FR-2, 2026-07-19, per HANDOFF-24
        ruling 7 — was "child-initiated only, never auto-opened"). The
        walkthrough opens by EITHER path: the child taps "Show me the solution"
        (offered once hints are used after a wrong attempt, never before the
        first attempt), or it AUTO-OPENS on the second wrong attempt where a
        solution exists (TWO ATTEMPTS IS THE CAP — no Try Again offered).
        EITHER path LOCKS the question immediately and records
        solved-with-help. No retry inside. Final step reveals quietly —
        triumph ≠ rescue. Guards: verify-calm.js b (tap), verify-reset.js
        A6–A9 (auto-open).
     7. CORRECT stays loud but SILENT of text (AMENDED by BRIEF-G3-ENGINE-1,
        Item 65; REVERSES the old "takeaway panel"). Green option + cc-win +
        sparks + chime are unchanged; the .cc-take panel is GONE — nothing to
        read by default. cc-hastake is still added (it seals the duplicate
        .explain — drop it and .explain reappears). A ghost "Show me the solution"
        is offered beside "Next question →" when a solution exists; tapping it
        renders the full solution and leaves the outcome "correct".
     8. MODES — adaptive: all of the above. rapid: verdict flash + one-line
        explain + code log only. quiz: nothing during; review is the app's job.

   The app can load this file and call card()/wireCard() itself, or keep its
   own mount. The trailing IIFE mounts every question in #source into #preview.
   ========================================================================== */
var WHYWRONG_VISIBLE = false; // RULED OFF by Venkat 2026-07-24 (BRIEF-WHYWRONG-OFF-1).
                              // Authored content retained in lessons; analytics event still fires.
                              // Do not re-enable without a new dated ruling.

// ── The "not quite" pools — BRIEF-NOTQUITE-1, RULED by Venkat 2026-07-24. ──
// On a wrong first attempt in calm mode the child gets an INSTANT playful pill
// + one gentle card shake (this REVERSES the old law-3 clause "no 'Not quite'
// pill in adaptive mode" — a dated ruling, not drift). Fixed ENGINE lines,
// zero per-question authoring; the joke lands on the QUESTION, never the
// child; rule 12 bans distance words ("close"/"almost"/"nearly") in every
// line (linted by tools/verify-notquite.js). Keyed by grade so each grade can
// have its own voice later — a new grade adds a key HERE, no other change.
// NO runtime grade signal exists today (no lesson frontmatter, no data-attr,
// no config reaches the card), so the engine defaults to the "4" pool —
// reported in BRIEF-NOTQUITE-1's Phase 0, per its stop-gate.
var NOTQUITE_POOLS = {
  "4": {
    firstWithHint: [                       // attempt 1, a hint will type below
      "Ooh, tricky one! The hint below will help",
      "The answer is still hiding — your clue is below!",
      "Keep hunting, detective! Check the hint below",
      "Oops-a-daisy! The hint below will help you",
      "Hmm, nope! Let's peek at the hint below"
    ],
    firstNoHint: "Hmm, not that one — try again!",   // attempt 1, ladder exhausted / none authored
    secondWithWalkthrough: "Let's work it out together"   // attempt 2, the walkthrough doorway
  }
};
var NOTQUITE_GRADE = "4";
// Module-level so "never the same line twice in a row" holds ACROSS cards on a
// page, not just within one card (a card only ever has one first attempt).
var notquiteLastIdx = -1;
function pickNotquite(pool) {
  var i;
  do { i = Math.floor(Math.random() * pool.length); } while (pool.length > 1 && i === notquiteLastIdx);
  notquiteLastIdx = i;
  return pool[i];
}
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; });
}
function escAttr(s) { return esc(s).replace(/"/g, "&quot;"); }
function card(inner, behavior, answer, hint, i, n, extra) {
  // hint may be a legacy string (unchanged) or a ladder (array of 1-3 rungs,
  // JSON-encoded into the same attribute). extra carries whyWrong / solution
  // when the question authors them; legacy questions emit NO new attrs.
  var hintAttr = hint ? (Array.isArray(hint) ? JSON.stringify(hint) : String(hint)) : "";
  return (
    '<div class="pv-frame" data-behavior="' + escAttr(behavior) + '" data-answer="' + escAttr(JSON.stringify(answer)) + '"' +
      (hintAttr ? ' data-hint="' + escAttr(hintAttr) + '"' : "") +
      (extra && extra.whyWrong ? ' data-why="' + escAttr(JSON.stringify(extra.whyWrong)) + '"' : "") +
      (extra && extra.solution ? ' data-solution="' + escAttr(JSON.stringify(extra.solution)) + '"' : "") +
      '><div class="pv-card">' +
      '<div class="pv-head"><span class="pv-tlabel">Problem</span>' +
        '<span class="pv-ring"><i>' + i + "/" + n + "</i></span></div>" +
      inner +
      '<div class="pv-hintbox" hidden></div>' +
      '<div class="pv-foot"><button class="pv-hint" type="button">Hint</button>' +
        '<span class="pv-fb"></span><button class="pv-check" type="button">Check</button></div>' +
    "</div></div>" +
    '<div class="pv-ans">✓ Answer: <b>' + esc(Array.isArray(answer) ? answer.join(", ") : answer) + "</b></div>"
  );
}
function wireCard(frame) {
  var qbody = frame.querySelector(".qbody");
  var behavior = frame.dataset.behavior;
  var answer; try { answer = JSON.parse(frame.dataset.answer || "null"); } catch (e) { answer = null; }
  // FR-1: the first-attempt snapshot, captured BEFORE attach() so restore +
  // re-attach replays the exact mount sequence. ONE mechanism for every
  // behavior — a snapshot cannot drift out of sync with a behavior's rendering
  // the way hand-written per-behavior teardown does. construct re-mounts its
  // board from the pristine data-construct spec when attach() re-runs.
  var taskSnap = qbody ? qbody.innerHTML : null;
  if (qbody && window.RaoPreview && window.RaoPreview.attach) window.RaoPreview.attach(qbody, behavior);
  // The compound reveal selector needs data-mode AND is-checked on the SAME
  // element (an ancestor of `.explain`); `.qbody` is that element. Default to
  // "adaptive"; the app may pre-set data-mode on the qbody to pick rapid/quiz.
  if (qbody && !qbody.hasAttribute("data-mode")) qbody.setAttribute("data-mode", "adaptive");
  var mode = (qbody && qbody.getAttribute("data-mode")) || "adaptive";

  // BRIEF-RETRY-STATE-2 (#111, 2026-07-23): dismiss STALE wrong-answer feedback
  // the moment the child makes a new selection (taps a different option or edits
  // a blank). Delegated on qbody in the CAPTURE phase so it (a) survives
  // restoreTask's re-mount — only qbody's innerHTML is replaced, qbody itself
  // persists — and (b) runs even if a behavior stops propagation. It only ever
  // HIDES the whyWrong bubble (never removes it: no-repaint / append-only law);
  // see hideStaleFeedback below.
  if (qbody) {
    var onNewSelection = function (e) {
      var t = e.target;
      if (t && t.closest && t.closest(".opt, .opt-fig, .hcell, .st-apple, .blank-input, .ans-input")) hideStaleFeedback();
    };
    qbody.addEventListener("click", onNewSelection, true);
    qbody.addEventListener("input", onNewSelection, true);
  }

  // ── shared data (absent on legacy questions) ──
  var hintBtn = frame.querySelector(".pv-hint"), hintBox = frame.querySelector(".pv-hintbox"), hintRaw = frame.dataset.hint;
  var rungs = null;
  if (hintRaw) {
    if (hintRaw.charAt(0) === "[") {
      try { var parsed = JSON.parse(hintRaw); if (Array.isArray(parsed) && parsed.length) rungs = parsed.map(String); } catch (e) { /* fall through: treat as string */ }
    }
    if (!rungs) rungs = [hintRaw];
  }
  var whyMap = null, solution = null, explain = null;
  try { if (frame.dataset.why) whyMap = JSON.parse(frame.dataset.why); } catch (e) { whyMap = null; }
  try { if (frame.dataset.solution) solution = JSON.parse(frame.dataset.solution); } catch (e) { solution = null; }
  var explainEl = qbody ? qbody.querySelector(".explain") : null;
  if (explainEl) explain = explainEl.innerHTML;

  var checkBtn = frame.querySelector(".pv-check"), fb = frame.querySelector(".pv-fb"), foot = frame.querySelector(".pv-foot");
  var isSelect = behavior === "single-select" || behavior === "multi-select";

  // The calm presentation needs the shared bubble primitives. Without them
  // (solution-renderer.js not loaded) the card degrades gracefully to the
  // legacy hint box / message panel — still with ZERO answer leaks.
  var bubbles = window.RaoSolution && window.RaoSolution.bubbles;
  var calm = mode === "adaptive" && !!bubbles;

  // ══════════ calm-card state (one closure per card) ══════════
  var wrongCount = 0;     // wrong ATTEMPTS (the walkthrough trigger counts these)
  var hintNum = 1;        // next "Hint n" chip number — whyWrong and forward rungs share it
  var rungIdx = 0;        // next unshown forward rung
  var locked = false;     // set on correct, or at the walkthrough commit point
  var typing = false;     // a bubble is mid-fill; controls wait for it
  var chat = null;        // the ONE hint conversation (bubbles accumulate here)
  var shownWhys = {};     // whyWrong messages already spoken — never repeat a bubble

  function setOutcome(o) {
    try {
      frame.dataset.raoOutcome = o;
      (window.__raoOutcomes = window.__raoOutcomes || []).push({ outcome: o, behavior: behavior, ts: Date.now() });
      if (qbody) qbody.dispatchEvent(new CustomEvent("rao:outcome", { bubbles: true, detail: { outcome: o } }));
    } catch (e) { /* recording must never break the card */ }
  }
  function quietChrome(on) {
    [".pv-tlabel", ".pv-ring"].forEach(function (s) {
      var el = frame.querySelector(s);
      if (el) el.classList.toggle("cc-dim", !!on);
    });
  }
  // Freeze the TASK, not its looks: pointer-events + focus go dead, computed
  // colors/opacity stay byte-identical (task-immutability law, guard c).
  function freezeTask(on) { if (qbody) { qbody.inert = !!on; qbody.classList.toggle("cc-locked", !!on); } }
  function hideFoot(on) { if (foot) foot.style.display = on ? "none" : ""; }
  // ── BRIEF-NOTQUITE-1 (RULED 2026-07-24): the instant wrong-attempt signal. ──
  // The pill is CHROME, not task DOM — it lives OUTSIDE .qbody (pinned right
  // after it, ABOVE the hint chat so "the hint below" stays true) and is only
  // ever class/style-toggled, so the no-repaint law is untouched. It cannot
  // use the .pv-fb slot: calmWrong hides the whole .pv-foot (hideFoot(true)),
  // so anything written there is invisible in the feedback state.
  var pillEl = null;
  function showPill(text) {
    if (!pillEl) { pillEl = document.createElement("div"); pillEl.className = "cc-pill"; }
    pillEl.textContent = text;
    pillEl.style.display = "";
    if (qbody) qbody.after(pillEl);   // (re)pin under the question, above the chat
  }
  function hidePill() { if (pillEl) pillEl.style.display = "none"; }
  // ONE gentle shake of the card per wrong Check — class toggle only. The
  // class sheds on animationend, with a timeout fallback because
  // prefers-reduced-motion disables the animation and animationend never fires.
  function shakeCard() {
    var c = frame.querySelector(".pv-card");
    if (!c || c.classList.contains("cc-shake")) return;
    c.classList.add("cc-shake");
    var shed = function () { c.classList.remove("cc-shake"); c.removeEventListener("animationend", shed); };
    c.addEventListener("animationend", shed);
    setTimeout(shed, 600);
  }
  function ensureChat() {
    if (!chat) { chat = bubbles.wrap(null); qbody.after(chat); }
    chat.style.display = "";   // a prior reset may have collapsed an EMPTY chat — re-show it for the incoming bubble
    return chat;
  }
  function removeRow() {
    var rows = frame.querySelectorAll(".cc-actions");
    for (var i = 0; i < rows.length; i++) rows[i].remove();
  }
  function actionRow(defs) {   // defs: [{label, ghost, onTap}]
    removeRow();
    var row = document.createElement("div");
    row.className = "cc-actions";
    defs.forEach(function (d) {
      if (!d) return;
      var b = document.createElement("button");
      b.type = "button";
      b.className = d.ghost ? "cc-btn-ghost" : "cc-btn-solid";
      b.textContent = d.label;
      b.addEventListener("click", function () { if (!typing) d.onTap(); });
      row.appendChild(b);
    });
    var cardEl = frame.querySelector(".pv-card");
    cardEl.insertBefore(row, foot);
    return row;
  }
  function allHintsUsed() { return !rungs || rungIdx >= rungs.length; }
  function canWalk() { return !!(solution && window.RaoSolution && window.RaoSolution.renderWalkthrough); }
  function walkOffered() { return canWalk() && (wrongCount >= 2 || (wrongCount >= 1 && allHintsUsed())); }
  function syncHintBtn() {
    if (!hintBtn) return;
    if (!calm || !rungs) return;   // visibility for the non-calm cases is set below
    if (locked || allHintsUsed()) { hintBtn.style.display = "none"; return; }
    hintBtn.style.display = "";
    hintBtn.textContent = hintNum === 1 ? "Hint" : "Give one more hint";
  }
  function giveHint(then) {
    if (typing || allHintsUsed()) return;
    typing = true;
    var rung = rungs[rungIdx++];
    bubbles.msg(ensureChat(), "Hint " + hintNum++, esc(rung), function () {
      typing = false;
      syncHintBtn();
      if (then) then();
    });
  }

  // ── the feedback-state action row. solidLabel: "Try again" right after a
  //    wrong attempt, "I'll try now" after a hint was given (it closes the
  //    ladder). The bubbles themselves NEVER close (help-accumulates law). ──
  function feedbackRow(solidLabel) {
    actionRow([
      // Same label rule as syncHintBtn: "Hint" until a rung has actually been
      // delivered, "Give one more hint" only after — the label can never
      // promise a rung it has not given (Brief 7.7.2).
      !allHintsUsed() && { label: hintNum === 1 ? "Hint" : "Give one more hint", ghost: true, onTap: function () {
        removeRow();
        giveHint(function () { feedbackRow("I’ll try now"); });
      } },
      walkOffered() && { label: "Show me the solution", ghost: true, onTap: openWalkthrough },
      { label: solidLabel, ghost: false, onTap: resumeAnswering }
    ].filter(Boolean));
  }
  // FR-1 reset: restore the mount-time snapshot and re-attach. attach() is
  // idempotent (it tears down the previous binding first), and everything the
  // card has TOLD the child lives OUTSIDE .qbody — the chat is inserted after
  // it, walkthrough and action rows sit in .pv-card — so help is structurally
  // untouched by the reset (law 4). Attempt counters (wrongCount, hintNum,
  // rungIdx, shownWhys) live in this closure and are deliberately NOT reset.
  function restoreTask() {
    if (!qbody || taskSnap == null || !window.RaoPreview || !window.RaoPreview.attach) return;
    // BRIEF-RETRY-STATE-2 (#88, 2026-07-23): Venkat RULED the typed value IS
    // CLEARED on "Try again" — REVERSES FR-2 ruling 4 ("the typed value is the
    // child's handwriting — NEVER cleared"). An input's typed value never
    // serialises into innerHTML, so restoring the mount snapshot and
    // re-attaching returns every fill-blank to a clean, EMPTY slate. No value is
    // carried across — a deliberate reversal of the old law, not drift.
    qbody.innerHTML = taskSnap;
    window.RaoPreview.attach(qbody, behavior);
  }
  function resumeAnswering() {
    removeRow();
    freezeTask(false);
    hideFoot(false);
    quietChrome(false);
    restoreTask();                   // LAW 3 (FR-1): first-attempt state back
    // Rule 2 + rule 4 (amended 2026-07-23, BRIEF-INTERACTION-CONFORM-1 item 3):
    // "Try again" is a fresh start. HIDE the wrong-answer feedback — the whyWrong
    // panel + its "Not quite" chip (.cc-msg-why) — and clear any residual ✕ / kept
    // marks. This EXTENDS the existing dismiss-on-new-selection path (#111), it
    // does not replace it. The HINT is help the child EARNED: it is a .cc-msg
    // WITHOUT .cc-msg-why, and hideStaleFeedback leaves it visible (law 4 narrowed:
    // hints persist, answer-specific feedback does not). HIDE, never remove.
    hideStaleFeedback();
    fb.className = "pv-fb"; fb.textContent = ""; fb.style.color = "";
    syncHintBtn();
  }

  // ── the whisper (LAW 3 as amended by BRIEF FR-2): a wrong SELECTION gets a
  //    small red ✕ before its text — the ONLY change to it (rulings 1–3:
  //    never on a correct selection, never on an unselected option;
  //    multi-select marks EVERY wrong selection). Runs BEFORE clearSelection
  //    so .is-sel still identifies what the child picked; val is read before
  //    the glyph is inserted so textContent-keyed options stay uncorrupted. ──
  function markWrongSelections() {
    var sel = qbody.querySelectorAll(".opt.is-sel, .opt-fig.is-sel, .hcell.is-sel");
    var ans = (answer || []).map(String);
    for (var i = 0; i < sel.length; i++) {
      var el = sel[i];
      var val = String(el.dataset.val != null ? el.dataset.val : (el.textContent || "").trim());
      if (ans.indexOf(val) !== -1) {
        // rule 18 (RULED 2026-07-23): a correctly-ticked MULTI-select option turns
        // GREEN with a ✓ — the child sees which of their picks were right. This is
        // NOT an answer leak (rule 6): only the child's OWN picks are marked, and a
        // multi-answer question still hides the correct options they did not pick.
        // Single-select never reaches here on a wrong attempt (its only pick is the
        // wrong one), so it keeps the neutral cc-kept edge — §5 greens MULTI ONLY.
        if (behavior === "multi-select") { el.classList.add("cc-right"); ccGlyph(el, "cc-check", "✓"); }
        else el.classList.add("cc-kept");   // rule 12 neutral "you chose this"; unreachable for single-select on a wrong attempt
        continue;
      }
      el.classList.add("cc-tried");
      ccGlyph(el, "cc-x", "✕");
    }
  }
  // Selection returns to rest after marking. Queries .st-apple scene
  //    selects too, which the retired markTried() never did (pre-existing
  //    defect: an apple-scene selection survived a wrong attempt), and
  //    re-syncs the scene count chip. ──
  function clearSelection() {
    var sel = qbody.querySelectorAll(".opt.is-sel, .opt-fig.is-sel, .hcell.is-sel, .st-apple.is-sel");
    for (var i = 0; i < sel.length; i++) sel[i].classList.remove("is-sel");
    var c = qbody.querySelector("[data-st-count]");
    if (c) c.textContent = qbody.querySelectorAll(".st-apple.is-sel").length;
  }
  // BRIEF-RETRY-STATE-2 (#111): the whyWrong panel + its "Not quite" chip are
  // one bubble (.cc-msg-why). HIDE it (display:none), NEVER detach — the
  // no-repaint / append-only law forbids removing panel nodes. Hint bubbles
  // (.cc-msg WITHOUT .cc-msg-why) stay visible — help accumulates (law 4).
  // Also clear any residual prior-attempt whisper marks (✕ / cc-tried); the
  // engine adds and removes those freely, so clearing them is not a repaint.
  function hideStaleFeedback() {
    var whys = frame.querySelectorAll(".cc-msg-why");
    for (var i = 0; i < whys.length; i++) whys[i].style.display = "none";
    // BRIEF-NOTQUITE-1: the pill is answer-specific feedback — it clears with
    // the rest (Try again AND the #111 new-selection path both land here).
    // The shake class normally sheds itself; drop it too for a clean slate.
    hidePill();
    var pc = frame.querySelector(".pv-card.cc-shake");
    if (pc) pc.classList.remove("cc-shake");
    if (qbody) {
      var xs = qbody.querySelectorAll(".cc-x");
      for (var j = 0; j < xs.length; j++) xs[j].remove();
      var tr = qbody.querySelectorAll(".cc-tried");
      for (var k = 0; k < tr.length; k++) tr[k].classList.remove("cc-tried");
      var kp = qbody.querySelectorAll(".cc-kept");   // rule 12's neutral "you picked this" edge clears with the rest of the stale feedback
      for (var m = 0; m < kp.length; m++) kp[m].classList.remove("cc-kept");
      var rt = qbody.querySelectorAll(".cc-right");   // rule 18's green correct-pick edge clears on Try again too (rule 2 — a fresh start)
      for (var r = 0; r < rt.length; r++) rt[r].classList.remove("cc-right");
      var ck = qbody.querySelectorAll(".cc-check");   // and its ✓ glyph
      for (var c2 = 0; c2 < ck.length; c2++) ck[c2].remove();
    }
    // If hiding the whyWrong leaves the chat with NO visible bubble, collapse the
    // empty container so a fresh start is truly the first-arrival state (rule 2) —
    // otherwise an empty tutor box lingers where the "Not quite" panel was. A
    // surviving hint keeps a visible .cc-msg, so the chat stays open for it.
    if (chat) {
      var anyVis = false, msgs = chat.querySelectorAll(".cc-msg");
      for (var c = 0; c < msgs.length; c++) { if (msgs[c].style.display !== "none") { anyVis = true; break; } }
      chat.style.display = anyVis ? "" : "none";
    }
  }
  // The quiet reveal (walkthrough final step): green the correct option(s),
  // nothing else moves. Triumph and rescue must feel different.
  function revealCorrect() {
    if (!isSelect) return;   // non-select: the final step's text IS the reveal
    qbody.querySelectorAll(".opt, .opt-fig, .hcell").forEach(function (o) {
      var val = String(o.dataset.val != null ? o.dataset.val : (o.textContent || "").trim());
      if ((answer || []).map(String).indexOf(val) !== -1) o.classList.add("is-correct");
    });
  }

  // ── WALKTHROUGH — opened by the child's tap OR by the second-wrong
  //    auto-open (FR-2 ruling 7); EITHER path is THE COMMIT POINT (law 6 as
  //    amended): locks immediately, records solved-with-help. ──
  // The panel render is SHARED by two callers that set DIFFERENT outcomes:
  //   openWalkthrough() — help path, locks + records solved-with-help
  //   revealSolution()  — correct path (Change 4), outcome STAYS "correct"
  // The DOM work lives here once so the two callers cannot drift (BRIEF-G3-ENGINE-1
  // Change 4: "extract the rendering into a shared function, set the outcome
  // separately"). It NEVER calls setOutcome — bookkeeping is the caller's.
  function renderSolutionPanel() {
    var cardEl = frame.querySelector(".pv-card");
    var holder = frame.querySelector(".pv-solwrap");
    if (!holder) {
      holder = document.createElement("div");
      holder.className = "pv-solwrap";
      cardEl.insertBefore(holder, foot);
    }
    holder.innerHTML = window.RaoSolution.renderWalkthrough({ explain: explain, solution: solution });
    holder.removeAttribute("hidden");
    window.RaoSolution.wireWalkthrough(holder.querySelector(".sol-walk"), {
      explain: explain, solution: solution,
      onReveal: function () {
        revealCorrect();
        qbody.classList.add("is-checked");     // lets rao.css paint the green
        qbody.classList.add("cc-hastake");     // the walkthrough already taught — no duplicate .explain
      },
      onDone: function () {
        actionRow([{ label: "Next question →", ghost: false, onTap: nextQuestion }]);
      }
    });
  }
  function openWalkthrough() {
    if (locked) return;
    locked = true;
    setOutcome("solved-with-help");     // recorded BEFORE anything renders
    removeRow();
    freezeTask(true);
    hideFoot(true);                     // no Check, no retry — anywhere
    quietChrome(true);
    if (hintBtn) hintBtn.style.display = "none";
    // Change 3 (Item 63, REVERSES law 4): the accumulated hint/whyWrong bubbles
    // CLEAR when the solution opens — the panel becomes the only thing below the
    // question. The chat lives OUTSIDE .qbody, so the question DOM is untouched
    // (no repaint); only the bubble container is removed.
    if (chat) { chat.remove(); chat = null; }
    renderSolutionPanel();
  }
  // Change 4 (Item 65): the correct-answer reveal. The child ALREADY succeeded,
  // so the outcome must STAY "correct" — setOutcome is deliberately NOT called
  // here (that is the whole reason the render was extracted from openWalkthrough,
  // which records solved-with-help). The card is already locked & frozen by
  // celebrate(); this just swaps the action row for the panel.
  function revealSolution() {
    removeRow();
    if (chat) { chat.remove(); chat = null; }
    renderSolutionPanel();
  }
  function nextQuestion() {
    removeRow();
    try { qbody.dispatchEvent(new CustomEvent("rao:next", { bubbles: true })); } catch (e) {}
    var frames = document.querySelectorAll(".pv-frame");
    for (var i = 0; i < frames.length; i++) {
      if (frames[i] === frame && frames[i + 1]) { frames[i + 1].scrollIntoView({ block: "center", behavior: "smooth" }); break; }
    }
  }

  // ── SHOW-ANSWER — the no-dead-end fallback (Item 50). Same COMMIT sequence as
  //    openWalkthrough(), but there is no authored walkthrough to run — so it
  //    reveals the answer, says ONE warm line, and offers Next. NO third attempt.
  //    Venkat's ruling: NEVER fabricate a reason — a plain statement of the
  //    correct answer is honest; an invented "because…" is not. The authored
  //    explain: (if any) is revealed by is-checked, exactly as on a solved card;
  //    nothing is generated. Append-only — the task DOM is never rebuilt. ──
  function showAnswer() {
    if (locked) return;
    locked = true;
    setOutcome("shown-answer");         // DISTINCT from solved-with-help: the child was shown, not helped to solve
    removeRow();
    freezeTask(true);
    hideFoot(true);                     // no Check, no retry — anywhere
    quietChrome(true);
    if (hintBtn) hintBtn.style.display = "none";
    revealCorrect();                    // greens the correct option(s); no-op for non-select (reused, not duplicated)
    qbody.classList.add("is-checked");  // rao.css paints the green AND reveals the authored .explain (if any)
    var cardEl = frame.querySelector(".pv-card");
    var panel = document.createElement("div");
    panel.className = "cc-shown";       // calm, NOT the celebratory green band — rescue must feel unlike triumph
    var html = '<p class="cc-shown-line">Here’s the answer — you’ve got this!</p>';
    // Select is already revealed by revealCorrect(); non-select has no green
    // option, so state the answer plainly (honest — never a fabricated reason).
    if (!isSelect) {
      var a = Array.isArray(answer) ? answer.join(", ") : String(answer);
      html += '<p class="cc-shown-ans"><span class="cc-tag">Answer</span>' + esc(a) + "</p>";
    }
    panel.innerHTML = html;
    cardEl.insertBefore(panel, foot);
    actionRow([{ label: "Next question →", ghost: false, onTap: nextQuestion }]);
  }
  // TWO wrong attempts is the cap on EVERY question. Where a walkthrough exists,
  // open it (unchanged path); where none does, show the answer. No dead ends.
  function commitCap() { if (canWalk()) openWalkthrough(); else showAnswer(); }

  // ── CORRECT — the only loud moment (law 7). ──
  function ding() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      [[659.25, 0], [880, .13]].forEach(function (n) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine"; o.frequency.value = n[0];
        g.gain.setValueAtTime(.001, ctx.currentTime + n[1]);
        g.gain.exponentialRampToValueAtTime(.07, ctx.currentTime + n[1] + .02);
        g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + n[1] + .28);
        o.connect(g).connect(ctx.destination);
        o.start(ctx.currentTime + n[1]); o.stop(ctx.currentTime + n[1] + .3);
      });
    } catch (e) { /* sound is a garnish, never a dependency */ }
  }
  function sparks(el) {
    var COL = ["#10b981", "#7b5cff", "#fbbf24", "#34d399", "#a78bfa", "#fbbf24"];
    el.style.position = "relative";
    for (var i = 0; i < 6; i++) {
      var s = document.createElement("span");
      s.className = "cc-spark";
      var ang = (Math.PI * 2 / 6) * i - Math.PI / 2, r = 46 + Math.random() * 18;
      s.style.setProperty("--sx", Math.round(Math.cos(ang) * r) + "px");
      s.style.setProperty("--sy", Math.round(Math.sin(ang) * r) + "px");
      s.style.background = COL[i];
      el.appendChild(s);
      setTimeout(function (n) { return function () { n.remove(); }; }(s), 900);
    }
  }
  function takeawayText() {
    if (!solution) return null;
    for (var i = 0; i < solution.length; i++) {
      if (solution[i] && solution[i].type === "takeaway" && solution[i].text) return String(solution[i].text);
    }
    return null;
  }
  function celebrate() {
    locked = true;
    setOutcome("correct");
    freezeTask(true);
    hideFoot(true);
    quietChrome(true);
    if (hintBtn) hintBtn.style.display = "none";
    fb.className = "pv-fb"; fb.textContent = "";
    var wins = qbody.querySelectorAll(".opt.is-correct, .opt-fig.is-correct, .hcell.is-correct");
    for (var i = 0; i < wins.length; i++) {
      // The selection paint (.is-sel, brand purple) out-specifies the green
      // .is-correct rule and would silently beat it. The question is locked —
      // the selection state has done its job; drop it so the green wins.
      wins[i].classList.remove("is-sel");
      wins[i].classList.add("cc-win");
      sparks(wins[i]);
    }
    ding();
    // Change 4 (Item 65, REVERSES law 7): nothing to READ by default. The
    // .cc-take panel is GONE — but cc-hastake MUST still be added where a
    // solution exists, because that class is what seals the duplicate .explain
    // (drop it and .explain reappears, swapping one block of text for another and
    // defeating the ruling). Green paint + cc-win + sparks + chime are unchanged:
    // correct is still loud. A ghost "Show me the solution" is offered beside
    // "Next question →" when a solution exists; tapping it renders the full
    // solution and LEAVES the outcome "correct" (revealSolution never re-records).
    if (canWalk()) qbody.classList.add("cc-hastake");
    setTimeout(function () {
      actionRow([
        canWalk() && { label: "Show me the solution", ghost: true, onTap: revealSolution },
        { label: "Next question →", ghost: false, onTap: nextQuestion }
      ].filter(Boolean));
    }, 550);
  }

  // ── WRONG — the whisper (law 3), then the ladder speaks (law 5). ──
  function calmWrong(user) {
    wrongCount++;
    // Every wrong ATTEMPT gets a signal (rao:whywrong below only fires when the
    // option has an authored whyWrong entry). Robo's Layer 1 listens for this.
    try { qbody.dispatchEvent(new CustomEvent("rao:wrong", { bubbles: true })); } catch (e) { /* signal only */ }
    var entry = whyMap ? lookupWhy(qbody, whyMap, answer) : null;
    if (entry && entry.code) {
      try {
        (window.__raoWhyWrongLog = window.__raoWhyWrongLog || []).push({ code: entry.code, ts: Date.now() });
        qbody.dispatchEvent(new CustomEvent("rao:whywrong", { bubbles: true, detail: { code: entry.code } }));
      } catch (e) { /* logging must never break the card */ }
    }
    if (isSelect) { markWrongSelections(); clearSelection(); }       // ✕ on wrong selections (FR-2 rulings 1–3)
    else markFeedback(qbody, behavior, user, answer, false, true);   // wrong marks only — NO green while attemptable
    freezeTask(true);
    hideFoot(true);
    quietChrome(true);
    fb.className = "pv-fb"; fb.textContent = "";   // the foot is hidden in this state; the cc-pill carries the signal (BRIEF-NOTQUITE-1 — the old "the bubble carries it" note is obsolete since WHYWRONG-OFF-1)
    // ── TWO ATTEMPTS IS THE CAP (FR-2 ruling 5, extended by BRIEF-PUBLISH-1
    //    Item 50): the second wrong attempt locks the question and commits —
    //    no Try Again is offered, and no decision is demanded of a child who
    //    has just failed twice. commitCap() routes EVERY question: where a
    //    walkthrough exists it opens (unchanged path, records solved-with-help);
    //    where none does it reveals the answer (records shown-answer). The old
    //    `&& canWalk()` conjunct left the 83% of questions with no solution in
    //    an endless retry loop — that was Item 50, the dead end, now closed.
    //    A fresh whyWrong bubble still types first — help accumulates — then
    //    the commit happens instead of the action row. No green at open
    //    (ruling 6) — the reveal stays at the walkthrough's final step.
    var capped = wrongCount >= 2;
    // BRIEF-NOTQUITE-1 (RULED by Venkat 2026-07-24): the instant signal — pill
    // + one gentle shake, BEFORE any bubble types. Slots: attempt 1 with a
    // hint still to come → playful pool line (rotated, no immediate repeat);
    // attempt 1 with the ladder exhausted (or none authored) → the plain
    // fallback line; attempt 2 with a walkthrough → the doorway line;
    // attempt 2 with NO walkthrough → NO pill (the shown-answer panel carries
    // its own line — a pill here would contradict it).
    var nqPool = NOTQUITE_POOLS[NOTQUITE_GRADE] || NOTQUITE_POOLS["4"];
    var nqText = null;
    if (!capped) nqText = allHintsUsed() ? nqPool.firstNoHint : pickNotquite(nqPool.firstWithHint);
    else if (canWalk()) nqText = nqPool.secondWithWalkthrough;
    if (nqText) showPill(nqText);
    shakeCard();
    // BRIEF-WHYWRONG-OFF-1 (2026-07-24): whyWrong is RULED OFF product-wide.
    // msg stays null, so the bubble branch below never runs and the flow falls
    // through to the proven no-whyWrong path (capped → commitCap, else
    // giveHint, else "Try again") — the path 1,365 questions already take.
    // The rao:whywrong dispatch + __raoWhyWrongLog above are NOT gated.
    var msg = WHYWRONG_VISIBLE && entry && entry.message ? String(entry.message) : null;
    if (msg && !shownWhys[msg]) {
      shownWhys[msg] = true;
      typing = true;
      // Change 2 (Item 66, REVERSES law 5): whyWrong is its OWN stream — chip
      // "Not quite", warning tint, and it does NOT consume a hint number
      // (hintNum untouched), so the next hint the child asks for is still
      // "Hint 1". Calling it "Hint n" is what made two adults misread it as a
      // leaking hint rung; a child would misread it every time.
      var whyBub = bubbles.msg(ensureChat(), "Not quite", esc(msg), function () {
        typing = false;
        if (capped) commitCap();
        else feedbackRow("Try again");
      });
      if (whyBub && whyBub.classList) whyBub.classList.add("cc-msg-why");
    } else if (capped) {
      commitCap();
    } else if (!allHintsUsed() && !typing) {
      // No fresh whyWrong (none authored — every non-select and the legacy
      // selects — or this option's message was already spoken): the wrong
      // feedback still delivers Hint 1, by typing the NEXT FORWARD RUNG
      // through the one existing hint path (Brief 7.7.2, Law 5). Same typing,
      // same chip, numbering adapts exactly as the ladder already does.
      giveHint(function () { feedbackRow("Try again"); });
    } else {
      // ladder exhausted (or a bubble is mid-type): the row alone carries it
      feedbackRow("Try again");
    }
  }

  // ══════════ hint button wiring ══════════
  if (hintBtn) {
    if (!rungs || mode !== "adaptive") hintBtn.style.display = "none";
    else if (calm) {
      syncHintBtn();
      // A pre-attempt Hint press starts the ladder at the first forward hint;
      // the child keeps answering — nothing disables, nothing is a verdict.
      hintBtn.addEventListener("click", function () { if (!locked) giveHint(); });
    } else if (rungs.length === 1) {
      // legacy single hint (degraded mode, solution-renderer.js absent)
      var hint = rungs[0];
      hintBtn.addEventListener("click", function () {
        if (hintBox.hasAttribute("hidden")) { hintBox.textContent = "💡 " + hint; hintBox.removeAttribute("hidden"); hintBtn.textContent = "Hide hint"; }
        else { hintBox.setAttribute("hidden", ""); hintBtn.textContent = "Hint"; }
      });
    } else {
      // legacy ladder (degraded mode)
      var revealed = 0;
      var addRung = function () {
        var d = document.createElement("div");
        d.className = "pv-rung";
        d.textContent = "💡 " + rungs[revealed];
        hintBox.appendChild(d);
        revealed++;
      };
      var syncLabel = function () {
        hintBtn.textContent = hintBox.hasAttribute("hidden")
          ? (revealed === 0 ? "Hint" : "Show hints")
          : (revealed < rungs.length ? "Another hint (" + revealed + "/" + rungs.length + ")" : "Hide hints");
      };
      hintBtn.addEventListener("click", function () {
        if (hintBox.hasAttribute("hidden")) {
          hintBox.removeAttribute("hidden");
          if (revealed === 0) addRung();
        } else if (revealed < rungs.length) {
          addRung();
        } else {
          hintBox.setAttribute("hidden", "");
        }
        syncLabel();
      });
    }
  }

  // ══════════ Check ══════════
  if (checkBtn) checkBtn.addEventListener("click", function () {
    if (locked) return;
    if (isSelect && !qbody.querySelector(".is-sel")) {
      fb.className = "pv-fb"; fb.textContent = "✋ Answer it first"; fb.style.color = "#b58900"; return;
    }
    var user = window.RaoPreview.serialize(qbody, behavior);
    if (user == null) { fb.className = "pv-fb"; fb.textContent = "✋ Answer it first"; fb.style.color = "#b58900"; return; }
    fb.style.color = "";
    var ok = window.RaoPreview.check(behavior, user, answer);

    if (calm) {
      if (ok) {
        markFeedback(qbody, behavior, user, answer, true, false);
        qbody.classList.add("is-checked");
        celebrate();
      } else {
        calmWrong(user);   // never is-checked while attemptable — .explain stays sealed (law 2)
      }
      return;
    }

    // ── rapid / quiz / degraded-adaptive path ──
    fb.className = "pv-fb " + (ok ? "good" : "bad");
    fb.innerHTML = '<span class="pv-fb-ic">' + (ok ? "🎉" : "🤔") + "</span>" + (ok ? "Correct!" : "Not quite");
    markFeedback(qbody, behavior, user, answer, ok, !ok && mode === "adaptive");
    // The reveal hook: rapid shows its one-liner after the (single) attempt;
    // degraded-adaptive only reveals after a CORRECT answer — never while the
    // child can still retry (law 2 holds even without the calm chrome).
    if (qbody && (ok || mode === "rapid")) qbody.classList.add("is-checked");

    if (ok) { hidePanels(frame); return; }
    var entry = whyMap ? lookupWhy(qbody, whyMap, answer) : null;
    if (entry && entry.code && mode !== "quiz") {
      try {
        (window.__raoWhyWrongLog = window.__raoWhyWrongLog || []).push({ code: entry.code, ts: Date.now() });
        qbody.dispatchEvent(new CustomEvent("rao:whywrong", { bubbles: true, detail: { code: entry.code } }));
      } catch (e) { /* logging must never break the card */ }
    }
    // BRIEF-WHYWRONG-OFF-1 (2026-07-24): degraded-path panel gated the same way.
    if (WHYWRONG_VISIBLE && mode === "adaptive") showWhyPanel(frame, entry);
  });
}

/* ── degraded-mode panel (solution-renderer.js absent): the whyWrong line
      still shows, but there is no walkthrough — the calm path owns that. ── */
function lookupWhy(qbody, whyMap, answer) {
  var ans = (answer || []).map(String);
  var sel = qbody.querySelectorAll(".opt.is-sel, .opt-fig.is-sel, .hcell.is-sel");
  for (var i = 0; i < sel.length; i++) {
    var val = String(sel[i].dataset.val != null ? sel[i].dataset.val : (sel[i].textContent || "").trim());
    if (ans.indexOf(val) === -1 && whyMap[val]) return whyMap[val];
  }
  return null;
}
function hidePanels(frame) {
  var w = frame.querySelector(".pv-why"); if (w) w.setAttribute("hidden", "");
  var s = frame.querySelector(".pv-solwrap"); if (s) s.setAttribute("hidden", "");
}
function showWhyPanel(frame, entry) {
  if (!entry || !entry.message) return;
  var cardEl = frame.querySelector(".pv-card"), foot = frame.querySelector(".pv-foot");
  var panel = frame.querySelector(".pv-why");
  if (!panel) {
    panel = document.createElement("div");
    panel.className = "pv-why";
    cardEl.insertBefore(panel, foot);
  }
  panel.innerHTML = "";
  panel.removeAttribute("hidden");
  var m = document.createElement("div");
  m.className = "pv-why-msg";
  m.textContent = entry.message;
  panel.appendChild(m);
}

/* Per-option feedback. The engine grades but never touches the DOM ("CSS decides — not the
   engine"), so the wiring applies the state classes rao.css already styles. We mark what the
   child entered — and NEVER paint the correct answer on a wrong attempt: while the question
   is attemptable there is no green anywhere (Brief 7.6, law 2). `noGreen` suppresses the
   per-input green marks on a wrong adaptive attempt for the same reason. */
var FB_STATES = ["is-correct", "is-wrong", "correct", "incorrect", "tile-wrong", "cc-right"];
// ONE inserter for the per-option glyphs — the red ✕ on a wrong pick and the
// green ✓ on a correct one (rule 18). Same placement, so tick and cross sit
// identically. Used by BOTH the calm path (markWrongSelections) and the
// degraded/review path (markFeedback), so the two can never drift.
function ccGlyph(el, cls, ch) {
  if (el.querySelector("." + cls)) return;
  var g = document.createElement("span");
  g.className = cls;
  g.textContent = ch;
  var txt = el.querySelector(".opt-text");
  if (txt) txt.insertBefore(g, txt.firstChild);
  else {
    var ind = el.querySelector(".check-ind");
    if (ind && ind.nextSibling) el.insertBefore(g, ind.nextSibling);
    else el.insertBefore(g, el.firstChild);
  }
}
function clearFeedback(qbody) {
  qbody.querySelectorAll(".is-correct, .is-wrong, .correct, .incorrect, .tile-wrong, .cc-right").forEach(function (el) {
    el.classList.remove.apply(el.classList, FB_STATES);
  });
  // the rule-18 ✓ glyph is a real node (like the ✕) — drop it on a re-mark
  qbody.querySelectorAll(".cc-check").forEach(function (g) { g.remove(); });
}
// rule 14: on a WRONG ordering/sorting answer, mark WHICH tiles are out of place.
// Display-only: compare each slot's placed tile value to the key at that position.
// Recolours in place — nothing moves, nothing greens — so the correct order is
// NOT revealed (rule 6 holds while an attempt remains). A tile whose value matches
// the key at its slot stays at rest.
function markMisplaced(qbody, slotSel, tileSel, ans) {
  var slots = qbody.querySelectorAll(slotSel);
  for (var i = 0; i < slots.length; i++) {
    var t = slots[i].querySelector(tileSel);
    if (t && String(t.dataset.val) !== ans[i]) t.classList.add("tile-wrong");
  }
}
function markFeedback(qbody, behavior, user, answer, ok, noGreen) {
  clearFeedback(qbody);                       // idempotent — a re-check re-marks cleanly
  var ans = (answer || []).map(String);
  var u = (user || []).map(String);
  // ONE source of truth for "is this field right": ask the GRADER, per field,
  // instead of keeping a second copy of its normalisation here. Before this,
  // fill-blanks compared raw strings and expression stripped only whitespace — so
  // a child graded CORRECT for "42,613" / "1,00,000" / "16+31=47" still saw a red
  // box (rules 10, 12). check() already knows comma/Indian grouping and
  // commutative addition; consulting it means the painter can never drift from it
  // (BRIEF-INTERACTION-CONFORM-1 item 1: do NOT duplicate the grader's logic).
  var grade1 = function (b, uv, av) {
    try {
      if (window.RaoPreview && typeof window.RaoPreview.check === "function")
        return !!window.RaoPreview.check(b, [uv], [av]);
    } catch (e) { /* fall through to exact match */ }
    return String(uv) === String(av);
  };

  if (behavior === "single-select" || behavior === "multi-select") {
    qbody.querySelectorAll(".opt, .opt-fig, .hcell").forEach(function (o) {
      var val = String(o.dataset.val != null ? o.dataset.val : (o.textContent || "").trim());
      var chosen = o.classList.contains("is-sel");
      var right = ans.indexOf(val) !== -1;
      if (chosen) {
        if (right) {
          // rule 18: a ticked-correct MULTI-select option is GREEN + ✓ even on a
          // wrong (attemptable) attempt. is-correct is neutralised to brand while
          // the card is not is-checked, so cc-right (a dedicated class the
          // neutraliser does not touch) paints the green. Single-select is reached
          // here only on a CORRECT answer, where the plain is-correct green is due.
          if (behavior === "multi-select" && noGreen) { o.classList.add("cc-right"); ccGlyph(o, "cc-check", "✓"); }
          else if (!noGreen) o.classList.add("is-correct");
        } else o.classList.add("is-wrong");
      }
      // NEVER mark an unchosen correct option — that was the answer leak.
    });
    return;
  }
  if (behavior === "fill-blanks") {
    qbody.querySelectorAll(".blank-input").forEach(function (inp, i) {
      var right = grade1(behavior, u[i], ans[i]);
      if (right && !noGreen) inp.classList.add("correct");
      else if (!right) inp.classList.add("incorrect");
    });
    return;
  }
  if (behavior === "lattice") {
    qbody.querySelectorAll(".lat-in").forEach(function (inp, i) {
      var right = u[i] === ans[i];
      if (right && !noGreen) inp.classList.add("correct");
      else if (!right) inp.classList.add("incorrect");
    });
    return;
  }
  if (behavior === "expression") {
    qbody.querySelectorAll(".ans-input").forEach(function (inp, i) {
      var right = grade1(behavior, u[i], ans[i] || "");
      if (right && !noGreen) inp.classList.add("correct");
      else if (!right) inp.classList.add("incorrect");
    });
    return;
  }
  if (behavior === "order") {
    var os = qbody.querySelector(".order-slots"); if (os) os.classList.add(ok ? "correct" : "incorrect");
    if (!ok) markMisplaced(qbody, ".order-slot", ".tile", ans);   // rule 14
    return;
  }
  if (behavior === "sequence-build") {
    var ss = qbody.querySelector(".sb-slots"); if (ss) ss.classList.add(ok ? "correct" : "incorrect");
    if (!ok) markMisplaced(qbody, ".sb-slot", ".sb-tile", ans);   // rule 14
    return;
  }
  if (behavior === "categorize") {
    // rule 14 extended to categorize (RULED 2026-07-23): on a wrong sort, mark each
    // tile that is in the WRONG bin with the same soft red edge (.tile-wrong).
    // IDENTITY-based, matching the grader: the tile with data-idx=i is judged
    // against ans[i] — the region it should be in — NOT its tray position. Nothing
    // moves, nothing greens, the correct grouping is NOT revealed (rule 6). A tile
    // in the right bin is left at rest.
    if (!ok) qbody.querySelectorAll(".vs-tile[data-idx]").forEach(function (t) {
      var idx = Number(t.dataset.idx);
      var zone = t.closest(".vs-zone");
      var region = zone ? zone.dataset.region : null;
      if (region !== ans[idx]) t.classList.add("tile-wrong");
    });
    return;
  }
  // line-plot / time / bar-graph / construct: no per-option state exists in
  // rao.css — pill + answer line only. See DEVELOPER-BRIEF.md ("Per-option feedback gaps").
}
(function(){
  var preview = document.getElementById('preview');
  if(!preview) return;
  if(!window.RaoPreview || !window.RaoPreview.build){ preview.innerHTML = '<p style="color:#c00">Preview engine not loaded — make sure preview-engine.js is in the project files and try again.</p>'; return; }
  var qs = window.RaoPreview.build(document.getElementById('source').innerHTML);
  qs.forEach(function(q,i){ preview.insertAdjacentHTML('beforeend', card(q.markup, q.behavior, q.answer, q.hint, i+1, qs.length, { whyWrong: q.whyWrong, solution: q.solution })); });
  document.querySelectorAll('.pv-frame').forEach(wireCard);
})();
