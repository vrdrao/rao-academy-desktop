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
          html: b.html || null
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
// Walkthrough — Tier 2 of the ladder (SOLUTION_SPEC §2, rao-master-15).
//
// NEVER dumped: blocks are revealed ONE AT A TIME. Previous steps stay
// visible above, dimmed (.sol-dim). An "I've got it — let me try again"
// bail-out button is present at every step. Nothing auto-advances.
//
// Pure display. The retry action is a callback supplied by the card
// controller — this module has no idea what it does, and must never
// know: resetting the card is the controller's business, not the
// renderer's.
// ════════════════════════════════════════════════════════════════

function renderWalkthrough(opts) {
  var normalized = normalizeExplain({
    explain: opts && opts.explain,
    solution: opts && opts.solution
  });
  if (normalized.blocks.length === 0) return "";

  var items = [];
  var stepNum = 0;
  for (var i = 0; i < normalized.blocks.length; i++) {
    var block = normalized.blocks[i];
    var inner;
    switch (block.type) {
      case "step": stepNum++; inner = renderStep(block, stepNum); break;
      case "figure": inner = renderFigure(block); break;
      case "takeaway": inner = renderTakeaway(block); break;
      case "verification": inner = renderVerification(block); break;
      case "legacy-explain": inner = '<p class="explain">' + block.text + "</p>"; break;
      default: inner = renderFallback(block);
    }
    items.push('<div class="sol-walk-item" hidden>' + inner + "</div>");
  }
  return (
    '<div class="sol-walk">' +
      '<div class="sol-walk-steps">' + items.join("") + "</div>" +
      '<div class="sol-walk-foot">' +
        '<button type="button" class="sol-retry">I\u2019ve got it \u2014 let me try again</button>' +
        '<button type="button" class="sol-next">Next step</button>' +
      "</div>" +
    "</div>"
  );
}

function wireWalkthrough(root, opts) {
  if (!root) return function () {};
  var onRetry = (opts && opts.onRetry) || function () {};
  var items = Array.prototype.slice.call(root.querySelectorAll(".sol-walk-item"));
  var nextBtn = root.querySelector(".sol-next");
  var retryBtn = root.querySelector(".sol-retry");
  if (root.__solWalkCleanup) root.__solWalkCleanup(); // idempotent re-wire

  var shown = 0;
  function reveal() {
    if (shown >= items.length) return;
    if (shown > 0) items[shown - 1].classList.add("sol-dim"); // history stays visible, dimmed
    items[shown].removeAttribute("hidden");
    shown++;
    if (shown >= items.length && nextBtn) nextBtn.setAttribute("hidden", "");
  }
  function onNext() { reveal(); }
  function onBail() { onRetry(); }
  if (nextBtn) nextBtn.addEventListener("click", onNext);
  if (retryBtn) retryBtn.addEventListener("click", onBail);
  reveal(); // opening shows the FIRST step only — the child taps for the rest

  root.__solWalkCleanup = function () {
    if (nextBtn) nextBtn.removeEventListener("click", onNext);
    if (retryBtn) retryBtn.removeEventListener("click", onBail);
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
    wireWalkthrough: wireWalkthrough
  };
}
if (typeof window !== "undefined") {
  window.RaoSolution = {
    normalizeExplain: normalizeExplain,
    renderSolution: renderSolution,
    renderWalkthrough: renderWalkthrough,
    wireWalkthrough: wireWalkthrough
  };
}
