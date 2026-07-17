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
     3. WRONG IS A WHISPER — the tried option gets a small red ✕ glyph before
        its text (persists for the life of the question) and NOTHING else. No
        is-wrong red flood, no shake, no "Not quite" pill in adaptive mode.
     4. HELP ACCUMULATES — hint bubbles and walkthrough steps only ever stack;
        nothing the card has told the child disappears while the question lives.
     5. ONE HINT LADDER — the whyWrong message after a wrong attempt IS the next
        hint rung ("Hint 1", "Hint 2", … — never "of N"). Presentation: typed
        tutor bubbles (RaoSolution.bubbles — ONE copy, shared with the steps).
     6. WALKTHROUGH commit — "Walk me through it" appears after the SECOND wrong
        attempt OR when all hints are used, never before the first attempt.
        Opening it LOCKS the question and records solved-with-help. No retry
        inside. Final step reveals quietly — triumph ≠ rescue.
     7. CORRECT is the only loud moment: green option + cc-win + sparks + chime,
        takeaway panel ("The idea to keep"), then "Next question →".
     8. MODES — adaptive: all of the above. rapid: verdict flash + one-line
        explain + code log only. quiz: nothing during; review is the app's job.

   The app can load this file and call card()/wireCard() itself, or keep its
   own mount. The trailing IIFE mounts every question in #source into #preview.
   ========================================================================== */
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
  if (qbody && window.RaoPreview && window.RaoPreview.attach) window.RaoPreview.attach(qbody, behavior);
  // The compound reveal selector needs data-mode AND is-checked on the SAME
  // element (an ancestor of `.explain`); `.qbody` is that element. Default to
  // "adaptive"; the app may pre-set data-mode on the qbody to pick rapid/quiz.
  if (qbody && !qbody.hasAttribute("data-mode")) qbody.setAttribute("data-mode", "adaptive");
  var mode = (qbody && qbody.getAttribute("data-mode")) || "adaptive";

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
  function ensureChat() {
    if (!chat) { chat = bubbles.wrap(null); qbody.after(chat); }
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
      walkOffered() && { label: "Walk me through it", ghost: true, onTap: openWalkthrough },
      { label: solidLabel, ghost: false, onTap: resumeAnswering }
    ].filter(Boolean));
  }
  function resumeAnswering() {
    removeRow();
    freezeTask(false);
    hideFoot(false);
    quietChrome(false);
    clearFeedback(qbody);            // input verdict marks go; ✕ and bubbles STAY
    fb.className = "pv-fb"; fb.textContent = ""; fb.style.color = "";
    syncHintBtn();
  }

  // ── the whisper: mark the attempt with a small ✕, return options to their
  //    resting look (is-sel comes off — the ✕ is the ONLY change, law 3). ──
  function markTried() {
    var sel = qbody.querySelectorAll(".opt.is-sel, .opt-fig.is-sel, .hcell.is-sel");
    for (var i = 0; i < sel.length; i++) {
      var el = sel[i];
      el.classList.add("cc-tried");
      el.classList.remove("is-sel");
      if (!el.querySelector(".cc-x")) {
        var x = document.createElement("span");
        x.className = "cc-x";
        x.textContent = "✕";
        var txt = el.querySelector(".opt-text");
        if (txt) txt.insertBefore(x, txt.firstChild);
        else {
          var ind = el.querySelector(".check-ind");
          if (ind && ind.nextSibling) el.insertBefore(x, ind.nextSibling);
          else el.insertBefore(x, el.firstChild);
        }
      }
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

  // ── WALKTHROUGH — child-initiated, and THE COMMIT POINT (law 6). ──
  function openWalkthrough() {
    if (locked) return;
    locked = true;
    setOutcome("solved-with-help");     // recorded BEFORE anything renders
    removeRow();
    freezeTask(true);
    hideFoot(true);                     // no Check, no retry — anywhere
    quietChrome(true);
    if (hintBtn) hintBtn.style.display = "none";
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
  function nextQuestion() {
    removeRow();
    try { qbody.dispatchEvent(new CustomEvent("rao:next", { bubbles: true })); } catch (e) {}
    var frames = document.querySelectorAll(".pv-frame");
    for (var i = 0; i < frames.length; i++) {
      if (frames[i] === frame && frames[i + 1]) { frames[i + 1].scrollIntoView({ block: "center", behavior: "smooth" }); break; }
    }
  }

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
    var take = takeawayText();
    setTimeout(function () {
      if (take) {
        var cardEl = frame.querySelector(".pv-card");
        var p = document.createElement("div");
        p.className = "cc-take";
        p.innerHTML = '<p><span class="cc-tag">The idea to keep</span>' + esc(take) + "</p>";
        cardEl.insertBefore(p, foot);
        qbody.classList.add("cc-hastake");   // the panel carries the teaching — hide the duplicate .explain
      }
      actionRow([{ label: "Next question →", ghost: false, onTap: nextQuestion }]);
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
    if (isSelect) markTried();
    else markFeedback(qbody, behavior, user, answer, false, true);   // wrong marks only — NO green while attemptable
    freezeTask(true);
    hideFoot(true);
    quietChrome(true);
    fb.className = "pv-fb"; fb.textContent = "";   // no "Not quite" — the ✕ and the bubble carry it
    var msg = entry && entry.message ? String(entry.message) : null;
    if (msg && !shownWhys[msg]) {
      shownWhys[msg] = true;
      typing = true;
      bubbles.msg(ensureChat(), "Hint " + hintNum++, esc(msg), function () {
        typing = false;
        feedbackRow("Try again");
      });
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
    if (mode === "adaptive") showWhyPanel(frame, entry);
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
var FB_STATES = ["is-correct", "is-wrong", "correct", "incorrect"];
function clearFeedback(qbody) {
  qbody.querySelectorAll(".is-correct, .is-wrong, .correct, .incorrect").forEach(function (el) {
    el.classList.remove.apply(el.classList, FB_STATES);
  });
}
function markFeedback(qbody, behavior, user, answer, ok, noGreen) {
  clearFeedback(qbody);                       // idempotent — a re-check re-marks cleanly
  var ans = (answer || []).map(String);
  var u = (user || []).map(String);
  var norm = function (s) { return String(s).replace(/\s+/g, "").toLowerCase(); };

  if (behavior === "single-select" || behavior === "multi-select") {
    qbody.querySelectorAll(".opt, .opt-fig, .hcell").forEach(function (o) {
      var val = String(o.dataset.val != null ? o.dataset.val : (o.textContent || "").trim());
      var chosen = o.classList.contains("is-sel");
      var right = ans.indexOf(val) !== -1;
      if (chosen) {
        if (right && !noGreen) o.classList.add("is-correct");
        else if (!right) o.classList.add("is-wrong");
      }
      // NEVER mark an unchosen correct option — that was the answer leak.
    });
    return;
  }
  if (behavior === "fill-blanks") {
    qbody.querySelectorAll(".blank-input").forEach(function (inp, i) {
      var right = u[i] === ans[i];
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
      var right = norm(u[i]) === norm(ans[i] || "");
      if (right && !noGreen) inp.classList.add("correct");
      else if (!right) inp.classList.add("incorrect");
    });
    return;
  }
  if (behavior === "order") {
    var os = qbody.querySelector(".order-slots"); if (os) os.classList.add(ok ? "correct" : "incorrect");
    return;
  }
  if (behavior === "sequence-build") {
    var ss = qbody.querySelector(".sb-slots"); if (ss) ss.classList.add(ok ? "correct" : "incorrect");
    return;
  }
  // categorize / line-plot / time / bar-graph / construct: no per-option state exists in
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
