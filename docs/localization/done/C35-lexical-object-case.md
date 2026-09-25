# C35. HELP — a verb cannot choose its object's case

**Kind:** was blocked on a construct. P09's verb *help* was right in six languages and wrong in
German, where *helfen* governs the dative. The id is **HELP_VERB**: HELP is taken, by the noun
[B41](B41-ui-help-overlay.md) seeded for the help overlay ("content that one shows").

_(from the P09 core-vocabulary sweep of 2026-09-22; [P09](../../features/Z-Done/P09-core-vocabulary/README.md)
§3, **E9**, split from the other two verbs of that row: LIKE is [C34](C34-like-experiencer-verb.md)
and LET is [C36](C36-let-bare-infinitive.md). **Done** on 2026-09-22: the lexical case shipped,
HELP_VERB is seeded, and *fragen* was fixed with the same key; see [Done](#done).)_

## The concept

| concept | role | forms |
|---|---|---|
| HELP_VERB | verb | help, aiutare, aider, helfen (+ dative), ayudar, 手伝う, ajudar |

## Was blocked on: a verb choosing its object's case — resolved

Probed 2026-09-22, engine source at HEAD, HELP_VERB seeded in memory as a plain transitive verb:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| the cat helps the dog | the cat helps the dog. | il gatto aiuta il cane. | le chat aide le chien. | **der Kater hilft den Hund.** | el gato ayuda el perro. | 猫は犬を手伝います。 | o gato ajuda o cão. |

German wanted *hilft **dem** Hund*. Spanish *ayuda el perro*, without the personal *a* (*ayuda **al**
perro*), is the general animate-object question, not this verb's, and is not what this ticket was
about — it is still open, and still not this ticket's.

## Done

**2026-09-22.** `object_case` on the German lexeme names the case a verb governs its bare object in
([`objectCase.ts`](../../../packages/engine/src/languages/de/objectCase.ts)). Every place the object
is declined reads it: the article and its adjectives, the negative *kein*, an unstressed pronoun, the
dative plural -n, the relative pronoun, and the **passive**, which a dative verb forms impersonally —
the patient keeps its case and *werden* has nothing to agree with. Only German reads the key.

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| the cat helps the dog | the cat helps the dog. | il gatto aiuta il cane. | le chat aide le chien. | **der Kater hilft dem Hund.** | el gato ayuda el perro. | 猫は犬を手伝います。 | o gato ajuda o cão. |
| …a big dog | | | | **hilft einem großen Hund** | | | |
| …not a dog | | | | **hilft keinem Hund** | | | |
| …him | | | | **hilft ihm** | | | |
| …the dogs | | | | **hilft den Hunden** | | | |
| the dog that one helps | the dog that one helps. | il cane che si aiuta. | le chien qu'on aide. | **der Hund, dem man hilft.** | el perro que se ayuda. | 手伝う犬。 | o cão que se ajuda. |
| the dog is helped by the cat | the dog is helped by the cat. | il cane è aiutato dal gatto. | le chien est aidé par le chat. | **dem Hund wird vom Kater geholfen.** | el perro es ayudado por el gato. | 犬は猫に手伝われます。 | o cão é ajudado pelo gato. |
| the cat helped the dog | the cat helped the dog. | il gatto aiutò il cane. | le chat aida le chien. | **der Kater half dem Hund.** | el gato ayudó el perro. | 猫は犬を手伝いました。 | o gato ajudou o cão. |
| help the dog! | help the dog. | aiuta il cane. | aide le chien. | **hilf dem Hund.** | ayuda el perro. | 犬を手伝ってください。 | ajude o cão. |

What landed differently from the plan:

1. **The same key the other way round shipped too.** The file named *fragen*, which takes the person
   asked in the **accusative** where every other addressee verb takes the dative; German said "fragt
   dem Mann". `terminus_case: 'acc'` on the lexeme fixes it — "fragt den Mann", "fragt den Mann nach
   der Tatsache", "der Mann, den der Kater fragt" — and the relative gap takes it for free, because
   the relativizer is built from the same forms.
2. **The impersonal passive is undone in the engine, not in the translator.** The translator promotes
   the patient to subject for every language, as a personal passive needs; German is the one that
   declines it, so German is where the promotion is taken back — the subject renders in the dative
   and *werden* is forced to the 3rd singular ("den Hunden wird geholfen", never *"werden").
3. **HELP_VERB is literal by design.** Its gloss is what the corpus cannot say: there is no word for
   *easy*, *easier* or *support*, and every construct-free lead defines some other verb —

   | lead | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | CAUSE + ABLE at `more` | to cause a person to be abler | indurre una persona a essere più capace | induire une personne à être plus capable | eine Person veranlassen, fähiger zu sein | inducir a una persona a ser más capaz | 人がもっと可能であるようにする | induzir uma pessoa a ser mais capaz |
   | ACT + comitative PERSON | to act with a person | agire con una persona | agir avec une personne | mit einer Person handeln | actuar con una persona | 人と行動する | agir com uma pessoa |
   | GIVE STRENGTH + terminus PERSON | to give strength to a person | dare forza a una persona | donner la force à une personne | einer Person Stärke geben | dar fuerza a una persona | 人に強さをあげる | dar força a uma pessoa |
   | ACT + terminus PERSON OTHER | to act to another person | agire a un'altra persona | agir à une autre personne | einer anderen Person handeln | actuar a otra persona | 別の人に行動する | agir a outra pessoa |

   The first two say *enable* and *cooperate*, the third *encourage*, the fourth is ungrammatical in
   four languages. HELP_VERB keeps its English literal, "to make what another does easier".
4. **`glauben` with a person is recorded, not shipped.** German *glaubt dem Mann* is a **sense** of
   BELIEVE, not a case on the concept the corpus has — BELIEVE's object is a fact — so it wants
   `senseOf`, as EAT_ANIMAL and KNOW_ACQUAINTED do, and not this key. *Folgen*, *danken* and
   *gehören* need only `object_case` when they are seeded.

Pinned in [`lexical-case.test.ts`](../../../packages/engine/test/lexical-case.test.ts).
