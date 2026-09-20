# A145. Italian stacks every prenominal adjective before the noun

**Language:** Italian (French noted, deliberately out of scope)

`splitAdjectives` ([`languages/it/splitAdjectives.ts`](../../../packages/engine/src/languages/it/splitAdjectives.ts))
sends every adjective whose concept is in `PRENOMINAL` to the front of the noun. Italian takes at
most **one** qualifying adjective there; the rest follow the noun. So a phrase with two of them
stacks two, and a phrase with three stacks three.

| Plan | Now | Want |
|---|---|---|
| ANGEL + BEAUTIFUL, BIG | `il bel grande angelo` | `il bell'angelo grande` |
| CAT + BEAUTIFUL, BIG | `il bel grande gatto` | `il bel gatto grande` |
| ANGEL + OLD, BEAUTIFUL | `il vecchio bell'angelo` | `il vecchio angelo bello` |
| ANGEL + BIG, OLD, BEAUTIFUL | `il grande vecchio bell'angelo` | `il grande angelo vecchio e bello` |
| few ANGELs + BEAUTIFUL, BIG | `pochi bei grandi angeli` | `pochi begli angeli grandi` |
| few ANGELs + BIG, OLD, BEAUTIFUL | `pochi grandi vecchi begli angeli` | `pochi grandi angeli vecchi e belli` |

Found by reviewing a rendered phrase — "that action starts like few beautiful big angels" — against
the seeded corpus.

## Not at fault

- **The allomorphy.** `prenominalChain` resolves the chain right-to-left so `bello` agrees with the
  sound of whatever follows it, and it is right in every row above: `bei` before `grandi`, `begli`
  before `angeli`, `bell'` before `angelo`, `bel` before `gatto`. Fixing the split changes which
  word follows `bello`, and the chain then picks the new form on its own — that is what turns
  `pochi bei grandi angeli` into `pochi begli angeli grandi`.
- **One prenominal adjective**, with or without a postnominal one: `il bell'angelo`,
  `il grande angelo`, `l'angelo alto`, `pochi begli angeli alti`. All correct today.
- **The postnominal join.** A27 already gives the postnominal list commas with the coordinator only
  before the last, through `joinConjuncts`. The demoted adjectives land in that list and are
  coordinated by it for free — `vecchio e bello` for a pair, `vecchio, bello e freddo` for a triple.

## Deliberate, per a code comment

`PRENOMINAL` in [`it.consts.ts`](../../../packages/engine/src/languages/it/it.consts.ts) says so:

> Both size adjectives (grande/piccolo) precede, so they behave consistently — the trade-off is that
> a size + beauty pair stacks before the noun ("il grande bel cane").

By the classification rule in [the index](../engine-grammar-bugs.md) a code comment like that would
normally make this a Part B documented simplification. It is filed as a bug by product decision: the
stacking is not idiomatic Italian at any list length, and the consistency the comment buys is
consistency in the wrong output. **Delete that sentence from the comment when this is fixed.**

## French is out of scope

French stacks two prenominal adjectives idiomatically — `un beau grand jardin`, `de beaux grands
anges` — so `le beau grand ange` is right and must not follow Italian. Only its three-adjective case
reads wrong (`peu de grands vieux beaux anges`), and the correct target there is a separate
judgement about French prenominal ordering, not this fix. The test pins French unchanged.

## Shape of the fix

In `splitAdjectives` (it), cap `pre` at one: the first adjective in the phrase's own list whose
concept is in `PRENOMINAL` and whose degree is `positive` stays prenominal, and every later one
joins `post`, keeping the user's order. The list order is the user's, so "first wins" is the
predictable rule — nothing else in the engine reorders a phrase's adjectives.

Nothing downstream needs to change: `prenominalChain` re-resolves the allomorph against the noun,
and `renderNP`'s `joinConjuncts` coordinates the enlarged `post` list.

| | |
|---|---|
| **Test** | `adjectives.test.ts` → *known bugs: Italian stacked prenominal adjectives* (3 `test.fails`, plus a regression test for the single-adjective cases and for French) |

## Resolved

Fixed on 2026-09-20 in
[`it/splitAdjectives.ts`](../../../packages/engine/src/languages/it/splitAdjectives.ts): `pre` now
takes the **first** eligible adjective in the phrase's own list and demotes every later one to
`post`, keeping the user's order. Nothing downstream changed — `prenominalChain` re-resolves the
allomorph against whatever now follows (`pochi bei grandi angeli` → `pochi begli angeli grandi`), and
`renderNP`'s `joinConjuncts` coordinates the enlarged `post` list.

One refinement on the shape the file proposed: the cap is on the **qualifying** adjectives only.
[`it.consts.ts`](../../../packages/engine/src/languages/it/it.consts.ts) splits `PRENOMINAL` into
`PRENOMINAL_QUALIFYING` (the BAGS set) and `PRENOMINAL_DETERMINER` (the ordinals and OTHER). A
determiner-like adjective does not qualify the noun, so it neither takes the one slot nor blocks it:
'un altro grande topo' and 'il primo grande angelo' stay as they were, both pinned as right before
this fix. The comment calling the stacking a deliberate trade-off is gone, as the file asked.

Guarded by `adjectives.test.ts` → *known bugs: Italian stacked prenominal adjectives*: the three
former `test.fails` now pass, plus a determiner-like prenominal leading a qualifying one, a fourth
adjective joining the list, and a graded adjective that never held the slot; the regression test for
the single-adjective cases and for French is unchanged. `splitAdjectives.test.ts` and
`renderNP.test.ts` pin the split and the surface directly.

Expected re-records, all the same substitution: `adjectives.test.ts`, `subject.test.ts` and
`renderNP.test.ts` held Italian lines with two stacked prenominals ('il grande vecchio gatto').
