# P04-E8. The Sursilvan and Vallader engines — forked from RG, rendering the noun phrase

**Feature:** `languages/rm-sursilv/` and `languages/rm-vallader/` render noun phrases in their own
articles, contractions and agreement.
**Shape:** two copies of E7's `rm-rumgr/`, each then made to diverge. Independent folders, no shared
core (P04 D4).
**Scope:** engine; the two idiom suites start here.
**Status:** open. Filed 2026-09-27 from P04 D4, §2.1 and phase 1. Depends on E7, and on E5 / E6
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
