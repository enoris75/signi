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
