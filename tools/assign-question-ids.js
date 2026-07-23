#!/usr/bin/env node
/* ── assign-question-ids.js — GIVE EVERY QUESTION A PERMANENT NAME (BRIEF-ID-1) ──
 *
 * Walks lessons/ (NEVER lessons-g3/). For each question that
 * LACKS an `id:` in its @q frontmatter, generates a fresh opaque id
 *   q + 8 chars from  23456789abcdefghijkmnpqrstuvwxyz   (Crockford: no 0/o/1/l/u)
 * and inserts it as the FIRST line of that block's frontmatter. A question that
 * already has an id is left byte-for-byte untouched — that is what makes reruns
 * safe (idempotent).
 *
 * Uniqueness is enforced by explicit check, never probability: a new id must not
 * collide with any id already in the corpus OR any id in the append-only ledger
 * docs/question-ids.json (which remembers ids of DELETED questions too, so an id
 * is never reused). Opacity is enforced per lesson: if a lesson's freshly issued
 * ids happen to fall in document order, one is re-rolled before anything is
 * written or ledgered.
 *
 * Halts (loud, non-destructive):
 *   - >3 consecutive collisions          (broken RNG, not bad luck)
 *   - @q / question-div count changes     (would corrupt identity)
 *   - a file no longer parses its blocks  (restores the file, stops)
 *
 * The only byte delta to any file is inserted `id:` lines. No reformatting.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const LEDGER = path.join(ROOT, "docs", "question-ids.json");
const ALPHABET = "23456789abcdefghijkmnpqrstuvwxyz"; // 32 chars, Crockford-ish
const C = { r: "\x1b[31m", g: "\x1b[32m", b: "\x1b[1m", y: "\x1b[33m", x: "\x1b[0m" };

function die(msg) { console.error(`${C.r}HALT${C.x} — ${msg}`); process.exit(1); }

function scanSet() {
  const out = [];
  const top = path.join(ROOT, "lessons");
  for (const e of fs.readdirSync(top, { withFileTypes: true }))
    if (e.isFile() && e.name.endsWith(".html")) out.push(path.join(top, e.name));
  // lessons/incoming/ was merged into lessons/ (BRIEF-CONSOLIDATE-1 Step 2) — one folder now.
  return out.sort();
}

function freshId() {
  let s = "q";
  const buf = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) s += ALPHABET[buf[i] % 32];
  return s;
}

// blocks in document order: { full, fm, id (existing or null), descr }
function parseBlocks(html) {
  const re = /<!--@q\b([\s\S]*?)-->/g;
  const out = [];
  let m;
  while ((m = re.exec(html))) {
    const fm = m[1];
    const idm = fm.match(/^[ \t]*id:[ \t]*(\S+)[ \t]*$/m);
    const dm = fm.match(/^[ \t]*description:[ \t]*(.*)$/m);
    out.push({ full: m[0], fm, index: m.index, id: idm ? idm[1] : null,
      descr: dm ? dm[1].trim().replace(/^["']|["']$/g, "") : "" });
  }
  return out;
}

function countMarkers(html) {
  return {
    q: (html.match(/<!--@q\b/g) || []).length,
    div: (html.match(/<div\s+class="question"/g) || []).length,
  };
}

(async () => {
  console.log(`\n${C.b}ASSIGN QUESTION IDS${C.x} — permanent opaque id per question (BRIEF-ID-1)\n`);

  // ── load ledger (append-only) ──
  let ledger = [];
  if (fs.existsSync(LEDGER)) {
    try { ledger = JSON.parse(fs.readFileSync(LEDGER, "utf8")); }
    catch (e) { die(`ledger ${path.relative(ROOT, LEDGER)} is not valid JSON: ${e.message}`); }
    if (!Array.isArray(ledger)) die("ledger must be a JSON array");
  }
  const seen = new Set(ledger.map((e) => e.id)); // every id ever issued, incl. deleted
  console.log(`  ledger: ${ledger.length} id(s) previously issued\n`);

  // first pass: collect every id already present in the corpus (so a new id
  // can't collide with a live one either), and detect pre-existing collisions.
  const files = scanSet();
  const fileBlocks = files.map((f) => ({ f, html: fs.readFileSync(f, "utf8") }));
  fileBlocks.forEach((r) => (r.blocks = parseBlocks(r.html)));
  for (const r of fileBlocks)
    for (const b of r.blocks)
      if (b.id) {
        if (seen.has(b.id)) { /* already ledgered/seen — fine, it's the same id */ }
        seen.add(b.id);
      }

  const mkUnique = () => {
    let tries = 0;
    while (true) {
      const id = freshId();
      if (!seen.has(id)) { seen.add(id); return id; }
      if (++tries > 3) die(`>3 consecutive id collisions — RNG is broken, not unlucky`);
    }
  };

  let totalAssigned = 0;
  const perLesson = [];
  const newLedger = [];

  for (const r of fileBlocks) {
    const rel = path.relative(ROOT, r.f).replace(/\\/g, "/");
    const before = countMarkers(r.html);
    const qBefore = r.blocks.length;

    // assign ids to blocks lacking one
    const assignedThis = [];
    for (const b of r.blocks) {
      if (b.id) continue;
      b.id = mkUnique();
      b.assigned = true;
      assignedThis.push(b);
    }

    // opacity safeguard: if this lesson's full doc-order id list is already
    // ascending, re-roll one freshly-assigned id (only new ids may change).
    if (r.blocks.length >= 2 && assignedThis.length) {
      let guard = 0;
      const ascending = () => {
        const ids = r.blocks.map((b) => b.id);
        const sorted = [...ids].sort();
        return ids.every((v, i) => v === sorted[i]);
      };
      while (ascending() && guard++ < 50) {
        const victim = assignedThis[assignedThis.length - 1];
        seen.delete(victim.id);          // it was never written/ledgered yet
        victim.id = mkUnique();
      }
      if (ascending()) die(`${rel}: could not break document-order id opacity after 50 re-rolls`);
    }

    // rebuild the file: insert `id:` as the first frontmatter line of each
    // assigned block. Preserve every other byte.
    let html = r.html, rebuilt = "", cursor = 0;
    // re-locate blocks against the ORIGINAL html by their stored full text
    for (const b of r.blocks) {
      if (!b.assigned) continue;
      const at = html.indexOf(b.full, cursor);
      if (at < 0) die(`${rel}: could not re-locate a question block to insert its id`);
      const nlMatch = b.full.match(/^<!--@q(\r?\n)/);
      if (!nlMatch) die(`${rel}: a @q block does not open with a newline; refusing to guess placement`);
      const nl = nlMatch[1];
      const newBlock = b.full.replace(/^<!--@q(\r?\n)/, `<!--@q${nl}id: ${b.id}${nl}`);
      rebuilt += html.slice(cursor, at) + newBlock;
      cursor = at + b.full.length;
      newLedger.push({ id: b.id, file: rel, description: b.descr });
    }
    rebuilt += html.slice(cursor);

    // verify: markers unchanged, every block now has an id, block count stable
    const after = countMarkers(rebuilt);
    const reblocks = parseBlocks(rebuilt);
    if (after.q !== before.q || after.div !== before.div)
      die(`${rel}: marker count changed (@q ${before.q}->${after.q}, div ${before.div}->${after.div}) — file NOT written`);
    if (reblocks.length !== qBefore)
      die(`${rel}: question count changed ${qBefore}->${reblocks.length} after write-prep — NOT written`);
    if (assignedThis.length && !reblocks.every((b) => b.id))
      die(`${rel}: a block still lacks an id after assignment — NOT written`);

    if (assignedThis.length) fs.writeFileSync(r.f, rebuilt);
    perLesson.push({ file: rel, before: qBefore, after: reblocks.length, assigned: assignedThis.length });
    totalAssigned += assignedThis.length;
  }

  // append to ledger (append-only) and write
  if (newLedger.length) {
    const merged = ledger.concat(newLedger);
    fs.mkdirSync(path.dirname(LEDGER), { recursive: true });
    fs.writeFileSync(LEDGER, JSON.stringify(merged, null, 2) + "\n");
  }

  // report
  const totBefore = perLesson.reduce((s, r) => s + r.before, 0);
  const totAfter = perLesson.reduce((s, r) => s + r.after, 0);
  console.log(`  ${"lesson".padEnd(64)} before after assigned`);
  for (const r of perLesson)
    console.log(`  ${r.file.padEnd(64)} ${String(r.before).padStart(6)} ${String(r.after).padStart(5)} ${String(r.assigned).padStart(8)}`);
  console.log(`\n  TOTALS: before ${totBefore} · after ${totAfter} · assigned ${totalAssigned}`);
  console.log(`  ledger now holds ${ledger.length + newLedger.length} id(s)\n`);
  if (totBefore !== totAfter) die(`corpus question count changed ${totBefore} -> ${totAfter}`);
  console.log(`${C.g}done — ${totalAssigned} id(s) assigned this run${C.x}\n`);
})().catch((e) => { console.error("assign-question-ids crashed:", e); process.exit(1); });
