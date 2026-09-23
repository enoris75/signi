# P11-E1. Japanese honorific and humble verbs

**Construct:** the verb register Japanese picks from **whose** the subject is — お母さんが
いらっしゃいます against 母が参ります. The first of [P11](../README.md)'s *Out of scope* follow-ups.
**Shape:** a lexeme-level suppletion in Japanese only, keyed on a mark the engine **already sets**:
`forms['own']`, which D3 put on a `kin` head one link at a time.
**Scope:** Japanese alone. The other six languages change nothing — this is the same asymmetry P11
itself had.
**Status:** shipped 2026-09-24. Split out of P11's follow-ups on 2026-09-23.

| plan | ja today | ja wanted |
|---|---|---|
| your mother is (here) | あなたのお母さんがいます | あなたのお母さんが**いらっしゃいます** |
| your mother eats | あなたのお母さんが食べます | あなたのお母さんが**召し上がります** |
| my father comes | 父が来ます | 父が**参ります** |
| the cat eats | 猫が食べます | 猫が食べます (unchanged) |

**Proposed, not engine output.** The engine's output is in *Done* below.

## Done

Shipped 2026-09-24. Engine and corpus together; the humble is **plan-only** (no builder control yet).
Pinned in [`test/honorific-verbs.test.ts`](../../../../../packages/engine/test/honorific-verbs.test.ts),
with the two ja units
[`jaRespectRegister`](../../../../../packages/engine/src/languages/ja/jaRespectRegister.ts) (whose the
subject is) and [`jaRespectVerb`](../../../../../packages/engine/src/languages/ja/jaRespectVerb.ts)
(the register's paradigm swapped in). Every concept `definition` renders the same in Japanese as
before (a before/after dump of all 486), and `kinship.test.ts` passes unchanged.

| plan | ja |
|---|---|
| your mother is (at home) | あなたのお母さんは家に**いらっしゃいます**。 |
| your mother eats | あなたのお母さんは**召し上がります**。 |
| my father comes | 父は来ます。 |
| my father comes, `humble` | 父は**参ります**。 |
| the cat eats | 猫は食べます。 (unchanged) |

The verbs and their words, each citing its dictionary sense in a comment on the lexeme:

| verb | 尊敬語 `honorific` | 謙譲語 `humble` |
|---|---|---|
| BE (the existential いる) | いらっしゃる | おる |
| GO, COME | いらっしゃる | 参る |
| EAT, DRINK | 召し上がる | いただく |
| DO | なさる | いたす |
| SAY | おっしゃる | 申す |
| GIVE (あげる) | — | 差し上げる |

What landed differently from the plan below:

1. **A column is a small paradigm, not one word.** `honorific` is the dictionary form, and beside it
   `honorific_masu_present`, `honorific_te` and `honorific_nai` (the same four for `humble`), each
   with a `_reading` where the word has kanji. The ます stem of these verbs is irregular
   (いらっしゃいます, なさいます), so it cannot be derived from the dictionary form. The te and nai forms
   are what the progressive, the たら and the modal suffixes build on (召し上がっています,
   いらっしゃったら, 召し上がりたいです).
2. **BE's pair lives on the engine's いる** (`JA_IRU` in `ja.consts.ts`), not on BE's lexeme. BE's
   Japanese lexeme is the copula です, and the existential いる is a word the engine puts in its place.
   The copula itself (でいらっしゃる) stays out of scope, as §Out of scope says.
3. **"Someone else's" means what the noun already decided.** The verb is honorific exactly where
   `applyPossessorForm` gives the noun its honorific: a `kin` head that is not `own`, whose possessor
   is a person in particular (a 2nd person, a 3rd person that isn't neuter, or a definite human
   noun). A kin subject with no possessor (母親), an animal's (猫の母) or a kind of person's (子供の母親)
   keeps the plain verb. A coordinated subject is raised only when every conjunct is.
4. **GIVE has no honorific, and RECEIVE is not seeded.** くださる is the honorific of くれる (giving
   *towards* the speaker), not of あげる. GET is 手に入れる, which has no suppletive pair, and no もらう
   verb is seeded.
5. **Plain means more than the `plain` flag.** Besides every clause built plain (relative, content,
   adverbial), a citation or purpose clause (`mood: 'infinitive'`), a command, a passive and a
   causative keep the plain verb: each of them swaps in another verb (〜られる, 〜させる, する). The たら of
   an "if" clause and a yes/no question take the register (もしあなたのお母さんがいらっしゃったら).
6. **The humble flag reaches Japanese through the translator.** `VerbPhrase.humble` is copied onto
   `ResolvedVerbPhrase.humble` in `resolveVerbPhrase` (one line). The Japanese clause decides whether
   the subject lets it apply.
7. **Tests** are in the new `honorific-verbs.test.ts`, not in `kinship.test.ts`. It covers the four
   rows, every verb's pair, the conjugations, the negatives and the furigana (めしあがります,
   まいります, もうします, and no reading left over the kana いらっしゃる / いただく).

## Why

P11 taught the noun phrase whose relative it is — 母 against お母さん — and stopped at the noun. The
verb carries the same distinction in Japanese, and a sentence that honours the possessor and then
uses the plain verb is inconsistent in a way a speaker hears: あなたのお母さんが食べます pairs a
respectful noun with a neutral verb.

