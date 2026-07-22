/* ── Solution Renderer — pure display, no grading ──
 *
 * This module renders solution walkthroughs, hints, and whyWrong messages.
 * It is a PURE CONSUMER of an immutable grading result.
 *
 * FIREWALL RULES (enforced by tools/verify-firewall.js):
 *   - Must NOT import or reference the grading module (preview-engine.js)
 *   - Must NOT call check()
 *   - Must NOT mutate the stored answer or student response
 *   - Must NOT modify grading files
 *
 * ONE PARSE POINT: normalizeExplain() is the single entry. Downstream code
 * never sees the raw explain string or the raw solution array — only the
 * normalized object. A legacy string explain normalizes to a single-block
 * list so the renderer has no idea the old format ever existed.
 */

"use strict";

// ════════════════════════════════════════════════════════════════
// normalizeExplain — THE SINGLE PARSE POINT
//
// Input:  { explain, solution }  from the engine's build() output
//   explain  — string (legacy one-liner) or null
//   solution — array of block objects, or null/undefined
//
// Output: { legacy: bool, explain: string|null, blocks: [] }
//   legacy  — true when the output came from a plain string explain
//   explain — the original string (preserved for Rapid Fire / fallback)
//   blocks  — normalized block list, always an array
//
// A legacy string becomes a single block of type "legacy-explain" so
// the renderer can emit the exact same HTML the engine has always emitted.
// ════════════════════════════════════════════════════════════════

function normalizeExplain(opts) {
  var explain = (opts && opts.explain) || null;
  var solution = (opts && opts.solution) || null;

  // Full solution path: solution blocks + explain as fallback/summary
  if (Array.isArray(solution) && solution.length > 0) {
    return {
      legacy: false,
      explain: explain,
      blocks: solution.map(function (b) {
        // Validate known types; unknown types get a text fallback
        var type = String(b.type || "unknown");
        return {
          type: type,
          goal: b.goal || null,
          working: b.working || null,
          reason: b.reason || null,
          text: b.text || null,
          html: b.html || null,
          // Change 5 (BRIEF-G3-ENGINE-1) — table / facts / rule fields. Products
          // are NEVER carried here: the renderer computes a × b itself, so a
          // typo'd (or malicious) frontmatter product cannot reach the child.
          tables: b.tables || null,
          note: b.note || null,
          footer: b.footer || null,
          items: b.items || null,
          mark: b.mark || null,
          example: b.example || null
        };
      })
    };
  }

  // Legacy path: explain-only → single "legacy-explain" block
  if (explain) {
    return {
      legacy: true,
      explain: explain,
      blocks: [{ type: "legacy-explain", text: explain }]
    };
  }

  // Nothing
  return { legacy: false, explain: null, blocks: [] };
}

// ════════════════════════════════════════════════════════════════
// renderSolution — renders a normalized explain object to HTML
//
// Takes the OUTPUT of normalizeExplain() plus immutable grading context.
// The grading context is passed through for future use (whyWrong display)
// but is NEVER used to call check() or mutate anything.
// ════════════════════════════════════════════════════════════════

function renderSolution(opts) {
  var normalized = normalizeExplain({
    explain: opts && opts.explain,
    solution: opts && opts.solution
  });

  if (normalized.blocks.length === 0) return "";

  // Legacy path: emit the exact HTML the engine has always emitted.
  // The engine does NOT escape the explain string — it passes raw HTML through.
  // We must do the same for byte-identical output.
  if (normalized.legacy) {
    return '<p class="explain">' + normalized.explain + "</p>";
  }

  // Block list rendering
  var parts = [];
  var stepNum = 0;
  for (var i = 0; i < normalized.blocks.length; i++) {
    var block = normalized.blocks[i];
    switch (block.type) {
      case "step":
        stepNum++;
        parts.push(renderStep(block, stepNum));
        break;
      case "figure":
        parts.push(renderFigure(block));
        break;
      case "takeaway":
        parts.push(renderTakeaway(block));
        break;
      case "verification":
        parts.push(renderVerification(block));
        break;
      case "table":
        parts.push(renderTable(block));
        break;
      case "facts":
        parts.push(renderFacts(block));
        break;
      case "rule":
        parts.push(renderRule(block));
        break;
      default:
        // Unknown block type — text fallback
        parts.push(renderFallback(block));
    }
  }
  return parts.join("\n");
}

