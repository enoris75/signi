# A158. A `no` complement is not collapsed against a second negation source (en, de)

**Language:** English, German

A `no`-determined phrase in a **complement** (locative / direction / …) already negates the clause.
When a **second** negation source is present — the verb's own `negative`, or a `NEVER` adverb — a
double negative escapes in the two languages that have no negative concord.

This is [A35](../fixed/A35-stacked-negation-not-collapsed.md)'s collapse, which fires from the
**direct-object** path only — the same shape as [A33](../fixed/A33-romance-complement-negative-concord.md),
where the Romance *concord* fired from the object path and not the complement path. The Romance
engines and Japanese read the shared `hasNegativeComplement(complements)` predicate (added by A33) and
are correct here; English and German never ask it, because concord was the only question it was built
for.

| Trigger | Language | Now | Want |
|---|---|---|---|
| `negative` verb + `no` locative | English | `the cat does not run in no house.` | `the cat does not run in any house.` |
| `negative` verb + `no` locative | German | `der Kater läuft in keinem Haus nicht.` | `der Kater läuft in keinem Haus.` |
| `negative` verb + `no` direction | English | `the cat does not go to no market.` | `the cat does not go to any market.` |
| `negative` verb + `no` direction | German | `der Kater geht zu keinem Markt nicht.` | `der Kater geht zu keinem Markt.` |
| `NEVER` + `no` locative | English | `the cat never runs in no house.` | `the cat never runs in any house.` |
| `NEVER` + `no` locative | German | `der Kater läuft nie in keinem Haus.` | `der Kater läuft nie in einem Haus.` |
| the random phrase below | English | `they were not biting that sharp house in no adult ice cream.` | `they were not biting that sharp house in any adult ice cream.` |
| the random phrase below | German | `sie bissen gerade jenes scharfe Haus in keinem erwachsenen Eis nicht.` | `sie bissen gerade jenes scharfe Haus in keinem erwachsenen Eis.` |

Each **Want** is the surface A35 already chose for the direct object, applied to the complement:
English switches the negative phrase to the `any`-series NPI; German keeps `kein` and drops the
redundant `nicht` for a negated verb, and drops the complement to a plain indefinite under `nie`
(`kein` = `nicht + ein`, so `nie … keinem` doubles). Every Want string above was rendered by the
engine, not written by hand.

**Already right:** Italian `il gatto non corre in nessuna casa.`, French `le chat ne court dans
aucune maison.`, Spanish `el gato no corre en ninguna casa.`, Portuguese `o gato não corre em nenhuma
casa.`, Japanese `猫はどの家でも走りません。` — one negator each, from `hasNegativeComplement`. A **lone**
`no` complement is right in all seven, and so is a negated verb with a *positive* complement
(`der Kater läuft im Haus nicht.` — `nicht` after the complements is [A49](../fixed/A49-german-nicht-in-commands-and-infinitives.md)'s
placement rule).

**Out of scope:** a `no` **subject** with a `no` complement (`no cat runs in no house.`, `kein Kater
läuft in keinem Haus.`). That is the same non-concord double A35 explicitly left unpinned for the
object (`no cat eats no mouse`); it wants one decision covering both, not a fix here.

Found by reviewing the random phrase "they were not biting that sharp house in no adult ice cream"
(seed 484002).

## Shape of the fix

Both engines compute negativity from the direct object alone and must also ask
[`hasNegativeComplement`](../../../packages/engine/src/functions/hasNegativeComplement.js) — whose
doc comment ("English and German need no concord") should lose that aside, since it is now read for
collapse as well as concord.

- **English** — [`en/predicateParts.ts`](../../../packages/engine/src/languages/en/predicateParts.ts):
  `objectIsNegative` reads only `directObject`, and `anyObject` gates only `directObjectText`. The
  complements go through `complementsPhrase(complements, verb.forms)` untouched. The same
  `withDefiniteness(np, 'any')` must reach each complement's `no` conjunct when `verbNegative` or
  `groupNegative` holds — per conjunct, as the object already does ("in the house or any market").
- **German** — [`de/finiteNegation.ts`](../../../packages/engine/src/languages/de/finiteNegation.ts):
  `objectIsNegative` (line 28) reads only `directObject`, so `negate` (line 29) stays true when the
  complement carries the `kein` and `nicht` survives beside it. It needs the complements in the same
  disjunction, and the `withDefiniteness(np, 'indefinite')` downgrade at lines 34–35 — which today
  maps `directObject.conjuncts` — has to map the complements' conjuncts too under a negative adverb.
  `finiteNegation` takes `directObject` as a positional argument and is called from the declarative,
  the verb-final protasis, the relative clause, the command, the instruction and the infinitive, so
  the complements have to be threaded to all six call sites.

**Decision for the fixer:** with **two** complements where only one is `no`, the per-conjunct rule
says downgrade only the negative one. Confirm that reading, and that a `no` complement alongside a
`no` **object** (both postverbal) collapses to one negator rather than downgrading both phrases.

| | |
|---|---|
| **Test** | `complements/determiner.test.ts` → *known bugs: a negative complement is not collapsed* (2 `test.fails`, plus a regression test that a lone `no` complement and the five concord languages are unchanged) |
