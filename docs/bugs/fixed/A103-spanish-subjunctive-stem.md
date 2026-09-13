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

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed. Both changes are in [`mood.ts`](../../../packages/engine/src/mood.ts).

- **Stem changes.** The new `unstressedStem` gives Spanish -ar/-er verbs their 1st/2nd-plural
  subjunctive stem. It keeps the 1sg stem unless undoing one stressed-vowel change (`ue`→`o`/`u`,
  `ie`→`e`, `í`→`i`, `ú`→`u`) turns it into the `1pl_present` stem. So `mordamos`, `mostremos`,
  `empecemos` and `enviemos` come out right, while an irregular 1sg keeps its stem (`vengamos`,
  `hagáis`, `elijáis`). The tú negative keeps the stressed stem (`no muerdas`). -ir verbs and
  Portuguese are left as they were.
- **GO and GIVE.** `ES_SUBJ_OVERRIDE` gains `vayas / vayamos / vayáis` and `des / demos / deis`.
  `ES_IMP_OVERRIDE` gains GO's `ve` and `vamos`. The bug file had listed the affirmative tú as right,
  but it read `va.`.

Every row now renders as wanted. A sweep compared all five command forms of all 57 seeded verbs
before and after. The only Spanish changes are the pinned verbs and three more:
- the modals CAN and WILL (`podamos`, `no queráis`);
- the reflexive BECOME from A100 (`volvámonos`, `no nos volvamos`, `no os volváis`);
- GO's `ve`.

No Portuguese output changed.

- **Tests:** [`packages/engine/test/imperative.test.ts`](../../../packages/engine/test/imperative.test.ts)
  → *known bugs: Spanish present-subjunctive stem in commands*. Both pinning `test.fails` are now
  passing `test`s. New cases cover the other persons, the modals, BECOME and every GO/GIVE command,
  with a guard for the tú negative and the irregular 1sg stems.
- Unit tests: the new `mood.test.ts`, covering `imperativeForm` for Spanish and a Portuguese guard.