// ════════════════════════════════════════════════════════════════
// Block renderers — four types, each with a text fallback
// ════════════════════════════════════════════════════════════════

function renderStep(block, num) {
  var html = '<div class="sol-step" data-fallback="' + escAttr(stepFallback(block, num)) + '">';
  html += '<span class="sol-step-num">' + num + "</span>";
  if (block.goal) html += '<span class="sol-goal">' + escapeHtml(block.goal) + "</span>";
  if (block.working) html += '<span class="sol-working">' + escapeHtml(block.working) + "</span>";
  if (block.reason) html += '<span class="sol-reason">' + escapeHtml(block.reason) + "</span>";
  html += "</div>";
  return html;
}

function stepFallback(block, num) {
  var parts = [];
  if (block.goal) parts.push(block.goal);
  if (block.working) parts.push(block.working);
  if (block.reason) parts.push("(" + block.reason + ")");
  return "Step " + num + ": " + parts.join(" — ");
}

function renderFigure(block) {
  // Figures are passed as pre-built HTML (SVG); fallback to text
  var fallback = block.text || "[figure]";
  var content = block.html || escapeHtml(fallback);
  return '<div class="sol-figure" data-fallback="' + escAttr(fallback) + '">' + content + "</div>";
}

function renderTakeaway(block) {
  var text = block.text || "";
  return '<div class="sol-takeaway" data-fallback="' + escAttr(text) + '">' + escapeHtml(text) + "</div>";
}

function renderVerification(block) {
  var text = block.text || "";
  return '<div class="sol-verification" data-fallback="' + escAttr(text) + '">' + escapeHtml(text) + "</div>";
}

function renderFallback(block) {
  var text = block.text || "";
  return '<div class="sol-fallback">' + escapeHtml(text) + "</div>";
}

// ════════════════════════════════════════════════════════════════
// Change 5 (BRIEF-G3-ENGINE-1) — table / facts / rule.
//
// THE ENGINE COMPUTES EVERY PRODUCT. The author supplies factor / upTo /
// mark / [a, b] pairs; `a × b` is multiplied HERE. A frontmatter `product`
// is never read — a typo'd times table across ~110 team-authored lessons is
// therefore impossible, and a guard can verify every table in the corpus.
//
// Validation: every operand an integer 1–12 (rule.example.b may be 0, the
// ONLY legal 0). An invalid block renders "" and is reported to
// window.__raoSolWarn — never thrown, never rendered partially.
// ════════════════════════════════════════════════════════════════

