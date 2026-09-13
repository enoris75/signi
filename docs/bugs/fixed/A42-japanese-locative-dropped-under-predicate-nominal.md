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
- locative alone → `猫は家で…` with a lexical verb (correct); with BE it renders `猫は家でです。`,
  not the existential `猫は家にいます。` — a separate defect, A109

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

## Resolved

Fixed 2026-09-13, in the Japanese copular branch of the predicate builder:

- [`predicateSegs.ts`](../../../packages/engine/src/languages/ja/predicateSegs.ts): the `BE` +
  predicative path (the です frame) now renders every non-predicative complement through
  `complementSegs` **before** the adverb and the inflected copula, the same slot they take ahead of
  an ordinary verb. So `猫は家で伝説です。` and `猫は家で犬のために伝説です。` keep both the place and
  the cause. The predicate itself is unchanged: `copulaSegs` still inflects it, and tense, polarity
  and a spatial relation carry through (`猫は家で伝説ではありませんでした。`, `猫は家の下で伝説です。`).
  Verb-like copulars (SEEM → 思えます) never took this branch and are unaffected.

Out of scope, not addressed: the copular **imperative** (`…にしてください`) still passes only the
predicative to `complementSegs`, and a copular **relative clause** keeps its polite です (A116).
Neither was pinned by this defect.

- **Tests:** [`packages/engine/test/complements/combined.test.ts`](../../../packages/engine/test/complements/combined.test.ts)
  → *known bugs: combined complements*, and
  [`packages/engine/test/complements/combined-triples.test.ts`](../../../packages/engine/test/complements/combined-triples.test.ts)
  → *known bugs: three complements*. Both pinning `test.fails` are now passing `test`s, and the
  pair/triple tables that had recorded the truncated `猫は伝説です。` now assert the full sentence.
  Added cases: predicate noun + cause under BE across all seven languages; the preposed place
  survives an adverb (`いつも`), the `under` relation, and past negation; na- and i-adjective
  predicates take the place too; a regression guard that a bare predicate nominal and SEEM's order
  are unchanged. Unit case in
  [`languages/ja/predicateSegs.test.ts`](../../../packages/engine/src/languages/ja/predicateSegs.test.ts)
  pins the segment order: locative, cause, adverb, predicate, copula.
