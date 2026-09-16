# B32. Place glosses — HOME, MARKET, HOUSE, PRISON ("a place where one …")

_(split from [C07](C07-places-locative-gap.md), whose engine work is done.)_

The engine renders a locative relative clause: the head fills the clause's *where*, and the clause
has its own generic subject. What's left is vocabulary. Each place noun is defined by what one does
there, and none of those verbs is seeded except BUY.

## Plan shape

A new helper beside `patientGloss` in
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts), added by the first task that uses it:

```ts
const whereGloss = (genus: string, verb: string, object?: string): PhrasePlan => ({
  subject: {
    concept: genus,
    definiteness: 'indefinite',
    relative: {
      headRole: 'locative',
      subject: { concept: 'GENERIC_PERSON' },
      verbPhrase: { verb },
      ...(object ? { directObject: { concept: object, definiteness: 'bare', number: 'plural' } } : {}),
    },
  },
});
```

Probed with EAT standing in (real engine output): en `a place where one eats` · it `un luogo dove si
mangia` · fr `un lieu où l'on mange` · de `ein Ort, in dem man isst` · es `un lugar donde se come` ·
ja `食べる場所` · pt `um lugar onde se come`.

The verb must license a `locative` complement (BUY already does).

## Seed first — `/seed`

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| LIVE | verb, intransitive, complements incl. `locative` | to have one's home somewhere | live | abitare | habiter | wohnen | vivir | 住む (すむ) | morar |

The forms are suggestions, not renders. **LIVE is polysemous.** The dwelling sense wanted here is it
*abitare*, fr *habiter*, de *wohnen*, pt *morar*. The *be alive* sense is *vivere* / *vivre* /
*leben* / *viver*. es *vivir* and ja 住む fit the dwelling sense.

## Unlocks

| concept | plan | gloss (en) | status |
|---|---|---|---|
| HOME | `whereGloss('PLACE', 'LIVE')` | a place where one lives | ✓ once LIVE is seeded |
| MARKET | `whereGloss('PLACE', 'BUY', 'OBJECT_THING')` | a place where one buys objects | ⚠ composable **today**, but does not tell a market from a shop. The intended "buys **and sells**" needs SELL *and* a coordinated predicate inside a relative clause, which the engine cannot render (`RelativeClause` has one `verbPhrase`). A single verb like TRADE avoids that. Pick one. |
| HOUSE | `whereGloss('BUILDING', 'LIVE')` | a building where one lives | ✓ once LIVE is seeded — BUILDING landed with [B29](B29-building-genus.md) |
| PRISON | — | a building where people are confined | ✗ needs CONFINE (BUILDING landed with [B29](B29-building-genus.md)). The passive "are confined" is [features/A01](../../features/A-ready/A01-passive-voice/README.md). The active `whereGloss('BUILDING', 'CONFINE', 'PERSON')` "a building where one confines persons" avoids it, but probe the plural PERSON first. |

Known surface simplifications these inherit:
- French drops *des* on a bare plural object: "où l'on achète objets" ([B31](B31-complement-genus.md) notes the same).
- Portuguese leaves the passive *se* unagreed: "onde se compra objetos"; it and es agree ("si comprano", "se compran").

## What shipped (2026-09-16)

`whereGloss` landed in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts) in the shape
this file proposed, beside `patientGloss`. Three verbs were seeded, and all four places got a
gloss — including PRISON, which this file had marked ✗.

**Seeded** (all in `verbs/`, all with `NONFINITE` entries):

- **LIVE** — intransitive, licensing `locative`, the dwelling sense as planned (it *abitare*,
  fr *habiter*, de *wohnen*, pt *morar*; es *vivir*, ja 住む). `synonym: 'dwell'` says which sense
  it is, since the English word also means "to be alive".
- **TRADE** — intransitive, the MARKET decision below. de *handeln* is an `-eln` verb (ich
  **handle**), fr *commercer* takes a cedilla before o (nous **commerçons**), ja 売買する is the
  *suru* compound of 売 sell and 買 buy.
- **CONFINE** — transitive. German takes *inhaftieren* rather than *einsperren*, whose separable
  prefix the engine cannot place; as an `-ieren` verb its participle has no *ge-*. es *encerrar*
  diphthongs its stressed stem (enc**ie**rra, but encerramos), it *rinchiudere* has the irregular
  participle *rinchiuso*.

| concept | plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| HOME | `whereGloss('PLACE', 'LIVE')` | a place where one lives | un luogo dove si abita | un lieu où l'on habite | ein Ort, in dem man wohnt | un lugar donde se vive | 住む場所 | um lugar onde se mora |
| HOUSE | `whereGloss('BUILDING', 'LIVE')` | a building where one lives | un edificio dove si abita | un bâtiment où l'on habite | ein Gebäude, in dem man wohnt | un edificio donde se vive | 住む建物 | um edifício onde se mora |
| MARKET | `whereGloss('PLACE', 'TRADE')` | a place where one trades | un luogo dove si commercia | un lieu où l'on commerce | ein Ort, in dem man handelt | un lugar donde se comercia | 売買する場所 | um lugar onde se comercia |
| PRISON | `whereGloss('BUILDING', 'CONFINE', 'PERSON')` | a building where one confines people | un edificio dove si rinchiudono persone | un bâtiment où l'on enferme personnes | ein Gebäude, in dem man Personen inhaftiert | un edificio donde se encierran personas | 人を閉じ込める建物 | um edifício onde se encarcera pessoas |

**MARKET: TRADE, objectless.** Of the three shapes probed, this is the one picked.

- `whereGloss('PLACE', 'BUY', 'OBJECT_THING')` renders ("a place where one buys objects") but does
  not tell a market from a shop, which is what this file flagged.
- `whereGloss('PLACE', 'TRADE', 'OBJECT_THING')` is **wrong in two languages**: de *handeln* and fr
  *commercer* take no direct object, so "ein Ort, in dem man Gegenstände handelt" and "où l'on
  commerce objets" are ungrammatical. This is why TRADE is seeded intransitive.
- Objectless is grammatical in all seven and says "buys and sells" in one verb. Its cost: German
  *handeln* also means "to act", so "ein Ort, in dem man handelt" is ambiguous there.

**PRISON: composed after all.** The plural PERSON this file asked to probe first renders correctly
everywhere — en *people*, it *persone*, es *personas* — so the active gloss with a generic subject
says what the literal's passive said, without needing
[features/A01](../../features/A-ready/A01-passive-voice/README.md).

Both known surface simplifications this file predicted are present and were not treated as
blockers, since both already ship elsewhere: French drops *des* on PRISON's bare plural ("où l'on
enferme personnes"), and Portuguese leaves the impersonal *se* unagreed ("onde se encarcera
pessoas") where it and es agree ("si rinchiudono", "se encierran").

- Tests: the three verbs' paradigms in [verb.test.ts](../../../packages/engine/test/verb.test.ts) —
  a `describe` for the persons and tenses no gloss renders, plus their rows in the Italian
  resultative table — and all four tooltips in
  [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts). HOUSE was that spec's
  example of a concept with **no** plan, in two tests; both now use BUILDING, which
  [C05](../C-needs-engine/C05-non-distinguishing-genera.md) leaves on its literal deliberately.
