# B38. CONJUNCTION and CONJUNCT — seed LINK: a word that links clauses

_(split out of [C05](../done/C05-non-distinguishing-genera.md) on 2026-09-21. The seeded
verb nearest to "join" is COORDINATE, and it is the wrong word: C08 seeded it as "to cause people to
act together", and its Japanese, 調整する, is to adjust.)_

## Seed first

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| LINK | verb, transitive | to join one thing to another | link | collegare | relier | verbinden | enlazar | つなぐ | ligar |

Forms are suggestions for the seed author, who writes the full paradigms. LINKED is already seeded
as an adjective ("joined to another by a link", [C12](../done/C12-ui-purpose-and-object-complements.md)).
Keep the verb's words in step with its participle where the language allows.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| CONJUNCTION | `whoGloss('WORD', 'LINK', 'CLAUSE')` | a word that links clauses |
| CONJUNCT | inline: PHRASE, relative with `headRole: 'directObject'`, subject an indefinite CONJUNCTION, verb LINK | a phrase that a conjunction links |

CONJUNCT's gloss cites CONJUNCTION, which this ticket also glosses. The two define each other only
through the relative clause, and a conjunct *is* what a conjunction joins.

### Probe renders (2026-09-21, engine source at HEAD, LINK from the table above through a lookup wrapper with only the present forms, nothing seeded)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| CONJUNCTION | a word that links clauses | una parola che collega proposizioni | un mot qui relie des propositions | ein Wort, das Sätze verbindet | una palabra que enlaza oraciones | 節をつなぐ単語 | uma palavra que liga orações |
| CONJUNCT | a phrase that a conjunction links | una frase che una congiunzione collega | une phrase qu'une conjonction relie | eine Phrase, die eine Konjunktion verbindet | una frase que una conjunción enlaza | 接続詞がつなぐフレーズ | uma frase que uma conjunção liga |

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

Add CONJUNCTION to [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts), in
English and Japanese (節をつなぐ単語).
