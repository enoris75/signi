# A384. NEVER + AGAIN is said word for word, not as each language's "never again"

**Languages:** Italian, French, German, Spanish, Portuguese, Japanese

AGAIN is a manner adverb, so with NEVER as the primary (P15) each language says the two words side by
side: *non corre mai di nuovo*, *ne court jamais de nouveau*, *läuft nie erneut*. Each language has a
fixed "never again", which is what the plan means, and the word-for-word form reads as "never anew".
English *never runs again* is already right.

| Case | Now | Want |
|---|---|---|
| it: CAT RUN, NEVER + AGAIN | `il gatto non corre mai di nuovo.` | `il gatto non corre mai più.` |
| fr | `le chat ne court jamais de nouveau.` | `le chat ne court plus jamais.` |
| de | `der Kater läuft nie erneut.` | `der Kater läuft nie wieder.` |
| es | `el gato nunca corre de nuevo.` | `el gato nunca más corre.` |
| pt | `o gato nunca corre de novo.` | `o gato nunca mais corre.` |
| ja | `猫は決してもう一度走りません。` | `猫は二度と走りません。` |
| en | `the cat never runs again.` | unchanged |
| it: AGAIN alone; NEVER alone | `il gatto corre di nuovo.`; `il gatto non corre mai.` | unchanged |

Spanish also says *no corre nunca más*; the pin takes the preverbal form, as a lone *nunca* has.

**Found by** P15's follow-ups ("AGAIN is a manner adverb"), re-probed at aa554c6b.

## Shape of the fix

A pair rule, not a class change: AGAIN stays a manner adverb everywhere else. When the resolved verb
phrase holds NEVER and AGAIN together, each language says the pair as one unit. Options for the fixer:

- a form on AGAIN's lexemes for "after NEVER" (`più`, `plus` with *jamais* after it, `wieder`, `más`,
  `mais`; Japanese 二度と replaces both words), read where the engines place the extras
  ([verbAdverbs.ts](../../../packages/engine/src/translator/functions/verbAdverbs.ts) hands them over);
- or a translator rule that folds the pair into NEVER with a flag each engine reads.

French *plus jamais* reverses the order and takes *ne … plus jamais*. Japanese 二度と drops 決して.

| | |
|---|---|
| **Test** | `multiple-adverbs.test.ts` → *known bugs: NEVER + AGAIN is said word for word (A384)* (1 `test.fails` over six languages, plus a regression test for English and the lone adverbs) |

## Resolved

**2026-09-27.** A lexeme-driven fold, not a class change. NEVER's lexeme names its partner and the
word for the pair in each language that has one ([`adverbs.ts`](../../../packages/backend/src/concepts/adverbs.ts),
`fuses_with: 'AGAIN'` and `fused`: *mai più*, *plus jamais*, *nie wieder*, *nunca más*, *nunca mais*,
二度と with `fused_reading` にどと); English names none and keeps *never runs again*. The new
[`fusedAdverbs.ts`](../../../packages/engine/src/translator/functions/fusedAdverbs.ts), called from
[`resolveVerbPhrase.ts`](../../../packages/engine/src/translator/functions/resolveVerbPhrase.ts) after `verbAdverbs`,
replaces the primary's word with the fused one and drops the partner from the extras, so every
engine places the pair in NEVER's own slot, polarity and all: *non aveva mai più corso*, *n'avait plus
jamais couru*, 二度と走っていませんでした. A question that is not denied keeps the two words, since its
NEVER is the positive *ever* (`interrogativeAdverb`); [`resolvePhrase.ts`](../../../packages/engine/src/translator/functions/resolvePhrase.ts)
passes that as the new `asksEver` argument.

- **Tests:** [`multiple-adverbs.test.ts`](../../../packages/engine/test/multiple-adverbs.test.ts) → *known bugs: NEVER +
  AGAIN is said word for word (A384)*. The pinning `test.fails` is now a passing `test`; added: the
  other ranking (AGAIN named first), the pluperfect in all seven, a further manner adverb beside the
  pair, and a regression for the question (*does the cat ever run again?*, *corre mai di nuovo?*).
  New colocated [`fusedAdverbs.test.ts`](../../../packages/engine/src/translator/functions/fusedAdverbs.test.ts). Two
  older pins of the word-for-word output moved to the fused one:
  [`multiple-adverbs.es-pt.test.ts`](../../../packages/engine/test/multiple-adverbs.es-pt.test.ts) (*nunca más come el
  ratón*, *nunca mais come o rato*) and [`multiple-adverbs.ja.test.ts`](../../../packages/engine/test/multiple-adverbs.ja.test.ts)
  (猫は二度と走りません).
