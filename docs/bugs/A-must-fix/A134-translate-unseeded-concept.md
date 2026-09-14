# A134. The translate endpoint renders a plan that names an unseeded concept

**Area:** Backend API, `POST /api/translate` (every language)

The handler checks only that the subject's first conjunct has a `concept` field. It never checks that
the concepts in the plan exist. The engine renders a concept the lexicon cannot find as an empty word,
so the response is a `200`. A noun leaves a hole where the word should be, and its article stays
behind. A verb, adjective or adverb disappears without a trace.

Found while adding the backend's unit tests.

| Plan | Now | Want |
|---|---|---|
| UNICORN EAT | `200` · `the  eats.` · `は食べます。` | `400`, the error names `UNICORN` |
| CAT UNICORN (as the verb) | `200` · `the cat.` · `猫は。` | the same |
| CAT EAT UNICORN (as the object) | `200` · `the cat eats the.` · `猫はを食べます。` | the same |
| CAT (adjective UNICORN) EAT | `200` · `the cat eats.` | the same |
| CAT and UNICORN EAT | `200` · `the cat and the  eat.` | the same |
| subject concept `42` | `200` · `the.` | `400` |

The same happens in the slots the test does not pin. A locative UNICORN gives `the cat eats in the.`,
and a UNICORN adverb is dropped.

The frontend builds its plans from `/api/concepts`, so the other API clients are the ones that reach this.
The frontend's `fetchTranslation` already treats any non-OK response as a failure, so a `400` needs no
frontend change.

Already right, and pinned as a regression guard:

- A request with no plan, no subject, or a subject without a concept is a `400`
  (*POST /api/translate* tests).
- Every plan the app renders itself is accepted: each concept `definition` and each UI-string `plan`.
  A fix that checked the plan too strictly would reject one of these.

Not pinned:

- **A concept in a slot of the wrong role.** A verb as the subject gives `the eat eats.`, and a noun as
  the verb gives `the cat dog.`. Rejecting these needs a decision about which roles each slot admits (a
  noun or pronoun subject, a modal verb, an adjective head, …). Only unseeded ids are pinned.
- **A verb phrase without a verb** (`verbPhrase: {}`, or a string). It renders the subject alone,
  `the cat.`. Whether that is a verbless period or a malformed request is also a decision.

## Shape of the fix

This is a backend fix, in `packages/backend/src/index.ts`. The engine is not involved.

Wrap `lookupLexicalEntry` in the translate handler so it records every id that has no
`semantic_concepts` row, and pass the wrapper to `translate`. If it recorded any, answer `400` with an
error naming them. This catches the id in every slot the engine reads, with no plan walker to keep in
step with the plan model: subject, verb, object, conjunct, adjective, complement and adverb were all
checked. Test for the row, not for a missing entry, because a seeded concept can lack a lexeme in one
language without being unknown.

| | |
|---|---|
| **Test** | `packages/backend/src/index.test.ts` → *known bugs: translating a plan that names an unseeded concept* (1 `test.fails`) |
