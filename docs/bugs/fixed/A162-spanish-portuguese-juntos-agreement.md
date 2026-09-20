# A162. Spanish and Portuguese "juntos" does not agree with the subject

**Languages:** Spanish, Portuguese

TOGETHER is seeded as an ordinary adverb — one invariant `base` per language — and five languages
have exactly that: *insieme*, *ensemble*, *zusammen*, "together", 一緒に. Spanish and Portuguese do
not. Their word is **juntos**, a predicative adjective agreeing with the subject in gender and
number, so a feminine subject must take *juntas*.

| Plan | Now | Want |
|---|---|---|
| the cats (fem, plural) EAT + TOGETHER | es `las gatas comen juntos.` | `las gatas comen juntas.` |
| " | pt `as gatas comem juntos.` | `as gatas comem juntas.` |
| the cats (masc, plural) EAT + TOGETHER | es `los gatos comen juntos.` | already right |

Found while glossing COORDINATE as "to cause people to act together"
([localization C08](../../localization/done/C08-copular-and-genus-verbs.md)), where it renders
*inducir **personas** a actuar **juntos*** — PERSON is feminine in both languages. The definition
shipped with the masculine form.

## Shape of the fix

The adverb slot has no agreement machinery: `predicateText` (es/pt) emits `modifier.forms['base']`
and nothing selects a form. Two ways, and the choice is a product decision about the lexicon's shape:

1. **Agreeing adverbs.** Give the lexeme the adjective's forms (`fem`, `plural`, `fem_plural`) and a
   flag saying it agrees, then have the two engines resolve it against the clause's subject — the
   same features `agreeAdj` already reads. It generalises: any Romance "adverb" that is really a
   predicative adjective (*solo* / *solos*, *sólo*) would work.
2. **An invariant phrase in the lexeme.** es *en conjunto*, pt *em conjunto* — correct everywhere and
   free, but stilted next to the everyday *juntos* in the ordinary case ("los gatos comen juntos").

Whichever lands, the concept stays an adverb: what it modifies is the acting, not the actors.

| | |
|---|---|
| **Test** | `adverb.test.ts` → *known bugs: Spanish and Portuguese "juntos" does not agree with the subject* (1 `test.fails`) |

## Resolved

Fixed 2026-09-20 as the first shape proposed — agreeing adverbs. The second (an invariant *en
conjunto*) would have had to unpick the row that was already right, "los gatos comen juntos".

The lexeme, not the engine, says whether an adverb agrees.
[`TOGETHER`](../../../packages/backend/src/concepts/adverbs.ts) keeps *juntos* as its `base` — the
citation form the picker shows, and what the five invariant languages emit — and carries the
masculine singular of the adjective in a new `predicative` form key, es/pt only.
[`agreeingAdverb`](../../../packages/engine/src/functions/agreeingAdverb.ts) reads it; a true adverb
returns nothing and is emitted unchanged. (The key is not `adjective`: that one already names the
inherent adjective inside a German noun, "junge Frau", and the corpus has an invariant over it.)

Both [`es`](../../../packages/engine/src/languages/es/predicateText.ts) and
[`pt`](../../../packages/engine/src/languages/pt/predicateText.ts) `predicateText` now put every
adverb in the verb group through one `adverbSurface`, which runs an agreeing stem through the
language's own `agreeAdj` against `subjectForms` — the same record the finite verb agrees with, so
the agreement follows the subject wherever the clause moved it.

Both rows render as wanted, and the masculine plural is unchanged. Also covered:

- the whole verb group — under a modal, progressive, resultative, negated;
- a relative clause and an imperative, where the head noun and the addressee stand in for the
  subject ("las gatas que comen juntas corren", "comed juntas");
- the object-controlled infinitive this was found on: COORDINATE's definition now reads *inducir
  personas a actuar **juntas*** / *induzir pessoas a agir **juntas***;
- a singular subject, which tracks the subject instead of keeping a plural form ("la gata come
  junta"). The plan is semantically odd — TOGETHER wants somebody to be together with — but the
  form is no longer frozen;
- a regression guard that a true adverb is still invariant and that the preverbal "nunca" slot is
  untouched.

Untouched, and worth a look on its own: a modal's *own* adverb renders between the modal and the
infinitive ("las gatas pueden **juntas** comer"). The agreement is right there now, but the word
order was wrong before this fix and still is — it is the `post` slot `modalChain` gives a modal's
adverb, which suits the frequency adverb it was built for and not a manner one.

The pinning `test.fails` is a plain passing test, its assertion unchanged, and its block holds seven
tests now. COORDINATE's row in [`causative.test.ts`](../../../packages/engine/test/causative.test.ts)
is re-pinned to the corrected *juntas*, as is the pt row of the `definition-tooltip` e2e spec, and
[`agreeingAdverb`](../../../packages/engine/src/functions/agreeingAdverb.test.ts) has a colocated
unit test.
