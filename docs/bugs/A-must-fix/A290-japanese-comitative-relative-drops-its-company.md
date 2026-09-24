# A290. A Japanese comitative relative drops its company

**Languages:** Japanese

A Japanese relative clause has no relative pronoun: the gap's particle simply goes, and the head
follows the clause. That works for an object, a place or an instrument (切るナイフ, *the knife one
cuts with*), because the verb still tells how the head takes part. It does not work for the
comitative. Once と goes, nothing says the head was *company*: 猫が走る犬 reads as *the dog the cat
runs*, or as a vague *the cat-running dog*. Japanese restores the relation with 一緒に (*together*)
inside the clause: 猫が**一緒に**走る犬, *the dog the cat runs with*.

| Case | Now | Want |
|---|---|---|
| the WOMAN sees the DOG with which the CAT RUNs (`headRole: 'comitative'`) | `女は猫が走る犬を見ます。` | `女は猫が一緒に走る犬を見ます。` |
| the FRIEND with whom the MAN ACTs RUNs (as subject) | `男が行動する友達は走ります。` | `男が一緒に行動する友達は走ります。` |

**Why this target.** 一緒に is how a comitative is relativized in Japanese: 一緒に住む人 (*the person
one lives with*) is the reading the corpus already uses for B74's partner nouns (see
`concepts/nouns.ts`). Both Want strings were rendered by the engine itself, by giving the same
relative clause the TOGETHER adverb (`verbPhrase.modifier: 'TOGETHER'`, whose ja form is 一緒に). They
differ from Now only by the adverb.

**Already right.** The other six languages keep the preposition with the relative pronoun: en "the
dog with which the cat runs", it "il cane con il quale il gatto corre", fr "le chien avec lequel le
chat court", de "den Hund, mit dem der Kater läuft", es "el perro con el que el gato corre", pt "o cão
com o qual o gato corre". The Japanese statement (猫は女と走ります) is right.

**Shape of the fix.** Where the Japanese relative clause drops the gapped complement, a
`comitative` gap should put 一緒に before the predicate, as a manner adverb would sit. The fixer must
decide:

- whether to take the word from the TOGETHER lexeme (so it stays seeded data) or from a Japanese
  constant;
- what happens when the clause already carries TOGETHER: it must not come out twice
  (一緒に一緒に走る).

**Not settled here:** whether other gaps with no recoverable relation have the same problem in
Japanese (the cause, *thanks to*; the topic, *about*). Not probed.

Pinned by `known bugs: a Japanese comitative relative drops its company (A290)` in
[relative.test.ts](../../../packages/engine/test/relative.test.ts).

Found on 2026-09-24 while landing the P09-E13 coverage audit: lane R pinned the role-gap
relative's comitative neighbour as a regression and flagged its Japanese.
