# C34. LIKE — the Romance verbs make the thing liked the subject

**Kind:** blocked on a construct. P09's verb *like* (the manner preposition "like the wind" is
already written by the engine) swaps its participants in Italian and Spanish, takes a preposition in
Portuguese and is an adjective in Japanese.

_(from the P09 core-vocabulary sweep of 2026-09-22; [P09](../../features/P-planning/P09-core-vocabulary/README.md)
§3, **E9**, split from the other two verbs of that row: HELP is [C35](C35-lexical-object-case.md)
and LET is [C36](C36-let-bare-infinitive.md).)_

## The concept

| concept | role | proposed forms (suggestions, not renders) |
|---|---|---|
| LIKE | verb | like, piacere, aimer, mögen, gustar, 好き (an adjective), gostar (de) |

## Blocked on

Probed 2026-09-22, engine source at HEAD, LIKE seeded in memory as a plain transitive verb:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| the cat likes the dog | the cat likes the dog. | il gatto piace il cane. | le chat aime le chien. | der Kater mag den Hund. | el gato gusta el perro. | 猫は犬を好みます。 | o gato gosta o cão. |

English, French and German are right. The others want:

- it ***al gatto** piace il cane*, es ***al gato le** gusta el perro* — the liker in the dative (with
  the clitic *le* doubling it in Spanish), the thing liked as the **subject**, and the verb agreeing
  with it (*al gatto piacciono i cani*);
- pt *o gato gosta **do** cão* — an ordinary subject and a prepositional object;
- ja 猫は犬**が好き**です — an adjectival predicate with the thing liked marked が; 好む, used in the
  probe, is literary.

## What would move it

An **experiencer verb** frame: a lexeme flag saying the plan's subject is rendered as the dative
experiencer and the plan's object as the grammatical subject, with agreement following the latter.
Italian and Spanish need it; the plan stays "cat likes dog" so the builder does not change.
Portuguese needs no construct: it reads `object_prep` already ([B60](../done/B60-saying-and-thinking-verbs.md)'s
BELIEVE renders *acredita na história* on `object_prep: 'em'`), so *gostar de* is a lexeme key.
Japanese needs a verb concept rendered as a な-adjective predicate (犬が好きです), which the copular
predicates already produce for adjectives.

The frame would serve *piacere / gustar*'s siblings as they are seeded (*mancare / faltar*, "to
miss"). LIKE's own gloss should be probed once it renders: "to find pleasant" needs a word the
corpus lacks, and FEEL + JOY is PLAY_GAME's differentia in [B62](../done/B62-doing-working-playing.md).
