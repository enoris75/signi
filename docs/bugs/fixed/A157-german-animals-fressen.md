# A157. A German animal eats with "essen", not "fressen"

**Language:** German (a corpus entry, not the grammar)

German has two verbs for eating, and the choice is obligatory: a person *isst*, an animal *frisst*.
Using *essen* of an animal is either an error or deliberate anthropomorphism, and using *fressen* of a
person is an insult. EAT is seeded with *essen* alone
([`concepts/verbs/transitive.ts`](../../../packages/backend/src/concepts/verbs/transitive.ts)), so every
animal in the corpus eats like a person — and the stock subject of most of the app's examples is a cat.

| Clause | Now | Want |
|---|---|---|
| CAT EAT the MOUSE | `der Kater isst die Maus.` | `der Kater frisst die Maus.` |
| CATs EAT the MOUSE | `die Kater essen die Maus.` | `die Kater fressen die Maus.` |
| the same, past | `der Kater aß die Maus.` | `der Kater fraß die Maus.` |
| the same, resultative | `der Kater hat die Maus gegessen.` | `der Kater hat die Maus gefressen.` |
| the same, future | `der Kater wird die Maus essen.` | `der Kater wird die Maus fressen.` |
| the same, MUST | `der Kater muss die Maus essen.` | `der Kater muss die Maus fressen.` |
| relative: the CAT that EATs the MOUSE RUNs | `der Kater, der die Maus isst, läuft.` | `der Kater, der die Maus frisst, läuft.` |
| WOLF EAT the FOOD | `der Wolf isst das Essen.` | `der Wolf frisst das Essen.` |

