# B79. Head, face, back and health — HEAD before FACE

_(from the [P09-E24](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E24-ranks-201-400.md)
coverage check of 2026-09-24: *head* (rank 278), *back* as a noun (331), *health* (333) and *face*
(369). None is a concept at 1229928. Four words, three glosses. BACK_BODY is literal by design, and
its Portuguese waits on [P09-E41](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E41-pluralia-tantum.md)
for its everyday word. None goes to a C ticket.)_

## Seed first

Proposed forms, for the seed author to check. Every row was **seeded in memory and rendered**.

| concept | role | sense | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| HEAD | noun | **E24**, rank 278. The body part. A leader (*capo, chef, Leiter, jefe*, 長) is another concept, later. No `isA`, as EYE has none | head / heads | testa / teste *f* | tête / têtes *f* | Kopf / Köpfe *m* | cabeza / cabezas *f* | 頭 (あたま) | cabeça / cabeças *f* |
| FACE | noun | **E24**, rank 369 | face / faces | viso / visi *m* | visage / visages *m* | Gesicht / Gesichter *n* | cara / caras *f* | 顔 (かお) | rosto / rostos *m* |
| BACK_BODY | noun | **E24**, rank 331, D2: the body's back. The rear of a thing (*retro, arrière, Rückseite, parte trasera*, 後ろ) is another concept, later. The adverb "back" is P09's COME_BACK (D3) | back / backs | schiena / schiene *f* | dos / dos *m* | Rücken / Rücken *m* | espalda / espaldas *f* | 背中 (せなか) | **dorso / dorsos *m*** (see below) |
| HEALTH | noun | **E24**, rank 333. **Mass** (`countable: false`) | health | salute *f* | santé *f* | Gesundheit *f* | salud *f* | 健康 (けんこう) | saúde *f* |

- **Portuguese says *as costas***, a noun that is plural in every use. Seeded as `count: 'plural'`
  with no singular it rendered *o gato vê **uma** costas* and *a costas grande parece boa*: the
  engine has no plurale tantum ([P09-E41](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E41-pluralia-tantum.md)).
  Seed *dorso*, the anatomical singular, now, and swap to *costas* when E41 lands.
  **E41 has landed (2026-09-24):** a lexeme seeded `count: 'plural'` with its plural as `base` now renders plural throughout ([P09-E41](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E41-pluralia-tantum.md)).
- **Italian *viso* against *faccia***: both are the face. *Faccia* is also "cheek" (nerve) and
  appears in idioms; *viso* is the neutral word. Spanish *cara* is also "expensive" (fem. of CARO),
  which no seeded adjective is.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| HEAD | PART definite, `adjectives: ['HIGH']`, ⟵whole BODY | the high part of a body |
| FACE | PART definite ⟵whole HEAD + subject-gap relative, HAVE, object EYE definite plural | the part of a head that has the eyes |
| HEALTH | STATE definite, `adjectives: ['GOOD']`, possessor BODY | a body's good state |

**Three of four.** BACK_BODY is literal by design (reading 3).

## Probe renders (2026-09-24, engine source at 1229928, lexicon seeded in memory with the forms above)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| HEAD | the high part of a body | la parte alta di un corpo | la partie haute d'un corps | der hohe Teil eines Körpers | la parte alta de un cuerpo | 体の高い部分 | a parte alta de um corpo |
| FACE | the part of a head that has the eyes | la parte di una testa che ha gli occhi | la partie d'une tête qui a les yeux | der Teil eines Kopfes, der die Augen hat | la parte de una cabeza que tiene los ojos | 目がある頭の部分 | a parte de uma cabeça que tem os olhos |
| HEALTH | a body's good state | il buono stato di un corpo | le bon état d'un corps | der gute Zustand eines Körpers | el estado bueno de un cuerpo | 体の良い状態 | o estado bom de um corpo |

The words themselves:

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| HEAD | the cat sees a head | il gatto vede una testa | le chat voit une tête | der Kater sieht einen Kopf | el gato ve una cabeza | 猫は頭を見ます | o gato vê uma cabeça |
| FACE | the cat sees a face | il gatto vede un viso | le chat voit un visage | der Kater sieht ein Gesicht | el gato ve una cara | 猫は顔を見ます | o gato vê um rosto |
| BACK_BODY (pt *costas*, plural-only) | the cat sees a back | il gatto vede una schiena | le chat voit un dos | der Kater sieht einen Rücken | el gato ve una espalda | 猫は背中を見ます | o gato vê uma costas ✗ |
| HEALTH | the cat sees the health | il gatto vede la salute | le chat voit la santé | der Kater sieht die Gesundheit | el gato ve la salud | 猫は健康を見ます | o gato vê a saúde |

The lead that was not taken:

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| BACK_BODY: the OPPOSITE part of a body | the opposite part of a body | la parte opposta di un corpo | la partie opposée d'un corps | der entgegengesetzte Teil eines Körpers | la parte opuesta de un cuerpo | 体の反対の部分 | a parte oposta de um corpo |

Readings to judge on authoring:

1. **HEAD is NIGHT's shape**, "the dark part of a day": a definite part picked out by an adjective.
   HIGH is *alto, haut, hoch* 高い, the height sense, so "the high part of a body" is the top. It is
   ORGAN's `partOfGloss('BODY')` narrowed, and it does not restate it.
2. **FACE stands on HEAD**, as CASE_INSTANCE stood on THING in B65, so HEAD is seeded first. The
   eyes are definite plural, as the parents are in the sibling glosses ("the same parents").
3. **BACK_BODY is literal by design.** "Opposite" needs something to be opposite to. The face would
   do, but OPPOSITE takes no complement ("opposite to the face" is not a plan), and "the part of a
   body behind the chest" needs CHEST. Neither was worth seeding for one tooltip.
4. **HEALTH writes the Saxon genitive in English**, "a body's good state", as a possessor on an
   indefinite whole does elsewhere (LANGUAGE's "Italy's language"). The `whole` role would say "of a
   body", but health is not a part of the body. Italian *il buono stato* puts BUONO before the noun as
   BAGS adjectives go. That is correct Italian, if less usual than *il buono stato di salute*, which
   restates the word.

## Not solved by this seed

1. **BACK_BODY's gloss** (reading 3) and Portuguese *costas* (E41).
2. **The leader sense of HEAD, the rear sense of BACK** — later concepts.
3. **"Healthy"** is not in the band; when it is seeded, HEALTH's gloss gives it a genus ("of good
   health", `dimGloss('HEALTH', 'GOOD')`).

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored:
FACE in German and Japanese (a part-whole head carrying a relative: *der Teil eines Kopfes, der die
Augen hat*, 目がある頭の部分).
