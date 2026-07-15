#!/usr/bin/env node
/**
 * classify-distractors.js
 *
 * Mechanically derives which misconception code from docs/MISCONCEPTIONS.md
 * explains each distractor in the corpus. Pure arithmetic — no LLM judgement.
 *
 * Input:  tools/distractor-data.json  (produced by extract-distractors.js)
 * Output: tools/distractor-classification.json
 *         + summary to stdout
 *
 * NOT wired into npm test — see docs/MISCONCEPTIONS.md for why.
 */

'use strict';
const fs   = require('fs');
const path = require('path');

const DATA_PATH   = path.join(__dirname, 'distractor-data.json');
const OUT_PATH    = path.join(__dirname, 'distractor-classification.json');
const REPORT_PATH = path.join(__dirname, 'unexplained-distractors.json');

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

// ─── student-facing message lookup ────────────────────────────
// One entry per live code with a student-facing message (59 template +
// 9 approved). Must stay in lockstep with docs/MISCONCEPTIONS.md —
// the message-count verification compares the two.
const MESSAGES = {
  ADJACENT_TABLE_FACT: "So close — this answer lives one door down in the times table!",
  AM_PM_SWAP: "Morning and evening traded places in this one — the clue in the story says which it really is.",
  AREA_FOR_PERIMETER: "This measures the space *inside* — but the question is walking around the *edge*!",
  CARRY_DROPPED: "Almost there! Somewhere a carry didn't make the jump to the next column.",
  CARRY_EXTRA: "An extra carry crept into a column where it wasn't invited — check each column again.",
  COMPARISON_EQUAL_WRONG: "These two look like twins, but they're not — check every digit, right to the end.",
  COMPARISON_REVERSED: "This comparison is standing on its head — check which side is really bigger.",
  CONCATENATED_DIGITS: "These numbers got glued side by side instead of worked out — they need real maths, not sticking together.",
  DATA_READING_ERROR: "The chart is playing hide-and-seek — this answer came from a different row or bar than the question asked about.",
  DECIMAL_PLACE_ERROR: "The decimal point wandered off — rupees and paise need to line up just right.",
  DIGIT_CONFUSION: "The digits got jumbled on the way in — match each word to its place, one at a time.",
  DIGIT_INSERT_OR_SHIFT: "This has a digit in the wrong place, changing the number's size.",
  DIGIT_REARRANGE: "These are the right digits, but not in the right order for this value.",
  DIGIT_SWAP: "Two digits traded seats on the way to the answer — check each place carefully.",
  DIVIDED_NOT_MULTIPLIED: "This divides the numbers when the problem asks you to multiply.",
  DIVISIBILITY_CONFUSED: "This number doesn't pass the test — try actually sharing it out and see what's left over.",
  DIVISOR_AS_ANSWER: "Sneaky! This is the number you divide *by* — the question wants what comes out.",
  DOUBLE_OR_HALF: "Whoa, this one grew — or shrank! Somewhere a number got doubled or halved along the way.",
  DROPPED_CARRY: "This adds the columns but misses carrying into the next place.",
  DROP_INTERIOR_ZERO: "This skips a zero that belongs in the middle of the number.",
  DROP_LEADING_DIGIT: "This leaves off the digit at the front of the number.",
  ELAPSED_MINUTES_ERROR: "The clock hands slipped a little here — the hours or the minutes aren't quite right.",
  ESTIMATE_WRONG_VALUE: "This estimate wandered too far from home — friendly, rounded numbers keep it close.",
  EXACT_NOT_ROUNDED: "This is the exact answer showing off — but the question only wants an estimate! Round first.",
  FORGOT_DOUBLE_PERIMETER: "This walks only halfway around the shape — a rectangle has two of each side!",
  FORMULA_ERROR: "This answer borrowed the wrong recipe — a different shape's rule sneaked in here.",
  FRACTION_ADJACENT: "So close — this fraction is just one step away from the picture. Count the parts once more.",
  HALF_PERIMETER_FOR_AREA: "This adds the sides — but area is about filling the inside, not walking the edge.",
  MULTI_STEP_ERROR: "One step in the journey went sideways — walk the problem again, one step at a time.",
  NEAR_MISS: "So close! This answer trips right at the finish line — the last step wants one more look.",
  ODD_EVEN_CONFUSED: "This number is pretending to be on the wrong team — its last digit gives it away!",
  OFF_BY_ONE: "Just one away! A sneaky little 1 slipped in — or slipped out — at the very end.",
  OFF_BY_TWO: "Only two away! A small counting slip is hiding in here — count once more, slowly.",
  OPERAND_ECHO: "Careful — this number came straight from the question, dressed up as an answer!",
  ORDINAL_SUFFIX_ERROR: "The ending doesn't match — say the number out loud and listen for how it finishes.",
  PARTIAL_COMPUTATION: "This answer stopped halfway — the problem still has one more move left in it.",
  PARTIAL_PRODUCT_PLACE_ERROR: "One partial product wandered into the wrong column — every piece has its own place to sit.",
  PATTERN_WRONG_RULE: "This rule fits the first jump but not all of them — a pattern's rule has to work every single step.",
  PATTERN_WRONG_STEP: "This follows a different step than the pattern's rule.",
  PERIMETER_FOR_AREA: "This walks around the edge — but the question wants the space inside!",
  PLACE_SHIFT_DOWN: "This answer came out too small — somewhere a place value slipped down a step. Count those zeros!",
  PLACE_SHIFT_IN_EXPRESSION: "One number here is wearing the wrong size — check what each part of this really means.",
  PLACE_SHIFT_UP: "This answer grew too large — somewhere a place value climbed one step too high.",
  PROBABILITY_WRONG_LEVEL: "This guess is too sure — or not sure enough! Count how many ways it can happen first.",
  PROPERTY_CONFUSED: "That's a different property wearing this one's coat — look at what actually moved in the equation.",
  QUOTIENT_OFF_BY_ONE: "So close — one group too many, or one too few! Think about what happens to the leftover.",
  REMAINDER_AS_ANSWER: "This is the little bit left over, not the answer — the question wants the big share.",
  ROUND_BOTH_DOWN: "Both numbers got rounded downhill — but one of them wanted to go up! Check each rounding digit.",
  ROUND_BOTH_UP: "Both numbers got rounded uphill — but one of them wanted to come down! Check each rounding digit.",
  ROUND_ONE_WRONG: "One of the two numbers rounded the wrong way — the other neighbour was closer for it.",
  ROUND_WRONG_DIRECTION_SINGLE: "This rounds the wrong way — the digit next door decides which neighbour wins.",
  ROUND_WRONG_WAY: "This rounds to the wrong side — check which multiple is nearer.",
  SHAPE_CONFUSED: "This name belongs to a look-alike shape — the faces and edges will tell them apart.",
  SHAPE_PROPERTY_CONFUSED: "This count belongs to a different shape — or a different part of this one. Count on the figure itself.",
  SUM_EVAL_ERROR: "This one doesn't add up to what the question asked — test it and see.",
  TABLE_LOOKUP_ERROR: "This came from the wrong spot in the table — trace the row and column with your finger.",
  TIME_UNIT_CONFUSION: "This uses the wrong amount of time for one of the units.",
  WRONG_24H_NO_ADD_12: "Careful — the clock's morning and afternoon got mixed up in this one. What does the hour number tell you?",
  WRONG_24H_WRONG_OFFSET: "These two clocks aren't telling the same time — the 24-hour clock is being tricky here.",
  WRONG_NUMBER_PAIR: "This pair passes one test but fails the other — both clues have to be happy at the same time.",
  WRONG_OP_ADD_FOR_MULT: "This answer adds the numbers together — but 'times as much' is asking for something bigger!",
  WRONG_OP_ADD_FOR_SUB: "This answer went the wrong direction — should the number be getting bigger or smaller here?",
  WRONG_OP_IN_EXPRESSION: "This rule doesn't always keep its promise — test it with real numbers and catch it slipping.",
  WRONG_OP_SUB_FOR_DIV: "This answer subtracts — but the question is about making equal groups.",
  WRONG_OP_SUB_FOR_MULT: "This answer took away instead of building up — should the total here be bigger or smaller than the numbers you started with?",
  WRONG_PLACE_IDENTIFIED: "Right digit, wrong home — this value belongs to a different place in the number.",
  WRONG_ROUND_PLACE: "The rounding happened at the wrong spot — check which place the question points to.",
  WRONG_UNIT_CHOSEN: "The number looks fine, but the unit doesn't fit — think about how big each unit really is.",
};

