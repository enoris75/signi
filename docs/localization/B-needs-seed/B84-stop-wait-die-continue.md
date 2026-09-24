# B84. Stop, wait, die and continue — the verbs of ending and going on

_(from the [P09-E24](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E24-ranks-201-400.md)
coverage check of 2026-09-24: *stop* (rank 257, both halves), *wait* (289), *continue* (350) and
*die* (371). None is a concept at 1229928. Five verbs, five glosses, three of which meet a shipped
defect in Spanish and Portuguese (reading 1). *Stop doing* and *continue doing* are
[P09-E42](../../features/P-planning/P09-core-vocabulary/P09-E42-stop-and-continue-doing.md)'s; the
nouns are seeded here, not the aspectual use.)_

## Seed first

Proposed forms, for the seed author to check. **The verbs were not seeded in memory** (see
[B83](B83-sit-stand-walk-run-away-lead.md)'s note); their glosses were rendered.

| concept | role | sense | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| STOP | verb | **E24**, rank 257, D2: to bring to a halt. Transitive, the CHANGE / CHANGE_ONESELF split | stop (stopped) | fermare | arrêter | anhalten (sep. *an*; hält an) | detener (irreg. like *tener*) | 止める (とめる) | parar |
| STOP_ONESELF | verb | **E24**, rank 257, D2: to come to a halt. Intransitive, `synonym: 'come to a halt'` | stop (stopped) | fermarsi (refl., *essere*) | s'arrêter (refl.) | anhalten (sep., *haben*) / stehen bleiben | detenerse (refl.) | 止まる (とまる) | parar |
| WAIT | verb | **E24**, rank 289. Intransitive, with the awaited thing as an object where one is named: en `object_prep: 'for'` (LOOK_AT's *at* is the precedent), de `object_prep: 'auf'` + accusative, es personal *a* for a person | wait | aspettare | attendre | warten | esperar | 待つ (まつ) | esperar |
| DIE | verb | **E24**, rank 371. Intransitive, unaccusative: *essere, être, sein* in the perfect | die (dying, died) | morire (muoio; *essere*; morto) | mourir (meurs; *être*; mort) | sterben (stirbt; *sein*; gestorben) | morir (muero; muerto) | 死ぬ (しぬ) | morrer |
| CONTINUE | verb | **E24**, rank 350. Transitive (continue an action). Intransitive *the story continues* and *continue doing* are E42's | continue | continuare | continuer | fortsetzen (sep. *fort*) | continuar (continúo) | 続ける (つづける) | continuar |

- **WAIT collides with EXPECT in three languages**: EXPECT's lexemes are *prevedere, attendre,
  erwarten, esperar*, 予想する, *esperar*, so French, Spanish and Portuguese write the same verb for
  both. That is the languages' own merger (*attendre* is both). EXPECT's synonym-free English label
  and WAIT's glosses separate them in the picker.
- **STOP and STOP_ONESELF share a word in English and Portuguese** (*parar* is both) and split in the
  rest. Japanese 止める / 止まる is the transitive / intransitive pair the corpus already has in
  始める / 始まる (START / BEGIN).
- **German *anhalten* is both** (transitive: *hält das Auto an*; intransitive: *das Auto hält an*).
  *Stehen bleiben* is the everyday intransitive, a multiword verb whose *stehen* conjugates (*bleibt
  stehen*). If the separable path handles it as a particle, it is the better STOP_ONESELF.
- **DIE's Italian and French perfects take *essere / être*** and agree (*è morta*). The Spanish and
  Portuguese reflexive *morirse* is emphatic, and *morir / morrer* is the plain verb.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| STOP | `causativeGloss({ object: 'OBJECT_THING', definiteness: 'indefinite' }, { verb: 'MOVE_ONESELF', modifier: 'NO_LONGER' })` | to cause an object no longer to move |
| STOP_ONESELF | `infinitiveGloss('MOVE_ONESELF', { modifier: 'NO_LONGER' })` | no longer to move |
| WAIT | `infinitiveGloss('STAY', { complements: { temporal: TIME indefinite, `until` } })` | to stay until a time |
| DIE | `infinitiveGloss('LIVE_ALIVE', { modifier: 'NO_LONGER' })` | no longer to live |
| CONTINUE | `infinitiveGloss('DO', { object: 'ACTION', definiteness: 'indefinite', modifier: 'STILL' })` | still to do an action |

**Five of five**, three of them after the defect in reading 1 is fixed.

## Probe renders (2026-09-24, engine source at 1229928, lexicon as seeded)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| STOP | to cause an object no longer to move | indurre un oggetto a non muoversi più | induire un objet à ne plus se déplacer | einen Gegenstand veranlassen, sich nicht mehr zu bewegen | inducir un objeto a **no moverse ya no** ✗ | 物体がもう移動しないようにする | induzir um objeto a **não se mover já não** ✗ |
| STOP_ONESELF | no longer to move | non muoversi più | ne plus se déplacer | sich nicht mehr bewegen | **no moverse ya no** ✗ | もう移動しない | **não se mover já não** ✗ |
| WAIT | to stay until a time | restare fino a un tempo | rester jusqu'à un temps | bis zu einer Zeit bleiben | quedarse hasta un tiempo | 時間まで残る | ficar até um tempo |
| DIE | no longer to live | non vivere più | ne plus vivre | nicht mehr leben | **no vivir ya no** ✗ | もう生きない | **não viver já não** ✗ |
| CONTINUE | still to do an action | fare ancora un'azione | faire encore une action | noch eine Handlung tun | hacer todavía una acción | 動作をまだする | fazer ainda uma ação |

The defect, isolated, and the finite clause it does not affect:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| NO_LONGER in an infinitive (RUN) | no longer to run | non correre più | ne plus courir | nicht mehr laufen | no correr ya no ✗ | もう走らない | não correr já não ✗ |
| NO_LONGER finite (the cat, RUN) | the cat no longer runs | il gatto non corre più | le chat ne court plus | der Kater läuft nicht mehr | el gato ya no corre | 猫はもう走りません | o gato já não corre |

The lead that was not taken:

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| WAIT: still to stay in a place | still to stay in a place | restare ancora in un luogo | rester encore dans un lieu | noch an einem Ort bleiben | quedarse todavía en un lugar | 場所にまだ残る | ficar ainda em um lugar |

Readings to judge on authoring:

1. **A shipped defect: NO_LONGER in an infinitive, Spanish and Portuguese.** The finite clause is
   right (*ya no corre*, *já não corre*), and the infinitive writes the negator twice: *no correr ya
   no*, *não correr já não*. The expected forms are *ya no correr* and *já não correr*. It reproduces at
   1229928 with seeded words only. It is **not filed** here, and the report names it for an A id.
   STOP, STOP_ONESELF and DIE ship after it is fixed, or with *dejar de* / *deixar de* glosses that
   E42 would make possible.
2. **English puts the adverb before *to*** ("no longer to move"). That is KEEP's shipped "still to
   have objects" and STAY's "still to be in a place", so the corpus is consistent; "to no longer
   move" is the more usual order.
3. **WAIT is "to stay until a time"**, C29's `until` relation on TIME. The "still to stay" lead is
   STAY's own gloss with a place. Japanese 残る is STAY's lexeme ("remain behind"), so 時間まで残る
   reads "remain until a time", which is right.
4. **DIE is the negated LIVE_ALIVE**, as LOSE ([B85](B85-pay-provide-spend-win-lose-thank-allow.md))
   negates HAVE. DEATH ships "the end of a life", and the two do not restate each other.
5. **CONTINUE, "still to do an action"**, is KEEP's shape on DO. German *noch eine Handlung tun* and
   Japanese 動作をまだする are literal but correct.

## Not solved by this seed

1. **The NO_LONGER infinitive** (reading 1) — an A bug.
2. ***Stop doing*, *continue doing*** — [P09-E42](../../features/P-planning/P09-core-vocabulary/P09-E42-stop-and-continue-doing.md).
3. **Intransitive CONTINUE** ("the story continues": *continua, continue, geht weiter*, 続く) — later,
   once a phrase wants it.

## Coverage

Two rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored:
WAIT in German and Japanese (the `until` relation inside a verb's gloss: *bis zu einer Zeit bleiben*,
時間まで残る) and DIE in Spanish and Portuguese, after the defect is fixed (*ya no vivir*, *já não
viver*).
