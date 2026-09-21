# A179. A passive infinitive has no voice control, and the console prints it as active

**Area:** Frontend (the canvas and the phrase console)

Set a transitive verb's voice to passive, then make the period an infinitive. The translation says the
passive infinitive, "to be loved", and it should: a passive infinitive is a real citation form, and
the definitions use it ([A16](../../localization/done/A16-seem.md)'s SEEM is "to be perceived as an
object"). Two things go wrong after that.

1. **The canvas hides the passive.** The voice control is withdrawn whenever the finite slot is taken
   ([rawSatellites.tsx](../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx),
   `available: !finiteSlotTaken && …`), and `finiteSlotTaken` is the command **or** the infinitive.
   The comment gives only the command's reason: "a command is always active". So the translation
   says a passive that no control shows, and the only way back to active is to leave the infinitive.
   [`setImperative`](../../../packages/frontend/src/components/PhraseBuilder/phraseReducers.ts) resets
   the voice to active, which is why the command has no such case. `setInfinitive` resets the tense,
   the aspect and the modals, but not the voice.
2. **The console loses it.** [`settingTakes`](../../../packages/frontend/src/console/language/words.ts)
   gates the voice on the same `finiteSlotTaken`, so [`print.ts`](../../../packages/frontend/src/console/language/print.ts)
   writes no `/passive` for the period, and applying the line gives back an active. The round-trip
   invariant fails:

| State | Printed | Applied back |
|---|---|---|
| LOVE + DOG object, passive, then infinitive | `/inf /verb ( love ) /obj ( dog )` | active: `verbVoice` lost |

Found by the round-trip stress run of
[localization A21](../../localization/done/A21-ui-console-seeded-words.md) (`SEEDS=5000` in
[roundTrip.test.ts](../../../packages/frontend/test/console/roundTrip.test.ts)): seeds 764, 1659 and 2022
fail in English and in Italian, and fail the same way at `6081d5c`, before A21. The suite's 400 seeds
never reach it. The walk only cycles the voice on a finite period, so it takes a passive followed by
`/inf` in the same period.

## Shape of the fix

**Recommended: keep the voice for the infinitive.** Tense and aspect sit in the finite slot, and the
voice does not. Only the command forces it, and `setImperative` already does that. Gate the voice on
`imperative` alone, in all four places that read it:

- `rawSatellites.tsx`: the `verbVoice` control's `available` (and the comment above it);
- `words.ts` `settingTakes`, case `"voice"`: `!w.root.imperative` for `!finiteSlotTaken(w.root)`, so
  `print.ts` writes `/passive` after `/inf` and `/passive` is accepted under `/inf`;
- the keymap's voice keys follow the satellite (`has(ctx, "verbVoice")`), so they need no change;
- [roundTrip.test.ts](../../../packages/frontend/test/console/roundTrip.test.ts)'s walk: the voice op's
  `finite` gate becomes `!sel.imperative`, so the walk reaches the case at 400 seeds.

**The alternative**, `setInfinitive` resetting the voice to active, also passes both pins. But it
would take away a construct the engine renders and the definitions need, and turning the infinitive
on would silently change "to be loved" into "to love".

## Pins

`it.fails` in [roundTrip.test.ts](../../../packages/frontend/test/console/roundTrip.test.ts), block
*known bugs: A179 a passive infinitive*: the round trip of that state, in English and Italian words
(2). There is also a regression test that the finite passive prints `/passive` and comes back.

`it.fails` in [rawSatellites.test.tsx](../../../packages/frontend/test/satellites/functions/rawSatellites.test.tsx),
block *known bugs: A179 a passive infinitive*: a passive infinitive either shows the voice control or
is no longer passive (1). Either fix passes it. There is also a regression test that the command
keeps its voice withdrawn and active.

Both pins fail on their assertions, not on an error: the round trip returns no `verbVoice`, and the
control's `available` is false.

## Resolved

Fixed 2026-09-21, as the **recommended** shape: the voice is kept for the infinitive, gated on the
command alone. Tense, aspect and the modals stay in the finite slot; the voice was never in it — only
`setImperative` forces the active, and it already resets `verbVoice` itself.

- **Canvas:** [`../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx`](../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx).
  The `verbVoice` control's `available` reads `!selection.imperative` instead of `!finiteSlotTaken`
  (the comment now says why the voice parts company with the tense and the aspect). `finiteSlotTaken`
  is unchanged and still gates the tense, the aspect and both modals with their adverbs.
- **Console:** [`../../../packages/frontend/src/console/language/words.ts`](../../../packages/frontend/src/console/language/words.ts),
  `settingTakes` case `"voice"`: `!w.root.imperative` for `!finiteSlotTaken(w.root)`. That one gate
  serves both directions — [`print.ts`](../../../packages/frontend/src/console/language/print.ts) now
  writes `/passive` for an infinitive period (`/inf /verb ( love /passive ) /obj ( dog )`), and
  `/passive` is accepted under `/inf`. The `tense` / `aspect` cases still read `finiteSlotTaken`.
- **Keymap:** no change. `object.voice` and `object.voice.back` in
  [`keymap.ts`](../../../packages/frontend/src/keyboard/keymap.ts) gate on `has(ctx, "verbVoice")`,
  i.e. the satellite's own `available`, so the keys came back with the control.
- **Not taken:** `setInfinitive` resetting the voice. A passive infinitive is a citation form the
  engine renders and the seeded definitions use, and resetting it would silently turn "to be loved"
  into "to love".

**Tests now guarding it**

- [`../../../packages/frontend/test/satellites/functions/rawSatellites.test.tsx`](../../../packages/frontend/test/satellites/functions/rawSatellites.test.tsx),
  *known bugs: A179 a passive infinitive*: the pinning `it.fails` is a plain passing test, plus the
  control's set value and the way back to active, and a guard that the infinitive still withdraws the
  tense, the aspect and the modals and that the voice still waits for a transitive verb with an
  object. The command's withdrawn, forced-active voice is unchanged.
- [`../../../packages/frontend/test/console/roundTrip.test.ts`](../../../packages/frontend/test/console/roundTrip.test.ts),
  same block: both pinning `it.fails` rows are plain passing tests, plus the exact printed line in
  English and Italian words, a hand-written `/passive` under `/inf` applying to a passive infinitive,
  and a guard that a command still prints no `/passive`. The walk's voice op now gates on
  `!sel.imperative`, so the random walk reaches the state inside the suite's 400 seeds (it fails on
  seeds 3, 115 and 146 with the fix reverted). `SEEDS=5000` is green, including 764, 1659 and 2022.
- [`../../../packages/frontend/test/satellites/functions/buildSatellites.test.tsx`](../../../packages/frontend/test/satellites/functions/buildSatellites.test.tsx)
  had locked the old output (the infinitive offering only `verbNegative` on the verb family); it now
  expects `verbVoice` alongside it for the infinitive, and only `verbNegative` for the command.
