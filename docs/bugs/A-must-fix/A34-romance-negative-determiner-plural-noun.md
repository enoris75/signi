# A34. A `no` phrase over-pluralises the noun in Romance

**Language:** Italian, Spanish, Portuguese

A `no`-determined phrase with `number: 'plural'` pluralises the noun but leaves the determiner
singular, giving an agreement mismatch — `nessun topi` (singular `nessun` + plural `topi`). The
Romance negative quantifiers (`nessuno` / `ninguno` / `nenhum`) are singular-only, so a `no` phrase
must stay singular whatever number is requested. English pluralises correctly (`no mice`) and German
too (`keine Mäuse`); only Italian / Spanish / Portuguese produce the mismatch.

| | Now | Want |
|---|---|---|
| Italian | `il gatto non mangia nessun topi.` | `il gatto non mangia nessun topo.` |
| Spanish | `el gato no come ningún ratones.` | `el gato no come ningún ratón.` |
| Portuguese | `o gato não come nenhum ratos.` | `o gato não come nenhum rato.` |

**Root:** a `no` determiner must force the noun phrase singular in it/es/pt (the quantifier has no
plural), rather than letting the requested `number` pluralise the noun independently of the
determiner. Not specific to the object slot — the object is simply where it was first exercised.

| | |
|---|---|
| **Test** | `negation.test.ts` → *known bugs: negative determiner with a plural noun* (3 tests) |
