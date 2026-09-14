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
