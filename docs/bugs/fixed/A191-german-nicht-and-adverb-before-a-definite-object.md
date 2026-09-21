# A191. German puts "nicht" and an adverb in front of a definite object

**Language:** German

A definite object stands ahead of the negation in the German middle field. It is known already, and
the negation says something about it: `der Kater frisst die Maus nicht`. The engine does this when the
verb has no adverb. When it has one, the object is left behind "nicht" and the adverb: `der Kater
frisst nicht schnell die Maus`, `konnten nicht plötzlich die leeren Dateien ersetzen`. With "nicht"
ahead of it, the definite object reads as the focus of a contrast ("not the mouse, but …"), not as
the thing the negated act is done to. The unmarked order keeps the object where it stands without the
adverb, and "nicht" leads the adverb after it: `frisst die Maus nicht schnell`.

[`adverbSlots`](../../../packages/engine/src/languages/de/adverbSlots.ts) keeps a manner or frequency
adverb "ahead of the objects" (its own example is `verschiebt nicht schnell das Buch`), and
[`nichtSlots`](../../../packages/engine/src/languages/de/nichtSlots.ts) puts "nicht" in front of the
adverb. [`renderClause`](../../../packages/engine/src/languages/de/renderClause.ts) splices both ahead
of the dative and the direct object in the declarative, the question, the `wenn` clause, the command,
the instruction and the infinitive. The relative clause is already right, because
[`subordinateClause`](../../../packages/engine/src/languages/de/subordinateClause.ts) puts its
adverbs after the objects: `der Hund, der die Maus nicht schnell frisst, läuft.`

| Case | Now | Want |
|---|---|---|
| CAT not EAT the MOUSE, FAST | `der Kater frisst nicht schnell die Maus.` | `der Kater frisst die Maus nicht schnell.` |
| … ALWAYS | `der Kater frisst nicht immer die Maus.` | `der Kater frisst die Maus nicht immer.` |
| … past, CAN, SUDDENLY | `der Kater konnte nicht plötzlich die Maus fressen.` | `der Kater konnte die Maus nicht plötzlich fressen.` |
| … resultative | `der Kater hat nicht schnell die Maus gefressen.` | `der Kater hat die Maus nicht schnell gefressen.` |
| … future | `der Kater wird nicht schnell die Maus fressen.` | `der Kater wird die Maus nicht schnell fressen.` |
| … progressive | `der Kater frisst gerade nicht schnell die Maus.` | `der Kater frisst gerade die Maus nicht schnell.` |
| … `this` MOUSE | `der Kater frisst nicht schnell diese Maus.` | `der Kater frisst diese Maus nicht schnell.` |
| … `my` MOUSE | `der Kater frisst nicht schnell meine Maus.` | `der Kater frisst meine Maus nicht schnell.` |
| CAT not SEE EUROPE, FAST | `der Kater sieht nicht schnell Europa.` | `der Kater sieht Europa nicht schnell.` |
| CAT not GIVE the DOG the BOOK, FAST | `der Kater gibt nicht schnell dem Hund das Buch.` | `der Kater gibt dem Hund das Buch nicht schnell.` |
| question | `frisst der Kater nicht schnell die Maus?` | `frisst der Kater die Maus nicht schnell?` |
| `wenn` clause | `wenn der Kater nicht schnell die Maus fressen würde, würde der Hund laufen.` | `wenn der Kater die Maus nicht schnell fressen würde, würde der Hund laufen.` |
| command | `iss nicht schnell die Maus.` | `iss die Maus nicht schnell.` |
| command, ALWAYS | `iss nicht immer die Maus.` | `iss die Maus nicht immer.` |
| instruction | `nicht schnell die Maus essen.` | `die Maus nicht schnell essen.` |
| infinitive, FOOD, ALWAYS | `nicht immer das Essen essen.` | `das Essen nicht immer essen.` |
| the random phrase's first clause | `ganze heiße Wölfe konnten nicht plötzlich die leeren Dateien ersetzen.` | `ganze heiße Wölfe konnten die leeren Dateien nicht plötzlich ersetzen.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** A negated verb with no adverb (`der Kater frisst die Maus nicht.`). An object
pronoun, which already leads (`der Kater frisst sie nicht schnell.`). The relative clause (`der Hund,
der die Maus nicht schnell frisst, läuft.`). A direction adverb, which follows the object (`der Kater
verschiebt das Buch nicht nach oben.`, A142).

Found by the random phrase "whole hot wolves could not replace the empty files suddenly, and some
teeth that acquired this near sad sound will make many brown feelings' fire behind Asia." (seed
502397). **This overrules passing tests.** The order was pinned as right, raised with the user as a
question, and ruled a defect on 2026-09-21.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
rest of the engine suite green.

In `renderClause`, when "nicht" takes the adverb slot (`adverbSlots(…).nichtBeforeObject` is set) and
every conjunct of the direct object is a noun (not a pronoun) with a `definite`, `this` or `that`
determiner, splice the dative and the direct object in ahead of "nicht" instead of after the adverb.
The trial did this in the three places that assemble a middle field: the declarative (which the
question and the `wenn` clause share), the command and instruction, and the infinitive. A possessive
and a proper name resolve to `definite`, so they come along. A passive's by-phrase stays where it is.

