'use strict';
// Shared helpers for the Bellwether eval harness: CSV loading + JSON/number extraction.

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const ROOT = path.join(__dirname, '..');

/** Locate the research-stories CSV (env override, else the first *.csv in the repo root). */
function csvPath() {
  if (process.env.BELLWETHER_CSV) return path.resolve(process.env.BELLWETHER_CSV);
  const hit = fs.readdirSync(ROOT).find((f) => f.toLowerCase().endsWith('.csv'));
  if (!hit) throw new Error('No .csv found in repo root; set BELLWETHER_CSV.');
  return path.join(ROOT, hit);
}

/** Parse the CSV into row objects with clean column keys. */
function loadRows() {
  const raw = fs.readFileSync(csvPath(), 'utf8');
  const rows = parse(raw, {
    bom: true,
    skip_empty_lines: true,
    relax_quotes: true,
    ltrim: true,
    rtrim: true,
    // strip stray surrounding quotes/space that leak into the header (" story_no")
    columns: (header) => header.map((h) => String(h).trim().replace(/^"+|"+$/g, '').trim()),
  });
  return rows;
}

/** Coerce a model response into a report object (tolerates ```json fences and prose wrappers). */
function extractJson(output) {
  if (output == null) return null;
  if (typeof output === 'object') return output;
  let s = String(output).trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) s = s.slice(start, end + 1);
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

/** Normalize one numeric token: drop thousands separators and trailing-zero noise. */
function normNum(m) {
  let n = m.replace(/,/g, '');
  if (n.includes('.')) n = n.replace(/0+$/, '').replace(/\.$/, '');
  return n;
}

/** Extract all numeric tokens from a string (ints, decimals, thousands-separated). */
function extractNumbers(text) {
  if (!text) return [];
  const matches = String(text).match(/\d[\d,]*(?:\.\d+)?/g) || [];
  return matches.map(normNum);
}

/** Whitespace/case-normalize text for verbatim substring matching. */
function normalize(s) {
  return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Collect the narrative prose of a report (excludes evidence SQL and the cover fields).
 *  Section `body` may be a string or an array of paragraph strings. */
function collectProse(r) {
  const parts = [r.kicker, r.title, r.dek, r.period, r.methodology];
  if (Array.isArray(r.brief)) parts.push(...r.brief);
  if (Array.isArray(r.sections)) {
    for (const s of r.sections) {
      if (!s) continue;
      parts.push(s.heading);
      if (Array.isArray(s.body)) parts.push(...s.body);
      else parts.push(s.body);
    }
  }
  return parts.filter((x) => typeof x === 'string' && x).join('\n');
}

module.exports = { csvPath, loadRows, extractJson, extractNumbers, normalize, collectProse };
