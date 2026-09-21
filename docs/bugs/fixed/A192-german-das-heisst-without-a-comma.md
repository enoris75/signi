# A192. German "das heißt" joins a clause without a comma after it

**Language:** German

"Das heißt" before a whole clause is set off by a comma on both sides: `…, das heißt, wir müssen ein
Taxi benutzen`. With only a phrase after it, there is no comma after it (`am Montag, d. h. am
Feiertag`). The engine's `that_is` always joins two clauses, so German always needs the second comma.
English, Spanish and Portuguese already mark their connector as parenthetical and get it (`the cat
runs, that is, the dog jumps.`, `es decir,`, `isto é,`).
[A69](A69-english-spanish-connector-comma.md) gave them that comma and left German `das
heißt` as it was.

[`germanEngine`](../../../packages/engine/src/languages/de/germanEngine.ts) joins every coordination as
`${sentence}, ${COORD_WORDS[conjunction]} ${clause}`, with no comma after the connector. German has no
`PARENTHETICAL_CONNECTORS` set like [`en.consts.ts`](../../../packages/engine/src/languages/en/en.consts.ts)'s.

| Case | Now | Want |
|---|---|---|
| CAT RUN, that is, DOG JUMP | `der Kater läuft, das heißt der Hund springt.` | `der Kater läuft, das heißt, der Hund springt.` |
| with objects | `der Kater frisst die Maus, das heißt der Hund sieht das Buch.` | `der Kater frisst die Maus, das heißt, der Hund sieht das Buch.` |
| question | `läuft der Kater, das heißt springt der Hund?` | `läuft der Kater, das heißt, springt der Hund?` |
| after a `wenn` clause | `wenn der Mann gehen würde, würde der Kater laufen, das heißt der Hund springt.` | `wenn der Mann gehen würde, würde der Kater laufen, das heißt, der Hund springt.` |
| the random phrase | `…, nach oben wegen all des Essens, das heißt einige Wände weniger Kater kommen wegen aller großen Tode.` | `…, nach oben wegen all des Essens, das heißt, einige Wände weniger Kater kommen wegen aller großen Tode.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** The comma before "das heißt". "Das heißt" leaving the second clause in V2 order
(`das heißt, der Hund springt`, not `das heißt springt der Hund`). The true coordinators, which take no
comma after them (`, und der Hund springt`, `, oder`, `, aber`). "Also" and "und dann", which invert
instead (`der Kater läuft, also springt der Hund.`). English, Spanish and Portuguese.

Found by the random phrase "no careful missing death was drinking their least cold prison that feels
missing Asia up because of all food, that is, few cats' walls come because of all big deaths." (seed
502396). **This overrules passing tests.** The punctuation was pinned as right, raised with the user
as a question, and ruled a defect on 2026-09-21. The rule, as German style guides give it: after "das
heißt" a comma follows when a main or subordinate clause follows, and none when only a phrase does
(for example [journalismusausbildung.de](https://journalismusausbildung.de/kommasetzung-vor-und-nach-der-konjunktion-das-heisst/),
[vogt-text.ch](https://www.vogt-text.ch/vogtblog/101-komma-nach-das-heisst)).

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
rest of the engine suite green.

Give German the English shape: `PARENTHETICAL_CONNECTORS = new Set(['that_is'])` in
[`de.consts.ts`](../../../packages/engine/src/languages/de/de.consts.ts), and a comma after the
connector in `germanEngine`'s coordination join when the set has it. `renderConjunction`, which names
the connector alone for the picker, is unchanged.

**It changes two passing assertions,** which pinned the missing comma:

| Test | Now asserted | Becomes |
|---|---|---|
| `coordination.test.ts` → *coordinated clauses › explicative — "that is"* | `der Kater läuft, das heißt der Hund springt.` | `der Kater läuft, das heißt, der Hund springt.` |
| `de/germanEngine.test.ts` → *und, oder, aber and das heißt leave the second clause in V2 order* | `der Kater isst, das heißt der Mann geht` | `der Kater isst, das heißt, der Mann geht` |

**Decision for the fixer:** Italian `cioè` and French `c'est-à-dire` also join a whole clause with no
comma after them (`il gatto corre, cioè il cane salta.`, `le chat court, c'est-à-dire le chien
saute.`). Italian commonly writes it that way. French usually says `c'est-à-dire que` before a clause.
Neither is part of this bug. Not pinned.

| | |
|---|---|
| **Test** | `coordination.test.ts` → *known bugs: German "das heißt" without a comma after it* (1 `test.fails`, plus a regression test for the coordinators, the inverting adverbs and English, Spanish and Portuguese) |

## Resolved

2026-09-21. Took the shape above. German now has the English shape:
[`de.consts.ts`](../../../packages/engine/src/languages/de/de.consts.ts) exports
`PARENTHETICAL_CONNECTORS = new Set(['that_is'])`, and
[`germanEngine`](../../../packages/engine/src/languages/de/germanEngine.ts)'s coordination join adds a
comma after a connector the set names, exactly as
[`englishEngine`](../../../packages/engine/src/languages/en/englishEngine.ts) does. The engine's
`that_is` always joins two clauses, which is the case German style wants the comma in; a phrase-only
"d. h." has no plan to arise from. `renderConjunction`, which names the connector alone for the
picker, is untouched, so the menu still reads "das heißt".

**Two passing assertions moved with it,** as the bug file said they would:

| Test | Was | Is |
|---|---|---|
| `coordination.test.ts` → *coordinated clauses › explicative — "that is"* | `der Kater läuft, das heißt der Hund springt.` | `der Kater läuft, das heißt, der Hund springt.` |
| `de/germanEngine.test.ts` → *und, oder, aber and das heißt leave the second clause in V2 order* | `der Kater isst, das heißt der Mann geht` | `der Kater isst, das heißt, der Mann geht` |

**Italian and French** keep their bare connector (`cioè`, `c'est-à-dire`), as the bug file decided,
and a regression case in the A192 block now says so.

- **Tests:** [`packages/engine/test/coordination.test.ts`](../../../packages/engine/test/coordination.test.ts)
  → *known bugs: German "das heißt" without a comma after it*. The pinning `test.fails` is now a
  passing `test`, with its assertions unchanged (the plain join, two clauses with objects, a question,
  a `wenn` clause, and the random phrase). New cases:
  - the picker label is the bare connector, German and English;
  - the comma stands whatever the clauses are — a negated second clause, a modal, a past first clause;
  - Italian and French keep their connector bare.

  The regression test for the true coordinators, the inverting adverbs, English, Spanish and
  Portuguese is unchanged.
