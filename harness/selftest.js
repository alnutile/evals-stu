'use strict';
// Runs the deterministic assertions against each row's existing `report` (the baseline the
// current prompt already produced). No API key needed — validates the harness and the checks.

const { loadRows } = require('./lib');
const numberProvenance = require('./asserts/numberProvenance');
const evidenceIntegrity = require('./asserts/evidenceIntegrity');
const structure = require('./asserts/structure');

const rows = loadRows();
console.log(`Self-test over ${rows.length} baseline reports\n`);

for (const r of rows) {
  const ctx = { vars: r };
  const out = r.report;
  const results = {
    structure: structure(out, ctx),
    numberProvenance: numberProvenance(out, ctx),
    evidenceIntegrity: evidenceIntegrity(out, ctx),
  };
  console.log(`#${r.story_no} — ${String(r.title).slice(0, 70)}`);
  for (const [name, res] of Object.entries(results)) {
    const mark = res.pass ? 'PASS' : 'FAIL';
    console.log(`  [${mark}] ${name} (${res.score.toFixed(2)}) — ${res.reason}`);
  }
  console.log('');
}
