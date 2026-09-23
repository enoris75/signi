# P09-E20. Temporal *between* — a span with two ends

**Construct:** a seventh [`TemporalRelation`](../../../../../packages/shared/src/index.ts#L424),
`between`, for "runs **between this day and that day**" — the one temporal relation
[C29](../../../../localization/done/C29-temporal-complement.md) did not build, and the one that needs a
second landmark.
**Shape:** one value on an existing complement, plus E1's group scope
([`GROUP_SCOPED_SPECIFIERS`](../../../../../packages/shared/src/index.ts#L387)) taught to read a
temporal relation. No new complement, no new field, no new lifting machinery.
**Scope:** all 7 languages, plan-only like the rest of the temporal complement (no ring yet).
**Status:** **shipped, 2026-09-24** — in the engine for all seven languages, and (unlike the plan
assumed) on the canvas's temporal toolbar and in the console as `/span`; see [Done](#done). Filed
2026-09-23 from P09's follow-ups
([E1](P09-E1-spatial-relations.md#out-of-scope-follow-ups), *`between` as a temporal relation*).
**Words:** *between* (of times).

| lang | the cat runs **between this day and that day** | the cat runs **between the day and the night** |
|---|---|---|
| en | the cat runs between this day and that day. | the cat runs between the day and the night. |
| it | il gatto corre tra questo giorno e quel giorno. | il gatto corre tra il giorno e la notte. |
| fr | le chat court entre ce jour-ci et ce jour-là. | le chat court entre le jour et la nuit. |
| de | der Kater läuft zwischen diesem Tag und jenem Tag. | der Kater läuft zwischen dem Tag und der Nacht. |
| es | el gato corre entre este día y ese día. | el gato corre entre el día y la noche. |
| pt | o gato corre entre este dia e esse dia. | o gato corre entre o dia e a noite. |
| ja | 猫はこの日とその日の間に走ります。 | 猫は日と夜の間に走ります。 |

Engine output since 2026-09-24 (it was the proposal, and landed character for character). The French
*-ci / -là* needs [C40](../../../../localization/done/C40-french-distal-demonstrative.md)'s
`contrastive` on both conjuncts (D4).

## Done

Shipped 2026-09-24. `between` is the seventh `TemporalRelation`; `GROUP_SCOPED_TEMPORAL_RELATIONS`
(`between` alone) sits beside `GROUP_SCOPED_SPECIFIERS`, and `groupScopedRelation` gained its
`temporal` branch, returning `PathSpecifier | TemporalRelation | undefined`. No engine's coordinate
line changed: each lifts the same `BETWEEN_PREP` for a time as for a place. Each temporal map gained
one `between` row (en `between`, it `{ word: 'tra' }`, fr `entre`, de `zwischen` through the plain
dative `prepDet` line, es/pt `{ word: 'entre' }`, ja `{ noun: 'の間', particle: 'に' }`). Engine
output, pinned in [`temporal.test.ts`](../../../../../packages/engine/test/complements/temporal.test.ts):

| | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| between this day and that day (`contrastive`) | the cat runs between this day and that day. | il gatto corre tra questo giorno e quel giorno. | le chat court entre ce jour-ci et ce jour-là. | der Kater läuft zwischen diesem Tag und jenem Tag. | el gato corre entre este día y ese día. | o gato corre entre este dia e esse dia. | 猫はこの日とその日の間に走ります。 |
| between the day and the night | the cat runs between the day and the night. | il gatto corre tra il giorno e la notte. | le chat court entre le jour et la nuit. | der Kater läuft zwischen dem Tag und der Nacht. | el gato corre entre el día y la noche. | o gato corre entre o dia e a noite. | 猫は日と夜の間に走ります。 |
| a single time (D4) | the cat runs between this day. | il gatto corre tra questo giorno. | le chat court entre ce jour. | der Kater läuft zwischen diesem Tag. | el gato corre entre este día. | o gato corre entre este dia. | 猫はこの日の間に走ります。 |
| with a locative | the cat runs in the house between this day and that day. | il gatto corre nella casa tra questo giorno e quel giorno. | le chat court dans la maison entre ce jour-ci et ce jour-là. | der Kater läuft im Haus zwischen diesem Tag und jenem Tag. | el gato corre en la casa entre este día y ese día. | o gato corre na casa entre este dia e esse dia. | 猫は家でこの日とその日の間に走ります。 |
| `during` over the group (unchanged, distributes) | the cat runs during the day and the night. | il gatto corre durante il giorno e durante la notte. | le chat court pendant le jour et pendant la nuit. | der Kater läuft während des Tages und während der Nacht. | el gato corre durante el día y durante la noche. | o gato corre durante o dia e durante a noite. | 猫は日と夜の間に走ります。 |

Without `contrastive` French writes "entre ce jour et ce jour" (pinned, D4). The "every relation is
distinct" spec now expects one merger in Japanese (`between` = `during` on a single day, D3) as it
already did in German (`ago` = `before`).

What landed differently from the plan:

1. **The temporal complement is no longer plan-only.** P09-E12b gave it a box and a relation
   toolbar after this task was filed, and both read `TEMPORAL_RELATIONS`, so the seventh relation
   reached the frontend (Verification 3's "no frontend change" did not hold; still no reseed — the
   label is a specifier citation, not a concept):
   - a `temporal.value.between` UI string, cited on a bare noun like its six siblings (en *between*,
     it *tra*, fr *entre*, de *zwischen*, es/pt *entre*, ja 〜の間に — the same citation as `during`'s,
     D3), pinned in `uiLabel.test.ts`;
   - the toolbar's `between` button, key **W** (the spatial toolbar's letter for the same relation)
     and the `DateRange` icon; `Boxes.test.tsx`'s six-relation pins became seven.
2. **The console names it `/span`, not `/between`.** A command has one name (`BY_NAME`), and
   `/between` is already the place's relation. `/span` sets the time's: `/time ( day /span /and
   night )` — a golden entry (with the `noTarget` misuse on a locative) and a help example.
3. `groupScopedRelation.test.ts` also pins that the families stay apart: a path `between` on a
   temporal, or a temporal one on a locative, does not scope.

## Why

C29 built six relations to a time and every one takes a single point: *at*, *until*, *after*,
*before*, *during*, *ago*. The span with two ends — the commonest way to bound an act in time after
*until* — has no relation, so a plan can say "after this day" and "before that day" but not the
interval between them. E1 built exactly the machinery it needs for space two days earlier.

## Today

Verified at HEAD, 2026-09-23.

- [`TemporalRelation`](../../../../../packages/shared/src/index.ts#L424) is
  `at | ago | until | after | before | during`, listed by
  [`TEMPORAL_RELATIONS`](../../../../../packages/shared/src/index.ts#L426); no frontend map, UI string or
  console command is keyed by it (the complement is plan-only, absent from
  [`COMPLEMENT_TYPES`](../../../../../packages/shared/src/index.ts#L265)).
- **A coordinated time distributes its relation today.** Probed with `sayAll` on DAY `this` and DAY
  `that`, `during`: it "durante questo giorno e durante quel giorno", de "während dieses Tages und
  während jenes Tages", es/pt "durante … y durante …". English says it once. That is the right rule
  for the six relations, and the one `between` must opt out of — exactly E1's D2.
- **The locative `between` already renders the span, in the wrong complement.** The same group as a
  locative with `between`: en "runs between this day and that day", it "tra questo giorno e quel
  giorno", de "zwischen diesem Tag und jenem Tag", es "entre este día y ese día", pt "entre este dia
  e esse dia", fr "entre ce jour-ci et ce jour-là" (with `contrastive`), ja
  この日とその日の**間で**. Six languages are character-right; Japanese takes the place particle で
  where a time takes に. So the words exist — what is missing is the temporal home (its render order
  beside the other *when*, its particle, and a plan that can hold a place *and* a span:
  "runs in the house between this day and that day").
- **The group scope is space-only.** [`groupScopedRelation`](../../../../../packages/engine/src/functions/groupScopedRelation.ts#L16)
  reads `route`, `locative` and `direction` and returns `undefined` for every other complement. Each
  fronting engine asks it once, at its single coordinate call, and lifts its own `BETWEEN_PREP` off
  each conjunct with [`liftPreposition`](../../../../../packages/engine/src/functions/liftPreposition.ts):

| lang | coordinate call | lifted word | temporal map |
|---|---|---|---|
| en | none needed (said once already) | — | [`TEMPORAL_PREP`](../../../../../packages/engine/src/languages/en/en.consts.ts#L87) |
| it | [`complementsPhrase.ts:257`](../../../../../packages/engine/src/languages/it/complementsPhrase.ts#L257) | [`tra`](../../../../../packages/engine/src/languages/it/it.consts.ts#L144) | [`IT_TEMPORAL`](../../../../../packages/engine/src/languages/it/it.consts.ts#L23) |
| fr | [`complementsPhrase.ts:337`](../../../../../packages/engine/src/languages/fr/complementsPhrase.ts#L337) | [`entre`](../../../../../packages/engine/src/languages/fr/fr.consts.ts#L115) | [`FR_TEMPORAL`](../../../../../packages/engine/src/languages/fr/fr.consts.ts#L175) |
| de | [`complementsPhrase.ts:308`](../../../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts#L308) | [`zwischen`](../../../../../packages/engine/src/languages/de/de.consts.ts#L136) | [`DE_TEMPORAL`](../../../../../packages/engine/src/languages/de/de.consts.ts#L210) |
| es | [`complementsPhrase.ts:263`](../../../../../packages/engine/src/languages/es/complementsPhrase.ts#L263) | [`entre`](../../../../../packages/engine/src/languages/es/es.consts.ts#L130) | [`ES_TEMPORAL`](../../../../../packages/engine/src/languages/es/es.consts.ts#L203) |
| pt | [`complementsPhrase.ts:281`](../../../../../packages/engine/src/languages/pt/complementsPhrase.ts#L281) | [`entre`](../../../../../packages/engine/src/languages/pt/pt.consts.ts#L162) | [`PT_TEMPORAL`](../../../../../packages/engine/src/languages/pt/pt.consts.ts#L225) |
| ja | none needed (の間 follows the group) | — | [`JA_TEMPORAL`](../../../../../packages/engine/src/languages/ja/ja.consts.ts#L89) |

- **Japanese `during` is already の間に** ([`ja.consts.ts:95`](../../../../../packages/engine/src/languages/ja/ja.consts.ts#L95)),
  so a `during` over a group already reads この日とその日の間に — which *is* the Japanese for
  "between this day and that day". See D3.

## Design

### D1. A relation on the temporal complement — not a span field, not the locative

Three shapes:

1. **`between` as a seventh `TemporalRelation`**, over a coordinated `NounGroup`, as E1's spatial
   `between` is over one.
2. **A two-field span** (`from` + `until` on the complement) — "from Monday until Friday", *dal … al
   …*, *von … bis …*, 〜から〜まで. A different construct: its two ends take two different adpositions
   and are not a coordination at all.
3. **Leave it to the locative `between`**, which already writes six of the seven.

**Recommendation: (1).** It is one value where the five others live, reuses the group the model
already has ([`Complement.phrase`](../../../../../packages/shared/src/index.ts#L1098) is a `NounElement`),
and keeps the *when* in the temporal slot, so a plan can carry a place and a span together. (3) is
a misuse that gets Japanese wrong and occupies the locative. (2) is worth having and is filed as a
follow-up; it is a source-and-until pair, not a between.

### D2. The group scope reads a temporal relation too

`GROUP_SCOPED_SPECIFIERS` is a `ReadonlySet<PathSpecifier>`. Two ways to let a time in:

1. Widen it to `PathSpecifier | TemporalRelation` — the string `'between'` is the same in both, which
   is exactly why it would be wrong: it would stop saying which family a member is from.
2. **A sibling `GROUP_SCOPED_TEMPORAL_RELATIONS: ReadonlySet<TemporalRelation>`** (`between` alone),
   and `groupScopedRelation` gains a `temporal` branch reading
   [`temporalRelation(c)`](../../../../../packages/engine/src/functions/temporalRelation.ts#L10).

**Recommendation: (2).** The helper's return type widens to `PathSpecifier | TemporalRelation |
undefined`; every call site only tests it for truth (`groupScopedRelation(type, c) ? BETWEEN_PREP :
''`), so **no engine's coordinate line changes**. The lifted word is the same `BETWEEN_PREP` for time
as for space in all five fronting languages — *tra*, *entre*, *zwischen*, *entre*, *entre* — which is
what makes this nearly free. Each temporal map only has to spell the relation so that the lift finds
it at the front: it `{ word: 'tra' }`, fr `'entre'`, de `'zwischen'` (dative, through the existing
`prepDet` line), es/pt `{ word: 'entre' }` (no `de`, so no contraction), en `'between'`.

### D3. Japanese collides `between` with `during`, and should

Both are 〜の間に. On a single time (この日の間に) the two are one string; on a group they are one
string too, and it is the right one for `between`. **Recommendation: let them collide**, as E1 let
`on` and `over` collide on の上, and pin it with a comment. The one real fix Japanese gets is the
particle: に, not the locative's で.

Recorded, not fixed here: `during` over a group reads as "between" in Japanese today. "During this
day and that day" is rare enough that no one has asked for it to distribute (この日の間とその日の間に).

### D4. A single time, and the demonstratives

*Between this day* is odd but renders, as E1's single landmark does; asking for two is the builder's
business. **Recommendation: render it.** French needs C40's `contrastive` on both conjuncts to tell
*ce jour-ci* from *ce jour-là* — without it the pair is "entre ce jour et ce jour". That is the plan's
choice, not this construct's; the tests set it.

## 1. Shared types — [`packages/shared/src/index.ts`](../../../../../packages/shared/src/index.ts)

- `TemporalRelation` ([L424](../../../../../packages/shared/src/index.ts#L424)) and `TEMPORAL_RELATIONS`
  ([L426](../../../../../packages/shared/src/index.ts#L426)): add `between`, last.
- Its doc comment: a `between` row (*tra*, *entre*, *zwischen* + dative, の間に) naming the group
  scope and the Japanese collision.
- `GROUP_SCOPED_TEMPORAL_RELATIONS` beside `GROUP_SCOPED_SPECIFIERS` (D2), and a line in the latter's
  comment pointing at it.

## 2. Engine

- [`groupScopedRelation.ts`](../../../../../packages/engine/src/functions/groupScopedRelation.ts): the
  `temporal` branch and the widened return type.
- One `between` row in each temporal map in the table above. The compiler finds the three total
  `Record<TemporalRelation, …>` maps (en, it, ja); fr/de/es/pt use `Exclude<…>` maps and their
  temporal branch must be checked by hand — German's `until` / `during` are special-cased before
  `DE_TEMPORAL` is read ([`complementsPhrase.ts:240`](../../../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts#L240)).
- Japanese: `between: { noun: 'の間', reading: 'のあいだ', particle: 'に' }`.

## Tests

- [`test/complements/temporal.test.ts`](../../../../../packages/engine/test/complements/temporal.test.ts):
  the two-column table above in all seven, plus the single-time render.
- The same file's "every relation is distinct" spec: Japanese now loses one (between = during on a
  single day), as German already loses one (ago = before). Update its expectation with a comment.
- A `between` over a group with a locative in the same plan ("runs in the house between …"), to pin
  that the two complements are independent.
- [`groupScopedRelation.test.ts`](../../../../../packages/engine/src/functions/groupScopedRelation.test.ts):
  a temporal `between` scopes; every other temporal relation does not.
- The spatial `between` tests in `spatialRelations.test.ts` stay green untouched.

## Verification

1. `npm run build -w @signi/shared && npm run build -w @signi/engine`.
2. Engine suite green, workspace typecheck clean.
3. No reseed, no UI string, no frontend change: the complement has no box.

## Out of scope (follow-ups)

- **The two-ended span with two adpositions** — "from this day until that day" (*da … a*, *de … à*,
  *von … bis*, *de … a*, *de … até*, 〜から〜まで). Needs a `from`/`since` relation and a way to pair it
  with `until`; D1 (2).
- **A ring for the temporal complement**, owed since C29 (P09 *Follow-ups*); `between` would be one
  more relation on its toolbar.
- **Japanese `during` over a group** (D3).
- **`between` as a clause introducer** ("between the cat eating and the dog running") — no language
  here has one worth building.
