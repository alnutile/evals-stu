'use strict';
// RUBRIC 5: schema & structure. Sections are polymorphic by `type`:
//   prose -> {heading, body}   table -> {heading, columns[], rows[]}   stats -> {heading, items[]}
// "2-5 sections" is the count of NARRATIVE (prose) sections; table/stats are embedded exhibits.

const { extractJson } = require('../lib');

const str = (v) => typeof v === 'string' && v.trim() !== '';
const arr = (v) => Array.isArray(v) && v.length > 0;
// prose body may be a single string or an array of paragraph strings
const prose = (v) => str(v) || (arr(v) && v.every(str));

function sectionOk(s) {
  if (!s || !str(s.heading)) return false;
  switch (s.type) {
    case 'prose':
      return prose(s.body);
    case 'table':
      return arr(s.columns) && arr(s.rows);
    case 'stats':
      return arr(s.items);
    default:
      return prose(s.body) || arr(s.items) || arr(s.rows); // tolerate unknown types with a payload
  }
}

module.exports = (output) => {
  const r = extractJson(output);
  if (!r) return { pass: false, score: 0, reason: 'Output is not valid JSON.' };

  const checks = [];
  for (const k of ['kicker', 'title', 'dek', 'period', 'cover_concept', 'cover_alt', 'methodology']) {
    checks.push([`has ${k}`, str(r[k])]);
  }
  checks.push(['brief is 3-5 bullets', Array.isArray(r.brief) && r.brief.length >= 3 && r.brief.length <= 5]);

  const sections = Array.isArray(r.sections) ? r.sections : [];
  const narrative = sections.filter((s) => s && s.type === 'prose').length;
  checks.push([`2-5 narrative sections (has ${narrative})`, narrative >= 2 && narrative <= 5]);
  const badIdx = sections.map((s, i) => (sectionOk(s) ? -1 : i)).filter((i) => i >= 0);
  checks.push([`sections well-formed${badIdx.length ? ` (bad: ${badIdx.join(',')})` : ''}`, sections.length > 0 && badIdx.length === 0]);

  checks.push([
    'evidence non-empty & well-formed',
    Array.isArray(r.evidence) && r.evidence.length > 0 && r.evidence.every((e) => e && e.query && e.finding),
  ]);
  if (r.bets != null) {
    checks.push([
      'bets well-formed',
      Array.isArray(r.bets) && r.bets.every((b) => b && b.claim && b.rationale && b.confidence && b.horizon),
    ]);
  }

  const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
  return {
    pass: failed.length === 0,
    score: (checks.length - failed.length) / checks.length,
    reason: failed.length ? `Failed: ${failed.join('; ')}` : 'Schema and structure valid.',
  };
};
