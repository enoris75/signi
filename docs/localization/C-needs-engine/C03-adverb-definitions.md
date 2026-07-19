# C03. Adverb definitions — the 5 manner/frequency adverbs

**Blocked on:** a **`mannerGloss` render mode** — a verbless-fragment gloss that wraps a manner noun
phrase in the adposition its head noun's `mannerRelation` selects ("at high speed", "in a good way",
"at all times"). This is the manner counterpart of C02's `dimensionGloss`, and shares C02's
verbless-period scaffolding, so **C02 should land first.**

## Scope — 5 adverbs, not 6

Functionally, every C03 adverb is a **simple adverb**: a single lexical word in the `VerbPhrase.modifier`
slot ("runs fast", "runs together"), *not* an adverbial-of-manner complement. C03 is only about their
**definition tooltips**, and there the six split:

- **`mannerGloss` candidates (5):** FAST, SLOWLY, WELL, ALWAYS, NEVER. Their definitions paraphrase
  as a prep + noun phrase, which is structurally the manner-adverbial shape the construct renders.
- **Simple adverbs that stay literal by design (excluded):** TOGETHER (and ALONE, not yet seeded).
  Their meaning is comitative/reciprocal ("with each other") — there is **no dimension/manner noun**
  to hang under an adposition, so no engine-composed gloss exists. They keep their literal
  `description` ("with each other, in company"). This is a **finished** state, not a deferral.

## What already exists (the construct is mostly assembled)

- **Manner-phrase adposition rendering** — done (commits "feat/fix: adverbial of manner"). Every
  engine renders a manner noun phrase with the right per-language adposition, driven by the head
  noun's `mannerRelation`: `similative`→like/come/wie, `means`→with/con/mit, `measure`→at/a→alla/à,
  `mode`→in/de/auf. See `packages/engine/test/complements/manner.test.ts`.
- **Verbless-fragment pattern** — C02's `dimensionGloss` (a bare NP rendered as a standalone
  prepositional fragment, no subject/verb). `mannerGloss` mirrors it, selecting the adposition via
  `mannerRelation` instead of `dimensionRelation`.
- **Nouns:** SPEED, WAY, CARE, TIME all seeded (SPEED/WAY as `measure`/`mode` manner nouns; TIME as a
  `measure` noun for "at all times"/"at no time", seeded 2026-07-18).

## What's left to build

1. `mannerGloss?: boolean` on `NounPhrase` (shared) and `ResolvedNounPhrase` (engine types); thread
   through the translator (one line beside `dimensionGloss`).
2. A `mannerGloss()` fn + `isMannerGloss` guard + a verbless-period branch in each of the **7
   engines**, beside the existing `if (!verbPhrase && isDimensionGloss(...))`. Reuse each engine's
   existing manner-prep + determiner-contraction logic (extract it from the inline complement path).
3. **The one new wrinkle — NEVER = "at no time":** it uses `definiteness: 'no'` on TIME, which in a
   clause triggers negative concord (forces `non`/`ne…pas`/`nicht` onto the finite verb). A verbless
   fragment has no verb to negate, so it must render "at no time" / "a nessun tempo" / "à aucun
   moment" as a plain fragment with no stray preverbal negator. Needs a targeted test.

Effort: roughly half of C02, mostly spread across the 7 engines (a helper extraction, a flag, a
verbless branch echoing C02).

## Blocks

FAST ("at high speed"), SLOWLY ("at low speed"), WELL ("in a good way"), ALWAYS ("at all times"),
NEVER ("at no time") — 5 adverbs, buildable via `mannerGloss` once C02 lands. TOGETHER stays on the
English literal by design (see Scope).

Lowest priority: 5 concepts, high per-concept engine cost. Stay on the English literal until C02
lands and `mannerGloss` is built.
