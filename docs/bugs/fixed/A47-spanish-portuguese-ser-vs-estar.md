# A47. Spanish and Portuguese have one copula where they need two — `ser` vs `estar`

**Language:** Spanish, Portuguese

`BE` is seeded with a single lexeme per language, so es/pt get `ser` everywhere. Both languages
split the copula:

- **`ser`** — identity, class membership, inherent properties. *el gato **es** una leyenda*,
  *el gato **es** grande*.
- **`estar`** — location, and transient states. *el gato **está** en la casa*,
  *el gato **está** cansado*.

The engine never selects `estar` for a copula. It has the full `estar` paradigm already, but only
as the progressive/prospective auxiliary (`es.ts:258`), where nothing else can reach it.

## Locative — always wrong

Every `BE` + locative is ill-formed, whatever the noun and whatever the spatial relation:

| | Now | Want |
|---|---|---|
| Spanish | `el gato es en la casa.` | `el gato está en la casa.` |
| Portuguese | `o gato é na casa.` | `o gato está na casa.` |
| Spanish (`under`) | `el gato es debajo de la casa.` | `el gato está debajo de la casa.` |
| Portuguese (`behind`) | `o gato é atrás da casa.` | `o gato está atrás da casa.` |
| Spanish (past) | `el gato fue en la casa.` | `el gato estuvo en la casa.` |
| Portuguese (past) | `o gato foi na casa.` | `o gato esteve na casa.` |

This half is **mechanical**: a place is `estar`, unconditionally. No corpus change is needed — the
complement type alone decides it. The past inherits the choice and takes the preterite of `estar`
(`estuvo` / `esteve`), consistent with the simple-past-as-perfective mapping of **C6**.

Note the existing suite currently pins the *wrong* forms as expected — `locative.test.ts` asserts
`el gato es debajo de la casa` and `o gato é debaixo da casa` in its spatial-specifier block, and
the `LOCATIVE_VERBS` invariant covers `BE`. Those assertions must be corrected as part of the fix,
not just the `test.fails` below.

## Predicative — depends on what is ascribed

The predicative half does **not** reduce to the complement type. It splits on what the complement
ascribes:

| Complement | Copula | Today |
|---|---|---|
| predicate noun (`a legend`) | `ser` — always | ✅ `el gato es una leyenda.` |
| inherent property (`big`, `canine`, `male`) | `ser` | ✅ `el gato es grande.` |
| transient state (`tired`, `hungry`, `hot`, `sad`) | `estar` | ❌ `el gato es cansado.` → `está cansado` |

So the predicate-noun and inherent-adjective paths are already right, and only the transient
adjectives are wrong. `SEEM` is unaffected throughout — `parecer` is neither copula.

## Shape of the fix

Two independent pieces, and the locative one is worth doing alone:

1. **Locative → `estar`.** Entirely inside `es.ts` / `pt.ts`: when the verb is `BE` and the clause
   carries a `locative`, conjugate `estar`. Needs an `ESTAR` concept the mood/tense machinery can
   inflect the way `ESTAR_AUX` already is for aspect.

2. **Predicative → per-adjective.** Needs the **corpus** to say which adjectives are transient,
   because nothing in the current data distinguishes `grande` from `cansado`. A
   `stative?: boolean` (or `inherent | transient`) on `ConceptSeed`, defaulting to inherent, over
   the 58 seeded adjectives. A predicate NOUN keeps `ser` regardless and needs no marking.

The second piece has a wrinkle worth deciding before starting: a few adjectives take **both**, with
a meaning difference rather than a preference — `es feliz` ("is a happy person, by nature") vs
`está feliz` ("is happy right now"), and the same for `HAPPY`/`SAD`/`OLD`/`YOUNG`. A single boolean
forces one reading per adjective. That is probably the right MVP call — pick the commoner reading
and record the loss here — but it is a product decision, not a mechanical one.

Portuguese tracks Spanish closely enough that one classification serves both; the two languages'
`ser`/`estar` distributions differ only in edge cases none of the seeded corpus reaches.

| | |
|---|---|
| **Test** | `complements/locative.test.ts` → *known bugs: Spanish/Portuguese ser vs estar in a locative* (3 `test.fails`) · `complements/predicative.test.ts` → *known bugs: Spanish/Portuguese ser vs estar in a predicative* (1 `test.fails` + 1 regression) |

## Resolved

**2026-07-21.** Both halves fixed; the copula now splits `ser` / `estar` in Spanish and Portuguese.

**The engine.** A new `ESTAR_COPULA` concept in
[`es.ts`](../../../packages/engine/src/languages/es.ts) and
[`pt.ts`](../../../packages/engine/src/languages/pt.ts) — shaped exactly like the seeded BE (`ser`)
paradigm, so `conjugate` and `moodForm` inflect it identically (present/preterite/future by
person-number, the future stem driving the conditional, the 3pl preterite the subjunctive). In
`predicateText` the finite copula selects `ESTAR_COPULA` when the verb is `BE` **and** either:

- the clause carries a **locative** and no predicative — a place is `estar` unconditionally,
  whatever the spatial relation (a locative *alongside* a predicate nominal, "es una leyenda en la
  casa", is a mere adjunct and keeps `ser`); the past inherits the preterite ("estuvo" / "esteve"),
  consistent with the **C6** simple-past-as-perfective mapping; or
- the **predicative** complement is an adjective the corpus marks transient.

**The corpus.** A new concept-level `transient` flag (`stative` in the original write-up): a
`transient?: boolean` on `ConceptSeed`
([`concepts/types.ts`](../../../packages/backend/src/concepts/types.ts)), a `transient` column on
`semantic_concepts` with a migration ([`db.ts`](../../../packages/backend/src/db.ts)), threaded
through [`seed.ts`](../../../packages/backend/src/seed.ts) and surfaced onto adjective forms in
[`lexicon.ts`](../../../packages/backend/src/lexicon.ts). Ten of the 58 seeded adjectives are marked
transient in [`adjectives.ts`](../../../packages/backend/src/concepts/adjectives.ts): the physical
states TIRED / HUNGRY / COLD / HOT, the resultant-state participles WRITTEN / LOADED / SAVED /
HIDDEN, and the emotions HAPPY / SAD. Everything else defaults to inherent (`ser`).

**The one product decision** (the both-copula adjectives): emotions take the transient reading
("está feliz / triste"), age keeps the inherent one ("es viejo / é velho") — the commoner
predication of each. Recorded loss: a single boolean can't express "ser feliz" (a happy person by
nature) or "estar viejo" (looking aged); those readings are unavailable.

**Guarding it.** The 4 formerly-`test.fails` are now plain passing tests, with the spatial-specifier
block's mispinned `es`/`é` assertions corrected to `está`. Added coverage: estar agreement (plural
"están / estão") and the future ("estará"); SEEM keeps its own verb under a locative (no estar
leakage); the full transient class (hungry / cold / saved / written), the emotion-vs-age product
call, and a regression that an inherent adjective and BECOME are untouched by the split.
