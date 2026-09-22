# C28. The verb roots — the genera every other verb gloss stands on

**Kind:** **deliberately left on the English literal**, like
[C05](../done/C05-non-distinguishing-genera.md) — for forty-six of its sixty-two verbs. The other
sixteen turned out to have a gloss after all, and shipped (see [Done](#done)). Sixty-two verbs, and
they are to the verb lexicon what [C26](../done/C26-root-nouns-on-the-literal.md)'s roots
are to the nouns: CREATE, CHANGE, HAVE, INDICATE, TRANSFER, MOVE_ONESELF, BE. Almost every verb gloss
[B09](../done/B09-create-verbs.md)–[B19](../done/B19-data-verbs.md) shipped is built out of one of
them.

_(from the unsorted sweep of 2026-09-22. Fifteen verbs went to
[A24](../done/A24-ui-verbs-genus-and-object.md) and three to
[A25](../done/A25-causative-verbs.md). These forty-five were the rest of the 63 undefined verbs —
and **three of the eighteen came back on 2026-09-22**, for a reason this file did not have a name
for. See [The three that came back](#the-three-that-came-back). Authored and retired the same day:
every lead below was probed, in all seven languages, against the engine source at HEAD.)_

## The concepts

CONSUME, DESIRE, KNOW_ACQUAINTED, INCLUDE, CONFINE, CREATE, DESTROY, PERCEIVE, UNDERSTAND, HAVE,
DIVIDE, STRIKE, INDICATE, CHANGE, TRANSFORM, SHED, PRODUCE, CAUSE_VERB, PRESS, WRITE, FILTER, LINK,
REMOVE, CANCEL, RESTORE, OPEN, CLOSE, MOVE, LEAVE, DRAG, SET, PIN, UNPIN, APPLY, GOVERN, ACCEPT,
REPLACE, ACT, WORK, BEGIN, CHANGE_ONESELF, TRANSFER, MOVE_ONESELF, BECOME, BE — and EAT_ANIMAL,
SHRINK and SPECIFY, which A24 and A25 sent back.

**Twelve more were seeded on 2026-09-22** and are roots in the same sense: BREATHE, EXCHANGE,
ENCLOSE, HEAR, GOVERN_STATE, ACCOMPANY, ANSWER, SEARCH, ARRANGE, CONNECT, SPEAK, FLY. Each was
seeded by [B52](../done/B52-natural-kind-genera.md), [B53](../done/B53-substance-and-state-roots.md),
[B56](../done/B56-countries-and-continents.md) or [B57](../done/B57-ui-nouns-needing-a-word.md) to
be the *differentia* of a noun — a wall is what encloses, a speaker is one who speaks.

**And two more the same day**, seeded to finish [C26](../done/C26-root-nouns-on-the-literal.md)'s
nouns: LIVE_ALIVE ("to be alive", the sense split from the dwelling LIVE), which LIFE's gloss
stands on ("the state of a being that lives"), and POUR ("to make a liquid flow out of a
container"), which LIQUID's does ("substance that one pours"). See
[LIVE_ALIVE and POUR](#live_alive-and-pour).

## Verdicts (2026-09-22)

| verdict | concepts | # |
|---|---|---|
| **shipped a gloss** | FLY, HEAR, INCLUDE, TRANSFORM, DRAG, MOVE, EXCHANGE, ACCOMPANY, REMOVE, RESTORE, UNPIN, SET, SPECIFY, UNDERSTAND, OPEN, CLOSE | 16 |
| literal by design — decided elsewhere, not re-opened | BE, CONSUME, CAUSE_VERB ([C08](../done/C08-copular-and-genus-verbs.md)); REPLACE ([C05](../done/C05-non-distinguishing-genera.md)) | 4 |
| literal by design — the subject is the differentia | EAT_ANIMAL, WORK, ACT, BECOME, CHANGE_ONESELF, MOVE_ONESELF | 6 |
| literal by design — the genus word proposed does not hold | DESIRE, KNOW_ACQUAINTED, PERCEIVE | 3 |
| literal by design — its gloss is another concept's | SHRINK (COMPACT's) | 1 |
| literal by design — a primitive, every shape probed | CREATE, CHANGE, PRODUCE, HAVE, INDICATE, DESTROY, DIVIDE, STRIKE, PRESS, SHED, WRITE, FILTER, LINK, CONNECT, CANCEL, LEAVE, PIN, APPLY, GOVERN, ACCEPT, BEGIN, TRANSFER, CONFINE, BREATHE, ENCLOSE, GOVERN_STATE, SPEAK, ANSWER, SEARCH, ARRANGE | 30 |
| literal by design — a root a noun's gloss stands on | LIVE_ALIVE (LIFE's), POUR (LIQUID's) | 2 |

Nothing is left blocked on a construct. Every table below is engine output, 2026-09-22, engine source
and seed at HEAD, rendered in memory; a word marked *(not seeded)* was rendered through a lookup
wrapper and was not added to the corpus (their forms are in
[Proposed and not seeded](#proposed-and-not-seeded)).

## Why a verb root gets no gloss

`infinitiveGloss` says *genus + differentia*: "to consume food", "to create objects". A root has no
genus, and reaching for one produces its own child's gloss:

| concept | plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| CREATE | `infinitiveGloss('MAKE', 'OBJECT_THING', 'plural')` | to make objects | fare oggetti | faire des objets | Gegenstände machen | hacer objetos | 物体を作る | fazer objetos |
| CHANGE | MAKE another object — COPY's | to make another object | fare un altro oggetto | faire un autre objet | einen anderen Gegenstand machen | hacer otro objeto | 別の物体を作る | fazer outro objeto |

MAKE is the only verb either can be said with, it is CREATE's own child, and it is glossed itself ("to
create objects") — so a gloss here either restates MAKE or steals a sibling's. **What changed on authoring** is that the
shapes that had shipped since the sweep sorted this file — a route, an instrument, a comitative, an
essive, a purpose clause, a negated causative — give sixteen of the sixty-two a differentia their genus
does not have, TRANSFORM and DRAG among them (moved here from A24 as indistinguishable from their
genus). The rest are below, each with the shapes it was tried on.

## BE, CONSUME, CAUSE_VERB and REPLACE — decided elsewhere

[C08](../done/C08-copular-and-genus-verbs.md) recorded the first three as literal by design and
[C05](../done/C05-non-distinguishing-genera.md) probed REPLACE four ways; **not re-opened**, carried
here so the sweep's verbs are counted in one place. Re-rendered for the record:

| concept | plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| BE | `infinitiveGloss('BE', { predicate: 'ACTIVE' })` | to be active | essere attivo | être actif | aktiv sein | estar activo | 稼働中である | estar ativo |
| CONSUME | `infinitiveGloss('EAT', 'FOOD')` | to eat food | mangiare cibo | manger de la nourriture | Essen essen | comer comida | 食べ物を食べる | comer comida |
| CAUSE_VERB | MAKE an object + infinitive ACT | to make an object to act | fare un oggetto agire | faire un objet agir | einen Gegenstand machen, zu handeln | hacer un objeto actuar | 行動することを物体を作る | fazer um objeto agir |
| REPLACE | causative: BE in another object's PLACE (C05's first row) | to cause an object to be in another object's place | indurre un oggetto a essere nel luogo di un altro oggetto | induire un objet à être dans le lieu d'un autre objet | einen Gegenstand veranlassen, im Ort eines anderen Gegenstands zu sein | inducir un objeto a estar en el lugar de otro objeto | 物体が別の物体の場所にあるようにする | induzir um objeto a estar no lugar de outro objeto |

BE is defined by one arbitrary predicate; CONSUME by its own child EAT ("to consume food"), which
German shows for the tautology it is (*Essen essen*); CAUSE_VERB by MAKE, which governs no
infinitive in any of the seven; REPLACE by "in place of", an idiom in each language rather than a
locative on PLACE (*al posto di*, *à la place de*, *an der Stelle*, の代わりに).

## The subject is the differentia — EAT_ANIMAL, WORK, ACT, BECOME, CHANGE_ONESELF, MOVE_ONESELF

EAT_ANIMAL's real differentia is its **subject** — *to consume food, **of an animal*** — and an
infinitive gloss has no subject to constrain. The same is true of WORK ("of a thing, to function"),
ACT, BECOME, CHANGE_ONESELF and MOVE_ONESELF. What would move them is a subject constraint on an
infinitive gloss, which every language spells as an editorial parenthetical; **recorded, not
built** (ruled 2026-09-22). The nearest shape the engine has, probed once for the record, is the
essive, with the other shapes each verb could reach:

| concept | plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| EAT_ANIMAL | `infinitiveGloss('CONSUME', 'FOOD')` — EAT's | to consume food | consumare cibo | consommer de la nourriture | Essen konsumieren | consumir comida | 食べ物を摂取する | consumir comida |
| EAT_ANIMAL | the same + **essive** ANIMAL | to consume food as an animal | consumare cibo come animale | consommer de la nourriture comme animal | Essen als Tier konsumieren | consumir comida como animal | 食べ物を動物として摂取する | consumir comida como animal |
| ACT | ACT + essive BEING | to act as a being | agire come essere | agir comme être | als Wesen handeln | actuar como ser | 存在として行動する | agir como ser |
| WORK | ACT + WELL | to act well | agire bene | bien agir | gut handeln | actuar bien | よく行動する | agir bem |
| WORK | BE ACTIVE | to be active | essere attivo | être actif | aktiv sein | estar activo | 稼働中である | estar ativo |
| BECOME | BEGIN + infinitive BE (the inchoative) | to begin to be | iniziare a essere | commencer à être | beginnen, zu sein | empezar a ser | いることが始まる | começar a ser |
| CHANGE_ONESELF | BECOME + DIFFERENT *(not seeded)* | to become different | diventare diverso | devenir différent | anders werden | volverse diferente | 別になる | tornar-se diferente |
| CHANGE_ONESELF | BECOME + OTHER | to become other | diventare altro | devenir autre | andere werden | volverse otro | 別になる | tornar-se outro |
| MOVE_ONESELF | CHANGE + PLACE, bare | to change place | cambiare luogo | changer du lieu | Ort ändern | cambiar lugar | 場所を変える | mudar lugar |

All six stay on the literal:

- **EAT_ANIMAL** — the essive renders in all seven, and says the wrong thing: it is the *object*
  complement ([C12](../done/C12-ui-purpose-and-object-complements.md)'s "use this period **as the condition**"),
  so the plan takes the *food* as an animal; only the ambiguity of *as* / *come* / *als* lets it read
  the other way. And *as an animal* is a capacity, not *of an animal*.
- **ACT** — the same essive, with no object for it to predicate of. ACT is the top of the action
  verbs (USE is "to act with an object", COORDINATE's causee acts together).
- **WORK** — "to act well" is behaving well; "to be active" is BE's non-gloss above, and says a
  function is on, not that it works.
- **BECOME** — the inchoative says nothing BE does not, and Japanese renders its copula as the
  animate existential いる, from the citation's throwaway subject (いることが始まる).
- **CHANGE_ONESELF** — "to become different" needs DIFFERENT, which Japanese can only say as 別,
  and 別になる is *to become separate* (and OTHER's word besides); "to become other" is not English
  or German.
- **MOVE_ONESELF** — "to change place" loses the preposition the Romance languages need (*changer
  de place*, *cambiar de lugar*, *mudar de lugar*); FLY, RUN, JUMP, COME, GO and COLLAPSE all stand
  on it as their genus.

## PERCEIVE, UNDERSTAND, KNOW_ACQUAINTED, DESIRE

The file named a lead for these four and never probed it: a genus word above each — a verb of wanting
above DESIRE, of grasping above UNDERSTAND, of sensing above PERCEIVE, of meeting or being familiar
for KNOW_ACQUAINTED — and existing verbs in new shapes. Every candidate word went through a lookup
wrapper, none seeded:

| concept | plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| DESIRE | FEEL + infinitive ACT (the file) | to feel to act | provare agire | éprouver agir | fühlen, zu handeln | sentir actuar | 行動することを感じる | sentir agir |
| DESIRE | WILL + infinitive HAVE objects | to want to have objects | volere avere oggetti | vouloir avoir des objets | wollen, Gegenstände zu haben | querer tener objetos | 物体を持つことをたい | querer ter objetos |
| DESIRE | WANT *(not seeded)* + STRONGLY *(not seeded)* | to want strongly | volere fortemente | vouloir fortement | stark wollen | querer fuertemente | 強く求める | querer fortemente |
| UNDERSTAND | KNOW + MEANING, bare (the file) | to know meaning | conoscere significato | connaître du sens | Bedeutung kennen | conocer significado | 意味を知る | conhecer significado |
| UNDERSTAND | KNOW + the MEANING (**shipped**) | to know the meaning | conoscere il significato | connaître le sens | die Bedeutung kennen | conocer el significado | 意味を知る | conhecer o significado |
| UNDERSTAND | KNOW + the MEANING of the WORDS | to know the words' meaning | conoscere il significato delle parole | connaître le sens des mots | die Bedeutung der Wörter kennen | conocer el significado de las palabras | 単語の意味を知る | conhecer o significado das palavras |
| UNDERSTAND | GRASP *(not seeded)* + the MEANING | to grasp the meaning | afferrare il significato | saisir le sens | die Bedeutung erfassen | captar el significado | 意味をつかむ | captar o significado |
| KNOW_ACQUAINTED | KNOW + objects | to know objects | conoscere oggetti | connaître des objets | Gegenstände kennen | conocer objetos | 物体を知る | conhecer objetos |
| KNOW_ACQUAINTED | MEET *(not seeded)* + people | to meet people | incontrare persone | rencontrer des personnes | Personen treffen | encontrar personas | 人を会う | encontrar pessoas |
| KNOW_ACQUAINTED | BE FAMILIAR *(not seeded)* + comitative people | to be familiar with people | essere familiare con persone | être familier avec des personnes | mit Personen vertraut sein | ser familiar con unas personas | 人と親しい | ser familiar com umas pessoas |
| PERCEIVE | SENSE *(not seeded)* + objects | to sense objects | avvertire oggetti | sentir des objets | Gegenstände spüren | sentir objetos | 物体を感じ取る | sentir objetos |
| PERCEIVE | NOTICE *(not seeded)* + objects | to notice objects | notare oggetti | remarquer des objets | Gegenstände bemerken | notar objetos | 物体を気づく | notar objetos |
| PERCEIVE | KNOW_ACQUAINTED + objects + instrumental the SENSES *(not seeded)* | to know objects with the senses | conoscere oggetti con i sensi | connaître des objets avec les sens | Gegenstände mit den Sinnen kennen | conocer objetos con los sentidos | 感覚で物体を知る | conhecer objetos com os sentidos |
| PERCEIVE | FEEL + objects | to feel objects | provare oggetti | éprouver des objets | Gegenstände fühlen | sentir objetos | 物体を感じる | sentir objetos |

- **UNDERSTAND ships**, as "to know the meaning" — see [Done](#done). KNOW with a noun object is
  already KNOW_ACQUAINTED's word in five languages ([A131](../../bugs/fixed/A131-know-with-a-noun-object.md)'s `object_sense`), which
  is the verb those languages know a meaning with, and the definite article keeps French off *du
  sens*. "Of the words" renders the English genitive as *the words' meaning*, which no one says.
- **DESIRE stays.** The verb of wanting is seeded already — WILL, whose English *is* "want" — but as a
  gloss's head its Japanese is the たい suffix, which the engine closes a こと clause on
  (物体を持つことをたい for 物体を持ちたい), and WILL's own gloss is "to desire to act", so the two would
  define each other. A new WANT would repeat WILL's word in six languages (want, volere, vouloir,
  wollen, querer, querer) and still need an intensity adverb to tell DESIRE from it; with STRONGLY
  German and Spanish do not say it (*stark wollen*, *querer fuertemente*).
- **KNOW_ACQUAINTED stays.** KNOW with an object renders KNOW_ACQUAINTED's own word in five languages
  and *know* / 知る in the other two: a circle in all seven. MEET takes に in Japanese, which an
  object slot cannot say (人を会う), and meeting is not knowing. FAMILIAR is Spanish and Portuguese
  *ser familiar* ("to be of the family"; the idiom is *estar familiarizado*), and Japanese 親しい is
  *close to*, of people.
- **PERCEIVE stays.** SENSE is a synonym that would itself become the root, and its word is FEEL's
  already in es and pt (*sentir*); NOTICE takes に in Japanese (物体を気づく); "to know objects with
  the senses" puts acquaintance above perception and is not German (*mit den Sinnen kennen*); FEEL
  with an object is *provare* / *éprouver*, to try or test. SEE is "to perceive light" and HEAR now
  "to perceive sounds": PERCEIVE is the genus they stand on.

## The three that came back

A root gets no gloss because it has no genus above it. These three have one, and came back for the
neighbouring reason: **the gloss their genus gives is a gloss another concept already ships.**

| concept | plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| SPECIFY | INDICATE + CONCEPT pl (the file) — EXPRESS's | to indicate concepts | indicare concetti | indiquer des concepts | Begriffe bezeichnen | indicar conceptos | 概念を示す | indicar conceitos |
| SPECIFY | INDICATE + EXACTLY (**shipped**) | to indicate exactly | indicare esattamente | indiquer exactement | genau bezeichnen | indicar exactamente | 正確に示す | indicar exatamente |
| SPECIFY | INDICATE + objects + EXACTLY | to indicate objects exactly | indicare esattamente oggetti | indiquer exactement des objets | genau Gegenstände bezeichnen | indicar exactamente objetos | 物体を正確に示す | indicar exatamente objetos |
| SHRINK | causative BECOME SMALL·more (the file) — COMPACT's | to cause an object to become smaller | indurre un oggetto a diventare più piccolo | induire un objet à devenir plus petit | einen Gegenstand veranlassen, kleiner zu werden | inducir un objeto a volverse más pequeño | 物体がもっと小さくなるようにする | induzir um objeto a tornar-se menor |
| SHRINK | BECOME SMALL·more, intransitive | to become smaller | diventare più piccolo | devenir plus petit | kleiner werden | volverse más pequeño | もっと小さくなる | tornar-se menor |
| SHRINK | MAKE an object + factitive SMALL·more | to make an object smaller | fare un oggetto più piccolo | faire un objet plus petit | einen Gegenstand kleiner machen | hacer un objeto más pequeño | 物体をもっと小さく作る | fazer um objeto menor |
| COMPACT | PRESS an object into a smaller PLACE (the lead that would free SHRINK's) | to press an object into a smaller place | premere un oggetto in un luogo più piccolo | presser un objet dans un lieu plus petit | einen Gegenstand in einen kleineren Ort drücken | pulsar un objeto en un lugar más pequeño | もっと小さい場所の中へ物体を押す | pressionar um objeto em um lugar menor |

- **SPECIFY ships**: its differentia is exactness, and the adverb EXACTLY was seeded for it. Without
  an object — with one, German reads *genau Gegenstände* as "precisely objects".
- **EAT_ANIMAL stays** — the subject constraint, [above](#the-subject-is-the-differentia--eat_animal-work-act-become-change_oneself-move_oneself).
- **SHRINK stays.** SHRINK is transitive ("to make something smaller"), so the intransitive "to
  become smaller" is the wrong verb; the factitive MAKE builds a smaller object in French and Japanese
  (*faire un objet plus petit*, 小さく作る). The causative is SHRINK's meaning exactly — and COMPACT
  ships it, having no gloss of its own differentia ("into a smaller space without losing what it
  holds"). The one lead is to re-gloss COMPACT on PRESS, and PRESS is Spanish *pulsar*, the verb of
  a button (*pulsar un objeto*), and German *Ort* is no space to press into. COMPACT is not this
  file's; the lead is recorded for whoever next touches it.

## FLY

The file said FLY's differentia, *through the air*, is "a route complement on a noun AIR that no verb
gloss can reach". MOVE_ONESELF licenses the route — it always did — and the gloss is its own
description:

| concept | plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| FLY | route AIR, **definite** (shipped) | to move through the air | muoversi attraverso l'aria | se déplacer à travers l'air | sich durch die Luft bewegen | moverse por el aire | 空気を移動する | mover-se pelo ar |
| FLY | route AIR, bare | to move through air | muoversi attraverso aria | se déplacer à travers air | sich durch Luft bewegen | moverse por aire | 空気を移動する | mover-se por ar |
| FLY | route AIR, definite, `in` | to move in the air | muoversi nell'aria | se déplacer dans l'air | sich in der Luft bewegen | moverse en el aire | 空気を移動する | mover-se no ar |
| FLY | locative AIR, definite | to move in the air | muoversi nell'aria | se déplacer dans l'air | sich in der Luft bewegen | moverse en el aire | 空気で移動する | mover-se no ar |
| JUMP | direction AIR, `in` (shipped by B34) | to move into the air | muoversi nell'aria | se déplacer dans l'air | sich in die Luft bewegen | moverse en el aire | 空気の中へ移動する | mover-se no ar |

Definite, because the bare mass noun has no article after a Romance preposition (*attraverso aria*).
The default `through` is the right relation: `in` and the locative would read *nell'aria* / *dans
l'air* / *en el aire*, which is JUMP's gloss in four languages.

## The primitives

Thirty verbs with no genus above them, each tried on every shape that could carry a differentia
today — including the ones the file did not try: an instrument or goal complement, a causative, a
purpose clause, a negated object.

| concept | plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| CHANGE | causative BECOME DIFFERENT *(not seeded)* | to cause an object to become different | indurre un oggetto a diventare diverso | induire un objet à devenir différent | einen Gegenstand veranlassen, anders zu werden | inducir un objeto a volverse diferente | 物体が別になるようにする | induzir um objeto a tornar-se diferente |
| PRODUCE | CREATE + objects — MAKE's | to create objects | creare oggetti | créer des objets | Gegenstände erschaffen | crear objetos | 物体を生み出す | criar objetos |
| HAVE | HOLD + objects | to hold objects | contenere oggetti | contenir des objets | Gegenstände enthalten | contener objetos | 物体を保持する | conter objetos |
| INDICATE | SHOW + concepts | to show concepts | mostrare concetti | montrer des concepts | Begriffe zeigen | mostrar conceptos | 概念を見せる | mostrar conceitos |
| DESTROY | causative **not** BE WHOLE | to cause an object not to be whole | indurre un oggetto a non essere intero | induire un objet à ne pas être entier | einen Gegenstand veranlassen, nicht ganz zu sein | inducir un objeto a no ser entero | 物体が全体ではないようにする | induzir um objeto a não ser inteiro |
| DIVIDE | causative BECOME parts | to cause an object to become parts | indurre un oggetto a diventare parti | induire un objet à devenir parties | einen Gegenstand veranlassen, Teile zu werden | inducir un objeto a volverse partes | 物体が部分になるようにする | induzir um objeto a tornar-se partes |
| DIVIDE | MAKE + parts | to make parts | fare parti | faire des parties | Teile machen | hacer partes | 部分を作る | fazer partes |
| STRIKE | PRESS + SUDDENLY | to press suddenly | premere improvvisamente | presser soudainement | plötzlich drücken | pulsar de repente | 突然押す | pressionar de repente |
| PRESS | STRIKE + SLOWLY | to strike slowly | colpire lentamente | frapper lentement | langsam schlagen | golpear lentamente | ゆっくり打つ | golpear devagar |
| SHED | causative: liquid MOVE_ONESELF from an object | to cause liquid to move from an object | indurre liquido a muoversi da un oggetto | induire du liquide à se déplacer d'un objet | Flüssigkeit veranlassen, sich aus einem Gegenstand zu bewegen | inducir líquido a moverse de un objeto | 液体が物体から移動するようにする | induzir líquido a mover-se de um objeto |
| WRITE | MAKE + words | to make words | fare parole | faire des mots | Wörter machen | hacer palabras | 単語を作る | fazer palavras |
| WRITE | causative: words BE VISIBLE | to cause words to be visible | indurre parole a essere visibili | induire des mots à être visibles | Wörter veranlassen, sichtbar zu sein | inducir palabras a estar visibles | 単語が可視であるようにする | induzir palavras a estar visíveis |
| FILTER | causative: objects **not** BE VISIBLE — HIDE's, plural | to cause objects not to be visible | indurre oggetti a non essere visibili | induire des objets à ne pas être visibles | Gegenstände veranlassen, nicht sichtbar zu sein | inducir objetos a no estar visibles | 物体が可視ではないようにする | induzir objetos a não estar visíveis |
| LINK | CONNECT an object + terminus another object | to connect an object to another object | connettere un oggetto a un altro oggetto | connecter un objet à un autre objet | einen Gegenstand in einen anderen Gegenstand verbinden | conectar un objeto a otro objeto | 別の物体に物体を接続する | conectar um objeto a outro objeto |
| CONNECT | causative: objects BE LINKED | to cause objects to be linked | indurre oggetti a essere collegati | induire des objets à être liés | Gegenstände veranlassen, verknüpft zu sein | inducir objetos a estar vinculados | 物体がリンク済みであるようにする | induzir objetos a estar ligados |
| CANCEL | causative: an action **not** BEGIN | to cause an action not to begin | indurre un'azione a non iniziare | induire une action à ne pas commencer | eine Handlung veranlassen, nicht zu beginnen | inducir una acción a no empezar | 動作が始まらないようにする | induzir uma ação a não começar |
| CANCEL | causative: an action **not** BE ACTIVE | to cause an action not to be active | indurre un'azione a non essere attiva | induire une action à ne pas être active | eine Handlung veranlassen, nicht aktiv zu sein | inducir una acción a no estar activa | 動作が稼働中ではないようにする | induzir uma ação a não estar ativa |
| LEAVE | GO + source a PLACE | to go from a place | andare da un luogo | aller d'un lieu | aus einem Ort gehen | ir de un lugar | 場所から行く | ir de um lugar |
| PIN | causative BE FIRST + ALWAYS | to cause an object always to be first | indurre un oggetto a essere sempre primo | induire un objet à être toujours premier | einen Gegenstand veranlassen, immer erste zu sein | inducir un objeto a ser siempre primero | 物体がいつも第一であるようにする | induzir um objeto a ser sempre primeiro |
| APPLY | causative BE ACTIVE | to cause an object to be active | indurre un oggetto a essere attivo | induire un objet à être actif | einen Gegenstand veranlassen, aktiv zu sein | inducir un objeto a estar activo | 物体が稼働中であるようにする | induzir um objeto a estar ativo |
| GOVERN | causative: another word CHANGE_ONESELF | to cause another word to change | indurre un'altra parola a cambiare | induire un autre mot à changer | ein anderes Wort veranlassen, sich zu ändern | inducir otra palabra a cambiar | 別の単語が変わるようにする | induzir outra palavra a mudar |
| ACCEPT | ACQUIRE an object + essive VALID | to acquire an object as valid | acquisire un oggetto come valido | acquérir un objet comme valide | einen Gegenstand als gültig erwerben | adquirir un objeto como válido | 物体を有効なとして取得する | adquirir um objeto como válido |
| BEGIN | BECOME ACTIVE | to become active | diventare attivo | devenir actif | aktiv werden | volverse activo | 稼働中になる | tornar-se ativo |
| TRANSFER | causative: a person HAVE objects | to cause a person to have objects | indurre una persona ad avere oggetti | induire une personne à avoir des objets | eine Person veranlassen, Gegenstände zu haben | inducir a una persona a tener objetos | 人が物体を持つようにする | induzir uma pessoa a ter objetos |
| TRANSFER | MOVE objects from a place to another place | to move objects from a place to another place | spostare oggetti da un luogo a un altro luogo | déplacer des objets d'un lieu à un autre lieu | Gegenstände aus einem Ort zu einem anderen Ort verschieben | mover objetos de un lugar a otro lugar | 場所から別の場所へ物体を移動する | mover objetos de um lugar a outro lugar |
| CONFINE | causative: a person **not** LEAVE a place | to cause a person not to leave a place | indurre una persona a non uscire da un luogo | induire une personne à ne pas quitter de lieu | eine Person veranlassen, keinen Ort zu verlassen | inducir a una persona a no salir de un lugar | 人が場所を出ないようにする | induzir uma pessoa a não sair de um lugar |
| CONFINE | ENCLOSE + people | to enclose people | racchiudere persone | entourer des personnes | Personen umschließen | encerrar personas | 人を囲む | cercar pessoas |
| BREATHE | CONSUME + AIR | to consume air | consumare aria | consommer de l'air | Luft konsumieren | consumir aire | 空気を摂取する | consumir ar |
| ENCLOSE | BE + locative `around` a PLACE | to be around a place | essere intorno a un luogo | être autour d'un lieu | um einen Ort sein | estar alrededor de un lugar | 場所の周りにいる | estar ao redor de um lugar |
| GOVERN_STATE | GOVERN + nations | to govern nations | reggere nazioni | régir des nations | Nationen regieren | regir naciones | 国民を支配する | reger nações |
| GOVERN_STATE | causative: a nation ACT | to cause a nation to act | indurre una nazione ad agire | induire une nation à agir | eine Nation veranlassen, zu handeln | inducir a una nación a actuar | 国民が行動するようにする | induzir uma nação a agir |
| SPEAK | PRODUCE + words | to produce words | produrre parole | produire des mots | Wörter erzeugen | producir palabras | 単語を出す | produzir palavras |
| SPEAK, ANSWER | causative: a person HEAR words | to cause a person to hear words | indurre una persona a sentire parole | induire une personne à entendre des mots | eine Person veranlassen, Wörter zu hören | inducir a una persona a oír palabras | 人が単語を聞くようにする | induzir uma pessoa a ouvir palavras |
| SPEAK | EXPRESS concepts + instrumental words | to express concepts with words | esprimere concetti con parole | exprimer des concepts avec des mots | Begriffe mit Wörtern vermitteln | expresar conceptos con palabras | 単語で概念を表す | exprimir conceitos com palavras |
| SEARCH | DESIRE + infinitive ACQUIRE objects | to desire to acquire objects | desiderare acquisire oggetti | désirer acquérir des objets | wünschen, Gegenstände zu erwerben | desear adquirir objetos | 物体を取得することを望む | desejar adquirir objetos |
| ARRANGE | causative: objects BE TIDY — TIDY_UP's | to cause objects to be tidy | indurre oggetti a essere ordinati | induire des objets à être rangés | Gegenstände veranlassen, ordentlich zu sein | inducir objetos a estar ordenados | 物体が整然としているようにする | induzir objetos a estar arrumados |

CREATE's and CHANGE's first rows are in [Why a verb root gets no gloss](#why-a-verb-root-gets-no-gloss).
Every one stays on the literal:

- **CREATE, PRODUCE** — MAKE is CREATE's only child and is glossed "to create objects": the file's
  "to make objects" inverts it, and PRODUCE's "to create objects" *is* it, character for character.
- **CHANGE** — "to make another object" is COPY's; "to cause an object to become different" needs
  DIFFERENT, and Japanese has only 別 for it (別になる, *to become separate*). RESIZE, MODIFY, EDIT
  and now MOVE stand on it.
- **HAVE** — "to hold objects" inverts HOLD's "to have objects"; OWN and INCLUDE stand on it.
- **INDICATE** — the genus of NAME, DESCRIBE, EXPRESS, CHOOSE, SELECT and SPECIFY; SHOW is not above
  it, and "to show concepts" defines the root by a verb that is a kind of it.
- **DESTROY** — WHOLE is *entire*, not *intact*: "not to be whole" reads *incomplete* (de *nicht
  ganz*, "not quite"; ja 全体ではない, "not the entirety"). KILL, CLEAR and EXTINGUISH stand on it.
- **DIVIDE** — "to become parts" is no French (*devenir parties*) and a category error in English;
  "to make parts" is manufacturing (ja 部分を作る). CUT stands on it.
- **STRIKE, PRESS** — each other's only neighbour, and neither is the other: Spanish PRESS is
  *pulsar*, a key, so *pulsar de repente* is pressing a key suddenly. BEAT and CLICK stand on them.
- **SHED** — "to cause liquid to move from an object" is spilling or draining. CRY and TEAR stand on
  it.
- **WRITE** — "to make words" is coining them (ja 単語を作る); "to cause words to be visible" is
  displaying them. TYPE stands on it.
- **FILTER** — HIDE's gloss in the plural, and HIDE's meaning: the C05 test. "To keep only the items
  that match" needs ONLY and MATCH, neither seeded.
- **LINK, CONNECT** — near-synonyms, and German says both with *verbinden*, so each glossed by the
  other is a circle there; "to cause objects to be linked" is LINK's own act, equally true of
  CONNECT. German also puts CONNECT's terminus in the accusative (*in einen anderen Gegenstand
  verbinden*).
- **CANCEL** — the negated inchoative covers the half of CANCEL that is planned and contradicts the
  half that is under way (an action under way has begun); "not to be active" is TURN_OFF's gloss on
  another causee. UNDO stands on it.
- **LEAVE** — GO with a source is not what any of them says: Italian *andare da* is going *to*
  someone's, German wants *von*, not *aus*, and 場所から行く is not Japanese for leaving. REMOVE now
  stands on it.
- **PIN** — German drops the article its predicate ordinal needs (*immer erste zu sein* for *immer
  der Erste*), and Japanese 第一 is *foremost*, not a list position. UNPIN ships on PIN's participle.
- **APPLY** — "to cause an object to be active" is switching on, TURN_OFF's opposite, not putting a
  change into effect.
- **GOVERN** — "to cause another word to change" renders in all seven, and is exactly what MODIFY's
  description says of *it* ("to qualify or alter another word"): the C05 test. A FORM noun is what
  would say it; SUBJECT_GRAMMAR, OBJECT_GRAMMAR and GENDER stand on it.
- **ACCEPT** — ACQUIRE is "to begin to have", not to take as; Japanese does not say an adjective
  essive (有効なとして).
- **BEGIN** — "to become active" is a machine starting (稼働中になる), not a day beginning. ACQUIRE
  and START stand on it.
- **TRANSFER** — "to cause a person to have objects" is GIVE's meaning, and GIVE is a kind of
  TRANSFER; "to move objects from a place to another place" is MOVE's. GIVE, SEND, EXPORT and IMPORT
  stand on it.
- **CONFINE** — under the negation the indefinite turns into *no place* in French and German (*ne pas
  quitter de lieu*, *keinen Ort zu verlassen*); ENCLOSE is Spanish *encerrar* too, a circle, and
  French *entourer*, to surround.
- **BREATHE** — AIR is "gas that one breathes", so "to consume air" closes a two-word circle, and
  空気を摂取する is not breathing.
- **ENCLOSE** — "to be around" is *to be nearby* in English and no German (*um einen Ort sein*), and
  Japanese puts the animate いる on it, from the citation's throwaway subject. WALL and BRACKET stand
  on it.
- **GOVERN_STATE** — German is *regieren* for both governs, a circle; elsewhere GOVERN is the grammar
  sense (*reggere*, *régir*). A nation caused to act is not governed. COUNTRY stands on it.
- **SPEAK** — "to produce words" and "to express concepts with words" are equally true of writing;
  "to cause a person to hear words" is equally true of ANSWER. SPEAKER stands on it.
- **ANSWER** — its differentia is *back* and *what was asked*, which want a question noun or a reply
  relation; the one causative that renders is SPEAK's row. SERVER stands on it.
- **SEARCH** — "to desire to acquire objects" is wanting, not looking; FIND and TRY are not seeded.
  RESULT stands on it.
- **ARRANGE** — "to cause objects to be tidy" is TIDY_UP's gloss; "to put things in a sequence"
  waits on SEQUENCE, a word another ticket of the sweep may seed. LIST stands on it.

## LIVE_ALIVE and POUR

Seeded on 2026-09-22 after this file was authored, to give two
[C26](../done/C26-root-nouns-on-the-literal.md) nouns their differentia — LIFE is "the
state of a being that lives" and LIQUID "substance that one pours". Both are roots, and each is
ruled out of the one gloss its noun makes obvious: **LIVE_ALIVE may not be glossed through LIFE**
("to have life") nor **POUR through LIQUID**, since each pair would define itself in a circle.
Neither verb is seeded in the tree this file was probed in, so both went through the lookup
wrapper with the seeded forms (live / vivere / vivre / leben / vivir / 生きる / viver; pour / versare /
verser / gießen / verter / 注ぐ / verter):

| concept | plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| LIVE_ALIVE | BE + ALIVE *(not seeded)* | to be alive | essere vivo | être vivant | lebendig sein | estar vivo | 生きているである | estar vivo |
| LIVE_ALIVE | BE **not** DEAD *(not seeded)* | not to be dead | non essere morto | ne pas être mort | nicht tot sein | no estar muerto | 死んでいない | não estar morto |
| LIVE_ALIVE | HAVE + LIFE (ruled out: LIFE is glossed on it) | to have life | avere vita | avoir de la vie | Leben haben | tener vida | 生命を持つ | ter vida |
| LIVE_ALIVE | BE + a BEING | to be a being | essere un essere | être un être | ein Wesen sein | ser un ser | 存在である | ser um ser |
| LIVE_ALIVE | BREATHE | to breathe | respirare | respirer | atmen | respirar | 呼吸する | respirar |
| POUR | causative: LIQUID MOVE_ONESELF | to cause liquid to move | indurre liquido a muoversi | induire du liquide à se déplacer | Flüssigkeit veranlassen, sich zu bewegen | inducir líquido a moverse | 液体が移動するようにする | induzir líquido a mover-se |
| POUR | causative: LIQUID FLOW *(not seeded)* | to cause liquid to flow | indurre liquido a scorrere | induire du liquide à couler | Flüssigkeit veranlassen, zu fließen | inducir líquido a fluir | 液体が流れるようにする | induzir líquido a fluir |
| POUR | causative: LIQUID LEAVE a CONTAINER | to cause liquid to leave a container | indurre liquido a uscire da un contenitore | induire du liquide à quitter un récipient | Flüssigkeit veranlassen, einen Behälter zu verlassen | inducir líquido a salir de un recipiente | 液体が容器を出るようにする | induzir líquido a sair de um recipiente |
| POUR | causative: SUBSTANCE LEAVE a CONTAINER | to cause substance to leave a container | indurre sostanza a uscire da un contenitore | induire de la substance à quitter un récipient | Stoff veranlassen, einen Behälter zu verlassen | inducir sustancia a salir de un recipiente | 物質が容器を出るようにする | induzir substância a sair de um recipiente |
| POUR | SHED + LIQUID | to shed liquid | versare liquido | verser du liquide | Flüssigkeit vergießen | derramar líquido | 液体を流す | derramar líquido |
| SHED | POUR + LIQUID | to pour liquid | versare liquido | verser du liquide | Flüssigkeit gießen | verter líquido | 液体を注ぐ | verter líquido |

Both stay on the literal:

- **LIVE_ALIVE** — ALIVE is this verb's own word in French (*vivant*, vivre's participle) and Japanese
  (生きている, 生きる's 〜ている, which the copula then doubles: 生きているである). "Not to be dead"
  renders cleanly in all seven and is true of a stone: *dead* presupposes having lived. "To be a
  being" is the copula's own noun in four languages (*essere un essere*, *être un être*, *ser un
  ser*, *ser um ser*), and not every living thing breathes.
- **POUR** — every causative that names LIQUID closes the circle through LIQUID's gloss; FLOW, which
  would make it "to cause liquid to flow", is not seeded and would be a root itself; "to cause
  liquid to move" is any motion of a liquid; SUBSTANCE in LIQUID's place is emptying and leaking too,
  and has no article where a mass noun wants one (*indurre sostanza*, *inducir sustancia*). And POUR
  and SHED are one word in Italian and French (*versare*, *verser*), so neither can be glossed by the
  other — the two tables' last rows are each a circle there.

## Proposed and not seeded

Rendered through the lookup wrapper above, forms kept for whoever reopens a lead. None shipped, so
none was seeded.

| word | role | for | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| WANT | verb | DESIRE | want | volere | vouloir | wollen | querer | 求める | querer |
| STRONGLY | adverb | DESIRE | strongly | fortemente | fortement | stark | fuertemente | 強く | fortemente |
| GRASP | verb | UNDERSTAND | grasp | afferrare | saisir | erfassen | captar | つかむ | captar |
| SENSE | verb | PERCEIVE | sense | avvertire | sentir | spüren | sentir | 感じ取る | sentir |
| NOTICE | verb | PERCEIVE | notice | notare | remarquer | bemerken | notar | 気づく | notar |
| SENSE | noun | PERCEIVE | sense / senses | senso / sensi | sens / sens | Sinn / Sinne | sentido / sentidos | 感覚 | sentido / sentidos |
| MEET | verb | KNOW_ACQUAINTED | meet | incontrare | rencontrer | treffen | encontrar | 会う | encontrar |
| FAMILIAR | adjective | KNOW_ACQUAINTED | familiar | familiare | familier | vertraut | familiar | 親しい | familiar |
| DIFFERENT | adjective | CHANGE, CHANGE_ONESELF | different | diverso | différent | anders | diferente | 別の | diferente |
| ALIVE | adjective | LIVE_ALIVE | alive | vivo | vivant | lebendig | vivo | 生きている | vivo |
| DEAD | adjective | LIVE_ALIVE | dead | morto | mort | tot | muerto | 死んだ | morto |
| FLOW | verb | POUR | flow | scorrere | couler | fließen | fluir | 流れる | fluir |

GRASP is the one that rendered well ("to grasp the meaning" is natural in all seven). It lost to
KNOW, which says the same with no new word: GRASP would itself be a root, and its physical sense
splits by language (つかむ and *afferrare* hold a stick; *captar* and *erfassen* barely do).

## Done

Retired 2026-09-22 as **literal by design**, with every lead the file named probed and sixteen
glosses shipped. Definitions in the verbs' own seeds —
[verbs/transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts) and, for FLY,
[verbs/motion.ts](../../../packages/backend/src/concepts/verbs/motion.ts). **Three words seeded**:
the adverb EXACTLY ([adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts)) and the
adjectives CLOSED and OPEN_ADJECTIVE ([adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts)).
No engine change.

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| FLY | to move through the air | muoversi attraverso l'aria | se déplacer à travers l'air | sich durch die Luft bewegen | moverse por el aire | 空気を移動する | mover-se pelo ar |
| HEAR | to perceive sounds | percepire suoni | percevoir des sons | Geräusche empfinden | percibir sonidos | 音を知覚する | perceber sons |
| INCLUDE | to have as part | avere come parte | avoir comme partie | als Teil haben | tener como parte | 部分として持つ | ter como parte |
| TRANSFORM | to cause an object to become another object | indurre un oggetto a diventare un altro oggetto | induire un objet à devenir un autre objet | einen Gegenstand veranlassen, ein anderer Gegenstand zu werden | inducir un objeto a volverse otro objeto | 物体が別の物体になるようにする | induzir um objeto a tornar-se outro objeto |
| DRAG | to move objects with the cursor | spostare oggetti con il cursore | déplacer des objets avec le curseur | Gegenstände mit dem Cursor verschieben | mover objetos con el cursor | カーソルで物体を移動する | mover objetos com o cursor |
| MOVE | to change an object's place | cambiare il luogo di un oggetto | changer le lieu d'un objet | den Ort eines Gegenstands ändern | cambiar el lugar de un objeto | 物体の場所を変える | mudar o lugar de um objeto |
| EXCHANGE | to give an object to acquire another object | dare un oggetto per acquisire un altro oggetto | donner un objet pour acquérir un autre objet | einen Gegenstand geben, um einen anderen Gegenstand zu erwerben | dar un objeto para adquirir otro objeto | 別の物体を取得するために物体をあげる | dar um objeto para adquirir outro objeto |
| ACCOMPANY | to go with a person | andare con una persona | aller avec une personne | mit einer Person gehen | ir con una persona | 人と行く | ir com uma pessoa |
| REMOVE | to cause an object to leave a place | indurre un oggetto a uscire da un luogo | induire un objet à quitter un lieu | einen Gegenstand veranlassen, einen Ort zu verlassen | inducir un objeto a salir de un lugar | 物体が場所を出るようにする | induzir um objeto a sair de um lugar |
| RESTORE | to cause an object to return | indurre un oggetto a tornare | induire un objet à revenir | einen Gegenstand veranlassen, zurückzukehren | inducir un objeto a volver | 物体が戻るようにする | induzir um objeto a voltar |
| UNPIN | to cause an object not to be pinned | indurre un oggetto a non essere fissato | induire un objet à ne pas être épinglé | einen Gegenstand veranlassen, nicht angeheftet zu sein | inducir un objeto a no estar fijado | 物体がピン留め済みではないようにする | induzir um objeto a não estar fixado |
| SET | to choose a value | scegliere un valore | choisir une valeur | einen Wert wählen | elegir un valor | 値を選ぶ | escolher um valor |
| SPECIFY | to indicate exactly | indicare esattamente | indiquer exactement | genau bezeichnen | indicar exactamente | 正確に示す | indicar exatamente |
| UNDERSTAND | to know the meaning | conoscere il significato | connaître le sens | die Bedeutung kennen | conocer el significado | 意味を知る | conhecer o significado |
| OPEN | to cause an object not to be closed | indurre un oggetto a non essere chiuso | induire un objet à ne pas être fermé | einen Gegenstand veranlassen, nicht geschlossen zu sein | inducir un objeto a no estar cerrado | 物体が閉じていないようにする | induzir um objeto a não estar fechado |
| CLOSE | to cause an object not to be open | indurre un oggetto a non essere aperto | induire un objet à ne pas être ouvert | einen Gegenstand veranlassen, nicht offen zu sein | inducir un objeto a no estar abierto | 物体が開いていないようにする | induzir um objeto a não estar aberto |

What landed differently from the plan:

1. **The file was written as sixty verbs on the literal; sixteen of them ship.** It predicted that
   reaching for a genus would restate a child or a sibling, and for the roots proper it does. It had
   not tried the shapes that shipped after it was sorted: the purpose clause (EXCHANGE), the
   comitative (ACCOMPANY), the essive with no object (INCLUDE), a noun predicate inside a causative
   (TRANSFORM), an instrument (DRAG), a genitive object (MOVE), the negated causative on a participle
   (UNPIN, OPEN, CLOSE) and LEAVE's and RETURN's causatives (REMOVE, RESTORE).
2. **FLY needed no licence.** The file said its route was a complement "no verb gloss can reach";
   MOVE_ONESELF has licensed `route` all along, and the engine renders a plan's complements whether or
   not the verb licenses them (ADD's comitative sits on BE, which licenses none). Nothing was added to
   any verb's `complements`: that list is what the canvas draws a box for (`rawSatellites`,
   `ComplementMenu`, `visibleSlots`), what `phraseReducers` drops on a verb change and what the word
   map draws — so GO gained no comitative box for ACCOMPANY, nor HAVE an object-complement box for
   INCLUDE.
3. **TRANSFORM and DRAG came back out.** A24 moved both here as indistinguishable from their genus
   ("to change objects", "to move objects"). TRANSFORM ships as a causative that never names CHANGE,
   and DRAG with the instrument the pointer gesture is — while its genus MOVE, a root in this same
   file, ships beside it on CHANGE.
4. **SPECIFY needed a word, and got one: EXACTLY.** A24 sent it back for restating EXPRESS, and the
   file said its differentia was "exactness", which the corpus could not say. French takes
   *exactement* rather than *précisément*, which would have echoed SPECIFY's own *préciser*.
5. **OPEN and CLOSE needed two adjectives, and each glosses the other verb.** Asserting a verb's own
   state cites its own participle (*aperto*, *chiuso*), which is why HIDE denies VISIBLE rather than
   asserting HIDDEN; so OPEN denies CLOSED and CLOSE denies OPEN_ADJECTIVE. The open one's id is
   suffixed because the verb holds the plain one, as CAUSE_VERB's is beside CAUSE. Both are
   participial states with no gloss of their own — the class
   [C23](../done/C23-participial-state-adjectives.md) holds, which they join.
6. **UNDERSTAND is "to know the meaning", not "of words".** The genitive renders the English
   Saxon *the words' meaning*. KNOW's own gloss is "to understand concepts", so the two now define
   each other, as dictionaries' do; neither is a circle in any language, because KNOW with an object
   renders KNOW_ACQUAINTED's word.
7. **Three of the shipped glosses carry a caveat, each read and accepted.** HEAR is "Geräusche
   *empfinden*" because PERCEIVE's German is *empfinden* (to feel), as SEE's shipped "Licht empfinden"
   already shows; *wahrnehmen* is the word, a lexeme change this file did not make. ACCOMPANY's *mit
   einer Person gehen* and *andare con una persona* both have a colloquial reading of dating someone,
   which a definition's context overrides — Duden and Treccani define *begleiten* and *accompagnare*
   so. FLY's 空気を移動する is the route を, as 大辞林 glosses 飛ぶ (空中を移動する); 移動する is also
   transitive MOVE's word, which is the corpus's homonymy, not the gloss's.
8. **SET says less than its description, on purpose.** "To give a value to an option" renders wrong
   twice: German puts the recipient in the accusative (*einen Wert in eine Option geben*) and Japanese
   GIVE is あげる, which beside 値を reads as raising the value.
9. **The subject constraint was not built**, as ruled; the essive that comes nearest is on record
   [above](#the-subject-is-the-differentia--eat_animal-work-act-become-change_oneself-move_oneself).
   SHRINK stays because COMPACT holds its gloss, and the lead that would free it belongs to COMPACT.
10. **Two roots joined after authoring**, both seeded to finish C26: LIVE_ALIVE and POUR, which LIFE
    and LIQUID are now glossed on. Both are on the literal, probed through the wrapper
    ([LIVE_ALIVE and POUR](#live_alive-and-pour)), which makes the file sixty-two verbs and
    forty-six on the literal.

## Coverage

- [`packages/engine/test/verb-roots.test.ts`](../../../packages/engine/test/verb-roots.test.ts) — the
  sixteen definitions in all seven languages; CLOSED and OPEN_ADJECTIVE attributive (gender and
  number agreement), negated and past as predicates (es/pt *estar*, ja 〜ている); EXACTLY as a manner
  adverb in a finite clause.
- `packages/engine/test/adjectives.test.ts` — both adjectives in `EVERY_ADJECTIVE`.
- `packages/engine/test/sweep-definitions.test.ts` — no edit: its uniqueness guard renders the
  sixteen with every other definition and finds no two alike.
- [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) — FLY in English and
  German, OPEN in English and Japanese.
