# B85. Pay, provide, spend, lose, win, thank and allow — the verbs of giving and getting

_(from the [P09-E24](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E24-ranks-201-400.md)
coverage check of 2026-09-24: *pay* (rank 258), *provide* (272), *lose* (273), *thank* (300),
*allow* (346), *win* (347) and *spend* (353, both halves). None is a concept at 1229928. Nine verbs,
eight glosses probed, one proposed. LOSE meets [B84](B84-stop-wait-die-continue.md)'s NO_LONGER
defect. *Allow the cat to run* is
[P09-E43](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E43-allow-to.md)'s; ALLOW is seeded here
with a plain object.)_

## Seed first

Proposed forms, for the seed author to check. **The verbs were not seeded in memory** (see
[B83](B83-sit-stand-walk-run-away-lead.md)'s note); their glosses were rendered.

| concept | role | sense | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| PAY | verb | **E24**, rank 258. Transitive (the sum or the bill), the payee as `terminus` (GIVE's recipient) | pay (paid) | pagare (pago, paghi) | payer (paie) | bezahlen / zahlen (dat. payee) | pagar (pague) | 払う (はらう) | pagar |
| PROVIDE | verb | **E24**, rank 272. Transitive + `terminus` | provide | fornire (fornisco) | fournir (fournis) | liefern | proporcionar | 提供する (ていきょうする) | fornecer (forneço) |
| SPEND_MONEY | verb | **E24**, rank 353, D2: money. Transitive | spend (spent) | spendere (speso) | dépenser | ausgeben (sep. *aus*; gibt aus) | gastar | 費やす (ついやす) | gastar |
| SPEND_TIME | verb | **E24**, rank 353, D2: time. Transitive, the time as object, `complements: ['locative']` | spend (spent) | passare | passer | verbringen (verbracht) | pasar | 過ごす (すごす) | passar |
| LOSE | verb | **E24**, rank 273, D2: to no longer have. Transitive | lose (lost) | perdere (perso) | perdre (perdu) | verlieren (verloren) | perder (pierdo) | 失う (うしなう) | perder (perco) |
| LOSE_GAME | verb | **E24**, rank 273, D2: to be beaten. Intransitive, the game as locative. Only Japanese splits (負ける), so the six others share LOSE's word | lose (lost) | perdere | perdre | verlieren | perder | 負ける (まける) | perder |
| WIN | verb | **E24**, rank 347. Intransitive or transitive (the game, the prize); ja takes the opponent with に | win (won) | vincere (vinto) | gagner | gewinnen (gewonnen) | ganar | 勝つ (かつ) | vencer / ganhar |
| THANK | verb | **E24**, rank 300. The person thanked is a dative in German (`object_case: 'dat'`, HELP_VERB's precedent) and に in Japanese; the Spanish and Portuguese *agradecer* take the person as an indirect object (*le agradece*) | thank | ringraziare | remercier | danken (dat.) | agradecer (agradezco) | 感謝する (かんしゃする) | agradecer (agradeço) |
| ALLOW | verb | **Seeded by [P09-E43](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E43-allow-to.md), 2026-09-24**, with these forms (German's dative as `controller_case`) and the gloss below. **E24**, rank 346. Transitive with a thing as object ("allows the food"). The person + infinitive is E43's. Not LET (*lasciare, laisser, lassen, dejar*), which is C36's bare-infinitive causative | allow | permettere (permesso) | permettre (permis) | erlauben (dat. person) | permitir | 許す (ゆるす) | permitir |

- **SPEND_MONEY's Japanese is 費やす**, because 使う is USE's lexeme ("to use money", which is
  SPEND_MONEY's own gloss). お金を使う is the everyday phrase, and with 費やす the gloss お金を使う does not
  hold its own word.
- **LOSE_GAME exists for Japanese alone.** P09 D2 splits wherever one language uses a different
  word, and 負ける ("be defeated") is not 失う ("lose hold of"). In the six others LOSE_GAME renders
  like LOSE, as the two PROGRAMs do in four languages.
- **WIN's Portuguese** is *vencer* for a contest and *ganhar* for a prize. *Vencer* is proposed, for
  the contest sense LOSE_GAME mirrors.
- **THANK's Spanish and Portuguese object is an indirect object.** *Agradecer a alguien* looks like
  the personal *a* but is a dative (*le agradezco*, not *lo*). Whether C35's lexical object case
  can say that in es/pt is the author's first check. It says the German dative today.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| PAY | `infinitiveGloss('GIVE', { object: 'MONEY', complements: { terminus: PERSON indefinite } })` | to give money to a person |
| PROVIDE | `causativeGloss({ object: 'PERSON', definiteness: 'indefinite' }, { verb: 'HAVE', object: 'OBJECT_THING', number: 'plural' })` | to cause a person to have objects |
| SPEND_MONEY | `infinitiveGloss('USE', 'MONEY')` | to use money |
| SPEND_TIME | `infinitiveGloss('STAY', { complements: { locative: PLACE indefinite, temporal: PERIOD_TIME indefinite, `during` } })` | to stay in a place during a period |
| LOSE | `infinitiveGloss('HAVE', { object: 'OBJECT_THING', number: 'plural', modifier: 'NO_LONGER' })` | no longer to have objects |
| WIN | `infinitiveGloss('BE', { predicate: 'GOOD', predicateDegree: 'most', complements: { locative: GAME indefinite } })` | to be best in a game |
| LOSE_GAME | **proposal, not probed** (it needs WIN seeded): `infinitiveGloss('WIN', { negative: true, complements: { locative: GAME indefinite } })` | not to win in a game |
| THANK | `infinitiveGloss('SAY', { object: 'WORD', number: 'plural', adjectives: ['GOOD'], complements: { terminus: PERSON indefinite } })` | to say good words to a person |
| ALLOW | `infinitiveGloss('LET', { object: 'PERSON', definiteness: 'indefinite', infinitive: { verbPhrase: { verb: 'ACT' }, control: 'object' } })` | to let a person act — **shipped by P09-E43** |

**Eight probed, one proposed.** WIN stands on [B82](B82-kinds-changes-games-and-parties.md)'s GAME;
LOSE_GAME on WIN.

## Probe renders (2026-09-24, engine source at 1229928, lexicon as seeded, GAME in memory)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| PAY | to give money to a person | dare denaro a una persona | donner de l'argent à une personne | einer Person Geld geben | dar dinero a una persona | 人にお金をあげる | dar dinheiro a uma pessoa |
| PROVIDE | to cause a person to have objects | indurre una persona ad avere oggetti | induire une personne à avoir des objets | eine Person veranlassen, Gegenstände zu haben | inducir a una persona a tener objetos | 人が物体を持つようにする | induzir uma pessoa a ter objetos |
| SPEND_MONEY | to use money | usare denaro | utiliser de l'argent | Geld verwenden | usar dinero | お金を使う | usar dinheiro |
| SPEND_TIME | to stay in a place during a period | restare in un luogo durante un periodo | rester dans un lieu pendant une période | an einem Ort während eines Zeitraums bleiben | quedarse en un lugar durante un período | 場所に期間の間に残る | ficar em um lugar durante um período |
| LOSE | no longer to have objects | non avere più oggetti | ne plus avoir d'objets | nicht mehr Gegenstände haben | **no tener ya no objetos** ✗ | 物体をもう持たない | **não ter já não objetos** ✗ |
| WIN | to be best in a game | essere il più buono in un gioco | être le meilleur dans un jeu | in einem Spiel am besten sein | ser el más bueno en un juego | ゲームで最も良い | ser o melhor em um jogo |
| THANK | to say good words to a person | dire buone parole a una persona | dire de bons mots à une personne | einer Person gute Wörter sagen | decir palabras buenas a una persona | 人に良い単語を言う | dizer palavras boas a uma pessoa |
| ALLOW | to let a person act | lasciare una persona agire | laisser une personne agir | eine Person handeln lassen | dejar a una persona actuar | 人を行動させる | deixar uma pessoa agir |

The leads that were not taken:

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| SPEND_TIME: to use time | to use time | usare tempo | utiliser le temps | Zeit verwenden | usar tiempo | 時間を使う | usar tempo |
| WIN: to be best (no game) | to be best | essere il più buono | être le meilleur | am besten sein | ser el más bueno | 最も良い | ser o melhor |
| THANK: to express joy to a person | to express joy to a person | esprimere gioia a una persona | exprimer de la joie à une personne | einer Person Freude vermitteln | expresar alegría a una persona | 人に喜びを表す | exprimir alegria a uma pessoa |

Readings to judge on authoring:

1. **PAY is GIVE with money**, as SELL is GIVE for money. Japanese あげる is GIVE's benefactive,
   which reads a little as "treat" (人にお金をあげる), but it is GIVE's own lexeme.
2. **PROVIDE is a causative of HAVE**, C08's shape (PUT is "to cause an object to be in a place").
3. **SPEND_TIME stays and does not use.** "To use time" is SPEND_MONEY's shape on TIME and is
   right in five languages, but it is also what "use" says of a clock. Japanese 期間の間に is heavy;
   the author may drop the `during` complement for 場所に残る… which says STAY.
4. **LOSE is negated HAVE**, and it meets B84's defect in Spanish and Portuguese. German *nicht mehr
   Gegenstände haben* wants *keine Gegenstände mehr*: NO_LONGER with a bare object is German's
   negative determiner plus *mehr*. That is a second, German-only defect of the same adverb, **not
   filed** (see the report).
5. **WIN's Italian and Spanish superlative is periphrastic**: *il più buono*, *el más bueno*, where
   *il migliore* / *el mejor* are the words for "best at something". French and Portuguese have
   suppletive tables (`FR_SUPPLETIVE`, `pt.consts.ts:43`) and Italian and Spanish have none. *Più
   buono* and *más bueno* are grammatical (the moral or taste sense), so this is a choice of word, not
   a defect. The author should either add the two tables, which is a small engine change that would
   also touch every GOOD comparative in both languages, or accept the periphrasis.
6. **THANK has no gratitude word.** "Good words" is the nearest the corpus says. "To express joy"
   reads as joy, not thanks, and German *Freude vermitteln* is "convey joy". The author may prefer
   the literal.
7. **ALLOW, "to let a person act"**, is LET's causative with its own infinitive. Japanese 人を行動させる
   is the causative LET renders (C36), which is permission or compulsion by context. LET's shipped
   gloss is "to cause a person to be allowed to act", so the two are close and do not collide.

## Not solved by this seed

1. **The NO_LONGER infinitive** and **German *nicht mehr* before a bare object** (reading 4) —
   engine defects. The Italian and Spanish suppletive superlative (reading 5) is a choice.
2. **ALLOW + person + infinitive**, **HELP + infinitive** in Romance —
   [P09-E43](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E43-allow-to.md).
3. **LOSE_GAME's gloss** until WIN is seeded.

## Coverage

Two rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored:
PAY in German and Japanese (GIVE's dative recipient with a mass object: *einer Person Geld geben*,
人にお金をあげる) and PROVIDE in French and Portuguese (a causative over HAVE with a bare plural
object).

## Done

Shipped 2026-09-24. **Eight verbs seeded**, ALLOW being P09-E43's: PAY and PROVIDE in
[ditransitive.ts](../../../packages/backend/src/concepts/verbs/ditransitive.ts) after SELL;
SPEND_MONEY and SPEND_TIME after USE, LOSE and WIN after KEEP, THANK after HELP_VERB in
[transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts); LOSE_GAME after
PLAY_GAME in [intransitive.ts](../../../packages/backend/src/concepts/verbs/intransitive.ts); all
eight in [nonfinite.ts](../../../packages/backend/src/concepts/verbs/nonfinite.ts) (Portuguese *pago*
and *gasto* as the short passive participles), and in verb.test.ts's Italian table. **Eight glosses**:
the seven probed ones plus LOSE_GAME's proposal; ALLOW's P09-E43 gloss is unchanged.

Rendered fresh from the shipped seed:

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| PAY | to give money to a person | dare denaro a una persona | donner de l'argent à une personne | einer Person Geld geben | dar dinero a una persona | 人にお金をあげる | dar dinheiro a uma pessoa |
| PROVIDE | to cause a person to have objects | indurre una persona ad avere oggetti | induire une personne à avoir des objets | eine Person veranlassen, Gegenstände zu haben | inducir a una persona a tener objetos | 人が物体を持つようにする | induzir uma pessoa a ter objetos |
| SPEND_MONEY | to use money | usare denaro | utiliser de l'argent | Geld verwenden | usar dinero | お金を使う | usar dinheiro |
| SPEND_TIME | to stay in a place for a period | restare in un luogo per un periodo | rester dans un lieu pendant une période | an einem Ort einen Zeitraum bleiben | quedarse en un lugar durante un período | 場所に期間残る | ficar em um lugar por um período |
| LOSE | to stop having objects | smettere di avere oggetti | arrêter d'avoir des objets | aufhören, Gegenstände zu haben | dejar de tener objetos | 物体を持つのをやめる | parar de ter objetos |
| WIN | to be best in a game | essere il più buono in un gioco | être le meilleur dans un jeu | in einem Spiel am besten sein | ser el más bueno en un juego | ゲームで最も良い | ser o melhor em um jogo |
| LOSE_GAME | not to win in a game | non vincere in un gioco | ne pas gagner dans un jeu | nicht in einem Spiel gewinnen | no ganar en un juego | ゲームで勝たない | não vencer em um jogo |
| THANK | to say good words to a person | dire buone parole a una persona | dire de bons mots à une personne | einer Person gute Wörter sagen | decir palabras buenas a una persona | 人に良い単語を言う | dizer palavras boas a uma pessoa |

All pass `sweep-definitions.test.ts`.

### What landed differently from the plan

1. **LOSE is "to stop having objects"**, on P09-E42's STOP_DOING, not "no longer to have objects":
   the NO_LONGER infinitive still reads *no tener ya no objetos* / *não ter já não objetos* (B84's
   defect) and German *nicht mehr Gegenstände haben* (reading 4, unfiled). The STOP_DOING lead is
   right in all seven, so the gloss ships without waiting on either defect; neither was fixed here.
2. **SPEND_TIME takes the duration `for`**, not `during` (reading 3): Japanese 場所に期間残る for the
   heavy 期間の間に, Italian *per un periodo*, German the accusative *einen Zeitraum*; English "for a
   period" is the natural preposition too.
3. **WIN's Italian and Spanish periphrasis was accepted** (reading 5): *il più buono*, *el más bueno*;
   adding suppletive tables would move every GOOD comparative in both languages.
4. **Japanese WIN and LOSE_GAME** mark the opponent に (`opponent_prep`, 犬に勝ちます, 犬に負けます), the
   first lexemes to seed that column, and WIN marks its game に too (`object_particle`: ゲームに勝ちます,
   where the default gave ゲームを勝ちます). Every other language says the opponent with its generic
   *contro / contre / gegen / contra*.
5. **THANK's objects**: German `object_case: 'dat'` (*dankt dem Kind*, *dankt ihm*), Japanese
   `object_particle: 'に'` (子供に感謝します), Portuguese `object_prep: 'a'` (*agradece à criança*).
   Spanish takes no column: the personal *a* already gives *agradece al niño*. **Defect left**: a
   Spanish pronoun object reads *lo agradece* for *le agradece* — the Romance `object_case: 'dat'` is
   read under object control only (ALLOW's), so a plain dative object has no key. Pinned as a
   `test.fails` in games-and-transactions.test.ts. Portuguese pronoun reads the colloquial *agradece a
   ele*. No gloss shows either.
6. **German PROVIDE is *liefern*** (supply), with the dative recipient; *zur Verfügung stellen* would
   be closer but is a phrase the engine cannot place. German LOSE_GAME's *nicht in einem Spiel
   gewinnen* follows the engine's rule that *nicht* precedes a locative (negation.test.ts).
7. **Readings 1, 2, 6 and 7 as filed**: PAY on GIVE (あげる), PROVIDE causative, THANK "good words",
   ALLOW unchanged.

### Coverage shipped

Five rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts): PAY in German
and Japanese, PROVIDE in French and Portuguese, WIN in German, each with English.
[games-and-transactions.test.ts](../../../packages/engine/test/games-and-transactions.test.ts) pins
the glosses, every verb's present, past, resultative, future and negation, the frames (recipient,
place, opponent), the commands, and the Spanish dative clitic as a known bug.