Already right: a person (`der Junge isst das Essen`), a pronoun subject (`er isst`, which carries no
animacy and stays the person's verb), a command (`iss die Maus` — the addressee is a 2nd person), and
the other six languages, which have one verb (`the cat eats`, `il gatto mangia`).

Found while probing the German output of a random phrase review; it is not in the three phrases
themselves ([A153](A153-italian-animate-source-reads-as-goal.md)–[A156](A156-english-direction-adverb-after-complements.md)).

## Shape of the fix

The sense machinery A131 built for KNOW, one step over: there the **object** picks the verb, here the
**subject** does.

1. Seed a hidden sense, `EAT_ANIMAL`, `senseOf: 'EAT'`, with the German paradigm — *fressen*, *frisst*
   (2sg and 3sg, strong e→i), *fraß*, the imperative *friss*, and `participle: 'gefressen'` in
   [`nonfinite.ts`](../../../packages/backend/src/concepts/verbs/nonfinite.ts). Being a sense it is left
   out of `GET /api/concepts`, so no picker offers a second "eat". Only German needs an entry; the other
   languages never ask for it.
2. Name it from EAT's German lexeme with a new form key beside `object_sense` — say `subject_sense`.
3. [`resolveVerbPhrase`](../../../packages/engine/src/translator/functions/resolveVerbPhrase.ts) takes
   `hasObject` today. Give it the subject's forms too, and resolve to `subject_sense` when the subject
   is an animal. [`resolvePhrase`](../../../packages/engine/src/translator/functions/resolvePhrase.ts)
   passes the plan's subject;
   [`resolveRelativeClause`](../../../packages/engine/src/translator/functions/resolveRelativeClause.ts)
   passes its own subject, or the head noun when the gap is the subject.

**Which subjects are animals** is the part to decide. `animate && !human` is what the forms carry
today, but it over-reaches: CREATOR and POSSESSOR are `animate` and not `human`, and are glossed
"someone or something". (ANGEL was the other one; [A148](../fixed/A148-angel-not-a-person.md) has since
set its flag.) The clean rule
is the hierarchy — CAT `isA` MAMMAL `isA` ANIMAL, while CREATOR `isA` PERSON — but `lookupNoun` threads
only the **immediate** hypernym into `forms['isA']`, so the engine cannot walk the chain. Either thread
an `animal` flag computed from the chain at lookup time, or add the concept-level flag to the seed.

**Expect a large re-record.** Over 300 pinned German lines have an animal eating: about 145 in
[`hypothetical.test.ts.snap`](../../../packages/engine/test/__snapshots__/hypothetical.test.ts.snap),
the rest across `modals`, `verb`, `relative`, `nounPhrase` and `negation`. They are all the same
substitution, and nothing but the verb changes.

Out of scope, and worth a decision of their own:

- **DRINK.** *saufen* is the animal verb, but *trinken* is used of animals without any oddity, and
  *saufen* of a person means "booze". Leaving DRINK alone is defensible.
- **FOOD.** An animal's food is *Futter*, not *Essen*, so `der Wolf frisst das Essen` is still off in
  the noun. That is the same rule on the object side, and needs a noun sense.

| | |
|---|---|
| **Test** | `clause.test.ts` → *known bugs: a German animal "frisst"* (2 `test.fails`, plus a regression test for a person, a pronoun, a command and the other six) |

## Resolved

Fixed on 2026-09-20 with the sense machinery A131 built for KNOW, one argument over — there the
object picks the verb, here the subject:

1. A hidden `EAT_ANIMAL` sense, `senseOf: 'EAT'`, with the German paradigm — *fressen*, *frisst*
   (2sg and 3sg, strong e→i), *fraß*, the imperative *friss*, and `participle: 'gefressen'` in
   [`nonfinite.ts`](../../../packages/backend/src/concepts/verbs/nonfinite.ts). Being a sense it is
   left out of `GET /api/concepts`, so no picker offers a second eat.
2. `subject_sense: 'EAT_ANIMAL'` on EAT's German lexeme, beside `object_sense`.
3. [`resolveVerbPhrase`](../../../packages/engine/src/translator/functions/resolveVerbPhrase.ts)
   takes the subject's forms and resolves to `subject_sense` when they say `animal`.
   [`resolvePhrase`](../../../packages/engine/src/translator/functions/resolvePhrase.ts) passes the
   plan's subject and
   [`resolveRelativeClause`](../../../packages/engine/src/translator/functions/resolveRelativeClause.ts)
   its own, or the head noun (threaded from `resolveNounPhrase`) where the gap is the subject.

**Which subjects are animals** is the hierarchy, as the file hoped:
[`lexicon.ts`](../../../packages/backend/src/lexicon.ts) walks the WHOLE is-a chain in one recursive
query and sets `forms['animal']`. CAT isA MAMMAL isA ANIMAL counts; ANGEL, CREATOR and POSSESSOR do
not, so `animate && !human` never had to be used.

**One case the file did not name.** A top-level **citation** (`plan.infinitive`) carries a throwaway
subject the plan never renders, and `infinitive.test.ts` pins that any subject renders the same — so
the German citation of EAT must stay 'essen'. `resolvePhrase` takes a `citation` flag from
`translate` and withholds the subject there. An infinitive **complement** is the opposite case: its
subject is the governing clause's, by subject control, so it does follow it ('der Hund wünscht, das
Essen zu fressen').

Guarded by `clause.test.ts` → *known bugs: a German animal frisst*: both former `test.fails` now
pass, plus the ANIMAL genus against ANGEL and CREATOR, an object relative reading its own subject,
the citation keeping 'essen' and the infinitive complement following its controller; the regression
for a person, a pronoun, a command and the other six is unchanged. `lexicon.test.ts` pins the
`animal` flag and the `subject_sense` lookup, and `concepts/index.test.ts` checks every
`subject_sense` names a sense of the verb that names it.

**Re-record, as expected:** about 470 pinned German lines across `verb`, `modals`, `relative`,
`adjectives`, `nounPhrase`, `negation` and the rest, 145 of them in
[`hypothetical.test.ts.snap`](../../../packages/engine/test/__snapshots__/hypothetical.test.ts.snap)
and 44 in `verb.conjugation.test.ts.snap`; every one is the same substitution. Twelve e2e
expectations moved with them.

Still out of scope, as the file has them: DRINK (*saufen*), and FOOD as an animal's *Futter*.
