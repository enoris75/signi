# A177. An English object pronoun that is the subject itself is not reflexive

**Language:** English

A 1st- or 2nd-person object with the subject's person and number is the subject itself. "I" and
"me" are the one speaker. English then requires the reflexive pronoun: `I see myself`, not `I see
me`. The plan has no reflexive of its own, but for these persons the engine does not need one. A
1st-person singular object under a 1st-person singular subject can only be coreferent, and the 2nd
person and the plurals read the same way by default.

Italian, French, German, Spanish and Portuguese already read it that way, because their object
pronoun doubles as the reflexive: `mi vedo`, `je me vois`, `ich sehe mich`, `me veo`, `me vejo`. English prints the plain
object form ([`objectPronounForm`](../../../packages/engine/src/functions/objectPronounForm.ts)) in
[`predicateParts.ts`](../../../packages/engine/src/languages/en/predicateParts.ts), whatever the
subject is.

| Case | Now | Want |
|---|---|---|
| 1st singular | `I see me.` | `I see myself.` |
| 1st plural | `we see us.` | `we see ourselves.` |
| 2nd singular | `you see you.` | `you see yourself.` |
| 2nd plural | `you see you.` | `you see yourselves.` |
| command | `see you.` | `see yourself.` |
| under a modal | `I must see me.` | `I must see myself.` |
| negated past | `I did not see me.` | `I did not see myself.` |
| a phrasal verb | `I put me out.` | `I put myself out.` |
| in a coordination | `I see me and the cat.` | `I see myself and the cat.` |
| the random phrase | `you are about to perceive you with the phrase repeatedly.` | `you are about to perceive yourselves with the phrase repeatedly.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** A person or number that differs from the subject's (`I see us.`, `we see me.`, `I
see you.`). The 3rd person, where `he sees him` is two people and the plan has no way to say
"himself". Italian, French, German, Spanish and Portuguese (`vi state per percepire`, `vous êtes sur le point de vous
percevoir`, `ihr seid im Begriff, euch … zu empfinden`, `os estáis a punto de percibir`, `vos estão
prestes a perceber`).

Found by the random phrase "you are about to perceive you with the phrase repeatedly." (seed 942889).

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine suite green.

In `predicateParts.ts`, render a pronoun object whose `person` is `1` or `2` and whose person and
number match `subjectForms` as `myself` / `ourselves` / `yourself` / `yourselves`, in place of
`objectPronounForm`. `particleAfterPronoun` has to find the same word, or the particle stays in
front (`put out myself`). The trial routes both through one helper. `subjectForms` is the clause's
subject agreement, and a command's subject is the addressee, so `see yourself` comes out with no
extra work. The four words could be seeded as a `reflexive` form on the pronouns, as `disjunctive`
is.

**Decisions for the fixer:**

- **The passive agent.** `I am seen by me.` goes through `agentPhrase` and is left alone by the
  trial. Coreference there is the same (`by myself`). Not pinned.
- **Japanese.** `私は私を見ます。` and `あなたたちはあなたたちを知覚するところです。` are grammatical but
  stilted. `自分` (`私は自分を見ます`) is the natural reflexive. Not pinned.

| | |
|---|---|
| **Test** | `objectPronoun.test.ts` → *known bugs: an English object that is the subject itself* (2 `test.fails`, plus a regression test for the persons and languages already right) |

## Resolved

2026-09-21. Took the shape of the fix. The four words live in the lexicon, and the passive agent
is covered too.

- **The lexicon.** [`pronouns.ts`](../../../packages/backend/src/concepts/pronouns.ts) seeds
  `reflexive` / `reflexive_plural` on the English `FIRST_PERSON` (`myself` / `ourselves`) and
  `SECOND_PERSON` (`yourself` / `yourselves`), next to `object` / `object_plural`. Form keys are
  free rows in `pronoun_forms`, and no type, schema or seed check lists them, so nothing else
  declares them. `THIRD_PERSON` gets none, because the plan cannot say "himself". The English unit
  fixtures ([`en.fixtures.ts`](../../../packages/engine/src/languages/en/en.fixtures.ts)) carry the
  same forms. The running app needs `signi.db` reseeded to pick them up.
- **One helper.** The new
  [`en/objectPronounText.ts`](../../../packages/engine/src/languages/en/objectPronounText.ts)
  returns the reflexive when the pronoun's `person` is `1` or `2` and its person and number match
  the clause's subject agreement (`subjectForms`). Otherwise it returns `objectPronounForm`.
  [`predicateParts.ts`](../../../packages/engine/src/languages/en/predicateParts.ts) calls it for
  each conjunct of the direct object (`I see myself and the cat`). `particleAfterPronoun` calls it
  too, so the particle still finds the pronoun (`I put myself out`). `subjectForms` is agreement,
  so several cases need no extra work: a coordinated subject (`the cat and I see ourselves`), a
  command (`see yourself`, `let's see ourselves`) and a controlled infinitive (`I desire to see
  myself`).
- **The passive agent: handled.** `predicateParts` already holds the passive subject's agreement
  where it calls `agentPhrase`. [`agentPhrase.ts`](../../../packages/engine/src/languages/en/agentPhrase.ts)
  now takes that agreement as an optional second argument and spells a pronoun through the same
  helper: `I am seen by myself`, `you are seen by yourselves`. `relativeText`'s `by whom` passes no
  agreement. The other European languages were already right (`da me`, `par moi`, `von mir`, `por
  mí`, `por mim`).
- **Japanese 自分.** Out of scope and not pinned. `私は私を見ます。` stays.

- **Tests:** [`packages/engine/test/objectPronoun.test.ts`](../../../packages/engine/test/objectPronoun.test.ts)
  → *known bugs: an English object that is the subject itself*. Both pinning `test.fails` are now
  passing `test`s, with their assertions unchanged. New cases:
  - the reflexive follows the subject agreement: a coordinated subject, the cohortative, a plural
    and a negated command, a particle verb in a command, a question, the progressive, an `or`
    group object, a conditional, and a controlled infinitive in the six European languages;
  - a passive agent that is the subject itself, in all four persons and all seven languages for
    the 1st singular. The same test also covers a coordinated agent and keeps the object form for a
    differing person or number and for the 3rd person (`he is seen by him`).
- **Unit tests:**
  - [`en/objectPronounText.test.ts`](../../../packages/engine/src/languages/en/objectPronounText.test.ts)
    is new;
  - [`en/agentPhrase.test.ts`](../../../packages/engine/src/languages/en/agentPhrase.test.ts) is
    new, because the function had none;
  - `en/predicateParts.test.ts` adds a reflexive case under *objects*: the four persons, a command,
    the passive agent, a group, a particle verb, and the object form kept where the person or
    number differs.
