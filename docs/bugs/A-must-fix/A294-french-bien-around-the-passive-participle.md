# A294. French "bien" misses the passive participle

**Languages:** French

A short adverb such as *bien* goes right before the non-finite verb it modifies (A155): "a bien
mangé", "doit bien manger". In a passive that verb is the **participle**, so *bien* goes between
*être* and the participle: "la souris est bien mangée par le chien". The engine gets this wrong in two ways:

- **Simple tenses:** *bien* trails the participle, where a *-ment* adverb goes ("est mangée bien par
  le chien"). That is not French.
- **Periphrastic passives** (compound tense, progressive, modal, citation infinitive): A155's slot puts *bien*
  before the innermost non-finite verb, and in a passive that verb is *être* / *été*. "a bien été
  mangée" and "doit bien être mangée" are grammatical, but *bien* there is the assertive *indeed*
  ("it was indeed eaten"), not the manner the plan asks for.

| Case | Now | Want |
|---|---|---|
| the MOUSE is EATen WELL by the DOG | `la souris est mangée bien par le chien.` | `la souris est bien mangée par le chien.` |
| … future | `la souris sera mangée bien par le chien.` | `la souris sera bien mangée par le chien.` |
| … negative | `la souris n'est pas mangée bien par le chien.` | `la souris n'est pas bien mangée par le chien.` |
| relative: the MOUSE that will not be EATen WELL by the DOG RUNs | `la souris qui ne sera pas mangée bien par le chien court.` | `la souris qui ne sera pas bien mangée par le chien court.` |
| random phrase (relative, below) | `… le bœuf ne sera pas versé bien par l'Europe tranchante …` | `… le bœuf ne sera pas bien versé par l'Europe tranchante …` |
| … resultative | `la souris a bien été mangée par le chien.` | `la souris a été bien mangée par le chien.` |
| … resultative, negative | `la souris n'a pas bien été mangée par le chien.` | `la souris n'a pas été bien mangée par le chien.` |
| … progressive | `la souris est en train de bien être mangée par le chien.` | `la souris est en train d'être bien mangée par le chien.` |
| … MUST | `la souris doit bien être mangée par le chien.` | `la souris doit être bien mangée par le chien.` |
| … MUST, resultative | `la souris doit avoir bien été mangée par le chien.` | `la souris doit avoir été bien mangée par le chien.` |
| … citation infinitive | `bien être mangée par le chien.` | `être bien mangée par le chien.` |

Every Want string was rendered by the engine with the fix sketched below applied to a throwaway copy
of the tree.

**Already right.** The active voice, which A155 fixed (`le chien a bien mangé la souris`). A *-ment*
adverb after the passive participle (`sera mangée lentement par le chien`). A frequency adverb before
it (`sera toujours mangée par le chien`).

**Found by** the random phrase (seed 28050) "will these water foxes like which the interesting light
ox will not be shed by sharp Europe well not still be shed by all far teeth …", whose French relative
reads `le bœuf de lumière intéressante ne sera pas versé bien par l'Europe tranchante`.

## Shape of the fix

All in [fr/predicateText.ts](../../../packages/engine/src/languages/fr/predicateText.ts). `preInfinitive`
is the *bien* slot:

- On a passive, pass `''` in place of `preInfinitive` to `modalGroupFr` and `aspectVerbFr`, so neither
  puts *bien* in front of *être* / *été*.
- In the `if (passive)` block, put `preInfinitive` between the group and `passiveParticipleText`, and
  clear `effectiveMod` when it is set, as the block already does for a frequency adverb.
- Put it the same way into `infinitiveGroup` (the passive citation), and keep `negateInfinitive` from
  adding it a second time on a passive.

In the trial these five edits rendered every row and the engine suite stayed green.

| | |
|---|---|
| **Test** | `adverb.test.ts` → *known bugs: French "bien" before the passive participle* (2 `test.fails`: the simple tenses and the periphrastic passives; plus a regression test for the active participle, a *-ment* adverb and a frequency adverb) |
