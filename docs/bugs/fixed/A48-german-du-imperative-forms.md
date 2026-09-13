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

## Resolved

Fixed 2026-09-13, by deriving the regular du forms with a rule and storing the irregular ones on the
lexeme, as the shape of the fix proposed:

- [`deImperativeWord.ts`](../../../packages/engine/src/languages/de/deImperativeWord.ts): a form
  the lexeme stores as `<pn>_imperative` wins. Otherwise the new `deDuImperative` derives du from
  the infinitive. It starts from the bare stem (`lauf`, `komm`, `lern`, `wohn`). It adds `-e` after
  a stem in `-d`/`-t` (`schneide`, `töte`, `enthalte`, `verdichte`, `werde`, `lade`), and after a
  consonant + `m`/`n` other than l/r/m/n or a lengthening h (`ordne`, `atme`, `rechne`). It maps
  `-ern` → `-ere` (`erweitere`, `speichere`) and `-eln` → `-le` (`vermittle`). The rule reads only
  `base`, so the a→ä of the 2sg present never carries over (`schlag`, `lauf`). The function no longer
  takes a concept id, and [`renderClause.ts`](../../../packages/engine/src/languages/de/renderClause.ts)
  calls it without one.
- [`de.consts.ts`](../../../packages/engine/src/languages/de/de.consts.ts): `DE_IMPERATIVE` is gone.
- The German lexemes in
  [`verbs/transitive.ts`](../../../packages/backend/src/concepts/verbs/transitive.ts),
  [`verbs/ditransitive.ts`](../../../packages/backend/src/concepts/verbs/ditransitive.ts) and
  [`verbs/motion.ts`](../../../packages/backend/src/concepts/verbs/motion.ts) now store the forms the
  rule cannot give:
  - the strong e→i/ie verbs: EAT `iss`, READ `lies`, SEE `sieh`, GIVE `gib`;
  - the suppletive forms: BE `sei` / `seien` (`1pl_imperative`) and KNOW `wisse`;
  - the optional `-e` the table already used, so their output does not change: SELECT, ADD,
    EXPORT, IMPORT, COORDINATE, CLEAR.

  BE's `seid` is its stored 2pl present, so it needs no override. `packages/backend/signi.db` was
  reseeded.

Only the nine verbs in the table changed. Every other seeded verb renders the same du, ihr, wir and
instruction forms as before; this was checked by diffing all 54 verbs before and after. The
consistency question stays open: EXTINGUISH `lösch` vs CLEAR `lösche`, and bare `konsumier` /
`modifizier` / `kollabier` vs `addiere`. Both forms are correct, so it is a product decision.

- **Tests:** [`packages/engine/test/imperative.test.ts`](../../../packages/engine/test/imperative.test.ts)
  → *known bugs: German du-imperative forms*. The pinning `test.fails` is now a passing `test`.
  Added cases:
  - the du form of every seeded verb (a `test.each` over all 54);
  - the fixed forms inside a full command (`schneide das Essen nicht`, `gib dem Jungen das Buch`,
    `werde müde`, `erweitere schnell`);
  - a guard that ihr, the wir cohortative and the instruction register are unchanged (`gebt`,
    `schneidet`, `geben wir`, `seien wir`, `seid`, `geben`, `schneiden`).

  [`deImperativeWord.test.ts`](../../../packages/engine/src/languages/de/deImperativeWord.test.ts)
  now covers each branch of the rule, including the cases it must leave bare (`komm`, `beginn`,
  `lern`, `film`, `wohn`, `wein`). It also checks that the vowel change is not carried over, that a
  stored form wins over the rule, and suppletive `sein`.
  [`renderClause.test.ts`](../../../packages/engine/src/languages/de/renderClause.test.ts) checks
  the stored and derived forms through the clause.
