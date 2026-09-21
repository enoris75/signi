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
