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
effondrait`, filed as [A137](../../bugs/A-must-fix/A137-pronominal-verb-in-a-hypothetical.md), along with
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
| COLLAPSE | to move downward suddenly | two adverbs, DOWN and SUDDENLY | `GlossParts.modifier` takes one adverb. Neither word is seeded (B27 seeds UP / DOWN) |

## MOVE in B27

[B27](../B-needs-seed/B27-ui-clipboard-move-resize.md) planned to share MOVE with this task, but its
"Move this period up" is the transitive "change the position of", and that one is pronominal in no
language: it *spostare*, fr *déplacer*, de *verschieben*, es *mover*, pt *mover*, ja 移動する. They are
two concepts. B27 is not blocked by any of this, so it takes the id MOVE. The intransitive here gets a
suffixed id when it is seeded (`MOVE_ONESELF`, as `SUBJECT_GRAMMAR` is suffixed).
