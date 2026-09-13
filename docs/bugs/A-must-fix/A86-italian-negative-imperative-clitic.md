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
