# A135. A request field of the wrong JSON type crashes the handler

**Area:** Backend API, `POST /api/phrases` and `POST /api/translate`

Both handlers check that a field is present, then use it as if it had the type they expect. When the
field holds a different JSON type, the handler throws a `TypeError`. Express answers with a `500` and its
HTML error page, stack trace included (see A136).

Found while adding the backend's unit tests.

| Request | Now | Want |
|---|---|---|
| `POST /api/phrases` with `name: 42` (also `true`, `{}`, `["cat eats"]`) | `500` · `TypeError: body?.name?.trim is not a function` | `400` with a JSON error, and nothing saved |
| `POST /api/translate` with `plan.subject: "CAT"` (also `5`) | `500` · `TypeError: Cannot use 'in' operator to search for 'conjuncts' in CAT` | `400` with a JSON error |

The frontend sends well-typed bodies, so the other API clients are the ones that reach this.

Already right:

- A missing or blank `name`, a missing `workspace`, and `containers` that is not a list are each a `400`
  (*POST /api/phrases* tests).
- `plan: "CAT"` and `plan.subject: null` are each a `400`.

Not pinned:

- **What a container holds.** A save with `workspace.containers: [1, "x"]` is stored (`201`), and loading
  it back returns the same junk. `SerializedSelection` is open on purpose, because the frontend owns
  its key set. How deeply the backend should check a workspace is a decision, so only the fields the
  handlers read are pinned.

## Shape of the fix

This is a backend fix, in `packages/backend/src/index.ts`. Check each field's type, not only its presence:

- In the phrases handler, `typeof body?.name === 'string'` before `trim()`.
- In the translate handler, that `plan.subject` is a non-null object before `nounConjuncts(subject)`.

Answer with each route's existing `400`. A fix for A136 alone would turn these into JSON `500`s, which
is still wrong: the request is at fault, not the server.

| | |
|---|---|
| **Test** | `packages/backend/src/index.test.ts` → *known bugs: a request field of the wrong JSON type* (1 `test.fails`) |
