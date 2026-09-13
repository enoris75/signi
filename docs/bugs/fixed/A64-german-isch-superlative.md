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

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed.
[`deSuperlativeSuffix.ts`](../../../packages/engine/src/languages/de/deSuperlativeSuffix.ts) takes a
bare `-st` after a stem of more than one syllable ending in `-isch` or `-end`, where the final
syllable is unstressed. A monosyllabic root keeps the `-e-` (`frischest`, `hübschest`, `kältest`).

Both rows now render as wanted. The other seeded `-isch` adjectives follow (`singularischste`,
`pluralischste`), as do a plural and a dative (`die semantischsten Wörter`, `im semantischsten Haus`).
The comparative is unchanged (`semantischere`). No seeded adjective ends in `-end`, so that case is
covered by the unit test only.

- **Tests:** [`packages/engine/test/adjectives.test.ts`](../../../packages/engine/test/adjectives.test.ts)
  → *known bugs: German superlative after -isch*. The pinning `test.fails` is now a passing `test`.
  New cases:
  - the other `-isch` adjectives, a plural and a dative;
  - a guard for `kälteste` and the comparative.
- Unit test: `deSuperlativeSuffix.test.ts` (`semantisch`, `typisch`, `spannend`, and `frisch` keeping
  its `-e-`).
