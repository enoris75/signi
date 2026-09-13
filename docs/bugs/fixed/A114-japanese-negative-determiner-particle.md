# A114. The Japanese どの…も circumfix swallows the complement's particle

**Language:** Japanese

A `no` determiner is the circumfix どの … も. `npSegs` (`languages/ja/npSegs.ts`) lays `も` right after
the head noun. Every caller then skips its case particle for a negative group (`isNegativeGroup`),
on the stated rule that "も replaces the case particle". That holds only for が, を and は. The other
particles stay, and も follows them: `でも`, `にも`, `からも`, `へも`, `のためにも`.

In `complementSegs` (`languages/ja/complementSegs.ts`) the result is that locative, terminus,
source, direction, cause, instrumental, manner and the predicative `に` all lose their particle. A
relational noun ends up after the も (`どの家もの下`). `copulaSegs` is hit the same way: its noun
predicate glues `ではありません` onto `どの伝説も`.

| Complement | Now | Want |
|---|---|---|
| locative | `猫はどの家も走りません。` | `猫はどの家でも走りません。` |
| locative, under | `猫はどの家もの下走りません。` | `猫はどの家の下でも走りません。` |
| terminus | `男はどの犬も本をあげません。` | `男はどの犬にも本をあげません。` |
| source | `猫はどの市場も行きません。` | `猫はどの市場からも行きません。` |
| direction | `猫はどの市場も行きません。` | `猫はどの市場へも行きません。` |
| cause | `猫はどの犬も泣きません。` | `猫はどの犬のためにも泣きません。` |
| instrumental | `猫はどの単語も食べません。` | `猫はどの単語でも食べません。` |
| manner | `猫はどの速さも走りません。` | `猫はどの速さでも走りません。` |
| predicative (BECOME) | `猫はどの伝説もなりません。` | `猫はどの伝説にもなりません。` |
| predicative (SEEM) | `猫はどの伝説も思えません。` | `猫はどの伝説にも思えません。` |
| predicate noun (BE) | `猫はどの伝説もではありません。` | `猫はどの伝説でもありません。` |

Already right: the subject (`どの猫もネズミを食べません。`), the direct object
(`猫はどのネズミも食べません。`) and the route (`猫はどの市場も行きません。`), where も does replace
が / を. Source and direction currently render the same sentence as the route, so the three
relations can't be told apart.

A passing test pins the wrong locative: `complements/determiner.test.ts:162-164`, *complement
determiner: Japanese renders the demonstratives and quantifiers* → "the `no` circumfix replaces で
with も and negates the verb — どの家も走りません". The comment above it (line 146) repeats the rule.

## Shape of the fix

Stop emitting も inside `npSegs` and let the owner of the particle close the circumfix:

- `が` / `を` / `は` → `も` alone;
- any other particle → particle + `も`, after the relational noun (`の下で` + `も`);
- `copulaSegs` → `でもありません`.

`npSegs` keeps only the prenominal `どの`. Every site that now skips its particle for a negative group
must emit the `も` itself. That covers the subject in `buildClauseSegments`, the object in
`predicateSegs`, the relative-clause subject in `npSegs`, and `mannerGlossSegs`. `npSegs.test.ts:57-58`,
which expects `も` from `npSegs`, changes with the fix.

A `no` possessor has the same misplacement (`どの猫もの本は燃えます。`) and also gets no negative
concord on the verb. That is a separate case, not pinned here.

| | |
|---|---|
| **Test** | `complements/determiner.test.ts` → *known bugs: Japanese どの…も on a complement* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed.
[`npSegs.ts`](../../../packages/engine/src/languages/ja/npSegs.ts) no longer lays down も; it keeps only
the prenominal `どの`. The new [`jaParticleSegs.ts`](../../../packages/engine/src/languages/ja/jaParticleSegs.ts)
closes the circumfix wherever the group's case particle goes: `も` alone in place of `が` / `を` / `は`,
and particle + `も` for anything else. Every site that used to skip its particle for a negative group
now calls it:

- the subject in `buildClauseSegments`;
- the three object positions in `predicateSegs`;
- the relative-clause subject in `npSegs`;
- in `complementSegs`, the predicative `に`, the instrumental action's `を` and every other complement
  (after the relational noun: `の下でも`).

Two more sites close it themselves. `mannerGlossSegs` adds `も` before its `ない` (`どの時間もない`, unchanged).
[`copulaSegs.ts`](../../../packages/engine/src/languages/ja/copulaSegs.ts) gives a `no` noun predicate
`でも…` in place of `では…` (`どの伝説でもありません`).

Every row now renders as wanted. Also covered:
- the direction (`どの市場へも`), the instrumental and manner `でも`, and SEEM's `にも`;
- A109's existential (`どの家にもいません`);
- the prenominal copula (`どの伝説でもない猫`).

The subject, the object and the route still take `も` alone. A `no` possessor keeps its old `どの猫もの本`,
since the bug file calls it a separate, unpinned case.

The passing test that pinned the wrong locative in `complements/determiner.test.ts` (*the `no`
circumfix replaces で with も*) now asserts `猫はどの家でも走りません。`, and its comment is updated.
`npSegs.test.ts` no longer expects `も` from `npSegs`.

- **Tests:** [`packages/engine/test/complements/determiner.test.ts`](../../../packages/engine/test/complements/determiner.test.ts)
  → *known bugs: Japanese どの…も on a complement*. The pinning `test.fails` is now a passing `test`.
  New cases cover the direction, instrumental, manner, SEEM, the existential and the relative copula,
  with a guard for が / を / the route.
- Unit tests: the new `jaParticleSegs.test.ts`, plus `npSegs.test.ts`, `complementSegs.test.ts` and
  `copulaSegs.test.ts`.
