# A130. A Romance state verb takes the perfective in the past

**Language:** Italian, French, Spanish, Portuguese

The Romance simple past is the perfective: passato remoto, passé simple, pretérito (C06). That is right
for an event, but the engine applies it to every verb, including states. The perfective turns a state
into an event, and the sentence says something else:

- *volle* / *quiso* read "insisted on", and *non volle* / *no quiso* means "refused".
- *poté* / *pudo* read "managed to".
- *ebbe* / *tuvo* read "got" or "received".
- *dovette* / *dut* read "had to (and did)". Portuguese *deveu comer* is unidiomatic, and Spanish
  *debió comer* leans to "must have eaten".
- *fu nella casa* is ill-formed.

A state in the past takes the imperfect: *voleva*, *poteva*, *doveva*, *aveva*, *possedeva*, *era*.
English "wanted", "could" and "had" say nothing about aspect, so the imperfect is the neutral reading.
The progressive already uses the imperfect for the same reason: `STARE_IT` and its es / pt
counterparts carry *stava* / *estaba* / *estava* (`it.consts.ts`).

Found from the builder: "the boy's fox wanted to be jumping over the dog" rendered *la volpe del ragazzo
volle stare saltando sopra il cane*.

| Plan | Now (it · fr · es · pt) | Want |
|---|---|---|
| the boy's FOX WILL JUMP over the dog, past | `volle saltare` · `voulut sauter` · `quiso saltar` · `quis pular` | `voleva saltare` · `voulait sauter` · `quería saltar` · `queria pular` |
| CAT WILL EAT, past | `il gatto volle mangiare.` | `il gatto voleva mangiare.` |
| CAT WILL EAT, past, negative | `il gatto non volle mangiare.` | `il gatto non voleva mangiare.` |
| CATS WILL EAT, past | `vollero` · `voulurent` · `quisieron` · `quiseram` | `volevano` · `voulaient` · `querían` · `queriam` |
| CAT CAN EAT, past | `poté` · `put` · `pudo` · `pôde` | `poteva` · `pouvait` · `podía` · `podia` |
| CAT MUST EAT, past | `dovette` · `dut` · `debió` · `deveu` | `doveva` · `devait` · `debía` · `devia` |
| the cat that WILL EAT (past) runs | `il gatto che volle mangiare corre.` | `il gatto che voleva mangiare corre.` |
| CAT HAVE the book, past | `ebbe` · `eut` · `tuvo` · `teve` | `aveva` · `avait` · `tenía` · `tinha` |
| CAT OWN the mouse, past | `possedé` · `posséda` · `poseyó` · `possuiu` | `possedeva` · `possédait` · `poseía` · `possuía` |
| CAT BE happy, past | `fu` · `fut` · `estuvo` · `esteve` | `era` · `était` · `estaba` · `estava` |
| CAT BE in the house, past | `il gatto fu nella casa.` | `il gatto era nella casa.` |

In every row the only word that changes is the finite verb. English, German and Japanese are unaffected.

Already right: an event verb keeps the perfective (`il gatto mangiò`), and so does an achievement
(UNDERSTAND → `il gatto comprese il libro`, the moment of grasping it). The progressive past is already
imperfect (`il gatto stava mangiando`). Both are pinned as a regression guard.

Not pinned:

- **Other states.** LOVE (`amò` → `amava`), SEEM (`sembrò` → `sembrava`) and HOLD in its "contain"
  sense (`contenne` → `conteneva`) belong to the same class. The fix should flag them too.
- **KNOW.** It has a separate lexical defect, A131: `il gatto seppe il cane` should use *conoscere* /
  *connaître* / *conocer* / *conhecer* for a person or thing. Keep KNOW out of this fix's tests.
- **A progressive under a volitional modal.** *voleva stare saltando* / *voulait être en train de sauter*
  copy English "wanted to be jumping". Italian and French use the plain infinitive (*voleva saltare*),
  and Spanish and Portuguese tolerate the periphrasis only marginally. This is a separate question, about
  aspect under WILL, from the tense question here. The epistemic `deve stare mangiando` (MUST, pinned in
  `modals.test.ts`) is acceptable and should stay.
- **Japanese.** It has a parallel gap, A132: a state verb takes 〜ます / 〜ました rather than 〜ている
  (`猫は本を持ちました` "picked up", where `持っていました` is wanted). The `stative` flag serves both fixes.

## Shape of the fix

1. **Mark the states on the concept.** Add `stative?: boolean` to `Concept`, next to `modal`, and set it
   on WILL, CAN, MUST, BE, HAVE, OWN, LOVE, SEEM and HOLD. Aspect class is a property of the meaning, not
   of any one language, so a concept flag is cheaper and more honest than a per-language list.
