'use strict';
// Turns each row of the research-stories CSV into a promptfoo test case.
// The brief columns become prompt vars; `report` is carried as the baseline to beat.

const { loadRows } = require('./lib');

module.exports = async function () {
  return loadRows().map((r) => ({
    description: `#${r.story_no || '?'}: ${r.title || '(untitled)'}`,
    vars: {
      story_no: r.story_no,
      title: r.title,
      thesis: r.thesis,
      period: r.period,
      findings: r.findings,
      context: r.context,
      candidate_bets: r.candidate_bets,
      cover_idea: r.cover_idea,
      baseline_report: r.report, // the current prompt's output, for reference/regression
    },
  }));
};
