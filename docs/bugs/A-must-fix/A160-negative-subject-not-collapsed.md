# A160. A `no` subject is not collapsed against a second negation source (en, de)

**Language:** English, German

A `no`-determined **subject** already negates the clause. When a **second** negation source follows —
the verb's own `negative`, a `no` object, a `no` complement, or a `NEVER` adverb — English and
German double the negative. Neither language has negative concord, so the second source must give
way: English to the `any`-series NPI, German to a plain indefinite (`kein` = `nicht + ein`).

| Trigger | Language | Now | Want |
|---|---|---|---|
| `no` subject + `no` object | English | `no cat eats no mouse.` | `no cat eats any mouse.` |
| `no` subject + `no` object | German | `kein Kater frisst keine Maus.` | `kein Kater frisst eine Maus.` |
| `no` subject + `no` locative | English | `no cat runs in no house.` | `no cat runs in any house.` |
| `no` subject + `no` locative | German | `kein Kater läuft in keinem Haus.` | `kein Kater läuft in einem Haus.` |
| `no` subject + `negative` verb | English | `no cat does not run.` | `no cat runs.` |
| `no` subject + `negative` verb | German | `kein Kater läuft nicht.` | `kein Kater läuft.` |

Every **Want** was rendered by the engine, not written by hand.

**Already right.** The four Romance engines and Japanese collapse all six — a preverbal negative
subject carries the clause's one negator, and the remaining negative words are concord, not a second
negation: `nessun gatto mangia nessun topo.`, `aucun chat ne court dans aucune maison.`, `ningún gato
corre.`, `nenhum gato corre.`, `どの猫もどのネズミも食べません。`. A **lone** `no` subject is right in all
seven (`no cat runs.`, `kein Kater läuft.`).

**This is [A35](../fixed/A35-stacked-negation-not-collapsed.md)'s remaining corner.** A35 fixed the
collapse for a negated verb or `NEVER` against a `no` **object**, and fixed the `no`-subject case for
Italian/Spanish/Portuguese, but closed with: *"The English/German `no`-subject + `no`-object double —
`no cat eats no mouse` — is a non-concord manifestation the bug table did not pin; it is left
unchanged."* That corner is this bug, and the probing above shows it is wider than the object: the
negated verb and the complement double the same way. It is the **subject-side** twin of
[A158](A158-negative-complement-not-collapsed.md) (the complement side) — same machinery, and the two
want fixing together.

**Not pinned here — needs a form the corpus does not have.** `no` subject + `NEVER` gives English
`no cat never runs.` and German `kein Kater läuft nie.`, both doubled. The correct surfaces need a
negative-polarity *adverb* (English `ever`, German `je`/`jemals`) that is not seeded, so the target
cannot be rendered and is not guessed at here. Italian and French already show the shape
(`nessun gatto corre mai.`, `aucun chat ne court jamais.`). Seeding that NPI adverb is a corpus
decision and is left to the fixer to raise.

Found by probing the random phrase "they were not biting that sharp house in no adult ice cream"
(seed 484002) for neighbouring shapes; raised there and confirmed as a defect.

## Shape of the fix

Both engines already have the machinery and simply do not read the subject's negativity — which is
available, as A35 noted, on `subjectForms['definiteness']`.

- **English** — [`en/predicateParts.ts`](../../../packages/engine/src/languages/en/predicateParts.ts):
  `anyObject = objectIsNegative && (verbNegative === true || groupNegative)` decides the `any` switch
  from the verb and the adverb only. A negative **subject** is a third clause negator and belongs in
  that disjunction; it must also suppress the finite `not` (`no cat runs.`, not `no cat does not
  run.`), which is a separate branch from the object's determiner switch.
- **German** — [`de/finiteNegation.ts`](../../../packages/engine/src/languages/de/finiteNegation.ts):
  `negate` (line 29) and the `withDefiniteness(np, 'indefinite')` downgrade (lines 34–35) both ignore
  the subject. A negative subject must suppress `nicht` and downgrade the object, exactly as
  `adverbIsNegative` already does for `nie`. `finiteNegation` does not currently receive the subject,
  so it needs threading from its four call sites
  ([`renderClause.ts`](../../../packages/engine/src/languages/de/renderClause.ts) lines 84, 109, 138
  and [`subordinateClause.ts`](../../../packages/engine/src/languages/de/subordinateClause.ts) line 84).

**Decision for the fixer:** fix this together with [A158](A158-negative-complement-not-collapsed.md),
which widens the same two functions to read the complements. Done separately, the second will rework
the first. Once both land, "how many clause negators are there, and which one carries it" should be
computed once per clause rather than re-derived per constituent.

| | |
|---|---|
| **Test** | `negation.test.ts` → *known bugs: a negative subject is not collapsed* (2 `test.fails`, plus a regression test that a lone `no` subject and the five collapsing languages are unchanged) |
