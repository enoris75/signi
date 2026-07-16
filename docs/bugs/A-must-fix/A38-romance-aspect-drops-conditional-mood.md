# A38. A marked aspect on a conditional's clause drops the mood (Romance)

**Language:** Romance — it, fr, es, pt

A **marked aspect** (progressive / prospective / resultative) on a hypothetical's clause drops the
mood in the four Romance engines: the periphrastic auxiliary (`stare` / `estar` / `être`) is
conjugated in the plain **present indicative**, not the conditional (apodosis) or imperfect
subjunctive (protasis). Only the **neutral** aspect takes the mood (`il cane correrebbe` ✓), so the
gap is invisible until an aspect is set.

Under a plain (non-`dovere`) counterfactual this is not an approximation but **ungrammatical**: `se
il gatto mangiasse` is a plain imperfect subjunctive, which licenses only a conditional apodosis, so
`il cane sta correndo` is wrong.

All three marked aspects are affected. Apodosis of `se il gatto mangiasse, …`:

| aspect | | Now | Want |
|---|---|---|---|
| **progressive** | it | `il cane **sta** correndo.` | `il cane **starebbe** correndo.` |
| | fr | `le chien **est** en train de courir.` | `le chien **serait** en train de courir.` |
| | es | `el perro **está** corriendo.` | `el perro **estaría** corriendo.` |
| | pt | `o cão **está** correndo.` | `o cão **estaria** correndo.` |
| **prospective** | it | `il cane **sta** per correre.` | `il cane **starebbe** per correre.` |
| | fr | `le chien **est** sur le point de courir.` | `le chien **serait** sur le point de courir.` |
| | es | `el perro **está** a punto de correr.` | `el perro **estaría** a punto de correr.` |
| | pt | `o cão **está** prestes a correr.` | `o cão **estaria** prestes a correr.` |
| **resultative** | it | `il cane **ha** corso.` | `il cane **avrebbe** corso.` |
| | fr | `le chien **a** couru.` | `le chien **aurait** couru.` |
| | es | `el perro **ha** corrido.` | `el perro **habría** corrido.` |
| | pt | `o cão **correu**.` | `o cão **teria corrido**.` |

**Correct target / rationale:** for progressive/prospective (and it/fr/es resultative) the fix is
the 3sg conditional of the aspect auxiliary + the same non-finite form the indicative already gets
right. In `it.ts` (~line 605) mood is applied only on the `aspect === 'neutral'` branch
(`finite(verb)` → `moodForm(...)`); the marked-aspect branch calls `aspectVerb(...)`, which
conjugates its auxiliary with plain `conjugate(...)` and never consults `mood`. Thread `mood` into
the aspect auxiliary across the four Romance engines so aspect and mood compose. The auxiliary is
the finite element, so `moodForm` applies to it exactly as it does to a plain verb.

**Portuguese resultative is a special case.** Its present resultative deliberately collapses to the
pretérito perfeito (fixed A9 — `tem corrido` is iterative, so the present maps onto `correu`). That
collapse must be **bypassed** when a mood is set: a conditional apodosis licenses the true
conditional perfect `teria corrido` (`ter` in the conditional + participle), which is not iterative,
so the A9 rationale does not apply here.

| | |
|---|---|
| **Test** | `hypothetical.test.ts` → *known bugs: aspect drops the conditional mood* (3) |
