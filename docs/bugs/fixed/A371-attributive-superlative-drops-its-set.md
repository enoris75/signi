# A371. An attributive superlative drops its set

**Languages:** all seven

P09-E19 gave a superlative a set to pick from: on `most` / `least` the standard of comparison is the
set, "the house is the biggest **in the city**". The predicate says it in all seven. The same set on
an attributive adjective (`adjectiveStandards` on a superlative, which P09-E51 lets the canvas build as
the noun's *Comparison set*) reaches no language: the noun phrase renders as if it had none.
"the man sees the biggest house in the city" becomes "the man sees the biggest house."

| Case | Now | Want |
|---|---|---|
| en | `the man sees the biggest house.` | `the man sees the biggest house in the city.` |
| it | `l'uomo vede la casa più grande.` | `l'uomo vede la casa più grande della città.` |
| fr | `l'homme voit la maison la plus grande.` | `l'homme voit la maison la plus grande de la ville.` |
| de | `der Mann sieht das größte Haus.` | `der Mann sieht das größte Haus der Stadt.` |
| es | `el hombre ve la casa más grande.` | `el hombre ve la casa más grande de la ciudad.` |
| ja | `男は最も大きい家を見ます。` | `男は都市の中で最も大きい家を見ます。` |
| pt | `o homem vê a maior casa.` | `o homem vê a maior casa da cidade.` |

The **Want** column is written by hand, not rendered by a fix: each is the predicate's own set (below)
moved after the attributive noun phrase, or before it in Japanese. `least` drops the set the same
way ("the man sees the least big house.").

**Already right.** The predicate superlative: `the house is the biggest in the city.`, `la casa è la
più grande della città.`, `das Haus ist das größte der Stadt.`, `家は都市の中で最も大きいです。`
An attributive comparative keeps its standard ("a bigger cat than the dog", P09-E18).

**Found by** P09-E51's D4, which left the attributive set out of the canvas task for want of this, and
re-probed at c8f098dc.

**Decision for the fixer:** where the set goes against a possessor or a relative clause on the same
noun, which A372 raises for the comparative's standard.

| | |
|---|---|
| **Test** | `comparison.test.ts` → *known bugs: an attributive superlative drops its set (A371)* (1 `test.fails`: the object in all seven; plus a regression test pinning the predicate's set) |

## Resolved

2026-09-25. The set of an attributive superlative now reaches every language, in the predicate's
words (P09-E19), at the place the attributive comparative's standard takes.
[resolveAdjectiveStandard.ts](../../../packages/engine/src/translator/functions/resolveAdjectiveStandard.ts)
accepts `most` and `least` beside the comparatives and the equative, and
[resolveNounPhrase.ts](../../../packages/engine/src/translator/functions/resolveNounPhrase.ts) marks
that adjective `domain: '1'` instead of `standard: '1'`, so each language's standard renderer says its
set word (in / of, di, de, the genitive, de, de, の中で). `least` follows: "the least big house in the
city".

**The decision for the fixer** (set against a possessor or a relative clause) was ruled: Romance
writes noun + possessor + adjective + set + relative clause, as A372 does for the standard.
[it/renderNP.ts](../../../packages/engine/src/languages/it/renderNP.ts) now also puts the possessor
first beside a superlative that carries a set (*la casa della donna più grande della città*); French
and Spanish take it from A372's [possessorBeforeStandard.ts](../../../packages/engine/src/functions/possessorBeforeStandard.ts).
[pt/ptAdj.ts](../../../packages/engine/src/languages/pt/ptAdj.ts) writes the set of a prenominal
suppletive superlative (A178) after the noun, *a maior casa da cidade*, and beside a possessor only the
set follows it (*a maior casa velha da mulher da cidade*). English keeps its Saxon genitive, "the
woman's biggest house in the city"; German puts the genitive set after the noun and its possessor,
where the standard goes; Japanese puts 都市の中で before the adjective. Swiss German (gsw/) shares
de's `nounStandard` and the translator change, so it says the set too, as its predicate does (*s
gröscht Huus de Stadt*).

Guarded by `comparison.test.ts` → *known bugs: an attributive superlative drops its set (A371)*: the
former `test.fails`, now a plain test, the predicate regression test, and new tests for `least`, the
subject, a prepositional complement, a possessor with a relative clause, and Portuguese's plain
adjective beside the prenominal superlative. The P09-E18 pin *a standard on a positive or a
superlative adjective is dropped* now covers `positive` only. Swiss German is pinned in
`test/languages/gsw.test.ts` → *A371: an attributive superlative keeps its set*. Unit tests in
`resolveAdjectiveStandard.test.ts`, `it/renderNP.test.ts` and `pt/ptAdj.test.ts`.

**Left open.** Two genitives stack in German beside a noun possessor, "das größte Haus der Frau der
Stadt", which can read as *the woman of the city*; Portuguese's prenominal *maior* leaves "a maior casa
da mulher da cidade" with the same stacking; and Japanese 都市の中で最も大きい女の家 lets the adjective
reach 女, as A372 noted for より. Each follows the ruling's placement; a different wording is a new
decision.
