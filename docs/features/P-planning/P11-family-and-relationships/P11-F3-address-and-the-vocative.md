# P11-F3. Address — the vocative, and a kin term used as a name

**Construct:** talking *to* family — calling one's own mother お母さん, and using *Mom* as a name
("Mom runs", *Mamá corre*, *Mama läuft*). From [P11](README.md)'s *Out of scope* follow-ups.
**Shape:** two halves that look like one. The **name** half is data and a determiner rule; the
**vocative** half is a clause-level address that the engine has no slot for at all.
**Scope:** all 7 languages.
**Status:** planning, unscheduled. Split out of P11's follow-ups on 2026-09-23.

| | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| Mom runs (as a name) | Mom runs. | Mamma corre. | Maman court. | Mama läuft. | Mamá corre. | Mamãe corre. | お母さんは走ります。 |
| Mom, run! (address) | Mom, run! | Mamma, corri! | Maman, cours ! | Mama, lauf! | ¡Mamá, corre! | Mamãe, corre! | お母さん、走って！ |

**Proposed, not engine output.**

## Why

P11 seeded MOM and DAD and left them literal, because register is not a differentia (D13). What it
also left is the thing casual kin terms are mostly *for*: addressing the person. A child does not say
"my mother runs", they say "Mom runs" — the kin term stands in for a name — and they say "Mom!",
which is neither a subject nor an object.

Japanese is the interesting one and P11 flagged it: **one calls one's own mother お母さん**, the
honorific form D2 reserves for someone else's. Address overrides the whole own/other system P11
built.

## Today

Verified in the working tree on 2026-09-23 (P11's own work is uncommitted here).

- MOM and DAD are seeded, literal by design, with the casual forms in all seven (P11 §4, *Casual*).
- **There is no vocative anywhere.** `grep -rni vocative packages/shared/src packages/engine/src`
  returns nothing. No case, no slot, no field.
- The closest thing is the **imperative's addressee**: an imperative carries a `subject` that is
  never rendered but supplies the person and number of the command's form. That is an addressee the
  plan already holds — and it is a pronoun, not a name.
- A name is rendered by the noun phrase's `proper` handling, which every engine has (and German's
  `articledNameForms` bends for a possessed or modified one).

## Design

### D1. The two halves are separable, and the name half is much the smaller

**Mom-as-a-name** is: the kin term takes no determiner and capitalizes where the language does
("Mom", *Mamá*, *Mama* — and Italian *Mamma* usually keeps its article in the third person,
*la mamma corre*, which is the one real complication). It is a `proper`-like flag on a lexeme, a rule
the engines already have machinery for, and no new plan field.

**The vocative** is a slot on the clause that no language renders like any other slot.

**Recommendation: ship the name half first**, on its own, and let the vocative follow. The name half
unblocks the sentences P11 actually left unsayable; the vocative unblocks a mood the builder cannot
express anyway.

### D2. The vocative is a slot, not a case

Five of the seven mark a vocative with **nothing but position and a comma** — it is fronted, set off,
and otherwise a bare noun phrase. Japanese adds a comma and drops the particle. No language in this
set has a vocative *case* (Polish and Ukrainian do, which is
[P05](../P05-polish/README.md)/[P07](../P07-ukrainian/README.md)'s problem and worth naming now).

**Recommendation: `address?: NounElement` on `PhrasePlan`**, rendered before the clause with the
language's separator. Determiner-less by rule in every language — "the Mom, run!" is wrong in all
seven — which is the same article-dropping the essive already does
([`ObjectPredication`](../../../../packages/shared/src/index.ts#L475)).

### D3. Address overrides P11's own/other rule in Japanese

お母さん for one's own mother contradicts D2 of P11, which gives 母 for one's own and お母さん for
another's. It is not an exception to be patched around: **address is a third context**, beside
citation (母親) and possession (母 / お母さん).

**Recommendation: the address slot sets the honorific form unconditionally in Japanese**, whatever
`forms['own']` says. One branch, and it must be written where P11's rule is written
([`applyPossessorForm.ts`](../../../../packages/engine/src/translator/functions/applyPossessorForm.ts))
so the two are read together rather than fighting in different files.

Note that this makes the address slot the *second* consumer of P11's kin columns, which is a good
sign the columns were the right shape.

### D4. A vocative is not a subject, and the imperative already has one

The natural mistake is to make the address the imperative's subject. It is not: "Mom, run!" has an
addressee *and* an implied 2nd-person subject, and they agree but are not the same thing — "Mom, let's
run!" addresses her and takes a 1st-plural subject.

**Recommendation: keep them separate**, and let the address default the imperative's person where the
UI wants that convenience. The imperative's `subject` doc comment should say so.

## 1. Corpus (the name half)

A `name` column, or a reuse of `proper`, on the casual kin lexemes — MOM, DAD, and the ones a
follow-up adds (British *Mum*, *Grandma*, *Grandpa*). Italian's article in the third person
(*la mamma*) is a lexeme fact, not a rule.

## 2. Shared types (the vocative half)

`address?: NounElement` on `PhrasePlan`, doc-commented per D2, D3 and D4.

## 3. Per-engine rendering

The separator per language (a comma in six; 、 in Japanese, with no particle), the determiner
dropping, and Japanese's honorific override (D3). Spanish's ¡ opens before the address, not after it
— *¡Mamá, corre!*.

## 4. Tests

- Both rows of the table above, in all seven.
- Japanese: address forces お母さん on one's own mother (D3), and P11's 母 / お母さん / 母親 rows are
  unchanged elsewhere.
- An address on a non-imperative clause ("Mom, the cat runs") and on an imperative with a 1st-plural
  subject (D4).
- `test/kinship.test.ts` unchanged — this task edits the file that writes it.

## Verification

1. `npm run seed`, rebuild `@signi/shared` and `@signi/engine`.
2. Engine and backend suites green; typecheck clean.
3. In the browser (5173): MOM as a subject with no determiner, and an address on an imperative.

## Out of scope (follow-ups)

- **British *Mum*, *Grandma*, *Grandpa*** — seeding, once the name half exists.
- **A true vocative case** for Polish and Ukrainian (D2).
- **Titles in address** ("Mr Smith!") — [C38](../../../localization/done/C38-title-before-a-name.md)
  seeded MR, and address is where a title is actually used.
- **Interjections and greetings**, which share the slot's position and nothing else.
