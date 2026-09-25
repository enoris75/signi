# P09-E51. Superlative set — the standard's ring undimmed on most and least

**Feature:** the canvas and console control for [E19](P09-E19-superlative-partitive.md)'s
superlative set: "the cat is the biggest **of the dogs**", *il più grande dei cani*, *der größte
der Hunde*, 犬の中で最も大きい. The standard's control and ring (E12c) stay offered and lit on
`most` and `least`, and the plan passes the set through.
**Shape:** no engine grammar. Three gates widen from `STANDARD_DEGREES` to every degree but
`positive` (D1). The control and the ring are named by degree, which needs one seeded grammar noun
(D2). The console prints `/outof` on a superlative and `/than` otherwise (D3).
**Scope:** frontend, console, one seed and its UI strings, all 7 languages. The predicate adjective
only, as E19 D5 is. The attributive set is out (D4).
**Status:** **done** 2026-09-25 (see *Done*); filed 2026-09-25 from P09's plan-only constructs; the
engine side is [P09-E19](P09-E19-superlative-partitive.md).

Rendered at HEAD (2026-09-25) from hand-written plans, with the real lexicon:

| lang | the cat is **the biggest of the dogs** | the cat is **the least big of the animals** | the cat is **the biggest in the family** | the cat is **the biggest of us** |
|---|---|---|---|---|
| en | the cat is the biggest of the dogs. | the cat is the least big of the animals. | the cat is the biggest in the family. | the cat is the biggest of us. |
| it | il gatto è il più grande dei cani. | il gatto è il meno grande degli animali. | il gatto è il più grande della famiglia. | il gatto è il più grande di noi. |
| fr | le chat est le plus grand des chiens. | le chat est le moins grand des animaux. | le chat est le plus grand de la famille. | le chat est le plus grand d'entre nous. |
| de | der Kater ist der größte der Hunde. | der Kater ist das am wenigsten große der Tiere. | der Kater ist der größte der Familie. | der Kater ist der größte von uns. |
| es | el gato es el más grande de los perros. | el gato es el menos grande de los animales. | el gato es el más grande de la familia. | el gato es el más grande de nosotros. |
| pt | o gato é o maior dos cães. | o gato é o menos grande dos animais. | o gato é o maior da família. | o gato é o maior de nós. |
| ja | 猫は犬の中で最も大きいです。 | 猫は動物の中で最も大きくないです。 | 猫は家族の中で最も大きいです。 | 猫は私たちの中で最も大きいです。 |

## Why

E19 made `headStandard` read as the set on a superlative. At integration, the builder was then made
to keep the set **out** of its plans: a standard carried through a degree cycle would otherwise have
rendered while the canvas drew its ring faded. So "the biggest of the dogs" renders from a plan, but
nothing can build it. The field, the ring, the control and the command all exist. What is missing is
the gate, and a name for the control that fits a set.

## Today

Verified at HEAD, 2026-09-25.

