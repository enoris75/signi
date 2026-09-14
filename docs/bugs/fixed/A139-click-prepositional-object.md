# A139. CLICK takes its object with a preposition

**Language:** Italian, French, German, Spanish, Portuguese

One clicks *on* a thing in five of the languages: it *cliccare su*, fr *cliquer sur*, de *klicken auf*
+ accusative, es *clicar en*, pt *clicar em*. CLICK renders its object as a bare direct object, as English
and Japanese (を) take it. The UI's own hints show it: `hint.chooseWord` (it "clicca uno slot"),
`pick.condition` and `pick.relativeHead` (fr "cliquer la période", es "clicar el período").

| Clause | Now | Want |
|---|---|---|
| it: CAT CLICK the BUTTON | `il gatto clicca il pulsante.` | `il gatto clicca sul pulsante.` |
| fr: CAT CLICK the BUTTON | `le chat clique le bouton.` | `le chat clique sur le bouton.` |
| de: CAT CLICK the BUTTON | `der Kater klickt die Taste.` | `der Kater klickt auf die Taste.` |
| es: CAT CLICK the BUTTON | `el gato clica el botón.` | `el gato clica en el botón.` |
| pt: CAT CLICK the BUTTON | `o gato clica o botão.` | `o gato clica no botão.` |
| de: instruction CLICK the BUTTON | `die Taste klicken.` | `auf die Taste klicken.` |

Already right: English (`the cat clicks the button.`) and Japanese (`猫はボタンをクリックします。`).

Found while localizing the pick hints ([B21](../../localization/done/B21-ui-clause-and-coordination-vocabulary.md)).

## Shape of the fix

The plan keeps CLICK's object a `directObject`: what is clicked is its patient in every language. The
preposition is lexical, like a German verb's dative object, so it belongs on the verb's forms: a per-language
object preposition (`object_prep: 'su'`, `'sur'`, `'auf'`, `'en'`, `'em'`) that each engine renders as it
renders a locative's, with its article contraction (it *sul*, pt *no*) and German's accusative. It must
also keep the object out of the object-pronoun path: "click on it" is it *cliccaci sopra* / fr *cliquer
dessus* / es *clicar en él*, not a clitic `lo`.

| | |
|---|---|
| **Test** | `verb.test.ts` → *known bugs: CLICK takes its object with a preposition* (2 `test.fails`) |

## Resolved

Fixed 2026-09-14 with the shape above. It follows A124/A129's alarm cry, a verb-lexical preposition on the
object.

- **Corpus:** CLICK's lexemes ([`transitive.ts`](../../../packages/backend/src/concepts/verbs/transitive.ts))
  name `object_prep`: it `su`, fr `sur`, de `auf`, es `en`, pt `em`. The dev database needs `npm run seed`.
- **Shared:** [`objectPreposition`](../../../packages/engine/src/functions/objectPreposition.ts) reads the
  preposition. [`relativePrepositionalHead`](../../../packages/engine/src/functions/relativePrepositionalHead.ts)
  builds a relative's stand-in head, as `relativeAlarmHead` does.
- **Romance:** each engine has a new `prepObjectText` that renders one object conjunct: the preposition with
  the article fusion a complement takes, or a pronoun in its tonic form.
  - [it](../../../packages/engine/src/languages/it/prepObjectText.ts): *sul*, "su di me"; `su` joins
    `prepArt` / `prepDet`.
  - [fr](../../../packages/engine/src/languages/fr/prepObjectText.ts): "sur le", "sur moi".
  - [es](../../../packages/engine/src/languages/es/prepObjectText.ts): "en el", "en mí". Spanish's personal
    *a* now goes through it too.
  - [pt](../../../packages/engine/src/languages/pt/prepObjectText.ts): *no*, *nesta*, "em mim", *nele*.

  Each `predicateText` keeps such an object out of the clitic path. It also stays out of Italian and Spanish
  passive agreement ("si clicca sui pulsanti"), French dislocation and French participle agreement. The
  relatives (`it/relativeText`, `fr/relativeText`, `es/withRelative`, `pt/withRelative`) take the
  preposition: "sul quale", "sur lequel", "en el que", "no qual".
- **German:** [`splitObject`](../../../packages/engine/src/languages/de/splitObject.ts) returns the object as
  a `prepositional` phrase in the accusative, and a neuter pronoun as the da-compound (*darauf*).
  [`renderClause`](../../../packages/engine/src/languages/de/renderClause.ts) and
  [`subordinateClause`](../../../packages/engine/src/languages/de/subordinateClause.ts) place it where a
  predicate complement goes, after *nicht* ("klickt nicht auf die Taste"). A relative's pronoun takes the
  preposition ("die Taste, auf die der Kater klickt").
- **Tests:** [`verb.test.ts`](../../../packages/engine/test/verb.test.ts) → *known bugs: CLICK takes its object
  with a preposition*. Both pinning `test.fails` are now passing `test`s. New cases cover pronouns and
  commands, negation, a no-object, a coordinated object, the resultative, a modal, the impersonal subject,
  the protasis and relatives. A regression guard covers English, Japanese, a plain direct object's clitic
  and CLICK without an object.
  - `backend/src/uiStrings.test.ts` now reads the Italian `pick.condition` as "Clicca sul periodo…".
  - Unit tests: `objectPreposition.test.ts`, `relativePrepositionalHead.test.ts`, each Romance
    `prepObjectText.test.ts`, `it/prepArt.test.ts`, `de/splitObject.test.ts`, and the `predicateText` /
    relative / `renderClause` / `subordinateClause` tests of the five engines.