**It changes four passing assertions,** all added with [A49](A49-german-nicht-in-commands-and-infinitives.md)'s
fix, which was about "nicht" before the adverb and pinned the object's position along with it:

| Test | Now asserted | Becomes |
|---|---|---|
| `imperative.test.ts` → *German puts "nicht" before an adverb that precedes the object or the predicate complement* | `iss nicht immer die Maus.` | `iss die Maus nicht immer.` |
| `infinitive.test.ts` → *German puts "nicht" before every adverb and every predicate complement* | `nicht immer das Essen essen.` | `das Essen nicht immer essen.` |
| `de/renderClause.test.ts` → *imperative › nicht leads an adverb, ahead of the object and a predicate complement* | `iss nicht immer die Maus` | `iss die Maus nicht immer` |
| `de/renderClause.test.ts` → *infinitive mood › nicht leads an adverb and a predicate complement* | `nicht immer die Maus essen` | `die Maus nicht immer essen` |

Rewrite the comments that give the old order with them, including `adverbSlots`'s own example
(`verschiebt nicht schnell das Buch`).

**Decisions for the fixer:**

- **The positive clause.** Without "nicht" the adverb still leads a definite object: `der Kater kann
  schnell die Maus fressen`, `iss schnell die Maus`, pinned as right in `modals.test.ts` and
  `imperative.test.ts`. `kann die Maus schnell fressen` is the more neutral order there too, but the
  engine's order is grammatical. The trial leaves it. Not pinned.
- **Quantified objects.** `alle`, `einige`, `viele` and `wenige` stay behind "nicht" in the trial
  (`frisst nicht schnell alle Mäuse`), because moving a quantifier across the negation changes its
  scope. An indefinite object is [A182](A182-german-nicht-with-an-indefinite-object.md)'s. Not pinned.

| | |
|---|---|
| **Test** | `negation.test.ts` → *known bugs: German "nicht" and an adverb in front of a definite object* (1 `test.fails`, plus a regression test for no adverb, a pronoun, the relative clause and a direction adverb) |

## Resolved

**2026-09-21.** Fixed as the **Shape of the fix** describes, in
[`renderClause`](../../../packages/engine/src/languages/de/renderClause.ts). A new `objectLeadsNicht`
predicate answers, once for the clause, whether the direct object stands ahead of the "nicht" + adverb
group: "nicht" must hold the adverb slot (`adverbSlots(…).nichtBeforeObject`), the object must render
in the Mittelfeld's noun slot, and every conjunct must be a noun with a `definite`, `this` or `that`
determiner — a possessive and a proper name resolve to `definite` and come along. The three middle
fields splice on that one answer: the declarative (shared by the question and the `wenn` protasis),
the command/instruction and the infinitive. The dative recipient travels with the object, so
`gibt dem Hund das Buch nicht schnell`. The relative clause needed nothing — `subordinateClause`
already puts its adverbs after the objects.

What does not move: a passive's by-phrase, which borrows the object slot but is no object; a
prepositional object (A139), which stands with the complements; a pronoun, which already leads from
the pronoun slot; the prospective, whose "nicht" scopes over "im Begriff" rather than the adverb slot
(A146); a direction adverb, which follows the object already (A142); and — as the bug file's trial
left them — the quantified object (`nicht schnell alle Mäuse`) and the positive clause
(`kann schnell die Maus fressen`).

- **Engine changed:** [`renderClause.ts`](../../../packages/engine/src/languages/de/renderClause.ts).
  [`adverbSlots.ts`](../../../packages/engine/src/languages/de/adverbSlots.ts) and
  [`nichtSlots.ts`](../../../packages/engine/src/languages/de/nichtSlots.ts) took doc-comment changes
  only, including `adverbSlots`'s own `verschiebt nicht schnell das Buch` example.
- **Tests:** [`negation.test.ts`](../../../packages/engine/test/negation.test.ts) → *known bugs:
  German "nicht" and an adverb in front of a definite object*. The pinning `test.fails` is now a
  passing `test` with its assertions unchanged. New cases in the same block:
  - the quantified objects (`alle`, `einige`, `viele`), a coordination mixing a known and a quantified
    conjunct, and the positive declarative and command — all unmoved;
  - a coordination of known conjuncts, which moves whole; `that` as well as `this`; the complements,
    which stay behind "nicht"; the passive by-phrase; the prospective; and the command's direction
    adverb.

  Colocated: new declarative cases in
  [`renderClause.test.ts`](../../../packages/engine/src/languages/de/renderClause.test.ts) (the known
  object, the resultative, the dative recipient, the quantified object and the pronoun).
- **The four passing assertions this overruled** were rewritten exactly as the table above says, in
  [`imperative.test.ts`](../../../packages/engine/test/imperative.test.ts),
  [`infinitive.test.ts`](../../../packages/engine/test/infinitive.test.ts) and twice in the colocated
  `renderClause.test.ts`; their comments now name A191 over A49.
