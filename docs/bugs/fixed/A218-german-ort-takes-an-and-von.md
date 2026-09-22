# A218. German *Ort* takes "in" and "aus", where it wants "an" and "von"

**Language:** German

German picks the preposition of a place by the kind of place it is. A place one is *inside* takes
"in" for where and "aus" for where from: *im Haus*, *aus dem Haus*. A place one is *at* takes "an"
and "von": *an einem Ort*, *von einem Ort*, *am Ende*, *am Ziel*. The pair is the noun's, not the
verb's or the relation's.

The engine gives every inanimate place the first pair.
[`spatialHead`](../../../packages/engine/src/languages/de/spatialHead.ts) maps the plain locative
relation (`in`, the default) to "in" whatever the noun, and the source branch of
[`complementsParts`](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts)
takes "aus" for anything that is not animate (A154 gave the animate one "von"). No noun lexeme can
say otherwise. So *Ort*, the genus of every place gloss, comes out *in allen Orten*, *in einem Ort*
and *aus einem Ort*. The relative clause takes its preposition from the same branch, so "a place
where one lives" is *ein Ort, in dem man wohnt*.

Four seeded nouns take "an": PLACE (*Ort*), END (*Ende*: *im Ende* is not German), DESTINATION
(*Ziel*) and ORIGIN (*Ausgangspunkt*).

