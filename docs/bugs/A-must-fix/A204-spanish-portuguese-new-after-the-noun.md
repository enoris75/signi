# A204. Spanish and Portuguese put NEW after the noun, where it means "brand-new", not "one more"

**Languages:** Spanish, Portuguese

Iberian Romance puts a qualifying adjective after the noun, and the engine's `PRENOMINAL` set
([es.consts.ts:17](../../../packages/engine/src/languages/es/es.consts.ts#L17),
[pt.consts.ts:50](../../../packages/engine/src/languages/pt/pt.consts.ts#L50)) holds only the
ordinals and OTHER. *nuevo* / *novo* is the standard exception both traditions teach: the position
decides the sense. After the noun it is *recently made* — `una casa nueva` is a newly built house.
Before it, it is *another, one more* — `una nueva casa` is a second house, however old. English,
Italian and French have one word for both senses, so nothing in the corpus distinguishes them; the
engine's single postnominal slot picks the wrong one of the two every time the phrase means "one
more".

Every NEW in the app is the "one more" sense: the console offers `nueva oración` to open beside the
one already there, and the diagnostic `diagnostic.openClause` says to open another. They render as
"newly made" instead.

| Case | Language | Now | Want |
|---|---|---|---|
| bare CLAUSE `[NEW]` (`console.new.clause`) | Spanish | `oración nueva` | `nueva oración` |
| | Portuguese | `oração nova` | `nova oração` |
| bare PHRASE `[NEW]` (`console.new.phrase`) | Spanish | `frase nueva` | `nueva frase` |
| | Portuguese | `frase nova` | `nova frase` |
| bare PERIOD_SENTENCE `[NEW]` (`console.new.period`, `help.console.newPeriod`) | Spanish | `período nuevo` | `nuevo período` |
| | Portuguese | `período novo` | `novo período` |
| definite CAT `[NEW]` | Spanish | `el gato nuevo come.` | `el nuevo gato come.` |
| | Portuguese | `o gato novo come.` | `o novo gato come.` |
| indefinite MOUSE `[NEW, BIG]` as object | Spanish | `el gato ve un ratón nuevo y grande.` | `el gato ve un nuevo ratón grande.` |
| | Portuguese | `o gato vê um rato novo e grande.` | `o gato vê um novo rato grande.` |
| feminine plural CAT `[NEW]` | Spanish | `las gatas nuevas comen.` | `las nuevas gatas comen.` |
| | Portuguese | `as gatas novas comem.` | `as novas gatas comem.` |
| indefinite HOUSE `[NEW]` in a locative | Spanish | `el gato come en una casa nueva.` | `el gato come en una nueva casa.` |
| | Portuguese | `o gato come em uma casa nova.` | `o gato come em uma nova casa.` |

The **Want** column is trial output: adding `'NEW'` to both `PRENOMINAL` sets produces every line of
it, reverted before filing.

**Already right.** Italian and French, whose prenominal classes already hold *nuovo* and *nouveau*
("il nuovo gatto", "un nouveau chat"), and which merge the two senses there as English does.
English, German and Japanese have no position contrast to get wrong ("a new cat", "ein neuer Kater",
新しい猫). And the coordination of two postnominal adjectives, which is right for any pair that
belongs after the noun ("el gato viejo y grande").

Found by [A22](../../localization/done/A22-ui-console-completion-rows.md) on 2026-09-21, authoring
`console.new.period/phrase/clause` for the console's completion rows; that task's **Probe renders**
flagged the reading and left the plan alone, as its note says.

## Shape of the fix

Add `NEW` to `PRENOMINAL` in [es.consts.ts](../../../packages/engine/src/languages/es/es.consts.ts)
and [pt.consts.ts](../../../packages/engine/src/languages/pt/pt.consts.ts), and widen each set's
doc comment: it currently says "only the ordinals and OTHER" precede, and the reason NEW joins them
is not the ordinals' reason but a sense contrast. Nothing else moves — *nuevo* and *novo* do not
apocopate, so no `apocopate` entry is needed, and the trial showed the article, the plural, the
preposition and a following postnominal adjective all land correctly.

**The decision the fixer must take:** the corpus has one NEW, described *"recently made or
introduced"* — the postnominal sense. Moving it prenominally in these two languages makes that sense
unsayable there, in exchange for the sense every caller actually means. The alternative is a second
adjective concept for "another", which no other language would need a separate word for and which
OTHER half covers already. Prefer the move, and correct NEW's `description` if it is taken.

Six existing expectations move with it, all es/pt, and none is a string whose meaning changes —
four are paradigm pins that happen to use NEW as their stand-in adjective:

- [console-diagnostics.test.ts:179, 187](../../../packages/engine/test/console-diagnostics.test.ts#L179)
  — `un texto nuevo` → `un nuevo texto`, `una referencia nueva` → `una nueva referencia`.
- [console-diagnostics.test.ts](../../../packages/engine/test/console-diagnostics.test.ts) →
  *the diagnostics, as the catalogue plans them* → `diagnostic.openClause`, which the fix corrects:
  "Abrir una oración nueva" → "Abrir una nueva oración".
- [workspace-words.test.ts](../../../packages/engine/test/workspace-words.test.ts) → CONSOLE, CANVAS,
  PREVIEW, TOOLBAR, each pinning its plural beside NEW (`unas consolas nuevas` → `unas nuevas
  consolas`).

| | |
|---|---|
| **Test** | `adjectives.test.ts` → *known bugs: Spanish and Portuguese NEW before the noun* (1 `test.fails`, plus a regression test for OTHER and the ordinals, the qualifying adjectives that stay postnominal, and the four languages already right) |
