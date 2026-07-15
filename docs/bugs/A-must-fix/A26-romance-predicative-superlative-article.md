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
