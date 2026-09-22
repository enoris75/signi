# A209. German moves the prospective's negation into the zu-group as "kein"

**Language:** German

German negates the prospective ahead of `im Begriff`: *der Kater ist **nicht** im Begriff, die Maus
zu fressen*, "the cat is not about to eat the mouse".
[A19](../fixed/A19-german-prospective-aspect-negation.md) fixed exactly this scope, because a
`nicht` inside the zu-group, *ist im Begriff, die Maus **nicht** zu fressen*, says the opposite: the
cat is about to leave the mouse alone.

[A182](../fixed/A182-german-nicht-with-an-indefinite-object.md) later taught German to spell the
verb's `nicht` into an indefinite object or predicate noun as `kein` (*frisst keine Maus*, *ist
keine Legende*). In the prospective that nominal stands inside the zu-group, so the absorbed
negation lands there too, and A19's inversion comes back for every indefinite object: *ist im
Begriff, **keine** Maus zu fressen* means "is about to eat no mouse". A definite object is not
absorbed and still takes A19's slot, which is why the two render differently today.

| Case | Now | Want |
|---|---|---|
| CAT not about to EAT a MOUSE | `der Kater ist im Begriff, keine Maus zu fressen.` | `der Kater ist nicht im Begriff, eine Maus zu fressen.` |
| … MICE (`bare`) | `der Kater ist im Begriff, keine Mäuse zu fressen.` | `der Kater ist nicht im Begriff, Mäuse zu fressen.` |
| … DRINK WATER (`bare` mass) | `der Kater ist im Begriff, kein Wasser zu trinken.` | `der Kater ist nicht im Begriff, Wasser zu trinken.` |
| … past | `der Kater war im Begriff, keine Maus zu fressen.` | `der Kater war nicht im Begriff, eine Maus zu fressen.` |
| … MUST | `der Kater muss im Begriff sein, keine Maus zu fressen.` | `der Kater muss nicht im Begriff sein, eine Maus zu fressen.` |
| predicate noun, not about to BECOME a DOG | `der Kater ist im Begriff, kein Hund zu werden.` | `der Kater ist nicht im Begriff, ein Hund zu werden.` |
| … not about to BE a LEGEND | `der Kater ist im Begriff, keine Legende zu sein.` | `der Kater ist nicht im Begriff, eine Legende zu sein.` |
| question | `ist der Kater im Begriff, keine Maus zu fressen?` | `ist der Kater nicht im Begriff, eine Maus zu fressen?` |
| relative clause | `der Hund, der im Begriff ist, keine Maus zu fressen, läuft.` | `der Hund, der nicht im Begriff ist, eine Maus zu fressen, läuft.` |
| the random phrase | `alle Tränen und ich sind im Begriff, wegen der näheren am wenigsten großen Klinge kein Tod zu werden.` | `alle Tränen und ich sind nicht im Begriff, wegen der näheren am wenigsten großen Klinge ein Tod zu werden.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** A definite object (`ist nicht im Begriff, die Maus zu fressen`, `muss nicht im
Begriff sein, die Maus zu fressen`). A `no` object, which is the plan's own "about to eat no mouse"
and so belongs inside the group: `der Kater ist im Begriff, keine Maus zu fressen.` for *the cat is
about to eat no mouse*. A182 in the other aspects: `frisst keine Maus`, `frisst gerade keine Maus`,
`hat keine Maus gefressen`. The other six languages negate the prospective as a whole (`the cat is
not about to eat a mouse`).

Found by the random phrase "all tears and I are not about to become a death because of the nearer
least big blade." (seed 583434): `sind im Begriff, … kein Tod zu werden`.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine suite green, and no passing test moves.

In [`finiteNegation.ts`](../../../packages/engine/src/languages/de/finiteNegation.ts), keep the
prospective out of A182's absorption:

```ts
const absorbs = negate && verbPhrase.aspect !== 'prospective';
const keinObject = absorbs && takesKein(directObject);
const keinPredicative = absorbs && !keinObject && takesKein(complements?.['predicative']?.phrase);
```

The verb's `nicht` then reaches [`nichtSlots`](../../../packages/engine/src/languages/de/nichtSlots.ts),
which already places it ahead of `im Begriff` for the prospective. The same gate serves the
declarative, the question, the relative clause and the `wenn` clause, so every row follows.

| | |
|---|---|
| **Test** | `negation.test.ts` → *known bugs: German "kein" inside the prospective* (1 `test.fails`, plus a regression test for the definite object, the `no` object, A182 in the other aspects and English) |