function solWarn(msg) {
  try { if (typeof window !== "undefined") (window.__raoSolWarn = window.__raoSolWarn || []).push(String(msg)); } catch (e) {}
}
function isInt1to12(n) { return typeof n === "number" && Math.floor(n) === n && n >= 1 && n <= 12; }
// One monospace fact line. `marked` adds tint + weight ONLY — never padding
// (alignment is load-bearing; the `=` column must line up down the table).
function eqRow(a, b, marked) {
  var product = a * b;   // COMPUTED — a frontmatter product is never consulted
  return '<div class="sol-row' + (marked ? " sol-mark" : "") + '"><span class="sol-eq">' +
    a + " × " + b + " = " + product + "</span></div>";
}
function absentLine(v) {
  return '<div class="sol-absent"><span class="sol-eq">' + escapeHtml(String(v)) + " is not here</span></div>";
}
function validTableEntry(t) {
  if (!t || !isInt1to12(t.factor) || !isInt1to12(t.upTo)) return false;
  if (t.mark != null) {
    if (!Array.isArray(t.mark)) return false;
    for (var i = 0; i < t.mark.length; i++) if (!isInt1to12(t.mark[i]) || t.mark[i] > t.upTo) return false;
  }
  if (t.absent != null) {
    if (!Array.isArray(t.absent)) return false;
    for (var j = 0; j < t.absent.length; j++) {
      var ab = t.absent[j];
      if (!ab || Math.floor(ab.after) !== ab.after || ab.after < 1 || ab.after > t.upTo || typeof ab.value !== "number") return false;
    }
  }
  return true;
}
function renderOneTable(t) {
  var marks = {}; (t.mark || []).forEach(function (m) { marks[m] = true; });
  var absAfter = {}; (t.absent || []).forEach(function (a) { (absAfter[a.after] = absAfter[a.after] || []).push(a.value); });
  var rows = [];
  for (var m = 1; m <= t.upTo; m++) {
    rows.push(eqRow(t.factor, m, !!marks[m]));
    if (absAfter[m]) absAfter[m].forEach(function (v) { rows.push(absentLine(v)); });
  }
  return '<div class="sol-table">' + rows.join("") + "</div>";
}
function renderTable(block) {
  var tables = block.tables;
  if (!Array.isArray(tables) || tables.length < 1 || tables.length > 2 || !tables.every(validTableEntry)) {
    solWarn("table: invalid — " + JSON.stringify(tables));
    return "";
  }
  var inner = tables.map(renderOneTable).join("");
  return (block.note ? '<p class="sol-note">' + escapeHtml(block.note) + "</p>" : "") +
    '<div class="sol-tables' + (tables.length === 2 ? " sol-tables-2" : "") + '">' + inner + "</div>" +
    (block.footer ? '<p class="sol-foot">' + escapeHtml(block.footer) + "</p>" : "");
}
function renderFacts(block) {
  var items = block.items;
  if (!Array.isArray(items) || !items.length ||
      !items.every(function (it) { return Array.isArray(it) && it.length === 2 && isInt1to12(it[0]) && isInt1to12(it[1]); })) {
    solWarn("facts: invalid items — " + JSON.stringify(items));
    return "";
  }
  var marks = {};
  if (block.mark != null) {
    if (!Array.isArray(block.mark) || !block.mark.every(function (i) { return Math.floor(i) === i && i >= 0 && i < items.length; })) {
      solWarn("facts: invalid mark — " + JSON.stringify(block.mark));
      return "";
    }
    block.mark.forEach(function (i) { marks[i] = true; });
  }
  var rows = items.map(function (it, i) { return eqRow(it[0], it[1], !!marks[i]); }).join("");
  return (block.note ? '<p class="sol-note">' + escapeHtml(block.note) + "</p>" : "") +
    '<div class="sol-facts">' + rows + "</div>" +
    (block.footer ? '<p class="sol-foot">' + escapeHtml(block.footer) + "</p>" : "");
}
function renderRule(block) {
  if (!block.text || typeof block.text !== "string") { solWarn("rule: missing text"); return ""; }
  var ex = "";
  if (block.example != null) {
    var e = block.example;
    // the rule is the ONLY block where a 0 operand is legal (9 × 0 = 0)
    if (!Array.isArray(e) || e.length !== 2 || !isInt1to12(e[0]) || Math.floor(e[1]) !== e[1] || e[1] < 0 || e[1] > 12) {
      solWarn("rule: invalid example — " + JSON.stringify(e));
    } else {
      ex = eqRow(e[0], e[1], true);
    }
  }
  return '<div class="sol-rule"><p class="sol-note">' + escapeHtml(block.text) + "</p>" + ex + "</div>";
}

// ════════════════════════════════════════════════════════════════
// Utilities — no grading references, no check(), no mutation
// ════════════════════════════════════════════════════════════════

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escAttr(s) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}

