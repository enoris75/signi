# P04-E16. Moods — conditional, imperative, infinitive; no inversion after a fronted clause

**Feature:** conditional sentences, commands and infinitive complements render in all three; word
order after a fronted clause is the declarative one, as a documented gap (P04 D9).
**Shape:** per-variety branches — engine-local rather than in the shared `mood.ts`, since nothing is
shared with `it/es/pt/fr` (P04 §2.4).
**Scope:** engine, three folders; `mood.ts` only if a branch must live there. Phase 3.
**Status:** **shipped for `rm-rumgr`, 2026-09-27** and **for `rm-sursilv`, 2026-09-27** — see [Done](#done); Vallader waits on its fork (E8). Filed 2026-09-27 from P04 D9, D10, §2.4 and phase 3. Depends on E10–E15.

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

Verified at HEAD (98a65a47), 2026-09-27: [`moodForm`](../../../../../packages/engine/src/mood.ts#L174),
[`imperativeForm`](../../../../../packages/engine/src/mood.ts#L554) in `mood.ts`. `gsw` keeps its conditional
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

## Done

Shipped for `rm-rumgr` 2026-09-27, engine-local: `mood.ts` has no `rm-*` branch (only its generic
`moodPN` is used).

- **D1, stored cells** (`rm-rumgr/finiteCell.ts`): the apodosis's `conditional` and the protasis's
  `subjunctive` both read `*_conditional` — ruled so because RG's imperfect subjunctive **is** the
  *-ass / -ess / -iss* series the column stores as the conditional (P04 §2.4's *sche il chaun currass,
  mangiass*; the `*_imperfect` cells are the indicative, `*_subjunctive` the present *conjunctiv*).
  So: *sch'il chaun curriss, il giat mangiass*; *sch'il giat fiss stanchel*; the past conditional *sch'il
  chaun avess currì, il giat avess mangià*. The present subjunctive a governor asks for reads
  `*_subjunctive` (*jau crai ch'il giat saja stanchel*), and `PAST_SUBJUNCTIVE_LANGUAGES` the conditional
  series. *sche* elides before a vowel like *che* (*sch'il*) *(verify)*.
- **D2, the imperative** (P04 D10): the stored `2sg / 1pl / 2pl_imperative` (*mangia, mangiain,
  mangiai*; *va*; *sajas attent*). Negative: *na … betg* around the command form (*na mangia betg*) —
  ruled over the infinitive *(verify)*. A reflexive command takes its clitic hyphenated after it
  (*tschenta-ta*, *tschentai-as*) and before it when negated (*na ta tschenta betg*). **The
  `instruction` register (UI controls) is the infinitive**, as in `fr/es/pt/de` — RG software labels its
  buttons *Memorisar*, *Avrir* — so E17's labels read *memorisar* *(verify)*.
- **The infinitive:** the citation and every governed clause — *mangiar la mieur*, *betg mangiar*, *sa
  tschentar*, *vegnir mangiada*; the link *a / da* from the governor (*cumenza a mangiar*, *ad* before a
  vowel).
- **D3, no inversion (P04 D9):** subject–verb order after a fronted *sche*-clause; the verb-second
  *sch'il chaun curriss, mangiass il giat* pinned `test.fails`.
- **D4:** the if-word *sche*; the object clause *che*, the indirect question *sche*; the adverbial
  conjunctions *cura che, durant che, perquai che, suenter che, avant che, fin che, dapi che, schebain
  che, sco*.

Tests: `rm-rumgr.test.ts` "P04-E16" — the conditional (plain, copular, negated, past), the three
imperative persons affirmative and negative, *ir*, *esser*, the reflexive command, the UI instruction,
the infinitive and its citations, a content clause in the indicative and the *conjunctiv*, an adverbial
clause; D3's pin.

### Sursilvan, 2026-09-27

Engine-local, no `mood.ts` branch. D1: the apodosis and the protasis both read `*_conditional`
(*sch'il tgaun curress, il gat magliass*; *sch'il gat fuss stanchels*; *sch'il tgaun havess curriu, il gat
havess magliau*); the *conjunctiv* after a governor (*jeu creiel ch'il gat seigi stanchels*). D2: the
stored imperatives (*maglia, magliein, magliei*; *va, mein*; *sei attents*; *seferma*), negated with
*buca* after them (*maglia buca la miur*, *va buca ora*) — the infinitive alternative is a `test.todo`;
the UI `instruction` register is the infinitive, as RG's (*memorisar*). D3: the verb-second *sch'il tgaun
curress, magliass il gat* pinned `test.fails`. D4: the if-word *sche* (*sch'* before a vowel); *cura che,
duront che, perquei che, suenter che, avon che, tochen che, dapi che, schegie che, sco*.

### Vallader, 2026-09-27

Engine-local, as RG's. **D1:** the protasis and the apodosis both read the stored
conditional (*scha'l chan cuorress, il giat mangiess*; *scha'l giat füss stanguel*; *vess curri, vess
mangià*). **D2:** the stored imperatives (*mangia, mangiain, mangiai*; *va*; *sajast attent*), negated
with *nu* before the command (*nu mangia*, verify); a reflexive command keeps the column's enclitic
(*tschanta't*, *tschantai'as*) and takes the proclitic when negated (*nun at tschanta*). The UI
`instruction` is the infinitive (*Arcunar*). **D3:** subject–verb order after *scha*, verb-second pinned
`test.fails`. **D4:** the if-word ***scha***, the complementizer ***cha***, both eliding before a vowel and
fusing with *il / ils* (*cha'l, scha'ls*); *cur cha, avant cha, perquai cha, davo cha, schabain cha …*
(verify all).