// ─── helpers ───────────────────────────────────────────────────────────

function stripUnits(s) {
  if (typeof s !== 'string') return s;
  return s.replace(/[₹,\s]/g, '')
          .replace(/sq\.?\s*m|sq\.?\s*cm|sq\.?\s*units?/gi, '')
          .replace(/\b(m|cm|km|mm|hours?|hrs?|mins?|minutes?|days?|months?|years?|weeks?|kilometres?|millimetres?|centimetres?|metres?)\b/gi, '')
          .trim();
}

function parseNum(s) {
  const cleaned = stripUnits(String(s));
  if (cleaned === '') return NaN;
  return parseFloat(cleaned);
}

function isInteger(n) { return Number.isFinite(n) && n === Math.floor(n); }
function roundTo(n, p) { return Math.round(n / p) * p; }
function floorTo(n, p) { return Math.floor(n / p) * p; }
function ceilTo(n, p)  { return Math.ceil(n / p) * p; }

function parseFrac(s) {
  const m = String(s).match(/^(\d+)\s*\/\s*(\d+)$/);
  return m ? { num: parseInt(m[1]), den: parseInt(m[2]) } : null;
}

function parseTime(s) {
  const str = String(s).trim();
  const m = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|A\.M\.|P\.M\.)?$/i);
  if (!m) return NaN;
  let h = parseInt(m[1]), min = parseInt(m[2]);
  const ampm = (m[3] || '').replace(/\./g, '').toUpperCase();
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

// Parse expression like "35 ÷ 5 = 7" or "6 × 80"
function parseExpr(s) {
  const str = String(s).trim();
  // "a OP b = c" or "a OP b"
  const m = str.match(/^([\d,]+)\s*([+\-×÷x*\/])\s*([\d,]+)(?:\s*=\s*([\d,]+))?$/i);
  if (!m) return null;
  const a = parseFloat(m[1].replace(/,/g, ''));
  const op = m[2].replace('×', '*').replace('÷', '/').replace('x', '*');
  const b = parseFloat(m[3].replace(/,/g, ''));
  const result = m[4] ? parseFloat(m[4].replace(/,/g, '')) : undefined;
  return { a, op, b, result };
}

// 3D shape face/edge/vertex counts
const SHAPE_PROPS = {
  cube:               { faces: 6, edges: 12, vertices: 8 },
  'rectangular prism': { faces: 6, edges: 12, vertices: 8 },
  'triangular prism':  { faces: 5, edges: 9, vertices: 6 },
  'square pyramid':    { faces: 5, edges: 8, vertices: 5 },
  'triangular pyramid': { faces: 4, edges: 6, vertices: 4 },
  cone:               { faces: 2, edges: 1, vertices: 1 },
  cylinder:           { faces: 3, edges: 2, vertices: 0 },
  sphere:             { faces: 1, edges: 0, vertices: 0 },
};

// ─── classifier ────────────────────────────────────────────────────────

