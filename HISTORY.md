# Bellwether prompt testing — handoff notes

Hi! This note explains, in plain language, what's in this folder, what was done, and how you
can keep improving the Bellwether report-writing prompt yourself. No prior experience with
"evaluations" needed.

## The one-paragraph version

You have a prompt that turns a research brief into a finished Bellwether issue. Instead of
*guessing* whether a change to that prompt makes it better or worse, we built a little grading
system. It feeds your 10 real story briefs to the AI, collects the reports it writes, and scores
each report on 7 things you care about (accuracy, voice, honest caveats, etc.). Now, whenever you
tweak the prompt, you can re-run it and *see* the scores go up or down. We used exactly this to
find one weak spot and fix it — the overall score went from **0.91 to 0.97 out of 1.0**.

## A few words you'll see

- **Prompt** — the instructions we give the AI. Yours lives in `currentprompt.md`.
- **Brief** — one row of the spreadsheet: a story's thesis, findings, data, cover idea, etc.
- **Report** — what the AI writes from a brief (the finished issue).
- **Rubric** — one thing we grade for (e.g. "did it invent any numbers?").
- **Eval** — one full run: write all 10 reports and grade them.
- **Score** — a number from 0 to 1 for each rubric. Higher is better.

## The 7 things we grade

Three are checked by plain code (exact, no opinions):
1. **No made-up numbers** — every figure in the writing traces back to the brief.
2. **Evidence matches** — the queries shown as "receipts" are copied from the brief word-for-word.
3. **Right structure** — all the required parts are present and well-formed.

Four are judged by a second AI acting as an editor:
4. **Honest caveats** — it admits the data's limits and doesn't oversell a quiet period.
5. **Voice** — reads like a serious newspaper, not a hype-y tech blog.
6. **Argument** — one clear, well-supported point the reader couldn't get from the feed.
7. **Cover concept** — one strong image idea, no text/colors/style words (the art tool locks those).

## What we actually did

1. Built the grading system and made sure it agreed with your existing reports.
2. Ran it once. Everything looked fine *except* the **cover concept** rubric, which scored a low
   **0.39** — the AI kept describing signs with words on them, lighting, and split "before/after"
   images, all of which your house style forbids.
3. Edited the prompt to spell those rules out clearly, and re-ran. Cover jumped to **0.84**.
4. Looked at what was still failing, edited once more (with a good/bad example), and re-ran.
   Cover reached **0.97**, and the "evidence matches" rubric reached a perfect **1.00**.

Every prompt version is saved in the `prompts/` folder, and `prompts/CHANGES.md` records exactly
what changed at each step and how the scores moved.

## How to run it yourself

One-time setup:

```bash
npm install                 # installs the tools
cp .env.example .env        # then paste your Anthropic API key into .env
```

(The API key is what lets the tool talk to the AI. Each full run costs a little money and takes
about 4 minutes.)

Then, any time:

```bash
npm run eval                # write all 10 reports and grade them
npm run view                # open a web page showing every score and report
```

Want to sanity-check the code-based graders without spending anything? `npm run selftest`.

## How to make the prompt better (the loop)

1. Run `npm run eval`, then `npm run view`.
2. Look for the **lowest scores** — that's where the prompt is weakest.
3. Read *why* it lost points (the grader explains itself), then edit `currentprompt.md` to address it.
4. Run it again and check the scores moved the right way.
5. Repeat until you're happy. Tip: before a big change, copy `currentprompt.md` into `prompts/`
   (e.g. `prompts/v4.md`) so you can always go back.

## Two honest notes

- **Scores wiggle a little** between runs (roughly give-or-take 0.03), because the AI doesn't write
  identically every time. So trust *big* moves; ignore tiny ones. If you want steadier numbers,
  ask an engineer to turn on "repeat 3×" in `promptfooconfig.yaml`.
- Right now the same AI model both writes and grades. Using a different model as the grader would
  make the scores a bit more trustworthy — a small change an engineer can make in the same file.

## Where everything lives

- `currentprompt.md` — the prompt (edit this to improve things)
- `prompts/` — every saved version + `CHANGES.md` (the story of what changed and why)
- `bellwether-research-stories-2026-07-08.csv` — the 10 briefs and their current reports
- `promptfooconfig.yaml` — the grading setup (the 7 rubrics and their weights)
- `SPEC.md` / `README.md` — the goal and the technical details
