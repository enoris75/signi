# A9. Resultative is iterative, not perfective

**Language:** Portuguese

`tem comido` means "has been eating (repeatedly)". The perfect of a bounded event is the
pretérito perfeito.

| | |
|---|---|
| **Now / Want** | `o gato tem comido.` → `o gato comeu.` |
| **Where** | `pt.ts` ~line 238 (`ter` as the resultative auxiliary) |
| **Fix** | Portuguese has no present-perfect equivalent of `ha comido`. Map present resultative onto the pretérito perfeito. **Careful:** the *past* resultative (`o gato tinha comido`, pluperfect) is already correct — only the present is wrong. |
| **Test** | `verb.test.ts` → *known bugs: aspect* (1 test) |

## Resolved

Fixed 2026-07-15.

- **Engine:** [`packages/engine/src/languages/pt.ts`](../../../packages/engine/src/languages/pt.ts)
  — in `aspectVerb`, the resultative now special-cases the present: `tense === 'present'` returns
  `conjugate(verbForms, subjectForms, 'past')` (the pretérito perfeito, "o gato comeu") instead of
  `tem + particípio`. The past (pluperfect "tinha comido") and future (future perfect "terá comido")
  resultatives still take `ter[tense] + particípio` — only the present was wrong. The
  modal-governed `verbGroupInfinitive` ("deve ter comido") is untouched: `ter + particípio` is the
  correct governed infinitive there.
- **Tests:** [`packages/engine/test/verb.test.ts`](../../../packages/engine/test/verb.test.ts) →
  *known bugs: aspect*. The pinning `test.fails` is now passing, plus two added cases: the pretérito
  mapping across person/number, verb and polarity (`os gatos comeram`, `o gato viu o rato`, `o gato
  não comeu`), and a regression guard that the past/future resultatives keep the pluperfect /
  future-perfect (`tinha comido`, `terá comido`).
- **Collateral (all the same, correct, change):** two present-resultative assertions in
  `relative.test.ts` (`o rato que o gato comeu corre.`, `… viu o cão.`), and the auto-generated
  `verb.conjugation.test.ts` / `hypothetical.test.ts` snapshots (regenerated — 293 Portuguese
  present-resultative cells moved from `tem/tenho/… + particípio` to the pretérito; no other
  language or the past/future perfects changed, verified against the diff).
