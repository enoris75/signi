# B67. Place and focus adverbs: the ones that are a place or a manner gloss, the ones that point at a time or a focus wait

_(from the P09 core-vocabulary sweep of 2026-09-22. This ticket covers P09's eight adverbs of place and focus (§2
*Adverbs*, D4). Three ship on this seed. HERE needs no new differentia, ALSO waits on B66's SAME, and
REALLY needs one new noun plus the fix for
[A219](../../bugs/fixed/A219-french-bare-singular-after-dans.md), **which landed on 2026-09-22**. THERE, JUST, STILL and ONLY wait on the engine:
JUST and STILL on a temporal complement ([C29](../C-needs-engine/C29-temporal-complement.md)), ONLY on *nothing*
([C32](../C-needs-engine/C32-indefinite-pronouns.md)), THERE on the French distal demonstrative
([C40](../C-needs-engine/C40-french-distal-demonstrative.md)). EVEN's concept waits as well, because Japanese has no verb
adverb for it ([C39](../C-needs-engine/C39-focus-particle-on-a-noun-phrase.md)). The words come from
[P09](../../features/P-planning/P09-core-vocabulary/README.md) §2.)_

## Seed first

Proposed forms, for the seed author to check. These are suggestions, not renders.

| concept | role | sense | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| HERE | adverb, `place` (P09 rank 91) | in this place | here | qui | ici | hier | aquí | ここで | aqui |
| THERE | adverb, `place` (rank 49: place only, since "there is" is E6) | in that place | there | lì | là | dort | allí | そこで | ali |
| JUST | adverb, `frequency` in en/it/de/ja, no subtype in fr/es/pt (rank 62, D4: "only just / recently") | a moment ago | just | appena | à l'instant | soeben | hace un momento | たった今 (たったいま) | há pouco |
| ALSO | adverb, `frequency` (rank 83, D4) | likewise, in addition | also | anche | aussi | auch | también | 同じく (おなじく) | também |
| ONLY | adverb, `frequency` (rank 96, D4) | and nothing more | only | solo | seulement | nur | solo | ただ | só |
| STILL | adverb, `frequency` (rank 118, D4) | up to now, as before | still | ancora | encore | noch | todavía | まだ | ainda |
| REALLY | adverb, `frequency` (rank 131, D4) | in fact, truly | really | davvero | vraiment | wirklich | realmente | 本当に (ほんとうに) | realmente |
| SAME | adjective, **seeded by B66** (P09 rank 148) | not different | same | stesso | même | gleich | mismo | 同じ (おなじ) | mesmo |
| REALITY | noun, **count**, new differentia | the way things are | reality / realities | realtà / realtà (f) | réalité / réalités (f) | Wirklichkeit / Wirklichkeiten (f) | realidad / realidades (f) | 現実 (げんじつ) | realidade / realidades (f) |

The first seven rows are P09 words. EVEN, the eighth, is not seeded here (see **Not solved** 5). SAME
and REALITY are the differentia for ALSO and REALLY:

- **SAME must be seeded prenominal in it/fr/es/pt**, as P09's SAME row already asks. The engine
  reads the position from concept ids: add SAME to Italian `PRENOMINAL_DETERMINER` beside OTHER,
  and to the French, Spanish and Portuguese `PRENOMINAL` sets. Without that, ALSO's gloss reads
  *de la manière même*.
- **REALITY must be countable.** A219's fix, now at HEAD, gives *en* to a bare count singular. A noun
  seeded with `countable: false` gets *dans de la réalité* instead (rendered below).

**Japanese.** Five of the eight have a Japanese adverb that reads right before the verb: まだ,
本当に, たった今 (with a past verb), ここ and そこ (see note 1 below for their particle). For *also*,
*only* and *even*, the idiom is
a particle on the focused noun (猫**も**, 猫**だけ**, 猫**さえ**). That is [C39](../C-needs-engine/C39-focus-particle-on-a-noun-phrase.md)'s focus particle, which
the engine lacks. The three cases differ:

- For ALSO and ONLY, a real adverb exists and the choice fixes only the form.
  - ALSO: 同じく ("likewise"). また reads "again", which is why
    [B46](../done/B46-ui-console-topics-and-labels.md) refused it.
  - ONLY: ただ.
