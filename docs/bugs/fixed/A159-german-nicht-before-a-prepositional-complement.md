# A159. German "nicht" follows a prepositional complement instead of leading it

**Language:** German

German sentence negation puts `nicht` at the end of the Mittelfeld — **after the objects**, but
**before** a constituent that belongs to the predicate. A complement realized as a **prepositional
phrase** is such a constituent: `der Kater geht nicht zum Markt`, never `*geht zum Markt nicht`. The
engine treats every complement like an object and puts `nicht` last, which is marked-contrastive at
best and, with `sein`, simply ungrammatical (`*der Kater ist im Haus nicht`).

| Clause | Now | Want |
|---|---|---|
| CAT not GO, direction the MARKET | `der Kater geht zum Markt nicht.` | `der Kater geht nicht zum Markt.` |
| CAT not COME, source the HOUSE | `der Kater kommt aus dem Haus nicht.` | `der Kater kommt nicht aus dem Haus.` |
| CAT not BE, locative the HOUSE | `der Kater ist im Haus nicht.` | `der Kater ist nicht im Haus.` |
| CAT not RUN, locative the HOUSE | `der Kater läuft im Haus nicht.` | `der Kater läuft nicht im Haus.` |
| command: not GO, direction the MARKET | `geh zum Markt nicht.` | `geh nicht zum Markt.` |
| CAN not GO, direction the MARKET | `der Kater kann zum Markt nicht gehen.` | `der Kater kann nicht zum Markt gehen.` |
| relative: the CAT that does not GO to the MARKET | `der Kater, der zum Markt nicht geht, läuft.` | `der Kater, der nicht zum Markt geht, läuft.` |

Every **Want** above was rendered by the engine, not written by hand — see *Shape of the fix*, which
produces exactly these strings.

**Already right, and must not move.** The rule stays "after" for everything that is *not* a
prepositional phrase:

| Clause | Stays |
|---|---|
| CAT not EAT the MOUSE (object) | `der Kater frisst die Maus nicht.` |
| MAN not GIVE the BOOK, terminus the DOG (animate terminus = **bare dative**, not a PP) | `der Mann gibt dem Hund das Buch nicht.` |
| CAT not BE a LEGEND (predicative — already leads) | `der Kater ist nicht eine Legende.` |

The other six languages are unaffected: English `the cat does not go to the market.`, and the Romance
and Japanese negators are nowhere near this slot.

**Note this supersedes an earlier decision.** [A49](A49-german-nicht-in-commands-and-infinitives.md)
wrote the rule as "otherwise after the objects **and complements**" and centralised it; that phrasing
is what is wrong here, and A49's own doc comment in `nichtSlots.ts` needs the correction. A49's
*commands and infinitives* fix is untouched — this only changes which slot they are told to use.

Found by reviewing the random phrase "they were not biting that sharp house in no adult ice cream"
(seed 484002), whose German put `nicht` after a locative; raised there as a question and confirmed
as a defect.

## Shape of the fix

The slot already exists and already sits in the right place. In
[`renderClause.ts`](../../../packages/engine/src/languages/de/renderClause.ts) all three word orders
splice `neg.beforePredicative` **immediately before** the complements and `neg.after` immediately
after (lines 95, 116, 169) — so `beforePredicative` *is* "before the complements"; it is only named
for the predicative, and its gate is too narrow.

- [`renderClause.ts`](../../../packages/engine/src/languages/de/renderClause.ts) line 69:
  `hasPredicative = !!phrase.complements?.['predicative'] || !!proPlace || (!!objectPrep && !!directObject)`
  must also be true when a complement renders as a **prepositional** phrase.
- [`subordinateClause.ts`](../../../packages/engine/src/languages/de/subordinateClause.ts) line 84
  computes the same flag inline for the relative clause and needs the identical widening — the
  relative-clause row above does **not** come right from the `renderClause` change alone.
- Rename the slot (`beforePredicative` → `beforeComplements`) and correct the rule in
  [`nichtSlots.ts`](../../../packages/engine/src/languages/de/nichtSlots.ts)'s doc comment and
  [`de.types.ts`](../../../packages/engine/src/languages/de/de.types.ts). `nichtSlots` itself needs
  no logic change.

