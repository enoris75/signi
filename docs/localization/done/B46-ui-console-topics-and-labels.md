# B46. UI strings — the console's topics, list annotations and help-page labels

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Done 2026-09-21.** Every item below shipped. See [Done](#done) for the renders and what changed
against the plan.

**Why it was blocked:** the words that organize the console's reference. The topics that group the
commands (mood, workspace, the spatial relation), the short annotations on a completion row ("now",
"also"), and the help page's labels (usage, example) each needed a noun or an adverb the corpus lacked.
[A21](A21-ui-console-seeded-words.md) took the topics and titles whose words were seeded.

## Seeded

VALUE and SPATIAL were seeded ahead of this task, with LINK and LIST, so that the tasks sharing them
could run side by side. The other eight are new. The forms are the ones seeded.

| concept | role | gloss | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|---|---|
| MOOD | noun, count | the form of a verb that shows how a clause is meant | mood(s) | modo, -i (m) | mode(s) (m) | Modus, Modi (m; des Modus) | modo(s) (m) | modo(s) (m) | 叙法 |
| STATEMENT | noun, count, isA CLAUSE | a clause that asserts something | statement(s) | proposizione enunciativa (f) | phrase déclarative (f) | Aussagesatz, -sätze (m) | oración enunciativa (f) | frase declarativa (f) | 平叙文 |
| WORKSPACE | noun, count | all the periods being built at once | workspace(s) | area di lavoro (f) | espace de travail (m) | Arbeitsbereich, -e (m) | espacio de trabajo (m) | espaço de trabalho (m) | ワークスペース |
| POSITIVE_DEGREE | noun, count, isA DEGREE_GRAMMAR | the plain form of an adjective, not compared | positive degree | grado positivo (m) | degré positif (m) | Positiv (m) | grado positivo (m) | grau normal (m) | 原級 |
| USAGE | noun, mass | how a thing is written or used | usage | uso (m) | utilisation (f) | Verwendung (f) | uso (m) | uso (m) | 使用法 |
| EXAMPLE | noun, count | a case that shows how something is used | example(s) | esempio, -i (m) | exemple(s) (m) | Beispiel, -e (n) | ejemplo(s) (m) | exemplo(s) (m) | 例 |
| ALIAS | noun, count, isA NAME_NOUN | another name a thing is also called by | alias(es) | alias (m, invariable) | alias (m, invariable) | Alias, Aliasse (m; des Alias) | alias (m, invariable) | alias, aliases (m) | 別名 |
| NOW | adverb | at the present time | now | ora | maintenant | jetzt | ahora | agora | 今 |
| SPATIAL | adjective | having to do with place | spatial | spaziale | spatial | räumlich | espacial | espacial | 空間的な |
| VALUE | noun, count | one of the settings a control can have | value(s) | valore, -i (m) | valeur(s) (f) | Wert, -e (m) | valor(es) (m) | valor(es) (m) | 値 |

The judgments the task left open, with the probes that decided them (see Done for the rest):

- **ALSO became the noun ALIAS.** The adverb was probed as a word of its own: also, anche, aussi, auch,
  también, também, and Japanese また, which reads "again"; Japanese has no "also" standing alone (も is a
  particle). ALIAS says what the row means in all seven, ja 別名 "another name".
- **POSITIVE_DEGREE is its own grammar noun.** The seeded POSITIVE is the polarity: "positive degree" built
  from it renders ja 肯定の程度, affirmative degree, and de "Positive Steigerungsstufe" (table below).
- **WORKSPACE and CANVAS.** WORKSPACE is every period together (it "area di lavoro"); CANVAS, seeded by
  [B43](B43-ui-canvas-preview-edit.md), is the surface one period is drawn on, and is kept
  apart from it there.

### The words in their paradigms

Rendered 2026-09-21 by the engine source over an in-memory seed of the corpus, and pinned by
[console-words.test.ts](../../../packages/engine/test/console-words.test.ts).

| plan | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| MOOD indefinite | a mood. | un modo. | un mode. | ein Modus. | un modo. | um modo. | 叙法。 |
| MOOD plural | the moods. | i modi. | les modes. | die Modi. | los modos. | os modos. | 叙法。 |
| the MOOD's name | the mood's name. | il nome del modo. | le nom du mode. | der Name des Modus. | el nombre del modo. | o nome do modo. | 叙法の名前。 |
| STATEMENT indefinite | a statement. | una proposizione enunciativa. | une phrase déclarative. | ein Aussagesatz. | una oración enunciativa. | uma frase declarativa. | 平叙文。 |
| STATEMENT plural | the statements. | le proposizioni enunciative. | les phrases déclaratives. | die Aussagesätze. | las oraciones enunciativas. | as frases declarativas. | 平叙文。 |
| WORKSPACE indefinite | a workspace. | un'area di lavoro. | un espace de travail. | ein Arbeitsbereich. | un espacio de trabajo. | um espaço de trabalho. | ワークスペース。 |
| WORKSPACE plural | the workspaces. | le aree di lavoro. | les espaces de travail. | die Arbeitsbereiche. | los espacios de trabajo. | os espaços de trabalho. | ワークスペース。 |
| the WORKSPACE's name | the workspace's name. | il nome dell'area di lavoro. | le nom de l'espace de travail. | der Name des Arbeitsbereichs. | el nombre del espacio de trabajo. | o nome do espaço de trabalho. | ワークスペースの名前。 |
| POSITIVE_DEGREE indefinite | a positive degree. | un grado positivo. | un degré positif. | ein Positiv. | un grado positivo. | um grau normal. | 原級。 |
| POSITIVE_DEGREE plural | the positive degrees. | i gradi positivi. | les degrés positifs. | die Positive. | los grados positivos. | os graus normais. | 原級。 |
| USAGE definite | the usage. | l'uso. | l'utilisation. | die Verwendung. | el uso. | o uso. | 使用法。 |
| EXAMPLE indefinite | an example. | un esempio. | un exemple. | ein Beispiel. | un ejemplo. | um exemplo. | 例。 |
| EXAMPLE plural | the examples. | gli esempi. | les exemples. | die Beispiele. | los ejemplos. | os exemplos. | 例。 |
| ALIAS indefinite | an alias. | un alias. | un alias. | ein Alias. | un alias. | um alias. | 別名。 |
| ALIAS plural | the aliases. | gli alias. | les alias. | die Aliasse. | los alias. | os aliases. | 別名。 |
| the ALIAS's name | the alias's name. | il nome dell'alias. | le nom de l'alias. | der Name des Alias. | el nombre del alias. | o nome do alias. | 別名の名前。 |
| cat RUN, NOW | the cat runs now. | il gatto corre ora. | le chat court maintenant. | der Kater läuft jetzt. | el gato corre ahora. | o gato corre agora. | 猫は今走ります。 |
| cat EAT food, NOW | the cat eats the food now. | il gatto mangia ora il cibo. | le chat mange maintenant la nourriture. | der Kater frisst jetzt das Essen. | el gato come ahora la comida. | o gato come agora a comida. | 猫は食べ物を今食べます。 |
| *rejected:* an ALSO adverb, cited | also | anche | aussi | auch | también | também | また |
| *rejected:* DEGREE_GRAMMAR bare `[POSITIVE]` | Positive degree | Grado positivo | Degré positif | Positive Steigerungsstufe | Grado positivo | Grau positivo | 肯定の程度 |
| *rejected:* LOCATIVE **or** ROUTE, bare | locative or route | complemento di stato in luogo o complemento di moto per luogo | complément circonstanciel de lieu ou complément circonstanciel de passage | adverbiale Bestimmung des Ortes oder adverbiale Bestimmung des Weges | complemento circunstancial de lugar o complemento circunstancial de trayecto | adjunto adverbial de lugar ou adjunto adverbial de percurso | 場所の副詞語句か経路の副詞語句 |

## Strings

The line references are to the code as it reads after this task. All shipped.

| literal | where now | key | plan |
|---|---|---|---|
| place or route (topic) | [commands.ts:835](../../../packages/frontend/src/console/language/commands.ts#L835) | `console.topic.place` | RELATIONSHIP bare `[SPATIAL]`, "spatial relationship": what `/in … /front` set. Naming the two complements instead ("locative or route") renders it "complemento di stato in luogo o complemento di moto per luogo" (table above), too long for a heading |
| mood (topic) | [commands.ts:848](../../../packages/frontend/src/console/language/commands.ts#L848) | `console.topic.mood` | `nameOf('MOOD')`, lower-case |
| workspace (topic) · Workspace (help part) | [commands.ts:851](../../../packages/frontend/src/console/language/commands.ts#L851), [ConsoleHelp.tsx:24](../../../packages/frontend/src/console/ConsoleHelp.tsx#L24) | `console.topic.workspace` | `nameOf('WORKSPACE')`, lower-case; both headings are uppercased by the CSS |
| back to a plain statement (`/statement`) | [commands.ts:599](../../../packages/frontend/src/console/language/commands.ts#L599) | `mood.statement` | `nameOf('STATEMENT')`, `NAME_FORMAT`: the mood it sets, as `/command` reads `imperative.command` and `/inf` `infinitive.phrase` |
| plain degree (`/plain`) | [commands.ts:539](../../../packages/frontend/src/console/language/commands.ts#L539) | `degree.name.positive` | `nameOf('POSITIVE_DEGREE')`, `NAME_FORMAT` |
| values for /{name} (list title) | [complete.ts:713](../../../packages/frontend/src/console/language/complete.ts#L713) | `console.list.values` | VALUE plural bare, the command after it as the list's `about`: "values · /tense" |
| now {value} (a completion row) | [CompletionList.tsx:160](../../../packages/frontend/src/console/CompletionList.tsx#L160) | `console.now` | `word: NOW`, then the value (already localized) |
| also /{alias} (a completion row) | [CompletionList.tsx:151](../../../packages/frontend/src/console/CompletionList.tsx#L151) | `console.alias.singular` | `nameOf('ALIAS')`, then the alias: "alias /plural" |
| Written {usage} (help page) | [Transcript.tsx:169](../../../packages/frontend/src/console/Transcript.tsx#L169) | `console.help.usage` | `nameOf('USAGE')`, `NAME_FORMAT`, then the usage line after a colon: "Usage: /pl" |
| · also {aliases} (help page) | [Transcript.tsx:176](../../../packages/frontend/src/console/Transcript.tsx#L176) | `console.alias.singular`, `console.alias.plural` | ALIAS by the number of aliases listed: "alias /plural", "aliases /positive /affirmative" |
| For example {line} (help page) | [Transcript.tsx:195](../../../packages/frontend/src/console/Transcript.tsx#L195) | `console.help.example` | `nameOf('EXAMPLE')`, `NAME_FORMAT`, then the example after a colon |

## Tests that select on these literals

[PhraseConsole.test.tsx](../../../packages/frontend/test/console/PhraseConsole.test.tsx) read "Written" and
"also /" on the help page. The page's lines now have test ids of their own (`help-usage-line`,
`help-aliases`, `help-example-line`), the test reads them in English and in Italian ("Uso: /pl", "alias
/plural", "Esempio: …"), and it reads the overlay's workspace part and two topics, a row's "ora" (its
`console-option-current` id; an alias row is `console-option-alias`) and the values list's title in
Italian. [help.test.ts](../../../packages/frontend/test/console/help.test.ts)'s "Written" is a comment.
[complete.test.ts](../../../packages/frontend/test/console/complete.test.ts) pins the values title and the
keys of `/plain` and `/statement`. [console.spec.ts](../../../e2e/console.spec.ts) reads the help page's
labels and the values title in Italian and German. [uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts)
pins every new entry in all seven languages.

## Done

**2026-09-21.** Eight concepts seeded (VALUE and SPATIAL came seeded), twelve new entries. Rendered by the
engine source over an in-memory seed of the corpus, through `buildUiStrings`, with formats applied; the
e2e stack then seeded 391 concepts and booted clean on the built catalogue.

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `console.topic.place` | spatial relationship | relazione spaziale | relation spatiale | räumliche Beziehung | relación espacial | relação espacial | 空間的な関係 |
| `console.topic.mood` | mood | modo | mode | Modus | modo | modo | 叙法 |
| `console.topic.workspace` | workspace | area di lavoro | espace de travail | Arbeitsbereich | espacio de trabajo | espaço de trabalho | ワークスペース |
| `mood.statement` | Statement | Proposizione enunciativa | Phrase déclarative | Aussagesatz | Oración enunciativa | Frase declarativa | 平叙文 |
| `degree.name.positive` | Positive degree | Grado positivo | Degré positif | Positiv | Grado positivo | Grau normal | 原級 |
| `console.list.values` | values | valori | valeurs | Werte | valores | valores | 値 |
| `console.now` | now | ora | maintenant | jetzt | ahora | agora | 今 |
| `console.alias.singular` | alias | alias | alias | Alias | alias | alias | 別名 |
| `console.alias.plural` | aliases | alias | alias | Aliasse | alias | aliases | 別名 |
| `console.help.usage` | Usage | Uso | Utilisation | Verwendung | Uso | Uso | 使用法 |
| `console.help.example` | Example | Esempio | Exemple | Beispiel | Ejemplo | Exemplo | 例 |

The entries they sit beside, as they render today: `imperative.command` Command / Comando / Commande /
Befehl / Comando / Comando / 命令, `infinitive.phrase` Infinitive phrase / Frase infinitiva / Proposition
infinitive / Infinitivphrase / Frase de infinitivo / Frase infinitiva / 不定詞句.

What landed differently from the plan:

1. **ALIAS, a noun, in place of the adverb ALSO**, and two keys where the plan had one `console.also`:
   a help page lists every alias a command has, so the noun agrees with their number ("aliases /positive
   /affirmative", de "Aliasse"); a row shows the one alias the query matched. The English reads "alias
   /plural" where it read "also /plural".
2. **NOW is 今 in Japanese, not 現在.** 現在 is also the present tense's name, which a verb's `/tense` row
   holds by default: its note would have read 現在 現在.
3. **STATEMENT is named as each school grammar names the sentence that asserts**, beside the question and
   the command: it "proposizione enunciativa", fr "phrase déclarative", de "Aussagesatz", es "oración
   enunciativa", pt "frase declarativa", ja 平叙文. The suggested it *enunciato*, fr *énoncé*, es/pt
   *enunciado* and de *Aussage* are utterances, not a kind of clause. `/statement`'s English description
   is "statement" now (it was "back to a plain statement"); the list shows "Statement".
4. **USAGE is fr *utilisation* and ja 使用法**, not the suggested *syntaxe* (another concept) and 用法.
   MOOD is ja 叙法, not 法, which a heading standing alone reads as "law".
5. **The help overlay's workspace part is the topic's key**, lower-case and uppercased by the CSS like the
   topic: [A21](A21-ui-console-seeded-words.md) had left it the literal "Workspace".
6. **"values for /tense" is "values · /tense"**, the list's word after its title as A21 wrote every other
   list, and the English topic "place or route" is "spatial relationship", the key's own words.
7. **The help page's labels take a colon in every language**, ": ", as the toasts' missing-words list does
   ([C14](C14-ui-runtime-values.md)); French typography would space it (" : "). Recorded, not changed.
