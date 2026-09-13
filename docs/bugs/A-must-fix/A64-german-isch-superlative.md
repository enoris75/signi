# A64. The German superlative inserts -e- after an unstressed -isch

**Language:** German

`deSuperlativeSuffix` (`languages/de/deSuperlativeSuffix.ts`) adds an epenthetic `-e-` after any stem
ending in a dental or sibilant: `-d`, `-t`, `-s`, `-ß`, `-z` or `-sch`. That is right for a stressed
root (`kältest`, `heißest`, `hübschest`, `frischest`). An unstressed derivational `-isch` takes a
bare `-st`, as in `typischste` and `praktischste`. The rule matches on `-sch` alone.

| | Now | Want |
|---|---|---|
| attributive | `das semantischeste Wort brennt.` | `das semantischste Wort brennt.` |
| predicative | `das Wort wird am semantischesten.` | `das Wort wird am semantischsten.` |

The corpus seeds three `-isch` adjectives: `semantisch`, `singularisch`, `pluralisch`. A present
participle in `-end` gets the same wrong `-e-` (*spannendest* instead of `spannendst`), but no corpus
adjective ends in `-end` today.

## Shape of the fix

Exclude a polysyllabic stem ending in `-isch` (and a participle in `-end`) from the epenthesis in
`deSuperlativeSuffix`. A monosyllabic `-sch` root keeps it. Note the unit test in
`deSuperlativeSuffix.test.ts` pins `hübsch` → `est`, which stays correct.

| | |
|---|---|
| **Test** | `adjectives.test.ts` → *known bugs: German superlative after -isch* (1 `test.fails`) |
