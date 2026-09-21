# C19. The verbs C08 did not reach: SAVE, ADD, LOAD, TIDY_UP, BURN, SEEM, BECOME

_(split out of [C08](C08-copular-and-genus-verbs.md) on 2026-09-20, the way
[C18](C18-motion-verbs-without-a-gloss.md) was split out of C17: C08 built the
**causative** and localized the seven verbs it reached, and these are what it did not. **Retired by
splitting** on 2026-09-21: the four workspace verbs shipped here (see Done), and the other three
were split into their own tickets.)_

## Split (2026-09-21)

A fresh probe found that none of the three verbs left was blocked on the engine. Each one went to
the class that fits it:

| verb | now | what it is waiting on |
|---|---|---|
| SEEM | [A16](../A-ready/A16-seem.md) (ready) | nothing: "to be perceived as an object", the **passive** of PERCEIVE with the **essive** object complement, renders in all seven |
| BURN | [B33](../B-needs-seed/B33-burn-flame.md) (needs seed) | the noun **FLAME**, for "to produce flames" (ja 炎を出す) |
| BECOME | [C05](C05-non-distinguishing-genera.md) (literal by design) | nothing composable earns a gloss: the copula plus an aspect, like BE |

What changed from this file's own verdicts:

1. **SEEM needed no similative complement.** This file had it waiting on a complement of the copula
   ("to be like an object"). Nobody had tried the two constructs that had just shipped *together*:
   the passive ([A01](../../features/Z-Done/A01-passive-voice/README.md)) and C12's essive
   `objectPredicative`. "To be perceived as X" also says the *impression*, which "to be like X"
   (resemblance) never did.
2. **BURN's gloss was wrong in three languages, not one.** "To be consumed by fire" reads only where
   CONSUME's word also means "use up". CONSUME is the *ingest* sense, so fr *consommé* (fire
   *consume*), de *konsumiert* (fire *verzehrt*) and ja 摂取 all miss. The fix is a different genus,
   not a Japanese word: PRODUCE ("to give off") with a FLAME differentia.
3. **BECOME's verdict stands** and has moved to C05, where the other deliberate literals are
   recorded.

The probe tables for each verdict are in the new tickets.

## Not here

**BE** and **CONSUME** stay on the English literal by design (nothing sits above them), and so does
**CAUSE_VERB**, the genus C08 seeded. See [C08's Done note](C08-copular-and-genus-verbs.md#still-on-the-english-literal-by-design).

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

**TRANSLATE** was seeded by [C11](C11-ui-failure-messages-passive.md) and took a gloss with
it — "to express concepts with another language", ja 別の言語で概念を表す — so it does not join the
verbs waiting here.
