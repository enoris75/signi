# B51. DETERMINER — seed SPECIFY: a word that specifies nouns

_(split out of [C05](../done/C05-non-distinguishing-genera.md) on 2026-09-21. "A word that indicates
nouns" already rendered, but a determiner does not indicate a noun: it fixes which thing the noun
refers to. C05 asked for a verb for fixing reference.)_

## Seed first

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| SPECIFY | verb, transitive | to identify exactly | specify | specificare | préciser | bestimmen | especificar | 特定する | especificar |

- **German** *bestimmen* is the grammar's own verb. Articles are *Bestimmungswörter*, and the definite
  one is the *bestimmter Artikel*.
- **French** *préciser*, the everyday word, over *spécifier*.
- **Japanese** 特定する is a suru compound.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| DETERMINER | `whoGloss('WORD', 'SPECIFY', 'NOUN')` | a word that specifies nouns |

It stays apart from its neighbours: ADJECTIVE is "a word that describes nouns"
([B06](../done/B06-grammar-words.md)), MODIFIER "a word that modifies other words"
([A18](../done/A18-grammar-nouns.md)), and QUANTIFIER, its child, "a determiner that indicates
quantities" ([B39](../done/B39-quantity-and-category.md)).

### Probe renders (2026-09-21, engine source at HEAD, SPECIFY through a lookup wrapper, nothing seeded)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| DETERMINER | a word that specifies nouns | una parola che specifica sostantivi | un mot qui précise des noms | ein Wort, das Substantive bestimmt | una palabra que especifica sustantivos | 名詞を特定する単語 | uma palavra que especifica substantivos |

### Rejected: INDICATE, no seed

| en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|
| a word that indicates nouns | una parola che indica sostantivi | un mot qui indique des noms | ein Wort, das Substantive bezeichnet | una palabra que indica sustantivos | 名詞を示す単語 | uma palavra que indica substantivos |

It renders, but INDICATE is the verb for what a word stands for ([B31](../done/B31-complement-genus.md):
"a complement that indicates places"). Read that way, the gloss says a determiner stands for nouns.

ARTICLE and DEMONSTRATIVE stay in C05. This gives them a genus with a gloss, but no differentia:
what sets them apart, identifiability and pointing, are grammar terms themselves.

## Coverage

Add DETERMINER to [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts), in
English and German (ein Wort, das Substantive bestimmt).
