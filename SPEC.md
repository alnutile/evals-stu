# Bellwether — Prompt Evaluation & Optimization

## Goal

Iteratively improve the Bellwether report-generation prompt ([currentprompt.md](currentprompt.md))
by building a [promptfoo](https://promptfoo.dev) eval harness that scores generated reports
against rubrics derived from the prompt's own goals and iron rules. Run the eval, find where the
prompt is weak, rewrite it, re-run — and keep going until the scores are consistently high.

## Assets

- **[currentprompt.md](currentprompt.md)** — the current system prompt. It turns a research brief
  into a finished "issue" of *Bellwether*, a serious print-broadsheet on the developer economy.
  Output is a JSON object with fields:
  `kicker`, `title`, `dek`, `period`, `cover_concept`, `cover_alt`, `brief[]`,
  `sections[]{type, heading, body}`, `methodology`, `evidence[]{query, finding}`,
  `bets[]{claim, rationale, confidence, horizon}`.

- **[bellwether-research-stories-2026-07-08.csv](bellwether-research-stories-2026-07-08.csv)** —
  10 research briefs (one per row). Columns:
  `story_no`, `title`, `thesis`, `period`, `findings`, `context`, `candidate_bets`, `cover_idea`,
  and `report`. Each `findings` cell contains the numbered findings *with the exact SQL query and
  its returned result* behind each one. The `report` column holds the JSON that the **current
  prompt already produced** for that brief — use it as the baseline to beat and as a regression
  anchor.

## Evaluation approach (promptfoo)

- Each CSV row is one test case; the brief columns (`title`, `thesis`, `period`, `findings`,
  `context`, `candidate_bets`, `cover_idea`) become prompt variables.
- The prompt generates a fresh JSON report per row.
- Reports are graded by the rubrics below using a mix of **deterministic checks** (schema,
  field counts, number-provenance) and **LLM-as-judge** assertions for the qualitative rubrics.

## Rubrics (derived from the prompt's goals and iron rules)

1. **Numeric accuracy / no fabrication** — every number in the prose appears in the brief.
   No invented or estimated figures. *(This is the prompt's non-negotiable; weight it highest.)*
2. **Evidence integrity** — the `evidence` array reproduces the brief's query/result pairs
   verbatim, and every number in the prose maps to an evidence entry.
3. **Honest caveats** — partial-current-month, snapshot-not-trend, and HN-skewed-sample
   limitations are flagged; a quiet period is reported plainly, never inflated.
4. **Voice & tone** — serious broadsheet (think the Economist): precise, calm, declarative.
   No hype, breathless adjectives, emoji, or "game-changer".
5. **Structure & schema** — all required fields present and well-formed; `brief` has 3–5 bullets;
   `sections` has 2–5 entries.
6. **Argument quality (the bar)** — one clear, specific argument about where the developer economy
   is moving (emergence/divergence); the reader finishes knowing something the feed wouldn't give
   them, and can trust it because the working is shown.
7. **Cover concept** — one strong visual metaphor for the argument, subject and composition only —
   never palette, style, or text (the image generator locks those).

## The iteration loop

1. Run promptfoo across all 10 briefs against the current prompt.
2. Read the per-rubric scores and inspect the failing cases.
3. Diagnose *why* the prompt underperforms on the weakest rubric(s).
4. Write an improved version of the prompt.
5. Re-run and compare against the previous version and the CSV baseline; keep the winner.
6. Repeat until scores plateau at a high level across all rubrics.

## Success criteria

- A reproducible promptfoo config that scores any prompt version over the 10 briefs.
- A revised prompt that beats the baseline `report` outputs on the weighted rubrics, with
  **zero** numeric-fabrication failures.
- A short record of what changed between prompt versions and why the score moved.
