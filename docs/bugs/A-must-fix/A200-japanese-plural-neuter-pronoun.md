# A200. The Japanese plural neuter pronoun is それら, not 彼ら

**Language:** Japanese

Japanese splits its third-person plural the way it splits its singular. 彼ら (and 彼女ら) are people;
それら is the plural of それ and is what a group of *things* is called. The engine has no それら, so a
neuter third plural — a group of books, flames, options — is rendered 彼ら, which says "those people".
`{ THIRD_PERSON, gender: 'neut', number: 'plural' }` as an object gives 猫は**彼ら**を見ます。 for "the
cat sees them".

[`resolveNounPhrase`](../../../packages/engine/src/translator/functions/resolveNounPhrase.ts) picks a
plural pronoun's surface with one gender in mind:

```ts
const femininePlural = gender === 'fem' && !!head.forms['plural_fem'];
const pluralSurface = (femininePlural && head.forms['plural_fem']) || head.forms['plural'];
```

`plural_fem` is the only gendered plural the resolver knows, and the `ja` row of THIRD_PERSON
([`pronouns.ts`](../../../packages/backend/src/concepts/pronouns.ts)) carries `plural: '彼ら'` and
`plural_fem: '彼女ら'` and nothing else. A neuter plural therefore misses both tests and takes the
masculine default. The singular is complete — `singular_neut: 'それ'` is seeded and
`head.forms['singular_' + gender]` is read generically — so それ is right and それら is not.

This is **the gap [C20](../../localization/done/C20-pronoun-agreement.md) named and did not close**
(its item 7): *"a plural thing antecedent reads 彼ら in Japanese … because the Japanese THIRD_PERSON
lexeme has no neuter plural (それら) and the translator knows only `plural_fem`. The same happens with
a plain `{ gender: 'neut', number: 'plural' }` pronoun, so it predates the construct."* This file is
that gap's ticket. It is therefore reachable two ways: through the plan's own `gender`, and through
an `antecedent` naming a thing, since `antecedentAgreement` hands en/ja the natural gender and a
plural non-person resolves to neuter.

| Case | Now | Want |
|---|---|---|
| the CAT sees them (3pl neuter object) | `猫は彼らを見ます。` | `猫はそれらを見ます。` |
| they run (3pl neuter subject) | `彼らは走ります。` | `それらは走ります。` |
| the CAT cries because of them | `猫は彼らのために泣きます。` | `猫はそれらのために泣きます。` |
| the MAN gives the BOOK to them | `男は彼らに本をあげます。` | `男はそれらに本をあげます。` |
| they and the CAT run | `彼らと猫は走ります。` | `それらと猫は走ります。` |
| the furigana over the subject | `かれら` | (none — それら is kana) |

Every **Want** was rendered by a trial fix applied to HEAD in this worktree and then reverted, not
written by hand.

**Already right.** The masculine and mixed plural, which keeps 彼ら (`彼らは走ります。`) with its
`かれら` reading. The feminine plural [A161](../fixed/A161-japanese-feminine-plural-pronoun.md) added,
彼女ら / `かのじょら`. The neuter **singular**, それ, everywhere it goes (`それは走ります。`,
`猫はそれを見ます。`). The other six languages, none of which has a person/thing split in the plural
pronoun: `the cat sees them.`, `il gatto li vede.`, `le chat les voit.`, `der Kater sieht sie.`, `el
gato los ve.`, `o gato os vê.` The first and second person plurals (私たち, あなたたち).

**The fix is a seed form *and* engine logic — both.** Either alone leaves the bug standing:

- The **seed** has to supply the word. `plural_neut: 'それら'` on the `ja` row of THIRD_PERSON, beside
  `plural_fem: '彼女ら'`.
- The **engine** has to read it. `resolveNounPhrase` tests `gender === 'fem'` and the literal key
  `plural_fem`; a `plural_neut` row it does not look at changes nothing. The trial generalises both
  lines to the gender in hand, which is what the singular branch a few lines below already does:

  ```ts
  const genderedPlural = !!head.forms[`plural_${gender}`];
  const pluralSurface = (genderedPlural && head.forms[`plural_${gender}`]) || head.forms['plural'];
  const pluralReading = (genderedPlural && head.forms[`plural_${gender}_reading`]) || head.forms['plural_reading'];
  ```

  No other language grows a form: `plural_masc` is seeded nowhere, Spanish `nosotras` / `ellas` and
  French `elles` keep working off `plural_fem`, and every other lexeme falls through to `plural`.

**Shipped strings.** None. No `UI_STRINGS` entry and no concept `definition` uses a plural pronoun —
C20 checked this when it recorded the gap ("no gloss uses a plural antecedent") and it is still true.
The defect is reachable from the phrase builder's pronoun box, whose number and gender are toggles.

Found by an agent localizing; verified at 80b21ff.

## Shape of the fix

Verified by applying it to HEAD and reverting it. It renders every **Want** above.

**One passing test pins the wrong form and must be corrected as part of the fix, not merely
unmarked.** [`pronoun.test.ts`](../../../packages/engine/test/pronoun.test.ts) has
*third-person pronoun by gender* → **"neuter is a no-op in the plural — a neuter 'they' is the plain
'they'"**, which asserts `ja: '彼らは食べます。'` and then `expect(neutPl).toEqual(sayAll(… no gender
…))`. Its premise — "the plural has no neuter pronoun in any of the seven" — is false for Japanese,
and both the comment and the two assertions have to change with the fix: the six other languages
stay a no-op, Japanese does not, so the `toEqual` against the genderless plural has to become a
six-language `toMatchObject`. That test is the reason this defect survived A161: it was written
before それら was known to be wanted, and it reads as coverage.

**Decisions for the fixer:**

- **The reading.** それら is all kana, and the ruby builder emits no segment for a reading equal to
  its text — the seeded `singular_neut_reading: 'それ'` already produces no furigana. So
  `plural_neut_reading: 'それら'` is optional; the trial seeds it for symmetry with the other rows
  and it changes nothing. Pinned only as "no reading over それら".
- **The animate boundary.** それら is right for things. A group of animals of unknown sex resolves to
  neuter in Japanese (C20's rule: "neuter for anything that is not a person"), so "the cat sees them"
  of several CATs would become それら. C20 accepted that boundary for the singular (`猫はそれを見ます`
  for CAT), so the plural inherits it. Not a separate question.
- **[A201](A201-japanese-neuter-pronominal-possessor.md) is not fixed by this.** The possessive is a
  second surface off a hardcoded table in
  [`possessive.ts`](../../../packages/engine/src/possessive.ts), not off the seed — the same division
  A161 recorded. A neuter plural *possessor* stays 彼らの until that table grows its own branch, which
  is A201's.

| | |
|---|---|
| **Test** | `pronoun.test.ts` → *known bugs: the Japanese plural neuter pronoun* (2 `test.fails` — the surface in five slots, and the furigana — plus a regression test for the masculine and feminine plurals, the neuter singular and the other six languages) |
