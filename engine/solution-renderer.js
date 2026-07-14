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
 */

"use strict";

/**
 * Render a solution walkthrough to an HTML string.
 * @param {Object} opts
 * @param {Object} opts.gradingResult  — immutable {correct: boolean}
 * @param {Array}  opts.answer         — immutable correct answer array
 * @param {Array}  opts.userResponse   — immutable student response array
 * @param {Array}  [opts.solution]     — block list [{type, goal, working, reason, text}]
 * @param {string} [opts.explain]      — legacy one-line explanation
 * @returns {string} HTML string
 */
function renderSolution(opts) {
  const { gradingResult, answer, userResponse, solution, explain } = opts;

  // Legacy path: explain-only
  if (!solution || solution.length === 0) {
    if (!explain) return "";
    return '<p class="explain">' + escapeHtml(explain) + "</p>";
  }

  // Block list rendering
  const parts = [];
  let stepNum = 0;
  for (const block of solution) {
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
        parts.push('<div class="sol-unknown">' + escapeHtml(block.text || "") + "</div>");
    }
  }
  return parts.join("\n");
}

function renderStep(block, num) {
  let html = '<div class="sol-step">';
  html += '<span class="sol-step-num">' + num + "</span>";
  if (block.goal) html += '<span class="sol-goal">' + escapeHtml(block.goal) + "</span>";
  if (block.working) html += '<span class="sol-working">' + escapeHtml(block.working) + "</span>";
  if (block.reason) html += '<span class="sol-reason">' + escapeHtml(block.reason) + "</span>";
  html += "</div>";
  return html;
}

function renderFigure(block) {
  // Figures are passed as pre-built HTML (SVG); fallback to text
  return '<div class="sol-figure">' + (block.html || escapeHtml(block.text || "")) + "</div>";
}

function renderTakeaway(block) {
  return '<div class="sol-takeaway">' + escapeHtml(block.text || "") + "</div>";
}

function renderVerification(block) {
  return '<div class="sol-verification">' + escapeHtml(block.text || "") + "</div>";
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { renderSolution };
}
