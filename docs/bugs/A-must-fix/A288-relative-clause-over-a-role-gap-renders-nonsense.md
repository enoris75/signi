# A288. A relative clause over a role gap renders nonsense

**Package:** engine (translator)

A relative clause may gap any complement (`RelativeClause.headRole`), and since
[P09-E13](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E13-role-complement.md) that
includes `role`. The engines treat the role gap like a prepositional one and put the essive marker in
front of a relative pronoun. Romance and German have no relative over an essive *as*, so the result
is word salad. German also loses the relative pronoun and leaves a double space.

| Case | Now | Want |
|---|---|---|
| the WOMAN SEEs the FRIEND (role gap: the MAN ACTs as it) | `the woman sees the friend as whom the man acts.`, `la donna vede l'amico come quale l'uomo agisce.`, `la femme voit l'ami comme quel l'homme agit.`, `die Frau sieht den Freund, als  der Mann handelt.`, `la mujer ve al amigo como que el hombre actúa.`, `a mulher vê o amigo como qual o homem age.`, 女は男が行動する友達を見ます。 | refused: an `Error` naming the role gap |
| the FRIEND (role gap: the MAN ACTs as it) RUNs | `the friend as whom the man acts runs.`, `l'amico come quale l'uomo agisce corre.`, `l'ami comme quel l'homme agit court.`, `der Freund, als  der Mann handelt, läuft.`, `el amigo como que el hombre actúa corre.`, `o amigo como qual o homem age corre.`, 男が行動する友達は走ります。 | refused |

English is only just acceptable ("the friend as whom the man acts"; the natural form strands the
preposition, "the friend the man acts as"). The Japanese relative is grammatical, but it drops
として and so no longer says the friend is the role.

**No correct-output pin.** The proposed target is a refusal, so there is no rendered string to
assert. The pin asserts the throw instead (`expect(() => …).toThrow(/role/)`), in the style of the
A275 pins.

**Already right.** A relative over the comitative gap of the same clause (`the friend with whom the
man acts`, `l'amico con il quale…`, `der Freund, mit dem der Mann handelt`), and a role *inside* a
relative clause (`the book that the man reads as a student`, `das Buch, das der Mann als Student
liest`). A role-gap relative with no subject is already refused by A275's check. A role *question* is
refused by `resolveQuestion` (`resolveQuestion.test.ts`, "the gaps with no question here are refused
by name").

**Who can reach it.** Only the plan API (`/api/translate`, or a hand-written plan). The console and
the canvas relativise only `COMPLEMENT_TYPES`, where `role` is not listed, and `randomPhrase` leaves
`role` out of its gaps. P09-E13's task file lists this as a follow-up.

**Found by** auditing P09-E13's test coverage.

## Shape of the fix

**Decision for the fixer: refuse or render.**

- **Refuse (proposed).** `resolveRelativeClause`
  ([resolveRelativeClause.ts](../../../packages/engine/src/translator/functions/resolveRelativeClause.ts))
  throws a named `Error` when `headRole === 'role'`, next to A273's and A275's checks. The message
  should name the role, as `resolveQuestion`'s does ("…cannot…a role gap…"). `/api/translate` then
  gets the same 400 treatment A273 and A275 have, and the backend pin goes with it. This matches the
  role question, and no language loses a sentence it could say well.
- **Render.** English strands *as* ("the friend the man acts as"), and Japanese keeps として in some
  other frame. Italian, French, Spanish, Portuguese and German have no idiomatic relative here, so
  they would need a paraphrase ("l'amico nel ruolo del quale…"). That is a construction of its own,
  and it is out of scope for a bug fix.

If the fix refuses, the two `test.fails` flip as they stand. If it renders, replace them with
correct-output pins.

| | |
|---|---|
| **Test** | `complements/role.test.ts` → *known bugs: a relative clause over a role gap renders nonsense (A288)* (2 `test.fails` asserting the refusal, the gap as object and as subject, plus a regression test for the comitative gap and a role inside an object relative) |
