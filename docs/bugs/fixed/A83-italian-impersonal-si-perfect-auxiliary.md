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

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed, together with A84.
[`aspectVerb.ts`](../../../packages/engine/src/languages/it/aspectVerb.ts) selects `essere` for the
resultative when the subject is generic, whatever the verb's lexical `aux`. Only a lexical `essere`
verb then agrees its participle with the subject; under `si` that agreement is masculine plural
(A84). An `avere` verb keeps the invariable masculine singular (`si è mangiato`), or agrees with a
preceding clitic (`li si è mangiati`).

Every row now renders as wanted. The fix also covers:

- the negative (`non si è mangiato`), a clitic with a frequency adverb (`lo si è sempre visto`, with
  A82's order), and a condition (`se si fosse mangiato`);
- the passive `si` A73 had to leave out. With a plural noun object the compound tense now agrees its
  auxiliary and participle with the patient: [`predicateText.ts`](../../../packages/engine/src/languages/it/predicateText.ts)
  passes the object's agreement to `aspectVerb` (`si sono mangiati i topi`, `si erano mangiate le
  case`). The A73 guard that pinned `si ha mangiato i topi` now asserts that.

A noun subject keeps its lexical auxiliary. An object relative on a plural head in the compound tense
is still not agreed, since the gap's features do not reach `predicateText`. A modal's perfect
infinitive keeps `si deve aver mangiato`.

- **Tests:** [`packages/engine/test/verb.test.ts`](../../../packages/engine/test/verb.test.ts) → *known
  bugs: Italian impersonal si in the compound tense*. The pinning `test.fails` is now a passing `test`.
  New cases cover the negative, the clitic, the adverb and the condition, with a guard for a noun
  subject. The *passive si / se* block gains the agreeing compound tense.
- Unit test: `aspectVerb.test.ts` (it).
