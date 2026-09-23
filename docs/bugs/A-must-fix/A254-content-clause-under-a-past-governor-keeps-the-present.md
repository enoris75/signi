# A254. A content clause under a past governor keeps the present

**Languages:** English, Italian, French, Spanish, Portuguese

A content clause resolves its tense as any clause does, absolutely
([`resolvePhrase`](../../../packages/engine/src/translator/functions/resolvePhrase.ts) passes it only
the mood [`contentClauseMood`](../../../packages/engine/src/translator/functions/contentClauseMood.ts)
reads off its governor), so under a past BELIEVE, THINK, SAY or KNOW it keeps the present its plan
names. A clause simultaneous with a past governor shifts back (sequence of tenses): the Romance
present subjunctive becomes the imperfect subjunctive, the indicative present the imperfect, the
future the conditional, and English backshifts the present to the past and *will* to *would*.
[P09-E4](../../features/P-planning/P09-core-vocabulary/P09-E4-clauses.md) listed it as out of scope;
the constructs it shipped reach it.

| Case | Now | Want |
|---|---|---|
| the MAN did not BELIEVE (past) that the CAT RUNs (it) | `l'uomo non credeva che il gatto corra.` | `l'uomo non credeva che il gatto corresse.` |
| … es | `el hombre no creía que el gato corra.` | `el hombre no creía que el gato corriera.` |
| … pt | `o homem não acreditava que o gato corra.` | `o homem não acreditava que o gato corresse.` |
| … en | `the man did not believe that the cat runs.` | `the man did not believe that the cat ran.` |
| the MAN BELIEVEd … (it) | `l'uomo credeva che il gatto corra.` | `l'uomo credeva che il gatto corresse.` |
| … fr / es / pt | `croyait que le chat court` / `creía que el gato corre` / `acreditava que o gato corre` | `courait` / `corría` / `corria` |
| … en | `the man believed that the cat runs.` | `the man believed that the cat ran.` |
| the MAN did not THINK (past) … (it / es / pt) | `non pensò che il gatto corra` / `no pensó que el gato corra` / `não pensou que o gato corra` | `corresse` / `corriera` / `corresse` |
| the MAN SAID … (it / fr / es / pt) | `disse che il gatto corre` / `dit que le chat court` / `dijo que el gato corre` / `disse que o gato corre` | `correva` / `courait` / `corría` / `corria` |
| … en | `the man said that the cat runs.` | `the man said that the cat ran.` |
| the MAN KNEW … (it / fr / es / pt) | `sapeva che il gatto corre` / `savait que le chat court` / `sabía que el gato corre` / `sabia que o gato corre` | `correva` / `courait` / `corría` / `corria` |
| the MAN SAID that the CAT WILL RUN (en / fr / es / pt) | `will run` / `courra` / `correrá` / `correrá` | `would run` / `courrait` / `correría` / `correria` |
| it WAS right that the CAT RUNs (it / es / pt) | `era giusto che il gatto corra` / `era correcto que el gato corra` / `era certo que o gato corra` | `corresse` / `corriera` / `corresse` |

The **Want** column is written by hand. Two judgment calls: the English present after a past
governor is grammatical when the claim still holds ("double access"), and so is the Romance
indicative present in speech, but a plan does not say the claim still holds, so the shifted tense —
the default reading — is the target. The Italian future under a past governor is the *condizionale
composto* (`sarebbe corso` / `avrebbe corso`), whose auxiliary is the fix's to choose; it is left out
of the pin.

**Already right.** French under a negated belief keeps the present subjunctive of speech
(`l'homme ne croyait pas que le chat coure.`, the imperfect subjunctive being literary). German's
*dass* clause keeps its own tense (`der Mann glaubte nicht, dass der Kater läuft.`), which is
standard German: its tenses do not agree, and `lief` would be right too, so it is not pinned.
Japanese's clause tense is relative already (`男は猫が走ると信じていませんでした。`). And every
language under a present governor.

**Shape of the fix.** Where `resolvePhrase` resolves `contentObject` and `contentSubject`, a past
governor shifts a present or future clause: in it/fr/es/pt the `presentSubjunctive` becomes the
imperfect `subjunctive` the hypothetical already builds (`corresse`, `corriera`; French keeps the
present), the indicative present becomes the imperfect each engine gives a state verb's past (A130,
as A250's `imperfectivePast` does), and the future the conditional; in English the present becomes
the past and the future the conditional. One set of languages beside `CONTENT_CLAUSE_MOOD` in
[`translator.consts.ts`](../../../packages/engine/src/translator/translator.consts.ts). A past clause
under a past governor (the pluperfect, *had run*) is left alone; see also A260.

**Nothing shipped shows it**: no gloss has a content clause under a past governor.

Pinned by `known bugs: a content clause under a past governor keeps the present (A254)` in
[content-clause.test.ts](../../../packages/engine/test/content-clause.test.ts).

Found fixing A247, the negated belief.
