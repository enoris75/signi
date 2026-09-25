# A380. A superlative's set beside a possessor stacks two genitives in German and Portuguese

**Languages:** German, Portuguese

[A371](../fixed/A371-attributive-superlative-drops-its-set.md) gave an attributive superlative its set
and put it where the comparative's standard goes, after a possessor. German and Portuguese say the set
with a genitive, so beside a noun possessor two genitives stack and the set reads as the possessor's:
"das größte Haus der Frau der Stadt" is *the biggest house of the woman of the city*.

| Case | Now | Want |
|---|---|---|
| de: the MAN SEEs the WOMAN's biggest HOUSE in the CITY | `der Mann sieht das größte Haus der Frau der Stadt.` | `der Mann sieht das größte Haus der Frau in der Stadt.` |
| pt | `o homem vê a maior casa da mulher da cidade.` | `o homem vê a maior casa da mulher na cidade.` |
| de, as the subject of BURN | `das größte Haus der Frau der Stadt brennt.` | `das größte Haus der Frau in der Stadt brennt.` |
| pt | `a maior casa da mulher da cidade arde.` | `a maior casa da mulher na cidade arde.` |

The **Want** column is written by hand. `least` stacks the same way (`das am wenigsten große Haus der
Frau der Stadt`).

**Decision for the fixer:** the set as a place (pinned: *in der Stadt*, *na cidade*, English's own
"in the city"), or the set ahead of the possessor. Only beside a noun possessor; without one the
genitive set stays (`das größte Haus der Stadt`, `a maior casa da cidade`).

**Already right.** English `the woman's biggest house in the city`. Swiss German says the possessor with
the dative, `de Frau ires gröschtes Huus de Stadt`, so nothing stacks.

**Not filed with it.** Japanese 都市の中で最も大きい女の家 lets the superlative attach to 女, the same
ambiguity A372 set aside for より. Italian, French and Spanish *la casa della donna più grande della
città* can read *più grande* as the woman's where the two nouns share a gender; that is A372's ruled order.

**Found by** the A371 lane (2026-09-25).

| | |
|---|---|
| **Test** | `comparison.test.ts` → *known bugs: a superlative's set beside a possessor stacks two genitives in de / pt (A380)* (1 `test.fails`: object and subject; plus a regression test for the set without a possessor and English) |

## Resolved

2026-09-25. **Decision: the set as a place.** Behind a noun (genitive) possessor, a superlative's set
is said with the locative preposition, as English's own "in the city"; without one it stays genitive.

- **German** [de/nounStandard.ts](../../../packages/engine/src/languages/de/nounStandard.ts): *in* + dative,
  fused as a locative is (`das größte Haus der Frau in der Stadt`, `im Markt`, `in den Märkten`, `in
  einem Markt`). `least` follows (`das am wenigsten große Haus der Frau in der Stadt`). A set holding a
  pronoun keeps its *von* (`von mir`), which stacks nothing; a comparative's *als* is untouched.
- **Portuguese** [pt/ptAdj.ts](../../../packages/engine/src/languages/pt/ptAdj.ts): the prenominal
  superlative's trailing set takes *em*, contracted (`a maior casa da mulher na cidade`, `no mercado`,
  `nos mercados`, `em um mercado`). A post-nominal superlative (`a casa da mulher mais velha da cidade`)
  keeps A372's order, which this bug set aside.

Swiss German, which says the possessor in the dative, keeps its own `nounStandard` and is unchanged.

Guarded by `comparison.test.ts` → *known bugs: a superlative's set beside a possessor stacks two
genitives in de / pt (A380)*: the former `test.fails`, now a plain test, a new test for `least`, a
masculine, plural and indefinite set and a dative phrase, a comparative regression, and the original
regression. Colocated cases are in `de/nounStandard.test.ts` and `pt/ptAdj.test.ts`. A371's two
Portuguese pins (`… da mulher da cidade …`) moved to *na cidade*.
