# A24. UI and change verbs — genus + object

_(from the unsorted sweep of 2026-09-22. Thirteen of fifteen verbs whose differentia is just the thing the
genus acts on, which `infinitiveGloss` has said since [B08](../done/B08-verb-definitions.md). No new
word, no new construct.)_

## Plan

Inline on each seed block under [concepts/verbs/](../../../packages/backend/src/concepts/verbs/).

| concept | plan | gloss (en) |
|---|---|---|
| DELETE | `infinitiveGloss('REMOVE', 'OBJECT_THING', 'plural')` | to remove objects |
| UNDO | `infinitiveGloss('CANCEL', 'ACTION', 'plural')` | to cancel actions |
| REDO | `infinitiveGloss('MAKE', { modifier: 'AGAIN' })` | to make again |
| RETRY | `infinitiveGloss('START', { modifier: 'AGAIN' })` | to start again |
| COPY | `infinitiveGloss('MAKE', { object: 'OBJECT_THING', definiteness: 'indefinite', adjectives: ['OTHER'] })` | to make another object |
| USE | `infinitiveGloss('ACT', { complements: { instrumental: { phrase: { concept: 'OBJECT_THING', definiteness: 'indefinite' } } } })` | to act with an object |
| COMPLETE | `infinitiveGloss('WRITE', { object: 'WORD', definiteness: 'definite' })` | to write the word |
| RESIZE | `infinitiveGloss('CHANGE', 'SIZE')` | to change size |
| EDIT | `infinitiveGloss('CHANGE', 'TEXT')` | to change text |
| ACQUIRE | `infinitiveGloss('BEGIN', { infinitive: 'HAVE' })` | to begin to have |
| RETURN | `infinitiveGloss('GO', { modifier: 'BACKWARDS' })` | to go backwards |
| LIVE | `infinitiveGloss('BE', { complements: { locative: { phrase: { concept: 'HOME', definiteness: 'definite' } } } })` | to be at home |
| TRADE | `infinitiveGloss('BUY', 'OBJECT_THING', 'plural')` | to buy objects |

## Vocabulary

All seeded. The genera REMOVE, CANCEL, MAKE, START, ACT, INDICATE, WRITE, CHANGE, BEGIN, GO, BE,
CONSUME and BUY; the objects OBJECT_THING, ACTION, CONCEPT, WORD, SIZE, TEXT, FOOD, HOME; the
adverbs AGAIN and BACKWARDS; the adjective OTHER.

## Probe renders (2026-09-22, engine source at HEAD, lexicon seeded in memory)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| DELETE | to remove objects | rimuovere oggetti | retirer des objets | Gegenstände entfernen | quitar objetos | 物体を取り除く | remover objetos |
| UNDO | to cancel actions | annullare azioni | annuler des actions | Handlungen annullieren | cancelar acciones | 動作をキャンセルする | cancelar ações |
| REDO | to make again | fare di nuovo | faire de nouveau | erneut machen | hacer de nuevo | もう一度作る | fazer de novo |
| RETRY | to start again | iniziare di nuovo | commencer de nouveau | erneut beginnen | empezar de nuevo | もう一度始める | começar de novo |
| COPY | to make another object | fare un altro oggetto | faire un autre objet | einen anderen Gegenstand machen | hacer otro objeto | 別の物体を作る | fazer outro objeto |
| USE | to act with an object | agire con un oggetto | agir avec un objet | mit einem Gegenstand handeln | actuar con un objeto | 物体で行動する | agir com um objeto |
| COMPLETE | to write the word | scrivere la parola | écrire le mot | das Wort schreiben | escribir la palabra | 単語を書く | escrever a palavra |
| RESIZE | to change size | cambiare dimensione | changer de la taille | Größe ändern | cambiar tamaño | 大きさを変える | mudar tamanho |
| EDIT | to change text | cambiare testo | changer du texte | Text ändern | cambiar texto | テキストを変える | mudar texto |
| ACQUIRE | to begin to have | iniziare ad avere | commencer à avoir | beginnen, zu haben | empezar a tener | 持つことが始まる | começar a ter |
| RETURN | to go backwards | andare all'indietro | aller en arrière | rückwärts gehen | ir hacia atrás | 逆方向に行く | ir para trás |
| LIVE | to be at home | essere a casa | être à la maison | zu Hause sein | estar en casa | 家にいる | estar em casa |
| TRADE | to buy objects | comprare oggetti | acheter des objets | Gegenstände kaufen | comprar objetos | 物体を買う | comprar objetos |

All thirteen render in all seven. Three readings were judged on authoring:

1. **French *changer de la taille*, *changer du texte* was filed.** It is neither of the two the
   reading offered: it is a defect of the *count* singular, not of the mass partitive.
   [A149](../../bugs/fixed/A149-french-object-zero-article.md) gave a bare singular object the
   partitive *du / de la*, which is right for a mass noun (*consommer de la nourriture*) and wrong
   for a count one — French wants *changer la taille*, *écrire le mot*. The corpus already carries
   the `countable` flag the rule needs. Filed as
   [A207](../../bugs/A-must-fix/A207-french-bare-singular-count-object.md); the two plans are
   unchanged.
