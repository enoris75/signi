# P09-E28. *Yet* and *ever* — the polarity forms of ALREADY and NEVER

**Construct:** the form a frequency adverb takes under negation (*not yet*) and in a question (*ever*).
**Shape:** *yet* is lexicon data on ALREADY through the shipped `negative` / `negative_slot` keys, plus
one Japanese aspect rule; *ever* needs a new form key read in interrogatives.
**Scope:** all 7 languages.
**Status:** planning, unscheduled. Filed 2026-09-24 from
[P09-E24](Z-done/P09-E24-ranks-201-400.md)'s §3.
**Words:** *ever* (rank 240), *yet* (292).

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
  ([`adverbs.ts:448`](../../../../packages/backend/src/concepts/adverbs.ts#L448)).
- [`negativeAdverb`](../../../../packages/engine/src/functions/negativeAdverb.ts) already reads a
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
