# A220. A Japanese direction noun as a locative takes で, where it wants に

**Language:** Japanese

A Japanese locative is marked by で, the place an act goes on in (家で走ります), unless the verb asks
for に: the existential (家にいます, A109) and the verbs that seed `locative_particle`, 住む and 閉じ込める
(家に住みます, A190). The choice is the verb's in every case, in
[`predicateSegs`](../../../packages/engine/src/languages/ja/predicateSegs.ts) and
[`complementSegs`](../../../packages/engine/src/languages/ja/complementSegs.ts).

A direction is not a place an act goes on in. One runs 反対の方向に, "in the opposite direction";
反対の方向で reads as running while standing in a direction. That is the noun's doing, not the verb's —
every verb of motion takes it — so no per-verb `locative_particle` can say it. DIRECTION_SPACE (方向)
is the noun C25 added for BACKWARDS's gloss, which ships 反対の方向で.

| Case | Now | Want |
|---|---|---|
| the CAT RUNs in the opposite DIRECTION | `猫は反対の方向で走ります。` | `猫は反対の方向に走ります。` |
| … past | `猫は反対の方向で走りました。` | `猫は反対の方向に走りました。` |
| … negative | `猫は反対の方向で走りません。` | `猫は反対の方向に走りません。` |
| the CAT GOes in this DIRECTION | `猫はこの方向で行きます。` | `猫はこの方向に行きます。` |
| … in no DIRECTION | `猫はどの方向でも行きません。` | `猫はどの方向にも行きません。` |
| run in the opposite direction! | `反対の方向で走ってください。` | `反対の方向に走ってください。` |
| to run in the opposite direction (citation) | `反対の方向で走る。` | `反対の方向に走る。` |
| BACKWARDS's definition (C25) | `反対の方向で。` | `反対の方向に。` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** The existential already says に (`猫は反対の方向にいます。`). A marked relation keeps
its relational noun and で (`猫は反対の方向の下で走ります。`), a place keeps で (`猫は家で走ります。`),
and a direction complement keeps its へ (`猫は反対の方向へ走ります。`). The other languages mark the
two kinds of place alike and are right (`the cat runs in the opposite direction.`, `il gatto corre
nella direzione opposta.`, `le chat court dans la direction opposée.`, `el gato corre en la dirección
opuesta.`, `o gato corre na direção oposta.`).

**Shipped strings.** One: BACKWARDS's definition, pinned in `place-adverbs.test.ts`.

Found authoring C25 (BACKWARDS's gloss).

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine and backend suites green apart from the one passing test that pins BACKWARDS's Japanese
(`place-adverbs.test.ts` → *BACKWARDS*), which takes the **Want**.

Let the noun say it, with the key a verb already uses. The trial seeded `locative_particle: 'に'` on
DIRECTION_SPACE's ja forms in [`nouns.ts`](../../../packages/backend/src/concepts/nouns.ts), and
added one step to the particle chain in `complementSegs`, after the verb's override and A176's
`through`:

```ts
: type === 'locative' && spec === 'in' && firstConjunct(c.phrase).head.forms['locative_particle']
  ? firstConjunct(c.phrase).head.forms['locative_particle']!
```

The verb's に still comes first, so the existential is unchanged, and a relation (`spec !== 'in'`)
keeps its で. The `no` circumfix closes after the new particle as after any other (どの方向にも).
The complement gloss reaches the same step through `complementGlossSegs`, which passes no verb
override.

**Decision for the fixer: German.** The same row renders `der Kater läuft in der entgegengesetzten
Richtung.` A motion along a direction is usually the accusative, *läuft in die entgegengesetzte
Richtung* (the dative says where something lies). It is left out of this file and of the pins; the
regression test above does not assert the German either.

| | |
|---|---|
| **Test** | `complements/locative.test.ts` → *known bugs: a Japanese direction noun as a locative takes で (A220)* (1 `test.fails`, plus a regression test for the existential, a relation, a place, a goal and the other languages) |

## Resolved

**2026-09-22**, with the trial above as written.

- [`nouns.ts`](../../../packages/backend/src/concepts/nouns.ts) — DIRECTION_SPACE's ja forms seed
  `locative_particle: 'に'`, the key 住む and 閉じ込める already use. **Needs a reseed** of `signi.db`.
- [`ja/complementSegs.ts`](../../../packages/engine/src/languages/ja/complementSegs.ts) — one step in
  the particle chain, after the verb's override and A176's `through`: a plain-containment locative
  (`spec === 'in'`) whose first conjunct's head seeds `locative_particle` takes it. The verb's に still
  wins, a relation keeps its relational noun and で, and the `no` circumfix closes after it
  (どの方向にも). The complement gloss reaches it through
  [`complementGlossSegs`](../../../packages/engine/src/languages/ja/complementGlossSegs.ts), whose
  comment now says so.

BACKWARDS's shipped definition moved from `反対の方向で。` to the **Want** `反対の方向に。`
(`place-adverbs.test.ts` → *BACKWARDS*). No e2e spec pins it. German's `in der entgegengesetzten
Richtung` was not touched and is not asserted, as ruled.

| | |
|---|---|
| **Tests** | `complements/locative.test.ts` → *known bugs: a Japanese direction noun as a locative takes で (A220)*, the `test.fails` now passing, plus two added cases: the に across JUMP, COME, a plural subject's GO, an explicit `in`, the `all` determiner, a question and an "or" group of directions; and what keeps its own particle — 住む's に, `through`'s を通って, the route's を, and the glosses of a relation (の下で) and a goal (へ). Colocated: `ja/complementSegs.test.ts` → *a noun seeding locative_particle takes it in plain containment*. `place-adverbs.test.ts` → *BACKWARDS* now pins `反対の方向に。` |
