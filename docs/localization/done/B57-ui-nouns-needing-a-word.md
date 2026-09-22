# B57. The UI nouns a seeded verb cannot tell apart — seed the words they turn on

_(from the unsorted sweep of 2026-09-22. Thirty-two nouns from the interface and the console that
[A23](A23-ui-nouns-patient-and-place.md) could not take: A23's thirteen were the ones
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
| SCREEN | noun | the lit surface a program shows itself on | screen | schermo | écran | Bildschirm | pantalla | 画面 | tela |
| PART | noun | one of the pieces a whole is made of | part | parte | partie | Teil | parte | 部分 | parte |

**Six verbs and four nouns — ten of the twelve proposed.** PICTURE is the one that pays best
(ICON, CURSOR, MAP). LETTER, ORDER_SEQUENCE and FORMALITY were dropped: FORMALITY buys only
REGISTER and ORDER_SEQUENCE nothing at all, both in **Not solved**, and LETTER lost its only caller
when KEYBOARD was reshaped (see below). PART pays once, not four times, for the same reason its four
other glosses are in **Not solved**.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| SPEAKER | `whoGloss('PERSON', 'SPEAK')` | a person who speaks |
| COMPANION | `whoGloss('PERSON', 'ACCOMPANY', 'PERSON')` | a person who accompanies people |
| SERVER | `whoGloss('PROCESS', 'ANSWER')` | a process that answers |
| RESULT | `patientGloss('CONCEPT', 'SEARCH')` | a concept that one searches |
| ICON | `glossOf('PICTURE', 'SMALL')` | a small picture — moved here from [A23](A23-ui-nouns-patient-and-place.md) |
| INTERFACE | `patientGloss('SCREEN', 'SEE')` | a screen that one sees |
| KEY | `glossOf('PART', …)` of a KEYBOARD — a genitive, see **Not solved** | — |
| KEYBOARD | `whoGloss('OBJECT_THING', 'HAVE', 'KEY')` | an object that has keys |
| ARROW | `glossOf('KEY', …)` once KEY lands — see **Not solved** | — |
| ROW | `glossOf('PART', …)` of a LIST — see **Not solved** | — |
| LINE | `patientGloss('TEXT', 'TYPE', 'bare')` | text that one types |
| TOOLBAR | `whoGloss('ROW', 'HAVE', 'BUTTON')` | a row that has buttons |
| LIST | `patientGloss('GROUP', 'ARRANGE')` | a group that one arranges |
| GROUP | `patientGloss('CONCEPT', 'CONNECT')` | a concept that one connects |
| REGION | `glossOf('PART', …)` of a SCREEN — see **Not solved** | — |
| MENU | `patientGloss('LIST', 'CHOOSE')` | a list that one chooses |
| TAB | `patientGloss('PART', 'SHOW')` — see **Not solved** | — |
| CURSOR | `whoGloss('PICTURE', 'INDICATE', 'PLACE')` | a picture that indicates places |
| HISTORY | `patientGloss('LIST', 'WRITE')` | a list that one writes |
| WORKSPACE | `whereGloss('PLACE', 'MAKE', 'PHRASE')` — collides with CANVAS, see **Not solved** | — |
| USAGE | `patientGloss('WAY', 'USE')` | a way that one uses |
| NAVIGATION | `patientGloss('ACTION', 'MOVE_ONESELF')` | an action that one moves with — see **Not solved** |
| MAP | `whoGloss('PICTURE', 'SHOW', 'PLACE')` | a picture that shows places |
| NODE | `patientGloss('PART', 'CONNECT')` | a part that one connects |
| REFERENCE | `whoGloss('WORD', 'INDICATE', 'CONCEPT')` | a word that indicates concepts |
| NAME_NOUN | `patientGloss('WORD', 'NAME')` — the gap is wrong, see **Not solved** | — |
| COMMAND | `patientGloss('WORD', 'ACCEPT')` — see **Not solved** | — |
| ORDER | `glossOf('COMMAND', …)` — see **Not solved** | — |
| INSTRUCTION | `patientGloss('WORD', 'READ')` — too wide, see **Not solved** | — |
| REGISTER | `dimGloss('FORMALITY', …)` — a noun, not an adjective, see **Not solved** | — |
| LOADING | `whoGloss('PROCESS', 'LOAD', 'CONTENT', 'singular')` | a process that loads content |
| IMPORT_NOUN | `whoGloss('ACTION', 'IMPORT', 'FILE')` | an action that imports files |

**Twenty of thirty-two** land on shapes the engine renders today. That is the best ratio in the
sweep, and it is why this ticket is worth doing before the C tickets that need engine work. (The
count held: NAME_NOUN fell out on authoring and ICON, moved here from A23, took its place.)

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
6. **NAME_NOUN needs an instrument gap, not an object gap.** `patientGloss('WORD', 'NAME')` renders
   "a word that one names", which says the word is the thing *named*; a name is what one names
   **with**. That is the gap MATERIAL waits on in [B53](B53-substance-and-state-roots.md), and it
   would collide with NOUN's shipped "a word that names objects" besides. C26, with MATERIAL.

## Coverage

Three rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once
authored: SPEAKER in English and Italian (the plainest `whoGloss`), TOOLBAR in English and German
(a relative clause whose head is itself glossed in this ticket, so the two must not collide), and
MAP in English and Japanese (示す, a bare-plural object before the head).

## Done

Shipped 2026-09-22. **Ten words seeded** (the verbs SPEAK, ACCOMPANY, ANSWER, SEARCH, ARRANGE,
CONNECT and the nouns PICTURE, SCREEN, PART — with LETTER dropped) and **twenty glosses** authored
in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts).

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| SPEAKER | a person who speaks | una persona che parla | une personne qui parle | eine Person, die spricht | una persona que habla | 話す人 | uma pessoa que fala |
| COMPANION | a person who accompanies people | una persona che accompagna persone | une personne qui accompagne des personnes | eine Person, die Personen begleitet | una persona que acompaña personas | 人を同行する人 | uma pessoa que acompanha pessoas |
| SERVER | a process that answers | un processo che risponde | un processus qui répond | ein Prozess, der antwortet | un proceso que responde | 答える過程 | um processo que responde |
| RESULT | a concept that one seeks | un concetto che si cerca | un concept qu'on cherche | ein Begriff, den man sucht | un concepto que se busca | 探す概念 | um conceito que se procura |
| ICON | a small picture | una piccola immagine | une petite image | ein kleines Bild | una imagen pequeña | 小さい画像 | uma imagem pequena |
| INTERFACE | a screen that one sees | uno schermo che si vede | un écran qu'on voit | ein Bildschirm, den man sieht | una pantalla que se ve | 見る画面 | uma tela que se vê |
| KEYBOARD | an object that has keys | un oggetto che ha tasti | un objet qui a des touches | ein Gegenstand, der Tasten hat | un objeto que tiene teclas | キーがある物体 | um objeto que tem teclas |
| LINE | text that one types | testo che si digita | texte qu'on tape | Text, den man tippt | texto que se teclea | 入力するテキスト | texto que se digita |
| TOOLBAR | a row that has buttons | una riga che ha pulsanti | une ligne qui a des boutons | eine Zeile, die Tasten hat | una fila que tiene botones | ボタンがある行 | uma linha que tem botões |
| LIST | a group that one arranges | un gruppo che si dispone | un groupe qu'on dispose | eine Gruppe, die man anordnet | un grupo que se dispone | 並べるグループ | um grupo que se dispõe |
| GROUP | a concept that one connects | un concetto che si connette | un concept qu'on connecte | ein Begriff, den man verbindet | un concepto que se conecta | 接続する概念 | um conceito que se conecta |
| MENU | a list that one chooses | un elenco che si sceglie | une liste qu'on choisit | eine Liste, die man wählt | una lista que se elige | 選ぶ一覧 | uma lista que se escolhe |
| CURSOR | a picture that indicates places | un'immagine che indica luoghi | une image qui indique des lieux | ein Bild, das Orte bezeichnet | una imagen que indica lugares | 場所を示す画像 | uma imagem que indica lugares |
| HISTORY | a list that one writes | un elenco che si scrive | une liste qu'on écrit | eine Liste, die man schreibt | una lista que se escribe | 書く一覧 | uma lista que se escreve |
| USAGE | a way that one uses | un modo che si usa | une manière qu'on utilise | eine Weise, die man verwendet | una manera que se usa | 使う方法 | uma maneira que se usa |
| MAP | a picture that shows places | un'immagine che mostra luoghi | une image qui montre des lieux | ein Bild, das Orte zeigt | una imagen que muestra lugares | 場所を見せる画像 | uma imagem que mostra lugares |
| NODE | a part that one connects | una parte che si connette | une partie qu'on connecte | ein Teil, den man verbindet | una parte que se conecta | 接続する部分 | uma parte que se conecta |
| REFERENCE | a word that indicates concepts | una parola che indica concetti | un mot qui indique des concepts | ein Wort, das Begriffe bezeichnet | una palabra que indica conceptos | 概念を示す単語 | uma palavra que indica conceitos |
| LOADING | a process that loads content | un processo che carica contenuto | un processus qui charge du contenu | ein Prozess, der Inhalt lädt | un proceso que carga contenido | 内容を読み込む過程 | um processo que carrega conteúdo |
| IMPORT_NOUN | an action that imports files | un'azione che importa file | une action qui importe des fichiers | eine Handlung, die Dateien importiert | una acción que importa archivos | ファイルを取り込む動作 | uma ação que importa arquivos |

