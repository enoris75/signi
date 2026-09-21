# A203. A pronoun in the other adposition-bearing complements renders as a noun

**Languages:** English, Italian, French, German, Spanish, Portuguese

[A197](../fixed/A197-pronoun-in-the-comitative.md) gave the comitative and the instrumental the
pronoun branch the causal adjunct always had: a pronoun after an adposition takes its tonic
(disjunctive) form and no article — *with him*, *con lui*, *avec lui*, *mit ihm*, *con él*, *com
ele*. The other five adposition-bearing complements were left where they were. A locative, terminus,
direction, source, route or manner pronoun still goes through the ordinary noun-phrase renderer,
which hands it a determiner and the citation form, and in German declines it as a noun.

| Complement | Now | Want |
|---|---|---|
| locative, en / es / pt | `the cat is in the he.` · `en el él` · `no ele` | `in him` · `en él` · `nele` |
| … de / it / fr | `im er` · `nel lui` · `dans l'il` | `in ihm` · *see below* · *see below* |
| locative, *under* | `unter dem er` · `debajo del él` · `sotto il lui` | `unter ihm` · `debajo de él` · `sotto di lui` |
| terminus, en / es / pt | `to the he` · `al él` · `ao ele` | `to him` · `a él` · `a ele` |
| … de | `der Mann gibt das Buch in den er.` | *see below* |
| direction | `zum er` · `al lui` · `à l'il` · `va al él` | *see below* |
| source, en / es / pt | `from the he` · `del él` · `do ele` | `from him` · `de él` · `dele` |
| route, en / es / pt / de | `through the he` · `por el él` · `pelo ele` · `durch den er` | `through him` · `por él` · `por ele` · `durch ihn` |
| manner, en / es / pt / de | `like the he` · `como el él` · `como o ele` · `wie der er` | `like him` · `como él` · `como ele` · `wie er` |

The **Now** column was rendered by the engine at the commit that fixed A197. The **Want** column is
hand-written — no trial fix has been applied to these slots — which is why the rows this file is
unsure of are marked rather than guessed, and why the pinned cases are the ones no usage question
hangs on.

**Already right.** Japanese, which marks every one of these with a particle and needs no article in
any of them (`猫は彼にいます。`, `猫は彼から来ます。`, `猫は彼のように走ります。`). The comitative and
the instrumental, which A197 fixed. The causal adjunct, which has had a pronoun path in all six
since it was written. A passive's by-phrase (`agentPhrase`) and a verb's prepositional object
(`prepObjectText`, A139). A **noun** in any of these complements.

**Plan-only today**, as A197's was: `slotCategories`
([interfaces.ts](../../../packages/frontend/src/components/PhraseBuilder/interfaces.ts)) offers the
pronoun vocabulary on `subject`, `directObject` and `cause` only, and the console's `wordSpecFor`
([resolve.ts](../../../packages/frontend/src/console/language/resolve.ts)) gives every other
complement `{ roles: ['noun'] }`. So the defect reaches a user only through `/api/translate` — and it
is what has to be right before any of these slots is offered a pronoun.

**Nothing shipped shows it.** No concept `definition` and no `UI_STRINGS` entry puts a pronoun in any
of these complements.

## Shape of the fix

The pieces are in place. [`tonicPronoun`](../../../packages/engine/src/functions/tonicPronoun.ts)
answers the "is this a pronoun, and what is its tonic form" question for every engine, and each of
the six `complementsPhrase` files already has the branch for the comitative and the instrumental to
copy. What each slot needs is its **bare adposition** — the one the head builder computes today
with a determiner fused into it — and, in German, the **case that preposition governs**.

**Decisions for the fixer:**

- **German's cases.** `disjunctive` is the dative, which is right for *in* (static), *aus*, *von*,
  *zu* and *mit*, and wrong for the accusative prepositions: *durch ihn*, and motion-*in* (*in ihn*),
  which the engine already distinguishes with `spatialCase`. The accusative surface is the seeded
  `object` form (*ihn / sie / es / mich / dich*). The similative *wie* governs the **nominative**
  (*wie er*), which is the base form and neither of the two.
- **The French locative.** `dans lui` is what the shape above would render, and it is not what French
  says of a person; *en lui* is the idiom for an abstract containment and *dedans* for a physical
  one. Rule the locative before pinning it. The other French slots are unproblematic (*vers lui*,
  *de lui*, *à travers lui*, *comme lui*, *à lui*).
- **Italian's "di".** Several Italian prepositions insert *di* before a tonic pronoun — *sotto di
  lui*, *su di lui*, *dietro di lui*, *attraverso di lui* — where others do not (*in lui*, *da lui*,
  *a lui*, *come lui*). `prepObjectText` already writes one of these (*clicca su di lui*, A139), so
  the list exists in the engine to be shared.
- **The animate branches.** Spanish and Portuguese send an *animate* goal to *hacia* / *para* and
  Italian to *da*; German sends an animate terminus to the bare dative and an animate source to
  *von*. A pronoun's forms carry no `animate`, so it takes the inanimate branch in every one of them
  (`el hombre da el libro al él`, `der Mann gibt das Buch in den er`). A pronoun standing for a
  person is animate by definition; whether the engine should say so, and where, is the question
  behind the direction and terminus rows above.
- **GENERIC_PERSON** was ruled in A197 and the ruling holds here: no tonic form is seeded, and the
  bare subject form is no worse than the article it gets today.

| | |
|---|---|
| **Test** | `complements/comitative.test.ts` → *known bugs: a pronoun in the other adposition-bearing complements* (2 `test.fails` — the locative, source, route, manner and terminus in English, Spanish and Portuguese, and German's three cases — plus a regression test for the comitative, the instrumental and Japanese) |
