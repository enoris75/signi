# C27. The grammar meta-nouns — a position in a system, said by what it does

**Kind:** was blocked on constructs, or judged non-distinguishing. Sixteen nouns told apart by
*where they sit in a system* — which participant a clause makes its subject, who an imperative
addresses, which part of a screen a region is. **Every one now has a verdict** (2026-09-22): the
seven parts of a surface shipped on the part-whole relation, four of the nine grammar nouns shipped
on shapes the engine already had or gained this week, and five are literal by design, their leads
probed below.

_(from the unsorted sweep of 2026-09-22. [A30](../done/A30-grammar-features.md) took eleven
grammar nouns that did turn out to have a property — what a feature indicates — and
[A27](../done/A27-grammar-participants-and-clause-types.md) five more. These fifteen were what was
left after both, and MOOD came back from A30 on authoring.)_

## The concepts

**Grammar (5).** PARTICIPANT_GRAMMAR, STATEMENT, ARTICLE, PERIOD_PUNCTUATION, MOOD.

**The imperative's addressee (4).** COMMAND, ORDER, INSTRUCTION, REGISTER.

**Parts of a surface (7).** KEY, ARROW, ROW, REGION, TAB, WORKSPACE, NAVIGATION.

## What moved them

| construct | was to take | outcome |
|---|---|---|
| a headless relative clause ([C23](C23-participial-state-adjectives.md)'s, built as `NounPhrase.relativeGloss`) | STATEMENT, PARTICIPANT_GRAMMAR | not needed: a noun keeps its head. Both shipped on a *headed* relative — a named agent, and a seeded verb |
| [C24](C24-grammar-feature-adjectives.md) shipping DEFINITE and PROXIMAL | ARTICLE | they shipped, and ARTICLE did not follow: **literal by design**, see below |
| a noun gloss naming a dimension with no degree | REGISTER | it existed: a **noun modifier** on LEVEL ("a formality level"), on the seeded FORMALITY |
| part-whole complement (`NounPhrase.possessorRole`) | KEY, ARROW, ROW, REGION, TAB, WORKSPACE | built and shipped — [The seven parts of a surface](#the-seven-parts-of-a-surface) |
| an action noun from a verb | NAVIGATION | not needed: a `whoGloss` on ACTION |
| nothing — literal by design | PERIOD_PUNCTUATION, COMMAND, ORDER, INSTRUCTION | kept, re-probed with the new shapes |
| — | MOOD | shipped on a genitive object: what the speaker says the clause *for* |

## The grammar nouns — verdicts

Probed 2026-09-22 against the engine source at HEAD (aff5d5b), the lexicon seeded in memory with
this ticket's three words. **Bold** rows are shipped.

### PARTICIPANT_GRAMMAR — shipped: "a concept that an action includes"

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **`patientOfGloss('CONCEPT', 'INCLUDE', 'ACTION')`** | a concept that an action includes | un concetto che un'azione include | un concept qu'une action inclut | ein Begriff, den eine Handlung umfasst | un concepto que una acción incluye | 動作が含む概念 | um conceito que uma ação inclui |
| draft: BEING, the same clause | a being that an action includes | un essere che un'azione include | un être qu'une action inclut | ein Wesen, das eine Handlung umfasst | un ser que una acción incluye | 動作が含む存在 | um ser que uma ação inclui |
| draft (the sweep's): `patientGloss('CONCEPT', 'INCLUDE')` | a concept that one includes | un concetto che si include | un concept qu'on inclut | ein Begriff, den man umfasst | un concepto que se incluye | 含む概念 | um conceito que se inclui |

"One of the entities an event involves." The sweep's plan said nothing about an event because its
agent was the generic "one"; with the action as the named agent (A27's `patientOfGloss`, OBJECT_GRAMMAR's
shape) it says exactly that. BEING is the better genus in six languages and ambiguous in German: *das
eine Handlung umfasst* has a neuter relative and a feminine object, both nominative or accusative, so it
reads first as the being including the action. *Begriff* is masculine, and "den" settles it. CONCEPT
is the corpus's genus for a thing thought rather than held (OPTION, RESULT, VALUE). Its children
AGENT_GRAMMAR, SUBJECT_GRAMMAR and OBJECT_GRAMMAR, and VOICE's object, are not used by it.

### STATEMENT — shipped: "a clause that asserts facts"

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **`whoGloss('CLAUSE', 'ASSERT', 'FACT')`** | a clause that asserts facts | una proposizione che afferma fatti | une proposition qui affirme des faits | ein Satz, der Tatsachen feststellt | una oración que afirma hechos | 事実を述べる節 | uma oração que afirma fatos |
| draft: ASSERT alone | a clause that asserts | una proposizione che afferma | une proposition qui affirme | ein Satz, der feststellt | una oración que afirma | 述べる節 | uma oração que afirma |
| draft (the sweep's): EXPRESS MEANING | a clause that expresses meanings | una proposizione che esprime significati | une proposition qui exprime des sens | ein Satz, der Bedeutungen vermittelt | una oración que expresa significados | 意味を表す節 | uma oração que exprime significados |
| draft: not a command | a clause that is not a command | una proposizione che non è un comando | une proposition qui n'est pas une commande | ein Satz, der kein Befehl ist | una oración que no es un comando | 命令ではない節 | uma oração que não é um comando |
| draft: one can negate it | a clause that one can negate | una proposizione che si può negare | une proposition qu'on peut nier | ein Satz, den man verneinen kann | una oración que se puede negar | 否定することができる節 | uma oração que se pode negar |

What a statement does and a command does not is **assert**, and no seeded verb said it: every clause
expresses a meaning, a relative clause and a condition are also "not a command", and a command can be
negated. The school grammars define the declarative sentence as the one that asserts a fact, in
all seven traditions, so this ticket **seeded ASSERT and FACT** and the gloss says exactly that
(it "una proposizione che afferma fatti", ja 事実を述べる節). English takes *assert*, not *state*, and German *feststellen*, not *aussagen*: those are
*statement*'s and *Aussagesatz*'s own words. An object is needed because German's verbs of asserting
are transitive (*ein Satz, der feststellt* stops short). A statement can be false, which *facts*
does not allow for; the school grammars accept that, and so does this gloss. It is not RELATIVE_CLAUSE's
"a clause that describes nouns", CONDITION's "a conditional clause" or CLAUSE's "a phrase that has a
subject".

### MOOD — shipped: "a feature that indicates the speaker's purpose"

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **FEATURE + INDICATE the definite PURPOSE of the definite SPEAKER** | a feature that indicates the speaker's purpose | una caratteristica che indica lo scopo del parlante | une caractéristique qui indique le but du locuteur | ein Merkmal, das den Zweck des Sprechers bezeichnet | una característica que indica la finalidad del hablante | 話し手の目的を示す特徴 | uma característica que indica a finalidade do falante |
| draft (A30's): indicates conditions | a feature that indicates conditions | una caratteristica che indica condizioni | une caractéristique qui indique des conditions | ein Merkmal, das Bedingungen bezeichnet | una característica que indica condiciones | 条件を示す特徴 | uma característica que indica condições |
| draft: statements or commands | a feature that indicates statements or commands | una caratteristica che indica proposizioni enunciative o comandi | une caractéristique qui indique des phrases déclaratives ou des commandes | ein Merkmal, das Aussagesätze oder Befehle bezeichnet | una característica que indica oraciones enunciativas o comandos | 平叙文か命令を示す特徴 | uma característica que indica frases declarativas ou comandos |

"How a clause is meant" is what the speaker says it *for* — to assert, to command, to cite (the
console's `/statement`, `/command`, `/inf`). That is a PURPOSE, and it has an owner: the SPEAKER
[B57](../done/B57-ui-nouns-needing-a-word.md) glossed, a genitive object inside the relative. The
file had filed MOOD as a position in a system; it is a property of the utterance. A30's "indicates conditions" named CONDITION, its
neighbour in the picker, and missed three of the four moods; listing the values names two unglossed
nouns. The features beside it indicate times, periods, participants, levels and feelings, and
PERSON_GRAMMAR indicates speakers — none a purpose.

### REGISTER — shipped: "a formality level"

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **LEVEL, `indefinite`, noun modifier FORMALITY (`material`)** | a formality level | un livello di formalità | un niveau de formalité | eine Förmlichkeitsebene | un nivel de formalidad | 丁寧さの段階 | um nível de formalidade |
| draft: LEVEL with FORMALITY as a possessor | formality's level | un livello di formalità | un niveau de formalité | eine Ebene von Förmlichkeit | un nivel de formalidad | 丁寧さの段階 | um nível de formalidade |
| draft: a way in which one speaks | a way in which one speaks | un modo nel quale si parla | une manière de laquelle on parle | eine Weise, auf die man spricht | una manera de la que se habla | 話す方法 | uma maneira da qual se fala |

This file said REGISTER needed "a noun gloss that names a dimension without a degree", shape 1 of
C24. The engine had one: a **noun modifier** — "*semantic phrase* creator" — says the dimension
attributively, with no degree, in every language: an English and a German compound (the *-s-* after
*-keit*), the Romance *di / de*, the Japanese の. The possessor says it backwards in English; "a way in
which one speaks" is every way of speaking. This ticket **seeded FORMALITY**, the dimension B57
proposed and dropped, as a mass noun and a `quality` dimension like ATTENTION, so a later FORMAL can
be `dimGloss('FORMALITY', 'HIGH')` — *of high formality*. German *Förmlichkeit*, since *Formalität* is
also the paperwork; Japanese 丁寧さ, the politeness a Japanese register is graded by. DEGREE_GRAMMAR's
"a feature that indicates levels" sits one row away and does not collide.

### ARTICLE — literal by design

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| lead: known or unknown objects | a determiner that indicates known objects or unknown objects | un determinante che indica oggetti noti o oggetti sconosciuti | un déterminant qui indique des objets connus ou des objets inconnus | ein Determinativ, das bekannte Gegenstände oder unbekannte Gegenstände bezeichnet | un determinante que indica objetos conocidos u objetos desconocidos | 既知の物体か不明な物体を示す限定詞 | um determinante que indica objetos conhecidos ou objetos desconhecidos |
| lead: definite or indefinite | a determiner that is definite or indefinite | un determinante che è determinativo o indeterminativo | un déterminant qui est défini ou indéfini | ein Determinativ, das bestimmt oder unbestimmt ist | un determinante que es definido o indefinido | 定冠詞か不定冠詞の限定詞 | um determinante que é definido ou indefinido |
| lead: does not indicate places | a determiner that does not indicate places | un determinante che non indica luoghi | un déterminant qui n'indique pas de lieux | ein Determinativ, das keine Orte bezeichnet | un determinante que no indica lugares | 場所を示さない限定詞 | um determinante que não indica lugares |
| the sweep's: indicates categories | a determiner that indicates categories | un determinante che indica categorie | un déterminant qui indique des catégories | ein Determinativ, das Kategorien bezeichnet | un determinante que indica categorías | 範疇を示す限定詞 | um determinante que indica categorias |

This file said ARTICLE unblocks when DEFINITE and PROXIMAL do. They shipped in C24 — DEFINITE
"that indicates a known object", PROXIMAL "that indicates a near object" — and every gloss built on
them is true of the demonstrative too. A demonstrative indicates a known object (the model calls
deixis *identifiability by pointing*), so "known or unknown objects" fits both, and so does
"definite", which *this* and *that* are; in Japanese that lead is also circular, since the adjectives
are 定冠詞の and 不定冠詞の and the noun is 冠詞. What an article has that its siblings lack is
**nothing else**: it marks identifiability without pointing or counting, and the only way to say it
is by listing what it does not do — "does not indicate places" is equally true of the quantifier.
DEMONSTRATIVE ("a determiner that indicates") and QUANTIFIER ("… that indicates quantities") are the
two it is told from, and the menu's section heading does the telling.

### COMMAND, ORDER and INSTRUCTION — literal by design, kept

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| COMMAND, lead: a clause that a process accepts | a clause that a process accepts | una proposizione che un processo accetta | une proposition qu'un processus accepte | ein Satz, den ein Prozess akzeptiert | una oración que un proceso acepta | 過程が受け付ける節 | uma oração que um processo aceita |
| COMMAND, lead (B57's): a word that one accepts | a word that one accepts | una parola che si accetta | un mot qu'on accepte | ein Wort, das man akzeptiert | una palabra que se acepta | 受け付ける単語 | uma palavra que se aceita |
| ORDER, lead: a command that one gives to a person | a command that one gives to a person | un comando che si dà a una persona | une commande qu'on donne à une personne | ein Befehl, den man einer Person gibt | un comando que se da a una persona | 人にあげる命令 | um comando que se dá a uma pessoa |
| INSTRUCTION, lead: … gives to no person | a command that one gives to no person | un comando che non si dà a nessuna persona | une commande qu'on ne donne à aucune personne | ein Befehl, den man keiner Person gibt | un comando que no se da a ninguna persona | どの人にもあげない命令 | um comando que não se dá a nenhuma pessoa |
| INSTRUCTION, lead: … sends to no person | a command that one sends to no person | un comando che non si manda a nessuna persona | une commande qu'on n'envoie à aucune personne | ein Befehl, den man keiner Person schickt | un comando que no se envía a ninguna persona | どの人にも送らない命令 | um comando que não se envia a nenhuma pessoa |

The earlier verdict was that the addressee is a feature of the mood, not a phrase. A terminus *is*
a phrase, and the probes put it in the gloss — and the three still do not ship:

- **ORDER is COMMAND's own word in German and Japanese** (*Befehl*, 命令), so any gloss on COMMAND
  defines it with itself there, "ein Befehl, den man einer Person gibt". It has no other genus.
- **INSTRUCTION's addressee has no verb.** GIVE is Japanese あげる, a gift (どの人にもあげない命令), SEND
  sends it somewhere, and English says *nobody*, not "no person". A verb of addressing (*rivolgere
  a*, *richten an*, *s'adresser à*) takes a preposition of its own — the construct CONDITIONAL waits
  on in [C24](C24-grammar-feature-adjectives.md).
- **COMMAND** is both the imperative and the console's typed command: "a clause that a process
  accepts" is only the second, and "a word that one accepts" (B57's) is any input. Its description's
  genus, *an instruction*, is its own register.

### PERIOD_PUNCTUATION — literal by design, kept

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| lead: a word that closes periods | a word that closes periods | una parola che chiude periodi | un mot qui ferme des périodes | ein Wort, das Satzgefüge schließt | una palabra que cierra períodos | 文を閉じる単語 | uma palavra que fecha períodos |

[C05](../done/C05-non-distinguishing-genera.md) decided it: the sentence it ends is PERIOD_SENTENCE,
*period* in English, so the gloss says the word with itself; and a full stop is not a word, and no
seeded noun names a mark. Re-probed, not re-opened.

## The seven parts of a surface

All seven shipped on 2026-09-22, authored with [C26](C26-root-nouns-on-the-literal.md)'s part-whole
relation, `NounPhrase.possessorRole` (see C26's Done section for the construct and its probe
table). The relation was missing only in English, which wrote the whole as the Saxon clitic ("a
keyboard's part"); the other six already read a plain possessor as the whole. `partOfGloss(whole)`
in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts) is PART, indefinite, with the whole
as its possessor.

| concept | plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| KEY | `partOfGloss('KEYBOARD')` | a part of a keyboard | una parte di una tastiera | une partie d'un clavier | ein Teil einer Tastatur | una parte de un teclado | キーボードの部分 | uma parte de um teclado |
| ROW | `partOfGloss('LIST')` | a part of a list | una parte di un elenco | une partie d'une liste | ein Teil einer Liste | una parte de una lista | 一覧の部分 | uma parte de uma lista |
| REGION | `partOfGloss('SCREEN')` | a part of a screen | una parte di uno schermo | une partie d'un écran | ein Teil eines Bildschirms | una parte de una pantalla | 画面の部分 | uma parte de uma tela |
| WORKSPACE | GROUP indefinite, `possessorRole: 'parts'` CANVAS bare plural | a group of canvases | un gruppo di tele | un groupe de canevas | eine Gruppe von Arbeitsflächen | un grupo de lienzos | キャンバスのグループ | um grupo de telas |
| ARROW | KEY + relative MOVE, CURSOR definite | a key that moves the cursor | un tasto che sposta il cursore | une touche qui déplace le curseur | eine Taste, die den Cursor verschiebt | una tecla que mueve el cursor | カーソルを移動するキー | uma tecla que move o cursor |
| TAB | BUTTON + relative SHOW, REGION indefinite | a button that shows a region | un pulsante che mostra un'area | un bouton qui montre une zone | eine Taste, die einen Bereich zeigt | un botón que muestra una zona | 領域を見せるボタン | um botão que mostra uma área |
| NAVIGATION | ACTION + relative MOVE, CURSOR definite | an action that moves the cursor | un'azione che sposta il cursore | une action qui déplace le curseur | eine Handlung, die den Cursor verschiebt | una acción que mueve el cursor | カーソルを移動する動作 | uma ação que move o cursor |

What was probed and not shipped:

- **KEY as "a button of a keyboard"**: German *eine Taste einer Tastatur* defines Taste with itself
  (BUTTON and KEY are both *Taste*).
- **ARROW with a bare plural object**: "a key that moves cursors" — there is one cursor.
- **TAB**: [B57](../done/B57-ui-nouns-needing-a-word.md)'s `patientGloss('PART', 'SHOW')` is "a part
  that one shows"; "a part of a panel" needs PANEL (proposed in C26, not seeded); "a button that
  shows a part of a screen" renders, and is longer for nothing.
- **WORKSPACE as "a place where one makes periods"**: CANVAS's gloss with another object. The
  `'parts'` role is what tells them apart — the workspace is all the canvases at once.
- **NAVIGATION on B57's `patientGloss('ACTION', 'MOVE_ONESELF')`**: "an action that one moves", and
  ungrammatical in all seven (*un'azione che ci si muove*); the instrument gap gives "an action with
  which one moves". It needed no action-noun construct: what navigation moves is the cursor.
- **ROW as "a part of a group"**: true of anything.

Two notes for a later pass, neither a defect: B57's TOOLBAR is "a row that has buttons", and a
toolbar is not part of a list; and German TAB reads *eine Taste, die einen Bereich zeigt* (a key that
shows an area), the BUTTON/KEY homograph already documented at KEY.

## The words

Three seeded, each for one gloss in this file:

| id | role | en | it | fr | de | es | ja | pt | for |
|---|---|---|---|---|---|---|---|---|---|
| FORMALITY | noun, mass, `quality` dimension | formality | formalità (f) | formalité (f) | Förmlichkeit (f) | formalidad (f) | 丁寧さ (ていねいさ) | formalidade (f) | REGISTER |
| ASSERT | verb, transitive | assert | affermare | affirmer | feststellen (separable) | afirmar | 述べる (のべる) | afirmar | STATEMENT |
| FACT | noun | fact / facts | fatto / fatti (m) | fait / faits (m) | Tatsache / Tatsachen (f) | hecho / hechos (m) | 事実 (じじつ) | fato / fatos (m) | STATEMENT |

FORMALITY is in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts) beside REGISTER, FACT
beside MEANING, and ASSERT in
[transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts) beside NEGATE, its
non-finite forms in [nonfinite.ts](../../../packages/backend/src/concepts/verbs/nonfinite.ts) and its
Italian resultative in `verb.test.ts`'s table ("la gatta ha affermato"). None of the three has a gloss
of its own: FORMALITY and FACT are roots of [C26](C26-root-nouns-on-the-literal.md)'s kind, ASSERT one
of [C28](C28-verb-roots-without-a-gloss.md)'s.

## Coverage

[grammar-feature-adjectives.test.ts](../../../packages/engine/test/grammar-feature-adjectives.test.ts)
pins the four glosses in all seven languages, the three words' paradigms (ASSERT across persons,
tenses, aspects and the passive, German's separable particle), and that the five left on the literal
have no plan. [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) checks MOOD in
English beside C24's PASSIVE in English and German.

## Done

**Retired 2026-09-22.** Eleven of the sixteen shipped: the seven parts of a surface on C26's
part-whole relation ([above](#the-seven-parts-of-a-surface)), and the grammar half's **four
glosses** in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts), on **three words seeded**
and no engine change. ARTICLE, PERIOD_PUNCTUATION, COMMAND, ORDER and INSTRUCTION stay on the literal
by design, every lead probed.

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| PARTICIPANT_GRAMMAR | a concept that an action includes | un concetto che un'azione include | un concept qu'une action inclut | ein Begriff, den eine Handlung umfasst | un concepto que una acción incluye | 動作が含む概念 | um conceito que uma ação inclui |
| STATEMENT | a clause that asserts facts | una proposizione che afferma fatti | une proposition qui affirme des faits | ein Satz, der Tatsachen feststellt | una oración que afirma hechos | 事実を述べる節 | uma oração que afirma fatos |
| MOOD | a feature that indicates the speaker's purpose | una caratteristica che indica lo scopo del parlante | une caractéristique qui indique le but du locuteur | ein Merkmal, das den Zweck des Sprechers bezeichnet | una característica que indica la finalidad del hablante | 話し手の目的を示す特徴 | uma característica que indica a finalidade do falante |
| REGISTER | a formality level | un livello di formalità | un niveau de formalité | eine Förmlichkeitsebene | un nivel de formalidad | 丁寧さの段階 | um nível de formalidade |

What landed differently from the plan:

1. **No headless relative for the nouns.** The file expected STATEMENT and PARTICIPANT_GRAMMAR to move
   on C23's construct; a noun keeps its head, and both needed a *headed* relative with something the
   sweep's drafts lacked — a named agent, and a verb of asserting.
2. **ARTICLE did not follow DEFINITE and PROXIMAL.** They shipped, and showed that what separates an
   article from a demonstrative is an absence.
3. **REGISTER's missing shape was there all along**, as a noun modifier; what it lacked was the word.
4. **MOOD is a purpose, not a position.** The file's closing guess — that naming a clause's stance is
   a position in a system — was wrong in the way A30's first guess was.
5. **The addressee is a phrase after all**, and COMMAND, ORDER and INSTRUCTION still stay: on a shared
   word, a missing verb and a double sense, not on the mood.
6. **The parts of a surface needed no complement.** The part-whole relation the file expected as a
   new complement is a flag on the possessor the plan already had, and only English's surface
   changed. NAVIGATION needed no action noun, and WORKSPACE no longer collides with CANVAS.
