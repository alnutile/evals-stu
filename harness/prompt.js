'use strict';
// Builds the chat prompt: `currentprompt.md` is the system message (the thing under test);
// the brief data + JSON output contract go in the user message (stable harness scaffolding).

const fs = require('fs');
const path = require('path');

const SYSTEM = fs.readFileSync(path.join(__dirname, '..', 'currentprompt.md'), 'utf8');

const SCHEMA = `Return ONE JSON object and nothing else — no markdown fences, no commentary — with exactly these keys:
{
  "kicker": string,            // overline
  "title": string,             // declarative, specific
  "dek": string,               // one-sentence standfirst
  "period": string,            // the window(s) covered
  "cover_concept": string,     // one visual metaphor; subject & composition only
  "cover_alt": string,         // plain alt-text for the cover
  "brief": string[],           // 3-5 bullet findings
  "sections": [{ "type": string, "heading": string, "body": string }],  // 2-5
  "methodology": string,       // sources, window, how figures were derived
  "evidence": [{ "query": string, "finding": string }],                 // the brief's query/result pairs, verbatim
  "bets": [{ "claim": string, "rationale": string, "confidence": string, "horizon": string }]  // from candidates; [] if none
}`;

module.exports = async function ({ vars }) {
  const user = `Here is the research brief. Turn it into a finished Bellwether issue.

TITLE (working): ${vars.title}

THESIS:
${vars.thesis}

PERIOD:
${vars.period}

FINDINGS (each with the exact query and result behind it):
${vars.findings}

PRIOR-COVERAGE CONTEXT:
${vars.context}

CANDIDATE BETS:
${vars.candidate_bets}

COVER IDEA:
${vars.cover_idea}

${SCHEMA}`;

  return [
    { role: 'system', content: SYSTEM },
    { role: 'user', content: user },
  ];
};
