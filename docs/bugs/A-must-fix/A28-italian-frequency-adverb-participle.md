# A28. Frequency adverb placed after the participle, not between auxiliary and participle (Italian)

**Language:** Romance / Iberian coordination

Italian puts a frequency adverb **between** the auxiliary and the past participle. The engine
appends it to the whole group. A **manner** adverb genuinely does follow the participle (`ha
mangiato bene` ✓), so the two classes need telling apart — exactly the English case in A22. French
and German place them properly.

| | Now | Want |
|---|---|---|
| always | `il gatto ha mangiato sempre.` | `il gatto ha sempre mangiato.` |
| never (concord `mai`) | `il gatto non ha mangiato mai.` | `il gatto non ha mai mangiato.` |

| | |
|---|---|
| **Test** | `verb.test.ts` → *known bugs: adverb placement* (2 tests) |
