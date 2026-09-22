# C34. LIKE — the Romance verbs make the thing liked the subject

**Kind:** was blocked on a construct. P09's verb *like* (the manner preposition "like the wind" is
already written by the engine) swaps its participants in Italian and Spanish, takes a preposition in
Portuguese and is an adjective in Japanese.

_(from the P09 core-vocabulary sweep of 2026-09-22; [P09](../../features/P-planning/P09-core-vocabulary/README.md)
§3, **E9**, split from the other two verbs of that row: HELP is [C35](C35-lexical-object-case.md)
and LET is [C36](C36-let-bare-infinitive.md). **Done** on 2026-09-22: the experiencer frame shipped,
LIKE is seeded and glossed; see [Done](#done).)_

## The concept

| concept | role | forms |
|---|---|---|
| LIKE | verb | like, piacere, aimer, mögen, gustar, 好き (an adjective), gostar (de) |

## Was blocked on: an experiencer frame — resolved

Probed 2026-09-22, engine source at HEAD, LIKE seeded in memory as a plain transitive verb:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| the cat likes the dog | the cat likes the dog. | **il gatto piace il cane.** | le chat aime le chien. | der Kater mag den Hund. | **el gato gusta el perro.** | **猫は犬を好みます。** | **o gato gosta o cão.** |

English, French and German were right. The others wanted the liker in the dative with the thing liked
as the **subject** (and the verb agreeing with it), a prepositional object in Portuguese, and in
Japanese an adjectival predicate — 好む, used in the probe, is literary.

## Done

**2026-09-22.** `experiencer` on the Italian and Spanish lexemes. It re-maps the clause in the
translator, exactly where the passive is re-mapped and for the same reason: the thing liked becomes
the grammatical **subject** — so the verb agrees with it — and the one who likes becomes the
`terminus` complement, the bare dative those languages already render. The plan stays "cat likes
dog" in all seven, so the builder never changes.

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| the cat likes the dog | the cat likes the dog. | **il cane piace al gatto.** | le chat aime le chien. | der Kater mag den Hund. | **el perro le gusta al gato.** | **猫は犬が好きです。** | **o gato gosta do cão.** |
| the cat likes the dog**s** | the cat likes the dogs. | **i cani piacciono al gatto.** | les chats aiment le chien. | der Kater mag die Hunde. | **los perros le gustan al gato.** | 猫は犬が好きです。 | o gato gosta dos cães. |
| the cat**s** like the dog | the cats like the dog. | il cane piace **ai gatti**. | | | el perro **les** gusta a los gatos. | | |
| **I** like the dog | I like the dog. | il cane piace a me. | j'aime le chien. | ich mag den Hund. | el perro **me** gusta a mí. | 私は犬が好きです。 | gosto do cão. |
| does not like | the cat does not like the dog. | il cane non piace al gatto. | le chat n'aime pas le chien. | der Kater mag den Hund nicht. | el perro no le gusta al gato. | 猫は犬が好きではありません。 | o gato não gosta do cão. |
| liked (past) | the cat liked the dog. | il cane piaceva al gatto. | le chat aimait le chien. | der Kater mochte den Hund. | el perro le gustaba al gato. | 猫は犬が好きでした。 | o gato gostava do cão. |
| the cat **that** likes the dog | the cat that likes the dog. | **il gatto al quale il cane piace.** | le chat qui aime le chien. | der Kater, der den Hund mag. | **el gato al que el perro le gusta.** | 犬が好きな猫。 | o gato que gosta do cão. |
| the dog **that** the cat likes | the dog that the cat likes. | **il cane che piace al gatto.** | le chien que le chat aime. | der Hund, den der Kater mag. | **el perro que le gusta al gato.** | 猫が好きな犬。 | o cão do qual o gato gosta. |

What landed differently from the plan:

1. **The re-map is the translator's, not each engine's.** The file described what Italian and Spanish
   want; the machinery for it already existed — the passive does the same thing — so the frame is 20
   lines beside it and no Romance engine changed.
2. **The relative clause re-maps too, and its gap moves.** The file did not name it. A head gapped as
   the **subject** is the clause's dative ("il gatto **al quale** il cane piace"); a head gapped as the
   **object** is its subject ("il cane **che** piace al gatto").
3. **Spanish needed the clitic, and it agrees in person.** *Le* / *les* doubling the dative is
   obligatory there, and with a pronoun experiencer it is *me* / *te* ("a mí **me** gusta"). It fires
   on the terminus, or on the terminus **gap** of a relative clause. The general question — Spanish
   doubles *every* full-NP dative, and the engine still writes "da el libro al hombre" — is untouched
   and remains open.
4. **Japanese needed no verb at all.** `adjectival` on the ja lexeme makes 好き the predicate and
   `object_particle: 'が'` marks the thing liked; everything else follows from the copula path, so
   tense, negation, the relative clause (犬が好きな猫) and a modal all compose.
5. **The citation drops a generic experiencer**, as the passive drops a generic agent: no language
   says "piacere a si". What is left — it "piacere", es "gustar" — cannot name the thing liked,
   because in those two languages that thing is the verb's subject and a citation has none. That is a
   fact about Italian and Spanish, not a gap in the plan.
6. **LIKE is glossed by the joy the thing causes**, "to find pleasant" needing a word the corpus
   lacks:

   | | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | **LIKE** | to feel joy because of an object | provare gioia a causa di un oggetto | éprouver de la joie à cause d'un objet | Freude wegen eines Gegenstands fühlen | sentir alegría a causa de un objeto | 物体のために喜びを感じる | sentir alegria por causa de um objeto |

   FEEL + JOY alone is PLAY_GAME's differentia ([B62](B62-doing-working-playing.md)); the cause is
   what tells them apart. "To have affection for an object" was the other lead and is wrong in German
   ("Zuneigung **in** einen Gegenstand haben") and thin in English ("to an object").

The frame will serve *piacere / gustar*'s siblings as they are seeded (*mancare / faltar*, "to miss").
Pinned in [`experiencer-verb.test.ts`](../../../packages/engine/test/experiencer-verb.test.ts).
