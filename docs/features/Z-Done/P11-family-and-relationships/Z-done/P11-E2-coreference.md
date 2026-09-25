# P11-E2. Coreference — a possessor that is a link, not a bundle of features

**Construct:** "**his** mother", where *he* is the speaker's brother; and Japanese 自分の for a
possessor that is the clause's own subject. From [P11](../README.md)'s *Out of scope* follow-ups.
**Shape:** a possessor that **points at a slot** instead of carrying features of its own. One new
possessor kind, and two constructs that already exist start reading it.
**Scope:** all 7 languages for the Japanese half; Japanese alone for the kin half — but the model
change is shared, which is why they are one task.
**Status:** **shipped, 2026-09-24**, plan-only — in the engine for all seven languages; see
[Done](#done). Split out of P11's follow-ups on 2026-09-23.

| plan | today | wanted |
|---|---|---|
| the cat sees its own book (ja) | 猫は自分の本を見ます (only if OWN is selected) | 猫は自分の本を見ます, from the coreference alone |
| my brother's mother (ja) | 兄のお母さん | 兄の**母** — his mother is mine too |
| the man sees his (own) mother | er sieht seine Mutter | unchanged in six; ja 男性は自分の母親を見ます |

**Proposed, not engine output.** What the engine writes is in [Done](#done).

## Done

Shipped 2026-09-24, **plan-only**: no builder control yet — the frontend only learnt to step over the
new kind where it walks a plan's possessors (`getNoun`). D1 and D2 landed first, D3 as a second
commit. Pinned in [`test/coreference.test.ts`](../../../../../packages/engine/test/coreference.test.ts)
(the link in all seven, with OWN, through a chain, a complement, a command and a relative clause, and
the refusals), D3's rows in [`test/kinship.test.ts`](../../../../../packages/engine/test/kinship.test.ts)
(`describe('whose family it is, read through a possessor linked to the subject')`), the binding in
[`bindCoreferents.test.ts`](../../../../../packages/engine/src/translator/functions/bindCoreferents.test.ts),
and the 400 in [`planError.test.ts`](../../../../../packages/backend/src/planError.test.ts).
`kinship.test.ts`'s existing rows, `possessivePronoun.test.ts` and `possession.test.ts` pass
unchanged, and **all 485 composed definitions render byte-for-byte as before in all seven** (dumped at
the base and after each commit, and diffed).

| lang | the cat sees its book | the cat sees its own book | my older brother sees his mother | the boy sees his mother | the man sees his own mother | my older brother's mother runs |
|---|---|---|---|---|---|---|
| en | the cat sees its book. | the cat sees its own book. | my older brother sees his mother. | the boy sees his mother. | the man sees his own mother. | my older brother's mother runs. |
| it | il gatto vede il suo libro. | il gatto vede il suo proprio libro. | il mio fratello maggiore vede sua madre. | il ragazzo vede sua madre. | l'uomo vede la sua propria madre. | la madre del mio fratello maggiore corre. |
| fr | le chat voit son livre. | le chat voit son propre livre. | mon frère aîné voit sa mère. | le garçon voit sa mère. | l'homme voit sa propre mère. | la mère de mon frère aîné court. |
| de | der Kater sieht sein Buch. | der Kater sieht sein eigenes Buch. | mein älterer Bruder sieht seine Mutter. | der Junge sieht seine Mutter. | der Mann sieht seine eigene Mutter. | die Mutter meines älteren Bruders läuft. |
| es | el gato ve su libro. | el gato ve su propio libro. | mi hermano mayor ve a su madre. | el niño ve a su madre. | el hombre ve a su propia madre. | la madre de mi hermano mayor corre. |
| pt | o gato vê o seu livro. | o gato vê o seu próprio livro. | o meu irmão mais velho vê a sua mãe. | o menino vê a sua mãe. | o homem vê a sua própria mãe. | a mãe do meu irmão mais velho corre. |
| ja | 猫は自分の本を見ます。 | 猫は自分自身の本を見ます。 | 兄は自分の母を見ます。 | 男の子は自分のお母さんを見ます。 | 男は自分自身のお母さんを見ます。 | 兄の母は走ります。 |

Beside them, all engine output: "die Frau sieht **ihr** Buch" (German reads the noun's own gender
through the link); "the cat and the dog see **their** book", 猫と犬は自分の本を見ます; "I see my book",
私は自分の本を見ます; 猫は自分の母を見ます (a cat is no one to be polite to); "the cat sees its mother's
book", 猫は自分の母の本を見ます; 兄は自分の母の夫を見ます (own one link further down); "see your book",
自分の本を見てください; and a relative clause's link naming its head, "the man who sees his mother runs",
*der Mann, der seine Mutter sieht, läuft*, 自分のお母さんを見る男は走ります. `POST /api/translate` answers
the kin and plain-noun plans with the rows above, and a link inside the subject with a 400.

What landed, and where it differs from the plan below:

1. **The type** (D1, §1): `CoreferentPossessor` `{ kind: 'coreferent'; slot: 'subject' }` joins
   `Possessor`, with D4's doc comment, and `isCoreferentPossessor` beside `isPronominalPossessor`.
2. **The link is bound before its phrase resolves, not inside `resolveNounPhrase`** (§2). The new
   [`bindCoreferents.ts`](../../../../../packages/engine/src/translator/functions/bindCoreferents.ts)
   turns the subject's resolved agreement into a `BoundPossessor` — a `PronominalPossessor` (person,
   number, gender **in this language**) marked `coreferent`, carrying the subject's `human` and `own`
   — and swaps it into the object and the complements (through possessor chains and standards, never
   into a relative clause). `resolvePhrase` already resolved the subject first; it now binds the rest
   to it. Being a pronominal possessor to every engine is what makes the six need **no change at
   all**.
3. **Gender in a language whose nouns have none** (en, ja): the gender the plan states on the subject,
   else neuter for a non-person ("its"), else none, which is the unmarked "his" a pronominal
   possessor without a gender already writes. A person's natural gender is not guessed, as
   `antecedentAgreement` does not guess it (see *Leads*).
4. **`possessorBound` is unchanged.** Japanese asks the resolved possessor instead
   (`isBoundPossessor`): [`ja/npSegs.ts`](../../../../../packages/engine/src/languages/ja/npSegs.ts)
   writes 自分 (from the new `ja/reflexivePossessor.ts`, engine-written as the possessive pronouns
   are) with の, and OWN on top of it takes the route it takes after any named owner — 自身の — so
   the pair is 自分自身の. OWN on a *pronominal* possessor is still 自分の in its place (C37).
5. **Every clause binds to its own subject.** A relative clause binds to its `subject`, or, for a
   subject relative, to the head it modifies (its forms final by then, `own` and all); a content, an
   infinitive, a purpose, a condition and a coordinate bind in their own `resolvePhrase`. A command's
   subject is its addressee, so "your".
6. **The fallback is a refusal by name**, as A267 and A273 refuse: a link inside the subject it points
   at ("a coreferent possessor points at the subject, so it cannot stand in the subject itself") —
   which covers a verbless period — and one in a phrase no clause holds. `planError` names the first
   case by path: `plan.subject.possessor: a coreferent possessor cannot stand in the subject it points
   at`, the linked clauses' and relative clauses' subjects too. No clause in the plan model lacks a
   subject (A267), so there is no subjectless case to default.
7. **D3 needed only the link**: `applyPossessorForm` reads a bound possessor's `own` beside the 1st
   person, and its `human` in place of the person/gender guess. The early return for an indefinite or
   bare **genitive** possessor is untouched, so 親の母親 and every kin definition stand. A link to an
   indefinite subject is a possessive pronoun and keeps the pronoun's forms ("un garçon voit sa
   femme").
8. **The task's "today" row for *my brother's mother* did not reproduce**: the genitive chain already
   gave 兄の母 at the base (P11 carries `own` through a genitive). What was missing was the *his* of
   "my brother sees his mother", which is now 兄は自分の母を見ます; both are pinned. The third row's
   Japanese is 男は自分自身のお母さんを見ます: MAN's ja word is 男, and a man's mother is someone else's,
   so お母さん, not 母親 (which is nobody's).

Leads, not fixed here:

- **English "the woman sees his book"** when the plan states no gender on WOMAN: English nouns
  record no natural gender, so the link falls back to *his*, exactly as a pronominal possessor
  pointing at WOMAN without the gender pick does today.
- **Under the passive the link still names the plan's subject** (the demoted agent): "his book is read
  by the man" binds *his* to the man, while Japanese 自分 prefers the grammatical subject.

## Why

P11's D3 decides whose a relative is by looking at the possessor's **features** — person, and
whether it is the speaker. That is enough for "my mother" and "your mother" and wrong for everything
in between. P11 says so itself: *"his mother", where he is the speaker's brother, counts as someone
else's under D3, because the possessor carries features, not a link.* So 兄のお母さん — "my brother's
honoured mother" — where a speaker would say 兄の母, because his mother is the speaker's mother.

The same missing link is why Japanese 自分の must be chosen by hand. C37 seeded OWN_ADJECTIVE and
[`possessorBound`](../../../../../packages/engine/src/functions/possessorBound.ts) renders it, but
nothing knows that a possessor *is* the subject — the speaker has to say so.

## Today

Verified in the working tree on 2026-09-23 (P11's own work was uncommitted then).

- [`Possessor`](../../../../../packages/shared/src/index.ts#L822) is
  `NounPhrase | PronominalPossessor` — a phrase or a person/number bundle. **Neither can refer to
  anything**; there is no identity in the model at all.
- `forms['own']` is set from those features
  ([`applyPossessorForm.ts`](../../../../../packages/engine/src/translator/functions/applyPossessorForm.ts)),
  which is the mechanism P11 says is too weak.
- C37's OWN_ADJECTIVE works and is **speaker-selected**: `possessorBound` tells the engines a
  possessor is bound, and
  [`ja/npSegs.ts:45`](../../../../../packages/engine/src/languages/ja/npSegs.ts#L45) knows that 自分の
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

`Possessor` widened ([L822](../../../../../packages/shared/src/index.ts#L822)), with a doc comment
saying what D4 says: a slot link, not a referent, and `'subject'` only.
`isPronominalPossessor`'s siblings gain a `isCoreferentPossessor` guard in the same shape.

## 2. Translator

[`resolveNounPhrase.ts`](../../../../../packages/engine/src/translator/functions/resolveNounPhrase.ts)
already resolves the possessor **first**; a coreferent one instead resolves against the clause's
subject, which means the subject must be resolved before any phrase that refers to it. Check the
order there — P11 changed it, and this task depends on it.

[`possessorBound.ts`](../../../../../packages/engine/src/functions/possessorBound.ts) answers `true` for
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
- **A builder control** for the link (this task is plan-only).
