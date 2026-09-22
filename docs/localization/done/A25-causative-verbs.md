# A25. Causative verbs — to cause a thing (not) to be in a state

_(from the unsorted sweep of 2026-09-22. Two of three verbs whose meaning is bringing a state about, which
`causativeGloss` has said since [C09](../done/C09-modal-verbs.md) and whose negative form
`GlossParts.negative` already carries. A small ticket by design: it is one construct, and it is the
only one of the sweep's verb groups that needs the causative.)_

## Plan

Inline on each seed block under [concepts/verbs/](../../../packages/backend/src/concepts/verbs/).

| concept | plan | gloss (en) |
|---|---|---|
| TURN_OFF | `causativeGloss({ object: 'OBJECT_THING', definiteness: 'indefinite' }, { verb: 'BE', predicate: 'ACTIVE', negative: true })` | to cause an object not to be active |
| NEGATE | `causativeGloss({ object: 'CLAUSE', definiteness: 'indefinite' }, { verb: 'BE', predicate: 'NEGATIVE' })` | to cause a clause to be negative |

## Vocabulary

All seeded: CAUSE_VERB (the causative's own verb), BECOME, BE, OBJECT_THING, CLAUSE, and the
adjectives SMALL, ACTIVE and NEGATIVE. The three adjectives are themselves still on the literal —
ACTIVE and NEGATIVE are [C23](../C-needs-engine/C23-participial-state-adjectives.md) and
[C24](../C-needs-engine/C24-grammar-feature-adjectives.md), SMALL is [A28](A28-scalar-adjectives.md).
None of that blocks this ticket.

## Probe renders (2026-09-22, engine source at HEAD, lexicon seeded in memory)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| TURN_OFF | to cause an object not to be active | indurre un oggetto a non essere attivo | induire un objet à ne pas être actif | einen Gegenstand veranlassen, nicht aktiv zu sein | inducir un objeto a no estar activo | 物体が稼働中ではないようにする | induzir um objeto a não estar ativo |
| NEGATE | to cause a clause to be negative | indurre una proposizione a essere negativa | induire une proposition à être négative | einen Satz veranlassen, negativ zu sein | inducir una oración a ser negativa | 節が否定であるようにする | induzir uma oração a ser negativa |

Both render in all seven, and they split *ser* and *estar* the way
[A47](../../bugs/fixed/A47-spanish-portuguese-ser-vs-estar.md) asks: es *no estar activo* for a
state a thing is in, *ser negativa* for what a clause is. One reading was judged on authoring:

- **SHRINK did not ship, and the Japanese もっと reading was moot.** Its plan is COMPACT's, character
  for character — COMPACT already ships `causativeGloss({ object: 'OBJECT_THING', definiteness:
  'indefinite' }, { verb: 'BECOME', predicate: 'SMALL', predicateDegree: 'more' })` — so the two
  would have rendered one string in all seven, including the もっと the reading worried about.
  Dropping the degree to tell them apart ("become small" against "become smaller") is a distinction
  a reader cannot use, and the two words name the same operation in this corpus anyway. SHRINK is
  [C28](../C-needs-engine/C28-verb-roots-without-a-gloss.md)'s with that reason.

## Not in this ticket

The rest of the sweep's verbs are [A24](A24-ui-verbs-genus-and-object.md) (genus + object) and
[C28](../C-needs-engine/C28-verb-roots-without-a-gloss.md) (the roots, which have no genus above
them). HIDE already has a gloss and is not in the sweep; it is the precedent the negative causative
was built for.

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts): TURN_OFF in
English and German, where the negated causative puts *nicht* inside the governed infinitive clause
(*veranlassen, nicht aktiv zu sein*) rather than on the causative verb.

## Done

Shipped 2026-09-22. Two `definition` plans in
[transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts). No word seeded, no
engine change.

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| TURN_OFF | to cause an object not to be active | indurre un oggetto a non essere attivo | induire un objet à ne pas être actif | einen Gegenstand veranlassen, nicht aktiv zu sein | inducir un objeto a no estar activo | 物体が稼働中ではないようにする | induzir um objeto a não estar ativo |
| NEGATE | to cause a clause to be negative | indurre una proposizione a essere negativa | induire une proposition à être négative | einen Satz veranlassen, negativ zu sein | inducir una oración a ser negativa | 節が否定であるようにする | induzir uma oração a ser negativa |

What landed differently from the plan: **one of the three was already glossed under another name.**
See the reading above; the guard that found it is in
[A24](A24-ui-verbs-genus-and-object.md)'s note.
