# P09-E41. Pluralia tantum — *the news*, *le notizie*, *die Nachrichten*

**Construct:** a noun that is plural in every use in one language and singular (or mass) in another,
so the verb, the article and the adjectives agree plural there.
**Shape:** `count: 'plural'` with no singular, as [P08 D5](../../P08-collective-nouns/README.md)
proposed, honoured by every engine's article, adjective and verb agreement.
**Scope:** all 7 languages (English and Japanese mostly unchanged).
**Status:** **shipped, 2026-09-24** — resolved once in the shared noun-phrase resolution for all seven
languages, NEWS seeded with it; see [Done](#done). Filed 2026-09-24 from
[P09-E24](P09-E24-ranks-201-400.md)'s §3.
**Words:** *news* (rank 345). The same construct unblocks the plural words
[B77](../../../../localization/done/B77-teams-institutions-and-business.md)'s BUSINESS and
[B79](../../../../localization/done/B79-head-face-back-health.md)'s BACK_BODY want (*gli affari,
les affaires, los negocios, os negócios*; pt *as costas*), and P08's POLICE (en) and PEOPLE_GENERAL
(fr *gens*, de *Leute*).

| lang | **the news** seems good (proposed) | engine at filing, NEWS seeded `count: 'plural'` in memory |
|---|---|---|
| en | the news seems good | the news seems good |
| it | le notizie sembrano buone | la notizie sembra buona ✗ |
| fr | les nouvelles semblent bonnes | la nouvelles semble bonne ✗ |
| de | die Nachrichten scheinen gut | die Nachrichten scheint gut ✗ |
| es | las noticias parecen buenas | la noticias parece buena ✗ |
| pt | as notícias parecem boas | a notícias parece boa ✗ |
| ja | ニュースは良く思えます | ニュースは良く思えます |

