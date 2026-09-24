# P09-E33. *Including* and *such as* — naming members of a noun's set

**Construct:** a noun-phrase post-modifier that names some members of the set the head denotes:
"animals **such as** the cat", "the animals, **including** the cat".
**Shape:** one `NounPhrase` field holding a noun element and a relation (`example | inclusion`),
spelled after the head.
**Scope:** all 7 languages, plan-only (no builder control).
**Status:** **shipped, 2026-09-24**, plan-only — in the engine for all seven languages; see
[Done](#done). Filed 2026-09-24 from [P09-E24](P09-E24-ranks-201-400.md)'s §3.
**Words:** *including* (rank 394), *such* (397, "such as"). The two are one construct with two
relations. They share the slot and differ only in whether the list is closed or open.

| lang | animals **such as** the cat run (proposed) | the animals, **including** the cat, run (proposed) | animals run **like** the dog (engine: manner) |
|---|---|---|---|
| en | animals such as the cat run | the animals, including the cat, run | animals run like the dog |
| it | animali come il gatto corrono | gli animali, compreso il gatto, corrono | animali corrono come il cane |
| fr | des animaux comme le chat courent | les animaux, y compris le chat, courent | animaux courent comme le chien |
| de | Tiere wie der Kater laufen | die Tiere, einschließlich des Katers, laufen | Tiere laufen wie der Hund |
| es | animales como el gato corren | los animales, incluido el gato, corren | animales corren como el perro |
| pt | animais como o gato correm | os animais, incluindo o gato, correm | animais correm como o cão |
| ja | 猫のような動物が走ります | 猫を含む動物が走ります | 動物は犬のように走ります |

**Proposed at filing** in the first two columns; the third is the engine's manner adverbial on the
verb, a different thing, and unchanged. See [Done](#done) for what the engine now writes.

## Done

Shipped 2026-09-24. D1, D2 and D3 as recommended. The engine now writes (every cell pinned in the
`examples: such as / including (P09-E33)` block at the end of
[`nounPhrase.test.ts`](../../../../../packages/engine/test/nounPhrase.test.ts)):

| lang | animals **such as** the cat run | the animals, **including** the cat, run | the man sees animals **such as** the cat | the man sees the animals, **including** the cat |
|---|---|---|---|---|
| en | animals such as the cat run. | the animals, including the cat, run. | the man sees animals such as the cat. | the man sees the animals, including the cat. |
| it | animali come il gatto corrono. | gli animali, compreso il gatto, corrono. | l'uomo vede animali come il gatto. | l'uomo vede gli animali, compreso il gatto. |
| fr | animaux comme le chat courent. | les animaux, y compris le chat, courent. | l'homme voit des animaux comme le chat. | l'homme voit les animaux, y compris le chat. |
| de | Tiere wie der Kater laufen. | die Tiere, einschließlich des Katers, laufen. | der Mann sieht Tiere wie den Kater. | der Mann sieht die Tiere, einschließlich des Katers. |
| es | animales como el gato corren. | los animales, incluido el gato, corren. | el hombre ve animales como el gato. | el hombre ve los animales, incluido el gato. |
| pt | animais como o gato correm. | os animais, incluindo o gato, correm. | o homem vê animais como o gato. | o homem vê os animais, incluindo o gato. |
| ja | 猫のような動物は走ります。 | 猫を含む動物は走ります。 | 男は猫のような動物を見ます。 | 男は猫を含む動物を見ます。 |

Agreement with the example, not the head (*including*, subject):

| lang | the cat (fem) | the dogs | the cats (fem) |
|---|---|---|---|
| it | gli animali, compresa la gatta, corrono. | gli animali, compresi i cani, corrono. | gli animali, comprese le gatte, corrono. |
| es | los animales, incluida la gata, corren. | los animales, incluidos los perros, corren. | los animales, incluidas las gatas, corren. |
| de | die Tiere, einschließlich der Katze, laufen. | die Tiere, einschließlich der Hunde, laufen. | die Tiere, einschließlich der Katzen, laufen. |
| fr / pt | y compris / incluindo, invariable: *la chatte*, *les chiens*; *a gata*, *os cães* | | |

Also pinned in seven: *wie* in the dative (*der Mann gibt den Tieren wie dem Kater das Buch*); a
coordinated group (*animals such as the cat and the dog*, 猫と犬のような動物); pronoun examples (*people
such as him*, *persone come lui*, *Personen wie er*, *personas como él*; *the people, including me*,
*compreso me*, *y compris moi*, *einschließlich mir*, *incluido yo*, *incluindo eu*); the order after a
relative clause (*the animals that eat, including the cat, run*, *die Tiere, die fressen,
einschließlich des Katers, laufen*); a possessor naming examples (*the book of the animals such as the
cat*, *das Buch der Tiere wie des Katers*, 猫のような動物の本); and 含む's furigana.

What landed differently from the plan:

1. **The field is `NounPhrase.examples?: { phrase: NounElement; relation: 'example' | 'inclusion' }`**,
   the last member of `NounPhrase`, as D1 wrote it. The translator resolves its phrase as a slot of its
   own (`resolveNounElement`) onto `ResolvedNounPhrase.examples`, so a coordinated group comes free.
   Plan-only: no builder control, carried inertly by the frontend.
2. **One function per engine**, appended where each ends its noun phrase: en `enExamples` (through
   `withRelative`), it `itExamples` and fr `frExamples` (end of `renderNP`), es `esExamples` and pt
   `ptExamples` (every return of `withRelative`), de `nounExamples` (after `subordinateClause` in the
   four places that already append `nounStandard`), ja `jaExampleSegs` (front of `npSegs`).
3. **Where it stands:** after everything else in the phrase, **the relative clause included** — the
   plan did not say. "The animals, including the cat, that eat" would hang the relative on the cat.
   Japanese leads the whole phrase with it, ahead of an attributive standard and the relative clause,
   for the reason P09-E18 put its standard there: a prenominal modifier takes the nearest noun, and
   this one ends in a noun of its own.
4. **The closing comma.** *Including* is written with a comma on both sides; the closing one has
   nothing to close at the end of a sentence. German and French already tidied their sentences
   (`punctuate`); the other four had no such step, so a shared
   [`tidyCommas`](../../../../../packages/engine/src/translator/functions/tidyCommas.ts) runs once in
   `translate` on every language: a run of commas collapses to one, a trailing comma gives way to the
   stop. No existing rendering changed.
5. **English possessors.** A possessor that names examples is post-modified (`isPostModified`), so it
   takes the of-genitive, never the clitic ("the book of the animals such as the cat", not "*…the
   cat's book").
6. **Pronoun forms, which the plan did not rule:** English the object form (*such as him*), Italian
   and French the tonic (*come lui*, *compreso me*, *y compris moi*), Spanish and Portuguese the
   subject form, as after their comparative *como* (*como él*, *incluido yo*, *incluindo eu*), German
   the head's case after *wie* (*wie er*) and the **dative** after *einschließlich* (*einschließlich
   mir*), since the genitive pronoun is archaic. Portuguese *incluindo eu* is the colloquial form; the
   normative *incluindo-me* / *inclusive eu* would need a clitic path the noun phrase does not have.
7. **French *animaux comme le chat courent*** keeps the engine's bare plural subject without *des* —
   the shipped defect E24 reported, not this construct's. The object gets *des* (*voit des animaux
   comme le chat*).
8. **Japanese は, not が.** The proposed 猫のような動物**が**走ります is written with the engine's usual
   topic は for a main-clause subject; the example clause itself is as proposed.

## Why

*Such as* and *including* are how a text gives examples. The manner complement's *like* ("runs like
the dog") compares how an act is done and hangs off the verb. An example hangs off the noun, agrees
with it (it *compreso / compresa*, es *incluido / incluida*) and, in German, takes its case.

## Today

Verified at 1229928, 2026-09-24 (before this task).

- Probed: the only *like / come / wie* the engine writes is the `manner` complement's similative
  (third column). No noun-phrase field names members of the head's set.
- The third column also shows the French bare plural subject without *des* (*animaux courent*), a
  shipped defect reported by E24, not this task's.

## Design

### D1. One field, two relations

**Recommendation: `NounPhrase.examples?: { phrase: NounElement; relation: 'example' | 'inclusion' }`**.
`example` is *such as* (*come, comme, wie, como*, 〜のような); `inclusion` is *including*
(*compreso, y compris, einschließlich* + gen., *incluido, incluindo*, 〜を含む). **Accepted.**

### D2. Agreement and case

Italian *compreso* and Spanish *incluido* agree with the example, not the head (*compresa la gatta*).
German *einschließlich* takes the genitive. **Recommendation: each engine agrees and cases the
example phrase itself.** **Accepted.**

### D3. Commas

*Including* is parenthetical (commas on both sides) in the European languages; *such as* is not.
Japanese puts both before the head as a prenominal clause. **Recommendation: the relation decides.**
**Accepted.**

## Engine

- `shared`: the field. Each engine's noun-phrase renderer: the word, agreement, case, commas; ja the
  prenominal clause (〜のような, 〜を含む). *(See Done 2 and 4.)*

## Tests

`noun-phrase.test.ts`: both relations, subject and object, German genitive, Italian and Spanish
agreement. *(Landed in `nounPhrase.test.ts`, the existing file.)*

## Verification

Engine suite green.

## Out of scope (follow-ups)

- ***Such* as a determiner** ("such a cat") — [P09-E25](../P09-E25-quantity-determiners.md) D3.
- ***Excluding / except*** — the negative relation, later.
