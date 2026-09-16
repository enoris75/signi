# B32. Place glosses — HOME, MARKET, HOUSE, PRISON ("a place where one …")

_(split from [C07](../done/C07-places-locative-gap.md), whose engine work is done.)_

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
| HOUSE | `whereGloss('BUILDING', 'LIVE')` | a building where one lives | ✓ once LIVE is seeded — BUILDING landed with [B29](../done/B29-building-genus.md) |
| PRISON | — | a building where people are confined | ✗ needs CONFINE (BUILDING landed with [B29](../done/B29-building-genus.md)). The passive "are confined" is [features/A01](../../features/A-ready/A01-passive-voice/README.md). The active `whereGloss('BUILDING', 'CONFINE', 'PERSON')` "a building where one confines persons" avoids it, but probe the plural PERSON first. |

Known surface simplifications these inherit:
- French drops *des* on a bare plural object: "où l'on achète objets" ([B31](B31-complement-genus.md) notes the same).
- Portuguese leaves the passive *se* unagreed: "onde se compra objetos"; it and es agree ("si comprano", "se compran").
