# C21. UI strings — the phrase console's diagnostics

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries
(`diagnostic.*`), driven by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Done 2026-09-21.** Every family ships: the console's 85 diagnostics are said in the interface
language, and none is left in English. See [Done](#done) for the renders and what changed against the
plan. Nothing was split into another ticket and nothing stays literal by design.

**Was blocked on:** three things, the first of which was not an engine gap.

1. **Diagnostics had no identity.** About a hundred messages were English strings built where the console
   threw them, and the tests asserted that English. **Resolved** by a pure refactor, its own commit:
   every diagnostic is a code and its args (`{ code: 'takesNoWord', args: { command: 'pl' } }`), one
   table says each code, and every test holds a line to its code.
2. **The existential clause.** Ten messages opened "There is no …", and `PhrasePlan` has no existential.
   **Reworded around it**, [C14](C14-ui-runtime-values.md)'s way: the missing thing is a noun phrase and
   its name follows a colon ("Missing period: #3", "Unknown command: /frob"). The construct is recorded
   below as a lead, not a ticket.
3. **Values inside the sentence.** **Resolved by the C14 rule throughout**: every value — a command's
   name, a period's number, a reference, the user's word as the pickers show it, a line of syntax —
   follows the phrase, after a colon. No sentence has the user's word as its subject, so none has to
   agree with it, and the on-request route [C16](C16-ui-possessive-pronoun-chip.md) built was not needed
   (probed below).

## How a diagnostic is said

A diagnostic is data ([diagnostics.ts](../../../packages/frontend/src/console/language/diagnostics.ts)):
its `code`, a string-literal union of 85, and its `args`, what the line named. `apply.ts`, `parse.ts` and
`parseRef` throw codes; `roleRefusal`, `relativeRefusal` and `clauseRefusal` return them; a transcript
error carries one. Nothing on the way holds English prose.

Each code is said as one or two **segments**
([`SEGMENTS`, diagnostics.ts:81-206](../../../packages/frontend/src/console/language/diagnostics.ts#L81-L206)):
a catalogue entry, and the value it names after a colon. Two segments are two sentences, joined by the
interface language's full stop (". ", ja 。). A command's purpose is the one segment that leads with its
value, as its help page does: "/more — to set an adjective's degree"
([`joinSegments`, diagnostics.ts:243](../../../packages/frontend/src/console/language/diagnostics.ts#L243)).

| code | args | en | it | ja |
|---|---|---|---|---|
| `unknownCommand` | `{ command: 'frob' }` | Unknown command: /frob | Comando sconosciuto: /frob | 不明な命令: /frob |
| `valueNotTaken` | `{ command: 'tense', values, given: 'soon' }` | Unknown value: “soon”. Choose a value: past, present, future | Valore sconosciuto: “soon”. Scegli un valore: past, present, future | 不明な値: “soon”。値を選び: past, present, future |
| `noTarget` | `{ command: 'more', last: { word, kind: 'noun' }, inElement }` | /more — to set an adjective's degree. This word is a noun: cat | /more — impostare il grado di un aggettivo. Questa parola è un sostantivo: gatto | /more — 形容詞の程度を設定する。この単語は名詞です: 猫 |

A diagnostic's **English** is its segments said with each entry's `fallback`
([`english`](../../../packages/frontend/src/console/language/diagnostics.ts#L253)): what the prompt shows
until the catalogue arrives, what `Diagnostic.message` holds for logs and the test helpers, and what
[diagnostics.test.ts](../../../packages/frontend/test/console/diagnostics.test.ts) pins, one row per code.
The prompt and the transcript draw a diagnostic through
[`useDiagnosticText`](../../../packages/frontend/src/console/useDiagnosticText.ts) and expose its code as
`data-code` ([ConsolePrompt.tsx:221](../../../packages/frontend/src/console/ConsolePrompt.tsx#L221),
[Transcript.tsx:94](../../../packages/frontend/src/console/Transcript.tsx#L94)), which is what the
e2e specs select on.

A help page's "Here:" line is a `Here` value, said by
[`sayHere`, diagnostics.ts:276](../../../packages/frontend/src/console/language/diagnostics.ts#L276)
and built by [`hereFor`, usePhraseConsole.ts:948](../../../packages/frontend/src/console/usePhraseConsole.ts#L948).

## The families, with their verdicts

All the renders below are fresh, 2026-09-21: the catalogue served by a backend booted on this branch
(`/api/ui-strings`), put together by `sayDiagnostic`. The user's words are stood in for by each word's
lexicon form; the console writes the word as its pickers show it.

| family | before (e.g.) | now | verdict |
|---|---|---|---|
| **existential** (10) | There is no period 3. · There is no command /frob. · There is no saved phrase “x”. · There is no adjective 2 there. · There is no 3rd phrase in that group. · There is no noun at #1.obj. · There is no bracket open here to close. | Missing period: #3 · Unknown command: /frob · Unknown phrase: “x” · Missing adjective: 2 · Missing conjunct: 3 · Missing noun: #1.obj · Unexpected bracket | **shipped**, reworded (MISSING, seeded UNKNOWN, UNEXPECTED) |
| **possession, negated** (8) | No noun here has an adjective to remove. · This period has no if-condition to remove. · …this period has no instrument link. | No noun has an adjective · This period has no condition · This period has no instrumental | **shipped** (HAVE with a `no` subject or object) |
| **licensing** (10) | /pl takes no word. · /tense takes past, present, future — not “soon”. · /level takes one value — “process” is already given. · run takes no object. · see takes no instrument. | This command accepts no word: /pl · Unknown value: “soon”. Choose a value: … · This command already has a value: process · This verb accepts no object: run · This verb accepts no instrumental: see | **shipped** (seeded ACCEPT, ALREADY; the command or verb after the colon) |
| **instructions with a syntax example** (~20) | Put the word inside the bracket: /subj ( cat … ). · Name a period after the #: #2, #2.obj. · Say which: /level process, concept or object. · …— close the bracket first. | Move the word: /subj ( cat … ) · Choose a period: #2, #2.obj · Choose a value: process, concept, object · Close the bracket: /subj ( … ) | **shipped** (seeded OPEN) |
| **explanations of the language** (~20) | A relative clause is another period — not the one its noun is in. · A command joins another command only with and, then, but or or. · This period is in an if-condition or a coordination, which fixes its mood — /del if or /del join first. · Period 2 already leads to this one — the link would go round in a circle. | Choose another period · This period is a command. Choose a conjunction: and, or, but, then · Remove the condition or the coordination: /del if, /del join · Choose another period | **shipped**, each reworded into one or two statements; nothing literal |
| **about the user's words** (6) | “ca” names 3 words — choose one: CAT, CAR. · /obj has no word “frob” — the list shows the ones it takes. · /more sets an adjective’s degree, and cat is a noun. · #2.subj is empty: the clause needs a word there to be about. | Choose a word: CRY, CRY_OUT · Unknown word: “frob” · /more — to set an adjective's degree. This word is a noun: cat · Missing word: #2.subj | **shipped**, the word after the colon; the on-request route was not needed |
| **references** (4) | a reference starts with a period number: #2, #2.obj · periods are numbered from 1 · “x” is not a noun of a period: subj, obj, pred, loc, … | Choose a period: #2, #2.obj · Missing period: #0 · Unknown noun: “x”. Choose a noun: subj, obj, pred, loc, … | **shipped** |
| **the help page's "Here:"** (3) | Here: nothing under the cursor yet. · Here: cat does not take it. · Here: on cat, now singular. | No word is under the cursor · This word does not accept the command: cat · Cursor: cat · now Singular | **shipped** (CURSOR as the label; HERE not seeded) |
| **Unexpected text.** (1) | — | Unexpected text | **shipped** (seeded TEXT). The branch is defensive: the lexer makes no token the parser does not meet before it |

### Existential, reworded

`PhrasePlan` still has no existential clause, and none was built. What is missing is said as a bare noun
under MISSING ([C14](C14-ui-runtime-values.md)) or UNKNOWN, capitalized, its name after a colon. A period
is named by its reference, `#3`, as the line wrote it ("Missing period: 3" would read as a count in some
languages). A stray closer is a token the parser did not expect, UNEXPECTED BRACKET. A link whose period
the line removed has no value to name: "Missing period".

| line | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `/subj cat /frob` | Unknown command: /frob | Comando sconosciuto: /frob | Commande inconnue: /frob | Unbekannter Befehl: /frob | Comando desconocido: /frob | Comando desconhecido: /frob | 不明な命令: /frob |
| `#3` (two periods) | Missing period: #3 | Periodo mancante: #3 | Période manquante: #3 | Fehlendes Satzgefüge: #3 | Período faltante: #3 | Período faltante: #3 | 見つからない文: #3 |
| `/load x` | Unknown phrase: “x” | Frase sconosciuta: “x” | Phrase inconnue: “x” | Unbekannte Phrase: “x” | Frase desconocida: “x” | Frase desconhecida: “x” | 不明なフレーズ: “x” |
| `/del adj 2` (one adjective) | Missing adjective: 2 | Aggettivo mancante: 2 | Adjectif manquant: 2 | Fehlendes Adjektiv: 2 | Adjetivo faltante: 2 | Adjetivo faltante: 2 | 見つからない形容詞: 2 |
| `/del and 3` | Missing conjunct: 3 | Congiunto mancante: 3 | Conjoint manquant: 3 | Fehlendes Konjunkt: 3 | Miembro coordinado faltante: 3 | Membro coordenado faltante: 3 | 見つからない等位項: 3 |
| `/poss #1.obj` (no object) | Missing noun: #1.obj | Sostantivo mancante: #1.obj | Nom manquant: #1.obj | Fehlendes Substantiv: #1.obj | Sustantivo faltante: #1.obj | Substantivo faltante: #1.obj | 見つからない名詞: #1.obj |
| `/subj cat )` | Unexpected bracket | Parentesi inattesa | Parenthèse inattendue | Unerwartete Klammer | Paréntesis inesperado | Parêntese inesperado | 予期しない括弧 |
| `/if ( … ) /del period` | Missing period | Periodo mancante | Période manquante | Fehlendes Satzgefüge | Período faltante | Período faltante | 見つからない文 |

**The construct, recorded as a lead.** Should a clause ever need "there is", each engine would have to
build it: en *there is / there are*, it *c'è / ci sono*, fr *il y a* (invariable), de *es gibt* +
accusative, es *hay* (invariable), pt *há* (invariable), ja ある for a thing and いる for a being, the
animacy the Japanese engine already reads for possession (`isAnimate.ts`), as
[C10](C10-ui-questions.md) did for the question. Nothing in the UI needs it now, so it is not a ticket.

### Possession, negated

HAVE with a `no` subject ("No noun has an adjective") or a `no` object ("This period has no condition").
The `no` determiner's known quirks ([B25](B25-ui-dialog-and-app-controls.md)) are on a verbless plural;
in a clause, singular, it reads right in all seven. Japanese gets its circumfix (どの名詞も…ありません).

| line | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `/del adj` (none in reach) | No noun has an adjective | Nessun sostantivo ha un aggettivo | Aucun nom n'a d'adjectif | Kein Substantiv hat ein Adjektiv | Ningún sustantivo tiene un adjetivo | Nenhum substantivo tem um adjetivo | どの名詞も形容詞がありません |
| `/del adv` | No verb has an adverb | Nessun verbo ha un avverbio | Aucun verbe n'a d'adverbe | Kein Verb hat ein Adverb | Ningún verbo tiene un adverbio | Nenhum verbo tem um advérbio | どの動詞も副詞がありません |
| `/del modal` | The verb has no modal | Il verbo non ha nessun verbo modale | Le verbe n'a aucun verbe modal | Das Verb hat kein Modalverb | El verbo no tiene ningún verbo modal | O verbo não tem nenhum verbo modal | 動詞はどの法助動詞もありません |
| `/del and` | No noun is coordinated | Nessun sostantivo è coordinato | Aucun nom n'est coordonné | Kein Substantiv ist beigeordnet | Ningún sustantivo es coordinado | Nenhum substantivo é coordenado | どの名詞も等位ではありません |
| `/del if` | This period has no condition | Questo periodo non ha nessuna condizione | Cette période n'a aucune condition | Dieses Satzgefüge hat keine Bedingung | Este período no tiene ninguna condición | Este período não tem nenhuma condição | この文はどの条件もありません |
| `/level process` (no instrument) | This period has no instrumental | Questo periodo non ha nessun complemento di mezzo | Cette période n'a aucun complément de moyen | Dieses Satzgefüge hat keinen Instrumental | Este período no tiene ningún complemento circunstancial de instrumento | Este período não tem nenhum adjunto adverbial de instrumento | この文はどの手段語もありません |

Two things of the English went: "here" and "to remove".

| probe | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| … `modifier: HERE` (a candidate, not seeded) | no noun has an adjective here. | nessun sostantivo ha qui un aggettivo. | aucun nom n'a ici d'adjectif. | kein Substantiv hat hier ein Adjektiv. | ningún sustantivo tiene aquí un adjetivo. | nenhum substantivo tem aqui um adjetivo. | どの名詞も形容詞が**ここ**ありません。 |
| … `purpose: REMOVE` | no noun has an adjective to remove. | nessun sostantivo ha un aggettivo **per rimuovere**. | aucun nom n'a d'adjectif **pour retirer**. | kein Substantiv hat ein Adjektiv, **um zu entfernen**. | …para quitar. | …para remover. | どの名詞も取り除くために形容詞がありません。 |
| the negated verb + an indefinite object | this period does not have a condition. | questo periodo non ha una condizione. | cette période n'a pas de condition. | dieses Satzgefüge hat **eine Bedingung nicht**. | este período no tiene una condición. | este período não tem uma condição. | この文は条件がありません。 |

Japanese has no adverb ここ that stands before a verb unmarked (it wants で), so HERE was not seeded. "An
adjective to remove" is an infinitival relative, and `PhrasePlan.purpose` says an aim ("per rimuovere",
not "da rimuovere"). The negated verb with an indefinite object reads "hat eine Bedingung nicht" in
German where it means *keine*, so every negative here is the `no` determiner.

### Licensing

A command name is a token, not a concept, so it cannot be a plan's subject. The subject is `this`
command, or this verb, and the name follows the colon. The verb is ACCEPT, the licensing sense a grammar
and a program share. A command given a second value is HAVE with ALREADY ("This command already has a
value: process"); a value it does not take is the unknown value, then the values it takes.

| line | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `/pl cats` | This command accepts no word: /pl | Questo comando non accetta nessuna parola: /pl | Cette commande n'accepte aucun mot: /pl | Dieser Befehl akzeptiert kein Wort: /pl | Este comando no acepta ninguna palabra: /pl | Este comando não aceita nenhuma palavra: /pl | この命令はどの単語も受け付けません: /pl |
| `/tense soon` | Unknown value: “soon”. Choose a value: past, present, future | Valore sconosciuto: “soon”. Scegli un valore: past, present, future | Valeur inconnue: “soon”. Choisir une valeur: past, present, future | Unbekannter Wert: “soon”. Einen Wert wählen: past, present, future | Valor desconocido: “soon”. Elegir un valor: past, present, future | Valor desconhecido: “soon”. Escolher um valor: past, present, future | 不明な値: “soon”。値を選び: past, present, future |
| `/level process concept` | This command already has a value: process | Questo comando ha già un valore: process | Cette commande a déjà une valeur: process | Dieser Befehl hat schon einen Wert: process | Este comando tiene ya un valor: process | Este comando tem já um valor: process | この命令は値がもうあります: process |
| `/verb run /obj food` | This verb accepts no object: run | Questo verbo non accetta nessun complemento oggetto: correre | Ce verbe n'accepte aucun complément d'objet: courir | Dieses Verb akzeptiert kein Objekt: laufen | Este verbo no acepta ningún complemento: correr | Este verbo não aceita nenhum objeto: correr | この動詞はどの目的語も受け付けません: 走る |
| `/verb eat /pred happy` | This verb accepts no subject complement: eat | Questo verbo non accetta nessun complemento predicativo del soggetto: mangiare | Ce verbe n'accepte aucun attribut du sujet: manger | Dieses Verb akzeptiert kein Prädikativ: essen | Este verbo no acepta ningún atributo: comer | Este verbo não aceita nenhum predicativo do sujeito: comer | この動詞はどの主格補語も受け付けません: 食べる |
| `/verb see /inst ( … )` | This verb accepts no instrumental: see | Questo verbo non accetta nessun complemento di mezzo: vedere | Ce verbe n'accepte aucun complément de moyen: voir | Dieses Verb akzeptiert keinen Instrumental: sehen | Este verbo no acepta ningún complemento circunstancial de instrumento: ver | Este verbo não aceita nenhum adjunto adverbial de instrumento: ver | この動詞はどの手段語も受け付けません: 見る |

The candidates for "/pl takes no word", probed with a TAKE stand-in (not seeded):

| candidate | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| **ACCEPT, `no` object (shipped)** | this command accepts no word. | questo comando non accetta nessuna parola. | cette commande n'accepte aucun mot. | dieser Befehl akzeptiert kein Wort. | este comando no acepta ninguna palabra. | este comando não aceita nenhuma palavra. | この命令はどの単語も受け付けません。 |
| TAKE, `no` object | this command takes no word. | questo comando non **prende** nessuna parola. | cette commande ne **prend** aucun mot. | dieser Befehl **nimmt** kein Wort. | este comando no **toma** ninguna palabra. | este comando não **toma** nenhuma palavra. | この命令はどの単語も**取りません**。 |
| a label, WORD `no`, verbless | no word. | nessuna parola. | aucun mot. | kein Wort. | ninguna palabra. | nenhuma palavra. | どの単語もない。 |
| UNEXPECTED WORD | unexpected word. | parola inattesa. | mot inattendu. | unerwartetes Wort. | palabra inesperada. | palavra inesperada. | 予期しない単語。 |
| ACCEPT negated, indefinite | this command does not accept a word. | questo comando non accetta una parola. | cette commande n'accepte pas de mot. | dieser Befehl akzeptiert **ein Wort nicht**. | este comando no acepta una palabra. | este comando não aceita uma palavra. | この命令は単語を受け付けません。 |

TAKE is grabbing in five languages (prendere, prendre, nehmen, tomar, 取る). The bare label says nothing
of the command, and UNEXPECTED WORD says nothing of what was wrong with it. The negated verb has the German
*nicht* problem above.

Two renders read less well than the rest and are kept: es/pt put ALREADY after the verb ("tiene **ya** un
valor", "tem **já** um valor"; *ya tiene* is the usual order, *tem já* is fine in European Portuguese), and
es OBJECT_GRAMMAR is *complemento*, the canvas's own name for the object box
([C22](C22-ui-help-prose.md) records the same word for COMPLEMENT_GRAMMAR).

### Instructions with a syntax example

An instruction in the register the app's hints are in (`commandOf`), and the line to write after the
colon. CHOOSE, not NAME: NAME is seeded as "to give a name to" (it *nominare*, ja 名付ける). A word before
its bracket and a command past it are MOVEd, where the line shows. A bracket no command opens is "Open a
bracket with a command" (OPEN, seeded). A line that starts with a word is two statements: the word was
unexpected, and a command comes first.

| line | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `/subj cat ( /pl )` | Move the word: /subj ( cat … ) | Sposta la parola: /subj ( gatto … ) | Déplacer le mot: /subj ( chat … ) | Das Wort verschieben: /subj ( Kater … ) | Mover la palabra: /subj ( gato … ) | Mover a palavra: /subj ( gato … ) | 単語を移動: /subj ( 猫 … ) |
| `/subj ( cat /verb eat )` | Close the bracket: /subj ( … ) | Chiudi la parentesi: /subj ( … ) | Fermer la parenthèse: /subj ( … ) | Die Klammer schließen: /subj ( … ) | Cerrar el paréntesis: /subj ( … ) | Fechar o parêntese: /subj ( … ) | 括弧を閉じる: /subj ( … ) |
| `/subj ( cat ) /pl` | Move the command: /subj ( cat … /pl ) | Sposta il comando: /subj ( gatto … /pl ) | Déplacer la commande: /subj ( chat … /pl ) | Den Befehl verschieben: /subj ( Kater … /pl ) | Mover el comando: /subj ( gato … /pl ) | Mover o comando: /subj ( gato … /pl ) | 命令を移動: /subj ( 猫 … /pl ) |
| `/rel subj` ↵ | Open a new clause: /rel subj { … } | Apri una nuova proposizione: /rel subj { … } | Ouvrir une nouvelle proposition: /rel subj { … } | Einen neuen Satz öffnen: /rel subj { … } | Abrir una oración nueva: /rel subj { … } | Abrir uma oração nova: /rel subj { … } | 新しい節を開く: /rel subj { … } |
| `( cat )` | Open a bracket with a command: /subj ( … ), /poss [ … ], /rel subj { … } | Apri una parentesi con un comando: /subj ( … ), /poss [ … ], /rel subj { … } | Ouvrir une parenthèse avec une commande: /subj ( … ), /poss [ … ], /rel subj { … } | Eine Klammer mit einem Befehl öffnen: /subj ( … ), /poss [ … ], /rel subj { … } | Abrir un paréntesis con un comando: /subj ( … ), /poss [ … ], /rel subj { … } | Abrir um parêntese com um comando: /subj ( … ), /poss [ … ], /rel subj { … } | 命令で括弧を開く: /subj ( … ), /poss [ … ], /rel subj { … } |
| `/` ↵ | Choose a command in the list | Scegli un comando nell'elenco | Choisir une commande dans la liste | Einen Befehl in der Liste wählen | Elegir un comando en la lista | Escolher um comando na lista | 一覧で命令を選び |
| `/if` ↵ | Choose a period: /if #2, /if { … } | Scegli un periodo: /if #2, /if { … } | Choisir une période: /if #2, /if { … } | Ein Satzgefüge wählen: /if #2, /if { … } | Elegir un período: /if #2, /if { … } | Escolher um período: /if #2, /if { … } | 文を選び: /if #2, /if { … } |
| `/term child` (no verb) | Choose a verb: /verb ( … ) | Scegli un verbo: /verb ( … ) | Choisir un verbe: /verb ( … ) | Ein Verb wählen: /verb ( … ) | Elegir un verbo: /verb ( … ) | Escolher um verbo: /verb ( … ) | 動詞を選び: /verb ( … ) |
| `/del` (nothing in hand) | Remove a word or the period: /del obj, /del adj, /del period | Rimuovi una parola o il periodo: /del obj, /del adj, /del period | Retirer un mot ou la période: /del obj, /del adj, /del period | Ein Wort oder das Satzgefüge entfernen: /del obj, /del adj, /del period | Quitar una palabra o el período: /del obj, /del adj, /del period | Remover uma palavra ou o período: /del obj, /del adj, /del period | 単語か文を取り除き: /del obj, /del adj, /del period |
| `cat` | Unexpected word. Type a command: /subj ( … ) | Parola inattesa. Digita un comando: /subj ( … ) | Mot inattendu. Taper une commande: /subj ( … ) | Unerwartetes Wort. Einen Befehl tippen: /subj ( … ) | Palabra inesperada. Teclear un comando: /subj ( … ) | Palavra inesperada. Digitar um comando: /subj ( … ) | 予期しない単語。命令を入力: /subj ( … ) |

Probed and not used:

| candidate | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| START + LINE, instrumental COMMAND | start the line with a command. | inizia la riga con un comando. | commencer la ligne **avec** une commande. | die Zeile mit einem Befehl beginnen. | empezar la línea con un comando. | começar a linha com um comando. | 命令で行を始め。 |
| WRITE + WORD, `locative` BRACKET | write the word in the bracket. | scrivi la parola nella parentesi. | écrire le mot dans la parenthèse. | das Wort in der Klammer schreiben. | escribir la palabra en el paréntesis. | escrever a palavra no parêntese. | 括弧**で**単語を書き。 |
| CHOOSE + NOUN, the period its possessor | choose **this period's noun**. | scegli un sostantivo di questo periodo. | choisir un nom de cette période. | ein Substantiv dieses Satzgefüges wählen. | elegir un sustantivo de este período. | escolher um substantivo deste período. | この文の名詞を選び。 |

French begins *par*, not *avec*; Japanese で is "by means of", not "in"; English turns an indefinite head
with a genitive into "this period's noun", which says there is one. The shipped plans are TYPE a command,
MOVE the word, and CHOOSE a noun with the period as its `locative` ("in this period").

### Explanations of the language

Each is one or two statements in shapes that exist, and most end in what to do. None stays literal. What
the rewording dropped is the reason some of them gave:

| explanation | now | what carried the reason, and the probe |
|---|---|---|
| "…which fixes its mood — /del if or /del join first." | Remove the condition or the coordination: /del if, /del join | a non-restrictive relative. The instruction says what it led to |
| "…only with and, then, but or or." | This period is a command. Choose a conjunction: and, or, but, then | *only* (unseeded) focusing a list: the list after the colon is the only one |
| "A noun cannot be its own possessor, nor one of its own parts’." | Choose another noun | *its own*. A pronominal possessor on a predicative: it "un sostantivo non può essere il suo possessore", but es "…ser **el** poseedor", pt "…ser **o** possuidor", ja それの所有者 |
| "…the link would go round in a circle." | Choose another period | a conditional consequence and CIRCLE (unseeded): "the periods make a circle", with a CIRCLE stand-in, reads geometric in all seven (it "i periodi fanno un cerchio", ja 文は円を作ります); a cycle is a word the corpus lacks (it *ciclo*, ja 循環) |
| "An instrument held as a thing is a noun phrase: that period has a verb. Use /level process or concept for an act." | That period has a verb. Choose a level: /level process, /level concept | kept, as two statements |

| line | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `/subj child /verb read /rel #1.subj` | Choose another period | Scegli un altro periodo | Choisir une autre période | Ein anderes Satzgefüge wählen | Elegir otro período | Escolher outro período | 別の文を選び |
| `/poss #1.subj` on the subject | Choose another noun | Scegli un altro sostantivo | Choisir un autre nom | Ein anderes Substantiv wählen | Elegir otro sustantivo | Escolher outro substantivo | 別の名詞を選び |
| `/poss #2.subj` from period 1 | Choose a noun in this period: #1.subj | Scegli un sostantivo in questo periodo: #1.subj | Choisir un nom dans cette période: #1.subj | Ein Substantiv in diesem Satzgefüge wählen: #1.subj | Elegir un sustantivo en este período: #1.subj | Escolher um substantivo neste período: #1.subj | この文で名詞を選び: #1.subj |
| `/command … /join therefore` | This period is a command. Choose a conjunction: and, or, but, then | Questo periodo è un comando. Scegli una congiunzione: and, or, but, then | Cette période est une commande. Choisir une conjonction: and, or, but, then | Dieses Satzgefüge ist ein Befehl. Eine Konjunktion wählen: and, or, but, then | Este período es un comando. Elegir una conjunción: and, or, but, then | Este período é um comando. Escolher uma conjunção: and, or, but, then | この文は命令です。接続詞を選び: and, or, but, then |
| `/command` in an if-condition | Remove the condition or the coordination: /del if, /del join | Rimuovi la condizione o la coordinazione: /del if, /del join | Retirer la condition ou la coordination: /del if, /del join | Die Bedingung oder die Koordination entfernen: /del if, /del join | Quitar la condición o la coordinación: /del if, /del join | Remover a condição ou a coordenação: /del if, /del join | 条件か等位接続を取り除き: /del if, /del join |
| `/if #1` from period 2 under 1 | Choose another period | Scegli un altro periodo | Choisir une autre période | Ein anderes Satzgefüge wählen | Elegir otro período | Escolher outro período | 別の文を選び |
| `/if #2`, 2 already joined | That period is already linked: #2 | Quel periodo è già collegato: #2 | Cette période est déjà liée: #2 | Jenes Satzgefüge ist schon verknüpft: #2 | Ese período está ya vinculado: #2 | Esse período está já ligado: #2 | その文はもうリンク済みです: #2 |
| `/command /verb run /if ( … )` | This period accepts no condition | Questo periodo non accetta nessuna condizione | Cette période n'accepte aucune condition | Dieses Satzgefüge akzeptiert keine Bedingung | Este período no acepta ninguna condición | Este período não aceita nenhuma condição | この文はどの条件も受け付けません |
| `/join #2`, other mood | This period is a command. Choose another period | Questo periodo è un comando. Scegli un altro periodo | Cette période est une commande. Choisir une autre période | Dieses Satzgefüge ist ein Befehl. Ein anderes Satzgefüge wählen | Este período es un comando. Elegir otro período | Este período é um comando. Escolher outro período | この文は命令です。別の文を選び |
| `/rel #2.subj`, taken | Another relative clause already has this noun: #2.subj | Un'altra proposizione relativa ha già questo sostantivo: #2.subj | Une autre proposition relative a déjà ce nom: #2.subj | Ein anderer Relativsatz hat schon dieses Substantiv: #2.subj | Otra oración de relativo tiene ya este sustantivo: #2.subj | Outra oração relativa tem já este substantivo: #2.subj | 別の関係節はこの名詞がもうあります: #2.subj |
| `/inst #2`, 2 has a verb | That period has a verb. Choose a level: /level process, /level concept | Quel periodo ha un verbo. Scegli un livello: /level process, /level concept | Cette période a un verbe. Choisir un niveau: /level process, /level concept | Jenes Satzgefüge hat ein Verb. Eine Ebene wählen: /level process, /level concept | Ese período tiene un verbo. Elegir un nivel: /level process, /level concept | Esse período tem um verbo. Escolher um nível: /level process, /level concept | その文は動詞があります。段階を選び: /level process, /level concept |
| `/verb` in a thing-instrument | Change the level: /level process | Cambia il livello: /level process | Changer le niveau: /level process | Die Ebene ändern: /level process | Cambiar el nivel: /level process | Mudar o nível: /level process | 段階を変え: /level process |

### About the user's words

The word follows the colon, as the pickers show it, so no sentence has to agree with it. The kind of a
word is one of seven entries, "This word is a noun" (`diagnostic.wordIs.*`); the misuse of a command leads
with the command and its help page's purpose ([B47](B47-ui-console-command-purposes.md)'s citation, now
read by the diagnostic too), then the word, then where the command goes.

| line | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `/subj ( cat /more )` | /more — to set an adjective's degree. This word is a noun: cat | /more — impostare il grado di un aggettivo. Questa parola è un sostantivo: gatto | /more — définir le degré d'un adjectif. Ce mot est un nom: chat | /more — die Steigerungsstufe eines Adjektivs festlegen. Dieses Wort ist ein Substantiv: Kater | /more — establecer el grado de un adjetivo. Esta palabra es un sustantivo: gato | /more — definir o grau de um adjetivo. Esta palavra é um substantivo: gato | /more — 形容詞の程度を設定する。この単語は名詞です: 猫 |
| `/obj food /past` after eat | /past — to set a verb's tense. This word is a noun: food. Move the command: /verb ( eat … /past ) | /past — impostare il tempo di un verbo. Questa parola è un sostantivo: cibo. Sposta il comando: /verb ( mangiare … /past ) | /past — définir le temps d'un verbe. Ce mot est un nom: nourriture. Déplacer la commande: /verb ( manger … /past ) | /past — das Tempus eines Verbs festlegen. Dieses Wort ist ein Substantiv: Essen. Den Befehl verschieben: /verb ( essen … /past ) | /past — establecer el tiempo de un verbo. Esta palabra es un sustantivo: comida. Mover el comando: /verb ( comer … /past ) | /past — definir o tempo de um verbo. Esta palavra é um substantivo: comida. Mover o comando: /verb ( comer … /past ) | /past — 動詞の時制を設定する。この単語は名詞です: 食べ物。命令を移動: /verb ( 食べる … /past ) |
| `/verb eat /adj brown` | /adj — to describe a noun. This word is a verb: eat | /adj — descrivere un sostantivo. Questa parola è un verbo: mangiare | /adj — décrire un nom. Ce mot est un verbe: manger | /adj — ein Substantiv beschreiben. Dieses Wort ist ein Verb: essen | /adj — describir un sustantivo. Esta palabra es un verbo: comer | /adj — descrever um substantivo. Esta palavra é um verbo: comer | /adj — 名詞を描写する。この単語は動詞です: 食べる |
| `/verb cry` | Choose a word: CRY, CRY_OUT | Scegli una parola: CRY, CRY_OUT | Choisir un mot: CRY, CRY_OUT | Ein Wort wählen: CRY, CRY_OUT | Elegir una palabra: CRY, CRY_OUT | Escolher uma palavra: CRY, CRY_OUT | 単語を選び: CRY, CRY_OUT |
| `/obj frob` | Unknown word: “frob” | Parola sconosciuta: “frob” | Mot inconnu: “frob” | Unbekanntes Wort: “frob” | Palabra desconocida: “frob” | Palavra desconhecida: “frob” | 不明な単語: “frob” |
| `/rel #2.subj`, empty | Missing word: #2.subj | Parola mancante: #2.subj | Mot manquant: #2.subj | Fehlendes Wort: #2.subj | Palabra faltante: #2.subj | Palavra faltante: #2.subj | 見つからない単語: #2.subj |

**The on-request route was not built.** It was probed: the user's word as the subject, bare, which reads
as a word mentioned rather than used.

| plan | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| CAT bare + BE + NOUN | cat is a noun. | gatto è un sostantivo. | chat est un nom. | Kater ist ein Substantiv. | gato es un sustantivo. | gato é um substantivo. | 猫は名詞です。 |
| RUN (a verb) bare + BE + VERB | run is a verb. | correre è un verbo. | courir est un verbe. | laufen ist ein Verb. | correr es un verbo. | correr é um verbo. | 走るは動詞です。 |
| RUN bare + ACCEPT + OBJECT `no` | run accepts no object. | correre non accetta nessun complemento oggetto. | courir n'accepte aucun complément d'objet. | laufen akzeptiert kein Objekt. | correr no acepta ningún complemento. | correr não aceita nenhum objeto. | 走るはどの目的語も受け付けません。 |
| THIRD_PERSON + BE + PRONOUN | **he** is a pronoun. | **è** un pronome. | **il** est un pronom. | **er** ist ein Pronomen. | **es** un pronombre. | **é** um pronome. | **彼**は代名詞です。 |

It reads for nouns, verbs, adjectives and adverbs, but a pronoun is dropped (it, es, pt) or rendered as
one of its forms, and nothing in any of these sentences agrees with the word. The colon form needs no
request, is right while the catalogue is in flight, and says a pronoun as the console writes it
("1st"). As with [C14](C14-ui-runtime-values.md)'s option 1, what nothing needs was not built.

### References

A malformed reference asks for a period ("Choose a period: #2, #2.obj"); a period below 1 is missing; a
step that names no noun is an unknown noun, and a step past the noun names a noun too (its possessor, one
of its conjuncts), so it is one entry, UNKNOWN NOUN, with the steps after it.

| line | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `#x` | Choose a period: #2, #2.obj | Scegli un periodo: #2, #2.obj | Choisir une période: #2, #2.obj | Ein Satzgefüge wählen: #2, #2.obj | Elegir un período: #2, #2.obj | Escolher um período: #2, #2.obj | 文を選び: #2, #2.obj |
| `#0` | Missing period: #0 | Periodo mancante: #0 | Période manquante: #0 | Fehlendes Satzgefüge: #0 | Período faltante: #0 | Período faltante: #0 | 見つからない文: #0 |
| `#2.foo` | Unknown noun: “foo”. Choose a noun: subj, obj, pred, loc, … | Sostantivo sconosciuto: “foo”. Scegli un sostantivo: subj, obj, pred, loc, … | Nom inconnu: “foo”. Choisir un nom: subj, obj, pred, loc, … | Unbekanntes Substantiv: “foo”. Ein Substantiv wählen: subj, obj, pred, loc, … | Sustantivo desconocido: “foo”. Elegir un sustantivo: subj, obj, pred, loc, … | Substantivo desconhecido: “foo”. Escolher um substantivo: subj, obj, pred, loc, … | 不明な名詞: “foo”。名詞を選び: subj, obj, pred, loc, … |
| `#2.subj.foo` | Unknown noun: “foo”. Choose a noun: poss, and2, … | Sostantivo sconosciuto: “foo”. Scegli un sostantivo: poss, and2, … | Nom inconnu: “foo”. Choisir un nom: poss, and2, … | Unbekanntes Substantiv: “foo”. Ein Substantiv wählen: poss, and2, … | Sustantivo desconocido: “foo”. Elegir un sustantivo: poss, and2, … | Substantivo desconhecido: “foo”. Escolher um substantivo: poss, and2, … | 不明な名詞: “foo”。名詞を選び: poss, and2, … |
| `#2.obj` (no object) | Missing noun: #2.obj | Sostantivo mancante: #2.obj | Nom manquant: #2.obj | Fehlendes Substantiv: #2.obj | Sustantivo faltante: #2.obj | Substantivo faltante: #2.obj | 見つからない名詞: #2.obj |

### The help page's "Here:" line

What the command would act on at the cursor. The label is CURSOR (`console.help.cursor`): HERE has no
Japanese to stand before a verb unmarked (ここ wants で), so it was not seeded for a label alone. The value a
word holds now is the catalogue's own name for it, as the completion row's "now …" says it
(`currentValue`, exported from complete.ts), where the English line used to print the setting's id.

| cursor | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| on no word | No word is under the cursor | Nessuna parola è sotto il cursore | Aucun mot n'est sous le curseur | Kein Wort ist unter dem Cursor | Ninguna palabra está debajo del cursor | Nenhuma palavra está debaixo do cursor | どの単語もカーソルの下にありません |
| on cat, `/help more` | This word does not accept the command: cat | Questa parola non accetta il comando: gatto | Ce mot n'accepte pas la commande: chat | Dieses Wort akzeptiert den Befehl nicht: Kater | Esta palabra no acepta el comando: gato | Esta palavra não aceita o comando: gato | この単語は命令を受け付けません: 猫 |
| on cat, `/help pl` | Cursor: cat · now Singular | Cursore: gatto · ora Singolare | Curseur: chat · maintenant Singulier | Cursor: Kater · jetzt Singular | Cursor: gato · ahora Singular | Cursor: gato · agora Singular | カーソル: 猫 · 今 単数 |

### Unexpected text

| line | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| (defensive) | Unexpected text | Testo inatteso | Texte inattendu | Unerwarteter Text | Texto inesperado | Texto inesperado | 予期しないテキスト |

## Avoidable: the console could do it instead of saying it

Recorded, not built. [P02](../../features/P-planning/P02-phrase-console/README.md)'s structured lines
(decision 7) say that when the console knows the one next step, it takes it rather than saying it. Each of
these knows exactly what the line should be:

- `wordInsideBracket` — `/subj cat (`: the bracket could open around the word, `/subj ( cat`, as a
  typed bracket already opens its pair.
- `describesAWord` and `noTarget` with a fitting word — `/subj ( cat ) /pl`, `/obj ( food ) /past`: the
  command could move into its word's bracket, as edit.ts already moves a command *out* of one it does not
  belong in.
- `openNewClause` — `/rel subj` ↵: the braces could open on ↵, as they open on a space.
- `strayCloser` — a closer with nothing open could be dropped.
- the "close the bracket" codes (`periodCommandInBracket`, `nestedRoleNotSubj`, `linkInsideNounPhrase`,
  `moodInNounPhrase`, `newPeriodInBracket`, `removePeriodInBracket`, `gotoInsideBracket`) — edit.ts
  already moves a typed command out of a bracket it does not belong in; a pasted line meets the
  diagnostic, and could be restructured the same way.

`lineStartsWithWord` is not: the completion list already offers `/subj ( cat )` for a bare word, but the
word may be any role's.

## Seeded

| concept | role | where | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|---|---|
| UNKNOWN | adjective | [adjectives.ts:1011](../../../packages/backend/src/concepts/adjectives.ts#L1011) | unknown | sconosciuto | inconnu | unbekannt | desconocido | desconhecido | 不明な |
| UNEXPECTED | adjective | [adjectives.ts:1029](../../../packages/backend/src/concepts/adjectives.ts#L1029) | unexpected | inatteso | inattendu | unerwartet | inesperado | inesperado | 予期しない |
| ALREADY | adverb, `frequency` | [adverbs.ts:260](../../../packages/backend/src/concepts/adverbs.ts#L260) | already | già | déjà | schon | ya | já | もう |
| TEXT | noun, count | [nouns.ts:3838](../../../packages/backend/src/concepts/nouns.ts#L3838) | text(s) | testo (m) | texte (m) | Text (m) | texto (m) | texto (m) | テキスト |
| REFERENCE | noun, count | [nouns.ts:3856](../../../packages/backend/src/concepts/nouns.ts#L3856) | reference(s) | riferimento (m) | référence (f) | Verweis (m) | referencia (f) | referência (f) | 参照 |
| OPEN | verb, transitive | [transitive.ts:4664](../../../packages/backend/src/concepts/verbs/transitive.ts#L4664) | open | aprire | ouvrir | öffnen | abrir | abrir | 開く |
| ACCEPT | verb, transitive | [transitive.ts:6086](../../../packages/backend/src/concepts/verbs/transitive.ts#L6086) | accept | accettare | accepter | akzeptieren | aceptar | aceitar | 受け付ける |

UNKNOWN and UNEXPECTED sit after MISSING, the adjective the existential rewording shares with them. Japanese
不明な is what its software writes for "unknown" (不明なコマンド), a na-adjective; 予期しない, the negative of
予期する, inflects as an i-adjective. ALREADY sits between NOW and ALWAYS, and shares ALWAYS's `frequency`
subtype, which is a position rather than a meaning: before the verb in English, between the auxiliary and
the participle in a compound tense ("has already eaten", it "ha già mangiato", fr "a déjà mangé"). German
*schon*, the everyday word. TEXT and REFERENCE follow CURSOR; German *Verweis* is the native word
(*Referenz* the programmer's), Japanese 参照 its software's. OPEN precedes CLOSE, its opposite: the
participles are irregular everywhere but English and German (*aperto*, *ouvert*, *abierto*, *aberto*), and
Japanese 開く (ひらく) is godan, in the dictionary form on a control as CLOSE's 閉じる is. ACCEPT follows GOVERN,
the other grammarian's verb: Japanese 受け付ける is what an input that refuses something says, and
Portuguese *aceitar* has two participles, *aceitado* after *ter* and *aceite* with *ser* (EP). Both verbs have
their `NONFINITE` entries ([nonfinite.ts:711, 871](../../../packages/backend/src/concepts/verbs/nonfinite.ts#L711)).

Considered and not seeded: **STEP** (a reference's step names a noun, so it is UNKNOWN NOUN), **HERE**
(no Japanese adverb stands before a verb unmarked; the Here line's label is CURSOR), **TAKE** (grabbing in
five languages; ACCEPT is the licensing sense), **CIRCLE** (geometric; see the explanations), **PUT** (MOVE
says it where the line shows the place). Pinned in
[console-diagnostics.test.ts](../../../packages/engine/test/console-diagnostics.test.ts) (the verbs in
present, past, future, the plural and the 1st singular, the aspects, the negative, the passive, a command
and an instruction; the adjectives in both numbers, as a predicate and as a label; the nouns with an
article and an adjective; ALREADY in a simple and a compound tense), in `EVERY_ADJECTIVE`
([adjectives.test.ts](../../../packages/engine/test/adjectives.test.ts)) and in the Italian `IT` table of
[verb.test.ts](../../../packages/engine/test/verb.test.ts) ("la gatta ha accettato", "ha aperto").

## Strings

74 entries, one block after `console.help.example`
([uiStrings.ts:3004-3567](../../../packages/shared/src/uiStrings.ts#L3004-L3567)). The families keyed for a
call site to index are parallel: `diagnostic.verbAcceptsNo.<slot>` (the box a role command names, and
`instrumental`), `diagnostic.wordIs.<kind>` (`WordKindName`), `diagnostic.periodHasNo.<link>` (the
console's link names). Every entry is capitalized with its full stop dropped (`NAME_FORMAT`): a
diagnostic's sentences are joined by the language's full stop where they are put together. Rendered
through the boot check of a backend on this branch (`/api/ui-strings`, 2026-09-21):

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `diagnostic.unknownCommand` | Unknown command | Comando sconosciuto | Commande inconnue | Unbekannter Befehl | Comando desconocido | Comando desconhecido | 不明な命令 |
| `diagnostic.unknownWord` | Unknown word | Parola sconosciuta | Mot inconnu | Unbekanntes Wort | Palabra desconocida | Palavra desconhecida | 不明な単語 |
| `diagnostic.unknownValue` | Unknown value | Valore sconosciuto | Valeur inconnue | Unbekannter Wert | Valor desconocido | Valor desconhecido | 不明な値 |
| `diagnostic.unknownNoun` | Unknown noun | Sostantivo sconosciuto | Nom inconnu | Unbekanntes Substantiv | Sustantivo desconocido | Substantivo desconhecido | 不明な名詞 |
| `diagnostic.unknownPhrase` | Unknown phrase | Frase sconosciuta | Phrase inconnue | Unbekannte Phrase | Frase desconocida | Frase desconhecida | 不明なフレーズ |
| `diagnostic.missingPeriod` | Missing period | Periodo mancante | Période manquante | Fehlendes Satzgefüge | Período faltante | Período faltante | 見つからない文 |
| `diagnostic.missingNoun` | Missing noun | Sostantivo mancante | Nom manquant | Fehlendes Substantiv | Sustantivo faltante | Substantivo faltante | 見つからない名詞 |
| `diagnostic.missingWord` | Missing word | Parola mancante | Mot manquant | Fehlendes Wort | Palabra faltante | Palavra faltante | 見つからない単語 |
| `diagnostic.missingAdjective` | Missing adjective | Aggettivo mancante | Adjectif manquant | Fehlendes Adjektiv | Adjetivo faltante | Adjetivo faltante | 見つからない形容詞 |
| `diagnostic.missingModal` | Missing modal | Verbo modale mancante | Verbe modal manquant | Fehlendes Modalverb | Verbo modal faltante | Verbo modal faltante | 見つからない法助動詞 |
| `diagnostic.missingConjunct` | Missing conjunct | Congiunto mancante | Conjoint manquant | Fehlendes Konjunkt | Miembro coordinado faltante | Membro coordenado faltante | 見つからない等位項 |
| `diagnostic.unexpectedText` | Unexpected text | Testo inatteso | Texte inattendu | Unerwarteter Text | Texto inesperado | Texto inesperado | 予期しないテキスト |
| `diagnostic.unexpectedBracket` | Unexpected bracket | Parentesi inattesa | Parenthèse inattendue | Unerwartete Klammer | Paréntesis inesperado | Parêntese inesperado | 予期しない括弧 |
| `diagnostic.unexpectedReference` | Unexpected reference | Riferimento inatteso | Référence inattendue | Unerwarteter Verweis | Referencia inesperada | Referência inesperada | 予期しない参照 |
| `diagnostic.unexpectedWord` | Unexpected word | Parola inattesa | Mot inattendu | Unerwartetes Wort | Palabra inesperada | Palavra inesperada | 予期しない単語 |
| `diagnostic.commandAcceptsNoWord` | This command accepts no word | Questo comando non accetta nessuna parola | Cette commande n'accepte aucun mot | Dieser Befehl akzeptiert kein Wort | Este comando no acepta ninguna palabra | Este comando não aceita nenhuma palavra | この命令はどの単語も受け付けません |
| `diagnostic.commandHasValue` | This command already has a value | Questo comando ha già un valore | Cette commande a déjà une valeur | Dieser Befehl hat schon einen Wert | Este comando tiene ya un valor | Este comando tem já um valor | この命令は値がもうあります |
| `diagnostic.verbAcceptsNo.directObject` | This verb accepts no object | Questo verbo non accetta nessun complemento oggetto | Ce verbe n'accepte aucun complément d'objet | Dieses Verb akzeptiert kein Objekt | Este verbo no acepta ningún complemento | Este verbo não aceita nenhum objeto | この動詞はどの目的語も受け付けません |
| `diagnostic.verbAcceptsNo.predicative` | This verb accepts no subject complement | Questo verbo non accetta nessun complemento predicativo del soggetto | Ce verbe n'accepte aucun attribut du sujet | Dieses Verb akzeptiert kein Prädikativ | Este verbo no acepta ningún atributo | Este verbo não aceita nenhum predicativo do sujeito | この動詞はどの主格補語も受け付けません |
| `diagnostic.verbAcceptsNo.terminus` | This verb accepts no terminus | Questo verbo non accetta nessun complemento di termine | Ce verbe n'accepte aucun complément d'objet second | Dieses Verb akzeptiert kein Dativobjekt | Este verbo no acepta ningún complemento indirecto | Este verbo não aceita nenhum objeto indireto | この動詞はどの間接目的語も受け付けません |
| `diagnostic.verbAcceptsNo.manner` | This verb accepts no adverbial of manner | Questo verbo non accetta nessun complemento di modo | Ce verbe n'accepte aucun complément circonstanciel de manière | Dieses Verb akzeptiert keine adverbiale Bestimmung der Art und Weise | Este verbo no acepta ningún complemento circunstancial de modo | Este verbo não aceita nenhum adjunto adverbial de modo | この動詞はどの状態の副詞語句も受け付けません |
| `diagnostic.verbAcceptsNo.locative` | This verb accepts no locative | Questo verbo non accetta nessun complemento di stato in luogo | Ce verbe n'accepte aucun complément circonstanciel de lieu | Dieses Verb akzeptiert keine adverbiale Bestimmung des Ortes | Este verbo no acepta ningún complemento circunstancial de lugar | Este verbo não aceita nenhum adjunto adverbial de lugar | この動詞はどの場所の副詞語句も受け付けません |
| `diagnostic.verbAcceptsNo.direction` | This verb accepts no direction | Questo verbo non accetta nessun complemento di moto a luogo | Ce verbe n'accepte aucun complément circonstanciel de direction | Dieses Verb akzeptiert keine adverbiale Bestimmung der Richtung | Este verbo no acepta ningún complemento circunstancial de dirección | Este verbo não aceita nenhum adjunto adverbial de direção | この動詞はどの方向の副詞語句も受け付けません |
| `diagnostic.verbAcceptsNo.source` | This verb accepts no source | Questo verbo non accetta nessun complemento di moto da luogo | Ce verbe n'accepte aucun complément circonstanciel de provenance | Dieses Verb akzeptiert keine adverbiale Bestimmung der Herkunft | Este verbo no acepta ningún complemento circunstancial de procedencia | Este verbo não aceita nenhum adjunto adverbial de origem | この動詞はどの起点の副詞語句も受け付けません |
| `diagnostic.verbAcceptsNo.route` | This verb accepts no route | Questo verbo non accetta nessun complemento di moto per luogo | Ce verbe n'accepte aucun complément circonstanciel de passage | Dieses Verb akzeptiert keine adverbiale Bestimmung des Weges | Este verbo no acepta ningún complemento circunstancial de trayecto | Este verbo não aceita nenhum adjunto adverbial de percurso | この動詞はどの経路の副詞語句も受け付けません |
| `diagnostic.verbAcceptsNo.cause` | This verb accepts no cause | Questo verbo non accetta nessun complemento di causa | Ce verbe n'accepte aucun complément circonstanciel de cause | Dieses Verb akzeptiert keine adverbiale Bestimmung des Grundes | Este verbo no acepta ningún complemento circunstancial de causa | Este verbo não aceita nenhum adjunto adverbial de causa | この動詞はどの原因の副詞語句も受け付けません |
| `diagnostic.verbAcceptsNo.instrumental` | This verb accepts no instrumental | Questo verbo non accetta nessun complemento di mezzo | Ce verbe n'accepte aucun complément de moyen | Dieses Verb akzeptiert keinen Instrumental | Este verbo no acepta ningún complemento circunstancial de instrumento | Este verbo não aceita nenhum adjunto adverbial de instrumento | この動詞はどの手段語も受け付けません |
| `diagnostic.periodAcceptsNoCondition` | This period accepts no condition | Questo periodo non accetta nessuna condizione | Cette période n'accepte aucune condition | Dieses Satzgefüge akzeptiert keine Bedingung | Este período no acepta ninguna condición | Este período não aceita nenhuma condição | この文はどの条件も受け付けません |
| `diagnostic.periodAcceptsNoCoordination` | This period accepts no coordination | Questo periodo non accetta nessuna coordinazione | Cette période n'accepte aucune coordination | Dieses Satzgefüge akzeptiert keine Koordination | Este período no acepta ninguna coordinación | Este período não aceita nenhuma coordenação | この文はどの等位接続も受け付けません |
| `diagnostic.noNounHasAdjective` | No noun has an adjective | Nessun sostantivo ha un aggettivo | Aucun nom n'a d'adjectif | Kein Substantiv hat ein Adjektiv | Ningún sustantivo tiene un adjetivo | Nenhum substantivo tem um adjetivo | どの名詞も形容詞がありません |
| `diagnostic.noVerbHasAdverb` | No verb has an adverb | Nessun verbo ha un avverbio | Aucun verbe n'a d'adverbe | Kein Verb hat ein Adverb | Ningún verbo tiene un adverbio | Nenhum verbo tem um advérbio | どの動詞も副詞がありません |
| `diagnostic.noNounHasPossessor` | No noun has a possessor | Nessun sostantivo ha un possessore | Aucun nom n'a de possesseur | Kein Substantiv hat einen Besitzer | Ningún sustantivo tiene un poseedor | Nenhum substantivo tem um possuidor | どの名詞も所有者がありません |
| `diagnostic.noNounHasRelative` | No noun has a relative clause | Nessun sostantivo ha una proposizione relativa | Aucun nom n'a de proposition relative | Kein Substantiv hat einen Relativsatz | Ningún sustantivo tiene una oración de relativo | Nenhum substantivo tem uma oração relativa | どの名詞も関係節がありません |
| `diagnostic.noNounIsCoordinated` | No noun is coordinated | Nessun sostantivo è coordinato | Aucun nom n'est coordonné | Kein Substantiv ist beigeordnet | Ningún sustantivo es coordinado | Nenhum substantivo é coordenado | どの名詞も等位ではありません |
| `diagnostic.verbHasNoModal` | The verb has no modal | Il verbo non ha nessun verbo modale | Le verbe n'a aucun verbe modal | Das Verb hat kein Modalverb | El verbo no tiene ningún verbo modal | O verbo não tem nenhum verbo modal | 動詞はどの法助動詞もありません |
| `diagnostic.periodHasNo.condition` | This period has no condition | Questo periodo non ha nessuna condizione | Cette période n'a aucune condition | Dieses Satzgefüge hat keine Bedingung | Este período no tiene ninguna condición | Este período não tem nenhuma condição | この文はどの条件もありません |
| `diagnostic.periodHasNo.join` | This period has no coordination | Questo periodo non ha nessuna coordinazione | Cette période n'a aucune coordination | Dieses Satzgefüge hat keine Koordination | Este período no tiene ninguna coordinación | Este período não tem nenhuma coordenação | この文はどの等位接続もありません |
| `diagnostic.periodHasNo.instrument` | This period has no instrumental | Questo periodo non ha nessun complemento di mezzo | Cette période n'a aucun complément de moyen | Dieses Satzgefüge hat keinen Instrumental | Este período no tiene ningún complemento circunstancial de instrumento | Este período não tem nenhum adjunto adverbial de instrumento | この文はどの手段語もありません |
| `diagnostic.thatPeriodHasVerb` | That period has a verb | Quel periodo ha un verbo | Cette période a un verbe | Jenes Satzgefüge hat ein Verb | Ese período tiene un verbo | Esse período tem um verbo | その文は動詞があります |
| `diagnostic.periodIsCommand` | This period is a command | Questo periodo è un comando | Cette période est une commande | Dieses Satzgefüge ist ein Befehl | Este período es un comando | Este período é um comando | この文は命令です |
| `diagnostic.periodIsStatement` | This period is a statement | Questo periodo è una proposizione enunciativa | Cette période est une phrase déclarative | Dieses Satzgefüge ist ein Aussagesatz | Este período es una oración enunciativa | Este período é uma frase declarativa | この文は平叙文です |
| `diagnostic.periodAlreadyLinked` | That period is already linked | Quel periodo è già collegato | Cette période est déjà liée | Jenes Satzgefüge ist schon verknüpft | Ese período está ya vinculado | Esse período está já ligado | その文はもうリンク済みです |
| `diagnostic.nounAlreadyTaken` | Another relative clause already has this noun | Un'altra proposizione relativa ha già questo sostantivo | Une autre proposition relative a déjà ce nom | Ein anderer Relativsatz hat schon dieses Substantiv | Otra oración de relativo tiene ya este sustantivo | Outra oração relativa tem já este substantivo | 別の関係節はこの名詞がもうあります |
| `diagnostic.wordIs.noun` | This word is a noun | Questa parola è un sostantivo | Ce mot est un nom | Dieses Wort ist ein Substantiv | Esta palabra es un sustantivo | Esta palavra é um substantivo | この単語は名詞です |
| `diagnostic.wordIs.pronoun` | This word is a pronoun | Questa parola è un pronome | Ce mot est un pronom | Dieses Wort ist ein Pronomen | Esta palabra es un pronombre | Esta palavra é um pronome | この単語は代名詞です |
| `diagnostic.wordIs.adjective` | This word is an adjective | Questa parola è un aggettivo | Ce mot est un adjectif | Dieses Wort ist ein Adjektiv | Esta palabra es un adjetivo | Esta palavra é um adjetivo | この単語は形容詞です |
| `diagnostic.wordIs.nounModifier` | This word is a modifier | Questa parola è un modificatore | Ce mot est un modificateur | Dieses Wort ist ein Modifikator | Esta palabra es un modificador | Esta palavra é um modificador | この単語は修飾語です |
| `diagnostic.wordIs.verb` | This word is a verb | Questa parola è un verbo | Ce mot est un verbe | Dieses Wort ist ein Verb | Esta palabra es un verbo | Esta palavra é um verbo | この単語は動詞です |
| `diagnostic.wordIs.modal` | This word is a modal | Questa parola è un verbo modale | Ce mot est un verbe modal | Dieses Wort ist ein Modalverb | Esta palabra es un verbo modal | Esta palavra é um verbo modal | この単語は法助動詞です |
| `diagnostic.wordIs.adverb` | This word is an adverb | Questa parola è un avverbio | Ce mot est un adverbe | Dieses Wort ist ein Adverb | Esta palabra es un adverbio | Esta palavra é um advérbio | この単語は副詞です |
| `diagnostic.noWordUnderCursor` | No word is under the cursor | Nessuna parola è sotto il cursore | Aucun mot n'est sous le curseur | Kein Wort ist unter dem Cursor | Ninguna palabra está debajo del cursor | Nenhuma palavra está debaixo do cursor | どの単語もカーソルの下にありません |
| `diagnostic.wordRefusesCommand` | This word does not accept the command | Questa parola non accetta il comando | Ce mot n'accepte pas la commande | Dieses Wort akzeptiert den Befehl nicht | Esta palabra no acepta el comando | Esta palavra não aceita o comando | この単語は命令を受け付けません |
| `diagnostic.closeBracket` | Close the bracket | Chiudi la parentesi | Fermer la parenthèse | Die Klammer schließen | Cerrar el paréntesis | Fechar o parêntese | 括弧を閉じる |
| `diagnostic.moveWord` | Move the word | Sposta la parola | Déplacer le mot | Das Wort verschieben | Mover la palabra | Mover a palavra | 単語を移動 |
| `diagnostic.moveCommand` | Move the command | Sposta il comando | Déplacer la commande | Den Befehl verschieben | Mover el comando | Mover o comando | 命令を移動 |
| `diagnostic.openClause` | Open a new clause | Apri una nuova proposizione | Ouvrir une nouvelle proposition | Einen neuen Satz öffnen | Abrir una oración nueva | Abrir uma oração nova | 新しい節を開く |
| `diagnostic.openBracketWithCommand` | Open a bracket with a command | Apri una parentesi con un comando | Ouvrir une parenthèse avec une commande | Eine Klammer mit einem Befehl öffnen | Abrir un paréntesis con un comando | Abrir um parêntese com um comando | 命令で括弧を開く |
| `diagnostic.typeCommand` | Type a command | Digita un comando | Taper une commande | Einen Befehl tippen | Teclear un comando | Digitar um comando | 命令を入力 |
| `diagnostic.chooseCommand` | Choose a command in the list | Scegli un comando nell'elenco | Choisir une commande dans la liste | Einen Befehl in der Liste wählen | Elegir un comando en la lista | Escolher um comando na lista | 一覧で命令を選び |
| `diagnostic.choosePeriod` | Choose a period | Scegli un periodo | Choisir une période | Ein Satzgefüge wählen | Elegir un período | Escolher um período | 文を選び |
| `diagnostic.chooseOtherPeriod` | Choose another period | Scegli un altro periodo | Choisir une autre période | Ein anderes Satzgefüge wählen | Elegir otro período | Escolher outro período | 別の文を選び |
| `diagnostic.chooseNoun` | Choose a noun | Scegli un sostantivo | Choisir un nom | Ein Substantiv wählen | Elegir un sustantivo | Escolher um substantivo | 名詞を選び |
| `diagnostic.chooseNounInPeriod` | Choose a noun in this period | Scegli un sostantivo in questo periodo | Choisir un nom dans cette période | Ein Substantiv in diesem Satzgefüge wählen | Elegir un sustantivo en este período | Escolher um substantivo neste período | この文で名詞を選び |
| `diagnostic.chooseOtherNoun` | Choose another noun | Scegli un altro sostantivo | Choisir un autre nom | Ein anderes Substantiv wählen | Elegir otro sustantivo | Escolher outro substantivo | 別の名詞を選び |
| `diagnostic.chooseRelativeClause` | Choose a relative clause | Scegli una proposizione relativa | Choisir une proposition relative | Einen Relativsatz wählen | Elegir una oración de relativo | Escolher uma oração relativa | 関係節を選び |
| `diagnostic.chooseValue` | Choose a value | Scegli un valore | Choisir une valeur | Einen Wert wählen | Elegir un valor | Escolher um valor | 値を選び |
| `diagnostic.chooseConjunction` | Choose a conjunction | Scegli una congiunzione | Choisir une conjonction | Eine Konjunktion wählen | Elegir una conjunción | Escolher uma conjunção | 接続詞を選び |
| `diagnostic.chooseWord` | Choose a word | Scegli una parola | Choisir un mot | Ein Wort wählen | Elegir una palabra | Escolher uma palavra | 単語を選び |
| `diagnostic.chooseVerb` | Choose a verb | Scegli un verbo | Choisir un verbe | Ein Verb wählen | Elegir un verbo | Escolher um verbo | 動詞を選び |
| `diagnostic.chooseLevel` | Choose a level | Scegli un livello | Choisir un niveau | Eine Ebene wählen | Elegir un nivel | Escolher um nível | 段階を選び |
| `diagnostic.changeLevel` | Change the level | Cambia il livello | Changer le niveau | Die Ebene ändern | Cambiar el nivel | Mudar o nível | 段階を変え |
| `diagnostic.removeWordOrPeriod` | Remove a word or the period | Rimuovi una parola o il periodo | Retirer un mot ou la période | Ein Wort oder das Satzgefüge entfernen | Quitar una palabra o el período | Remover uma palavra ou o período | 単語か文を取り除き |
| `diagnostic.removeConditionOrCoordination` | Remove the condition or the coordination | Rimuovi la condizione o la coordinazione | Retirer la condition ou la coordination | Die Bedingung oder die Koordination entfernen | Quitar la condición o la coordinación | Remover a condição ou a coordenação | 条件か等位接続を取り除き |
| `console.help.cursor` | Cursor | Cursore | Curseur | Cursor | Cursor | Cursor | カーソル |

The console's own failures kept their entries (`failure.lineNotRead`, `failure.phraseNotSaved`,
`failure.phraseNotLoaded`) and their full stops; they have codes now like the rest. The purposes a misuse
leads with are [B47](B47-ui-console-command-purposes.md)'s `purpose.*`, read through `CommandDef.purposeKey`.

## Tests that selected on these literals

Every assertion moved to the code in the first commit, and the English is pinned once, by code:

- [diagnostics.test.ts](../../../packages/frontend/test/console/diagnostics.test.ts) (new): every code's
  English, one row per way it reads, typed so a code without a row fails the typecheck; every segment names
  an entry the catalogue has; the value after the colon and the full stop in Italian and Japanese; the
  purpose leading a German misuse; the four Here lines.
- [golden.test.ts](../../../packages/frontend/test/console/golden.test.ts): each command's misuse by its
  code and args (`says: { code: 'noTarget', args: { command: 'past' } }`), 33 of them.
- [parse.test.ts](../../../packages/frontend/test/console/parse.test.ts),
  [structured.test.ts](../../../packages/frontend/test/console/structured.test.ts),
  [examples.test.ts](../../../packages/frontend/test/console/examples.test.ts): codes and args.
- [PhraseConsole.test.tsx](../../../packages/frontend/test/console/PhraseConsole.test.tsx): the prompt's
  `data-code` and its fallback text ("Unknown command: /frob"), and the help page's Here line ("Cursor: cat
  · now Singular").
- [help.test.ts](../../../packages/frontend/test/console/help.test.ts): every command that acts on a word,
  and every link between periods, has a `purposeKey`, 22 keys (it used to hold them to the English
  `purpose`).
- [console.spec.ts](../../../e2e/console.spec.ts): `data-code` and the English of `/frob`, and a new test,
  "says what is wrong with a line in the interface language": `takesNoObject` in Italian, a `noTarget` in
  German with its purpose first, and the Here line in Italian ("Cursore: gatto · ora Singolare").
- [console-diagnostics.test.ts](../../../packages/engine/test/console-diagnostics.test.ts) (new): the seven
  words, and every `diagnostic.*` entry's render in all seven languages, its fallback the English.
- [manner.spec.ts](../../../e2e/manner.spec.ts), which this file listed, holds no diagnostic: nothing moved.

## Done

**2026-09-21.** Two commits: the codes, as a pure refactor (nothing on screen changed, the English pinned
by code), then the words. 85 codes, 74 entries, 7 concepts. Every family ships; none is split and none
stays literal. The renders are in each family's table above and in [Strings](#strings).

What landed differently from the plan:

1. **No existential clause.** The file's *To unblock* §2 offered two routes; the cheaper one shipped. The
   missing thing is MISSING or UNKNOWN on a bare noun, its name after the colon. A period is named `#3`,
   the way the line names it, rather than "3".
2. **No on-request rendering.** The file expected sentences about the user's word to agree with it and so
   to need C16's translate route. None does once the word follows the colon ("This word is a noun: gatto"),
   and the colon form also says a pronoun, which a subject cannot (it "è un pronome"). Probed above; not
   built, as C14 did not build its option 1.
3. **Licensing is ACCEPT, with `this` command or this verb as the subject** and the name after the colon —
   neither a label alone nor a subjectless sentence, both of which lose what the sentence is about. The
   file's "TAKE in the licensing sense" was probed and is grabbing in five languages.
4. **CHOOSE for every "Name …" and "Say which …".** NAME is seeded as giving a name. The prompts that wait
   for an argument say what to choose, and list what it can be after the colon.
5. **The explanations were reworded, not kept literal.** Each became one or two statements, most ending in
   what to do. The reasons some gave — the mood a link fixes, the circle a link would make, a noun that
   would possess itself — are gone where the constructs they need are (a non-restrictive relative, CIRCLE
   as a cycle, a reflexive possessive on a predicative); the instruction stays.
6. **The misuse diagnostic leads with the command and its help page's purpose** ("/more — to set an
   adjective's degree"), not the third-person present B47 left for it, and **`CommandDef.purpose`, the last
   English it held, is gone**. The purpose is B47's catalogue citation.
7. **The English on screen changed everywhere,** shorter, as the rulings intended: "There is no command
   /frob." is "Unknown command: /frob", "/pl takes no word." is "This command accepts no word: /pl".
8. **The Here line is "Cursor: cat · now Singular".** CURSOR labels it, as HERE could not be seeded for
   Japanese; and the value is now the catalogue's name for it, where the English line printed the setting's
   id ("now singular" in every language).
9. **A leak went with it:** `#2.obj` on a period with no object said "Period 2 has no **directObject**
   there", the internal key; it is "Missing noun: #2.obj".
10. **"Unexpected text." is defensive.** The lexer makes no token the parser does not meet before that
    branch; it ships with its entry anyway.
11. **Some diagnostics are avoidable** — the console could take the step itself. They are listed above and
    not built, as the rulings asked.

Found while probing, outside this task's lane (not filed; the engine is C20's this round):

- **French tu imperative of an -ir verb conjugated like -er.** `{ SECOND_PERSON, OPEN, BOOK def,
  imperative }` renders fr "ouvres le livre." for "ouvre le livre.": `imperativeForm` drops the 2sg -s only
  when the infinitive ends in -er (mood.ts). The same goes for *offrir*, *couvrir*, *cueillir* should they be
  seeded. The instruction register (the infinitive, "ouvrir") is unaffected, and so is every entry here.
- **Spanish and Portuguese drop a pronominal possessor on a predicative.** `{ DOG, BE, predicative
  POSSESSOR def with possessor { pronominal, 3sg masc } }` renders es "el perro es **el** poseedor.", pt "o
  cão é **o** possuidor." for "su poseedor", "o seu possuidor"; as a direct object it is right ("ve su
  poseedor").
- **German *nicht* with an indefinite object** and **the English genitive on an indefinite head**, both
  met above, are catalogued in the main tree's working copy (A182, A184, not yet committed).
- **The round trip at 5,000 seeds** fails on a passive voice under `/inf` (seeds 764, 1659, 2022): the
  printer leaves out a voice the `/inf` period no longer takes. The same three seeds fail at the branch
  point (97a146f), so it predates this task; the suite's own 400 pass.
