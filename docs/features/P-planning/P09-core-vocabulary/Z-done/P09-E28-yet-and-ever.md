# P09-E28. *Yet* and *ever* — the polarity forms of ALREADY and NEVER

**Construct:** the form a frequency adverb takes under negation (*not yet*) and in a question (*ever*).
**Shape:** *yet* is lexicon data on ALREADY through the shipped `negative` / `negative_slot` keys, plus
one Japanese aspect rule; *ever* needs a new form key read in interrogatives.
**Scope:** all 7 languages.
**Status:** **shipped, 2026-09-24** — D1–D4 as ruled; see [Done](#done). Filed 2026-09-24 from
[P09-E24](P09-E24-ranks-201-400.md)'s §3.
**Words:** *ever* (rank 240), *yet* (292).

## Done

Shipped 2026-09-24. ALREADY carries its negative forms (D1) and Japanese its resultative negative
(D2); NEVER carries an `interrogative` form read in a question that is not denied (D3), Japanese
いつか among them (D4). Engine output at the shipping commit:

| lang | the cat has **not yet** eaten | …the food (present, negated) | has the cat **ever** eaten? | does the cat ever eat the food? |
|---|---|---|---|---|
| en | the cat has not eaten yet. | the cat does not eat the food yet. | has the cat ever eaten? | does the cat ever eat the food? |
| it | il gatto non ha ancora mangiato. | il gatto non mangia ancora il cibo. | il gatto ha mai mangiato? | il gatto mangia mai il cibo? |
| fr | le chat n'a pas encore mangé. | le chat ne mange pas encore la nourriture. | est-ce que le chat a déjà mangé ? | est-ce que le chat mange déjà la nourriture ? |
| de | der Kater hat noch nicht gefressen. | der Kater frisst das Essen noch nicht. | hat der Kater je gefressen? | frisst der Kater je das Essen? |
| es | el gato todavía no ha comido. | el gato todavía no come la comida. | ¿el gato ha comido alguna vez? | ¿el gato come alguna vez la comida? |
| pt | o gato ainda não comeu. | o gato ainda não come a comida. | o gato comeu alguma vez? | o gato come alguma vez a comida? |
| ja | 猫はまだ食べていません。 | 猫は食べ物をまだ食べていません。 | 猫はいつか食べましたか？ | 猫は食べ物をいつか食べますか？ |

What landed:

- **Backend.** ALREADY ([`adverbs.ts`](../../../../../packages/backend/src/concepts/adverbs.ts)): en
  `negative: 'yet'` + `negative_slot: 'final'`, it *ancora*, fr *encore*, de *noch* + `pre-negator`,
  es *todavía* + `pre-negator`, pt *ainda* + `pre-negator`, ja まだ + `negative_aspect:
  'resultative'`. NEVER: `interrogative` *ever, mai, déjà, je, alguna vez, alguma vez*, いつか.
- **Engine.** A new translator step,
  [`interrogativeAdverb`](../../../../../packages/engine/src/translator/functions/interrogativeAdverb.ts)
  (`negativePolarity`'s mirror), called from `resolvePhrase`: in a question (yes/no, wh- or
  indirect) whose clause is not negated, it swaps the main verb's adverb to its `interrogative`
  surface and drops its `polarity` (and a `reading` the new word does not share). German
  [`adverbSlots`](../../../../../packages/engine/src/languages/de/adverbSlots.ts) and Portuguese
  `predicateText` now write the adverb's `negative` word in the `pre-negator` slot (they wrote the
  base, which ALSO and STILL never noticed because neither has a German or Portuguese negative
  word). Spanish `predicateText` gained the `pre-negator` slot. Japanese `predicateSegs` writes the
  `negative` word and reads `negative_aspect`.
- **Tests.** `negation.test.ts` *P09-E28: not yet* (the perfect with and without an object, the
  present, the past, the progressive, the copula, a negated question, the affirmative, Spanish
  *tampoco* unmoved); `questions.test.ts` *P09-E28: ever* (perfect, present and past in seven, a
  wh-question, an indirect question, a negated question and a statement keep *never*); unit tests
  for `interrogativeAdverb` and the German slot.
- **Definitions.** Every shipped definition was rendered before and after in all seven languages
  (3,395 lines): none moved.

What landed differently from the plan:

1. **Spanish takes `negative_slot: 'pre-negator'`, not D1's `pre-negation`.** Spanish
   `pre-negation` is the slot of a word that *carries* the negation and drops the clause's "no"
   (*tampoco come*), so D1 as written rendered "el gato todavía ha comido", which is affirmative.
   *Todavía* leads the "no" and keeps it, and that is `pre-negator`'s definition ("immediately in
   front of the negator word"). The Spanish engine had no `pre-negator` branch, so it gained one.
2. **The German and Portuguese `pre-negator` slot wrote the base word**, not the `negative` one:
   "der Kater hat schon nicht gefressen", "o gato já não comeu". Both now write the `negative` word
   where the lexeme names one.
3. **Portuguese asks "o gato comeu alguma vez?", not the table's "o gato já comeu alguma vez?".**
   The *já* is a second word in a second slot (the Portuguese frequency slot is after the verb, so
   ALREADY itself says "comeu já"); *comeu alguma vez* is grammatical and says the same. A two-word
   interrogative is left for later.
4. **No slot key for *ever* was needed.** Spanish and Portuguese frequency adverbs already stand
   after the verb group ("ha comido alguna vez"), which is the table's position; with an object the
   phrase stands between the verb and the object ("¿el gato come alguna vez la comida?"), which
   reads well.