| Case | Now | Want |
|---|---|---|
| the CAT EATs in all PLACEs | `der Kater frisst in allen Orten.` | `der Kater frisst an allen Orten.` |
| … in a PLACE | `der Kater frisst in einem Ort.` | `der Kater frisst an einem Ort.` |
| … in the PLACE | `der Kater frisst im Ort.` | `der Kater frisst am Ort.` |
| … in this PLACE | `der Kater frisst in diesem Ort.` | `der Kater frisst an diesem Ort.` |
| … in no PLACE | `der Kater frisst in keinem Ort.` | `der Kater frisst an keinem Ort.` |
| the CAT IS in the other PLACE | `der Kater ist im anderen Ort.` | `der Kater ist am anderen Ort.` |
| the CAT EATs at the END | `der Kater frisst im Ende.` | `der Kater frisst am Ende.` |
| the CAT IS at the DESTINATION | `der Kater ist im Ziel.` | `der Kater ist am Ziel.` |
| … at the ORIGIN | `der Kater ist im Ausgangspunkt.` | `der Kater ist am Ausgangspunkt.` |
| a PLACE where the CAT EATs | `ein Ort, in dem der Kater frisst.` | `ein Ort, an dem der Kater frisst.` |
| the MAN GOes from a PLACE | `der Mann geht aus einem Ort.` | `der Mann geht von einem Ort.` |
| … from the PLACE | `der Mann geht aus dem Ort.` | `der Mann geht vom Ort.` |
| … from the ORIGIN | `der Mann geht aus dem Ausgangspunkt.` | `der Mann geht vom Ausgangspunkt.` |
| the CAT SENDs the BOOK to a PLACE | `der Kater schickt das Buch in einen Ort.` | `der Kater schickt das Buch an einen Ort.` |
| EVERYWHERE's definition (C25) | `in allen Orten.` | `an allen Orten.` |
| GO's definition (C17) | `sich aus einem Ort zu einem anderen Ort bewegen.` | `sich von einem Ort zu einem anderen Ort bewegen.` |
| IMPORT's definition (B19) | `Inhalt aus einem Ort übertragen.` | `Inhalt von einem Ort übertragen.` |
| HOME's definition | `ein Ort, in dem man wohnt.` | `ein Ort, an dem man wohnt.` |
| MARKET's definition | `ein Ort, in dem man handelt.` | `ein Ort, an dem man handelt.` |
| CLIPBOARD's definition | `ein Ort, in dem man kopiert.` | `ein Ort, an dem man kopiert.` |
| CONSOLE's definition | `ein Ort, in dem man tippt.` | `ein Ort, an dem man tippt.` |
| CANVAS's definition | `ein Ort, in dem man Phrasen macht.` | `ein Ort, an dem man Phrasen macht.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** A place one is inside keeps "in" and "aus" (`der Kater frisst im Haus.`, `der
Mann geht aus dem Haus.`, HOUSE's `ein Gebäude, in dem man wohnt.`). A living source keeps A154's
"von" (`der Mann geht vom Hund.`). A marked relation keeps its own preposition (`der Kater ist unter
dem Ort.`), a plain goal its "zu" (`der Mann geht zu einem Ort.`), and SAVE its container (`der
Kater speichert das Buch in den Behälter.`). The other six languages have one preposition for both
kinds of place (`the cat eats in a place.`, `il gatto mangia in un luogo.`, `le chat mange dans un
lieu.`, `el gato come en un lugar.`, `猫は場所で食べます。`, `o gato come em um lugar.`).

**Shipped strings.** Eight: the five place glosses (HOME, MARKET, CLIPBOARD, CONSOLE, CANVAS, all
`whereGloss('PLACE', …)`), EVERYWHERE, GO and IMPORT. `e2e/definition-tooltip.spec.ts` pins IMPORT's
German (`Inhalt aus einem Ort übertragen`).

Found authoring C25 (EVERYWHERE's gloss). The source half, GO's `aus einem Ort`, was reported
separately by another lane; it is the same defect on the same noun and is filed here with it.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine and backend suites green apart from the six passing tests listed below, which pin today's
German.

Let the noun's German lexeme name its preposition, as a verb's names `terminus_prep` (A143). The
trial seeded `place_prep: 'an'` on the de forms of PLACE, END, DESTINATION and ORIGIN in
[`nouns.ts`](../../../packages/backend/src/concepts/nouns.ts), and read it in four places:

- `spatialHead`: `case 'in'` takes `f['place_prep'] ?? 'in'`, which covers the locative, a route
  and a direction in the plain relation.
- [`prepDet`](../../../packages/engine/src/languages/de/prepDet.ts) fuses "an" as it fuses "in":
  *an + dem* → *am*, *an + das* → *ans*.
- The source branch of `complementsParts` takes "von" when the head is animate **or** names a
  `place_prep` ("an" and "auf" both pair with "von"), and the inanimate terminus's default "in"
  becomes `f['place_prep'] ?? 'in'`.
- [`relativizerStandIn`](../../../packages/engine/src/functions/relativizerStandIn.ts) keeps
  `place_prep` among `RELATIVIZER_KEPT_FORMS`, so the relative pronoun takes the head's preposition
  (*an dem*).

**Passing tests the fix moves.** Each pins the German this file calls wrong, and takes the **Want**
above:

- `genus-verbs.test.ts` → *IMPORT transfers content from a place …*
- `place-adverbs.test.ts` → *EVERYWHERE*
- `reflexive.test.ts` → *GO → to move from a place to another place*
- `relative.test.ts` → *a place where one does something, in every language* and *the clause keeps
  its own object, negation and tense* (`ein Ort, in dem man isst.` and its variants)
- `sweep-definitions.test.ts` → *CANVAS*

**Decisions for the fixer:**

- **The key's name and its values.** The trial's `place_prep` names the preposition itself, so a
  second value would cover the nouns that take "auf": MARKET (*auf dem Markt*, *vom Markt*), PATH
  (*auf dem Weg*), GROUND (*auf dem Boden*), SCREEN (*auf dem Bildschirm*). None is pinned here:
  `im Markt` is asserted as right nineteen times across the suite, and a covered market hall is
  *in*.
- **A direction in the plain relation.** The trial turns "into a place" into *an einen Ort* along
  with the rest, which is right for *Ort*. Nothing seeded builds it. Not pinned.

| | |
|---|---|
| **Test** | `complements/locative.test.ts` → *known bugs: German Ort takes "an" and "von", not "in" and "aus" (A218)* (1 `test.fails`, plus a regression test for a place one is inside, a relation, a goal, a living source and the other six) |

## Resolved

**2026-09-22.** As the trial had it: the key is `place_prep`, value `'an'`, on the de forms of PLACE,
END, DESTINATION and ORIGIN only in [`nouns.ts`](../../../packages/backend/src/concepts/nouns.ts). No
"auf" noun was seeded (MARKET stays *im Markt*). It is read in:

- [`spatialHead`](../../../packages/engine/src/languages/de/spatialHead.ts), `case 'in'` — the
  locative, a route and a direction in the plain relation;
- [`prepDet`](../../../packages/engine/src/languages/de/prepDet.ts) — *an + dem* → *am*, *an + das*
  → *ans*;
- the source branch of
  [`complementsParts`](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts)
  ("von" when the head is animate or names a `place_prep`) and its inanimate terminus default
  (`f['place_prep'] ?? 'in'`, behind A223's `terminus_dative` and a verb's own `terminus_prep`, which
  still win: *gibt dem Ziel das Buch*, *fügt das Buch zum Ort hinzu*);
- [`relativizerStandIn`](../../../packages/engine/src/functions/relativizerStandIn.ts), which keeps
  `place_prep` among its kept forms (*ein Ort, an dem*).

The direction "into a place" falls out as *geht an einen Ort*, *geht ans Ziel*; not pinned.

**Passing tests moved** (German rows only, each to the **Want**):

- `genus-verbs.test.ts` → *IMPORT transfers content from a place …*: `Inhalt aus einem Ort
  übertragen.` → `Inhalt von einem Ort übertragen.`
- `place-adverbs.test.ts` → *EVERYWHERE*: `in allen Orten.` → `an allen Orten.`
- `reflexive.test.ts` → *GO → to move from a place to another place*: `sich aus einem Ort zu einem
  anderen Ort bewegen.` → `sich von einem Ort zu einem anderen Ort bewegen.`
- `relative.test.ts` → *a place where one does something, in every language* (`ein Ort, in dem man
  isst.` → `ein Ort, an dem man isst.`) and *the clause keeps its own object, negation and tense*
  (`… in dem man Gegenstände kauft.`, `… in dem man nicht isst.`, `… in dem man aß.` → `an dem`)
- `sweep-definitions.test.ts` → *CANVAS*: `ein Ort, in dem man Phrasen macht.` → `ein Ort, an dem man
  Phrasen macht.`

**Shipped strings.** The eight in the table above now render the **Want**; `e2e/definition-tooltip.spec.ts`
pins IMPORT's German, now `Inhalt von einem Ort übertragen`. HOUSE's `ein Gebäude, in dem man wohnt`
is unchanged.

| | |
|---|---|
| **Tests** | `complements/locative.test.ts` → *known bugs: German Ort takes "an" and "von", not "in" and "aus" (A218)*, the `test.fails` now passing, plus an added case: the plural, a possessive and "nicht", a relative on END and one gapped on the source, "vom Ende" and "von den Orten", SEND's "ans Ziel", and ADD's and GIVE's own terminus winning over the noun's. Unit tests: `prepDet.test.ts` (the *am*/*ans* fusions), `spatialHead.test.ts`, `complementsPhrase.test.ts` (source, locative, terminus) and `relativizerStandIn.test.ts` |
