'use strict';
// RUBRIC 1 (weighted highest): no fabricated figures.
// Every numeric token in the report's prose must trace to the brief. We distinguish:
//   - exact      : the number appears verbatim in the brief
//   - derived    : a rounding / unit-expansion of a real brief figure (e.g. 39.11M -> "39.1 million",
//                  352k -> "352,000", 141,560,512 -> "141 million"). Tolerated but surfaced.
//   - fabricated : a figure with no relation to any brief number. HARD FAIL.
// NOTE: only prose is checked (title, dek, kicker, period, brief[], section headings/bodies,
// methodology). Table/stats exhibits are not number-checked yet — a documented tuning point.

const { extractJson, extractNumbers, collectProse } = require('../lib');

const digits = (s) => s.replace(/\D/g, '');

// n is a rounding/expansion of some source token if their digit-strings are prefix-related
// (shorter length >= 2, so "4" doesn't spuriously match "4000").
function isDerived(n, sourceTokens) {
  const dn = digits(n);
  if (dn.length < 2) return false;
  return sourceTokens.some((s) => {
    const ds = digits(s);
    if (Math.min(dn.length, ds.length) < 2) return false;
    return ds.startsWith(dn) || dn.startsWith(ds);
  });
}

module.exports = (output, context) => {
  const vars = (context && context.vars) || {};
  const report = extractJson(output);
  if (!report) return { pass: false, score: 0, reason: 'Output is not valid JSON.' };

  const sourceTokens = extractNumbers(
    [vars.thesis, vars.period, vars.findings, vars.context, vars.candidate_bets, vars.title, vars.cover_idea].join('\n'),
  );
  const sourceSet = new Set(sourceTokens);
  const used = [...new Set(extractNumbers(collectProse(report)))];

  let exact = 0;
  let derived = 0;
  const fabricated = [];
  for (const n of used) {
    if (sourceSet.has(n)) exact++;
    else if (isDerived(n, sourceTokens)) derived++;
    else fabricated.push(n);
  }

  const total = used.length;
  const score = total === 0 ? 1 : (exact + derived) / total;
  return {
    pass: fabricated.length === 0,
    score,
    reason: fabricated.length
      ? `Figures not traceable to the brief (unsupported): ${fabricated.slice(0, 20).join(', ')}` +
        (derived ? ` — plus ${derived} rounded/derived (ok).` : '')
      : `All ${total} figures trace to the brief (${exact} exact, ${derived} rounded/derived).`,
  };
};
