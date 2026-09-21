# A185. Japanese puts the possessed head's determiner in front of its possessor

**Languages:** Japanese

A Japanese prenominal determiner modifies the nearest noun after it. `この猫の本` is "this cat's
book", and `多くの猫の本` is "many cats' books". The head's own determiner belongs after the
possessor's の: `猫のこの本` ("this book of the cat's"), `猫の多くの本`, `猫のどの本も`.
[`npSegs`](../../../packages/engine/src/languages/ja/npSegs.ts) pushes the determiner first and the
possessor after it. Every head determiner therefore attaches to the possessor. When the possessor
has a determiner of its own, the two stack into nonsense: `いくつかの多くの…涙の火` ("some many tears'
fire"). With `no`, どの…も wraps the possessor too: `どの猫の本も燃えません` reads "no cat's book
burns".

| Head | Now | Want |
|---|---|---|
| `this` | `この猫の本は燃えます。` | `猫のこの本は燃えます。` |
| `that` | `その猫の本は燃えます。` | `猫のその本は燃えます。` |
| `some` | `いくつかの猫の本は燃えます。` | `猫のいくつかの本は燃えます。` |
| `many` | `多くの猫の本は燃えます。` | `猫の多くの本は燃えます。` |
| `all` | `すべての猫の本は燃えます。` | `猫のすべての本は燃えます。` |
| `no` | `どの猫の本も燃えません。` | `猫のどの本も燃えません。` |
| `this` + OLD | `この猫の古い本は燃えます。` | `猫のこの古い本は燃えます。` |
| `this`, pronominal possessor | `この彼女の本は燃えます。` | `彼女のこの本は燃えます。` |
| object, `no` | `犬はどの猫の本も見ません。` | `犬は猫のどの本も見ません。` |
| locative, `this` | `犬はこの猫の家で走ります。` | `犬は猫のこの家で走ります。` |
| the random phrase's subject | `いくつかの多くの幸せな大人の涙の火は燃えます。` | `多くの幸せな大人の涙のいくつかの火は燃えます。` |

`この彼女` also reads as "this girlfriend".

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** A head with no possessor (`この本は燃えます。`, `どの本も燃えません。`). The
possessor's own determiner, which leads the possessor (`この猫の本は燃えます。` for "this cat's
book"). The definite head (`猫の本は燃えます。`).

Found by the random phrase "many happy adult tears' fires will want to have divided the tired empty
young man up behind sharpest Europe." (seed 530537), rendered
`いくつかの多くの幸せな大人の涙の火は…`.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine suite green.

In [`npSegs`](../../../packages/engine/src/languages/ja/npSegs.ts), build the determiner segment
(`JA_PRENOMINAL_DET[definiteness]`, or `JA_NEGATIVE_DETERMINER.pre` for `no`) where it is today, but
push it after the possessor block, before the noun modifiers and adjectives. The closing も of the
どの…も circumfix is placed by the particle owner, so it is unaffected. Update the comment "The
determiner leads the phrase" with it.

**Decision for the fixer:** `猫の少しの本` keeps `少しの` for `few`. It is unidiomatic with a count
noun (`わずかな`, `少数の`), but that is the Japanese quantifier and counter choice
(`いくつかの人` for 何人かの人), not this defect. Not pinned.

| | |
|---|---|
| **Test** | `possession.test.ts` → *known bugs: Japanese puts the head's determiner before its possessor* (1 `test.fails`, plus a regression test for the possessor's own determiner and a head with no possessor) |

## Resolved

**2026-09-21.** The determiner moved behind the possessor.

- [`ja/npSegs.ts`](../../../packages/engine/src/languages/ja/npSegs.ts) still builds the determiner
  segment from `JA_PRENOMINAL_DET[definiteness]` (or `JA_NEGATIVE_DETERMINER.pre` for `no`) where it
  did, but holds it in `detSegs` and pushes it *after* the possessor block, in front of the noun
  modifiers and adjectives: `猫のこの本`, `猫の多くの大きい本`, `猫のどの本も`. The closing も of the
  どの…も circumfix is placed by the particle owner, so it was unaffected.

Per the **Decision for the fixer**, `few` keeps `少しの` (`猫の少しの本`): the quantifier-and-counter
choice is a separate matter from where the determiner sits.

**Tests guarding it:** `packages/engine/test/possession.test.ts` → *known bugs: Japanese puts the
head's determiner before its possessor* — the former `test.fails` is now a plain test, beside its
regression test and a new one covering `few`, an `indefinite` head (no prenominal word to place),
two stacked adjectives, a possessor that carries its own determiner at the next depth down
(`猫の多くの父のこの本`), a pronominal possessor under `no` (`彼女のどの本も`) and the object position
(`犬は猫のすべての本を見ます。`). Unit level:
`packages/engine/src/languages/ja/npSegs.test.ts` → *a possessed head keeps its determiner after the
possessor, before the adjectives*.
