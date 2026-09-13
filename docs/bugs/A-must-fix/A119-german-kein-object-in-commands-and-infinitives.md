# A119. German commands, instructions and infinitives skip the "kein" negation rules

**Language:** German

The declarative branch of `renderClause` (`languages/de/renderClause.ts`) has two rules for a `kein`
(`definiteness: 'no'`) object:

1. `kein` already negates the clause, so a negated verb adds no `nicht` (`isst keine Maus`).
2. under a negative adverb, `nie keine` would negate twice, so the object drops to the indefinite
   (`isst nie eine Maus`).

The imperative, instruction and infinitive branches each build their own `applyNicht`, and it checks
only for a negative adverb. So the command keeps `nicht` beside `kein`, and `nie` leaves `kein` in
place:

| Clause | Now | Want |
|---|---|---|
| command, negated | `iss keine Maus nicht.` | `iss keine Maus.` |
| command, ihr, negated | `esst keine Maus nicht.` | `esst keine Maus.` |
| command, negated + FAST | `iss nicht schnell keine Maus.` | `iss schnell keine Maus.` |
| command, NEVER | `iss nie keine Maus.` | `iss nie eine Maus.` |
| command, GIVE, negated | `gib dem Jungen kein Buch nicht.` | `gib dem Jungen kein Buch.` |
| instruction, negated | `keine Maus nicht essen.` | `keine Maus essen.` |
| instruction, NEVER | `nie keine Maus essen.` | `nie eine Maus essen.` |
| infinitive, negated | `keine Maus nicht essen.` | `keine Maus essen.` |
| infinitive, negated + FAST | `nicht schnell keine Maus essen.` | `schnell keine Maus essen.` |
| infinitive, NEVER | `nie keine Maus essen.` | `nie eine Maus essen.` |

Already right: `iss keine Maus.` and `keine Maus essen.` with no negated verb, `iss die Maus nicht.`,
`iss nie.`, `nie essen.`. The declarative (`der Kater isst keine Maus.`, `der Kater isst nie eine
Maus.`) and the other languages (`do not eat any mouse`, `non mangiare nessun topo`) are also right.
The French infinitive's `ne pas manger aucune souris` is A91.

Found while fixing A49, which moved the placement of `nicht` into `nichtSlots` but left each clause
order's decision *whether* to negate as it was.

## Shape of the fix

Share the declarative's negation gate with the imperative and infinitive branches, as A49 did for
the slots. That means `applyNicht` should also check for a `kein` object, and the `kein` object should
become the indefinite under a negative adverb (the declarative's `objectToRender`). The relative
clause needs the same gate (A50, whose `kein` row is the verb-final form of this bug).

| | |
|---|---|
| **Test** | `imperative.test.ts` → *known bugs: German "kein" object in commands and instructions* (1 `test.fails`); `infinitive.test.ts` → *known bugs: German "kein" object in the infinitive* (1 `test.fails`) |
