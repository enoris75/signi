# A126. A godan す-verb's instruction label loses the し of its stem

**Language:** Japanese

A Japanese instruction (a button or menu label) is the verb's verbal noun. When a verb has no seeded
`label`, the noun is derived from the masu-stem, with the し of a する-verb dropped (保存し → 保存).
The drop was applied to every stem that ends in し, and a godan す-verb's stem ends in its own し:
隠す → 隠し → **隠**. The header's "hide the words" button therefore read 単語を隠.

| | |
|---|---|
| **Now / Want** | `単語を隠。` → `単語を隠し。` (HIDE, `imperativeRegister: 'instruction'`) |
| **Where** | `jaImperativeSegs`: the label is derived from `masuStem` whether or not the verb is a する-verb |
| **Test** | `imperative.test.ts` → *imperative register*; `jaImperativeSegs.test.ts` → *instruction register* |

Found while localizing [A15](../../localization/done/A15-ui-slot-scoped-commands.md), whose
`action.hide.*` family puts HIDE on every satellite's hide control. It would have broken the new
PRESS (押す), SHED (流す), TRANSFER (移す), INDICATE (示す) and PRODUCE (出す) the same way.

## Resolved

Fixed 2026-09-14, in
[`packages/engine/src/languages/ja/jaImperativeSegs.ts`](../../../packages/engine/src/languages/ja/jaImperativeSegs.ts):
the し is dropped only when the verb's dictionary form ends in する. Otherwise the whole masu-stem is
the label, and its reading goes with it. The reading lookup (`labelReading`) already handled a label
equal to the stem, so it needed no change.

- **Tests:** [`jaImperativeSegs.test.ts`](../../../packages/engine/src/languages/ja/jaImperativeSegs.test.ts)
  adds a godan す fixture (隠す → `[{ t: '隠し', r: 'かくし' }]`).
  [`imperative.test.ts`](../../../packages/engine/test/imperative.test.ts) pins HIDE over the plural
  WORD: `単語を隠し。`. The existing する-verb cases (摂取, 保存) are unchanged.
