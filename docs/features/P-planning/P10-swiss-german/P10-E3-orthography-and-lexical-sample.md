# P10-E3. Before phase 1 — a Dieth style sheet and a 50-concept lexical sample

**Feature:** two measurements P10 says must happen **before** any bulk seeding: how much of the
vocabulary is a different word rather than a respelling (§1, §6), and whether one reviewer can spell
consistently in Dieth (§4, D2).
**Shape:** no code. A style sheet (`docs/features/P-planning/P10-swiss-german/dieth-style-sheet.md`),
a 50-concept sample sheet, and a reviewer's calibration pass over it. The result either confirms
the plan's cost estimate or reopens D1/D2.
**Scope:** docs and one reviewer. Nothing in the corpus.
**Status:** **partial, 2026-09-25** — D1 and D2 shipped, D3 waits on a reviewer; see [Progress](#progress). Filed 2026-09-25 from P10 §1, §4, §6. Gates E4.

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

## Progress

2026-09-25.

- **D2, the style sheet:** [dieth-style-sheet.md](dieth-style-sheet.md). The four open rulings are
  made, each marked **ruling** and listed for the calibration pass: *nd/ng* written as etymology;
  clitic articles apart with no apostrophe (*d Chatz*); no linking *-n-* (the engine writes full
  pronouns, *wo ich*); nouns capitalised. It also fixes the articles, the adjective endings, the
  irregular core's cells and every function word the engine writes.
- **D1, the sample:** [lexical-sample.md](lexical-sample.md). On the 50 everyday concepts **20% are a
  different word** (10/50); over the whole corpus, classified at seeding, **6%** (48/783), because the
  corpus is mostly grammar and interface vocabulary Swiss usage borrows. **Below a third and far below
  half: the cost estimate stands, and P10 D1 is not reopened.**
- **Not done — D3, the calibration.** It needs a native Zürich speaker to spell the 50 lemmas and 20
  sentences twice, a week apart. The column was authored without one (E4 went ahead on the style sheet
  alone, since the engine work could not be tested without data), so every string it holds is
  *(verify)*, and the calibration now also decides how much of the column E14 rewrites.
