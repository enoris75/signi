# A22. UI strings — the console's completion rows that A21 found

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries and
catalogue keys on existing rows, driven by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Ready:** every word is seeded. The work is three new entries on seeded words, one name for a seeded
noun, and keys on rows that still carry English. [A21](../done/A21-ui-console-seeded-words.md) found
these while localizing the console, and recorded them as outstanding in its Done section (item 6).
No task had them. All four groups are in
[complete.ts](../../../packages/frontend/src/console/language/complete.ts), in the completion list's
rows. The list already renders a `detailKey` in place of a row's English `detail`
([CompletionList.tsx:135-137](../../../packages/frontend/src/console/CompletionList.tsx#L135-L137)).

## Strings

### 1. The reference rows' "period {n}"

A row naming a noun of another period says which period it is in: `#2.subj … period 2`.

| literal | where | key |
|---|---|---|
| period {n} (×3) | [complete.ts:743, 764](../../../packages/frontend/src/console/language/complete.ts#L743) (link targets), [:882](../../../packages/frontend/src/console/language/complete.ts#L882) (references) | reuse `period.name`, then the number: "Period 2", de "Satzgefüge 2", as the console's header already writes it ([A21](../done/A21-ui-console-seeded-words.md), the C14 rule) |

The row needs a place for the number beside its key. Today a `Candidate` carries either a `detail` or a
`detailKey`, with nothing after the key. Add a value field that `CompletionList` prints after the
rendered key. Don't lower-case the name: German capitalizes it.

### 2. The new-phrase rows

The first rows a link command offers make a new phrase rather than point at one
([complete.ts:810-819](../../../packages/frontend/src/console/language/complete.ts#L810-L819)).

| literal | where | key | plan |
|---|---|---|---|
| new period | [:818](../../../packages/frontend/src/console/language/complete.ts#L818) (`{ … }` after `/if`, `/join`, `/inst`) | `console.new.period` | PERIOD_SENTENCE bare `[NEW]`, lower-case (`stripPeriod` only, like `console.list.*`) |
| new phrase | [:816](../../../packages/frontend/src/console/language/complete.ts#L816) (`[ … ]` after `/poss`, `/and`) | `console.new.phrase` | PHRASE bare `[NEW]` |
| new clause · {word} is its subject / object | [:812-813](../../../packages/frontend/src/console/language/complete.ts#L812-L813) (`subj { … }`, `obj { … }` after `/rel`) | `console.new.clause`, then reuse `slot.subject` / `slot.directObject` and the head word | CLAUSE bare `[NEW]`. See below |

**The relative rows, reworded.** "cat is its subject" is a sentence about the user's word, which a
boot-time entry cannot hold. It would need C16's on-request rendering, and "its" would have to agree
with CLAUSE in German (*sein*). The C14 rule says it without a sentence: keep the word outside the
phrase, after the name of the role it takes. Write `new clause · Subject: cat` and `new clause ·
Object: cat`. With no head word (`headName` undefined, today's "the noun"), drop the colon and the
word: `new clause · Subject`.

### 3. `/del`'s argument descriptions

The values list for `/del` ([complete.ts:710-725](../../../packages/frontend/src/console/language/complete.ts#L710-L725))
describes each argument in English. The six complements are described by their **internal type name**
(`description: t`, so "terminus", "route"), which is not even the English UI's word for them. A
`ValueDef` already takes a `descriptionKey`
([commands.ts:90-96](../../../packages/frontend/src/console/language/commands.ts#L90-L96)), which the
list shows as the other values lists do (capitalized names: `tense.value.past` "Past").

| value | literal | key |
|---|---|---|
| `adj` | an adjective | reuse `category.adjective` |
| `obj` | the direct object | reuse `slot.directObject` |
| `adv` | the adverb | reuse `slot.adverb` |
| `modal` | a modal | reuse `slot.modal` |
| `poss` | the possessor | reuse `slot.possessor` |
| `and` | a coordinated phrase | **`slot.conjunct`**, new: `nameOf('CONJUNCT')`, `NAME_FORMAT` |
| `rel` | the relative clause | reuse `satellite.relative` |
| `if` | the if-condition | reuse `clause.conditional` |
| `join` | the coordination | reuse `clause.coordinated`, the name A21 gave the `/join` list |
| `inst` | the instrument | reuse `slot.instrumental` |
| `period` | the whole period | reuse `period.name` |
| `subj` | the subject | reuse `slot.subject` |
| `verb` | the verb | reuse `slot.verb` |
| `term loc dir src route cause` | `terminus`, `locative`, … (the type name) | reuse `slot.<type>`: `slot.terminus`, `slot.locative`, `slot.direction`, `slot.source`, `slot.route`, `slot.cause` |

The English articles go ("an adjective", "the adverb"). They said which arguments take a number
(`adj n`), and the usage line already spells that out.

### 4. "did you mean"

A bare word typed where a command belongs gets a list titled "did you mean", offering the word in the
role command's bracket (`ca` → `/subj ( cat )`), at
[complete.ts:923](../../../packages/frontend/src/console/language/complete.ts#L923). A question needs
MEAN, which is not seeded, plus C10's interrogative. Instead, title the list the way A21 titles a
role's own word list: the role command's `descriptionKey` ("Subject", it "Soggetto"). The rows below
it are `/subj ( … )` lines, so the title says which role they fill.

## Probe renders

Rendered 2026-09-21 by the engine source at HEAD over an in-memory seed of the corpus, with the
entries' formats applied. The reused entries come from `buildUiStrings`.

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `console.new.clause` | new clause | nuova proposizione | nouvelle proposition | neuer Satz | oración nueva | oração nova | 新しい節 |
| `console.new.phrase` | new phrase | nuova frase | nouvelle phrase | neue Phrase | frase nueva | frase nova | 新しいフレーズ |
| `console.new.period` | new period | nuovo periodo | nouvelle période | neues Satzgefüge | período nuevo | período novo | 新しい文 |
| `slot.conjunct` | Conjunct | Congiunto | Conjoint | Konjunkt | Miembro coordinado | Membro coordenado | 等位項 |

**One reading to judge when authoring: Spanish and Portuguese NEW.** They put it after the noun
(*oración nueva*, *frase nova*), which reads as "brand-new". "One more", which is what the row
means, is the prenominal *nueva oración* / *nova oração*. Italian already puts it first (*nuova
proposizione*). If it reads wrong, file it as an engine bug (es/pt NEW in the "another" sense
precedes the noun), not as a change to this plan.

The reused entries, as they render today:

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `period.name` | Period | Periodo | Période | Satzgefüge | Período | Período | 文 |
| `slot.subject` | Subject | Soggetto | Sujet | Subjekt | Sujeto | Sujeito | 主語 |
| `slot.directObject` | Object | Complemento oggetto | Complément d'objet | Objekt | Complemento | Objeto | 目的語 |
| `slot.verb` | Verb | Verbo | Verbe | Verb | Verbo | Verbo | 動詞 |
| `category.adjective` | Adjective | Aggettivo | Adjectif | Adjektiv | Adjetivo | Adjetivo | 形容詞 |
| `slot.adverb` | Adverb | Avverbio | Adverbe | Adverb | Adverbio | Advérbio | 副詞 |
| `slot.modal` | Modal | Verbo modale | Verbe modal | Modalverb | Verbo modal | Verbo modal | 法助動詞 |
| `slot.possessor` | Possessor | Possessore | Possesseur | Besitzer | Poseedor | Possuidor | 所有者 |
| `satellite.relative` | Relative clause | Proposizione relativa | Proposition relative | Relativsatz | Oración de relativo | Oração relativa | 関係節 |
| `clause.conditional` | Conditional clause | Proposizione condizionale | Proposition conditionnelle | Konditionaler Satz | Oración condicional | Oração condicional | 条件節 |
| `clause.coordinated` | Coordinated clause | Proposizione coordinata | Proposition coordonnée | Beigeordneter Satz | Oración coordinada | Oração coordenada | 等位節 |
| `slot.instrumental` | Instrumental | Complemento di mezzo | Complément de moyen | Instrumental | Complemento circunstancial de instrumento | Adjunto adverbial de instrumento | 手段語 |
| `slot.terminus` | Terminus | Complemento di termine | Complément d'objet second | Dativobjekt | Complemento indirecto | Objeto indireto | 間接目的語 |
| `slot.locative` | Locative | Complemento di stato in luogo | Complément circonstanciel de lieu | Adverbiale Bestimmung des Ortes | Complemento circunstancial de lugar | Adjunto adverbial de lugar | 場所の副詞語句 |
| `slot.route` | Route | Complemento di moto per luogo | Complément circonstanciel de passage | Adverbiale Bestimmung des Weges | Complemento circunstancial de trayecto | Adjunto adverbial de percurso | 経路の副詞語句 |

`slot.direction`, `slot.source` and `slot.cause` render in the same family ("Complemento di moto a
luogo", de "Adverbiale Bestimmung der Richtung", ja 方向の副詞語句).

## Not in this task

The `/…` rows' "also /x" and "now …" ([B46](../done/B46-ui-console-topics-and-labels.md)), "values
for /x" (B46), the echo icon's "from the canvas" ([B43](../done/B43-ui-canvas-preview-edit.md)) and
the role group's note "take a word; alone they move the context"
([C22](../done/C22-ui-help-prose.md)) are catalogued already.

## Tests that select on these literals

[complete.test.ts:264](../../../packages/frontend/test/console/complete.test.ts#L264) asserts the title
"did you mean". [complete.test.ts:222](../../../packages/frontend/test/console/complete.test.ts#L222) lists
the `/rel` rows by label, not by detail, so it keeps passing. Assert the new `detailKey`s the way its
`descriptionKey` block does ([:108-120](../../../packages/frontend/test/console/complete.test.ts#L108-L120)). Then add a
second-language check to [PhraseConsole.test.tsx](../../../packages/frontend/test/console/PhraseConsole.test.tsx)'s
*in the interface language* block: "Periodo 2" on a reference row, and "nuova proposizione · Soggetto: gatto".
