# A326. A French or German plural indefinite possessor detaches into a broken phrase

**Languages:** French, German

After *de*, a French plural or mass indefinite loses its article: *la maison d'amis*, *loin de
maisons*, *à cause d'amis* (`deDet`). German has no article to decline for that phrase, so a
possessor with no marked genitive takes *von* + dative instead of the genitive: *das Haus von
Freunden* (`genitiveShows`). A277 now keeps the indefinite beside a pronominal possessive and
detaches the possessive (*des amis à moi*, *Freunde von mir*). On that phrase both rules fail:

- French puts *de* in front of the kept *des* / *de l'*.
- German's `genitiveShows` treats any pronominal possessor as a marked genitive, so it writes an
  unmarked genitive plural that reads as a nominative.

| Case | Now | Want |
|---|---|---|
| the HOUSE {possessor: FRIEND {indefinite, plural, possessor: 1sg}} BURNs | fr `la maison de des amis à moi brûle.` | fr `la maison d'amis à moi brûle.` |
| same | de `das Haus Freunde von mir brennt.` | de `das Haus von Freunden von mir brennt.` |
| the HOUSE {possessor: WATER {indefinite, possessor: 1sg}} BURNs | fr `la maison de de l'eau à moi brûle.` | fr `la maison d'eau à moi brûle.` |
| same | de `das Haus Wassers von mir brennt.` | de `das Haus von Wasser von mir brennt.` |
| the CAT RUNs {source: HOUSE {indefinite, plural, possessor: 1sg}} | fr `le chat court loin de des maisons à moi.` | fr `le chat court loin de maisons à moi.` |
| the CAT RUNs {cause: FRIEND {indefinite, plural, possessor: 1sg}} | fr `le chat court à cause de des amis à moi.` | fr `le chat court à cause d'amis à moi.` |
| same | de `der Kater läuft wegen Freunde von mir.` | de `der Kater läuft wegen Freunden von mir.` |

Every Want string was rendered by the engine with the fix below applied to a throwaway copy of the
packages. Each one is the same plan without the possessive (`la maison d'amis`, `das Haus von
Freunden`, `loin de maisons`, `à cause d'amis`, `wegen Freunden`) with the detached *à moi* / *von
mir* added.

**Reached only since A277.** Before it, the plural indefinite gave way to the possessive
(*de mes amis*, *meiner Freunde*).

**Already right.**

- Without the possessive, both languages are right.
- So is the singular, whose article survives: `la maison d'un ami à moi`, `das Haus eines Freundes
  von mir`.
- So is *some*: `de quelques amis à moi`, `einiger Freunde von mir`.
- The German source is right: `aus Häusern von mir`.
- The other five are right: en `the house of friends of mine burns.`, it `la casa dei miei amici
  brucia.` (Italian keeps the definite for an article-less indefinite, by A277's design), es `la
  casa de unos amigos míos arde.`, pt `a casa de uns amigos meus arde.`, ja `私の友達の家は燃えます。`

## Shape of the fix

**French.** [`fr/renderNP.ts`](../../../packages/engine/src/languages/fr/renderNP.ts) writes a
detached head's own article itself (`detWord = artFor(ownForms, …)`). The caller's `headFor` gets
the `bare` forms from `possessedHeadForms` and returns only *de*/*d'*. So `deDet` never sees the
indefinite it would have dropped. The trial fix was in `renderNP`: when the head is detached, its
own determiner is an indefinite plural or mass, and `headFor` ends in *de* / *d'*, leave out
`detWord`. That one condition covered the possessor, the source and the cause, and any other
*de*-governed relation. A cleaner fix could have the detached branch hand the caller the head's own
forms, so the caller's `deDet` makes the choice as it does for an unpossessed phrase. The fixer must
decide which. The A327 trial below needed the same hook for the negated object.

**German.** [`de/genitiveShows.ts`](../../../packages/engine/src/languages/de/genitiveShows.ts) opens
with `if (np.possessor && isPronominalPossessor(np.possessor)) return true;`. That holds for the
prenominal *mein-* but not for a detached possessive, whose *von mir* marks no case. The trial
limited the early return to heads whose determiner is not in `KEPT_BESIDE_POSSESSIVE`. It also made
[`de/possessorText.ts`](../../../packages/engine/src/languages/de/possessorText.ts)'s `vonDative`
append the detached `von ${dativePronounDe(…)}`, which it did not write before because
`possessorText` returns `''` for a pronominal possessor. `wegen` reads the same `genitiveShows`, so
the cause row followed.

With both trial fixes, every row rendered its Want and the rest of the engine suite stayed green.

| | |
|---|---|
| **Test** | `possession.test.ts` → *known bugs: a French or German plural indefinite possessor detaches into a broken phrase (A326)* (4 `test.fails`: the possessor on all seven, the mass possessor, the French source on all seven, the cause, plus a regression test for the unpossessed phrase, the singular, *some* and the plain source) |

Found on 2026-09-24 by the P11-E4 / A277 coverage audit (lane P1).

## Resolved

Fixed on 2026-09-24. French takes the cleaner of the two shapes above: the detached branch lets the
caller choose the determiner from the head's own forms. German takes the trial's fix.

- **French.** [fr/renderNP.ts](../../../packages/engine/src/languages/fr/renderNP.ts) gained the
  optional `ownHeadFor` for A327. A detached head given one takes its whole determiner from it. The
  genitive possessor passes `deDet` over `ownHeadForms(poss)`, so *la maison d'amis à moi*, *d'eau à
  moi*, *de deux amis à elle*. [fr/complementsPhrase.ts](../../../packages/engine/src/languages/fr/complementsPhrase.ts)
  passes each relation's own `headFor` over the head's own forms, so every complement builds a
  detached head as it builds the unpossessed one: *loin de maisons à moi*, *à cause d'amis à moi*,
  *par la faute d'amis à moi*, *parle d'amis à moi*. The relations that do not govern *de* are
  unchanged (*dans une maison à moi*, *avec des amis à moi*, *grâce à des amis à moi*).
- **German.** [de/genitiveShows.ts](../../../packages/engine/src/languages/de/genitiveShows.ts) keeps
  its early *yes* only for a prenominal possessive. A detached one (`keptBesidePossessive`) lets the
  head's own determiner decide. [de/possessorText.ts](../../../packages/engine/src/languages/de/possessorText.ts)'s
  `vonDative` writes the detached `von ${dativePronounDe(…)}`. So *das Haus von Freunden von mir*,
  *von Wasser von mir*, *wegen Freunden von mir*. This also repairs the counted possessor that A329
  had broken on this branch (*das Buch zwei Freunde von ihr* became *das Buch von zwei Freunden von
  ihr*).

The four `test.fails` in `known bugs: a French or German plural indefinite possessor detaches into a
broken phrase (A326)` in [possession.test.ts](../../../packages/engine/test/possession.test.ts) are
plain tests now. The same block gained the counted possessor, an adjective (*de vieux amis à moi*,
*alter Freunde von mir*), the negative and positive cause, *this* in the cause, the comitative, the
locative and the topic. The colocated `genitiveShows.test.ts` and `renderNP.test.ts` gained cases.

Not changed: German's negative noun cause writes *durch die Schuld* + a genitive whether or not it
shows (*durch die Schuld Freunde von mir*), with or without the possessive. That is a separate
defect.
