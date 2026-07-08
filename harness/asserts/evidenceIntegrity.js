'use strict';
// RUBRIC 2: evidence integrity. Each evidence.query must appear verbatim in the brief
// (whitespace/case-normalized), so the published methodology matches the editor's receipts.

const { extractJson, normalize } = require('../lib');

module.exports = (output, context) => {
  const vars = (context && context.vars) || {};
  const r = extractJson(output);
  if (!r) return { pass: false, score: 0, reason: 'Output is not valid JSON.' };
  if (!Array.isArray(r.evidence) || r.evidence.length === 0) {
    return { pass: false, score: 0, reason: 'No evidence array in the report.' };
  }

  const src = normalize([vars.findings, vars.context].join('\n'));
  const missing = [];
  let matched = 0;
  for (const e of r.evidence) {
    const q = normalize(e && e.query);
    if (q && src.includes(q)) matched++;
    else missing.push((e && e.query ? String(e.query) : '(empty)').slice(0, 70));
  }

  const score = matched / r.evidence.length;
  return {
    pass: score >= 0.999,
    score,
    reason: missing.length
      ? `${missing.length}/${r.evidence.length} evidence queries not found verbatim in the brief, e.g.: ${missing[0]}`
      : `All ${r.evidence.length} evidence queries trace verbatim to the brief.`,
  };
};
