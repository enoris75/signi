# C03. Adverb definitions — the 5 manner/frequency adverbs

**Render mode landed (2026-07-20): `mannerGloss` is built.** FAST, SLOWLY, and WELL are localized
and rendered in all seven languages. ALWAYS and NEVER are now blocked on a **narrower** gap —
Japanese has no NP determiner rendering, so their `all`/`no` quantifier vanishes and the two collapse
to an identical, meaningless "時間で". TOGETHER stays on the English literal by design (see Scope).

## The construct — `mannerGloss` (done)

A verbless-fragment gloss that wraps a manner noun phrase in the adposition its head noun's
`mannerRelation` selects — the manner counterpart of C02's `dimensionGloss`. Unlike the dimension
gloss it **keeps the determiner** (the article is not stripped), so the phrase's own `definiteness`
supplies "a good way" / "all times" / "no time".

- `NounPhrase.mannerGloss` (shared) + `ResolvedNounPhrase.mannerGloss` (engine types), threaded
  through the translator beside `dimensionGloss`.
- A `mannerGloss()` fn + `isMannerGloss` guard + a verbless-period branch in each of the **7
  engines**, reusing each engine's existing manner-prep + determiner-contraction path (the same
  selection the `manner` complement makes: `measure`→at/a→alla/à/mit, `mode`→in/de/auf, etc.).
  German leads with the bare preposition and lets `elementPhrase` supply the determiner (auf/mit/wie
  don't fuse); Japanese closes with the manner particle で (never が).
- Pinned in all seven languages: [manner-gloss.test.ts](../../../packages/engine/test/manner-gloss.test.ts).
- The **NEVER wrinkle** the brief flagged — `definiteness: 'no'` triggering negative concord — does
  **not** fire: a verbless fragment has no finite verb to negate, so "at no time" / "a nessun tempo"
  / "à aucun temps" / "mit keiner Zeit" render as plain fragments (pinned in the test).

## Scope — 5 adverbs, not 6

Every C03 adverb is a **simple adverb** (a single word in `VerbPhrase.modifier` — "runs fast"); C03
is only about their **definition tooltips**. Of the six:

- **`mannerGloss` (5):** FAST, SLOWLY, WELL, ALWAYS, NEVER — definitions paraphrase as prep + noun
  phrase.
- **Literal by design (excluded):** TOGETHER (and ALONE, not yet seeded) — comitative/reciprocal
  ("with each other"), **no** manner noun to hang under an adposition. Keeps its literal
  `description`. A **finished** state, not a deferral.

## Done — FAST, SLOWLY, WELL (2026-07-20)

Added a `mannerGloss(noun, definiteness, ...adjectives)` helper and a `definition` plan to the three
adverbs in [adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts). Backend boots clean;
every definition renders in all 7 languages. e2e coverage: FAST (en + de) and WELL (en + fr) in
[definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts), via a new `openVerbAdverb`
fixture helper.

Rendered strings (engine is source of truth):

| concept | plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| FAST | SPEED `bare` + HIGH | at high speed | a velocità alta | à vitesse haute | mit hoher Geschwindigkeit | a velocidad alta | 高い速さで | a velocidade alta |
| SLOWLY | SPEED `bare` + LOW | at low speed | a velocità bassa | à vitesse basse | mit niedriger Geschwindigkeit | a velocidad baja | 低い速さで | a velocidade baixa |
| WELL | WAY `indefinite` + GOOD | in a good way | in un buon modo | d'une bonne manière | auf eine gute Weise | de una manera buena | 良い方法で | de uma maneira boa |

SLOWLY's French "basse" (not "base") is correct because bug A43 was fixed before this landed; the
test guards it.

## Remaining — ALWAYS, NEVER (blocked on Japanese determiner rendering)

Both compose cleanly via `mannerGloss` on TIME (`measure` → "at") with a quantifier determiner, and
render correctly in **six** languages:

| concept | plan | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|---|
| ALWAYS | TIME `all` (plural) | at all times | a tutti i tempi | à tous les temps | mit allen Zeiten | a todos los tiempos | a todos os tempos | ⚠ 時間で |
| NEVER | TIME `no` | at no time | a nessun tempo | à aucun temps | mit keiner Zeit | a ningún tiempo | a nenhum tempo | ⚠ 時間で |

**The blocker:** Japanese has no articles, and its NP render path (`npSegs`) emits **no determiner**
at all — so the `all` / `no` quantifier is dropped and both ALWAYS and NEVER gloss to the identical,
wrong "時間で" ("at time"). Shipping two opposite adverbs with the same Japanese definition is a real
quality regression, so they are **held**. Unblocking needs a Japanese quantifier-determiner render
(e.g. すべての for `all`; a negative for `no` — which Japanese does not express prenominally, so it may
need a different frequency-gloss shape). The other six languages are ready the moment Japanese is.

Lowest priority: 2 concepts, blocked on a Japanese-only construct.
