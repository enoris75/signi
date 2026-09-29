# P04-E8. The Sursilvan and Vallader engines — forked from RG, rendering the noun phrase

**Feature:** `languages/rm-sursilv/` and `languages/rm-vallader/` render noun phrases in their own
articles, contractions and agreement.
**Shape:** two copies of E7's `rm-rumgr/`, each then made to diverge. Independent folders, no shared
core (P04 D4).
**Scope:** engine; the two idiom suites start here.
**Status:** **shipped for `rm-sursilv`, 2026-09-27** — see [Done](#done); `rm-vallader` is its own agent's. Filed 2026-09-27 from P04 D4, §2.1 and phase 1. Depends on E7, and on E5 / E6
reaching the noun and adjective batches.

## Why

P04 D4 accepts triple maintenance for independence: a Sursilvan fix can never regress Vallader. Forking
from RG rather than from `it` again gives each idiom a Romansh starting point and puts the differences —
not the whole grammar — in each diff.

## Design

### D1. Fork only after E7 is green

Forking a half-built RG copies its gaps three times. E8 starts when E7's suite is green.

### D2. What is known to differ in the noun phrase

Almost nothing, from P04's table: the idiom rows for *the man, the water* are `?`. **This ticket does
not guess.** Each idiom's articles, elision and contractions come from E3's style sheet; where a style
sheet is silent the fork keeps RG's behaviour **and** pins it `test.fails` with a comment naming the
open question, so the gap is counted and not mistaken for a ruling.

### D3. A variety leak guard in each

Each idiom's suite fails on the other two varieties' marker words (E3 D2's lists): *è, betg* in
Sursilvan; *ei, buca* in Vallader; and Italian's, as E7 D2.

### D4. Possessives

`possessiveSursilv` and `possessiveVallader` in `possessive.ts`, from the style sheets.

## Tests

- Colocated tests rewritten per idiom.
- `rm-sursilv.test.ts` and `rm-vallader.test.ts`: E7's table rows, with each idiom's forms or a
  `test.fails` per D2; the leak guards.

## Verification

Engine suite green; three Romansh rows render noun phrases; each idiom's `test.fails` count is stated
in the Done section.

## Out of scope

Sursilvan's predicative adjective (E9); the clause (E10 on).

## Done

### Sursilvan (`rm-sursilv`), 2026-09-27

`packages/engine/src/languages/rm-sursilv/` is a fork of `rm-rumgr/`'s source (56 files; `sursilvanEngine`
kept, now the whole engine). RG names renamed: `rgArticle` → `sursilvArticle`, `rgDeg`, `rgStandard`,
`rgMods`, `rgExamples`, `rgPossessedHeadForms` → `sursilv*`, `naginForm` → `neginForm`, `rumgr.consts` →
`sursilv.consts` (`RG_*` → `SURSILV_*`, `AVAIR_RG` → `HAVER_SURSILV`); `indefiniteModifierSursilv` is
wired in `foldIndefiniteModifier`. RG's reflexive-clitic machinery is deleted (`nonReflexiveVerb`,
`reflexiveClitic`, `withReflexive`, `auxKey`): Sursilvan's *se-* is fused into every stored cell.

- **Articles (style sheet):** *il / la / ils / las*; ***igl*** before a vowel for the masculine, *l'* for
  the feminine; *in / ina*, *in'* before a vowel. **Contractions** *al, als; dil, dils; el, els* (a, da,
  en + *il / ils*); *a* is *ad* before a vowel (*ad igl um*). **D2:** the style sheet lists no other
  contraction, so *a la, da la, en la, ad igl, da igl, sin il* stay apart as in RG and are pinned
  `test.fails` with *alla, dalla, ella, agl, digl, sil* — the reviewer's first question.
- **Adjectives** agree from the stored forms; `position: 'pre'` places *grond* (GREAT), *bi, vegl, auter,
  medem, agen, sulet*, the ordinals, *proxim, davos*; BIG and GOOD follow (*in tgaun grond*, *in tgaun
  bun*). *e* is *ed* before a vowel (style sheet) — also before the article *il* (*il gat ed il tgaun*,
  verify).
