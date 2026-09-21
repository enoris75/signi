# A21. UI strings — the phrase console's words that are already seeded

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Done 2026-09-21.** Every item below shipped. See [Done](#done) for the renders and what changed
against the plan.

**Why it was ready:** the phrase console (P02) left "every new caption, title and message" as an English
literal for `/localize` ([P02 README, *Left open*](../../features/P-planning/P02-phrase-console/README.md)),
and [C15](C15-ui-literal-by-design.md) recorded the whole surface as outstanding. This file took the part
that needed no new word. The console's own vocabulary is in [B42](../B-needs-seed/B42-ui-console-name.md),
[B45](../B-needs-seed/B45-ui-console-lines-history-pins.md), [B46](../B-needs-seed/B46-ui-console-topics-and-labels.md)
and [B47](../B-needs-seed/B47-ui-console-command-purposes.md). Its diagnostics are in [C21](../C-needs-engine/C21-ui-console-diagnostics.md).

**Not in scope:** command names, aliases, value names (`past`, `lets`, `process`) and the syntax
(`#2.obj`, `( … )`) stay English in every interface language. That is P02's decision 3, recorded
in [C15](C15-ui-literal-by-design.md).

## Strings

The line references are to the code as it reads after this task.

### The console's frame — shipped

| literal | where now | key | verdict |
|---|---|---|---|
| period {n} (header) | [PhraseConsole.tsx:106](../../../packages/frontend/src/console/PhraseConsole.tsx#L106) | `period.name` (shared with [A20](A20-ui-keyboard-labels-on-seeded-words.md)) | shipped. The number stays outside the phrase (the [C14](C14-ui-runtime-values.md) rule): "Period 1", de "Satzgefüge 1". The header is no longer lower-case (see Done, 1) |
| hide (beside the <kbd>`</kbd> cap) | [PhraseConsole.tsx:111](../../../packages/frontend/src/console/PhraseConsole.tsx#L111) | `action.hide` | shipped: `commandOf('HIDE')`, lower-case |
| empty period | [SourceStrip.tsx:106](../../../packages/frontend/src/console/SourceStrip.tsx#L106) | `period.empty` | shipped: PERIOD_SENTENCE bare `[EMPTY]` |
| type a word, or / for a command (placeholder) | [ConsolePrompt.tsx:176](../../../packages/frontend/src/console/ConsolePrompt.tsx#L176) | `console.placeholder` | shipped: `commandOf('TYPE')` + WORD **or** COMMAND, both indefinite. The "/" is a value after the phrase: "type a word or a command (/)" |

### Key hints on the prompt line and under the list — shipped

| literal | where now | key |
|---|---|---|
| replace the period | [ConsolePrompt.tsx:389](../../../packages/frontend/src/console/ConsolePrompt.tsx#L389) | `action.replacePeriod`: `commandOf('REPLACE')` + PERIOD_SENTENCE definite, lower-case |
| cancel | [ConsolePrompt.tsx:391](../../../packages/frontend/src/console/ConsolePrompt.tsx#L391) | reuse `action.cancel`, lower-cased with CSS (a command, so no language minds) |
| choose (×2) | [ConsolePrompt.tsx:396](../../../packages/frontend/src/console/ConsolePrompt.tsx#L396), [CompletionList.tsx:272](../../../packages/frontend/src/console/CompletionList.tsx#L272) | reuse `slot.choose` |
| pick | [CompletionList.tsx:267](../../../packages/frontend/src/console/CompletionList.tsx#L267) | reuse `slot.choose` |
| clear | [ConsolePrompt.tsx:403](../../../packages/frontend/src/console/ConsolePrompt.tsx#L403) | reuse `action.clear` |
| move | [CompletionList.tsx:256](../../../packages/frontend/src/console/CompletionList.tsx#L256) | `action.move` (shared with [A20](A20-ui-keyboard-labels-on-seeded-words.md)) |

Still English, as planned: "next word", "complete", "apply", "close the list" and "back to the canvas"
wait on B43–B45.

### The completion list's titles — shipped

A `Completion` now carries `titleKey` beside its English `title`, as a candidate carries `detailKey`
beside `detail` ([complete.ts:100-101](../../../packages/frontend/src/console/language/complete.ts#L100-L101)).
The list shows the title, then `about`, the word it is about, which already followed the interface
language: "commands · cat", it "comandi · gatto" ([CompletionList.tsx:32-33](../../../packages/frontend/src/console/CompletionList.tsx#L32-L33)).

| literal | where now | key |
|---|---|---|
| commands · commands for {word} | [complete.ts:483](../../../packages/frontend/src/console/language/complete.ts#L483) | `console.list.commands`: COMMAND plural bare, then the word |
| saved phrases | [complete.ts:702](../../../packages/frontend/src/console/language/complete.ts#L702) | `console.list.savedPhrases`: PHRASE plural bare `[SAVED]` |
| conjunctions | [complete.ts:704](../../../packages/frontend/src/console/language/complete.ts#L704) | `console.list.conjunctions`: CONJUNCTION plural bare |
| periods | [complete.ts:894](../../../packages/frontend/src/console/language/complete.ts#L894) | `console.list.periods`: PERIOD_SENTENCE plural bare |
| nouns · adjectives · adverbs · pronouns | [complete.ts:608](../../../packages/frontend/src/console/language/complete.ts#L608) | reuse `palette.<role>`, the words panel's headings |
| modals | [complete.ts:605](../../../packages/frontend/src/console/language/complete.ts#L605) | `console.list.modals`: MODAL plural bare |
| {role} (a role command's words) | [complete.ts:606](../../../packages/frontend/src/console/language/complete.ts#L606) | the role command's `descriptionKey` (`slot.subject`, `slot.verb`, …) |
| relative clause on {word} | [complete.ts:847](../../../packages/frontend/src/console/language/complete.ts#L847) | reuse `satellite.relative`, then the word |
| if-condition | [complete.ts:849](../../../packages/frontend/src/console/language/complete.ts#L849) | reuse `clause.conditional` |
| period to join | [complete.ts:851](../../../packages/frontend/src/console/language/complete.ts#L851) | reuse `clause.coordinated` |
| instrument | [complete.ts:853](../../../packages/frontend/src/console/language/complete.ts#L853) | reuse `slot.instrumental` |
| possessor of {word} | [complete.ts:855](../../../packages/frontend/src/console/language/complete.ts#L855) | reuse `slot.possessor`, then the word |
| coordinate with {word} | [complete.ts:857](../../../packages/frontend/src/console/language/complete.ts#L857) | reuse `satellite.coordination`, then the word |
| empty (a period row with no words) | [complete.ts:780](../../../packages/frontend/src/console/language/complete.ts#L780) | reuse `slot.empty`, as the row's `detailKey` |

Still English, as planned: "recent lines" and "pinned and recent lines" ([complete.ts:198](../../../packages/frontend/src/console/language/complete.ts#L198))
wait on [B45](../B-needs-seed/B45-ui-console-lines-history-pins.md), and "values for /x"
([complete.ts:705](../../../packages/frontend/src/console/language/complete.ts#L705)) on
[B46](../B-needs-seed/B46-ui-console-topics-and-labels.md).

### Command descriptions the catalogue already had — shipped

The list and the help page show `descriptionKey` when a command has one
([ConsoleHelp.tsx:69](../../../packages/frontend/src/console/ConsoleHelp.tsx#L69)). `setting()`'s sixth
argument now passes the key [C13](C13-ui-grammatical-function-words.md) built for the canvas's own
control of the same value:

| commands | where now | key |
|---|---|---|
| `/in /through /under /over /around /behind /front` | [commands.ts:421](../../../packages/frontend/src/console/language/commands.ts#L421) | `specifier.value.<value>` |
| `/because /fault /thanks` | [commands.ts:441](../../../packages/frontend/src/console/language/commands.ts#L441) | `sentiment.connector.<value>` |
| `/more /most /less /least /equally` | [commands.ts:538](../../../packages/frontend/src/console/language/commands.ts#L538) | `degree.value.<value>`. **Judged and accepted:** cited on BIG, so en "bigger" / "biggest" and de "größer" / "am größten" — what the canvas's degree chip says. `/plain` has no entry (`degree.value.positive` is "—") and waits on [B46](../B-needs-seed/B46-ui-console-topics-and-labels.md) |
| `/del` | [commands.ts:640](../../../packages/frontend/src/console/language/commands.ts#L640) | `action.remove`: the bare `commandOf('REMOVE')`, "Remove". What `/del` removes is the usage line's to say, which spells its arguments out |

### Topics and the help page's parts — shipped

| literal | where now | key |
|---|---|---|
| the period’s words (topic) · The period’s words (help part) | [commands.ts:824](../../../packages/frontend/src/console/language/commands.ts#L824), [ConsoleHelp.tsx:20](../../../packages/frontend/src/console/ConsoleHelp.tsx#L20) | `console.topic.words`: WORD plural definite, `possessor`: PERIOD_SENTENCE definite |
| links between periods | [commands.ts:843](../../../packages/frontend/src/console/language/commands.ts#L843) | `console.topic.links`: PERIOD_SENTENCE plural bare `[LINKED]`, "linked periods" |
| the period | [commands.ts:844](../../../packages/frontend/src/console/language/commands.ts#L844) | `console.topic.period`: PERIOD_SENTENCE definite |
| On a noun · On a verb · On an adjective · On a period | [ConsoleHelp.tsx:21-24](../../../packages/frontend/src/console/ConsoleHelp.tsx#L21-L24) | reuse `category.noun`, `slot.verb`, `category.adjective`, `period.name`, the bare noun as the keyboard sheet heads its sections |

Still English, as planned: "place or route", "mood" and "workspace" ([commands.ts:829, 842, 845](../../../packages/frontend/src/console/language/commands.ts#L829))
and the workspace's help part ([ConsoleHelp.tsx:25](../../../packages/frontend/src/console/ConsoleHelp.tsx#L25))
wait on [B46](../B-needs-seed/B46-ui-console-topics-and-labels.md).

### Results of `/save` and `/load` — shipped

A transcript entry now carries `detailKey` / `messageKey` beside its English `detail` / `message`
([usePhraseConsole.ts:48-51](../../../packages/frontend/src/console/usePhraseConsole.ts#L48-L51)), and the
transcript draws the key when it draws the entry, so the line follows a later change of language as a
help page does.

| literal | where now | key |
|---|---|---|
| Saved. | [usePhraseConsole.ts:628](../../../packages/frontend/src/console/usePhraseConsole.ts#L628) | reuse `toast.phraseSaved`, what the toolbar's save says |
| Could not save the phrase. | [usePhraseConsole.ts:634](../../../packages/frontend/src/console/usePhraseConsole.ts#L634) | reuse `failure.phraseNotSaved` |
| Loaded. | [usePhraseConsole.ts:655](../../../packages/frontend/src/console/usePhraseConsole.ts#L655) | reuse `toast.phraseLoaded` |
| Could not load the phrase. | [usePhraseConsole.ts:661](../../../packages/frontend/src/console/usePhraseConsole.ts#L661) | reuse `failure.phraseNotLoaded` |

"There is no saved phrase “…”." ([usePhraseConsole.ts:647](../../../packages/frontend/src/console/usePhraseConsole.ts#L647))
is existential, so it stays in [C21](../C-needs-engine/C21-ui-console-diagnostics.md).

### The help page's usage line and example — shipped

- **The usage line.** `usageOf` ([help.ts:30](../../../packages/frontend/src/console/language/help.ts#L30))
  takes the three placeholders as `UsageWords`, English by default, and the page passes them from
  the catalogue ([Transcript.tsx:146-150](../../../packages/frontend/src/console/Transcript.tsx#L146-L150)):
  `console.usage.word` / `.name` / `.command`, bare WORD / NAME_NOUN / COMMAND, lower-case —
  "/subj ( parola … )", "/save nome", "/help [comando]". The brackets, `#n.noun` and the value lists
  stay as written.
- **The example** is still written once, in English ([help.ts:58](../../../packages/frontend/src/console/language/help.ts#L58)),
  and is now shown in the words of the interface language, as the source strip writes them:
  `/subj ( gatto /pl )` beside *i gatti*. `exampleIn` ([help.ts:181](../../../packages/frontend/src/console/language/help.ts#L181))
  applies the example from an empty period, which says which concept each word names, and
  `printWords` ([print.ts:488](../../../packages/frontend/src/console/language/print.ts#L488)) writes those
  words again with the printer's own `printWord`, keeping everything else as written. Not
  `printPeriod`: see Done, 5.

## Tests that select on these literals

[complete.test.ts](../../../packages/frontend/test/console/complete.test.ts) asserted "commands for" and
"the period’s words"; it now asserts the keys, and gained a `titles` block (every list title and its
key) and a check of the command descriptions' keys. [help.test.ts](../../../packages/frontend/test/console/help.test.ts)
keeps its English usage lines and adds the Italian placeholders. [PhraseConsole.test.tsx](../../../packages/frontend/test/console/PhraseConsole.test.tsx)
kept its English assertions (the fallbacks) and gained *in the interface language*: the header, the
empty period, the placeholder, the list's title, the key hints, a help page's usage and example, the
help overlay's parts and `/save`'s result, in Italian. [examples.test.ts](../../../packages/frontend/test/console/examples.test.ts)
prints every help example in Italian and reads it back. [uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts)
pins the new entries. [console.spec.ts](../../../e2e/console.spec.ts) switches a live console to Italian
and German. "saved phrases" and "relative clause on" in [save-load.spec.ts](../../../e2e/save-load.spec.ts)
and [relative.spec.ts](../../../e2e/relative.spec.ts) are a `describe` name and a comment, not
selectors, and "empty period" in the canvas suites is test prose.

## Done

**2026-09-21.** Eighteen new entries: sixteen of this task's own, and two shared with
[A20](A20-ui-keyboard-labels-on-seeded-words.md) (`period.name`, `action.move`), which both
tasks add in identical text. Rendered 2026-09-21 by the engine
source at HEAD over an in-memory seed of the corpus, through `buildUiStrings`, with formats applied;
the backend then booted clean on a seeded database with the built catalogue.

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `period.name` | Period | Periodo | Période | Satzgefüge | Período | Período | 文 |
| `action.move` | move | sposta | déplacer | verschieben | mover | mover | 移動 |
| `action.hide` | hide | nascondi | cacher | verstecken | esconder | esconder | 隠し |
| `period.empty` | empty period | periodo vuoto | période vide | leeres Satzgefüge | período vacío | período vazio | 空の文 |
| `console.placeholder` | type a word or a command | digita una parola o un comando | taper un mot ou une commande | ein Wort oder einen Befehl tippen | teclear una palabra o un comando | digitar uma palavra ou um comando | 単語か命令を入力 |
| `action.replacePeriod` | replace the period | sostituisci il periodo | remplacer la période | das Satzgefüge ersetzen | reemplazar el período | substituir o período | 文を置き換え |
| `action.remove` | Remove | Rimuovi | Retirer | Entfernen | Quitar | Remover | 取り除き |
| `console.list.commands` | commands | comandi | commandes | Befehle | comandos | comandos | 命令 |
| `console.list.savedPhrases` | saved phrases | frasi salvate | phrases enregistrées | gespeicherte Phrasen | frases guardadas | frases salvas | 保存済みのフレーズ |
| `console.list.conjunctions` | conjunctions | congiunzioni | conjonctions | Konjunktionen | conjunciones | conjunções | 接続詞 |
| `console.list.periods` | periods | periodi | périodes | Satzgefüge | períodos | períodos | 文 |
| `console.list.modals` | modals | verbi modali | verbes modaux | Modalverben | verbos modales | verbos modais | 法助動詞 |
| `console.topic.words` | the period's words | le parole del periodo | les mots de la période | die Wörter des Satzgefüges | las palabras del período | as palavras do período | 文の単語 |
| `console.topic.links` | linked periods | periodi collegati | périodes liées | verknüpfte Satzgefüge | períodos vinculados | períodos ligados | リンク済みの文 |
| `console.topic.period` | the period | il periodo | la période | das Satzgefüge | el período | o período | 文 |
| `console.usage.word` | word | parola | mot | Wort | palabra | palavra | 単語 |
| `console.usage.name` | name | nome | nom | Name | nombre | nome | 名前 |
| `console.usage.command` | command | comando | commande | Befehl | comando | comando | 命令 |

The reused entries, as they render today:

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `action.cancel` | Cancel | Annulla | Annuler | Annullieren | Cancelar | Cancelar | キャンセル |
| `slot.choose` | choose | scegli | choisir | wählen | elegir | escolher | 選び |
| `action.clear` | clear | cancella | effacer | löschen | borrar | limpar | 消去 |
| `palette.noun` | Nouns | Sostantivi | Noms | Substantive | Sustantivos | Substantivos | 名詞 |
| `palette.adjective` | Adjectives | Aggettivi | Adjectifs | Adjektive | Adjetivos | Adjetivos | 形容詞 |
| `palette.adverb` | Adverbs | Avverbi | Adverbes | Adverbien | Adverbios | Advérbios | 副詞 |
| `palette.pronoun` | Pronouns | Pronomi | Pronoms | Pronomen | Pronombres | Pronomes | 代名詞 |
| `satellite.relative` | Relative clause | Proposizione relativa | Proposition relative | Relativsatz | Oración de relativo | Oração relativa | 関係節 |
| `clause.conditional` | Conditional clause | Proposizione condizionale | Proposition conditionnelle | Konditionaler Satz | Oración condicional | Oração condicional | 条件節 |
| `clause.coordinated` | Coordinated clause | Proposizione coordinata | Proposition coordonnée | Beigeordneter Satz | Oración coordinada | Oração coordenada | 等位節 |
| `slot.instrumental` | Instrumental | Complemento di mezzo | Complément de moyen | Instrumental | Complemento circunstancial de instrumento | Adjunto adverbial de instrumento | 手段語 |
| `slot.possessor` | Possessor | Possessore | Possesseur | Besitzer | Poseedor | Possuidor | 所有者 |
| `satellite.coordination` | Coordination | Coordinazione | Coordination | Koordination | Coordinación | Coordenação | 等位接続 |
| `slot.empty` | empty | vuoto | vide | leer | vacío | vazio | 空 |
| `category.noun` | Noun | Sostantivo | Nom | Substantiv | Sustantivo | Substantivo | 名詞 |
| `slot.verb` | Verb | Verbo | Verbe | Verb | Verbo | Verbo | 動詞 |
| `category.adjective` | Adjective | Aggettivo | Adjectif | Adjektiv | Adjetivo | Adjetivo | 形容詞 |
| `toast.phraseSaved` | Saved phrase | Frase salvata | Phrase enregistrée | Gespeicherte Phrase | Frase guardada | Frase salva | 保存済みのフレーズ |
| `toast.phraseLoaded` | Loaded phrase | Frase caricata | Phrase chargée | Geladene Phrase | Frase cargada | Frase carregada | 読み込み済みのフレーズ |
| `failure.phraseNotSaved` | The phrase could not be saved. | La frase non poteva essere salvata. | La phrase ne pouvait pas être enregistrée. | Die Phrase konnte nicht gespeichert werden. | La frase no podía ser guardada. | A frase não podia ser salva. | フレーズは保存することができませんでした。 |
| `failure.phraseNotLoaded` | That phrase could not be loaded. | Quella frase non poteva essere caricata. | Cette phrase ne pouvait pas être chargée. | Jene Phrase konnte nicht geladen werden. | Esa frase no podía ser cargada. | Essa frase não podia ser carregada. | そのフレーズは読み込むことができませんでした。 |
| `specifier.value.under` | under | sotto | sous | unter | debajo de | debaixo de | 〜の下で |
| `specifier.value.in_front_of` | in front of | davanti a | devant | vor | delante de | em frente de | 〜の前で |
| `sentiment.connector.negative` | through the fault of | per colpa di | par la faute de | durch die Schuld | por culpa de | por culpa de | 〜のせいで |
| `sentiment.connector.positive` | thanks to | grazie a | grâce à | dank | gracias a | graças a | 〜のおかげで |
| `degree.value.more` | bigger | più | plus | größer | más | mais | もっと |
| `degree.value.most` | biggest | il più | le plus | am größten | el más | o mais | 最も |
| `degree.value.less` | less | meno | moins | weniger | menos | menos | それほど〜ない |
| `degree.value.least` | least | il meno | le moins | am wenigsten | el menos | o menos | 最も〜ない |
| `degree.value.equally` | equally | ugualmente | aussi | gleich | igual de | igualmente | 同じくらい |

The help examples, printed by `exampleIn` over the real corpus (the seeded e2e database's
`/api/concepts` and `/api/ui-strings`). All 87 examples in all seven languages keep their own command
and read back into the phrase the English example builds (609 of 609):

| example | en | it | de | es | ja |
|---|---|---|---|---|---|
| `rel` | /subj ( child /rel subj { /verb ( love ) /obj ( cat ) } ) /verb ( run ) | /subj ( bambino /rel subj { /verb ( amare ) /obj ( gatto ) } ) /verb ( correre ) | /subj ( Kind /rel subj { /verb ( lieben ) /obj ( Kater ) } ) /verb ( laufen ) | /subj ( CHILD /rel subj { /verb ( amar ) /obj ( gato ) } ) /verb ( correr ) | /subj ( 子供 /rel subj { /verb ( 愛する ) /obj ( 猫 ) } ) /verb ( 走る ) |
| `modal` | /subj ( cat ) /verb ( eat /modal can ) | /subj ( gatto ) /verb ( mangiare /modal potere ) | /subj ( Kater ) /verb ( essen /modal können ) | /subj ( gato ) /verb ( comer /modal poder ) | /subj ( 猫 ) /verb ( 食べる /modal ことができる ) |
| `more` | /subj ( cat /adj ( big /more ) ) /verb ( run ) | /subj ( gatto /adj ( BIG /more ) ) /verb ( correre ) | /subj ( Kater /adj ( BIG /more ) ) /verb ( laufen ) | /subj ( gato /adj ( BIG /more ) ) /verb ( correr ) | /subj ( 猫 /adj ( BIG /more ) ) /verb ( 走る ) |

fr and pt read like it ("chat", "enfant"; pt "criança"). Where a label names two words the example
writes the concept's id (it/fr/de/es/pt/ja `BIG`, es `CHILD`), as the source strip does: that is
`printWord`'s rule, and it is what makes the line read back as the same word.

What landed differently from the plan:

1. **The console's header is no longer lower-case.** It read "period 1", written lower-case in the
   literal. `period.name` is capitalized for headings and German capitalizes the noun anyway
   ("Satzgefüge 1"), so the header shows the name as rendered rather than lowering it with CSS:
   "Period 1", "Periodo 1". Lower-casing with CSS is kept for commands only (`action.cancel` in the
   key hints), which lower-case in every language.
2. **A list title and its word are joined by " · ".** "commands for cat", "possessor of cat" and
   "relative clause on child" had English prepositions between the title and the word. The word
   stays outside the phrase, so they became "commands · cat", "Possessor · cat", "Relative clause ·
   child". "period to join" became "Coordinated clause", the name of the clause it makes.
3. **`/del` had a key, and the wrong one.** The task said it read English because nobody gave it a
   key. It read `action.clear`, "clear", which is only half of what it does (it takes a word, a link
   or the period away). It reads `action.remove` now.
4. **"On the workspace" became the literal "Workspace".** The other parts dropped their "On a"; the
   one still waiting on [B46](../B-needs-seed/B46-ui-console-topics-and-labels.md) dropped it too,
   so the page reads as one list. The topic "links between periods" is now "linked periods" in
   English as well, the key's own words.
5. **The example is printed word by word, not by `printPeriod`.** Printing the example's phrase
   canonically was the plan. Probed over every example, it lost the command the page is about in 19
   of the 87: canonical printing writes only what differs from the default, so `/sg`, `/masc`, `/the`,
   `/in`, `/through`, `/because`, `/present`, `/neutral`, `/active`, `/pos`, `/plain`, `/feature`,
   `/statement` and `/new` vanished, `/tense past` and `/aspect progressive` became their shortcuts,
   `/voice passive` became `/passive`, and `/del adj` and `/pin` left nothing behind. And the five
   whose clause is typed in braces (`/rel`, `/if`, `/join`, `/inst`, `/level`) printed as `#2`
   references with the clause on a second line. So `apply` now records every word it resolved, with
   its span, its concept and the spec it was read under (`ApplyResult.resolved`,
   [apply.ts:496](../../../packages/frontend/src/console/language/apply.ts#L496)), and `printWords`
   puts each back as `printWord` writes it, leaving the rest of the line as written. A pronoun given
   by its form ("she") is left as typed, since its person alone would lose its gender. The round
   trip is held in [examples.test.ts](../../../packages/frontend/test/console/examples.test.ts): every
   example, printed in Italian, applies without a diagnostic to the state and the effects the English
   one makes, and still shows its command. The page computes the example as it draws, from the
   console's vocabulary, so it follows a change of language; should the line not read (the words not
   loaded yet) or applying throw, the English stands.
6. **Not in this task, and catalogued afterwards as [A22](../A-ready/A22-ui-console-completion-rows.md):**
   the reference rows' "period {n}" detail
   ([complete.ts:743, 764, 882](../../../packages/frontend/src/console/language/complete.ts#L743)), the
   new-phrase rows ("new clause · … is its subject", "new phrase", "new period",
   [complete.ts:812-818](../../../packages/frontend/src/console/language/complete.ts#L812-L818)), `/del`'s
   argument descriptions (`DEL_VALUES`, [complete.ts:710-725](../../../packages/frontend/src/console/language/complete.ts#L710-L725)),
   "did you mean" ([complete.ts:923](../../../packages/frontend/src/console/language/complete.ts#L923))
   and the echo icon's "from the canvas" (B43 has that one). "period {n}" could take `period.name` and
   the number, as the header does, once a candidate can carry a value after its `detailKey`.
7. **Found by the round-trip stress run, and filed as [A179](../../bugs/A-must-fix/A179-passive-infinitive-hidden-and-unprinted.md):**
   at `SEEDS=5000`, seeds 764, 1659 and 2022 fail the same way before and after this task. A passive
   set before `/inf` stays in the translation, but the canvas hides its control and the printer
   drops `/passive`.
