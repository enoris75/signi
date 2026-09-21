# C19. Verbs still without a gloss — BURN, SEEM, BECOME

_(split out of [C08](../done/C08-copular-and-genus-verbs.md) on 2026-09-20, the way
[C18](C18-motion-verbs-without-a-gloss.md) was split out of C17: C08 built the **causative** and
localized the seven verbs it reached, and these are what it did not. **SAVE, ADD, LOAD and TIDY_UP
left 2026-09-21** — see Done.)_

## Blocked on

One construct (a voice, in one language), one construct of its own (a complement), and one
judgement about a gloss.

### 1. The passive voice — BURN. Now: a Japanese lexeme

| verb | literal | wanted gloss |
|---|---|---|
| BURN | to be on fire; to undergo combustion | to be consumed by fire |

[A01 passive voice](../../features/Z-Done/A01-passive-voice/README.md) **shipped**, and the gloss
now renders — in six of the seven. Probed 2026-09-21 against the seeded lexicon:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| CONSUME, passive, agent FIRE | to be consumed by the fire | essere consumato dal fuoco | être consommé par le feu | vom Feuer konsumiert werden | ser consumido por el fuego | **火に摂取される** | ser consumido pelo fogo |

C08 called BURN "lexically ready" because FIRE and CONSUME are both seeded. **It is not, in
Japanese**, and the passive did not change that: CONSUME's ja lexeme is 摂取する, "to ingest", the
word EAT and DRINK need, and fire does not ingest.

What is left is **not** an engine gap but a lexical one, and it is a hard one: the Japanese for
consumption-by-fire is 燃やす or 焼く, which *are* burning, so a gloss built on either defines the
verb with itself; and the general 消費する is for resources, not for a thing a fire eats. A second
consumption sense would have to be a word that is neither, and none of the obvious candidates is.
**Reclassify if one is found** — everything else about this gloss is ready.

### 2. A similative complement — SEEM

| verb | literal | missing construct |
|---|---|---|
| SEEM | to look like; to give the impression of being similar to | a similative complement — "to be similar **to** a thing" |

`predicative` ascribes a property to the subject; nothing says the subject *resembles* another noun
phrase. The `manner` complement's `similative` relation is the nearest thing the engine has, and it
**was probed** on 2026-09-21 — this file had recorded that no one had:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| BE + manner OBJECT_THING | to be like an object | essere come un oggetto | être comme un objet | wie ein Gegenstand sein | ser como un objeto | **物体のようにいる** | ser como um objeto |

Two things come out of it, and both say no:

- **The relation itself renders.** "like" / *come* / *comme* / *wie* / 〜のように is right in every
  language, so the adposition is not what is missing.
- **Japanese picks the wrong copula.** 「物体のようにいる」 uses the animate existential いる where a
  copula wants である — BE with no `predicative` falls to the existential branch
  (`predicateSegs`), and a manner adverbial is not one. A similative complement would have to be a
  complement of the copula, not an adverbial, which is exactly the construct this file names.

And it would still not be SEEM: "to be like an object" says the subject *resembles* a thing, where
SEEM says it *gives the impression* of being one. SEEM's own lexemes already carry `seeming: '1'`,
so the verb is not the problem — the differentia is.

### 3. A gloss worth having — BECOME

The construct C08 was told BECOME needed, the **inchoative**, now exists: BEGIN links its infinitive
in every language (C08 §b). The gloss it would carry does not justify itself. Probed 2026-09-20 with
a candidate DIFFERENT put in front of the lexicon (nothing seeded):

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| BEGIN + BE + DIFFERENT | to begin to be different | iniziare a essere diverso | commencer à être différent | beginnen, verschieden zu sein | empezar a ser diferente | **別であることが始まる** | começar a ser diferente |

Two reasons to leave it:

- **Japanese.** 「別であることが始まる」 is the *nominalized event* of being different, beginning. What
  Japanese says here is 〜になる — which is BECOME's own word, so the gloss either reads as a
  translation exercise or defines the verb with itself.