2. **Derive the imperfect indicative.** Beside `moodForm` in `mood.ts`:
   - French: already built. The French protasis uses the imparfait (`FR_IMPARF`, `FR_IMPARF_STEM`:
     *nous*-present minus *-ons*, with *être* → *ét-*), so reuse it for the indicative.
   - Italian: infinitive minus *-re* + *-vo/-vi/-va/-vamo/-vate/-vano* (*volere* → *voleva*).
     `IT_SUBJ_STEM` is only partly reusable. DRINK *beve* and PRODUCE *produce* are right for the
     imperfect, but BE needs *er-* (*era*), not *fo*, and GIVE needs *da-*, not *de*.
   - Spanish: *-ar* → *-aba*, *-er/-ir* → *-ía*. The exceptions are *ser* → *era*, *ir* → *iba* and
     *ver* → *veía*.
   - Portuguese: *-ar* → *-ava*, *-er/-ir* → *-ia*. The exceptions are *ser* → *era*, *ter* → *tinha*,
     *vir* → *vinha* and *pôr* → *punha*.

   Today only the auxiliary tables (`STARE_IT`, `ESSERE_IT`, `AVERE_IT` and the es / pt equivalents)
   carry the Italian, Spanish and Portuguese imperfect. The alternative is to store
   `*_past_imperfect` forms per verb in the corpus.
3. **Use it for the finite verb only.** Apply the imperfect only when the finite verb (the outermost
   modal, or the main verb) is stative, the tense is past, the aspect is neutral and the mood is
   indicative. Governed infinitives, the resultative (*ha voluto*) and the hypothetical moods are
   untouched.

A fix flips about 60 existing assertions that pin the perfective on these verbs. These include
`modals.test.ts` (`volle`, `dovette`, `poté` …), *OWN in the past* in `verb.test.ts`, the copula rows in
`complements/predicative.test.ts` and `copulaWithoutComplement.test.ts`, the per-language
`predicateText.test.ts` units, and `__snapshots__/verb.conjugation.test.ts.snap`. Update them; do not
flag them as regressions.

| | |
|---|---|
| **Test** | `verb.test.ts` → *known bugs: Romance past of a state verb* (1 `test.fails`) |

## Resolved

Fixed 2026-09-14, with the shape above.

- **Corpus:** a concept-level `stative` flag, plumbed like A124's `alarm`: `stative?: boolean` on
  `ConceptSeed` ([`concepts/types.ts`](../../../packages/backend/src/concepts/types.ts)), a column with
  its migration ([`db.ts`](../../../packages/backend/src/db.ts)), [`seed.ts`](../../../packages/backend/src/seed.ts),
  and `forms['stative']` on verbs in [`lexicon.ts`](../../../packages/backend/src/lexicon.ts). The flag
  is set on WILL, CAN, MUST ([`modals.ts`](../../../packages/backend/src/concepts/verbs/modals.ts)), BE,
  SEEM ([`motion.ts`](../../../packages/backend/src/concepts/verbs/motion.ts)), HAVE, OWN, LOVE, HOLD,
  KNOW and A131's KNOW_ACQUAINTED ([`transitive.ts`](../../../packages/backend/src/concepts/verbs/transitive.ts)).
  The es / pt `ESTAR_COPULA` constants carry it too. The dev database needs `npm run seed`.
- **Engine:** [`mood.ts`](../../../packages/engine/src/mood.ts) derives the imperfect indicative and
  exposes `statePastForm`, which applies only to a stative verb, in the past, in the indicative:
  - it: -re → -va, with essere → era and the contracted infinitives.
  - fr: the protasis's imparfait.
  - es: -aba / -ía, with ser, ir and ver irregular.
  - pt: -ava / -ia, -ía after a vowel, with ser and the ter / vir / pôr families.

  Each engine's finite verb calls it: [`it/predicateText.ts`](../../../packages/engine/src/languages/it/predicateText.ts),
  [`fr/predicateText.ts`](../../../packages/engine/src/languages/fr/predicateText.ts),
  [`fr/modalGroupFr.ts`](../../../packages/engine/src/languages/fr/modalGroupFr.ts),
  [`es/predicateText.ts`](../../../packages/engine/src/languages/es/predicateText.ts) and
  [`pt/predicateText.ts`](../../../packages/engine/src/languages/pt/predicateText.ts). The main verb
  takes it only with neutral aspect, and the outermost modal whatever it governs.
- **Tests:** [`verb.test.ts`](../../../packages/engine/test/verb.test.ts) → *known bugs: Romance past of
  a state verb*. The pinning `test.fails` is now a passing `test`. A new case covers LOVE, SEEM, KNOW
  with no object, every person, the relative and a negated plural copula. A new regression guard covers
  the resultative, the hypothetical moods and the aspect under a modal. As predicted, the perfective
  assertions on these verbs were flipped in `modals.test.ts`, `verb.test.ts`, `genus-verbs.test.ts`,
  `coordination.test.ts`, `copulaWithoutComplement.test.ts`, `pronoun.test.ts`,
  `complements/locative.test.ts` and `complements/predicative.test.ts`. The BE, KNOW, SEEM and LOVE past
  cells of `__snapshots__/verb.conjugation.test.ts.snap` were re-baselined.
- Unit tests: `statePastForm` in `mood.test.ts`. The it / fr / es / pt fixtures for the modals, the
  copula and the seeming verb carry `stative`, with a new state-past case in each `predicateText.test.ts`.

Still not pinned: a progressive under a volitional modal (`voleva stare saltando`).
