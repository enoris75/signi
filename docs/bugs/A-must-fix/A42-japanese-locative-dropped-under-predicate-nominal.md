# A42. Japanese drops the locative under a predicate nominal

**Language:** Japanese only

When a copular clause carries **both** a predicate noun and a locative — "the cat is a legend in
the house" — Japanese silently loses the place. The predicate-nominal frame closes the clause with
the copula です, and the `家で` locative adjunct has nowhere to attach, so it is dropped entirely.
The other six languages keep both.

| | Now | Want |
|---|---|---|
| Japanese | `猫は伝説です。` | `猫は家で伝説です。` |

The six other languages are correct and unaffected — `the cat is a legend in the house`,
`il gatto è una leggenda nella casa`, `der Kater ist eine Legende im Haus`, … — so the loss is
Japanese-specific.

It is a **silent** loss: no error, no `undefined`, just a shorter sentence that reads as fully
grammatical. That is what makes it worth pinning — the output looks fine in isolation and only the
missing place gives it away.

**It is not only the locative.** The です frame swallows *any* trailing adjunct, so a cause goes the
same way. "The cat is a legend in the house because of the dog" renders `猫は伝説です。` in Japanese —
losing **both** the place and the cause — while the other six keep both (`… a legend in the house
because of the dog`). Any fix must restore both, not just the locative.

## When it happens

Only when the two complements co-occur on a copula (`BE` / `SEEM` / `APPEAR` — the verbs that
license `predicative` alongside `locative`). Each renders correctly **alone**:

- predicate noun alone → `猫は伝説です。` (correct)
- locative alone → `猫は家にいます。` / `猫は家で…` (correct)

It is the combination the Japanese copular frame cannot express, not either complement on its own.
The engine walks `COMPLEMENT_RENDER_ORDER` and emits the predicative, but the Japanese predicate-noun
copula construction leaves no slot for a preceding locative adjunct, so it never surfaces.

## Shape of the fix

The place must be admitted ahead of the predicate noun: `猫は家で伝説です。` — the で-marked locative
adjunct preposed before the predicate nominal, the copula です unchanged. The Japanese copular path
needs to thread a locative (when present) into the pre-predicate position rather than discarding it,
the way the action verbs already carry `家で` before the verb.

| | |
|---|---|
| **Test** | `complements/combined.test.ts` → *known bugs: combined complements* (locative, 1 `test.fails`) |
| | `complements/combined-triples.test.ts` → *known bugs: three complements* (locative + cause, 1 `test.fails`) |