What landed differently from the plan:

1. **KEYBOARD has keys; it does not type letters.** `whoGloss('OBJECT_THING', 'TYPE', 'LETTER')`
   renders in all seven, but it makes the keyboard the agent of typing, which a person is. KEY is
   already seeded, and "an object that has keys" is true, idiomatic in all seven, and distinguishing
   in a corpus with no piano. LETTER, whose only caller this was, was not seeded.
2. **SEARCH's English lemma is "seek", not "search".** `patientGloss('CONCEPT', 'SEARCH')` gaps the
   object, and English *search* takes the place searched, not the thing sought — "a concept that one
   searches" says the wrong thing where the other six say the right one. With *seek*, all seven
   agree.
3. **NAME_NOUN fell out** on the instrument gap; see **Not solved**. ALIAS, which glosses
   `glossOf('NAME_NOUN', 'OTHER')` in [A26](A26-kin-roles-and-kinds.md), needs only the
   word's form and is unaffected.
4. **ICON arrived from [A23](A23-ui-nouns-patient-and-place.md)**, which had it as "an
   object that one sees" and said so itself: seed PICTURE and gloss it as the small picture it is.
5. **`whoGloss` learned an object number.** LOADING's object is CONTENT in its mass sense — "loads
   content", not *contents* — but CONTENT is a count noun elsewhere in the corpus (B10 pins *die
   Inhalte*), so the number is the gloss's choice and not the lexeme's.
6. **Portuguese *dispor* is *pôr*'s compound**, which its irregular preterite shows (*dispus*,
   subjunctive *dispuséssemos*); `hypothetical.test.ts`'s class table lists it beside *fazer*'s
   compounds.
