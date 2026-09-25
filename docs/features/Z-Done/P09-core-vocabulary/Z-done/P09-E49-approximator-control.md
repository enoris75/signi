# P09-E49. *About five*, *almost all* — an approximator row in the determiner menu

**Feature:** a canvas control and a console command for E38's `NounPhrase.approximator`: *about*
on a numeral ("**about** five cats"), *almost* on `all`, `no` and `many` ("**almost** all cats").
The engine renders both in all seven languages. Neither the canvas nor the console can build them.
**Shape:** no engine grammar. One keyed flag per noun, whose value is derived from the quantity it
qualifies. It is set from a checkbox row under the determiner menu's Quantity heading, next to
P13's numeral field. `/approx` in the console, with its print → apply round trip.
**Scope:** shared (a constant moved, a label kind), the engine (a label hook), one seed
(APPROXIMATE, for the command's purpose string), the phrase model, the canvas, the console. All 7
languages for every new UI string.
**Status:** **done** 2026-09-25 — filed 2026-09-25 from P09's plan-only constructs; the
engine side is [P09-E38](P09-E38-approximators.md).

What the engine renders from a plan at HEAD (e811c91e). Probed 2026-09-25 with `sayAll` on an
in-memory seed:

| lang | **about** five cats run | **almost all** cats run | **almost no** cat runs | the dog sees **about** five cats | these **about** five cats run |
|---|---|---|---|---|---|
| en | about five cats run. | almost all cats run. | almost no cat runs. | the dog sees about five cats. | these about five cats run. |
| it | circa cinque gatti corrono. | quasi tutti i gatti corrono. | quasi nessun gatto corre. | il cane vede circa cinque gatti. | questi circa cinque gatti corrono. |
| fr | environ cinq chats courent. | presque tous les chats courent. | presque aucun chat ne court. | le chien voit environ cinq chats. | ces environ cinq chats courent. |
| de | etwa fünf Kater laufen. | fast alle Kater laufen. | fast kein Kater läuft. | der Hund sieht etwa fünf Kater. | diese etwa fünf Kater laufen. |
| es | unos cinco gatos corren. | casi todos los gatos corren. | casi ningún gato corre. | el perro ve unos cinco gatos. | estos unos cinco gatos corren. |
| pt | cerca de cinco gatos correm. | quase todos os gatos correm. | quase nenhum gato corre. | o cão vê cerca de cinco gatos. | estes cerca de cinco gatos correm. |
| ja | 約五匹の猫は走ります。 | ほとんどすべての猫は走ります。 | ほとんどどの猫も走りません。 | 犬は約五匹の猫を見ます。 | この約五匹の猫は走ります。 |

The engine ignores the field anywhere else. `about` with `all` and no numeral renders "all cats
run.", and `almost` on a numeral renders "the five cats run.". *Almost many* renders "almost many
cats run.", marginal in every language (E38 Done 4).

## Done

Shipped 2026-09-25. The determiner menu's Quantity section ends, after the numeral field, on a
`menuitemcheckbox` (`data-testid="determiner-approximator"`) that reads **about** on a numeral and
**almost** on *all*, *no* or *many*, and is disabled (reading *about*) on any other quantity. The
flag is `PhraseSelection.approximators`, keyed by noun block; its word is `approximatorFor(sel,
which)` (`packages/phrase/src/model/functions/approximatorFor.ts`), set by `setApproximated`, and
dropped by `setNumeral` and `setDefiniteness` once the quantity takes none, and with a noun head that
goes (`clearNounPhraseParts`). `ALMOST_DETERMINERS` moved to shared, the engine re-exporting it.
`buildNounPhrase` writes the derived value; `planToWorkspace` holds it when it is the quantity's own
and otherwise names `NounPhrase.approximator off its quantity`. The console says it with `/approx`
(aliases `approximately`, `circa`), printed after `/num` and taken back by `/del approx`. The row's
labels are a new kind, `UiStringApproximatorDef`, rendered by `translateApproximator` over
`APPROXIMATOR_WORDS`; the purpose string needed APPROXIMATE, seeded in `adjectives.ts` after
SUFFICIENT, the last of the quantity adjectives. Engine output, from the real engine (labels pinned in
[`approximators.test.ts`](../../../../../packages/engine/test/approximators.test.ts), the purpose in
`command-purposes.test.ts` and `uiStrings.test.ts`):

| lang | about five cats run | almost all cats run | almost no cat runs | row: about | row: almost |
|---|---|---|---|---|---|
| en | about five cats run. | almost all cats run. | almost no cat runs. | about | almost |
| it | circa cinque gatti corrono. | quasi tutti i gatti corrono. | quasi nessun gatto corre. | circa | quasi |
| fr | environ cinq chats courent. | presque tous les chats courent. | presque aucun chat ne court. | environ | presque |
| de | etwa fünf Kater laufen. | fast alle Kater laufen. | fast kein Kater läuft. | etwa | fast |
| es | unos cinco gatos corren. | casi todos los gatos corren. | casi ningún gato corre. | unos | casi |
| pt | cerca de cinco gatos correm. | quase todos os gatos correm. | quase nenhum gato corre. | cerca de | quase |
| ja | 約五匹の猫は走ります。 | ほとんどすべての猫は走ります。 | ほとんどどの猫も走りません。 | 約 | ほとんど |

`purpose.approximator`: en *to set a noun's approximate quantity*, it *impostare la quantità
approssimativa di un sostantivo*, fr *définir la quantité approximative d'un nom*, de *die ungefähre
Menge eines Substantivs festlegen*, es *establecer la cantidad aproximada de un sustantivo*, pt
*definir a quantidade aproximada de um substantivo*, ja 名詞のおおよその数量を設定する.

What landed differently from the plan:

1. **`approximatorFor` lives in its own module**, not in `phraseReducers.ts`: the console's coverage
   test reads every export there as a reducer the console must call.
2. **The backend dispatches the new kind with `'approximator' in def`**, so the other catalogue
   kinds did not each gain an `approximator?: never`.
3. **APPROXIMATE has no definition** (its tooltip falls back to its description). A definition in
   the phrase language is a separate localization task.
4. **`/del approx` needs its noun in the line** (`/subj /del approx`), as `/del num` and
   `/del contrast` do: on a line with no word, it says *nothing to remove*.
5. Two passing expectations moved: the purpose counts in `help.test.ts` and `uiStrings.test.ts`
   (31 → 32), and the determiner menu's row list in `NounPhraseBuilder.test.tsx` gains the new row.

## Why

E38 built the approximators and left them plan-only. The quantity they qualify is now fully
buildable: E25's determiners are in the menu, and P13's `/num` (3e6be59a) added the numeral. So the
approximator is the one piece of a quantity that the builder still cannot say. P13 definitions
round-trip through the console, so the control ships with its command.

## Today

Verified at HEAD, 2026-09-25.

**The plan field.** [`NounPhrase.approximator?: Approximator`](../../../../../packages/shared/src/index.ts#L1038)
sits after `numeral` ([L1030](../../../../../packages/shared/src/index.ts#L1030)), with
[`Approximator = 'about' | 'almost'`](../../../../../packages/shared/src/index.ts#L65). The translator
reads it in [`resolveNounPhrase`](../../../../../packages/engine/src/translator/functions/resolveNounPhrase.ts#L194).
Its words are [`APPROXIMATOR_WORDS`](../../../../../packages/engine/src/translator/translator.consts.ts#L29),
and the gate for *almost* is [`ALMOST_DETERMINERS`](../../../../../packages/engine/src/translator/translator.consts.ts#L40).
Both live in the engine, not in shared. Nothing in `packages/phrase` or `packages/frontend` writes
the field. `planToWorkspace`'s `NOUN_FIELDS` leaves it out
([`planToWorkspace.ts:61`](../../../../../packages/phrase/src/model/workspacePlan/functions/planToWorkspace.ts#L61)).
No seed definition uses it.

**How a quantity is chosen today.** `D` on a noun box opens the
[`DeterminerMenu`](../../../../../packages/frontend/src/components/PhraseBuilder/NounPhraseBuilder.tsx#L36).
Its rows are grouped Article / Demonstrative / Quantifier and keyed by digit. P13 added two rows
of its own:

- Under Deixis, a `menuitemcheckbox` for the contrast
  ([L123](../../../../../packages/frontend/src/components/PhraseBuilder/NounPhraseBuilder.tsx#L123)).
  It is disabled unless the value is *this* or *that*.
- Under Quantity, a number field for the numeral
  ([L140](../../../../../packages/frontend/src/components/PhraseBuilder/NounPhraseBuilder.tsx#L140)).

Both are held by noun block, as `numerals` and `contrastives`
([`interfaces.ts:465`](../../../../../packages/phrase/src/model/interfaces.ts#L465),
[L469](../../../../../packages/phrase/src/model/interfaces.ts#L469)), and are set by `setNumeral` and
`setContrastive` ([`phraseReducers.ts:806`](../../../../../packages/phrase/src/model/phraseReducers.ts#L806),
[L455](../../../../../packages/phrase/src/model/phraseReducers.ts#L455)). `setDefiniteness` drops the
contrast once the determiner leaves the demonstratives
([L444](../../../../../packages/phrase/src/model/phraseReducers.ts#L444)). Neither row has a key of its
own: after D they are reached by arrow key.

**Console.** `/contrast` and `/num 24` are noun settings. They are printed after the determiner, in
that order ([`print.ts:436`](../../../../../packages/phrase/src/language/print.ts#L436),
[L440](../../../../../packages/phrase/src/language/print.ts#L440)), and undone by `/del contrast` and
`/del num` ([`commands.ts:532`](../../../../../packages/phrase/src/language/commands.ts#L532),
[L547](../../../../../packages/phrase/src/language/commands.ts#L547)). `/about` is the topic
complement's role ([L365](../../../../../packages/phrase/src/language/commands.ts#L365)), and `/around`
a spatial relation. `/almost`, `/approx` and `/circa` are free.

## Design

### D1. Seat: a checkbox row under Quantity

1. **A row in the determiner menu**, after the numeral field, like the contrast under Deixis.
2. **A satellite on the noun's ring.**
3. **A chip on the determiner box.**

The approximator is a fact about the quantity, and the quantity is chosen in that menu. (2) adds a
ring control for a word that is only meaningful beside the determiner and numeral. (3) crowds a box
that already reads the determiner.

**Recommendation: (1).** No ring is touched, so there is nothing to measure on the canvas. The row
is disabled, not hidden, when the quantity takes no approximator, as the contrast row is.

### D2. One flag, its value derived from the quantity

Which word applies is decided by what the approximator stands before. A numeral takes *about*.
`all`, `no` and `many` take *almost*. Anything else takes none.

1. **Store the value** (`Partial<Record<string, Approximator>>`). The menu would need two rows, one
   of them always disabled, and the value can go stale when the numeral or determiner changes.
2. **Store a flag** (`approximators?: Partial<Record<string, true>>`). The value is derived by one
   function, `approximatorFor(sel, which)`: *about* when the noun has a numeral, else *almost* when
   its determiner is in `ALMOST_DETERMINERS`, else none. That is the engine's own order.

**Recommendation: (2).**

- `ALMOST_DETERMINERS` moves to shared, and the engine re-exports it, as E12c moved
  `STANDARD_DEGREES`. The gate and the translator then read one set, and E38's product call on
  *many* stays a one-line change.
- `setNumeral` and `setDefiniteness` drop the flag once `approximatorFor` returns none, as
  `setDefiniteness` drops a contrast. Moving between licensed quantities keeps it (*about five* →
  remove the numeral, pick *all* → *almost all*).
- `planToWorkspace` sets the flag when a plan's value equals the derived one. Otherwise it reports
  `NounPhrase.approximator off its quantity`, the shape the contrast uses, because the engine
  ignores that value anyway.

### D3. Console: `/approx`, no argument

`/approx` (aliases `approximately`, `circa`) is a noun setting with no argument, like `/contrast`:
`/subj ( cat /num 5 /approx )`, `/subj ( cat /all /approx )`. It is printed after `/num`, so on
apply the quantity it reads is already set. `words.ts` `takes` gates it on `approximatorFor`, and
`/del approx` takes it back.

**Recommendation: as above.** `/almost` is not an alias: on a numeral it would mean *about*.

### D4. The row's label: the word it adds

The determiner rows pair a grammar name with the word. No name for an approximator is seeded
(APPROXIMATION is not), and the word teaches more: the row reads **✓ about** or **✓ almost**,
following `approximatorFor`, and **about** while disabled.

The label is a new kind, `UiStringApproximatorDef { approximator: Approximator }`, rendered by
`translateApproximator` from `APPROXIMATOR_WORDS`: en *about* / *almost*, it *circa* / *quasi*, fr
*environ* / *presque*, de *etwa* / *fast*, es *unos* / *casi* (the masculine cited), pt *cerca de* /
*quase*, ja 約 / ほとんど.

**Recommendation: as above.**

## 1. Seeds

The command's purpose needs an adjective that is not seeded. A probe of `setterOf('QUANTITY',
'NOUN', ['NEAR'])` read "to set a noun's near quantity" (it *la quantità vicina*): wrong in all
seven. So seed **APPROXIMATE** through `/seed`: en *approximate*, it *approssimativo*, fr
*approximatif*, de *ungefähr*, es / pt *aproximado*, ja おおよその. Then compose
`setterOf('QUANTITY', 'NOUN', ['APPROXIMATE'])`, "to set a noun's approximate quantity". Probe it
before pinning, then reseed `signi.db`.

## 2. Shared and engine

- `ALMOST_DETERMINERS` moves to `packages/shared/src/index.ts` (D2).
- `UiStringApproximatorDef`, and `translateApproximator` over `APPROXIMATOR_WORDS`.
- Rebuild the dists.

## 3. Model — `packages/phrase/src/model/`

- **`PhraseSelection.approximators`**, dropped by `clearNounPhraseParts`.
- **`approximatorFor`** and **`setApproximated(prev, which, on)`**, plus the drops in `setNumeral`
  and `setDefiniteness` (D2).
- **Plan:** `buildNounPhrase` writes `approximator: approximatorFor(sel, which)` when flagged, next
  to `numeral` ([L63](../../../../../packages/phrase/src/model/selectionToPlan/functions/buildNounPhrase.ts#L63)).
- **`planToWorkspace`:** `approximator` joins `NOUN_FIELDS` (D2).

## 4. Canvas — `NounPhraseBuilder.tsx`

`DeterminerMenu` gains `approximator` / `onApproximated` props. It adds a `menuitemcheckbox`
(`data-testid="determiner-approximator"`) after the numeral field, disabled when `approximatorFor`
would return none for the value on screen. `PhraseRenderContext` gains `handleSetApproximated`, and
`phraseCommands` gains the handler, as `/num` added `handleSetNumeral`.

## 5. Keyboard

No new binding, as for the contrast and the numeral: D opens the menu, and the arrow keys reach the
row. There is no Alt layer. No `KEY_COMMANDS` entry is needed.

## 6. Console — `packages/phrase/src/language/`

- `commands.ts`: `/approx` (D3), `color: "setting"`, `satellites: /Definiteness$/`, reducers
  `["setApproximated"]`, topic *determiner*.
- `print.ts` prints `/approx` after `/num`, and `apply.ts` and `words.ts` handle it.
- The frontend's `help.ts` gets `/subj ( cat /num 5 /approx ) /verb ( run )`.
- **The P02 debt:**
  - `golden.test.ts` lines for both readings, and a misuse on `/some`;
  - a `help.test.ts` example;
  - a `phraseCommands` handler row;
  - a round-trip walk op that sets the flag and then changes the numeral and the determiner under
    it.

## 7. UI strings — [`uiStrings.ts`](../../../../../packages/shared/src/uiStrings.ts)

- `approximator.value.about` / `approximator.value.almost` (D4), beside `determiner.numeral`
  ([L1107](../../../../../packages/shared/src/uiStrings.ts#L1107)).
- `purpose.approximator` (§1), beside `purpose.numeral`
  ([L3174](../../../../../packages/shared/src/uiStrings.ts#L3174)).

Every one must render in all seven at boot.

## Tests

- **Model:**
  - `approximatorFor` over numeral, `all` / `no` / `many`, `some`, and a numeral with `all`.
  - The drops in `setNumeral` and `setDefiniteness`.
  - `buildNounPhrase` emits the derived value.
  - `planToWorkspace` round-trips the first three columns and reports an ignored value.
- **Canvas:** `NounPhraseBuilder.test.tsx` covers the row, its label per quantity and its disabled
  state.
- **Engine:** `approximators.test.ts` pins the fourteen labels. The sentence cells stay as E38
  pinned them.
- **Console:** the debt in §6, and `SEEDS=5000 npx vitest run packages/frontend/test/console/roundTrip.test.ts`,
  run from the repo root.
- **e2e:** `definitions.spec.ts` or `noun-phrase.spec.ts` builds "about five cats run" and "almost
  all cats run" through the menu and checks all seven. `console.spec.ts` covers `/approx` and
  `/del approx`.

## Verification

1. Seed APPROXIMATE, rebuild the shared and engine dists, and boot the backend. The new strings
   render in all seven.
2. All suites are green, and the workspace typecheck is clean.
3. In the browser (5173), build the table's first three columns. Then remove the numeral from
   *about five cats* and watch the row fall back to disabled.

## Out of scope

- ***Almost* on a numeral** ("almost five cats") and on a verb ("almost fell"), which E38 D1 and D3
  leave out.
- **Dropping *many*** from `ALMOST_DETERMINERS` (E38 Done 4). It is a product call, and after D2
  the gate follows it by itself.
- Nothing is left of E38 Done 5's complement defects: A291 and A292 are fixed, and *in about five
  houses* now renders cleanly in all seven. That includes de *in etwa fünf Häusern*, fr *dans
  environ cinq maisons*, es *en unas cinco casas* and ja 約五軒の家で (probed 2026-09-25).
