# B46. UI strings — the console's topics, list annotations and help-page labels

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** the words that organize the console's reference. The topics that group the commands
(mood, workspace, the spatial relation), the short annotations on a completion row ("now", "also"),
and the help page's labels (usage, example) each need a noun or an adverb the corpus lacks.
[A21](../A-ready/A21-ui-console-seeded-words.md) takes the topics and titles whose words are seeded.

## Seed first

| concept | role | gloss | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|---|---|
| MOOD | noun, count | the grammatical form that shows how a clause is meant | mood(s) | modo, -i (m) | mode(s) (m) | Modus, Modi (m) | modo(s) (m) | modo(s) (m) | 法 |
| STATEMENT | noun, count | a clause that asserts something | statement(s) | enunciato, -i (m) | énoncé(s) (m) | Aussage, -n (f) | enunciado(s) (m) | enunciado(s) (m) | 平叙文 |
| WORKSPACE | noun, count | all the periods being built at once | workspace(s) | area di lavoro (f) | espace(s) de travail (m) | Arbeitsbereich, -e (m) | espacio(s) de trabajo (m) | espaço(s) de trabalho (m) | ワークスペース |
| SPATIAL | adjective | having to do with place | spatial | spaziale | spatial | räumlich | espacial | espacial | 空間的な |
| POSITIVE_DEGREE | noun, count | the plain form of an adjective, not compared | positive degree | grado positivo (m) | degré positif (m) | Positiv (m) | grado positivo (m) | grau normal (m) | 原級 |
| USAGE | noun, mass | how a thing is written or used | usage | uso (m) | syntaxe (f) | Verwendung (f) | uso (m) | uso (m) | 用法 |
| EXAMPLE | noun, count | a case that shows how something is used | example(s) | esempio, -i (m) | exemple(s) (m) | Beispiel, -e (n) | ejemplo(s) (m) | exemplo(s) (m) | 例 |
| NOW | adverb | at the present time | now | ora | maintenant | jetzt | ahora | agora | 現在 |
| ALSO | adverb | in addition | also | anche | aussi | auch | también | também | 別名 |

Forms are suggestions for the seed author. Some things to know:

- **POSITIVE_DEGREE** is its own grammar noun. The seeded POSITIVE is the polarity sense, and
  "positive degree" built from it renders ja 肯定の程度, affirmative degree (probed 2026-09-21).
- **WORKSPACE** and [B43](B43-ui-canvas-preview-edit.md)'s CANVAS both want it "area di lavoro". Keep
  them apart: the workspace holds every period, and the canvas is the surface of one.
- **ALSO.** In Japanese an alias reads 別名 (another name), not the adverb も. That is the row's
  meaning, so the concept may be better seeded as a noun, ALIAS.

VALUE and LEVEL are seeded by [B44](B44-ui-keyboard-movement-labels.md).

## Unlocks

| literal | where | key | plan |
|---|---|---|---|
| place or route (topic) | [commands.ts:823](../../../packages/frontend/src/console/language/commands.ts#L823) | `console.topic.place` | RELATIONSHIP bare `[SPATIAL]`, "spatial relationship". That is what `/in … /front` set. Naming the two complements instead ("locative or route") was probed and renders it "complemento di stato in luogo o complemento di moto per luogo", too long for a topic heading |
| mood (topic) | [commands.ts:836](../../../packages/frontend/src/console/language/commands.ts#L836) | `console.topic.mood` | `nameOf('MOOD')` |
| workspace (topic) · On the workspace (help part) | [commands.ts:839](../../../packages/frontend/src/console/language/commands.ts#L839), [ConsoleHelp.tsx:21](../../../packages/frontend/src/console/ConsoleHelp.tsx#L21) | `console.topic.workspace` | `nameOf('WORKSPACE')` |
| back to a plain statement (`/statement`) | [commands.ts:592](../../../packages/frontend/src/console/language/commands.ts#L592) | `mood.statement` | `nameOf('STATEMENT')`: the mood it sets, as `/command` reads `imperative.command` and `/inf` `infinitive.phrase` |
| plain degree (`/plain`) | [commands.ts:533](../../../packages/frontend/src/console/language/commands.ts#L533) | `degree.name.positive` | `nameOf('POSITIVE_DEGREE')` |
| values for /{name} (list title) | [complete.ts:690](../../../packages/frontend/src/console/language/complete.ts#L690) | `console.list.values` | VALUE plural bare, then the command after it, outside the phrase |
| now {value} (a completion row) | [CompletionList.tsx:156](../../../packages/frontend/src/console/CompletionList.tsx#L156) | `console.now` | `word: NOW`, then the value (already localized) |
| also /{alias} (a completion row) | [CompletionList.tsx:147](../../../packages/frontend/src/console/CompletionList.tsx#L147) | `console.also` | `word: ALSO` (or ALIAS, see above), then the alias |
| Written {usage} (help page) | [Transcript.tsx:153](../../../packages/frontend/src/console/Transcript.tsx#L153) | `console.help.usage` | `nameOf('USAGE')`, then the usage line after a colon |
| · also {aliases} (help page) | [Transcript.tsx:154](../../../packages/frontend/src/console/Transcript.tsx#L154) | `console.also` | — |
| For example {line} (help page) | [Transcript.tsx:170](../../../packages/frontend/src/console/Transcript.tsx#L170) | `console.help.example` | `nameOf('EXAMPLE')`, then the example after a colon |

## Tests that select on these literals

[PhraseConsole.test.tsx](../../../packages/frontend/test/console/PhraseConsole.test.tsx) reads "Written"
and "also /" on the help page. [help.test.ts](../../../packages/frontend/test/console/help.test.ts)
reads "Written". [complete.test.ts](../../../packages/frontend/test/console/complete.test.ts) reads the
list titles. The help page has `data-testid="help-page"`, so give its lines ids of their own.
