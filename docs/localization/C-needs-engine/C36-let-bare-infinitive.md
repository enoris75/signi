# C36. LET — a bare infinitive, and a Japanese causative verb form

**Kind:** blocked on a construct. P09's *let* (allow someone to act) is closer than P09's §3 row
suggests: [C08](../done/C08-copular-and-genus-verbs.md)'s object-controlled infinitive already renders
four languages. What is missing is the bare infinitive of English and German and the Japanese
causative.

_(from the P09 core-vocabulary sweep of 2026-09-22; [P09](../../features/P-planning/P09-core-vocabulary/README.md)
§3, **E9**, split from the other two verbs of that row, with which it shares no mechanism: LIKE is
[C34](C34-like-experiencer-verb.md) and HELP is [C35](C35-lexical-object-case.md).)_

## The concepts

| concept | role | why it waits |
|---|---|---|
| LET | verb | cannot be seeded until it renders in en, de and ja (below). Proposed: let, lasciare, laisser, lassen, dejar, 〜させる (a suffix), deixar |
| ALLOWED | adjective ([B63](../done/B63-modal-verbs-may-should-might.md)) | **seeded 2026-09-22** for MAY's gloss; its own gloss is the state LET leaves, as SAVED is SAVE's: "that one has let" (`stateGloss`), so it waits here |

## Blocked on

Probed 2026-09-22, engine source at HEAD, LET seeded in memory with `causative: '1'` and no
`infinitive_link`, beside the shipped CAUSE_VERB:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| the cat lets the dog run | the cat lets the dog to run. | il gatto lascia il cane correre. | le chat laisse le chien courir. | der Kater lässt den Hund, zu laufen. | el gato deja el perro correr. | 猫は犬が走ることをします。 | o gato deixa o cão correr. |
| the cat causes the dog to run (CAUSE_VERB, shipped) | the cat causes the dog to run. | il gatto induce il cane a correre. | le chat induit le chien à courir. | der Kater veranlasst den Hund, zu laufen. | el gato induce el perro a correr. | 猫は犬が走るようにします。 | o gato induz o cão a correr. |

French, Spanish and Portuguese are right, and Italian is grammatical (*lascia correre il cane*, the
infinitive first, is the usual order). English writes *to* and German *zu* with a comma, where both
take a **bare** infinitive (*lets the dog run*, *lässt den Hund laufen*). Japanese lost the verb
entirely: the candidate's 許す ("permit") was replaced by the causative's する, and what Japanese says
is the causative form of the governed verb, 犬を走らせる.

## What would move it

Two lexical flags on the governor, the way `infinitive_link` already is one:

1. **a bare infinitive** — no *to*, no *zu*, and in German no comma, the infinitive staying in the
   verb cluster (*hat den Hund laufen lassen*, with the *Ersatzinfinitiv*);
2. **a Japanese causative**: the governed verb takes its 〜させる / 〜せる form and the causee
   を or に, with no governing verb of its own.

Then LET is seeded, ALLOWED's gloss becomes `stateGloss('PERSON', 'LET')` or its like, and the
Spanish *deja el perro* shares the personal-*a* question with [C35](C35-lexical-object-case.md).
