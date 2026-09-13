# A48. German du-imperative drops the -e (and the e→i) nine seeded verbs need

**Language:** German

`deImperativeWord` builds the du-imperative as the infinitive minus its `-(e)n` (`laufen` → `lauf`,
`gehen` → `geh`). Verbs that need more are patched one by one in `DE_IMPERATIVE`
(`languages/de/de.consts.ts`), keyed by concept id. That covers the strong e→i/ie verbs EAT, READ
and SEE, the suppletive BE and KNOW, and SAVE, LOAD, ADD, EXPORT, IMPORT, COORDINATE, SELECT and
CLEAR, whose stems keep the `-e`. Because it is a list rather than a rule, any seeded verb that needs
the same treatment and isn't listed falls through to the bare stem. A sweep of all 56 seeded verbs
finds nine:

| Verb | Now | Want | Why |
|---|---|---|---|
| CUT | `schneid.` | `schneide.` | stem in -d keeps the -e |
| BECOME | `werd.` | `werde.` | stem in -d keeps the -e |
| KILL | `töt.` | `töte.` | stem in -t keeps the -e |
| HOLD | `enthalt.` | `enthalte.` | stem in -t keeps the -e |
| COMPACT | `verdicht.` | `verdichte.` | stem in -t keeps the -e |
| TIDY_UP | `ordn.` | `ordne.` | consonant + n keeps the -e |
| EXPAND | `erweiter.` | `erweitere.` | -ern keeps the -e |
| EXPRESS | `vermittel.` | `vermittle.` | -eln drops the stem's e and keeps the -e |
| GIVE | `geb.` | `gib.` | strong e→i, like EAT/READ/SEE |

Left out on purpose: bare stems where the `-e` is optional in standard German (`lauf`, `konsumier`,
`besitz`, `lösch`). SELECT, ADD and CLEAR carry the `-e` form in the table, so the product may still
want consistency, but the bare forms are not wrong.

## Shape of the fix

Derive the regular cases by rule instead of listing them:

- add `-e` after a stem in `-d`/`-t`;
- add `-e` after a consonant other than l/r/m/n/h followed by `m`/`n` (`ordn` → `ordne`, `atm` →
  `atme`, but `komm`, `beginn`);
- `-ern` → `-ere`, `-eln` → `-le`.

For the strong e→i/ie verbs, seed the du-imperative on the lexeme, the way `participle` is seeded.
Deriving it from `2sg_present` is fiddly for s-stems (`liest` → `lies`, `isst` → `iss`) and must not
carry the a→ä change (`fährst` → `fahr`). Either way, most of `DE_IMPERATIVE` goes away.

| | |
|---|---|
| **Test** | `imperative.test.ts` → *known bugs: German du-imperative forms* (1 `test.fails`) |
