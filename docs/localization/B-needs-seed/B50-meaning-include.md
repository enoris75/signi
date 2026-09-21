# B50. HYPERNYM — seed MEANING and INCLUDE: a word whose meaning includes another word's meaning

_(split out of [C05](../done/C05-non-distinguishing-genera.md) on 2026-09-21. C05 named both words
and the genitive relative, which shipped with [C12](../done/C12-ui-purpose-and-object-complements.md),
and did not probe them. The gloss is HYPERNYM's own seed description, word for word.)_

## Seed first

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| MEANING | noun | what a word expresses | meaning | significato | sens | Bedeutung | significado | 意味 | significado |
| INCLUDE | verb, transitive | to have as a part | include | includere | inclure | umfassen | incluir | 含む | incluir |

- **German** *umfassen*, not *einschließen*: it is what a broader term does to a narrower one (*der
  Oberbegriff umfasst …*), and it is inseparable, so the relative clause ends on one word. HOLD
  already has *enthalten*.
- **French** *sens* is invariable: *le sens*, *les sens*.
- **Japanese** 含む is godan: 含まれる, 含んで, 含まない.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| HYPERNYM | inline, below | a word whose meaning includes another word's meaning |

```ts
definition: {
  subject: {
    concept: 'WORD',
    definiteness: 'indefinite',
    relative: {
      headRole: 'possessor',
      subject: { concept: 'MEANING', definiteness: 'definite' },
      verbPhrase: { verb: 'INCLUDE' },
      directObject: {
        concept: 'MEANING',
        definiteness: 'definite',
        possessor: { concept: 'WORD', definiteness: 'indefinite', adjectives: ['OTHER'] },
      },
    },
  },
},
```

### Probe renders (2026-09-21, engine source at HEAD, both words through a lookup wrapper, nothing seeded)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| HYPERNYM | a word whose meaning includes another word's meaning | una parola il cui significato include il significato di un'altra parola | un mot dont le sens inclut le sens d'un autre mot | ein Wort, dessen Bedeutung die Bedeutung eines anderen Wortes umfasst | una palabra cuyo significado incluye el significado de otra palabra | 意味が別の単語の意味を含む単語 | uma palavra cujo significado inclui o significado de outra palavra |

The indefinite OTHER merges as each language wants: en *another*, it *un'altra*, fr *un autre*, de
*eines anderen*, and es and pt drop the article (*de otra palabra*).

The plural possessor also renders: "a word whose meaning includes other words' meanings", it *i
significati di altre parole*, de *die Bedeutungen anderer Wörter*. The singular is shorter and
matches the seed description.

## Coverage

Add HYPERNYM to [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts), in
English and German (ein Wort, dessen Bedeutung die Bedeutung eines anderen Wortes umfasst).
