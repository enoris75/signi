# B6. German means clause uses impersonal `man`

**Documented simplification — do NOT fix without a product decision.**

| | |
|---|---|
| **Behaviour** | German means clause uses impersonal `man`: `schneidet, indem **man** den Stock wählt` ("by **one** choosing") |
| **Correct target / rationale** | The instrument is wielded by the clause's own subject: `indem **er** den Stock wählt`. German needs an overt subject (can't drop it like a gerund), and `de/complementsPhrase/instrumentActionPhrase.ts` fills it with `man`. Quietly generalises an action the other six attribute to the cat. |
| **Test** | `complements/instrumental.test.ts` (1) |

## Resolved

**2026-09-21** — fixed after a product decision (the user asked for it). The German means clause
now names whoever wields the instrument, as the personal pronoun agreeing with them in person,
number and gender, and its verb agrees with that pronoun: `der Kater schneidet, indem er den Stock
wählt`, `die Katze …, indem sie …`, `das Kind …, indem es …`, `ich schneide, indem ich den Stock
wähle`, `wir …, indem wir … wählen`, `der Kater und der Hund schneiden, indem sie … wählen`.

Who that is depends on the clause:

- a statement: its own subject; a **generic** subject keeps `man`, which is right there
  (`man schneidet, indem man den Stock wählt`);
- the passive: the demoted agent, who still does the act (`das Essen wird vom Kater geschnitten,
  indem er …`); an agentless passive names no one and keeps `man`;
- a command: its addressee (`schneide, indem du …`, `schneidet, indem ihr …`, `schneiden wir,
  indem wir …`), a coordinated command too; the **instruction** register and a citation infinitive
  are addressed to no one and keep `man` (`schneiden, indem man den Stock wählt`), so the UI
  strings built on the instruction register (`hint.chooseSubject`, `instrumental.level.process.example`)
  render exactly as before;
- a zu-infinitive or clause of purpose: its controller (`der Hund wünscht, zu schneiden, indem er …`,
  `die Katze läuft, um zu schneiden, indem sie …`);
- a relative clause: its subject, the head itself in a subject relative (`der Hund, der frisst,
  indem er …`, `die Maus, die ich esse, indem ich … wähle`), the agent under the passive, the head
  when the relative is gapped on the agent.

The engine has no formal `Sie` address, so a command's means clause is `du`/`ihr`/`wir` only.

- **Corpus/schema:** unchanged.
- **Engine files:**
  - [`../../../packages/engine/src/languages/de/meansDoer.ts`](../../../packages/engine/src/languages/de/meansDoer.ts)
    (new): who wields the instrument for a main clause's mood, register, voice and control.
  - [`../../../packages/engine/src/languages/de/personalPronoun.ts`](../../../packages/engine/src/languages/de/personalPronoun.ts)
    (new) with `DE_PERSONAL` / `DE_THIRD_SINGULAR` in
    [`de.consts.ts`](../../../packages/engine/src/languages/de/de.consts.ts): the agreeing
    nominative pronoun and its person-number.
  - [`../../../packages/engine/src/languages/de/meansClause.ts`](../../../packages/engine/src/languages/de/meansClause.ts)
    (new): renders the means clause `splitMeansClause` lifts out, with its doer.
  - [`../../../packages/engine/src/languages/de/complementsPhrase/instrumentActionPhrase.ts`](../../../packages/engine/src/languages/de/complementsPhrase/instrumentActionPhrase.ts):
    takes an optional doer, and conjugates the verb for its person-number (`<pn>_present`); with
    none it is still `man`.
  - [`renderClause.ts`](../../../packages/engine/src/languages/de/renderClause.ts) and
    [`subordinateClause.ts`](../../../packages/engine/src/languages/de/subordinateClause.ts): render
    the means clause through `meansClause` with the doer, not through `complementsPhrase`.
- **Tests now guarding it:**
  [`packages/engine/test/complements/instrumental.test.ts`](../../../packages/engine/test/complements/instrumental.test.ts)
  → *German means clause subject*: the formerly `test.fails` case, now passing, plus every person,
  number and gender, a coordinated subject, the generic subject, commands (du/ihr/wir, negated,
  coordinated), the instruction and the citation, the zu-infinitive and the purpose clause, the
  passive with and without an agent, and relative clauses (subject, object, passive, agent-gapped).
  Unit tests: `meansDoer.test.ts`, `personalPronoun.test.ts`, `meansClause.test.ts`, and doer cases
  in `instrumentActionPhrase.test.ts` and `subordinateClause.test.ts`. The sentence-level pins that
  spelled `man` for a cat or dog subject (`instrumental`, `relative`, `verb`, `negation`) now spell
  `er`.
