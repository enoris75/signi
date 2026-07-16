# A15. Katakana nouns get hiragana furigana

**Language:** Japanese

The ruby-suppression rule is `reading === surface → no ruby`, but it compares literally, and a
katakana word's seeded reading is written in **hiragana**. `ネズミ` and its reading `ねずみ` are the
same word, so the comparison fails and the engine furiganas katakana with hiragana — `ネズミ[ねずみ]`.
Japanese never furiganas katakana.

| | |
|---|---|
| **Want** | No reading for `MOUSE` (ネズミ), `NODE` (ノード), `PHRASE` (フレーズ), `SLOT` (スロット), `SLOT_MACHINE` (スロットマシン). |
| **Fix** | Compare kana-insensitively in the engine so it holds however the corpus is seeded. |
| **Test** | `furigana.test.ts` → *known bugs: furigana* (5 tests) |

## Resolved

Fixed 2026-07-16.

- **Engine:** [`packages/engine/src/languages/ja.ts`](../../../packages/engine/src/languages/ja.ts),
  `wordSeg`. The ruby-suppression rule (`reading === surface → no ruby`) now compares kana-
  insensitively: a new `toHiragana` folds katakana to hiragana before the check, so a katakana word
  (ネズミ) seeded with a redundant hiragana reading (ねずみ) is recognised as the same word and takes
  no ruby. A kanji surface never folds to its all-kana reading, so it keeps its ruby — the fix is in
  the engine, so it holds however the corpus is seeded.
- **Tests:** [`packages/engine/test/furigana.test.ts`](../../../packages/engine/test/furigana.test.ts)
  → *known bugs: furigana*. The five pinning `test.fails` (MOUSE, NODE, PHRASE, SLOT, SLOT_MACHINE
  → no reading) are now passing, plus an added case showing the suppression is a property of the
  word, not the position — a katakana object contributes no ruby in a full sentence while the kanji
  words around it (猫→ねこ, 食べます→たべます) still do, with a regression guard that a kanji noun in the
  same slot keeps its reading (犬→いぬ).