// ════════════════════════════════════════════════════════════════
// Tutor bubbles — the ONE copy of the chat mechanics (Brief 7.6,
// rao-master-16, behavior signed off in calm-card-v36.html).
//
// Append-only + type-then-fill: a bubble node is created ONCE showing
// typing dots, and its content is filled ONCE (dots → chip + text) at
// BUBBLE_FILL_MS. Earlier bubbles are never touched again (no-repaint
// law). Bubbles are faceless — no avatar seat; there is deliberately
// no .cc-ava anywhere in production.
//
// Exported (RaoSolution.bubbles) so the card controller renders hint
// bubbles through the SAME primitives — hints and steps must speak in
// one voice, and one copy cannot drift.
// ════════════════════════════════════════════════════════════════

var BUBBLE_FILL_MS = 650;   // v36 chatMsg timing — verify-calm asserts parity with the demo

function chatWrap(header) {
  var w = document.createElement("div");
  w.className = "cc-chat";
  if (header) {
    var h = document.createElement("p");
    h.className = "cc-chat-hd";
    h.textContent = header;
    w.appendChild(h);
  }
  return w;
}

function chatMsg(wrap, chip, bodyHtml, then) {
  var m = document.createElement("div");
  m.className = "cc-msg";
  m.innerHTML = '<div class="cc-bub"><div class="cc-dots"><i></i><i></i><i></i></div></div>';
  wrap.appendChild(m);
  var bub = m.querySelector(".cc-bub");
  setTimeout(function () {
    bub.innerHTML =
      (chip ? '<span class="cc-schip">' + escapeHtml(chip) + "</span>" : "") +
      '<div class="cc-btxt">' + bodyHtml + "</div>";
    if (then) then();
  }, BUBBLE_FILL_MS);
  return m;
}

// ════════════════════════════════════════════════════════════════
// Walkthrough — Tier 2 (Brief 7.6). OPENING IT IS THE COMMIT POINT.
//
// The card controller locks the question and records solved-with-help
// BEFORE calling this. There is NO retry inside the walkthrough — one
// button per step: "Next step", then "Got it" on the final step. Steps
// type in one at a time as tutor bubbles under the panel header and
// ACCUMULATE (help-accumulates law — nothing dims, nothing disappears).
//
// The final step is the ONE sanctioned reveal: onReveal() fires when
// the last bubble fills. What "reveal" means in the question DOM
// (greening the correct option) is the CONTROLLER's business — this
// module never touches the question, never grades, never mutates.
// ════════════════════════════════════════════════════════════════

// Ruled KEPT (Venkat, 2026-07-17). If ever re-ruled, removal is this one
// line (set to "").
var WALK_HEADER = "Solution — step by step";

function walkChip(block, stepNum, stepTotal) {
  if (block.type === "step") return "Step " + stepNum + " of " + stepTotal;
  if (block.type === "takeaway") return "The idea to keep";
  if (block.type === "verification") return "Does it make sense?";
  if (block.type === "table") return "The times table";
  if (block.type === "facts") return "The facts";
  if (block.type === "rule") return "The rule";
  return null;   // figure / legacy-explain / fallback: no chip
}

function walkBody(block) {
  if (block.type === "step") {
    var parts = [];
    if (block.goal) parts.push('<span class="sol-goal">' + escapeHtml(block.goal) + "</span>");
    if (block.working) parts.push('<span class="cc-eq">' + escapeHtml(block.working) + "</span>");
    if (block.reason) parts.push('<span class="sol-reason">' + escapeHtml(block.reason) + "</span>");
    return parts.join("");
  }
  if (block.type === "figure") return block.html || escapeHtml(block.text || "[figure]");
  if (block.type === "table") return renderTable(block);
  if (block.type === "facts") return renderFacts(block);
  if (block.type === "rule") return renderRule(block);
  // legacy explain strings pass through raw — same contract as renderSolution
  if (block.type === "legacy-explain") return block.text || "";
  return escapeHtml(block.text || "");
}