- **Determiners** (none in the style sheet; the implementer's, all *(verify)*): *quest, quel, negin /
  negina, entgins, biars, paucs, tuts ils, mintga, omisdus ils, plirs, avunda, in tal, la gronda part
  dils*, mass *empau, bia*; cardinals *in / ina, dus / duas, treis, quater, tschun … dudisch*.
- **D4, possessives:** `possessiveSursilv` in `possessive.ts`, after `possessiveRumgr` — *miu, mia, mes,
  mias*; *tiu, siu*; *nies / nossa / nos / nossas*, *vies*; *lur*; no article.
- **Degree:** *pli, il pli, meins, aschi … sco*; standard under *che*. *meglier* pinned `test.fails`.
- **Object pronouns:** the stressed form after the verb (*jeu vesel el*, *il gat vesa mei*) — Sursilvan
  has no clitics, so unlike RG this is not a gap.
- **D3, the leak guard:** the suite fails on RG's markers (*jau, è, betg, giat, mangià, chaun, uffant*
  and the RG engine's *na, nagin, insaquants, blers, pervia, tar, cunter, main, uschè*), Vallader's (*eu,
  es, nu, nun, hoz, hom, uossa, alch, nüglia, adüna, fich*) and Italian's, over NP and clause plans.
- **Column fixes** (`concepts/rm-sursilv/`): THIRD_PERSON gains `plural_fem` / `disjunctive_plural_fem`
  *ellas*; REMEMBER (*seregurdar*) gains `aux: 'be'` like the other fused *se-* verbs; SHOULD and MIGHT
  store their conditional in the present cells, as Italian's and RG's (*el stuess ir*, *el pudess ir*).
- `'rm-sursilv'` is out of `EMPTY_ENGINES` in every test that had it.

`test.fails` in `rm-sursilv.test.ts`: **11** (6 contractions, E9's 2, E10 D3, *meglier*, E16 D3); 3 `test.todo`.

### Vallader, 2026-09-27

`languages/rm-vallader/` is a copy of `rm-rumgr/`'s source (58 files) made
Vallader; `valladerEngine` keeps its name and `index.ts`. Helpers renamed so no RG name remains:
`rgArticle` → `vlArticle` (and `vlDeg`, `vlExamples`, `vlMods`, `vlPossessedHeadForms`, `vlStandard`),
`withChe` → `withCha`, `naginForm` → `ingunForm`, `rumgr.consts` → `vallader.consts`, `RG_*` → `VL_*`.

- **D2, from the style sheet:** *il / la / l' / ils / las*, *l'* before a vowel **or *h* + vowel** (*l'hom*);
  *ün / üna*, never elided; *a / da* + *il / ils* → *al, dal, als, dals*; *in* + *il, la, ils* → *i'l, illa,
  i'ls* and *in* + *las* → *illas* by the same pattern. The sheet is silent on *sün*: *sün il* stays apart
  and *sül* is pinned `test.fails`. Where the sheet is silent on a word (demonstratives *quist / quel*,
  quantifiers *qualchüns, blers, pacs, tuots ils, mincha, plüs, avuonda*, cardinals, *co* before a
  comparative's standard) the word is the author's draft, *(verify)*.
- **D3:** the suite's leak guard fails on RG (*jau, è, betg, nagin, chaun, mieur, um, pli, sin, tar …*),
  Sursilvan (*jeu, ei, buca, gat, tgaun, magliar …*), Puter (*eau, üngün, ünguotta, essans*) and Italian
  words.
- **D4:** `possessiveVallader` in `engine/src/possessive.ts` — *meis, mia, meis, mias*; *teis, seis*;
  *nos, nossa, noss, nossas*; *vos …*; invariable *lur*; no article. The style sheet has no table: every
  form *(verify)*.
- Shared files: `foldIndefiniteModifier.ts` points `rm-vallader` at its own `indefiniteModifierVallader`
  (*alch grond*); `translator.consts.ts`'s approximator value is *circa / bunamaing*. `rm-vallader` left
  the `EMPTY_ENGINES` sets.

Tests: `packages/engine/test/languages/rm-vallader.test.ts` "P04-E8" and "P04-E7 D3 (Vallader)" (the tonic
object *eu vez el*; the clitics *eu til vez*, *eu nu til vez*, *il giat am vezza* pinned `test.fails`).
Vallader's `test.fails` count over the whole suite: **7** (*sül*, three clitic objects, the inverted yes/no
question, *meglder*, verb-second after *scha*), and one `test.todo` (E15 D1).
