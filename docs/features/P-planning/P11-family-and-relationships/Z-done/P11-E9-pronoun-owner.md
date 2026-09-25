# P11-E9. *My father comes* — a pronoun as a named owner

**Feature:** the canvas, keyboard and console control for a free-standing possessive pronoun: "**my**
mother runs", "**your** mother runs", "**my** son marries **your** daughter", where no *I* or *you*
stands elsewhere in the period. The engine renders the shared `PronominalPossessor` (person, number,
gender) in all seven languages. The builder writes one only when a possessor **points at** a pronoun
elsewhere in the period, so P11's own headline table cannot be built.
**Shape:** no engine grammar. The owner ring's word picker takes the pronoun tab that a conjunct's and
a standard's already have, and the plan writes a pronoun-headed owner as a `PronominalPossessor`. It
is never written as a genitive noun phrase. The gender chip is gated to the 3rd person. `/poss 1st` in
the console, with its print → apply round trip. `planToWorkspace` learns the pronominal possessor.
**Scope:** `@signi/phrase` (plan building, `planToWorkspace`, console resolve / apply / print), the
owner ring (`PhraseBuilder.tsx`, `rawSatellites.tsx`, `OwnerRings.tsx`), the pick keys, and console
completion. No new UI string, no seed, no engine change.
**Status:** **shipped, 2026-09-25** — see [Done](#done). Filed 2026-09-25; found while writing
[P11-E6](../P11-E6-humble-verb-control.md), whose *Out of scope* names the gap.
[P11-E7](P11-E7-coreferent-possessor-control.md) and [P11-E8](../P11-E8-vocative-control.md) record it
too.

Engine output at HEAD (1bb7c878), from hand-written plans. Rendered 2026-09-25 with `sayAll` on an
in-memory seed, with a clean working tree. Each owner is `{ kind: 'pronominal', person, number,
gender? }`:

| lang | my mother runs | your mother runs | our father runs | your (plural) mother runs | my son marries your daughter |
|---|---|---|---|---|---|
| en | my mother runs. | your mother runs. | our father runs. | your mother runs. | my son marries your daughter. |
| it | mia madre corre. | tua madre corre. | nostro padre corre. | vostra madre corre. | mio figlio sposa tua figlia. |
| fr | ma mère court. | ta mère court. | notre père court. | votre mère court. | mon fils épouse ta fille. |
| de | meine Mutter läuft. | deine Mutter läuft. | unser Vater läuft. | eure Mutter läuft. | mein Sohn heiratet deine Tochter. |
| es | mi madre corre. | tu madre corre. | nuestro padre corre. | vuestra madre corre. | mi hijo se casa con tu hija. |
| pt | a minha mãe corre. | a sua mãe corre. | o nosso pai corre. | a sua mãe corre. | o meu filho casa com a sua filha. |
| ja | 母は走ります。 | あなたのお母さんは走ります。 | 私たちの父は走ります。 | あなたたちのお母さんは走ります。 | 息子はあなたの娘さんと結婚します。 |

The third person, where gender is the only thing that varies (subject *I*, object BOOK):

| lang | his book (`masc`) | her book (`fem`) | its book (`neut`) | no gender | their books (`masc` or none) | their books (`neut`) |
|---|---|---|---|---|---|---|
| en | I see his book. | I see her book. | I see its book. | I see his book. | I see their books. | I see their books. |
| it | vedo il suo libro. | vedo il suo libro. | vedo il suo libro. | vedo il suo libro. | vedo i loro libri. | vedo i loro libri. |
| fr | je vois son livre. | je vois son livre. | je vois son livre. | je vois son livre. | je vois leurs livres. | je vois leurs livres. |
| de | ich sehe sein Buch. | ich sehe ihr Buch. | ich sehe sein Buch. | ich sehe sein Buch. | ich sehe ihre Bücher. | ich sehe ihre Bücher. |
| es | veo su libro. | veo su libro. | veo su libro. | veo su libro. | veo sus libros. | veo sus libros. |
| pt | vejo o seu livro. | vejo o seu livro. | vejo o seu livro. | vejo o seu livro. | vejo os seus livros. | vejo os seus livros. |
| ja | 私は彼の本を見ます。 | 私は彼女の本を見ます。 | 私はその本を見ます。 | 私は彼の本を見ます。 | 私は彼らの本を見ます。 | 私はそれらの本を見ます。 |

A feminine 3rd plural changes only Japanese: 彼女らの猫は走ります, while the other six are unchanged
("their cats run"). A gender on a 1st or 2nd person owner changes nothing in any language. This was
probed with 1sg, 1pl and 2pl, masc against fem: *nostro padre*, *vuestro padre*, *euer Vater*,
私たちの父 either way.

## Done

Shipped 2026-09-25, as D1–D8 recommend, with no engine change, no seed and no new UI string. Both
tables above are now **built**, not hand-written: every cell of the first, and the his / her / its /
their row of the second, renders byte-for-byte as shown from a console line put through
`applyScript` → `selectionToPlan` (pinned in
[`engine/test/pronoun-owner.test.ts`](../../../../../packages/engine/test/pronoun-owner.test.ts)),
and "my mother runs" and "my son marries your daughter" are built on the canvas through the owner's
Pronoun tab and checked in all seven languages
([`e2e/pronoun-owner.spec.ts`](../../../../../e2e/pronoun-owner.spec.ts)). A named 3rd person owner
beside a subject stays another person's: 男の子は彼のお母さんを見ます (D6).

What landed, and where it differs from the plan below:

1. **Model** (D2). [`pronounFeatures.ts`](../../../../../packages/phrase/src/model/selectionToPlan/functions/pronounFeatures.ts)
   holds the read both gestures share — person from the concept, number from the pick else the
   concept's, gender on the 3rd person only — and `isPersonalPronoun`, the chooser's own rule (a
   person, not GENERIC_PERSON, no `slot`). `resolveAntecedent` now calls it. **Deviation:** that
   gates the *pointer's* gender to the 3rd person too, so a pointer at a feminine *I* no longer
   writes `gender: 'fem'`; D3's probes show it changed nothing rendered, and `resolveAntecedent`'s
   tests pass unchanged. `buildNounPhrase` writes a pronoun-headed owner as the `PronominalPossessor`
   (the generic and an indefinite **drop** rather than become a genitive), and writes `possessorRole`
   for a noun owner only (D5).
2. **`planToWorkspace`** (D8) loads `Possessor.pronominal` as an owner slice `{ subject: <person's
   pronoun>, subjectNumber, subjectGender (3rd only) }`. A plan that also carries a `possessorRole`
   on it names `NounPhrase.possessorRole on a pronoun` unsupported, since the canvas would hold it
   and never write it. `Possessor.coreferent` loads as a pointer at `subject` since
   [E7](P11-E7-coreferent-possessor-control.md).
3. **Canvas** (D1, D3, D5, D7, D8). `pronounHead` is set for an owner ring, and a new `ownerHead`
   flag gives its empty box the pronoun-inclusive picker under the noun-or-pronoun prompt (its field
   keeps the `typeahead-noun` test id). The chooser's generic is shown **`aria-disabled`, not
   `disabled`**, so its definition tooltip still answers the pointer; its digit 4, the arrows and a
   click all skip it. The gender control on an owner ring is offered on the 3rd person alone
   (`rawSatellites`' `ownerHead`); `possessorRoles` needs a noun owner. Taking the Pronoun tab in an
   owner's picker (click, or ↑ →) cancels the pick the ring opened with. The owner's solid line wears
   the possessed phrase (`owner-pronoun-chip`, "my mother"), from `usePossessivePhrases` with the
   `pronoun.possessive.*` fallback, and the folded possessor control's tooltip names the person and
   then the phrase in quotes, as a pointer's does. Measured on "my son marries your daughter": the pronoun owner ring carries only
   its number and *whose* controls and the chips sit clear, so nothing was widened.
4. **Console** (D8). `WordSpec.personal` keeps an owner's pronouns to the three persons, which
   completion follows; the possessive determiners *my, our, your, his, its, their* are read in that
   frame alone; `/poss` carries the pronoun form's number and gender (`/poss we` is `[ 1st /pl ]`).
   `/poss one` and `/poss someone` are `unknownWord`. **Deviation:** the console still takes and
   prints a gender on a 1st or 2nd person owner (`/poss [ 1st /fem ]`), as the chooser's held pick,
   so the round trip keeps it; only the canvas control is withdrawn. The `/poss` help example is now
   "/subj ( mother /poss [ 1st ] ) /verb ( see ) /obj ( book /poss [ man /adj old ] )".
5. **Tests.** `buildNounPhrase.test.ts` (a describe of its own), `planToWorkspacePossessor.test.ts`
   (each table plan loads with nothing unsaid and re-plans to itself), `ownerChain.test.ts`,
   `possessionEdges.test.ts`, `PhraseBuilder.test.tsx` (the old "offers nouns alone for the owner's
   head" pin is rewritten: the tab is there; the pick ends on the tab; the generic is disabled;
   gender on the 3rd only; the role chip withdrawn), `canvasKeys.test.tsx` (P, ↑ →, 2, ↵), and
   the console's `golden`, `complete`, `examples` and round-trip suites — the walk names pronoun owners
   of every person and gender, green at `SEEDS=5000`. The console test vocabulary gained MOTHER, SON,
   DAUGHTER, MARRY and SOMEONE in arrays of their own, and the walk's owner pick derives the pronoun
   from the same draw, so the walk still reaches every rare state the other reach tests look for.

Open points, settled:

- **Gender default** (D3): unchanged, as ruled.
- **↵ against a running pick** (D8): **a live defect at HEAD**, reproduced in jsdom at 23ea680a
  before this change: P on the object opens the owner and its pick, typing "gir" into the owner's
  noun picker and pressing ↵ stores `directObjectPossessorRef: "subject"` — `usePickKeys` takes ↵ in
  the capture phase for target 1 — instead of naming GIRL. Wanted: the owner named GIRL. Reported,
  not fixed here (the Pronoun tab's own ↵ is reached, because taking the tab ends the pick).
- **Japanese topic-repeating 私の** (D6): not filed, as recorded.

## Why

Every kin term P11 seeded is at its most useful with an owner, and the owner most often wanted is the
speaker or the listener. The builder can say *I* and *you*, but it cannot say *my* or *your* unless an
*I* or a *you* is already in the period. "I and my father go" can be built. "My father comes", "your
mother runs", and E8's "my wife, run" (a command, whose period holds no *I*) cannot. The same limit
keeps E6's humble toggle away from most of the subjects it is for.

## Today

Verified at HEAD (1bb7c878), 2026-09-25.

- **The plan field.** [`PronominalPossessor`](../../../../../packages/shared/src/index.ts#L1085) is
  `{ kind: 'pronominal', person, number, gender? }`, one of the three `Possessor` shapes beside a
  genitive `NounPhrase` and E2's [`CoreferentPossessor`](../../../../../packages/shared/src/index.ts#L1111).
- **A named owner takes a noun only**, in both places:
  - **Canvas.** An owner is a hosted ring whose builder runs `nounPhraseOnly`
    ([`OwnerRings.tsx`](../../../../../packages/frontend/src/components/PhraseBuilder/OwnerRings.tsx#L36)).
    [`slotCategories("subject", nounSubject)`](../../../../../packages/phrase/src/model/interfaces.ts#L688)
    returns no category switch when `nounSubject` is set. `nounSubject` is `nounPhrase && !pronounHead`
    ([`phraseRender.tsx:339`](../../../../../packages/frontend/src/components/PhraseBuilder/phraseRender.tsx#L339)).
    `pronounHead` is set for a conjunct and a standard only
    ([`PhraseBuilder.tsx:983`](../../../../../packages/frontend/src/components/PhraseBuilder/PhraseBuilder.tsx#L983)),
    which is how "you and I" and "bigger than him" already get the pronoun tab. The owner is the one
    hosted ring left out.
  - **Console.** [`apply.ts:710`](../../../../../packages/phrase/src/language/apply.ts#L710) resolves
    `/poss`'s word with [`wordSpecFor("subject", "possessor")`](../../../../../packages/phrase/src/language/resolve.ts#L34),
    which is `{ roles: ["noun"] }`. Completion reads the same spec
    ([`complete.ts:308`](../../../../../packages/frontend/src/console/language/complete.ts#L308)).
- **A pronominal possessor exists only as a pointer.** The noun's `${which}PossessorRef` is an address
  that [`buildNounPhrase`](../../../../../packages/phrase/src/model/selectionToPlan/functions/buildNounPhrase.ts#L29)
  hands to [`resolveAntecedent`](../../../../../packages/phrase/src/model/selectionToPlan/functions/resolveAntecedent.ts#L13).
  That reads a pronoun antecedent's person from the concept and its number and gender from the slice's
  picks. [`CorefPickContext.isEligible`](../../../../../packages/frontend/src/components/PhraseBuilder/CorefPickContext.tsx#L55)
  accepts any noun of the period except the possessed noun and its subtree, so a *my* needs an *I* to
  point at.
- **A genitive noun phrase headed by a pronoun is wrong in six languages.** This is what the builder
  would send if it only let a pronoun into the owner ring and changed nothing else. Probed:

  | owner, as a genitive `NounPhrase` | en | it | de | ja |
  |---|---|---|---|---|
  | FIRST_PERSON (MOTHER runs) | the I's mother runs. | la madre dell'io corre. | die Mutter des iches läuft. | 私の母は走ります。 |
  | THIRD_PERSON, `fem` (I see BOOK) | I see the she's book. | vedo il libro della lei. | ich sehe das Buch der sie. | 私は彼女の本を見ます。 |
  | SOMEONE (I see BOOK) | I see the someone's book. | vedo il libro del qualcuno. | ich sehe das Buch des jemands. | 私は誰かの本を見ます。 |
  | GENERIC_PERSON (I see BOOK) | I see the one's book. | vedo il libro del si. | ich sehe das Buch des manes. | 私は人の本を見ます。 |

- **The pronoun chooser** ([`PronounChooser`](../../../../../packages/frontend/src/components/PhraseBuilder/PronounChooser.tsx#L19))
  offers the 1st, 2nd and 3rd person and the generic. It always commits a number and a gender
  ([`commitPronoun`](../../../../../packages/frontend/src/components/PhraseBuilder/SubjectTypeahead.tsx#L68)).
  The default is 1st singular masculine, and neuter is offered for the 3rd person only
  ([`pronounGenders`](../../../../../packages/frontend/src/components/PhraseBuilder/hooks/usePronounChooser.ts#L33)).
  The indefinites (SOMETHING, EVERYTHING, SOMEONE) carry `slot: 'indefinite'` and have no row
  ([`pronounFor`](../../../../../packages/frontend/src/components/PhraseBuilder/hooks/usePronounChooser.ts#L49)).
- **A pronoun head already sheds the noun controls.** On the head's ring,
  [`rawSatellites`](../../../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L147)
  gates the adjective, determiner, relative clause and owner on `subjectRole === "noun"`. It keeps
  number and gender, and it offers gender for **every** person of a pronoun. A hosted owner never gets
  the coordinate control
  ([`decoratePerimeterControls.ts:56`](../../../../../packages/frontend/src/components/PhraseBuilder/functions/decoratePerimeterControls.ts#L56)).
  The `possessorRoles` chip ([L116](../../../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L116))
  is offered for any named owner that holds a word, and
  [`buildNounPhrase`](../../../../../packages/phrase/src/model/selectionToPlan/functions/buildNounPhrase.ts#L65)
  writes the role only for a genitive owner.
- **The engine ignores `possessorRole` on a pronominal owner.** Probed: PART with a neuter owner is
  "I see its part" with `whole` and without, and GROUP with a 3pl owner and `parts` is "I see their
  group", which means the group *they own*. The of-phrase that `whole` / `parts` give a genitive
  owner ("a part of a keyboard") is not produced for a pronoun.
- **Gender with no pick.** A 3sg owner with no `gender` renders as the masculine in every language:
  *his*, *sein*, 彼の. The chooser never sends one, but `/poss 3rd` would (see D3).
  [C20](../../../../localization/done/C20-pronoun-agreement.md)'s rule is not to guess a person's sex,
  so an unstated antecedent becomes その人. That rule is `antecedentAgreement`'s, and it applies to a
  pronoun **standing for a noun**. A deictic THIRD_PERSON is "he" by default as a subject too.
- **No formal *you*.** The plan has no politeness feature on a pronoun or on a possessor. pt says the
  2nd person with *você* forms (*a sua mãe*), and ja with あなた. Nothing in `@signi/shared` says
  *Sie*, *Lei*, *vous* or *usted*.
- **The pointer, the link and a free owner are different plans.** This is the E7 overlap, probed.
  Six languages read every pair alike, and Japanese does not:

  | sentence | free owner (this task) | E7's link to the subject |
  |---|---|---|
  | the boy sees his mother (3sg `masc`) | 男の子は**彼の**お母さんを見ます。 | 男の子は**自分の**お母さんを見ます。 |
  | I see my book | 私は**私の**本を見ます。 | 私は**自分の**本を見ます。 |
  | I love my wife | 私は**妻**を愛しています。 | 私は**自分の妻**を愛しています。 |
  | see your book (command) | **あなたの**本を見てください。 | **自分の**本を見てください。 |

  The free 3rd person is the other person's *his*. The free 1st person on a kin head gives the row
  P11's README pins (私は妻を愛しています, 私の dropped by
  [`applyPossessorForm`](../../../../../packages/engine/src/translator/functions/applyPossessorForm.ts#L67)).
- **Every slot renders a pronominal owner.** Probed: the object ("the cat sees my house"), a locative
  ("in my house", *in meinem Haus*), the comitative (*mit meinem Vater*, 父と), a standard ("bigger than
  my dog", 私の犬より), an owner's owner ("my father's house", *das Haus meines Vaters*, 父の家), a
  conjunct ("the cat and my dog run"), a relative clause's object ("the man who sees my mother runs",
  母を見る男), the address ("My wife, run.", 妻、走ってください), and an indefinite possessed noun ("a
  mother of mine", *una mia madre*, *eine Mutter von mir*).
- **The whose-question refuses it** as it refuses any owner: "a possessor question cannot ask about a
  noun that already has a possessor (P09-E14)". [P09-E52](../../P09-core-vocabulary/Z-done/P09-E52-possessor-question-control.md)
  D3 deletes the owner before asking.
- **The round trip.** [`planToWorkspace`](../../../../../packages/phrase/src/model/workspacePlan/functions/planToWorkspace.ts#L328)
  reports every possessor with a `kind` as unsupported, `Possessor.pronominal` included. The printer
  writes a pointer as `/poss #n.noun` and a named owner as `/poss [ … ]`
  ([`print.ts:460`](../../../../../packages/phrase/src/language/print.ts#L460)). A pronoun is written as
  its person, `1st` / `2nd` / `3rd` / `one`, with `/pl` and `/fem`
  ([`printWord`](../../../../../packages/phrase/src/language/resolve.ts#L167)). The English forms *I, we,
  you, he, she, her, it, they* are accepted on the way in
  ([`PRONOUN_FORMS`](../../../../../packages/phrase/src/language/resolve.ts#L90)), but not *my, our,
  his, its, their*.
- **Labels.** A pronoun box reads its person, `pronoun.person.1` ("first person"), through
  [`conceptWord`](../../../../../packages/frontend/src/i18n/conceptWord.ts#L31). A pointer's line and the
  possessor control's tooltip show the possessed phrase ("his horse", *la sua casa*), which
  [`usePossessivePhrases`](../../../../../packages/frontend/src/i18n/usePossessivePhrase.ts#L39) renders
  on request from `(concept, features)`. Until the render arrives they fall back to the catalog's
  `pronoun.possessive.*` ([`possessiveHintKey`](../../../../../packages/frontend/src/components/PhraseBuilder/CorefPickContext.tsx#L106),
  [C16](../../../../localization/done/C16-ui-possessive-pronoun-chip.md)). The 3pl fallback key has no
  gender split, which only Japanese would use.
- **Keys.** `P` is `noun.possessor` ([`keymap.ts:514`](../../../../../packages/frontend/src/keyboard/keymap.ts#L514)).
  On an empty owner it opens the ring and starts the coref pick in one go (`openAndPick`,
  [`PhraseBuilder.tsx:364`](../../../../../packages/frontend/src/components/PhraseBuilder/PhraseBuilder.tsx#L364)).
  While that pick runs, [`usePickKeys`](../../../../../packages/frontend/src/keyboard/usePickKeys.ts#L97)
  listens on `window` in the capture phase and takes the digits 1–9, ⇥ and ↵ for the numbered
  targets. The pronoun chooser's own keys are 1–4 for the person and ↵ to commit, so the two collide
  (D7).

## Design

### D1. The owner ring's picker takes the pronoun tab

1. **The owner ring's word picker.** Set `pronounHead` for `ringHost.kind === "owner"`, so the empty
   owner ring shows the Noun / Pronoun switch and the same chooser the subject uses. The pronoun is the
   owner's word, and its ring keeps number and gender. This is the change a conjunct and a standard
   already got.
2. **A possessive chip on the possessed noun**, cycling *—, my, your, his, her, its, our, your (pl),
   their*: nine states, and up to eleven with the Japanese 3pl genders. It would be a new satellite on
   every noun ring and a third way to fill the owner, beside the ring and the pointer. Its values
   would also mix person, number and gender in one cycle, which the chooser keeps on three rows.
3. **Both.**

**Recommendation: (1).** No new control. The owner is still one thing with one control: `P` opens it,
and the user either names it (a noun or a pronoun) or points it at another noun. A pronoun head has
fewer controls than a noun, so the owner ring shrinks rather than grows. Measure it anyway, and widen
rather than hide if the line chip in D6 crowds it.

### D2. The plan: a pronoun-headed owner is a `PronominalPossessor`

`buildNounPhrase` writes a named owner whose head is a personal pronoun as `{ kind: 'pronominal',
person, number, gender? }`, never as a genitive noun phrase (see the table in *Today*). The feature
read is the one `resolveAntecedent` already does for a pronoun antecedent. Extract it as
`pronounFeatures(sel, key)` so the pointer and the free owner cannot drift:

- `person` from the concept;
- `number` from the slice's `subjectNumber`, else the concept's;
- `gender` from `subjectGender`, **3rd person only** (D3).

Which pronouns:

- **FIRST_PERSON, SECOND_PERSON and THIRD_PERSON only.**
- **GENERIC_PERSON** is shown disabled in the owner's chooser. This follows E8 D3's greyed-person
  pattern. `PronominalPossessor` has no generic, so it would read "his". *One's* is E7's link in a
  citation.
- **The indefinites** never reach the owner picker, since they have no chooser row. They are refused
  in the console by the spec (D8).

The owner ring's number chip then reads *my* ↔ *our*, and its selection shape is unchanged: a
`${which}Possessor` slice whose `subject` is the pronoun.

**Recommendation: as stated.** `possessorRole` is written for a noun-headed owner only (D5).

### D3. Gender: offered on the 3rd person, never guessed by the canvas

- **The gender chip** on a pronoun-headed owner is offered **only when the person is 3**. The probes
  above show that a 1st or 2nd person owner's gender changes nothing in any language, so offering the
  chip there would break the rule that a control exists because the grammar licenses it. The rule
  applies to the owner ring only. A pronoun **subject** keeps its gender for every person, because
  there it drives participle agreement. The chooser's gender row stays as it is, since it is shared
  with the subject. A gender it sets on a 1st or 2nd person owner stays in the selection and is left
  out of the plan (the stale-mark rule).
- **Unstated gender.** The canvas cannot produce one, because the chooser always commits a gender,
  masculine by default. A console `/poss 3rd` with no `/fem` leaves it unset, and the engine says
  *his* / 彼の, exactly as `/subj 3rd` says *he* / 彼. That is the deictic pronoun's own default, not
  C20's antecedent rule, and this task does not change it.
- **"That person's".** There is no way to say the owner's sex is unknown (en *their*, ja その人の). The
  plan has no such feature, and a noun owner (*the person's*) says it today.

**Recommendation: as stated.** **Open point:** whether the chooser inside an owner ring should default
the 3rd person to no gender pick and require one. That would be a chooser change shared with every
slot, so it is not proposed here.

### D4. Politeness

The model has no formal *you*, on a pronoun or on a possessor (see *Today*). The owner's 2nd person is
the same informal 2nd person the subject has: *tuo*, *ton*, *dein*, *tu*, *seu* (*você*), あなたの.

**Recommendation:** nothing to build. A T/V feature would be a plan field for every 2nd person, so it
is out of scope.

### D5. Which owners take it, and what the owner then carries

Every owner ring takes it, at any depth, since an owner ring is one component wherever it is drawn:

| owner of | offered | probed |
|---|---|---|
| subject, object, any complement, a standard | yes | "my mother runs", "in my house", "bigger than my dog" |
| a conjunct | yes | "the cat and my dog run" |
| an owner (the pronoun as the *last* link of a chain) | yes | "my father's house", 兄の妻 / あなたのお兄さんの奥さん |
| E8's vocative | yes | "My wife, run." |
| a noun inside a relative clause's period | yes | "the man who sees my mother runs" |

On the owner ring itself, a pronoun head carries:

- **number**, and **gender** on the 3rd person (D3);
- **no** adjective, determiner, relative clause, owner, conjunct or whose-mark. The existing
  `subjectRole === "noun"` gates and the hosted ring's rules already withdraw these. A `Possessor`
  cannot be a group.

On the possessed noun, the **`possessorRoles` chip** is withdrawn while the owner is a pronoun. The
engine ignores the role there, and `parts` would even read the wrong way round ("their group"). A role
set earlier stays in the selection and is not written, and it comes back if the owner becomes a noun
again. The gate adds `owner.subject.role === "noun"` to
[`possessorRole`](../../../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L125)'s
`available`, and the same test goes into `buildNounPhrase`.

**Recommendation: as stated.**

### D6. A free owner, a pointer and E7's link stay three plans

The builder then has three ways to give a noun a pronoun owner, and they mean different things:

| gesture | plan | Japanese |
|---|---|---|
| name a pronoun in the owner ring (this task) | `pronominal`, the features picked | 彼の / 私の / あなたの: whoever those features name |
| point at a noun of the period, not the clause subject | `pronominal`, copied from that noun | as the copied features read |
| point at the clause's subject ([E7](P11-E7-coreferent-possessor-control.md)) | `coreferent` | 自分の: the subject itself |

1. **Keep them apart.** A free *his* is the other person's. That is a real meaning, and it is the
   only way to say it, since E7 turns every pointer at the subject into the link.
2. **Derive the link** when a free 1st or 2nd person owner matches a 1st or 2nd person subject ("I
   see my book" → 自分の). This was probed and rejected. On a kin head it turns P11's pinned 私は**妻**を
   愛しています into 私は**自分の妻**を愛しています. It would also give one gesture two plans, depending on
   the subject.

**Recommendation: (1).** The UI already keeps them visibly apart:

- a free owner is a **ring** on a solid line, whose box names its person;
- a pointer is a **dashed line** to the noun it names.

The Japanese row shows what each one says. No steering hint is proposed, and none would be
engine-composable without a new string. **Open point (engine, not this task):** 私は私の本を見ます and
あなたはあなたのお母さんを見ます repeat the topic's pronoun. That is grammatical but heavier than
Japanese writes it, and whether ja should drop a possessor that repeats the topic on a non-kin head is
a question for the bug catalogue. It is recorded here and not filed.

### D7. Labels and the line chip: no new string

- **The owner's box** reads the pronoun's person, `pronoun.person.N`, as every pronoun box does.
- **The possessed phrase.** The solid line from a pronoun owner to its noun wears the same chip a
  pointer's dashed line wears, and the possessed noun's possessor control says it in its tooltip. The
  text is the possessed phrase the plan will render ("my mother", *la mia casa*, 私の家). It comes from
  `usePossessivePhrases` with the owner's `pronounFeatures`, with `pronoun.possessive.*` as the
  fallback while the render is in flight (C16). So the ring says *first person* and the chip says *my
  mother*, which is how the pointer already reads.
- **The request list.** [`possessiveRequests`](../../../../../packages/frontend/src/components/PhraseBuilder/functions/possessiveRequests.ts#L16)
  adds the free owners beside the pointers. `OwnerRings` draws the chip from spots the period's builder
  already holds. The owner ring does not report anything new to its parent (the report-loop rule).
- **Nothing new is seeded or catalogued.** `category.pronoun`, `pronoun.person.*`, `pronoun.first` and
  the rest of the chooser's labels all exist. Run the UI-string sweep anyway:
  - the `/localize` breadcrumb;
  - `PART_BY_LABEL_KEY` (no new label key, so no entry);
  - the chooser's disabled-generic tooltip, which must reuse the concept's definition as it does
    today.

**Recommendation: as stated.**

### D8. Keys and console

- **Keys:** no new key.
  - `P` opens the owner (and the pick). ↑ goes into the tabs, → selects Pronoun, then a digit or the
    arrows choose the person, number and gender, and ↵ takes it. `N` and `G` on the owner box change
    number and gender, as on any noun box. There is no Alt layer.
  - **The pick collision.** Naming the owner is choosing not to point, so the coref pick is
    **cancelled** when the owner's picker leaves the Noun tab. The chooser's 1–4 and ↵ then reach it,
    not `usePickKeys`.
  - **Open point:** whether today's noun typing in an owner picker already loses ↵ to the running pick
    when eligible targets exist. The capture listener suggests it does, but no test covers it. Check it
    in the browser first. If it does, cancel the pick on the first keystroke too.
- **Console:** `/poss` takes a pronoun:
  - `/subj ( mother /poss [ 1st ] ) /verb ( run )`;
  - `/obj ( book /poss [ 3rd /fem ] )`;
  - `/poss [ 1st /pl ]` for *our*.
  - `wordSpecFor("subject", "possessor")` becomes `{ roles: ["noun", "pronoun"], personal: true }`.
    The new `personal` flag keeps the pronoun words to the three persons, so completion lists exactly
    what the canvas chooser enables. `/poss one` and `/poss someone` then fail as `unknownWord`, the
    same diagnostic as any word the slot does not take, and no new string is needed.
  - The existing English forms work unchanged: `/poss we`, `/poss her`.
  - **The possessive determiners** *my, your, his, its, our, their* are accepted **in the possessor
    frame only**: `/poss my` names the 1st singular and `/poss their` the 3rd plural. They are not
    accepted in `/subj`, where *my* is no subject. The line always prints the person form, so
    `/poss my` prints `/poss [ 1st ]`. Deviation: apply accepts both `/poss her` and `/poss [ 3rd /fem ]`,
    and the printer writes the second.
  - `/whole` / `/parts` after a pronoun owner are held, not refused. They print, and the plan leaves
    them out (D5). This is the stale-mark rule, as on the canvas.
- **`planToWorkspace`:** `{ kind: 'pronominal' }` becomes an owner slice with the person's concept, its
  number, and its gender (on person 3). It leaves `unsupported`. This supersedes E7 D6's "`Possessor.pronominal`
  stays unsupported: a plan has no address to recover". It needs no address, because it becomes a free
  owner. A plan that the builder wrote from a pointer comes back as a free owner with the same
  features, which re-plans identically.

**Recommendation: as stated.**

### D9. The sibling tickets

- **[P11-E6](../P11-E6-humble-verb-control.md).** The humble register's `own` is set by
  `applyPossessorForm` for any 1st-person pronominal owner, so "my father comes" + `humble` gives
  父は参ります (E6's table). E6 D2's `canBeHumble` gains one case: a noun under RELATIVE whose named
  owner's head is FIRST_PERSON. Whichever of the two lands second adds it. E6's *Out of scope* note
  retires when this ships.
- **[P11-E7](P11-E7-coreferent-possessor-control.md).** There is no conflict of gestures: E7 changes
  what a pointer at the subject means, and this task adds a ring. The two tickets overlap in two
  places:
  - `planToWorkspace`: E7 maps the link, this maps the features;
  - the chip: E7's D5 hook renders a link in context, and this reuses the bare-phrase render.
  E7's *Out of scope* note ("a 1st-person named owner") retires.
- **[P11-E8](../P11-E8-vocative-control.md).** Its fourth column, "my wife, run", is a command with no *I*
  in the period, so without this task it cannot be built. E8 D3's "possessor: named ring or pointed-to
  pronoun" row then includes a pronoun-headed ring. Every person is allowed there: the refusal E8
  inherits (A338) is on the address's **head**, not its owner.
- **[P09-E52](../../P09-core-vocabulary/Z-done/P09-E52-possessor-question-control.md).** No change. The asked
  owner is a named ring whose word is dropped (E52 D3), and a pronoun word is dropped like a noun.

## Implementation

1. **Model** (`packages/phrase/src/model`):
   - `pronounFeatures(sel, key)`, extracted from `resolveAntecedent` (D2);
   - `buildNounPhrase` writes the pronominal owner, and the role for a noun owner only (D2, D5);
   - `planToWorkspace` maps `pronominal` to an owner slice (D8);
   - `slotCategories`' comment, which says a possessor head is noun-only.
2. **Canvas** (`packages/frontend/src/components/PhraseBuilder/`):
   - `pronounHead` for owner rings ([`PhraseBuilder.tsx:983`](../../../../../packages/frontend/src/components/PhraseBuilder/PhraseBuilder.tsx#L983));
   - the generic person disabled in an owner's chooser;
   - the gender chip gated to the 3rd person on an owner ring (the owner builder passes its
     `ringHost.kind` into the satellite context);
   - the `possessorRoles` gate (D5);
   - the coref pick cancelled on the owner picker's tab change (D8);
   - `possessiveRequests` and the owner-line chip (D7).
3. **Console** (`packages/phrase/src/language`, `packages/frontend/src/console/language`):
   - `WordSpec.personal`, `wordSpecFor("subject", "possessor")`, and `wordsFor` filtering by it;
   - the possessive determiners in the possessor frame of `resolveWord`;
   - the printer's pronoun owner as `/poss [ 1st … ]`;
   - completion follows the spec;
   - a `help.ts` example.
4. **Docs:** strike the gap from E6's and E7's *Out of scope*, and correct E7 D6's line (D9).

## Tests

- **Model:**
  - `buildNounPhrase.test.ts`: a FIRST_PERSON owner gives `{ kind: 'pronominal', person: '1', number:
    'singular' }` with no gender. A 1st plural gives *our*. A THIRD_PERSON `fem` owner keeps `fem`. A
    role on a pronoun owner is dropped and comes back on a noun owner. The owner's own owner, conjunct
    or adjective (held in the slice) are not written.
  - `resolveAntecedent` tests: unchanged after the extraction.
  - `planToWorkspace` tests: each table plan loads with no `unsupported` and re-plans to itself.
- **Engine parity:** every table cell, built as a plan from a selection, equals `kinship.test.ts`'s
  expectation where they overlap (the README's headline columns).
- **Canvas:**
  - the owner ring shows the category switch and the chooser;
  - the generic is disabled there;
  - gender offered on 3rd, not on 1st or 2nd;
  - `possessorRoles` withdrawn under a pronoun owner;
  - the line chip reads the possessed phrase;
  - the pick is cancelled when the Pronoun tab is taken (`CorefPickContext.test.tsx` or
    `PhraseBuilder.test.tsx`).
- **Keys:** `canvasKeys.test.tsx`: `P` on the subject, then ↑ →, then `2` and ↵, gives a 2nd person
  owner, and the pick is gone.
- **Console** (the P02 debt):
  - `golden.test.ts`: `/subj ( mother /poss [ 1st ] ) /verb ( run )`, `/subj ( son /poss [ 1st ] )
    /verb ( marry ) /obj ( daughter /poss [ 2nd ] )`, and `/poss my` printing as `/poss [ 1st ]`;
  - misuse cases: `/poss one` and `/poss someone` (`unknownWord`), and `/subj my` (not a subject
    word);
  - `complete.test.ts`: the persons offered after `/poss`, and no indefinites;
  - `help.test.ts`;
  - a round-trip walk op that names a pronoun owner (random person, number and gender) wherever an
    owner is offered, green at `SEEDS=5000`.
- **e2e:** `possessor-reference.spec.ts`, or a new spec, builds "my mother runs" and "my son marries
  your daughter" through the owner's Pronoun tab, and checks all seven rows against the first table.
  Spell `FIRST_PERSON` and the rest out, since specs load as CJS and cannot import values from
  `@signi/shared`.

## Verification

1. Rebuild the shared and phrase dists. Phrase, frontend, engine and backend suites green; typecheck
   and `npm run build` clean.
2. `SEEDS=5000 npx vitest run packages/frontend/test/console/roundTrip.test.ts` from the repo root.
3. In the browser (5173):
   - build all five columns of the first table and the his / her / its row;
   - then give "my mother" a role chip before and after: withdrawn under the pronoun, back under a
     noun;
   - then press `P` on an object while the subject is *I*, and point instead of naming: E7's 自分の;
   - then name *I* in the owner instead: 私の;
   - measure the owner ring and its line chip on "my son marries your daughter", and widen rather
     than hide if they crowd the object's row.

## Out of scope

- **A formal *you*** (*Sie*, *Lei*, *vous*, *usted*): no plan field for it anywhere (D4).
- **An owner of unstated sex** (en *their*, ja その人の) for a free 3rd singular (D3).
- **An indefinite owner** ("someone's book"). SOMEONE as a genitive renders "the someone's book" in
  English and *des jemands* in German. It needs engine work before any picker offers it. That is a
  lead, not filed here.
- **The generic owner** ("one's book") outside a citation. E7's link covers the citation.
- **Japanese topic-repeating 私の / あなたの** on a non-kin head (D6): an engine question, recorded and
  not filed.
- **A whose-question over a pronoun owner.** The mark replaces the owner (E52), so there is nothing to
  add.
