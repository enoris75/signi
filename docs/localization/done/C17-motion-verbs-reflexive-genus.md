# C17. Motion verbs — GO, RUN, COME, JUMP, COLLAPSE

_(was B14, split out of [B08](../done/B08-verb-definitions.md).)_

**Blocked on:** Italian pronominal verbs and German reflexive verbs. The genus these glosses cite is an
intransitive MOVE, "to change position", and five of the seven languages say it with a reflexive verb:
it *muoversi*, fr *se déplacer*, de *sich bewegen*, es *moverse*, pt *mover-se*. The engine handles the
French, Spanish and Portuguese clitic (`reflexiveFinite`, `reflexiveClitic`, `nonReflexiveVerb`). It has
no Italian or German equivalent, so a seeded MOVE would render broken sentences in the palette. That
makes it half-seeded, and the glosses would carry the German error too.

There is no non-reflexive way round it. Italian *andare* is GO itself, and the German intransitives
(*ziehen*, *wandern*, *reisen*) mean something narrower. English *move*, Japanese 移動する and the
three supported Romance languages are fine.

## Probe renders

Rendered 2026-09-14 with candidate MOVE forms put in front of the real lexicon, with the clitic inside
the Italian and German forms as the French and Spanish ones carry it. MOVE is not seeded.

| Clause | it | de |
|---|---|---|
| CAT MOVE, present | il gatto si muove ✓ | der Kater bewegt sich ✓ |
| negative | il gatto non si muove ✓ | der Kater bewegt sich nicht ✓ |
| resultative | il gatto **è mosso** (si è mosso) | der Kater **hat bewegt** (hat sich bewegt) |
| command, 2sg | **ti muovi** (muoviti) | **sich beweg** (beweg dich) |
| command, 1pl | **ci muoviamo** (muoviamoci) | **sich bewegen wir** (bewegen wir uns) |
| instruction | **ti muovi** (muoversi / muoviti) | sich bewegen ✓ |
| the cat that moves runs | il gatto che si muove corre ✓ | der Kater, **der bewegt sich**, läuft (der sich bewegt) |
| if the cat moved, … | se il gatto **muoversisse** (si muovesse) | wenn der Kater sich bewegen würde ✓ |
| gloss: MOVE + FAST | muoversi velocemente ✓ | **schnell sich bewegen** (sich schnell bewegen) |
| gloss: MOVE + source + direction | muoversi da un luogo a un luogo | **aus einem Ort zu einem Ort sich bewegen** |

French, Spanish, Portuguese and Japanese render every row correctly, except French in a hypothetical:
`si le chat nous déplaçait`. That one is not specific to MOVE. COLLAPSE already renders `si le chat nous
effondrait`, filed as [A137](../../bugs/fixed/A137-pronominal-verb-in-a-hypothetical.md), along with
the same defect in Portuguese.

## What the engine needs

- **Italian pronominal verbs** (a base ending in *-rsi*): the clitic before the finite verb and before
  *essere* in the compound tenses (*si è mosso*), enclitic on the imperative, the infinitive and the
  gerund (*muoviti*, *muovermi*), and the subjunctive and conditional built on the bare stem
  (*si muovesse*, not *muoversisse*).
- **German reflexive verbs**: the agreeing pronoun (mich, dich, sich, uns, euch) in the Mittelfeld's
  unstressed-pronoun slot, which `splitObject` opened for A127. A verb-final clause keeps it there
  (*der sich bewegt*), the infinitive leads with it (*sich schnell bewegen*), and the imperative puts it
  after the verb (*beweg dich*). The perfect takes *haben* (*hat sich bewegt*).

Separate MOVE's pronominal forms per language the way the Spanish lexeme is separated. The pronoun
should not live inside the German finite forms.

## Once unblocked

Seed MOVE (verb, intransitive, "to change position"), then author the glosses the probe supports:

