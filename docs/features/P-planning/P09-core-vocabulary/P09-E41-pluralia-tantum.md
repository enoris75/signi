# P09-E41. Pluralia tantum — *the news*, *le notizie*, *die Nachrichten*

**Construct:** a noun that is plural in every use in one language and singular (or mass) in another,
so the verb, the article and the adjectives agree plural there.
**Shape:** `count: 'plural'` with no singular, as [P08 D5](../P08-collective-nouns/README.md)
proposed, honoured by every engine's article, adjective and verb agreement.
**Scope:** all 7 languages (English and Japanese mostly unchanged).
**Status:** planning, unscheduled. Filed 2026-09-24 from
[P09-E24](Z-done/P09-E24-ranks-201-400.md)'s §3.
**Words:** *news* (rank 345). The same construct unblocks the plural words
[B77](../../../localization/B-needs-seed/B77-teams-institutions-and-business.md)'s BUSINESS and
[B79](../../../localization/B-needs-seed/B79-head-face-back-health.md)'s BACK_BODY want (*gli affari,
les affaires, los negocios, os negócios*; pt *as costas*), and P08's POLICE (en) and PEOPLE_GENERAL
(fr *gens*, de *Leute*).

| lang | **the news** seems good (proposed) | engine, NEWS seeded `count: 'plural'` in memory |
|---|---|---|
| en | the news seems good | the news seems good |
| it | le notizie sembrano buone | la notizie sembra buona ✗ |
| fr | les nouvelles semblent bonnes | la nouvelles semble bonne ✗ |
| de | die Nachrichten scheinen gut | die Nachrichten scheint gut ✗ |
| es | las noticias parecen buenas | la noticias parece buena ✗ |
| pt | as notícias parecem boas | a notícias parece boa ✗ |
| ja | ニュースは良く思えます | ニュースは良く思えます |

**Proposed** in the first column; the second is the engine's output.

## Why

NEWS is mass and singular in English and plural in five languages, so no single `count` can serve it,
and a singular seed in those five (*la notizia*) is "a news item". P08 proposed the mechanism for its
collectives and it was never built.

## Today

Verified at 1229928, 2026-09-24.

- No seeded noun has `count: 'plural'` (grepped `nouns.ts`). A noun seeded with `count: 'plural'`
  and no `plural` form renders the second column: the article, the adjective and the verb stay
  singular (*la notizie sembra buona*), and German leaves the verb singular. English is right because
  its forms are singular.
- The phrase number is read from `forms['number'] ?? forms['count']` in the English determiner
  ([`determiner.ts:29`](../../../../packages/engine/src/languages/en/determiner.ts#L29)), so the
  mechanism half exists in one engine.

## Design

### D1. Per-language `count`

**Recommendation: `count: 'plural'` in the languages whose word is plural-only**, singular elsewhere,
exactly as P08 D5 wrote it. Every engine resolves the phrase's number from the lexeme's `count` when
the plan does not set one, and treats `base` as the plural surface.

### D2. What the user's "plural" means

A plan may say `number: 'plural'` of NEWS ("the news*es*"), which English cannot say.
**Recommendation: the lexeme wins** where it is plural-only or mass, and a plural on a mass English
noun stays singular, as it does for WATER.

### D3. The Italian article

*Le notizie* needs the feminine plural article on a noun with no singular. **Recommendation:**
gender stays on the lexeme (`gender: 'fem'`), which it already does.

## Engine

- Each engine's noun phrase: number from the lexeme when the lexeme is plural-only; verb agreement
  from the phrase number (already so).

## Tests

A `pluralia-tantum.test.ts`: NEWS as subject and object, with an adjective, in seven languages; one
P08 word (POLICE in English: "the police run") if P08 has landed.

## Verification

Engine suite green; then NEWS is seeded (its B ticket, filed from this task's Done), and B77 and B79
swap to their plural words.

## Out of scope (follow-ups)

- **P08's collectives** — P08's own seeding.
- **Scissors, trousers** — English plurals-only; later.
