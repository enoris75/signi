# A193. An English particle after an object with a relative clause joins the relative clause

**Language:** English

UP and DOWN are particles of the verb. [A156](./A156-english-direction-adverb-after-complements.md)
put them right after the object (`moves the book up`), which is right for a short object. An object
that carries a relative clause ends in that clause's verb. A particle after it attaches to the nearest
verb, so `the cat moves the book that sees the dog up` reads as "the book that sees the dog up". English
moves the particle ahead of such an object: `moves up the book that sees the dog`, `was drinking up
their prison that feels Asia`. The split order is only for a short object, and it is the only order
for a pronoun (`moves him up`).

[`en/predicateParts.ts`](../../../packages/engine/src/languages/en/predicateParts.ts) puts a
direction adverb at the head of `complementsText`, after `directObjectText`, whatever the object
holds.

| Case | Now | Want |
|---|---|---|
| CAT MOVE the BOOK that SEEs the DOG, UP | `the cat moves the book that sees the dog up.` | `the cat moves up the book that sees the dog.` |
| … DOWN | `the cat moves the book that sees the dog down.` | `the cat moves down the book that sees the dog.` |
| … past | `the cat moved the book that sees the dog up.` | `the cat moved up the book that sees the dog.` |
| … negative | `the cat does not move the book that sees the dog up.` | `the cat does not move up the book that sees the dog.` |
| … MUST | `the cat must move the book that sees the dog up.` | `the cat must move up the book that sees the dog.` |
| … progressive | `the cat is moving the book that sees the dog up.` | `the cat is moving up the book that sees the dog.` |
| … resultative | `the cat has moved the book that sees the dog up.` | `the cat has moved up the book that sees the dog.` |
| the BOOK that the DOG SEEs (object gap) | `the cat moves the book that the dog sees up.` | `the cat moves up the book that the dog sees.` |
| command | `move the book that sees the dog up.` | `move up the book that sees the dog.` |
| instruction | `move the book that sees the dog up.` | `move up the book that sees the dog.` |
| question | `does the cat move the book that sees the dog up?` | `does the cat move up the book that sees the dog?` |
| the random phrase's first clause | `no careful missing death was drinking their least cold prison that feels missing Asia up because of all food.` | `no careful missing death was drinking up their least cold prison that feels missing Asia because of all food.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** A short object and a pronoun, which keep A156's order (`the cat moves the book
up.`, `the cat moves him up.`, `the cat moves the book up in the house.`). German, whose relative
clause is closed off by commas (`der Kater verschiebt das Buch, das den Hund sieht, nach oben.`).
Japanese, whose relative clause precedes its noun (`猫は犬を見る本を上に移動します。`).

Found by the random phrase "no careful missing death was drinking their least cold prison that feels
missing Asia up because of all food, that is, few cats' walls come because of all big deaths." (seed
502396). Filed on the user's ruling of 2026-09-21.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine suite green. No passing test moves.

In `predicateParts`, when the adverb is a direction adverb, the clause is active, and any conjunct of
the direct object has a `relative`, put the adverb in front of `directObjectText` and leave it out of
`complementsText`. Every branch (declarative, question, command, instruction, the aspects) already
places the object right after the verb, so the one change reaches them all.

**Decisions for the fixer:**

- **Complements after the relative clause.** A complement or a trailing manner adverb after such an
  object still reads as part of the relative clause, before the fix and after it: `the cat moves up
  the book that sees the dog in the house.`, `the cat moves the book that sees the dog fast.` Only the
  particle has a place to move to. Not pinned.
- **Other heavy objects.** The trial moves the particle only for a relative clause. A long coordinated
  object is also better with the particle first, but nothing attaches to it wrongly. Not pinned.
- **Romance.** A direction adverb after the object ([A142](./A142-direction-adverb-before-object.md))
  has the same attachment after a relative clause: `il gatto sposta il libro che vede il cane su.`,
  `el gato mueve el libro que ve el perro arriba.` A142 chose the post-object slot because the
  pre-object one reads as another sentence in Italian (`sposta su il libro`, "moves onto the book").
  Not pinned.

| | |
|---|---|
| **Test** | `adverb.test.ts` → *known bugs: an English particle after an object with a relative clause* (1 `test.fails`, plus a regression test for a short object, a pronoun, A156's complement, German and Japanese) |

## Resolved

Fixed 2026-09-21, as the shape above describes, in English only.

- **The hoist.** [`en/predicateParts.ts`](../../../packages/engine/src/languages/en/predicateParts.ts)
  computes `particleFirst`: a direction adverb, an active clause, and any conjunct of the direct
  object carrying a `relative`. The object slot then opens on the adverb, and the complements slot is
  built with an empty adverb text, so the particle is spelled exactly once. Every branch —
  declarative, negative, question, command, instruction, the modals and the aspects — already puts
  the object right after the verb group, so the one hoist reaches them all.
- **What did not move.** A short object and a pronoun keep A156's split order, a passive has no
  object left to carry a relative clause, and a place adverb is no particle, so it stays where a
  locative stands (A189). Romance is out of scope, as the decision above has it.

- **Tests:**
  - [`adverb.test.ts`](../../../packages/engine/test/adverb.test.ts) → *known bugs: an English
    particle after an object with a relative clause*: the pinning test is a plain `test` now, with a
    new case for the hoist inside a relative clause's own predicate, in the future, across a
    coordinated object where one conjunct carries the relative clause (and a plain coordination that
    keeps A156's order), and for EVERYWHERE staying behind the same object.
