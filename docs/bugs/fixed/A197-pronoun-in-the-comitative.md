# A197. A pronoun in the comitative renders as a noun, in six languages

**Languages:** English, Italian, French, German, Spanish, Portuguese

A pronoun after an adposition takes its tonic (disjunctive) form and no article: *with him*, *con
lui*, *avec lui*, *mit ihm*, *con él*, *com ele*. Put one in the `comitative` and six of the seven
engines run it through the ordinary noun-phrase renderer instead, which hands it a determiner and
the citation form: `the cat coordinates with **the he**`, `con **il lui**`, `avec **l'il**`, `mit
**dem er**`.

Every engine already knows how to do this. The causal adjunct has a pronoun path in all six
([`complementsPhrase`](../../../packages/engine/src/languages/fr/complementsPhrase.ts),
[`causePhrase`](../../../packages/engine/src/languages/de/complementsPhrase/causePhrase.ts)); so
does the passive by-phrase ([`agentPhrase`](../../../packages/engine/src/languages/fr/agentPhrase.ts))
and a verb's prepositional object
([`prepObjectText`](../../../packages/engine/src/languages/fr/prepObjectText.ts), A139: "a pronoun
is no clitic there: it takes its tonic form"). The resolver even prepares the form —
[`resolveNounPhrase`](../../../packages/engine/src/translator/functions/resolveNounPhrase.ts)
collapses `disjunctive_fem` / `disjunctive_plural` into `forms['disjunctive']` for precisely this
reason. The comitative simply never asks. The English engine says why in a comment: *"only the
causal adjunct accepts a pronoun in the UI today."*

**Every person is affected, and the plural worst.** German declines the pronoun as if it were a
noun (`mit den sien`, `mit den wirn` — the dative-plural *-n* on *sie* and *wir*), and Italian
gives it a plural article (`con i loro`).

| Pronoun | Now | Want |
|---|---|---|
| 3sg masc, en | `the cat coordinates with the he.` | `the cat coordinates with him.` |
| 3sg masc, it | `il gatto coordina con il lui.` | `il gatto coordina con lui.` |
| 3sg masc, fr | `le chat coordonne avec l'il.` | `le chat coordonne avec lui.` |
| 3sg masc, de | `der Kater koordiniert mit dem er.` | `der Kater koordiniert mit ihm.` |
| 3sg masc, es | `el gato coordina con el él.` | `el gato coordina con él.` |
| 3sg masc, pt | `o gato coordena com o ele.` | `o gato coordena com ele.` |
| 3sg fem, en / it / fr / de / es / pt | `with the she` · `con la lei` · `avec l'elle` · `mit der sie` · `con la ella` · `com a ela` | `with her` · `con lei` · `avec elle` · `mit ihr` · `con ella` · `com ela` |
| 3sg neut, en / it / fr / de | `with the it` · `con l'esso` · `avec le cela` · `mit dem es` | `with it` · `con esso` · `avec cela` · `mit ihm` |
| 3pl, en / it / fr / de | `with the they` · `con i loro` · `avec les ils` · `mit den sien` | `with them` · `con loro` · `avec eux` · `mit ihnen` |
| 3pl, es / pt | `con los ellos` · `com os eles` | `con ellos` · `com eles` |
| 1sg, en / it / fr / de | `with the I` · `con l'io` · `avec le je` · `mit dem ich` | `with me` · `con me` · `avec moi` · `mit mir` |
| 1pl, en / it / fr / de | `with the we` · `con i noi` · `avec les nous` · `mit den wirn` | `with us` · `con noi` · `avec nous` · `mit uns` |
| 2sg, en / it / fr / de | `with the you` · `con il tu` · `avec le tu` · `mit dem du` | `with you` · `con te` · `avec toi` · `mit dir` |
| 2pl, en / it / fr / de | `with the you` · `con i voi` · `avec les vous` · `mit den ihrn` | `with you` · `con voi` · `avec vous` · `mit euch` |
| coordinated, fr | `avec le chien et avec l'il.` | `avec le chien et avec lui.` |

Every **Want** was rendered by a trial fix applied to HEAD, not written by hand, and reverted after
— including the Spanish and Portuguese fused forms below, which the trial spells out.

**Already right.** Japanese, which marks the companion with と and needs no article at all
(`猫は彼と調整します。`, `猫は彼女と調整します。`, `猫は彼らと調整します。`). The comitative of a noun in all
seven (`the cat coordinates with the dog.`, `mit dem Hund`, `con il cane`). A pronoun in the causal
adjunct (`because of him`, `a causa sua`, `à cause de lui`, `seinetwegen`, `por causa dele`). A
pronoun as the passive agent (`the dog is seen by him.`, `von ihm`, `da lui`). A pronoun as a verb's
prepositional object (`the cat clicks him.`, `clicca su di lui`, `clique sur lui`, `clica nele`). A
pronoun as subject or direct object (`he sees me.`, `il me voit.`, `er sieht mich.`).

**The sister complements do exactly the same.** The comitative is where it was reported, but the
pronoun path is missing from every adposition-bearing complement except `cause` — instrumental
(`with the he` / `mit dem er`), locative (`in the he` / `nel lui` / `im er`), terminus (`to the he` /
`al lui`), direction (`zum er`), source (`from the he` / `dal lui` / `do ele`), route (`through the
he` / `durch den er`) and manner (`like the he` / `wie der er`). Japanese is right in all of them.
They should be fixed together. The pinned cases cover the comitative and the **instrumental**,
which takes the very same adposition in all six languages, so its want is the comitative's and was
rendered by the same trial. The other five are not pinned: each needs its own adposition and, in
German, its own case, so their wants would have to be written by hand.

**Plan-only today.** Nothing in either UI builds this. `slotCategories`
([interfaces.ts](../../../packages/frontend/src/components/PhraseBuilder/interfaces.ts)) offers the
pronoun vocabulary on `subject`, `directObject` and `cause` only, and the console's `wordSpecFor`
([resolve.ts](../../../packages/frontend/src/console/language/resolve.ts)) gives every other
complement `{ roles: ['noun'] }`. The comitative itself has no box on the canvas — it is plan-only,
like `purpose` ([C12](../../localization/done/C12-ui-purpose-and-object-complements.md),
[C20](../../localization/done/C20-pronoun-agreement.md)). So the defect reaches a user only through
`/api/translate`, and it is the thing that has to be right before the comitative or any of its
sisters is offered a pronoun.

**Nothing shipped shows it.** The 5,180 strings the app ships — every concept `definition` and every
UI string, in all seven languages — render byte-identically at HEAD and under the trial fix.

Found while probing the localization catalogue.

## Shape of the fix

Verified by applying it to HEAD. It renders every **Want** above, leaves `npm run typecheck` and the
whole unit suite green (8,808 passing, 23 expected failures), and moves no passing test.

Give the comitative the pronoun branch the cause already has, in each of the six engines: when the
conjunct's head carries `person`, emit the comitative adposition and
`forms['disjunctive'] ?? forms['base']`, with no article, declension or contraction. Per conjunct,
so a group mixes a noun and a pronoun (*avec le chien et avec lui*).

- **en** ([complementsPhrase](../../../packages/engine/src/languages/en/complementsPhrase.ts)) — the
  shared `${prep} ${coordinate(c.phrase, npText)}` tail takes the same callback the `cause` branch
  above it already uses.
- **it** ([complementsPhrase](../../../packages/engine/src/languages/it/complementsPhrase.ts)) — a
  `con` clause beside the existing `pronounCause` one in the final `coordinate`.
- **fr** ([complementsPhrase](../../../packages/engine/src/languages/fr/complementsPhrase.ts)) — an
  `avec` clause in the final `coordinate`, ahead of the locative idiom.
- **de** ([complementsPhrase](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts))
  — an early return beside the hearth idiom, before the case and declension machinery. *mit* governs
  the dative and the German `disjunctive` **is** the dative (*mir / dir / ihm / ihr / uns / euch /
  ihnen*), so `mit ${disjunctive}` is complete.
- **es** / **pt** ([es](../../../packages/engine/src/languages/es/complementsPhrase.ts),
  [pt](../../../packages/engine/src/languages/pt/complementsPhrase.ts)) — a branch in the
  `coordinateElement` callback, with the fusions: *con* + *mí* → **conmigo**, *con* + *ti* →
  **contigo**; *com* + *mim* → **comigo**.

**Decisions for the fixer:**

- **Do the sisters at the same time.** The defect is one missing branch repeated across seven
  complements. Fixing the comitative alone leaves `nel lui` and `mit dem er` standing. Each sister
  needs its own adposition and, in German, its own case — *durch*, *für* and motion-*in* take the
  accusative (`object`: *ihn / sie / es / mich / dich*), not the dative `disjunctive`. That is the
  one place a shared helper cannot just read `disjunctive`.
- **GENERIC_PERSON.** *on / man / si / se / one* are clitic or impersonal subject forms with no
  tonic counterpart in the lexicon, so the trial renders *avec on*, *mit man*, *con si* — no better
  than today. A comitative "one" is arguably not a phrase any of these languages has; rule on it,
  and either seed the tonic forms (*soi*, *uno*) or refuse the combination. Not pinned.
- **Portuguese 1pl.** The trial gives *com nós*; standard Portuguese fuses to *connosco* (pt-PT) /
  *conosco* (pt-BR). The lexeme has no such form. Spanish 1pl needs no fusion (*con nosotros*), and
  the 1sg/2sg fusions the trial spells out (*conmigo*, *contigo*, *comigo*) would be better off in
  the lexeme than in the engine. The pinned cases assert *com nós*; change the pin with the ruling.
- **Reflexive coreference.** "the cat coordinates with itself" is a reflexive, not a comitative
  pronoun, and nothing here reaches it. Out of scope.

| | |
|---|---|
| **Test** | `complements/comitative.test.ts` → *known bugs: a pronoun in the comitative renders as a noun* (3 `test.fails` — the third person in all six languages across gender and number and in a coordinated group, the first and second persons with the Spanish/Portuguese fusions, and the instrumental — plus a regression test for Japanese, a noun companion, the causal pronoun, the passive agent and the prepositional object) |

## Resolved

2026-09-21. Took the shape above, for the **comitative and the instrumental** — the two slots the
pinned cases cover, which share one adposition in all six languages. The other five sisters are
**not** fixed here and are filed as [A203](../A-must-fix/A203-pronoun-in-the-other-complements.md);
see the ruling below.

A shared helper, [`tonicPronoun`](../../../packages/engine/src/functions/tonicPronoun.ts), answers
the one question every engine was asking inline: the disjunctive surface for a pronoun, `undefined`
for a noun. `resolveNounPhrase` has already selected it for the person, number and gender in hand.
Each engine then spells its own adposition around it, per conjunct:

- **en** ([complementsPhrase](../../../packages/engine/src/languages/en/complementsPhrase.ts)) — the
  shared `${prep} ${coordinate(…)}` tail takes a conjunct callback that prefers the tonic form for
  the two `TONIC_COMPLEMENTS`. The `cause` branch above it, which had the same expression inline,
  now calls the helper too.
- **it** / **fr** — a `con` / `avec` clause in the final `coordinate`, beside the existing pronoun
  cause. Each conjunct repeats the preposition, as a fused head does: *con il cane e con lui*, *avec
  le chien et avec lui*.
- **de** ([complementsPhrase](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts))
  — an early return beside the hearth idiom, before the case and declension machinery. *mit* governs
  the dative and the German `disjunctive` **is** the dative, so `mit ${tonic}` is the whole phrase.
- **es** / **pt** — a branch in `conjunctText`, with the fusions in each language's consts
  (`COMITATIVE_FUSION`): *conmigo*, *contigo*, *consigo*; *comigo*, *contigo*, *conosco*, *consigo*.

**Decisions for the fixer**, as ruled:

- **The sisters were not done at the same time.** Each needs its own adposition and, in German, its
  own case, and — unlike the comitative and the instrumental — *none of their wants was ever
  rendered*: the bug file says in as many words that they "would have to be written by hand". They
  are not one branch repeated but seven questions of usage (French *dans lui* or *en lui*, Italian
  *sotto di lui*, German's accusative *durch ihn* against the dative the `disjunctive` already is),
  and answering them blind is how a catalogue of verified defects stops being one. A203 files them
  with those questions written down, exactly as A187 left A202 behind. What this fix does leave them
  is the helper and the shape: each is a two-line branch once its adposition is ruled.
- **GENERIC_PERSON.** Left as it is, and not seeded. The six now render *with one*, *con si*, *avec
  on*, *mit man*, *con se*, *com se* — no better than the *con il si* of before, and no worse. A
  comitative "one" is not a phrase these languages have, nothing in either UI builds one, and
  inventing tonic forms (*soi*, *uno*, *einem*) for it would be seeding vocabulary no reader asked
  for. Not pinned.
- **Portuguese 1pl.** Fused: `com` + `nós` → **conosco**, the Brazilian spelling the rest of the
  corpus uses (*está abrindo*, *em uma prisão*). *com nós* is not Portuguese, and no pinned case
  asserted it — the 1pl row of the second test names en/it/fr/de/es only. The fusion sits in
  `pt.consts.ts` beside the 1sg and 2sg ones rather than in the lexeme; moving all four into the
  lexeme is a corpus question, not this defect's.
- **Reflexive coreference.** Out of scope, as the file says. `consigo` is in both fusion tables for
  completeness, and nothing reaches it.

**Found while fixing this, and filed rather than fixed:** a *feminine plural* pronoun has no tonic
form of its own in any language. `resolveNounPhrase` reads `disjunctive_plural` alone, so a feminine
group is masculine behind every adposition — `à cause d'eux`, `a causa de ellos`, `por causa deles`,
and now `avec elles` → *avec eux* in the comitative. It predates this fix (the causal adjunct shows
it at HEAD) and is the `disjunctive` counterpart of A36 and A161. Filed as
[A205](../A-must-fix/A205-feminine-plural-tonic-pronoun.md).

**Tests guarding it.** `packages/engine/test/complements/comitative.test.ts` → *known bugs: a
pronoun in the comitative renders as a noun*: all three former `test.fails` are now plain passing
tests, with their assertions unchanged — the third person across gender and number and in a
coordinated group, the first and second persons with the Spanish and Portuguese fusions, and the
instrumental — beside the regression test for Japanese, a noun companion, the causal pronoun, the
passive agent and the prepositional object.

Added there: both slots in one clause, in all seven languages (`with him with me`, `猫は彼と私で調整します。`),
the Portuguese 1pl fusion, the Spanish 2pl and the Portuguese neuter. Unit level:
[`tonicPronoun.test.ts`](../../../packages/engine/src/functions/tonicPronoun.test.ts) (a pronoun, a
pronoun with no tonic form, a noun) and the German
[`complementsPhrase.test.ts`](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.test.ts),
where the early return has to come before the case machinery.

No passing test changed its expectation.
