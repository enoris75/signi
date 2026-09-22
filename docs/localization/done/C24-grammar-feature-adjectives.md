# C24. The adjectives that are not a scale — relational, grammatical, ordinal

**Kind:** was blocked on a construct. **Retired 2026-09-22.** Sixty-eight adjectives that say what
something *belongs to*, *does* or *comes after* — not where it sits on a scale — when `dimGloss`,
the engine's one adjective gloss, only said a scale. **Fifty-eight ship; ten are literal by
design**, every lead probed.

_(from the unsorted sweep of 2026-09-22, which found 92 adjectives with no definition: two shipped
as [A28](A28-scalar-adjectives.md), eight as [B54](B54-sensation-and-quality-adjectives.md), twenty-two
went to [C23](C23-participial-state-adjectives.md), and these were the rest — with seven more that
arrived the same day from A28 and [B55](B55-sequence-and-position.md), and OPPOSITE, seeded by
[C25](C25-place-and-direction-adverbs.md). Authored by two lanes in parallel — the grammar features
and the rest — and finished in the batch's integration pass, whose engine work is
[below](#first-second-third-conditional-and-sharp-in-the-integration-pass).)_

## The concepts

**The grammar features (35).** SINGULAR, PLURAL, NEUTER, DEFINITE, INDEFINITE, ZERO, PROXIMAL,
DISTAL, PARTITIVE, NEGATIVE, MULTAL, PAUCAL, UNIVERSAL, IMPERSONAL, MAIN, CONDITIONAL, COORDINATED,
COPULATIVE, DISJUNCTIVE, ADVERSATIVE, EXPLICATIVE, CONCLUSIVE, ACTIVE_VOICE, PASSIVE, PROGRESSIVE,
PROSPECTIVE, RESULTATIVE, POSITIVE, TEMPORAL, SPATIAL, SEMANTIC, DIRECT, INDIRECT, NEUTRAL,
UNCONNECTED.

**The ordinary relational ones (20).** OTHER, GREAT, LOW, NEAR, FAR, BROWN, ROUND, SHARP, WHOLE,
WILD, DOMESTIC, MALE, FEMALE, CASTRATED, CANINE, HUNGRY, NEW, BEAUTIFUL, ADULT, WARM — nine of them
([BROWN … HUNGRY](B54-sensation-and-quality-adjectives.md)) B54's as well, retired with them.

**The order words (5).** FIRST, SECOND, THIRD, NEXT, PREVIOUS.

**The seven B words (7).** SWEET, SOLID, PRESENT, PAST, FUTURE, SOLE, MANIFOLD.

**And OPPOSITE (1)**, seeded by C25 as BACKWARDS's differentia ("in the opposite direction").

## What moved them

**The headless relative clause** — shape 2 of the three this file said were missing, and the only
one that turned out to be needed. `NounPhrase.relativeGloss` renders a verbless period's subject as
its relative clause alone, the head unspoken but still the clause's **antecedent**, so it agrees as a
spoken head would: German's relative pronoun takes the antecedent lexeme's gender (OBJECT_THING's
*Gegenstand* → *der / den*, BEING's *Wesen* → *das*), English says *who* of a person, and the
Romance participles agree. It was built for [C23](C23-participial-state-adjectives.md) and C24
together (C23's file has the construct's probe table); the helpers are in
[relativeGloss.ts](../../../packages/backend/src/concepts/relativeGloss.ts) — `stateGloss` (the state
a verb leaves), `subjectGapGloss`, `namedAgentGloss`, `relativeGloss`.

Shape 1, **membership** (*of the male sex*), was never needed: what a value *does* or *has* tells it
from its siblings where *of which class* would only restate the class — MALE is "that has testicles",
DEFINITE "that indicates a known object". Shape 3, **negated membership**, came with shape 2 as the
file predicted: CASTRATED is "from which the testicles have been removed", NEUTER "that is not male
or female".

| | concepts | shipped | literal by design |
|---|---|---|---|
| the grammar features | 35 | 34 | NEGATIVE |
| the relational, order and time adjectives | 33 | 24 | GREAT, LOW, OTHER, OPPOSITE, SOLE, MANIFOLD, BROWN, CANINE, BEAUTIFUL |
| **total** | **68** | **58** | **10** |

## The grammar features (35)

**Thirty-three of the thirty-five ship.** Every one is glossed by the headless relative clause
([`NounPhrase.relativeGloss`](../../../packages/shared/src/index.ts), the helpers in
[relativeGloss.ts](../../../packages/backend/src/concepts/relativeGloss.ts)) — shape 2 of this
file's **Blocked on**, which is what these values turned out to need: not *of a sole number*
(shape 1) but *what the value does*, the finding [A30](../done/A30-grammar-features.md) made for the
grammar nouns. **NEGATIVE is literal by design**; CONDITIONAL was left blocked here, on a verb whose
object takes a preposition of its own, and shipped in the
[integration pass](#first-second-third-conditional-and-sharp-in-the-integration-pass) on a seeded
DEPEND. One word was seeded, KNOWN.

### How the values were read

Each concept is the value of a grammar control, so its seed's description and the UI strings that
label with it ([uiStrings.ts](../../../packages/shared/src/uiStrings.ts)) say what it is *here*:

| family | values | set by | antecedent (unspoken) | de relativizer |
|---|---|---|---|---|
| number, gender | SINGULAR, PLURAL, NEUTER | the pronoun rows (`pronoun.singular` …) | WORD | *das* |
| determiners | DEFINITE, INDEFINITE, ZERO · PROXIMAL, DISTAL · PARTITIVE, NEGATIVE, MULTAL, PAUCAL, UNIVERSAL | the determiner menu (`determiner.name.*`), three sections | DETERMINER | *das* |
| person | IMPERSONAL | the pronoun person row, the generic "one" | PRONOUN | *das* |
| clause kinds | MAIN, CONDITIONAL, COORDINATED | a linked period's badge (`clause.*`) | CLAUSE | *der* / *den* |
| conjunctions | COPULATIVE, DISJUNCTIVE, ADVERSATIVE, EXPLICATIVE, CONCLUSIVE, TEMPORAL | the conjunction menu's hints (`conjunction.kind.*`) | CONJUNCTION | *die* |
| voices | ACTIVE_VOICE, PASSIVE | the voice satellite (`voice.value.*`) | CLAUSE | *der* |
| aspects | PROGRESSIVE, PROSPECTIVE, RESULTATIVE, (NEUTRAL) | the aspect satellite (`aspect.value.*`) | VERB | *das* |
| polarity, stance | POSITIVE, NEGATIVE, NEUTRAL | the polarity toggle and the cause's sentiment (`polarity.value.*`, `sentiment.value.*`); NEGATIVE is also a quantifier | WORD | *das* |
| relations | SPATIAL, SEMANTIC, DIRECT, INDIRECT, UNCONNECTED | the spatial relation of a place (`console.topic.place`), the tagline, `help.directObject`, the word map (`wordMap.hidden.*`) | RELATIONSHIP, PHRASE, PATH, WORD | *die*, *die*, *der*, *das* |

**TEMPORAL is the conjunction kind** ("then", `conjunction.kind.then`), not the everyday adjective;
**SPATIAL is a relationship's kind** (the `/in … /front` relations); **NEUTRAL is two values** — the
neutral aspect and the neutral stance — and its seed's description is the general one, so it is
glossed as the general word. One antecedent per family, so the German relative pronoun is the same
across a family.

### The verdicts

Probed 2026-09-22 against the engine source at HEAD (aff5d5b, with A206 and A213 fixed), from the
seed in memory. **Bold** rows are shipped, the rest are the drafts they beat; words marked \* were
probed through a lookup wrapper.

#### Number and gender — all three shipped

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **SINGULAR** | that indicates a sole object | che indica un oggetto unico | qui indique un objet unique | das einen einzigen Gegenstand bezeichnet | que indica un objeto único | 単一の物体を示す | que indica um objeto único |
| **PLURAL** | that indicates an object and other objects | che indica un oggetto e altri oggetti | qui indique un objet et d'autres objets | das einen Gegenstand und andere Gegenstände bezeichnet | que indica un objeto y otros objetos | 物体と別の物体を示す | que indica um objeto e outros objetos |
| **NEUTER** | that is not male or female | che non è maschile o femminile | qui n'est pas masculin ou féminin | das nicht männlich oder weiblich ist | que no es masculina o femenina | 男性でも女性でもない | que não é masculina ou feminina |
| PLURAL, draft: plural object, MANIFOLD | that indicates manifold objects | che indica oggetti molteplici | qui indique des objets multiples | das mehrfache Gegenstände bezeichnet | que indica objetos múltiples | 複数の物体を示す | que indica objetos múltiplos |
| PLURAL, draft: bare plural object | that indicates objects | che indica oggetti | qui indique des objets | das Gegenstände bezeichnet | que indica objetos | 物体を示す | que indica objetos |

SINGULAR takes SOLE, which [B58](../done/B58-tense-and-number-values.md) seeded so SINGULAR_GRAMMAR
would not be "a singular category"; SINGULAR's own gloss does not restate B58's "a sole category",
which says the category, not what a singular word points at. PLURAL cannot take MANIFOLD: Japanese
spells it 複数の, PLURAL's own word, and a bare plural object is 物体を示す in Japanese, which says no
number at all. **One object and others** is more than one in every language, Japanese included. NEUTER
is the description's "neither masculine nor feminine" as a coordinated predicate under negation,
which Japanese says as 〜でも〜でもない; MALE and FEMALE are the words the gender row already labels
with (`gender.value.*`). The Romance adjectives agree with the unspoken WORD (es *palabra* →
*masculina*).

#### The determiners — nine shipped, NEGATIVE literal by design

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **DEFINITE** | that indicates a known object | che indica un oggetto noto | qui indique un objet connu | das einen bekannten Gegenstand bezeichnet | que indica un objeto conocido | 既知の物体を示す | que indica um objeto conhecido |
| **INDEFINITE** | that indicates an unknown object | che indica un oggetto sconosciuto | qui indique un objet inconnu | das einen unbekannten Gegenstand bezeichnet | que indica un objeto desconocido | 不明な物体を示す | que indica um objeto desconhecido |
| **ZERO** | that one does not write | che non si scrive | qu'on n'écrit pas | das man nicht schreibt | que no se escribe | 書かない | que não se escreve |
| **PROXIMAL** | that indicates a near object | che indica un oggetto vicino | qui indique un objet proche | das einen nahen Gegenstand bezeichnet | que indica un objeto cercano | 近い物体を示す | que indica um objeto próximo |
| **DISTAL** | that indicates a far object | che indica un oggetto lontano | qui indique un objet lointain | das einen fernen Gegenstand bezeichnet | que indica un objeto lejano | 遠い物体を示す | que indica um objeto distante |
| **PARTITIVE** | that indicates a part | che indica una parte | qui indique une partie | das einen Teil bezeichnet | que indica una parte | 部分を示す | que indica uma parte |
| **MULTAL** | that indicates a great quantity | che indica una grande quantità | qui indique une grande quantité | das eine große Menge bezeichnet | que indica una cantidad grande | 大きい数量を示す | que indica uma quantidade grande |
| **PAUCAL** | that indicates a small quantity | che indica una piccola quantità | qui indique une petite quantité | das eine kleine Menge bezeichnet | que indica una cantidad pequeña | 小さい数量を示す | que indica uma quantidade pequena |
| **UNIVERSAL** | that indicates the whole quantity | che indica la quantità intera | qui indique la quantité entière | das die ganze Menge bezeichnet | que indica la cantidad entera | 全体の数量を示す | que indica a quantidade inteira |
| DEFINITE, draft: an object that one knows | that indicates an object that one knows | che indica un oggetto che si conosce | qui indique un objet qu'on connaît | das einen Gegenstand, den man kennt, bezeichnet | que indica un objeto que se conoce | 知る物体を示す | que indica um objeto que se conhece |
| ZERO, draft: has no word | that has no word | che non ha nessuna parola | qui n'a aucun mot | das kein Wort hat | que no tiene ninguna palabra | どの単語もない | que não tem nenhuma palavra |
| UNIVERSAL, draft: all objects | that indicates all objects | che indica tutti gli oggetti | qui indique tous les objets | das alle Gegenstände bezeichnet | que indica todos los objetos | すべての物体を示す | que indica todos os objetos |

The menu's three sections came apart three ways. **Identifiability** is whether the object is
known: DEFINITE and INDEFINITE on KNOWN (seeded here) and UNKNOWN, and ZERO, the article no word
spells, as the one the writer leaves out. The nested relative "an object that one knows" says it
without a new word, but Japanese 知る物体 is not how a known thing is said (知っている is, and the
resultative that gives it says "has known" in English). **Deixis** is where the object is: NEAR and
FAR, the gloss [A27](../done/A27-grammar-participants-and-clause-types.md)'s DEMONSTRATIVE ("a
determiner that indicates") narrowed. **Quantity** is how much of it: a part, a great, a small and the
whole quantity, which extends QUANTIFIER's shipped "a determiner that indicates quantities" rather
than repeating the menu's hint word ("all objects" is the hint "all" again). Each gloss is true of
its own section's value alone; across sections they overlap as the model says they do (the
demonstrative is identifiability by pointing, `DeterminerCategory`).

**NEGATIVE — literal by design.**

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| draft: NEGATE (circular) | that negates | che nega | qui nie | das verneint | que niega | 否定する | que nega |
| draft: not POSITIVE (circular) | that is not positive | che non è positiva | qui n'est pas positif | das nicht positiv ist | que no es positiva | 肯定ではない | que não é positiva |
| draft: indicates no object | that indicates no object | che non indica nessun oggetto | qui n'indique aucun objet | das keinen Gegenstand bezeichnet | que no indica ningún objeto | どの物体も示さない | que não indica nenhum objeto |
| draft: indicates no quantity | that indicates no quantity | che non indica nessuna quantità | qui n'indique aucune quantité | das keine Menge bezeichnet | que no indica ninguna cantidad | どの数量も示さない | que não indica nenhuma quantidade |
| draft: the opposite meaning | that expresses the opposite meaning | che esprime il significato opposto | qui exprime le sens opposé | das die entgegengesetzte Bedeutung vermittelt | que expresa el significado opuesto | 反対の意味を表す | que exprime o significado oposto |

One word, three controls: the quantifier "no" (its description), the polarity and the stance.
Its honest gloss, *that negates*, is circular — NEGATE ships as "to cause a clause to be negative"
(`causativeGloss` on NEGATIVE) — and so is *that is not positive*, through POSITIVE's "that does not
negate". The quantifier's own sense cannot be said: under negative concord "indicates no object"
reads *does not indicate any object* in Italian, French, Spanish, Portuguese and Japanese
(どの物体も示さない), which says the determiner indicates nothing. *The opposite meaning* defines an
antonym. Like GREAT and LOW, it stays on the literal.

#### Person — IMPERSONAL shipped

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **IMPERSONAL** | that indicates all people | che indica tutte le persone | qui indique toutes les personnes | das alle Personen bezeichnet | que indica a todas las personas | すべての人を示す | que indica todas as pessoas |
| draft: an unknown person | that indicates an unknown person | che indica una persona sconosciuta | qui indique une personne inconnue | das eine unbekannte Person bezeichnet | que indica a una persona desconocida | 不明な人を示す | que indica uma pessoa desconhecida |

"Not standing for any particular person" is the generic "one", which is to say anyone: people at
large. The ordinal persons beside it (FIRST, SECOND, THIRD) are the order words, not this family's.
"An unknown person" is a particular person nobody has named.

#### The clause kinds — MAIN and COORDINATED shipped here, CONDITIONAL in the integration pass

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **MAIN** | that governs other clauses | che regge altre proposizioni | qui régit d'autres propositions | der andere Sätze regiert | que rige otras oraciones | 別の節を支配する | que rege outras orações |
| **COORDINATED** | that a conjunction links to another clause | che una congiunzione collega a un'altra proposizione | qu'une conjonction relie à une autre proposition | den eine Konjunktion mit einem anderen Satz verbindet | que una conjunción enlaza a otra oración | 接続詞が別の節につなぐ | que uma conjunção liga a outra oração |
| MAIN, draft: not in another clause | that is not in another clause | che non è in un'altra proposizione | qui n'est pas dans une autre proposition | der nicht in einem anderen Satz ist | que no está en otra oración | 別の節にない | que não está em outra oração |
| MAIN, draft: no clause governs | that no clause governs | che nessuna proposizione regge | qu'aucune proposition ne régit | den kein Satz regiert | que ninguna oración rige | どの節も支配しない | que nenhuma oração rege |
| COORDINATED, draft: one has coordinated | that one has coordinated with another clause | che si è coordinata con un'altra proposizione | qu'on a coordonnée avec une autre proposition | den man mit einem anderen Satz koordiniert hat | que se ha coordinado con otra oración | 別の節と調整した | que se coordenou com outra oração |

The three badges come apart on what links the clause and which way. MAIN is what the app makes of the
other half of a condition, and GOVERN is the grammar's verb for it — Italian calls the main clause the
*proposizione reggente*. "Not in another clause" is the textbook definition but is equally true of a
coordinated clause, the C05 failure; "no clause governs" is ambiguous in Japanese (どの節も支配しない
reads *governs no clause*). COORDINATED is linked by a *conjunction* — the app's CONJUNCTION is the
coordinating kind, "and, or, but" — which a condition is not; the COORDINATE draft is the verb
COORDINATE's everyday sense ("to cause people to act together", 調整する), not the grammar's.
CONJUNCT ships as "a phrase that is linked by a conjunction"; COORDINATED says the clause and its
partner, and does not read as that gloss with its head dropped.

**CONDITIONAL — blocked in this lane**, on a verb whose object takes its own preposition; shipped in the [integration pass](#first-second-third-conditional-and-sharp-in-the-integration-pass). The drafts it beat:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| draft: indicates a condition (circular) | that indicates a condition | che indica una condizione | qui indique une condition | der eine Bedingung bezeichnet | que indica una condición | 条件を示す | que indica uma condição |
| draft: governs the main clause | that governs the main clause | che regge la proposizione principale | qui régit la proposition principale | der den übergeordneten Satz regiert | que rige la oración principal | 主節を支配する | que rege a oração principal |
| draft: can cause the main clause | that can cause the main clause | che può indurre la proposizione principale | qui peut induire la proposition principale | der den übergeordneten Satz veranlassen kann | que puede inducir la oración principal | 主節を引き起こすことができる | que pode induzir a oração principal |
| draft: the main clause must accept | that the main clause must accept | che la proposizione principale deve accettare | que la proposition principale doit accepter | den der übergeordnete Satz akzeptieren muss | que la oración principal debe aceptar | 主節が受け付ける必要がある | que a oração principal deve aceitar |

CONDITION ships as "a conditional clause" (A27), so anything on CONDITION defines the two with each
other. The drafts that avoid it are wrong: the conditional does not govern the main clause (MAIN now
says the reverse), it does not cause it (*indurre*, *veranlassen* are the causative verb), and
"must accept" is not what a condition is. The description's own words are the gloss —
**"that another clause depends on"** — and they need two things: a verb DEPEND (not seeded), and a
relative whose gap is that verb's *own* prepositional object, which no complement type spells: en
"that … depends **on**", it "**da cui** … dipende", fr "**dont** … dépend", de "**von dem** … abhängt",
es "**del que** … depende", pt "**do qual** … depende", ja 〜が依存する (に). The complement renderers
pick a preposition by complement type (a source is en *from*, de *aus*), not by verb. Proposed and
not seeded:

| id | role | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| DEPEND | verb | depend (on) | dipendere (da) | dépendre (de) | abhängen (von) | depender (de) | 依存する (に) | depender (de) |

#### The conjunctions — all six shipped

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **COPULATIVE** | that adds a phrase to another phrase | che aggiunge una frase a un'altra frase | qui ajoute une phrase à une autre phrase | die eine Phrase zu einer anderen Phrase hinzufügt | que añade una frase a otra frase | 別のフレーズにフレーズを加える | que adiciona uma frase a outra frase |
| **DISJUNCTIVE** | that links options | che collega opzioni | qui relie des options | die Optionen verbindet | que enlaza opciones | 選択肢をつなぐ | que liga opções |
| **ADVERSATIVE** | that links opposite clauses | che collega proposizioni opposte | qui relie des propositions opposées | die entgegengesetzte Sätze verbindet | que enlaza oraciones opuestas | 反対の節をつなぐ | que liga orações opostas |
| **EXPLICATIVE** | that expresses the previous clause with other words | che esprime la proposizione precedente con altre parole | qui exprime la proposition précédente avec d'autres mots | die den vorherigen Satz mit anderen Wörtern vermittelt | que expresa la oración anterior con otras palabras | 別の単語で前の節を表す | que exprime a oração anterior com outras palavras |
| **CONCLUSIVE** | that uses the previous clause as a cause | che usa la proposizione precedente come causa | qui utilise la proposition précédente comme cause | die den vorherigen Satz als Ursache verwendet | que usa la oración anterior como causa | 前の節を原因として使う | que usa a oração anterior como causa |
| **TEMPORAL** | that indicates the next action | che indica l'azione successiva | qui indique l'action suivante | die die nächste Handlung bezeichnet | que indica la acción siguiente | 次の動作を示す | que indica a ação seguinte |
| CONCLUSIVE, draft: links a clause to its cause | that links a clause to its cause | che collega una proposizione alla sua causa | qui relie une proposition à sa cause | die einen Satz mit seiner Ursache verbindet | que enlaza una oración a su causa | その原因に節をつなぐ | que liga uma oração à sua causa |
| TEMPORAL, draft: arranges actions in time | that arranges actions in the time | che dispone azioni nel tempo | qui dispose des actions dans le temps | die Handlungen in der Zeit anordnet | que dispone acciones en el tiempo | 時間で動作を並べる | que dispõe ações no tempo |

Each is the description's relation in the corpus's words, on the verbs CONJUNCTION's own gloss
("a word that links clauses") and COORDINATION's use: "and" adds, "or" links alternatives (OPTION,
"a concept that one chooses"), "but" links opposites, "that is" says the previous clause again in
other words (TRANSLATE's "with another language" is the same instrument), "therefore" takes what came
before as the cause — the essive object complement, "as a cause" — and "then" points at the next
action. The *its cause* draft needs a possessive whose antecedent Japanese cannot see (その原因に節を
つなぐ), and "in the time" is an article English does not want. PREVIOUS and NEXT are adjectives
[C24](C24-grammar-feature-adjectives.md) still owes a gloss of their own (the order words); used
here as differentiae, they must not be glossed back through EXPLICATIVE, CONCLUSIVE or TEMPORAL.

#### The voices — both shipped

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **ACTIVE_VOICE** | that uses the agent as the subject | che usa l'agente come soggetto | qui utilise l'agent comme sujet | der das Agens als Subjekt verwendet | que usa el agente como sujeto | 動作主を主語として使う | que usa o agente como sujeito |
| **PASSIVE** | that uses the direct object as the subject | che usa il complemento oggetto diretto come soggetto | qui utilise le complément d'objet direct comme sujet | der das direkte Objekt als Subjekt verwendet | que usa el complemento directo como sujeto | 直接の目的語を主語として使う | que usa o objeto direto como sujeito |
| PASSIVE, draft: the object | that uses the object as the subject | che usa il complemento oggetto come soggetto | qui utilise le complément d'objet comme sujet | der das Objekt als Subjekt verwendet | que usa el complemento como sujeto | 目的語を主語として使う | que usa o objeto como sujeito |
| ACTIVE, draft: whose subject is the agent | whose subject is the agent | il cui soggetto è l'agente | dont le sujet est l'agent | dessen Subjekt das Agens ist | cuyo sujeto es el agente | 主語が動作主である | cujo sujeito é o agente |

VOICE ships as "a feature that indicates participants"; its two values are which participant the
clause makes its subject, said with the essive object complement and the participants A27 and
[B49](../done/B49-participant.md) glossed (AGENT_GRAMMAR "a participant that acts",
SUBJECT_GRAMMAR, OBJECT_GRAMMAR). The passive's is the *direct* object, the phrase
`help.directObject` already builds, because Spanish OBJECT_GRAMMAR alone is *complemento*, which reads
as any complement. The possessor-gap draft ("whose subject is the agent") renders well, and its
passive "whose subject is the object" reads as a paradox.

#### The aspects — all three shipped

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **PROGRESSIVE** | that shows an action as a process | che mostra un'azione come processo | qui montre une action comme processus | das eine Handlung als Prozess zeigt | que muestra una acción como proceso | 動作を過程として見せる | que mostra uma ação como processo |
| **PROSPECTIVE** | that shows an action that is about to begin | che mostra un'azione che sta per iniziare | qui montre une action qui est sur le point de commencer | das eine Handlung, die im Begriff zu beginnen ist, zeigt | que muestra una acción que está a punto de empezar | 始まろうとしている動作を見せる | que mostra uma ação que está prestes a começar |
| **RESULTATIVE** | that shows an action as a state | che mostra un'azione come stato | qui montre une action comme état | das eine Handlung als Zustand zeigt | que muestra una acción como estado | 動作を状態として見せる | que mostra uma ação como estado |
| PROGRESSIVE, draft: INDICATE | that indicates an action as a process | che indica un'azione come processo | qui indique une action comme processus | das eine Handlung als Prozess bezeichnet | que indica una acción como proceso | 動作を過程として示す | que indica uma ação como processo |
| PROGRESSIVE, draft: EXPRESS | that expresses an action as a process | che esprime un'azione come processo | qui exprime une action comme processus | das eine Handlung als Prozess vermittelt | que expresa una acción como proceso | 動作を過程として表す | que exprime uma ação como processo |
| RESULTATIVE, draft: the state an action has produced | that indicates the state that an action has produced | che indica lo stato che un'azione ha prodotto | qui indique l'état qu'une action a produit | das den Zustand, den eine Handlung erzeugt hat, bezeichnet | que indica el estado que una acción ha producido | 動作が出した状態を示す | que indica o estado que uma ação produziu |

An aspect is how a verb *shows* its action: as a process (PROCESS, "a course of action unfolding step
by step"), as the state it leaves, or — the one with no noun to be — as an action about to begin,
said in the prospective itself, which every language spells with words of its own (*sta per*, *sur le
point de*, *im Begriff*, *a punto de*, *prestes a*, 〜ようとしている). SHOW won on English and German;
INDICATE's "indicates an action as" is not English and EXPRESS's *als Prozess vermitteln* is not
German. Japanese 〜として見せる is the "present as" collocation. PRODUCE is 出す in Japanese, which does
not produce a state. NEUTRAL, the fourth value, is glossed with the stance below: its description is
the general word's.

#### Polarity and stance — POSITIVE and NEUTRAL shipped

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **POSITIVE** | that does not negate | che non nega | qui ne nie pas | das nicht verneint | que no niega | 否定しない | que não nega |
| **NEUTRAL** | that is not positive or negative | che non è positiva o negativa | qui n'est pas positif ou négatif | das nicht positiv oder negativ ist | que no es positiva o negativa | 肯定でも否定でもない | que não é positiva ou negativa |
| NEUTRAL, draft: chooses no option | that chooses no option | che non sceglie nessun'opzione | qui ne choisit aucune option | das keine Option wählt | que no elige ninguna opción | どの選択肢も選ばない | que não escolhe nenhuma opção |

POSITIVE is its description's second half, "not negating"; NEGATE is glossed through NEGATIVE, not
POSITIVE, so no circle closes. NEUTRAL is "neither one side nor the other" with the sides named,
肯定でも否定でもない in Japanese; POSITIVE_DEGREE's "a positive degree" and POLARITY's "a feature that
negates clauses" are the neighbours it had to miss, and it does.

#### The relations — all five shipped

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **SPATIAL** | that indicates an object's place | che indica il luogo di un oggetto | qui indique le lieu d'un objet | die den Ort eines Gegenstands bezeichnet | que indica el lugar de un objeto | 物体の場所を示す | que indica o lugar de um objeto |
| **SEMANTIC** | that one makes with meanings | che si fa con significati | qu'on fait avec des sens | die man mit Bedeutungen macht | que se hace con significados | 意味で作る | que se faz com significados |
| **DIRECT** | that does not go through another place | che non va attraverso un altro luogo | qui ne va pas à travers un autre lieu | der nicht durch einen anderen Ort geht | que no va por otro lugar | 別の場所を行かない | que não vai por outro lugar |
| **INDIRECT** | that goes through another place | che va attraverso un altro luogo | qui va à travers un autre lieu | der durch einen anderen Ort geht | que va por otro lugar | 別の場所を行く | que vai por outro lugar |
| **UNCONNECTED** | that has no relationships | che non ha nessuna relazione | qui n'a aucune relation | das keine Beziehungen hat | que no tiene ninguna relación | どの関係もない | que não tem nenhuma relação |
| SPATIAL, draft: indicates places | that indicates places | che indica luoghi | qui indique des lieux | die Orte bezeichnet | que indica lugares | 場所を示す | que indica lugares |
| SEMANTIC, draft: expresses meanings | that expresses meanings | che esprime significati | qui exprime des sens | die Bedeutungen vermittelt | que expresa significados | 意味を表す | que exprime significados |
| DIRECT, draft: through no place | that goes through no place | che non va attraverso nessun luogo | qui ne va à travers aucun lieu | der durch keinen Ort geht | que no va por ningún lugar | どの場所も行かない | que não vai por nenhum lugar |
| UNCONNECTED, draft: one has not connected | that one has not connected | che non si è connessa | qu'on n'a pas connecté | das man nicht verbunden hat | que no se ha conectado | 接続していない | que não se conectou |
| UNCONNECTED, draft: linked to no word | that one has linked to no word | che non si è collegata a nessuna parola | qu'on n'a relié à aucun mot | das man mit keinem Wort verbunden hat | que no se ha enlazado a ninguna palabra | どの単語にもつないでいない | que não se ligou a nenhuma palavra |

SPATIAL is the relation a place stands in to its noun ("under the house"); "indicates places" is
LOCATIVE's and CURSOR's glosses with the head dropped. SEMANTIC is what the tagline means by it,
phrases made out of meanings — "expresses meanings" is every phrase. DIRECT and INDIRECT are their
descriptions' "nothing in between" as a route, the pair apart on the negation of one differentia;
"through no place" loses the route in Japanese (どの場所も行かない, *goes nowhere*). UNCONNECTED is
the word map's word no edge reaches, and the map's edges are RELATIONSHIPs; the participial drafts
say what someone has not done, and LINKED ([C23](C23-participial-state-adjectives.md)) is the
participle.

### Coming apart

Every family's values render differently from each other in every one of the seven, which
[grammar-feature-adjectives.test.ts](../../../packages/engine/test/grammar-feature-adjectives.test.ts)
checks family by family, and none renders like any other definition in the corpus
([sweep-definitions.test.ts](../../../packages/engine/test/sweep-definitions.test.ts), green with no
new allowance).

### Words

**Seeded:** KNOWN, beside UNKNOWN in
[adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts), with a row in
`adjectives.test.ts`'s `EVERY_ADJECTIVE`. It has no gloss of its own; it is C23's kind (the state
knowing leaves).

| id | role | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| KNOWN | adjective | known | noto | connu | bekannt | conocido | 既知の (きちの) | conhecido |

**Proposed here:** DEPEND, for CONDITIONAL (above) — seeded in the integration pass.

**Differentiae borrowed from the other lanes' words.** These glosses use adjectives C24's other
lanes and C23 are glossing now, so the merge must check no circle closes: SOLE (SINGULAR), OTHER
(PLURAL, MAIN, COORDINATED, COPULATIVE, EXPLICATIVE, DIRECT, INDIRECT), MALE and FEMALE (NEUTER), NEAR
and FAR (PROXIMAL, DISTAL), WHOLE (UNIVERSAL), PREVIOUS (EXPLICATIVE, CONCLUSIVE), NEXT (TEMPORAL),
OPPOSITE (ADVERSATIVE), UNKNOWN (INDEFINITE).

### Noted, not fixed

What the probes showed of the engine, which these glosses use and do not change:

- **Japanese says a route with を and the motion verb** — "the cat goes through the house" is
  猫は家を行きます, where 家を通って行きます is the idiom, with or without the `through` specifier. DIRECT
  and INDIRECT read 別の場所を行く / 行かない, grammatical and stiff. Under the `no` quantifier the route
  particle is lost altogether: "goes through no place" is どの場所も行かない, *goes nowhere*.
- **German leaves a prospective's zu-infinitive inside the subordinate clause**: "die im Begriff zu
  beginnen ist", where "die im Begriff ist, zu beginnen" is the standard order (PROSPECTIVE).
- **French says a route with *à travers*** ("qui va à travers un autre lieu"); *passer par* is what
  a detour does.
- **Spanish LINK takes *a* for its terminus** ("enlaza a otra oración"), where *enlazar con* is
  usual.
- EXPRESS is German *vermitteln*, so EXPLICATIVE's "mit anderen Wörtern vermittelt" is the lexeme's,
  not the idiom *mit anderen Worten*.

## The relational, order and time adjectives (33)

**Twenty shipped here and nine are literal by design; the four this lane left blocked — SHARP, FIRST, SECOND and THIRD — shipped in the [integration pass](#first-second-third-conditional-and-sharp-in-the-integration-pass).** Every one of the twenty is a
headless relative (`NounPhrase.relativeGloss`, the helpers in
[relativeGloss.ts](../../../packages/backend/src/concepts/relativeGloss.ts)) or a `dimGloss` scale,
and **fifteen words** were seeded for them. Probed 2026-09-22 against the engine source at HEAD
(base `aff5d5b`, K1's construct with the A206 / A213 agreement fixes); words marked \* in a table
are candidates probed through an injected seed and **not** seeded.

| concept | family | verdict | en |
|---|---|---|---|
| WILD | creatures | **shipped** | that has not been tamed |
| DOMESTIC | creatures | **shipped** | that lives with people |
| MALE | creatures | **shipped** | that has testicles |
| FEMALE | creatures | **shipped** | that has ovaries |
| CASTRATED | creatures | **shipped** | from which the testicles have been removed |
| HUNGRY | creatures | **shipped** | that wants to eat |
| ADULT | creatures | **shipped** | that no longer grows |
| CANINE | creatures | literal by design | — |
| ROUND | things | **shipped** | whose shape is a circle |
| WHOLE | things | **shipped** | that has not been divided |
| NEW | things | **shipped** | that has been made recently |
| SHARP | things | **shipped** (integration pass) | that cuts well |
| BROWN | things | literal by design | — |
| BEAUTIFUL | things | literal by design | — |
| SWEET | taste, matter, feeling | **shipped** | that has sugar |
| SOLID | taste, matter, feeling | **shipped** | that does not flow |
| WARM | taste, matter, feeling | **shipped** | of great kindness |
| NEAR | scales | **shipped** | at small distance |
| FAR | scales | **shipped** | at great distance |
| GREAT | scales | literal by design | — |
| LOW | scales | literal by design | — |
| OTHER | primitives | literal by design | — |
| OPPOSITE | primitives | literal by design | — |
| SOLE | primitives | literal by design | — |
| MANIFOLD | primitives | literal by design | — |
| NEXT | order | **shipped** | that follows |
| PREVIOUS | order | **shipped** | that precedes |
| FIRST | order | **shipped** (integration pass) | that all other objects follow |
| SECOND | order | **shipped** (integration pass) | that follows the first object |
| THIRD | order | **shipped** (integration pass) | that follows the second object |
| PRESENT | time | **shipped** | that happens now |
| PAST | time | **shipped** | that has happened |
| FUTURE | time | **shipped** | that will happen |

**The antecedents, one per family.** The unspoken head drives agreement, so it was chosen as the
class each family is said of, and kept across the family: **BEING** for the creatures (a creature
of either kind — MAN is "an adult male person"; de *Wesen* gives "das …"), **OBJECT_THING** for the
things and the order words (de *Gegenstand*, "der …" / "dessen …"), **FOOD** for SWEET and
**SUBSTANCE** for SOLID (the class the adjective is said of), and **PROCESS** for the time words.
ANIMAL was probed for the creatures and lost twice: German says *fressen* of an animal, so HUNGRY
read "das fressen will", and Italian's animate source reads "via dal quale".

### The creatures: WILD, DOMESTIC, MALE, FEMALE, CASTRATED, CANINE, HUNGRY, ADULT

What separates them is **what the creature has, does or has had done to it**, never a class noun:
the two sexes by the organ each has, CASTRATED by the organ removed (a source gap, so it is not
FEMALE's "has none"), WILD and DOMESTIC by taming and by living with people, ADULT by growth that
has stopped, HUNGRY by wanting to eat.

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| WILD — `stateGloss(BEING, TAME, passive, negative)` **(shipped)** | that has not been tamed | che non è stato domato | qui n'a pas été apprivoisé | das nicht gezähmt worden ist | que no ha sido domado | 飼い慣らされていない | que não foi domado |
| WILD — the same, active | that one has not tamed | che non si è domato | qu'on n'a pas apprivoisé | das man nicht gezähmt hat | que no se ha domado | 飼い慣らしていない | que não se domou |
| WILD — LIVE in the NATURE\* | that lives in the nature | che abita nella natura | qui habite dans la nature | das in der Natur wohnt | que vive en la naturaleza | 自然に住む | que mora na natureza |
| WILD — LIVE in NATURE\*, bare | that lives in nature | che abita in natura | qui habite dans nature | das in Natur wohnt | que vive en naturaleza | 自然に住む | que mora em natureza |
| WILD — LIVE with people, negated | that does not live with people | che non abita con persone | qui ne habite pas avec des personnes | das nicht mit Personen wohnt | que no vive con personas | 人と住まない | que não mora com pessoas |
| WILD — OWN, agent `no` PERSON | that no person owns | che nessuna persona possiede | qu'aucune personne ne possède | das keine Person besitzt | que ninguna persona posee | どの人も所有しない | que nenhuma pessoa possui |
| DOMESTIC — `subjectGapGloss(BEING, LIVE, comitative PERSON bare plural)` **(shipped)** | that lives with people | che abita con persone | qui habite avec des personnes | das mit Personen wohnt | que vive con personas | 人と住む | que mora com pessoas |
| DOMESTIC — OWN, agent PERSON | that a person owns | che una persona possiede | qu'une personne possède | das eine Person besitzt | que una persona posee | 人が所有する | que uma pessoa possui |
| DOMESTIC — LIVE in houses | that lives in houses | che abita in case | qui habite dans des maisons | das in Häusern wohnt | que vive en casas | 家に住む | que mora em casas |
| MALE — `subjectGapGloss(BEING, HAVE, TESTICLE plural)` **(shipped)** | that has testicles | che ha testicoli | qui a des testicules | das Hoden hat | que tiene testículos | 精巣がある | que tem testículos |
| MALE — the same on ANIMAL | that has testicles | che ha testicoli | qui a des testicules | das Hoden hat | que tiene testículos | 精巣を持つ | que tem testículos |
| FEMALE — `subjectGapGloss(BEING, HAVE, OVARY plural)` **(shipped)** | that has ovaries | che ha ovaie | qui a des ovaires | das Eierstöcke hat | que tiene ovarios | 卵巣がある | que tem ovários |
| CASTRATED — source gap, REMOVE resultative passive **(shipped)** | from which the testicles have been removed | dal quale i testicoli sono stati rimossi | duquel les testicules ont été retirés | aus dem die Hoden entfernt worden sind | del que los testículos han sido quitados | 精巣が取り除かれた | do qual os testículos foram removidos |
| CASTRATED — source gap, active | from which one has removed the testicles | dal quale si sono rimossi i testicoli | duquel on a retiré les testicules | aus dem man die Hoden entfernt hat | del que se han quitado los testículos | 精巣を取り除いた | do qual se removeram os testículos |
| CASTRATED — source gap on ANIMAL | from which the testicles have been removed | via dal quale i testicoli sono stati rimossi | duquel les testicules ont été retirés | von dem die Hoden entfernt worden sind | del que los testículos han sido quitados | 精巣が取り除かれた | do qual os testículos foram removidos |
| CASTRATED — terminus gap on ANIMAL | to which one has removed the testicles | al quale si sono rimossi i testicoli | auquel on a retiré les testicules | dem man die Hoden entfernt hat | al que se han quitado los testículos | 精巣を取り除いた | ao qual se removeram os testículos |
| CASTRATED — possessor gap, BE REMOVED | whose testicles are removed | i cui testicoli sono rimossi | dont les testicules sont retirés | dessen Hoden entfernt sind | cuyos testículos están quitados | 精巣が削除済みの | cujos testículos estão removidos |
| CASTRATED — HAVE `no` TESTICLE | that has no testicles | che non ha nessun testicolo | qui n'a aucun testicule | das keine Hoden hat | que no tiene ningún testículo | どの精巣もない | que não tem nenhum testículo |
| HUNGRY — `subjectGapGloss(BEING, EAT, modal WILL)` **(shipped)** | that wants to eat | che vuole mangiare | qui veut manger | das essen will | que quiere comer | 食べたい | que quer comer |
| HUNGRY — the same on ANIMAL | that wants to eat | che vuole mangiare | qui veut manger | das fressen will | que quiere comer | 食べたい | que quer comer |
| HUNGRY — DESIRE FOOD | that desires food | che desidera cibo | qui désire de la nourriture | das Essen wünscht | que desea comida | 食べ物を望む | que deseja comida |
| ADULT — `subjectGapGloss(BEING, GROW, NO_LONGER)` **(shipped)** | that no longer grows | che non cresce più | qui ne grandit plus | das nicht mehr wächst | que ya no crece | もう成長しない | que já não cresce |
| ADULT — GROW, resultative | that has grown | che è cresciuto | qui a grandi | das gewachsen ist | que ha crecido | 成長した | que cresceu |
| ADULT — GROW, resultative, COMPLETELY\* | that has grown fully | che è cresciuto completamente | qui a grandi complètement | das vollständig gewachsen ist | que ha crecido completamente | 完全に成長した | que cresceu completamente |
| ADULT — BE YOUNG, negated | that is not young | che non è giovane | qui n'est pas jeune | das nicht jung ist | que no es joven | 若くない | que não é jovem |
| ADULT — `dimGloss(AGE, HIGH)`, the B54 draft | of high age | di età alta | d'âge haut | von hohem Alter | de edad alta | 年齢が高い | de idade alta |
| OLD, for comparison — `dimGloss(AGE, GREAT)` | of great age | di grande età | de grand âge | von großem Alter | de edad grande | 年齢が大きい | de idade grande |
| CANINE — BE a DOG | that is a dog | che è un cane | qui est un chien | das ein Hund ist | que es un perro | 犬である | que é um cão |
| DOG, for comparison — its shipped gloss | a domestic canine mammal | un mammifero domestico e canino | un mammifère domestique et canin | ein zahmes hundeartiges Säugetier | un mamífero doméstico y canino | 家庭の犬の哺乳類 | um mamífero doméstico e canino |

- **WILD** ships on its own description's "not tamed", in the passive: the active's *que não se
  domou* reads reflexively in Portuguese. B54's plan, "that lives in nature", does not render: a
  definite NATURE is "in **the** nature" in English, and a bare one drops the article the other five
  need (*dans nature*, *in Natur*). "That does not live with people" is DOMESTIC's gloss negated and
  would have cost nothing, but French writes **"qui ne habite pas"** — see *Engine defects*. "That no
  person owns" is true of a stray. TAME is *domare* / *domar*, not *addomesticare* / *domesticar*,
  which would gloss WILD on DOMESTIC's own root (*domestico*, *doméstico*). German's *gezähmt* is
  DOMESTIC's *zahm*: the one language where WILD reads "not DOMESTIC", which is an antonym gloss, not
  a circle.
- **DOMESTIC** is its description's second half. "That a person owns" is true of a caged wolf, and
  "that lives in houses" of no ox.
- **MALE and FEMALE** by the organ, not by a SEX noun: "of the sex that produces sperm" needs a
  membership fragment with a relative on it, which is not a shape the engine has, and SEX would be
  seeded for a circle ("of the male sex"). HAVE on BEING is Japanese's existential ある (精巣がある);
  on ANIMAL it turns to 持つ.
- **CASTRATED** is a source gap: "that has no testicles" is FEMALE's too. The possessor gap reads the
  UI's *removed* (ja 削除済みの, "deleted"), and the terminus is "to which" in English, where German and
  French would want it (*dem man … entfernt hat*, *auquel on a retiré*). German *aus dem* is the
  source's inanimate *aus*; *von dem* would need ANIMAL, which costs Italian its *via dal quale*.
- **HUNGRY** is "a need for food" said as the modal WILL: every language says it plainly (ja 食べたい).
  DESIRE reads *wünscht* and 望む, a wish, not hunger.
- **ADULT** is what OLD's "of great age" is not. "That has grown" is true of a growing child and "that
  is not young" of no one young; NO_LONGER (seeded) says "has finished growing" in each language's
  own negation.
- **CANINE is literal by design.** "Of or resembling dogs" is a relation to DOG, and DOG is "a
  domestic canine mammal" (WOLF "a wild canine mammal"): every gloss the corpus can write routes
  back through the word it defines. FOX, the one canid without CANINE in its gloss, is "a brown
  mammal".

### The things: ROUND, WHOLE, NEW, SHARP, BROWN, BEAUTIFUL

These are properties of an OBJECT_THING, and each gloss says **what was or was not done to it**
(divided, made recently) or **what its part is** (its shape is a circle). The three that do not
ship fail for the reasons the rules name: a cycle (SHARP), no exemplar the corpus can point at
(BROWN), and a gloss that is either circular or a stretch (BEAUTIFUL).

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| ROUND — possessor gap, SHAPE BE a CIRCLE **(shipped)** | whose shape is a circle | la cui forma è un cerchio | dont la forme est un cercle | dessen Form ein Kreis ist | cuya forma es un círculo | 形が円である | cuja forma é um círculo |
| WHOLE — `stateGloss(OBJECT_THING, DIVIDE, passive, negative)` **(shipped)** | that has not been divided | che non è stato diviso | qui n'a pas été divisé | der nicht geteilt worden ist | que no ha sido dividido | 分けられていない | que não foi dividido |
| WHOLE — the same, active | that one has not divided | che non si è diviso | qu'on n'a pas divisé | den man nicht geteilt hat | que no se ha dividido | 分けていない | que não se dividiu |
| WHOLE — HAVE `all` PART plural | that has all parts | che ha tutte le parti | qui a toutes les parties | der alle Teile hat | que tiene todas las partes | すべての部分がある | que tem todas as partes |
| NEW — `stateGloss(OBJECT_THING, MAKE, passive, RECENTLY)` **(shipped)** | that has been made recently | che è stato fatto di recente | qui a été fait récemment | der kürzlich gemacht worden ist | que ha sido hecho recientemente | 最近作られた | que foi feito recentemente |
| NEW — the same, active | that one has made recently | che si è fatto di recente | qu'on a fait récemment | den man kürzlich gemacht hat | que se ha hecho recientemente | 最近作った | que se fez recentemente |
| NEW — MAKE, NOW | that one has made now | che si è fatto ora | qu'on a fait maintenant | den man jetzt gemacht hat | que se ha hecho ahora | 今作った | que se fez agora |
| NEW — USE, negated | that one has not used | che non si è usato | qu'on n'a pas utilisé | den man nicht verwendet hat | que no se ha usado | 使っていない | que não se usou |
| NEW — `dimGloss(AGE, LOW)`, the A28 draft (YOUNG's) | of low age | di età bassa | d'âge bas | von niedrigem Alter | de edad baja | 年齢が低い | de idade baixa |
| SHARP — CUT WELL (CUT is "to divide with a sharp blade") | that cuts well | che taglia bene | qui coupe bien | der gut schneidet | que corta bien | よく切る | que corta bem |
| SHARP — DIVIDE WELL | that divides well | che divide bene | qui divise bien | der gut teilt | que divide bien | よく分ける | que divide bem |
| SHARP — possessor gap, BLADE DIVIDE WELL | whose blade divides well | la cui lama divide bene | dont la lame divise bien | dessen Klinge gut teilt | cuya cuchilla divide bien | 刃がよく分ける | cuja lâmina divide bem |
| SHARP — possessor gap, EDGE\* (cutting edge) BE THIN\* | whose edge is thin | il cui filo è sottile | dont le fil est fin | dessen Schneide dünn ist | cuyo filo es fino | 刃先が薄い | cujo fio é fino |
| SHARP — possessor gap, EDGE\* (rim) BE THIN\* | whose edge is thin | il cui bordo è sottile | dont le bord est fin | dessen Kante dünn ist | cuyo borde es fino | 縁が薄い | cuja borda é fina |
| BROWN — possessor gap, COLOUR\* BE the GROUND's COLOUR\* | whose colour is the ground's colour | il cui colore è il colore del suolo | dont la couleur est la couleur du sol | dessen Farbe die Farbe des Bodens ist | cuyo color es el color del suelo | 色が地面の色である | cuja cor é a cor do chão |
| BROWN — HAVE the COLOUR\* | that has the colour | che ha il colore | qui a la couleur | der die Farbe hat | que tiene el color | 色がある | que tem a cor |
| BEAUTIFUL — SEE, instrumental JOY | that one sees with joy | che si vede con gioia | qu'on voit avec de la joie | den man mit Freude sieht | que se ve con alegría | 喜びで見る | que se vê com alegria |
| BEAUTIFUL — SEE, manner JOY | that one sees like joy | che si vede come gioia | qu'on voit comme joie | den man wie Freude sieht | que se ve como alegría | 喜びのように見る | que se vê como alegria |
| BEAUTIFUL — `dimGloss(QUALITY, HIGH)`, the A28 draft (GOOD's) | of high quality | di qualità alta | de qualité haute | von hoher Qualität | de calidad alta | 質が高い | de qualidade alta |

- **ROUND** is the genitive relative HYPERNYM already uses; German's *dessen* is Gegenstand's. It did
  not need C26's part-whole relation, and it needed SHAPE and CIRCLE, both B54's. CIRCLE hangs under
  SHAPE and has no gloss: *a round figure* would now be a circle.
- **WHOLE** did not need the part-whole relation either. "Complete, with no part missing" is an
  undivided thing; "that has all parts" is not English, and would need a possessive (*all its parts*).
  The passive, because the active reads reflexively in Portuguese (*que não se dividiu*), as WILD's.
- **NEW** differs from YOUNG by what it is said of, as the ruling put it: a thing is made, not born.
  RECENTLY was seeded for it; NOW puts the making at this moment ("that one has made now"), and
  "not used" is the second-hand sense only.
- **SHARP was blocked here, on a cycle** — and shipped once CUT was re-glossed, the first lead named below. Its description is "having an edge that cuts easily", and
  CUT is "to divide with a sharp blade" (B13), so "that cuts well" defines SHARP by CUT and CUT by
  SHARP. DIVIDE in CUT's place says *split into parts* in every language (*divide bene*, *teilt gut*,
  よく分ける). The one non-circular lead, "whose edge is thin", renders — but with the cutting-edge noun
  it reads "whose **thread** is thin" in Italian, French and Portuguese (*filo*, *fil*, *fio*), and with
  the generic one "whose rim is thin" (縁が薄い). **What it would take:** CUT re-glossed without SHARP
  — and not on BLADE, which lane P ships as "the part of an object that cuts" — after which "that
  cuts well" is SHARP's gloss, or an edge noun that is only a blade's edge in all seven.
- **BROWN is literal by design.** It is the corpus's only colour word, and a colour is defined by an
  exemplar or not at all. COLOUR alone says "that has the colour"; the ground is not reliably brown
  (and is *chão*, *Boden*, floor, in two languages); WOOD is lane P's word; FOX is "a brown mammal".
  COLOUR is not seeded.
- **BEAUTIFUL stays literal.** "Of high beauty" is cognate with the word in all seven (A28), and the
  one non-cognate, non-circular lead, "that one sees with joy", is Japanese 喜びで見る ("sees by means
  of joy") and true of a friend coming home. `manner` makes it a simile ("like joy").

### Taste, matter and feeling: SWEET, SOLID, WARM

Three differentiae B tickets seeded (SWEET for ICE_CREAM, SOLID for GROUND, WARM for AFFECTION), so
each gloss had to avoid the word that stands on it. **None routes back**: a walk over every
definition in the corpus finds no cycle through any of the twenty.

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| SWEET — `subjectGapGloss(FOOD, HAVE, SUGAR)` **(shipped)** | that has sugar | che ha zucchero | qui a du sucre | das Zucker hat | que tiene azúcar | 砂糖がある | que tem açúcar |
| SWEET — HAVE `many` SUGAR | that has much sugar | che ha molto zucchero | qui a beaucoup de sucre | das viel Zucker hat | que tiene mucho azúcar | 多くの砂糖がある | que tem muito açúcar |
| SWEET — INCLUDE SUGAR | that includes sugar | che include zucchero | qui inclut du sucre | das Zucker umfasst | que incluye azúcar | 砂糖を含む | que inclui açúcar |
| SOLID — `subjectGapGloss(SUBSTANCE, FLOW, negative)` **(shipped)** | that does not flow | che non scorre | qui ne coule pas | der nicht fließt | que no fluye | 流れない | que não flui |
| SOLID — BE LIQUID, negated | that is not liquid | che non è liquido | qui n'est pas liquide | der keine Flüssigkeit ist | que no es líquido | 液体ではない | que não é líquido |
| SOLID — CUT, modal CAN | that one can cut | che si può tagliare | qu'on peut couper | den man schneiden kann | que se puede cortar | 切ることができる | que se pode cortar |
| WARM — `dimGloss(KINDNESS, GREAT)` **(shipped)** | of great kindness | di grande gentilezza | de grande gentillesse | von großer Freundlichkeit | de amabilidad grande | 優しさが大きい | de gentileza grande |
| WARM — `dimGloss(KINDNESS, HIGH)` | of high kindness | di gentilezza alta | de gentillesse haute | von hoher Freundlichkeit | de amabilidad alta | 優しさが高い | de gentileza alta |
| WARM — `dimGloss(AFFECTION, HIGH)`, the B54 draft | of high affection | di affetto alto | d'affection haute | von hoher Zuneigung | de afecto alto | 愛情が高い | de afeto alto |

- **SWEET** on SUGAR, its description's own word. *Much* is stiff in English and 多くの砂糖がある reads
  as a quantity, not a taste; INCLUDE is *include* and *umfasst*, a list's containing.
- **SOLID** is what neither a liquid nor a gas does. "Not liquid" is true of GAS (and is a noun in
  German, *keine Flüssigkeit*); "that one can cut" is a test, not a meaning. FLOW was seeded.
- **WARM** on KINDNESS (seeded), not AFFECTION, which is "a warm feeling". GREAT, not the HIGH the
  other quality nouns take: *di grande gentilezza*, *de grande gentillesse* and *von großer
  Freundlichkeit* are how the three say it; *of high kindness* is no one's.

### The scales: NEAR, FAR, GREAT, LOW

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| NEAR — `dimGloss(DISTANCE, SMALL)` **(shipped)** | at small distance | a piccola distanza | à petite distance | bei kleiner Entfernung | a distancia pequeña | 距離が小さい | a distância pequena |
| FAR — `dimGloss(DISTANCE, GREAT)` **(shipped)** | at great distance | a grande distanza | à grande distance | bei großer Entfernung | a distancia grande | 距離が大きい | a distância grande |
| NEAR — `dimGloss(DISTANCE, LOW)` | at low distance | a distanza bassa | à distance basse | bei niedriger Entfernung | a distancia baja | 距離が低い | a distância baixa |
| NEAR — DISTANCE as `extent`, SMALL | of small distance | di piccola distanza | de petite distance | von kleiner Entfernung | de distancia pequeña | 距離が小さい | de distância pequena |
| GREAT — `dimGloss(LEVEL, GREAT)` | of great level | di grande livello | de grand niveau | von großer Ebene | de nivel grande | 段階が大きい | de nível grande |
| LOW — `dimGloss(LEVEL, LOW)` | of low level | di livello basso | de niveau bas | von niedriger Ebene | de nivel bajo | 段階が低い | de nível baixo |

- **NEAR and FAR** are the one pair here that *is* a scale, on DISTANCE (seeded, `measure` like
  TEMPERATURE: "at …"). The low pole is SMALL, not LOW: "at low distance" and *a distanza bassa* say
  a height. SMALL is not circular here as it was for SMALL's own gloss (A28). Japanese 距離が近い /
  遠い would be the idiom, and they are NEAR and FAR themselves.
- **GREAT and LOW are literal by design**, as C24 said and the ruling confirms: `dimGloss` is built
  out of them (BIG is `dimGloss('SIZE', 'GREAT')`), so any scale says the degree with itself — "of
  great level" defines GREAT by GREAT.

### The primitives: OTHER, OPPOSITE, SOLE, MANIFOLD

**All four are literal by design.** Each is a relation the definition language uses rather than
states — OTHER stands in eight shipped glosses (ALIAS, MODIFIER, HYPERNYM, TRANSLATE, COPY, ADD,
GO, AGAIN) and ten UI strings, OPPOSITE in BACKWARDS, SOLE and MANIFOLD in SINGULAR_GRAMMAR and PLURAL_GRAMMAR — and every
gloss the corpus can compose either restates it or says something else.

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| OTHER — NAME, negated | that one has not named | che non si è nominato | qu'on n'a pas nommé | den man nicht benannt hat | que no se ha nombrado | 名付けていない | que não se nomeou |
| OPPOSITE — GO in the OTHER DIRECTION_SPACE | that goes in the other direction | che va nell'altra direzione | qui va dans l'autre direction | der in der anderen Richtung geht | que va en la otra dirección | 別の方向で行く | que vai na outra direção |
| OPPOSITE — BE FAR, `most` | that is farthest | che è il più lontano | qui est le plus lointain | der am fernsten ist | que está el más lejano | 最も遠い | que está o mais distante |
| SOLE — ACCOMPANY, agent `no` OTHER OBJECT_THING | that no other object accompanies | che nessun altro oggetto accompagna | qu'aucun autre objet n'accompagne | den kein anderer Gegenstand begleitet | que ningún otro objeto acompaña | どの別の物体も同行しない | que nenhum outro objeto acompanha |
| SOLE — HAVE `no` COMPANION | that has no companion | che non ha nessun compagno | qui n'a aucun compagnon | der keinen Begleiter hat | que no tiene a ningún compañero | どの同伴者もない | que não tem nenhum companheiro |
| MANIFOLD — HAVE `many` PART plural | that has many parts | che ha molte parti | qui a beaucoup de parties | der viele Teile hat | que tiene muchas partes | 多くの部分がある | que tem muitas partes |

- **OTHER**, "different from the one already named": "not named" is UNTITLED's sense, *unnamed*.
- **OPPOSITE**: the other direction is 別の, a *different* one (C25 met it), and "farthest" is FAR's
  superlative, with Spanish *está el más lejano*.
- **SOLE** is *the only one*, not *alone*: both leads say unaccompanied, and Japanese どの…も…ない
  reads "not any object at all". **MANIFOLD** "that has many parts" is *composite*, not *more than
  one*, and de *mehrfach* and ja 複数の are the second. Both are the numbers one and many, which the
  corpus has no cardinal for.

### The order words: FIRST, SECOND, THIRD, NEXT, PREVIOUS

PRECEDE and FOLLOW (B55's forms) were seeded **intransitive**, as B55 proposed, and they buy NEXT
and PREVIOUS. The three ordinals come apart only with FOLLOW taking an object, and that is one
engine gap away.

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| NEXT — `subjectGapGloss(OBJECT_THING, FOLLOW)` **(shipped)** | that follows | che segue | qui suit | der folgt | que sigue | 続く | que segue |
| PREVIOUS — `subjectGapGloss(OBJECT_THING, PRECEDE)` **(shipped)** | that precedes | che precede | qui précède | der vorangeht | que precede | 先行する | que precede |
| FIRST — FOLLOW\* (transitive), agent `all` OTHER OBJECT_THING plural | that all other objects follow | che tutti gli altri oggetti seguono | que tous les autres objets suivent | auf den alle anderen Gegenstände folgen | al que todos los otros objetos siguen | すべての別の物体が続く | que todos os outros objetos seguem |
| SECOND — FOLLOW\* (transitive) the FIRST OBJECT_THING | that follows the first object | che segue il primo oggetto | qui suit le premier objet | der auf den ersten Gegenstand folgt | que sigue al primer objeto | 第一の物体を続く | que segue o primeiro objeto |
| THIRD — FOLLOW\* (transitive) the SECOND OBJECT_THING | that follows the second object | che segue il secondo oggetto | qui suit le deuxième objet | der auf den zweiten Gegenstand folgt | que sigue al segundo objeto | 第二の物体を続く | que segue o segundo objeto |
| a clause: the cat FOLLOW\*s the dog | the cat follows the dog | il gatto segue il cane | le chat suit le chien | der Kater folgt auf den Hund | el gato sigue al perro | 猫は犬を続きます | o gato segue o cão |

(The four FOLLOW\* rows are FOLLOW probed as a transitive verb with German `object_prep: 'auf'` —
*folgen auf* + accusative is the sequence sense — and Spanish `object_prep: 'a'`.)

- **NEXT and PREVIOUS** are the dictionaries' own glosses in the languages that derive the adjective
  from the verb (fr *suivant* "qui suit", it *precedente* "che precede", es *siguiente* "que sigue"),
  as the ruling allowed; in English, German and Japanese they are not cognate.
- **FIRST, SECOND and THIRD were blocked here, on Japanese's object particle** — built in the integration pass, the lead named below. With FOLLOW
  transitive, FIRST — "that all other objects follow" — renders in all seven, because its object is
  the gap and Japanese says no particle; and SECOND and THIRD — "that follows the first object",
  "…the second object", each ordinal on its predecessor, never on itself — render in six. Japanese
  marks what 続く follows with に, and the engine writes を for every direct object
  ([predicateSegs.ts:57](../../../packages/engine/src/languages/ja/predicateSegs.ts)): 第一の物体を続く,
  and in any clause the builder makes, 猫は犬を続きます for 猫は犬に続きます. Seeding FOLLOW transitive
  today would ship that sentence, so it was seeded intransitive and FIRST waits with the other two.
  **What it would take:** a lexical Japanese object particle, `object_particle: 'に'`, read where
  `locative_particle` already is (predicateSegs.ts:81); then FOLLOW becomes transitive and all three
  ordinals ship as probed. Counting positions instead ("that two objects precede") would need the
  cardinal TWO and PRECEDE's German dative object, neither of which the corpus has.
- SEQUENCE was not needed and is not seeded.

### The time words: PRESENT, PAST, FUTURE

**They differ by HAPPEN's tense and aspect alone** — a present with NOW, a resultative, a future —
which is what the three words mean, and none restates its word or routes through the tense nouns
([B58](../done/B58-tense-and-number-values.md)'s PRESENT_TENSE and the rest) that stand on them.
PROCESS is masculine in every language that agrees, so Italian and French read *è successo* / *est
arrivé*, "what has happened"; ACTION, the other candidate, makes it *è successa* / *est arrivée* and
German *die*.

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| PRESENT — `subjectGapGloss(PROCESS, HAPPEN, NOW)` **(shipped)** | that happens now | che succede ora | qui arrive maintenant | der jetzt geschieht | que ocurre ahora | 今起こる | que acontece agora |
| PAST — `subjectGapGloss(PROCESS, HAPPEN, resultative)` **(shipped)** | that has happened | che è successo | qui est arrivé | der geschehen ist | que ha ocurrido | 起こった | que aconteceu |
| FUTURE — `subjectGapGloss(PROCESS, HAPPEN, future)` **(shipped)** | that will happen | che succederà | qui arrivera | der geschehen wird | que ocurrirá | 起こる | que acontecerá |
| PRESENT — progressive, NOW | that is happening now | che sta succedendo ora | qui est en train d'arriver maintenant | der gerade jetzt geschieht | que está ocurriendo ahora | 今起こっている | que está acontecendo agora |
| PAST — resultative, ALREADY | that has already happened | che è già successo | qui est déjà arrivé | der schon geschehen ist | que ha ocurrido ya | もう起こった | que aconteceu já |
| PAST — past tense | that happened | che successe | qui arriva | der geschah | que ocurrió | 起こった | que aconteceu |
| PAST — resultative, on ACTION | that has happened | che è successa | qui est arrivée | die geschehen ist | que ha ocurrido | 起こった | que aconteceu |

The progressive is French's *en train de*; ALREADY trails in Spanish and Portuguese (*ha ocurrido
ya*, *aconteceu já*); the simple past is Italian's and French's literary tense (*successe*,
*arriva*). HAPPEN is Spanish *ocurrir*, not *pasar* (PAST's own *pasado*), and French *arriver*.

### The words

**Fifteen seeded**, each for a gloss above, each pinned in
[relational-adjectives.test.ts](../../../packages/engine/test/relational-adjectives.test.ts).

| id | role | en | it | fr | de | es | ja | pt | for |
|---|---|---|---|---|---|---|---|---|---|
| TESTICLE | noun, isA ORGAN | testicle / testicles | testicolo / testicoli (m) | testicule / testicules (m) | Hoden / Hoden (m) | testículo / testículos (m) | 精巣 (せいそう) | testículo / testículos (m) | MALE, CASTRATED |
| OVARY | noun, isA ORGAN | ovary / ovaries | ovaia / ovaie (f) | ovaire / ovaires (m) | Eierstock / Eierstöcke (m) | ovario / ovarios (m) | 卵巣 (らんそう) | ovário / ovários (m) | FEMALE |
| SHAPE | noun | shape / shapes | forma / forme (f) | forme / formes (f) | Form / Formen (f) | forma / formas (f) | 形 (かたち) | forma / formas (f) | ROUND |
| CIRCLE | noun, isA SHAPE | circle / circles | cerchio / cerchi (m) | cercle / cercles (m) | Kreis / Kreise (m) | círculo / círculos (m) | 円 (えん) | círculo / círculos (m) | ROUND |
| DISTANCE | noun, `measure` | distance / distances | distanza / distanze (f) | distance / distances (f) | Entfernung / Entfernungen (f) | distancia / distancias (f) | 距離 (きょり) | distância / distâncias (f) | NEAR, FAR |
| SUGAR | noun, mass, isA FOOD | sugar | zucchero (m) | sucre (m) | Zucker (m) | azúcar (m) | 砂糖 (さとう) | açúcar (m) | SWEET |
| KINDNESS | noun, mass, `quality` | kindness | gentilezza (f) | gentillesse (f) | Freundlichkeit (f) | amabilidad (f) | 優しさ (やさしさ) | gentileza (f) | WARM |
| PRECEDE | verb, intransitive | precede | precedere | précéder | vorangehen (sein) | preceder | 先行する | preceder | PREVIOUS |
| FOLLOW | verb, intransitive | follow | seguire | suivre | folgen (sein) | seguir | 続く | seguir | NEXT |
| HAPPEN | verb, intransitive | happen | succedere (essere) | arriver (être) | geschehen (sein) | ocurrir | 起こる | acontecer | PRESENT, PAST, FUTURE |
| GROW | verb, intransitive | grow | crescere (essere) | grandir | wachsen (sein) | crecer | 成長する | crescer | ADULT |
| FLOW | verb, intransitive | flow | scorrere (essere) | couler | fließen (sein) | fluir | 流れる | fluir | SOLID |
| TAME | verb, transitive | tame | domare | apprivoiser | zähmen | domar | 飼い慣らす | domar | WILD |
| RECENTLY | adverb | recently | di recente | récemment | kürzlich | recientemente | 最近 (さいきん) | recentemente | NEW |
| NO_LONGER | adverb, negative polarity | no longer | (non …) più | (ne …) plus | nicht mehr | ya no | もう (〜ない) | já não | ADULT |

Of B54's six proposed words, **TESTICLE, SHAPE and CIRCLE** were seeded; B55's PRECEDE and FOLLOW
were seeded, SEQUENCE was not. None of the fifteen has a gloss of its own; each is a root or a
differentia.

**Proposed and not seeded**, forms kept for a later author:

| id | role | en | it | fr | de | es | ja | pt | why not |
|---|---|---|---|---|---|---|---|---|---|
| COLOUR | noun | colour / colours | colore / colori (m) | couleur / couleurs (f) | Farbe / Farben (f) | color / colores (m) | 色 (いろ) | cor / cores (f) | BROWN is literal by design |
| NATURE | noun, mass | nature | natura (f) | nature (f) | Natur (f) | naturaleza (f) | 自然 (しぜん) | natureza (f) | WILD's "in nature" reads "in the nature" in English |
| SEX | noun | sex | sesso | sexe | Geschlecht | sexo | 性 | sexo | the sexes are glossed by organ; "of the male sex" is circular |
| SEQUENCE | noun | sequence | sequenza | séquence | Reihenfolge | secuencia | 順序 | sequência | no gloss uses it (B55's forms) |
| EDGE | noun | edge / edges | filo (m) / bordo (m) | fil (m) / bord (m) | Schneide (f) / Kante (f) | filo (m) / borde (m) | 刃先 / 縁 | fio (m) / borda (f) | SHARP's "whose edge is thin" reads "thread" or "rim" |
| THIN | adjective | thin | sottile | fin | dünn | fino | 薄い (うすい) | fino | the same |
| COMPLETELY | adverb | fully | completamente | complètement | vollständig | completamente | 完全に | completamente | ADULT took NO_LONGER |

### Engine defects and gaps found

The orchestrator files these; none is worked around in the engine.

1. **French does not elide before an h muet verb.** LIVE is *habiter*, and French writes "je habite"
   for *j'habite*, "je ne habite pas" and "l'homme ne habite pas dans la maison" for *n'habite pas*,
   and in a relative "qui ne habite pas avec des personnes" for *qui n'habite pas*. The elisions test
   the verb's first letter (`VOWEL_START`, [fr.consts.ts:34](../../../packages/engine/src/languages/fr/fr.consts.ts);
   [predicateText.ts:110](../../../packages/engine/src/languages/fr/predicateText.ts),
   [joinSubject.ts:10](../../../packages/engine/src/languages/fr/joinSubject.ts)), and a verb has no
   `elides` flag of the kind a noun has ([elidesBefore.ts](../../../packages/engine/src/languages/fr/elidesBefore.ts)).
   It blocked WILD's free gloss, "that does not live with people".
2. **Japanese has no lexical object particle.** Every direct object takes を (が for the possessive
   existential), where 続く takes に: 猫は犬を続きます for 猫は犬に続きます. It is why FOLLOW is intransitive
   and FIRST, SECOND and THIRD are blocked (see the order words).
3. **English has no bare generic for a mass noun the others article.** NATURE as a definite locative
   is "in the nature" (it *nella natura*, fr *dans la nature*, de *in der Natur* are right); only a
   `proper` noun drops the English article, and NATURE is not one.
4. **Italian's animate source relativizer is "via dal quale"** where a relative wants *dal quale*
   (CASTRATED on ANIMAL). Avoided by BEING, which is not animate.

### Coverage

[relational-adjectives.test.ts](../../../packages/engine/test/relational-adjectives.test.ts) pins the
twenty glosses in all seven, that every family comes apart in every language, that the nine
literal-by-design concepts have no gloss, and the fifteen words' paradigms (the verbs' Italian
auxiliaries and agreement there too, rather than in verb.test.ts's shared table). One test in
[e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts): WILD in English and
German (*das nicht gezähmt worden ist*, BEING's neuter) and ROUND in German (*dessen Form ein Kreis
ist*).

## FIRST, SECOND, THIRD, CONDITIONAL and SHARP, in the integration pass

The two lanes left five adjectives blocked, each on something they could name and neither could
build without editing the engine: the ordinals on Japanese's object particle, CONDITIONAL on a verb
whose object takes its own preposition, SHARP on CUT's gloss. All five shipped when the batch's
branches were merged.

**The ordinals and CONDITIONAL are what follows which and what another clause depends on**, and
both verbs govern their object in a way the engine only half spoke. [A139](../../bugs/fixed/A139-click-prepositional-object.md)
gave five languages a verb's lexical preposition (`object_prep`: "clicca sul pulsante"); the pass
finished it:

- **Japanese** reads a lexical object particle, `object_particle`, where it wrote を for every
  object ([predicateSegs.ts](../../../packages/engine/src/languages/ja/predicateSegs.ts)): 続く and
  依存する take に (猫は犬に続きます, 節は条件に依存しています).
- **English** takes A139's `object_prep` at all ([predicateParts.ts](../../../packages/engine/src/languages/en/predicateParts.ts)):
  "depends on the condition", and an object relative pied-pipes it
  ([relativeText.ts](../../../packages/engine/src/languages/en/relativeText.ts)), "on which another
  clause depends", never stranding a preposition a complement would then read as its own.
- **German** keeps a dative-only preposition's dative for an object and for its relative pronoun
  ([objectPrepCase.ts](../../../packages/engine/src/languages/de/objectPrepCase.ts)): "hängt von der
  Bedingung ab", "von dem", and a pronoun in its dative form, "von ihr".
- **French** relativises a de-object as *dont*, and elides *de* before a tonic pronoun ("dépend
  d'elle").
- **Spanish** gets a verb-wide personal *a*, `object_a`: seguir marks every determined object ("sigue
  al primer objeto") and keeps the clitic for a pronoun ("lo sigue"), where A139's preposition would
  have blocked it ("*sigue a él*").

On those, FOLLOW became transitive (it was seeded intransitive by this file's relational lane for
that reason) and **DEPEND** was seeded, in all seven, with its preposition: en *on*, it *da*
(*dipendere* selects *essere*), fr/es/pt *de*, de *von* (*abhängen*, separable and strong), ja に.

| concept | plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| FIRST | `namedAgentGloss('OBJECT_THING', 'FOLLOW', all OTHER OBJECT_THING plural)` | that all other objects follow | che tutti gli altri oggetti seguono | que tous les autres objets suivent | auf den alle anderen Gegenstände folgen | que todos los otros objetos siguen | すべての別の物体が続く | que todos os outros objetos seguem |
| SECOND | `subjectGapGloss('OBJECT_THING', 'FOLLOW', the FIRST OBJECT_THING)` | that follows the first object | che segue il primo oggetto | qui suit le premier objet | der auf den ersten Gegenstand folgt | que sigue al primer objeto | 第一の物体に続く | que segue o primeiro objeto |
| THIRD | `subjectGapGloss('OBJECT_THING', 'FOLLOW', the SECOND OBJECT_THING)` | that follows the second object | che segue il secondo oggetto | qui suit le deuxième objet | der auf den zweiten Gegenstand folgt | que sigue al segundo objeto | 第二の物体に続く | que segue o segundo objeto |
| CONDITIONAL | `namedAgentGloss('CLAUSE', 'DEPEND', OTHER CLAUSE)` | on which another clause depends | dalla quale un'altra proposizione dipende | dont une autre proposition dépend | von dem ein anderer Satz abhängt | de la que otra oración depende | 別の節が依存する | da qual outra oração depende |
| SHARP | `subjectGapGloss('OBJECT_THING', 'CUT', { modifier: 'WELL' })` | that cuts well | che taglia bene | qui coupe bien | der gut schneidet | que corta bien | よく切る | que corta bem |

**SHARP took the lead its lane named first**: CUT was [B13](B13-contact-verbs.md)'s "to divide with a
sharp blade", so "that cuts well" would have defined each by the other. CUT is now "to divide with a
blade" (B13's file records the re-authoring), the blade being what cuts, and SHARP is what cuts
well. The edge-noun lead ("whose edge is thin") is not needed.

## Done (2026-09-22)

**Fifty-eight glosses** in [adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts), on the
headless relative clause and, for five of them, the prepositional objects above; **seventeen words
seeded** across the two lanes and the pass (KNOWN; TESTICLE, OVARY, SHAPE, CIRCLE, DISTANCE, SUGAR,
KINDNESS, PRECEDE, FOLLOW, HAPPEN, GROW, FLOW, TAME, RECENTLY, NO_LONGER; DEPEND) — each seeded for a
gloss in this file, none glossed itself. Every family's members come apart in every language, and
no gloss is another definition's in any one language
([sweep-definitions.test.ts](../../../packages/engine/test/sweep-definitions.test.ts), no new
allowance). The glosses are pinned in
[grammar-feature-adjectives.test.ts](../../../packages/engine/test/grammar-feature-adjectives.test.ts),
[relational-adjectives.test.ts](../../../packages/engine/test/relational-adjectives.test.ts) and
[prepositional-objects.test.ts](../../../packages/engine/test/prepositional-objects.test.ts), and in
[e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) (PASSIVE, WILD, ROUND).

What landed differently from the plan:

1. **One construct, not three.** The file named membership, a headless relative and negated
   membership; the headless relative covered all three, because what a value *does* or *has* tells
   it from its siblings where *of which class* restates the class.
2. **The count was sixty-seven and is sixty-eight**: OPPOSITE, seeded by C25 the same day, is here.
   And **ten are literal by design, not the two the file set aside** (GREAT, LOW): NEGATIVE, which
   would define itself through NEGATE or POSITIVE, and seven of the relational lane's — OTHER,
   OPPOSITE, SOLE, MANIFOLD (primitives of the definition language), BROWN (the only colour word,
   and no exemplar the corpus has works), CANINE (a cycle through DOG and WOLF) and BEAUTIFUL (its
   one non-cognate lead, "that one sees with joy", is true of a friend coming home).
3. **ADULT and WARM shipped**, which the file had moved here as circular on AGE and AFFECTION:
   ADULT on a growing verb ("that no longer grows"), WARM on a seeded KINDNESS ("of great kindness").
4. **NEW came apart from YOUNG on what it is said of**, as its entry predicted: a thing is made,
   not born — "that has been made recently".
5. **SHARP and WHOLE did not need the part-whole relation** the file tied them to; WHOLE is "that
   has not been divided", and SHARP is what cuts well once CUT was re-glossed.
6. **B54's six words were not all needed.** TESTICLE, SHAPE and CIRCLE were seeded; COLOUR, NATURE
   and SEX were not (their forms are kept in B54's file), and OVARY was, for FEMALE.
7. **The five this file ended on needed engine work after all** — not the adjective construct, but
   two verbs' objects: a Japanese object particle, English prepositional objects, and a German
   dative, a French *dont* and a Spanish verb-wide *a* for the same verbs.
