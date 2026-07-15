/* ============================================================================
   rao-card.js — THE CARD RENDERER. A real shared asset, exactly like rao-card.css.

   Turns an engine-built question ({markup, behavior, answer, hint}) into a full
   student card: the gradient .pv-frame, the .pv-head progress ring, the question
   body, the hint panel, and the [Hint] … [Check ✓] footer — then wires Hint/Check.

   This used to be baked into every lesson file and SCRAPED out of a reference
   lesson by make-review. Now the lessons are content-only (just their #source),
   so the renderer lives here — one copy, shared by the app and by the review
   builder. There is nothing left to drift from.

   The trailing IIFE mounts every question in #source into #preview; it is the
   same standalone harness the lessons carried before. The app can load this file
   and call card()/wireCard() itself, or keep its own mount.
   ========================================================================== */
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; });
}
function escAttr(s) { return esc(s).replace(/"/g, "&quot;"); }
function card(inner, behavior, answer, hint, i, n, extra) {
  // hint may be a legacy string (unchanged) or a rao-master-15 ladder (array of
  // 1-3 rungs, JSON-encoded into the same attribute). extra carries whyWrong /
  // solution when the question authors them; legacy questions emit NO new attrs,
  // so their card markup is byte-identical to rao-master-14.
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
        '<span class="pv-fb"></span><button class="pv-check" type="button">Check ✓</button></div>' +
    "</div></div>" +
    '<div class="pv-ans">✓ Answer: <b>' + esc(Array.isArray(answer) ? answer.join(", ") : answer) + "</b></div>"
  );
}
function wireCard(frame) {
  var qbody = frame.querySelector(".qbody");
  var behavior = frame.dataset.behavior;
  var answer; try { answer = JSON.parse(frame.dataset.answer || "null"); } catch (e) { answer = null; }
  if (qbody && window.RaoPreview && window.RaoPreview.attach) window.RaoPreview.attach(qbody, behavior);
  // BUG 4 — arm the three-mode reveal. rao.css hides `.explain` by default and only
  // un-hides it via `[data-mode="…"].is-checked .explain`, but nothing ever set those
  // hooks, so every explanation was written, emitted, styled — and permanently invisible.
  // The compound selector needs data-mode AND is-checked on the SAME element (an ancestor
  // of `.explain`); `.qbody` is that element. Default to "adaptive" (answer → Check →
  // teaching); the app may pre-set data-mode on the qbody to pick rapid/quiz instead.
  if (qbody && !qbody.hasAttribute("data-mode")) qbody.setAttribute("data-mode", "adaptive");
  // MODE (§13.8): adaptive = full ladder · rapid = one-line explain + code log,
  // no hints, no whyWrong prose, no walkthrough · quiz = nothing during (the app
  // renders walkthroughs on its post-submit review screen via RaoSolution).
  var mode = (qbody && qbody.getAttribute("data-mode")) || "adaptive";

  // ── Tier 0: the hint ladder. A legacy string behaves EXACTLY as before
  //    (one rung, show/hide toggle). A ladder reveals one rung per tap,
  //    stacking; rungs stay visible. Hints exist only in adaptive mode.
  var hintBtn = frame.querySelector(".pv-hint"), hintBox = frame.querySelector(".pv-hintbox"), hintRaw = frame.dataset.hint;
  var rungs = null;
  if (hintRaw) {
    if (hintRaw.charAt(0) === "[") {
      try { var parsed = JSON.parse(hintRaw); if (Array.isArray(parsed) && parsed.length) rungs = parsed.map(String); } catch (e) { /* fall through: treat as string */ }
    }
    if (!rungs) rungs = [hintRaw];
  }
  if (hintBtn) {
    if (!rungs || mode !== "adaptive") hintBtn.style.display = "none";
    else if (rungs.length === 1) {
      var hint = rungs[0];
      hintBtn.addEventListener("click", function () {
        if (hintBox.hasAttribute("hidden")) { hintBox.textContent = "💡 " + hint; hintBox.removeAttribute("hidden"); hintBtn.textContent = "Hide hint"; }
        else { hintBox.setAttribute("hidden", ""); hintBtn.textContent = "Hint"; }
      });
    } else {
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

  // ── Tier 1 + Tier 2 data (absent on legacy questions) ──
  var whyMap = null, solution = null;
  try { if (frame.dataset.why) whyMap = JSON.parse(frame.dataset.why); } catch (e) { whyMap = null; }
  try { if (frame.dataset.solution) solution = JSON.parse(frame.dataset.solution); } catch (e) { solution = null; }

  var checkBtn = frame.querySelector(".pv-check"), fb = frame.querySelector(".pv-fb");
  var resetCard = function () {
    // The walkthrough's "I've got it — let me try again" bail-out. Unlocks the
    // card but KEEPS the child's answer so they can change it, not restart.
    clearFeedback(qbody);
    qbody.classList.remove("is-checked");
    fb.className = "pv-fb"; fb.textContent = ""; fb.style.color = "";
    hidePanels(frame);
  };
  if (checkBtn) checkBtn.addEventListener("click", function () {
    var user = window.RaoPreview.serialize(qbody, behavior);
    if (user == null) { fb.className = "pv-fb"; fb.textContent = "✋ Answer it first"; fb.style.color = "#b58900"; return; }
    var ok = window.RaoPreview.check(behavior, user, answer);
    // pill feedback: big emoji + coloured message on a soft good/bad pill.
    // 🤔 (thinking face) for wrong — a celebratory/flexing gesture would contradict
    // "Not quite". 🎉 for correct.
    fb.style.color = "";
    fb.className = "pv-fb " + (ok ? "good" : "bad");
    fb.innerHTML = '<span class="pv-fb-ic">' + (ok ? "🎉" : "🤔") + "</span>" + (ok ? "Correct!" : "Not quite");
    // Per-OPTION feedback — mark what the child chose, NOT the whole card. Colouring the
    // whole card is wrong: the card wasn't wrong, the option was. (No cardEl.style.boxShadow.)
    markFeedback(qbody, behavior, user, answer, ok);
    // BUG 4 — flip the reveal hook. In adaptive mode this un-hides `.explain` (the
    // teaching), and lets rao.css switch options from the pre-check neutral look to the
    // green/red verdict. Same element as data-mode; set synchronously with markFeedback so
    // there is never a painted frame with is-correct but not is-checked.
    if (qbody) qbody.classList.add("is-checked");

    if (ok) { hidePanels(frame); return; }
    // ── Tier 1: whyWrong — one line about the OPTION they chose.
    var entry = whyMap ? lookupWhy(qbody, whyMap, answer) : null;
    // Log the misconception code (adaptive + rapid — §13.8; quiz shows nothing during).
    if (entry && entry.code && mode !== "quiz") {
      try {
        (window.__raoWhyWrongLog = window.__raoWhyWrongLog || []).push({ code: entry.code, ts: Date.now() });
        qbody.dispatchEvent(new CustomEvent("rao:whywrong", { bubbles: true, detail: { code: entry.code } }));
      } catch (e) { /* logging must never break the card */ }
    }
    // The visible ladder lives in adaptive mode only.
    if (mode === "adaptive") showWhyPanel(frame, entry, solution, resetCard);
  });
}

/* ── Tier 1/2 panels — created on demand so legacy cards keep byte-identical
      static markup. The whyWrong line describes the option; "Show me" opens the
      walkthrough (Tier 2), rendered and wired by window.RaoSolution (the
      solution renderer — display-only, on the far side of the grading
      firewall). Cards degrade gracefully when solution-renderer.js isn't
      loaded: no Show me button, everything else works. */
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
function showWhyPanel(frame, entry, solution, onReset) {
  var canWalk = solution && window.RaoSolution && window.RaoSolution.renderWalkthrough;
  if (!entry && !canWalk) return;
  var cardEl = frame.querySelector(".pv-card"), foot = frame.querySelector(".pv-foot");
  var panel = frame.querySelector(".pv-why");
  if (!panel) {
    panel = document.createElement("div");
    panel.className = "pv-why";
    cardEl.insertBefore(panel, foot);
  }
  panel.innerHTML = "";
  panel.removeAttribute("hidden");
  if (entry && entry.message) {
    var m = document.createElement("div");
    m.className = "pv-why-msg";
    m.textContent = entry.message;
    panel.appendChild(m);
  }
  if (canWalk) {
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "pv-showme"; btn.textContent = "Show me";
    panel.appendChild(btn);
    btn.addEventListener("click", function () {
      btn.setAttribute("hidden", "");
      openWalkthrough(frame, solution, onReset);
    });
  }
}
function openWalkthrough(frame, solution, onReset) {
  var cardEl = frame.querySelector(".pv-card"), foot = frame.querySelector(".pv-foot");
  var holder = frame.querySelector(".pv-solwrap");
  if (!holder) {
    holder = document.createElement("div");
    holder.className = "pv-solwrap";
    cardEl.insertBefore(holder, foot);
  }
  holder.innerHTML = window.RaoSolution.renderWalkthrough({ solution: solution });
  holder.removeAttribute("hidden");
  window.RaoSolution.wireWalkthrough(holder.querySelector(".sol-walk"), { onRetry: onReset });
}

/* Per-option feedback. The engine grades but never touches the DOM ("CSS decides — not the
   engine"), so the wiring applies the state classes rao.css already styles. We mark the
   OPTION the child chose and, when wrong, reveal the correct one — the card is left alone.
   Types with NO per-option state in rao.css (categorize, line-plot, time, bar-graph) get
   the pill + answer line only; we do not fabricate classes rao.css doesn't paint. */
var FB_STATES = ["is-correct", "is-wrong", "correct", "incorrect"];
function clearFeedback(qbody) {
  qbody.querySelectorAll(".is-correct, .is-wrong, .correct, .incorrect").forEach(function (el) {
    el.classList.remove.apply(el.classList, FB_STATES);
  });
}
function markFeedback(qbody, behavior, user, answer, ok) {
  clearFeedback(qbody);                       // idempotent — a re-check re-marks cleanly
  var ans = (answer || []).map(String);
  var u = (user || []).map(String);
  var norm = function (s) { return String(s).replace(/\s+/g, "").toLowerCase(); };

  if (behavior === "single-select" || behavior === "multi-select") {
    qbody.querySelectorAll(".opt, .opt-fig, .hcell").forEach(function (o) {
      var val = String(o.dataset.val != null ? o.dataset.val : (o.textContent || "").trim());
      var chosen = o.classList.contains("is-sel");
      var right = ans.indexOf(val) !== -1;
      if (chosen) o.classList.add(right ? "is-correct" : "is-wrong");
      else if (!ok && right) o.classList.add("is-correct");   // reveal the right answer
    });
    return;
  }
  if (behavior === "fill-blanks") {
    qbody.querySelectorAll(".blank-input").forEach(function (inp, i) {
      inp.classList.add(u[i] === ans[i] ? "correct" : "incorrect");
    });
    return;
  }
  if (behavior === "lattice") {
    qbody.querySelectorAll(".lat-in").forEach(function (inp, i) {
      inp.classList.add(u[i] === ans[i] ? "correct" : "incorrect");
    });
    return;
  }
  if (behavior === "expression") {
    qbody.querySelectorAll(".ans-input").forEach(function (inp, i) {
      inp.classList.add(norm(u[i]) === norm(ans[i] || "") ? "correct" : "incorrect");
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
