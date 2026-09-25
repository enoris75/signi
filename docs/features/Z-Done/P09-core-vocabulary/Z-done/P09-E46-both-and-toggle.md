# P09-E46. *Both … and* — a third state of the conjunction chip

**Feature:** a canvas control and a console command for E26's correlative, "**both** the cat
**and** the dog run". The engine renders it in all seven languages. Neither the canvas nor the
console can build it.
**Shape:** no engine grammar. One keyed flag on the selection, set from the chip that already
names a group's conjunction. One conjunct command, `/bothand`, with its print → apply round trip.
One label for the chip, which needs a small engine hook.
**Scope:** shared (a UiString kind), the engine (a label hook in each engine), the phrase model,
the canvas, the console. All 7 languages for the one new string.
**Status:** **done** 2026-09-25 — filed 2026-09-25 from P09's plan-only constructs; the
engine side is [P09-E26](P09-E26-both-and.md).

What the engine renders from a plan at HEAD (e811c91e). Probed 2026-09-25 with `sayAll` on an
in-memory seed:

| lang | subject: **both** the cat **and** the dog run | object | a locative group | three conjuncts, flag set (ignored) |
|---|---|---|---|---|
| en | both the cat and the dog run. | the man sees both the cat and the dog. | the cat runs in both the house and the market. | the cat, the dog and the man run. |
| it | sia il gatto sia il cane corrono. | l'uomo vede sia il gatto sia il cane. | il gatto corre sia nella casa sia nel mercato. | il gatto, il cane e l'uomo corrono. |
| fr | et le chat et le chien courent. | l'homme voit et le chat et le chien. | le chat court et dans la maison et dans le marché. | le chat, le chien et l'homme courent. |
| de | sowohl der Kater als auch der Hund laufen. | der Mann sieht sowohl den Kater als auch den Hund. | der Kater läuft sowohl im Haus als auch im Markt. | der Kater, der Hund und der Mann laufen. |
| es | tanto el gato como el perro corren. | el hombre ve tanto el gato como el perro. | el gato corre tanto en la casa como en el mercado. | el gato, el perro y el hombre corren. |
| pt | tanto o gato quanto o cão correm. | o homem vê tanto o gato quanto o cão. | o gato corre tanto na casa quanto no mercado. | o gato, o cão e o homem correm. |
| ja | 猫も犬も走ります。 | 男は猫も犬も見ます。 | 猫は家と市場で走ります。 | 猫と犬と男は走ります。 |

On `or` the flag is ignored too ("the cat or the dog runs"). Japanese keeps と on a complement
(E26 Done 2).

## Done

Shipped 2026-09-25. On a pair joined by *and* the conjunction chip cycles and → **both … and** → or
→ and; on three or more it cycles and ⇄ or as before, and Shift+C (`noun.conjunction`) walks the same
states. The flag is `PhraseSelection.correlatives` (keyed by noun block), set by `setCorrelative` and
dropped by `setNounConjunction` to `or`, by `addConjunct` past two, by `removeConjunct` and with the
head (`clearNoun`). `buildNounElement` writes `correlative: true`, and `planToWorkspace` reads it back
on an *and* pair or names `NounGroup.correlative off a pair`. The console says it with `/bothand`
(aliases `both_and`, `correlative`), printed in place of `/and`. The chip reads
`conjunction.correlative.and`, which each engine's `renderConjunction(conjunction, { correlative })`
cites from the pair its sentence writes (`CORRELATIVE_PAIR` in each European `*.consts.ts`,
`CORRELATIVE_MO` in `ja.consts.ts`). Engine output, from the real engine (subject, object and chip
label pinned in [`coordination.test.ts`](../../../../../packages/engine/test/coordination.test.ts)):

