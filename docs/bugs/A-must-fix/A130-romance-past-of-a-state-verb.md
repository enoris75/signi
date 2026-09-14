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
