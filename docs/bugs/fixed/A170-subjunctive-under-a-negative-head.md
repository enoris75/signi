# A170. A relative clause under a `no` head keeps the indicative (es, pt)

**Language:** Spanish, Portuguese

A relative clause whose antecedent is negated asserts nothing about a real referent. So Spanish and
Portuguese put its verb in the **subjunctive**: `ningún gato que coma corre`, `nenhum gato que coma
corre`. The indicative (`que come`) is ungrammatical there. It stays the present subjunctive for a
present or future relative, and becomes the imperfect subjunctive for a past one (`que comiera`, `que
comesse`). The engine renders every relative clause in the indicative.

The trigger is the `no` determiner on the head. It works the same whether the head is the matrix
subject or the object, and whether the gap is the relative's subject or its object.

| Case | Language | Now | Want |
|---|---|---|---|
| `no cat that eats runs` | Spanish | `ningún gato que come corre.` | `ningún gato que coma corre.` |
| `no cat that eats runs` | Portuguese | `nenhum gato que come corre.` | `nenhum gato que coma corre.` |
| past | Spanish | `ningún gato que comió corre.` | `ningún gato que comiera corre.` |
| past | Portuguese | `nenhum gato que comeu corre.` | `nenhum gato que comesse corre.` |
| `NEVER` | Spanish | `ningún gato que nunca come corre.` | `ningún gato que nunca coma corre.` |
| `NEVER` | Portuguese | `nenhum gato que nunca come corre.` | `nenhum gato que nunca coma corre.` |
| object relative | Spanish | `ningún ratón que el gato come corre.` | `ningún ratón que el gato coma corre.` |
| object relative | Portuguese | `nenhum rato que o gato come corre.` | `nenhum rato que o gato coma corre.` |
| object head | Spanish | `el perro no ve ningún gato que corre.` | `el perro no ve ningún gato que corra.` |
| object head | Portuguese | `o cão não vê nenhum gato que corre.` | `o cão não vê nenhum gato que corra.` |
| copula | Spanish | `ningún gato que está cansado corre.` | `ningún gato que esté cansado corre.` |
| copula | Portuguese | `nenhum gato que está cansado corre.` | `nenhum gato que esteja cansado corre.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** A relative under any head that is not `no` keeps the indicative (`el gato que come
corre`, `pocos gatos que comen corren`), as it should. The main clause (`ningún gato corre`).

**Coupled to [A167](A167-negative-head-erases-relative-polarity.md).** Under a `no` head, Spanish and
Portuguese also drop a *negated* relative's `no` / `não`. A167 pins that with the indicative the
engine uses today (`ningún gato que no come corre`), so none of the cases above is negated. Whichever
fix lands second updates the other: with both in, the string is `ningún gato que no coma corre`.

Found while probing the neighbours of A167, itself a neighbour of the random phrase "… many wolves
that no far angel did not click" (seed 341682). Raised with the user, who ruled it a defect
(2026-09-21).

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine suite green.

- **The mood.** [`es/withRelative.ts`](../../../packages/engine/src/languages/es/withRelative.ts) and
  [`pt/withRelative.ts`](../../../packages/engine/src/languages/pt/withRelative.ts) hand
  `predicateText` a verb phrase whose `mood` is the subjunctive when the head's `definiteness` is
  `no` and the relative carries no mood of its own. A past relative takes the imperfect subjunctive
  `moodForm` already derives (`mood: 'subjunctive'`, the protasis form).
- **The present subjunctive.** No third-person form exists yet.
  [`mood.ts`](../../../packages/engine/src/mood.ts) derives the present subjunctive (`subjPresent`)
  only for the imperative's persons (`2sg` / `1pl` / `2pl`). The trial added a `presentSubjunctive`
  mood whose 3sg is the Spanish 2sg minus `-s` (`comas` → `coma`), or the Portuguese 2sg as it stands,
  since that paradigm is already *você*'s (`coma`). A real fix gives `subjPresent` the 3sg/3pl
  endings and adds `presentSubjunctive` to `Mood`. Its overrides must gain the 3sg too: `sea`, `esté`,
  `dé`, `vaya`, `sepa`; `seja`, `esteja`, `dê`, `vá`, `saiba`.

**Decisions for the fixer:**

- **The future.** The trial maps a future relative to the present subjunctive (`ningún gato que
  coma`), which is right for Spanish. Portuguese has a future subjunctive (`que comer`) that some
  registers use here. Not pinned.
- **The periphrastic aspects** (`que esté comiendo`) route through an auxiliary that keeps the
  indicative today, as they already do under a conditional. Not pinned.
- **Italian and French.** Standard Italian and French take the subjunctive here too (`nessun gatto che
  mangi`, `aucun chat qui soit…`), but the indicative is widely accepted in both. Neither engine
  derives a present subjunctive: Italian's imperative never needs one, and a French *-er* 3sg is
  identical anyway (`mange`). So they are not pinned. Extending the rule to them is a product call,
  and needs a derivation in `mood.ts` for each.

| | |
|---|---|
| **Test** | `negation.test.ts` → *known bugs: a relative under a negative head keeps the indicative* (2 `test.fails`, plus a regression test for the heads that keep the indicative) |

## Resolved

2026-09-21. A relative clause on a `no` head now takes the subjunctive in Spanish and Portuguese.

- **The mood is engine-internal.** `Mood` is the engine's type
  ([`types.ts`](../../../packages/engine/src/types.ts)), set by the translator and the engines. It is
  not a plan value the UI offers, so the new `'presentSubjunctive'` lives there. No plan can ask for
  it.
- **The trigger.** [`functions/negatedAntecedentVerbPhrase.ts`](../../../packages/engine/src/functions/negatedAntecedentVerbPhrase.ts)
  returns the relative's verb phrase with `mood: 'presentSubjunctive'` under a `no` head, or `mood:
  'subjunctive'` (the imperfect subjunctive the protasis already uses) when the relative is past. It
  leaves the verb phrase alone under any other head, or when the clause already carries a mood.
  [`es/withRelative.ts`](../../../packages/engine/src/languages/es/withRelative.ts) and
  [`pt/withRelative.ts`](../../../packages/engine/src/languages/pt/withRelative.ts) apply it once
  and hand it to every branch, including the genitive relative (`ningún niño cuyo gato coma`) and the
  locative gap (`ninguna casa donde el gato coma`).
- **The present subjunctive in every person.** In [`mood.ts`](../../../packages/engine/src/mood.ts),
  `subjPresent` takes all six persons. Its endings tables gained the 1sg/3sg/3pl, and its overrides
  gained the same persons: `sea`, `esté`, `dé`, `vaya`, `sepa`; `seja`, `esteja`, `dê`, `vá`,
  `saiba`. Only the 1st and 2nd plural take the unstressed stem (`muerda` / `mordamos`). The stem
  was chosen by `pn !== '2sg'` when the imperative's three persons were the only ones. `moodForm`
  routes the new mood to `presentSubjunctiveForm`. That function is Spanish and Portuguese only, and
  returns `undefined` when there is neither an override nor a stored 1sg present, so the caller
  conjugates.
- **Overrides a sweep of every seeded verb called for.** Beyond the listed five, three verbs needed
  overrides. The aspect auxiliaries carry no stored present, so they got `HABER` (`haya`) and
  Portuguese `TER` (`tenha`). Portuguese `querer` (`WILL`) got `queira`, because its 1sg `quero` hides
  the `i`. Every other seeded Spanish and Portuguese verb derives correctly off its 1sg present. The
  sweep was a throwaway pass over all 97 seeded verbs in each language, checking the 3sg, 1pl and 3pl.

**Decisions.**

- **The future** maps to the present subjunctive in both (`ningún gato que coma`). Only the Spanish
  one is pinned. The Portuguese future subjunctive (`que comer`) is not modelled.
- **The periphrastic aspects and the modals take the mood on their finite auxiliary**, since
  `auxFinite` already routes through `moodForm`: `que esté comiendo`, `que haya comido`, `que tenha
  comido`, `que estuviera comiendo`, `que pueda comer`, `que queira comer`. They are pinned. The
  file had left them open.
- **Italian and French are out of scope**, as the file says. They keep the indicative (`nessun gatto
  che mangia`, `aucun chat qui mange`), and a regression test pins that.

**With [A167](A167-negative-head-erases-relative-polarity.md).** A167 landed first, with the
indicative. This fix moved its Spanish and Portuguese pins to the subjunctive: `ningún gato que no
coma corre.`, `nenhum gato que não coma corre.`, `el perro no ve ningún gato que no coma.`, and the
same for its past (`que no comiera`), modal (`que no pueda comer`), progressive (`que no esté
comiendo`), copula (`que no esté cansado`), `no` complement (`que no corra en ninguna casa`) and
own-subject (`que el gato no coma`, `que ningún gato coma`) cases.

- **Tests:** [`packages/engine/test/negation.test.ts`](../../../packages/engine/test/negation.test.ts)
  → *known bugs: a relative under a negative head keeps the indicative*. Both pinning `test.fails`
  are now passing `test`s, with their assertions unchanged. New cases:
  - the Spanish future, the progressive and resultative (present and past), and the `CAN` / `WILL`
    modals;
  - the irregular verbs (`sea` / `seja`, `esté` / `esteja`, `vaya` / `vá`, `dé` / `dê`) and a
    reflexive one (`se mueva` / `se mova`);
  - the genitive relative and the locative gap on a `no` head;
  - Italian and French keeping the indicative, in the regression test.
- **Unit tests:** [`mood.test.ts`](../../../packages/engine/src/mood.test.ts) covers the full
  Spanish and Portuguese paradigms (regular, stem-changing, `-ear`, irregular, the auxiliaries and
  `querer`), and `undefined` where there is no stem and in the other languages.
  [`functions/negatedAntecedentVerbPhrase.test.ts`](../../../packages/engine/src/functions/negatedAntecedentVerbPhrase.test.ts)
  is new. [`es/withRelative.test.ts`](../../../packages/engine/src/languages/es/withRelative.test.ts)
  and [`pt/withRelative.test.ts`](../../../packages/engine/src/languages/pt/withRelative.test.ts)
  cover the mood by tense, number and aspect, the object gap, and a definite head.
