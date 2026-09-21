# B51. DETERMINER — seed SPECIFY: a word that specifies nouns

_(split out of [C05](C05-non-distinguishing-genera.md) on 2026-09-21. "A word that indicates
nouns" already rendered, but a determiner does not indicate a noun: it fixes which thing the noun
refers to. C05 asked for a verb for fixing reference. **Done 2026-09-21**, as planned: see
[Done](#done-2026-09-21).)_

## Seed first

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| SPECIFY | verb, transitive | to identify exactly | specify | specificare | préciser | bestimmen | especificar | 特定する (とくていする) | especificar |

Seeded as proposed, beside MODIFY among the grammar-word verbs of
[verbs/transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts#L5936), its non-finite
forms beside MODIFY's in [verbs/nonfinite.ts](../../../packages/backend/src/concepts/verbs/nonfinite.ts#L862).

- **German** *bestimmen* is the grammar's own verb. Articles are *Bestimmungswörter*, and the definite
  one is the *bestimmter Artikel*.
- **French** *préciser*, the everyday word, over *spécifier*.
- **Japanese** 特定する is a suru compound.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| DETERMINER | `whoGloss('WORD', 'SPECIFY', 'NOUN')` | a word that specifies nouns |

It stays apart from its neighbours: ADJECTIVE is "a word that describes nouns"
([B06](B06-grammar-words.md)), MODIFIER "a word that modifies other words"
([A18](A18-grammar-nouns.md)), and QUANTIFIER, its child, "a determiner that indicates
quantities" ([B39](B39-quantity-and-category.md)).

### Probe renders (2026-09-21, the seeded word and definition, lexicon seeded in memory, engine source)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| DETERMINER | a word that specifies nouns | una parola che specifica sostantivi | un mot qui précise des noms | ein Wort, das Substantive bestimmt | una palabra que especifica sustantivos | 名詞を特定する単語 | uma palavra que especifica substantivos |

The same as the ticket's wrapper probe.

### Rejected: INDICATE, no seed

Re-probed 2026-09-21:

| en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|
| a word that indicates nouns | una parola che indica sostantivi | un mot qui indique des noms | ein Wort, das Substantive bezeichnet | una palabra que indica sustantivos | 名詞を示す単語 | uma palavra que indica substantivos |

It renders, but INDICATE is the verb for what a word stands for ([B31](B31-complement-genus.md):
"a complement that indicates places"). Read that way, the gloss says a determiner stands for nouns.

ARTICLE and DEMONSTRATIVE stay in C05. This gives them a genus with a gloss, but no differentia:
what sets them apart, identifiability and pointing, are grammar terms themselves.

## Coverage

DETERMINER in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts), in
English and German (ein Wort, das Substantive bestimmt).

## Done (2026-09-21)

**DETERMINER → "a word that specifies nouns"**, the plan above, on its seed block in
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts#L2685). The backend renders it in all
seven languages at boot.

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| DETERMINER | a word that specifies nouns | una parola che specifica sostantivi | un mot qui précise des noms | ein Wort, das Substantive bestimmt | una palabra que especifica sustantivos | 名詞を特定する単語 | uma palavra que especifica substantivos |

The verb:

| | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| SPECIFY, present | the word specifies the noun | la parola specifica il sostantivo | le mot précise le nom | das Wort bestimmt das Substantiv | la palabra especifica el sustantivo | 単語は名詞を特定します | a palavra especifica o substantivo |
| SPECIFY, past | the word specified the noun | la parola specificò il sostantivo | le mot précisa le nom | das Wort bestimmte das Substantiv | la palabra especificó el sustantivo | 単語は名詞を特定しました | a palavra especificou o substantivo |
| SPECIFY, passive | the nouns are specified by the word | i sostantivi sono specificati dalla parola | les noms sont précisés par le mot | die Substantive werden vom Wort bestimmt | los sustantivos son especificados por la palabra | 名詞は単語に特定されます | os substantivos são especificados pela palavra |

What landed differently from the plan:

1. **Nothing in the plan.** SPECIFY took the proposed forms, and the definition rendered exactly as
   the wrapper probe had it. QUANTIFIER, DETERMINER's child, already said "a determiner that
   indicates quantities" (B39); it keeps INDICATE, which is right for it: a quantifier does say how
   many.

- Seeds: [verbs/transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts) and
  [verbs/nonfinite.ts](../../../packages/backend/src/concepts/verbs/nonfinite.ts) (SPECIFY),
  [nouns.ts](../../../packages/backend/src/concepts/nouns.ts) (DETERMINER's `definition`).
- Tests: SPECIFY in the Italian resultative table of
  [verb.test.ts](../../../packages/engine/test/verb.test.ts) (*la gatta ha specificato*); its tenses,
  persons, negative and passive, and the gloss, in
  [definition-words.test.ts](../../../packages/engine/test/definition-words.test.ts); en + de in
  [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts).
