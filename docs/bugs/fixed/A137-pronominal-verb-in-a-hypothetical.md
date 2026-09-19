# A137. A pronominal verb in a hypothetical takes the wrong clitic

**Language:** French, Portuguese

A hypothetical puts the finite verb in the conditional (the main clause) and in the imperfect (French)
or imperfect subjunctive (Portuguese) in the if clause. `mood.ts` derives both from a stored form:

- the conditional from the 1sg future, with its ending taken off;
- the French imparfait from the 1pl present;
- the Portuguese imperfect subjunctive from the 3pl past.

A pronominal verb stores its clitic inside those forms (`m'effondrerai`, `nous effondrons`,
`me tornarei`, `se tornaram`), so the stem keeps the clitic of that one person, whatever the subject:

| Clause | Now | Want |
|---|---|---|
| fr: if CAT COLLAPSE, DOG RUN | `si le chat nous effondrait, le chien courrait.` | `si le chat s'effondrait, le chien courrait.` |
| fr: if DOG RUN, CAT COLLAPSE | `si le chien courait, le chat m'effondrerait.` | `si le chien courait, le chat s'effondrerait.` |
| fr: if FIRST_PERSON COLLAPSE | `si je nous effondrais, …` | `si je m'effondrais, …` |
| fr: if DOG RUN, FIRST_PERSON plural COLLAPSE | `…, nous m'effondrerions.` | `…, nous nous effondrerions.` |
| pt: if DOG RUN, CAT BECOME happy | `se o cão corresse, o gato me tornaria feliz.` | `se o cão corresse, o gato se tornaria feliz.` |
| pt: if FIRST_PERSON BECOME happy | `se se tornasse feliz, o cão correria.` | `se me tornasse feliz, o cão correria.` |

Already right: Spanish (`el gato se volvería feliz`, `si me volviera feliz`), which strips and re-adds its
clitic (`reflexiveClitic`); the French compound past in the if clause (`si le chat s'était effondré`);
and every non-pronominal verb.

Found while probing MOVE for [C17](../../localization/done/C17-motion-verbs-reflexive-genus.md): a
French MOVE (*se déplacer*) renders `si le chat nous déplaçait`. COLLAPSE and BECOME show it today.

## Shape of the fix

Derive the stem from the bare verb, then place the agreeing clitic, the way the finite paths already do.
French strips `s'` / `se ` from the stored form and hands the finite verb to `reflexiveFinite`, which
prepends `FR_REFLEXIVE[auxKey(subject)]` and elides it. Portuguese strips the clitic with
`nonReflexiveVerb` and places the subject's clitic as its present does. The Portuguese 1pl
(`tornássemos`) also needs the accent B11 documents; keep that out of this fix.

| | |
|---|---|
| **Test** | `verb.test.ts` → *known bugs: pronominal verb in a hypothetical* (2 `test.fails`) |

## Resolved

Fixed 2026-09-14 with the shape above: each engine derives the mood form from the plain verb and places
the subject's clitic, as Spanish already did.

- **French:** [`nonReflexiveVerb`](../../../packages/engine/src/languages/fr/nonReflexiveVerb.ts) (new) takes
  `s'` / `se ` off the base and the clitic off every stored form. [`predicateText`](../../../packages/engine/src/languages/fr/predicateText.ts)
  derives the conditionnel, the imparfait and a state verb's past from it and hands the result to
  `reflexiveFinite`: "s'effondrerait", "je m'effondrais", "nous nous effondrerions".
- **Portuguese:** [`reflexiveClitic`](../../../packages/engine/src/languages/pt/reflexiveClitic.ts) (new) and
  `PT_REFLEXIVE` in [`pt.consts.ts`](../../../packages/engine/src/languages/pt/pt.consts.ts) give the subject's
  clitic (me / nos, se for você, vocês and the 3rd person). [`predicateText`](../../../packages/engine/src/languages/pt/predicateText.ts)
  derives the mood form with `nonReflexiveVerb` and puts that clitic in front: "se tornaria", "me tornasse".
  The 1st-plural accent stays B11's.
- **Tests:** [`verb.test.ts`](../../../packages/engine/test/verb.test.ts) → *known bugs: pronominal verb in a
  hypothetical*. Both pinning `test.fails` are now passing `test`s. New cases cover every person in French
  and a negation in each language. A regression guard covers the French compound past and a modal in the
  if clause, and the indicative future and past. Unit tests: `fr/nonReflexiveVerb.test.ts`,
  `pt/reflexiveClitic.test.ts`, `fr/predicateText.test.ts`, `pt/predicateText.test.ts`.
