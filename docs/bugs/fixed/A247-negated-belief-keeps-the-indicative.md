# A247. A negated belief keeps the indicative in French, Spanish and Portuguese

**Languages:** French, Spanish, Portuguese

A content clause's mood is read off its governor — `content_clause_mood` on the lexeme of the verb
or predicate adjective that hosts it (P09-E4), in
[`contentClauseMood.ts`](../../../packages/engine/src/translator/functions/contentClauseMood.ts) —
and never off the governor's polarity. French, Spanish and Portuguese BELIEVE and THINK declare
nothing, so their object clause takes the indicative an assertion takes, and a **negated** belief
keeps it. Negating a verb of belief denies the proposition, and the three languages put the denied
one in the subjunctive.

| Case | Now | Want |
|---|---|---|
| the MAN does not BELIEVE that the CAT RUNs (es) | `el hombre no cree que el gato corre.` | `el hombre no cree que el gato corra.` |
| … pt | `o homem não acredita que o gato corre.` | `o homem não acredita que o gato corra.` |
| … fr | `l'homme ne croit pas que le chat court.` | `l'homme ne croit pas que le chat coure.` |
| the MAN does not THINK that the CAT RUNs (es) | `el hombre no piensa que el gato corre.` | `el hombre no piensa que el gato corra.` |
| … pt | `o homem não pensa que o gato corre.` | `o homem não pensa que o gato corra.` |
| … fr | `l'homme ne pense pas que le chat court.` | `l'homme ne pense pas que le chat coure.` |

The **Want** column is written by hand. The function's own comment records the gap ("Polarity is
not read").

**Already right.** Italian, whose *credere* and *pensare* govern the subjunctive either way (`l'uomo
non crede che il gatto corra.`); English, German and Japanese, which have no subjunctive to choose
(`the man does not believe that the cat runs.`, `der Mann glaubt nicht, dass der Kater läuft.`,
男は猫が走ると信じていません。); and the affirmative in all seven (`el hombre cree que el gato corre.`).

**Shape of the fix.** Polarity-sensitive mood: a governor's lexeme names the mood it takes under a
negation (say `content_clause_mood_negative: 'subjunctive'` on fr/es/pt BELIEVE and THINK), and
`resolvePhrase` passes the governing verb phrase's `negative` into `contentClauseMood`. Keyed on the
lexeme, not flat per language: SAY negated keeps the indicative in all three (*no dice que corre* is
the unmarked reading), so "any negated governor" would be wrong.

**Nothing shipped shows it**: no gloss or UI string negates a verb with a content object.

Pinned by `known bugs: a negated belief keeps the indicative (A247)` in
[content-clause.test.ts](../../../packages/engine/test/content-clause.test.ts), which also pins what
is already right.

Found shipping [P09-E4](../../features/P-planning/P09-core-vocabulary/P09-E4-clauses.md), object
content clauses.

## Resolved

2026-09-23. A governor's lexeme can now name the mood it takes under a negation,
`content_clause_mood_negative`, alongside `content_clause_mood`.

- **Engine** — [`contentClauseMood.ts`](../../../packages/engine/src/translator/functions/contentClauseMood.ts)
  takes a `negative` flag and, when it is set, reads `content_clause_mood_negative` before
  `content_clause_mood`. A governor that names no negative mood keeps the one it takes affirmed.
  [`resolvePhrase.ts`](../../../packages/engine/src/translator/functions/resolvePhrase.ts) passes the
  governing verb phrase's `negative` in for an object clause.
- **Corpus** — `content_clause_mood_negative: 'subjunctive'` on the fr/es/pt forms of BELIEVE
  ([transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts): croire, creer,
  acreditar) and THINK ([intransitive.ts](../../../packages/backend/src/concepts/verbs/intransitive.ts):
  penser, pensar, pensar). SAY names none, so *no dice que corre* keeps the indicative. Italian is
  unchanged, since its `content_clause_mood: 'subjunctive'` already holds under negation.
- **Tests** — the three pinning `test.fails` in
  [content-clause.test.ts](../../../packages/engine/test/content-clause.test.ts) →
  *known bugs: a negated belief keeps the indicative (A247)* are now plain `test`s. The same block
  adds regression guards for the affirmative THINK (fr/es/pt indicative, it subjunctive) and a
  negated SAY in all seven (indicative). The unit test
  [contentClauseMood.test.ts](../../../packages/engine/src/translator/functions/contentClauseMood.test.ts)
  covers the negative lookup and its fallback.
