#!/usr/bin/env node
/**
 * Guard: every file in lessons/ and tools/ must be tracked by git.
 * Untracked files in these directories have been lost twice to checkout.
 * Runs as part of npm test — red = do not ship.
 */
const { execSync } = require('child_process');

const dirs = ['lessons/', 'tools/'];
const untracked = [];

for (const dir of dirs) {
  const out = execSync(`git ls-files --others --exclude-standard ${dir}`, { encoding: 'utf8' }).trim();
  if (out) untracked.push(...out.split('\n'));
}

if (untracked.length > 0) {
  console.error('\x1b[31m✗ UNTRACKED FILES in lessons/ or tools/ — commit or .gitignore them:\x1b[0m');
  for (const f of untracked) console.error(`    ${f}`);
  console.error(`\n  ${untracked.length} untracked file(s). This guard exists because files were lost twice.`);
  process.exit(1);
} else {
  console.log('\x1b[32m✓\x1b[0m all files in lessons/ and tools/ are tracked');
}
