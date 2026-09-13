# A83. The Italian impersonal "si" takes "avere" in the compound tense

**Language:** Italian

The impersonal `si` always takes `essere` in the compound tenses, whatever auxiliary the verb takes
on its own: `si è mangiato`, `si è corso`. `aspectVerb` (`languages/it/aspectVerb.ts`) picks the
auxiliary only from the verb's lexical `aux` (`verbForms['aux'] === 'be'`) and never checks the
generic subject. So every `avere` verb stays on `avere` under `si`.

| Clause | Now | Want |
|---|---|---|
| EAT, resultative | `si ha mangiato.` | `si è mangiato.` |
| RUN, resultative | `si ha corso.` | `si è corso.` |
| EAT + MOUSE, resultative | `si ha mangiato il topo.` | `si è mangiato il topo.` |
| EAT, resultative past | `si aveva mangiato.` | `si era mangiato.` |

Already right: an `essere` verb's auxiliary (`si è andato`, whose participle is the separate
plural-agreement defect), and the simple tenses (`si mangia`).

## Shape of the fix

In the resultative branch, select `essere` when `subjectForms['generic'] === '1'`. Only an
`essere`-selecting verb should then agree its participle in the plural (`si è andati`). An
`avere` verb keeps the invariable masculine singular (`si è mangiato`). A plural object turns this
into the passive `si` (`si sono mangiati i topi`), which also depends on the plural-object defect.

| | |
|---|---|
| **Test** | `verb.test.ts` → *known bugs: Italian impersonal si in the compound tense* (1 `test.fails`) |
