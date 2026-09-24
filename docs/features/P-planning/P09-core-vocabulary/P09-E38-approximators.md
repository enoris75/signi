# P09-E38. Approximators — *about five*, *almost all*

**Construct:** a word that makes a quantity approximate: on a numeral ("about five cats") or on a
quantity determiner ("almost all cats").
**Shape:** one `NounPhrase` field (`approximator: 'about' | 'almost'`) read by the numeral and
determiner paths.
**Scope:** all 7 languages.
**Status:** planning, unscheduled. Filed 2026-09-24 from
[P09-E24](Z-done/P09-E24-ranks-201-400.md)'s §3.
**Words:** *about* (rank 204, the adverb: COCA's *about/r* is the approximator, the preposition is
rank 45) and *almost* (357). *Around* (314, the adverb) is a third spelling of `about` (P09 D1).

| lang | **about** five cats run (proposed) | **almost all** cats run (proposed) | five cats run (engine) |
|---|---|---|---|
| en | about five cats run | almost all cats run | five cats run |
| it | circa cinque gatti corrono | quasi tutti i gatti corrono | cinque gatti corrono |
| fr | environ cinq chats courent | presque tous les chats courent | cinq chats courent |
| de | etwa fünf Kater laufen | fast alle Kater laufen | fünf Kater laufen |
| es | unos cinco gatos corren | casi todos los gatos corren | cinco gatos corren |
| pt | cerca de cinco gatos correm | quase todos os gatos correm | cinco gatos correm |
| ja | 約五匹の猫が走ります | ほとんどすべての猫が走ります | 五匹の猫は走ります |

**Proposed** in the first two columns; the third is the engine's output.

## Why

Approximate numbers are ordinary, and *almost* is as often on a quantity as on a verb. Both words fail
as verb adverbs. The probe of ALMOST as a frequency adverb (B-ticket candidate, dropped) rendered
*猫はほとんど走ります*, which is "the cat mostly runs", and "did not almost eat", which negates the wrong
thing.

## Today

Verified at 1229928, 2026-09-24.

- C31's `NounPhrase.numeral` renders the third column (with the Japanese counter 匹).
- The quantity determiners (`all`, `many`, …) render (*tutti i gatti*, すべての猫). Nothing modifies
  either.

## Design

### D1. One field, two values

**Recommendation: `approximator?: 'about' | 'almost'`**, valid with a numeral or with `all`, `no`
and `many`, and ignored elsewhere. *About* on a numeral is *circa, environ, etwa, unos, cerca de*,
約; *almost* is *quasi, presque, fast, casi, quase*, ほとんど.

### D2. Spanish *unos*

*Unos cinco* is the article, not an adverb, and it agrees (*unas cinco casas*). **Recommendation: the
Spanish engine agrees it.** *Aproximadamente* is the invariable alternative.

### D3. *Almost* on a verb

"The cat almost fell" (*per poco non cadde, a failli tomber, wäre fast gefallen*, もう少しで倒れるところだった)
is a different construct in four languages. **Recommendation: out of scope**, so ALMOST gets no verb
adverb concept until it is designed.

## Engine

- `shared`: the field. Each engine's numeral and determiner paths.

## Tests

`numerals.test.ts`: *about* on 5 and 12; `quantity` rows: *almost all*, *almost no*.

## Verification

Engine suite green.

## Out of scope (follow-ups)

- ***Almost* on a verb** (D3).
- ***Enough* after an adjective** ("big enough") — a postposed degree word; noted in
  [P09-E25](P09-E25-quantity-determiners.md).
