# P11-F2. Coreference — a possessor that is a link, not a bundle of features

**Construct:** "**his** mother", where *he* is the speaker's brother; and Japanese 自分の for a
possessor that is the clause's own subject. From [P11](README.md)'s *Out of scope* follow-ups.
**Shape:** a possessor that **points at a slot** instead of carrying features of its own. One new
possessor kind, and two constructs that already exist start reading it.
**Scope:** all 7 languages for the Japanese half; Japanese alone for the kin half — but the model
change is shared, which is why they are one task.
**Status:** planning, unscheduled. Split out of P11's follow-ups on 2026-09-23.

| plan | today | wanted |
|---|---|---|
| the cat sees its own book (ja) | 猫は自分の本を見ます (only if OWN is selected) | 猫は自分の本を見ます, from the coreference alone |
| my brother's mother (ja) | 兄のお母さん | 兄の**母** — his mother is mine too |
| the man sees his (own) mother | er sieht seine Mutter | unchanged in six; ja 男性は自分の母親を見ます |

**Proposed, not engine output.**

## Why

P11's D3 decides whose a relative is by looking at the possessor's **features** — person, and
whether it is the speaker. That is enough for "my mother" and "your mother" and wrong for everything
in between. P11 says so itself: *"his mother", where he is the speaker's brother, counts as someone
else's under D3, because the possessor carries features, not a link.* So 兄のお母さん — "my brother's
honoured mother" — where a speaker would say 兄の母, because his mother is the speaker's mother.

The same missing link is why Japanese 自分の must be chosen by hand. C37 seeded OWN_ADJECTIVE and
[`possessorBound`](../../../../packages/engine/src/functions/possessorBound.ts) renders it, but
nothing knows that a possessor *is* the subject — the speaker has to say so.

## Today

Verified in the working tree on 2026-09-23 (P11's own work is uncommitted here).

- [`Possessor`](../../../../packages/shared/src/index.ts#L822) is
  `NounPhrase | PronominalPossessor` — a phrase or a person/number bundle. **Neither can refer to
  anything**; there is no identity in the model at all.
- `forms['own']` is set from those features
  ([`applyPossessorForm.ts`](../../../../packages/engine/src/translator/functions/applyPossessorForm.ts)),
  which is the mechanism P11 says is too weak.
- C37's OWN_ADJECTIVE works and is **speaker-selected**: `possessorBound` tells the engines a
  possessor is bound, and
  [`ja/npSegs.ts:45`](../../../../packages/engine/src/languages/ja/npSegs.ts#L45) knows that 自分の
  *replaces* a pronominal possessor rather than joining it (自分の猫, never 彼の自分の猫). So the
  rendering is built; only the automatic binding is missing.
- Nothing anywhere links a noun phrase to another slot of the same plan — not a relative clause's
  gap (that is a *gap*, not a reference), not a coordination, not a complement.

## Design

### D1. A third possessor kind, `{ kind: 'coreferent', slot }`

**Recommendation:** widen `Possessor` with a kind that names a slot of the governing clause —
`'subject'` to begin with, which is the only one either half of this task needs. The resolver then
resolves it against that slot's already-resolved phrase and gets its features, its animacy and, for
P11, its `own` mark, for free.

`'subject'` only, in a first pass. An object-coreferent possessor ("shows the cat its own book") is
the same field with a second value and is worth deferring until something asks for it.

### D2. Japanese binds automatically; the other six do not

A subject-coreferent possessor is 自分の in Japanese **whether or not** the speaker marks emphasis,
and it is an ordinary possessive in the other six: *sein*, *son*, *suo*, *su*, *seu*, *his*. The six
have an emphatic form (*his own*, *il proprio*, *sein eigener*) and that is what C37's
OWN_ADJECTIVE already selects.

**Recommendation: the coreferent possessor renders as 自分の in Japanese and as a plain possessive in
the other six**, and C37's adjective stays what it is — the *emphasis*, selectable on top. The two
must not collide: a coreferent possessor **with** OWN is 自分自身の, not 自分の自分の.

This is the one place the task can break something that works, and `possessorBound` is where it
happens.

### D3. The kin chain reads through the link, and that is the P11 half

Once the possessor can be resolved to the subject, `applyPossessorForm` can ask the real question:
*is this relative in the speaker's family?* — rather than *is this possessor the speaker?* "My
brother's mother" is own because the brother is own; "the boy's mother" is not.

P11 already carries the chain one link at a time (`own: possessor.head.forms['own'] === '1'`), so
**the machinery is there and the input is what is missing**. A coreferent possessor is the general
case of that input.

**Recommendation: ship D1 and D2 first, and D3 as a second change** — it touches P11's landed
behaviour and its 38 composed definitions, and it should not ride along with a model change.

### D4. What this is not

It is not anaphora. Nothing here resolves "he" to a referent introduced earlier, tracks discourse, or
gives a noun phrase an identity across sentences. It is one link, inside one clause, to one named
slot — the smallest thing that answers both of P11's questions.

## 1. Shared types

`Possessor` widened ([L822](../../../../packages/shared/src/index.ts#L822)), with a doc comment
saying what D4 says: a slot link, not a referent, and `'subject'` only.
`isPronominalPossessor`'s siblings gain a `isCoreferentPossessor` guard in the same shape.

## 2. Translator

[`resolveNounPhrase.ts`](../../../../packages/engine/src/translator/functions/resolveNounPhrase.ts)
already resolves the possessor **first**; a coreferent one instead resolves against the clause's
subject, which means the subject must be resolved before any phrase that refers to it. Check the
order there — P11 changed it, and this task depends on it.

[`possessorBound.ts`](../../../../packages/engine/src/functions/possessorBound.ts) answers `true` for
a coreferent possessor as well as for OWN (D2), and the two together must give 自分自身の.

## 3. Per-engine rendering

Japanese only, and only through `possessorBound` — `npSegs` already does the replacing. The other
six render the resolved features as they do any possessive, so they should need **no change at all**;
a test proves it.

## 4. Tests

- `test/possession.test.ts`: a coreferent possessor in all seven — unchanged in six, 自分の in ja.
- Coreferent + OWN together → 自分自身の (D2).
- `test/kinship.test.ts`: 兄の母 against 男の子のお母さん (D3), and the 38 existing glosses unchanged.
- A definition with an indefinite possessor still takes no honorific — the narrowing P11's seeding
  found, which this task must not undo.

## Verification

1. Rebuild `@signi/shared` and `@signi/engine`.
2. Engine and backend suites green; typecheck clean. **P11's `kinship.test.ts` is the regression
   surface** — it holds both of P11's tables and every word's forms.
3. `POST /api/translate` with a coreferent possessor on a kin head and on a plain noun.

## Out of scope (follow-ups)

- **Object coreference** (D1), and coreference to a complement.
- **Anaphora across sentences** (D4).
- **Reciprocals** ("each other"), which look related and are a different construct.
- **Japanese 自分 as a pronoun** in its own right ("I", in some registers).
