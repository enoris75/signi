# P10-E12. Possession without a genitive — the possessor dative and *vo*

**Feature:** a named possessor renders as the possessor dative (*em Vatter sis Huus*) or as *vo* +
dative (*s Huus vom Vatter*); `gsw` has no genitive at all.
**Shape:** a new `gsw` builder replacing `de`'s `possessorText`, `genitiveS`, `genitiveShows` and
`modifierGenitives` (deleted in E5).
**Scope:** engine; `gsw` suite.
**Status:** **shipped, 2026-09-25** — see [Done](#done). Filed 2026-09-25 from P10 D7 and phase 3. Depends on E5.

| plan | `de` | `gsw` *(verify)* |
|---|---|---|
| the father's house | das Haus des Vaters | **em Vatter sis** Huus |
| the mother's house | das Haus der Mutter | **de Mueter ires** Huus |
| the cats' food | das Futter der Katzen | **de Chatze ires** Fuetter |
| the house of a man | das Haus eines Mannes | s Huus **vo me** Maa |
| my house | mein Haus | mis Huus — pronominal possessor unchanged |
| my father's house | das Haus meines Vaters | **mim Vatter sis** Huus |

## Why

P10 D7. Every possessed noun phrase with a named owner goes through this, including P11's kin
sentences, which are a large part of the suite.

## Design

### D1. Which construction

The possessor dative is the ordinary spoken form for a definite, animate possessor; *vo* + dative
for an indefinite or inanimate one (*s Dach vom Huus*). **Recommendation:** possessor dative when the
possessor is definite **and** a person or animal; *vo* otherwise. E14 may widen or narrow it.

### D2. The linking possessive

*sis* (masc./neut. owner), *ires* (fem. or plural owner), declined for the **possessed** noun's
gender and case (*sis Huus, sini Chatz, sim Huus*). Read from the pronoun lexemes' possessive forms,
not a new table.

### D3. Recursion

*mim Vatter sim Brüeder sis Huus* is grammatical but heavy. **Recommendation:** possessor dative
for the outermost owner only, *vo* for the inner links — pinned, and flagged for E14.

## Tests

The table above; a possessed subject, object and dative; a possessor question (*wem sis Huus?*,
*verify*).

## Out of scope

Kin-specific article rules (P11 is `it`/`fr`/`de`/`ja`; `gsw` follows `de`'s none).

## Done

Shipped 2026-09-25, D1–D3 as recommended. `possessorText.ts` is rebuilt: `withPossessorDative` moves a
definite owner that is a person or an animal in front, in the determiner's place (*em Vatter sis Huus,
de Mueter ires Huus, de Chatze ires Ässe, mim Vatter sis Huus*, and after a preposition *mit em Vatter
sim Hund*); every other owner follows with *vo* + the dative (*s Huus vo emene Maa*, *d Tür vom Huus*).
The linking possessive is `possessiveGsw` for a third-person owner, agreeing with the possessed noun
(D2); an inner owner follows with *vo* (D3, *em Vatter vo de Mueter sis Huus*). A possessor question is
*wem sis*. Names are articled in Swiss German (*de Peter*, *em Peter sis Huus*), which the data now
says (`takes_article`).
