---
name: verify
description: Build, run and drive the Signi frontend in a real browser to observe a change working end-to-end.
---

# Verifying a Signi frontend change

The surface is pixels: Signi is a React/MUI canvas app. Drive it in a browser and measure the
DOM. Typecheck (`npx tsc --noEmit -p tsconfig.json` in `packages/frontend`) is not
verification — it only rules out the cheapest class of mistake.

## The suite

There is a Playwright suite at the repo root (`e2e/`). **Run it first** — it covers the
translation round trip, the interface-language switch, the canvas controls, and the save/load
round trip:

```bash
npm test                       # whole suite, headless
npm test -- e2e/canvas.spec.ts # one spec
npm test -- --ui               # pick and watch tests run
npm test -- --headed --debug   # step through with a visible browser
```

`playwright.config.ts` starts everything itself: the backend on **:3101** against a
**throwaway database it seeds from source** (`e2e/serveBackend.ts`), and vite on **:5273**. It
never touches the dev servers on :5173/:3001 or `packages/backend/signi.db`, so it is safe to
run while the user has their own `npm run dev` going. Nothing to set up, nothing to clean up.

If the change is covered by a spec, extending that spec **is** the verification — and it stays
behind to catch the regression next time. Prefer that over a throwaway script.

(If you do need the dev servers: `npm run dev` from the root starts both. They may already be
running from the user's own session. **Never `pkill -f concurrently` or blanket-kill by port** —
that takes down their server. Kill only the PID you started.)

## Driving it

`e2e/fixtures.ts` holds the `Builder` page object. Use it — it already encodes the traps below.

```ts
import { test, expect } from './fixtures';

test('…', async ({ app, page }) => {
  await app.buildClause('CAT', 'EAT');      // subject → verb, canvas painted
  await app.setDirectObject('MOUSE');
  expect(await app.sentence('de')).toBe('der Kater isst die Maus.');
});
```

Traps it handles for you, each of which cost a session to find:

- **Words are named by concept id** (`CAT`, `EAT` — the uppercase English lemma), never by typed
  text. Enter takes the *highlighted* option, which is the first substring match: typing `eat`
  and pressing Enter selects **BEAT**. And clicking an option by its visible text hits the
  off-screen word palette, which holds the same words. `app.pick` clicks the row carrying the
  concept id.
- **Slot inputs are found by `data-testid`** (`typeahead-subject`, `-verb`, `-noun`), not by
  placeholder: placeholders are engine-rendered UI strings and change with the interface
  language. (They also use a unicode ellipsis, so a `...` match never hits.)
- **`localStorage` leaks between runs** — canvas height lives at `signi:graphHeight`.
  `app.goto()` clears it, after the first load: it can't be cleared on `about:blank`.
- **Furigana corrupts `innerText`**: Japanese readings are `<rt>` inside `<ruby>`, so raw text
  reads 猫ねこは食べますたべます. `app.sentence('ja')` strips them; `app.furigana('ja')` asserts them.
- **Dragging needs a stepped pointer sequence** — movement under a 6px threshold is treated as a
  click, so one jump move does nothing. `app.dragGroup()` grabs 12px in from the box's
  bottom-left (inside the dashed box, clear of the word chips) and moves in 20 steps.
- **Tidy converges, it does not canonicalise in one pass**: the first click collapses the canvas
  to its tidy height while still positioning groups against the *old* height, so it lands a few
  px short, and a second click settles it. `app.tidy()` clicks until the layout stops moving.
- **MUI tooltips overwrite accessible names**: a `Tooltip` around a bare button injects an
  `aria-label`, so the header's Load button is named "Load a saved phrase", not "Load" — while
  Save, wrapped in a `<span>` for its disabled state, keeps its text name.

## Test hooks in the app

Add a `data-testid` rather than keying on computed style or MUI internals. The ones that exist:

| hook | where |
| --- | --- |
| `typeahead-subject` / `-verb` / `-noun` | the slot pickers' inputs |
| `typeahead-option` + `data-concept` | a row in any picker's dropdown |
| `group-box` + `data-group` | a role group's dashed box ("Subject", "Verb Phrase", "Direct Object") |
| `period-compact-toggle` + `data-compact` | the compact/expand control |
| `period-tidy` | the tidy wand |
| `translation-<lang>` → `sentence` | a rendered translation line |
| `translations-empty` | the panel's empty state |

The resize grip has no test id yet — it is the div with `cursor: ns-resize`.

## Watch for

Canvas geometry is a feedback loop: node positions are stored as % of the canvas height, and
several layout effects write back into that height. A change here can easily produce
`Maximum update depth exceeded`. The `page` fixture **fails any test on an uncaught page
error**, which is what catches this — a broken canvas still leaves a DOM standing, so a spec
that only asserts on elements would sail past it. Drive a real drag rather than trusting a
static render.
