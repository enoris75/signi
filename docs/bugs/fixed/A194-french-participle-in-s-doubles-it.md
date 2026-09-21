# A194. A French participle ending in -s doubles it in the masculine plural

**Language:** French

A French past participle agrees like an adjective, and an adjective already ending in *-s* has no
separate masculine plural: *un mot compris* / *des mots **compris***, never *compriss*. The feminine
is regular, because the *-e* comes first: *comprise* / *comprises*.

[`agreeParticipleFr`](../../../packages/engine/src/languages/fr/agreeParticipleFr.ts) appends the
plural *-s* unconditionally. Every French participle in the corpus ends in a vowel or *-t*
(*mangé*, *vu*, *ouvert*) except three — INCLUDE *inclus*, UNDERSTAND *compris*, ACQUIRE *acquis* —
and all three come out with a doubled *-s* in the masculine plural.

Three callers agree a participle, and the defect follows the function into all of them: the
passive ([`predicateText`](../../../packages/engine/src/languages/fr/predicateText.ts), which agrees
with the promoted patient), the *être*-selecting compound past
([`aspectVerbFr`](../../../packages/engine/src/languages/fr/aspectVerbFr.ts),
[`verbGroupInfinitiveFr`](../../../packages/engine/src/languages/fr/verbGroupInfinitiveFr.ts)), and
the *avoir* participle agreeing with a preceding clitic object. The three verbs are transitive and
take *avoir*, so what shows today is the passive and the preceding object.

| Case | Now | Want |
|---|---|---|
| WORD plural, UNDERSTAND, passive | `les mots sont compriss par le chat.` | `les mots sont compris par le chat.` |
| MEANING plural, INCLUDE, passive | `les sens sont incluss par le chat.` | `les sens sont inclus par le chat.` |
| WORD plural, ACQUIRE, passive | `les mots sont acquiss par le chat.` | `les mots sont acquis par le chat.` |
| … past | `les mots furent compriss par le chat.` | `les mots furent compris par le chat.` |
| … future | `les mots seront compriss par le chat.` | `les mots seront compris par le chat.` |
| … resultative | `les mots ont été compriss par le chat.` | `les mots ont été compris par le chat.` |
| … negative | `les mots ne sont pas compriss par le chat.` | `les mots ne sont pas compris par le chat.` |
| … MUST | `les mots doivent être compriss par le chat.` | `les mots doivent être compris par le chat.` |
| … in a relative clause | `les mots qui sont compriss par le chat courent.` | `les mots qui sont compris par le chat courent.` |
| a preceding clitic object, masc. plural | `le chat les a compriss.` | `le chat les a compris.` |

Every **Want** was rendered by a trial fix applied to HEAD, not written by hand, and reverted after.

**Already right.** The feminine, in both numbers — the *-e* separates the two *-s* (`la phrase est
comprise par le chat.`, `les phrases sont comprises par le chat.`, and the preceding object `le chat
les a comprises.`). The masculine singular (`le mot est compris par le chat.`). Every participle that
does not end in *-s* (`les chiens sont vus par le chat.`, `la nourriture est mangée par le chat.`,
`le livre est ouvert par le chat.`). The *être* compound past, whose participles are all vowel-final
(`les chats sont allés.`). The other six languages, which either inflect the participle regularly
(`le parole sono comprese dal gatto.`, `las palabras son comprendidas por el gato.`, `as palavras são
compreendidas pelo gato.`) or not at all (`the words are understood by the cat.`, `die Wörter
werden vom Kater verstanden.`, `単語は猫に理解されます。`).

**Nothing shipped shows it.** The 5,180 strings the app ships — every concept `definition` from
`buildConceptDefinitions` and every entry of `buildUiStrings`, in all seven languages — render
byte-identically at HEAD and under the trial fix. HYPERNYM's gloss, the one that uses INCLUDE, is
active, and B50's passive example has a feminine plural patient (*les maisons sont incluses par le
mot*), which was already right.

Found while seeding MEANING and INCLUDE ([B50](../../localization/done/B50-meaning-include.md),
"A French defect the probe found, outside this gloss"), which reported it for the catalogue without
filing it.

## Shape of the fix

Verified by applying it to HEAD. It renders every **Want** above, leaves `npm run typecheck` and the
whole unit suite green (8,808 passing, 23 expected failures), and moves no passing test.

In [`agreeParticipleFr`](../../../packages/engine/src/languages/fr/agreeParticipleFr.ts), build the
feminine first and add the plural *-s* only when the form does not already end in one:

```ts
const stem = `${base}${fem ? 'e' : ''}`;
return plural && !/[sxz]$/.test(stem) ? `${stem}s` : stem;
```

**Decisions for the fixer:**

- **`-x` and `-z`.** The trial guards them with the `-s`, because the rule is the same for every
  adjective and participle in French, and *vieux*, *doux*, *nez* behave that way. No seeded participle
  ends in either today, so the guard is unobserved. Keep it or drop it; the pinned cases do not
  depend on it.
- **Where the rule belongs.** `agreeAdjFr` has the same problem waiting for it — an adjective whose
  masculine singular ends in *-s* or *-x* (*gros*, *heureux*) would double it too. None is seeded, so
  it is not filed. If the fix moves the rule into a shared "add the plural -s" helper, both callers
  get it at once.

| | |
|---|---|
| **Test** | `voice.test.ts` → *known bugs: a French participle in -s doubles it in the masculine plural* (2 `test.fails` — the passive of the three verbs across the tenses, aspects, negation, a modal and a relative clause; and the *avoir* participle agreeing with a preceding clitic object — plus a regression test for the feminine, the singular, the other participles and the other six languages) |

## Resolved

2026-09-21. Took the shape above.

[`agreeParticipleFr`](../../../packages/engine/src/languages/fr/agreeParticipleFr.ts) builds the
feminine stem first and adds the plural *-s* only where the stem does not already end in a sibilant:

```ts
const stem = `${base}${fem ? 'e' : ''}`;
return plural && !/[sxz]$/.test(stem) ? `${stem}s` : stem;
```

All three callers — the passive `predicateText`, the *être* compound past (`aspectVerbFr`,
`verbGroupInfinitiveFr`) and the *avoir* participle agreeing with a preceding clitic object — go
through that one function, so the fix reaches every one of them.

The two **Decisions for the fixer** were ruled as follows:

- **`-x` and `-z`:** kept. The invariability is one rule for every French sibilant, and the regex
  costs nothing. No seeded participle ends in either, so it is pinned only at unit level.
- **Where the rule belongs:** left in `agreeParticipleFr`. The bug file expected `agreeAdjFr` to
  have the same defect waiting, but it already guards it (`if (f.endsWith('s') || f.endsWith('x'))
  return f;` — *mauvais*, *heureux*), so there is no second caller to share a helper with. The
  participle now states the rule the same way the adjective does, and says so in its doc comment.

**Tests guarding it.** `packages/engine/test/voice.test.ts` → *known bugs: a French participle in -s
doubles it in the masculine plural*: both former `test.fails` are now plain passing tests, with
their assertions unchanged — the passive of the three verbs across the tenses, aspects, negation, a
modal and a relative clause, and the *avoir* participle after a preceding clitic object — beside the
regression test for the feminine, the singular, the other participles and the other six languages.

Added at unit level, in
[`agreeParticipleFr.test.ts`](../../../packages/engine/src/languages/fr/agreeParticipleFr.test.ts):
*compris* / *inclus* / *acquis* invariable in the masculine plural against the regular feminine
(*comprise* / *comprises*), and the unobserved `-x` / `-z` guard.

No passing test changed its expectation.
