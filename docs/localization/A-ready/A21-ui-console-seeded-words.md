# A21. UI strings — the phrase console's words that are already seeded

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Ready:** the phrase console (P02) left "every new caption, title and message" as an English literal
for `/localize` ([P02 README, *Left open*](../../features/P-planning/P02-phrase-console/README.md)), and
[C15](../done/C15-ui-literal-by-design.md) recorded the whole surface as outstanding. This file takes the
part that needs no new word. The console's own vocabulary is in [B42](../B-needs-seed/B42-ui-console-name.md),
[B45](../B-needs-seed/B45-ui-console-lines-history-pins.md), [B46](../B-needs-seed/B46-ui-console-topics-and-labels.md)
and [B47](../B-needs-seed/B47-ui-console-command-purposes.md). Its diagnostics are in [C21](../C-needs-engine/C21-ui-console-diagnostics.md).

**Not in scope:** command names, aliases, value names (`past`, `lets`, `process`) and the syntax
(`#2.obj`, `( … )`) stay English in every interface language. That is P02's decision 3, recorded
in [C15](../done/C15-ui-literal-by-design.md).

## Strings

### The console's frame

| literal | where | key | plan |
|---|---|---|---|
| period {n} (header) | [PhraseConsole.tsx:99](../../../packages/frontend/src/console/PhraseConsole.tsx#L99) | `period.name` ([A20](A20-ui-keyboard-labels-on-seeded-words.md)) | the number stays outside the phrase, the [C14](../done/C14-ui-runtime-values.md) rule. The header is italic lower-case, so set the case with CSS |
| hide (beside the <kbd>`</kbd> cap) | [PhraseConsole.tsx:104](../../../packages/frontend/src/console/PhraseConsole.tsx#L104) | `action.hide` | `commandOf('HIDE')`, lower-case |
| empty period | [SourceStrip.tsx:105](../../../packages/frontend/src/console/SourceStrip.tsx#L105) | `period.empty` | PERIOD_SENTENCE bare `[EMPTY]` |
| type a word, or / for a command (placeholder) | [ConsolePrompt.tsx:175](../../../packages/frontend/src/console/ConsolePrompt.tsx#L175) | `console.placeholder` | `commandOf('TYPE')` + WORD **or** COMMAND, both indefinite (the `slot.nounOrPronoun.placeholder` shape). Keep the "/" outside the phrase, as a value: "type a word or a command (/)" |

### Key hints on the prompt line and under the list

| literal | where | key |
|---|---|---|
| replace the period | [ConsolePrompt.tsx:386](../../../packages/frontend/src/console/ConsolePrompt.tsx#L386) | `action.replacePeriod`: `commandOf('REPLACE')` + PERIOD_SENTENCE definite, lower-case |
| cancel | [ConsolePrompt.tsx:387](../../../packages/frontend/src/console/ConsolePrompt.tsx#L387) | reuse `action.cancel`, lower-cased with CSS |
| choose (×2) | [ConsolePrompt.tsx:392](../../../packages/frontend/src/console/ConsolePrompt.tsx#L392), [CompletionList.tsx:269](../../../packages/frontend/src/console/CompletionList.tsx#L269) | reuse `slot.choose` |
| pick | [CompletionList.tsx:264](../../../packages/frontend/src/console/CompletionList.tsx#L264) | reuse `slot.choose` |
| clear | [ConsolePrompt.tsx:399](../../../packages/frontend/src/console/ConsolePrompt.tsx#L399) | reuse `action.clear` |
| move | [CompletionList.tsx:255](../../../packages/frontend/src/console/CompletionList.tsx#L255) | `action.move` ([A20](A20-ui-keyboard-labels-on-seeded-words.md)) |

"next word", "complete", "apply", "close the list" and "back to the canvas" wait on B43–B45.

### The completion list's titles

A list title is `title` plus an optional `about`, the word it is about. `about` already follows the
interface language. Keep it outside the phrase, after the title (the C14 rule).

| literal | where | key |
|---|---|---|
| commands · commands for {word} | [complete.ts:481](../../../packages/frontend/src/console/language/complete.ts#L481) | `console.list.commands`: COMMAND plural bare, then the word |
| saved phrases | [complete.ts:690](../../../packages/frontend/src/console/language/complete.ts#L690) | `console.list.savedPhrases`: PHRASE plural bare `[SAVED]` |
| conjunctions | [complete.ts:690](../../../packages/frontend/src/console/language/complete.ts#L690) | `console.list.conjunctions`: CONJUNCTION plural bare |
| periods | [complete.ts:873](../../../packages/frontend/src/console/language/complete.ts#L873) | `console.list.periods`: PERIOD_SENTENCE plural bare |
| nouns · adjectives · adverbs · pronouns | [complete.ts:598](../../../packages/frontend/src/console/language/complete.ts#L598) (`` `${spec.roles[0]}s` ``, English role names) | reuse `palette.<role>`, the words panel's headings |
| modals | [complete.ts:596](../../../packages/frontend/src/console/language/complete.ts#L596) | `console.list.modals`: MODAL plural bare |
| {role} (a role command's words) | [complete.ts:597](../../../packages/frontend/src/console/language/complete.ts#L597) (reads `def.description`, the English) | read `def.descriptionKey`, which every role command has |
| relative clause on {word} | [complete.ts:826](../../../packages/frontend/src/console/language/complete.ts#L826) | reuse `satellite.relative`, then the word |
| if-condition | [complete.ts:828](../../../packages/frontend/src/console/language/complete.ts#L828) | reuse `clause.conditional` |
| period to join | [complete.ts:830](../../../packages/frontend/src/console/language/complete.ts#L830) | reuse `clause.coordinated` |
| instrument | [complete.ts:832](../../../packages/frontend/src/console/language/complete.ts#L832) | reuse `slot.instrumental` |
| possessor of {word} | [complete.ts:834](../../../packages/frontend/src/console/language/complete.ts#L834) | reuse `slot.possessor`, then the word |
| coordinate with {word} | [complete.ts:836](../../../packages/frontend/src/console/language/complete.ts#L836) | reuse `satellite.coordination`, then the word |
| empty (a period row with no words) | [complete.ts:764](../../../packages/frontend/src/console/language/complete.ts#L764) | reuse `slot.empty` |

"recent lines" and "values for /x" wait on [B45](../B-needs-seed/B45-ui-console-lines-history-pins.md) and
[B46](../B-needs-seed/B46-ui-console-topics-and-labels.md).

### Command descriptions the catalogue already has

The list and the help page show `descriptionKey` when a command has one
([ConsoleHelp.tsx:65](../../../packages/frontend/src/console/ConsoleHelp.tsx#L65)). These commands have
none, although [C13](../done/C13-ui-grammatical-function-words.md) built the entries the canvas reads
for the same values:

| commands | where | key |
|---|---|---|
| `/in /through /under /over /around /behind /front` | [commands.ts:403-424](../../../packages/frontend/src/console/language/commands.ts#L403-L424) | `specifier.value.<value>` |
| `/because /fault /thanks` | [commands.ts:425-443](../../../packages/frontend/src/console/language/commands.ts#L425-L443) | `sentiment.connector.<value>` |
| `/more /most /less /least /equally` | [commands.ts:519-537](../../../packages/frontend/src/console/language/commands.ts#L519-L537) | `degree.value.<value>`. **Judge:** these are cited on BIG, so en reads "bigger" / "biggest" and de "größer" / "am größten". The canvas's degree chip shows the same. `/plain` has no entry (`degree.value.positive` is "—") and waits on [B46](../B-needs-seed/B46-ui-console-topics-and-labels.md) |

`setting()` takes the key as its sixth argument, which these calls pass as `undefined`.

One more command reads English only because nobody gave it a key:

| command | where | key |
|---|---|---|
| `/del` "remove what the context names" | [commands.ts:633](../../../packages/frontend/src/console/language/commands.ts#L633) | `action.remove`: the bare `commandOf('REMOVE')`, "Remove". What `/del` removes is the help page's job, which spells out its arguments |

### Topics and the help page's parts

| literal | where | key |
|---|---|---|
| the period’s words (topic) · The period’s words (help part) | [commands.ts:818](../../../packages/frontend/src/console/language/commands.ts#L818), [ConsoleHelp.tsx:16](../../../packages/frontend/src/console/ConsoleHelp.tsx#L16) | `console.topic.words`: WORD plural definite, `possessor`: PERIOD_SENTENCE definite |
| links between periods | [commands.ts:837](../../../packages/frontend/src/console/language/commands.ts#L837) | `console.topic.links`: PERIOD_SENTENCE plural bare `[LINKED]`, "linked periods" |
| the period | [commands.ts:838](../../../packages/frontend/src/console/language/commands.ts#L838) | `console.topic.period`: PERIOD_SENTENCE definite |
| On a noun · On a verb · On an adjective · On a period | [ConsoleHelp.tsx:17-20](../../../packages/frontend/src/console/ConsoleHelp.tsx#L17-L20) | reuse `category.noun`, `slot.verb`, `category.adjective`, `period.name`. Drop the "On a": the keyboard sheet heads its sections with the bare noun too |

"place or route", "mood", "workspace" and "On the workspace" wait on [B46](../B-needs-seed/B46-ui-console-topics-and-labels.md).

### Results of `/save` and `/load`

| literal | where | key |
|---|---|---|
| Saved. | [usePhraseConsole.ts:623](../../../packages/frontend/src/console/usePhraseConsole.ts#L623) | reuse `toast.phraseSaved`, what the toolbar's save says |
| Could not save the phrase. | [usePhraseConsole.ts:625](../../../packages/frontend/src/console/usePhraseConsole.ts#L625) | reuse `failure.phraseNotSaved` |
| Loaded. | [usePhraseConsole.ts:645](../../../packages/frontend/src/console/usePhraseConsole.ts#L645) | reuse `toast.phraseLoaded` |
| Could not load the phrase. | [usePhraseConsole.ts:647](../../../packages/frontend/src/console/usePhraseConsole.ts#L647) | reuse `failure.phraseNotLoaded` |

"There is no saved phrase “…”." ([:637](../../../packages/frontend/src/console/usePhraseConsole.ts#L637))
is existential, so it is in [C21](../C-needs-engine/C21-ui-console-diagnostics.md).

### The help page's usage line and example

- **The usage line** ([help.ts:11-35](../../../packages/frontend/src/console/language/help.ts#L11-L35))
  spells a command's argument with three English placeholders: `word`, `name` and `command`
  (`/subj ( word … )`, `/save name`, `/help [command]`). Localize them: `console.usage.word` /
  `.name` / `.command`, bare WORD / NAME_NOUN / COMMAND, lower-case. The brackets, `#n.noun` and the
  value lists stay as written.
- **The example** is written with English words ([help.ts:38-133](../../../packages/frontend/src/console/language/help.ts#L38-L133),
  `/subj ( cat ) /verb ( eat )`) and shown as that text ([Transcript.tsx:172](../../../packages/frontend/src/console/Transcript.tsx#L172)).
  English words resolve in every language (`resolveWord` falls back to them), so the example *runs*.
  But the source strip and every other printed line write words in the interface language, so the
  page shows `/subj ( cat )` above an Italian sentence about *il gatto*. This needs no catalog entry.
  The page already builds the example's state to render its sentence
  ([usePhraseConsole.ts:915-927](../../../packages/frontend/src/console/usePhraseConsole.ts#L915-L927)).
  Print that state with `print.ts` and show the printed line. [examples.test.ts](../../../packages/frontend/test/console/examples.test.ts)
  already runs every example, so extend it to print each one in a second language.

## Probe renders

Rendered 2026-09-21 by the engine source at HEAD over an in-memory seed of the corpus, through the
entry renderer [`buildUiStrings`](../../../packages/backend/src/uiStrings.ts) uses, with formats
applied. Re-verify on authoring.

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `action.hide` | hide | nascondi | cacher | verstecken | esconder | esconder | 隠し |
| `period.empty` | empty period | periodo vuoto | période vide | leeres Satzgefüge | período vacío | período vazio | 空の文 |
| `console.placeholder` | type a word or a command | digita una parola o un comando | taper un mot ou une commande | ein Wort oder einen Befehl tippen | teclear una palabra o un comando | digitar uma palavra ou um comando | 単語か命令を入力 |
| `action.replacePeriod` | replace the period | sostituisci il periodo | remplacer la période | das Satzgefüge ersetzen | reemplazar el período | substituir o período | 文を置き換え |
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
| `action.remove` | Remove | Rimuovi | Retirer | Entfernen | Quitar | Remover | 取り除き |

The reused entries, as they render today:

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `specifier.value.in_front_of` | in front of | davanti a | devant | vor | delante de | em frente de | 〜の前で |
| `specifier.value.through` | through | attraverso | à travers | durch | por | por | 〜を通って |
| `sentiment.connector.negative` | through the fault of | per colpa di | par la faute de | durch die Schuld | por culpa de | por culpa de | 〜のせいで |
| `sentiment.connector.positive` | thanks to | grazie a | grâce à | dank | gracias a | graças a | 〜のおかげで |
| `degree.value.more` | bigger | più | plus | größer | más | mais | もっと |
| `degree.value.least` | least | il meno | le moins | am wenigsten | el menos | o menos | 最も〜ない |
| `palette.noun` | Nouns | Sostantivi | Noms | Substantive | Sustantivos | Substantivos | 名詞 |
| `clause.coordinated` | Coordinated clause | Proposizione coordinata | Proposition coordonnée | Beigeordneter Satz | Oración coordinada | Oração coordenada | 等位節 |
| `slot.empty` | empty | vuoto | vide | leer | vacío | vazio | 空 |
| `toast.phraseSaved` | Saved phrase | Frase salvata | Phrase enregistrée | Gespeicherte Phrase | Frase guardada | Frase salva | 保存済みのフレーズ |
| `failure.phraseNotLoaded` | That phrase could not be loaded. | Quella frase non poteva essere caricata. | Cette phrase ne pouvait pas être chargée. | Jene Phrase konnte nicht geladen werden. | Esa frase no podía ser cargada. | Essa frase não podia ser carregada. | そのフレーズは読み込むことができませんでした。 |

## Tests that select on these literals

[complete.test.ts](../../../packages/frontend/test/console/complete.test.ts) asserts list titles
("commands for", "the period’s words"). [PhraseConsole.test.tsx](../../../packages/frontend/test/console/PhraseConsole.test.tsx)
reads the help page. [help.test.ts](../../../packages/frontend/test/console/help.test.ts) asserts
usage lines. "empty period" also appears in several canvas suites as test prose (App, PhraseCanvas,
PhraseWorkspace), so check each hit. [save-load.spec.ts](../../../e2e/save-load.spec.ts) and
[relative.spec.ts](../../../e2e/relative.spec.ts) read "saved phrases" and "relative clause on".
