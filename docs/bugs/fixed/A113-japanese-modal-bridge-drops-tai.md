# A113. A governed ようになる bridge loses its 〜たい in a three-modal chain

**Language:** Japanese

`modalSegs` (`languages/ja/modalSegs.ts`) bridges WILL (〜たい) over a verb-kind modal with
`ようになる` (fixed A11, "Case A"): `食べることができるようになりたいです`. When that WILL is the
outermost modal, `modalEndingSegs` inflects the たい. When another modal governs it, the branch
returns only `ように` + `なる`/`なり`, and the たい is never emitted. The outer modal's と思う bridge
("Case B") then wraps a clause with no desire in it, so "must want to be able to eat" comes out as
"must think that it comes to be able to eat".

| Modals (outermost first) | Now | Want |
|---|---|---|
| MUST > WILL > CAN | `猫は食べることができるようになると思う必要があります。` | `猫は食べることができるようになりたいと思う必要があります。` |
| CAN > WILL > CAN | `猫は食べることができるようになると思うことができます。` | `猫は食べることができるようになりたいと思うことができます。` |
| CAN > WILL > MUST | `猫は食べる必要があるようになると思うことができます。` | `猫は食べる必要があるようになりたいと思うことができます。` |

Already right: the two-modal chains (`食べることができるようになりたいです`, `食べたいと思うことができます`)
and a chain with the bridged WILL outermost (`食べたいと思うことができるようになりたいです`).

The builder UI chains only two modals, so only a hand-built plan can produce this.

## Shape of the fix

In Case A's governed branch, keep the たい: return `なり` + `たい` in the dictionary form and `なり` +
`たく` (WILL's `suffix_stem`) in the stem form, via `modalSuffixSeg(m, form)`. Do not return a bare
`なる`/`なり`. The outer modal's と思う bridge then attaches to `…ようになりたい`.

| | |
|---|---|
| **Test** | `modals.test.ts` → *known bugs: Japanese 〜たい bridge inside a longer modal chain* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed. In [`modalSegs.ts`](../../../packages/engine/src/languages/ja/modalSegs.ts),
Case A's governed branch now returns `ように` + `なり` + `modalSuffixSeg(m, form)`: `なりたい` in the
dictionary form, `なりたく` in the stem form. It no longer returns a bare `なる`/`なり`, so the outer
modal's と思う bridge attaches to `…ようになりたい`.

Every row now renders as wanted:
- `食べることができるようになりたいと思う必要があります`
- `…ようになりたいと思うことができます`
- `食べる必要があるようになりたいと思うことができます`

The fix also covers a negative past (`…必要がありませんでした`) and a four-modal chain (`…ようになりたいと思う
ことができるようになりたいです`). The two-modal bridges are unchanged.

A relative clause with the chain still ends in the polite `…必要があります` before its head; that is A116.

- **Tests:** [`packages/engine/test/modals.test.ts`](../../../packages/engine/test/modals.test.ts) →
  *known bugs: Japanese 〜たい bridge inside a longer modal chain*. The pinning `test.fails` is now a
  passing `test`. New cases cover tense and polarity and the four-modal chain, with a guard for the
  two-modal bridges.
- Unit test: `modalSegs.test.ts`.
