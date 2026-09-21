# B57. The UI nouns a seeded verb cannot tell apart — seed the words they turn on

_(from the unsorted sweep of 2026-09-22. Thirty-two nouns from the interface and the console that
[A23](../A-ready/A23-ui-nouns-patient-and-place.md) could not take: A23's thirteen were the ones
whose differentia is a seeded verb, and these are the rest, each waiting on one word. The biggest
single ticket of the sweep, and the one with the highest yield per word.)_

## Seed first

Proposed forms, for the seed author to check — suggestions, not renders.

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| SPEAK | verb | to say words aloud | speak | parlare | parler | sprechen | hablar | 話す | falar |
| ACCOMPANY | verb | to go along with another | accompany | accompagnare | accompagner | begleiten | acompañar | 同行する | acompanhar |
| ANSWER | verb | to say back what was asked for | answer | rispondere | répondre | antworten | responder | 答える | responder |
| SEARCH | verb | to look for something | search | cercare | chercher | suchen | buscar | 探す | procurar |
| ARRANGE | verb | to put things in an order | arrange | disporre | disposer | anordnen | disponer | 並べる | dispor |
| CONNECT | verb | to join two things so each reaches the other | connect | connettere | connecter | verbinden | conectar | 接続する | conectar |
| PICTURE | noun | a likeness of a thing, drawn or shown | picture | immagine | image | Bild | imagen | 画像 | imagem |
| LETTER | noun | one of the signs a word is written with | letter | lettera | lettre | Buchstabe | letra | 文字 | letra |
| SCREEN | noun | the lit surface a program shows itself on | screen | schermo | écran | Bildschirm | pantalla | 画面 | tela |
| PART | noun | one of the pieces a whole is made of | part | parte | partie | Teil | parte | 部分 | parte |
| ORDER_SEQUENCE | noun | the arrangement things are put in | order | ordine | ordre | Ordnung | orden | 順番 | ordem |
| FORMALITY | noun | how formal a way of speaking is | formality | formalità | formalité | Förmlichkeit | formalidad | 形式性 | formalidade |

Six verbs, six nouns. SPEAK, PART and PICTURE are the three that pay: SPEAK takes two, PART takes
four, PICTURE takes two.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| SPEAKER | `whoGloss('PERSON', 'SPEAK')` | a person who speaks |
| COMPANION | `whoGloss('PERSON', 'ACCOMPANY', 'PERSON')` | a person who accompanies people |
| SERVER | `whoGloss('PROCESS', 'ANSWER')` | a process that answers |
| RESULT | `patientGloss('CONCEPT', 'SEARCH')` | a concept that one searches |
| ICON | `glossOf('PICTURE', 'SMALL')` | a small picture |
| INTERFACE | `patientGloss('SCREEN', 'SEE')` at `bare` | screen that one sees |
| KEY | `glossOf('PART', …)` of a KEYBOARD — a genitive, see **Not solved** | — |
| KEYBOARD | `whoGloss('OBJECT_THING', 'TYPE', 'LETTER')` | an object that types letters |
| ARROW | `glossOf('KEY', …)` once KEY lands — see **Not solved** | — |
| ROW | `glossOf('PART', …)` of a LIST — see **Not solved** | — |
| LINE | `patientGloss('TEXT', 'TYPE')` at `bare` | text that one types |
| TOOLBAR | `whoGloss('ROW', 'HAVE', 'BUTTON')` | a row that has buttons |
| LIST | `patientGloss('GROUP', 'ARRANGE')` | a group that one arranges |
| GROUP | `patientGloss('CONCEPT', 'CONNECT')` | a concept that one connects |
| REGION | `glossOf('PART', …)` of a SCREEN — see **Not solved** | — |
| MENU | `patientGloss('LIST', 'CHOOSE')` | a list that one chooses |
| TAB | `patientGloss('PART', 'SHOW')` — see **Not solved** | — |
| CURSOR | `whoGloss('PICTURE', 'INDICATE', 'PLACE')` | a picture that indicates places |
| HISTORY | `patientGloss('LIST', 'WRITE')` | a list that one writes |
| WORKSPACE | `whereGloss('PLACE', 'MAKE', 'PHRASE')` — collides with CANVAS, see **Not solved** | — |
| USAGE | `patientGloss('WAY', 'USE')` at `bare` | way that one uses |
| NAVIGATION | `patientGloss('ACTION', 'MOVE_ONESELF')` | an action that one moves with — see **Not solved** |
| MAP | `whoGloss('PICTURE', 'SHOW', 'PLACE')` | a picture that shows places |
| NODE | `patientGloss('PART', 'CONNECT')` | a part that one connects |
| REFERENCE | `whoGloss('WORD', 'INDICATE', 'CONCEPT')` | a word that indicates concepts |
| NAME_NOUN | `patientGloss('WORD', 'NAME')` | a word that one names with |
| COMMAND | `patientGloss('WORD', 'ACCEPT')` — see **Not solved** | — |
| ORDER | `glossOf('COMMAND', …)` — see **Not solved** | — |
| INSTRUCTION | `patientGloss('WORD', 'READ')` — too wide, see **Not solved** | — |
| REGISTER | `dimGloss('FORMALITY', …)` — a noun, not an adjective, see **Not solved** | — |
| LOADING | `whoGloss('PROCESS', 'LOAD', 'CONTENT')` | a process that loads content |
| IMPORT_NOUN | `whoGloss('ACTION', 'IMPORT', 'FILE')` | an action that imports files |

**Twenty of thirty-two** land on shapes the engine renders today. That is the best ratio in the
sweep, and it is why this ticket is worth doing before the C tickets that need engine work.

## Not solved by this seed

1. **The four PART glosses — KEY, ROW, REGION, TAB — need a part-whole genitive**: *a part of a
   keyboard*, *a part of a screen*. `possessor` renders the genitive the other way round
   ("Italy's language", [B36](../done/B36-languages-by-country.md)), and a head that is the *part* needs
   the whole as its complement, not its possessor. ARROW waits on KEY. This is the same relation
   FLAME waits on in [B52](B52-natural-kind-genera.md), and it should be one C ticket, not five
   deferrals — file it when the first of the two is authored.
2. **WORKSPACE collides with CANVAS**, which A23 ships as `whereGloss('PLACE', 'MAKE', 'PHRASE')`.
   A workspace is *all the canvases at once*, a plural-of, which is the part-whole relation again,
   from the other end.
3. **COMMAND, ORDER and INSTRUCTION are one problem, not three.** They differ by *who is addressed*
   — an order tells a person, an instruction tells nobody, a command tells a program — and the
   addressee of an imperative is not a phrase a definition can carry. They belong with
   [C27](../C-needs-engine/C27-grammar-meta-nouns.md), whose concepts are all positions in a system.
4. **REGISTER wants `dimGloss` on FORMALITY**, but `dimGloss` glosses an *adjective* and REGISTER is
   a noun — the shape is right and the category is wrong. C27.
5. **NAVIGATION is an action noun derived from a verb**, the same shape LIFE needs in
   [B53](B53-substance-and-state-roots.md), and it waits on the same construct.

## Coverage

Three rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once
authored: SPEAKER in English and Italian (the plainest `whoGloss`), TOOLBAR in English and German
(a relative clause whose head is itself glossed in this ticket, so the two must not collide), and
MAP in English and Japanese (示す, a bare-plural object before the head).
