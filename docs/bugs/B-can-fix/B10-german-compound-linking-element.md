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
ship the misspelling, and [C11](../../localization/C-needs-engine/C11-ui-failure-messages-passive.md) will
meet the same wording. The suffix rule alone (-ung, -heit, -keit, -schaft, -ion, -tät, -ling, -tum) would
cover it without the lexical stem the -n- cases need; it is left here as part of the product decision.
