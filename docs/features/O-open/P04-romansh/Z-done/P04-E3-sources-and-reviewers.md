# P04-E3. Sources, terms of use and reviewers — before any Romansh form is authored

**Feature:** a written record of which reference works may be copied from and which only consulted
(P04 D11), a short style sheet per variety, and a first contact for each of the three reviewers.
**Shape:** three documents in this folder — `sources.md`, and a `style-<code>.md` per variety — plus
an irregular-core sample the columns (E4–E6) start from.
**Scope:** docs only. No code.
**Status:** **shipped, 2026-09-27**, but for the reviewers themselves — see [Done](#done). Filed 2026-09-27 from P04 D11, §1, §4 and §6. Blocks E4–E6.

## Why

P04 §6: *"This plan cannot be finished to the project's standard from published sources and model
knowledge alone"*, and *"The idiom columns are blank in this plan."* P10 authored its whole column
from model knowledge and marked every cell *(verify)*; P04 decided not to guess the idioms. That
decision needs sources in hand before E5 and E6 can start, and a licence answer before any form is
copied.

## Design

### D1. `sources.md`

One row per work — *Pledari Grond* (RG), *Grammatica elementara dal rumantsch grischun*, *Grammatica
Sursilvana*, Vieli/Decurtins, *Vocabulari fundamental*, Peer, the *Dicziunari Rumantsch Grischun* —
with: publisher, access (online / print), **terms of use** as quoted from the work, and a ruling:
*copy*, *consult*, or *unavailable*. A work with no stated terms is *consult*.

### D2. A style sheet per variety

The spelling conventions an author needs: accents (RG *à è ò*, Sursilvan *-au* participles), elision
before a vowel, capitalisation (lowercase language names, P04 §0.5), and a list of the words that tell
the three apart (*è / ei / es*, *betg / buca / nu*) — the variety leak guard E10 tests against.

### D3. The irregular core

P04 §1: *esser, haver, vegnir, ir, far, dir, savair, pudair, vulair, stuair, vesair* — six present and
six conditional cells, plus participle and auxiliary, in each variety: **~200 cells before anything
else renders.** Fill them here from the D1 sources, each cell citing its source. A cell no source gives
stays empty.

### D4. Reviewers

The Lia Rumantscha as first contact for RG, asked to route Sursilvan and Vallader (P04 §4). Record the
contact and the answer; the review itself is E19.

## Verification

`sources.md` has a ruling for every work; the three style sheets exist; the irregular-core tables are
filled or explicitly empty, cell by cell.

## Out of scope

The full columns (E4–E6); the review (E19).

## Done

Shipped 2026-09-27 alongside E4–E6, each column's author writing its variety's part.

- [`sources.md`](../sources.md): **every work is *consult*, none *copy*.** The Pledari Grond carries only
  "© Lia Rumantscha" (a third-party paper calls it openly licensed, naming no licence; the Apache-2.0 of
  its GitHub repos covers the code); the Uniun dals Grischs' Vallader dictionary is "All rights
  reserved"; no terms found for the rest. About 45 single Pledari Grond lookups were made for the RG
  verbs; nothing was bulk-downloaded.
- Style sheets: [`style-rm-rumgr.md`](../style-rm-rumgr.md), [`style-rm-sursilv.md`](../style-rm-sursilv.md),
  [`style-rm-vallader.md`](../style-rm-vallader.md), each with its variety's marker words for the leak
  guards. The RG irregular core is [`conjugation-rm-rumgr.md`](../conjugation-rm-rumgr.md); the idioms'
  are in their style sheets.
- **D4:** the Lia Rumantscha recorded as first contact, with a draft of three questions. **Nobody has
  been contacted.**