| lang | subject | object | a locative group | the chip |
|---|---|---|---|---|
| en | both the cat and the dog run. | the man sees both the cat and the dog. | the cat runs in both the house and the market. | both … and |
| it | sia il gatto sia il cane corrono. | l'uomo vede sia il gatto sia il cane. | il gatto corre sia nella casa sia nel mercato. | sia … sia |
| fr | et le chat et le chien courent. | l'homme voit et le chat et le chien. | le chat court et dans la maison et dans le marché. | et … et |
| de | sowohl der Kater als auch der Hund laufen. | der Mann sieht sowohl den Kater als auch den Hund. | der Kater läuft sowohl im Haus als auch im Markt. | sowohl … als auch |
| es | tanto el gato como el perro corren. | el hombre ve tanto el gato como el perro. | el gato corre tanto en la casa como en el mercado. | tanto … como |
| pt | tanto o gato quanto o cão correm. | o homem vê tanto o gato quanto o cão. | o gato corre tanto na casa quanto no mercado. | tanto … quanto |
| ja | 猫も犬も走ります。 | 男は猫も犬も見ます。 | 猫は家と市場で走ります。 | …も…も |

What landed differently from the plan:

1. **The flag goes with the head, not with a pronoun head.** §2 has `clearNounPhraseParts` drop it,
   but that runs whenever a pronoun replaces a noun, and a pronoun head keeps its conjuncts and its
   conjunction ("he and she"). The correlative is a fact about the group (E26 Done 1), so it is
   dropped where the group is: in `clearNoun`, with `${which}Conjuncts` and `${which}Conjunction`.
2. **No new `phraseCommands` handler.** The chip still calls `handleCycleConjunction`; its test's
   period is a pair, so the new row pins that the cycle hands up the correlative first.
3. **The round-trip walk's conjunct op now picks a predicate's conjunct from what the predicate
   takes** (an adjective or a noun), as the console's `conjunctSpec` reads it. The new chip op shifted
   the walk onto seeds where it put a pronoun beside a predicate adjective, which the console
   cannot read back ("/pred ( old /and one )": *Unknown word*). That was already reachable at HEAD
   with more seeds (SEEDS=20000: seeds 11126, 12089, 15383), so it is a lead, not this task's defect.
4. The existing e2e case that clicked the chip once for *or* now clicks it twice.

## Why

E26 shipped the correlative plan-only. A coordination is already one of the canvas's most used
constructs, and the correlative only changes how its join is spelled. P13 definitions round-trip
through the console, so the control ships with its command.

## Today

Verified at HEAD, 2026-09-25.

