# B2. English and German drop the negative cause sentiment

**Documented simplification — do NOT fix without a product decision.**

| | |
|---|---|
| **Behaviour** | English and German drop the **negative** cause sentiment, collapsing it onto the neutral connector (`because of` / `wegen`) |
| **Correct target / rationale** | `en.ts`: English "has no distinct neutral/negative connector". `de.ts`: the `durch … Schuld` periphrasis is not built. The other five languages **do** distinguish it, so the user's stance is silently lost in two of seven. Correct targets: `through the fault of the dog` / `durch die Schuld des Hundes`. |
| **Test** | `complements/cause.test.ts` (2) |

## Resolved

**2026-07-17** — fixed after a product decision to build the negative-cause connector in both
languages, so all seven now carry the speaker's stance.

- **English:** a `CAUSE_PREP` map keyed by sentiment supplies the connector — neutral `because of`,
  positive `thanks to`, negative **`through the fault of`** ("the cat cries through the fault of the
  dog"). Both the noun path and the pronoun path (`through the fault of him`) read from it.
- **German:** a negative noun cause takes the genitive periphrasis **`durch die Schuld`** + the
  blamed party in the genitive ("durch die Schuld des Hundes"), reusing the existing `nounPhrase(np,
  'gen')` declension. A negative pronoun cause takes the possessive periphrasis `durch <possessive>
  Schuld` ("durch seine Schuld", "durch meine Schuld"), the possessive agreeing with feminine
  "Schuld". Neutral/positive keep `wegen` / `dank`.

- **Corpus/schema:** unchanged.
- **Engine files changed:**
  [`../../../packages/engine/src/languages/en.ts`](../../../packages/engine/src/languages/en.ts)
  (new `CAUSE_PREP` table; noun and pronoun cause read from it) and
  [`../../../packages/engine/src/languages/de.ts`](../../../packages/engine/src/languages/de.ts)
  (the `durch die Schuld` genitive path for a noun cause and the possessive path for a pronoun cause).
- **Tests now guarding it:** `packages/engine/test/complements/cause.test.ts` — the two formerly
  `test.fails` cases are ordinary passing tests in `describe('cause: the negative sentiment in
  English and German')`, joined by German genitive gender/number coverage (neuter -es, feminine, plural),
  English plural/indefinite, a negative-pronoun case in both languages, and a regression guard that
  the neutral and positive connectors are unchanged.
