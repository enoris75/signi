# P09-E33. *Including* and *such as* — naming members of a noun's set

**Construct:** a noun-phrase post-modifier that names some members of the set the head denotes:
"animals **such as** the cat", "the animals, **including** the cat".
**Shape:** one `NounPhrase` field holding a noun element and a relation (`example | inclusion`),
spelled after the head.
**Scope:** all 7 languages.
**Status:** planning, unscheduled. Filed 2026-09-24 from
[P09-E24](Z-done/P09-E24-ranks-201-400.md)'s §3.
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

**Proposed** in the first two columns; the third is the engine's output (a manner adverbial on the
verb, which is a different thing).

## Why

*Such as* and *including* are how a text gives examples. The manner complement's *like* ("runs like
the dog") compares how an act is done and hangs off the verb. An example hangs off the noun, agrees
with it (it *compreso / compresa*, es *incluido / incluida*) and, in German, takes its case.

## Today

Verified at 1229928, 2026-09-24.

- Probed: the only *like / come / wie* the engine writes is the `manner` complement's similative
  (third column). No noun-phrase field names members of the head's set.
- The third column also shows the French bare plural subject without *des* (*animaux courent*), a
  shipped defect reported by E24, not this task's.

## Design

### D1. One field, two relations

**Recommendation: `NounPhrase.examples?: { phrase: NounElement; relation: 'example' | 'inclusion' }`**.
`example` is *such as* (*come, comme, wie, como*, 〜のような); `inclusion` is *including*
(*compreso, y compris, einschließlich* + gen., *incluido, incluindo*, 〜を含む).

### D2. Agreement and case

Italian *compreso* and Spanish *incluido* agree with the example, not the head (*compresa la gatta*).
German *einschließlich* takes the genitive. **Recommendation: each engine agrees and cases the
example phrase itself.**

### D3. Commas

*Including* is parenthetical (commas on both sides) in the European languages; *such as* is not.
Japanese puts both before the head as a prenominal clause. **Recommendation: the relation decides.**

## Engine

- `shared`: the field. Each engine's noun-phrase renderer: the word, agreement, case, commas; ja the
  prenominal clause (〜のような, 〜を含む).

## Tests

`noun-phrase.test.ts`: both relations, subject and object, German genitive, Italian and Spanish
agreement.

## Verification

Engine suite green.

## Out of scope (follow-ups)

- ***Such* as a determiner** ("such a cat") — [P09-E25](P09-E25-quantity-determiners.md) D3.
- ***Excluding / except*** — the negative relation, later.
