# P12-E4. D2 and the linked form — an instrument picked from an existing period

**Feature:** decide D2, then make the two renderings of one link live side by side: a hosted
instrument (made in place) and a linked one (a pick onto a period that already exists, and any saved
workspace from before P12).
**Shape:** README phase 4.
**Scope:** docs (D2), frontend.
**Status:** open. Filed 2026-09-27 from P12 phase 4, checked against HEAD fb8af41a. Depends on E3.
**D2 is still open**, and it blocks this task only.

## D2

*Recommendation, as the README has it:* host an instrument created in place. A pick onto an existing
period keeps its card, connector and header switch. Hosting a picked period would make a clause the
author was working on vanish into another one.

Two points the README leaves out, to decide with it:

- **Saved workspaces from before P12** have no `hosted` flag (E2), so they open in the linked form.
  Should opening one offer to host it? *Recommendation:* no. A control on the linked card, "draw
  inside" (and back), turns one form into the other without changing the plan.
- **The console.** `/instrument #n` links an existing period, so it yields the linked form. Does
  `/instrument ( … )` make a hosted one? *Recommendation:* yes, if E2's flag prints. That is the one
  place where the two forms would print differently.

## Design

- The linked form keeps today's card, `ReificationSwitch` and elbow connector (the `instrumental-arrow`
  marker).
- Compact view (D5) shows the instrument's words in both forms. `GroupBox` returns `null` when compact,
  as for every constituent.
- Keyboard and pick numbering are the same across both forms. E2 already made hosted cards
  unnumbered.

## Tests

- Both forms round-trip through save/load and the console.
- A saved workspace from before P12 opens unchanged: keep one in the fixtures.
- Plan equality between the hosted and the linked form of the same instrument.
- e2e: pick an existing period as the instrument and read its card and connector; convert it and read
  one card fewer.

## Done

Move P12 to `Z-Done/`. Update the README's out-of-scope list: the instrumental relative gap shipped in
P13, and the comitative and the object complement have boxes now.
