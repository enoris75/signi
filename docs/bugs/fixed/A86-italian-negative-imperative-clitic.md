# A86. The Italian negative tu command glues the clitic onto the whole infinitive

**Language:** Italian

The negative `tu` command is `non` + the infinitive (`non mangiare`). `predicateText`
(`languages/it/predicateText.ts`) builds the command as `impForm + objectClitic`, so an object
pronoun sticks to the full infinitive, final `-e` included. The clitic can attach to an
infinitive only after that `-e` drops (`mangiarlo`). The infinitive-mood branch a few lines lower
already does this (`inf.replace(/e$/, '')`). The instruction register goes through the same line.

| Command | Now | Want |
|---|---|---|
| EAT + THIRD_PERSON | `non mangiarelo.` | `non mangiarlo.` |
| SEE + FIRST_PERSON | `non vederemi.` | `non vedermi.` |
| GIVE + THIRD_PERSON, to the dog | `non darelo al cane.` | `non darlo al cane.` |
| EAT + THIRD_PERSON, instruction | `non mangiarelo.` | `non mangiarlo.` |

The proclitic order (`non lo mangiare`) is equally standard, and the pin accepts it. Already
right: the affirmative (`mangialo`) and the negative `noi` / `voi` (`non mangiamolo`, `non
mangiatelo`).

## Shape of the fix

When the imperative form is the negative-`tu` infinitive, drop its final `-e` before appending
the clitic, as the infinitive branch does. Or put the clitic before the infinitive after `non`.

| | |
|---|---|
| **Test** | `imperative.test.ts` → *known bugs: Italian negative tu command with an object pronoun* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 with the first shape the fix proposed: the enclitic form, not the proclitic. The new
[`itEnclitic.ts`](../../../packages/engine/src/languages/it/itEnclitic.ts) joins a clitic to its host
verb. An `infinitive` host drops its final `-e`, and a contracted `-rre` drops its last `re`. In
[`predicateText.ts`](../../../packages/engine/src/languages/it/predicateText.ts), the imperative branch
uses it for the negative `tu`, the one person whose command is the infinitive. The instruction register
takes the same path. The infinitive-mood branch now uses the helper too, in place of its inline
`replace(/e$/, '')`.

Every row now renders as wanted: `non mangiarlo.`, `non vedermi.`, `non darlo al cane.`, and the
instruction's `non mangiarlo.`. The fix also covers every clitic (`non vederti`, `non vederle`, the A86
case the catalogue noted) and a frequency adverb (`non mangiarlo mai`). The affirmative (`mangialo`) and
the negative `voi` (`non mangiatelo`) are unchanged.

- **Tests:** [`packages/engine/test/imperative.test.ts`](../../../packages/engine/test/imperative.test.ts)
  → *known bugs: Italian negative tu command with an object pronoun*. The pinning `test.fails` is now a
  passing `test`. New cases cover the other clitics and the adverb, with a guard for the affirmative and
  the negative `voi`.
- Unit tests: the new `itEnclitic.test.ts`, and `predicateText.test.ts` (it).
