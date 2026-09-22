# A22. UI strings — the console's completion rows that A21 found

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries and
catalogue keys on existing rows, driven by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Done 2026-09-21.** All four groups shipped as planned. See [Done](#done) for the renders, the one
reading that was judged, and what landed differently.

**Why it was ready:** every word was seeded. The work was three new entries on seeded words, one name
for a seeded noun, and keys on rows that still carried English.
[A21](A21-ui-console-seeded-words.md) found these while localizing the console, and recorded
them as outstanding in its Done section (item 6). No task had them. All four groups are in
[complete.ts](../../../packages/frontend/src/console/language/complete.ts), in the completion list's
rows.

## Strings

The line references are to the code as it reads after this task.

### 1. The reference rows' "period {n}" — shipped

A row naming a noun of another period says which period it is in: `#2.subj … Period 2`.

| literal | where now | key | verdict |
|---|---|---|---|
| period {n} (×3) | [complete.ts:768, 789](../../../packages/frontend/src/console/language/complete.ts#L768) (link targets), [:929](../../../packages/frontend/src/console/language/complete.ts#L929) (references) | `period.name`, then the number | shipped as `inPeriod(n)`: "Period 2", de "Satzgefüge 2", it "Periodo 2", as the console's header already writes it (the C14 rule). Not lower-cased |

A `Candidate` now carries a **`detailValue`** beside its key, which `CompletionList` prints after the
rendered name ([complete.ts:74-81](../../../packages/frontend/src/console/language/complete.ts#L74-L81),
[CompletionList.tsx:137-145](../../../packages/frontend/src/console/CompletionList.tsx#L137-L145)). It
is a union, not a bare string, because the two things that follow a name follow it differently: a
period numbers it (`{ period: 2 }` → "Period 2", a space, as the header writes it) and a word is
cited after it (`{ word: 'cat' }` → "Subject: cat", a colon, as a help page writes "Usage: /pl").

### 2. The new-phrase rows — shipped

The first rows a link command offers make a new phrase rather than point at one
([complete.ts:849-871](../../../packages/frontend/src/console/language/complete.ts#L849-L871)).

| literal | where now | key | verdict |
|---|---|---|---|
| new period | [:870](../../../packages/frontend/src/console/language/complete.ts#L870) (`{ … }` after `/if`, `/join`, `/inst`) | `console.new.period` | shipped: PERIOD_SENTENCE bare `[NEW]`, lower-case (`stripPeriod` only, like `console.list.*`) |
| new phrase | [:868](../../../packages/frontend/src/console/language/complete.ts#L868) (`[ … ]` after `/poss`, `/and`) | `console.new.phrase` | shipped: PHRASE bare `[NEW]` |
| new clause · {word} is its subject / object | [:864-865](../../../packages/frontend/src/console/language/complete.ts#L864-L865) (`subj { … }`, `obj { … }` after `/rel`) | `console.new.clause` + `slot.subject` / `slot.directObject` + the head word | shipped, reworded. See below |

**The relative rows, reworded.** "cat is its subject" is a sentence about the user's word, which a
boot-time entry cannot hold. It would need C16's on-request rendering, and "its" would have to agree
with CLAUSE in German (*sein*). The C14 rule says it without a sentence: the word stays outside the
phrase, after the name of the role it takes. The rows read `new clause · Subject: cat` and `new
clause · Object: cat` — it "nuova proposizione · Soggetto: gatto". A row's `detailKey` takes a **list
of keys**, joined by " · " exactly as `Completion.titleKey` already was for a list of two kinds of
rows (B45). With no head word (`headName` undefined, where the literal said "the noun"), the colon
and the word are dropped: `new clause · Subject`.

### 3. `/del`'s argument descriptions — shipped

The values list for `/del` ([complete.ts:725-756](../../../packages/frontend/src/console/language/complete.ts#L725-L756))
described each argument in English, the complements by their **internal type name** (`description: t`,
so "terminus", "route"), which is not even the English UI's word for them. A `ValueDef` already took a
`descriptionKey`, which the list shows as the other values lists do (capitalized names: `tense.value.past`
"Past").

| value | literal | key |
|---|---|---|
| `adj` | an adjective | `category.adjective` |
| `obj` | the direct object | `slot.directObject` |
| `adv` | the adverb | `slot.adverb` |
| `modal` | a modal | `slot.modal` |
| `poss` | the possessor | `slot.possessor` |
| `and` | a coordinated phrase | **`slot.conjunct`**, new: `nameOf('CONJUNCT')`, `NAME_FORMAT` |
| `rel` | the relative clause | `satellite.relative` |
| `if` | the if-condition | `clause.conditional` |
| `join` | the coordination | `clause.coordinated`, the name A21 gave the `/join` list |
| `inst` | the instrument | `slot.instrumental` |
| `period` | the whole period | `period.name` |
| `subj` | the subject | `slot.subject` |
| `verb` | the verb | `slot.verb` |
| `pred term manner loc dir src route cause` | `predicative`, `terminus`, … (the type name) | `slot.<type>`, one mapping over `BOX_COMPLEMENT_TYPES` |

The English articles went ("an adjective", "the adverb"). They said which arguments take a number
(`adj n`), and the usage line already spells that out.

### 4. "did you mean" — shipped

A bare word typed where a command belongs got a list titled "did you mean", offering the word in the
role command's bracket (`ca` → `/subj ( cat )`), at
[complete.ts:973](../../../packages/frontend/src/console/language/complete.ts#L973). A question needs
MEAN, which is not seeded, plus C10's interrogative. Instead the list is titled the way A21 titles a
role's own word list — through `titleForSpec`, the very function that heads them: "Subject", it
"Soggetto". The rows below it are `/subj ( … )` lines, so the title says which role they fill.

## Probe renders

Rendered 2026-09-21 by the engine source at HEAD over an in-memory seed of the corpus, with the
entries' formats applied. Re-rendered on authoring through `buildUiStrings` against the real corpus:
every cell below matched.

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `console.new.clause` | new clause | nuova proposizione | nouvelle proposition | neuer Satz | oración nueva | oração nova | 新しい節 |
| `console.new.phrase` | new phrase | nuova frase | nouvelle phrase | neue Phrase | frase nueva | frase nova | 新しいフレーズ |
| `console.new.period` | new period | nuovo periodo | nouvelle période | neues Satzgefüge | período nuevo | período novo | 新しい文 |
| `slot.conjunct` | Conjunct | Congiunto | Conjoint | Konjunkt | Miembro coordinado | Membro coordenado | 等位項 |

**The reading judged: Spanish and Portuguese NEW.** They put it after the noun (*oración nueva*,
*frase nova*), which reads as "brand-new". "One more", which is what the row means, is the prenominal
*nueva oración* / *nova oração*. It reads wrong, so it is filed as an engine bug —
**[A204](../../bugs/fixed/A204-spanish-portuguese-new-after-the-noun.md)** — and this plan is
unchanged, as the task said. See Done, 3.

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
luogo", de "Adverbiale Bestimmung der Richtung", ja 方向の副詞語句). The two the plan's table missed,
`slot.predicative` ("Subject complement", fr "Attribut du sujet", ja 主格補語) and `slot.manner`
("Adverbial of manner", it "Complemento di modo"), render in it too — see Done, 2.

## Not in this task

The `/…` rows' "also /x" and "now …" ([B46](B46-ui-console-topics-and-labels.md)), "values
for /x" (B46), the echo icon's "from the canvas" ([B43](B43-ui-canvas-preview-edit.md)) and
the role group's note "take a word; alone they move the context"
([C22](C22-ui-help-prose.md)) are catalogued already.

## Tests that select on these literals

[complete.test.ts](../../../packages/frontend/test/console/complete.test.ts) asserted the title "did
you mean"; it now asserts the role's title and key. It lists the `/rel` rows by label, not by detail,
so those kept passing. The new `detailKey`s are asserted the way its `descriptionKey` block does.
[PhraseConsole.test.tsx](../../../packages/frontend/test/console/PhraseConsole.test.tsx)'s *in the
interface language* block gained a second-language check, and
[console.spec.ts](../../../e2e/console.spec.ts) an end-to-end one. See Done, 4.

## Done

Shipped 2026-09-21. Four new `UI_STRINGS` entries (`console.new.period/phrase/clause`,
`slot.conjunct`), keys on 21 existing rows (`DEL_VALUES`, every one of them: the test asserts no row
is left showing English), the reference rows' period, the `/rel` rows' role, and the bare-word list's
title. Nothing was seeded; nothing in the engine changed.

What landed differently from the plan, and what it found:

1. **A `detailValue` is a union, not a string.** The plan asked for "a value field that
   `CompletionList` prints after the rendered key". One field could not do both jobs: "Period 2"
   joins with a space, because the figure numbers the name (the console header's own shape), and
   "Subject: cat" joins with a colon, because the word is cited after the role (the help page's
   shape, `console.help.usage` + ":"). `detailValue` is `{ period: n } | { word: s }` and the
   component picks the separator, so neither call site spells punctuation into a value.
   `detailKey` took a list of keys at the same time, which is what the reworded `/rel` rows need
   ("new clause · Subject") and which `Completion.titleKey` already did for a list of two kinds of
   rows (B45).
2. **`/del` has 21 arguments, not 19.** The plan's table listed six complements (`term loc dir src
   route cause`). `BOX_COMPLEMENT_TYPES` is eight — `predicative` and `manner` are boxed complements
   too, and their rows read "predicative" and "manner", the same internal type name. The mapping is
   uniform (`slot.${t}`), so both came with the other six; `slot.predicative` and `slot.manner` were
   already in the catalogue.
3. **The es/pt reading was judged wrong and filed as
   [A204](../../bugs/fixed/A204-spanish-portuguese-new-after-the-noun.md).** *oración nueva* /
   *frase nova* is "newly made"; the row means "one more", which Spanish and Portuguese write
   prenominally. Adding `NEW` to the two `PRENOMINAL` sets was trialled and produces the wanted
   output everywhere probed (under an article, in the plural, under a preposition, beside a
   postnominal adjective); the trial was reverted and the bug filed with that output as its **Want**
   column, and a `test.fails` in `adjectives.test.ts`. The plan is unchanged, as this task said it
   should be. Italian and French merge the two senses prenominally already, and en/de/ja have no
   position contrast.
4. **Verified end-to-end, not only in the catalogue.** `buildUiStrings` renders the four new entries
   against the real corpus in all seven languages (`uiStrings.test.ts`, the boot check).
   `complete.test.ts` pins the keys, the values and the two English fallbacks (with and without a head
   word). `PhraseConsole.test.tsx` drives the app in Italian — "Periodo 2" on a reference row, "nuova
   proposizione · Soggetto: gatto" on a `/rel` row. And `console.spec.ts` drives a browser against the
   real backend for all three groups, including German "Satzgefüge 2", which is where a lower-cased
   name would have shown.
5. **The "did you mean" list is headed by `titleForSpec`, not by a copy of it.** The plan said to
   title it the way A21 titles a role's word list; that is one function, and `didYouMean` now calls it
   rather than repeating `{ title: def.description, titleKey: def.descriptionKey }`.