- **The adjective.** DIFFERENT's Japanese is 別の, which is already OTHER's ([B21](../done/B21-ui-clause-and-coordination-vocabulary.md))
  — 異なる and 違う are verbs, not adjectives, so the seed would double a word to say a different thing.

BECOME is better read as BE plus an aspect than as a genus with a differentia, which puts it with the
copula: **leave it on the English literal**, as C08 leaves BE and CONSUME, unless a gloss appears that
is worth the seed.

## Not here

**BE** and **CONSUME** stay on the English literal by design (nothing sits above them), and so does
**CAUSE_VERB**, the genus C08 seeded. See [C08's Done note](../done/C08-copular-and-genus-verbs.md#still-on-the-english-literal-by-design).

## Done: the four workspace verbs (2026-09-21)

C12 shipped `PhrasePlan.purpose` and the `comitative` complement, which unblocked SAVE and ADD.
Probing the other two showed that **neither actually needed the prior state** this file had them
waiting for — one of them was blocked on a word, and the other on a reading of its own literal.

| verb | gloss | what carried it |
|---|---|---|
| SAVE | to write content to load it | the **purpose clause** (C12 item 1) |
| ADD | to cause an object to be with other objects | the **comitative** (C12 item 3) |
| LOAD | to read written content | nothing new — see below |
| TIDY_UP | to cause objects to be tidy | a seeded adjective — see below |

| gloss | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|
| SAVE | scrivere contenuto per caricarlo | écrire du contenu pour le charger | Inhalt schreiben, um es zu laden | escribir contenido para cargarlo | それを読み込むために内容を書く | escrever conteúdo para carregá-lo |
| LOAD | leggere contenuto scritto | lire du contenu écrit | geschriebenen Inhalt lesen | leer contenido escrito | 書かれた内容を読む | ler conteúdo escrito |
| ADD | indurre un oggetto a essere con altri oggetti | induire un objet à être avec d'autres objets | einen Gegenstand veranlassen, mit anderen Gegenständen zu sein | inducir un objeto a ser con otros objetos | 物体が別の物体とあるようにする | induzir um objeto a ser com outros objetos |
| TIDY_UP | indurre oggetti a essere ordinati | induire des objets à être rangés | Gegenstände veranlassen, ordentlich zu sein | inducir objetos a estar ordenados | 物体が整然としているようにする | induzir objetos a estar arrumados |

### LOAD: the "back" was already in the participle

The literal is "to bring stored content back in", and this file read the "back" as a prior state
the plan model cannot express. It does not need one: **WRITTEN** says the content was put there
before, which is all the "back" was carrying. "To read written content" is the whole verb.

### TIDY_UP: not an engine block at all — the wrong ORDER

"To put back in order" was filed here for the same prior state, but the probe found a different
blocker first. The seeded **ORDER** is the *command* sense — `isA: COMMAND`, de "Befehl", ja 命令 —
so "in order" rendered "in Befehl" and 「命令に」. The arrangement sense is simply not in the corpus
(and French would have wanted its own idiom, *en ordre*, where the locative gives *dans*).

**TIDY** was seeded instead, a transient adjective ("arranged in order": it *ordinato*, fr *rangé*,
de *ordentlich*, es *ordenado*, ja 整然とした, pt *arrumado*), and the gloss is the causative shape
C08 already built for HIDE: *cause the objects to be in that state*. The prior state never came
into it.

### The gloss helper

`GlossParts` gained two fields ([verbs/gloss.ts](../../../packages/backend/src/concepts/verbs/gloss.ts)):
`purpose`, a clause of purpose hung off the citation (it is an adjunct, so it sits beside the
predicate rather than inside it, unlike `infinitive`), and `gender`, which only a **pronoun** object
reads — it is what keeps English off "to write content to load **him**" and gives German its "um
**es** zu laden".

### One more verb, seeded elsewhere

**TRANSLATE** was seeded by [C11](../done/C11-ui-failure-messages-passive.md) and took a gloss with
it — "to express concepts with another language", ja 別の言語で概念を表す — so it does not join the
verbs waiting here.
