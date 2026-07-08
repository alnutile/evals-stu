# CLAUDE.md

Guidance for Claude Code working in this repo. **If you are the human reading this: open this
folder in Claude Code and just say "help me use this" — Claude will read this file and walk you
through everything below.**

## What this project is

A test harness that scores the **Bellwether report-writing prompt** so it can be improved with
evidence instead of guesswork. It feeds 10 real research briefs to the AI, collects the reports it
writes, and grades each report on 7 rubrics. Built with [promptfoo](https://promptfoo.dev).

Plain-language handoff for a non-expert owner lives in `HISTORY.md`. Read it if the user is new to
evaluation, and explain things in that same simple tone.

## The prompt under test

`currentprompt.md` is the prompt being iterated — **this is the file the user edits to make things
better.** It is loaded as the system message. `harness/prompt.js` wraps it with the brief data and
pins the JSON output schema (that wrapper is stable scaffolding — don't edit it to change writing
quality; edit `currentprompt.md`).

Report JSON schema: `kicker, title, dek, period, cover_concept, cover_alt, brief[], sections[]
{type, heading, body}, methodology, evidence[]{query, finding}, bets[]{claim, rationale,
confidence, horizon}`. Sections are polymorphic by `type`: `prose` has `body` (string or array of
paragraphs), `table` has `columns[]`+`rows[]`, `stats` has `items[]`.

## The 7 rubrics (and weights)

Code-based (in `harness/asserts/`, exact, no model): **numbers** ×3 (no figure in the prose that
isn't in the brief; rounding a real figure is tolerated and labeled, an unrelated figure is a hard
fail), **evidence** ×2 (each `evidence.query` appears verbatim in the brief), **structure** ×1.5.
Model-judged (inline in `promptfooconfig.yaml`): **argument** ×2, **caveats** ×1.5, **voice** ×1,
**cover** ×1 (one image idea; no text/palette/lighting/style words; single unified scene).

## Commands

```bash
npm install                 # one-time
cp .env.example .env        # then add ANTHROPIC_API_KEY (required for eval)
npm run eval                # write + grade all 10 reports (~4 min, costs API tokens)
npm run scores              # per-rubric averages + where each brief is weakest
npm run view                # promptfoo web UI: every score + full reports + grader reasons
npm run selftest            # code-based checks against existing reports — no API key, free
```

## The improvement loop (how to help the user)

1. `npm run eval`, then `npm run scores` to see the weakest rubric.
2. Open the details with `npm run view` (or export: `promptfoo export eval latest -o out.json`) and
   **read the grader's reason** for the low scores — the fix follows from the reason, don't guess.
3. Before editing, copy the current prompt to `prompts/vN.md` so it can be rolled back.
4. Edit `currentprompt.md` to address the specific failure.
5. Re-run `npm run eval` + `npm run scores`; confirm the target rubric went up and nothing regressed.
6. Record the change and the score move in `prompts/CHANGES.md`.

Worked examples of this exact loop are in `prompts/CHANGES.md` (cover 0.39→0.97, evidence
0.92→1.00, overall 0.91→0.97).

## Important cautions

- **Scores carry ~±0.03 run-to-run noise** (uncached, temperature 0.5). Trust big moves; treat
  small ups/downs on rubrics you didn't touch as noise, not signal. To reduce it, add `repeat: 3`
  in `promptfooconfig.yaml` (slower, costs more).
- **Same model writes and grades** (`claude-sonnet-5` for both, set in `promptfooconfig.yaml`). For
  more trustworthy grades, set a different/stronger model as the grader (`defaultTest.options.provider`).
- `currentprompt.md` uses plain-space indentation; earlier versions had non-breaking spaces. If an
  exact-match edit ever fails, check for stray whitespace/unicode.
- Number provenance only checks prose, not table/stats exhibits yet — a documented tuning point in
  `harness/asserts/numberProvenance.js`.

## File map

- `currentprompt.md` — the prompt to iterate
- `prompts/` — saved versions (`v1`, `v2`, `v3`) + `CHANGES.md` (what changed, why, score deltas)
- `bellwether-research-stories-2026-07-08.csv` — the 10 briefs + their current reports
- `promptfooconfig.yaml` — providers + the 7 weighted rubrics
- `harness/` — `prompt.js`, `tests.js`, `lib.js`, `asserts/*`, `scores.js`, `selftest.js`
- `SPEC.md` — the project goal · `README.md` — technical details · `HISTORY.md` — plain-English handoff
