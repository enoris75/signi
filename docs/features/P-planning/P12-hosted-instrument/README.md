# P12. The instrument, hosted — the means drawn inside the clause that uses it

**Feature:** the `instrumental` complement is drawn inside the period it serves, as a hosted group of
rings in reading order, instead of a second period card reached by a pick and joined by a gutter
connector. At the `object` level that is one noun ring ("with the knife"); at `process` / `concept`
it is the act and the noun it acts on ("by choosing a word"), in the same row.
**Shape:** generalise the hosted-ring protocol from **one ring to a group of rings**. The instrument
keeps its own container and today's `instrumental` link, so `linkRules`, serialisation, the console
and the plan the engine sees are unchanged.
**Scope:** frontend only. No engine change, no seed change, no new translation. One new UI surface —
the level toolbar — reusing strings that exist (`instrumental.level.*`).
**Status:** planning. Chosen over three alternatives (see [Alternatives](#alternatives)); D1, D3, D4
and D5 below carry recommendations, **D2 is open** and blocks phase 4 only.
**Drawings:** [design canvas](https://claude.ai/artifact/TAqoxSNjoms8B4s2CbUorf) — artboards *Today —
the linked period*, *A — box by default, raise for the act*, **B — hosted ring, inline** (this plan),
*C — menu row and a chip on the link*, *D — any complement can be raised*.

---

## Why

Every other complement this builder offers is a constituent of the period it belongs to. The
instrumental is a second period: a pick from the verb's dotted ring, a card of its own, and an elbow
connector down the right-hand gutter. Three costs follow.

1. **The common case pays the most.** An `object`-level instrument is a bare noun phrase — "with the
   knife". It spends a card, a pick and 64px of gutter margin
   ([`PeriodContainer.tsx`](../../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/PeriodContainer.tsx),
   `accent.gutter`) on one word.
2. **The picture is wrong about the grammar.** A period card is the canvas's word for *a clause of
   its own*. The instrument is not one; it is part of the clause above it, and at the action levels
   it does not even have a subject — the clause above supplies it
   ([`phraseRender.tsx:59`](../../../../packages/frontend/src/components/PhraseBuilder/phraseRender.tsx#L59)).
3. **The control on the verb's ring is a look-alike.** It is drawn from the same
   `complementIcons` set as the eight box toggles and does something else entirely: it starts a
   cross-container pick
   ([`rawSatellites.tsx:446`](../../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L446),
   `registerVerbAnchor` in
   [`VerbPhraseBuilder.tsx:117`](../../../../packages/frontend/src/components/PhraseBuilder/VerbPhraseBuilder.tsx#L117)).

The canvas already hosts a foreign builder's ring inside a period — an owner's and a conjunct's — so
the idea needs no new vocabulary, only a wider protocol.

## Today

| | How it works | Where |
|---|---|---|
| Making one | A pick from the verb-phrase dotted ring lands on a free container | [`linkRules.ts`](../../../../packages/frontend/src/components/PhraseBuilder/linkRules.ts) `canBeInstrument` |
| The model | A `PhraseLink` of kind `instrumental`, source = the acting clause, target = the instrument's container, plus a `level` | [`interfaces.ts:499`](../../../../packages/frontend/src/components/PhraseBuilder/interfaces.ts#L499) |
| The plan | `object` → the target's **subject** becomes `complements.instrumental.phrase`; an action level → its verb becomes `action` and its object the phrase, with an `abstraction` specifier | [`attachInstrumental.ts`](../../../../packages/frontend/src/components/PhraseBuilder/workspacePlan/functions/attachInstrumental.ts) |
| The level | Three pills in the instrument card's header; `R` on the period cycles them; `/level` in the console | [`ReificationSwitch.tsx`](../../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/ReificationSwitch.tsx), [`keymap.ts:986`](../../../../packages/frontend/src/keyboard/keymap.ts#L986), [`commands.ts`](../../../../packages/frontend/src/console/language/commands.ts) |
| The drawing | A sibling card in the workspace `Stack`, joined by an elbow connector through the gutter | [`PhraseWorkspace.tsx:240`](../../../../packages/frontend/src/components/PhraseBuilder/PhraseWorkspace.tsx#L240), [`useConnectors.ts`](../../../../packages/frontend/src/components/PhraseBuilder/hooks/useConnectors.ts) |

And the machinery this plan borrows:

- A hosted ring is a nested `PhraseBuilder` editing someone else's slice, painted where the host
  canvas puts it, reporting back the ring it drew
  ([`ringHost.ts`](../../../../packages/frontend/src/components/PhraseBuilder/ringHost.ts),
  [`OwnerRings.tsx`](../../../../packages/frontend/src/components/PhraseBuilder/OwnerRings.tsx),
  [`ConjunctRings.tsx`](../../../../packages/frontend/src/components/PhraseBuilder/ConjunctRings.tsx)).
- `READING_ORDER` in
  [`layout.ts:40`](../../../../packages/frontend/src/components/PhraseBuilder/layout.ts#L40) is built
  from `COMPLEMENT_TYPES`, which **already contains `instrumental`**: the row has a rank before a
  line of this plan is written.
- `packPeriod` packs a hosted ring right after the ring it belongs with, by
  `rank(head) + (index + 1) / 100` — the trick that keeps a conjunct beside its head.

## Decisions

| # | Question | Recommendation | Why |
|---|---|---|---|
| D1 | Fold the instrument into the parent's selection (like a possessor), or keep its container and link? | **Keep the container and the link.** The hosted builder takes a lens onto *that container's* selection instead of a slice of this one. | Everything downstream stays put: `linkRules`, `canBeInstrument`, the `level` field, `workspacePlan`, the saved-file format and its `kind: 'instrumental'` links, `/instrument` and `/level`. The plan the engine receives is byte-identical, so no translation test moves. Folding it in would rewrite all of that to change a drawing. |
| D2 | **Open.** A pick can land on an *existing* period. Host it — pulling that card out of the stack — or leave it a card? | Host an instrument **created in place**; keep the card-and-connector for a pick onto an existing period. Two renderings of one link, chosen by how it was made. | Hosting always means linking an existing clause makes its card vanish into another, which is a surprising way to lose a period you were working on. The cost is that both renderings must be maintained — which is also the migration path for saved workspaces. |
| D3 | Where does the level switch go? | A **relation toolbar at the group's twelve o'clock**, the way `route`, `locative` and `cause` seat theirs (`TOOLBAR_HOUR` in [`ringSpecs.ts`](../../../../packages/frontend/src/components/PhraseBuilder/ringSpecs.ts)). | The level is the link's field, not the period's; on the group it sits with what it changes. It also frees the instrument card's header, which under D2 still exists for the linked form. |
| D4 | The host protocol reports one ring. An act draws two constituents. | **Report a group**: `onRings(Record<string, HostedRing> \| null)`; a conjunct and an owner report a one-entry map. | The alternative — a union-footprint "super ring" — invents a second layout concept. A group of ordinary rings packs with the machinery that already packs conjuncts. |
| D5 | What does compact view show? | The instrument's words, no rings — as compact already does for every constituent (`GroupBox` returns `null` when compact). | A hosted instrument is constituents of this period; compact should not special-case it. |

## 1. The host protocol — one ring becomes a group

[`conjunctChain.ts`](../../../../packages/frontend/src/components/PhraseBuilder/conjunctChain.ts) and
[`useReportOwnRing.ts`](../../../../packages/frontend/src/components/PhraseBuilder/hooks/useReportOwnRing.ts):

- `sameHostedRing` → `sameHostedRings(a, b)`, comparing two maps key by key with the same
  half-pixel comparator.
- `mergeHostedRing(rings, key, ring)` → `mergeHostedRings(rings, hostKey, group)`, still handing back
  `rings` itself when nothing moved.
- `useReportOwnRing` reports **every** `GroupRect` its builder drew, keyed by the host key plus the
  constituent's label, not only `ownRing`.

The dedupe is not an optimisation here, it is the loop guard: a report the host would ignore still
costs a render, which re-renders the hosted builder, which reports again. With a group the surface
for that is wider, so `sameHostedRings` must be exact and must set plain values.

`RingHost` gains `kind: "instrument"` and, for it, the rings the group may draw are known from the
level: one at `object`, two at an action level.

## 2. The instrument's builder

A third component beside `OwnerRings` and `ConjunctRings` —
`InstrumentRings.tsx` — mounting one nested `PhraseBuilder` per hosted instrument:

- **Selection:** `containers.find(c => c.id === link.target.containerId)!.selection`, with
  `onPhraseUpdate` routed through the workspace's `makeContainerUpdate(targetId)`. The lens is the
  only thing that differs from an owner's.
- **Shape by level:** `object` → `nounPhraseOnly`, exactly an owner's ring. `process` / `concept` →
  `showSubject: false` with the verb and direct object drawn, which
  [`phraseRender.tsx`](../../../../packages/frontend/src/components/PhraseBuilder/phraseRender.tsx)
  already renders for the instrument card today.
- **Binding:** the hosted container still needs the `WorkspaceBinding` that
  [`PhraseWorkspace.tsx:240`](../../../../packages/frontend/src/components/PhraseBuilder/PhraseWorkspace.tsx#L240)
  builds per container, so its nouns keep registering boxes and anchors and can source a relative
  clause into another period ("with the word **that I chose**"). Building the binding must move out of
  the `containers.map` closure into a `bindingFor(id)` the host can call.

## 3. Layout

Each ring the hosted builder draws becomes a `GroupRect` carrying `instrument: { head: "Instrumental",
index }`, and `order()` in `layout.ts` reads it beside `conjunct` and `owner`. Nothing else in
`packPeriod` changes: the rings pack in reading order at the Instrumental rank, adjacent, at the
footprint they really render at. The period grows to fit them — the canvas's answer to crowding is a
wider container, not a hidden control.

## 4. The level toolbar

`ringSpecs` seats a `toolbar` on a complement ring's dotted ring at twelve o'clock, one button per
value, from `toolbarControlKey(type, value)`. The instrument group takes the same treatment with
`ABSTRACTION_LEVELS` as its values and the existing `instrumental.level.*` strings as its labels and
tooltips. `R` on the period keeps cycling it (`period.level` in the keymap); `/level` is untouched.

## 5. Workspace, picks and connectors

- **The stack.** A container that is the target of an `instrumental` link *and* hosted (D2) is
  skipped by `containers.map`, so it draws no card.
- **Numbering.** Pick targets and the console's period numbers (`PICK_INDEX`, `usePickKeys`) must
  skip it too, or a digit will name a card nobody can see.
- **Connectors.** `useConnectors` emits no `instrumental` connector for a hosted instrument; the
  `instrumental-arrow` marker and the elbow stay for the linked form under D2.
- **Making one.** The verb-ring control stops being a pick and becomes "add the instrument", which
  creates the container, links it and seats it in the row — one click, like every other complement.
  Picking an existing period keeps its own control (D2).

## 6. Console and keyboard

Unchanged by construction: `/instrument` still makes the link, `/level` still sets the level, `R`
still cycles it, and the round-trip invariant is the proof — the printed form of a workspace with a
hosted instrument is the same text as today's, because the model is the same. Worth one stress run at
`SEEDS=5000` all the same.

## 7. Phases

| Phase | Scope | Done when |
|---|---|---|
| **1 · Group reports** | `sameHostedRings` / `mergeHostedRings`, `useReportOwnRing` reporting every ring it drew, `RingHost.kind` widened. Owners and conjuncts report one-entry maps. | Every existing owner and conjunct test passes unchanged, and a deliberately jittering hosted ring settles instead of looping. |
| **2 · The object-level instrument** | `InstrumentRings`, the container lens, `bindingFor(id)`, the `instrument` rank in `packPeriod`, the card skipped, the connector suppressed. | "the cat cuts the bread with the knife" is built in one card, and `workspaceToPlans` returns the same plan as before the change. |
| **3 · The act levels** | Two-ring group, subject withheld, the level toolbar at twelve o'clock, the switch removed from the hosted card's header. | All three levels render in the row; `R` and `/level` still cycle; the group repacks when the level changes. |
| **4 · The linked form** (needs D2) | Pick onto an existing period keeps the card, connector and header switch; compact view; keyboard and pick numbering across both forms. | Both forms round-trip through save/load and the console, and a saved workspace from before this plan opens unchanged. |

## 8. Testing

- **Unit:** `sameHostedRings` / `mergeHostedRings` (identity when nothing moved, key added, key gone);
  `packPeriod` with an instrument group of one and of two rings; `ringSpecs` seating the level toolbar.
- **Plan equality:** a fixture workspace with an instrument at each level, asserting
  `workspaceToPlans` output is identical before and after — the guard that this is a drawing change.
- **Component:** `PhraseWorkspace` renders one card fewer when an instrument is hosted; the hosted
  instrument's nouns register their boxes and anchors, so a relative clause can be sourced from them.
- **Console:** the round trip at `SEEDS=5000`, plus the coverage test (every satellite reachable).
- **End to end:** [`e2e/period-links.spec.ts`](../../../../e2e/period-links.spec.ts) — build the
  instrument in place, cycle its three levels, assert all seven translations, and link a relative
  clause out of the instrument's noun.

## 9. Risks

| Risk | Mitigation |
|---|---|
| Report loop (`max-update-depth`) once a group reports | `sameHostedRings` compares plain numbers exactly as the single-ring guard does; phase 1 lands with its own tests before anything is hosted |
| The row makes wide periods wider | The container grows; nothing is hidden. Collapse and compact already exist for the rest |
| Two renderings of one link (D2) drift | One `RingHost` and one builder; only the card chrome differs. The plan-equality test covers both |
| A hosted instrument's outgoing relative link loses its port | `RingHost.ports` already carries ports; the e2e case above pins it |
| Saved workspaces | The model is untouched, so old files open as they are — under D2 they open in the linked form |

## Alternatives

Drawn on the canvas, and rejected for this plan:

- **A — the instrumental becomes an ordinary complement box**, with a "raise" control that turns it
  into today's period when it must be an act. Cheaper than B and it makes the instrumental a
  `NOUN_KEY`, which buys the relative gap for free. It keeps a second card for the act, which is the
  part B is for.
- **C — keep the model, fix the two lies**: drop the ring toggle (the `ComplementMenu` already lists
  the instrumental under `I`), and move the level switch onto the link as a chip. Half a day, no model
  change; it does not put the instrument in the clause. **Worth doing anyway, and compatible with B**
  — C's chip becomes B's toolbar.
- **D — generalise the port**: every complement box can be raised into a period, `LINKED_COMPLEMENT_TYPES`
  empties, the link kind becomes `complement` with a type. A programme, not a refactor, and it
  presumes clausal complements no engine renders yet.

## Out of scope

- **The instrumental relative gap.** B moves the drawing, not the model: the instrument is still not
  a `NOUN_KEY` of the acting period, so "the knife with which the cat cuts the bread" stays
  unbuildable, though every engine renders it
  ([`relativeGapComplement.ts`](../../../../packages/engine/src/functions/relativeGapComplement.ts)).
  That is A's payoff, and it can be had later without undoing B.
- **The other plan-only complements.** `comitative`, `objectPredicative` and `temporal` have no box
  and none is added here.
- Any engine, seed or translation work.
