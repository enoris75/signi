# A347. A Japanese state verb in an adverbial clause takes the dictionary form

**Languages:** Japanese

A132 gave a state verb (HAVE, KNOW) its 〜ている in the main clause (猫は本を持っています), and
[A279](../fixed/A279-japanese-state-verb-in-a-content-clause-takes-the-dictionary-form.md) in a content
clause (持っていると言います). A279's file listed the adverbial clause as "not settled": 犬が本を持つので and
持つ時に report an event, the dog taking hold of the book, where the plan says it has it. Its fix left
the adverbial clause as it was. Under ので, 時に and のに the state is 〜ている.

| Case | Now | Want |
|---|---|---|
| the CAT RUNs because the DOG HAS the BOOK | 猫は犬が本を持つので走ります。 | 猫は犬が本を持っているので走ります。 |
| … when the DOG HAS the BOOK | 猫は犬が本を持つ時に走ります。 | 猫は犬が本を持っている時に走ります。 |
| … though the DOG HAS the BOOK | 猫は犬が本を持つのに走ります。 | 猫は犬が本を持っているのに走ります。 |
| … because the DOG HAD the BOOK | 猫は犬が本を持ったので走ります。 | 猫は犬が本を持っていたので走ります。 |
| … because the DOG does not HAVE the BOOK | 猫は犬が本を持たないので走ります。 | 猫は犬が本を持っていないので走ります。 |
| … because the DOG KNOWs the MAN | 猫は犬が男を知るので走ります。 | 猫は犬が男を知っているので走ります。 |

**Already right, and kept.** 間に already has the state (持っている間に). 前に, 後で and まで name the event,
and keep the dictionary form (持つ前に, 持った後で, 持つまで), as A264's aspect handling under 前に / 後で
wants. The other six.

## Shape of the fix

[ja/buildClauseSegments.ts](../../../packages/engine/src/languages/ja/buildClauseSegments.ts) builds
the adverbial clause with `plain: true`, the relative clause's value, which
[ja/predicateSegs.ts](../../../packages/engine/src/languages/ja/predicateSegs.ts)'s `heldState` keeps in
the dictionary form. A279 added `'quote'`, `'question'` and `'content'` for the content clause; the
adverbial clause under ので, 時に and のに wants the same held-state ending (持っている, 持っていた,
持っていない), and 前に / 後で / まで keep `true`.

**Decisions for the fixer:**

- **から (since).** 持ってから already writes a te-form; it is right and not touched.
- **The negative of KNOW** is 知らない, not 知っていない (`event_negative`, as A279 kept). Not pinned here.

| | |
|---|---|
| **Test** | `adverbial-clause.test.ts` → *known bugs: a Japanese state verb in an adverbial clause takes the dictionary form (A347)* (3 `test.fails`: ので / 時に / のに, the past and the negative, KNOW; plus a regression test for 間に, 前に, 後で and まで) |

Found by the lanes and the cross-lane probe while fixing A278–A338, 2026-09-24.
