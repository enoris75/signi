# P17-E3. The console's preview on a phone — seeing what the line will build

**Feature:** while typing in the phone's console tab, the user sees what the line under the caret
will build, without switching tabs.
**Shape:** a decision on the open question, then either nothing or a compact result line in the
console tab.
**Scope:** frontend. Resolves one of the plan's open questions.
**Status:** open. Filed 2026-09-27 from the plan's "Where the console's preview shows".

## Why

On desktop the console is docked under the canvas, so the canvas previews every keystroke. On a
phone the canvas is a tab away from the prompt, and switching to it drops the soft keyboard.

## Today

Verified at HEAD (37b533a9), 2026-09-27.

- The prompt keeps its preview line, the sentence the line being typed would make
  ([`ConsolePrompt.tsx`](../../../../packages/frontend/src/console/ConsolePrompt.tsx), reading
  `model.preview`).
- The result strip, the phrase in the UI language, shows above the canvas and the Phrase view only
  ([`App.tsx:307`](../../../../packages/frontend/src/App.tsx#L307),
  [`ResultStrip.tsx`](../../../../packages/frontend/src/components/ResultStrip.tsx)); it shows the
  committed workspace, not the preview.

## Design

### D1. Decide

Try the console tab on a real phone (with E1's fixes, if any) composing three phrases of increasing
size, one with a relative clause. Record whether the preview line alone is enough to catch a mistake
before ↵.

### D2. If not: the strip follows the preview

Show `ResultStrip` at the top of the console tab too, fed the preview's containers while there is a
preview and the committed ones otherwise, styled as the preview line already marks a preview. Tapping
it opens Translations, as it does above the canvas. No new UI strings.

## Tests

If D2 ships: a `mobile.spec` case typing `/subj cat` in the console tab and reading the strip before ↵.

## Verification

D1's notes, recorded in this file under *Done*.

## Out of scope

A preview of the canvas itself in the console tab.

## Done

Built 2026-09-27: D2, ahead of D1.

- **A correction to *Today*.** The prompt has no line of its own showing the sentence being built:
  `ConsolePrompt.tsx` draws the context chip, the field, the key hints and a diagnostic. The one
  place the app marks a preview is the translations panel (`translation-preview`: a dashed
  primary-coloured tag reading `status.preview`), so that is the mark the strip borrows.
- **What shipped.** On the phone's console tab, [`ResultStrip`](../../../../packages/frontend/src/components/ResultStrip.tsx)
  sits at the top, above the console (the tab is now a flex column: strip, then the console). It is
  fed `results`, which already follow the line: the translations are asked for the preview's
  containers after a 200 ms pause (`useDebounced`) and the committed ones otherwise. While those are
  the preview's (`previewingTranslations`, what the panel's tag keys on), the strip's edge turns
  dashed and it carries the same `status.preview` tag (`data-testid="result-strip-preview"`). While
  a new sentence is being fetched it keeps the last one, so the strip doesn't blink out and push the
  console up and down between keystrokes. A tap opens Translations, as above the canvas. The strip
  above the canvas and the Phrase view takes the same `preview` flag. No new UI strings.
- **Tests.** `mobile.spec.ts` › the console command bar › "shows what the line will build above it":
  types `/subj cat` in the console tab, reads *the cat.* with the preview tag before ↵, then the same
  sentence unmarked after it, and a tap opening Translations. Screenshot at 390 px:
  `scratchpad/p17-e3-console-preview.png`.
- **D1 — owed.** Deciding on a real phone whether this is needed at all (three phrases, one with a
  relative clause, with E1's fix in). If the call there is that the strip is noise, removing it is
  one element in `App.tsx`'s console tab.