- **Three gates on `STANDARD_DEGREES`** (`more`, `less`, `equally`,
  [`shared/src/index.ts:163`](../../../../../packages/shared/src/index.ts#L163)):
  - `buildNounPhrase` passes `headStandard` only there
    ([L46–L49](../../../../../packages/phrase/src/model/selectionToPlan/functions/buildNounPhrase.ts#L46));
  - the satellite's `available`
    ([`rawSatellites.tsx:782`](../../../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L782));
  - `takesStandard`, which dims the ring
    ([`standardRing.ts:28`](../../../../../packages/frontend/src/components/PhraseBuilder/standardRing.ts#L28),
    [L58](../../../../../packages/frontend/src/components/PhraseBuilder/standardRing.ts#L58)).
- **The superlatives' set lives in the engine.** `SUPERLATIVE_DEGREES` is in
  [`translator.consts.ts:68`](../../../../../packages/engine/src/translator/translator.consts.ts#L68),
  which re-exports shared's `STANDARD_DEGREES` ([L72](../../../../../packages/engine/src/translator/translator.consts.ts#L72)).
  E19 deliberately left `STANDARD_DEGREES` narrow.
- **The console already round-trips a set.** The printer writes `/than` under any degree
  ([`print.ts:449–454`](../../../../../packages/phrase/src/language/print.ts#L449)), and `takes` reads
  it back under any degree ([`words.ts:402`](../../../../../packages/phrase/src/language/words.ts#L402)).
  So `/pred ( big /most /than [ dog /pl ] )` holds a set today; it is only muted.
  `planToWorkspace` maps any `headStandard` to `predicativeStandard`
  ([L310](../../../../../packages/phrase/src/model/workspacePlan/functions/planToWorkspace.ts#L310)), so a
  P13 definition with a set would reach the workspace and then drop out of its rebuilt plan.
- **Names already taken.** `/of` is an alias of `/poss`
  ([`commands.ts:423`](../../../../../packages/phrase/src/language/commands.ts#L423)), and `/among` and
  `/in` are spatial settings ([L576](../../../../../packages/phrase/src/language/commands.ts#L576),
  [L587](../../../../../packages/phrase/src/language/commands.ts#L587)). `/most` and `/least` are the
  degrees ([L756](../../../../../packages/phrase/src/language/commands.ts#L756)).
- **The labels are the comparative's.** The ring title, the control and `/than` are all
  `slot.standard` ([`uiStrings.ts:720`](../../../../../packages/shared/src/uiStrings.ts#L720)), from
  STANDARD_OF_COMPARISON ([`nouns.ts:5598`](../../../../../packages/backend/src/concepts/nouns.ts#L5598)):
  de *Vergleichsgröße*, ja 比較の基準. The ring's `visibleSlots` title is hard-wired to it
  ([`visibleSlots.ts:26`](../../../../../packages/phrase/src/model/functions/visibleSlots.ts#L26)).
- **Pinned as dimmed:** `standardRing.test.ts` ([L20–L22](../../../../../packages/frontend/test/standardRing.test.ts#L20),
  [L50](../../../../../packages/frontend/test/standardRing.test.ts#L50)), `buildNounPhrase.test.ts`
  ([L55](../../../../../packages/frontend/test/selectionToPlan/functions/buildNounPhrase.test.ts#L55)),
  `rawSatellites.test.tsx` ([L341](../../../../../packages/frontend/test/satellites/functions/rawSatellites.test.tsx#L341)),
  and `e2e/comparison.spec.ts`, whose one degree click goes from `more` to `most` and expects the ring
  faded ([L50–L56](../../../../../e2e/comparison.spec.ts#L50)).

## Design

### D1. The gate is "not positive"

- **Move `SUPERLATIVE_DEGREES` to shared**, beside `STANDARD_DEGREES`, and have the engine re-export
  it, as E12c moved the other set.
- **Leave `STANDARD_DEGREES` as it is**, because the engine reads it for *than*.
- **One predicate, `takesStandardOrSet(degree)`**, in `packages/phrase`. It is true on either set,
  and it feeds `buildNounPhrase`, the satellite and `takesStandard`, so the plan and the ring cannot
  disagree again.

`positive` alone now dims the ring. A degree cycle from `more` to `most` turns "bigger than the dogs"
into "the biggest of the dogs", which is E19 D1's reason for sharing the field.

**Recommendation: as above.**

### D2. The control is named by degree

1. **One label**, `slot.standard`, for both readings. STANDARD_OF_COMPARISON's definition ("a
   phrase that a degree governs") covers a set. But its words name a rival, not a set: de
   *Vergleichsgröße* is a quantity, ja 比較の基準 a benchmark.
2. **A second grammar noun**, COMPARISON_SET, which names the ring, the control and the command on
   `most` / `least`. Candidate words, to probe in memory before seeding:
   - en *comparison set*;
   - it *insieme di confronto*;
   - fr *ensemble de comparaison*;
   - de *Vergleichsmenge*;
   - es *conjunto de comparación*;
   - pt *conjunto de comparação*;
   - ja 比較の範囲.

   Its definition is composed as STANDARD_OF_COMPARISON's is.

**Recommendation: (2).** The canvas explains the phrase's structure, and a rival and a set are
different things. Three new strings, built as E12c's are:
- `slot.comparisonSet`;
- `action.removeComparisonSet`;
- `purpose.comparisonSet` ("to add a comparison set to a superlative").

`/del` keeps its one diagnostic, `diagnostic.noAdjectiveHasStandard`.

The control's icon becomes Leaderboard (a podium) on a superlative, and stays Balance otherwise.
`visibleSlots`' ring title reads the host's degree. An unseeded word is a seed step, never an English
literal.

### D3. The console: `/outof` on a superlative

1. **`/than` whatever the degree** (today). `/pred ( big /most /than [ dogs ] )` reads as "*biggest
   than the dogs*", the very thing E5 D3 refused in six languages.
2. **`/of`**: taken by `/poss`. It would also read as a possessor.
3. **`/among`** or **`/in`**: taken by the spatial relations (E32's *among*).
4. **`/outof`** (aliases `out_of`, `set`): "the biggest out of the dogs". This is a **second
   `CommandDef` with the same `{ kind: "standard" }` action**, so it gets its own description
   (`slot.comparisonSet`) and purpose. The printer writes it when the predicate adjective's degree is
   `most` or `least`, and `/than` otherwise, `positive` included.

**Recommendation: (4).**
- **Apply** reads either name under any degree, so the round trip holds, and a line typed with the
  "wrong" one is not an error. The next print writes the canonical name, and nothing is messaged:
  the console does the unambiguous thing rather than telling.
- **Removing it:** `/del outof` is a synonym of `/del than`.
- **References:** the step stays `than` (`#1.pred.than`). It names the address, not the reading, and
  a step that changes with the degree would break references across a degree cycle.
- **Help:** `topicOf` lists both under *degree*.

### D4. The attributive set is out, and E50 already has room for it

"The biggest cat of the three" is a set on an **attributive** superlative. The engine drops it:
probed at HEAD, `adjectiveStandards` on `most` renders "the man sees the biggest cat.", because
[`resolveAdjectiveStandard`](../../../../../packages/engine/src/translator/functions/resolveAdjectiveStandard.ts#L23)
reads only `STANDARD_DEGREES`. E19 D5 postponed it because of the Romance possessor collision:
- A271 has since fixed Italian;
- fr, es and pt still write a possessor after the standard ([E50](../P09-E50-attributive-standard.md) *Today*).

**Recommendation: an engine ticket first, not part of this task or of E50.** How the two tickets
meet:
- **E50** keeps one standard per noun and maps it onto the first adjective whose degree is in
  `STANDARD_DEGREES`. A superlative adjective's standard stays dimmed and printed as `/than`.
- **Once the engine renders the attributive set**, the only changes are:
  - E50's `comparedAdjectiveIndex` uses D1's predicate;
  - the printer's `/outof` rule reads that adjective's degree.

  There is no model change.
- **Scheduling:** E51 first. It is smaller and moves no geometry. E50 then generalises the same
  `standardRing.ts` and `print.ts` lines. If both run in one lane, take them in that order.

## 1. Shared and seeds

- `SUPERLATIVE_DEGREES` moves to [`packages/shared/src/index.ts`](../../../../../packages/shared/src/index.ts),
  and `translator.consts.ts` re-exports it. Rebuild the shared and engine dists.
- COMPARISON_SET goes in `nouns.ts` after STANDARD_OF_COMPARISON (D2), seeded through `/seed`.
  Reseed `signi.db`.

## 2. Model and canvas

- `buildNounPhrase` uses D1's predicate. Its comment's "which the canvas does not offer yet" goes.
- `takesStandard` and the satellite's `available` use D1's predicate too. The satellite's `label`,
  `labelKey` and icon follow the degree (D2). `standardSpotFor` then dims only on `positive`.
- The ring's title (`visibleSlots.ts`) and its remove control's title follow the degree.
- No geometry changes: the same control on the same ring. H (`predicative.standard`) toggles it under
  either name.

## 3. Console

- `commands.ts`: the `/outof` def (D3). `print.ts`: the name by degree. Complete lists `/outof`
  after `/most` / `/least` and `/than` after the rest.
- **P02 debt:**
  - a `golden.test.ts` line, `/verb seem /pred big /most /than dog` printing
    `/verb ( seem ) /pred ( big /most /outof [ dog ] )`, with a misuse on a pronoun (E50 makes a
    predicate noun a valid target);
  - a help example;
  - the walk's reach check (`roundTrip.test.ts:509`) now reaches a comparing standard, a set and a
    muted one;
  - `SEEDS=5000`.

## Tests

- **Flip what pins the dimming** (*Today*): `most` and `least` are offered and undimmed, and
  `buildNounPhrase` passes `headStandard` on them. `positive` still dims and omits.
- **Labels:** `rawSatellites.test.tsx` checks the label and icon per degree, and `uiStrings.test.ts`
  renders the three new entries in all seven.
- **Seed:** COMPARISON_SET is pinned in `nounPhrase.test.ts`, as STANDARD_OF_COMPARISON is.
- **e2e:** `comparison.spec.ts`'s one click from `more` now lands on a live set, and with a singular
  DOG English says "the biggest **in** the dog". Reach the dimming with Shift+M instead (`more` →
  `positive`). Add a set test that makes the dog plural, clicks to `most` and checks "the cat is the
  biggest of the dogs" in all seven. Add a console test for `/outof`.

## Verification

1. `npm run build -w @signi/shared && npm run build -w @signi/engine`, `npm run seed`, boot the
   backend: the new strings render in all seven.
2. Engine, frontend, phrase and backend suites green; typecheck clean; round trip at `SEEDS=5000`.
3. In the browser (5173), build "the cat is bigger than the dogs" and cycle the degree. Check:
   - `most` and `least` read as the table;
   - the control's label and the console's command change with the degree;
   - `positive` dims the ring.

## Out of scope (follow-ups)

- **The attributive set** ("the biggest cat of the three"): an engine ticket, then D4's two lines.
- **The headless superlative** ("the biggest of the cats eats") and **ordinal + superlative**, as
  in E19.

## Done

Shipped 2026-09-25. `SUPERLATIVE_DEGREES` moved to shared beside `STANDARD_DEGREES` (the engine
re-exports both). One predicate, `takesStandardOrSet` (with `readsAsSet`) in
[`packages/phrase/src/model/functions/comparison.ts`](../../../../../packages/phrase/src/model/functions/comparison.ts),
gates `buildNounPhrase`, the satellite and `takesStandard`, so only `positive` dims. COMPARISON_SET
is seeded after STANDARD_OF_COMPARISON ("a group that a degree governs", as that one is "a phrase that
a degree governs"). On `most` / `least` the control is *Comparison set* with a Leaderboard icon, the
ring's head is titled `slot.comparisonSet`, and its remove control is `action.removeComparisonSet`. The
console's `/outof` (aliases `out_of`, `set`) is a second `CommandDef` on the `standard` action; the
printer writes it on a superlative and `/than` on the rest, `/del outof` removes like `/del than`, the
reference step stays `than`, and completion offers the name the degree prints.

Engine output from plans (the plan the builder now makes), rendered 2026-09-25:

| | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| biggest of the dogs | the cat is the biggest of the dogs. | il gatto è il più grande dei cani. | le chat est le plus grand des chiens. | der Kater ist der größte der Hunde. | el gato es el más grande de los perros. | o gato é o maior dos cães. | 猫は犬の中で最も大きいです。 |
| least big of the animals | the cat is the least big of the animals. | il gatto è il meno grande degli animali. | le chat est le moins grand des animaux. | der Kater ist das am wenigsten große der Tiere. | el gato es el menos grande de los animales. | o gato é o menos grande dos animais. | 猫は動物の中で最も大きくないです。 |
| biggest in the family | the cat is the biggest in the family. | il gatto è il più grande della famiglia. | le chat est le plus grand de la famille. | der Kater ist der größte der Familie. | el gato es el más grande de la familia. | o gato é o maior da família. | 猫は家族の中で最も大きいです。 |
| biggest of us | the cat is the biggest of us. | il gatto è il più grande di noi. | le chat est le plus grand d'entre nous. | der Kater ist der größte von uns. | el gato es el más grande de nosotros. | o gato é o maior de nós. | 猫は私たちの中で最も大きいです。 |

The new strings, rendered at boot: `slot.comparisonSet` en *Comparison set*, it *Insieme di
confronto*, fr *Ensemble de comparaison*, de *Vergleichsmenge*, es *Conjunto de comparación*, ja
比較の範囲, pt *Conjunto de comparação*; `purpose.comparisonSet` de "eine Vergleichsmenge zu einem
Adjektiv hinzufügen", ja 形容詞に比較の範囲を加える.

What landed differently from the plan:

1. **`purpose.comparisonSet` adds the set "to an adjective"**, not "to a superlative": SUPERLATIVE
   is not seeded, and the adjective is what `/outof` attaches to, as `purpose.standard` says.
2. **The standard's ring no longer leaks English on its head box and its control's tooltip.**
   `slot.standard` was missing from `PART_BY_LABEL_KEY`, so the box's clear button read "Clear
   Standard of comparison" and the control "Show Standard of comparison" in every language. Both
   `standard` and `comparisonSet` joined `CANVAS_PARTS`, `CLEARABLE_PARTS` and `REVEALABLE_PARTS`
   (six generated strings: `action.clear|show|hide.standard|comparisonSet`), and
   `canvasCommands.test.ts` walks the standard's ring and control.
3. **A superlative with no set reads "the cat is biggest."** (no article), the engine's rendering at
   HEAD; the e2e specs pin it after `/del outof`.
4. **e2e reaches the dimmed ring by clicking the degree all the way round** (most → less → least → equally
   → positive) rather than by Shift+M, which needs the keyboard cursor on the predicative.
5. **The keymap's H keeps its static label** `slot.standard`; the key is the same control under
   either name.
6. The attributive set stays out (D4), unbuilt: the engine still drops it.

