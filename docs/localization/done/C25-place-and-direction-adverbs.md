# C25. The place and direction adverbs — a complement gloss

**Kind:** was blocked on a construct. Eight adverbs that say *where* or *how* something moves, and the
four relations an adverb gloss could use were `measure`, `mode`, `means` and `similative`. None of
them is "in" or "to" a place, so every one of these eight fell through to `similative` and rendered
"like a place".

_(from the unsorted sweep of 2026-09-22. Three of the twelve undefined adverbs ship as
[A29](../done/A29-time-adverbs.md) — they are the ones about time, which `measure` already
covers — and ALREADY is [B55](../done/B55-sequence-and-position.md). These eight are the
rest. **Done** on 2026-09-22: six shipped, LEFT and RIGHT are literal by design; see
[Done](#done).)_

## The concepts

UP, DOWN, LEFT, RIGHT, BACKWARDS, EVERYWHERE, TOGETHER, SUDDENLY.

## Was blocked on: a locative relation — resolved, by another construct

`Concept.mannerRelation` selects the adposition a manner adverbial takes — `measure` → "at", `mode`
→ "in", `means` → "with", `similative` → "like" — and a noun that declares none gets `similative`.
This file proposed two new values, `locative` and `direction`, declared on the noun. **That cannot
work as written:** a relation declared on the noun gives PLACE one relation for every gloss, and
EVERYWHERE needs a place as a *location* ("in all places") where UP needs one as a *goal* ("to a
higher place"). It would also have meant a second table of adpositions per language beside the
complement renderers, which already spell both — "the cat eats **in all places**", "the cat goes
**to a higher place**".

**What was built instead: `NounPhrase.complementGloss`.** The verbless subject names the complement
it *is* — `{ type: 'locative' | 'direction', specifiers? }` — and each engine renders it through the
same renderer a clause's complements take. The fragment is therefore exactly what the clause says
after its verb, in every language: the adposition, the case, the article fusion, a relation's goal
form and a hearth idiom are the complement's own. The construct is in [Done](#done).

## The verdicts

Probed 2026-09-22 against the engine source at HEAD, through the construct; words marked \* are
candidates probed through a lookup wrapper and **not** seeded.

### EVERYWHERE — shipped: "in all places"

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| PLACE, `all`, plural, `mannerGloss` (the ticket's) | like all places | come tutti i luoghi | comme tous les lieux | wie alle Orte | como todos los lugares | すべての場所のように | como todos os lugares |
| PLACE, `all`, plural, locative **(shipped)** | in all places | in tutti i luoghi | dans tous les lieux | in allen Orten | en todos los lugares | すべての場所で | em todos os lugares |
| PLACE, `many`, plural, locative | in many places | in molti luoghi | dans beaucoup de lieux | in vielen Orten | en muchos lugares | 多くの場所で | em muitos lugares |

The description's own words ("in every place"), and the sense ALWAYS's "at all times" has for time.
German idiom prefers *an allen Orten*; *in allen Orten* is the complement renderer's locative "in",
grammatical and in use, and is noted below rather than worked around.

### TOGETHER — shipped: "in a group"

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| GROUP, `indefinite`, `mannerGloss` (the ticket's) | like a group | come un gruppo | comme un groupe | wie eine Gruppe | como un grupo | グループのように | como um grupo |
| GROUP, `indefinite`, locative **(shipped)** | in a group | in un gruppo | dans un groupe | in einer Gruppe | en un grupo | グループで | em um grupo |
| GROUP, `bare`, locative | in group | in gruppo | dans groupe | in Gruppe | en grupo | グループで | em grupo |
| GROUP, `definite`, locative | in the group | nel gruppo | dans le groupe | in der Gruppe | en el grupo | グループで | no grupo |
| comitative PERSON, `bare`, plural, OTHER — in a clause (no gloss type) | the cat eats with other people | il gatto mangia con altre persone | le chat mange avec d'autres personnes | der Kater frisst mit anderen Personen | el gato come con otras personas | 猫は別の人と食べます | o gato come com outras pessoas |

Japanese グループで is how 一緒に is said. The bare noun is the Italian and Spanish idiom (*in gruppo*,
*en grupo*) but ungrammatical in English and German and wrong in French (*dans groupe* for *en
groupe*), and the definite picks one group out. The comitative "with other people" reads well in
six languages, but it says only people (TOGETHER is said of things too: "put the books together"),
Japanese 別の人と is "with a different person", and it would have needed a third gloss type.

### UP and DOWN — shipped: "to a higher place", "to a lower place"

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| UP: DESTINATION, `indefinite`, HIGH, `mannerGloss` (the ticket's) | like a high destination | come una destinazione alta | comme une destination haute | wie ein hohes Ziel | como un destino alto | 高い目的地のように | como um destino alto |
| UP: PLACE, `indefinite`, HIGH, direction | to a high place | a un luogo alto | à un lieu haut | zu einem hohen Ort | a un lugar alto | 高い場所へ | a um lugar alto |
| DOWN: PLACE, `indefinite`, LOW, direction | to a low place | a un luogo basso | à un lieu bas | zu einem niedrigen Ort | a un lugar bajo | 低い場所へ | a um lugar baixo |
| UP: PLACE, `indefinite`, HIGH `more`, direction **(shipped)** | to a higher place | a un luogo più alto | à un lieu plus haut | zu einem höheren Ort | a un lugar más alto | もっと高い場所へ | a um lugar mais alto |
| DOWN: PLACE, `indefinite`, LOW `more`, direction **(shipped)** | to a lower place | a un luogo più basso | à un lieu plus bas | zu einem niedrigeren Ort | a un lugar más bajo | もっと低い場所へ | a um lugar mais baixo |
| UP: PLACE, `definite`, HIGH `most`, direction | to the highest place | al luogo più alto | au lieu le plus haut | zum höchsten Ort | al lugar más alto | 最も高い場所へ | ao lugar mais alto |
| UP: HEIGHT, `indefinite`, GREAT `more`, direction | to a greater height | a un'altezza più grande | à une hauteur plus grande | zu einer größeren Höhe | a una altura más grande | もっと大きい高さへ | a uma altura maior |
| UP: AIR, `definite`, direction | to the air | all'aria | à l'air | zur Luft | al aire | 空気へ | ao ar |
| DOWN: GROUND, `definite`, direction | to the ground | al suolo | au sol | zum Boden | al suelo | 地面へ | ao chão |

The positive names a destination — a high place is on a mountain — where the comparative says the
way the motion goes, which is what *up* is; the superlative is the top. HEIGHT reads well in English
only (もっと大きい高さへ, *un'altezza più grande*), AIR is not where *up* ends, and GROUND is COLLAPSE's
goal ([B34](B34-collapse.md)), not a direction. French shares *haut* / *bas* with its own *vers le
haut* / *vers le bas*: the cognate dimension, as STRONG's "of great strength", not the word defined
by itself.

### LEFT and RIGHT — literal by design

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| either: SIDE\*, `indefinite`, direction | to a side | a un lato | à un côté | zu einer Seite | a un lado | 側へ | a um lado |
| LEFT: PLACE, `definite`, PREVIOUS, direction | to the previous place | al luogo precedente | au lieu précédent | zum vorherigen Ort | al lugar anterior | 前の場所へ | ao lugar anterior |
| RIGHT: PLACE, `definite`, NEXT, direction | to the next place | al luogo successivo | au lieu suivant | zum nächsten Ort | al lugar siguiente | 次の場所へ | ao lugar seguinte |
| LEFT: SIDE\* where HEART\* is, direction | to the side where the heart is | al lato dove il cuore è | au côté où le cœur est | zur Seite, in der das Herz ist | al lado donde el corazón está | 心臓がある側へ | ao lado onde o coração está |
| RIGHT: SIDE\* where HEART\* is not, direction | to the side where the heart is not | al lato dove il cuore non è | au côté où le cœur n'est pas | zur Seite, in der das Herz nicht ist | al lado donde el corazón no está | 心臓がない側へ | ao lado onde o coração não está |

"To the left" defines the word with itself, and no LEFT or RIGHT noun or adjective exists to avoid
it. Every lead the corpus offers fails:

- **A side** is equally true of both — the C05 test — and would cost a seeded SIDE for nothing.
- **The previous and the next place** are LEFT and RIGHT only along a line written left to right,
  which is the cursor's case and not the word's; Japanese 前の場所 is also "the place in front".
- **The heart's side**, the dictionaries' route, is the only honest one, and it does not render:
  Spanish *al lado*, Portuguese *ao lado* and French *au côté* read "beside", German takes *auf der*
  for a side, not *in der*, the Romance relatives want the verb before a noun subject (*dove è il
  cuore*, *donde está el corazón*), and RIGHT is left with a negation. It would also seed SIDE and
  HEART for two tooltips.

So LEFT and RIGHT stay on the literal, like GREAT and LOW.

### BACKWARDS — shipped: "in the opposite direction"

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| BACK\*, `definite`, direction | to the back | al retro | à l'arrière | zur Rückseite | a la parte trasera | 後ろへ | à traseira |
| WAY, `definite`, OPPOSITE, `mannerGloss` | in the opposite way | nel modo opposto | de la manière opposée | auf die entgegengesetzte Weise | de la manera opuesta | 反対の方法で | da maneira oposta |
| DIRECTION_SPACE, `definite`, OTHER, locative | in the other direction | nell'altra direzione | dans l'autre direction | in der anderen Richtung | en la otra dirección | 別の方向で | na outra direção |
| DIRECTION_SPACE, `definite`, OPPOSITE, direction | to the opposite direction | alla direzione opposta | à la direction opposée | zur entgegengesetzten Richtung | a la dirección opuesta | 反対の方向へ | à direção oposta |
| DIRECTION_SPACE, `definite`, OPPOSITE, locative **(shipped)** | in the opposite direction | nella direzione opposta | dans la direction opposée | in der entgegengesetzten Richtung | en la dirección opuesta | 反対の方向で | na direção oposta |

The file had BACKWARDS waiting on an order-and-sequence noun as well as the relation. It needed
neither: the description is "in the reverse direction or order", and *the opposite direction* is the
dictionary gloss of both senses, the way one walks and the way ⇧ cycles a value. **BACK** says itself
in two languages (*back*-wards, *en arrière* / *à l'arrière*); **WAY** is 方法, a method, in
Japanese; **OTHER** is 別の, a *different* direction, not the reverse one; and the direction
complement is the goal, "to the opposite direction", which no language but Japanese says. OPPOSITE is
反対の in Japanese, not 逆の: BACKWARDS is 逆方向に. Japanese would say 反対の方向**に** of a motion,
and the locative's で is the place an action happens in; it is the particle the corpus already
accepts in ALWAYS's すべての時間で and AGAIN's 別の時間で, and it is noted below.

### SUDDENLY — shipped: "in an unexpected way"

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| WAY, `indefinite`, QUICK, `mannerGloss` (the ticket's) | in a quick way | in un modo veloce | d'une manière rapide | auf eine schnelle Weise | de una manera rápida | 速い方法で | de uma maneira rápida |
| WAY, `indefinite`, UNEXPECTED, `mannerGloss` **(shipped)** | in an unexpected way | in un modo inatteso | d'une manière inattendue | auf eine unerwartete Weise | de una manera inesperada | 予期しない方法で | de uma maneira inesperada |
| WAY, `indefinite`, QUICK UNEXPECTED, `mannerGloss` | in a quick unexpected way | in un modo veloce e inatteso | d'une manière rapide et inattendue | auf eine schnelle unerwartete Weise | de una manera rápida e inesperada | 速い予期しない方法で | de uma maneira rápida e inesperada |
| TIME, `indefinite`, UNEXPECTED, `mannerGloss` | at an unexpected time | a un tempo inatteso | à un temps inattendu | zu einer unerwarteten Zeit | a un tiempo inesperado | 予期しない時間で | a um tempo inesperado |

This file said SUDDENLY is not locative and wanted SUDDEN's own dimension seeded as a
[B54](../done/B54-sensation-and-quality-adjectives.md). That dimension was already in the
corpus: UNEXPECTED was seeded by [C21](C21-ui-console-diagnostics.md), and WELL's `mode` gloss
carries it — what is sudden is unexpected, not fast. 予期しない方法で is the everyday Japanese of "in an
unexpected way". Stacking QUICK on it reads as a list in German and Japanese, and TIME's `measure`
relation gives *a un tempo* and *à un temps*, which are not how Italian and French say "at a
moment".

## Done

Shipped 2026-09-22. **Six glosses** in [adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts),
**one construct** in the engine, and **two words seeded** — the noun DIRECTION_SPACE and the
adjective OPPOSITE, both for BACKWARDS. LEFT and RIGHT stay on the literal by design.

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| EVERYWHERE | in all places | in tutti i luoghi | dans tous les lieux | in allen Orten | en todos los lugares | すべての場所で | em todos os lugares |
| TOGETHER | in a group | in un gruppo | dans un groupe | in einer Gruppe | en un grupo | グループで | em um grupo |
| UP | to a higher place | a un luogo più alto | à un lieu plus haut | zu einem höheren Ort | a un lugar más alto | もっと高い場所へ | a um lugar mais alto |
| DOWN | to a lower place | a un luogo più basso | à un lieu plus bas | zu einem niedrigeren Ort | a un lugar más bajo | もっと低い場所へ | a um lugar mais baixo |
| BACKWARDS | in the opposite direction | nella direzione opposta | dans la direction opposée | in der entgegengesetzten Richtung | en la dirección opuesta | 反対の方向で | na direção oposta |
| SUDDENLY | in an unexpected way | in un modo inatteso | d'une manière inattendue | auf eine unerwartete Weise | de una manera inesperada | 予期しない方法で | de uma maneira inesperada |

### The construct: `NounPhrase.complementGloss`

`complementGloss?: { type: 'locative' | 'direction'; specifiers?: Specifier[] }` on
[`NounPhrase`](../../../packages/shared/src/index.ts) marks a verbless subject as the complement it
stands for. The translator carries it through
[`resolveNounPhrase`](../../../packages/engine/src/translator/functions/resolveNounPhrase.ts);
[`isComplementGloss`](../../../packages/engine/src/functions/isComplementGloss.ts) recognises the
slot (one conjunct, as the manner and dimension glosses require), and
[`glossComplement`](../../../packages/engine/src/functions/glossComplement.ts) turns it into the
one-entry complement map. Each engine's verbless branch then hands that map to its own renderer —
`complementsPhrase` in en/it/fr/de/es/pt (`complementGloss.ts`), `complementSegs` in Japanese
(`complementGlossSegs.ts`) — so no language gained an adposition table:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| HOME, locative | at home | a casa | à la maison | zu Hause | en casa | 家で | em casa |
| PLACE, `all`, plural, locative, `under` | under all places | sotto tutti i luoghi | sous tous les lieux | unter allen Orten | debajo de todos los lugares | すべての場所の下で | debaixo de todos os lugares |
| GROUP, `indefinite`, direction, `in` | into a group | in un gruppo | dans un groupe | in eine Gruppe | en un grupo | グループの中へ | em um grupo |

With no verb there is nothing a verb would choose: no subject agreement, no `direction_prep`, no
existential に. Under a verb phrase the flag is ignored and the subject is a subject.
[place-adverbs.test.ts](../../../packages/engine/test/place-adverbs.test.ts) pins the six glosses,
the two words, and that each fragment is what the clause renders after its verb; the function tests
sit beside each file, and
[e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) checks EVERYWHERE in
English and UP in German in the picker.

### The words

| id | role | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| DIRECTION_SPACE | noun | direction / directions | direzione / direzioni (f) | direction / directions (f) | Richtung / Richtungen (f) | dirección / direcciones (f) | 方向 (ほうこう) | direção / direções (f) |
| OPPOSITE | adjective | opposite | opposto | opposé | entgegengesetzt | opuesto | 反対の (はんたいの) | oposto |

DIRECTION is the grammar's complement ([B37](B37-complement-names.md)'s "a complement that
indicates destinations"), so the way a thing moves takes the suffix. Neither word has a gloss of its
own yet.

**Proposed and not seeded**, forms kept for a later author:

| id | role | en | it | fr | de | es | ja | pt | why not |
|---|---|---|---|---|---|---|---|---|---|
| SIDE | noun | side / sides | lato / lati (m) | côté / côtés (m) | Seite / Seiten (f) | lado / lados (m) | 側 (がわ) | lado / lados (m) | LEFT and RIGHT's leads did not ship |
| HEART | noun | heart / hearts | cuore / cuori (m) | cœur / cœurs (m) | Herz / Herzen (n) | corazón / corazones (m) | 心臓 (しんぞう) | coração / corações (m) | the same |
| BACK | noun | back / backs | retro / retri (m) | arrière / arrières (m) | Rückseite / Rückseiten (f) | parte trasera / partes traseras (f) | 後ろ (うしろ) | traseira / traseiras (f) | BACKWARDS by itself in en and fr |

### Noted, not fixed

What the probes showed of the complement renderers, which this ticket reuses and does not change:

- German takes *an* for a location at an *Ort* or a *Stelle* ("an allen Orten"); the locative always
  says *in*, so EVERYWHERE reads *in allen Orten*, grammatical and less idiomatic.
- French puts *en*, not *dans*, before an article-less noun: a bare GROUP locative reads *dans
  groupe* for *en groupe*.
- Japanese marks the course of a motion with に, and a DIRECTION_SPACE locative takes the で of the
  place an action happens in: 「猫は反対の方向で走ります」 for 反対の方向に走ります.

What landed differently from the plan:

1. **Not a `MannerRelation` value but a complement.** A relation on the noun gives PLACE one
   relation, and EVERYWHERE and UP need two; the complement renderers already spell both, so the
   fragment is rendered through them. No language gained an adposition table, and the plan-level
   override the file would have needed never came up.
2. **UP and DOWN are compared.** "To a high place" is a destination; "to a higher place" is a way.
3. **BACKWARDS did not wait for a sequence noun.** "In the opposite direction" covers both of its
   senses; it cost DIRECTION_SPACE and OPPOSITE, which nothing else in the corpus uses yet, and it is
   a locative, since the goal "to the opposite direction" reads in Japanese alone.
4. **SUDDENLY shipped here instead of moving to B54.** Its dimension, UNEXPECTED, was already
   seeded, so no word was needed.
5. **TOGETHER is a place, not a companion.** The comitative reads well but says only people, and
   the construct takes the two spatial complements the ticket named.
6. **LEFT and RIGHT are literal by design**, with the heart's side the only honest lead and the
   probes above showing why it does not render.