5. **French *déjà* in a present question** ("est-ce que le chat mange déjà la nourriture ?") leans to
   "already"; *jamais* is the literary alternative. D3 names *déjà*, and it is right in the perfect,
   the case the table asks.
6. **Japanese 〜ている applies to a plain verb only**: the copula and the existential have no
   〜ている to give, and a modal governs its own form. The copula keeps its own predicate and takes
   まだ (猫はまだ疲れていません, the engine's existing form of the verb-derived 疲れた).
7. **One existing expectation changed**: `interrogative.test.ts` *a frequency adverb follows the
   do-support; a manner adverb trails* pinned NEVER asked as "does the cat never eat?", "est-ce que
   le chat ne mange jamais ?", 猫は決して食べませんか？; it now pins *ever*, *déjà*, いつか.
8. **Not covered, a limit shared with ALSO and STILL**: an adverb on a verb whose negation a modal
   governs ("the cat can not eat the food yet") keeps its positive word in six languages, because
   the negation there is `governedNegative`, which `negativeAdverb` does not read.

## The plan as filed

| lang | the cat has **not yet** eaten (proposed) | engine at 1229928 (ALREADY negated) | has the cat **ever** eaten? (proposed) |
|---|---|---|---|
| en | the cat has not eaten yet | the cat has not already eaten ✗ | has the cat ever eaten? |
| it | il gatto non ha ancora mangiato | il gatto non ha già mangiato ✗ | il gatto ha mai mangiato? |
| fr | le chat n'a pas encore mangé | le chat n'a pas déjà mangé ✗ | est-ce que le chat a déjà mangé ? |
| de | der Kater hat noch nicht gefressen | der Kater hat nicht schon gefressen ✗ | hat der Kater je gefressen? |
| es | el gato todavía no ha comido | el gato no ha comido ya ✗ | ¿el gato ha comido alguna vez? |
| pt | o gato ainda não comeu | o gato não comeu já ✗ | o gato já comeu alguma vez? |
| ja | 猫はまだ食べていません | 猫はもう食べていません ✗ ("no longer") | 猫は食べたことがありますか？ |

**Proposed** in the first and third columns; the middle column is the engine's output.

## Why

*Not yet* and *ever* are how English says ALREADY and NEVER in the other polarity, and every language
has a word for it. Today the negated ALREADY renders *not already* in all seven, which is wrong in six
and turns Japanese into *no longer*.

## Today

Verified at 1229928, 2026-09-24.

- ALREADY's forms are `base` + `subtype: 'frequency'` only
  ([`adverbs.ts:448`](../../../../../packages/backend/src/concepts/adverbs.ts#L448)).
- [`negativeAdverb`](../../../../../packages/engine/src/functions/negativeAdverb.ts) already reads a
  lexeme's `negative` (the surface) and `negative_slot` (`pre-negation | pre-negator | final`): ALSO
  says *either* at the end in English and *auch nicht* in German, and STILL *toujours* before *pas* in
  French (A244, A245).
- Probed: NEVER in a question writes "has the cat never eaten?", *il gatto non ha mai mangiato?*, and
  Japanese 猫は決して食べていませんか, which is the negative question, not *ever*.

## Design

### D1. *Yet* as ALREADY's negative form

**Recommendation: lexicon only**, on the shipped keys: en `negative: 'yet'`, `negative_slot:
'final'` (ALSO's *either*); it `negative: 'ancora'`; fr `negative: 'encore'`; de `negative: 'noch'`,
`negative_slot: 'pre-negator'`; es `negative: 'todavía'`, `negative_slot: 'pre-negation'` (*todavía
no*); pt `negative: 'ainda'`, `negative_slot: 'pre-negator'` (*ainda não*); ja `negative: 'まだ'`. It
is a B-sized change, and its Japanese is not.

### D2. Japanese *mada* wants the resultative negative

まだ食べていません, with 〜ていない, where the plain negative (まだ食べません) is "won't eat yet". **Recommendation: a
Japanese rule** that an adverb whose lexeme says `negative_aspect: 'resultative'` puts the negated verb
in 〜ている. ALREADY is the only lexeme that needs it today.

### D3. *Ever* in a question

*Ever* is NEVER's positive, question-only form: *mai* (it), *déjà* (fr, the question sense), *je* (de),
*alguna vez* (es), *alguma vez* (pt), and Japanese 〜たことがある (an experiential construction, not
an adverb). **Recommendation:** a new form key `interrogative` on NEVER, read when the clause is a
question **and not negated**, so that NEVER in a positive question says *ever*. Japanese needs the
experiential 〜たことがある, and that is **deferred** (D4).

### D4. Japanese experiential

〜たことがありますか is a verb construction, not a word. **Recommendation: defer it**, and let Japanese
write the plain question with いつか ("at some time") meanwhile: 猫はいつか食べましたか.

## Engine

- Backend: ALREADY's negative forms (D1); NEVER's `interrogative` forms (D3).
- `negativeAdverb`'s sibling for the interrogative form; the ja rule of D2.

## Tests

`negation.test.ts` (*not yet* in seven, perfect and present) and `questions.test.ts` (*ever* in six,
ja いつか).

## Verification

Engine suite green. Re-render every shipped definition: none uses ALREADY negated or NEVER in a
question, so none should move.

## Out of scope (follow-ups)

- **Japanese 〜たことがある** (D4).
- ***Ever* in a comparative** ("bigger than ever") and in *whoever / wherever* — later.
