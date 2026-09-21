# A176. A Japanese locative "through" renders as a plain place

**Language:** Japanese

A locative with the `through` specifier names a place the action passes through: "the cat runs
through the house". Japanese says so with `を通って`: `猫は家を通って走ります`. The engine gives `で`,
the particle of a plain place, so the sentence says "the cat runs in the house" and renders exactly
like the `in` specifier. With a transitive verb, "buys us through the books" becomes `本で私たちを買います`,
"buys us at the books".

[`complementSegs.ts`](../../../packages/engine/src/languages/ja/complementSegs.ts) looks the
relation up in `REL_NOUN`, where `through` adds no noun. The design leaves the particle to carry
it. That works for a `route`, whose `を` marks the traversed path (`市場を`), but a locative's particle
is `で`, which says only where. `PATH_CITATION` in [`ja.consts.ts`](../../../packages/engine/src/languages/ja/ja.consts.ts)
already cites the relation as `を通って`.

| Case | Now | Want |
|---|---|---|
| run through the house | `猫は家で走ります。` | `猫は家を通って走ります。` |
| eat the mouse through the house | `猫は家でネズミを食べます。` | `猫は家を通ってネズミを食べます。` |
| buy us through the books | `ネズミは本で私たちを買います。` | `ネズミは本を通って私たちを買います。` |
| through no house | `猫はどの家でも走りません。` | `猫はどの家を通っても走りません。` |
| through the cat and the dog | `ネズミは猫と犬で走ります。` | `ネズミは猫と犬を通って走ります。` |
| the random phrase | `ネズミは少しの空腹な全体の本で私たちを買います。または、…` | `ネズミは少しの空腹な全体の本を通って私たちを買います。または、…` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** The route `through` (`猫は家を走ります。`). The locative `in`, `under` and the plain
locative (`家で`, `家の下で`). The existential locative (`猫は家にいます。`). The other six languages
(`through the house`, `attraverso la casa`, `à travers la maison`, `durch das Haus`, `por la casa`,
`pela casa`).

Found by the random phrase "the mouse buys us through few hungry whole books, or all equally strong
buttons will be modifying the wolf thanks to this sharp least hungry angel." (seed 942888).

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine suite green.

In `complementSegs`, give a non-existential `locative` whose path specifier is `through` the tail
`を通って` (`PATH_CITATION.through`) in place of `PARTICLE.locative`. `jaParticleSegs` then closes a
`no` group after it as it does after any particle (`どの家を通っても`).

**Decision for the fixer: the route.** A route `through` keeps its bare `を` (`家を走ります`), which is
right for a motion verb. A route on a transitive verb would put two `を` in one clause
(`家をネズミを食べます`). Only intransitive verbs license a route today, so that cannot be built. If
one ever does, it wants `を通って` too. Not pinned.

| | |
|---|---|
| **Test** | `complements/locative.test.ts` → *known bugs: Japanese locative "through"* (1 `test.fails`, plus a regression test for the relations and languages already right) |

## Resolved

2026-09-21. Took the shape above.
[`complementSegs.ts`](../../../packages/engine/src/languages/ja/complementSegs.ts) now gives a
non-existential `locative` whose path specifier is `through` the tail `PATH_CITATION.through`
(`を通って`) in place of `PARTICLE.locative`, reusing the citation from
[`ja.consts.ts`](../../../packages/engine/src/languages/ja/ja.consts.ts) rather than a new literal.
`jaParticleSegs` closes a `no` group after it, as after any particle (`どの家を通っても`). The
existential keeps its `に` (`猫は家にいます`), and every other relation keeps `で`.

**The route.** A route `through` keeps its bare `を` (`家を走ります`), which already marks the
traversed path. A route on a transitive verb would put two `を` in one clause
(`家をネズミを食べます`), but only intransitive verbs license a route today, so it cannot be built.
If one ever does, it wants `を通って` too. Not pinned.

- **Tests:** [`packages/engine/test/complements/locative.test.ts`](../../../packages/engine/test/complements/locative.test.ts)
  → *known bugs: Japanese locative "through"*. The pinning `test.fails` is now a passing `test`,
  with its assertions unchanged (a motion verb, a transitive verb, a `no` place, a coordinated
  place, and the random phrase). New cases:
  - the tail in every form of the clause: past negative, a modal, the progressive, a command, a
    condition, and a relative clause;
  - the tail after the whole place, before the object: an `or` group, a plural place, `HIDE` and
    `EAT` with an object, and a `no` place under a transitive verb (`どの家を通ってもネズミを食べません`);
  - regression guards: the route with `through`, bare and under `no` (`どの家も走りません`), the plain
    locative, `in` and `under`, the existential, affirmative and negated, and a transitive
    `through` in the other six languages.
- **Unit test:** [`ja/complementSegs.test.ts`](../../../packages/engine/src/languages/ja/complementSegs.test.ts)
  checks a `through` locative alone, in a group, under `no`, and in an existential clause (`家に`).
