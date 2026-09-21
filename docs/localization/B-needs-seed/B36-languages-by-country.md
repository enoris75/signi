# B36. The seven languages — seed their countries: the language of Italy

_(split out of [C05](../C-needs-engine/C05-non-distinguishing-genera.md) on 2026-09-21. C05 had the
seven languages on the literal because "a language" is the same for all of them. A **genitive**
tells them apart: the language *of Italy*. The genitive ships as `NounElement.possessor`, but there
is no country to put in it.)_

## Seed first

Seven proper nouns, `proper: true, countable: false`, like the continents. There is no COUNTRY
genus to hang them on; `isA: 'PLACE'` is the nearest. Forms are suggestions for the seed author.

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| ENGLAND | England | Inghilterra (f) | Angleterre (f) | England (n) | Inglaterra (f) | イングランド | Inglaterra (f) |
| ITALY | Italy | Italia (f) | Italie (f) | Italien (n) | Italia (f) | イタリア | Itália (f) |
| FRANCE | France | Francia (f) | France (f) | Frankreich (n) | Francia (f) | フランス | França (f) |
| GERMANY | Germany | Germania (f) | Allemagne (f) | Deutschland (n) | Alemania (f) | ドイツ | Alemanha (f) |
| SPAIN | Spain | Spagna (f) | Espagne (f) | Spanien (n) | España (f) | スペイン | Espanha (f) |
| JAPAN | Japan | Giappone (m) | Japon (m) | Japan (n) | Japón (m) | 日本 | Japão (m) |
| PORTUGAL | Portugal | Portogallo (m) | Portugal (m) | Portugal (n) | Portugal (m) | ポルトガル | Portugal (m) |

**The trade.** The seven countries will themselves sit on the literal, as the continents do in C05.
"A country" would be the same for all of them, and "the country of Italian" would be circular. A
proper noun reads fine on its literal, though, and a language does not.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| ITALIAN (and the six others) | `{ subject: { concept: 'LANGUAGE', definiteness: 'definite', possessor: { concept: 'ITALY' } } }` | Italy's language |

### Probe renders (2026-09-21, engine source at HEAD, ITALY and JAPAN from the table above through a lookup wrapper, nothing seeded)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| ITALIAN | Italy's language | la lingua dell'Italia | la langue de l'Italie | die Sprache Italiens | el idioma de Italia | イタリアの言語 | a língua da Itália |
| JAPANESE | Japan's language | la lingua del Giappone | la langue du Japon | die Sprache Japans | el idioma de Japón | 日本の言語 | a língua do Japão |

English puts a proper-noun possessor in the Saxon genitive, "Italy's language", where "the language
of Italy" would be the usual dictionary phrasing. It is not wrong.

The definite article is deliberate. The indefinite, "una lingua dell'Italia", says one of Italy's
languages, which does not tell ITALIAN apart. English drops it either way.

## One language the engine cannot say yet: PORTUGUESE in Portuguese

The Portuguese engine gives every proper noun the definite article, "a África"
([pt/artFor.ts](../../../packages/engine/src/languages/pt/artFor.ts)). *Portugal* is the exception
the rule does not know: it is "a língua **de** Portugal", not "do Portugal". (Spanish needs no
exception, because it gives countries no article: "el idioma de Italia".) Either the lexicon gains an
article-less flag that `artFor` reads, or PORTUGUESE waits while the other six ship. Decide this
when seeding PORTUGAL.

## Coverage

Add one to [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts), in English and
in German, where the genitive is the case ending "Italiens".
