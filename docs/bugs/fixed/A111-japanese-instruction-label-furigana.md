# A111. A Japanese instruction label carries no furigana

**Language:** Japanese

An `instruction` command renders the verbal noun (C03). `jaImperativeSegs`
(`languages/ja/jaImperativeSegs.ts`) takes it from the ja lexeme's `label` form when there is one, and
emits it as `wordSeg(label)`, with no reading. The corpus seeds no reading for the label. So the
eight labelled verbs lose their furigana, while unlabelled verbs keep theirs because their label
comes from the masu-stem, which has a reading (`食べ` → `たべ`):

TYPE `入力`, SAVE `保存`, LOAD `読み込み`, ADD `追加`, EXPORT `書き出し`, IMPORT `取り込み`, CLEAR `消去`,
COORDINATE `調整`.

| Plan (instruction, object BOOK) | Now (readings) | Want (readings) |
|---|---|---|
| SAVE → `本を保存。` | `['ほん']` | `['ほん', 'ほぞん']` |
| LOAD → `本を読み込み。` | `['ほん']` | `['ほん', 'よみこみ']` |

Already right: EAT → `本を食べ。` reads `['ほん', 'たべ']`.

The text is correct; only the ruby is missing. These are the words the UI puts on its own buttons.

## Shape of the fix

Seed `label_reading` next to `label` on the eight ja lexemes: `にゅうりょく`, `ほぞん`, `よみこみ`,
`ついか`, `かきだし`, `とりこみ`, `しょうきょ`, `ちょうせい`. Pass it to `wordSeg(label, reading)`. As an
engine-only fallback, when the label is a prefix of the masu-stem (`保存し`), take the matching prefix
of the stem's reading.

| | |
|---|---|
| **Test** | `furigana.test.ts` → *known bugs: Japanese instruction label furigana* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 with both parts of the shape the fix proposed.

- **Corpus:** the eight ja lexemes in [`transitive.ts`](../../../packages/backend/src/concepts/verbs/transitive.ts)
  carry `label_reading` next to `label`: `にゅうりょく`, `ほぞん`, `よみこみ`, `ついか`, `かきだし`, `とりこみ`,
  `しょうきょ`, `ちょうせい`. The database is reseeded.
- **Engine:** [`jaImperativeSegs.ts`](../../../packages/engine/src/languages/ja/jaImperativeSegs.ts)
  passes the reading to `wordSeg`. A label with no seeded reading derives one from the masu-stem
  when the label is that stem (`読み込み`) or the stem without its する (`保存` ← `保存し`). Any other
  label stays bare.

Every row now reads as wanted: `['ほん', 'ほぞん']`, `['ほん', 'よみこみ']`, and the other six labels read
too. An unlabelled verb keeps its masu-stem reading (`['ほん', 'たべ']`). The text is unchanged.

- **Tests:** [`packages/engine/test/furigana.test.ts`](../../../packages/engine/test/furigana.test.ts)
  → *known bugs: Japanese instruction label furigana*. The pinning `test.fails` is now a passing
  `test`. New cases cover the other six labels, with a guard for an unlabelled verb.
- Unit test: `jaImperativeSegs.test.ts`, covering the seeded reading, both derived readings and a
  label with no match.
