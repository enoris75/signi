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

## Resolved

Fixed 2026-09-13, as a concept-keyed locative override shared by the six affected engines:

- [`types.ts`](../../../packages/engine/src/types.ts): new `locativeIdiom(complement, np, idioms)`
  returns the idiom for a conjunct whose head concept has one — but only in plain containment (no
  specifier, or `in`), under the definite or bare determiner, singular, and unmodified (no
  adjective, attributive noun, possessor or relative clause). Anything else returns `undefined`, so
  the noun renders as an ordinary place.
- Each language's consts file gets a `LOCATIVE_IDIOMS` table keyed by concept id, following the
  `FR_SUPPLETIVE` pattern: `HOME` → `at home`
  ([`en.consts.ts`](../../../packages/engine/src/languages/en/en.consts.ts)), `a casa`
  ([`it.consts.ts`](../../../packages/engine/src/languages/it/it.consts.ts)), `à la maison`
  ([`fr.consts.ts`](../../../packages/engine/src/languages/fr/fr.consts.ts)), `en casa`
  ([`es.consts.ts`](../../../packages/engine/src/languages/es/es.consts.ts)), `em casa`
  ([`pt.consts.ts`](../../../packages/engine/src/languages/pt/pt.consts.ts)), `zu Hause`
  ([`de.consts.ts`](../../../packages/engine/src/languages/de/de.consts.ts)).
- Each `complementsPhrase.ts` (`languages/{en,it,fr,es,pt,de}/`) swaps in the idiom for the whole
  conjunct before the article, fusion and case logic runs. Romance and German already repeat the
  preposition on every conjunct, so a coordinated place just works (`a casa e nel mercato`,
  `zu Hause und im Markt`). English normally shares one preposition across the group (`in the house
  and the market`), so a group containing the idiom gives each conjunct its own preposition instead:
  `at home and in the market`.

The idiom is keyed to the concept, not the word. HOUSE shares Italian/Spanish/Portuguese `casa`
but keeps `nella casa` / `en la casa` / `na casa`. Japanese was already correct (`家で`) and is
unchanged. A spatial relation keeps the ordinary noun phrase (`under the home`, `sotto la casa`,
`unter dem Zuhause`). So do an indefinite, a plural, an adjective and a possessor (`in a home`,
`in the homes`, `in the big home`, `in the boy's home`). Spanish/Portuguese still select *estar*
for the place (`el gato está en casa`).

Out of scope, not addressed: the directional and source complements still render HOME as an
ordinary noun (`goes to the home` / `va alla casa` / `geht zum Zuhause`, where each language has its
own "go home" idiom — `goes home`, `va a casa`, `geht nach Hause`). Neither was pinned by this defect.

- **Tests:** [`packages/engine/test/complements/locative.test.ts`](../../../packages/engine/test/complements/locative.test.ts)
  → *known bugs: locative*. The pinning `test.fails` is now a passing `test`. Added cases: every
  locative-licensing verb inherits the idiom (`test.each` over `LOCATIVE_VERBS`); `is at home` with
  es/pt *estar*; the bare determiner matches the default; an indefinite, plural, adjective-modified,
  possessed or relational HOME falls back to an ordinary place; a coordinated place keeps the idiom
  on its HOME conjunct, and English still shares the preposition across a group without HOME. Unit
  cases were added to each `languages/{en,it,fr,es,pt,de}/complementsPhrase.test.ts`, including a
  guard that the same word under another concept id stays an ordinary place.
