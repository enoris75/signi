# A136. API errors are sent as Express's HTML error page

**Area:** Backend API, every route

`index.ts` has no error-handling middleware. Its JSON 404 for unknown API paths lives in `app.get('*')`,
so it answers `GET` only. Everything else reaches Express's defaults, which reply with an HTML page:

- **An error thrown in a handler** gives a `500` page with the stack trace. A135 is one way to throw.
- **A body that is not valid JSON** gives a `400` page. It carries body-parser's `SyntaxError` and stack.
- **Any method other than `GET` on an unrouted API path** gives a `404` page (`Cannot PUT …`).

The catch-all's own comment states the intent: *"returning HTML for a missing endpoint would mask bugs
and confuse fetch callers expecting JSON."*

Express's final handler puts the stack in the page unless `NODE_ENV` is `production`. Nothing in the
repo sets it, and `npm start` runs `node packages/backend/dist/index.js`. A server started that way
sends any client the stack of an error, with absolute paths into the server's file system.

Found while adding the backend's unit tests.

| Request | Now | Want |
|---|---|---|
| A handler throws | `500` · `text/html`, stack trace | `500` · `{ "error": … }`, no stack |
| `POST /api/translate` with the body `{"name": ` | `400` · `text/html`, `SyntaxError: Unexpected end of JSON input` and its stack | `400` · `{ "error": … }` |
| `POST /api/phrases` with the same body | the same | the same |
| `PUT /api/phrases/some-id` | `404` · `text/html`, `Cannot PUT /api/phrases/some-id` | `404` or `405` · `{ "error": … }` |
| `POST /api/concepts` | `404` · `text/html`, `Cannot POST /api/concepts` | the same |

The frontend reads only `res.ok` from a failed response, so its behaviour does not change. The fix
matters to other clients, and to what the server discloses.

Already right:

- A `GET` on an unknown API path is a JSON `404` (*unknown API paths* test).
- Each route's own `400` and `404` responses are JSON.

Not pinned:

- **A `GET` outside `/api/`** still falls through to the frontend's `index.html`, by design.

## Shape of the fix

This is a backend fix, in `packages/backend/src/index.ts`:

- Answer unknown API paths for every method, not just `GET`. For example, `app.all('/api/*', …)`
  replaces the `/api/` branch of the `app.get('*')` catch-all. It must be registered ahead of the `*`
  route, which then serves only the frontend.
- Register a four-argument error middleware after every route. It should answer
  `res.status(err.status ?? 500).json({ error })`, and log the error on the server.
  - Show `err.message` only when `err.expose` is set. http-errors sets it for client errors such as
    body-parser's `400`.
  - Otherwise send a generic message. Never send the stack.

| | |
|---|---|
| **Test** | `packages/backend/src/index.test.ts` → *known bugs: API errors sent as an HTML page* (1 `test.fails`) |
