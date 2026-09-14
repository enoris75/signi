# A138. German ADD is the arithmetic verb

**Language:** German

ADD's German forms are *addieren*, which adds numbers up ("zwei Zahlen addieren"). Putting a thing
together with others is *hinzufügen*. The UI says it on every "add" control: `action.addPeriodContainer`,
`action.addSavedPeriod`, `action.addCondition`, `action.addConjunct`, `modifier.addAdjective`.

| Clause | Now | Want |
|---|---|---|
| de: CAT ADD a MOUSE | `der Kater addiert eine Maus.` | `der Kater fügt eine Maus hinzu.` |
| de: CAT ADD a MOUSE, past | `der Kater addierte eine Maus.` | `der Kater fügte eine Maus hinzu.` |
| de: instruction ADD a CONDITION | `eine Bedingung addieren.` | `eine Bedingung hinzufügen.` |

Already right: the other six languages (it *aggiungere*, fr *ajouter*, es *añadir*, pt *adicionar*,
ja 加える / 追加).

Found while localizing the condition and conjunct controls
([B21](../../localization/done/B21-ui-clause-and-coordination-vocabulary.md)).

## Shape of the fix

*hinzufügen* is a separable verb, and the German engine has none yet. The particle leaves the verb in
a main clause's finite position and goes to the end of the clause (`fügt … hinzu`). It stays attached in
the infinitive and the participle (`hinzufügen`, `hinzugefügt`), and the verb goes to the end whole in a
subordinate clause (`…, der eine Maus hinzufügt`). So:

1. Give German verb forms a separable particle (a `particle: 'hinzu'` form key beside the finite
   paradigm of *fügen*, or split off the known prefixes).
2. Place it at the end of a main clause in the German clause builder, after the objects and
   complements and before any clause-final infinitive or participle.
3. Reseed ADD's German forms. The German imperative row for ADD in `imperative.test.ts` (`addiere`)
   becomes `füge … hinzu`, and the participle in `nonfinite.ts` becomes `hinzugefügt`.

| | |
|---|---|
| **Test** | `verb.test.ts` → *known bugs: German ADD is the arithmetic verb* (2 `test.fails`) |

## Resolved

Fixed 2026-09-14. German now has separable verbs.

- **Corpus:** ADD's German lexeme ([`transitive.ts`](../../../packages/backend/src/concepts/verbs/transitive.ts))
  is `base: 'hinzufügen'`, `particle: 'hinzu'`, over the finite paradigm of *fügen*. Its du command is
  `füge`, and its participle ([`nonfinite.ts`](../../../packages/backend/src/concepts/verbs/nonfinite.ts)) is
  `hinzugefügt`. The dev database needs `npm run seed`.
- **Engine:** [`verbGroup`](../../../packages/engine/src/languages/de/verbGroup.ts) hands the particle over on
  `VerbComplex.particle` ([`de.types.ts`](../../../packages/engine/src/languages/de/de.types.ts)) whenever the verb
  itself is finite. [`renderClause`](../../../packages/engine/src/languages/de/renderClause.ts) puts it last in a
  V2 clause and a command ("fügt die Maus nicht hinzu", "füge … hinzu").
  [`verbFinalCluster`](../../../packages/engine/src/languages/de/verbFinalCluster.ts) joins it back onto the
  finite verb ("…, der eine Maus hinzufügt"), and so does the means clause in
  [`instrumentActionPhrase`](../../../packages/engine/src/languages/de/complementsPhrase/instrumentActionPhrase.ts).
  [`zuInfinitive`](../../../packages/engine/src/languages/de/zuInfinitive.ts) (new) puts *zu* inside it
  ("hinzuzufügen"), for `verbGroup` and `modalVerbGroup`.
  [`deImperativeWord`](../../../packages/engine/src/languages/de/deImperativeWord.ts) commands with the stem
  ("fügen wir"). The infinitive and the participle keep the particle whole.
- **Tests:** [`verb.test.ts`](../../../packages/engine/test/verb.test.ts) → *known bugs: German ADD is the
  arithmetic verb*. Both pinning `test.fails` are now passing `test`s. New cases cover negation, a pronoun,
  an adverb, the progressive, a terminus, a coordinated clause, the future, the resultative, a modal, the
  prospective, relatives, the protasis, the means clause and every command. A regression guard covers the
  other five languages.
  - The German ADD row in `imperative.test.ts` is now `füge hinzu`.
  - The ADD rows in `complements/terminus.test.ts` and the two German `addieren` UI strings in
    `backend/src/uiStrings.test.ts` now read *hinzufügen*.
  - The six ADD blocks of the conjugation snapshot are re-baselined (German cells only).
  - Unit tests: `de/zuInfinitive.test.ts`, `verbGroup`, `modalVerbGroup`, `verbFinalCluster`,
    `deImperativeWord`, `instrumentActionPhrase`, `renderClause`, `subordinateClause`.

Not changed: an inanimate terminus still takes the app's default "in" + accusative, so ADD reads "fügt das
Buch in den Behälter hinzu". *hinzufügen* reads more naturally with "zu" ("zum Behälter"). That choice
belongs to the terminus, whose preposition is verb-dependent (see `complements/terminus.test.ts`).