**Proposed** in the first column, now engine output word for word (see [Done](#done)); the second is
the engine at filing.

## Done

Shipped 2026-09-24. D1, D2 and D3 as recommended. The engine now writes (NEWS as seeded; every cell is
pinned in [`pluralia-tantum.test.ts`](../../../../../packages/engine/test/pluralia-tantum.test.ts)):

| lang | the news seems good | the big news seems good | the cat reads the news | the cat reads the big news | "a news" seems good (indefinite) | the cat reads "a big news" (indefinite) |
|---|---|---|---|---|---|---|
| en | the news seems good. | the big news seems good. | the cat reads the news. | the cat reads the big news. | news seems good. | the cat reads big news. |
| it | le notizie sembrano buone. | le grandi notizie sembrano buone. | il gatto legge le notizie. | il gatto legge le grandi notizie. | notizie sembrano buone. | il gatto legge grandi notizie. |
| fr | les nouvelles semblent bonnes. | les grandes nouvelles semblent bonnes. | le chat lit les nouvelles. | le chat lit les grandes nouvelles. | des nouvelles semblent bonnes. | le chat lit de grandes nouvelles. |
| de | die Nachrichten scheinen gut. | die großen Nachrichten scheinen gut. | der Kater liest die Nachrichten. | der Kater liest die großen Nachrichten. | Nachrichten scheinen gut. | der Kater liest große Nachrichten. |
| es | las noticias parecen buenas. | las noticias grandes parecen buenas. | el gato lee las noticias. | el gato lee las noticias grandes. | unas noticias parecen buenas. | el gato lee unas noticias grandes. |
| pt | as notícias parecem boas. | as notícias grandes parecem boas. | o gato lê as notícias. | o gato lê as notícias grandes. | umas notícias parecem boas. | o gato lê umas notícias grandes. |
| ja | ニュースは良く思えます。 | 大きいニュースは良く思えます。 | 猫はニュースを読みます。 | 猫は大きいニュースを読みます。 | ニュースは良く思えます。 | 猫は大きいニュースを読みます。 |

Also pinned: *this* (*queste notizie, ces nouvelles, diese Nachrichten*), *some / many / all*
(*alcune / molte / tutte le notizie*, *viele / alle Nachrichten*; English keeps the mass *much news*),
a possessive (*le mie notizie, mes nouvelles, meine Nachrichten, mis noticias, as minhas notícias*),
a plural-only noun modifier (*il libro a notizie grandi*), the word alone (`translateWord`), and D2 —
a plan's `number: 'plural'` or `'singular'` on NEWS renders the same phrase.

What landed differently from the plan:

1. **One place, not every engine.** The plan put the change in "each engine's noun phrase". It went
   into the shared resolution instead: [`applyPluralOnly`](../../../../../packages/engine/src/translator/functions/applyPluralOnly.ts),
   called from [`resolveNounPhrase`](../../../../../packages/engine/src/translator/functions/resolveNounPhrase.ts)
   before the phrase's number is settled. It copies `base` into `plural` when the lexeme seeds none,
   and the phrase is then plural whatever the plan or the determiner says. Every engine already reads
   the number off `forms['number']`, so none needed a line.
2. **The mass flag is shed.** NEWS is `countable: false` for English (*much news*, never *many news*),
   and `countable` is concept-level, so the five plural-only lexemes inherited `uncountable`. A
   plural-only lexeme drops it: *notizie* counts (*molte notizie*, *tre notizie*), and keeping it gave
   *molta notizie*, *della notizie*, *tutta la notizie*.
3. **Noun modifiers too.** The attributive noun's number is resolved by the same helper, so a
   plural-only modifier is plural and its adjective agrees (*a notizie grandi*).
4. **"A news" is the indefinite plural.** No language has it, so nothing was invented: the indefinite
   falls to each engine's indefinite of a plural (or, in English, of a mass noun) — en bare *news*,
   it / de bare, fr *des* (*de* before a prenominal adjective), es *unas*, pt *umas*. Recorded here
   and pinned.
5. **NEWS seeded with the construct**, beside STORY: en *news* (mass), it *notizie*, fr *nouvelles*,
   de *Nachrichten*, es *noticias*, pt *notícias* (all `fem`, `count: 'plural'`, no `plural` column),
   ja ニュース. **Literal** definition ("reports of recent events"): INFORMATION, which a gloss would
   stand on, is not seeded ([B81](../../../../localization/done/B81-ideas-reasons-and-information.md)).
6. **POLICE is not seeded**, so the English plural-only row the Tests section asked for is not pinned.
7. **Known gap: *no* + a plurale tantum.** The negative determiner keeps Romance singular
   (`NO_TAKES_SINGULAR`, "nessuna frase"), and its spelling tables have no plural, so NEWS under *no*
   gives *nessuna notizie sembrano buone*, *aucune nouvelles ne semblent bonnes*, *ninguna noticias
   parecen buenas*, *nenhuma notícias parecem boas* (en, de, ja are right). Wanted: the plural
   determiner the languages use with a plurale tantum — *nessune notizie*, *aucunes nouvelles*,
   *ningunas noticias*, *nenhumas notícias*. That lives in the determiner spelling, not the number
   resolution, and is not pinned.

## Why

NEWS is mass and singular in English and plural in five languages, so no single `count` can serve it,
and a singular seed in those five (*la notizia*) is "a news item". P08 proposed the mechanism for its
collectives and it was never built.

## Today

Verified at 1229928, 2026-09-24 (before this task).

- No seeded noun has `count: 'plural'` (grepped `nouns.ts`). A noun seeded with `count: 'plural'`
  and no `plural` form renders the second column: the article, the adjective and the verb stay
  singular (*la notizie sembra buona*), and German leaves the verb singular. English is right because
  its forms are singular.
- The phrase number is read from `forms['number'] ?? forms['count']` in the English determiner
  ([`determiner.ts:29`](../../../../../packages/engine/src/languages/en/determiner.ts#L29)), so the
  mechanism half exists in one engine.

## Design

### D1. Per-language `count`

**Recommendation: `count: 'plural'` in the languages whose word is plural-only**, singular elsewhere,
exactly as P08 D5 wrote it. Every engine resolves the phrase's number from the lexeme's `count` when
the plan does not set one, and treats `base` as the plural surface. **Accepted.**

### D2. What the user's "plural" means

A plan may say `number: 'plural'` of NEWS ("the news*es*"), which English cannot say.
**Recommendation: the lexeme wins** where it is plural-only or mass, and a plural on a mass English
noun stays singular, as it does for WATER. **Accepted.**

### D3. The Italian article

*Le notizie* needs the feminine plural article on a noun with no singular. **Recommendation:**
gender stays on the lexeme (`gender: 'fem'`), which it already does. **Accepted.**

## Engine

- Each engine's noun phrase: number from the lexeme when the lexeme is plural-only; verb agreement
  from the phrase number (already so). *(Landed in the shared resolution; see Done 1.)*

## Tests

A `pluralia-tantum.test.ts`: NEWS as subject and object, with an adjective, in seven languages; one
P08 word (POLICE in English: "the police run") if P08 has landed. *(POLICE is unseeded; see Done 6.)*

## Verification

Engine suite green; NEWS seeded here; B77 and B79 can swap to their plural words.

## Out of scope (follow-ups)

- **P08's collectives** — P08's own seeding.
- **Scissors, trousers** — English plurals-only; later.
