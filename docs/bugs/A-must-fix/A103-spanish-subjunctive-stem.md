# A103. The Spanish command's present-subjunctive stem is the 1sg present, even where it shouldn't be

**Language:** Spanish

`subjPresent` (`mood.ts`) gives the stem of every present-subjunctive person as `1sg_present` minus
`-o`. BE and KNOW are overridden in `ES_SUBJ_OVERRIDE`. Every negative command uses this stem, and
so does the affirmative nosotros. The rule fails in two ways:

- **Stem-changing -ar/-er verbs.** The 1sg stem is stressed (`muerd-`, `muestr-`, `empiez-`,
  `enví-`). The 1st and 2nd plural are stressed on the ending, so they need the unchanged stem:
  `mordamos`, `mostremos`, `empecemos`, `enviemos`.
- **A 1sg present not ending in -o.** `voy` and `doy` pass through untouched and take the endings as
  they are (`voyas`, `doyes`).

| Verb | Now | Want |
|---|---|---|
| BITE, nosotros | `muerdamos.` | `mordamos.` |
| BITE, vosotros negative | `no muerdáis.` | `no mordáis.` |
| SHOW, nosotros | `muestremos.` | `mostremos.` |
| START, nosotros | `empiecemos.` | `empecemos.` |
| SEND, nosotros | `envíemos.` | `enviemos.` |
| SEND, vosotros negative | `no envíéis.` | `no enviéis.` |
| GO, tú negative | `no voyas.` | `no vayas.` |
| GO, nosotros | `voyamos.` | `vamos.` |
| GIVE, tú negative | `no doyes.` | `no des.` |
| GIVE, nosotros | `doyemos.` | `demos.` |

The same stem gives `no voyáis` and `no doyéis`, and the reflexive `vuelvamos` / `vuelváis` (see A100,
Spanish reflexive imperative). Already right: the tú negative of stem-changing verbs (`no muerdas`, `no
empieces`, `no envíes`), verbs with an irregular 1sg in `-go`/`-zco`/`-jo` (`vengamos`, `hagamos`,
`parezcamos`, `elijamos`), and every affirmative tú and vosotros form. The verbs were found by
sweeping the five command forms of all 53 seeded non-modal verbs except BE.

## Shape of the fix

- **Stem changes.** Keep the 1sg stem, but for the 1st and 2nd plural of -ar/-er verbs undo the
  stressed-stem change (`ue`→`o`, `ie`→`e`, `í`→`i`, `ú`→`u`). Equivalently, take the stem from
  `1pl_present` when it differs from the 1sg stem only in that vowel. Reading `1pl_present`
  unconditionally would break `vengamos` / `hagamos` / `elijamos`.
- **GO and GIVE.** Add them to `ES_SUBJ_OVERRIDE` (`vayas / vayamos / vayáis`, `des / demos /
  deis`). GO's affirmative nosotros is `vamos` in `ES_IMP_OVERRIDE`.

Portuguese shares `subjPresent` and is not checked here.

| | |
|---|---|
| **Test** | `imperative.test.ts` → *known bugs: Spanish present-subjunctive stem in commands* (2 `test.fails`) |
