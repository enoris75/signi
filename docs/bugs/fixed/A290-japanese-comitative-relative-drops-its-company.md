# A290. A Japanese relative drops the relation its gap's particle carried (comitative, opponent)

**Languages:** Japanese

A Japanese relative clause has no relative pronoun: the gap's particle simply goes, and the head
follows the clause. That works for an object, a place or an instrument (切るナイフ, *the knife one
cuts with*), because the verb still tells how the head takes part. It does not work where the
particle was the only thing saying so:

- **the comitative.** Once と goes, nothing says the head was *company*: 猫が走る犬 reads as *the dog
  the cat runs*, or as a vague *the cat-running dog*. Japanese restores the relation with 一緒に
  (*together*) inside the clause: 猫が**一緒に**走る犬, *the dog the cat runs with*.
- **the opponent** (P09-E22). Once を相手に goes, 猫が遊ぶ犬 reads as *the dog the cat plays* or *the
  dog the cat plays with*, never *against*. Japanese keeps the relation by keeping 相手に's verb and
  gapping its object: 猫が**相手にして**遊ぶ犬, *the dog the cat plays taking on as its opponent*.

| Case | Now | Want |
|---|---|---|
| the WOMAN sees the DOG with which the CAT RUNs (`headRole: 'comitative'`) | `女は猫が走る犬を見ます。` | `女は猫が一緒に走る犬を見ます。` |
| the FRIEND with whom the MAN ACTs RUNs (as subject) | `男が行動する友達は走ります。` | `男が一緒に行動する友達は走ります。` |
| the DOG against which the CAT PLAY_GAMEs RUNs (`headRole: 'opponent'`, as subject) | `猫が遊ぶ犬は走ります。` | `猫が相手にして遊ぶ犬は走ります。` |
| the MAN sees the DOG against which the CAT PLAY_GAMEs (as object) | `男は猫が遊ぶ犬を見ます。` | `男は猫が相手にして遊ぶ犬を見ます。` |

**Why these targets.** 一緒に is how a comitative is relativized in Japanese: 一緒に住む人 (*the person
one lives with*) is the reading the corpus already uses for B74's partner nouns (see
`concepts/nouns.ts`). For the opponent, 相手にして rather than the bare 相手に: the statement's を相手に
is itself を相手にして shortened, and with its を gapped only the verb する can still take the head as
its object; 猫が相手に遊ぶ犬 reads 相手 as a plain noun (*plays with a partner*) and loses the head.
All four Want strings were rendered by the engine itself: the comitative ones by giving the relative
clause the TOGETHER adverb (`verbPhrase.modifier: 'TOGETHER'`, whose ja form is 一緒に); the opponent
ones by giving it a test-only adverb whose Japanese lexeme is TOGETHER's with 相手にして in place of
一緒に (a lookup override in a scratch probe; nothing seeded). Each differs from Now only by the
inserted word, before the predicate.

**Already right.** The other six languages keep the preposition with the relative pronoun. The
comitative: en "the dog with which the cat runs", it "il cane con il quale il gatto corre", fr "le
chien avec lequel le chat court", de "den Hund, mit dem der Kater läuft", es "el perro con el que el
gato corre", pt "o cão com o qual o gato corre". The opponent: en "the dog against which the cat
plays runs.", it "il cane contro il quale il gatto gioca corre.", fr "le chien contre lequel le chat
joue court.", de "der Hund, gegen den der Kater spielt, läuft.", es "el perro contra el que el gato
juega corre.", pt "o cão contra o qual o gato joga corre." The Japanese statements (猫は女と走ります,
猫は犬を相手に遊びます) and a subject-gap relative that keeps its opponent (犬を相手に遊ぶ猫) are right.

**Shape of the fix.** Where the Japanese relative clause drops the gapped complement, a
`comitative` gap should put 一緒に, and an `opponent` gap 相手にして, before the predicate, as a manner
adverb would sit. The fixer must decide:

