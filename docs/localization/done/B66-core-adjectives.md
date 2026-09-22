# B66. The core adjectives — two LASTs, SAME, two RIGHTs, AMERICAN: four relatives and two primitives

_(from the P09 core-vocabulary sweep of 2026-09-22. The six adjective senses in P09 §2's rows
*last*, *same*, *American* and *right*, which D2 splits into LAST_FINAL / LAST_PREVIOUS and
RIGHT_CORRECT / RIGHT_SIDE. Four gloss on headless relatives the engine renders today. LAST_FINAL
is FIRST read the other way. LAST_PREVIOUS is FOLLOW's object gap under *this*. SAME is OTHER
negated. RIGHT_CORRECT needs one word, ERROR. AMERICAN and RIGHT_SIDE are literal by design, the
verdicts [C26](../done/C26-root-nouns-on-the-literal.md) gave the countries and
[C25](../done/C25-place-and-direction-adverbs.md) the RIGHT adverb. The words come from
[P09](../../features/P-planning/P09-core-vocabulary/README.md) §2.)_

## Seed first

Proposed forms, for the seed author to check — suggestions, not renders.

| concept | role | sense | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| LAST_FINAL | adjective | P09 rank 120, D2: coming after all others | last | ultimo | dernier | letzte | último | 最後の (さいごの) | último |
| LAST_PREVIOUS | adjective | P09 rank 120, D2: the period before this one | last | scorso | dernier | letzte | pasado | この前の (このまえの) | passado |
| SAME | adjective | P09 rank 148 | same | stesso | même | gleich | mismo | 同じ (おなじ) | mesmo |
| AMERICAN | adjective | P09 rank 163 | American | americano | américain | amerikanisch | estadounidense | アメリカの | americano |
| RIGHT_CORRECT | adjective | P09 rank 176, D2: correct | right | giusto | juste | richtig | correcto | 正しい (ただしい) | certo |
| RIGHT_SIDE | adjective | P09 rank 176, D2: the side (brief ruling) | right | destro | droit | recht | derecho | 右の (みぎの) | direito |
| ERROR | noun | differentia, for RIGHT_CORRECT | error / errors | errore / errori (m) | erreur / erreurs (f) | Fehler / Fehler (m) | error / errores (m) | 誤り (あやまり) | erro / erros (m) |
| NEXT_COMING | adjective | **optional, not a P09 row**: LAST_PREVIOUS's pair, "next week" | next | prossimo | prochain | nächste | próximo | 今度の (こんどの) | próximo |

Six P09 words, one differentia word, and one optional pair. What the seed author will meet:

- **LAST_FINAL and SAME go before the noun in it/fr/es/pt, and the engine decides that by concept
  id.** [B67](B67-place-and-focus-adverbs.md)'s ALSO ("in the same way") depends on SAME's position. They belong in `PRENOMINAL_DETERMINER` in `it.consts.ts`, beside FIRST and OTHER, and in
  `PRENOMINAL` in the fr/es/pt consts. That is an engine edit, not a seed field. Without it, the
  probe below renders *il giorno ultimo* and *el día último*. It renders fr *le jour dernier*,
  which is LAST_PREVIOUS's meaning. And it renders *il giorno stesso*, *le jour même* and *el día
  mismo*, which mean "the day itself".
- **LAST_PREVIOUS and NEXT_COMING stay after the noun**: *la settimana scorsa*, *la semaine dernière /
  prochaine*, *la semana pasada*, *a semana passada*. P09's row says both senses of *last* go before
  the noun in Romance, but only LAST_FINAL does.
- **Predicates.** SAME wants its article in five languages: the probe gives *the cat is same*, *è
  stesso*, *est même*, *es mismo*, *é mesmo*. LAST_FINAL's German *ist letzte* is
  [A225](../../bugs/fixed/A225-german-ordinal-predicate-left-bare.md)'s case (*der Letzte*), which
  that bug files for ordinals only — **it landed on 2026-09-22**, so the seed reaches it by marking
  the German form `ordinal`. AMERICAN's Japanese predicate drops の, so 猫はアメリカです
  reads "the cat is America". None of this touches a gloss. It is what the seed's unit tests will
  pin.
- **The Japanese deictic words are fused compounds**: 先週, 去年, 昨夜 ("last week / year / night")
  and 来週, 来年. The engine cannot fuse them, as it cannot fuse German *derselbe* (P09's reason for
  *gleich*). この前の and 今度の are the free adjectives. 前の and 次の would render exactly as
  PREVIOUS and NEXT do.
