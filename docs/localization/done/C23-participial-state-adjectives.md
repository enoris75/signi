# C23. The participial state adjectives — a headless relative clause

**Kind:** was blocked on a construct. Twenty-two adjectives, nearly every one of them the state a
seeded verb leaves behind — SAVED is what SAVE leaves, PINNED what PIN leaves — and the engine had
exactly one adjective gloss, `dimGloss`, which says "at/of <degree> <dimension>" and nothing else.

_(from the unsorted sweep of 2026-09-22. **Done** on 2026-09-22: twenty-one shipped on the
headless relative clause, and KNOWN, seeded by [C24](C24-grammar-feature-adjectives.md), a
twenty-second in the batch's integration pass; RECENT is literal by design, and so are CLOSED and
OPEN_ADJECTIVE, which [C28](C28-verb-roots-without-a-gloss.md) seeded the same day and which join
this family. See [Done](#done).)_

## The concepts

WRITTEN, LOADED, TIDY, SAVED, ADDED, REMOVED, FAILED, COPIED, LINKED, PINNED, UNPINNED, RECENT,
NUMBERED, ACTIVE, UNTITLED, EMPTY, VALID, MISSING, UNKNOWN, UNEXPECTED, HIDDEN, VISIBLE — and,
added 2026-09-22, CLOSED and OPEN_ADJECTIVE (from C28) and KNOWN (from C24).

## Was blocked on: a headless relative clause — resolved

`patientGloss` built the clause and gave it a head, which made it a **noun phrase**, the wrong
category for an adjective's tooltip — "an object that one saves" defines *a saved thing*, not
*saved*, and put in the picker beside FILE, which [A23](A23-ui-nouns-patient-and-place.md) ships as
"an object that one saves", the two would have read as the same word:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| SAVED, the ticket's headed `patientGloss` at `bare` | object that one saves | oggetto che si salva | objet qu'on enregistre | Gegenstand, den man speichert | objeto que se guarda | 保存する物体 | objeto que se salva |

This file recommended option 1, a render mode that says the relative clause alone, and that is
what was built: **`NounPhrase.relativeGloss`**, the headless relative (K1, in the same wave). The
head is not spoken, but it is still the clause's antecedent: German's relative pronoun takes its
gender and the gap's case, English says *who* only of a person, and the Romance participles agree
with it. The helpers are in
[relativeGloss.ts](../../../packages/backend/src/concepts/relativeGloss.ts): `stateGloss` (the
object gap with the generic "one", resultative by default), `subjectGapGloss`, `namedAgentGloss`
and the base `relativeGloss`. Option 2, a true participle on the lexeme, was not needed.

**Every antecedent is OBJECT_THING.** These are properties of the app's things — files, phrases,
slots, options, periods — and one class keeps the tooltips reading as a set: German says *den … /
der …* throughout. PROCESS would have read the same in German for FAILED and ACTIVE (*der*), and
ACTION's *Handlung* does not *funktionieren*.

## The verdicts

Probed 2026-09-22 against the engine source at aff5d5b (the base plus the A206 / A213 passive-*se*
fixes); shipped plans in bold. A word marked \* was probed through a lookup wrapper and is **not**
seeded.

### The state an event leaves — shipped: "that one has …"

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **WRITTEN: WRITE** | that one has written | che si è scritto | qu'on a écrit | den man geschrieben hat | que se ha escrito | 書いた | que se escreveu |
| **LOADED: LOAD** | that one has loaded | che si è caricato | qu'on a chargé | den man geladen hat | que se ha cargado | 読み込んだ | que se carregou |
| **SAVED: SAVE** | that one has saved | che si è salvato | qu'on a enregistré | den man gespeichert hat | que se ha guardado | 保存した | que se salvou |
| **ADDED: ADD** | that one has added | che si è aggiunto | qu'on a ajouté | den man hinzugefügt hat | que se ha añadido | 加えた | que se adicionou |
| **REMOVED: REMOVE** | that one has removed | che si è rimosso | qu'on a retiré | den man entfernt hat | que se ha quitado | 取り除いた | que se removeu |
| **COPIED: COPY** | that one has copied | che si è copiato | qu'on a copié | den man kopiert hat | que se ha copiado | コピーした | que se copiou |
| **LINKED: LINK** | that one has linked | che si è collegato | qu'on a relié | den man verbunden hat | que se ha enlazado | つないだ | que se ligou |
| **PINNED: PIN** | that one has pinned | che si è fissato | qu'on a épinglé | den man angeheftet hat | que se ha fijado | ピン留めした | que se fixou |
| **UNPINNED: UNPIN** | that one has unpinned | che si è sbloccato | qu'on a désépinglé | den man gelöst hat | que se ha desfijado | ピン留め解除した | que se desafixou |
| **HIDDEN: HIDE** | that one has hidden | che si è nascosto | qu'on a caché | den man versteckt hat | que se ha escondido | 隠した | que se escondeu |
| SAVED: SAVE, passive | that has been saved | che è stato salvato | qui a été enregistré | der gespeichert worden ist | que ha sido guardado | 保存された | que foi salvo |
| HIDDEN: HIDE, passive | that has been hidden | che è stato nascosto | qui a été caché | der versteckt worden ist | que ha sido escondido | 隠された | que foi escondido |
| LINKED: CONNECT | that one has connected | che si è connesso | qu'on a connecté | den man verbunden hat | que se ha conectado | 接続した | que se conectou |
| UNPINNED: PIN, negative | that one has not pinned | che non si è fissato | qu'on n'a pas épinglé | den man nicht angeheftet hat | que no se ha fijado | ピン留めしていない | que não se fixou |
| HIDDEN: SEE, `CAN`, negative | that one cannot see | che non si può vedere | qu'on ne peut pas voir | den man nicht sehen kann | que no se puede ver | 見ることができない | que não se pode ver |

The gloss's content is the event and who does it; the participle it contains is in some languages
the adjective's own spelling (en *saved*, de *gespeichert*), which is what the construct is for.
The **passive** says the same state and is the more idiomatic Italian (*che è stato salvato*), but
it drops the agent, and the family keeps the one shape: if SAVED is "that one has saved", LOADED
is "that one has loaded". **CONNECT** is LINK's word in German (*verbunden* both), so LINKED takes
LINK. **UNPINNED** is what UNPIN leaves, not the negation of PIN — "that one has not pinned" is
something never pinned. **HIDDEN** takes HIDE, the verb it is the state of; "that one cannot see"
is what VISIBLE and MISSING are built beside. HIDE's own gloss, "to cause an object not to be
visible", uses VISIBLE, and VISIBLE uses SEE, so nothing circles.

### TIDY — shipped: "that one has arranged"

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **TIDY: ARRANGE** | that one has arranged | che si è disposto | qu'on a disposé | den man angeordnet hat | que se ha dispuesto | 並べた | que se dispôs |
| TIDY: TIDY_UP | that one has tidied up | che si è riordinato | qu'on a rangé | den man geordnet hat | que se ha ordenado | 片付けた | que se arrumou |
| TIDY: ARRANGE + WELL | that one has arranged well | che si è disposto bene | qu'on a bien disposé | den man gut angeordnet hat | que se ha dispuesto bien | よく並べた | que se dispôs bem |

TIDY's verb is TIDY_UP, but TIDY_UP is glossed "to cause objects to be tidy", so the two would
define each other. ARRANGE is "to put things in an order", which is TIDY's description ("arranged in
order") word for word. WELL adds nothing the order does not say, and Japanese よく reads "often".

### The standing properties — shipped: neutral aspect, a modal, a negation

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **VALID: ACCEPT, neutral** | that one accepts | che si accetta | qu'on accepte | den man akzeptiert | que se acepta | 受け付ける | que se aceita |
| VALID: ACCEPT, `CAN` | that one can accept | che si può accettare | qu'on peut accepter | den man akzeptieren kann | que se puede aceptar | 受け付けることができる | que se pode aceitar |
| VALID: ACCEPT, resultative | that one has accepted | che si è accettato | qu'on a accepté | den man akzeptiert hat | que se ha aceptado | 受け付けた | que se aceitou |
| **VISIBLE: SEE, `CAN`** | that one can see | che si può vedere | qu'on peut voir | den man sehen kann | que se puede ver | 見ることができる | que se pode ver |
| **UNKNOWN: KNOW, neutral, negative** | that one does not know | che non si conosce | qu'on ne connaît pas | den man nicht kennt | que no se conoce | 知らない | que não se conhece |
| **UNEXPECTED: EXPECT, neutral, negative** | that one does not expect | che non si prevede | qu'on n'attend pas | den man nicht erwartet | que no se espera | 予想しない | que não se espera |
| UNEXPECTED: EXPECT, resultative, negative | that one has not expected | che non si è previsto | qu'on n'a pas attendu | den man nicht erwartet hat | que no se ha esperado | 予想していない | que não se esperou |
| UNEXPECTED: EXPECT, past, negative | that one did not expect | che non si prevedeva | qu'on n'attendait pas | den man nicht erwartete | que no se esperaba | 予想しなかった | que não se esperava |

A valid file is one the program accepts, not one it has accepted (that is *accepted*) nor one it
could (*acceptable*); 受け付ける is the Japanese of an input a form takes. VISIBLE is "able to be
seen", a possibility, so the modal, and SEE rather than APPEAR, whose gloss is "to become visible".
UNKNOWN and UNEXPECTED are the negation of a state, said on the verb, and differ only in it. KNOW
with an object is KNOW_ACQUAINTED in five languages (*conoscere*, *connaître*, *kennen*), which is
the sense a thing unknown is not known in. The past reads well for UNEXPECTED — Italian and French
take the imperfect, since EXPECT is seeded as a state — but it would have been the one past tense
in the family, and "that one does not expect" is the pair of "that one does not know".

### MISSING — shipped: "that one cannot find"

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **MISSING: FIND, `CAN`, negative** | that one cannot find | che non si può trovare | qu'on ne peut pas trouver | den man nicht finden kann | que no se puede encontrar | 見つけることができない | que não se pode encontrar |
| MISSING: FIND, neutral, negative | that one does not find | che non si trova | qu'on ne trouve pas | den man nicht findet | que no se encuentra | 見つけない | que não se encontra |
| MISSING: FIND, resultative, negative | that one has not found | che non si è trovato | qu'on n'a pas trouvé | den man nicht gefunden hat | que no se ha encontrado | 見つけていない | que não se encontrou |
| MISSING: HAVE, neutral, negative | that one does not have | che non si ha | qu'on n'a pas | den man nicht hat | que no se tiene | 持たない | que não se tem |
| MISSING: SEARCH, neutral | that one seeks | che si cerca | qu'on cherche | den man sucht | que se busca | 探す | que se procura |
| MISSING: BE + PRESENT, negative | that is not present | che non è presente | qui n'est pas présent | der nicht gegenwärtig ist | que no es presente | 現在ではない | que não é presente |
| MISSING: BE in the PLACE, negative | that is not in the place | che non è nel luogo | qui n'est pas dans le lieu | der nicht im Ort ist | que no está en el lugar | 場所にない | que não está no lugar |

MISSING's own Japanese is 見つからない, "that cannot be found", and the modal says exactly that in
all seven. Without it, Italian, French, Spanish and Portuguese read idiomatically (*che non si
trova*) but Japanese 見つけない is a refusal to find. **PRESENT** is the tense adjective, "happening
now" — *der nicht gegenwärtig ist*, 現在ではない, and Spanish *no es presente* where a thing absent
*no está* — so it cannot say "not here". "Not in the place" names no place, "that one does not
have" is Italian *che non si ha*, and "that one seeks" is RESULT's gloss without its head. This cost
the verb FIND, seeded below.

### The subject gaps — shipped: what the thing does, or has

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **FAILED: WORK, resultative, negative** | that has not worked | che non ha funzionato | qui n'a pas fonctionné | der nicht funktioniert hat | que no ha funcionado | 動作していない | que não funcionou |
| FAILED: WORK, past, negative | that did not work | che non funzionò | qui ne fonctionna pas | der nicht funktionierte | que no funcionó | 動作しなかった | que não funcionou |
| FAILED: WORK, neutral, negative | that does not work | che non funziona | qui ne fonctionne pas | der nicht funktioniert | que no funciona | 動作しない | que não funciona |
| FAILED: FAIL\*, resultative | that has failed | che è fallito | qui a échoué | der fehlgeschlagen ist | que ha fallado | 失敗した | que falhou |
| FAILED: SUCCEED\*, resultative, negative | that has not succeeded | che non è riuscito | qui n'a pas réussi | der nicht gelungen ist | que no ha tenido éxito | 成功していない | que não teve sucesso |
| SUCCEED\* in a clause: the cat succeeds | the cat succeeds | il gatto riesce | le chat réussit | der Kater gelingt | el gato tiene éxito | 猫は成功します | o gato tem sucesso |
| **ACTIVE: WORK, progressive** | that is working | che sta funzionando | qui est en train de fonctionner | der gerade funktioniert | que está funcionando | 動作している | que está funcionando |
| ACTIVE: WORK, neutral | that works | che funziona | qui fonctionne | der funktioniert | que funciona | 動作する | que funciona |
| **NUMBERED: HAVE a NUMBER_LABEL** | that has a number | che ha un numero | qui a un numéro | der eine Nummer hat | que tiene un número | 番号がある | que tem um número |
| NUMBERED: HAVE a NUMBER | that has a number | che ha un numero | qui a un nombre | der eine Zahl hat | que tiene un número | 数がある | que tem um número |
| **UNTITLED: HAVE a TITLE, negative** | that does not have a title | che non ha un titolo | qui n'a pas de titre | der keinen Titel hat | que no tiene un título | タイトルがない | que não tem um título |
| UNTITLED: HAVE TITLE (bare), negative | that does not have title | che non ha titolo | qui n'a pas de titre | der keinen Titel hat | que no tiene título | タイトルがない | que não tem título |
| UNTITLED: HAVE a NAME_NOUN, negative | that does not have a name | che non ha un nome | qui n'a pas de nom | der keinen Namen hat | que no tiene un nombre | 名前がない | que não tem um nome |
| **EMPTY: HAVE CONTENT, negative** | that does not have content | che non ha contenuto | qui n'a pas de contenu | der keinen Inhalt hat | que no tiene contenido | 内容がない | que não tem conteúdo |
| EMPTY: HOLD objects, negative | that does not hold objects | che non contiene oggetti | qui ne contient pas d'objets | der keine Gegenstände enthält | que no contiene objetos | 物体を保持しない | que não contém objetos |

**FAILED** has no verb of its own seeded, and FAIL would only say the word: its resultative is
FAILED's own spelling in five languages (*failed*, *fallito*, *échoué*, *fehlgeschlagen*, 失敗した),
with nothing beside it — a subject gap has no "one" to add. WORK is "to do what it is made for".
The resultative is the only aspect all six European languages say as a status line does: the past is
the Italian *passato remoto* and the French *passé simple*, which no interface writes, and the
present "that does not work" is *broken*, a standing property, not an attempt that failed. SUCCEED
is the description's own verb and would have needed a phrase in Spanish and Portuguese (*tener
éxito*, *ter sucesso*); German *gelingen* takes its person in the dative, so "der Kater gelingt" is
wrong the moment a person succeeds. It was not seeded.

**ACTIVE** is "in operation", now, so the progressive; "that works" is only *functional*. It may
not use TURN_OFF, whose gloss is "to cause an object not to be active".

**NUMBERED** needed a word: NUMBER is the value one counts with, and French, German and Japanese
say that with another noun than a row's number (*nombre* / *numéro*, *Zahl* / *Nummer*, 数 / 番号).
NUMBER_LABEL is the second, seeded below. **UNTITLED** takes TITLE (seeded) and the indefinite: the
bare singular is not English, and NAME_NOUN would define UNTITLED as *unnamed*. **EMPTY** is the
description, "containing nothing": what a thing contains is its CONTENT, a mass noun, so bare.

### RECENT — literal by design

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| USE, resultative | that one has used | che si è usato | qu'on a utilisé | den man verwendet hat | que se ha usado | 使った | que se usou |
| USE + NOW | that one has used now | che si è usato ora | qu'on a utilisé maintenant | den man jetzt verwendet hat | que se ha usado ahora | 今使った | que se usou agora |
| USE + ALREADY | that one has already used | che si è già usato | qu'on a déjà utilisé | den man schon verwendet hat | que se ha usado ya | もう使った | que se usou já |
| USE, past, manner TIME `this` | that one used at this time | che si usò a questo tempo | qu'on utilisa à ce temps | den man zu dieser Zeit verwendete | que se usó a este tiempo | この時間で使った | que se usou a este tempo |
| USE, past, manner a NEAR TIME | that one used at near time | che si usò a tempo vicino | qu'on utilisa à temps proche | den man zu naher Zeit verwendete | que se usó a tiempo cercano | 近い時間で使った | que se usou a tempo próximo |
| USE, manner a PREVIOUS TIME | that one has used at previous time | che si è usato a tempo precedente | qu'on a utilisé à temps précédent | den man zu vorheriger Zeit verwendet hat | que se ha usado a tiempo anterior | 前の時間で使った | que se usou a tempo anterior |
| AGE + LOW (YOUNG's gloss) | of low age | di età bassa | d'âge bas | von niedrigem Alter | de edad baja | 年齢が低い | de idade baixa |
| BE + OLD, negative | that is not old | che non è vecchio | qui n'est pas vieux | der nicht alt ist | que no es viejo | 古くない | que não é velho |
| BE + NEW | that is new | che è nuovo | qui est nouveau | der neu ist | que es nuevo | 新しい | que é novo |

"Used a short time ago" is a distance in time, and nothing in the corpus measures one. USED alone
is not recent; NOW reads as "used now" in five languages (Japanese 今使った and Portuguese *usou
agora* are the only ones that mean "just used"); ALREADY is *already* used, which a line used a year
ago also is; TIME as a manner complement is `measure`, which drops the article in a clause ("at
near time", *à temps proche*) and puts Italian and French in the *passato remoto* / *passé simple*
besides; LOW AGE is YOUNG's gloss character for character; "not old" is equally YOUNG and NEW; and
NEW (C24's, unglossed) is "recently made", not recently used. What would move it is a RECENTLY
adverb, a word, or a SHORT adjective with a relation for "ago", a construct; nothing else in the
corpus needs either. It is, as the sweep put it, not participial.

### CLOSED and OPEN_ADJECTIVE — literal by design

Seeded 2026-09-22 by [C28](../done/C28-verb-roots-without-a-gloss.md) as transient
participial states (es/pt *estar*), and unglossed; they join this family, not in this branch, so no
render of theirs is pasted here. C28 glossed the verbs **through** them: OPEN is "to cause an object
not to be closed" and CLOSE "to cause an object not to be open". A state gloss on the family's shape
— "that one has closed", "that one has opened" — would close a four-step circle, CLOSED → CLOSE →
OPEN_ADJECTIVE → OPEN → CLOSED. The two states are the primitives the pair of verbs is defined by,
as HIDE is defined by VISIBLE. The lead, if the adjectives are ever wanted, is to re-gloss OPEN and
CLOSE on something else first.

### KNOWN — shipped in the integration pass: "that one knows"

Seeded 2026-09-22 by [C24](C24-grammar-feature-adjectives.md) as DEFINITE's differentia ("that
indicates a known object") and glossed when the batch was merged, on UNKNOWN's shape without the
negation — `stateGloss('OBJECT_THING', 'KNOW', { aspect: 'neutral' })`:

| en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|
| that one knows | che si conosce | qu'on connaît | den man kennt | que se conoce | 知る | que se conhece |

The Japanese is the plain attributive the engine gives every relative clause (本を持つ猫, A132), and
for 知る it is the written attributive of 誰もが知る事実 rather than the spoken 知っている; UNKNOWN's
知らない is its negation either way.

## Done

Shipped 2026-09-22. **Twenty-one glosses** in
[adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts), on the headless relative
clause (`NounPhrase.relativeGloss`, through the helpers in
[relativeGloss.ts](../../../packages/backend/src/concepts/relativeGloss.ts)), and **four words
seeded**: the verbs EXPECT and FIND and the nouns TITLE and NUMBER_LABEL. RECENT, CLOSED and
OPEN_ADJECTIVE stay on the literal by design.

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| WRITTEN | that one has written | che si è scritto | qu'on a écrit | den man geschrieben hat | que se ha escrito | 書いた | que se escreveu |
| LOADED | that one has loaded | che si è caricato | qu'on a chargé | den man geladen hat | que se ha cargado | 読み込んだ | que se carregou |
| TIDY | that one has arranged | che si è disposto | qu'on a disposé | den man angeordnet hat | que se ha dispuesto | 並べた | que se dispôs |
| SAVED | that one has saved | che si è salvato | qu'on a enregistré | den man gespeichert hat | que se ha guardado | 保存した | que se salvou |
| ADDED | that one has added | che si è aggiunto | qu'on a ajouté | den man hinzugefügt hat | que se ha añadido | 加えた | que se adicionou |
| REMOVED | that one has removed | che si è rimosso | qu'on a retiré | den man entfernt hat | que se ha quitado | 取り除いた | que se removeu |
| FAILED | that has not worked | che non ha funzionato | qui n'a pas fonctionné | der nicht funktioniert hat | que no ha funcionado | 動作していない | que não funcionou |
| COPIED | that one has copied | che si è copiato | qu'on a copié | den man kopiert hat | que se ha copiado | コピーした | que se copiou |
| LINKED | that one has linked | che si è collegato | qu'on a relié | den man verbunden hat | que se ha enlazado | つないだ | que se ligou |
| PINNED | that one has pinned | che si è fissato | qu'on a épinglé | den man angeheftet hat | que se ha fijado | ピン留めした | que se fixou |
| UNPINNED | that one has unpinned | che si è sbloccato | qu'on a désépinglé | den man gelöst hat | que se ha desfijado | ピン留め解除した | que se desafixou |
| NUMBERED | that has a number | che ha un numero | qui a un numéro | der eine Nummer hat | que tiene un número | 番号がある | que tem um número |
| ACTIVE | that is working | che sta funzionando | qui est en train de fonctionner | der gerade funktioniert | que está funcionando | 動作している | que está funcionando |
| UNTITLED | that does not have a title | che non ha un titolo | qui n'a pas de titre | der keinen Titel hat | que no tiene un título | タイトルがない | que não tem um título |
| EMPTY | that does not have content | che non ha contenuto | qui n'a pas de contenu | der keinen Inhalt hat | que no tiene contenido | 内容がない | que não tem conteúdo |
| VALID | that one accepts | che si accetta | qu'on accepte | den man akzeptiert | que se acepta | 受け付ける | que se aceita |
| MISSING | that one cannot find | che non si può trovare | qu'on ne peut pas trouver | den man nicht finden kann | que no se puede encontrar | 見つけることができない | que não se pode encontrar |
| UNKNOWN | that one does not know | che non si conosce | qu'on ne connaît pas | den man nicht kennt | que no se conoce | 知らない | que não se conhece |
| UNEXPECTED | that one does not expect | che non si prevede | qu'on n'attend pas | den man nicht erwartet | que no se espera | 予想しない | que não se espera |
| HIDDEN | that one has hidden | che si è nascosto | qu'on a caché | den man versteckt hat | que se ha escondido | 隠した | que se escondeu |
| VISIBLE | that one can see | che si può vedere | qu'on peut voir | den man sehen kann | que se puede ver | 見ることができる | que se pode ver |

[participial-adjectives.test.ts](../../../packages/engine/test/participial-adjectives.test.ts)
pins the twenty-one glosses, that RECENT has none, that each is word for word the relative its
antecedent would take with the head spoken ("an object that one has saved", 保存した物体), and the
four words' paradigms; `verb.test.ts`'s Italian every-verb table has EXPECT and FIND.
[e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) checks SAVED in English
and German and EMPTY in Japanese in the picker. The sweep test
([sweep-definitions.test.ts](../../../packages/engine/test/sweep-definitions.test.ts)) passes with no
new pair allowed.

### The words

| id | role | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| EXPECT | verb, transitive, stative | expect | prevedere (previsto) | attendre (attendu) | erwarten (erwartet) | esperar | 予想する (よそうする) | esperar |
| FIND | verb, transitive | find (found) | trovare | trouver | finden (fand, gefunden) | encontrar (encuentro) | 見つける (みつける) | encontrar |
| TITLE | noun, isA NAME_NOUN | title / titles | titolo / titoli (m) | titre / titres (m) | Titel / Titel (m) | título / títulos (m) | タイトル | título / títulos (m) |
| NUMBER_LABEL | noun | number / numbers | numero / numeri (m) | numéro / numéros (m) | Nummer / Nummern (f) | número / números (m) | 番号 (ばんごう) | número / números (m) |

EXPECT is a state of mind, seeded `stative` as KNOW is: its Romance past is the imperfect (*prevedevo*,
*j'attendais*) and its Japanese main clause 予想しています. Italian takes *prevedere*, "foresee", since
the everyday *aspettarsi* is a pronominal transitive verb, a shape no Italian verb has yet; French
takes *attendre*, the verb of *inattendu*; Japanese 予想する, not 予期する, because 予期しない is
UNEXPECTED's own Japanese and its gloss would have been the word itself. TITLE is タイトル, what an
interface says, not a book's 題名. NUMBER_LABEL is a row's or a page's number, beside
NUMBER's value.

**Proposed and not seeded**, forms kept for a later author:

| id | role | en | it | fr | de | es | ja | pt | why not |
|---|---|---|---|---|---|---|---|---|---|
| SUCCEED | verb, intransitive | succeed | riuscire (essere, riuscito) | réussir | gelingen (sein, gelungen) | tener éxito | 成功する (せいこうする) | ter sucesso | FAILED's lead: a phrase in es/pt, and German *gelingen* cannot take a person subject |

### Noted, not fixed

- **FAILED in Japanese.** The resultative's negative is 〜ていない, so 動作していない reads "is not
  working" — which is ACTIVE's 動作している negated. It is natural Japanese for a thing that failed,
  but a Japanese reader could take FAILED for *stopped*. The past, 動作しなかった, is exact in
  Japanese and costs Italian and French their literary simple past.
- **UNPINNED in Italian and German** says UNPIN's own verbs, *sbloccare* and *lösen* — the ones the
  adjective's seed comment keeps out of the adjective because they read "unlocked" and "solved"
  without a list around them. The tooltip shows under the adjective itself (*non più fissato*,
  *nicht mehr angeheftet*), which gives them that context.
- **The impersonal *si* / *se* in the past** also reads reflexively in Italian and Portuguese: *che si è salvato* is "that one has saved" and "who saved himself", *que se salvou*
  likewise. It is the construct's Romance shape; the passive (*che è stato salvato*) is the
  unambiguous one, above.
- **A `measure` manner complement drops its article in a clause.** TIME indefinite with OTHER renders
  "the cat runs at other time", *a altro tempo*, *à autre temps*, *zu anderer Zeit*, where the adverb
  gloss AGAIN says the same noun phrase as "at another time". Reported, not filed here.

What landed differently from the plan:

1. **The construct is a render mode on the noun phrase**, as option 1 asked, built as K1 in the same
   wave; this ticket only authored on it. No option 2 participle was needed, and nothing agrees with a
   noun it does not have: the unspoken antecedent does the agreeing.
2. **Not every gloss is a participle.** Eleven are the state a verb leaves; VALID, VISIBLE, MISSING,
   UNKNOWN and UNEXPECTED are standing properties (neutral aspect, a modal, a negation); FAILED,
   ACTIVE, NUMBERED, UNTITLED and EMPTY have no verb of their own and are said by what the thing
   does or has — the subject gap.
3. **TIDY does not use TIDY_UP**, the verb the file listed: TIDY_UP is glossed through TIDY.
4. **Four words, not two.** EXPECT and TITLE, as the file said; FIND for MISSING, since nothing seeded
   says "not where it is looked for" (PRESENT is the tense); and NUMBER_LABEL, since NUMBER is a count
   in French, German and Japanese.
5. **Two of the verbs the file listed went unused.** NAME: UNTITLED has no title rather than no
   name. NUMBER is a noun, and in the value sense: NUMBERED has a NUMBER_LABEL.
6. **RECENT did not wait for [C24](../done/C24-grammar-feature-adjectives.md)'s order
   words**, as this file said it would: PREVIOUS, the one that reaches time, is probed above ("at
   previous time"), and an order word is a position in a sequence where RECENT is a distance in time.
   It is literal by design.
7. **Two more concepts, CLOSED and OPEN_ADJECTIVE**, came into the family from C28 and stay on the
   literal: their verbs are glossed through them.