- whether to take the words from lexemes (TOGETHER for 一緒に; nothing seeded says 相手にして) or from
  Japanese constants beside `PARTICLE`'s を相手に;
- what happens when the clause already carries TOGETHER: it must not come out twice
  (一緒に一緒に走る);
- what an opponent gap does under a verb that names its own marker (`opponent_prep`, 戦う's と):
  there the verb itself says *opponent*, so it likely wants nothing inserted: with opponent.test.ts's
  test-only 戦う lexeme the engine writes 猫が戦う犬は走ります。 (*the dog the cat fights runs*), which
  is already clear, and 相手にして戦う would be redundant.

**Not settled here: the cause and topic gaps.** Probed on the same tree; both drop their particle
the same way, and neither is pinned:

- **a path on a direction or locative gap** (P09-E21's *onto*): 男は猫が跳ぶ壁を見ます。 for both *the
  wall onto which the cat jumps* and *the wall on which the cat jumps*; the 上 of 壁の上に goes with
  the particle. 猫が飛び乗る壁 or 猫が上に跳ぶ壁 would keep it. spatialRelations.test.ts leaves
  Japanese out of that row rather than pin it either way.

- **topic** (について): 女は男が話す本を見ます。 for *the woman sees the book about which the man
  speaks*. This is ordinary Japanese (彼が話していた本, *the book he was talking about*): the verb of
  speech recovers the relation, so it is likely not a defect.
- **cause** (のために): 女が泣く男は走ります。 for *the man because of whom the woman cries runs*.
  Weaker: a gapless relative can carry a cause reading, but it leans on context, and a native
  reader may want 女が泣く原因の男 or the causative 女を泣かせる男. It needs its own judgment before
  anyone files it; it is a different fix from a word inserted before the predicate.

Pinned by `known bugs: a Japanese relative drops the relation its gap's particle carried (A290)` in
[relative.test.ts](../../../packages/engine/test/relative.test.ts).

Found on 2026-09-24 while landing the P09-E13 coverage audit: lane R pinned the role-gap
relative's comitative neighbour as a regression and flagged its Japanese. The opponent rows were
added the same day from the P09-E22 coverage audit.

## Resolved

2026-09-24. [ja/relativeClauseSegs.ts](../../../packages/engine/src/languages/ja/relativeClauseSegs.ts)
gives a `comitative` gap 一緒に and an `opponent` gap 相手にして, from Japanese constants
(`JA_GAP_RELATION` in [ja/ja.consts.ts](../../../packages/engine/src/languages/ja/ja.consts.ts));
nothing seeded says 相手にして, and 一緒に keeps TOGETHER's reading いっしょに.
[ja/predicateSegs.ts](../../../packages/engine/src/languages/ja/predicateSegs.ts) takes the word as a
new trailing `gapRelation` argument and seats it where the particle's phrase would stand: ahead of a
manner adverb (猫が一緒に速く走る犬), behind a `frequency` one (猫がいつも一緒に走る犬). The decisions:

- the words are constants, not lexemes;
- a clause whose adverb is already TOGETHER says it once (猫が一緒に走る犬);
- a verb that names its own opponent marker (`opponent_prep`, 戦う's と) gets nothing inserted:
  猫が戦う犬は走ります。

Still open, as the bug file left them: the path on a direction or locative gap (猫が跳ぶ壁, which
spatialRelations.test.ts still leaves Japanese out of), and the topic and cause gaps.

Guarded by `known bugs: a Japanese relative drops the relation its gap's particle carried (A290)` in
[relative.test.ts](../../../packages/engine/test/relative.test.ts): the four former `test.fails`,
the two regression tests, and new tests for tense, negation, adverb order, an object in the clause,
the furigana, and the `opponent_prep` verb; plus a unit case in
[relativeClauseSegs.test.ts](../../../packages/engine/src/languages/ja/relativeClauseSegs.test.ts).
