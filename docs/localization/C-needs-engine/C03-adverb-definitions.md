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

## Feature — Japanese quantifier render (the unblock)

The determiner *words* already exist. [`JA_DETERMINERS`](../../../packages/engine/src/languages/ja.ts)
maps `all → すべての`, `no → どの…もない`, plus the demonstratives and `some`/`many`/`few` — but they
are wired only to the UI determiner menu (`renderDeterminer`). The sentence path
([`npSegs`](../../../packages/engine/src/languages/ja.ts)) **drops every determiner**, which is why
`all`/`no` vanish from the gloss. Two of the three steps are small; the third is the real design call.

1. **Emit the prenominal quantifier in `npSegs`.** Add a leading segment for the determiner word when
   it is a plain prenominal form (この / その / いくつかの / 多くの / 少しの / **すべての**) — the `の` is
   already part of the attributive value, so it needs no extra particle. This alone gives ALWAYS →
   **すべての時間で**. It is a **general** change to Japanese NP rendering, so it is scoped by a
   decision: emit quantifiers for *every* Japanese noun phrase (articles still render nothing, so
   only NPs that actually set a demonstrative/quantifier change), or gate the emission to the gloss
   fragment. Prefer the general form — it is the correct behaviour everywhere — but it means
   re-pinning any existing Japanese sentence that carries a demonstrative/quantifier determiner.

2. **Pin ALWAYS.** With step 1, `TIME` + `all` + `mannerGloss` → すべての時間で. Add it to
   [manner-gloss.test.ts](../../../packages/engine/test/manner-gloss.test.ts) and author the
   `definition` in [adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts).

3. **NEVER needs a different shape — `no` is not prenominal in Japanese.** Its value どの…もない is a
   **circumfix**: どの 時間 も … ない — a leading どの, a も on the noun, and a clause-final ない. A
   verbless manner fragment has no verb to host the ない, so the quantifier path cannot render "at no
   time" the way it renders "at all times". Options, cheapest first:
   - **Japanese literal fallback for NEVER only** — keep its stored `description` in Japanese
     (決して…ない is the natural frequency adverb) and let the other six use `mannerGloss`. Smallest
     change; NEVER's tooltip is then not engine-composed in Japanese, which the definitions API
     already supports (per-language fallback).
   - **A dedicated frequency-gloss** — a small construct that renders どの時間も + a fragment-final
     ない (どの時間もない), sidestepping the manner path for the negative frequency case. More faithful,
     more engine work, and needs its own guard so the ない never leaks into a real clause.

   Decide 3 before authoring NEVER; steps 1–2 (ALWAYS) can land independently.

Tests: after step 1, run the whole Japanese suite — the determiner emission touches the shared NP
path, so any existing pin with a demonstrative/quantifier must be re-pinned to the engine's new
(correct) output.

### Plan for step 3 — NEVER's negative-frequency gloss (どの時間もない)

Target: NEVER → **どの時間もない**, distinct from ALWAYS's すべての時間で.

**The precedent that makes this tractable.** Japanese already realises negation as a word-final ない
that behaves like an **い-adjective** — `jaComparisonAdj`'s `negate()` turns 大きい → 大きくない, and
every downstream position (attributive, adverbial, copula) then handles it by the ordinary
い-adjective machinery. So a verbless fragment ending in ない is well-formed in exactly the way the
dimension gloss's 速さが高い is. The circumfix also **splits by owner**:

- the **noun phrase** contributes どの … も
- the **predicate** contributes ない

That split is the whole design; each half goes where it belongs.

1. **Split the circumfix in `JA_DETERMINERS`.** Today `no: 'どの…もない'` is a single display string for
   the UI menu. Sentence rendering needs the halves separately — a prenominal どの and a post-head
   も. Add a structured entry (or a dedicated `JA_NEGATIVE_DETERMINER = { pre: 'どの', post: 'も' }`)
   and leave the menu string untouched so `renderDeterminer` is unchanged.

2. **Emit どの … も in `npSegs`**, alongside step 1's prenominal quantifiers: どの leads the
   adjectives/head, も follows the head noun. **The one invasive bit:** も *replaces* the case
   particle the NP would otherwise take — Japanese does not stack も with が/を — so every site that
   appends a particle after `elSegs(...)` (`{ t: 'を' }`, the subject's が/は, the complement
   particles) must skip it when the NP is negative. Audit those call sites together; they are the
   regression surface.

3. **Supply the ない from the right host** — two cases:
   - **Verbless gloss fragment (the NEVER case).** Special-case a `no` head in ja's
     `mannerGlossSegs`: render どの + noun + も + ない and **drop the manner で** — the negative
     existential replaces the manner adverbial, and どの時間もでない is not Japanese. Yields どの時間もない.
   - **Real clause.** The predicate already has the machinery: mirror `groupHasNegativeAdverb` by
     letting a `no`-determiner NP force `negated` in the verb-phrase builder, so the existing
     決して…ない concord fires (どの時間も食べない). The shared
     [`hasNegativeComplement`](../../../packages/engine/src/types.ts) helper already detects
     `definiteness === 'no'` for complements — Italian drives its `non` off it — and **Japanese
     references none of it today**, so this is genuinely new ja behaviour.

4. **Pin it.** In [manner-gloss.test.ts](../../../packages/engine/test/manner-gloss.test.ts): NEVER →
   どの時間もない and ALWAYS → すべての時間で, asserted as *distinct* (the whole point). Add clause-level
   Japanese pins for a `no` subject/object too, since step 3's concord is new behaviour, not just a
   gloss detail.

5. **Author NEVER** in [adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts) once Japanese
   is distinct, and move both adverbs into the Done table above.

**Scope control.** Steps 2–3 reach beyond the tooltip: they change how every Japanese noun phrase
with a `no` determiner renders, and add clause-level negative concord. If that is more than this task
should carry, gate steps 2–3 to the **gloss fragment only** and file the clause-level `no` concord as
its own engine task — NEVER's tooltip is the deliverable here, and the fragment path can special-case
どの…も…ない without touching `npSegs`. The cheaper fallback (a Japanese literal for NEVER alone)
stays available if neither is worth the spend.
