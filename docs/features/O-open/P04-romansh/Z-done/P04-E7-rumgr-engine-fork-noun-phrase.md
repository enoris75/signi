# P04-E7. The Rumantsch Grischun engine — forked from `it`, rendering the noun phrase

**Feature:** `packages/engine/src/languages/rm-rumgr/` renders noun phrases: articles with elision,
contractions, adjective agreement and position, determiners, possessives and degree.
**Shape:** copy `it`, rename, delete what RG has no counterpart for, re-source every word from the
`rm-rumgr` lexemes. The same move P10-E5 made from `de`.
**Scope:** engine; the `rm-rumgr` suite (`packages/engine/test/languages/rm-rumgr.test.ts`) starts here.
**Status:** **shipped, 2026-09-27** — see [Done](#done). Filed 2026-09-27 from P04 §2, §2.1 and phase 1. Depends on E1 and E4's first
batches.

| plan | `it` | `rm-rumgr` *(verify)* |
|---|---|---|
| the man, the water | l'uomo, l'acqua | **l'**um, **l'**aua |
| the cats | i gatti | **ils** giats |
| a big dog | un cane grande | **in** chaun grond |
| to the man / of the men | all'uomo / degli uomini | **al** um / **dals** umens |
| my cat, my house | il mio gatto, la mia casa | **mes** giat, **mia** chasa — no article |
| more beautiful | più bello | **pli** bel |

## Why

Every later ticket renders through the noun phrase. P04 §2's model table names `it` for articles,
contractions and agreement, and `it` for the compound past (E12) — the largest share of the engine.

## Today

Verified at HEAD (98a65a47), 2026-09-27.

- `it` is **62 source files, 2,717 LOC** (P04 §2's table is stale; `fr` is 75 / 3,168, `de` 102 /
  4,208). `gsw`, forked from `de`, is 100 / 4,114 — a fork keeps close to its parent's size.
- `it` has pieces RG does not need: `belloForm`, `buonoForm`, `quelloForm`, `questoForm` (prenominal
  suppletion), `euphonicA` (*ad*), `nessunForm`, and a clitic system (`itCliticCluster`, `itEnclitic`,
  `reflexiveClitic`).
- `possessiveIt` in [`possessive.ts:139`](../../../../../packages/engine/src/possessive.ts#L139) puts an
  article before the possessive; RG does not.

## Design

### D1. Fork from `it`, not from nothing

P04 D4 decides three independent folders with no shared core; it does not say how the first is
written. **Recommendation:** fork `it`, as `gsw` forked `de` — a working engine on day one, with every
Italian word then replaced by a lexeme lookup. Delete the suppletive prenominal forms and `euphonicA`
rather than stubbing them.

### D2. The leak guard, from the first commit

As P10-E6 D3: a suite test renders a fixed set of plans and fails on any Italian-only token (*il gatto,
gli, lo, degli, della, più, non*). Recommendation: rename the forked helpers (`artFor` → `rgArticle`, …)
so a grep for Italian names in `rm-rumgr/` finds nothing.

### D3. Object pronouns

P04's Out of scope keeps clitic object pronouns out. **Open point:** render an object pronoun as the
tonic form after the verb (*jau ves el*), pinned `test.fails` with what RG actually writes, or empty the
row for a plan with a pronoun object. Recommendation: the first — a visible, labelled gap.

### D4. Possessives

`possessiveRumgr` in `possessive.ts`: attributive, no article, agreeing with the possessed noun (*mes,
mia, mes, mias*) *(verify)*.

## Tests

- Colocated tests for each forked function, rewritten to RG forms (the `it` tests are not kept).
- `rm-rumgr.test.ts`: the table above, elision before a vowel for both genders, *a/da* + definite
  contractions, *en il* apart *(verify)*, the determiners of P04 §2.1, the leak guard.

## Verification

Engine suite green; the `rm-rumgr` row renders the table in the panel. `git grep` finds no Italian
helper names in `rm-rumgr/`.

## Out of scope

The clause (E10 on). The two idiom engines (E8).

## Done

Shipped 2026-09-27. `packages/engine/src/languages/rm-rumgr/` is a fork of `it/`'s source (58 files,
~1,960 LOC — smaller than `it`'s 2,717: the clitic system, the passive *si* and the prenominal
suppletion are gone), `italianEngine` → `rumantschGrischunEngine`, `it.consts` → `rumgr.consts`.

- **D1, fork:** every Italian word re-sourced from the `rm-rumgr` lexemes or from `rumgr.consts.ts`.
  Deleted: `belloForm`, `buonoForm`, `quelloForm`, `questoForm`, `euphonicA`, `itCliticCluster`,
  `itEnclitic`, `prenominalSurface`, `agreementForms`, `aspectVerb`, `auxFinite`, `conjugate`,
  `verbGroupInfinitive` (the last four replaced by `verbGroup` / `finiteCell`, E10–E16).
- **D2, names and the guard:** `artFor` → `rgArticle`, `itMods` → `rgMods`, `itDeg` → `rgDeg`,
  `itStandard` → `rgStandard`, `itPossessedHeadForms` → `rgPossessedHeadForms`, `itExamples` →
  `rgExamples`, `nessunForm` → `naginForm`, `IT_*` → `RG_*`; `git grep -i "italian\|\bit[A-Z]" rm-rumgr/`
  finds comments only. The suite's leak guard fails on Italian-only words and on the idioms' markers
  from the style sheet (Vallader *es* left out: it is RG's 2sg of *esser*).
- **Articles:** *il / la / l' / ils / las*, *l'* before a vowel for both genders in the singular only;
  *in / ina*, never elided; the indefinite plural bare. **Contractions** *al, als, dal, dals* only (a
  or da + masculine *il / ils*); *a l', da la, en il, sin il* stay apart. *a* is *ad* before a vowel
  (`adBeforeVowel`, which replaces `euphonicA`).
- **Adjectives** agree from the stored `base / fem / masc_plural / fem_plural` (`agreeAdj`), with the
  participle rule (`agreeByRule`) only as a fallback; `position: 'pre'` places them, one qualifying
  adjective before the noun as in `it`, the determiner-like ones (`PRENOMINAL_DETERMINER`) beside it.
- **Determiners:** *quest / questa*, *quel / quella*, *nagin / nagina*, *insaquants*, *blers*,
  *paucs*, *tuts ils*, *mintga*, *omadus ils*, *plirs*, *avunda*, *in tal*, *la gronda part dals*;
  cardinals *in / ina, dus / duas, trais …*. All *(verify)*.
- **D4, possessives:** `possessiveRumgr` in `engine/src/possessive.ts` — *mes, mia, mes, mias*; *tes*,
  *ses*, *noss*, *voss*, invariable *lur* — with no article (`rgPossessedHeadForms`).
- **Degree:** *pli*, *il pli*, *main*, *uschè … sco*; the standard under *che* (*ch'* before a vowel).
- **D3, object pronouns:** the tonic after the verb (*jau ves el*), pinned `test.fails` with the
  clitic RG writes (*jau al ves*, *il giat ma vesa*).
- **E1 D1** landed here: every language-keyed table in `translator.consts.ts` and the translator
  functions names the three codes, with RG's value for all three (see E1's Done).

Tests: `packages/engine/test/languages/rm-rumgr.test.ts` "P04-E7" — the ticket's table, elision in
both genders, every contraction, *en il* apart, the determiners, possessives, degree, the leak guard;
"P04-E7 D3" — the tonic object and its two `test.fails` rows.
