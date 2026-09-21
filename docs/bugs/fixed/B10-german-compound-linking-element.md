# B10. German compounds have no linking element

**Documented simplification — do NOT fix without a product decision.**

| | |
|---|---|
| **Behaviour** | `germanCompound` (`languages/de/germanCompound.ts`) joins an attributive noun straight onto the head: `Phraseschöpfer`, `Jungebuch`, `Geschwindigkeitwort`. Its comment calls linking morphemes "a known simplification". |
| **Correct target / rationale** | Many compounds take a linking element (*Fugenelement*): `-n-` after a feminine `-e` or a weak noun (`Phrasenschöpfer`, `Jungenbuch`), and `-s-` after `-keit`/`-heit`/`-ung`/`-tät`/`-ion` (`Geschwindigkeitswort`, the comment's own `Arbeitsplatz`). The choice is partly lexical, so a full fix probably needs a seeded compounding stem on the noun, with a suffix rule as the fallback. Compounds that need none, such as `Wortschöpfer` and `Segelboot`, are already right. |
| **Test** | `adjectives.test.ts` → *documented simplifications: German compounds* (1 `test.fails`) |

**Met again 2026-09-20 ([C10](../../localization/done/C10-ui-questions.md)).** The UI string asking whether
the server is up wanted "the translation server", which compounds as *Übersetzungserver* — TRANSLATION is
an `-ung` noun, one of the endings that always take the -s-. The string dropped its modifier rather than
ship the misspelling, and [C11](../../localization/done/C11-ui-failure-messages-passive.md) will
meet the same wording. The suffix rule alone (-ung, -heit, -keit, -schaft, -ion, -tät, -ling, -tum) would
cover it without the lexical stem the -n- cases need; it is left here as part of the product decision.

## Resolved

**2026-09-21** — fixed after a product decision (the user asked for it). Each attributive noun now
enters a German compound in its compound stem, linking element included: `Phrasenschöpfer`,
`Jungenbuch`, `Geschwindigkeitswort`, `Übersetzungsserver`, while `Wortschöpfer` and `Segelboot`
stay bare.

- **Rule** (the fallback): `-s-` after the feminine suffixes `-ung`, `-heit`, `-keit`, `-schaft`,
  `-ion`, `-tät` (gated on the feminine, so a masculine such as *Sprung* is left alone) and after
  `-ling`/`-tum`; `-n-` after a feminine `-e`; a weak masculine's oblique `-(e)n`, read off the
  `weak` mark A08 seeded; nothing otherwise.
- **Lexicon** (wins over the rule): a German `compound` form on the noun, seeded only where the rule
  would be wrong. Every German noun in the corpus was rendered as a compound modifier and checked;
  34 got a stem: `Hunde` (DOG), `Sorgfalts` (CARE), `Stärke` (STRENGTH), `Alters` (AGE), `Essens`
  (FOOD), `Inhalts` (CONTENT), `Orts` (PLACE), `Kinder` (CHILD), `Personen` (PERSON), `Männer`
  (MAN), `Frauen` (WOMAN, YOUNG_WOMAN), `Wolfs` (WOLF), `Rinder` (BOVINE), `Engels` (ANGEL),
  `Lebens` (LIFE), `Todes` (DEATH), `Gefühls` (FEELING), `Münz` (COIN), `Sprach` (LANGUAGE), `Demonstrativ`
  (DEMONSTRATIVE), `Quantoren` (QUANTIFIER), `Personal` (PERSON_GRAMMAR: *Personalendung*),
  `Zahlen` (NUMBER), `Geschlechts` (GENDER), `Präteritum` (PAST_TENSE, against the `-tum` rule),
  `Befehls` (COMMAND, ORDER), `Namens` (NAME_NOUN, weak but `-ns-`), `Lade` (LOADING),
  `Zwischenablage` (CLIPBOARD, a feminine `-e` without `-n-`), `Merkmals` (FEATURE), `Begriffs`
  (CONCEPT), `Gegenstands` (OBJECT_THING). The rest take the rule's answer. `Spielautomaten`
  (SLOT_MACHINE) was seeded as a stem too, until B09 (fixed the same day) marked `Spielautomat` weak;
  the weak-noun rule now gives it.
- No seeded UI string or concept definition changed its German rendering: the compounds they use
  (PERIOD_SENTENCE, WORD and INTERFACE as modifiers) take no linking element. The C10/C11 wording
  that dropped "translation" to avoid *Übersetzungserver* can now be revisited; the UI strings were
  left as they are.
- **Engine files:**
  - [`../../../packages/engine/src/languages/de/compoundStem.ts`](../../../packages/engine/src/languages/de/compoundStem.ts)
    (new): the seeded stem, else the rule; suffix lists `FUGEN_S_FEMININE` / `FUGEN_S_ANY` in
    [`de.consts.ts`](../../../packages/engine/src/languages/de/de.consts.ts).
  - [`../../../packages/engine/src/languages/de/germanCompound.ts`](../../../packages/engine/src/languages/de/germanCompound.ts):
    joins each modifier's `compoundStem` instead of its `base`.
- **Corpus:** [`../../../packages/backend/src/concepts/nouns.ts`](../../../packages/backend/src/concepts/nouns.ts)
  — the `compound` forms above, documented above the `nouns` array.
- **Tests now guarding it:**
  [`packages/engine/test/adjectives.test.ts`](../../../packages/engine/test/adjectives.test.ts) →
  *German compound linking elements*: the formerly `test.fails` case, now passing, plus the `-s-`
  suffixes (`Übersetzungsserver`, `Bedingungswort`, `Qualitätsbuch`, `Polaritätsbuch`,
  `Optionstaste`), `-n-` after a feminine `-e` and a weak masculine, seeded stems (`Hundebuch`,
  `Lebensbuch`, `Kinderbuch`, `Sprachtaste`, `Zwischenablagetaste`, `Namenstaste`, `Ladesymbol`),
  bare compounds, stacked modifiers (`Sprachoptionstaste`), the head's own case and number, and the
  other six languages unchanged. Unit tests in `compoundStem.test.ts` and `germanCompound.test.ts`.
  The stacked-modifier pin in the same file moved from `Wortphrasekarte` to `Wortphrasenkarte`.
