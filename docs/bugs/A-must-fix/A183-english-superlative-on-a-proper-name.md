# A183. An English superlative on a proper name has no "the"

**Languages:** English

An English superlative is definite: `the biggest dog`, never `biggest dog`
([A25](../fixed/A25-english-superlative-indefinite-article.md),
[A175](../fixed/A175-superlative-under-an-indefinite-determiner.md)). A proper name takes no article in
English, and that holds for the positive and the comparative (`big Europe`, `bigger Europe`). A
superlative brings the article back: `the biggest Europe`, `the least beautiful Asia`.

[`determiner`](../../../packages/engine/src/languages/en/determiner.ts) returns `''` for a `proper`
head on its first line, before it reaches the superlative guard that gives a bare or indefinite
superlative its `the`. So every superlative name goes bare, in every position.

| Case | Now | Want |
|---|---|---|
| subject | `biggest Europe burns.` | `the biggest Europe burns.` |
| object | `the cat sees biggest Europe.` | `the cat sees the biggest Europe.` |
| object, `least` | `the cat sees least beautiful Asia.` | `the cat sees the least beautiful Asia.` |
| object, a second adjective | `the cat sees biggest old Europe.` | `the cat sees the biggest old Europe.` |
| locative, `behind` | `the cat runs behind sharpest Europe.` | `the cat runs behind the sharpest Europe.` |
| direction | `the cat goes to biggest Europe.` | `the cat goes to the biggest Europe.` |
| possessor | `biggest Europe's book burns.` | `the biggest Europe's book burns.` |
| predicate noun | `the cat is biggest Europe.` | `the cat is the biggest Europe.` |
| an articled name | `biggest Antarctica burns.` | `the biggest Antarctica burns.` |
| a language name | `the cat sees most beautiful German.` | `the cat sees the most beautiful German.` |
| the random phrase | `… up behind sharpest Europe.` | `… up behind the sharpest Europe.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** The positive and the comparative on a name (`the cat sees big Europe.`, `the cat
sees bigger Europe.`). A possessive, which keeps the slot (`the cat sees your biggest Europe.`). A
superlative on a common noun (`the cat sees the biggest dog.`). The other six languages, which article
the superlative name (`das größte Europa`, `l'Europa più grande`, `la Europa más grande`).

Found by the random phrase "many happy adult tears' fires will want to have divided the tired empty
young man up behind sharpest Europe." (seed 530537).

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine suite green.

In [`determiner`](../../../packages/engine/src/languages/en/determiner.ts), let the superlative through
on a proper name:

```ts
if (forms['proper'] === '1') return superlative ? 'the ' : '';
```

Every caller already passes `superlative`, including the Saxon possessor, so nothing else changes.
Update the comment on the proper-name line with it.

| | |
|---|---|
| **Test** | `nounPhrase.test.ts` → *known bugs: an English superlative on a proper name* (1 `test.fails`, plus a regression test for the positive, the comparative, a possessive and a common noun) |
