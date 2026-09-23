# A275. An object relative with no subject reads as a subject relative

**Package:** engine (translator), backend (`/api/translate`), frontend (`buildRelativeClause`)

A relative clause whose gap is not its subject needs a subject of its own. The head is its object, a
complement or a possessor, and `RelativeClause.subject` is documented as "present when headRole !==
'subject'" ([shared](../../../packages/shared/src/index.ts)). Nothing enforces that. Without a
subject, the engine renders the clause as a subject relative, and the meaning flips. The head
becomes the one who acts. No error is raised, and `/api/translate` serves it as a 200.

| Case | Now | Want |
|---|---|---|
| the CAT (object gap: [?] EATs it) RUNs | `the cat that eats runs.`, `il gatto che mangia corre.`, `der Kater, der isst, läuft.`, 食べる猫は走ります。 | refused: an `Error` naming the missing subject |
| the HOUSE (place gap: [?] EATs in it) BURNs | `the house where eats burns.`, `la maison qui mange brûle.`, `das Haus, in dem isst, brennt.` | refused |
| the CAT (possessor gap) RUNs | `the cat that eats runs.` | refused |
| `POST /api/translate`, the object and place gaps | `200` with the flipped sentence | `400`, an error naming the path (…`relative.subject…is required`) |
| the builder: a relative link onto a period's object while its subject box is empty | the object relative sent with no subject | nothing folded in until the subject has a word |

**Why refuse, and not fill in or passivize.** This is ruled, and consistent with
[A267](A267-linked-clause-with-no-subject-crashes-the-engine.md) and
[A273](A273-relative-clause-with-no-verb-phrase-crashes-the-engine.md): the plan is missing a field
the clause cannot do without. Filling in GENERIC_PERSON (*the cat that one eats*) would guess at a
subject the user never chose. The user can pick the generic person as the subject explicitly. Turning
the clause into a passive (*the cat that is eaten*) would change the construct. The one ruled out
outright is today's behaviour, a well-formed sentence that says the opposite. That is worse than A267's
crash, because nothing shows it.

**The builder reaches it.** [`canBeRelativeTarget`](../../../packages/frontend/src/components/PhraseBuilder/linkRules.ts)
needs only the gap noun filled, and
[`buildRelativeClause`](../../../packages/frontend/src/components/PhraseBuilder/workspacePlan/functions/buildRelativeClause.ts)
waits only for a verb. It copies `plan.subject` into a non-subject relative whether or not the subject
box holds a word. Linking a noun to the object of a period holding *eats the dog* with no subject
sends *the cat that eats*. [`attachSubordinate`](../../../packages/frontend/src/components/PhraseBuilder/workspacePlan/functions/attachSubordinate.ts)
already waits for a finite clause's subject, and a non-subject relative should wait the same way. A
subject relative needs no subject, because the head is its subject.

**Already right.** An object relative with its subject (`the cat that the dog eats runs.`, `le chat
que le chien mange court.`, `der Kater, den der Hund frisst, läuft.`) and the subject relative
(`the cat that eats runs.`).

**Shape of the fix.** Three changes. `resolveRelativeClause` throws a named `Error` for a
non-subject gap with no subject. `/api/translate` adds it to the walk A267 and A273 give it.
`buildRelativeClause` returns `undefined` for a non-subject gap whose period's subject has no head,
as it already does for a period with no verb.

**Where a user meets it**: through the builder, as described above. I did not check the shipped
glosses for it one by one.

Pinned by `known bugs: an object relative with no subject reads as a subject relative (A275)` in
[relative.test.ts](../../../packages/engine/test/relative.test.ts) and
[workspaceToPlans.test.ts](../../../packages/frontend/test/workspacePlan/functions/workspaceToPlans.test.ts),
and by `known bugs: an object relative with no subject is served (A275)` in
[index.test.ts](../../../packages/backend/src/index.test.ts).

Found while filing A265–A274, next to A273.

## Resolved

2026-09-23, refused as ruled, on [A267](A267-linked-clause-with-no-subject-crashes-the-engine.md)'s
and [A273](A273-relative-clause-with-no-verb-phrase-crashes-the-engine.md)'s checks.

- **Engine.** [`resolveRelativeClause`](../../../packages/engine/src/translator/functions/resolveRelativeClause.ts)
  throws a named `Error` for a gap other than the subject with no `subject`: `a relative clause
  whose head is its directObject needs a subject of its own: relative.subject.concept is required
  (A275)`. A subject relative needs none.
- **Backend.** [`planError`](../../../packages/backend/src/planError.ts) adds it to the relative
  walk: `plan.subject.relative.subject.concept is required`, for a missing subject or one with no head.
- **Builder.** [`buildRelativeClause`](../../../packages/frontend/src/components/PhraseBuilder/workspacePlan/functions/buildRelativeClause.ts)
  returns `undefined` for a non-subject gap while the period's subject has no head, as it does for a
  period with no verb.

Guarded by the formerly-`.fails` tests of the three `known bugs: … (A275)` blocks in
[relative.test.ts](../../../packages/engine/test/relative.test.ts),
[index.test.ts](../../../packages/backend/src/index.test.ts) and
[workspaceToPlans.test.ts](../../../packages/frontend/test/workspacePlan/functions/workspaceToPlans.test.ts),
and by cases in [resolveRelativeClause.test.ts](../../../packages/engine/src/translator/functions/resolveRelativeClause.test.ts),
[planError.test.ts](../../../packages/backend/src/planError.test.ts) and
[buildRelativeClause.test.ts](../../../packages/frontend/test/workspacePlan/functions/buildRelativeClause.test.ts).
Two unit fixtures that leaned on the flipped reading were given a subject: the locative gaps in
`resolveRelativeClause.test.ts` and the `sees` period of `attachInstrumental.test.ts`.
