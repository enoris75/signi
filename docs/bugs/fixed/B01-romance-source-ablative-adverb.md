# B1. Romance `source` renders an ablative adverb

**Documented simplification — do NOT fix without a product decision.**

| | |
|---|---|
| **Behaviour** | Romance `source` renders an ablative adverb: `viene **via** dalla casa`, `vient **loin** de`, `viene **lejos** de`, `vem **longe** de` — "comes **far** from" |
| **Correct target / rationale** | Disambiguates `source` from `direction`, which collide on `da`/`de` (`corro dal bambino` = motion **to**). Cost: with COME, where `da`/`de` is already unambiguous, it reads "far from". A per-verb condition would keep the RUN/JUMP reading and fix the rest. |
| **Test** | `complements/source.test.ts` (4) |

## Resolved

**2026-07-17** — fixed after a product decision to gate the ablative adverb on the verb (the fix the
rationale itself suggested), taken together with [B01b](B01b-romance-source-adverb-inverts-nonmotion.md).

The disambiguating adverb ("via da" / "loin de" / "lejos de" / "longe de") is now emitted **only for
the self-propelled motion verbs RUN and JUMP**, whose `source` (da/de) would otherwise be read as a
`direction`-toward goal ("corro dal bambino" = motion *to* the boy). COME, GO and the transitive
LOAD/IMPORT read da/de as an origin unambiguously, so they render bare: `il gatto viene dalla casa`,
`le chat vient de la maison`, `el gato viene de la casa`, `o gato vem da casa`. The article-fusion
machinery (dalla / du / dall' / de las …) is untouched — only the adverb prefix changed.

- **Corpus/schema:** unchanged — no verb flag added; the six source-licensing verbs are a small,
  fixed set, so the keep-list lives in the engine.
- **Engine files changed:** new export `SOURCE_ABLATIVE_ADVERB_VERBS` in
  [`../../../packages/engine/src/types.ts`](../../../packages/engine/src/types.ts); a per-verb
  `sourceAdverb` gate in
  [`../../../packages/engine/src/languages/it.ts`](../../../packages/engine/src/languages/it.ts),
  [`fr.ts`](../../../packages/engine/src/languages/fr.ts),
  [`es.ts`](../../../packages/engine/src/languages/es.ts) and
  [`pt.ts`](../../../packages/engine/src/languages/pt.ts) (each `complementsPhrase` now takes the
  verb's `conceptId`).
- **Tests now guarding it:** `packages/engine/test/complements/source.test.ts` — the four formerly
  `test.fails` cases are ordinary passing tests inside `describe('source: the ablative adverb is
  gated on the verb')`, joined by GO/IMPORT drop-the-adverb cases and RUN/JUMP **keep**-the-adverb
  regression guards. The `describe('source: Romance')` article-fusion cases were updated to the
  adverb-free COME output, exactly as their in-file comment instructed.