It is the follow-up P11 named first, and the one whose groundwork is already laid.

## Today

Verified in the working tree on 2026-09-23, before this task shipped (P11 has since been committed).

- [`applyPossessorForm.ts`](../../../../../packages/engine/src/translator/functions/applyPossessorForm.ts)
  sets `forms['own'] = '1'` on a `kin` head whose possessor is one's own, and carries the chain down
  (`own: possessor.head.forms['own'] === '1'`) — "my older brother's wife" is own all the way.
- **There is no verb register anywhere.** No honorific, humble or polite-suppletion field on a
  lexeme, and no branch in the Japanese verb path: `grep -rn "honorific" packages/engine/src/languages/ja`
  returns nothing outside the noun phrase.
- Japanese already distinguishes **plain** from **polite** (the `plain` flag threaded through
  [`buildClauseSegments`](../../../../../packages/engine/src/languages/ja/buildClauseSegments.ts#L29)),
  but that is a register of the *sentence*, not of the referent, and it is not this axis.

## Design

### D1. Three registers, not two

Japanese has two directions of politeness and they are not each other's opposite:

- **尊敬語 (honorific)** raises the *subject*: いらっしゃる (for いる / 行く / 来る), 召し上がる (食べる /
  飲む), なさる (する), おっしゃる (言う).
- **謙譲語 (humble)** lowers the *speaker's side*: 参る (行く / 来る), いただく (食べる / もらう),
  申す (言う), いたす (する).
- **丁寧語 (polite)** is the ます-form the engine already writes, and is orthogonal to both.

So the mark that chooses is not "polite or not" but **whose the subject is**: someone else's →
honorific, one's own → humble, neither → plain. `forms['own']` answers exactly that question, and
answers it only for kin — which is this task's scope and its limit (D3).

### D2. The words are suppletive, so they are lexemes

None of the six is derived: 食べる → 召し上がる is not a rule. **Recommendation: two Japanese lexeme
columns, `honorific` and `humble`**, on the verb, beside the noun columns P11 added (`possessed`,
`honorific`, `kin`, `with_<ADJECTIVE>`) — and *named the same way*, since a verb's `honorific` is the
same idea as a noun's. A verb naming neither keeps its plain form, which is what every verb in the
corpus does today.

The regular fallback (お+stem+になる / お+stem+する) is **out of scope**: it is productive, and every
verb this task touches has a suppletive form that a speaker would use instead.

### D3. Only a kin subject triggers it, in a first pass

`forms['own']` is set on a `kin` head only. That is the right scope for a first pass — P11's whole
subject matter — but it is not the general rule: a teacher, a customer or a superior takes the
honorific too, and none of them is kin.

**Recommendation: ship the kin trigger and name the general one as the follow-up.** Widening it
means a social-deixis feature on any human noun, which is a feature of its own and not P11's.

### D4. The humble form needs a listener, and the engine has none

参る is humble *towards someone*. With no addressee modelled, 父が参ります is only correct in a
context the engine cannot see — a plain 父が来ます is never wrong, where the honorific on someone
else's mother is close to obligatory.

**Recommendation: ship the honorific and make the humble opt-in**, not automatic on `own`. The
asymmetry is real Japanese, not a shortcut: raising the other party is the unmarked courtesy, and
lowering one's own is a register the speaker chooses.

## 1. Corpus

`honorific` (and `humble`, D4) on the Japanese lexemes of the verbs that have one: BE / GO / COME,
EAT, DRINK, DO, SAY, GIVE, RECEIVE. About eight verbs, all seeded.

Record the columns in the [seed skill](../../../../../.claude/skills/seed/SKILL.md)'s *A verb's
language-specific columns*, where P11 recorded the noun's five.

## 2. Engine

One branch in the Japanese verb path, reading `forms['own']` off the resolved **subject** and
selecting the column. The mark is already on the subject by the time the clause is built — the
translator sets it during noun-phrase resolution — so nothing new is threaded.

Furigana: the honorific forms need their readings (いらっしゃる, めしあがる, まいる), which the
existing reading columns carry.

## 3. Tests

- `test/kinship.test.ts` gains the four rows of the table above.
- A negative: a non-kin subject (猫, 男性) keeps the plain verb (D3).
- A plain-form clause (a definition, a relative clause) keeps the plain verb — an honorific inside a
  tooltip would be wrong, and the `plain` flag is where that is decided.
- `test/furigana.test.ts` for the new readings.

## Verification

1. `npm run seed`, then rebuild `@signi/shared` and `@signi/engine` — the backend runs both dists.
2. Engine and backend suites green; typecheck clean.
3. In the browser (5173): MOTHER with a 2nd-person possessor and BE → いらっしゃいます; with a
   1st-person possessor → います (D4).

## Out of scope (follow-ups)

- **Social deixis beyond kin** (D3) — a teacher, a customer, a superior.
- **The productive お+stem+になる / お+stem+する** (D2).
- **Automatic humble** (D4), which needs an addressee in the model — the same gap
  [P11-E3](../P11-E3-address-and-the-vocative.md) runs into from the other side.
- **Honorific adjectives and copulas** (でいらっしゃる).
