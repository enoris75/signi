# B13. Japanese has no plain negative: relative clauses and citations fall back to 〜ません

**Documented simplification — do NOT fix without a product decision.**

**Language:** Japanese

A prenominal relative clause and an infinitive citation both need the plain form. The affirmative is
plain (`食べる猫`, `食べる。`), but a negated predicate goes through the polite `verbSeg`. That covers
`negative`, a negative adverb (NEVER), and a `no` argument. Both call sites in `predicateSegs`
(`languages/ja/predicateSegs.ts`) say so, and so does `plainVerbSeg.ts`: "the plain negative
(ない/なかった) needs a nai-form the lexicon doesn't store — a documented remaining gap". The polite
`食べません` before a noun is ungrammatical; as a citation it is the wrong register.

| Plan | Now | Want |
|---|---|---|
| the cat that does not eat runs | `食べません猫は走ります。` | `食べない猫は走ります。` |
| the cat that did not eat runs | `食べませんでした猫は走ります。` | `食べなかった猫は走ります。` |
| the cat that never eats runs | `決して食べません猫は走ります。` | `決して食べない猫は走ります。` |
| the cat that eats no mouse runs | `どのネズミも食べません猫は走ります。` | `どのネズミも食べない猫は走ります。` |
| citation: not to eat | `食べません。` | `食べない。` |
| the cat runs so as not to eat | `猫は食べませんために走ります。` | `猫は食べないために走ります。` |

Two passing tests pin the fallback:

- `relative.test.ts:439`, *relative clauses: polarity and modals of their own* → "the negation belongs to
  one clause, not the other": `ja: '食べません猫はネズミを見ます。'`.
- `infinitive.test.ts:96-98`, *infinitive negation* → "Japanese falls back to the polite negative
  (documented nai-form gap)": `'食べません。'`.

## Shape of the fix

Seed the nai-form on each ja verb lexeme (`nai`, `nai_reading`), the way `te` is seeded. Deriving it
from the dictionary form is unreliable: godan and ichidan verbs both end in -る (`走る` → `走らない`,
`食べる` → `食べない`), and there are the irregulars `する` → `しない`, `来る` → `こない`. The past is
`〜なかった`. Then `plainVerbSeg` takes a `negative` flag, and both call sites use it. The same form
unblocks the negative たら protasis (`食べなかったら`) and the polite `〜ないでください`.

| | |
|---|---|
| **Test** | `relative.test.ts` → *documented simplifications: Japanese plain negative* (1 `test.fails`) |

## Update 2026-09-20

A **third call site** joined the two above: the clause of purpose
([C12](../../localization/done/C12-ui-purpose-and-object-complements.md)) renders as a citation and
closes on ために, so a negated purpose reads 食べませんために. The fix is the same one — `plainVerbSeg`
taking a `negative` flag — and the purpose clause needs no work of its own once it lands.

## Update 2026-09-13

A118 seeded `nai` / `nai_reading` on every ja verb (in `verbs/nonfinite.ts`) and uses it for the negative
たら protasis. The first half of the fix above is therefore in place. What remains is the product decision
and the wiring: `plainVerbSeg` taking a `negative` flag, and the relative-clause and citation call
sites in `predicateSegs` using it.

## Resolved

**2026-09-21.** Fixed after the product decision to retire the simplification. Every plain negative
predicate now reads the seeded nai-form: 食べない猫, 食べなかった猫, 決して食べない猫,
どのネズミも食べない猫, 食べない。, 食べないために. The main clause keeps its polite 食べません.

- **Engine** — [`packages/engine/src/languages/ja/plainVerbSeg.ts`](../../../packages/engine/src/languages/ja/plainVerbSeg.ts)
  takes a `negative` flag: non-past is the `nai` form, the past turns its final い into かった
  (食べなかった, reading こなかった for 来る). A verb with no nai-form falls back to the polite negative,
  which no seeded verb reaches (all 93 have one, since A118).
  [`predicateSegs.ts`](../../../packages/engine/src/languages/ja/predicateSegs.ts) routes both call
  sites through it: the relative clause (`plain`) and the citation (`infinitive`). The purpose clause,
  the infinitive complement (行動しないことが可能である) and the causative clause (人が行動しないようにする)
  are citations, so they follow with no work of their own. The existential いる / ある, the passive
  〜られる and the state verbs have nai-forms of their own and compose too (家にいない猫,
  猫に食べられない食べ物, 本を持たない猫). Comments updated in `plainVerbSeg.ts`, `predicateSegs.ts`,
  [`buildClauseSegments.ts`](../../../packages/engine/src/languages/ja/buildClauseSegments.ts) and
  [`packages/backend/src/concepts/verbs/nonfinite.ts`](../../../packages/backend/src/concepts/verbs/nonfinite.ts).
- **Not changed:** the negative command keeps its plain prohibitive 〜な (`jaImperativeSegs`). The
  "Shape of the fix" names 〜ないでください as unblocked, but the Want table does not ask for it, and
  that register choice is its own decision.
- **Tests:** [`relative.test.ts`](../../../packages/engine/test/relative.test.ts) → *Japanese plain
  negative* (renamed from *documented simplifications: …*). The pinning `test.fails` is a plain `test`,
  its assertions unchanged. New cases: the `no` object and the object gap (猫が食べなかったネズミ);
  RUN, COME, CONSUME, HAVE, KNOW, the existential and the passive; the furigana of 来なかった; and the
  main clause keeping 食べません.
- **Passing tests whose expectations changed** (each pinned the fallback):
  - `relative.test.ts:439`, *the negation belongs to one clause, not the other*:
    `食べません猫はネズミを見ます。` → `食べない猫はネズミを見ます。`
  - `infinitive.test.ts:138`, *Japanese falls back to the polite negative (documented nai-form gap)*,
    renamed *Japanese cites the plain negative*: `食べません。` → `食べない。`, plus 来ない。 and
    ネズミを決して食べない。
  - `hypothetical.test.ts:334`, *… a negated relative clause keeps B13's polite form*, renamed *… takes
    the plain one*: `食べません猫は走ります。` → `食べない猫は走ります。`
- **Japanese assertions added where the tests had left Japanese out because of B13:**
  `purpose.test.ts:54` (猫は食べないために走ります。), `infinitive-complement.test.ts:154`,
  `causative.test.ts:224` and `copulaWithoutComplement.test.ts:248` (いない犬は走ります。).
- **Colocated unit tests:** [`plainVerbSeg.test.ts`](../../../packages/engine/src/languages/ja/plainVerbSeg.test.ts)
  (the negative, its past, the 来ない reading, a kana form, the fallback) and
  [`predicateSegs.test.ts`](../../../packages/engine/src/languages/ja/predicateSegs.test.ts) (a negated
  relative predicate, a negative citation).
