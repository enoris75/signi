# A19. Prospective aspect negates the wrong verb

**Language:** German

The negation lands inside the periphrasis instead of on the finite auxiliary.

| | |
|---|---|
| **Now / Want** | `der Kater ist im Begriff nicht zu essen.` (= is about to **not** eat) → `der Kater ist nicht im Begriff zu essen.` (= is **not** about to eat) |
| **Where** | negation belongs on the finite `ist`, as with the other aspects (`hat nicht gegessen`, `isst gerade nicht`) |
| **Test** | `verb.test.ts` → *known bugs: aspect* (1 test) |

## Resolved

Fixed 2026-07-16, in [`packages/engine/src/languages/de.ts`](../../../packages/engine/src/languages/de.ts):

- In **`renderClause`**, the negative "nicht" for a **prospective** clause is now emitted *before*
  the aspect adverbial `mid` ("im Begriff"), on the finite auxiliary — `ist NICHT im Begriff zu
  essen` — instead of falling into the `negAfter` slot between "im Begriff" and the governed "zu …"
  infinitive, where it inverted the meaning to *is about to NOT eat*. A new `negProspective` guard
  drives a `negAspectMid` slot and stands the other "nicht" slots down when it fires, so the clause
  carries exactly one "nicht".

The prospective's "im Begriff …" is a predicate the negation scopes over as a whole (like a
predicative complement), which is why "nicht" precedes it — unlike the progressive's adverb "gerade",
which "nicht" follows ("isst gerade nicht"). The resultative ("hat nicht gegessen") and progressive
placements are untouched, as is the affirmative prospective.

- **Tests:** [`packages/engine/test/verb.test.ts`](../../../packages/engine/test/verb.test.ts)
  → *known bugs: aspect*. The pinning `test.fails` is now a passing `test`, plus added cases: the
  same placement across the past ("war nicht im Begriff …") and future ("wird nicht im Begriff sein
  …") auxiliaries, and a regression guard that the resultative/progressive negation and the
  affirmative prospective are unchanged.
