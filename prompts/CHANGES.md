# Prompt iteration log

Weighted overall score across the 10 briefs (weights: numbers 3, evidence 2, argument 2,
structure 1.5, caveats 1.5, voice 1, cover 1). Runs are uncached at temperature 0.5, so
per-rubric averages carry roughly ±0.03 of run-to-run grading noise — read small moves as flat.

| Version | Overall | cover | evidence | numbers | structure | caveats | voice | argument |
|---------|---------|-------|----------|---------|-----------|---------|-------|----------|
| v1 (original) | 0.911 | 0.392 | 0.920 | 0.993 | 0.950 | 0.951 | 0.942 | 0.966 |
| v2 | 0.957 | 0.840 | 0.960 | 0.994 | 0.975 | 0.923 | 0.961 | 0.966 |
| v3 | **0.971** | 0.965 | **1.000** | 0.996 | 0.942 | 0.945 | 0.941 | 0.964 |

## v1 → v2

Diagnosis from the v1 grader reasons:
- **cover (0.39)** was the dominant weakness. Concepts routinely (a) embedded rendered text —
  banners "reading tool names", stencilled 'FRAMEWORK', 'DeepSeek'/'Gemini' labels; (b) used
  palette/lighting words — "glowing", "floodlit", "spotlit", "out of focus"; (c) were diptychs /
  two competing images. All three violate the prompt's own house style ("no text", "subject and
  composition only", "one visual metaphor").
- **evidence (0.92, one brief 0.60)** — the model abbreviated repeated queries as "same query as
  above" or a prose description instead of reproducing the SQL, so the published "receipts" no
  longer matched the brief.

Changes:
- Rewrote the `cover_concept` instruction: ONE unified image (no diptych/split-frame); explicit
  ban on rendered text of any kind; explicit ban on palette/colour/lighting/mood/style/focus words;
  express contrast within a single scene via placement/scale/foreground.
- Evidence rule: reproduce the FULL query text character-for-character in every entry; never
  abbreviate or write "same query as above"; repeat a shared query in full.

Result: cover 0.39 → 0.84, evidence 0.92 → 0.96, overall 0.911 → 0.957. (caveats −0.028 was noise.)

## v2 → v3

Diagnosis from the v2 grader reasons (two cover stragglers):
- **#6 (0.30)** wrote "vermillion" into the concept — echoing the *locked house palette* back.
- **#10 (0.40)** still combined two metaphors (rocket trail + dam) for a two-force thesis.

Changes:
- Forbid naming the house palette in the concept ("vermillion", "warm paper").
- Strengthened the single-image rule: render two opposing forces as ONE subject, not a pair;
  added a concrete good/bad example (the winning nut-and-machine cover vs. a split-frame).

Result: cover 0.84 → 0.965, evidence 0.96 → 1.000, overall 0.957 → 0.971.

## Where to go next

Every rubric now averages ≥ 0.94; further single-run deltas are within noise. To push higher
reliably, set `repeat` in the provider/test config (e.g. 3×) so per-rubric averages stabilise
before chasing smaller gains, and consider a stronger/different grader model to reduce
same-model grading bias.
