# A37. French does not agree the participle with a preceding direct object

**Language:** French

French obligatorily agrees a past participle with a **preceding** direct object (the *accord du
participe passé du COD antéposé*). In an object-relative clause under the compound past, the
participle agrees with the antecedent — `la souris que le chat a mangée`. The engine leaves the
participle in its base form (`a mangé`), which is a spelling error in French. Only French makes this
agreement obligatory: Italian's relative-clause agreement is optional (`ha mangiato` is fine) and
Spanish/Portuguese never agree an `haber` / `ter` participle, so all three are correct as-is.

| | Now | Want |
|---|---|---|
| feminine singular antecedent | `la souris que le chat a mangé court.` | `la souris que le chat a mangée court.` |
| feminine plural antecedent | `les souris que le chat a mangé courent.` | `les souris que le chat a mangées courent.` |

A masculine antecedent (`le livre que le chat a mangé`) needs no visible change, and the
object-follows baseline (`le chat a mangé la souris`) correctly does not agree — so the miss is
specific to a *preceding* feminine/plural object.

**Root:** `fr.ts` agrees an *être*-participle with the subject (`agreeParticipleFr`) but never agrees
an *avoir*-participle with a preceding object. The code comment documents only the subject case
("elle a vu"); the preceding-object exception is unmentioned, so this is an undocumented gap rather
than a stated simplification. (It also applies to a preposed object pronoun, `il l'a mangée`, which
is currently blocked by A32.)

| | |
|---|---|
| **Test** | `relative.test.ts` → *known bugs: French preceding-object participle agreement* (2 tests) |
| **Correct today** | same file → *relative clauses: preceding-object participle agreement* (es/pt + masculine control) |

## Resolved

Fixed 2026-07-17, in [`fr.ts`](../../../packages/engine/src/languages/fr.ts):

- **`aspectVerbFr`** gained an optional `precedingObjectForms` argument. An **avoir** resultative
  participle, which still does not agree with the subject (`elle a vu`), now agrees with a *preceding
  direct object* when one is supplied — `agreeParticipleFr(part, precedingObjectForms)` — the *accord
  du participe passé du COD antéposé*.
- **`predicateText`** threads the argument through to `aspectVerbFr`.
- **`relativeText`** passes the antecedent's forms (`np.head.forms`) as the preceding object **only
  when `rel.headRole === 'directObject'`** — an object-relative. A subject-relative or a
  complement-role head passes nothing, so no agreement fires there.

Result: `la souris que le chat a mangée` (fem sg), `les souris que le chat a mangées` (fem pl), `les
livres que le chat a mangés` (masc pl — the -s is visible). A feminine *subject* (`la chatte qui a
mangé la souris`) and a plain main clause (`la chatte a mangé la souris`) are unchanged, since avoir
never agrees with its subject. Italian's optional relative-clause agreement and Spanish/Portuguese's
non-agreeing `haber`/`ter` participles are untouched.

- **Tests:** [`packages/engine/test/relative.test.ts`](../../../packages/engine/test/relative.test.ts)
  → *known bugs: French preceding-object participle agreement*. Both pinning `test.fails` are now
  passing `test`s, plus added cases: a masculine-plural antecedent (`a mangés`), a regression that the
  participle does NOT agree with a subject (object-following relative, and a main clause), and a
  regression that Spanish/Portuguese still do not agree a plural antecedent.
