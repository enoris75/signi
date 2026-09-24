# B90. Everything — the universal pronoun, on SOMETHING's model

_(from the [P09-E24](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E24-ranks-201-400.md)
coverage check of 2026-09-24: *everything* (rank 309). Not a concept at 1229928. *Anything* (245)
and *nothing* (246) are forms of the seeded SOMETHING. *Someone* (302) is not this ticket's: a
**person** indefinite is cliticized and dropped as a personal pronoun would be, which is
[P09-E40](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E40-someone.md). EVERYTHING is a thing,
so SOMETHING's `thing` flag keeps it a phrase. One word, one gloss. None goes to a C ticket.)_

## Seed first

Proposed forms, for the seed author to check. The row was **seeded in memory and rendered**.

| concept | role | sense | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| EVERYTHING | pronoun | **E24**, rank 309. `slot: 'indefinite'`, `thing: '1'` in every language, as SOMETHING. **No negative form**: it does not swap under negation | everything | tutto | tout | alles | todo | すべて | tudo |

- **Its forms are SOMETHING's keys minus the negative ones**: `person: '3'`, `number: 'singular'`,
  `thing: '1'`, `object`, `disjunctive`. German *alles* is neuter, and Italian, Spanish and
  Portuguese are masculine. Japanese すべて takes を and は like a noun (probed: すべてを見ます).
- **Not ALL + THING.** The determiner `all` on THING says *tutte le cose, toutes les choses, alle
  Dinge*, すべてのもの, which is "all things", a plural of countable things, and is the gloss below.
  *Tutto / tout / alles* is the mass pronoun.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| EVERYTHING | THING, `definiteness: 'all'`, plural | all things |

## Probe renders (2026-09-24, engine source at 1229928, lexicon seeded in memory with the forms above)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| EVERYTHING | all things | tutte le cose | toutes les choses | alle Dinge | todas las cosas | すべてのもの | todas as coisas |

The word itself:

| phrase | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| object | the cat sees everything | il gatto vede tutto | le chat voit tout | der Kater sieht alles | el gato ve todo | 猫はすべてを見ます | o gato vê tudo |
| subject | everything runs | tutto corre | tout court | alles läuft | todo corre | すべては走ります | tudo corre |
| negated object | the cat does not see everything | il gatto non vede tutto | le chat ne voit pas tout | der Kater sieht alles nicht | el gato no ve todo | 猫はすべてを見ません | o gato não vê tudo |
| negated subject | everything does not run | tutto non corre | tout ne court pas | alles läuft nicht | todo no corre | すべては走りません | tudo não corre |

Readings to judge on authoring:

1. **The gloss is SOMETHING's genus under `all`**, "all things", the way EVERYWHERE is "in all
   places". SOMETHING ships "an unknown thing", so the two differ in their determiner.
2. **Negation is partial, and German puts it wrong.** "Does not see everything" means *not all*. The
   Romance *non vede tutto* and *ne voit pas tout* say that, and German should say *sieht **nicht**
   alles*, with *nicht* before the quantifier it negates. The engine puts *nicht* after the object,
   as for a definite noun (*sieht den Hund nicht*). The negated subject is odd in English ("everything
   does not run" for *not everything runs*) and Japanese すべては走りません is the partial reading, which
   is right. German constituent negation of a universal is a defect of the negation placement, **not
   filed** here (see the report). The positive sentences are right in all seven.

## Not solved by this seed

1. **German *nicht alles*** (reading 2).
2. **Everyone, everybody** (*tutti, tout le monde, alle / jeder, todos*, みんな, *todos*) — not in the
   band, and a person, so E40's.

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored:
EVERYTHING in German and Japanese (*alle Dinge*, すべてのもの).

## Done

Shipped 2026-09-24. **One word seeded**, EVERYTHING, in
[pronouns.ts](../../../packages/backend/src/concepts/pronouns.ts) (after SOMETHING), `slot:
'indefinite'`, `thing: '1'` in every language and no negative form; and **its gloss**. Pinned in
[time-and-degree-words.test.ts](../../../packages/engine/test/time-and-degree-words.test.ts).

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| EVERYTHING | all things | tutte le cose | toutes les choses | alle Dinge | todas las cosas | すべてのもの | todas as coisas |

The word in a clause, as shipped:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| the cat sees everything | the cat sees everything. | il gatto vede tutto. | le chat voit tout. | der Kater sieht alles. | el gato ve todo. | 猫はすべてを見ます。 | o gato vê tudo. |
| the cat eats with everything | the cat eats with everything. | il gatto mangia con tutto. | le chat mange avec tout. | der Kater frisst mit allem. | el gato come con todo. | 猫はすべてと食べます。 | o gato come com tudo. |
| everything else runs | everything else runs. | tutto il resto corre. | tout le reste court. | alles andere läuft. | todo lo demás corre. | 別のすべては走ります。 | todo o resto corre. |
| the cat does not see everything | the cat does not see everything. | il gatto non vede tutto. | le chat ne voit pas tout. | der Kater sieht alles nicht. | el gato no ve todo. | 猫はすべてを見ません。 | o gato não vê tudo. |

What landed differently from the plan:

1. **German declines it**: `disjunctive: 'allem'` (*mit allem*), which the proposed forms lacked.
2. **With OTHER it is a fused phrase** (`with_other`), as SOMETHING's *autre chose* is. The fold
   gave *tutto altro, tout d'autre, alles anderes, todo más, tudo mais*. German's fused form declines
   too, so [`foldIndefiniteModifier`](../../../packages/engine/src/translator/functions/foldIndefiniteModifier.ts)
   now reads a per-slot `with_other_object` / `with_other_disjunctive` (*mit allem anderen*), unit
   tested.
3. **Not solved, found on authoring** (no bug filed, ids would collide across lanes):
   - Reading 2 stands: German *sieht alles nicht* where the partial reading wants *nicht alles*.
     Pinned as it renders.
   - **Any other adjective** on it folds as SOMETHING's does and reads wrong in five languages:
     *tutto di grande, tout de grand, alles Großes* (weak *alles Große* is right), *todo grande*,
     大きいすべて. The idiom is a relative (*tutto ciò che è grande, tout ce qui est grand, todo lo
     grande*).
   - **A relative clause on it** takes the plain relativizer: *tutto che il cane vede, tout que le
     chien voit, alles, das der Hund sieht, todo que el perro ve, tudo que o cão vê*, where the
     languages say *tutto ciò che, tout ce que, alles, was, todo lo que, tudo o que*. Both want a
     pronoun-specific relative head, engine work beyond this seed.
   - Spanish TOPIC's generic *sobre* reads *habla sobre todo* ("above all"); *habla de todo* is the
     idiom. The topic preposition is the complement's, not the pronoun's.
4. EVERYTHING is offered by no picker (the indefinite slot, as SOMETHING); its e2e row reads the gloss
   from `/api/concepts`.
