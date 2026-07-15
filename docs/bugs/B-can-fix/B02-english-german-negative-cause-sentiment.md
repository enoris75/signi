# B2. English and German drop the negative cause sentiment

**Documented simplification — do NOT fix without a product decision.**

| | |
|---|---|
| **Behaviour** | English and German drop the **negative** cause sentiment, collapsing it onto the neutral connector (`because of` / `wegen`) |
| **Correct target / rationale** | `en.ts`: English "has no distinct neutral/negative connector". `de.ts`: the `durch … Schuld` periphrasis is not built. The other five languages **do** distinguish it, so the user's stance is silently lost in two of seven. Correct targets: `through the fault of the dog` / `durch die Schuld des Hundes`. |
| **Test** | `complements/cause.test.ts` (2) |
