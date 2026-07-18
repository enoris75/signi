# C04. Generic / impersonal subject — patient-defined nouns

**Blocked on:** a **generic ("one / people") subject** for relative clauses whose head is the
*object* of the clause, not its subject. FOOD is "a thing that **one** eats" — the head (FOOD) is the
direct object (the gap), and the clause needs a generic subject to fill the "one eats" part. The plan
supports a non-subject `headRole` on `RelativeClause`, but there is no generic/impersonal pronoun to
serve as that clause's subject (the 3 seeded pronouns are deictic person categories, not "one").

## What's needed

- A generic pronoun concept (ONE / PEOPLE / impersonal), seeded in all 7 langs (en "one", it "si"
  impersonal, fr "on", de "man", es "se", pt "se", ja generic drop), **and** the engine support to
  render it as an impersonal subject.

## Blocks (representative)

FOOD ("a thing one eats"), and any noun defined by what is done *to* it rather than what it does —
e.g. artifacts defined by use. Object nouns definable by a plain adjective (B05) don't need this.

Until then, these stay on the English literal.

## Done

2026-07-18. Built the engine support **and** seeded the generic pronoun, then localized FOOD.

**(a) Engine — the impersonal subject.** Added a `GENERIC_PERSON` pronoun (3rd-sg for agreement,
flagged `generic`) in
[packages/backend/src/concepts/pronouns.ts](../../../packages/backend/src/concepts/pronouns.ts), and
a shared [`isGenericSubject`](../../../packages/engine/src/types.ts) the engines read to place it
three ways: a subject *word* in en/de/fr (`one` / `man` / `on`, French eliding to `qu'on` — these
needed no engine change beyond the seed), a preverbal **impersonal clitic** in the Romance clitic
languages (it `si`, es/pt `se`, emitted after any negator — "non si mangia") with the subject word
suppressed, and **dropped** in Japanese (食べる物体). The clitic + suppression live in the `it` / `es`
/ `pt` `predicateText` + relative renderers; the drop in `ja`'s `npSegs`. en/de/fr untouched.

**(b) Seed + localize.** `GENERIC_PERSON` seeded (all 7 langs). FOOD's `definition` set to a new
`patientGloss('OBJECT_THING', 'EAT')` helper in
[packages/backend/src/concepts/nouns.ts](../../../packages/backend/src/concepts/nouns.ts) — an
object-gap relative with the generic subject. Renders:

- **FOOD** — `patientGloss('OBJECT_THING', 'EAT')`
  - en `an object that one eats` · it `un oggetto che si mangia` · fr `un objet qu'on mange` ·
    de `ein Gegenstand, den man isst` · es `un objeto que se come` · ja `食べる物体` ·
    pt `um objeto que se come`

The engine is the source of truth. Unit coverage in `packages/engine/test/relative.test.ts`
(affirmative all-7, negated clitic placement, top-level pro-drop); e2e in
`e2e/definition-tooltip.spec.ts` (FOOD en+it). The `@signi/engine` dist must be rebuilt
(`npm run build --workspace=packages/engine`) for the backend to pick up engine changes — the affirmative
surface hides a stale dist because a *placed* "si"/"se" coincides with the clitic; ja's drop is what
exposes it. Other patient-defined nouns (artifacts by use, etc.) can now follow the same helper.
