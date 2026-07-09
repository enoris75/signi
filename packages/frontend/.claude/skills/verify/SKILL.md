---
name: verify
description: Build, run and drive the Signi frontend in a real browser to observe a change working end-to-end.
---

# Verifying a Signi frontend change

The surface is pixels: Signi is a React/MUI canvas app. Drive it in Chrome and
measure the DOM. Typecheck (`npx tsc --noEmit -p tsconfig.json` in
`packages/frontend`) is not verification — it only rules out the cheapest class
of mistake.

## Launch

`npm run dev` from the repo root starts backend (:3001) and vite (:5173) together.
Both may already be running from the user's own session — check before starting,
and if a port is taken, vite picks the next one (:5174) and serves the same source.

**Never `pkill -f concurrently` or blanket-kill by port name** — that takes down
the user's own dev server. Kill only the PID you started.

## Drive

No Playwright in the repo, but the browsers are cached and Chrome is installed:

```bash
cd "$SCRATCHPAD" && npm init -y && npm i playwright-core
```

```js
chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
```

Gotchas that cost time:

- **Placeholders use a unicode ellipsis** (`type a subject…`), so
  `getByPlaceholder("type a subject...")` never matches. Use a regex.
- **Don't click typeahead options by text** — the off-screen word palette holds
  the same words and Playwright picks it first. Type, then press `Enter`; both
  the subject and verb typeaheads select the highlighted option.
- `localStorage.clear()` in `addInitScript` throws on `about:blank`. Clear it
  after the first `goto`, then reload.
- Canvas height is persisted at `localStorage["signi:graphHeight"]`; clear it or
  a previous run's height leaks into this one.

To reach the canvas: fill the subject typeahead → Enter → fill the verb
typeahead → Enter. That paints three dotted role boxes.

## Measure

The dotted role boxes have no test ids. Find them by computed style, and their
parent is the canvas:

```js
const dashed = [...document.querySelectorAll("div")].filter((d) => {
  const s = getComputedStyle(d);
  return s.borderTopStyle === "dashed" && s.position === "absolute";
});
const canvas = dashed[0].parentElement;
```

The resize grip is the div with `cursor: ns-resize`.

Drag a box by a point inside it but off its word chips — e.g. 12px in from its
bottom-left corner. Use `mouse.move` in ~20 steps with a short wait between; a
single jump move doesn't cross the 6px threshold that distinguishes a drag from
a click.

## Watch for

Canvas geometry is a feedback loop: node positions are stored as % of the canvas
height, and several layout effects write back into that height. A change here can
easily produce `Maximum update depth exceeded` — always listen for `pageerror`,
and drive an actual drag rather than trusting a static render.
