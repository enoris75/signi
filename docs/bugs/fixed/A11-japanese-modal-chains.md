# A11. Modal chains stack suffixes into non-words (`できたい`, `たいこと`)

**Language:** Japanese

Japanese modality is suffixal, so a **chain** has to nest suffixes; the engine glues them naively.
`WILL`+`CAN` → `できたい` (`たい` is an i-adjective and cannot suffix `できる`); `CAN`+`WILL` →
`食べたいことができます`.

| | |
|---|---|
| **Want** | Asserted negatively (idiomatic form, e.g. `食べられるようになりたい`, is a design call): the output must not contain `できたい` / `たいこと`. |
| **Test** | `modals.test.ts` → *known bugs: modals* (2 tests) |

## Resolved

Fixed 2026-07-15.

- **Engine:** [`packages/engine/src/languages/ja.ts`](../../../packages/engine/src/languages/ja.ts),
  in `modalSegs`. The volitional 〜たい (an i-adjective) cannot chain by naive suffix-gluing —
  attaching it to a nominalising modal's stem gives `できたい`, and letting one nominalise it gives
  `たいこと`. Two bridge cases, keyed off the `kind: 'iadj'` modal (WILL), now avoid both:
  - **Case A — 〜たい over a verb-kind modal** (want to be able to …): the inner modal is rendered in
    its dictionary form and rides ようになる ("come to be able"), with 〜たい inflecting なる →
    `食べることができるようになりたいです`.
  - **Case B — a verb-kind modal over 〜たい** (… can want to eat): the desire is made a clause with
    と思う ("think that …") before the modal nominalises it → `食べたいと思うことができます`.
  Both cases carry tense/polarity on the outer element (`ようになりたくないです`, `…ことができました`), and
  generalise across CAN and MUST in either order. A chain with no 〜たい is untouched: two verb-kind
  modals still stack directly (`食べることができる必要があります`).
- **Tests:** [`packages/engine/test/modals.test.ts`](../../../packages/engine/test/modals.test.ts) →
  *known bugs: modals*. The two pinning `test.fails` are now passing `test`s, plus three added
  cases: the concrete bridged strings for CAN/MUST × both orders, the tense/polarity variants, and
  a regression guard that an all-verb-kind chain and a lone 〜たい are unaffected.
- The idiomatic rendering was a design call (as the bug noted); the ようになる / と思う bridges were
  chosen because they are grammatical, keep the two orders distinct, and generalise. Japanese modal
  *aspect* remains a separate documented gap (B7), untouched here.
