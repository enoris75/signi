# A295. A German attributive noun drops its inherent adjective

**Languages:** German

Some German nouns carry words that are not part of the lemma. YOUNG_WOMAN is seeded as `Frau` with
the inherent adjective `jung`, and [`adjPhrase`](../../../packages/engine/src/languages/de/adjPhrase.ts)
declines it on the head ("die großen jungen Frauen"). The grammar-term nouns (LOCATIVE, DIRECTION, …)
add a `postnominal` genitive on top of that ("adverbiale Bestimmung des Ortes", A140). A noun used as
a **modifier** of another noun never reads either field, so it loses them:

- Without an adjective of its own it joins the compound in its bare stem: "Frauenbuch",
  "Bestimmungsbuch".
- With one it breaks out into the postposed genitive (A20), which declines only that adjective:
  "Buch kleiner Frauen".

So YOUNG_WOMAN renders exactly as WOMAN, and LOCATIVE as any *Bestimmung*. A compound can hold
neither an inflected adjective nor a genitive, so a modifier that carries one has to break out into
the genitive, as one with its own adjective already does.

| Case | Now | Want |
|---|---|---|
| random phrase: FEELINGs of GREAT YOUNG_WOMEN (purpose) | `die Gefühle großer Frauen laufen.` | `die Gefühle großer junger Frauen laufen.` |
| the BOOK of SMALL YOUNG_WOMEN (feature) | `das Buch kleiner Frauen brennt.` | `das Buch kleiner junger Frauen brennt.` |
| … singular | `das Buch kleiner Frau brennt.` | `das Buch kleiner junger Frau brennt.` |
| the BOOK of YOUNG_WOMEN | `das Frauenbuch brennt.` | `das Buch junger Frauen brennt.` |
| the CAT RUNs to that BOOK (direction) | `der Kater läuft zum Frauenbuch.` | `der Kater läuft zum Buch junger Frauen.` |
| the BOOK of LOCATIVEs | `das Bestimmungsbuch brennt.` | `das Buch adverbialer Bestimmungen des Ortes brennt.` |
| the BOOK of the SMALL LOCATIVE | `das Buch kleiner Bestimmung brennt.` | `das Buch kleiner adverbialer Bestimmung des Ortes brennt.` |

Every Want string was rendered by the engine with the fix sketched below applied to a throwaway copy
of the tree.

**Already right.** WOMAN, which has no inherent adjective (`das Frauenbuch`, `das Buch kleiner Frauen`).
YOUNG_WOMAN as a head (`die großen jungen Frauen laufen`) or as a possessor (`das Gefühl der großen
jungen Frauen`). The other six languages, which store the whole word in the lemma (`young woman`,
`giovane`, `jeune femme`, 若い女性).

**Found by** the random phrase (seed 28049) "will few great young woman feelings or they not jump
around some water …", whose German reads `werden wenige Gefühle großer Frauen oder sie …`.

## Shape of the fix

Two files in `languages/de/`. The trial fix treated `forms.adjective` or `forms.postnominal` like an
own adjective:

- [germanCompound.ts](../../../packages/engine/src/languages/de/germanCompound.ts): keep a modifier
  with either field out of the compound.
- [modifierGenitives.ts](../../../packages/engine/src/languages/de/modifierGenitives.ts): take such a
  modifier into the genitive. Decline the inherent adjective after the modifier's own adjectives, as
  `adjPhrase` orders them on a head, and put `postnominal` after the noun.

In the trial every row rendered its Want and the engine suite stayed green.

**For the fixer to decide:** the singular with no adjective of its own gives `das Buch junger Frau`.
That is the house form for a bare singular genitive modifier (A57's `der Schöpfer kleinen Jungen`), but
it reads worse than the compound it replaces. It has no pin. A bare singular genitive of a count noun
is a separate question from this defect.

| | |
|---|---|
| **Test** | `adjectives.test.ts` → *known bugs: German attributive noun drops its inherent adjective* (3 `test.fails`: beside its own adjective, out of the compound, the grammar term's adjective and postnominal; plus a regression test for WOMAN and for YOUNG_WOMAN as head and possessor) |

## Resolved

2026-09-24. As the trial fix sketched, in two files of `languages/de/`:
[`modifierGenitives.ts`](../../../packages/engine/src/languages/de/modifierGenitives.ts) gains
`isGenitiveModifier` (an own adjective, a `forms.adjective` or a `forms.postnominal`), takes every such
modifier into the postposed genitive, declines the inherent adjective after the modifier's own and
writes `postnominal` after the noun; [`germanCompound.ts`](../../../packages/engine/src/languages/de/germanCompound.ts)
leaves the same modifiers out of the compound. Decided: the bare singular keeps the house form, *das
Buch junger Frau* (A57's *der Schöpfer kleinen Jungen*), now pinned with a comment; whether a bare
count singular should stand there is a separate question.

The three `test.fails` in [adjectives.test.ts](../../../packages/engine/test/adjectives.test.ts)
(*known bugs: German attributive noun drops its inherent adjective*) are plain tests now, assertions
unchanged. Added in the same block: YOUNG_WOMAN as a modifier in an object (*sieht das Buch junger
Frauen*) and under a possessor (*der Kater des Mannes junger Frauen*), the bare singular, and the
LOCATIVE modifier in all seven. `modifierGenitives.test.ts` and `germanCompound.test.ts` each gained a
case.

