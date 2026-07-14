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
function card(inner, behavior, answer, hint, i, n) {
  return (
    '<div class="pv-frame" data-behavior="' + escAttr(behavior) + '" data-answer="' + escAttr(JSON.stringify(answer)) + '"' +
      (hint ? ' data-hint="' + escAttr(hint) + '"' : "") + '><div class="pv-card">' +
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
  var hintBtn = frame.querySelector(".pv-hint"), hintBox = frame.querySelector(".pv-hintbox"), hint = frame.dataset.hint;
  if (hintBtn) {
    if (!hint) hintBtn.style.display = "none";
    else hintBtn.addEventListener("click", function () {
      if (hintBox.hasAttribute("hidden")) { hintBox.textContent = "💡 " + hint; hintBox.removeAttribute("hidden"); hintBtn.textContent = "Hide hint"; }
      else { hintBox.setAttribute("hidden", ""); hintBtn.textContent = "Hint"; }
    });
  }
  var checkBtn = frame.querySelector(".pv-check"), fb = frame.querySelector(".pv-fb");
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
  });
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
  qs.forEach(function(q,i){ preview.insertAdjacentHTML('beforeend', card(q.markup, q.behavior, q.answer, q.hint, i+1, qs.length)); });
  document.querySelectorAll('.pv-frame').forEach(wireCard);
})();
