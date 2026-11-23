// Checks that quickmeasure works out heights exactly as the version used to measure the trees did
// (tests/fixtures/tree_height_artifact_2026-10-05.html), and that the repo's copies agree with each other.
//
// Run from the repository root with Node 18 or newer:   node tests/test_measure.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const app = readFileSync("index.html", "utf8");
const original = readFileSync("tests/fixtures/tree_height_artifact_2026-10-05.html", "utf8");

// 1. Pull the height function out of each page and run both on the same points
function extract(html, name) {
  const m = html.match(new RegExp(`function ${name}\\([^)]*\\)\\{[\\s\\S]*?\\n\\}\\n`));
  assert.ok(m, `couldn't find function ${name}`);
  return m[0];
}
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function load(html) {
  const state = { ref: 3 };
  const fn = new Function("state", "dist", extract(html, "measureTree") + "\nreturn measureTree;")(state, dist);
  return { state, fn };
}
const before = load(original), after = load(app);

// The function's text should be unchanged too
assert.equal(extract(app, "measureTree"), extract(original, "measureTree"), "measureTree's code differs from the original");

// Random points from a fixed seed, so every run checks the same 20,000 cases
let seed = 20261005;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const pt = () => ({ x: rand() * 6000, y: rand() * 4000, e: 0.75 + rand() * 3 });
let checked = 0;
for (let i = 0; i < 20000; i++) {
  const ref = [3, 2, 1.5, 0.3048 * 10, 0.01 * 250, rand() * 5 + 0.1][i % 6];
  before.state.ref = ref; after.state.ref = ref;
  const p = { stick: [pt(), pt()] }, t = { pts: [pt(), pt()] };
  const a = before.fn(p, t), b = after.fn(p, t);
  assert.deepEqual(b, a, `case ${i} gives a different result`);
  if (a) checked++;
}

// A hand-worked case: stick 3 m over 600 px, tree over 1,080 px, so 5.4 m
after.state.ref = 3;
const hand = after.fn({ stick: [{ x: 0, y: 1040, e: 0 }, { x: 0, y: 440, e: 0 }] }, { pts: [{ x: 10, y: 1040, e: 0 }, { x: 10, y: -40, e: 0 }] });
assert.ok(Math.abs(hand.h - 5.4) < 1e-12, `hand-worked case gave ${hand.h}`);

// 2. The example drawing inside the page is the same as examples/example_tree.svg
const svg = readFileSync("examples/example_tree.svg", "utf8").replace(/\n$/, "");
const inPage = app.match(/const EXAMPLE_SVG = `([\s\S]*?)`;/)[1];
assert.equal(inPage, svg, "the example drawing in index.html is out of date: run python3 tools/embed_assets.py");

// 3. The version is the same in the app and in CITATION.cff
const version = app.match(/const VERSION = "([^"]+)"/)[1];
const cff = readFileSync("CITATION.cff", "utf8").match(/^version: "?([^"\n]+)"?$/m)[1];
assert.equal(cff, version, "CITATION.cff and index.html give different versions");

console.log(`ok: ${checked} heights identical to the 2026-10-05 version; example drawing and version (${version}) in step`);
