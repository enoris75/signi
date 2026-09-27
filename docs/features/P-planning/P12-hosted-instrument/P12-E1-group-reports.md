# P12-E1. Group reports — a hosted builder reports every ring it drew

**Feature:** the hosted-ring protocol carries a group of rings instead of one. Owners, conjuncts,
standards and examples report a one-entry group, and nothing on the canvas changes.
**Shape:** README §1, D4. `sameHostedRing` / `mergeHostedRing` become their group forms, and
`useReportOwnRing` reports every `GroupRect` its builder drew.
**Scope:** frontend.
**Status:** open. Filed 2026-09-27 from P12 phase 1, checked against HEAD fb8af41a. No dependency; E2
needs it.

## Today

| | Where |
|---|---|
| `RingHost.kind` is `"conjunct" \| "owner" \| "standard" \| "examples"`: four kinds now, the README knew two | [`ringHost.ts:17`](../../../../packages/frontend/src/components/PhraseBuilder/ringHost.ts#L17) |
| `sameHostedRing`, `mergeHostedRing` | [`conjunctChain.ts:47`](../../../../packages/frontend/src/components/PhraseBuilder/conjunctChain.ts#L47), `:61` |
| The report | [`useReportOwnRing.ts`](../../../../packages/frontend/src/components/PhraseBuilder/hooks/useReportOwnRing.ts) |
| The hosted rank, read from `g.conjunct ?? g.owner ?? g.standard ?? g.examples` | [`layout.ts:74`](../../../../packages/frontend/src/components/PhraseBuilder/layout.ts#L74) |

All four hosts (`OwnerRings`, `ConjunctRings` and the standard's and examples' hosts) move to the group
form in this task. Grep `mergeHostedRing(` for the full list.

## Design

- `sameHostedRings(a, b)`: the same key set, and every ring equal under the existing half-pixel
  comparator.
- `mergeHostedRings(rings, hostKey, group)` returns `rings` itself when nothing moved. This is the loop
  guard, not an optimisation (see memory: canvas report loops). It sets plain values and drops the keys
  of a group that shrank.
- `useReportOwnRing` keys each ring by the host key plus the constituent's label. A one-ring builder
  reports `{ [label]: ring }`.
- `RingHost.kind` gains `"instrument"`, unused until E2.

## Tests

- Unit: identity when nothing moved, a key added, a key gone, and a sub-pixel jitter that settles.
- Every existing owner, conjunct, standard and examples test passes unchanged.
- e2e: the specs that draw hosted rings (`grep -l "owner\|conjunct" e2e/*.spec.ts`), with no
  `Maximum update depth` in the console.