- **Spanish and Portuguese LAST_PREVIOUS is PAST's word** (*pasado*, *passado*). The split rests on
  the other five: *scorso / passato*, *dernier / passé*, *letzte / vergangen*, この前の / 過去の,
  *last / past*.
- **Spanish AMERICAN** is *estadounidense*, the form the Spanish academies recommend for the United
  States. *Americano* is common too, and P09's row lists it. The seed author decides. French
  RIGHT_CORRECT is *juste*: *la bonne réponse* is the idiom, but *bon* is GOOD's word.
- **Synonyms for the picker** (P09's verification step 4): the two LASTs and the two RIGHTs share
  their English word, so each needs a `synonym` — *final* and *most recent*, *correct* and
  *right-hand*.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| LAST_FINAL | `subjectGapGloss('OBJECT_THING', 'FOLLOW', { object: 'OBJECT_THING', definiteness: 'all', number: 'plural', adjectives: ['OTHER'] })` | that follows all other objects |
| LAST_PREVIOUS | `namedAgentGloss('PERIOD_TIME', 'FOLLOW', { concept: 'PERIOD_TIME', definiteness: 'this' })` | that this period follows |
| SAME | `subjectGapGloss('OBJECT_THING', 'BE', { complements: { predicative: { phrase: { concept: 'OBJECT_THING', definiteness: 'indefinite', adjectives: ['OTHER'] } } }, negative: true })` | that is not another object |
| RIGHT_CORRECT | `subjectGapGloss('OBJECT_THING', 'HAVE', { object: 'ERROR', number: 'plural', negative: true })` | that does not have errors |
| NEXT_COMING (optional) | `subjectGapGloss('PERIOD_TIME', 'FOLLOW', { object: 'PERIOD_TIME', definiteness: 'this' })` | that follows this period |

Four P09 words of six. RIGHT_CORRECT's is the only gloss that needs a new word.

## Probe renders (2026-09-22, engine source at HEAD, lexicon seeded in memory with the forms above)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| LAST_FINAL | that follows all other objects | che segue tutti gli altri oggetti | qui suit tous les autres objets | der auf alle anderen Gegenstände folgt | que sigue a todos los otros objetos | すべての別の物体に続く | que segue todos os outros objetos |
| LAST_PREVIOUS | that this period follows | che questo periodo segue | que cette période suit | auf den dieser Zeitraum folgt | que este período sigue | この期間が続く | que este período segue |
| SAME | that is not another object | che non è un altro oggetto | qui n'est pas un autre objet | der kein anderer Gegenstand ist | que no es otro objeto | 別の物体ではない | que não é outro objeto |
| RIGHT_CORRECT | that does not have errors | che non ha errori | qui n'a pas d'erreurs | der keine Fehler hat | que no tiene errores | 誤りがない | que não tem erros |
| NEXT_COMING (optional) | that follows this period | che segue questo periodo | qui suit cette période | der auf diesen Zeitraum folgt | que sigue a este período | この期間に続く | que segue este período |
| FIRST (shipped) | that all other objects follow | che tutti gli altri oggetti seguono | que tous les autres objets suivent | auf den alle anderen Gegenstände folgen | que todos los otros objetos siguen | すべての別の物体が続く | que todos os outros objetos seguem |
| NEXT (shipped) | that follows | che segue | qui suit | der folgt | que sigue | 続く | que segue |
| PREVIOUS (shipped) | that precedes | che precede | qui précède | der vorangeht | que precede | 先行する | que precede |

The words in a phrase, as the seed's tests will see them (DAY and WEEK are B59's words):

