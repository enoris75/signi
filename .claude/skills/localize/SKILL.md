---
name: localize
description: Replace a hardcoded UI string with a phrase the engine composes from seeded concepts, rendered in all seven languages. Use when the user says "localize X", "this label should come from the backend", "translate the UI", "no hardcoded strings", or points at literal text in a component.
---

# Localizing a UI string

**Localizing** = removing a hardcoded string from a component and making the UI say it the same way
the app says everything else: as a `PhrasePlan` the engine renders from seeded concepts, in all
seven languages. The literal English text stops being the string and becomes only its `fallback`.

Signi does not have an i18n message file and must not grow one. The UI's own words go through the
grammar engine — that is the point of the product.

## Where things live

| What | Where |
| --- | --- |
| The catalog — every UI string, as a plan | [packages/shared/src/uiStrings.ts](packages/shared/src/uiStrings.ts) |
| Renderer (runs once at boot, serves `GET /api/ui-strings`) | [packages/backend/src/uiStrings.ts](packages/backend/src/uiStrings.ts) |
| The hook the components call | [packages/frontend/src/i18n/useUiString.ts](packages/frontend/src/i18n/useUiString.ts) |

Adding a string means adding **one entry to the catalog**. No new route, fetcher, or hook.

## Steps

1. **Find the hardcoded text** in the component (label, placeholder, tooltip, heading, aria-label).
2. **Check the concepts it needs are seeded.** Every content word in the string must already exist
   in [packages/backend/src/concepts/](packages/backend/src/concepts/). If one is missing, **seed it
   first** — see the `seed` skill — then come back. This is the usual reason a localize task is
   really two tasks.
3. **Add the catalog entry** in `UI_STRINGS`, keyed by area (`slot.*`, `action.*`, `palette.*`,
   `category.*`, `pronoun.*`, `imperative.*`, `language.*`). Keys that a call site indexes
   dynamically must stay parallel, so `t(\`palette.${role}\`)` keeps working. Pick the entry kind:
   - **`plan`** (the usual one) — a `PhrasePlan` the engine renders. Two shorthands already exist in
     the file: `nameOf(CONCEPT)` for a bare noun label, and `commandOf(CONCEPT)` for a control's
     label, which is an imperative in the `instruction` register ("Save" / "Salva" / "保存"). A
     button that acts on something is `commandOf` + a `directObject`; definiteness carries real
     meaning (definite = the thing already in the workspace, indefinite = one the user has yet to
     pick).
   - **`word`** — one lexicon word (or two) that no period can express, e.g. a bare adjective
     ("singular", "male"). Set `agreesWith` to the noun it describes, or the Romance forms come out
     with the wrong gender.
   - **`determiner`** — a determiner value, cited on the noun in `agreesWith`.
   Add `format`: `capitalize` and/or `stripPeriod` (the `NAME_FORMAT` constant is both), and always
   a `fallback` — the English shown while the bundle is in flight.
4. **Write the comment.** Every entry in this file explains *why* the plan is shaped that way and
   what it renders to in a couple of languages. Match that; it is the file's convention, not
   decoration.
5. **Use it in the component**: `const t = useUiString();` then `t('your.key')`. Delete the literal.
   Do not add a fallback `||` at the call site — the catalog entry's `fallback` already covers it.
6. **Verify** — restart the backend (a plan referencing an unseeded concept, or one that fails to
   render in some language, throws on boot by design) and drive the UI. Use the
   `packages/frontend:verify` skill; switch language and confirm the string changes.

## Definition of done

- The literal is gone from the component; the string renders in all seven languages.
- The plan says what the label *means* — a command is an imperative, a section heading is a plural
  noun — rather than being reverse-engineered to make the English come out right.
- Nothing else in the app hardcodes the same text.
