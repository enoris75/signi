# B36. The seven languages — seed their countries: the language of Italy

_(split out of [C05](C05-non-distinguishing-genera.md) on 2026-09-21. C05 had the
seven languages on the literal because "a language" is the same for all of them. A **genitive**
tells them apart: the language *of Italy*. The genitive ships as `NounElement.possessor`, but there
was no country to put in it. **Done 2026-09-21**, all seven, Portuguese included: see
[Done](#done-2026-09-21).)_

## Seed first

Seven proper nouns, `proper: true, countable: false`, like the continents. The ticket proposed
`isA: 'PLACE'` for want of a COUNTRY genus; COUNTRY was seeded instead (see Done, item 1).

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| ENGLAND | England | Inghilterra (f) | Angleterre (f) | England (n) | Inglaterra (f) | イングランド | Inglaterra (f) |
| ITALY | Italy | Italia (f) | Italie (f) | Italien (n) | Italia (f) | イタリア | Itália (f) |
| FRANCE | France | Francia (f) | France (f) | Frankreich (n) | Francia (f) | フランス | França (f) |
| GERMANY | Germany | Germania (f) | Allemagne (f) | Deutschland (n) | Alemania (f) | ドイツ | Alemanha (f) |
| SPAIN | Spain | Spagna (f) | Espagne (f) | Spanien (n) | España (f) | スペイン | Espanha (f) |
| JAPAN | Japan | Giappone (m) | Japon (m) | Japan (n) | Japón (m) | 日本 (にほん) | Japão (m) |
| PORTUGAL | Portugal | Portogallo (m) | Portugal (m) | Portugal (n) | Portugal (m) | ポルトガル | Portugal (m), **bare** |

**The trade.** The seven countries sit on their literal descriptions, as most continents do. "A
country" would be the same for all of them, and "the country of Italian" would be circular. A proper
noun reads fine on its literal, though, and a language does not. The descriptions place each country
geographically ("the country on the western coast of the Iberian peninsula") rather than by its
language, so the two definitions do not lean on each other.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| ITALIAN (and the six others) | `languageOf('ITALY')` = `{ subject: { concept: 'LANGUAGE', definiteness: 'definite', possessor: { concept: 'ITALY' } } }` | Italy's language |

English puts a proper-noun possessor in the Saxon genitive, "Italy's language", where "the language
of Italy" would be the usual dictionary phrasing. It is not wrong.

The definite article is deliberate. The indefinite, "una lingua dell'Italia", says one of Italy's
languages, which does not tell ITALIAN apart. English drops it either way.

## PORTUGUESE in Portuguese: an article-less name

The Portuguese engine gave every proper noun the definite article, "a África"
([pt/artFor.ts:17](../../../packages/engine/src/languages/pt/artFor.ts#L17)). *Portugal* is the exception
the rule did not know: "a língua **de** Portugal", not "do Portugal". The probe before the change:

| en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|
| Portugal's language | la lingua del Portogallo | la langue du Portugal | die Sprache Portugals | el idioma de Portugal | ポルトガルの言語 | a língua **do** Portugal |

PORTUGAL's pt forms now carry `takes_article: '0'`, the inverse of the de/es flag (whose proper nouns
go bare unless `takes_article: '1'`), and the Portuguese engine reads it in its two article builders
through `isBareName`: `artFor` gives no article ("Portugal corre") and `contractDet` gives the plain
preposition whatever was picked ("de Portugal", "em Portugal", "a Portugal", "por Portugal").
"Da Itália" and "do Japão" are unchanged. Spanish needs no exception, because it gives countries no
article: "el idioma de Italia".

## Coverage

[e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts), ITALIAN in English and in
German, where the genitive is the case ending "Italiens".

## Done (2026-09-21)

**All seven languages shipped**, glossed by their country through the `languageOf` helper in
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts#L68). Rendered at boot:

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| ENGLISH | England's language | la lingua dell'Inghilterra | la langue de l'Angleterre | die Sprache Englands | el idioma de Inglaterra | イングランドの言語 | a língua da Inglaterra |
| ITALIAN | Italy's language | la lingua dell'Italia | la langue de l'Italie | die Sprache Italiens | el idioma de Italia | イタリアの言語 | a língua da Itália |
| FRENCH | France's language | la lingua della Francia | la langue de la France | die Sprache Frankreichs | el idioma de Francia | フランスの言語 | a língua da França |
| GERMAN | Germany's language | la lingua della Germania | la langue de l'Allemagne | die Sprache Deutschlands | el idioma de Alemania | ドイツの言語 | a língua da Alemanha |
| SPANISH | Spain's language | la lingua della Spagna | la langue de l'Espagne | die Sprache Spaniens | el idioma de España | スペインの言語 | a língua da Espanha |
| JAPANESE | Japan's language | la lingua del Giappone | la langue du Japon | die Sprache Japans | el idioma de Japón | 日本の言語 | a língua do Japão |
| PORTUGUESE | Portugal's language | la lingua del Portogallo | la langue du Portugal | die Sprache Portugals | el idioma de Portugal | ポルトガルの言語 | a língua de Portugal |

The countries themselves, as a subject (the language fixes the article, or its absence):

| | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| ITALY | Italy | l'Italia | l'Italie | Italien | Italia | イタリア | a Itália |
| JAPAN | Japan | il Giappone | le Japon | Japan | Japón | 日本 | o Japão |
| PORTUGAL | Portugal | il Portogallo | le Portugal | Portugal | Portugal | ポルトガル | Portugal |

### A country is a land, like a continent

Seeding the countries put them in every picker, and a country as a motion goal or a place rendered
like a house in three languages. Probed with the countries seeded, before the engine change:

| | it | fr | de |
|---|---|---|---|
| the cat goes to Italy | va **all'Italia** | va **à l'Italie** | geht **zu** Italien |
| the cat goes to Japan | va **al Giappone** | va au Japon | geht **zu** Japan |
| the cat eats in Japan | mangia in Giappone | mange **en Japon** | frisst in Japan |
| the cat comes from France | viene dalla Francia | vient **de la France** | kommt aus Frankreich |

The engines had these rules for the continents, keyed off `isA === 'CONTINENT'`, and the German
comment on them said a country "would want a place flag on the concept instead". The countries now
hang under a seeded **COUNTRY** genus (isA PLACE), and a shared
[`isNamedLand`](../../../packages/engine/src/functions/isNamedLand.ts) answers for either hypernym. French
also needed the other half of its rule: a bare land is *en* when feminine or vowel-initial and *au*
when a masculine opens on a consonant (`landIn`,
[fr/complementsPhrase.ts:143](../../../packages/engine/src/languages/fr/complementsPhrase.ts#L143)). After:

| | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| goes to Italy | the cat goes to Italy | il gatto va in Italia | le chat va en Italie | der Kater geht nach Italien | el gato va a Italia | 猫はイタリアへ行きます | o gato vai à Itália |
| eats in Italy | the cat eats in Italy | il gatto mangia in Italia | le chat mange en Italie | der Kater frisst in Italien | el gato come en Italia | 猫はイタリアで食べます | o gato come na Itália |
| comes from Italy | the cat comes from Italy | il gatto viene dall'Italia | le chat vient d'Italie | der Kater kommt aus Italien | el gato viene de Italia | 猫はイタリアから来ます | o gato vem da Itália |
| goes to Japan | the cat goes to Japan | il gatto va in Giappone | le chat va au Japon | der Kater geht nach Japan | el gato va a Japón | 猫は日本へ行きます | o gato vai ao Japão |
| eats in Japan | the cat eats in Japan | il gatto mangia in Giappone | le chat mange au Japon | der Kater frisst in Japan | el gato come en Japón | 猫は日本で食べます | o gato come no Japão |
| goes to Portugal | the cat goes to Portugal | il gatto va in Portogallo | le chat va au Portugal | der Kater geht nach Portugal | el gato va a Portugal | 猫はポルトガルへ行きます | o gato vai a Portugal |
| eats in Portugal | the cat eats in Portugal | il gatto mangia in Portogallo | le chat mange au Portugal | der Kater frisst in Portugal | el gato come en Portugal | 猫はポルトガルで食べます | o gato come em Portugal |
| comes from France | the cat comes from France | il gatto viene dalla Francia | le chat vient de France | der Kater kommt aus Frankreich | el gato viene de Francia | 猫はフランスから来ます | o gato vem da França |

The continents render as before, and a language name keeps its French *en* ("en français").

What landed differently from the plan:

1. **COUNTRY was seeded** as the countries' genus (country / paese / pays / Land / país / 国 / país,
   isA PLACE), where the ticket proposed hanging them on PLACE. It is what the land rules key off. It
   keeps its literal, like the countries.
2. **An engine change for the countries as places**, in Italian, French and German, which the ticket
   did not foresee (above). Without it, seeding the countries would have half-seeded them.
3. **Portuguese shipped**, with the article-less flag the ticket offered as one option. It is read in
   `artFor` and `contractDet`, the two places a proper noun's article is decided. An adjective on
   Portugal still leaves it bare ("Portugal moderno", where *o Portugal moderno* is usual); Spanish
   handles that case in `artForms`, and Portuguese has no counterpart yet.

- Seed: COUNTRY and the seven countries after the continents, and the seven glosses, in
  [nouns.ts](../../../packages/backend/src/concepts/nouns.ts#L1629).
- Engine: [pt/isBareName.ts](../../../packages/engine/src/languages/pt/isBareName.ts), read in
  [pt/artFor.ts](../../../packages/engine/src/languages/pt/artFor.ts) and
  [pt/contractDet.ts](../../../packages/engine/src/languages/pt/contractDet.ts);
  [functions/isNamedLand.ts](../../../packages/engine/src/functions/isNamedLand.ts), read in the it, fr and
  de `complementsPhrase`.
- Tests: the unit tests beside each engine file; the countries and the seven glosses in
  [definition-words.test.ts](../../../packages/engine/test/definition-words.test.ts); the countries as
  goal, place and source in [complements/direction.test.ts](../../../packages/engine/test/complements/direction.test.ts)
  (*a country is a land, like a continent*); ITALIAN in en + de in
  [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts).
