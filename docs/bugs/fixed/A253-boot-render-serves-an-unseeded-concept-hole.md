# A253. A boot-time render serves the hole an unseeded concept leaves

**Package:** backend (`packages/backend/src/definitions.ts`, `packages/backend/src/uiStrings.ts`)

The engine renders a concept the lexicon cannot find as an empty **word**, in every slot — subject,
object and complement alike (`the  speaks.`, `the woman eats the.`, `the woman speaks like the.`).
That is its contract, and `/api/translate` turns it into a `400 Unknown concept: …` by noting every id
the engine asks for that has no concept row. The two renders done at boot — the engine-composed
definitions ([`buildConceptDefinitions`](../../../packages/backend/src/definitions.ts)) and the
UI-string bundle ([`buildUiStrings`](../../../packages/backend/src/uiStrings.ts)) — only refuse a
plan when a whole **language** comes back empty, though their error names the cause they are meant
to catch ("Check the concepts its plan references are seeded"). A plan whose unseeded concept is one
word among others boots, and serves the hole.

| Case | Now | Want |
|---|---|---|
| a definition plan: the WOMAN SPEAKs like a UNICORN (unseeded) | boots; tooltip `the woman speaks like the` (en), 女はのように話します (ja) | boot fails naming `UNICORN` |
| a UI-string plan, the same | boots; serves `the woman speaks like the.` | boot fails naming `UNICORN` |

**Why this target and not the engine's.** Dropping the complement in
[`resolveComplements`](../../../packages/engine/src/translator/functions/resolveComplements.ts)
(it skips only a phrase with no `concept` at all) would make a complement behave unlike a missing
subject or object, which render the same blank; and a dropped complement is a silently wrong
sentence instead of a blank one. The consistent behaviour is the one `/api/translate` already has:
refuse the plan and name the concept. The boot renders should use the same noting lookup.

**Already right.** `/api/translate` rejects the plan (`400 {"error":"Unknown concept: WIND"}`, checked
for the manner complement that met this), and the index test *every plan the app renders itself is
accepted* posts every shipped definition and UI-string plan through it, so the suite fails before an
unseeded concept can ship. The boot check is the one that should catch it on its own, and does not.

**Nothing shipped shows it**: the index test above guards the shipped plans.

Pinned by `known bugs: a boot render serves the hole an unseeded concept leaves (A253)` in
[definitions.test.ts](../../../packages/backend/src/definitions.test.ts) and
[uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts).

Found shipping [P09-E2](../../features/Z-Done/P09-core-vocabulary/Z-done/P09-E2-complement-types.md),
where a manner complement naming the unseeded WIND rendered `like the`.

## Resolved

2026-09-23. The noting lookup `/api/translate` built inline moved into
[`notingLookup`](../../../packages/backend/src/lexicon.ts), which hands back a lookup and the set of
ids it was asked for that have no concept row. `/api/translate`
([index.ts](../../../packages/backend/src/index.ts)) and both boot renders now share it:
[`buildConceptDefinitions`](../../../packages/backend/src/definitions.ts) throws
`Definition for "<id>" names unknown concept: UNICORN. Seed them, or change the plan.`, and
[`buildUiStrings`](../../../packages/backend/src/uiStrings.ts) throws
`UI string "<key>" names unknown concept: UNICORN. Seed them, or change its entry.`, for every entry
kind that takes a lookup (plans and the five lookup-taking word kinds), before the whole-language
check runs. Every shipped definition and UI string still boots against the seeded corpus.

Guarded by the formerly-`.fails` tests in `known bugs: a boot render serves the hole an unseeded
concept leaves (A253)` in [definitions.test.ts](../../../packages/backend/src/definitions.test.ts) and
[uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts), plus new cases there for the
unseeded id in subject, object and complement position, several unseeded ids named at once, a `word`
entry naming one, and every shipped plan still booting; and by `notingLookup` in
[lexicon.test.ts](../../../packages/backend/src/lexicon.test.ts).
