# A141. The link controls' tooltips offer to show and hide

**Area:** frontend, the satellite controls (`Boxes.tsx` `SatelliteButton`, `satellites/functions/buildSatelliteIcons.ts`)

The relative-clause control on a noun and the instrumental control on the verb phrase start a link to a
period in another container, or remove it. Neither reveals a box. Their tooltips are still worked out as a
reveal's by `revealTitle`, so they offer to "Show" what they link, and the relative clause's offers to
"Hide" it once linked (`active` is set while the noun is a link source). The relative clause has no
`action.show.*` entry to name it with, so the verb is the English fallback, and a non-English UI reads it
half in English: it `Show Proposizione relativa`.

| Control | Now | Want |
|---|---|---|
| relative clause, unlinked | `Show Relative clause` (it `Show Proposizione relativa`) | `Relative clause` |
| relative clause, linked | `Hide Relative clause` | `Relative clause: Linked — click to remove` |
| instrumental, unlinked | `Show the instrumental` | `Instrumental` |

Already right: the instrumental's linked face (`Instrumental: Linked — click to remove`), which is why the
relative clause's should match it. "Linked — click to remove" itself is English ([C12](../../localization/C-needs-engine/C12-ui-purpose-and-object-complements.md)).

Found while localizing the relative-clause label ([B21](../../localization/done/B21-ui-clause-and-coordination-vocabulary.md)).

## Shape of the fix

Mark a link control as one in `buildSatelliteIcons`, not as a reveal: `active: false` for the relative
clause, `valued: true` so a linked control's tooltip is its value, and a `SatelliteButton` branch that
names an unlinked link control by its label alone. The unlinked tooltip deserves a real command once the
link verb is seeded ("Link a relative clause"); the label is the honest stopgap.

| | |
|---|---|
| **Test** | `packages/frontend/test/satellites/functions/buildSatelliteIcons.test.tsx` → *known bugs: the link controls' tooltips* (2 `it.fails`, plus a regression test for the instrumental's linked face) |

## Resolved

Fixed 2026-09-14.

- **Frontend:** `SatelliteIcon` ([`Boxes.tsx`](../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx))
  has a `link` flag. `SatelliteButton` names an unlinked link control by its label alone, and a linked one
  still reads "label: Linked — click to remove".
  [`buildSatelliteIcons`](../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/buildSatelliteIcons.ts)
  marks the relative clause and the instrumental as link controls. The relative clause is never `active`,
  the same as the instrumental, so it no longer offers to "Hide". `valued` stays false, so neither control's
  colour changes.
- **Tests:** [`buildSatelliteIcons.test.tsx`](../../../packages/frontend/test/satellites/functions/buildSatelliteIcons.test.tsx)
  → *known bugs: the link controls' tooltips*. Both `it.fails` are now passing `it`s. New cases: a linked
  relative clause still removes its link, and its face follows each noun. A regression guard checks that a
  reveal control (the possessor) still offers "Show" / "Hide". The relative-clause control test now expects
  `active: false` and `link: true`. [`Boxes.test.tsx`](../../../packages/frontend/test/Boxes.test.tsx) covers
  both faces of a link control, and its name in a non-English UI.
