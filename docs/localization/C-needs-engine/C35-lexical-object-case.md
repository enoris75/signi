# C35. HELP — a verb cannot choose its object's case

**Kind:** blocked on a construct. P09's verb *help* is right in six languages and wrong in German,
where *helfen* governs the dative. The id is **HELP_VERB**: HELP is taken, by the noun
[B41](../done/B41-ui-help-overlay.md) seeded for the help overlay ("content that one shows").

_(from the P09 core-vocabulary sweep of 2026-09-22; [P09](../../features/P-planning/P09-core-vocabulary/README.md)
§3, **E9**, split from the other two verbs of that row: LIKE is [C34](C34-like-experiencer-verb.md)
and LET is [C36](C36-let-bare-infinitive.md).)_

## The concept

| concept | role | proposed forms (suggestions, not renders) |
|---|---|---|
| HELP_VERB | verb | help, aiutare, aider, helfen (+ dative), ayudar, 手伝う, ajudar |

## Blocked on

Probed 2026-09-22, engine source at HEAD, HELP_VERB seeded in memory as a plain transitive verb:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| the cat helps the dog | the cat helps the dog. | il gatto aiuta il cane. | le chat aide le chien. | der Kater hilft den Hund. | el gato ayuda el perro. | 猫は犬を手伝います。 | o gato ajuda o cão. |

German wants *hilft **dem** Hund*. Spanish *ayuda el perro*, without the personal *a* (*ayuda **al**
perro*), is the general animate-object question, not this verb's, and is not what this ticket is
about.

## What would move it

A lexical key on the German lexeme naming its object's case (`object_case: 'dat'`), read wherever
the object is declined — article, adjective, pronoun (*hilft ihm*), relative (*dem man hilft*) and
the passive, which a dative verb forms impersonally (*ihm wird geholfen*, not *er wird geholfen*).

The same key serves the German uses B60 recorded without a concept of their own: *glauben* with a
person (*glaubt dem Mann*, BELIEVE's person sense) and, the other way round, *fragen*, which takes
the person asked in the **accusative** (*fragt den Mann*) where the terminus renders *dem Mann*.
*Folgen*, *danken* and *gehören* are the next dative verbs the corpus would meet. HELP_VERB's own
gloss should be probed once it renders.
