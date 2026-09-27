# P04-E16. Moods — conditional, imperative, infinitive; no inversion after a fronted clause

**Feature:** conditional sentences, commands and infinitive complements render in all three; word
order after a fronted clause is the declarative one, as a documented gap (P04 D9).
**Shape:** per-variety branches — engine-local rather than in the shared `mood.ts`, since nothing is
shared with `it/es/pt/fr` (P04 §2.4).
**Scope:** engine, three folders; `mood.ts` only if a branch must live there. Phase 3.
**Status:** open. Filed 2026-09-27 from P04 D9, D10, §2.4 and phase 3. Depends on E10–E15.

| plan | `rm-rumgr` *(verify all)* |
|---|---|
| if the dog ran, the cat would eat | **sche** il chaun currass, **mangiass** il giat / il giat mangiass |
| eat! (2sg / 1pl / 2pl) | **mangia!** / **mangiain!** / **mangiai!** |
| don't eat! | **na mangia betg!** — or an infinitive *(verify)* |
| I want to eat | jau vuj **mangiar** |

## Why

`mood.ts`'s `futureStem`, `conditionalForm`, `subjunctiveForm` and `imperativeForm` switch on
`it/es/pt/fr` and return `undefined` for any other language (P04 §0.6) — the fork inherits calls that
render nothing.

## Today

Verified at HEAD (98a65a47), 2026-09-27: [`moodForm`](../../../../packages/engine/src/mood.ts#L174),
[`imperativeForm`](../../../../packages/engine/src/mood.ts#L554) in `mood.ts`. `gsw` keeps its conditional
engine-local.

## Design

### D1. Engine-local, stored cells

Each variety's conditional reads the six stored conditional cells (E4 D1). **Open point:** whether the
conditional and the imperfect subjunctive share forms in each variety (P04 §2.4) — if not, the
subjunctive cells are a data addition to E4–E6.

### D2. The imperative (P04 D10)

2sg, 1pl, 2pl; overrides for *esser* and *ir*. The negative imperative per variety: E11's shape, or an
infinitive *(verify)*. The `instruction` register (UI controls) is the infinitive in `fr/es/pt/de`;
**open point** which form each variety uses on a button — matters for E17.

### D3. No inversion (P04 D9)

After a fronted *sche*-clause or adverbial, each variety renders subject–verb order and pins the
inverted order as `test.fails`, naming D9. The reviewers rule in E19; inversion work, if required, is a
new ticket.

### D4. The if-word

*sche* in RG; the idioms' from E3's style sheets.

## Tests

Each suite: the table, the three imperative persons negated and not, a conditional in both clause
orders, D3's pins.

## Verification

Engine suite green; `git grep "'rm-" packages/engine/src/mood.ts` shows only the branches that had to be
there.

## Out of scope

Formal address; verb-second inversion itself.
