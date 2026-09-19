# A156. An English adverb of direction comes after the complements

**Language:** English

English places the main verb's adverb at the very end of the clause, after every complement. A manner
adverb can stand there (`the cat runs in the house fast`). UP and DOWN cannot. They are verb particles
and follow the verb or its object directly, so a complement after them changes the parse: in `moves the
book in the house up`, "in the house" reads as part of "the book".

| Clause | Now | Want |
|---|---|---|
| CAT MOVE the BOOK, UP, locative the HOUSE | `the cat moves the book in the house up.` | `the cat moves the book up in the house.` |
| CAT MOVE the BOOK, DOWN, cause the DOG | `the cat moves the book because of the dog down.` | `the cat moves the book down because of the dog.` |
| CAT JUMP, DOWN, source the WALL | `the cat jumps from the wall down.` | `the cat jumps down from the wall.` |
| no LOW BAD PERSON CAN BITE this AFRICA, DOWN, past resultative, locative some WOMEN | `no low bad person could have bitten Africa in some women down.` | `no low bad person could have bitten Africa down in some women.` |

With no complement the order is already right (`the cat moves the book up`), which is why A142 lists
English as right. Japanese is right in both cases (`猫は家で本を上に移動します`).

Found by reviewing the random phrase "no low bad person could have bitten Africa in some women down".

## Shape of the fix

This is the English side of [A142](A142-direction-adverb-before-object.md), which is the same missing
distinction between a direction adverb and a manner adverb. In Romance and German that gap puts the
adverb too early; in English it puts it too late. Step 1 of A142 (`subtype: 'direction'` on UP and DOWN)
serves both. The English predicate then places a direction adverb after the noun object and before
the complements. A manner adverb stays at the end.

| | |
|---|---|
| **Test** | `adverb.test.ts` → *known bugs: English adverb of direction after the complements* (1 `test.fails`, plus a regression test for the complement-free clause and for Japanese) |
