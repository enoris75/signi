# A161. Japanese has no feminine plural pronoun (彼女ら)

**Language:** Japanese

A feminine **plural** third person renders as 彼ら — the masculine/default plural. Japanese has 彼女ら
(かのじょら) for a group of women, and the engine already selects a feminine plural surface wherever the
corpus carries one: French `elles`, Spanish `ellas`, Portuguese `elas` all come out right from the
same plan. Japanese is the one language with a gendered plural whose form is not seeded.

| Plan | Now | Want |
|---|---|---|
| fem. plural subject, RUN | `彼らは走ります。` | `彼女らは走ります。` |
| fem. plural direct object, CAT SEE | `猫は彼らを見ます。` | `猫は彼女らを見ます。` |
| furigana, fem. plural subject | `["かれら", "はしります"]` | `["かのじょら", "はしります"]` |

**Already right.** The feminine *singular* is seeded and selected (`彼女は走ります。`, `猫は彼女を見ます。`),
and the masculine/mixed plural must stay 彼ら. English `they`, German `sie` and Italian `loro` have no
gendered plural at all and are correct as they stand — the gap is Japanese alone.

Found by reviewing the random phrase "they were not biting that sharp house in no adult ice cream"
(seed 484002), whose feminine plural subject rendered French `elles` but Japanese 彼ら; raised there
as a corpus question and confirmed as a defect.

## Shape of the fix

Two parts — the seed alone fixes the text but leaves the **reading** wrong, which is why the furigana
row above is in the table. Both were verified by applying them to a throwaway copy of the tree, which
produced exactly the three **Want** values and left the masculine plural and feminine singular
untouched.

- **Seed** — [`backend/src/concepts/pronouns.ts`](../../../packages/backend/src/concepts/pronouns.ts),
  the `ja` row of `THIRD_PERSON`: add `plural_fem: '彼女ら'` and `plural_fem_reading: 'かのじょら'`,
  beside the `singular_fem` / `singular_fem_reading` pair that is already there. No new form *key* is
  invented: `plural_fem` is the key French, Spanish and Portuguese already use.
- **Engine** — [`resolveNounPhrase.ts`](../../../packages/engine/src/translator/functions/resolveNounPhrase.ts):
  line 33 already picks `plural_fem` for the surface generically, but line 35 takes
  `plural_reading` unconditionally, so a feminine-plural surface keeps the **masculine** reading.
  It needs the feminine variant preferred when that surface was selected, mirroring the
  `singular_${gender}_reading` branch four lines below.
- The comment just above line 33 asserts "Italian/German/English/**Japanese** have no gendered plural
  and carry only `plural`". Japanese must come out of that list; the other three are correct.

**Heads-up for the fixer:** another session currently holds uncommitted edits to
`backend/src/concepts/pronouns.ts` (adding `definition` tooltips). They do not touch the `forms`
rows, so the two changes do not conflict — but rebase before editing that file.

**Decision for the fixer:** 彼女ら vs 彼女たち. たち is the more polite/neutral plural suffix and ら the
plainer one; the corpus uses 私たち and あなたたち for the 1st/2nd person but 彼ら (not 彼らたち) for the
3rd, so ら is the established choice for this concept and 彼女ら keeps it consistent. Confirm before
seeding.

| | |
|---|---|
| **Test** | `pronoun.test.ts` → *known bugs: Japanese feminine plural pronoun* (2 `test.fails`, plus a regression test that the masculine plural, the feminine singular and the other six languages are unchanged) |
