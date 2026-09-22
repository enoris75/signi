# A242. An Italian frequency adverb trails a multiword finite instead of splitting it

**Language:** Italian

NEED's Italian lemma is *avere bisogno*, the corpus's first multiword finite
([B62](../../localization/done/B62-doing-working-playing.md)). A frequency adverb is placed after the
whole finite, so it lands after the lemma's noun, where Italian puts it between the verb and the noun
— exactly where the same language puts it inside a compound tense.

| Case | Now | Want |
|---|---|---|
| the MAN NEVER NEEDs the FOOD | `l'uomo non ha bisogno mai del cibo.` | `l'uomo non ha mai bisogno del cibo.` |
| the MAN ALWAYS NEEDs the FOOD | `l'uomo ha bisogno sempre del cibo.` | `l'uomo ha sempre bisogno del cibo.` |

**Already right.** Italian itself in a compound tense (`non ha mai avuto bisogno del cibo.`), and
**French**, which was taught the split in the same batch: `n'a jamais besoin`, `a toujours besoin`
([`fr/predicateText.ts`](../../../packages/engine/src/languages/fr/predicateText.ts)). The helpers
that fix it exist — [`splitLemmaTail`](../../../packages/engine/src/functions/splitLemmaTail.ts) is
what French calls — and the Italian predicate was no lane's area in that batch, so it was pinned
rather than fixed.

**Nothing shipped shows it**: no gloss carries a frequency adverb on NEED.

Pinned by `known bugs: an Italian multiword finite (A242)` in
[doing-verbs.test.ts](../../../packages/engine/test/doing-verbs.test.ts).

Found seeding NEED for [B62](../../localization/done/B62-doing-working-playing.md).

## Resolved

2026-09-22. [`it/predicateText`](../../../packages/engine/src/languages/it/predicateText.ts) calls
[`lemmaTail`](../../../packages/engine/src/functions/lemmaTail.ts) and
[`splitLemmaTail`](../../../packages/engine/src/functions/splitLemmaTail.ts) — the two helpers
French already used — and writes a frequency adverb between the verb and its lemma's noun. The
periphrastic branch above it already split at its own auxiliary (`ha mai avuto bisogno`), so the new
branch handles what falls through it.

Renders the Want column: `l'uomo non ha mai bisogno del cibo.`, `l'uomo ha sempre bisogno del cibo.`

**The modal chain was left with the same defect** and is fixed with it: under a modal the lemma is
non-finite, and the adverb was landing behind its noun there too (`deve avere bisogno sempre`). The
split is applied to any group that is not a periphrasis, so that reads `deve avere sempre bisogno
del cibo`.

Guarded by *known bugs: an Italian multiword finite (A242)* in
[doing-verbs.test.ts](../../../packages/engine/test/doing-verbs.test.ts), now three tests: the two
Want rows, the modal chain beside the compound tense, and a regression over no adverb, a plain
negation and the six other languages.
