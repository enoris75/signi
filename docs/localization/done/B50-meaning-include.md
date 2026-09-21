# B50. HYPERNYM — seed MEANING and INCLUDE: a word whose meaning includes another word's meaning

_(split out of [C05](C05-non-distinguishing-genera.md) on 2026-09-21. C05 named both words
and the genitive relative, which shipped with [C12](C12-ui-purpose-and-object-complements.md),
and did not probe them. The gloss is HYPERNYM's own seed description, word for word. **Done
2026-09-21**, as planned: see [Done](#done-2026-09-21).)_

## Seed first

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| MEANING | noun | what a word expresses | meaning | significato | sens | Bedeutung | significado | 意味 (いみ) | significado |
| INCLUDE | verb, transitive | to have as a part | include | includere | inclure | umfassen | incluir | 含む (ふくむ) | incluir |

Seeded as proposed: MEANING beside WORD in
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts#L1438), INCLUDE beside HOLD in
[verbs/transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts#L1429), its
non-finite forms beside HOLD's in
[verbs/nonfinite.ts](../../../packages/backend/src/concepts/verbs/nonfinite.ts#L244).

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

### Probe renders (2026-09-21, the seeded words and definition, lexicon seeded in memory, engine source)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| HYPERNYM | a word whose meaning includes another word's meaning | una parola il cui significato include il significato di un'altra parola | un mot dont le sens inclut le sens d'un autre mot | ein Wort, dessen Bedeutung die Bedeutung eines anderen Wortes umfasst | una palabra cuyo significado incluye el significado de otra palabra | 意味が別の単語の意味を含む単語 | uma palavra cujo significado inclui o significado de outra palavra |

The same as the ticket's wrapper probe. The indefinite OTHER merges as each language wants: en
*another*, it *un'altra*, fr *un autre*, de *eines anderen*, and es and pt drop the article (*de otra
palabra*).

The plural possessor, re-probed with the words seeded:

| en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|
| a word whose meaning includes other words' meanings | una parola il cui significato include i significati di altre parole | un mot dont le sens inclut les sens d'autres mots | ein Wort, dessen Bedeutung die Bedeutungen anderer Wörter umfasst | una palabra cuyo significado incluye los significados de otras palabras | 意味が別の単語の意味を含む単語 | uma palavra cujo significado inclui os significados de outras palavras |

It renders too. The singular is shorter, matches the seed description, and is the one Japanese does
not flatten (the plural is the same 別の単語の意味).

## Coverage

HYPERNYM in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts), in English and
German (ein Wort, dessen Bedeutung die Bedeutung eines anderen Wortes umfasst).

## Done (2026-09-21)

**HYPERNYM → "a word whose meaning includes another word's meaning"**, the plan above, inline on
its seed block in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts#L2651). The backend
renders it in all seven languages at boot.

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| HYPERNYM | a word whose meaning includes another word's meaning | una parola il cui significato include il significato di un'altra parola | un mot dont le sens inclut le sens d'un autre mot | ein Wort, dessen Bedeutung die Bedeutung eines anderen Wortes umfasst | una palabra cuyo significado incluye el significado de otra palabra | 意味が別の単語の意味を含む単語 | uma palavra cujo significado inclui o significado de outra palavra |

The two words:

| | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| MEANING, a / the plural | a meaning / the meanings | un significato / i significati | un sens / les sens | eine Bedeutung / die Bedeutungen | un significado / los significados | 意味 | um significado / os significados |
| INCLUDE, present | the word includes the meaning | la parola include il significato | le mot inclut le sens | das Wort umfasst die Bedeutung | la palabra incluye el significado | 単語は意味を含んでいます | a palavra inclui o significado |
| INCLUDE, past | the word included the meaning | la parola includeva il significato | le mot incluait le sens | das Wort umfasste die Bedeutung | la palabra incluía el significado | 単語は意味を含んでいました | a palavra incluía o significado |
| INCLUDE, passive | the houses are included by the word | le case sono incluse dalla parola | les maisons sont incluses par le mot | die Häuser werden vom Wort umfasst | las casas son incluidas por la palabra | 家は単語に含まれています | as casas são incluídas pela palavra |

What landed differently from the plan:

1. **INCLUDE is a state verb** (`stative: true`), as HOLD is: the Romance past is the imperfect
   (*includeva*, *incluait*, *incluía*), and a Japanese main clause says the state with 〜ている
   (含んでいます). The ticket did not say. The gloss is untouched: a relative clause keeps the plain
   含む.
2. **A French defect the probe found, outside this gloss.** A participle that ends in *-s* doubles
   it in the masculine plural: *les sens sont **incluss** par le mot*. It is not INCLUDE's: the
   seeded *compris* and *acquis* do the same (*les mots sont compriss*, *acquiss*). The feminine is
   right (*incluses*), and HYPERNYM's gloss is active, so nothing shipped here shows it. Reported for
   the bug catalogue, not filed from this ticket.

- Seeds: [nouns.ts](../../../packages/backend/src/concepts/nouns.ts) (MEANING; HYPERNYM's
  `definition`), [verbs/transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts) and
  [verbs/nonfinite.ts](../../../packages/backend/src/concepts/verbs/nonfinite.ts) (INCLUDE).
- Tests: INCLUDE in the Italian resultative table of
  [verb.test.ts](../../../packages/engine/test/verb.test.ts) (*la gatta ha incluso*); MEANING, INCLUDE's
  tenses, persons, negative and passive, and the gloss in
  [definition-words.test.ts](../../../packages/engine/test/definition-words.test.ts); en + de in
  [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts).
