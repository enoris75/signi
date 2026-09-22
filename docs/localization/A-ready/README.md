# A-ready

Tasks composable **now** from seeded concepts, one per file (`A<n>-<slug>.md`). See the
[index](../localization-tasks.md#part-a--ready-a-ready) for how they are encoded and which skill
drives them.

**None open as of 2026-09-22.** A23–A30, the eight the
[sweep of 2026-09-22](../localization-tasks.md#the-sweep-of-2026-09-22) filed, were authored the
same day and are in [`done/`](../done/), along with A01–A07 and A11–A22. **51 of their 60 concepts
shipped a gloss**; the nine that did not are each in a C ticket with the reason.

Two things the A tickets learned, for whoever files the next one:

- **A probe table is not enough.** It renders one plan at a time, so it cannot show that the string
  it produces is *already some other concept's*. Five of the nine that did not ship failed there —
  EAT_ANIMAL's plan was EAT's, SHRINK's COMPACT's, SPECIFY's EXPRESS's, NEW's YOUNG's, BEAUTIFUL's
  GOOD's, each character for character.
  [`sweep-definitions.test.ts`](../../../packages/engine/test/sweep-definitions.test.ts) now renders
  every definition in all seven languages and fails on any two alike.
- **The readings under a probe table are the point of the file.** Every one of the nine was either
  flagged by a reading and confirmed on authoring, or found by the collision guard. A ticket whose
  rows all look fine is a ticket that has not been read hard enough.

A B task becomes an A here once the words its **Seed first** section lists are seeded.
