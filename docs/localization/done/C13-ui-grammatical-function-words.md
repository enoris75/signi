# C13. UI strings — conjunctions, spatial prepositions, cause connectors, degree words

**Kind:** hardcoded UI string. Once unblocked it becomes a [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts)
entry, driven by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Was blocked on:** a catalog **entry kind for function words the engines build in context**. The
catalog could already cite one such word: a `determiner` entry calls `translateDeterminer` and
cites the determiner on a noun, because its form depends on that noun. These menus show words just
as context-dependent, and there was no citation for them.

| word class | depends on | examples |
|---|---|---|
| coordinating conjunction | what it joins (clauses vs nouns) | ja 〜と between nouns, そして between clauses; `then` carries its own adverb ("e poi", "und dann") |
| path specifier | the complement noun (gender, case, contraction) | it *in* / *nel* / *nella*; de *in* + dative vs accusative; ja 〜の中で |
| cause connector | sentiment and the noun | *a causa di* / *per colpa di* / *grazie a*; de *wegen* + genitive |
| comparative degree | the adjective (periphrastic vs synthetic) | it *più* / *il più*; de *-er* / *am -sten*; en *more* vs *-er* |

## Strings

| literal | where |
|---|---|
| And / Or / But / That is / Therefore / Then | `COORD_CONJUNCTION_OPTIONS` [interfaces.ts](../../../packages/frontend/src/components/PhraseBuilder/interfaces.ts) → conjunction menu ([ConjunctionMenu.tsx](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/ConjunctionMenu.tsx)) and every `COORD_CONJUNCTION_LABEL` use ([CoordinationButton.tsx](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/CoordinationButton.tsx), [periodAppearance.ts](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/functions/periodAppearance.ts), [PhraseWorkspace.tsx](../../../packages/frontend/src/components/PhraseBuilder/PhraseWorkspace.tsx), [useConnectors.ts](../../../packages/frontend/src/components/PhraseBuilder/hooks/useConnectors.ts), [ConjunctRings.tsx](../../../packages/frontend/src/components/PhraseBuilder/ConjunctRings.tsx)) |
| in / through / under / over / around / behind / in front of | `PATH_SPECIFIER_LABELS` in shared → specifier tooltips ([Boxes.tsx](../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx)) and the console's completion rows ([complete.ts](../../../packages/frontend/src/console/language/complete.ts)) |
| Neutral — because of / Negative — fault of / Positive — thanks to | `CAUSE_SENTIMENT_LABELS` in shared → sentiment tooltips ([Boxes.tsx](../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx)) |
| — / More / Most / Less / Least / Equally | `DEGREE_LABELS` in shared → degree chip ([phraseRender.tsx](../../../packages/frontend/src/components/PhraseBuilder/phraseRender.tsx)) |

The *names* beside these words are ordinary adjectives, and are seeded: the conjunction kinds
(copulative, disjunctive, …) are rendered as the menu's hints by
[B21](B21-ui-clause-and-coordination-vocabulary.md) (`conjunction.kind.*`), and NEUTRAL and
POSITIVE, which the sentiment labels need beside NEGATIVE, by
[B22](B22-ui-verb-feature-controls.md).

## Done

**2026-09-21.** Three entry kinds, three citation functions, three engine methods per language,
twenty-three entries, and the four English maps are gone.

### The entry kinds

Beside `UiStringDeterminerDef`, in [uiStrings.ts](../../../packages/shared/src/uiStrings.ts):

1. **`conjunction: CoordConjunction`** → [`translateConjunction`](../../../packages/engine/src/translator/functions/translateConjunction.ts).
   The one function word that agrees with nothing, so it takes no `agreesWith` — but it still needs
   an engine, because no lexicon holds it and what counts as *one word* is a fact about the
   language. It is cited **between two clauses**, which is where the menu puts it.
2. **`specifier: Specifier` + `agreesWith`** → [`translateSpecifier`](../../../packages/engine/src/translator/functions/translateSpecifier.ts).
   Cited on a noun held **bare**, so no article comes along with the preposition it would fuse to
   and what is left is the adposition alone. One kind covers both families: a `path` relation and a
   cause `sentiment` are the same thing — a choice the engines realise as an adposition.
3. **`degree: Degree` + `agreesWith`** → [`translateDegree`](../../../packages/engine/src/translator/functions/translateDegree.ts).
   The only label cited on an **adjective** rather than a noun, because whether a degree is a word
   at all depends on which adjective it is comparing.

`buildUiStrings` dispatches them in [`renderEntry`](../../../packages/backend/src/uiStrings.ts) —
a function rather than the chain of ternaries it grew out of, because narrowing a `const` starts
from its initializer and the catalog's literal types collapsed the union before the new kinds were
reached.

### What they render

`conjunction.value.*` — the word the menu offers:

| key | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| `and` | and | e | et | und | y | そして | e |
| `or` | or | o | ou | oder | o | または | ou |
| `but` | but | ma | mais | aber | pero | しかし | mas |
| `that_is` | that is | cioè | c'est-à-dire | das heißt | es decir | つまり | isto é |
| `therefore` | **so** | quindi | donc | also | por lo tanto | だから | portanto |
| `then` | **and then** | e poi | et puis | und dann | y luego | それから | e depois |