| phrase | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| the DAY + LAST_FINAL | the last day | il giorno ultimo | le jour dernier | der letzte Tag | el día último | 最後の日 | o dia último |
| the WEEK + LAST_PREVIOUS | the last week | la settimana scorsa | la semaine dernière | die letzte Woche | la semana pasada | この前の週 | a semana passada |
| the WEEK + NEXT_COMING | the next week | la settimana prossima | la semaine prochaine | die nächste Woche | la semana próxima | 今度の週 | a semana próxima |
| the DAY + SAME | the same day | il giorno stesso | le jour même | der gleiche Tag | el día mismo | 同じ日 | o dia mesmo |
| the BOOK + AMERICAN | the American book | il libro americano | le livre américain | das amerikanische Buch | el libro estadounidense | アメリカの本 | o livro americano |
| the WORD + RIGHT_CORRECT | the right word | la parola giusta | le mot juste | das richtige Wort | la palabra correcta | 正しい単語 | a palavra certa |
| the EYE + RIGHT_SIDE | the right eye | l'occhio destro | l'œil droit | das rechte Auge | el ojo derecho | 右の目 | o olho direito |
| the CAT IS SAME | the cat is same | il gatto è stesso | le chat est même | der Kater ist gleich | el gato es mismo | 猫は同じです | o gato é mesmo |
| the CAT IS LAST_FINAL | the cat is last | il gatto è ultimo | le chat est dernier | der Kater ist letzte | el gato es último | 猫は最後です | o gato é último |
| the CAT IS AMERICAN | the cat is American | il gatto è americano | le chat est américain | der Kater ist amerikanisch | el gato es estadounidense | 猫はアメリカです | o gato é americano |

No proposed gloss collides with a shipped one, or with another in this ticket. Six readings to
judge on authoring:

1. **LAST_FINAL is FIRST read the other way.** FIRST is what all other objects follow (the object
   gap), and LAST_FINAL is what follows them all (the subject gap). The strings differ in all seven,
   and LAST_FINAL is not NEXT's "that follows", which has no object. FOLLOW's object reads as it
   does in SECOND: German *auf*, Spanish *a*, Japanese に.
2. **LAST_PREVIOUS names the period the present one follows.** The antecedent is PERIOD_TIME, the
   class this *last* is said of (a week, a year, a night), and *this* is NOW's deixis
   ([A29](../done/A29-time-adverbs.md)). PREVIOUS ("that precedes") does not say which sequence;
   this gloss does: the one that ends now. Japanese この期間が続く also reads as the main clause
   "this period continues". FIRST's すべての別の物体が続く has the same shape and shipped.
   "That the present period follows" says the same on PRESENT (row under **Not solved**). PRECEDE
   cannot take the object: it is seeded intransitive, and it renders *der diesen Zeitraum
   vorangeht* for the dative and この期間を先行する for に.
