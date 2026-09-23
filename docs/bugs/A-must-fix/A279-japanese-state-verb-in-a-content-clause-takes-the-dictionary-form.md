# A279. A Japanese state verb in a content clause takes its dictionary form

**Languages:** Japanese

A Japanese state verb says that a state holds with the resultant 〜ている. Its dictionary form names
the change of state: 猫が本を持つ is "the cat (will) pick up the book", and 猫が本を持っている is "the cat
has the book". [A132](../fixed/A132-japanese-state-verb-main-clause.md) gave the finite main clause the
〜ている (猫は本を持っています). But the check it added in `predicateSegs` is `!plain`. A content clause
([P09-E4](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E4-clauses.md), and the indirect
question of [P09-E17](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E17-indirect-question.md))
is built plain, like the relative clause A132 deliberately left alone. So the clause reports an event.

| Case | Now | Want |
|---|---|---|
| the MAN ASKs whether the WOMAN KNOWs the CAT | `男は女が猫を知るかどうか尋ねます。` | `男は女が猫を知っているかどうか尋ねます。` |
| the MAN ASKs whether the CAT HAS the book | `男は猫が本を持つかどうか尋ねます。` | `男は猫が本を持っているかどうか尋ねます。` |
| the MAN ASKs what the CAT HAS | `男は猫が何を持つか尋ねます。` | `男は猫が何を持っているか尋ねます。` |
| the MAN SAYs that the CAT HAS the book | `男は猫が本を持つと言います。` | `男は猫が本を持っていると言います。` |
| … past | `男は猫が本を持ったと言います。` | `男は猫が本を持っていたと言います。` |
| … negative | `男は猫が本を持たないと言います。` | `男は猫が本を持っていないと言います。` |
| the MAN SAYs that the CAT LOVEs the dog | `男は猫が犬を愛すると言います。` | `男は猫が犬を愛していると言います。` |
| the MAN SAYs that the WOMAN KNOWs the CAT | `男は女が猫を知ると言います。` | `男は女が猫を知っていると言います。` |
| the MAN KNOWs that the CAT HAS the book | `男は猫が本を持つことを知っています。` | `男は猫が本を持っていることを知っています。` |
| the MAN ASKs whether the WOMAN KNOWs what the CAT eats (a nested clause, hand-written) | `男は女が猫が何を食べるか知るかどうか尋ねます。` | `男は女が猫が何を食べるか知っているかどうか尋ねます。` |

**Already right.** An event verb (`猫が本を食べると言います`), KNOW's negative, which is the event's
(`女が猫を知らないと言います`, A132's `event_negative`), the progressive (`猫が本を持っていると言います`)
and the main clause (`猫は本を持っています`). The other six languages are right
(`der Mann fragt, ob der Kater das Buch hat.`).

## Shape of the fix

Do what A132 did, but for a content clause as well.
[`predicateSegs.ts`](../../../packages/engine/src/languages/ja/predicateSegs.ts) computes
`heldState = aspect === 'neutral' && !plain && …` and renders a held state through `aspectVerbSegs`
as the progressive, with a `'polite'` or `'tara'` ending. The content clause needs to reach that path
with the `'plain'` ending (持っている, 持っていた, 持っていない). The relative clause and a modal's
dictionary form must still be excluded. So `plain` has to tell a content clause apart from a relative
clause. Today [`buildClauseSegments.ts`](../../../packages/engine/src/languages/ja/buildClauseSegments.ts)
passes `'quote'` before と and `true` otherwise, which is the same `true` a relative clause gets. A
distinct value for the ことを link and for か / かどうか (A278 needs one for か anyway) lets `heldState`
admit `'quote'` and the content values and keep refusing `true`. The `event_negative` and `state_verb`
exceptions carry over unchanged.

I verified this by applying it to a throwaway copy: `'content'` for ことを and `'question'` for か /
かどうか, `heldState` admitting `'quote'`, `'question'` and `'content'`, and the ending set to `'plain'`
when `plain` is set. It renders every Want string above. The already-right rows are unchanged, and
the whole engine suite stays green.

**Not settled here** (not pinned):

- **Adverbial clauses.** `猫が本を持つ時に` and `猫が本を持つので` would read better with 〜ている
  (`持っている時に`, `持っているので`). `buildClauseSegments` builds the adverbial clause with the same
  `plain: true` a relative clause gets. Whether 時に and 前に want the state is the fixer's call, and
  A264's aspect handling under 前に / 後で has to stay as it is.
- **The subject clause.** `猫が本を持つことが正しいです` has the same problem (`持っていることが`). It is
  built by the `contentSubject` branch of `buildClauseSegments` with `plain: true`, so the ことを value
  above would naturally extend to its ことが.
- **Relative clauses** stay as A132 left them (`本を持つ猫`, the generic gloss form).

Inherited from P09-E4, when content clauses were added. A132 fixed only the main clause.

Pinned by `known bugs: a Japanese state verb in a content clause takes its dictionary form (A279)` in
[content-clause.test.ts](../../../packages/engine/test/content-clause.test.ts): five `test.fails` and a
regression test.

Found by the P09-E17 coverage audit on 2026-09-24.
