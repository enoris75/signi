# A226. A measure manner adverbial loses the determiner it was given

**Languages:** English, Italian, French, German (every determiner); Spanish, Portuguese, Japanese (a
quantifier, a demonstrative and "no")

A measure noun under an adjective names a rate, not an identifiable thing, so a definite article
reads oddly there — "at *the* high speed". [`resolveComplements`](../../../packages/engine/src/translator/functions/resolveComplements.ts)
therefore forces an adjective-modified, possessor-less `measure` manner adverbial bare, and
`manner.test.ts` pins exactly that for the definite ("at high speed").

The rule does not look at which determiner it overrides, so it takes every one. An indefinite loses
its article (*at other time*, *zu anderer Zeit*), a quantifier its meaning (*at other times* for *at
all other times*, *at other time* for *at this other time*), and "no" its negation with it — *the cat
runs at other time* for *the cat runs at no other time*, and the Romance negator goes too (*il gatto
corre a altro tempo*). AGAIN's verbless gloss on the same noun, which never reaches
`resolveComplements`, keeps its article (*at another time*), which is what isolates the defect to the
clause.

| Case | Language | Now | Want |
|---|---|---|---|
| the CAT RUNs at another TIME | English | `the cat runs at other time.` | `the cat runs at another time.` |
| | Italian | `il gatto corre a altro tempo.` | `il gatto corre a un altro tempo.` |
| | French | `le chat court à autre temps.` | `le chat court à un autre temps.` |
| | German | `der Kater läuft zu anderer Zeit.` | `der Kater läuft zu einer anderen Zeit.` |
| … past | English | `the cat ran at other time.` | `the cat ran at another time.` |
| | German | `der Kater lief zu anderer Zeit.` | `der Kater lief zu einer anderen Zeit.` |
| … at a high SPEED | English | `the cat runs at high speed.` | `the cat runs at a high speed.` |
| | German | `der Kater läuft mit hoher Geschwindigkeit.` | `der Kater läuft mit einer hohen Geschwindigkeit.` |
| … at all other TIMES | English | `the cat runs at other times.` | `the cat runs at all other times.` |
| | German | `der Kater läuft zu anderen Zeiten.` | `der Kater läuft zu allen anderen Zeiten.` |
| | Spanish | `el gato corre a otros tiempos.` | `el gato corre a todos los otros tiempos.` |
| … at this other TIME | English | `the cat runs at other time.` | `the cat runs at this other time.` |
| | Spanish | `el gato corre a otro tiempo.` | `el gato corre a este otro tiempo.` |
| … at no other TIME | English | `the cat runs at other time.` | `the cat runs at no other time.` |
| | Italian | `il gatto corre a altro tempo.` | `il gatto non corre a nessun altro tempo.` |
| | French | `le chat court à autre temps.` | `le chat ne court à aucun autre temps.` |
| | German | `der Kater läuft zu anderer Zeit.` | `der Kater läuft zu keiner anderen Zeit.` |
| | Spanish | `el gato corre a otro tiempo.` | `el gato no corre a ningún otro tiempo.` |
| | Japanese | `猫は別の時間で走ります。` | `猫はどの別の時間でも走りません。` |
| | Portuguese | `o gato corre a outro tempo.` | `o gato não corre a nenhum outro tempo.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** The definite and the bare, which the rule is for (`the cat runs at high speed.`,
pinned in `manner.test.ts`). A plain measure noun, which the rule leaves alone (`the cat runs at the
speed.`, `the cat runs at a time.`). The gloss (`at another time.`, `zu einer anderen Zeit.`). Spanish
and Portuguese spell the indefinite *otro* / *outro* without an article, so they are right on the
indefinite rows (`el gato corre a otro tiempo.`), and Japanese has no article to lose.

**Nothing shipped shows it.** The manner glosses are verbless; no clause in a definition or a UI
string carries a measure adverbial with a determiner of its own.

Found authoring the C23–C28 localization sweep.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine and backend suites green, and no passing test moves.

Give way only where the rule's reason holds. In the `manner` loop of `resolveComplements`, add the
determiner to the condition, so that only the definite — chosen, or the slot's default — is forced
bare:

```ts
(conjunct.head.forms['definiteness'] ?? 'definite') === 'definite'
```

The comment above the loop says as much already ("a definite article reads oddly"); "the determiner
is fixed for this slot in the UI" is true of the builder, not of a gloss or the console.

**Decision for the fixer: TIME in Italian and French.** *a un altro tempo* and *à un autre temps* are
what the gloss says too. Both read as "at another tempo / weather"; *un'altra volta* / *in un altro
momento* and *une autre fois* / *à un autre moment* are the idiom. That is TIME's word and the measure
preposition, not the article, and it is not pinned.

| | |
|---|---|
| **Test** | `complements/manner.test.ts` → *known bugs: a measure manner adverbial loses the determiner it was given (A226)* (1 `test.fails`, plus a regression test for the definite and the bare, a plain measure noun, the gloss, and Spanish, Portuguese and Japanese) |

## Resolved

**2026-09-22.** Fixed as the **Shape of the fix** describes, in the `manner` loop of
[`resolveComplements`](../../../packages/engine/src/translator/functions/resolveComplements.ts): the
condition now also requires the conjunct's determiner to be the definite, chosen or the slot's
default (`(definiteness ?? 'definite') === 'definite'`), so only the definite is forced bare. Every
other determiner keeps its article and its meaning, and "no" keeps its negation and the Romance
negator. The loop's comment now says the rule is for the definite, and that "the determiner is fixed
for this slot" is true of the builder only, not of a gloss or the console. No passing test moved.

**TIME in Italian and French: left as it is.** *a un altro tempo* and *à un autre temps* are what
the gloss says too. The idiom (*un'altra volta*, *une autre fois*) is a matter of TIME's word and
the measure preposition, not the article, and nothing pins it.

- **Engine changed:** [`resolveComplements.ts`](../../../packages/engine/src/translator/functions/resolveComplements.ts)
  (the `manner` condition and its comment).
- **Tests:** [`complements/manner.test.ts`](../../../packages/engine/test/complements/manner.test.ts)
  → *known bugs: a measure manner adverbial loses the determiner it was given (A226)*. The pinning
  `test.fails` is now a passing `test` with its assertions unchanged. The block comment's sentence
  about the rule is now in the past tense. A new case in the same block covers `that`, `some`,
  `many`, a `no` measure in the past in all seven languages, and a coordination whose definite
  conjunct goes bare while its indefinite one keeps its article.

  Colocated: a new case in
  [`resolveComplements.test.ts`](../../../packages/engine/src/translator/functions/resolveComplements.test.ts)
  (a chosen definite and a bare go bare; indefinite, `this`, `that`, `no` and `all` stay).
- **e2e:** unchanged. `manner.spec.ts` builds the default definite, which still goes bare (*at high
  speed*), and FAST's definition is a verbless gloss that never reaches `resolveComplements`.
