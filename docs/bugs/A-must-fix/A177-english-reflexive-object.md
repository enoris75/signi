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
