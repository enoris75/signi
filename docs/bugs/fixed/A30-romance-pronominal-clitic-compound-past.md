# A30. Pronominal verb loses its clitic in the compound past

**Language:** Romance / Iberian coordination

A pronominal (reflexive) verb keeps its clitic in the simple present but **loses** it in the
compound past. The clitic must move to before the auxiliary, not vanish. The Spanish case even
changes meaning — `ha vuelto` without the reflexive is "has **returned**" (volver), not "has
become" (volverse). The auxiliary and the agreement are right; only the reflexive pronoun is dropped.

| | Now | Want |
|---|---|---|
| French (COLLAPSE) | `la chatte est effondrée.` | `la chatte s'est effondrée.` |
| Spanish (BECOME) | `la gata ha vuelto.` | `la gata se ha vuelto.` |

| | |
|---|---|
| **Test** | `verb.test.ts` → *known bugs: reflexive verbs in the compound tense* (2 tests) |

## Resolved

Fixed 2026-07-16, in the French and Spanish engines. Reflexivity is detected lexically from the
infinitive (French begins with the clitic — `s'effondrer`; Spanish ends in the enclitic `-se` —
`volverse`); the finite present already carries the clitic, but the participle drops it, so the
resultative restores it before the auxiliary, agreeing with the subject:

- [`es.ts`](../../../packages/engine/src/languages/es.ts): a new `reflexiveClitic` (me/te/se/nos/os/se)
  leads the perfect in `aspectVerb` — `se ha vuelto`, not the meaning-changed `ha vuelto` (returned).
- [`fr.ts`](../../../packages/engine/src/languages/fr.ts): a new `reflexiveFinite` prepends the clitic
  (me/te/se/nous/vous/se) to the resultative auxiliary in `aspectVerbFr`, eliding `me/te/se` → `m'/t'/s'`
  before a vowel-initial auxiliary — `s'est effondrée`, `m'étais effondré`, `nous nous sommes effondrés`.

The clitic agrees across all persons/tenses and is a no-op for non-reflexive verbs (`est allée`,
`ha ido`) and for the simple present (whose finite form already carries it). French negation brackets
it correctly (`ne s'est pas effondrée`). Portuguese `tornar-se` has the same shape but was out of
scope (no pinning test); Italian's reflexives were not affected.

- **Tests:** [`packages/engine/test/verb.test.ts`](../../../packages/engine/test/verb.test.ts)
  → *known bugs: reflexive verbs in the compound tense*. Both pinning `test.fails` are now passing
  `test`s, plus added cases: masculine and plural subjects (participle agreeing in French), the French
  negation bracket, and regression guards for the present and a non-reflexive compound. The full
  person/tense conjugation snapshot for COLLAPSE (fr) and BECOME (es) in
  [`verb.conjugation.test.ts`](../../../packages/engine/test/verb.conjugation.test.ts) was regenerated
  to the now-correct clitic-bearing forms.
