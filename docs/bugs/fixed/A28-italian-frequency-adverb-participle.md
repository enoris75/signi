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

## Resolved

Fixed 2026-07-16, in [`packages/engine/src/languages/it.ts`](../../../packages/engine/src/languages/it.ts):

- In **`predicateText`**, a **frequency** adverb (`modifier.forms.subtype === 'frequency'` — "sempre",
  "mai") on a **compound perfect** (the resultative, whose verb group is auxiliary + past participle)
  is now inserted between the auxiliary and the participle — `ha SEMPRE mangiato`, `non ha MAI
  mangiato` — instead of appended after the whole group.

The placement is scoped to the resultative-without-a-modal, which is the only Italian verb group that
splits into auxiliary + participle. A **manner** adverb still trails the participle (`ha mangiato
bene`), and a frequency adverb keeps its other positions untouched: after the finite verb in a simple
tense (`mangia sempre`) and after the infinitive in a modal chain (`deve mangiare sempre`) — the two
that a blanket "after the first auxiliary" rule would have broken. It generalises across the compound
tenses (pluperfect `aveva sempre mangiato`, future perfect `avrà sempre mangiato`) and the
essere-perfect, whose participle still agrees with the subject (`la gatta è sempre andata`). This
mirrors the English frequency/manner split (A22); French and German were already correct.

- **Tests:** [`packages/engine/test/verb.test.ts`](../../../packages/engine/test/verb.test.ts)
  → *known bugs: adverb placement*. Both pinning `test.fails` are now passing `test`s, plus added
  cases: the adverb inside the perfect with a direct object (`ha sempre mangiato il topo`), the
  pluperfect and future perfect, the agreeing essere-perfect, and regression guards for the manner
  adverb (with an object), the simple tense, and the modal chain.