- For EVEN, no adverb exists, so the concept itself cannot be seeded. The engine renders the particle
  as an adverb, 「猫は食べ物をさえ食べます」, which is not Japanese.

**For the seed author.** The probes rendered each P09 word in a clause. None of the following
touches a gloss:

| clause | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| cat BE, HERE | the cat is here. | il gatto è qui. | le chat est ici. | der Kater ist hier. | el gato es aquí. | 猫はここでいます。 | o gato é aqui. |
| cat LIVE, HERE | the cat lives here. | il gatto abita qui. | le chat habite ici. | der Kater wohnt hier. | el gato vive aquí. | 猫はここで住みます。 | o gato mora aqui. |
| cat BE in this PLACE (the locative complement) | the cat is in this place. | il gatto è in questo luogo. | le chat est dans ce lieu. | der Kater ist in diesem Ort. | el gato está en este lugar. | 猫はこの場所にいます。 | o gato está neste lugar. |
| cat EAT, STILL, negative | the cat does not still eat. | il gatto non mangia ancora. | le chat ne mange pas encore. | der Kater frisst nicht noch. | el gato no come todavía. | 猫はまだ食べません。 | o gato não come ainda. |
| cat EAT, ALSO, negative | the cat does not also eat. | il gatto non mangia anche. | le chat ne mange pas aussi. | der Kater frisst nicht auch. | el gato no come también. | 猫は同じく食べません。 | o gato não come também. |
| cat EAT food, EVEN (ja さえ) | the cat even eats the food. | il gatto mangia perfino il cibo. | le chat mange même la nourriture. | der Kater frisst sogar das Essen. | el gato come incluso la comida. | 猫は食べ物をさえ食べます。 | o gato come até a comida. |
| cat EAT, JUST (de *gerade*), progressive | the cat is just eating. | il gatto sta appena mangiando. | le chat est en train de manger à l'instant. | der Kater frisst gerade gerade. | el gato está comiendo hace un momento. | 猫はたった今食べています。 | o gato está comendo há pouco. |

1. **A place adverb does not choose its particle or its copula the way the locative complement
   does.**
   - Japanese: ここで is wrong with BE and LIVE, which want ここに. EVERYWHERE's どこでも has the same
     problem today (猫はどこでもいます).
   - Spanish and Portuguese: BE with a place adverb takes *ser*. It should take *estar*, as it
     already does with the complement. EVERYWHERE shows this today as well (*el gato es en todas
     partes*).
   - No bug file covers either. **Both were fixed with this seed** (see **Done** 2), so the clause
     rows above now read *el gato está aquí*, *o gato está aqui*, 猫はここにいます and 猫はここに住みます,
     and EVERYWHERE with them.
2. **STILL and ALSO outscope the negation.** The correct forms are *still does not*, *noch nicht*,
   *does not … either*, *auch nicht*, *tampoco*, *neanche* and *non plus*. D4 asks for each
   language's position to be pinned, and the negative belongs in that pin.
3. **JUST reads its sense only in a compound or past tense.** In a simple present, *just* means
   "merely" and *appena* means "barely". German *gerade* is also the word the engine uses for the
   progressive ([C05, do not fix](../../bugs/C-do-not-fix/C05-german-no-progressive.md)), hence
   *soeben* in the table above.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| HERE | `complementGloss('locative', 'PLACE', 'this')` | in this place |
| ALSO | `mannerGloss('WAY', 'definite', 'SAME')` | in the same way |
| REALLY | `complementGloss('locative', 'REALITY', 'bare')` | in reality |
| THERE | `complementGloss('locative', 'PLACE', 'that')`: collides with HERE in French, see **Not solved** | — |
| JUST, STILL, ONLY, EVEN | see **Not solved** | — |

HERE uses the construct EVERYWHERE shipped on ([C25](../done/C25-place-and-direction-adverbs.md))
with NOW's deictic determiner. ALSO uses WELL's `mode` shape with SAME, so it becomes an A when B66
lands. REALLY becomes an A when REALITY is seeded; A219 is fixed.

