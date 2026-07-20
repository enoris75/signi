# B16. Grammar/word verbs — NAME, DESCRIBE, MODIFY, EXPRESS, REPLACE

_(split out of [B08](../done/B08-verb-definitions.md).)_

These five verbs were seeded to serve the **noun** definitions in
[B06](../done/B06-grammar-words.md) ("a word that names objects", "…that modifies verbs"). This task
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
| NAME | `infinitiveGloss('INDICATE', 'WORD')` | to indicate words | ready — but weak; see note |
| DESCRIBE | `infinitiveGloss('INDICATE', 'QUALITY')` | to indicate qualities | ready (QUALITY ✓) |
| EXPRESS | `infinitiveGloss('INDICATE', 'CONCEPT')` | to indicate concepts | ready (CONCEPT ✓) |
| MODIFY | `infinitiveGloss('CHANGE', 'WORD')` | to change words | ready (WORD ✓) |
| REPLACE | `infinitiveGloss('CHANGE', 'WORD')` | to change words | ⚠ collides with MODIFY |

Two cautions before authoring:

- **NAME** and **REPLACE** both risk glossing identically to a sibling. B06's noun glosses
  distinguish them by clause ("a word that names" vs "a word that replaces"); the bare
  genus+object shape may not. If two verbs in this batch render the same string, leave the weaker
  one on its English literal rather than shipping a duplicate.
- These verbs' picker tooltips are low-traffic (they exist mostly to compose B06's noun glosses), so
  this batch is **low priority** relative to B09–B11.
