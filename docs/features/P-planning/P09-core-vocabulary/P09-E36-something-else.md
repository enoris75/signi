# P09-E36. *Something else*, *something big* — a modifier on an indefinite pronoun

**Construct:** an adjective (and *else*) on SOMETHING and its kin: postposed in English, with *di*
/ *de* in Italian and French, as a neuter adjectival noun in German.
**Shape:** the indefinite pronoun accepts `adjectives`; each engine spells them its own way; *else*
is OTHER's form on a pronoun.
**Scope:** all 7 languages.
**Status:** planning, unscheduled. Filed 2026-09-24 from
[P09-E24](Z-done/P09-E24-ranks-201-400.md)'s §3.
**Words:** *else* (rank 373). The same construct gives *something big*, *someone new*, *nothing
important*.

| lang | the cat eats **something else** (proposed) | … **something big** (proposed) | engine at 1229928 (SOMETHING + BIG) |
|---|---|---|---|
| en | something else | something big | the cat eats something ✗ |
| it | qualcos'altro | qualcosa di grande | il gatto mangia qualcosa ✗ |
| fr | autre chose | quelque chose de grand | le chat mange quelque chose ✗ |
| de | etwas anderes | etwas Großes | der Kater frisst etwas ✗ |
| es | otra cosa | algo grande | el gato come algo ✗ |
| pt | outra coisa | algo grande | o gato come algo ✗ |
| ja | 別の何か | 大きい何か | 猫は大きい何かを食べます ✓ |

**Proposed** in the first two columns; the third is the engine's output.

## Why

An indefinite pronoun with a modifier is ordinary speech ("something else", "nothing new"), and at
1229928 the adjective is **silently dropped** in six languages: the plan says *big* and the sentence
does not. Only Japanese, whose pronoun is a noun, writes it.

## Today

Verified at 1229928, 2026-09-24.

- Probed: SOMETHING with `adjectives: ['BIG']` and with `['OTHER']` renders the third column in the
  six European languages, and 大きい何か / 別の何か in Japanese.
- SOMETHING's forms ([`pronouns.ts:122`](../../../../packages/backend/src/concepts/pronouns.ts#L122))
  are a pronoun's, with no gender where the European languages would need one for an adjective (it
  *qualcosa* takes a masculine adjective: *qualcosa di bello*).

## Design

### D1. The spellings

- **en**: the adjective after the pronoun ("something big"); OTHER as *else*.
- **it / fr**: *di* / *de* + the masculine singular adjective (*qualcosa di grande*, *quelque chose
  de grand*); OTHER fuses: *qualcos'altro*, *autre chose* (which replaces the pronoun).
- **de**: the adjective as a capitalised neuter noun in the pronoun's case (*etwas Großes*, *nichts
  Neues*); OTHER as *anderes*. The adjectival-noun declension exists (P11 D8, four surfaces).
- **es / pt**: the adjective after the pronoun (*algo grande*); OTHER replaces it: *otra cosa, outra
  coisa*.
- **ja**: prenominal, as today.

**Recommendation: implement each spelling in the engine's pronoun path, and stop dropping
adjectives** — a pronoun that cannot take one should fail loudly rather than lose it.

### D2. *Else* is OTHER

**Recommendation: no ELSE concept.** *Else* is what English writes for OTHER after an indefinite or
a wh-word ("who else"), which is the lexeme's own form (`after_pronoun: 'else'`).

## Engine

- Each engine's pronoun phrase: the adjective spellings of D1; OTHER's fused forms.
- A guard (test) that no adjective on a pronoun is dropped.

## Tests

`indefinite-pronoun.test.ts`: SOMETHING + BIG, SOMETHING + OTHER, negated (*nothing big*: *niente di
grande, rien de grand, nichts Großes, nada grande*, 大きいものは何も… — ja to probe).

## Verification

Engine suite green. SOMETHING's shipped gloss ("an unknown thing") is a noun, so it does not move.

## Out of scope (follow-ups)

- ***Who else, what else*** — OTHER after a wh-word, once the question word takes modifiers.
- **SOMEONE and EVERYTHING** take the same path once seeded
  ([P09-E40](P09-E40-someone.md), [B90](../../../localization/B-needs-seed/B90-everything.md)).
