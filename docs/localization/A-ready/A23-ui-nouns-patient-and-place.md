# A23. UI nouns — the thing one presses, the place where one types

_(from the unsorted sweep of 2026-09-22, which probed the 318 seeded concepts that have no
`definition`. This is the largest group that renders today with no new word and no new construct:
a UI noun is usually **what an action is done to**, or **where it is done**, and `patientGloss`
and `whereGloss` already say both.)_

## Plan

Thirteen concepts, each an object-gap or locative-gap relative clause on a seeded genus, inline on
its seed block in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts).

| concept | plan | gloss (en) |
|---|---|---|
| BUTTON | `patientGloss('OBJECT_THING', 'PRESS')` | an object that one presses |
| FILE | `patientGloss('OBJECT_THING', 'SAVE')` | an object that one saves |
| TARGET | `patientGloss('OBJECT_THING', 'INDICATE')` | an object that one indicates |
| ICON | `patientGloss('OBJECT_THING', 'SEE')` | an object that one sees |
| OPTION | `patientGloss('CONCEPT', 'CHOOSE')` | a concept that one chooses |
| VALUE | `patientGloss('CONCEPT', 'SET')` | a concept that one sets |
| EXAMPLE | `patientGloss('PHRASE', 'SHOW')` | a phrase that one shows |
| CLIPBOARD | `whereGloss('PLACE', 'COPY')` | a place where one copies |
| CONSOLE | `whereGloss('PLACE', 'TYPE')` | a place where one types |
| CANVAS | `whereGloss('PLACE', 'MAKE', 'PHRASE')` | a place where one makes phrases |
| TEXT | `{ subject: { concept: 'CONTENT', definiteness: 'bare', adjectives: ['WRITTEN'] } }` | written content |
| HELP | `patientGloss('CONTENT', 'SHOW')` at `bare` | content that one shows |
| PREVIEW | `patientGloss('CONTENT', 'SEE')` at `bare` | content that one sees |

**Why `bare` for the three CONTENT heads.** `indefinite` on a mass noun renders *a content* in
English and *un contenuto* in Italian, which is not what a mass noun does. `bare` gives "written
content" and drops the article in six languages while French still writes its partitive where one
is due. The same choice B32 made for its mass heads.

## Vocabulary

All seeded, none needing a new word: the genera OBJECT_THING, CONCEPT, PHRASE, PLACE, CONTENT, the
verbs PRESS, SAVE, INDICATE, SEE, CHOOSE, SET, SHOW, COPY, TYPE, MAKE, and the adjective WRITTEN.
Every one of them is itself still on the English literal — that is fine and is the point of the
genus/differentia shape: a gloss stands on words, not on their glosses.

## Probe renders (2026-09-22, engine source at HEAD, lexicon seeded in memory)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| BUTTON | an object that one presses | un oggetto che si preme | un objet qu'on presse | ein Gegenstand, den man drückt | un objeto que se pulsa | 押す物体 | um objeto que se pressiona |
| FILE | an object that one saves | un oggetto che si salva | un objet qu'on enregistre | ein Gegenstand, den man speichert | un objeto que se guarda | 保存する物体 | um objeto que se salva |
| TARGET | an object that one indicates | un oggetto che si indica | un objet qu'on indique | ein Gegenstand, den man bezeichnet | un objeto que se indica | 示す物体 | um objeto que se indica |
| ICON | an object that one sees | un oggetto che si vede | un objet qu'on voit | ein Gegenstand, den man sieht | un objeto que se ve | 見る物体 | um objeto que se vê |
| OPTION | a concept that one chooses | un concetto che si sceglie | un concept qu'on choisit | ein Begriff, den man wählt | un concepto que se elige | 選ぶ概念 | um conceito que se escolhe |
| VALUE | a concept that one sets | un concetto che si imposta | un concept qu'on définit | ein Begriff, den man festlegt | un concepto que se establece | 設定する概念 | um conceito que se define |
| EXAMPLE | a phrase that one shows | una frase che si mostra | une phrase qu'on montre | eine Phrase, die man zeigt | una frase que se muestra | 見せるフレーズ | uma frase que se mostra |
| CLIPBOARD | a place where one copies | un luogo dove si copia | un lieu où l'on copie | ein Ort, in dem man kopiert | un lugar donde se copia | コピーする場所 | um lugar onde se copia |
| CONSOLE | a place where one types | un luogo dove si digita | un lieu où l'on tape | ein Ort, in dem man tippt | un lugar donde se teclea | 入力する場所 | um lugar onde se digita |
| CANVAS | a place where one makes phrases | un luogo dove si fanno frasi | un lieu où l'on fait des phrases | ein Ort, in dem man Phrasen macht | un lugar donde se hacen frases | フレーズを作る場所 | um lugar onde se faz frases |
| TEXT | written content | contenuto scritto | contenu écrit | geschriebener Inhalt | contenido escrito | 書かれた内容 | conteúdo escrito |
| HELP | content that one shows | contenuto che si mostra | contenu qu'on montre | Inhalt, den man zeigt | contenido que se muestra | 見せる内容 | conteúdo que se mostra |
| PREVIEW | content that one sees | contenuto che si vede | contenu qu'on voit | Inhalt, den man sieht | contenido que se ve | 見る内容 | conteúdo que se vê |

All thirteen render in all seven. Two readings to judge on authoring:

1. **ICON, "an object that one sees", is the weakest of the thirteen** and may not earn its place:
   every visible thing is seen. It ships only if the authoring probe finds nothing better; the
   alternative is to move it to [B57](../B-needs-seed/B57-ui-nouns-needing-a-word.md) and seed
   PICTURE, which is what an icon actually is.
2. **Portuguese *um lugar onde se faz frases*** leaves the impersonal *se* verb singular before a
   plural object, where Italian and Spanish agree it (*si fanno*, *se hacen*). Check whether that is
   already a catalogued bug before filing; if it is not, file it rather than reshaping the plan.

## Not in this ticket

The UI nouns whose differentia needs a word that is not seeded — KEY, ARROW, MENU, ROW, TOOLBAR,
LIST, GROUP, REGION, TAB, CURSOR, LINE, HISTORY, WORKSPACE, RESULT, SERVER and the rest — are
[B57](../B-needs-seed/B57-ui-nouns-needing-a-word.md). WORKSPACE is the instructive one: the
seeded WORK is *to function*, so `whereGloss('PLACE', 'WORK')` renders "a place where one
functions", de *ein Ort, in dem man funktioniert*.

## Coverage

Two rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts): BUTTON in
English and German (an object-gap relative with a case-marked pronoun, *den man drückt*), and
CANVAS in English and French (the locative gap, *où l'on*, which [C07](../done/C07-places-locative-gap.md)
built).