| verb | gloss (en) | plan | note |
|---|---|---|---|
| RUN | to move fast | `infinitiveGloss('MOVE', { modifier: 'FAST' })` | QUICK is an adjective; the adverb is FAST. Probed: it *muoversi velocemente*, fr *se déplacer vite*, es *moverse rápido*, ja 速く移動する |
| GO | to move from a place to another place | `source` PLACE + `direction` PLACE with OTHER | OTHER is seeded ([B21](../done/B21-ui-clause-and-coordination-vocabulary.md)) and renders en *another*, it *un altro*, es / pt *otro* / *outro* with no article. Re-probe the whole gloss once MOVE lands. "to move to a place" is the fallback |
| COME | to move toward the speaker | — | No composable deixis ("toward the speaker", "here"). Likely stays literal, like the C05 genera |
| JUMP | to move into the air | `direction` AIR | AIR is not seeded. The engine's direction adposition is "to" / *a* / *zu* / へ, which gives "to move to the air"; probe that before seeding AIR |
| COLLAPSE | to move downward suddenly | two adverbs, DOWN and SUDDENLY | `GlossParts.modifier` takes one adverb. DOWN is seeded ([B27](../done/B27-ui-clipboard-move-resize.md)); SUDDENLY is not |

## MOVE in B27

[B27](../done/B27-ui-clipboard-move-resize.md) planned to share MOVE with this task, but its
"Move this period up" is the transitive "change the position of", and that one is pronominal in no
language: it *spostare*, fr *déplacer*, de *verschieben*, es *mover*, pt *mover*, ja 移動する. They are
two concepts. B27 is not blocked by any of this, so it takes the id MOVE. The intransitive here gets a
suffixed id when it is seeded (`MOVE_ONESELF`, as `SUBJECT_GRAMMAR` is suffixed).

## Also waiting on the German reflexive: the inchoative CHANGE

Same shape as the causative/inchoative split BEGIN resolved for START. `CHANGE` is seeded transitive
("to make different", ja 変える), and an object-less clause built on it renders `その動作は変えます` —
Japanese lexicalises the pair, 変える for the causative and 変わる for the inchoative, exactly as it
does 始める / 始まる. The fix is the same: a second concept for "to become different".

It is blocked here rather than seeded because German has no non-reflexive intransitive for it. "Der
Plan ändert" is ungrammatical; the verb is *sich ändern* (or *sich verändern*, *sich wandeln*), all
reflexive. The non-reflexive candidates mean something narrower — *wechseln* is "to switch /
alternate between states", not "to become different" — which is the same compromise this file
refuses for MOVE. The other six are clean and labile: en *change*, it *cambiare*, fr *changer*,
es *cambiar*, pt *mudar*, ja 変わる.

Seed it alongside MOVE once the German reflexive work above lands, as `CHANGE_ONESELF` or a
semantic id of its own.

## Done

2026-09-19. The engine work, the two seeds and the two glosses the probe supported. JUMP, COLLAPSE
and COME moved to [C18](../C-needs-engine/C18-motion-verbs-without-a-gloss.md).

**Italian pronominal verbs.** The lexeme is stored as the Spanish one is: base `muoversi`, and every
finite form carries its clitic (`si muove`). `it/nonReflexiveVerb.ts` strips it: the base becomes
the plain infinitive (`muovere`, and `porre` for `porsi`), the gerund loses its `-si`, and the verb
selects essere. `it/reflexiveClitic.ts` gives the subject's clitic. `predicateText` places it:

- before the finite verb and before essere, after `non` (`si muove`, `si è mossa`, `si muovesse`,
  `si è sempre mosso`);
- attached to the gerund and the infinitive (`sta muovendosi`, `sta per muovermi`, `devo muovermi`,
  `deve essersi mossa`), through the new `reflexive` argument of `aspectVerb` and
  `verbGroupInfinitive`;
- after a command, as the addressee's (`muoviti`, `non muoverti`, `muoviamoci`, `muovetevi`).

