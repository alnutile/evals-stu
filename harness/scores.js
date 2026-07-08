'use strict';
// Prints a per-rubric score summary for an exported promptfoo run.
// Usage: node harness/scores.js [results.json]   (defaults to .lastrun.json)
// Easiest: `npm run scores` (exports the latest eval, then runs this).

const fs = require('fs');

// Unique substrings that identify each assertion in the exported results.
const MATCH = {
  numbers: 'numberProvenance.js',
  evidence: 'evidenceIntegrity.js',
  structure: 'structure.js',
  caveats: 'HONEST CAVEATING',
  voice: 'grading the VOICE',
  argument: 'against its BAR',
  cover: 'cover_concept` field',
};
// Must mirror the weights in promptfooconfig.yaml.
const WEIGHT = { numbers: 3, evidence: 2, argument: 2, structure: 1.5, caveats: 1.5, voice: 1, cover: 1 };

const path = process.argv[2] || '.lastrun.json';
if (!fs.existsSync(path)) {
  console.error(`No results file at ${path}. Run \`npm run scores\`, or pass a path.`);
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(path, 'utf8'));
const results = (data.results && data.results.results) || data.results || [];

const agg = {};
const perTest = [];
for (const r of results) {
  const comps = (r.gradingResult && r.gradingResult.componentResults) || [];
  const row = { t: String((r.testCase && r.testCase.description) || '?').replace(/^#?\s*/, '').slice(0, 38) };
  for (const [name, needle] of Object.entries(MATCH)) {
    const c = comps.find((x) => String((x.assertion && x.assertion.value) || '').includes(needle));
    if (!c) continue;
    (agg[name] = agg[name] || []).push(c.score);
    row[name] = c.score;
  }
  perTest.push(row);
}

const cols = Object.keys(MATCH);
console.log(`\nScores across ${results.length} briefs (0-1, higher is better)\n`);
console.log('rubric'.padEnd(12) + 'average'.padStart(9) + 'lowest'.padStart(9));
let ws = 0;
let wt = 0;
for (const k of cols) {
  const v = agg[k] || [];
  if (!v.length) continue;
  const avg = v.reduce((a, b) => a + b, 0) / v.length;
  ws += avg * WEIGHT[k];
  wt += WEIGHT[k];
  console.log(k.padEnd(12) + avg.toFixed(3).padStart(9) + Math.min(...v).toFixed(2).padStart(9));
}
console.log('-'.repeat(30));
console.log('OVERALL'.padEnd(12) + (ws / wt).toFixed(3).padStart(9) + '  (weighted)');

console.log('\nLowest-scoring rubric per brief — this is where to focus the prompt:');
for (const row of perTest) {
  const scored = cols.filter((c) => row[c] != null).map((c) => [c, row[c]]);
  scored.sort((a, b) => a[1] - b[1]);
  const worst = scored[0];
  console.log('  ' + row.t.padEnd(40) + (worst ? `${worst[0]} = ${worst[1].toFixed(2)}` : '(no scores)'));
}
