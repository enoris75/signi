# A132. A Japanese state verb renders as an event

**Language:** Japanese

In Japanese, the plain 〜ます / 〜ました form of a verb like 持つ (hold, have) names the change of
state. 猫は本を持ちます means "the cat will pick up the book", and 持ちました means "picked it up". A
state that holds, which is what English "has", "had" and "owns" say, uses the resultant 〜ている:
持っています, 持っていました.

The engine gives 持つ (HAVE), 所有する (OWN), 愛する (LOVE) and 保持する (HOLD) the event form. For
KNOW it avoids the problem only through a lexical workaround: 知る's `masu_present` stores 知っています
(`concepts/verbs/transitive.ts`). The negative is built from that stored form, 知っていません, but 知る is
the one state verb whose negative is the plain form: 知りません, 知りませんでした.

This is the Japanese counterpart of A130. Found while filing it.

| Plan | Now | Want |
|---|---|---|
| CAT HAVE the book | `猫は本を持ちます。` | `猫は本を持っています。` |
| CAT HAVE the book, past | `猫は本を持ちました。` | `猫は本を持っていました。` |
| CAT HAVE the book, negative | `猫は本を持ちません。` | `猫は本を持っていません。` |
| CAT HAVE the book, past negative | `猫は本を持ちませんでした。` | `猫は本を持っていませんでした。` |
| CAT OWN the book (present, past) | `所有します` · `所有しました` | `所有しています` · `所有していました` |
| CAT LOVE the dog (present, past) | `愛します` · `愛しました` | `愛しています` · `愛していました` |
| CAT HOLD the book (present, past) | `保持します` · `保持しました` | `保持しています` · `保持していました` |
| CAT KNOW the book, negative | `猫は本を知っていません。` | `猫は本を知りません。` |
| CAT KNOW the book, past negative | `猫は本を知っていませんでした。` | `猫は本を知りませんでした。` |
| if CAT HAVE the book, … | `もし猫が本を持ったら、…` | `もし猫が本を持っていたら、…` |
| if CAT KNOW the book, … | `もし猫が本を知ったら、…` | `もし猫が本を知っていたら、…` |

Already right: event verbs (`食べました`, `見ます`, the protasis `食べたら`), KNOW in the affirmative
(`知っています`, `知っていました`), the progressive (`持っています`), and the dictionary form a modal governs
(`持つ必要があります`, `持ちたいです`). All of these are pinned as a regression guard.

Not pinned:

- **Relative clauses.** `本を持つ猫` and `男の子を知る猫` would be more natural with 〜ている in a
  specific sentence (`本を持っている猫`). However, the dictionary form is correct in a generic
  definition, and the corpus's own glosses use it: POSSESSOR `物を所有する人`, CONTAINER `…を保持する物`,
  and the citation `財産を持つ。`. A fix must not change those.
- **UNDERSTAND.** `理解します` / `理解しました` is borderline. 理解している is the state and 理解した is
  the event, and the past reads fine as an event, as it does in Romance (A130).
- **The resultative of a state.** `猫は本を持ってしまいます` for "has had" is B05's documented
  〜てしまう mapping, not this defect.

## Shape of the fix

Reuse A130's concept-level `stative` flag. For a stative verb in a finite main clause with neutral
aspect, `predicateSegs` renders the te-form + いる, as it already does for the progressive. It keeps the
tense, polarity and politeness endings (持っています / 持っていました / 持っていません /
持っていませんでした), and the たら protasis builds on the same form (持っていたら, 知っていたら).
Modals, relatives and the citation form stay unchanged.

KNOW then drops its `masu_present` workaround and becomes stative like the others. It needs one
exception: its negative takes the plain form (知りません). The existing assertions that pin the event
forms need updating, notably *possession verbs: OWN and HOLD* in `verb.test.ts` (`所有します`,
`所有しました`, `保持します`, `保持しました`).

| | |
|---|---|
| **Test** | `verb.test.ts` → *known bugs: Japanese state verb in the main clause* (1 `test.fails`) |