function renderWalkthrough(opts) {
  var normalized = normalizeExplain({
    explain: opts && opts.explain,
    solution: opts && opts.solution
  });
  if (normalized.blocks.length === 0) return "";
  // The steps chat and its footer live in ONE .sol-walk panel. A future
  // "▶ Watch" tab row would sit as a SIBLING above the chat, inside this
  // same panel — nothing here structurally precludes it (Brief 7.6 scope
  // note: the video walkthrough is OUT for now, but must not be walled off).
  return (
    '<div class="sol-walk">' +
      '<div class="sol-walk-steps cc-chat">' +
        (WALK_HEADER ? '<p class="cc-chat-hd">' + escapeHtml(WALK_HEADER) + "</p>" : "") +
      "</div>" +
      '<div class="sol-walk-foot">' +
        '<button type="button" class="sol-next">Next step</button>' +
      "</div>" +
    "</div>"
  );
}

function wireWalkthrough(root, opts) {
  if (!root) return function () {};
  var normalized = normalizeExplain({
    explain: opts && opts.explain,
    solution: opts && opts.solution
  });
  var blocks = normalized.blocks;
  var onReveal = (opts && opts.onReveal) || function () {};
  var onDone = (opts && opts.onDone) || function () {};
  var chat = root.querySelector(".sol-walk-steps");
  var nextBtn = root.querySelector(".sol-next");
  if (root.__solWalkCleanup) root.__solWalkCleanup(); // idempotent re-wire

  var stepTotal = 0;
  blocks.forEach(function (b) { if (b.type === "step") stepTotal++; });
  var i = 0, stepNum = 0, typing = false;

  function addBubble() {
    if (typing || i >= blocks.length) return;
    typing = true;
    var block = blocks[i];
    var last = i === blocks.length - 1;
    if (block.type === "step") stepNum++;
    i++;
    if (nextBtn) nextBtn.disabled = true;
    chatMsg(chat, walkChip(block, stepNum, stepTotal), walkBody(block), function () {
      typing = false;
      if (last) {
        // The quiet reveal — the ONE moment the answer may appear (laws 2/6).
        onReveal();
        if (nextBtn) { nextBtn.disabled = false; nextBtn.textContent = "Got it"; }
      } else if (nextBtn) {
        nextBtn.disabled = false;
      }
    });
  }

  function onNext() {
    if (typing) return;
    if (i >= blocks.length) {           // "Got it" — the walkthrough is over
      if (nextBtn) nextBtn.setAttribute("hidden", "");
      onDone();
      return;
    }
    addBubble();
  }
  if (nextBtn) nextBtn.addEventListener("click", onNext);
  addBubble(); // opening types the FIRST step only — the child taps for the rest

  root.__solWalkCleanup = function () {
    if (nextBtn) nextBtn.removeEventListener("click", onNext);
    root.__solWalkCleanup = null;
  };
  return root.__solWalkCleanup;
}

// ════════════════════════════════════════════════════════════════
// Exports
// ════════════════════════════════════════════════════════════════

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    normalizeExplain: normalizeExplain,
    renderSolution: renderSolution,
    renderWalkthrough: renderWalkthrough,
    wireWalkthrough: wireWalkthrough,
    bubbles: { wrap: chatWrap, msg: chatMsg, FILL_MS: BUBBLE_FILL_MS }
  };
}
if (typeof window !== "undefined") {
  window.RaoSolution = {
    normalizeExplain: normalizeExplain,
    renderSolution: renderSolution,
    renderWalkthrough: renderWalkthrough,
    wireWalkthrough: wireWalkthrough,
    bubbles: { wrap: chatWrap, msg: chatMsg, FILL_MS: BUBBLE_FILL_MS }
  };
}
