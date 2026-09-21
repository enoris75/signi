# B37. Five complement names — seed what each one indicates

_(split out of [C05](../C-needs-engine/C05-non-distinguishing-genera.md) on 2026-09-21. C05 said
"the nine complement names left" once COMPLEMENT_GRAMMAR became their genus.
[B31](../done/B31-complement-genus.md) glossed the genus and three of the nine. The other six, which
B23 seeded, got no gloss and no ticket, and neither did COMITATIVE, which C12 seeded. CAUSE_COMPLEMENT and LOCATIVE compose from seeded words and went to
[A18](../A-ready/A18-grammar-nouns.md). These five each need a noun.)_

All five use B31's shape, `whoGloss('COMPLEMENT_GRAMMAR', 'INDICATE', <noun>)`: "a complement that
indicates means". It is the same shape INSTRUMENTAL and ADVERBIAL_OF_MANNER ship with, so the
siblings differ only in the noun.

## Seed first

Forms are suggestions for the seed author. COMPANION and RECIPIENT are `animate` and `human`.

| concept | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| DESTINATION | where a motion ends | destination(s) | destinazione, -i (f) | destination(s) (f) | Ziel, -e (n) | destino(s) (m) | 目的地 (もくてきち) | destino(s) (m) |
| ORIGIN | where a motion starts | origin(s) | origine, -i (f) | origine(s) (f) | Ausgangspunkt, -e (m) | origen, orígenes (m) | 起点 (きてん) | origem, origens (f) |
| PATH | the way a motion goes through | path(s) | percorso, -i (m) | parcours (m) | Weg, -e (m) | recorrido(s) (m) | 経路 (けいろ) | percurso(s) (m) |
| COMPANION | one who does something with another | companion(s) | compagno, -i (m) | compagnon(s) (m) | Begleiter (m) | compañero(s) (m) | 同伴者 (どうはんしゃ) | companheiro(s) (m) |
| RECIPIENT | one who receives something | recipient(s) | destinatario, -i (m) | destinataire(s) (m) | Empfänger (m) | destinatario(s) (m) | 受け手 (うけて) | destinatário(s) (m) |

## Unlocks

| concept | object | gloss (en) |
|---|---|---|
| DIRECTION | DESTINATION | a complement that indicates destinations |
| SOURCE | ORIGIN | a complement that indicates origins |
| ROUTE | PATH | a complement that indicates paths |
| COMITATIVE | COMPANION | a complement that indicates companions |
| TERMINUS | RECIPIENT | a complement that indicates recipients |

### Probe renders (2026-09-21, engine source at HEAD, the five nouns from the table above through a lookup wrapper, nothing seeded)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| DIRECTION | a complement that indicates destinations | un complemento che indica destinazioni | un complément qui indique des destinations | eine Ergänzung, die Ziele bezeichnet | un complemento que indica destinos | 目的地を示す補語 | um complemento que indica destinos |
| SOURCE | a complement that indicates origins | un complemento che indica origini | un complément qui indique des origines | eine Ergänzung, die Ausgangspunkte bezeichnet | un complemento que indica orígenes | 起点を示す補語 | um complemento que indica origens |
| ROUTE | a complement that indicates paths | un complemento che indica percorsi | un complément qui indique des parcours | eine Ergänzung, die Wege bezeichnet | un complemento que indica recorridos | 経路を示す補語 | um complemento que indica percursos |
| COMITATIVE | a complement that indicates companions | un complemento che indica compagni | un complément qui indique des compagnons | eine Ergänzung, die Begleiter bezeichnet | un complemento que indica compañeros | 同伴者を示す補語 | um complemento que indica companheiros |
| TERMINUS | a complement that indicates recipients | un complemento che indica destinatari | un complément qui indique des destinataires | eine Ergänzung, die Empfänger bezeichnet | un complemento que indica destinatarios | 受け手を示す補語 | um complemento que indica destinatários |

**Why not PLACE for the three motion names:** LOCATIVE takes "places" ([A18](../A-ready/A18-grammar-nouns.md)).
DIRECTION, SOURCE and ROUTE also name places, but a place *reached*, *left* and *crossed*. A
relative clause could say that ("the place where one goes"), but a relative clause inside the
complement's own relative clause is past what these glosses need. The three nouns say it in a word.

## Coverage

Add one to [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts); B31's
complement case is the model.
