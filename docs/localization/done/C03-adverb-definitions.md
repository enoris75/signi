# C03. Adverb definitions — the 5 manner/frequency adverbs

**COMPLETE (2026-07-21).** All five adverbs are localized and render in all seven languages. FAST,
SLOWLY, WELL landed 2026-07-20; **ALWAYS and NEVER landed 2026-07-21** once the Japanese
determiner-rendering gap was closed (see "Done — Japanese quantifier render" below). TOGETHER stays
on the English literal by design (see Scope).

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
| ALWAYS | TIME `all` (plural) | at all times | a tutti i tempi | à tous les temps | mit allen Zeiten | a todos los tiempos | すべての時間で | a todos os tempos |
| NEVER | TIME `no` | at no time | a nessun tempo | à aucun temps | mit keiner Zeit | a ningún tiempo | どの時間もない | a nenhum tempo |

SLOWLY's French "basse" (not "base") is correct because bug A43 was fixed before this landed; the
test guards it. ALWAYS/NEVER are authored via a `frequencyGloss('all'|'no', …)` helper in
[adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts); they are **distinct in Japanese**
(すべての時間で vs どの時間もない), which was the whole blocker.

## Done — Japanese quantifier render (2026-07-21)

The unblock: [`npSegs`](../../../packages/engine/src/languages/ja.ts) used to drop **every**
determiner (the words existed only in `JA_DETERMINERS`, wired to the UI menu's `renderDeterminer`),
so `all`/`no` vanished and ALWAYS/NEVER both glossed to the identical, wrong "時間で". The **full
path** was taken (not the gloss-fragment-only shortcut or a Japanese-literal fallback): general NP
determiner rendering **plus** clause-level negative concord. What landed:

1. **Prenominal determiner emission in `npSegs`.** A new `JA_PRENOMINAL_DET` map (この / その /
   いくつかの / 多くの / 少しの / **すべての**) leads the noun phrase; the linking の is part of the value,
   so no extra particle. General to every Japanese NP — articles still render nothing, so only NPs
   that actually set a demonstrative/quantifier change. Gives ALWAYS → **すべての時間で**.

2. **The `no` circumfix どの…も…ない, split by owner.** `JA_NEGATIVE_DETERMINER = { pre: 'どの', post:
   'も' }`: `npSegs` leads with どの and appends も after the head. **も replaces the case particle** (も
   never stacks with が/を/に/で), so a new `isNegativeGroup` guard gates every particle site —
   subject は/が, object を (×3 paths), complement particles, the relative-clause subject が. The
   clause-final ない comes from the predicate:
   - **Verbless gloss fragment (NEVER's tooltip):** `mannerGlossSegs` special-cases a `no` group —
     drops the manner で and closes with ない → **どの時間もない** (どの時間もでない is not Japanese).
   - **Real clause:** a `no` subject/object/complement now forces `negated` in `predicateSegs`
     (reusing the shared [`hasNegativeComplement`](../../../packages/engine/src/types.ts), which
     Japanese referenced nowhere before), so the concord fires — e.g. どの猫もネズミを食べません.

3. **Authored** via a `frequencyGloss` helper in
   [adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts): ALWAYS = `frequencyGloss('all',
   'plural')`, NEVER = `frequencyGloss('no')`.

## Tests

- [manner-gloss.test.ts](../../../packages/engine/test/manner-gloss.test.ts) pins ALWAYS
  すべての時間で and NEVER どの時間もない, asserted *distinct* (the whole point).
- The shared-NP-path change re-pinned the two Japanese determiner-invariance tests to the new,
  correct output:
  [negation.test.ts](../../../packages/engine/test/negation.test.ts) — a `no` object/subject now
  fires the どの…も…ない concord (どの猫もネズミを食べません);
  [complements/determiner.test.ts](../../../packages/engine/test/complements/determiner.test.ts) —
  この / すべての now surface, and `no` → どの家も走りません.
- Full engine suite green (1354 pass).
- [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) adds ALWAYS + NEVER (en + ja)
  e2e cases, asserting the seeded `frequencyGloss` definitions render すべての時間で / どの時間もない in
  the picker tooltip — both pass.

**Scope note.** Steps 1–2 changed how every Japanese noun phrase with a `no` determiner renders and
added clause-level negative concord — deliberately general, not gated to the tooltip. The re-pinned
tests are the regression surface, and they pass.