2. **Japanese *持つことが始まる* for ACQUIRE ships.** It reads "the having begins", an intransitive
   with the nominalised clause as its subject, where the other six read "to begin to have". It is
   grammatical, it is what Japanese does with an inchoative, and no shape the engine has says it
   more directly.
3. **EAT_ANIMAL moved to [C28](../C-needs-engine/C28-verb-roots-without-a-gloss.md)**, which is what
   the reading said would happen if EAT were not glossed differently. EAT's shipped plan *is*
   `infinitiveGloss('CONSUME', 'FOOD')` — the same plan, character for character — so the two would
   have rendered one string in all seven.
4. **SPECIFY moved to C28 as well**, which the plan did not foresee. EXPRESS already ships
   `infinitiveGloss('INDICATE', 'CONCEPT', 'plural')`, so "to indicate concepts" was taken. What
   distinguishes specifying is its exactness, and the corpus has no word for it.

## Not in this ticket

TRANSFORM and DRAG were in this group and were moved out: `infinitiveGloss('CHANGE', …)` renders
TRANSFORM as "to change objects" and `infinitiveGloss('MOVE', …)` renders DRAG as "to move
objects", each indistinguishable from its own genus, which has no gloss to be distinguished from.
Both are [C28](../C-needs-engine/C28-verb-roots-without-a-gloss.md). The causative verbs are
[A25](A25-causative-verbs.md).

## Coverage

Two rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts): DELETE in
English and German (the infinitive at the end of the clause, *Gegenstände entfernen*), and ACQUIRE
in English and Italian (the governed infinitive, *iniziare ad avere*).

## Done

Shipped 2026-09-22. Thirteen `definition` plans, on their seed blocks under
[concepts/verbs/](../../../packages/backend/src/concepts/verbs/). No word seeded, no engine change.

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| DELETE | to remove objects | rimuovere oggetti | retirer des objets | Gegenstände entfernen | quitar objetos | 物体を取り除く | remover objetos |
| UNDO | to cancel actions | annullare azioni | annuler des actions | Handlungen annullieren | cancelar acciones | 動作をキャンセルする | cancelar ações |
| REDO | to make again | fare di nuovo | faire de nouveau | erneut machen | hacer de nuevo | もう一度作る | fazer de novo |
| RETRY | to start again | iniziare di nuovo | commencer de nouveau | erneut beginnen | empezar de nuevo | もう一度始める | começar de novo |
| COPY | to make another object | fare un altro oggetto | faire un autre objet | einen anderen Gegenstand machen | hacer otro objeto | 別の物体を作る | fazer outro objeto |
| USE | to act with an object | agire con un oggetto | agir avec un objet | mit einem Gegenstand handeln | actuar con un objeto | 物体で行動する | agir com um objeto |
| COMPLETE | to write the word | scrivere la parola | écrire le mot | das Wort schreiben | escribir la palabra | 単語を書く | escrever a palavra |
| RESIZE | to change size | cambiare dimensione | changer de la taille | Größe ändern | cambiar tamaño | 大きさを変える | mudar tamanho |
| EDIT | to change text | cambiare testo | changer du texte | Text ändern | cambiar texto | テキストを変える | mudar texto |
| ACQUIRE | to begin to have | iniziare ad avere | commencer à avoir | beginnen, zu haben | empezar a tener | 持つことが始まる | começar a ter |
| RETURN | to go backwards | andare all'indietro | aller en arrière | rückwärts gehen | ir hacia atrás | 逆方向に行く | ir para trás |
| LIVE | to be at home | essere a casa | être à la maison | zu Hause sein | estar en casa | 家にいる | estar em casa |
| TRADE | to buy objects | comprare oggetti | acheter des objets | Gegenstände kaufen | comprar objetos | 物体を買う | comprar objetos |

The two French rows carry [A207](../../bugs/A-must-fix/A207-french-bare-singular-count-object.md)
and will read *changer la taille* / *changer le texte* when it is fixed.

What landed differently from the plan:

1. **Two of the fifteen were duplicates of glosses already shipped**, and neither was visible from
   the probe table the sweep took: a probe renders a plan, and what it cannot show is that another
   concept renders the *same* string. EAT_ANIMAL restated EAT and SPECIFY restated EXPRESS. Both are
   in C28 with that reason.
2. **The pass added the test that would have caught them.** `sweep-definitions.test.ts` renders every
   concept's definition in all seven languages and fails on any two that come out alike, with an
   allow-list of the five pairs the corpus shares by design (CAT/MOUSE, BOY/YOUNG_MAN,
   BUILDER/CREATOR and B48's two climate senses). It caught a third on the day it was written —
   A25's SHRINK restating COMPACT.
