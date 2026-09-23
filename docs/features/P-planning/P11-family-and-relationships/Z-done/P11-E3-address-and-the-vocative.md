# P11-E3. Address — the vocative, and a kin term used as a name

**Construct:** talking *to* family — calling one's own mother お母さん, and using *Mom* as a name
("Mom runs", *Mamá corre*, *Mama läuft*). From [P11](../README.md)'s *Out of scope* follow-ups.
**Shape:** two halves that look like one. The **name** half is data and a determiner rule; the
**vocative** half is a clause-level address that the engine has no slot for at all.
**Scope:** all 7 languages.
**Status:** **shipped, 2026-09-24**, plan-only — the name half in the corpus and the engine, the vocative in the engine for all seven languages; see [Done](#done). Split out of P11's follow-ups on 2026-09-23.

| | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| Mom runs (as a name) | Mom runs. | la mamma corre. | Maman court. | Mama läuft. | Mamá corre. | Mamãe corre. | お母さんは走ります。 |
| Mom, run! (address) | Mom, run! | Mamma, corri! | Maman, cours ! | Mama, lauf! | ¡Mamá, corre! | Mamãe, corre! | お母さん、走って！ |

**Proposed**; the Italian cell of the first row is what ships (§1). The engine's own output is in [Done](#done).

## Done

Shipped 2026-09-24, **plan-only**: `PhrasePlan.address` has no builder or console control yet (a
follow-up). Two commits, the name half first. Pinned in
[`test/address.test.ts`](../../../../../packages/engine/test/address.test.ts) (13 tests), with unit
tests beside [`applyKinName.ts`](../../../../../packages/engine/src/translator/functions/applyKinName.ts),
[`resolveAddress.ts`](../../../../../packages/engine/src/translator/functions/resolveAddress.ts),
[`applyPossessorForm.ts`](../../../../../packages/engine/src/translator/functions/applyPossessorForm.ts),
[`translate.ts`](../../../../../packages/engine/src/translator/functions/translate.ts) and
[`withQuestionPossessor.ts`](../../../../../packages/engine/src/translator/functions/withQuestionPossessor.ts).
Every concept definition and word label renders as it did in all seven (none uses MOM or DAD).

| lang | Mom runs (as a name) | Mom, run (address) | Mom, the cat runs | Mom, let's run | my mother, run (D3) | my wife, run (not an elder) |
|---|---|---|---|---|---|---|
| en | Mom runs. | Mom, run. | Mom, the cat runs. | Mom, let's run. | My mother, run. | My wife, run. |
| it | la mamma corre. | Mamma, corri. | Mamma, il gatto corre. | Mamma, corriamo. | Mia madre, corri. | Mia moglie, corri. |
| fr | Maman court. | Maman, cours. | Maman, le chat court. | Maman, courons. | Ma mère, cours. | Ma femme, cours. |
| de | Mama läuft. | Mama, lauf. | Mama, der Kater läuft. | Mama, laufen wir. | Meine Mutter, lauf. | Meine Frau, lauf. |
| es | Mamá corre. | Mamá, corre. | Mamá, el gato corre. | Mamá, corramos. | Mi madre, corre. | Mi esposa, corre. |
| pt | Mamãe corre. | Mamãe, corra. | Mamãe, o gato corre. | Mamãe, corramos. | A minha mãe, corra. | A minha esposa, corra. |
| ja | お母さんは走ります。 | お母さん、走ってください。 | お母さん、猫は走ります。 | お母さん、走りましょう。 | お母さん、走ってください。 | 妻、走ってください。 |

Beside them, all engine output: "the cat sees Mom", *el gato ve **a** Mamá*, *le chat donne le livre
à Papa*, "Mom's book" / *das Buch Mamas* / *o livro de Mamãe*; "Mom and Dad run", *Maman et Papa
courent*; "a mom", "the moms", "my mom", "the old mom" unchanged; "Mom, does the cat run?",
*Mamá, ¿el gato corre?*; "Cat, run." for a common noun in address, *Pedro, corra* (the Portuguese
name bare), *Signor Pietro, corri*; and 母は / あなたのお母さんは / 母親は走ります unchanged outside
address.

What landed, and where it differs from the plan above:

1. **The column is `as_name: '1'`**, not a reuse of `proper`. `proper` is a concept flag, and the
   name use is both per language (Italian has none) and per phrase (only a definite, singular MOM
   with no possessor, adjective, noun modifier, relative clause, numeral or title). `applyKinName`
   turns `proper` on for that phrase and capitalizes the word, so C38's personal-name path does the
   rest in every slot. French and Portuguese, which article a name unless told otherwise, carry
   PETER's `takes_article: '0'` beside it (inert on the common noun). Documented in the seed skill's
   noun-column table.
2. **Italian sets no column**, as §1 says: *la mamma corre*, *il gatto vede la mamma*. The table's
   Italian cell is what ships. Italian is determiner-less only in address (*Mamma, corri*).
3. **A possessor question takes the name back.** "whose mom runs?", *la maman de qui court ?*:
   `withQuestionPossessor` restores the common noun that `applyKinName` kept in `name_of`.
4. **No "!" and no "¡".** The engine closes a command with the full stop, as it always has, and
   Spanish writes no ¡ for one. The ¿ is the only opening mark left, and a leading
   vocative stands **outside** it, as the RAE writes it: *Mamá, ¿el gato corre?* (the orchestrator
   moved it there at merge; the lane had put ¿ first). Japanese's command is the request register the builder
   defaults to, 走ってください, and Portuguese's is its subjunctive, *corra*.
5. **Where it renders.** `translate` is where a sentence's opening mark and full stop are put
   together, so the address goes there: opener + address + separator + clause + stop, in the text and
   in the ruby. The address is rendered by each engine as the verbless period it already renders as
   a bare noun phrase. The separator is `LanguageEngine.addressSeparator`: ', ' by default, 、 for
   Japanese. Only the top clause's address is read. A linked clause's is ignored.
6. **Determiner-less, capitalized.** Each conjunct resolves as the definite phrase a name is (so
   MOM and DAD are names, "Mom and Dad") and is then marked bare, whatever the plan picked. A name
   is marked bare too (`takes_article: '0'`), so Portuguese says *Pedro, corra*, not *o Pedro*. A
   title stays. The first letter of the address is capitalized; the clause after it keeps its case.
7. **D3 is one branch at the top of `applyPossessorForm`**, reached through a new `address`
   parameter that `resolveNounPhrase` passes down. It takes `honorific` / `plural_honorific` under
   any possessor or none, **for an elder only**. The Japanese lexeme says which relatives are
   elders with `address_honorific: '1'`: the parents (MOTHER, FATHER, PARENT, MOM, DAD, the
   step-parents), the grandparents, UNCLE, AUNT and the parents-in-law. The siblings say it on their
   elder word, `with_ELDER_address_honorific`, which `fuseAdjectives` carries along with the fused
   word. So one's own older brother is お兄さん, and one's mother お母さん, but a wife (妻、…), a younger
   brother (弟、…), a son (息子、…) and an unmarked sibling fall through to the ordinary own / other
   rule. Someone else's wife is still あなたの奥さん. A head with no honorific falls through too, so French and
   German keep their possessed word (*Ma femme, cours*, *Meine Frau, lauf*), and MOM's single お母さん
   is already right. A 1st-person possessor still marks the relative one's own, so 私の is not said
   twice (お母さん、…).
8. **D4**: the address never sets the command's person. The imperative's `subject` doc comment says
   so. "Mom, let's run" takes the 1st-plural subject the plan names.
9. **A possessed address keeps its possessive article in Italian and Portuguese**: *Il mio fratello
   maggiore, corri*, *A minha mãe, corra*. Neither engine writes a possessed noun without its article
   (a bare possessed head renders the same), and that code is the possessed-head work of P11-E4.
   Follow-up.
10. **`test/kinship.test.ts`'s MOM and DAD rows** (the definite singular citation, "the mom.")
    now read "Mom." / *Maman.* / *Mama.* / *Mamá.* / *Mamãe.*, and "Dad." / *Papa.* / *Papá.* /
    *Papai.* — the name rule applies to a verbless period too. Italian and Japanese are unchanged.

### Follow-ups found

- **Spanish and a leading vocative before a question.** The RAE keeps the vocative outside the
  marks (*Mamá, ¿el gato corre?*). The ruling here puts ¿ first.
- A builder control for `address`, and British *Mum*, *Grandma*, *Grandpa* (below).

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
[P05](../../P05-polish/README.md)/[P07](../../P07-ukrainian/README.md)'s problem and worth naming now).

**Recommendation: `address?: NounElement` on `PhrasePlan`**, rendered before the clause with the
language's separator. Determiner-less by rule in every language — "the Mom, run!" is wrong in all
seven — which is the same article-dropping the essive already does
([`ObjectPredication`](../../../../../packages/shared/src/index.ts#L475)).

### D3. Address overrides P11's own/other rule in Japanese

お母さん for one's own mother contradicts D2 of P11, which gives 母 for one's own and お母さん for
another's. It is not an exception to be patched around: **address is a third context**, beside
citation (母親) and possession (母 / お母さん).

**Recommendation: the address slot sets the honorific form unconditionally in Japanese**, whatever
`forms['own']` says. One branch, and it must be written where P11's rule is written
([`applyPossessorForm.ts`](../../../../../packages/engine/src/translator/functions/applyPossessorForm.ts))
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
- **Titles in address** ("Mr Smith!") — [C38](../../../../localization/done/C38-title-before-a-name.md)
  seeded MR, and address is where a title is actually used.
- **Interjections and greetings**, which share the slot's position and nothing else.
