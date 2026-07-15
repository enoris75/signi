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
