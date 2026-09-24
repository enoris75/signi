# A278. A Japanese な-adjective keeps its な before the indirect question's か

**Languages:** Japanese

A Japanese indirect question
([P09-E17](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E17-indirect-question.md))
closes on か (wh) or かどうか (yes/no). The particle follows the predicate's terminal form. It never
follows the attributive form a head noun takes. A な-adjective writes な only before a noun (幸せな猫).
Before か it takes the copula (幸せであるか) or nothing (幸せか). The engine builds the clause with the
prenominal form a relative clause takes, so the な stays.

| Case | Now | Want |
|---|---|---|
| the MAN ASKs whether the CAT is HAPPY | `男は猫が幸せなかどうか尋ねます。` | `男は猫が幸せであるかどうか尋ねます。` |
| the MAN ASKs who is HAPPY (`questionRole: 'subject'`) | `男は誰が幸せなか尋ねます。` | `男は誰が幸せであるか尋ねます。` |
| the MAN ASKs where the CAT is HAPPY (`questionRole: 'locative'`) | `男は猫がどこで幸せなか尋ねます。` | `男は猫がどこで幸せであるか尋ねます。` |

KNOW takes the same clause (`男は猫が幸せなかどうか知っています。`). Its row is not pinned separately.

**Why this target.** 幸せかどうか, with no copula, is the everyday form and is also correct. The engine
already writes a noun predicate as 動物であるかどうか and the quoted clause as 幸せであると, both in the
written plain style, so 幸せであるかどうか matches them. A bare 幸せか target would mean changing the noun
row too (動物かどうか). That is a register decision this bug does not need to make. The past and the
negative stay as they are (幸せだったかどうか, 幸せではないかどうか). They are the natural forms, which rules
out the quotative's citation row (幸せであったかどうか).

**Already right.** An い-adjective (`猫が大きいかどうか`), a noun (`猫が動物であるかどうか`), the past
(`幸せだったかどうか`), the negative (`幸せではないかどうか`), the quoted clause (`猫が幸せであると言います`) and
KNOW's nominalized clause (`猫が幸せなことを知っています`, where こと is a noun and takes な). The other six
languages are right (`der Mann fragt, ob der Kater glücklich ist.`).

## Shape of the fix

[`buildClauseSegments.ts`](../../../packages/engine/src/languages/ja/buildClauseSegments.ts) builds the
object clause with `link === 'と' ? 'quote' : true`. `true` is the prenominal form, correct before
ことを but not before か / かどうか. Passing `'quote'` for か is not enough, because the quotative's
`citation` copula row also turns the past into 幸せであったかどうか. The clause needs a third value for
か. It should select a copula form that is `prenominal` in every cell except the present affirmative
of a な- or の-adjective, which takes `${predicative}である` instead of the attributive particle. In
[`copulaSegs.ts`](../../../packages/engine/src/languages/ja/copulaSegs.ts) the attributive is already
gated on `form === 'prenominal'`. A new form whose rows copy `prenominal` gets exactly that.
[`predicateSegs.ts`](../../../packages/engine/src/languages/ja/predicateSegs.ts) picks that form where
it now picks `prenominal` for a truthy `plain`.

I verified this by applying it to a throwaway copy: a `'question'` value for か / かどうか, mapped to a
`closing` copula form that copies `prenominal`'s rows. It renders all three Want strings. Every
already-right row is unchanged, and the whole engine suite stays green.

**Not settled here:** whether the register should move to the bare form (幸せかどうか, 動物かどうか) for both
the adjective and the noun.

Introduced by P09-E17, which added the か link and kept `true` for it.

Pinned by `known bugs: a Japanese な-adjective keeps its な before the indirect question's か (A278)` in
[content-clause.test.ts](../../../packages/engine/test/content-clause.test.ts): three `test.fails` and a
regression test.

Found by the P09-E17 coverage audit on 2026-09-24.

## Resolved

2026-09-24. The indirect question's clause is built with a plain value of its own, `'question'`
(`JaPlain`, exported by [`predicateSegs.ts`](../../../packages/engine/src/languages/ja/predicateSegs.ts)),
which [`buildClauseSegments.ts`](../../../packages/engine/src/languages/ja/buildClauseSegments.ts) passes
before か / かどうか. `predicateSegs` maps it to a new copula form, `closing`, in
[`copulaSegs.ts`](../../../packages/engine/src/languages/ja/copulaSegs.ts): it borrows `prenominal`'s rows,
so only a na- or の-adjective's present affirmative changes (its attributive な / の gives way to
である). 幸せだったかどうか, 幸せではないかどうか, 動物であるかどうか, the quoted 幸せであると, KNOW's
幸せなことを and a relative clause's 幸せな猫 are unchanged. The register question (幸せかどうか,
動物かどうか) stays open.

Guarded by the three formerly-`test.fails` in `known bugs: a Japanese な-adjective keeps its な before
the indirect question's か (A278)` in [content-clause.test.ts](../../../packages/engine/test/content-clause.test.ts),
now plain tests, plus a new one there (KNOW's yes/no and wh-question, a coordinated
大きくて幸せであるかどうか, and the relative's 幸せな猫), and the `closing` case in
[copulaSegs.test.ts](../../../packages/engine/src/languages/ja/copulaSegs.test.ts).
