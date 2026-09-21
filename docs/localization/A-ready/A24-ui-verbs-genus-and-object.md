# A24. UI and change verbs — genus + object

_(from the unsorted sweep of 2026-09-22. Fifteen verbs whose differentia is just the thing the
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
| SPECIFY | `infinitiveGloss('INDICATE', 'CONCEPT', 'plural')` | to indicate concepts |
| COMPLETE | `infinitiveGloss('WRITE', { object: 'WORD', definiteness: 'definite' })` | to write the word |
| RESIZE | `infinitiveGloss('CHANGE', 'SIZE')` | to change size |
| EDIT | `infinitiveGloss('CHANGE', 'TEXT')` | to change text |
| ACQUIRE | `infinitiveGloss('BEGIN', { infinitive: 'HAVE' })` | to begin to have |
| RETURN | `infinitiveGloss('GO', { modifier: 'BACKWARDS' })` | to go backwards |
| LIVE | `infinitiveGloss('BE', { complements: { locative: { phrase: { concept: 'HOME', definiteness: 'definite' } } } })` | to be at home |
| EAT_ANIMAL | `infinitiveGloss('CONSUME', 'FOOD')` | to consume food |
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
| SPECIFY | to indicate concepts | indicare concetti | indiquer des concepts | Begriffe bezeichnen | indicar conceptos | 概念を示す | indicar conceitos |
| COMPLETE | to write the word | scrivere la parola | écrire le mot | das Wort schreiben | escribir la palabra | 単語を書く | escrever a palavra |
| RESIZE | to change size | cambiare dimensione | changer de la taille | Größe ändern | cambiar tamaño | 大きさを変える | mudar tamanho |
| EDIT | to change text | cambiare testo | changer du texte | Text ändern | cambiar texto | テキストを変える | mudar texto |
| ACQUIRE | to begin to have | iniziare ad avere | commencer à avoir | beginnen, zu haben | empezar a tener | 持つことが始まる | começar a ter |
| RETURN | to go backwards | andare all'indietro | aller en arrière | rückwärts gehen | ir hacia atrás | 逆方向に行く | ir para trás |
| LIVE | to be at home | essere a casa | être à la maison | zu Hause sein | estar en casa | 家にいる | estar em casa |
| EAT_ANIMAL | to consume food | consumare cibo | consommer de la nourriture | Essen konsumieren | consumir comida | 食べ物を摂取する | consumir comida |
| TRADE | to buy objects | comprare oggetti | acheter des objets | Gegenstände kaufen | comprar objetos | 物体を買う | comprar objetos |

All fifteen render in all seven. Three readings to judge on authoring:

1. **French *changer de la taille*, *changer du texte*.** A bare object after *changer* takes the
   partitive here, where the sense wants the plain article — *changer la taille*. Check whether this
   is the same gap [B09](../done/B09-create-verbs.md) recorded for bare count objects, or a separate
   defect of the mass partitive; file it rather than reshaping the two plans.
2. **Japanese *持つことが始まる* for ACQUIRE** reads "the having begins", an intransitive with the
   nominalised clause as its subject, where the other six read "to begin to have". It is
   grammatical and probably the best Japanese can do for an inchoative; confirm before shipping.
3. **EAT_ANIMAL's differentia is its subject, not its object** — "to consume food, **of an
   animal**". `infinitiveGloss('CONSUME', 'FOOD')` drops that, and what is left is CONSUME's own
   meaning. It ships only if the authoring probe confirms EAT (the human verb) is glossed
   differently enough to tell them apart in the picker; otherwise EAT_ANIMAL moves to
   [C28](../C-needs-engine/C28-verb-roots-without-a-gloss.md), whose whole subject is a gloss whose
   differentia is the subject.

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