## Probe renders (2026-09-22, engine source at HEAD, lexicon seeded in memory with the forms above)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| HERE | in this place | in questo luogo | dans ce lieu | in diesem Ort | en este lugar | この場所で | neste lugar |
| EVERYWHERE (shipped, for comparison) | in all places | in tutti i luoghi | dans tous les lieux | in allen Orten | en todos los lugares | すべての場所で | em todos os lugares |
| ALSO, with SAME prenominal in it/fr/es/pt ¹ | in the same way | nello stesso modo | de la même manière | auf die gleiche Weise | de la misma manera | 同じ方法で | da mesma maneira |
| ALSO, with SAME seeded without its position | in the same way | nel modo stesso | de la manière même | auf die gleiche Weise | de la manera misma | 同じ方法で | da maneira mesma |
| REALLY (HEAD before A219 landed) | in reality | in realtà | dans réalité | in Wirklichkeit | en realidad | 現実で | em realidade |
| REALLY, with A219's fix ² — **what HEAD now renders** | in reality | in realtà | en réalité | in Wirklichkeit | en realidad | 現実で | em realidade |
| *rejected:* REALITY `countable: false`, with A219's fix ² | in reality | in realtà | dans de la réalité | in Wirklichkeit | en realidad | 現実で | em realidade |
| *rejected:* ALSO as TIME + SAME (`measure`) ¹ | at the same time | allo stesso tempo | au même temps | zu der gleichen Zeit | al mismo tiempo | 同じ時間で | ao mesmo tempo |
| *rejected:* ALSO as ADDITION\* `bare`, `mode` | in addition | in aggiunta | d'ajout | auf Zusatz | de adición | 追加で | de adição |
| *rejected:* ALSO as ADDITION\* `bare`, locative, A219's fix ² | in addition | in aggiunta | en ajout | in Zusatz | en adición | 追加で | em adição |
| *rejected:* ALSO as OBJECT_THING `bare` plural OTHER, similative | like other objects | come altri oggetti | comme autres objets | wie andere Gegenstände | como otros objetos | 別の物体のように | como outros objetos |
| *rejected:* REALLY as FACT under `mode` (FACT has no relation today) | in fact | in fatto | de fait | auf Tatsache | de hecho | 事実で | de fato |
| *rejected:* REALLY as FACT `bare`, locative, A219's fix ² | in fact | in fatto | en fait | in Tatsache | en hecho | 事実で | em fato |
| *rejected:* REALLY as TRUTH\* `bare`, locative, A219's fix ² | in truth | in verità | en vérité | in Wahrheit | en verdad | 真実で | em verdade |

\* A candidate probed in memory and not proposed. FACT is seeded, and it was probed under each
relation through a copy of its forms.
¹ SAME was added to the four Romance position sets in memory, which is where B66's seed will put it.
² A219's own *Shape of the fix* was applied to a scratch copy of the engine, never to the tree. Under
it, EVERYWHERE, TOGETHER, BACKWARDS and HOME render byte-identically. It landed in the tree on
2026-09-22, so every "with A219's fix" row above is what HEAD renders now; A218 landed with it, so
EVERYWHERE's German is *an allen Orten*, not *in allen Orten*.

All three shipping glosses render in all seven languages, and none restates a shipped gloss. Four
readings to judge on authoring:

1. **HERE: German *in diesem Ort*.**
   - [A218](../../bugs/fixed/A218-german-ort-takes-an-and-von.md) was the bug for it: its
     **Want** row "… in this PLACE" is *an diesem Ort*, which is Duden's own definition of *hier*.
   - **A218 landed on 2026-09-22**, so the gloss ships as *an diesem Ort* already.
   - French *ce* is also the distal demonstrative
     ([demArticle.ts](../../../packages/engine/src/languages/fr/demArticle.ts)). So *dans ce lieu*
     reads "in this place" only by default, which is why THERE cannot ship (**Not solved** 1).
2. **ALSO: "in the same way" is a dictionary sense of *also*, not a stand-in.**
   - The dictionaries back it: Merriam-Webster gives "likewise" as the first sense of *also*, and
     Duden gives *auch* as "in gleicher Weise". For RAE, *también* is used "para afirmar la igualdad,
     semejanza, conformidad o relación de una cosa con otra ya nombrada".
   - The shape is WELL's `mode` gloss on WAY, in its definite form. The indefinite "in a same way"
     is not English (rendered).
   - Japanese 同じく is the adverb of the gloss's 同じ, but the gloss does not use the word itself.
     The repeated element is the differentia, as in STRONG ("of great strength") and C25's French
     *haut* in UP.
   - TIME + SAME is simultaneity, so it was rejected (see the table).
   - ADDITION's *in addition* reads only in en, it and ja under `mode` (*d'ajout*, *auf Zusatz*, *de
     adición*, *de adição*). As a locative it fails in French and German even with A219's fix (*en
     ajout*, *in Zusatz*). It was not proposed.
   - The similative says manner ("runs like other objects do").
