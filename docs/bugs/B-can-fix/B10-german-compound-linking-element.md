# B10. German compounds have no linking element

**Documented simplification — do NOT fix without a product decision.**

| | |
|---|---|
| **Behaviour** | `germanCompound` (`languages/de/germanCompound.ts`) joins an attributive noun straight onto the head: `Phraseschöpfer`, `Jungebuch`, `Geschwindigkeitwort`. Its comment calls linking morphemes "a known simplification". |
| **Correct target / rationale** | Many compounds take a linking element (*Fugenelement*): `-n-` after a feminine `-e` or a weak noun (`Phrasenschöpfer`, `Jungenbuch`), and `-s-` after `-keit`/`-heit`/`-ung`/`-tät`/`-ion` (`Geschwindigkeitswort`, the comment's own `Arbeitsplatz`). The choice is partly lexical, so a full fix probably needs a seeded compounding stem on the noun, with a suffix rule as the fallback. Compounds that need none, such as `Wortschöpfer` and `Segelboot`, are already right. |
| **Test** | `adjectives.test.ts` → *documented simplifications: German compounds* (1 `test.fails`) |
