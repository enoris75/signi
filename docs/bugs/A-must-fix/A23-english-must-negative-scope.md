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
