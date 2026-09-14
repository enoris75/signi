# B16. Grammar/word verbs — NAME, DESCRIBE, MODIFY, EXPRESS, REPLACE

_(split out of [B08](B08-verb-definitions.md).)_

These five verbs were seeded to serve the **noun** definitions in
[B06](B06-grammar-words.md) ("a word that names objects", "…that modifies verbs"). This task
gives the verbs themselves tooltips. Their differentiae — WORD, NOUN, VERB, OBJECT_THING — are all
already seeded, so several are plain `infinitiveGloss` with **no builder change**.

## Seed first (1–2 verbs)

| concept | role | gloss | note |
|---|---|---|---|
| INDICATE | verb, transitive | to point out; to signify | genus for NAME, DESCRIBE, EXPRESS |
| CHANGE | verb, transitive | to make different | genus for MODIFY, REPLACE |

## Unlocks

| verb | plan | gloss (en) | status |
|---|---|---|---|
| NAME | `infinitiveGloss('INDICATE', 'WORD', 'plural')` | to indicate words | ready — but weak; see note |
| DESCRIBE | `infinitiveGloss('INDICATE', 'QUALITY', 'plural')` | to indicate qualities | ready (QUALITY ✓) |
| EXPRESS | `infinitiveGloss('INDICATE', 'CONCEPT', 'plural')` | to indicate concepts | ready (CONCEPT ✓) |
| MODIFY | `infinitiveGloss('CHANGE', 'WORD', 'plural')` | to change words | ready (WORD ✓) |
| REPLACE | `infinitiveGloss('CHANGE', 'WORD', 'plural')` | to change words | ⚠ collides with MODIFY |

Two cautions before authoring:

- **NAME** and **REPLACE** both risk glossing identically to a sibling. B06's noun glosses
  distinguish them by clause ("a word that names" vs "a word that replaces"); the bare
  genus+object shape may not. If two verbs in this batch render the same string, leave the weaker
  one on its English literal rather than shipping a duplicate.
- These verbs' picker tooltips are low-traffic (they exist mostly to compose B06's noun glosses), so
  this batch is **low priority** relative to B09–B11.

## Done

**2026-09-14.** Seeded **INDICATE** and **CHANGE** in [transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts). Four
of the five verbs are authored.

| concept | role | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| INDICATE | verb | indicate | indicare | indiquer | bezeichnen | indicar | 示す | indicar |
| CHANGE | verb | change | cambiare | changer | ändern | cambiar | 変える | mudar |

| verb | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| NAME | to indicate objects with words | indicare oggetti con parole | indiquer objets avec mots | Gegenstände mit Wörtern bezeichnen | indicar objetos con palabras | 単語で物体を示す | indicar objetos com palavras |
| DESCRIBE | to indicate qualities | indicare qualità | indiquer qualités | Qualitäten bezeichnen | indicar calidades | 質を示す | indicar qualidades |
| EXPRESS | to indicate concepts | indicare concetti | indiquer concepts | Begriffe bezeichnen | indicar conceptos | 概念を示す | indicar conceitos |
| MODIFY | to change qualities | cambiare qualità | changer qualités | Qualitäten ändern | cambiar calidades | 質を変える | mudar qualidades |

Resolving the two duplicate-gloss cautions:
- **NAME** takes an instrument, "to indicate objects with words", so it no longer collides with
  DESCRIBE or EXPRESS.
- **MODIFY** glosses on QUALITY, "to change qualities", not WORD. That is the sense the grammar
  nouns use ("a word that modifies verbs"), and it pairs with DESCRIBE's "to indicate qualities".
- **REPLACE stays literal.** Its sense ("to take the place of") is neither CHANGE nor INDICATE, and
  every composable shape duplicated a sibling. It is listed in
  [C05](../C-needs-engine/C05-non-distinguishing-genera.md).

Word choices:
- German INDICATE is the inseparable *bezeichnen*. *anzeigen* and *hinweisen* are separable.
- Portuguese CHANGE is *mudar*.
- Spanish QUALITY is the lexicon's *calidad*, the grade sense seeded for GOOD. The attribute sense
  would be *cualidad*, so es DESCRIBE and MODIFY read slightly off.

Pinned by [genus-verbs.test.ts](../../../packages/engine/test/genus-verbs.test.ts), [verb.test.ts](../../../packages/engine/test/verb.test.ts) and [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) (NAME
en+ja, DESCRIBE en+fr, EXPRESS en+es, MODIFY en+de).
