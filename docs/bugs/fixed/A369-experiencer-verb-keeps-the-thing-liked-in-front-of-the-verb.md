# A369. An experiencer verb keeps the thing liked in front of the verb

**Languages:** Italian, Spanish

Italian *piacere* and Spanish *gustar* make the thing liked the subject and the one who likes a
dative (localization C34). The engine keeps a transitive verb's order, subject first: *il cane piace
al gatto*, *un angelo mi piace*. The plain order of this frame puts the dative first and the subject
after the verb: *al gatto piace il cane*, *mi piace un angelo*. With the subject first it reads as
marked: the dog, as opposed to something else, pleases the cat. Spanish also doubles a pronoun
experiencer with its tonic form (*me gusta a mí*), which is the contrastive reading, not the plain
one.

| Case | Now | Want |
|---|---|---|
| I like an angel | it `un angelo mi piace.` · es `un ángel me gusta a mí.` | it `mi piace un angelo.` · es `me gusta un ángel.` |
| the cat likes the dog | it `il cane piace al gatto.` · es `el perro le gusta al gato.` | it `al gatto piace il cane.` · es `al gato le gusta el perro.` |
| she likes the dog | it `il cane le piace.` · es `el perro le gusta a ella.` | it `le piace il cane.` · es `le gusta el perro.` |
| the cat does not like the dog | it `il cane non piace al gatto.` · es `el perro no le gusta al gato.` | it `al gatto non piace il cane.` · es `al gato no le gusta el perro.` |
| the cat likes no dog | it `nessun cane piace al gatto.` · es `ningún perro le gusta al gato.` | it `al gatto non piace nessun cane.` · es `al gato no le gusta ningún perro.` |
| does the cat like the dog? | it `il cane piace al gatto?` · es `¿el perro le gusta al gato?` | it `al gatto piace il cane?` · es `¿al gato le gusta el perro?` |
| one likes the cat | es `el gato le gusta a uno.` | es `a uno le gusta el gato.` |
| the cat that likes the dog | it `il gatto al quale il cane piace.` · es `el gato al que el perro le gusta.` | it `il gatto al quale piace il cane.` · es `el gato al que le gusta el perro.` |

Reported from the phrase console as `/subj ( 1st ) /verb ( like ) /obj ( angel /a )`: "un angelo mi
piace" does not sound idiomatic.

This overturns C34's pins (`experiencer-verb.test.ts`: *il cane piace al gatto*, *el perro me gusta
a mí*), A316's Spanish *el gato le gusta a uno* (`okay-predicate.test.ts`), and the "time flies like
an arrow" row in `nounPhrase.test.ts`. Those pins recorded the engine's order, not a ruling on it.

**Already right.** A wh-question keeps the order its own fronting gives (*che cosa piace al gatto?*,
*a chi piace il cane?*, A367 and A368). The relative on the thing liked (*il cane che piace al
gatto*). Italian with a dropped generic experiencer (*il gatto piace*), which has no dative to lead.
The five plain transitive languages.

## Shape of the fix

In a statement or yes/no question with an experiencer verb and a dative: say a noun dative first, a
pronoun one as the clitic alone, and the subject after the verb, where an object would stand. A
negative subject behind the verb then needs the *non* / *no* a negative object takes. The relative
on the one who likes puts its subject after the verb the same way.

| | |
|---|---|
| **Test** | `experiencer-verb.test.ts` → *known bugs: an experiencer verb keeps the thing liked in front of the verb (A369)* (4 `test.fails`: the dative leads; a pronoun experiencer; tense, negation, the yes/no question and a negative thing liked; the Spanish generic and the relative; plus a regression test for the Italian generic, the five plain transitive languages and the wh-question) |

Found from a phrase-console line, 2026-09-24.

## Resolved

2026-09-24. [experiencerInverts.ts](../../../packages/engine/src/functions/experiencerInverts.ts)
decides when a clause inverts: an experiencer verb with a dative, no wh-question, and neither
imperative nor infinitive. [it/renderClause.ts](../../../packages/engine/src/languages/it/renderClause.ts)
and [es/renderClause.ts](../../../packages/engine/src/languages/es/renderClause.ts) then lead with the
dative and hand the spoken subject to `predicateText` as an `InvertedSubject`, which it writes in the
object's slot, before the complements (*al gatto piace il cane nella casa*). A negative one concords
as a negative object does. Spanish keeps the fronted dative's clitic (*le* / *les*), fronts the generic
*a uno* (which has no clitic of its own), and drops the tonic beside a pronoun clitic (*me gusta*,
*le gusta*), in questions too (A367's *¿quién me gusta?*). The relatives on the one who likes invert
in [it/relativeText.ts](../../../packages/engine/src/languages/it/relativeText.ts) and
[es/withRelative.ts](../../../packages/engine/src/languages/es/withRelative.ts).

The compound tense and a modal follow (*al gatto è piaciuto il cane*, *al gato le puede gustar el
perro*).

Guarded by `experiencer-verb.test.ts` → *known bugs: an experiencer verb keeps the thing liked in
front of the verb (A369)*: the four former `test.fails`, now plain tests, and the regression test.
The C34, A316 and nounPhrase pins above were rewritten to the new order.
