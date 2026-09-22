# A212. German keeps a coordinated pronoun object behind "nicht" and the adverb

**Language:** German

[A191](../fixed/A191-german-nicht-and-adverb-before-a-definite-object.md) put a known object ahead of
`nicht` and the adverb (*frisst die Maus nicht schnell*), and a coordination of known conjuncts moves
with it (*frisst die Maus und das Essen nicht schnell*). A pronoun is the most known object there is.
Alone it already leads from the Mittelfeld's pronoun slot (*frisst ihn nicht schnell*).

Inside a coordination it does not. [`objectLeadsNicht`](../../../packages/engine/src/languages/de/renderClause.ts)
requires every conjunct to be a known **noun** and rejects any conjunct with a `person`. The comment
gives the reason: "a pronoun already leads from the pronoun slot". That is true of a lone pronoun
only. A coordination is never a clitic ([A53](../fixed/A53-coordinated-pronoun-object.md)), so a
group holding a pronoun renders in the noun slot, and the one pronoun keeps the whole group behind
`nicht`. The group then reads as the focus of a contrast, "not *him and the dog*, but …".

| Case | Now | Want |
|---|---|---|
| CAT not EAT FAST, him and the DOG | `der Kater frisst nicht schnell ihn und den Hund.` | `der Kater frisst ihn und den Hund nicht schnell.` |
| … the DOG and him | `der Kater frisst nicht schnell den Hund und ihn.` | `der Kater frisst den Hund und ihn nicht schnell.` |
| CAT not SEE ALWAYS, him and me | `der Kater sieht nicht immer ihn und mich.` | `der Kater sieht ihn und mich nicht immer.` |
| past, CAN, SUDDENLY, you and the MOUSE | `der Kater konnte nicht plötzlich dich und die Maus fressen.` | `der Kater konnte dich und die Maus nicht plötzlich fressen.` |
| command | `iss nicht schnell ihn und den Hund.` | `iss ihn und den Hund nicht schnell.` |
| the random phrase's `wenn` clause | `wenn das alte Licht nicht gut mich oder jenen großen Mann mit diesen wilden Gebäuden beschreiben würde, …` | `wenn das alte Licht mich oder jenen großen Mann nicht gut mit diesen wilden Gebäuden beschreiben würde, …` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** A lone pronoun (`frisst ihn nicht schnell`). A group of known nouns (`frisst die
Maus und den Hund nicht schnell`). A group with a quantified conjunct stays behind `nicht`, pronoun or
not, as A191 decided (`frisst nicht schnell ihn und alle Hunde`). The clause without an adverb
(`frisst ihn und den Hund nicht`). The positive clause, which A191 left alone (`frisst schnell ihn
und den Hund`). The relative clause, which puts its adverbs after the objects anyway (`der Hund, der
ihn und die Maus nicht schnell frisst, läuft`).

Found by the random phrase "if the old light did not describe me or that big man with these wild
buildings well, …" (seed 583438): `wenn das alte Licht nicht gut mich oder jenen großen Mann …`.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine suite green, and no passing test moves.

In `objectLeadsNicht`, count a pronoun conjunct as known instead of excluding it:

```ts
return directObject.conjuncts.every((np) =>
  !!np.head.forms['person'] || KNOWN_OBJECT_DETERMINERS.has(np.head.forms['definiteness'] ?? 'definite'));
```

A lone pronoun never reaches the check, because it renders in the pronoun slot and leaves
`objectNoun` empty, which already returns `false`. The comment's reason stays true for it. The one
predicate serves the declarative, the question, the `wenn` clause, the command and the infinitive,
so every row follows.

| | |
|---|---|
| **Test** | `negation.test.ts` → *known bugs: German "nicht" and an adverb in front of a coordinated pronoun* (1 `test.fails`, plus a regression test for the lone pronoun, a group of nouns, a quantified conjunct, no adverb, the positive clause and the relative clause) |
