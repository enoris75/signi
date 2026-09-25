# P10-E3. Before phase 1 — a Dieth style sheet and a 50-concept lexical sample

**Feature:** two measurements P10 says must happen **before** any bulk seeding: how much of the
vocabulary is a different word rather than a respelling (§1, §6), and whether one reviewer can spell
consistently in Dieth (§4, D2).
**Shape:** no code. A style sheet (`docs/features/P-planning/P10-swiss-german/dieth-style-sheet.md`),
a 50-concept sample sheet, and a reviewer's calibration pass over it. The result either confirms
the plan's cost estimate or reopens D1/D2.
**Scope:** docs and one reviewer. Nothing in the corpus.
**Status:** **planning**. Filed 2026-09-25 from P10 §1, §4, §6. Gates E4.

## Why

P10 §6: *"`de` is right there"* — a thin column regresses toward Standard German word by word, and
the only defence is knowing, before seeding, which concepts need a different word. And §4: *"An
inconsistent reviewer is worse than none, because their corrections become test pins."* Both are
cheap to measure on 50 concepts and expensive to discover on 784.

## Design

### D1. The sample

50 concepts, stratified by the corpus's roles and weighted to frequency: 15 verbs (including *sii,
haa, gaa, choo, tue, wüsse*), 20 nouns, 8 adjectives, 5 adverbs, 2 pronouns. Each row: the `de`
lemma, the proposed `gsw` lemma, and a class — **respelling** (*Katze → Chatz*), **sound shift with
rule** (*k → ch*, *ei → ii*, *au → uu*), or **different word** (*schauen → luege*, *arbeiten →
schaffe*, *einkaufen → poschte*).

**Done when** the share of *different word* is measured. P10 §1 estimates a third. Above half,
the cost estimate in §1 doubles and D1 (one dialect) should be revisited before E4.

### D2. The style sheet

Dieth's rules as this project applies them, each with two corpus examples:

- vowel length by doubling (*Huus, Muus, gsee*), never *h* or *ie* for length;
- *ch* for /x/ word-initially (*Chatz, choo*);
- no capitalised *ß*; *ss* throughout;
- *nd/ng* assimilation as spoken or as etymology — **decide**;
- clitics: *d Chatz*, *s Wasser* written separate, without apostrophe (Dieth) vs *d'Chatz* (common)
  — **decide**, since it affects every definite article E5 emits;
- the linking *-n-* (*wo-n-i*, *wie-n-er*) — written with hyphens or joined — **decide**.

### D3. Calibration

The reviewer spells the 50 lemmas and 20 of P10's example sentences twice, a week apart, without
seeing the first pass. Disagreements with themselves become style-sheet rulings. **Done when** the
second pass disagrees with the first on fewer than 5% of strings.

## Out of scope

Any seeding (E4); the full review (E14).
