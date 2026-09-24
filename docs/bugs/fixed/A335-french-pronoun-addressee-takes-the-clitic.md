# A335. A French pronoun addressee takes the clitic

**Languages:** French

A French subject pronoun (*je, tu, il*) is a clitic: it only exists leaning on a verb. A pronoun that
stands on its own, as a vocative does, takes the tonic (disjunctive) form, the one French also uses
after a preposition: *Toi, cours !*, never *Tu, cours*. The address (`PhrasePlan.address`, P11-E3)
renders a pronoun with its subject surface.

| Case | Now | Want |
|---|---|---|
| `{ ...clause(np('SECOND_PERSON'), 'RUN'), imperative: true, address: np('SECOND_PERSON') }` | `Tu, cours.` | `Toi, cours.` |

**Why this target.** *Toi* is the pronoun's `disjunctive` form, the one the engine already writes
behind a preposition (*avec toi*). The Want string was rendered by applying a trial fix to a throwaway
copy of the packages: in `resolveAddress`, a French pronoun conjunct takes its `disjunctive` form as
its surface. It differs from Now only by the pronoun.

**Already right.** The plural, *Vous, courez.*, since *vous* is its own tonic form. The other six
languages: en "You, run.", it "Tu, corri.", de "Du, lauf.", es "Tú, corre.", ja "あなた、走ってください。",
pt "Você, corra." (Italian, German, Spanish and Portuguese use the nominative in address.)

**Shape of the fix.** `resolveAddress.ts` leaves a pronoun conjunct untouched (the `forms['person']`
arm, which no test covered before this one). For French, that conjunct should take the tonic form, as
`tonicPronoun` (`functions/tonicPronoun.ts`) does for the `TONIC_COMPLEMENTS` in
`fr/complementsPhrase.ts`. The fixer must decide:

- where the rule lives: a language check in `resolveAddress`, or a French hook the address rendering
  calls. It must stay French-only, because the German `disjunctive` form is the dative (*dir*), which
  would be wrong in address.
- whether it matters once A338 lands: a 1st- or 3rd-person pronoun address (*Je, …*, *Il, …*) is
  refused there, or it would want *Moi*, *Lui* too (the same trial fix renders them).

Pinned by `known bugs: a French pronoun addressee takes the clitic (A335)` in
[address.test.ts](../../../packages/engine/test/address.test.ts).

Found on 2026-09-24 in the P11-E3 coverage audit, by rendering the uncovered pronoun arm of
`resolveAddress`.

## Resolved

2026-09-24. [`resolveAddress.ts`](../../../packages/engine/src/translator/functions/resolveAddress.ts)
gives a pronoun conjunct its `disjunctive` form as its surface in the languages of a new
`TONIC_ADDRESS` set, which holds French only: German's `disjunctive` is the dative (*dir*), and
Italian, Spanish and Portuguese call the hearer with the nominative. A coordinated French address
already took the tonic form through `fr/subjectText.ts`. The 1st- and 3rd-person pronoun address is
refused by A338, so *Moi, …* / *Lui, …* never arise.

The `test.fails` in [address.test.ts](../../../packages/engine/test/address.test.ts) (*known bugs: a
French pronoun addressee takes the clitic (A335)*) is a plain test now, assertion unchanged. Added in
the same block: *toi* behind an interjection (*Hé, toi, cours.*), before a negative command (*Toi, ne
cours pas.*) and before a statement (*Toi, le chat court.*), all seven languages.
`resolveAddress.test.ts` gained a case: French *toi*, German *du* (not *dir*), Italian *tu*.
