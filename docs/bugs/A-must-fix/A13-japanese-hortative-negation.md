# A13. The 1st-plural hortative negation is dropped

**Language:** Japanese

Japanese negates the 2nd-person command (`食べるな`) but silently drops the negation on the
1st-plural hortative: "let's not eat" → `食べましょう`, which is "let's **eat**", the exact opposite.

| | |
|---|---|
| **Want** | Not the affirmative `食べましょう。` (`〜のはやめましょう` / `食べないでおきましょう` — surface is a design call). |
| **Test** | `imperative.test.ts` → *known bugs: imperative* (1 test) |