3. **SAME is OTHER negated, one way only.** OTHER is literal by design (C24's primitives), so no pair
   defines only each other. The gloss names *objects* for whatever SAME is said of, as FIRST's does,
   and it is NEUTER's shape ("that is not male or female"). German *kein anderer Gegenstand* is the
   negation of a predicate noun, which is right.
4. **RIGHT_CORRECT is UNTITLED's and EMPTY's shape**: HAVE negated, with a bare plural object. The
   `no` determiner is the alternative, but it gives Japanese どの誤りもない (row under **Not
   solved**). The gloss is neither VALID ("that one accepts") nor GOOD ("of high quality"). ERROR
   must never be glossed back through RIGHT_CORRECT: "a part that is not right" would close a pair.
5. **NEXT_COMING is optional, and worth a concept.** The seeded NEXT is the sequence sense
   (*successivo, suivant, siguiente, seguinte*: "the following"), so Italian, French, Spanish and
   Portuguese cannot say "next week" today. Its gloss mirrors LAST_PREVIOUS and reads cleanly in all
   seven (この期間に続く). English *next* and German *nächste* render as NEXT's do, the way the two
   LASTs share *last*, *letzte* and *dernier*. Seed it with LAST_PREVIOUS or not at all.
6. **English and German deictic *last week* take no article**: *the last week* in the phrase rows
   is the builder's default determiner, and `bare` gives *last week* / *letzte Woche*. That concerns
   the builder, not the gloss.

## Not solved by this seed

1. **AMERICAN is literal by design.** Its sense is a relation to one country, and each lead fails:

   | plan | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | COME from NORTH_AMERICA | that comes from North America | che viene dall'America del Nord | qui vient d'Amérique du Nord | der aus Nordamerika kommt | que viene de América del Norte | 北米から来る | que vem da América do Norte |
   | PERSON LIVE in NORTH_AMERICA | who lives in North America | che abita in America del Nord | qui habite en Amérique du Nord | die in Nordamerika wohnt | que vive en América del Norte | 北米に住む | que mora na América do Norte |
   | COME from the UNITED_STATES\* | that comes from United States | che viene dallo Stati Uniti | qui vient de l'États-Unis | der aus Vereinigte Staaten kommt | que viene de Estados Unidos | アメリカ合衆国から来る | que vem do Estados Unidos |
   | BE in the UNITED_STATES\* | that is in United States | che è in Stati Uniti | qui est en États-Unis | der in Vereinigte Staaten ist | que está en Estados Unidos | アメリカ合衆国にある | que está no Estados Unidos |

   (\* not seeded, probed in memory as a proper COUNTRY.) The seeded continent renders cleanly in
   all seven, but it is true of Canada and Mexico (the C05 test). "Comes from" is also only one of
   American's relations: an American city is in the country, an American company belongs to it.
   UNITED_STATES would be a country, and C26 put every country and continent on the literal. Seeding
   one for this tooltip is what C26 refused for ANGEL: a word the corpus should not grow for one
   tooltip. A plural name with its article does not render either (*from United States*, *dallo
   Stati Uniti*, *de l'États-Unis*, *aus Vereinigte Staaten*, *do Estados Unidos*). And any gloss
   through America says the word itself in Japanese: AMERICAN is アメリカの, and UNITED_STATES
   アメリカ合衆国. Spanish *estadounidense* likewise contains *Estados Unidos*. CANINE is the
   precedent ([C24](../done/C24-grammar-feature-adjectives.md)): a relational adjective to a single
   noun, literal by design.
2. **RIGHT_SIDE is literal by design. C25's verdict on the RIGHT adverb carries over to the
   adjective**, and so do its leads:

   | plan | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | BE in the SIDE\* where the HEART\* is not | that is in the side where the heart is not | che è nel lato dove il cuore non è | qui est dans le côté où le cœur n'est pas | der in der Seite, in der das Herz nicht ist, ist | que está en el lado donde el corazón no está | 心臓がない側にある | que está no lado onde o coração não está |
   | BE in a SIDE\* | that is in a side | che è in un lato | qui est dans un côté | der in einer Seite ist | que está en un lado | 側にある | que está em um lado |
   | BE in the NEXT PLACE | that is in the next place | che è nel luogo successivo | qui est dans le lieu suivant | der im nächsten Ort ist | que está en el lugar siguiente | 次の場所にある | que está no lugar seguinte |
   | `stateGloss('OBJECT_THING', 'SEE', { aspect: 'neutral', modifier: 'RIGHT' })` | that one sees right | che si vede a destra | qu'on voit à droite | den man nach rechts sieht | que se ve a la derecha | 右に見る | que se vê para a direita |

   The heart's side is the dictionaries' route, and it does not render. The locative gives *in the
   side* and *dans le côté*. German nests one relative inside another. The Romance relatives end on
   their verb. And RIGHT_SIDE would be glossed by a negation. "A side" is equally true of both sides (the C05 test).
   "The next place" is right of a place only along a line written left to right (C25), and German
   says *im nächsten Ort*. The seeded RIGHT adverb gives RIGHT_SIDE's own stem in every language
   (*right*, *a destra*, *à droite*, *nach rechts*, *a la derecha*, 右に, *para a direita*). The lead through
   HAND ([B65](B65-everyday-nouns.md)'s word) would be "the hand one writes with", which is false of the left-handed, so it
   was not probed.
3. **SAME's other leads say something else:**

   | plan | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | BE OTHER, negated | that is not other | che non è altro | qui n'est pas autre | der nicht andere ist | que no es otro | 別ではない | que não é outro |
   | BE DIFFERENT\*, negated | that is not different | che non è diverso | qui n'est pas différent | der nicht verschieden ist | que no es diferente | 違うではない | que não é diferente |
   | `stateGloss('OBJECT_THING', 'INDICATE', { modifier: 'ALREADY' })` | that one has already indicated | che si è già indicato | qu'on a déjà indiqué | den man schon bezeichnet hat | que se ha indicado ya | もう示した | que se indicou já |
   | `stateGloss('OBJECT_THING', 'NAME', { modifier: 'ALREADY' })` | that one has already named | che si è già nominato | qu'on a déjà nommé | den man schon benannt hat | que se ha nombrado ya | もう名付けた | que se nomeou já |
   | CHANGE_ONESELF, negated | that does not change | che non cambia | qui ne change pas | der sich nicht ändert | que no cambia | 変わらない | que não muda |

   *That is not other* is marked in English, and Italian *che non è altro* reads "that is nothing
   else". German leaves the -e citation *andere* bare as a predicate, which is A225's family.
   DIFFERENT would be a near-synonym of OTHER seeded for one tooltip, and its Japanese 違う is a verb
   (違うではない). EQUAL was not probed: its German is *gleich*, SAME's own word. INDICATE is CHOOSE's
   and SELECT's genus in this corpus, so "already indicated" reads *already selected*, and Spanish
   and Portuguese put ALREADY last. NAME is *benannt*, given a name, which is why C24 rejected it for
   OTHER. "Does not change" means constant, not the same.
4. **RIGHT_CORRECT's other leads:**

   | plan | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | HAVE `no` ERROR, plural | that has no errors | che non ha nessun errore | qui n'a aucune erreur | der keine Fehler hat | que no tiene ningún error | どの誤りもない | que não tem nenhum erro |
   | BE TRUE\* | that is true | che è vero | qui est vrai | der wahr ist | que es verdadero | 本当の | que é verdadeiro |
   | EXPRESS a FACT | that expresses a fact | che esprime un fatto | qui exprime un fait | der eine Tatsache vermittelt | que expresa un hecho | 事実を表す | que exprime um fato |
   | `stateGloss('OBJECT_THING', 'EXPECT', { aspect: 'neutral' })` | that one expects | che si prevede | qu'on attend | den man erwartet | que se espera | 予想する | que se espera |
   | `stateGloss('OBJECT_THING', 'ACCEPT', { aspect: 'neutral' })` | that one accepts | che si accetta | qu'on accepte | den man akzeptiert | que se acepta | 受け付ける | que se aceita |

   TRUE and EXPRESS-a-fact say *true*, which is narrower: the right key or the right way expresses
   nothing. TRUE would also be a word seeded for one tooltip. Japanese drops the copula of a
   positive の-adjective in a headless relative (本当の for 本当である). That happens at HEAD too: the
   seeded SOLID's "that is solid" renders 固体の. No shipped gloss has that shape, and no bug file
   covers it. What one expects is not what is right. "That one accepts" is VALID's shipped gloss
   (the probe flags the collision in all seven).
5. **LAST's other leads:**

   | plan | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | LAST_FINAL: FOLLOW, agent `no` OTHER OBJECT_THING | that no other object follows | che nessun altro oggetto segue | qu'aucun autre objet ne suit | auf den kein anderer Gegenstand folgt | que ningún otro objeto sigue | どの別の物体も続かない | que nenhum outro objeto segue |
   | LAST_PREVIOUS: FOLLOW, agent the PRESENT PERIOD_TIME | that the present period follows | che il periodo presente segue | que la période présente suit | auf den der gegenwärtige Zeitraum folgt | que el período presente sigue | 現在の期間が続く | que o período presente segue |
   | LAST_PREVIOUS: PRECEDE + NOW | that precedes now | che precede ora | qui précède maintenant | der jetzt vorangeht | que precede ahora | 今先行する | que precede agora |
   | LAST_PREVIOUS: PRECEDE with an object (intransitive) | that precedes this period | che precede questo periodo | qui précède cette période | der diesen Zeitraum vorangeht | que precede este período | この期間を先行する | que precede este período |

   "No other object follows" is correct and adds Japanese's どの…も circumfix. "The present period"
   is as good as "this period" and one word longer. Either can ship. "Precedes now" reads "now
   precedes" in Japanese (今先行する).
6. **ERROR's own tooltip is not this ticket's.** ERROR is a root noun of C26's kind. "A failed
   action" (`glossOf('ACTION', 'FAILED')`: *un'azione fallita*, *eine fehlgeschlagene Handlung*,
   失敗した動作, and a marked French *une action échouée*) means a failure, not a mistake. And "a part
   that is not right" (*ein Teil, der nicht richtig ist*, 正しくない部分) would make ERROR and
   RIGHT_CORRECT define each other.
7. **The words probed and not proposed** are kept for whoever takes them up:

   | word | role | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|---|
   | TRUE | adjective | true | vero | vrai | wahr | verdadero | 本当の (ほんとうの) | verdadeiro |
   | DIFFERENT | adjective | different | diverso | différent | verschieden | diferente | 違う (ちがう) | diferente |
   | UNITED_STATES | noun, proper, plural name | United States | Stati Uniti (m pl) | États-Unis (m pl) | Vereinigte Staaten (pl) | Estados Unidos (m pl) | アメリカ合衆国 | Estados Unidos (m pl) |
   | SIDE | noun | side | lato (m) | côté (m) | Seite (f) | lado (m) | 側 (がわ) | lado (m) |
   | HEART | noun | heart | cuore (m) | cœur (m) | Herz (n) | corazón (m) | 心臓 (しんぞう) | coração (m) |

## Coverage

Three rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once
authored:

- **LAST_FINAL in English and Spanish.** In English it sits beside LAST_PREVIOUS, both called
  *last*, and the two tooltips must differ. Spanish pins FOLLOW's *a* before a quantified object
  (*que sigue a todos los otros objetos*).
- **LAST_PREVIOUS in English and German.** The object gap with FOLLOW's *auf* and the deictic
  *dieser* (*auf den dieser Zeitraum folgt*).
- **RIGHT_CORRECT in English and Japanese.** It shares *right* with RIGHT_SIDE, which stays literal,
  and Japanese has the plain negative of HAVE (誤りがない).

## Done

Shipped 2026-09-22. **Eight words seeded** — the six P09 adjectives LAST_FINAL, LAST_PREVIOUS, SAME,
AMERICAN, RIGHT_CORRECT and RIGHT_SIDE, the optional NEXT_COMING (all in
[adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts), after PREVIOUS) and the
differentia noun ERROR ([nouns.ts](../../../packages/backend/src/concepts/nouns.ts), after SORROW) —
and **five glosses** authored, the four the ticket proposed plus NEXT_COMING's.

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| LAST_FINAL | that follows all other objects | che segue tutti gli altri oggetti | qui suit tous les autres objets | der auf alle anderen Gegenstände folgt | que sigue a todos los otros objetos | すべての別の物体に続く | que segue todos os outros objetos |
| LAST_PREVIOUS | that this period follows | che questo periodo segue | que cette période suit | auf den dieser Zeitraum folgt | que este período sigue | この期間が続く | que este período segue |
| NEXT_COMING | that follows this period | che segue questo periodo | qui suit cette période | der auf diesen Zeitraum folgt | que sigue a este período | この期間に続く | que segue este período |
| SAME | that is not another object | che non è un altro oggetto | qui n'est pas un autre objet | der kein anderer Gegenstand ist | que no es otro objeto | 別の物体ではない | que não é outro objeto |
| RIGHT_CORRECT | that does not have errors | che non ha errori | qui n'a pas d'erreurs | der keine Fehler hat | que no tiene errores | 誤りがない | que não tem erros |

The words in a phrase, from the seed as it shipped (the rows the ticket's probe table had wrong
before the prenominal sets learned SAME and LAST_FINAL):

| phrase | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| the DAY + LAST_FINAL | the last day | l'ultimo giorno | le dernier jour | der letzte Tag | el último día | 最後の日 | o último dia |
| the WEEK + LAST_PREVIOUS | the last week | la settimana scorsa | la semaine dernière | die letzte Woche | la semana pasada | この前の週 | a semana passada |
| the WEEK + NEXT_COMING | the next week | la settimana prossima | la semaine prochaine | die nächste Woche | la semana próxima | 今度の週 | a semana próxima |
| the DAY + SAME | the same day | lo stesso giorno | le même jour | der gleiche Tag | el mismo día | 同じ日 | o mesmo dia |
| the CAT + SAME + BIG | the same big cat | lo stesso grande gatto | le même grand chat | der gleiche große Kater | el mismo gato grande | 同じ大きい猫 | o mesmo gato grande |
| the BOOK + AMERICAN | the American book | il libro americano | le livre américain | das amerikanische Buch | el libro estadounidense | アメリカの本 | o livro americano |
| the WORD + RIGHT_CORRECT | the right word | la parola giusta | le mot juste | das richtige Wort | la palabra correcta | 正しい単語 | a palavra certa |
| the HAND + RIGHT_SIDE | the right hand | la mano destra | la main droite | die rechte Hand | la mano derecha | 右の手 | a mão direita |
| the CAT IS SAME | the cat is the same | il gatto è lo stesso | le chat est le même | der Kater ist gleich | el gato es el mismo | 猫は同じです | o gato é o mesmo |
| the CAT IS LAST_FINAL | the cat is last | il gatto è ultimo | le chat est dernier | der Kater ist der Letzte | el gato es último | 猫は最後です | o gato é último |
| the CAT IS AMERICAN | the cat is American | il gatto è americano | le chat est américain | der Kater ist amerikanisch | el gato es estadounidense | 猫はアメリカです | o gato é americano |

What landed differently from the plan:

1. **The four Romance prenominal sets learned SAME and LAST_FINAL**, the engine edit the ticket
   asked for: Italian `PRENOMINAL_DETERMINER` (beside FIRST, SECOND, THIRD and OTHER) and the
   French, Spanish and Portuguese `PRENOMINAL`. Neither word apocopates in Spanish — `apocopate.ts`
   names FIRST and THIRD only, so "el último día" and "el mismo día" come out whole. A
   determiner-like prenominal does not take Italian's one qualifying slot (A145), so "lo stesso
   grande gatto" keeps both.
2. **A predicate SAME's article was fixed, not pinned.** The seed marks the five languages that keep
   it with a new `predicate_article` form; the engine's shared
   [`takesPredicateArticle`](../../../packages/engine/src/functions/takesPredicateArticle.ts) reads
   it, and each of en/it/fr/es/pt supplies the article in its `complementsPhrase` predicative branch,
   where a relative superlative already supplied one — "the cat is the same", *è lo stesso*, *est le
   même*, *es el mismo*, *é o mesmo*, agreeing with the subject (*la stessa*, *les mêmes*, *las
   mismas*), and under SEEM, BECOME, a negation and a relative clause alike. German *gleich* and
   Japanese 同じです were already right and carry no mark.
3. **LAST_FINAL's German predicate is right, because A225 landed.** Marking the German form
   `ordinal` gives *der Kater ist der Letzte*, *die Katze ist die Letzte*, *die Kater sind die
   Letzten*. LAST_PREVIOUS and NEXT_COMING carry the same mark, for the same reason: *letzte* and
   *nächste* are -e citations with no undeclined predicative form.
4. **AMERICAN's Japanese predicate is pinned as a known bug** (`A245` in
   [core-adjectives-and-adverbs.test.ts](../../../packages/engine/test/core-adjectives-and-adverbs.test.ts)):
   猫はアメリカです, "the cat is America". The rule that drops の and takes the copula
   ([jaAdjClass.ts](../../../packages/engine/src/languages/ja/jaAdjClass.ts)) is right for 茶色の
   (猫は茶色です) and wrong for an adjective relating its subject to a proper noun; the seeded FEMALE
   shows the same (猫は女性です). Attributively AMERICAN is right (アメリカの猫), and no shipped gloss
   uses the shape.
5. **NEXT_COMING shipped.** Without it no Romance language can say "next week": the seeded NEXT is
   the sequence sense. Its gloss mirrors LAST_PREVIOUS's and collides with nothing.
6. **Five synonyms, not four.** The two LASTs, the two RIGHTs *and* NEXT_COMING share an English word
   with a seeded concept, so the picker gets `final`, `most recent`, `coming`, `correct` and
   `right-hand`.
7. **ERROR ships with no gloss and no `isA`**, a root noun of [C26](../done/C26-root-nouns-on-the-literal.md)'s
   kind, as this ticket's **Not solved** 6 asked. Re-probed at HEAD, "a failed action" still says a
   failure, not a mistake (*un'azione fallita*, *eine fehlgeschlagene Handlung*, 失敗した動作, and now
   a Portuguese *uma ação malsucedida*).
8. **AMERICAN and RIGHT_SIDE stay literal by design**, and their leads were re-probed at HEAD. One
   row changed: with [A218](../../bugs/fixed/A218-german-ort-takes-an-and-von.md) landed, RIGHT_SIDE's
   "in the next place" is German *der am nächsten Ort ist*, not *im nächsten Ort* — the objection
   that remains is the one that decides it, that "the next place" is right of a place only along a
   line written left to right ([C25](../done/C25-place-and-direction-adverbs.md)). The leads through
   words probed in memory (UNITED_STATES, SIDE, HEART, TRUE, DIFFERENT) are untouched by A218 and
   A219, which reach a `place_prep` noun and a French bare count singular, neither of which those
   rows hold.
9. **The Japanese の-adjective copula drop that this ticket's **Not solved** 4 noted** (本当の for "that
   is true") is unchanged at HEAD and still in no shipped gloss; item 4 above is the same rule met as
   a predicate.