3. **REALLY: the French render waits on
   A219.**
   - A219 says nothing shipped shows the defect. REALLY would be the first gloss that does, and its
     e2e row below would pin the fix.
   - In Japanese, the idiom is 実際に or 現実には. 現実で reads "in real life", with the same
     locative で that C25 accepted in グループで and すべての場所で.
   - The pairs *really* / *reality*, *wirklich* / *Wirklichkeit* and *realmente* / *realidad* are
     cognate. But REALITY is the head noun of the phrase, not a genus. It is the adverb's own noun,
     as in STRONG ("of great strength"), not B58's refused cognate genus.
   - REALLY's intensifier sense ("really big") is E8, VERY's construct, and is not this concept.
4. **The FACT lead does not hold, so no `mannerRelation` is proposed for FACT.**
   - `mode` gives *in fact*, *de fait*, *de hecho* and *de fato*, but also *in fatto* (the Italian is
     *di fatto*), *auf Tatsache* and 事実で.
   - `means` and `measure` read "with fact" and "at fact".
   - The locative reads only in English and, with A219's fix, French (*en fait*). It fails in the
     other five: *in fatto*, *in Tatsache*, *en hecho*, 事実で, *em fato*.
   - TRUTH ("in truth") reads in six languages with A219's fix but fails in Japanese: 真実で is not
     how 本当は is said.

Engine defect seen in the rejected rows and not filed: the French **verbless** similative leaves a
bare plural bare, giving *comme autres objets* and *comme objets*. The clause gets this right: *le
chat court comme d'autres objets*, *comme des objets*. The clause fix was
[A196](../../bugs/fixed/A196-french-bare-plural-after-a-preposition.md), and it did not reach the
`mannerGloss` path.

## Not solved by this seed

