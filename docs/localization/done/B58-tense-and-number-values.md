# B58. The tense and number values — seed PRESENT, PAST, FUTURE and the two number adjectives

_(from the unsorted sweep of 2026-09-22. Five grammar nouns that hang under heads
[A30](A30-grammar-features.md) glosses, each waiting on one adjective. The shape is
`glossOf(genus, adjective)` — the plainest one the engine has — so this is a pure vocabulary
ticket.)_

## Seed first

Proposed forms, for the seed author to check — suggestions, not renders.

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| PRESENT | adjective | happening now | present | presente | présent | gegenwärtig | presente | 現在の | presente |
| PAST | adjective | already happened | past | passato | passé | vergangen | pasado | 過去の | passado |
| FUTURE | adjective | yet to happen | future | futuro | futur | zukünftig | futuro | 未来の | futuro |
| SOLE | adjective | being the only one | sole | unico | unique | einzig | único | 単一の | único |
| MANIFOLD | adjective | being more than one | manifold | molteplice | multiple | mehrfach | múltiple | 複数の | múltiplo |

Five adjectives. The first three are the ordinary tense words every one of the seven languages
already uses to name its own tenses, so the grammar registers should line up without argument.

**SOLE and MANIFOLD, not SINGULAR and PLURAL.** SINGULAR and PLURAL are seeded already — they are
the *grammatical* adjectives, the ones the canvas writes on a noun chip — and glossing
SINGULAR_GRAMMAR as "a singular category" defines the word with itself, the
[PERIOD_PUNCTUATION](../done/C05-non-distinguishing-genera.md) test. SOLE and MANIFOLD say the same
meaning in ordinary words, which is what a definition is for. Both carry a `synonym` so the picker
tells them from their grammatical twins, the way
[B48](../done/B48-climate-cold-hot.md) split the climate senses of COLD and HOT.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| PRESENT_TENSE | `glossOf('TENSE', 'PRESENT')` | a present tense |
| PAST_TENSE | `glossOf('TENSE', 'PAST')` | a past tense |
| FUTURE_TENSE | `glossOf('TENSE', 'FUTURE')` | a future tense |
| SINGULAR_GRAMMAR | `glossOf('CATEGORY', 'SOLE')` | a sole category |
| PLURAL_GRAMMAR | `glossOf('CATEGORY', 'MANIFOLD')` | a manifold category |

Five for five — the only ticket in the sweep that clears its whole set. The three tense glosses read
as they should in each language (de *ein gegenwärtiges Tempus*, ja 現在の時制), and TENSE itself is
glossed by [A30](A30-grammar-features.md), so the picker shows "a feature that indicates
times" above "a present tense".

**Author A30 first.** These five stand on TENSE and CATEGORY having glosses of their own; nothing
breaks if they do not, but the tooltip reads oddly when the genus is still English. That advice was
followed: [A30](A30-grammar-features.md) shipped in the same pass, so the picker reads "a
feature that indicates times" above "a present tense".

## Not solved by this seed

Nothing in this ticket. Two neighbours stay where they are: the adjectives SINGULAR and PLURAL
themselves are [C24](../done/C24-grammar-feature-adjectives.md) — seeding SOLE and
MANIFOLD gives them a gloss the day C24's construct exists (`glossOf`-style *of a sole number*),
but not before, because an adjective cannot be glossed by a noun phrase.

## Coverage

Two rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once
authored: PAST_TENSE in English and German (*ein vergangenes Tempus*, the strong adjective ending
after the indefinite article) and PLURAL_GRAMMAR in English and Japanese (複数の範疇).

## Done

Shipped 2026-09-22. **Five adjectives seeded** (PRESENT, PAST, FUTURE, SOLE, MANIFOLD) and **five
glosses** authored on them in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts). Five for
five: the only ticket in the sweep that cleared its whole set, exactly as filed.

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| PRESENT_TENSE | a present tense | un tempo presente | un temps présent | ein gegenwärtiges Tempus | un tiempo presente | 現在の時制 | um tempo presente |
| PAST_TENSE | a past tense | un tempo passato | un temps passé | ein vergangenes Tempus | un tiempo pasado | 過去の時制 | um tempo passado |
| FUTURE_TENSE | a future tense | un tempo futuro | un temps futur | ein zukünftiges Tempus | un tiempo futuro | 未来の時制 | um tempo futuro |
| SINGULAR_GRAMMAR | a sole category | una categoria unica | une catégorie unique | eine einzige Kategorie | una categoría única | 単一の範疇 | uma categoria única |
| PLURAL_GRAMMAR | a manifold category | una categoria molteplice | une catégorie multiple | eine mehrfache Kategorie | una categoría múltiple | uma categoria múltipla |

Nothing landed differently. The one reading worth recording is that **English is the weakest of the
seven on the three tense rows**: *a present tense* is the English grammatical term itself, so the
tooltip teaches an English reader nothing. The other six do define — German says *ein gegenwärtiges
Tempus* where its own term is *Präsens*, and Japanese 現在の時制 where the term is 現在形 — which is
the argument the ticket made for the three ordinary time words, and it holds.
