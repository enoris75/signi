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

## Resolved

Fixed 2026-07-17, in the three Romance engines that had the mismatch:

- [`it.ts`](../../../packages/engine/src/languages/it.ts): the central `isPlural(forms)` returns
  `false` for a `no`-determined phrase, so every noun rendered through `renderNP` (subject, object,
  complement, modifier) stays singular — `nessun topo`, never `nessun topi`.
- [`es.ts`](../../../packages/engine/src/languages/es.ts) and
  [`pt.ts`](../../../packages/engine/src/languages/pt.ts): a new `isPlural(forms)` helper with the
  same `definiteness !== 'no'` guard, applied at the noun surface (`nounPhrase`), the adjective
  agreement (`esAdj`/`ptAdj`), and the complement-noun rendering.

The Romance negative quantifiers (`nessuno` / `ninguno` / `nenhum`) have no plural, so a requested
plural on a `no` phrase is ignored, and the article, noun and any adjective all agree singular. English
(`no mice`) and German (`keine Mäuse`) pluralise `no` and are untouched; French already forced the
singular (`aucune souris`). (The verb agreement of a `no`-**plural** *subject* is a separate,
unpinned concern — the subject noun singularises correctly, but its verb over-agrees — and is left
out of scope.)

- **Tests:** [`packages/engine/test/negation.test.ts`](../../../packages/engine/test/negation.test.ts)
  → *known bugs: negative determiner with a plural noun*. All three pinning `test.fails` are now
  passing `test`s, plus added cases: a `no`-plural complement staying singular, an adjective agreeing
  singular on a `no`-plural phrase, a regression that English/German pluralise `no` and French keeps
  its singular, and a regression that an ordinary positive plural still pluralises.