The last two rows changed the **English** menu, and they are the point of routing it through the
engine: "so" and "and then" are what English actually writes between two clauses, and they are what
the sentence has always rendered. The menu was offering "Therefore" and "Then", neither of which
ever appeared in the output. The keyboard letters are unchanged (S for the conclusive, T for the
temporal): a shortcut is not translated.

`specifier.value.*` — the adposition each spatial relation is spoken with:

| key | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| `in` | in | in | dans | in | en | 〜の中で | em |
| `through` | through | attraverso | à travers | durch | por | 〜を通って | por |
| `under` | under | sotto | sous | unter | debajo de | 〜の下で | debaixo de |
| `over` | over | sopra | au-dessus de | über | por encima de | 〜の上で | por cima de |
| `around` | around | intorno a | autour de | um | alrededor de | 〜の周りで | ao redor de |
| `behind` | behind | dietro | derrière | hinter | detrás de | 〜の後ろで | atrás de |
| `in_front_of` | in front of | davanti a | devant | vor | delante de | 〜の前で | em frente de |

`sentiment.value.*` names the stance and `sentiment.connector.*` the word it picks; the tooltip
joins the two with a dash, as C12's two-part tooltips do:

| key | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| `neutral` | because of | a causa di | à cause de | wegen | a causa de | 〜のために | por causa de |
| `negative` | through the fault of | per colpa di | par la faute de | durch die Schuld | por culpa de | 〜のせいで | por culpa de |
| `positive` | thanks to | grazie a | grâce à | dank | gracias a | 〜のおかげで | graças a |

`degree.value.*` — what the degree adds to the adjective it is cited on (BIG by default):

| key | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| `positive` | — | — | — | — | — | — | — |
| `more` | bigger | più | plus | größer | más | もっと | mais |
| `most` | biggest | il più | le plus | am größten | el más | 最も | o mais |
| `less` | less | meno | moins | weniger | menos | それほど〜ない | menos |
| `least` | least | il meno | le moins | am wenigsten | el menos | 最も〜ない | o menos |
| `equally` | equally | ugualmente | aussi | gleich | igual de | 同じくらい | igualmente |

### Three things the citation had to be taught

- **Japanese writes its relation after the noun**, and two of the seven relations add nothing
  inside a clause at all — plain containment and a plain traversal are carried by the particle
  (家で, 市場を). Derived, the menu would have shown 〜で for both. They are cited in full instead,
  with the 中 and the 通る the particle leaves implicit, and with the 〜 a dictionary writes for a
  form that cannot stand without its noun ([`PATH_CITATION`](../../../packages/engine/src/languages/ja/ja.consts.ts)).
- **The Romance relative superlative is the comparative under the definite article**, and the
  article belongs to the noun phrase rather than to the degree. Without it "più" would name both
  degrees, so the label carries the masculine-singular article the citation form is given in —
  "il più", "le plus", "el más", "o mais".
- **German has no degree word to show for `more`/`most`**: it remakes the adjective. The label is
  therefore the remade adjective ("größer", and the predicative "am größten", the superlative that
  stands without a noun), and English does one or the other depending on the adjective — which is
  the whole reason the degree is cited on one. `degree.value.more` reads "bigger" on BIG and
  "more" on BEAUTIFUL.
- **The Japanese lowered degrees are a circumfix.** Japanese lowers a degree by *negating the
  adjective* — それほど大きく**ない**, 最も大きく**ない** — so the adverb the sentence opens with is only
  half the word. Named alone, `most` and `least` would both come back 最も. They are cited whole
  instead, 最も〜ない, with the same 〜 the path specifiers use. (The sentences were already right;
  this is `isLoweredDegree` reaching the label too.)

### The English maps are gone

`DEGREE_LABELS`, `PATH_SPECIFIER_LABELS` and `CAUSE_SENTIMENT_LABELS` were deleted from
`packages/shared/src/index.ts`; `COORD_CONJUNCTION_LABEL` became `COORD_CONJUNCTION_LABEL_KEY` and
`COORD_CONJUNCTION_OPTIONS`'s `label` became a `labelKey` ([A15](A15-ui-slot-scoped-commands.md)'s
convention). `useConnectors` needed the catalog inside a hook, so the test harness grew a
`withProviders` wrapper for `renderHook`.

## Tests that selected on these literals

`Therefore` → `PeriodContainer/CoordinationButton.test.tsx`, `PeriodContainer/ConjunctionMenu.test.tsx`;
`in front of` → `Boxes.test.tsx`, `VerbPhraseBuilder.test.tsx`; `thanks to` → `complements.spec.ts`,
`PhraseBuilder.test.tsx`; `Degree:` values → `phraseRender.test.tsx`, `NounPhraseBuilder.test.tsx`,
`VerbPhraseBuilder.test.tsx`, `PhraseBuilder.test.tsx`. All moved onto the catalog's fallbacks,
which for the path specifiers are the same words the deleted map held. The renders themselves are
pinned in `packages/engine/test/uiLabel.test.ts`, one describe per citation function.
