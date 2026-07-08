# stu-evals — Bellwether prompt evaluation

A [promptfoo](https://promptfoo.dev) harness that scores the Bellwether report-generation prompt
against the rubrics in [SPEC.md](SPEC.md), so you can iterate the prompt until the scores are high.

## Setup

```bash
npm install
cp .env.example .env   # then add your ANTHROPIC_API_KEY
```

## Run

```bash
npm run eval        # generate a report for each brief and score it
npm run view        # open the results web UI (per-rubric scores, diffs)
```

## What's under test vs. what's scaffolding

- **[currentprompt.md](currentprompt.md)** — the prompt you iterate. It is the *system message*.
- **[harness/prompt.js](harness/prompt.js)** — stable scaffolding: injects each brief and pins the
  JSON output schema. You normally don't edit this.
- **[harness/tests.js](harness/tests.js)** — one test case per row of the research-stories CSV.
- **[promptfooconfig.yaml](promptfooconfig.yaml)** — providers, and the 7 weighted rubric
  assertions (3 deterministic in `harness/asserts/`, 4 LLM-as-judge inline).

## The rubrics (see [SPEC.md](SPEC.md) for the full definitions)

| # | Rubric | Type | Weight |
|---|--------|------|--------|
| 1 | Numeric accuracy / no fabrication | deterministic | 3 |
| 2 | Evidence integrity (verbatim queries) | deterministic | 2 |
| 3 | Honest caveats | LLM-judge | 1.5 |
| 5 | Structure & schema | deterministic | 1.5 |
| 6 | Argument quality (the bar) | LLM-judge | 2 |
| 4 | Voice & tone | LLM-judge | 1 |
| 7 | Cover concept | LLM-judge | 1 |

## The iteration loop

1. `npm run eval`, then `npm run view` to read per-rubric scores and inspect failures.
2. Find the weakest rubric; diagnose why the prompt underperforms.
3. Edit `currentprompt.md`.
4. Re-run and compare (promptfoo keeps prior runs; `npm run view` shows the history).
5. Repeat until scores plateau high. Raise `defaultTest.threshold` as you go.

## Notes / tuning

- **Model**: set by `providers` and `defaultTest.options.provider` in the config. Default is
  `claude-sonnet-5` for both generation and grading — consider a stronger/different grader model.
- **Number provenance** classifies every figure in the prose as *exact* (verbatim in the brief),
  *derived* (a rounding/unit-expansion of a real brief figure, e.g. `39.11M`→"39.1 million" — tolerated
  and surfaced), or *fabricated* (unrelated to any brief number — **hard fail**). Only prose is checked;
  table/stats exhibits are not number-checked yet. Tune the derivation rule (or extend it to exhibits) in
  [harness/asserts/numberProvenance.js](harness/asserts/numberProvenance.js) — don't just lower the weight.
- **Baseline calibration**: running `npm run selftest` against the current CSV, the deterministic checks
  pass on all 10 reports except one number-provenance catch — story #3 asserts a base of "about 4,000"
  that isn't in its brief. That's a real finding, not a false positive.
- **Baseline**: each CSV row's `report` column is the current prompt's existing output, carried into
  each test as `baseline_report` for reference/regression comparison.
- `npm run selftest` runs the deterministic assertions against the CSV baseline reports — no API key
  needed — so you can sanity-check the checks themselves.
