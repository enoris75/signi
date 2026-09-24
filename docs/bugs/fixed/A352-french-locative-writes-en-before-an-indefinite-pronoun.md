# A352. The French locative writes *en* before an indefinite pronoun

**Languages:** French

French writes the locative *in* as *en* before a word with no article and as *dans* before a
determiner (*dans la maison*). An indefinite pronoun has no article, so it takes *en*: *le chat court
en quelque chose*, which is not French. The pronoun wants *dans*, which the direction already writes
for the same pronoun (*court dans quelque chose*).

| Case | Now | Want |
|---|---|---|
| the CAT RUNs in SOMETHING (locative) | `le chat court en quelque chose.` | `le chat court dans quelque chose.` |
| the CAT EATs in SOMETHING | `le chat mange en quelque chose.` | `le chat mange dans quelque chose.` |
| … in SOMETHING that BURNs | `le chat court en quelque chose qui brûle.` | `le chat court dans quelque chose qui brûle.` |
| negated (SOMETHING swaps to *rien*, A308) | `le chat ne court en rien.` | `le chat ne court dans rien.` |

**Already right.** A noun (`dans la maison`), the direction (`court dans quelque chose`), and the
other six (`in something`, `in qualcosa`, `in etwas`, `en algo`, `em algo`, 何かで).

## Shape of the fix

The locative's *en* / *dans* choice in [fr/complementsPhrase.ts](../../../packages/engine/src/languages/fr/complementsPhrase.ts)
should treat an indefinite pronoun (`forms['indefinite'] === '1'`) as it treats a determined noun.

**Decisions for the fixer:**

- **SOMEONE** (*court en quelqu'un*) and a thing pronoun (*court en cela*) go the same way, but the
  plans are odd (A308 said so of the locative SOMEONE). *dans* is the likely target for both; not
  pinned.
- **The bare noun** (*court en maison*) is a separate question: *en* before a bare noun is often
  right (*en ville*), often not. Not pinned.

| | |
|---|---|
| **Test** | `complements/locative.test.ts` → *known bugs: the French locative writes en before an indefinite pronoun (A352)* (2 `test.fails`: SOMETHING on two verbs, with a relative and negated; plus a regression test for a noun, the direction and the other six) |

Found by the lanes and the cross-lane probe while fixing A278–A338, 2026-09-24.

## Resolved

2026-09-24. The locative's pronoun branch in
[fr/complementsPhrase.ts](../../../packages/engine/src/languages/fr/complementsPhrase.ts) keeps the
bare *en* for a personal pronoun only (*en lui*, *en moi*, *en eux*, A203). An indefinite pronoun
(`indefinite` / `thing`) and the neuter singular *cela* take *dans*, as a determined noun does: *court
dans quelque chose*, *dans quelqu'un*, *dans cela*, *ne court dans rien*. The bare noun (*en maison*)
is unchanged.

The two `test.fails` in [locative.test.ts](../../../packages/engine/test/complements/locative.test.ts)
(*known bugs: the French locative writes en before an indefinite pronoun (A352)*) are plain tests now,
assertions unchanged. Added in the same block: SOMEONE, *cela* and a pronoun in a coordination, and a
regression for the personal pronouns, the bare noun and *sous quelque chose*.
`fr/complementsPhrase.test.ts` gained *a personal pronoun takes en, an indefinite or thing pronoun
dans*.
