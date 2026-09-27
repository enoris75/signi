# P12-E2. The object-level instrument, hosted in the clause

**Feature:** "the cat cuts the bread **with the knife**" is built in one card. The instrument is a
noun ring in the verb's row, at the Instrumental rank, and there is no second card or gutter connector.
**Shape:** README §2, §3 and §5 for the `object` level: `InstrumentRings`, the container lens,
`bindingFor(id)`, the instrument rank, the card skipped, the connector suppressed, and "add the
instrument" on the verb's ring.
**Scope:** frontend.
**Status:** done, 2026-09-27 (see the README's *What landed differently*). Was open. Filed 2026-09-27 from P12 phase 2, checked against HEAD fb8af41a. Depends on E1.
**D2 bears on it:** this task hosts only an instrument created in place. A pick onto an existing period
stays a card until E4.

## Today

| | Where |
|---|---|
| The instrument toggle on the verb's ring | [`rawSatellites.tsx:796`](../../../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L796) |
| It registers as the verb anchor | [`VerbPhraseBuilder.tsx:132`](../../../../../packages/frontend/src/components/PhraseBuilder/VerbPhraseBuilder.tsx#L132), [`phraseRender.tsx:167`](../../../../../packages/frontend/src/components/PhraseBuilder/phraseRender.tsx#L167) |
| The binding, built inside `containers.map` | [`PhraseWorkspace.tsx:259`](../../../../../packages/frontend/src/components/PhraseBuilder/PhraseWorkspace.tsx#L259) |
| The connector | [`useConnectors.ts:162`](../../../../../packages/frontend/src/components/PhraseBuilder/hooks/useConnectors.ts#L162) |
| The link rule | [`linkRules.ts:391`](../../../../../packages/phrase/src/model/linkRules.ts#L391) (the model moved to `@signi/phrase` in P13; the old frontend paths are re-exports) |

## What changed since the README: the instrument's relative gap

P13 made "the knife with which the cat cuts the bread" buildable. A relative link can target a
period's `instrumental` gap when the verb takes an instrument and none is linked
([`linkRules.ts:99`](../../../../../packages/phrase/src/model/linkRules.ts#L99)), and **that connector
ends at the same instrument toggle**. The README's out-of-scope note about the gap is out of date.

So the toggle has two jobs, and this task keeps both:

- **No instrument, no gap:** the toggle adds a hosted instrument (one click, like every other
  complement).
- **A relative gap on the instrument:** the toggle stays the connector's end, and adding an
  instrument is refused, since the gap and an instrument exclude each other.
- **A hosted instrument:** the toggle selects it.

## Design

As the README (§2, §3, §5), with these corrections:

- `InstrumentRings.tsx` beside `OwnerRings` and `ConjunctRings`. Its selection is the target
  container's, updated through `makeContainerUpdate(targetId)`. `object` → `nounPhraseOnly`.
- `bindingFor(id)` is lifted out of the `containers.map` closure, so a hosted instrument's nouns keep
  registering boxes and anchors, and can source a relative clause ("with the word **that I chose**").
- `GroupRect.instrument: { head: "Instrumental", index }`, read in `layout.ts` beside the four hosted
  kinds. `READING_ORDER` already ranks `Instrumental` through `COMPLEMENT_TYPES`.
- The stack skips a hosted instrument's container. So do `PICK_INDEX` and `usePickKeys`, and the
  console's period numbers: a digit must never name a card nobody can see.
- `useConnectors` emits no `instrumental` connector for a hosted instrument.
- **Tell hosted from linked** without a new field if possible, since D1 keeps the model: a link made
  by "add the instrument" can carry `hosted: true`. That flag is a UI fact, so check that the console's
  round trip ignores it or prints it. Write the choice into the README.

**P17 overlap.** The phone layout (worktree `../signi-p17`, unmerged) changes the canvas and the
workspace stack. Rebase over it, or coordinate, before touching `PhraseWorkspace.tsx`.

## Tests

- Plan equality: a fixture workspace with an object-level instrument returns the same
  `workspaceToPlans` before and after.
- Component: one card fewer; the hosted instrument's nouns register their anchors.
- The instrument gap: with a relative gap on the instrument, the toggle is the connector's end and
  "add" is refused.
- Console round trip at `SEEDS=5000`.
- e2e ([`period-links.spec.ts`](../../../../../e2e/period-links.spec.ts)): build *with the knife* in place,
  and read all seven translations.
