# A222. A modal as the verb of a clause that governs an infinitive

**Languages:** Japanese, German, English

A modal governs a verb group rather than heading one (`VerbPhrase.modals`), which is why it is kept
out of the main-verb picker. A definition can still name one as its genus: "to want to have objects"
is WILL governing an infinitive complement, `infinitiveGloss('WILL', { infinitive: … })`, because the
citation mood drops `modals` (see `resolveVerbPhrase`) and there is no other way to say it.

The engines render that clause as a verb governing an infinitive complement, and for the Romance
four and English WILL that is what a modal is: *volere avere oggetti*, *vouloir avoir des objets*,
*to want to have objects*. For the other modals it is not:

- **Japanese** has no modal verbs; its modals are suffixes (〜たい, 〜ことができる, 〜必要がある).
  [`buildClauseSegments`](../../../packages/engine/src/languages/ja/buildClauseSegments.ts) nominalises
  the complement with こと, marks it with を and then writes the modal's suffix as a word:
  行動することをたい.
- **German** extraposes an infinitive complement as a zu-clause after a comma
  ([`renderClause`](../../../packages/engine/src/languages/de/renderClause.ts): *wünschen, zu
  handeln*). A modal takes the bare infinitive, in the verb cluster: *handeln wollen*.
- **English** cites a verb with "to" + its base. CAN and MUST have no infinitive — their `nonfinite`
  is *be able to* / *have to* — so the citation reads *to can to act*.

| Case | Language | Now | Want |
|---|---|---|---|
| to want to act (WILL + ACT) | Japanese | `行動することをたい。` | `行動したい。` |
| | German | `wollen, zu handeln.` | `handeln wollen.` |
| to want to have objects | Japanese | `物体を持つことをたい。` | `物体を持ちたい。` |
| | German | `wollen, Gegenstände zu haben.` | `Gegenstände haben wollen.` |
| to be able to act (CAN + ACT) | English | `to can to act.` | `to be able to act.` |
| | German | `können, zu handeln.` | `handeln können.` |
| | Japanese | `行動することをことができる。` | `行動することができる。` |
| to be able to have objects | English | `to can to have objects.` | `to be able to have objects.` |
| | German | `können, Gegenstände zu haben.` | `Gegenstände haben können.` |
| | Japanese | `物体を持つことをことができる。` | `物体を持つことができる。` |
| to have to act (MUST + ACT) | English | `to must to act.` | `to have to act.` |
| | German | `müssen, zu handeln.` | `handeln müssen.` |
| | Japanese | `行動することを必要がある。` | `行動する必要がある。` |
| not to want to act | German | `nicht wollen, zu handeln.` | `nicht handeln wollen.` |
| | Japanese | `行動することをたい。` | `行動したくない。` |
| to desire to want to act (governed in turn) | German | `wünschen, zu wollen, zu handeln.` | `wünschen, handeln zu wollen.` |
| | Japanese | `行動することをたいことを望む。` | `行動したいことを望む。` |
| the CAT wanted to have objects (a finite clause) | German | `der Kater wollte, Gegenstände zu haben.` | `der Kater wollte Gegenstände haben.` |
| | Japanese | `猫は物体を持つことをたいいました。` | `猫は物体を持ちたかったです。` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.
The negated Japanese row drops its negation today (`行動することをたい。` for "not to want"), because
the modal written as a word takes no ending.

**Already right.** Italian, French, Spanish and Portuguese, for all three modals (`volere avere
oggetti.`, `pouvoir agir.`, `deber actuar.`, `dever agir.`), and English WILL (`to want to have
objects.`). A lexical governor in every language (`to desire to act.`, `wünschen, zu handeln.`,
`行動することを望む。`). The modal chain a finite clause builds from `modals` (`der Kater wollte
Gegenstände haben.`, `猫は物体を持ちたかったです。`), which is exactly the **Want** for the
modal-headed clause.

**Nothing shipped shows it.** No definition takes a modal as its genus; the gloss that hit it was
written around it.

Found authoring the C23–C28 localization sweep.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine and backend suites green, and no passing test moves.

A modal heading a clause that governs an infinitive is the modal chain over the complement's verb, so
the trial folds it into one:

- [`lexicon.ts`](../../../packages/backend/src/lexicon.ts) hands a verb its concept's `modal` flag
  (`forms['modal'] = '1'`), as it does `stative`.
