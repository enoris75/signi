# P09-E40. *Someone* — a human indefinite pronoun

**Construct:** SOMETHING's person counterpart, which must stay a full phrase (no clitic, no pro-drop)
while being a person (*who*, the Spanish personal *a*).
**Shape:** `isPronounElement` stops keying on `thing`; an indefinite pronoun is known by its slot.
**Scope:** all 7 languages.
**Status:** **shipped, 2026-09-24** — D1–D3 as ruled; see [Done](#done). Filed 2026-09-24 from
[P09-E24](P09-E24-ranks-201-400.md)'s §3.
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

## Done

Shipped 2026-09-24, as recommended in D1–D3. SOMEONE is seeded
([`pronouns.ts`](../../../../../packages/backend/src/concepts/pronouns.ts)) with `slot: 'indefinite'`,
`human: true`, no `thing`, SOMETHING's negative pattern and the German case forms, glossed "an
unknown person" on PERSON. [`isPronounElement`](../../../../../packages/engine/src/functions/isPronounElement.ts)
excludes the `indefinite` form, which the lexicon's `lookupPronoun`
([`lexicon.ts`](../../../../../packages/backend/src/lexicon.ts)) now sets from the concept's slot
(with `human` from the concept). Engine output, pinned in
[`indefinite-pronoun.test.ts`](../../../../../packages/engine/test/indefinite-pronoun.test.ts):

| | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| the cat sees **someone** | the cat sees someone. | il gatto vede qualcuno. | le chat voit quelqu'un. | der Kater sieht jemanden. | el gato ve a alguien. | o gato vê alguém. | 猫は誰かを見ます。 |
| **someone** runs | someone runs. | qualcuno corre. | quelqu'un court. | jemand läuft. | alguien corre. | alguém corre. | 誰かは走ります。 |
| someone saw the cat | someone saw the cat. | qualcuno vide il gatto. | quelqu'un vit le chat. | jemand sah den Kater. | alguien vio el gato. | alguém viu o gato. | 誰かは猫を見ました。 |
| the cat does not see anyone | the cat does not see anyone. | il gatto non vede nessuno. | le chat ne voit personne. | der Kater sieht niemanden. | el gato no ve a nadie. | o gato não vê ninguém. | 猫は誰も見ません。 |
| nobody runs | nobody runs. | nessuno corre. | personne ne court. | niemand läuft. | nadie corre. | ninguém corre. | 誰も走りません。 |
| the cat helps someone (de dative) | the cat helps someone. | il gatto aiuta qualcuno. | le chat aide quelqu'un. | der Kater hilft jemandem. | el gato ayuda a alguien. | o gato ajuda alguém. | 猫は誰かを手伝います。 |
| … does not help anyone | the cat does not help anyone. | il gatto non aiuta nessuno. | le chat n'aide personne. | der Kater hilft niemandem. | el gato no ayuda a nadie. | o gato não ajuda ninguém. | 猫は誰も手伝いません。 |
| the cat runs with / for someone | … with someone / for someone. | … con / per qualcuno. | … avec / pour quelqu'un. | … mit jemandem / für jemanden. | … con / para alguien. | … com / para alguém. | 誰かと / 誰かのために |

SOMETHING's rows (object, subject, both negated, tense) are unchanged: its existing tests pass as
they were.

What landed differently from the plan:

1. **The slot reaches the engine as a form.** The engine sees lexeme forms, not concepts, so
   `lookupPronoun` joins `semantic_concepts` and sets `indefinite: '1'` (and `human: '1'`) — no
   shared-type field. `isPronounElement` reads `forms.indefinite`; `thing` keeps the personal *a*
   and the Japanese animacy.
2. **Portuguese takes no personal *a* before *alguém* / *ninguém*.** The table's proposal was right
   ("o gato vê alguém"), but the pt tonic path added *a* to anything that was not a `thing`, so the
   first probe read "vê a alguém". [`pt/predicateText.ts`](../../../../../packages/engine/src/languages/pt/predicateText.ts)
   now skips it for an indefinite too; Spanish keeps "ve a alguien", "no ve a nadie".
3. **The dative is the `disjunctive`**, as it is for the persons (`tonicPronounDe`): *jemandem*, and
   its negative `negative_disjunctive` *niemandem*, which the dative-governing object (HELP) reads.
   A complement under negation is not polarised at all (SOMETHING alike: "läuft nicht mit etwas"),
   so the negative dative after a preposition does not render yet (reported with this batch, not filed here).
4. **No e2e row.** A pronoun with a `slot` is offered by no picker (the chooser's person row skips
   it, like SOMETHING's; `usePronounChooser`), so there is no tooltip to hover.
5. English carries no gender (none is needed: *someone* agrees as a 3rd singular); the Romance
   languages and German carry `masc`, the agreement *qualcuno* / *jemand* takes.
6. Japanese keeps the は topic of SOMETHING's rows (誰かは走ります), as the table's engine column
   showed; が would be the more natural choice for both, and is not this task's to change.

## Why

*Someone* is ordinary, and its seed is SOMETHING's with person forms. The only thing in the way is
how the engine tells a pronoun that cliticizes (*lo vede*) from one that does not (*vede qualcosa*):
by the lexeme's `thing` flag, which a person cannot carry honestly.

## Today

Verified at 1229928, 2026-09-24.

- [`isPronounElement`](../../../../../packages/engine/src/functions/isPronounElement.ts#L16): `!!head?.['person']
  && head['thing'] !== '1'`. SOMETHING carries `thing: '1'` (C32 *Done* 2), so it stays a phrase; a
  person pronoun without it is cliticized before the verb in the Romance languages and dropped as a
  subject in it/es/pt (the table).
- The Spanish and Portuguese personal *a* reads `thing` too
  ([`es/predicateText.ts:249`](../../../../../packages/engine/src/languages/es/predicateText.ts#L249)):
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
- ***Someone else*** — [P09-E36](P09-E36-something-else.md), shipped the same day.
