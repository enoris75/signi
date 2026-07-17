# A32. A pronoun direct object is rendered as a noun (article + nominative), not cliticised

**Language:** English, Italian, French, Spanish, Portuguese, German (Japanese is correct)

A pronoun in the direct-object slot ("the cat sees **me**") is routed through the noun-phrase
renderer, so it is given an **article** and kept in its **nominative citation form**. It should
take no article and use the object form — and in Romance it is a **proclitic** that moves in front
of the finite verb. Japanese is correct (を on the oblique pronoun, no article, no clitic movement);
the other six are all wrong the same way.

| | Now | Want |
|---|---|---|
| English (1sg) | `the cat sees the I.` | `the cat sees me.` |
| Italian (1sg) | `il gatto vede l'io.` | `il gatto mi vede.` |
| French (1sg) | `le chat voit le je.` | `le chat me voit.` |
| Spanish (1sg) | `el gato ve el yo.` | `el gato me ve.` |
| Portuguese (1sg) | `o gato vê o eu.` | `o gato me vê.` (BP proclitic) |
| German (3sg m) | `der Kater sieht den er.` | `der Kater sieht ihn.` |

**Root:** a pronoun head in an object slot takes the determiner + citation-form path instead of a
pronoun-object path (oblique form, no determiner, Romance clitic movement). Subject pronouns are
fine — the defect is specific to the object slot.

| | |
|---|---|
| **Test** | `objectPronoun.test.ts` → *known bugs: object pronoun* (7 tests) |

## Resolved

Fixed 2026-07-17, as a corpus + shared-helper + six-engine change:

- **Corpus** — [`packages/backend/src/concepts/pronouns.ts`](../../../packages/backend/src/concepts/pronouns.ts):
  each pronoun gained its **object** (accusative / clitic) forms — `object`, plus `object_plural` /
  `object_fem` / `object_neut` where they differ. English "me/us/you/him/her/it/them"; German the
  accusative "mich/dich/ihn/…" (distinct from the dative disjunctive "mir/dir/ihm"); Romance the
  proclitics (it "mi/ti/lo/la/ci/vi/li", fr "me/te/le/la/nous/vous/les", es "me/te/lo/la/nos/os/los",
  pt "me/te/o/a/nos/vos/os").
- **Shared** — [`packages/engine/src/types.ts`](../../../packages/engine/src/types.ts):
  `objectPronounForm(forms)` picks the object surface by number/gender (the object counterpart of the
  subject citation form), and `isPronounElement(el)` flags a single-pronoun object slot.
- **English** [`en.ts`](../../../packages/engine/src/languages/en.ts) / **German**
  [`de.ts`](../../../packages/engine/src/languages/de.ts): a pronoun direct object renders as its
  object form with no article, post-verbally — "the cat sees me", "der Kater sieht ihn".
- **Romance** [`it.ts`](../../../packages/engine/src/languages/it.ts),
  [`fr.ts`](../../../packages/engine/src/languages/fr.ts),
  [`es.ts`](../../../packages/engine/src/languages/es.ts),
  [`pt.ts`](../../../packages/engine/src/languages/pt.ts): the clitic moves to a **proclitic** before
  the finite verb ("il gatto mi vede"), inside the negator where present ("non/ne … pas/no/não me …")
  via a per-language cliticize helper; French elides `me/te/le/la` → `m'/t'/l'` before a vowel-initial
  verb ("m'ajoute"). Italian encliticises on the imperative ("guardami").

A noun direct object is untouched (article + post-verbal position), and Japanese was already correct.

- **Tests:** [`packages/engine/test/objectPronoun.test.ts`](../../../packages/engine/test/objectPronoun.test.ts)
  → *known bugs: object pronoun*. All seven pinning `test.fails` (the six per-language paradigms plus
  the no-article guard) are now passing `test`s, plus added cases: negation composing with the clitic
  across all six, French vowel-elision of the clitic, the neuter third person object, and a regression
  that a noun object is unchanged.
| **Correct today** | `objectPronoun.test.ts` → *object pronoun: Japanese* (を-marking, all persons) |
