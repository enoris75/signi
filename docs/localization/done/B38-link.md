# B38. CONJUNCTION and CONJUNCT — seed LINK: a word that links clauses

_(split out of [C05](C05-non-distinguishing-genera.md) on 2026-09-21. The seeded
verb nearest to "join" is COORDINATE, and it is the wrong word: C08 seeded it as "to cause people to
act together", and its Japanese, 調整する, is to adjust. **Done 2026-09-21**, CONJUNCT in the passive:
see [Done](#done-2026-09-21).)_

## Seed first

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| LINK | verb, transitive | to join one thing to another | link | collegare | relier | verbinden | enlazar | つなぐ | ligar |

LINK was seeded ahead of this ticket, with its full paradigms and the German goal "mit"
(`terminus_prep`), at [verbs/transitive.ts:3489](../../../packages/backend/src/concepts/verbs/transitive.ts#L3489),
because [B47](B47-ui-console-command-purposes.md) needs it too. Its words keep step with
the seeded participle LINKED ([C12](C12-ui-purpose-and-object-complements.md)): *collegato*, *relié*,
*verbunden*, つながった.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| CONJUNCTION | `whoGloss('WORD', 'LINK', 'CLAUSE')` | a word that links clauses |
| CONJUNCT | inline: PHRASE, relative with `headRole: 'directObject'`, subject an indefinite CONJUNCTION, verb LINK **in the passive** | a phrase that is linked by a conjunction |

CONJUNCT's gloss cites CONJUNCTION, which this ticket also glosses. The two define each other only
through the relative clause, and a conjunct *is* what a conjunction joins.

### CONJUNCT: the active reads backwards in German

The ticket's plan was the active, "a phrase that a conjunction links". Probed with LINK seeded:

| voice | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| active | a phrase that a conjunction links | una frase che una congiunzione collega | une phrase qu'une conjonction relie | eine Phrase, **die eine Konjunktion verbindet** | una frase que una conjunción enlaza | 接続詞がつなぐフレーズ | uma frase que uma conjunção liga |
| **passive** | a phrase that is linked by a conjunction | una frase che è collegata da una congiunzione | une phrase qui est reliée par une conjonction | eine Phrase, die von einer Konjunktion verbunden wird | una frase que es enlazada por una conjunción | 接続詞につながれるフレーズ | uma frase que é ligada por uma conjunção |

German *Phrase* and *Konjunktion* are both feminine, so neither the relative pronoun *die* nor the
article *eine* shows which is the subject, and the subject-first reading comes first: "a phrase that
links a conjunction". The Romance word order keeps the active right there (the subject after *che* /
*que* marks *che* as the object, and French *qu'* is the object form), and Japanese is right either way.
The passive says it once in German, "die von einer Konjunktion verbunden wird", and reads right in the
other six. A plural subject would also have disambiguated German ("die Konjunktionen verbinden"), but
it leaves the Romance subject bare, "una frase che congiunzioni collegano". An object-gap relative
takes the passive as asked: the head is the promoted patient, and the relative's subject becomes the
by-phrase. (B48 says such a relative "falls back to active"; re-probed on 2026-09-21 it does not, "a
mouse that is eaten by the cat", de "eine Maus, die vom Kater gefressen wird".)

### Rejected: COORDINATE, no seed

| concept | en | ja |
|---|---|---|
| CONJUNCTION | a word that coordinates clauses | 節を**調整する**単語 |
| CONJUNCT | a phrase that one coordinates | **調整する**フレーズ |

Grammatical coordination in Japanese is 等位, not 調整. COORDINATE's Japanese is right for the verb it
is (people acting together), so the fix is a different verb, not a different lexeme.

**COORDINATION** itself stays in C05. It is the event ("the joining of clauses"), and nothing seeded
names an event as the genus.

## Coverage

CONJUNCTION in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts), in English and
Japanese (節をつなぐ単語).

## Done (2026-09-21)

**Both shipped** in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts) (CONJUNCT at
[line 2499](../../../packages/backend/src/concepts/nouns.ts#L2499), CONJUNCTION after it). Rendered at
boot:

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| CONJUNCTION | a word that links clauses | una parola che collega proposizioni | un mot qui relie des propositions | ein Wort, das Sätze verbindet | una palabra que enlaza oraciones | 節をつなぐ単語 | uma palavra que liga orações |
| CONJUNCT | a phrase that is linked by a conjunction | una frase che è collegata da una congiunzione | une phrase qui est reliée par une conjonction | eine Phrase, die von einer Konjunktion verbunden wird | una frase que es enlazada por una conjunción | 接続詞につながれるフレーズ | uma frase que é ligada por uma conjunção |

What landed differently from the plan:

1. **CONJUNCT is in the passive**, "a phrase that is linked by a conjunction", for the German reading
   above. The Italian participle agrees with the feminine head (*collegata*), as does the French
   (*reliée*) and the Portuguese (*ligada*).
2. **LINK was seeded ahead of the ticket**, shared with B47, so this ticket seeded nothing.
3. **CONJUNCT hangs under PHRASE**, its gloss's genus; it was a root.

- Tests: both glosses in [definition-words.test.ts](../../../packages/engine/test/definition-words.test.ts);
  LINK's paradigm and its German "mit" in
  [program-controls.test.ts](../../../packages/engine/test/program-controls.test.ts); CONJUNCTION in
  en + ja in [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts).
