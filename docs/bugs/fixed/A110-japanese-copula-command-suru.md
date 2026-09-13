# A110. A Japanese copula command is built on する ("make it X"), not なる ("be/become X")

**Language:** Japanese

For an imperative BE + predicative, `predicateSegs` (`languages/ja/predicateSegs.ts`) renders the
predicative the `になる` way and appends `してください` / `しないでください`. Its comment: "The copula
command routes through する … (する's nai-form is fixed, so the copula negative *can* stay polite)".

`X に/く する` is causative in Japanese: "make (something) X". So "be big!" reads "make it big" and "be
happy!" reads "make [me] happy". The idiomatic `慎重にしてください` ("be careful") is the exception,
because `慎重にする` is lexicalised; `静かにする` is another. The reason the comment gives does not
favour する: `なる`'s nai-form is just as fixed (`ならないでください`).

The branch also ignores the addressee, so "let's be big" comes out as a 2nd-person request.

| Command | Now | Want |
|---|---|---|
| be a legend | `伝説にしてください。` | `伝説になってください。` (or `伝説でいてください。`) |
| be happy | `幸せにしてください。` | `幸せになってください。` (or `幸せでいてください。`) |
| be big | `大きくしてください。` | `大きくなってください。` |
| don't be a legend | `伝説にしないでください。` | `伝説にならないでください。` (or `伝説でいないでください。`) |
| let's be big (1pl) | `大きくしてください。` | `大きくなりましょう。` |

Already right, and still right with なる: `慎重にしてください。` ("be careful"); `慎重になってください。` is
equally correct. The BECOME command already renders `大きくなってください。`.

A unit test pins the する route: `languages/ja/predicateSegs.test.ts:159-162`, "a copula command
routes through する" (`慎重にしてください` / `慎重にしないでください`). Its na-adjective outputs are
acceptable, but its name and premise change with the fix.

## Shape of the fix

Build the copula command on `なる`:

- the predicative as now (`伝説に` / `大きく` / `幸せに`);
- then なる's imperative: `なってください`, 1pl `なりましょう`, 1pl negative `なるのはやめましょう`;
- the 2nd-person negative stays polite, as the する route does today: `ならないでください`, since なる's
  nai-form is fixed. Do not fall back to `jaImperativeSegs`' plain prohibitive `なるな`.

Honour `imperativePN` instead of hard-coding the request. A noun or na-adjective predicate could
instead take `でいてください` ("stay X"). Pick one; the test accepts either for those.

| | |
|---|---|
| **Test** | `imperative.test.ts` → *known bugs: Japanese copula command* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed, choosing なる. The copula command branch of
[`predicateSegs.ts`](../../../packages/engine/src/languages/ja/predicateSegs.ts) keeps the
predicative as before (`伝説に`, `大きく`, `幸せに`) and follows it with なる's command:

- **2nd person, singular or plural:** `なってください`, or `ならないでください` in the negative. The
  negative stays polite, not `jaImperativeSegs`' plain `なるな`.
- **1st plural:** `なりましょう`, or `なるのはやめましょう` in the negative.

The branch now honours `imperativePN` instead of hard-coding the request.

Every row now renders as wanted: `伝説になってください`, `幸せになってください`, `大きくなってください`,
`伝説にならないでください`, `大きくなりましょう`. Also covered: `慎重になってください`, the plural
addressee and the 1pl negative.

Unchanged: the BECOME command (`大きくなってください`) and the declarative copula (`猫は大きいです`). The
unit test that pinned the する route, *a copula command routes through する*, is renamed *a copula
command is built on なる* and asserts the なる forms for every addressee.

- **Tests:** [`packages/engine/test/imperative.test.ts`](../../../packages/engine/test/imperative.test.ts)
  → *known bugs: Japanese copula command*. The pinning `test.fails` is now a passing `test`. New cases
  cover the na-adjective, the plural and the 1pl negative, with a guard for BECOME and the declarative
  copula.
- Unit test: `predicateSegs.test.ts` (ja).