**The plan field.** [`NounGroup.correlative?: true`](../../../../../packages/shared/src/index.ts#L1164)
sits beside `conjunction` ([L1147](../../../../../packages/shared/src/index.ts#L1147)). The translator
keeps it only on an `and` group of exactly two conjuncts. Nothing in `packages/phrase` or
`packages/frontend` reads or writes it.

**How the canvas draws a group.** The block's own ring is the first conjunct. Each further conjunct
is a hosted ring painted by [`ConjunctRings`](../../../../../packages/frontend/src/components/PhraseBuilder/ConjunctRings.tsx).
A [`ConjunctionChip`](../../../../../packages/frontend/src/components/PhraseBuilder/ConjunctRings.tsx#L92)
sits on every line between two rings of a group. It is labelled `conjunction.value.*`, and a click
cycles and ⇄ or ([L184](../../../../../packages/frontend/src/components/PhraseBuilder/ConjunctRings.tsx#L184))
through [`cycleNounConjunction`](../../../../../packages/phrase/src/model/phraseReducers.ts#L960). The
coordinate control itself rides the noun's dotted ring, in the relations fan at six o'clock
([`ringSpecs.ts:243`](../../../../../packages/frontend/src/components/PhraseBuilder/ringSpecs.ts#L243)),
which already holds up to six entries (relative, headless, possessor, possessorRole, standard,
conjunct).

**The model.** The conjuncts are `${which}Conjuncts`, and the group's conjunction is
`${which}Conjunction` ([`interfaces.ts:505`](../../../../../packages/phrase/src/model/interfaces.ts#L505),
[L522](../../../../../packages/phrase/src/model/interfaces.ts#L522)).
[`buildNounElement`](../../../../../packages/phrase/src/model/selectionToPlan/functions/buildNounElement.ts)
drops empty conjuncts before it builds the group. `planToWorkspace` checks a group against
`GROUP_FIELDS = ["conjuncts", "conjunction"]`
([`planToWorkspace.ts:66`](../../../../../packages/phrase/src/model/workspacePlan/functions/planToWorkspace.ts#L66)),
so a correlative plan is reported as `NounGroup.correlative` unsupported. No seed definition uses one.

**Keys.** `noun.coordinate` is C and `noun.conjunction` is Shift+C, which cycles the chip
([`keymap.ts:525`](../../../../../packages/frontend/src/keyboard/keymap.ts#L525),
[L536](../../../../../packages/frontend/src/keyboard/keymap.ts#L536)).

**Console.** `/and` and `/or` are conjunct commands with a phrase argument
([`commands.ts:452`](../../../../../packages/phrase/src/language/commands.ts#L452),
[L465](../../../../../packages/phrase/src/language/commands.ts#L465)). The printer writes the group's
conjunction before each conjunct, `/subj ( cat /and dog )`
([`print.ts:470`](../../../../../packages/phrase/src/language/print.ts#L470)).
**`/both` is taken**: it is E25's quantity determiner ("both cats",
[L499](../../../../../packages/phrase/src/language/commands.ts#L499)).

**The chip's label.** [`UiStringConjunctionDef`](../../../../../packages/shared/src/uiStrings.ts#L143)
names one `CoordConjunction`, rendered by each engine's `renderConjunction`
([`types.ts:607`](../../../../../packages/engine/src/types.ts#L607)). The pair words live inline in
each joiner's call to [`correlate`](../../../../../packages/engine/src/functions/correlate.ts), e.g.
`['sowohl', 'als auch']` in `de/coordinate.ts`. No catalogue entry names the pair.

## Design

### D1. Seat: the conjunction chip, not the ring

1. **A third state of the chip.** On a group of exactly two conjuncts joined by `and`, the chip cycles
   and → both … and → or → and. On three or more it cycles and ⇄ or as today.
2. **A perimeter toggle** in the head's relations fan, beside the coordinate control.
3. **A second chip** before the first ring, where *both* is spoken.

The correlative is a way of spelling the join, and the chip is where the canvas says the join. (2)
puts a seventh entry into a fan that is about the noun's links. It would also stand on the head's
ring, while a correlative is a fact about the group (E26 Done 1). (3) draws a chip on no line.

**Recommendation: (1).** No ring gains a control, so no measurement is at stake. The chip is always
visible, so nothing is hidden: it reads BOTH … AND while the flag is on.

### D2. The model: a keyed flag, dropped when the group stops being a pair

- **Selection:** `correlatives?: Partial<Record<string, true>>`, keyed by noun block, like P13's
  `numerals` and `contrastives` ([L465](../../../../../packages/phrase/src/model/interfaces.ts#L465)).
- **Reducers:** `setCorrelative(prev, which, on)`, and a `cycleNounConjunction` that walks the
  three states on a pair. `setNounConjunction` to `or`, `addConjunct` past two and `removeConjunct`
  all drop the flag, as `setDefiniteness` drops a contrast off a demonstrative.

A stale flag, kept but muted, was the other option (E12a's question mark, E12c's dimmed standard).
It would make `/bothand` print on a three-conjunct line and read back ambiguously.

**Recommendation: drop it.** Then the printer and the plan never meet an invalid flag, and
`buildNounElement` emits `correlative: true` whenever the flag is set.

### D3. Console: `/bothand`, a conjunct command

The correlative is spelled where the conjunction is, so it is a third conjunct command beside `/and`
and `/or`: `/subj ( cat /bothand dog )`. Its action is `{ kind: "conjunct", conjunction: "and",
correlative: true }`. Aliases are `both_and` and `correlative`. It is printed in place of `/and` when
the flag is on.

If a `/bothand` is followed by a third conjunct, the flag is dropped, just as the chip drops it, so
the line previews the plain *and*. No diagnostic is needed, because the printer never writes that
line.

**Recommendation: as above.** `/both` stays the determiner.

### D4. The chip's label: the pair, from each engine

`conjunction.correlative.and`, a `UiStringConjunctionDef` with a new `correlative: true` field. It
is rendered by `renderConjunction(conjunction, { correlative })`, which returns the pair with an
ellipsis:

- en *both … and*;
- it *sia … sia*;
- fr *et … et*;
- de *sowohl … als auch*;
- es *tanto … como*;
- pt *tanto … quanto*;
- ja …も…も.

Each engine hoists its pair out of its `correlate` call into one constant, so the label and the
sentence read the same words.

**Recommendation: as above.** It is a label, not grammar, so no rendered sentence changes.

## 1. Shared and engine

- `UiStringConjunctionDef.correlative?: true`, and the engine's `translateConjunction` passes it
  through.
- In each of the seven engines, the pair becomes a constant that both `correlate` and
  `renderConjunction` read. Rebuild the shared and engine dists.

## 2. Model — `packages/phrase/src/model/`

- **`PhraseSelection`:** `correlatives`, and `clearNounPhraseParts` drops the block's entry.
- **Reducers:** as in D2.
- **Plan:** `buildNounElement` sets `correlative: true`.
- **`planToWorkspace`:** `GROUP_FIELDS` gains `correlative`. A flag on an `and` pair is set on the
  block. A flag on `or` or on three conjuncts is reported as
  `NounGroup.correlative off a pair`, the shape the contrast uses.

## 3. Canvas — `ConjunctRings.tsx`

`ConjunctionChip` takes `correlative` and shows `conjunction.correlative.and` while the flag is on.
Every chip of the group shows it, as every chip shows the conjunction today.

## 4. Keyboard

No new binding. Shift+C (`noun.conjunction`) cycles the chip through the same three states. There
is no Alt layer. `KEY_COMMANDS['noun.conjunction']` stays `or`.

## 5. Console — `packages/phrase/src/language/`

- `commands.ts`: `/bothand` (D3). Its `purposeKey` is the existing `purpose.conjunct`.
- `print.ts`, `apply.ts` and `complete.ts` handle `/bothand`, and `help.ts` in the frontend gets an
  example: `/subj ( cat /bothand dog ) /verb ( run )`.
- **The P02 debt:**
  - a `golden.test.ts` line, plus a three-conjunct line that reads back plain;
  - a `help.test.ts` example;
  - a `phraseCommands` handler row;
  - a round-trip walk op that cycles a pair's chip through the correlative.

## 6. UI strings — [`uiStrings.ts`](../../../../../packages/shared/src/uiStrings.ts)

Add one entry, `conjunction.correlative.and`, beside `conjunction.value.and`
([L2711](../../../../../packages/shared/src/uiStrings.ts#L2711)). It must render in all seven at boot.

## Tests

- **Model:**
  - `phraseReducers.test.ts`: the three-state cycle on a pair, the two-state cycle on three
    conjuncts, and the flag dropped by `or`, by a third conjunct and by a removal.
  - `buildNounElement` emits the flag.
  - `planToWorkspace` round-trips a correlative plan with no `unsupported` entry.
- **Canvas:** `ConjunctRings.test.tsx`: the chip shows the pair and cycles through it.
- **Engine:** `coordination.test.ts` pins the seven labels, and the sentence cells above stay as
  pinned.
- **Console:** the debt in §5, and `SEEDS=5000 npx vitest run packages/frontend/test/console/roundTrip.test.ts`,
  run from the repo root.
- **e2e:** a `noun-phrase.spec.ts` case that builds *cat and dog run*, clicks the chip once, and
  checks all seven rows against the first column. A `console.spec.ts` line for `/bothand`.

## Verification

1. Rebuild the shared and engine dists and boot the backend. The new label renders in all seven.
2. Engine, phrase, frontend and backend suites are green, and the workspace typecheck is clean.
3. In the browser (5173), build the subject and the object rows of the table and read the panel.
   Add a third conjunct and watch the chip fall back to AND.

## Out of scope

- ***Either … or*** and ***neither … nor*** (E26's follow-ups). When the engine has them, the same
  chip gains a state on `or`.
- **Japanese complements**, which keep と (E26 Done 2). The chip still offers the state there,
  because the six European languages spell it.
- **Clause-level correlatives** ("both runs and jumps").
