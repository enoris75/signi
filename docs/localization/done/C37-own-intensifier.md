# C37. OWN, the intensifier — "my own" needs a possessor to attach to

**Kind:** was blocked on a construct. P09's *own* was seeded only as the verb (OWN, "to have as
property"). The adjective of "my own cat" exists only beside a possessor, and in Japanese it replaces
the possessor.

_(from the P09 core-vocabulary sweep of 2026-09-22; [P09](../../features/P-planning/P09-core-vocabulary/README.md)
§3, **E10**. **Done** on 2026-09-22: the possessor-bound modifier shipped, OWN_ADJECTIVE is seeded
and glossed; see [Done](#done).)_

## The concept

| concept | role | forms |
|---|---|---|
| OWN_ADJECTIVE | adjective | own, proprio, propre, eigen, propio, 自分の, próprio |

The id follows OPEN_ADJECTIVE's, beside the verb it shares a word with.

## Was blocked on: an adjective that requires a possessor — resolved

Seeded as an ordinary adjective it would have been offered on any noun ("an own cat"), and it would
have rendered after the noun in the Romance languages, where it goes before (*il **proprio** gatto*,
*son **propre** chat*, *su **propio** gato*, *o seu **próprio** gato*). In Japanese 自分の is not
added to the possessor but **replaces** it: *his own cat* is 自分の猫, not 彼の自分の猫. There was no
plan to probe: nothing tied an adjective to the presence of a possessor.

## Done

**2026-09-22.** `NounPhrase.possessorOwn` — a flag beside `possessor`, not an entry in `adjectives`,
because the word exists only there. The translator resolves OWN_ADJECTIVE and hands it to the engines
as the **first adjective**, marked `possessor_bound`: it then agrees and declines by the ordinary
machinery, and six of the seven need no new code at all — the word was added to each Romance engine's
prenominal set, which is where it stands. Japanese is what the flag exists for.

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| his own cat runs | his own cat runs. | il suo proprio gatto corre. | son propre chat court. | sein eigener Kater läuft. | su propio gato corre. | **自分の猫は走ります。** | o seu próprio gato corre. |
| my own house runs (fem) | my own house runs. | la mia propria casa corre. | ma propre maison court. | mein eigenes Haus läuft. | mi propia casa corre. | 自分の家は走ります。 | a minha própria casa corre. |
| my own cats run (plural) | my own cats run. | i miei propri gatti corrono. | mes propres chats courent. | meine eigenen Kater laufen. | mis propios gatos corren. | 自分の猫は走ります。 | os meus próprios gatos correm. |
| my own big cat | my own big cat | il mio proprio grande gatto | mon propre grand chat | mein eigener großer Kater | mi propio gato grande | 自分の大きい猫 | o meu próprio gato grande |
| sees his own dog (acc) | | | | **seinen eigenen Hund** | | | |
| lives in his own house (dat) | | | | **in seinem eigenen Haus** | | | |
| the cat's own book (genitive) | the cat's own book | il proprio libro del gatto | le propre livre du chat | das eigene Buch des Katers | el propio libro del gato | **猫自身の本** | o próprio livro do gato |

What landed differently from the plan:

1. **A flag on the phrase, an adjective to the engines.** The file asked for "a flag beside
   `possessor` rather than an entry in `adjectives`". Both are true: the *plan* carries a flag, so the
   builder can offer it only where a possessor is set and no phrase can list it among its modifiers;
   the *engines* are handed an adjective, so agreement, German's declension and the Romance prenominal
   position all come for free.
2. **A genitive possessor takes a second Japanese word.** 自分の stands for a possessive pronoun and
   replaces it; where the owner is **named**, Japanese says 自身の after it — 猫自身の本, not
   猫の自分の本 — which the lexeme carries as `after_possessor`.
3. **It is glossed, not literal.** The file predicted literal by design, "since 'belonging to that
   person and no other' leans on SOLE and OTHER, both literal". A concept being literal does not stop
   a gloss standing on it, and the headless relative C23 built says exactly that:

   | | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | **OWN_ADJECTIVE** | that no other person owns | che nessun'altra persona possiede | qu'aucune autre personne ne possède | den keine andere Person besitzt | que ninguna otra persona posee | どの別の人も所有しない | que nenhuma outra pessoa possui |

   The rejected lead is the obvious one: "that a possessor owns" (de "den ein Besitzer besitzt")
   renders in all seven and defines *owned*, saying the word twice over.
4. **The builder does not offer it yet.** The flag is in the plan and rendered; a control on the
   possessor ring is what is left here.

Pinned in [`possessor-own.test.ts`](../../../packages/engine/test/possessor-own.test.ts).