**The predicate the fixer must write.** "Is a PP" is not a property of the complement *type*:
[`de/complementsPhrase`](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts)
gives `direction` → `zu`, `source` → `von`/`aus`, `instrumental` → `mit`, `cause` → `dank`/`wegen`,
`locative` → `in`, but `terminus` is a **bare dative** when its head is animate (`prepDet('', …)`)
and a PP otherwise. So the test is whether the rendered complement carries a non-empty preposition,
which means reading it off `complementsPhrase` rather than off the type name. With **two**
complements where only one is a PP, `nicht` leads the group.

| | |
|---|---|
| **Test** | `negation.test.ts` → *known bugs: German "nicht" and a prepositional complement* (2 `test.fails`, plus a regression test that the object, the bare-dative terminus and the predicative are unchanged) |

## Resolved

**2026-09-20.** The slot was already in the right place; only its gate and its name were wrong.

- **New predicate** —
  [`packages/engine/src/languages/de/hasPrepositionalComplement.ts`](../../../packages/engine/src/languages/de/hasPrepositionalComplement.ts):
  is any complement rendered as a prepositional phrase? Rather than mirror `complementsPhrase`'s
  preposition table, it names the three that are **not** PPs and lets everything else be one: the
  `predicative` (a bare nominative, which the caller asks for separately), an **animate** `terminus`
  (the bare dative recipient), and a `process` `instrumental` (a means clause in the Nachfeld). Those
  last two are exactly what `splitDative` / `splitMeansClause` lift out of the complements slot, so
  the answer is right whether or not the caller has split yet.
- **The two gates** —
  [`renderClause.ts`](../../../packages/engine/src/languages/de/renderClause.ts) and
  [`subordinateClause.ts`](../../../packages/engine/src/languages/de/subordinateClause.ts) both widen
  their flag with it. The relative clause is the second site, as the bug said, and does not come
  right from `renderClause` alone.
- **Renamed** `beforePredicative` → `beforeComplements` (and `nichtSlots`' `predicative` option →
  `complements`) in [`de.types.ts`](../../../packages/engine/src/languages/de/de.types.ts),
  [`nichtSlots.ts`](../../../packages/engine/src/languages/de/nichtSlots.ts),
  `renderClause.ts` and `subordinateClause.ts`. `nichtSlots` needed no logic change. A49's rule is
  corrected in both doc comments: "after the objects", not "after the objects **and complements**".

**Three assertions elsewhere pinned the old placement and were re-pinned to the corrected one** —
this is the supersession the bug announced, not a weakening:

- `imperative.test.ts` → A49's own regression row, `iss im Markt nicht.` → `iss nicht im Markt.`;
- `complements/determiner.test.ts` → A158's regression row, `der Kater läuft im Haus nicht.` →
  `der Kater läuft nicht im Haus.`;
- `complements/source.test.ts` → A154's modal row, `… können von jenem … Engel nicht gehen.` →
  `… können nicht von jenem … Engel gehen.`

- **Tests:** [`packages/engine/test/negation.test.ts`](../../../packages/engine/test/negation.test.ts)
  → *known bugs: German "nicht" and a prepositional complement*. Both pinning `test.fails` are now
  passing `test`s, with their assertions unchanged. New cases:
  - every complement that carries a preposition — instrumental, cause, manner, route, and an
    inanimate terminus;
  - the slot's two sides: an accusative object and a bare-dative recipient stay in front of "nicht",
    the PP behind, and with two complements of which only one is a PP "nicht" leads the group;
  - the two shapes that must *not* pull "nicht" forward — a means clause in the Nachfeld, and a
    Mittelfeld adverb, which still outranks the complement slot;
  - the remaining two clause orders `finiteNegation` serves: the instruction and the "wenn" protasis.

  Colocated unit test:
  [`hasPrepositionalComplement.test.ts`](../../../packages/engine/src/languages/de/hasPrepositionalComplement.test.ts)
  (new) — the prepositional types, the predicative, the terminus split on animacy, the process vs
  concept instrumental, and one PP among several complements.
