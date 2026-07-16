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

## Resolved

Fixed 2026-07-16. `mood` is now threaded into the aspect auxiliary across all four Romance engines,
so aspect and mood compose.

- **Shared:** [`packages/engine/src/mood.ts`](../../../packages/engine/src/mood.ts) — `STARE` added
  to `IT_SUBJ_STEM` (the Italian imperfect subjunctive of *stare* is irregular: `stesse`, not
  `*stasse`).
- **Engines** ([`it`](../../../packages/engine/src/languages/it.ts),
  [`fr`](../../../packages/engine/src/languages/fr.ts),
  [`es`](../../../packages/engine/src/languages/es.ts),
  [`pt`](../../../packages/engine/src/languages/pt.ts)): each aspect auxiliary (stare/essere/avere,
  être/avoir, estar/haber, estar/ter) is modelled as a minimal `ConceptForms` carrying just the
  stems `moodForm` needs — the `1sg_future` for the conditional and the infinitive / 3pl-preterite
  for the subjunctive (the preterite stems `estuvieron` / `hubieron` / `estiveram` / `tiveram` are
  irregular and not in the imperfect-only tables, so they are supplied). `aspectVerb` now takes
  `mood` and uses `moodForm(aux) ?? table[tense]`: under a hypothetical the auxiliary is the finite
  element and takes the conditional (apodosis, `il cane starebbe correndo` / `avrebbe corso`) or
  the imperfect subjunctive / imparfait (protasis, `se il gatto stesse mangiando`); with no mood it
  falls back to the plain tense form, so ordinary clauses are unchanged.
- **Portuguese A9 interaction:** the present-resultative → pretérito perfeito collapse (`correu`,
  fixed A9) is bypassed when a mood is set — a conditional perfect (`teria corrido`) / pluperfect
  subjunctive (`tivesse corrido`) is a genuine perfect, not the iterative `tem corrido`, so the A9
  rationale does not apply. Outside a hypothetical the collapse still holds.
- **Tests:** [`packages/engine/test/hypothetical.test.ts`](../../../packages/engine/test/hypothetical.test.ts)
  → *known bugs: aspect drops the conditional mood*. The three pinning `test.fails` (progressive /
  prospective / resultative apodosis, all four languages) now pass, plus two added cases: the
  protasis siblings (a marked aspect on the IF clause taking the subjunctive/imparfait of its
  auxiliary) and a regression guard that the Portuguese present resultative still collapses to the
  pretérito outside a conditional. The full 144-cell hypothetical snapshot matrix was regenerated;
  the diff is confined to `it/fr/es/pt` marked-aspect cells (en/de/ja realise both moods in-engine
  and were untouched). One anchored cell's `it` string moved from the old present-indicative
  `sta per bere` to the now-correct conditional `starebbe per bere`.