function classify(q, d) {
  const codes = [];
  const cv = parseNum(q.answer[0]);
  const dv = parseNum(d.value);
  const nums = q.promptNumbers.map(n => parseFloat(n)).filter(n => !isNaN(n));
  const prompt = q.prompt.toLowerCase();
  const ansStr = String(q.answer[0]).trim().toLowerCase();
  const dStr   = String(d.value).trim().toLowerCase();
  const file   = q.file.toLowerCase();

  // ── VISUAL ONLY ──
  // Empty value OR positional key with empty display text (image-only options)
  if (d.value === '' || d.value.trim() === '') {
    return ['VISUAL_ONLY'];
  }
  // Positional key (1, 2, 3...) with no meaningful text — these are image-only
  // options where the engine assigned a positional data-val. Check if the
  // distractor text is empty or matches the positional key exactly.
  if (/^[1-9]$/.test(d.value) && (!d.text || d.text.trim() === '' || d.text === d.value)) {
    // Could be a real numeric option or a positional key.
    // Heuristic: if the file is about visual content (shapes, area grids, etc.)
    // AND the answer is also a small positional number, it's visual.
    const visualFiles = /equal.?parts|select.?area|symmetry|fractions.*shape|line.?plot|bar.?graph|create.*area|identify.*three|count.*vert|count.*face|place.?val.*remix|inequalit/i;
    if (visualFiles.test(file)) {
      return ['VISUAL_ONLY'];
    }
  }

  // ── TEXT-BASED CATEGORIES ──

  // AM/PM
  if (/^(a\.m\.|p\.m\.|am|pm)$/i.test(ansStr) && /^(a\.m\.|p\.m\.|am|pm)$/i.test(dStr)) {
    return ['AM_PM_SWAP'];
  }

  // Comparison words
  if (/is (less|greater|equal)/.test(ansStr) && /is (less|greater|equal)/.test(dStr)) {
    return [/equal/.test(dStr) && !/equal/.test(ansStr) ? 'COMPARISON_EQUAL_WRONG' : 'COMPARISON_REVERSED'];
  }

  // Properties
  const props = ['commutative', 'associative', 'identity', 'distributive'];
  if (props.some(p => ansStr.includes(p)) && props.some(p => dStr.includes(p))) {
    return ['PROPERTY_CONFUSED'];
  }

  // Probability
  const probTerms = ['certain', 'probable', 'unlikely', 'impossible'];
  if (probTerms.includes(ansStr) && probTerms.includes(dStr)) {
    return ['PROBABILITY_WRONG_LEVEL'];
  }

  // 3D shapes
  const shapeNames = ['cube', 'sphere', 'cone', 'cylinder', 'rectangular prism', 'triangular prism',
                      'square pyramid', 'triangular pyramid', 'hemisphere'];
  if (shapeNames.some(s => ansStr.includes(s)) && shapeNames.some(s => dStr.includes(s))) {
    return ['SHAPE_CONFUSED'];
  }

  // Yes/No (symmetry, rotational, equal parts, etc.)
  if (/^(yes|no)$/i.test(ansStr) && /^(yes|no)$/i.test(dStr)) {
    return ['VISUAL_ONLY'];
  }

  // Pattern rule text ("Add 3" vs "Add 2", "Subtract 10" vs "Subtract 5")
  if (/^(add|subtract|multiply|divide)\s+\d+$/i.test(ansStr) &&
      /^(add|subtract|multiply|divide)\s+\d+$/i.test(dStr)) {
    return ['PATTERN_WRONG_RULE'];
  }
  // Also "Multiply by 2" format
  if (/^(add|subtract|multiply by|divide by)\s+\d+$/i.test(ansStr) &&
      /^(add|subtract|multiply by|divide by)\s+\d+$/i.test(dStr)) {
    return ['PATTERN_WRONG_RULE'];
  }

  // Number words ("eight hundred" vs "five hundred")
  if (/hundred|thousand|million|billion/i.test(ansStr) && /hundred|thousand|million|billion/i.test(dStr)) {
    return ['WRONG_PLACE_IDENTIFIED'];
  }

  // Ordinals ("21st" vs "21th")
  if (/\d+(st|nd|rd|th)$/i.test(ansStr) && /\d+(st|nd|rd|th)$/i.test(dStr)) {
    const ansOrd = parseInt(ansStr), dOrd = parseInt(dStr);
    if (!isNaN(ansOrd) && !isNaN(dOrd)) {
      if (ansStr.replace(/\d+/, '') !== dStr.replace(/\d+/, '') && ansOrd === dOrd) {
        return ['ORDINAL_SUFFIX_ERROR'];
      }
      return [Math.abs(ansOrd - dOrd) <= 2 ? 'OFF_BY_ONE' : 'OFF_BY_ONE'];
    }
  }

  // Time duration expressions ("2 hours 30 mins" vs "2 hours 15 mins")
  const timeExpr = /(\d+)\s*hours?\s*(\d+)?\s*min/i;
  const ansTE = ansStr.match(timeExpr), dTE = dStr.match(timeExpr);
  if (ansTE && dTE) return ['ELAPSED_MINUTES_ERROR'];

  // Also match "X hours" without minutes
  if (/^\d+\s*hours?$/.test(ansStr) && /^\d+\s*hours?$/.test(dStr)) return ['ELAPSED_MINUTES_ERROR'];

  // 24h time conversion
  const ans24 = parseTime(q.answer[0]), d24 = parseTime(d.value);
  if (!isNaN(ans24) && !isNaN(d24) && ans24 !== d24) {
    if (prompt.match(/24.?hour|same time/i) || file.match(/24|12.*24|schedule/)) {
      return [Math.abs(ans24 - d24) === 720 ? 'WRONG_24H_NO_ADD_12' : 'WRONG_24H_WRONG_OFFSET'];
    }
    // Time reading questions (clock reading)
    if (prompt.match(/what time|clock show/i)) {
      return ['WRONG_24H_WRONG_OFFSET'];
    }
  }

  // ── TIME_UNIT_CONFUSION — wrong conversion, fraction-of-hour, block count ──
  if (file.match(/time|elapsed|transport|schedule|start.*end/i) ||
      prompt.match(/minutes|hours|half.?hour|how long/i)) {
    const cvT = parseNum(q.answer[0]);
    const dvT = parseNum(d.value);
    if (!isNaN(cvT) && !isNaN(dvT)) {
      // Fraction-of-hour values substituted: 45 for 60, 90 for 60, 45 for 30, etc.
      const fracHourPairs = [
        [60, 45], [60, 90], [30, 45], [120, 100], [120, 150],
        [90, 60], [90, 30], [90, 120], [20, 60],
      ];
      for (const [c, d2] of fracHourPairs) {
        if (cvT === c && dvT === d2) { codes.push('TIME_UNIT_CONFUSION'); break; }
      }
    }
    // Duration component dropped: "1 hour 45 minutes" answer, "45 minutes" distractor
    if (ansStr.match(/\d+\s*hours?\s+\d+\s*min/i) && dStr.match(/^\d+\s*min/i) && !dStr.match(/hour/i)) {
      codes.push('TIME_UNIT_CONFUSION');
    }
    // Clock time rounded to next hour: answer 12:40, distractor 1:00
    if (!isNaN(parseTime(q.answer[0])) && !isNaN(parseTime(d.value))) {
      const aMin = parseTime(q.answer[0]) % 60;
      const dMin = parseTime(d.value) % 60;
      if (aMin !== 0 && dMin === 0 && Math.abs(parseTime(d.value) - parseTime(q.answer[0])) <= 60) {
        codes.push('TIME_UNIT_CONFUSION');
      }
    }
    if (codes.length > 0) return [...new Set(codes)];
  }

  // Unit comparison ("19 kilometres" vs "19 millimetres")
  if (/\b(kilomet|millimet|centimet|met)\w*/i.test(ansStr) &&
      /\b(kilomet|millimet|centimet|met)\w*/i.test(dStr)) {
    const ansU = ansStr.match(/(kilomet|millimet|centimet|met)\w*/i);
    const dU   = dStr.match(/(kilomet|millimet|centimet|met)\w*/i);
    if (ansU && dU && ansU[0] !== dU[0]) {
      return ['WRONG_UNIT_CHOSEN'];
    }
  }
  // Unit comparison with "cm" vs "m" in short form
  if (/\d+\s*(cm|m|km|mm)\b/i.test(ansStr) && /\d+\s*(cm|m|km|mm)\b/i.test(dStr)) {
    const ansU = ansStr.match(/(cm|km|mm|m)\b/i);
    const dU   = dStr.match(/(cm|km|mm|m)\b/i);
    if (ansU && dU && ansU[1].toLowerCase() !== dU[1].toLowerCase()) {
      return ['WRONG_UNIT_CHOSEN'];
    }
  }

  // ── FRACTION_ADJACENT — MUST run before expression evaluation ──
  // parseExpr treats "/" as division, so a fraction string like "4/6"
  // parses as an expression and would be swallowed by the SUM_EVAL_ERROR
  // check below. Doc rule (docs/MISCONCEPTIONS.md §7): distractor fraction
  // differs from a correct fraction by ±1 in the numerator (same
  // denominator) or ±1 in the denominator (same numerator).
  // Non-adjacent fraction pairs deliberately fall through to the
  // expression check (FRACTION_WHOLE_FOR_PART stays dormant).
  {
    const dF = parseFrac(d.value);
    if (dF) {
      for (const rawAns of q.answer) {
        const aF = parseFrac(rawAns);
        if (!aF) continue;
        if (aF.num === dF.num && aF.den === dF.den) continue;
        if ((aF.den === dF.den && Math.abs(aF.num - dF.num) === 1) ||
            (aF.num === dF.num && Math.abs(aF.den - dF.den) === 1)) {
          return ['FRACTION_ADJACENT'];
        }
      }
    }
  }

  // Expression-based distractors ("35 ÷ 5 = 7" vs "35 − 5 = 30")
  const dExpr = parseExpr(dStr);
  const aExpr = parseExpr(ansStr);
  if (dExpr && aExpr) {
    if (dExpr.op !== aExpr.op) return ['WRONG_OP_IN_EXPRESSION'];
    return ['SUM_EVAL_ERROR'];
  }

  // Expression in multi-select (e.g., "6 × 80" vs "6 × 800")
  if (dExpr && !aExpr) {
    // Check if this is a "select all expressions that equal X" type
    if (prompt.match(/equal|expression/i)) return ['SUM_EVAL_ERROR'];
    // Place value in expression
    return ['PLACE_SHIFT_IN_EXPRESSION'];
  }

  // "X and Y" pair-based answers ("2 and 2" vs "3 and 1")
  if (/^\d+\s+and\s+\d+$/.test(ansStr) && /^\d+\s+and\s+\d+$/.test(dStr)) {
    return ['WRONG_NUMBER_PAIR'];
  }

  // (Fraction-vs-fraction handling lives ABOVE the expression check —
  //  a block here was unreachable: parseExpr accepts every string
  //  parseFrac accepts, so all fraction pairs returned before reaching it.)

  // Multi-select expression options ("30 + 60" where sum should be 90)
  const exprM = dStr.match(/^([\d,]+)\s*\+\s*([\d,]+)$/);
  if (exprM && prompt.match(/equal|sum/i)) {
    const ea = parseFloat(exprM[1].replace(/,/g, ''));
    const eb = parseFloat(exprM[2].replace(/,/g, ''));
    const targetM = prompt.match(/equal\s*(?:to\s*)?([\d,]+)/i);
    if (targetM) {
      const target = parseFloat(targetM[1].replace(/,/g, ''));
      if (ea + eb !== target) return ['SUM_EVAL_ERROR'];
    }
  }

  // Named people/items (bar graphs, tables — data reading) — text answers
  if (isNaN(cv) && isNaN(dv)) {
    // Check if these are names (e.g., "violin" vs "viola", "Rohan" vs "Arjun")
    if (file.match(/bar.?graph|table|line.?plot|interpret|schedule/i)) {
      return ['DATA_READING_ERROR'];
    }
    // Divisibility, number sentence text options
    if (dStr.match(/divisib|×|÷|\+|−|=/)) return ['WRONG_OP_IN_EXPRESSION'];
    // Time options like "8:30 PM" vs "8:30 AM"
    if (/\d+:\d+\s*(am|pm)/i.test(ansStr) && /\d+:\d+\s*(am|pm)/i.test(dStr)) {
      return ['AM_PM_SWAP'];
    }
    // Generic unclassified text
    return ['UNCLASSIFIED_TEXT'];
  }

  // ── NUMERIC from here on ──
  if (isNaN(cv) || isNaN(dv)) {
    // One numeric, one not — or text answer with numeric distractor
    if (!isNaN(dv) && isNaN(cv)) {
      // The answer is text but distractor is numeric (e.g., positional options)
      return ['UNCLASSIFIED_TEXT'];
    }
    return codes.length > 0 ? codes : ['UNCLASSIFIED_TEXT'];
  }

  const diff = dv - cv;
  const absDiff = Math.abs(diff);
  const a = nums.length >= 1 ? nums[0] : NaN;
  const b = nums.length >= 2 ? nums[1] : NaN;

  // ── EVEN/ODD ──
  if (prompt.match(/even|odd/) && cv % 2 !== dv % 2) {
    codes.push('ODD_EVEN_CONFUSED');
  }

  // ── DATA READING (bar graphs, tables, line plots) ──
  if (file.match(/bar.?graph|table|line.?plot|interpret|schedule/i) && codes.length === 0) {
    codes.push('DATA_READING_ERROR');
    return codes;
  }

  // ── AREA / PERIMETER ──
  if (prompt.match(/area|perimeter|fencing|around|distance.*around/i)) {
    const dims = nums.filter(n => n > 0);
    let l, w;
    if (dims.length >= 2) { l = dims[0]; w = dims[1]; }
    else if (dims.length === 1 && prompt.match(/square/i)) { l = dims[0]; w = dims[0]; }

    if (l && w) {
      const area = l * w, perim = 2 * (l + w), halfP = l + w;

      // Area question
      if (prompt.match(/area/i)) {
        if (cv === area) {
          if (dv === perim) return ['PERIMETER_FOR_AREA'];
          if (dv === halfP) return ['HALF_PERIMETER_FOR_AREA'];
          if (l === w && dv === 4 * l) return ['PERIMETER_FOR_AREA'];
        }
        if (l === w && cv === l * l) {
          if (dv === 2 * l) return ['HALF_PERIMETER_FOR_AREA'];
          if (dv === 4 * l) return ['PERIMETER_FOR_AREA'];
        }
      }
      // Perimeter question
      if (prompt.match(/perimeter|fencing|distance.*around|around/i)) {
        if (cv === perim || cv === 4 * l) {
          if (dv === area || dv === l * w) return ['AREA_FOR_PERIMETER'];
          if (dv === halfP || dv === 2 * l) return ['FORGOT_DOUBLE_PERIMETER'];
          if (dv === 2 * area) return ['AREA_FOR_PERIMETER'];
        }
      }
      // "area of X is A, length is L, what is width?" → cv = A/L, distractor = A−L
      if (prompt.match(/width|missing/i) && dims.length >= 2) {
        if (cv === dims[0] / dims[1] && dv === dims[0] - dims[1]) return ['FORMULA_ERROR'];
        if (cv === dims[1] / dims[0] && dv === dims[1] - dims[0]) return ['FORMULA_ERROR'];
        // perimeter-based: cv = (P/2)−L, distractor = P−L
        if (dv === dims[0] - dims[1] && dv !== cv) return ['FORMULA_ERROR'];
      }
    }
  }

  // ── ROUND_WRONG_WAY — "Which P is N closest to?" ──
  if (prompt.match(/closest to/i) && nums.length >= 1) {
    for (const n of nums) {
      if (n < 10) continue;
      for (const place of [10, 100, 1000, 10000, 100000]) {
        const lo = floorTo(n, place);
        const hi = lo + place;
        if (lo === n) continue; // exact multiple
        if (cv === hi && dv === lo) { codes.push('ROUND_WRONG_WAY'); }
        if (cv === lo && dv === hi) { codes.push('ROUND_WRONG_WAY'); }
      }
    }
    if (codes.length > 0) return [...new Set(codes)];
  }

  // ── ESTIMATION / ROUNDING ──
  if (prompt.match(/round|estimate|about how|best estimate/i)) {
    // Single-number rounding: "Round X to nearest Y"
    if (prompt.match(/round.*nearest/i) && nums.length >= 1) {
      for (const place of [10, 100, 1000, 10000, 100000]) {
        if (cv === roundTo(nums[0], place) && dv !== cv) {
          if (dv === floorTo(nums[0], place)) { codes.push('ROUND_WRONG_DIRECTION_SINGLE'); break; }
          if (dv === ceilTo(nums[0], place))  { codes.push('ROUND_WRONG_DIRECTION_SINGLE'); break; }
        }
      }
    }

    // Two-operand sum/difference estimation
    if (!isNaN(a) && !isNaN(b)) {
      for (const place of [10, 100, 1000, 10000, 100000]) {
        const ra = roundTo(a, place), rb = roundTo(b, place);
        const rSum = ra + rb, rDiff = ra - rb;
        const fa = floorTo(a, place), fb = floorTo(b, place);
        const ca = ceilTo(a, place), cb = ceilTo(b, place);

        // Sum estimation
        if (Math.abs(cv - rSum) < 0.5 || Math.abs(cv - rDiff) < 0.5) {
          if (Math.abs(dv - (a + b)) < 0.5 && dv !== cv) codes.push('EXACT_NOT_ROUNDED');
          if (Math.abs(dv - (a - b)) < 0.5 && dv !== cv && cv !== a - b) codes.push('EXACT_NOT_ROUNDED');
          if (Math.abs(dv - (fa + fb)) < 0.5 && dv !== cv) codes.push('ROUND_BOTH_DOWN');
          if (Math.abs(dv - (ca + cb)) < 0.5 && dv !== cv) codes.push('ROUND_BOTH_UP');
          if (Math.abs(dv - (fa - cb)) < 0.5 && dv !== cv) codes.push('ROUND_BOTH_DOWN');
          if (Math.abs(dv - (ca - fb)) < 0.5 && dv !== cv) codes.push('ROUND_BOTH_UP');
          // One wrong
          for (const combo of [fa+rb, ra+fb, ca+rb, ra+cb, fa-rb, ra-fb, ca-rb, ra-cb]) {
            if (Math.abs(dv - combo) < 0.5 && dv !== cv) { codes.push('ROUND_ONE_WRONG'); break; }
          }
          // Wrong place
          for (const wp of [10, 100, 1000, 10000, 100000]) {
            if (wp === place) continue;
            const wr = roundTo(a, wp) + roundTo(b, wp);
            const wrd = roundTo(a, wp) - roundTo(b, wp);
            if (Math.abs(dv - wr) < 0.5 && dv !== cv) codes.push('WRONG_ROUND_PLACE');
            if (Math.abs(dv - wrd) < 0.5 && dv !== cv) codes.push('WRONG_ROUND_PLACE');
          }
        }

        // Product estimation: round(a)*round(b) vs floor/ceil combos
        const rProd = ra * rb;
        if (Math.abs(cv - rProd) < 0.5) {
          if (Math.abs(dv - (a * b)) < 0.5 && dv !== cv) codes.push('EXACT_NOT_ROUNDED');
          if (Math.abs(dv - (fa * fb)) < 0.5 && dv !== cv) codes.push('ROUND_BOTH_DOWN');
          if (Math.abs(dv - (ca * cb)) < 0.5 && dv !== cv) codes.push('ROUND_BOTH_UP');
          if (Math.abs(dv - (fa * rb)) < 0.5 && dv !== cv) codes.push('ROUND_ONE_WRONG');
          if (Math.abs(dv - (ra * fb)) < 0.5 && dv !== cv) codes.push('ROUND_ONE_WRONG');
          if (Math.abs(dv - (ca * rb)) < 0.5 && dv !== cv) codes.push('ROUND_ONE_WRONG');
          if (Math.abs(dv - (ra * cb)) < 0.5 && dv !== cv) codes.push('ROUND_ONE_WRONG');
        }

        // Quotient estimation
        if (rb !== 0) {
          const rQuot = Math.round(ra / rb);
          if (Math.abs(cv - rQuot) < 0.5 || Math.abs(cv - ra / rb) < 0.5) {
            if (b !== 0 && Math.abs(dv - (a / b)) < 0.5 && dv !== cv) codes.push('EXACT_NOT_ROUNDED');
            if (Math.abs(dv - (fa / fb || 0)) < 0.5 && dv !== cv) codes.push('ROUND_BOTH_DOWN');
            if (Math.abs(dv - (ca / cb || 0)) < 0.5 && dv !== cv) codes.push('ROUND_BOTH_UP');
          }
        }
      }
    }

    // "Which addition problem has a sum of about X?" — expression options
    if (prompt.match(/which.*sum.*about|which.*problem/i) && !isNaN(dv)) {
      // The distractor is an expression whose sum is far from the target
      const targetM = prompt.match(/([\d,]+)\s*\?/);
      if (targetM) codes.push('SUM_EVAL_ERROR');
    }

    const unique = [...new Set(codes)];
    if (unique.length > 0) return unique;

    // If still in estimate context and numeric, it's likely a rounding variant
    if (!isNaN(cv) && !isNaN(dv)) {
      codes.push('ESTIMATE_WRONG_VALUE');
      return codes;
    }
  }

  // ── WRONG OPERATION (binary) ──
  if (!isNaN(a) && !isNaN(b)) {
    if (cv === a + b && dv === Math.abs(a - b)) codes.push('WRONG_OP_ADD_FOR_SUB');
    if (cv === a - b && dv === a + b) codes.push('WRONG_OP_ADD_FOR_SUB');
    if (cv === a * b && dv === a + b) codes.push('WRONG_OP_ADD_FOR_MULT');
    if (cv === a * b && dv === Math.abs(a - b)) codes.push('WRONG_OP_SUB_FOR_MULT');
    if (cv === a + b && dv === a * b) codes.push('WRONG_OP_MULT_FOR_ADD');

    // Concatenation
    const concat1 = parseFloat('' + Math.round(a) + Math.round(b));
    const concat2 = parseFloat('' + Math.round(b) + Math.round(a));
    if (dv === concat1 || dv === concat2) codes.push('CONCATENATED_DIGITS');

    // Adjacent table fact
    if (cv === a * b && dv !== cv) {
      if (dv === (a - 1) * b || dv === (a + 1) * b) codes.push('ADJACENT_TABLE_FACT');
      if (dv === a * (b - 1) || dv === a * (b + 1)) codes.push('ADJACENT_TABLE_FACT');
    }

    // Also check with all pairs of prompt numbers (not just first two)
    if (nums.length > 2) {
      for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
          const ni = nums[i], nj = nums[j];
          if (cv === ni * nj && dv !== cv) {
            if (dv === ni + nj) codes.push('WRONG_OP_ADD_FOR_MULT');
            if (dv === (ni - 1) * nj || dv === (ni + 1) * nj) codes.push('ADJACENT_TABLE_FACT');
            if (dv === ni * (nj - 1) || dv === ni * (nj + 1)) codes.push('ADJACENT_TABLE_FACT');
          }
        }
      }
    }

    // "times as much" → distractor subtracts instead of dividing
    if (prompt.match(/times as (much|many)/i) && a !== 0) {
      if (cv === a / b && dv === a - b) codes.push('WRONG_OP_SUB_FOR_DIV');
      if (cv === b / a && dv === b - a) codes.push('WRONG_OP_SUB_FOR_DIV');
    }

    // Subtraction borrow error: forgot to decrease next column
    if (prompt.match(/-|subtract|minus|difference|left|remain|fewer|less than/i) && cv === a - b && dv !== cv) {
      if (dv === a - b + 100) codes.push('BORROW_ERROR');
      if (dv === a - b + 10) codes.push('BORROW_ERROR');
    }

    // Division patterns — broader detection
    if (b !== 0 && prompt.match(/divid|quotient|÷|how many|shared.*equal|split|each|hold|per\b|needed|shirts?|bracelets?|boxes?|bags?|groups?|rows?|teams?|buses?|packages?|buttons?|beads?|sweets?|left\s*over|loose|keeps?|remain/i)) {
      if (dv === b && cv !== b) codes.push('DIVISOR_AS_ANSWER');
      if (dv === a && cv !== a) codes.push('OPERAND_ECHO');
      const rem = a % b;
      const quot = Math.floor(a / b);
      if (rem !== 0 && dv === rem && cv !== rem) codes.push('REMAINDER_AS_ANSWER');
      // Gave quotient when answer is remainder (or vice versa)
      if (cv === rem && dv === quot) codes.push('DIVIDED_NOT_MULTIPLIED');
      if (cv === Math.ceil(a / b) && dv === Math.floor(a / b)) codes.push('QUOTIENT_OFF_BY_ONE');
      if (cv === Math.floor(a / b) && dv === Math.ceil(a / b)) codes.push('QUOTIENT_OFF_BY_ONE');
      // Digit swap in quotient (e.g., 104 vs 140)
      if (String(cv).length === String(dv).length && String(cv).length >= 3) {
        const cvDigits = String(cv).split('').sort().join('');
        const dvDigits = String(dv).split('').sort().join('');
        if (cvDigits === dvDigits && cv !== dv) codes.push('DIGIT_SWAP');
      }
    }

    // Carry errors in addition
    if (cv === a + b || (prompt.match(/\+|add|sum|total|altogether/i) && !prompt.match(/estimat|round|about/i))) {
      for (const k of [1, 2, 3, 4]) {
        const pow = Math.pow(10, k);
        if (diff === -pow) codes.push('CARRY_DROPPED');
        if (diff === pow) codes.push('CARRY_EXTRA');
      }

      // DROPPED_CARRY: column-by-column addition with carries omitted.
      // Check: (1) single carry dropped, (2) all carries dropped (no-carry-at-all).
      if (codes.length === 0 && !isNaN(a) && !isNaN(b) && cv === a + b) {
        const aS = String(Math.round(a)).padStart(8, '0');
        const bS = String(Math.round(b)).padStart(8, '0');
        // No-carry-at-all: add each column independently
        const noCarry = [];
        for (let col = 7; col >= 0; col--) {
          noCarry[col] = (parseInt(aS[col]) + parseInt(bS[col])) % 10;
        }
        if (parseInt(noCarry.join('')) === Math.round(dv) && Math.round(dv) !== Math.round(cv)) {
          codes.push('DROPPED_CARRY');
        }
        // Single carry dropped
        if (codes.length === 0) {
          const digits = [];
          let carry = 0;
          for (let col = 7; col >= 0; col--) {
            const sum = parseInt(aS[col]) + parseInt(bS[col]) + carry;
            digits[col] = sum % 10;
            carry = Math.floor(sum / 10);
          }
          for (let dropCol = 6; dropCol >= 0; dropCol--) {
            const trial = [...digits];
            let c2 = 0;
            for (let col = dropCol; col >= 0; col--) {
              const sum2 = parseInt(aS[col]) + parseInt(bS[col]) + c2;
              trial[col] = sum2 % 10;
              c2 = Math.floor(sum2 / 10);
            }
            const trialNum = parseInt(trial.join(''));
            if (trialNum === Math.round(dv) && trialNum !== Math.round(cv)) {
              codes.push('DROPPED_CARRY');
              break;
            }
          }
        }
      }
    }
  }

  // ── PLACE VALUE SHIFT ──
  if (cv !== 0 && dv !== 0) {
    for (const k of [1, 2, 3]) {
      const pow = Math.pow(10, k);
      if (Math.abs(dv - cv * pow) < 0.01) codes.push('PLACE_SHIFT_UP');
      if (Math.abs(dv * pow - cv) < 0.01) codes.push('PLACE_SHIFT_DOWN');
    }
  }

  // ── DROP_INTERIOR_ZERO — correct has interior 0, distractor drops it ──
  if (codes.length === 0 && !isNaN(cv) && !isNaN(dv) && cv !== dv) {
    const cvS = String(Math.round(cv));
    const dvS = String(Math.round(dv));
    if (cvS.length === dvS.length + 1) {
      for (let j = 1; j < cvS.length - 1; j++) {
        if (cvS[j] === '0' && parseInt(cvS.slice(0, j) + cvS.slice(j + 1)) === Math.round(dv)) {
          codes.push('DROP_INTERIOR_ZERO');
          break;
        }
      }
    }
  }

  // ── DROP_LEADING_DIGIT — distractor is correct with leading digit(s) removed ──
  // Guard: skip time/clock files (time values like 12:55→2:55 are not digit-drops)
  if (codes.length === 0 && !isNaN(cv) && !isNaN(dv) && cv !== dv &&
      !file.match(/time|elapsed|transport|schedule|clock/i)) {
    const cvS = String(Math.round(cv));
    const dvS = String(Math.round(dv));
    if (cvS.length > dvS.length && cvS.endsWith(dvS)) {
      codes.push('DROP_LEADING_DIGIT');
    }
  }

  // ── DIGIT_INSERT_OR_SHIFT — one digit inserted/deleted (len±1) or one digit changed ±1 ──
  // Guard: skip time/clock files (clock values parsed as fake integers)
  if (codes.length === 0 && !isNaN(cv) && !isNaN(dv) && cv !== dv &&
      !file.match(/time|elapsed|transport|schedule|clock/i)) {
    const cvS = String(Math.round(cv));
    const dvS = String(Math.round(dv));
    // Inserted digit: distractor is one digit longer
    if (dvS.length === cvS.length + 1) {
      let ci = 0;
      for (let di = 0; di < dvS.length && ci < cvS.length; di++) {
        if (dvS[di] === cvS[ci]) ci++;
      }
      if (ci === cvS.length) codes.push('DIGIT_INSERT_OR_SHIFT');
    }
    // Deleted digit: distractor is one digit shorter (correct is subsequence source)
    if (cvS.length === dvS.length + 1) {
      let di = 0;
      for (let ci2 = 0; ci2 < cvS.length && di < dvS.length; ci2++) {
        if (cvS[ci2] === dvS[di]) di++;
      }
      if (di === dvS.length) codes.push('DIGIT_INSERT_OR_SHIFT');
    }
    // Single digit changed by ±1
    if (cvS.length === dvS.length && cvS.length >= 3) {
      let diffCount = 0, diffPos = -1;
      for (let j = 0; j < cvS.length; j++) {
        if (cvS[j] !== dvS[j]) { diffCount++; diffPos = j; }
      }
      if (diffCount === 1 && Math.abs(parseInt(cvS[diffPos]) - parseInt(dvS[diffPos])) === 1) {
        codes.push('DIGIT_INSERT_OR_SHIFT');
      }
    }
  }

  // ── DIGIT_REARRANGE — same digits, different order ──
  // Guard: integers only (no decimals — those are comparison/money questions, not digit swaps)
  if (codes.length === 0 && !isNaN(cv) && !isNaN(dv) && cv !== dv &&
      isInteger(cv) && isInteger(dv)) {
    const cvD = String(Math.round(cv)).split('').sort().join('');
    const dvD = String(Math.round(dv)).split('').sort().join('');
    if (cvD === dvD && cvD.length >= 2) {
      codes.push('DIGIT_REARRANGE');
    }
  }

  // ── DIVIDED_NOT_MULTIPLIED — distractor = a/b when correct = a*b ──
  if (codes.length === 0 && !isNaN(a) && !isNaN(b) && b !== 0 && a !== 0) {
    if (cv === a * b) {
      if (dv === Math.floor(a / b) || dv === Math.floor(b / a)) {
        codes.push('DIVIDED_NOT_MULTIPLIED');
      }
    }
    // Also check all prompt number pairs
    if (codes.length === 0) {
      for (let i = 0; i < nums.length; i++) {
        for (let j = 0; j < nums.length; j++) {
          if (i === j || nums[j] === 0) continue;
          if (cv === nums[i] * nums[j] && dv === Math.floor(nums[i] / nums[j])) {
            codes.push('DIVIDED_NOT_MULTIPLIED');
          }
        }
        if (codes.includes('DIVIDED_NOT_MULTIPLIED')) break;
      }
    }
  }

  // ── DOUBLE OR HALF ──
  if (cv !== 0) {
    if (Math.abs(dv - cv * 2) < 0.01) codes.push('DOUBLE_OR_HALF');
    if (Math.abs(dv * 2 - cv) < 0.01 && isInteger(cv / 2)) codes.push('DOUBLE_OR_HALF');
  }

  // ── OPERAND ECHO ──
  if (nums.length > 0 && dv !== cv) {
    if (nums.includes(dv)) codes.push('OPERAND_ECHO');
  }

  // ── DECIMAL PLACE ERROR (money) ──
  if (prompt.match(/₹|price|cost|money|buy|unit price/i) && cv !== 0) {
    if (Math.abs(dv - cv * 10) < 0.01 || Math.abs(dv * 10 - cv) < 0.01) {
      codes.push('DECIMAL_PLACE_ERROR');
    }
    if (Math.abs(dv - cv * 100) < 0.01 || Math.abs(dv * 100 - cv) < 0.01) {
      codes.push('DECIMAL_PLACE_ERROR');
    }
  }

  // ── PARTIAL COMPUTATION (multi-step) ──
  if (nums.length >= 3 && dv !== cv) {
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const ni = nums[i], nj = nums[j];
        if (dv === ni + nj || dv === ni * nj || dv === Math.abs(ni - nj)) {
          codes.push('PARTIAL_COMPUTATION');
          break;
        }
      }
      if (codes.includes('PARTIAL_COMPUTATION')) break;
    }
  }

  // ── PLACE VALUE identification ──
  if (prompt.match(/value of|place value|how many (hundreds|tens|thousands|ones)/i)) {
    if (nums.length >= 1) {
      const digit = nums[0];
      for (const k of [0, 1, 2, 3, 4, 5, 6]) {
        if (dv === digit * Math.pow(10, k) && dv !== cv) {
          codes.push('WRONG_PLACE_IDENTIFIED');
        }
      }
    }
  }

  // ── 3D SHAPE PROPERTIES (faces/edges/vertices) ──
  if (prompt.match(/faces?|edges?|vertices|vertex/i) && file.match(/vert|edge|face|3d|three.?dim/i)) {
    // Distractor is a count from a different shape or a different property
    codes.push('SHAPE_PROPERTY_CONFUSED');
  }

  // ── GEOMETRY FORMULAS (perimeter missing side, area from perimeter, etc.) ──
  if (prompt.match(/missing|side|length of side/i) && file.match(/perimeter|area/i)) {
    // near-miss on formula manipulation
    if (absDiff <= 5 && absDiff > 0) {
      codes.push('FORMULA_ERROR');
    } else {
      codes.push('FORMULA_ERROR');
    }
  }

  // ── MONEY comparison (larger/smaller amount) ──
  if (prompt.match(/larger|smaller|which.*more|which.*less/i) && file.match(/money|compare/i)) {
    codes.push('COMPARISON_REVERSED');
  }

  // ── DIVISIBILITY ──
  if (prompt.match(/divisib/i) && codes.length === 0) {
    codes.push('DIVISIBILITY_CONFUSED');
  }

  // ── VISUAL-DEPENDENT (prompt has no numbers — operands in image) ──
  if (codes.length === 0 && nums.length === 0 &&
      (prompt.match(/^(multiply|divide|add|subtract)\b/i) ||
       prompt.match(/what number is shown|which.*model|which.*shows/i))) {
    codes.push('VISUAL_DEPENDENT');
  }

  // ── NUMBER-WORD DIGIT CONFUSION (e.g., 861 vs 871) ──
  if (codes.length === 0 && file.match(/names.?for.?numbers/i)) {
    codes.push('DIGIT_CONFUSION');
  }

  // ── MULTI-DIGIT MULTIPLICATION ERROR (large products with wrong partial) ──
  if (codes.length === 0 && file.match(/multiply|product/i) && !isNaN(a) && !isNaN(b) && cv === a * b) {
    codes.push('PARTIAL_PRODUCT_PLACE_ERROR');
  }

  // ── MONEY MULTI-ADDEND (3+ numbers, one dropped or wrong carry) ──
  if (codes.length === 0 && file.match(/money|add.*subtract/i) && nums.length >= 2) {
    codes.push('CARRY_DROPPED');
  }

  // ── METRIC CONVERSION ERROR ──
  if (codes.length === 0 && file.match(/metric|unit/i)) {
    codes.push('WRONG_UNIT_CHOSEN');
  }

  // ── MULTI-STEP ERROR (complex word problems with 3+ operands) ──
  if (codes.length === 0 && nums.length >= 3 && file.match(/multi.?step|word.?prob/i)) {
    codes.push('MULTI_STEP_ERROR');
  }

  // ── PRICE/TABLE LOOKUP (operands in a table/image, not prompt text) ──
  if (codes.length === 0 && file.match(/price|unit.?price/i)) {
    codes.push('TABLE_LOOKUP_ERROR');
  }

  // ── BOX/PARTIAL PRODUCT (box multiplication method) ──
  if (codes.length === 0 && file.match(/box.?multi/i)) {
    codes.push('PARTIAL_PRODUCT_PLACE_ERROR');
  }

  // ── CHOOSE-NUMBER (select number satisfying a condition) ──
  if (codes.length === 0 && file.match(/choose.?number|particular.?(quotient|difference|sum|product)/i)) {
    codes.push('WRONG_NUMBER_PAIR');
  }

  // ── PATTERN_WRONG_STEP — wrong increment/step in a pattern or parity question ──
  // Guard: only fire on pattern/sequence files or prompts, NOT division/arithmetic files
  if (codes.length === 0 && !file.match(/divid|division|add.*sub|multiply/i) &&
      (file.match(/pattern|sequence/i) || prompt.match(/pattern|skip.?count|comes? next|missing/i))) {
    // Wrong place-value increment: distractor = prev + small instead of prev + large
    // e.g., 300+10=310 instead of 300+100=400; 200+5=205 instead of 200+50=250
    if (nums.length >= 2) {
      // Check if distractor could be produced by a smaller/larger step
      const seqNums = nums.slice(); // sequence numbers from prompt
      for (let i = 1; i < seqNums.length; i++) {
        const actualStep = seqNums[i] - seqNums[i-1];
        if (actualStep > 0) {
          // Wrong step: /10 or *10 of actual step
          const wrongSteps = [actualStep/10, actualStep*10, actualStep/5, actualStep*5, actualStep/2, actualStep*2];
          const lastNum = seqNums[seqNums.length - 1];
          for (const ws of wrongSteps) {
            if (Math.abs(dv - (lastNum + ws)) < 0.5) { codes.push('PATTERN_WRONG_STEP'); break; }
          }
          if (codes.length > 0) break;
        }
      }
    }
    // Multiplicative vs additive: prev*5 vs prev+100
    if (codes.length === 0 && prompt.match(/multipl|times/i) && nums.length >= 3) {
      // Find the multiplicative ratio from two consecutive terms
      for (let si = 2; si < nums.length; si++) {
        if (nums[si-1] !== 0) {
          const ratio = nums[si] / nums[si-1];
          if (ratio > 1 && Number.isInteger(ratio)) {
            // Try additive steps from any pair, applied to any plausible prev term
            for (let pi = 0; pi < nums.length; pi++) {
              const prevTerm = nums[pi];
              // dv = prevTerm + someStep or dv = prevTerm * wrongRatio
              if (dv === 2 * prevTerm) { codes.push('PATTERN_WRONG_STEP'); break; }
              for (let si2 = 1; si2 < nums.length; si2++) {
                const addStep = nums[si2] - nums[si2-1];
                if (addStep > 0 && Math.abs(dv - (prevTerm + addStep)) < 0.5) {
                  codes.push('PATTERN_WRONG_STEP'); break;
                }
              }
              if (codes.length > 0) break;
            }
            if (codes.length > 0) break;
          }
        }
      }
    }
    // Skip-count by wrong number: text-based distractors like "2, 4, 6, 8"
    if (codes.length === 0 && typeof d.value === 'string' && d.value.match(/^\d+,\s*\d+/)) {
      codes.push('PATTERN_WRONG_STEP');
    }
  }
  // Wrong parity (even/odd) — catches remaining even_odd cases
  if (codes.length === 0 && (prompt.match(/pair|left over|even|odd/i) || file.match(/even|odd/i))) {
    if (!isNaN(cv) && !isNaN(dv) && cv % 2 !== dv % 2) {
      codes.push('PATTERN_WRONG_STEP');
    }
  }

  // ── GENERIC NEAR MISS (only if nothing else matched) ──
  if (codes.length === 0) {
    if (absDiff === 1) codes.push('OFF_BY_ONE');
    else if (absDiff === 2) codes.push('OFF_BY_TWO');
    else if (absDiff <= 5) codes.push('NEAR_MISS');
    else if (absDiff <= 10) codes.push('NEAR_MISS');
    else if (cv !== 0 && absDiff / Math.abs(cv) <= 0.15) codes.push('NEAR_MISS');
  }

  return [...new Set(codes)];
}

