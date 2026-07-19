# B07 (was C02). Scalar adjective definitions

**Reclassified from C02 (`C-needs-engine`) → B (`needs-seed`).** The engine construct C02 was blocked
on — an **adjective-definition gloss** render mode — has since landed and is pinned in all seven
languages, so the remaining work is data, not engine:

- Plan field [`NounPhrase.dimensionGloss`](../../../packages/shared/src/index.ts) and the
  [`DimensionRelation`](../../../packages/shared/src/index.ts) it reads.
- A render branch in every engine (en/it/fr/es/pt/de/ja), each with its own adposition table —
  e.g. [en.ts](../../../packages/engine/src/languages/en.ts),
  [it.ts](../../../packages/engine/src/languages/it.ts),
  [ja.ts](../../../packages/engine/src/languages/ja.ts) (が-predicate, no adposition).
- Pinning tests, 7 languages: [adjective-gloss.test.ts](../../../packages/engine/test/adjective-gloss.test.ts).

The construct renders a **verbless** subject marked `dimensionGloss` — a *dimension noun* carrying a
*degree adjective* — as a prepositional fragment whose adposition the noun's `dimensionRelation`
selects: "of great size" / "di grande dimensione" / "von großer Größe" / "速さが高い". The degree
adjective agrees with and is positioned against the dimension noun by the ordinary noun-phrase path.

## Scope — the scalar adjectives only

Of the 58 catalogued adjectives, only the **scalar** ones (a point on a measurable dimension) fit
this shape. The rest are **out of scope for this task**:

- **Emotion / bodily state** (HAPPY, SAD, TIRED, HUNGRY → "feeling joy") — not a scalar dimension;
  needs a participial/copular construct + emotion nouns. Still deferred → track as a new C.
- **Qualitative / relational** (MALE, CANINE, WILD, DOMESTIC, BROWN, ROUND, WRITTEN, BEAUTIFUL,
  INTERESTING, NEW, WHOLE, SEMANTIC, …) — these are themselves the *differentiae* other concepts use;
  a self-standing definition is either literal or its own construct.
- **Grammar-technical** (SINGULAR, PLURAL, NEUTER, DEFINITE, INDEFINITE, PROXIMAL, DISTAL, FIRST,
  SECOND, THIRD, IMPERSONAL, ZERO, MULTAL, PAUCAL, UNIVERSAL, PARTITIVE, NEGATIVE) — stay on the
  English literal, like the C05 meta-nouns; no distinguishing scalar gloss exists.

## Seed first — done

The dimension nouns for the poles below are all seeded (SIZE, HEIGHT, QUALITY, STRENGTH, AGE, and
now `TEMPERATURE` — [nouns.ts](../../../packages/backend/src/concepts/nouns.ts); SPEED too), as are
the degree adjectives (GREAT, HIGH, LOW, SMALL). **The Seed-first blocker is cleared** — `TEMPERATURE`
(`dimensionRelation: 'measure'`, "at high/low temperature") was seeded 2026-07-19 — so B07 is now an
**A**: every adjective below is authorable.

**One caveat blocks the five low-pole adjectives' French:** bug
[A43](../../bugs/A-must-fix/A43-french-bas-feminine.md) — French renders LOW's feminine as "base"
instead of "basse", so LOW / BAD / WEAK / YOUNG / COLD would gloss as "à … base". Author the
**high-pole** adjectives (degree GREAT/HIGH) now; hold the low-pole ones until A43 is fixed, or their
French will be wrong.

## Unlocks

Each definition is a verbless `dimensionGloss` plan:
`{ subject: { concept: <DIM>, definiteness: 'bare', adjectives: [<DEGREE>], dimensionGloss: true } }`.

All dimension nouns and degrees are seeded, so the "status" column is only about the A43 caveat:
high-pole (GREAT/HIGH) rows are **ready** now; low-pole (LOW) rows wait on the French fix.

| adjective | dimension noun | degree | gloss (en) | status |
|---|---|---|---|---|
| BIG | SIZE | GREAT | of great size | ready |
| HIGH | HEIGHT | GREAT | of great height | ready |
| LOW | HEIGHT | LOW | of low height | ⚠ A43 (fr LOW) |
| GOOD | QUALITY | HIGH | of high quality | ready |
| BAD | QUALITY | LOW | of low quality | ⚠ A43 (fr LOW) |
| OLD | AGE | GREAT | of great age | ready |
| YOUNG | AGE | LOW | of low age | ⚠ A43 (fr LOW) |
| STRONG | STRENGTH | GREAT | of great strength | ready |
| WEAK | STRENGTH | LOW | of low strength | ⚠ A43 (fr LOW) |
| QUICK | SPEED | HIGH | of high speed | ready |
| HOT | TEMPERATURE | HIGH | at high temperature | ready |
| COLD | TEMPERATURE | LOW | at low temperature | ⚠ A43 (fr LOW) |

Notes:
- SMALL is left off — "of small size" is tautological (SMALL is the degree). Define it, if at all,
  only once a non-circular wording is chosen; the same caution applies to any adjective that would
  reuse itself as its own degree.
- Author one adjective at a time via [`/localize-seed`](../../../.claude/skills/localize-seed/SKILL.md)
  once this is an A (add the `definition` in
  [adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts), boot to render all 7
  languages, add e2e coverage).
