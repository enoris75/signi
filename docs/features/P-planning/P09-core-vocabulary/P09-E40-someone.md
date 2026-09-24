# P09-E40. *Someone* — a human indefinite pronoun

**Construct:** SOMETHING's person counterpart, which must stay a full phrase (no clitic, no pro-drop)
while being a person (*who*, the Spanish personal *a*).
**Shape:** `isPronounElement` stops keying on `thing`; an indefinite pronoun is known by its slot.
**Scope:** all 7 languages.
**Status:** planning, unscheduled. Filed 2026-09-24 from
[P09-E24](Z-done/P09-E24-ranks-201-400.md)'s §3.
**Words:** *someone* (rank 302). Its negative forms are *anyone / nobody* in English and *nessuno,
personne, niemand, nadie*, 誰も, *ninguém*.

| lang | the cat sees **someone** (proposed) | engine, SOMEONE seeded in memory | **someone** runs (engine) | the cat does not see anyone (engine) |
|---|---|---|---|---|
| en | the cat sees someone | the cat sees someone | someone runs | the cat does not see anyone |
| it | il gatto vede qualcuno | il gatto qualcuno vede ✗ | corre ✗ | il gatto non nessuno vede ✗ |
| fr | le chat voit quelqu'un | le chat quelqu'un voit ✗ | quelqu'un court | le chat ne personne voit ✗ |
| de | der Kater sieht jemanden | der Kater sieht jemanden | jemand läuft | der Kater sieht niemand ✗ (niemanden) |
| es | el gato ve a alguien | el gato alguien ve ✗ | corre ✗ | el gato no nadie ve ✗ |
| pt | o gato vê alguém | o gato alguém vê ✗ | corre ✗ | o gato não ninguém vê ✗ |
| ja | 猫は誰かを見ます | 猫は誰かを見ます | 誰かは走ります | 猫は誰も見ません |

**Proposed** in the first column; the others are the engine's output with SOMEONE seeded in memory
on SOMETHING's forms minus `thing`.

## Why

*Someone* is ordinary, and its seed is SOMETHING's with person forms. The only thing in the way is
how the engine tells a pronoun that cliticizes (*lo vede*) from one that does not (*vede qualcosa*):
by the lexeme's `thing` flag, which a person cannot carry honestly.

## Today

Verified at 1229928, 2026-09-24.

- [`isPronounElement`](../../../../packages/engine/src/functions/isPronounElement.ts#L16): `!!head?.['person']
  && head['thing'] !== '1'`. SOMETHING carries `thing: '1'` (C32 *Done* 2), so it stays a phrase; a
  person pronoun without it is cliticized before the verb in the Romance languages and dropped as a
  subject in it/es/pt (the table).
- The Spanish and Portuguese personal *a* reads `thing` too
  ([`es/predicateText.ts:249`](../../../../packages/engine/src/languages/es/predicateText.ts#L249)):
  a thing takes none, anything else takes *a*, so SOMEONE would get it right once it is a phrase.
- German negative concord writes *niemand* in the object, where the accusative *niemanden* is the
  standard form (a `negative_object` form is missing, like English's `negative_subject`).

## Design

### D1. What marks an indefinite

**Recommendation: `isPronounElement` excludes `slot: 'indefinite'`** (the concept's slot, which C32
already sets on SOMETHING), not `thing`. `thing` keeps its other job (no personal *a*, the Japanese
animacy of `isAnimate`), and SOMEONE drops it.

### D2. German case forms

**Recommendation: `object` (*jemanden*), `dative` (*jemandem*) and `negative_object` (*niemanden*)
forms**, read by the German case path, the way English reads `negative_subject`.

### D3. The seed

SOMEONE ships with this task: `slot: 'indefinite'`, `human: true`, the forms of the table, gloss
`glossOf('PERSON', 'UNKNOWN')` ("an unknown person", probed: *una persona sconosciuta, eine unbekannte
Person*, 不明な人), SOMETHING's "an unknown thing" on PERSON.

## Engine

- `isPronounElement`; the German case forms; the seed.

## Tests

`indefinite-pronoun.test.ts`: SOMEONE subject, object, negated subject and object, the Spanish *a*,
German accusative and dative.

## Verification

Engine suite green; SOMETHING's rows unchanged.

## Out of scope (follow-ups)

- ***Everyone*** — not in the band; the same path.
- ***Someone else*** — [P09-E36](P09-E36-something-else.md).
