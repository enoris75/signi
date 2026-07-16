# A26. Predicative superlative has no article — collapses onto the comparative

**Language:** French / Romance comparison

The **attributive** superlative homophony (`il gatto più grande` = bigger/biggest) is legitimate:
the noun's definite article does the work. A **predicative** adjective has no article to borrow, so
the superlative must supply its own. Without it, "most" simply says "more". German (`am
glücklichsten` vs `glücklicher`) and English prove the distinction is real.

| | Now | Want |
|---|---|---|
| Italian | `il gatto sembra più felice.` (= more) | `il gatto sembra il più felice.` |
| French | `le chat semble plus heureux.` | `le chat semble le plus heureux.` |
| Spanish | `el gato parece más feliz.` | `el gato parece el más feliz.` |
| least | (= less) | `il gatto sembra il meno felice.` |

Plus a guard: Romance `most` must not be word-for-word identical to `more`.

| | |
|---|---|
| **Test** | `complements/predicative.test.ts` → *known bugs: predicative degree* (5 tests) |

## Resolved

Fixed 2026-07-16, across the four Romance engines and one shared helper:

- **Shared** — [`packages/engine/src/types.ts`](../../../packages/engine/src/types.ts): a new
  `isRelativeSuperlative(a)` predicate ("most"/"least"), the degrees that — predicatively — need
  their own article.
- **Each Romance engine's `predicative` branch** now, for an adjective head in a superlative degree,
  prepends the subject-agreeing definite article to the degree phrase:
  [`it.ts`](../../../packages/engine/src/languages/it.ts) `il/la/i/le più|meno …`,
  [`fr.ts`](../../../packages/engine/src/languages/fr.ts) `le/la/les plus|moins …`,
  [`es.ts`](../../../packages/engine/src/languages/es.ts) `el/la/los/las más|menos …`,
  [`pt.ts`](../../../packages/engine/src/languages/pt.ts) `o/a/os/as mais|menos …`. The comparative
  (more/less) is untouched and stays article-less.

The attributive superlative was already correct — there the noun's own definite article does the
work ("il gatto più grande"). A predicate adjective has no article to borrow, so it supplies its own,
which is what distinguishes `sembra il più felice` (most) from `sembra più felice` (more). German and
English already made this distinction.

- **Tests:** [`packages/engine/test/complements/predicative.test.ts`](../../../packages/engine/test/complements/predicative.test.ts)
  → *known bugs: predicative degree*. All five pinning `test.fails` are now passing `test`s, plus
  added cases: the full Portuguese pair (`o mais/menos feliz`), the lowered superlative in French and
  Spanish, feminine agreement of the article + adjective across all four (`la … più/plus/más felice/
  heureuse/feliz`, `a … mais feliz`), plural agreement (`i gatti … i più felici`, `los gatos … los
  más felices`), and a regression guard that the comparative predicative still takes no article.
