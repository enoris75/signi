# A23. `MUST` + negative flips scope between present and past, and across languages

**Language:** English

Negating `MUST` gives opposite scopes for the same plan — nothing in the plan chose between them
(`negative` is a bare flag). Present is the odd one out; past, German and Japanese all take the
`¬must` (no-obligation) reading.

| | |
|---|---|
| **Now** | present `the cat must not eat.` (prohibition, `must ¬eat`) vs past `the cat did not have to eat.` (`¬must eat`) |
| **Want** | consistent: `the cat does not have to eat.` |
| **Cross-language** | same plan is a prohibition in English (`must not eat`) but permission-to-abstain in German (`muss nicht essen`). Fixing needs a decision about what `negative` scopes over, not a lexeme change. |
| **Test** | `modals.test.ts` → *known bugs: modals* (2 tests) |

## Resolved

Fixed 2026-07-16, in [`packages/engine/src/languages/en.ts`](../../../packages/engine/src/languages/en.ts).

**The decision:** a negated `MUST` scopes as **¬obligation** ("does not have to"), the reading the
past English, German and Japanese already took — not the prohibition ("must not") the present used
to give. This is a scope choice about what `negative` means over an obligation modal, made once and
applied uniformly.

- In **`modalFinite`**, the true-modal-auxiliary "not" placement now excludes the bare word "must"
  (`MODAL_AUX.has(first) && first !== 'must'`). The present "must" therefore falls through to the
  same "have to" do-support the suppletive past/future already use, giving one scope in every tense:
  `does not have to` (present), `did not have to` (past), `will not have to` (future). Every other
  modal is untouched — a negated `CAN` is still the prohibitive `cannot`, and `MUST` as the *inner*
  member of a chain keeps its `have to` citation (`cannot have to eat`), since only the finite
  outermost form is chosen here.

English now agrees with German/Japanese on this plan rather than reading as their opposite.

- **Tests:** [`packages/engine/test/modals.test.ts`](../../../packages/engine/test/modals.test.ts).
  Both pinning `test.fails` (in *known bugs: modals*) are now passing `test`s, plus added cases: the
  ¬obligation scope across all three tenses, plural do-support (`the cats do not have to eat`), and a
  regression guard on `CAN`/inner-`MUST`. Two neighbouring *modals: a pair with negation* / *with an
  adverb* tests carried the old present-tense prohibition surface for a `MUST`-outermost chain
  (`must not be able to eat`); their **English** strings were updated to the corrected ¬obligation
  form (`does not have to be able to eat`) — the same scope fix, one level up. The German/Italian/
  French/Japanese assertions in those tests were already ¬must and are unchanged.
