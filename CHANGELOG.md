# Changelog

## 1.0.0 (2026-11-22)

First public release. It is the tree-height app used to measure trees on 2026-10-05 (kept as `tests/fixtures/tree_height_artifact_2026-10-05.html`). Heights are worked out exactly as in that version, and `tests/test_measure.mjs` checks that on 20,000 random cases.

Changes from that version:

- Runs on its own: a normal browser download for the CSV, the fonts built into the file so it works offline, and no outside requests.
- Fuller CSV: the height column is `Height_m` (it was labelled `Phenotype`), and each row also has the height in feet, the ± error, a status, the photo's file name and capture time, the reference as entered and in metres, the stick's and tree's lengths in pixels, when it was saved, and the quickmeasure version.
- Session files: **Save session** writes every point placed, on every photo, to a `.json` file; **Open session** reads it back, and the points come back when the same photos are added again. Points are also kept in the browser between visits.
- The reference mark can be entered in m, cm or ft.
- **Measuring: Trees / Objects** switches the wording, so it reads naturally for anything upright. In object mode the ID fields are ID, Group and Row.
- **Try an example** loads a drawing of a tree 5.4 m tall with a 3 m reference mark, to practise on.
- A footer with the version and how to cite it.
