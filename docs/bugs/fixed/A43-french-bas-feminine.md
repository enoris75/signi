# A43. French feminine of "bas" (LOW) is "base", not "basse"

**Language:** French only

French derives an adjective's feminine from its masculine base by rule — plain `+e` for the common
case ("grand → grande", "haut → haute"), with a handful of family rules (`-eux → -euse`, `-f → -ve`,
`-er → -ère`, `-on → -onne`) and three stored irregulars (beau/nouveau/vieux). The rule has **no
branch for adjectives ending in -s**, so it falls through to the plain `+e` and produces "base" for
LOW's base "bas". The correct feminine doubles the s: **"basse"**.

| | Now | Want |
|---|---|---|
| French | `la chatte base mange.` | `la chatte basse mange.` |

The other six languages are correct — LOW agrees fine in Italian ("bassa"), Spanish/Portuguese
("baja"/"baixa"), German ("niedrig", invariant here), and Japanese ("低い"). The masculine French
form is also correct ("bas"); only the **feminine** is wrong.

## When it happens

Any time LOW modifies a **feminine** noun. It was latent — no pinned render put LOW on a feminine
noun — until the feminine dimension noun `TEMPERATURE` was seeded (for the B07 adjective-definition
glosses). The gloss COLD will use, `TEMPERATURE` + `LOW`, renders `à température base` today; it
should be `à température basse`. This blocks correct French on the five **low-pole** B07 adjectives
whose degree is LOW — LOW, BAD, WEAK, YOUNG, COLD.

It is a **silent** loss: no error, just a misspelled feminine that reads plausibly.

## Shape of the fix

Add "bas" to the stored irregulars in [fr.ts](../../../packages/engine/src/languages/fr.ts)
(`FR_ADJ_IRREGULAR`), the same table beau/nouveau/vieux already use:

```ts
bas: ['bas', 'basse', 'bas', 'basses'],  // [masc.sg, fem.sg, masc.pl, fem.pl]
```

An `-s → -sse` rule branch would also work, but the family is tiny (bas, gras, las, épais…) and only
"bas" is seeded, so the stored irregular is the lighter, unambiguous fix. The masculine plural stays
"bas" (already invariable by the `-s/-x` rule at the tail of `agreeAdjFr`).

| | |
|---|---|
| **Test** | `adjectives.test.ts` → *known bugs: adjectives* (1 `test.fails`: "French feminine of \"bas\" (LOW) is \"basse\", not \"base\"") |

## Resolved

Fixed 2026-07-19. Added `bas: ['bas', 'basse', 'bas', 'basses']` to `FR_ADJ_IRREGULAR` in
[fr.ts](../../../packages/engine/src/languages/fr.ts) (the same stored-irregular table beau/nouveau/
vieux use), then rebuilt the engine dist. The feminine now doubles the s ("la chatte basse"); the
masculine is unchanged ("le chat bas", invariable in the plural).

The pinning `test.fails` was flipped to a passing `test` in
[adjectives.test.ts](../../../packages/engine/test/adjectives.test.ts) (*known bugs: adjectives*),
and coverage was extended there (feminine plural "basses"; a masculine sg/pl regression) and in
[adjective-gloss.test.ts](../../../packages/engine/test/adjective-gloss.test.ts) with the real
trigger — the `measure` gloss `TEMPERATURE` + `LOW` → "à température basse" (COLD's future
definition), correct in all seven languages.
