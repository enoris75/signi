# A41. HOME in a locative wants the "at home" idiom, not "in the &lt;home-word&gt;"

**Language:** all except Japanese

`HOME` names a hearth — the place one lives — and every language marks *being there* with a fixed
"at home" idiom, not the article-fused preposition the engine reaches for on any common noun. The
locative complement treats HOME like HOUSE, so it renders the preposition + the home-word
(`in the home`, `dans le foyer`, `no lar`, …). Each is grammatical, but none is how the language
says "at home". It is a property of the **noun**, not of the complement, so every locative-licensing
verb inherits it (`the cat runs / eats / is … in the home`).

| | Now | Want |
|---|---|---|
| English | `the cat runs in the home.` | `the cat runs at home.` |
| Italian | `il gatto corre nella casa.` | `il gatto corre a casa.` |
| French | `le chat court dans le foyer.` | `le chat court à la maison.` |
| Spanish | `el gato corre en el hogar.` | `el gato corre en casa.` |
| Portuguese | `o gato corre no lar.` | `o gato corre em casa.` |
| German | `der Kater läuft im Zuhause.` | `der Kater läuft zu Hause.` |

Japanese is already correct — `家で` is exactly "at home". HOUSE is untouched (`in the house`,
`nella casa`, `im Haus`, …), which is why the suite exercises the locative complement itself with
HOUSE, not HOME.

## Shape of the fix

A per-noun locative override on HOME, keyed to the lexeme rather than to a form flag — analogous to
the proper-noun article-drop of **A29** (which keys off `nf['proper']`), but here the trigger is the
concept/lexeme. Each language's `locative` complement head returns the idiom instead of the
article-fused preposition: article-less `at home` / `a casa` / `en casa` / `em casa`, the fixed
`à la maison`, and `zu Hause`. The override must survive the noun-phrase machinery (no article, no
preposition fusion) and apply for every licensing verb.

| | |
|---|---|
| **Test** | `complements/locative.test.ts` → *known bugs: locative* (1 `test.fails`) |