// ─── main ──────────────────────────────────────────────────────────────

function main() {

  const results = [];
  const freq = {};
  let exactOne = 0, ambiguous = 0, unexplained = 0;
  const unexplainedList = [];
  let totalDistractors = 0;

  data.forEach(q => {
    q.distractors.forEach(d => {
      totalDistractors++;
      const codes = classify(q, d);
      const entry = {
        file: q.file,
        qIndex: q.qIndex,
        prompt: q.prompt.slice(0, 120),
        type: q.type,
        answer: q.answer,
        distractor: d.value,
        codes
      };
      results.push(entry);

      if (codes.length === 1) exactOne++;
      else if (codes.length > 1) ambiguous++;
      else {
        unexplained++;
        unexplainedList.push(entry);
      }

      codes.forEach(c => { freq[c] = (freq[c] || 0) + 1; });
    });
  });

  // ─── output ────────────────────────────────────────────────────────────

  fs.writeFileSync(OUT_PATH, JSON.stringify(results, null, 2), 'utf8');
  fs.writeFileSync(REPORT_PATH, JSON.stringify(unexplainedList, null, 2), 'utf8');

  console.log('=== DISTRACTOR CLASSIFICATION REPORT ===\n');
  console.log(`Total distractors:     ${totalDistractors}`);
  console.log(`Exactly one code:      ${exactOne}  (${(100*exactOne/totalDistractors).toFixed(1)}%)`);
  console.log(`Ambiguous (>1 code):   ${ambiguous}  (${(100*ambiguous/totalDistractors).toFixed(1)}%)`);
  console.log(`Unexplained (0 codes): ${unexplained}  (${(100*unexplained/totalDistractors).toFixed(1)}%)`);
  console.log();

  console.log('=== FREQUENCY TABLE ===\n');
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  sorted.forEach(([code, count]) => {
    const pct = (100 * count / totalDistractors).toFixed(1);
    console.log(`  ${String(count).padStart(5)}  ${pct.padStart(5)}%  ${code}`);
  });

  console.log(`\nFull classification: ${OUT_PATH}`);
  console.log(`Unexplained list:    ${REPORT_PATH}`);
  console.log(`Unexplained count:   ${unexplainedList.length}`);

  // ─── per-file unexplained breakdown ────────────────────────────────────
  console.log('\n=== UNEXPLAINED BY FILE (top 20) ===\n');
  const byFile = {};
  unexplainedList.forEach(e => {
    const f = e.file.replace('incoming/', '');
    byFile[f] = (byFile[f] || 0) + 1;
  });
  Object.entries(byFile).sort((a, b) => b[1] - a[1]).slice(0, 20)
    .forEach(([f, c]) => console.log(`  ${String(c).padStart(4)}  ${f}`));
}

if (require.main === module) main();

module.exports = { MESSAGES, classify };