Under the impersonal `si` the clitic becomes `ci` and climbs to the finite verb (`ci si muove`, `ci si
è mossi`, `ci si deve muovere`). The spec above did not cover that case; the probe found it.

**German reflexive verbs.** The lexeme stores the plain verb's finite forms and puts `sich` on the
citation only (`sich bewegen`). `de/nonReflexiveVerb.ts` strips it and drops any `aux`, because every
German reflexive forms its perfect with haben. `de/reflexivePronoun.ts` gives the accusative
pronoun for a person. `renderClause` and `subordinateClause` put it at the head of the Mittelfeld's
pronoun slot. Dative reflexives (*sich etwas merken*) are not covered.

**Seeded.** **MOVE_ONESELF** (`verbs/motion.ts`, "to change position", `synonym: 'change
position'`), and **CHANGE_ONESELF** (`verbs/intransitive.ts`, "to become different": de *sich
ändern*, ja 変わる, it essere). Both are in NONFINITE.

**Glosses.** Both RUN and GO are `isA: 'MOVE_ONESELF'`.

| Concept | Plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| RUN | `infinitiveGloss('MOVE_ONESELF', { modifier: 'FAST' })` | to move fast | muoversi velocemente | se déplacer vite | sich schnell bewegen | moverse rápido | 速く移動する | mover-se rapidamente |
| GO | `source` PLACE + `direction` PLACE with OTHER | to move from a place to another place | muoversi da un luogo a un altro luogo | se déplacer d'un lieu à un autre lieu | sich aus einem Ort zu einem anderen Ort bewegen | moverse de un lugar a otro lugar | 場所から別の場所へ移動する | mover-se de um lugar a outro lugar |

German gives every `source` the preposition *aus*. *Von einem Ort* would be more usual here, but
*aus einem Ort* reads as "out of a locality" and was kept.

**The probe table, re-rendered** with the seeded MOVE_ONESELF. The French hypothetical was A137,
already fixed.

| Clause | it | de |
|---|---|---|
| CAT MOVE, present | il gatto si muove | der Kater bewegt sich |
| negative | il gatto non si muove | der Kater bewegt sich nicht |
| resultative | il gatto si è mosso | der Kater hat sich bewegt |
| command, 2sg | muoviti | beweg dich |
| command, 1pl | muoviamoci | bewegen wir uns |
| instruction | muoviti | sich bewegen |
| the cat that moves runs | il gatto che si muove corre | der Kater, der sich bewegt, läuft |
| if the cat moved, … | se il gatto si muovesse, … | wenn der Kater sich bewegen würde, … |
| gloss: MOVE + FAST | muoversi velocemente | sich schnell bewegen |
| gloss: MOVE + source + direction | muoversi da un luogo a un altro luogo | sich aus einem Ort zu einem anderen Ort bewegen |

**Found.** Seeding MOVE_ONESELF showed two defects outside Italian and German. Both were already live
for BECOME:

- [A151](../../bugs/fixed/A151-portuguese-reflexive-nonfinite.md): Portuguese keeps the stored
  `se` on the gerund and the infinitive (`estou movendo-se`), and loses it in the compound tenses
  (`tinha movido`).
- [A152](../../bugs/fixed/A152-impersonal-se-with-reflexive-verb.md): the impersonal subject
  doubles `se` in Spanish and Portuguese (`se se mueve`).

**Tests.**

- Unit tests next to each new helper, plus Italian `predicateText`, `aspectVerb` and
  `verbGroupInfinitive` cases and German `renderClause` and `subordinateClause` cases.
- The sentence-level `packages/engine/test/reflexive.test.ts`: the probe table, both paradigms, the
  CHANGE / CHANGE_ONESELF pair, the two glosses, and the A151 / A152 pins.
- MOVE_ONESELF and CHANGE_ONESELF in `verb.test.ts`'s Italian resultative table.
- RUN (de) and GO (it) in `e2e/definition-tooltip.spec.ts`.