Leads, probed (MOMENT\* is a candidate, seeded in memory only):

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| THERE: PLACE `that`, locative | in that place | in quel luogo | dans ce lieu (HERE's) | in jenem Ort | en ese lugar | その場所で | nesse lugar |
| THERE: PLACE `that`, direction | to that place | a quel luogo | à ce lieu | zu jenem Ort | a ese lugar | その場所へ | a esse lugar |
| THERE: PLACE `definite`, locative | in the place | nel luogo | dans le lieu | im Ort | en el lugar | 場所で | no lugar |
| THERE: PLACE FAR, locative | in a far place | in un luogo lontano | dans un lieu lointain | in einem fernen Ort | en un lugar lejano | 遠い場所で | em um lugar distante |
| JUST: TIME PREVIOUS (ALREADY's) | at a previous time | a un tempo precedente | à un temps précédent | zu einer vorherigen Zeit | a un tiempo anterior | 前の時間で | a um tempo anterior |
| JUST: MOMENT\* `definite` PREVIOUS | at the previous moment | al momento precedente | à l'instant précédent | zu dem vorherigen Augenblick | al momento anterior | 前の瞬間で | ao momento anterior |
| JUST: TIME RECENT | at a recent time | a un tempo recente | à un temps récent | zu einer zuletzt verwendeten Zeit | a un tiempo reciente | 最近使用された時間で | a um tempo recente |
| JUST: TIME NEAR | at a near time | a un tempo vicino | à un temps proche | zu einer nahen Zeit | a un tiempo cercano | 近い時間で | a um tempo próximo |
| STILL: TIME `this` SAME (SAME without its position) | at this same time | a questo tempo stesso | à ce temps même | zu dieser gleichen Zeit | a este tiempo mismo | この同じ時間で | a este tempo mesmo |
| STILL: TIME `this`, locative | in this time | in questo tempo | dans ce temps | in dieser Zeit | en este tiempo | この時間で (NOW's) | neste tempo |
| STILL: TIME `this`, direction | to this time | a questo tempo (NOW's) | à ce temps (NOW's) | zu dieser Zeit (NOW's) | a este tiempo (NOW's) | この時間へ | a este tempo (NOW's) |
| ONLY: WAY SOLE, `mode` | in a sole way | in un modo unico | d'une manière unique | auf eine einzige Weise | de una manera única | 単一の方法で | de uma maneira única |
| ONLY: OBJECT_THING `no` OTHER, similative | like no other object | come nessun altro oggetto | comme aucun autre objet | wie kein anderer Gegenstand | como ningún otro objeto | どの別の物体もない | como nenhum outro objeto |
| EVEN: WAY UNEXPECTED (SUDDENLY's) | in an unexpected way | in un modo inatteso | d'une manière inattendue | auf eine unerwartete Weise | de una manera inesperada | 予期しない方法で | de uma maneira inesperada |
| EVEN: TIME UNEXPECTED | at an unexpected time | a un tempo inatteso | à un temps inattendu | zu einer unerwarteten Zeit | a un tiempo inesperado | 予期しない時間で | a um tempo inesperado |

1. **THERE: blocked on the French distal demonstrative.**
   - "In that place" reads in six languages: *in quel luogo*, *in jenem Ort* (Duden's own gloss of
     *dort*), *en ese lugar*, その場所で and *nesse lugar*.
   - French renders `this` and `that` with the same *ce*, so THERE's gloss is HERE's, *dans ce lieu*.
     The collision exists in one language only, and the sweep test would fail on it. The direction
     form collides the same way.
   - The definite ("in the place") loses the pointing in Japanese (場所で).
   - FAR says a distance, "far away" (*lontano*, 遠い), not deixis.
   - What would move it is an engine rule, not a §3 construct: French `that` would say its distance
     where the contrast is the meaning (*dans ce lieu-là*). → [C40](../C-needs-engine/C40-french-distal-demonstrative.md).
   - The Spanish and Portuguese `that` is the *ese* / *esse* series, which pairs with *ahí* / *aí*
     as naturally as with the *allí* / *ali* proposed above.
2. **JUST: blocked on E3 (a temporal complement).**
   - The gloss is "a moment ago", and *ago* measures back from now: *poco fa*, *il y a un instant*,
     *vor einem Augenblick*, *hace un momento*, さっき, *há pouco*. → [C29](../C-needs-engine/C29-temporal-complement.md) (E3).
   - Every construct-free lead fails:
     - ALREADY's "at a previous time" collides in all seven.
     - The previous moment is the one before another moment, not before now.
     - RECENT is the interface sense (*zuletzt verwendet*, 最近使用された).
     - NEAR is neither past nor future.
   - When E3 lands, JUST ("a moment ago") must stay apart from RECENTLY ("a short time ago"). RECENTLY
     has no gloss yet ([C24](../done/C24-grammar-feature-adjectives.md) seeded it as a differentia).
   - MOMENT is the word to seed then: moment, momento (m), instant (m), Augenblick (m), momento (m),
     瞬間 (しゅんかん), momento (m).
   - The fr/es/pt forms proposed above are themselves *ago* phrases, because the idiom is a verb
     periphrasis (*venir de*, *acabar de*) the engine cannot build. Spanish *hace un momento* would
     then likely equal its own gloss, so *recién* is the fallback. It is the Spanish adverb of
     recency, but it comes before the verb only in American Spanish.
3. **STILL: blocked on E3.**
   - The gloss is "up to now" (*fino ad ora*, *jusqu'à maintenant*, *bis jetzt*, *hasta ahora*, 今まで,
     *até agora*), and no complement says *until*. `terminus` is the recipient. → C29 (E3).
   - "At this same time" is a moment, not a stretch of time.
   - The locative and the direction of TIME `this` restate NOW's gloss in one and five languages.
   - NO_LONGER, STILL's opposite, has no gloss to negate, and a verbless gloss has no negation of its
     own.
4. **ONLY: blocked on E7 (*nothing*).**
   - The gloss is "and nothing more" (*e nient'altro*, *et rien d'autre*, *und nichts anderes*, *y nada
     más*, 他には何もない, *e nada mais*). That needs the negative indefinite beside E7's *something*, in
     a verbless "and" fragment. → [C32](../C-needs-engine/C32-indefinite-pronouns.md) (E7).
   - SOLE says "unique" (*in un modo unico*).
   - The negated similative says "unlike anything", and in Japanese どの別の物体もない means "there is
     no other object".
   - ONLY's commonest use, over a noun ("only the cat", 猫だけ), is **a focus particle on a noun
     phrase**. P09 D4 sends that use to §3, but §3 has no row for it → C39.
5. **EVEN: the concept waits, and so does its gloss.**
   - Japanese has no verb adverb for *even*: さえ, すら and でも are particles on the noun, and the
     verb form is 走り**さえ**する. Seeded as an adverb, it renders 「猫は食べ物をさえ食べます」
     (see the clause table above).
   - So EVEN needs the focus particle (C39) before it can be seeded, and P09 D4's "seed them as verb
     adverbs now" does not hold for it in Japanese.
   - Proposed forms for the other six: even, perfino, même, sogar, incluso, até, all `frequency`.
   - Its gloss is "also, though one does not expect it", which needs ALSO and a clause about the
     expectation, E4. SUDDENLY's "in an unexpected way" collides in all seven languages, and "at an
     unexpected time" says when, not what.

**No mutual definitions in this ticket.** ALSO uses SAME, which must not be glossed with ALSO. HERE
uses PLACE, and REALLY uses REALITY. PLACE is a literal root, and REALITY, once seeded, is an
unglossed root of C26's kind.

## Coverage

Three rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once
authored, each through `openVerbAdverb`:

- **HERE in English and Japanese (この場所で).** Japanese renders the deictic determiner as a word,
  where its articles render nothing, and the pointing is the whole gloss.
- **ALSO in English and French (*de la même manière*).** This pins the prenominal SAME the gloss
  depends on.
- **REALLY in English and French (*en réalité*).** This pins A219's fix through the first gloss that
  shows it.

## Done

Shipped 2026-09-22. **Seven words seeded** — the six P09 adverbs HERE, THERE, JUST, ALSO, ONLY and
REALLY ([adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts): HERE and THERE after
EVERYWHERE, the four focus adverbs after NO_LONGER) and the differentia noun REALITY
([nouns.ts](../../../packages/backend/src/concepts/nouns.ts), after SORROW, countable) — and **three
glosses** authored. STILL was seeded ahead of them with the words two tickets share, and its position
is pinned there; EVEN is not seeded ([C39](../C-needs-engine/C39-focus-particle-on-a-noun-phrase.md)).

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| HERE | in this place | in questo luogo | dans ce lieu | an diesem Ort | en este lugar | この場所で | neste lugar |
| ALSO | in the same way | nello stesso modo | de la même manière | auf die gleiche Weise | de la misma manera | 同じ方法で | da mesma maneira |
| REALLY | in reality | in realtà | en réalité | in Wirklichkeit | en realidad | 現実で | em realidade |

The adverbs in a clause, from the seed as it shipped:

| clause | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| cat BE, HERE | the cat is here. | il gatto è qui. | le chat est ici. | der Kater ist hier. | el gato está aquí. | 猫はここにいます。 | o gato está aqui. |
| cat LIVE, HERE | the cat lives here. | il gatto abita qui. | le chat habite ici. | der Kater wohnt hier. | el gato vive aquí. | 猫はここに住みます。 | o gato mora aqui. |
| cat EAT food, HERE | the cat eats the food here. | il gatto mangia il cibo qui. | le chat mange la nourriture ici. | der Kater frisst das Essen hier. | el gato come la comida aquí. | 猫は食べ物をここで食べます。 | o gato come a comida aqui. |
| cat BE, THERE | the cat is there. | il gatto è lì. | le chat est là. | der Kater ist dort. | el gato está allí. | 猫はそこにいます。 | o gato está ali. |
| cat BE, EVERYWHERE (shipped) | the cat is everywhere. | il gatto è ovunque. | le chat est partout. | der Kater ist überall. | el gato está en todas partes. | 猫はどこにでもいます。 | o gato está em toda parte. |
| cat EAT food, ALSO | the cat also eats the food. | il gatto mangia anche il cibo. | le chat mange aussi la nourriture. | der Kater frisst auch das Essen. | el gato come también la comida. | 猫は食べ物を同じく食べます。 | o gato come também a comida. |
| cat EAT food, ONLY | the cat only eats the food. | il gatto mangia solo il cibo. | le chat mange seulement la nourriture. | der Kater frisst nur das Essen. | el gato come solo la comida. | 猫は食べ物をただ食べます。 | o gato come só a comida. |
| cat EAT food, REALLY | the cat really eats the food. | il gatto mangia davvero il cibo. | le chat mange vraiment la nourriture. | der Kater frisst wirklich das Essen. | el gato come realmente la comida. | 猫は食べ物を本当に食べます。 | o gato come realmente a comida. |
| cat EAT food, JUST, resultative | the cat has just eaten the food. | la gatta ha appena mangiato il cibo. | la chatte a mangé à l'instant la nourriture. | die Katze hat soeben das Essen gefressen. | la gata ha comido hace un momento la comida. | 猫は食べ物をたった今食べました。 | a gata comeu há pouco a comida. |

What landed differently from the plan:

1. **A219 and A218 landed before the seed did**, so two rows the ticket wrote as futures are the
   present: REALLY's French is *en réalité* (the first shipped gloss that shows A219's fix, and the
   e2e row below pins it), and HERE's German is *an diesem Ort*, which is Duden's own definition of
   *hier*. Nothing else in the tables moved.
2. **The two place-adverb defects of note 1 were fixed here rather than filed.** Being somewhere is a
   locative whether a complement or an adverb says where, so
   [es](../../../packages/engine/src/languages/es/predicateText.ts) and
   [pt](../../../packages/engine/src/languages/pt/predicateText.ts) now select *estar* for a place
   adverb as they already did for a locative (*el gato está aquí*, *o gato está aqui*), and Japanese
   says the adverb with the particle its verb gives a place — a new `locative_ni` form (ここに, そこに,
   どこにでも) read by
   [jaModifierSeg](../../../packages/engine/src/languages/ja/jaModifierSeg.ts) under the existential
   いる / ある and 住む (猫はここにいます, どこにでも住みます), where an ordinary verb keeps で
   (ここで食べます). EVERYWHERE is fixed with them, and beside a predicate the adverb is an adjunct
   again (*el gato es grande aquí*, 猫はここで大きいです).
3. **STILL and ALSO under a negation are pinned, not fixed** (`A244` and `A245` in
   [core-adjectives-and-adverbs.test.ts](../../../packages/engine/test/core-adjectives-and-adverbs.test.ts)),
   as note 2 expected: the adverb sits in the frequency slot inside the negation, giving *the cat does
   not still eat*, *der Kater frisst das Essen nicht noch*, *il gatto non mangia anche il cibo*, *ne
   mange pas aussi*, *no come también*, *não come também*, where each language puts it outside or
   swaps the word (*still does not*, *noch nicht*; *does not … either*, *auch nicht*, *neanche*, *non
   plus*, *tampoco*, *também não*). It wants adverb scope, not a form: no gloss shows it, and the
   Italian, Spanish and Portuguese STILL rows read acceptably as they stand (*non mangia ancora*).
4. **JUST keeps the `frequency` subtype in en/it/de/ja and none in fr/es/pt**, as proposed. The three
   "ago" phrases then take a manner adverb's place after the verb and before the object (*la chatte a
   mangé à l'instant la nourriture*, *ha comido hace un momento la comida*), which reads but is not
   where those languages would put the phrase. That is the position D4 asked to be pinned, and it is,
   in the new test file; the gloss still waits on [C29](../C-needs-engine/C29-temporal-complement.md).
5. **THERE, JUST, ONLY and STILL ship with no gloss**, and their leads were re-probed at HEAD. Two
   rows changed, neither verdict: A218 gives THERE's leads *an jenem Ort*, *am Ort* and *an einem
   fernen Ort* (French still collides with HERE's *dans ce lieu*, which is what blocks it), and SAME's
   new position gives STILL's "at this same time" as *a questo stesso tempo*, *à ce même temps*, *a
   este mismo tiempo*, *a este mesmo tempo* — still a moment rather than a stretch.
6. **ALSO's gloss stands on B66's prenominal SAME**, which landed with this batch: *nello stesso
   modo*, *de la même manière*, *de la misma manera*, *da mesma maneira*. The rejected leads are
   unchanged, the French verbless similative still drops *de* before a bare plural (*comme autres
   objets*), and that defect is still unfiled.
7. **REALITY ships countable and unglossed**, a root noun of [C26](../done/C26-root-nouns-on-the-literal.md)'s
   kind, as **No mutual definitions** asked: REALLY's gloss says its own noun, as STRONG's says
   strength.