- A shared `foldModalGovernor(phrase)` returns, for a clause whose verb is a modal and whose infinitive
  complement is subject-controlled and not itself negated, the complement's clause with the modal
  prepended to its `modals` (with the modal's own adverb), the governing clause's tense, mood,
  register, negation and question, and the complement's object, complements and nested infinitive.
  Every other clause comes back as it is.
- English `renderClause`, German `renderClause` and Japanese `buildClauseSegments` call it first.
- Their citation branches render a modal chain, which they never had to: English `predicateParts`
  writes `to` + each modal's `nonfinite` and `link` + the main verb (*to be able to act*); German's
  citation stacks the main infinitive and the modals innermost first, with any "zu" on the last
  (*handeln wollen*, *handeln zu wollen*); Japanese `predicateSegs` closes the citation with
  `modalSegs(…, 'plain')` in place of the plain verb (*行動したい*).

**Decisions for the fixer:**

- **Where the fold lives.** The trial folds in the three engines that need it. Folding once in the
  translator (`resolvePhrase`) is the other shape; it then needs the Romance citations to render a
  modal chain as well (*volere agire* rather than the complement they give today), and
  `resolveVerbPhrase` to keep `modals` under the citation mood.
- **Or the plan.** A citation that keeps `modals` would let a gloss say `infinitiveGloss('ACT',
  { modals: ['WILL'] })` (`GlossParts.modals` exists for the relative glosses). The modal-headed
  clause would still need the fold, since nothing stops a plan from building it.
- **An inner negation.** *to want not to act* cannot be one chain (the chain's negation is the finite
  modal's). The trial leaves it unfolded, so German keeps `wollen, nicht zu handeln` and Japanese
  `行動しないことをたい`. Not pinned.
- **A modal over a modal, by complements.** WILL governing CAN governing ACT folds one level in the
  trial (English `to want to can to act`). Folding recursively gives *to want to be able to act*.
  Not pinned.

| | |
|---|---|
| **Test** | `modals.test.ts` → *known bugs: a modal as the verb of a clause that governs an infinitive (A222)* (1 `test.fails`, plus a regression test for the Romance four, English WILL, a lexical governor and the modal chain) |

## Resolved

**2026-09-22.** Fixed as the **Shape of the fix** describes, with the fold in the three engines that
need it: the Romance four and English WILL rendered the clause right and are not touched. A new shared
[`foldModalGovernor`](../../../packages/engine/src/functions/foldModalGovernor.ts) turns a clause whose
verb carries the lexicon's `modal` flag and governs a subject-controlled, un-negated infinitive into
the complement's clause with the modal (and its own adverb) prepended to the complement's `modals`,
after any modals the governing clause already had. The result keeps the governing clause's subject,
tense, mood, register, negation, question, condition, coordination, purpose and control, and the
complement's verb, voice, adverb, object, agent, complements and nested infinitive; the two clauses'
complements merge. It applies itself to its result, so a modal governing a modal by complements is
one chain: WILL governing CAN governing ACT is *to want to be able to act*, *handeln können wollen*,
行動することができるようになりたい — what `modals: ['WILL', 'CAN']` gives.

English [`renderClause`](../../../packages/engine/src/languages/en/renderClause.ts), German
[`renderClause`](../../../packages/engine/src/languages/de/renderClause.ts) and Japanese
[`buildClauseSegments`](../../../packages/engine/src/languages/ja/buildClauseSegments.ts) call it
first, and their citations render the modal chain they never had to:

- English [`predicateParts`](../../../packages/engine/src/languages/en/predicateParts.ts): `to` + each
  modal's `nonfinite` and `link` + the main verb's group (*to be able to act*, *not to want to act*),
  the main verb's frequency adverb with its own group and the modals' manner adverbs trailing, as in
  the finite chain.
- German: the main infinitive, then the modals innermost first, the last taking any "zu" (*handeln
  wollen*, *handeln zu wollen*). The modals' adverbs lead the main verb's in the Mittelfeld, as in the
  finite clause (*immer handeln wollen*).
- Japanese [`predicateSegs`](../../../packages/engine/src/languages/ja/predicateSegs.ts): the citation
  closes with `modalSegs(…, 'plain')` in place of the plain verb (行動したい, 行動したくない), each modal's
  adverb ahead of the main verb's; a copula predicate under the chain takes the plain ending too
  (幸せでありたい, not 幸せでありたいです).

Left as the trial left them: a negated complement is not folded (German `wollen, nicht zu handeln`,
Japanese `行動しないことをたい`, English `to can not to act`), nor is an object-controlled complement or
a modal with a direct object of its own. The folded clause takes the complement's aspect, which the
citation mood makes neutral, so an aspect on the governing modal itself is not carried: the chain has
no slot for the modal's own aspect (every engine puts a chain's aspect on its main verb).

- **Engine changed:** [`foldModalGovernor.ts`](../../../packages/engine/src/functions/foldModalGovernor.ts)
  (new), [`en/renderClause.ts`](../../../packages/engine/src/languages/en/renderClause.ts),
  [`en/predicateParts.ts`](../../../packages/engine/src/languages/en/predicateParts.ts),
  [`de/renderClause.ts`](../../../packages/engine/src/languages/de/renderClause.ts),
  [`ja/buildClauseSegments.ts`](../../../packages/engine/src/languages/ja/buildClauseSegments.ts),
  [`ja/predicateSegs.ts`](../../../packages/engine/src/languages/ja/predicateSegs.ts). The lexicon's
  `modal` flag landed ahead of the fix, in [`lexicon.ts`](../../../packages/backend/src/lexicon.ts).
- **Tests:** [`modals.test.ts`](../../../packages/engine/test/modals.test.ts) → *known bugs: a modal as
  the verb of a clause that governs an infinitive (A222)*. The pinning `test.fails` is now a passing
  `test` with its assertions unchanged. New cases in the same block:
  - a modal governing a modal by complements (WILL CAN ACT, MUST CAN ACT), one chain in English, German
    and Japanese, and the Romance complement unmoved;
  - what the chain keeps: a negated citation, a negated, a questioned, a future and a conditional
    finite clause, a governing clause's own modal (*the cat must want to act*), the modal's adverb, a
    copula complement and a nested lexical infinitive (*to want to desire to act*).

  Colocated: [`foldModalGovernor.test.ts`](../../../packages/engine/src/functions/foldModalGovernor.test.ts)
  (new), and new cases in [`en/predicateParts.test.ts`](../../../packages/engine/src/languages/en/predicateParts.test.ts),
  [`de/renderClause.test.ts`](../../../packages/engine/src/languages/de/renderClause.test.ts) and
  [`ja/predicateSegs.test.ts`](../../../packages/engine/src/languages/ja/predicateSegs.test.ts).
- **No passing test moved**, and no shipped definition takes a modal as its genus, so no e2e
  expectation changed.
