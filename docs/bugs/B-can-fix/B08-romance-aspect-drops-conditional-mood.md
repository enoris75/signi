# B8. A marked aspect on a conditional's clause drops the mood in the four Romance engines

**Documented simplification — do NOT fix without a product decision.**

| | |
|---|---|
| **Behaviour** | A **marked aspect** on a conditional's clause drops the mood in the four Romance engines: the periphrastic auxiliary (`stare`/`estar`/`être`) is conjugated in the plain **present indicative**, not the conditional/subjunctive — `se il gatto mangiasse, il cane **sta** correndo` |
| **Correct target / rationale** | `it.ts` ~line 605: "the marked aspects keep their indicative auxiliary (aspect under a conditional is a documented gap)". Only the **neutral** aspect takes the mood (`il cane correrebbe` ✓). Correct target is the 3sg conditional of the auxiliary + the same non-finite form: `starebbe correndo` / `estaría corriendo` / `serait en train de courir` / `estaria correndo`. Under a plain (non-`dovere`) counterfactual this is not an approximation but ungrammatical — only a conditional apodosis is licensed. |
| **Test** | `hypothetical.test.ts` → *documented simplifications: aspect drops the conditional mood* (1) |
