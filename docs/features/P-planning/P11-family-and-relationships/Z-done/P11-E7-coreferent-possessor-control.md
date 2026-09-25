# P11-E7. *His own family* — pointing at the clause's subject makes the link

**Feature:** the canvas, keyboard and console control for [P11-E2](P11-E2-coreference.md)'s
coreferent possessor, `{ kind: 'coreferent', slot: 'subject' }` (shared `CoreferentPossessor`): "the
boy sees **his** mother" where *his* is the boy because he is the subject. Japanese then says 自分の,
and the kin chain reads through it (兄は自分の**母**を見ます).
**Shape:** no new control and no engine grammar. The builder already has a pointed-to owner, a
dashed line from a noun's possessor control to another noun of the period. When that line lands on
the clause's own subject, the plan says the link instead of copying the subject's features. Two
boxes that are not noun rings today become targets for the pick: the command box and the infinitive
box. `/poss #n.subj` keeps its syntax and now means the link.
**Scope:** `@signi/phrase` (plan building, `planToWorkspace`, console apply/print/normalize), the
coref pick (`CorefPickContext`, the mood boxes), the link's chip. No new UI string. No engine change.
**Status:** **shipped, 2026-09-25** — see [Done](#done). Filed 2026-09-25 from P11's plan-only
constructs. The engine side is [P11-E2](P11-E2-coreference.md).

Engine output at HEAD (1d8f359b), rendered 2026-09-25 against the seeded lexicon. Each cell shows
what the builder's pointer plan says today, and then what the link says **(bold)** where the two
differ. The pointer plans came from real console lines put through `applyScript` →
`workspaceToPlans` (e.g. `/subj woman /verb see /obj ( book /poss #1.subj )`). The link plans are
the same plans with the pointed possessor swapped for the link. *My older brother* is hand-written,
because no builder path gives a subject a 1st-person owner (see *Today*).

| lang | the cat sees its book | the woman sees her book | my older brother sees his mother | the cat and the dog see their book | see your book (command) | the man who sees his mother runs |
|---|---|---|---|---|---|---|
| en | the cat sees his book. | the woman sees his book. → **her book** | my older brother sees his mother. | the cat and the dog see his book. → **their book** | see his book. → **see your book.** | the man who sees his mother runs. |
| it | il gatto vede il suo libro. | la donna vede il suo libro. | il mio fratello maggiore vede sua madre. | … vedono il suo libro. → **il loro libro** | vedi il suo libro. → **vedi il tuo libro.** | l'uomo che vede sua madre corre. |
| fr | le chat voit son livre. | la femme voit son livre. | mon frère aîné voit sa mère. | … voient son livre. → **leur livre** | vois son livre. → **vois ton livre.** | l'homme qui voit sa mère court. |
| de | der Kater sieht sein Buch. | die Frau sieht sein Buch. → **ihr Buch** | mein älterer Bruder sieht seine Mutter. | … sehen sein Buch. → **ihr Buch** | sieh sein Buch. → **sieh dein Buch.** | der Mann, der seine Mutter sieht, läuft. |
| es | el gato ve su libro. | la mujer ve su libro. | mi hermano mayor ve a su madre. | el gato y el perro ven su libro. | ve su libro. → **ve tu libro.** | el hombre que ve a su madre corre. |
| pt | o gato vê o seu livro. | a mulher vê o seu livro. | o meu irmão mais velho vê a sua mãe. | o gato e o cão veem o seu livro. | veja o seu livro. | o homem que vê a sua mãe corre. |
| ja | 猫は彼の本を見ます。 → **猫は自分の本を見ます。** | 女は彼の本を見ます。 → **女は自分の本を見ます。** | 兄は彼のお母さんを見ます。 → **兄は自分の母を見ます。** | 猫と犬は彼の本を見ます。 → **猫と犬は自分の本を見ます。** | 彼の本を見てください。 → **自分の本を見てください。** | 彼のお母さんを見る男は走ります。 → **自分のお母さんを見る男は走ります。** |

- **The cat.** The builder seeds CAT with `subjectGender: 'masc'`, since it is a gendered noun, and
  `subjectBinding` takes "the gender the plan states". So English says *his* under both plans.
  E2's "the cat sees **its** book" came from a plan with no gender. This is a lead, not this task's
  (see *Out of scope*).
- **The command.** The "today" column needs a stashed subject: `/subj boy /command /verb see /obj
  ( book /poss #1.subj )`. The pointer then reads the hidden BOY, not the addressee. With no
  stashed subject, `/command /verb see /obj ( book /poss #1.subj )` is refused: `Missing noun:
  #1.subj`.

The link also reaches clauses the pointer cannot reach at all, because their subject has no box.
Hand-written plans, all engine output:

| lang | the man runs to see his mother (purpose) | the man tells the boy to see his mother (object control) | to see one's book (citation) |
|---|---|---|---|
| en | the man runs to see his mother. | the man tells the boy to see his mother. | to see one's book. |
| it | l'uomo corre per vedere sua madre. | l'uomo dice al ragazzo di vedere sua madre. | vedere il proprio libro. |
| de | der Mann läuft, um seine Mutter zu sehen. | der Mann sagt dem Jungen, seine Mutter zu sehen. | sein Buch sehen. |
| ja | 男は自分のお母さんを見るために走ります。 | 男は男の子に自分のお母さんを見るように言います。 | 自分の本を見る。 |

## Done

Shipped 2026-09-25, as D1–D6 recommend. Every **bold** cell of the first table, and every cell of
the second, is now the builder's own plan: a console line (`/poss #1.subj`, the canvas's pointer) put
through `applyScript` → `workspaceToPlans` renders it byte-for-byte, *my older brother* included,
since [P11-E9](P11-E9-pronoun-owner.md) now builds its 1st-person owner (兄は自分の母を見ます).
Pinned in [`engine/test/coreferent-control.test.ts`](../../../../../packages/engine/test/coreferent-control.test.ts)
(the object-controlled row with LET, "the man lets the boy see his mother", 男は男の子に自分のお母さんを見させます,
since no seeded verb says TELL with an infinitive in the console). On the canvas: the boy sees his
dog is 男の子は自分の犬を見ます and its chip 自分の犬, "the woman sees her book" (en/de), and "see your
book" built by pointing at the command box
([`e2e/possessor-reference.spec.ts`](../../../../../e2e/possessor-reference.spec.ts)). Switching
the verb to the passive gives back 彼の犬は男の子に見られます, and a coordinated subject reads "their".
No seed definition or UI string uses a pointer, so no composed text moved.

What landed, and where it differs from the plan below:

1. **The gate** (D3): [`linksToSubject.ts`](../../../../../packages/phrase/src/model/functions/linksToSubject.ts)
   holds `LINK_GATES`, one predicate each — outside the subject's subtree, active, in a clause
   (a verb) — and `linksToSubject(root, possessed)` is their conjunction. **The address gate is not
   written** (E8's vocative box is another lane's): it is one more entry in `LINK_GATES`, as the
   list's last comment says. `pointedPossessor` is the one place a pointer becomes a plan possessor
   (the link, else the copy, else — at a command's or a citation's hidden subject the link cannot
   reach — nothing, D4), and `pointerHolds` is what the console prints, keeps and accepts.
2. **The model** (D1, D2): `buildNounPhrase` and `buildNounElement` take the noun's address in the
   period (`…/possessor`, `…/conjunct/i`, `…/standard`, `…/examples`), threaded from each top call's
   `which`. A coordinated subject is bound as the group, per the engine; `subject/conjunct/i` and
   `subject/possessor` stay copies. **Deviation (D2's highlight):** no extra group lighting was added —
   the conjunct rings already light up as their own (copy) targets, and the head's ring means the group.
3. **Round trip** (D6): `planToWorkspace` maps `Possessor.coreferent` to `PossessorRef: "subject"` at
   any depth, and names a link it would plan back as a copy (under the passive, inside the subject)
   `Possessor.coreferent where the builder copies`. `normalize` threads each slice's address to judge
   a pointer as the printer does. `#n.subj` now applies under a command and in a governed or cited
   infinitive (no `noNounAt`); the printed line is unchanged, so no golden line moved.
4. **Canvas** (D4): the mood box (command or citation) is a pick target — numbered, dashed, taken by a
   click or ↵ — and goes by the canvas key `subject`, so the dashed line lands on it with no new
   geometry report. `CorefPickContext.resolve('subject')` names the addressee under a command (not the
   stashed word) and "one" under a citation; `useProvideCorefPick` takes `controlled` for a period that
   is another's infinitive or purpose, whose controller it cannot see — there the pointer's label falls
   back to `hint.aNoun` and **its line carries no chip** (deviation: D5 would render it; the matrix
   subject is in another container's selection).
5. **The chip** (D5 (2)): **one engine change**, `translate(plan, lookup, { phrase: 'directObject' })`
   ([`translate.ts`](../../../../../packages/engine/src/translator/functions/translate.ts)): the plan
   is resolved as a clause — its links bound — and only its object is rendered, as the bare noun phrase
   a verbless period is, with no stop. `TranslateRequest.phrase` carries it through `POST
   /api/translate` (anything else is a 400). The canvas asks with `{ subject, imperative?,
   imperativeRegister?, infinitive? }` from the period's own plan and the possessed noun as the object
   (`linkClauseOf`, `usePossessivePhrases`'s `clause`), so the chip says 自分の犬 as the sentence does,
   "their book" for a group and "your book" for a command, in every language. **Deviation:** the
   control's label names the subject's head word, not the group's words joined by its conjunction.
6. **Keys**: none new; `P`, then a digit or ↵ on the command box, as on any target.

Also fixed in passing: an unused `QuestionRole` import in `rawSatellites.tsx` that failed the
frontend's `tsc` in `npm run build` at 23ea680a.

Tests: `buildNounPhrase.test.ts` (the L91 pin rewritten to the link; link from the object, a
complement, an owner's owner, a standard; the copy in the subject's subtree, at `subject/possessor`,
under the passive and verbless; a command and a citation), `planToWorkspacePossessor.test.ts`,
`CorefPickContext.test.tsx` (the command box eligible, naming the addressee; the group linked whole),
`subjectLink.test.ts`, `ownerChain.test.ts`, the console's `golden.test.ts` and a round-trip reach
test (the link in a clause and under a command; green at `SEEDS=5000`), the engine's
`coreferent-control.test.ts` (both tables and the `phrase` option, verbless too) and the backend's
`index.test.ts`.

## Why

E2 built the link and left it plan-only. The builder already has the gesture that means it: point
from a noun's possessor control to the subject. What it records is a **copy of the subject's
features**, which is the weakness E2 was filed to fix. Japanese reads the copy as 彼の ("his", a
third party), so the kin chain cannot see that *his* mother is the speaker's family. The copy also
takes its gender from the plan's gender pick, so an unpicked WOMAN gives German *sein*. And the copy
reads the first conjunct alone, so a coordinated subject gets *his*.

No new idea needs a new control here. The gesture the user already makes is the link, so the plan
only needs to say so.

## Today

Verified at HEAD (1d8f359b), 2026-09-25.

- **The pointed-to owner is a selection field.** It is `${which}PossessorRef`, an antecedent
  `NounAddress` ([`interfaces.ts:575`](../../../../../packages/phrase/src/model/interfaces.ts#L575),
  [L653](../../../../../packages/phrase/src/model/interfaces.ts#L653)), set by
  [`setPossessorRef`](../../../../../packages/phrase/src/model/phraseReducers.ts#L862) and exclusive
  with a named owner. [`buildNounPhrase`](../../../../../packages/phrase/src/model/selectionToPlan/functions/buildNounPhrase.ts#L27)
  turns it into [`resolveAntecedent`](../../../../../packages/phrase/src/model/selectionToPlan/functions/resolveAntecedent.ts#L13)'s
  `PronominalPossessor`. The person comes from the concept, the number and gender from the
  antecedent's picks. The address `subject` names the block's own fields, which in a group are the
  **first conjunct only**. `buildNounPhrase` knows `which` and `root` but not the possessed noun's
  address. A nested owner's slice calls its head `subject` too
  ([test](../../../../../packages/frontend/test/selectionToPlan/functions/buildNounPhrase.test.ts#L107)).
- **The gesture.** The possessor control's `openAndPick`
  ([`possessorToggleAction`](../../../../../packages/frontend/src/components/PhraseBuilder/functions/possessorToggleAction.ts#L13))
  opens an empty owner ring and starts a coref pick
  ([`PhraseBuilder.tsx:363`](../../../../../packages/frontend/src/components/PhraseBuilder/PhraseBuilder.tsx#L363)).
  [`isEligible`](../../../../../packages/frontend/src/components/PhraseBuilder/CorefPickContext.tsx#L55)
  accepts any noun address except the possessed noun and its own subtree. So the subject's second
  conjunct may point at `subject` ("the cat and his dog run"), and so may the subject's own owner.
  Only noun boxes are targets ([`linkPickHandlers`](../../../../../packages/frontend/src/components/PhraseBuilder/functions/linkPickHandlers.ts#L33)).
  The **command box and the infinitive box** that stand in the subject's place
  ([`PhraseCanvas.tsx:122`](../../../../../packages/frontend/src/components/PhraseBuilder/PhraseCanvas.tsx#L122))
  are plain boxes and cannot be picked.
- **A command keeps the user's subject pick** in the selection while
  [`selectionToPlan`](../../../../../packages/phrase/src/model/selectionToPlan/functions/selectionToPlan.ts#L44)
  writes the addressee, so a pointer to `subject` reads the hidden word (the table's "see his
  book"). A linked infinitive or purpose period has no subject box at all (`/inf` in the console), so
  nothing in it can point at its controller.
- **A relative clause's gap holds the head's word** (the console makes it "as a pick on the canvas
  makes it", [`apply.ts:772`](../../../../../packages/phrase/src/language/apply.ts#L772)), so pointing
  at a subject relative's own subject works today and copies the head's features.
- **The chip.** The dashed line carries the possessed phrase, rendered on request by
  [`usePossessivePhrases`](../../../../../packages/frontend/src/i18n/usePossessivePhrase.ts#L51) as
  `{ subject: { concept, possessor: features } }`, a bare noun phrase. It falls back to the catalog's
  `pronoun.possessive.*` ([`possessiveHintKey`](../../../../../packages/frontend/src/components/PhraseBuilder/CorefPickContext.tsx#L106))
  and is labelled in [`decoratePerimeterControls`](../../../../../packages/frontend/src/components/PhraseBuilder/functions/decoratePerimeterControls.ts#L71).
  A link **cannot** be rendered that way. In a bare noun phrase it stands in the subject it points
  at, and the engine refuses it. A verbless plan with an object renders the subject alone ("the
  woman."), which was probed.
- **What the engine refuses**, each named by `planError`
  ([`coreferentPath`](../../../../../packages/backend/src/planError.ts#L150)) and by
  [`bindCoreferents`](../../../../../packages/engine/src/translator/functions/bindCoreferents.ts#L106):
  - a link anywhere inside the subject it points at: its owner chain, a conjunct, a standard
    (`plan.subject.possessor: a coreferent possessor cannot stand in the subject it points at`). A
    relative clause's or a content clause's own subject is refused the same way;
  - a link in a phrase no clause holds. That is the address, [E8](../P11-E8-vocative-control.md)'s vocative
    ([`coreference.test.ts:332`](../../../../../packages/engine/test/coreference.test.ts#L332)).

  The binding is per clause ([`resolvePhrase.ts:159`](../../../../../packages/engine/src/translator/functions/resolvePhrase.ts#L159)).
  A subject relative binds to its head
  ([`resolveRelativeClause.ts:59`](../../../../../packages/engine/src/translator/functions/resolveRelativeClause.ts#L59)).
  An infinitive, a purpose and a citation bind to their controlled subject, and a command binds to
  its addressee.
- **The link is not in the round trip.** `planToWorkspace` reports every possessor with a `kind` as
  unsupported, the pronominal one included
  ([`planToWorkspace.ts:328`](../../../../../packages/phrase/src/model/workspacePlan/functions/planToWorkspace.ts#L328)).
  [`getNoun`](../../../../../packages/phrase/src/model/workspacePlan/functions/getNoun.ts#L24) already
  steps over the link, which is E2's one frontend change.
- **Keys:** `P` is `noun.possessor`
  ([`keymap.ts:514`](../../../../../packages/frontend/src/keyboard/keymap.ts#L514)), which opens the
  owner and starts the pick. A pick target is taken like any box, with ↵ on it
  ([`phraseRender.tsx:360`](../../../../../packages/frontend/src/components/PhraseBuilder/phraseRender.tsx#L360)).
- **Console:** the pointer is `/poss #n.noun`
  ([`apply.ts:689`](../../../../../packages/phrase/src/language/apply.ts#L689), printed at
  [`print.ts:457`](../../../../../packages/phrase/src/language/print.ts#L457)). A ref that does not
  resolve to a word is refused at apply
  ([L1276](../../../../../packages/phrase/src/language/apply.ts#L1276)), dropped by
  [`normalize.ts:51`](../../../../../packages/phrase/src/language/normalize.ts#L51) and not printed.
  A possessor's own word takes nouns only
  ([`resolve.ts:35`](../../../../../packages/phrase/src/language/resolve.ts#L35)), so "my" can only be a
  pointer to a 1st-person noun elsewhere in the period.
- **OWN_ADJECTIVE has no control** ([C37](../../../../localization/done/C37-own-intensifier.md) Done 4).
  Nothing in `packages/phrase` writes `possessorOwn`.
- **No seed definition and no UI string uses a pointer.** A grep of `backend/src/concepts` for
  `/poss #` found none. So the change moves no composed definition.
- **Pins that assume the copy:** [`buildNounPhrase.test.ts:91`](../../../../../packages/frontend/test/selectionToPlan/functions/buildNounPhrase.test.ts#L91)
  (pointer to `subject` gives `kind: 'pronominal'`), and
  [`e2e/possessor-reference.spec.ts`](../../../../../e2e/possessor-reference.spec.ts#L11)
  (BOY/SEE/DOG in en/it/de/es, unchanged under the link; its chip test reads 彼の犬 in ja).

## Design

### D1. The pointer to the subject *is* the link

1. **Derive it.** The selection keeps `${which}PossessorRef: "subject"`, and the plan builder writes
   `{ kind: 'coreferent', slot: 'subject' }` where D3 allows it, or the features copy where it does
   not.
2. **A separate control**, a "self" chip beside the owner: two gestures for one meaning, and a
   pointer to the subject would still say 彼の.
3. **A new selection field** (`${which}PossessorLink`): saves would carry two ways to say the same
   thing, and `PossessorRef` would have to refuse `subject`.

**Recommendation: (1).** The user's gesture already names the subject, so the model is right and
the plan is wrong. Saved periods become links when loaded, as intended: the six languages change
only where the copy was wrong (the table), and Japanese says 自分の.

### D2. "The subject" is the whole subject

- The link targets the address **`subject` exactly**. `subject/conjunct/i` and `subject/possessor…`
  stay pointers. "The man's cat sees his book" (his = the man) must not become the cat's.
- A **coordinated** subject is bound as the group: "their", 猫と犬は自分の本を見ます. Today the
  same click means the first conjunct alone. The loss is "the cat and the dog see its book" with
  *its* = the cat. It stays sayable with a named owner (the cat's book). It is not accepted as a
  plural pointer, which no other ring offers.
- While a pick is running, the subject's group reads as one target, so the whole group lights up
  when the subject ring is eligible. The line still lands on the block's ring.

**Recommendation: as stated.**

### D3. Where the builder keeps the copy

The link is written only when all of these hold. Otherwise the pointer copies features as it does
today:

- the possessed noun is **outside the subject's subtree**. Its address is neither `subject` nor
  `subject/…`, whether it is a conjunct's owner, an owner's owner or a subject relative's own owner,
  because the engine refuses a link there. A relative clause or content clause *inside* the subject
  is its own period and is judged against its own subject;
- the clause is **active**. Under the passive the link names the demoted agent. That is E2's lead,
  and 自分の本は猫に見られます was probed as questionable Japanese. The copy keeps today's 彼の本は猫に
  見られます;
- the phrase is in a **clause**. A verbless or noun-phrase period has only its subject, so this
  already holds there. E8's address is outside any clause: an owner pointed at the subject from the
  vocative stays a copy.

The gate is one function, `linksToSubject(sel, possessedAddress)`, in `packages/phrase/src/model`.
The plan builder and the chip both read it.

**Recommendation: as stated.** Switching voice or moving a noun into the subject therefore flips a
link back to a copy with no user action. This is the stale-mark rule E12a uses: the selection keeps
the pointer, and the plan says what the clause allows.

### D4. Subjects that are not a noun ring

- **A command.** The command box becomes a coref pick target, and picking it stores
  `PossessorRef: "subject"` like the subject ring would. `linksToSubject` holds under a command, so
  the plan is the link and the engine binds it to the addressee: "see your book", "let's see our
  book", 自分の本を見てください. That also fixes the hidden-subject read. A pointer that is *not*
  linkable under a command (D3) and aims at `subject` is dropped, not copied from the stashed word.
- **An infinitive, a purpose, a citation.** The infinitive box becomes a target the same way. The
  link binds to the controller (subject or object, per `control`) or, in a citation, to the generic
  person ("to see one's book", it *il proprio*). This opens up both rows of the second table. It is
  also what a P13 verb definition wants for "one's own".
- **A relative clause.** Nothing to add. The gap's box holds the head's word and is pickable; for a
  subject relative the engine binds the link to the head.

**Recommendation: all three.** The dashed line lands on the command or infinitive box as it lands on
a ring. The ring-geometry report is keyed by the box's canvas key `subject`, which the mood box
already uses. Follow the report-loop rule: dedupe the reported positions and set plain values.

### D5. The chip on a link

The chip must show what the link says, and a bare noun phrase cannot carry a link (see *Today*).

1. **Render the copy the link binds to.** The frontend works out the subject's person and number,
   **group-aware** (a group is 3rd plural, a command is its addressee), plus the gender pick, and
   requests the phrase as today. This is right in six languages where the gender pick is set, but in
   Japanese the chip says 彼の犬 while the sentence says 自分の犬.
2. **Render the link in context.** A translate option that returns one slot's phrase from a whole
   clause plan: the period's plan, reduced to subject + the possessed phrase, with the chip text
   read from the resolved object. Right in all seven, but it needs an engine/backend hook this
   ticket does not otherwise need.

**Recommendation: (2), scoped as its own step** (Implementation 5). Ship (1) behind it only if (2)
slips, and record the Japanese mismatch then. The chip text stays engine-composed either way. The
label is still the antecedent's word plus the phrase; for a group it names the group's words joined
by its `conjunction.value.*`.

### D6. Keys and console

- **Keys:** none new. `P`, then move to the subject (or the command or infinitive box) and press ↵,
  as today. No Alt layer.
- **Console:** `/poss #n.subj` keeps its syntax and now means the link wherever `linksToSubject`
  holds. Apply accepts `#n.subj` in a period whose subject is the command's addressee or an
  infinitive's controller: it does not answer `Missing noun`. There is nothing more to do, so the
  line just applies. `normalize` and `print` read the same test instead of "resolves to a word", so
  the pointer round-trips. `planToWorkspace` maps `Possessor.coreferent` to `PossessorRef:
  "subject"` on the possessed noun (at any depth: an owner's slice stores the period's address), so
  the link leaves `unsupported`. `Possessor.pronominal` has no address to recover, so
  [P11-E9](P11-E9-pronoun-owner.md) loads it as a free pronoun owner (shipped).

**Recommendation: as stated.** The printed line does not change, so the golden lines stay valid.

## Implementation

1. **Model** (`packages/phrase/src/model`): `linksToSubject(root, possessedAddress)` (D3).
   `buildNounPhrase` gets the possessed noun's address threaded through (the top call's `which`, then
   `…/possessor`, `…/conjunct/i`, `…/standard`) and writes the link when the gate holds.
   `selectionToPlan` and `buildRelativeClause` pass the period root as they do now. Under a command,
   a non-linkable `subject` pointer is dropped (D4).
2. **Round trip:** `planToWorkspace` maps the link (D6).
3. **Canvas:** the mood boxes take part in `linkPickHandlers` (target and ↵). `CorefPickContext.resolve`
   answers `subject` under a command (the addressee pronoun) and under an infinitive (the
   controller's word, or `hint.aNoun`-style fallback for the citation). `ownerChain`'s pointer
   `antecedentKey` lands on the mood box. The group lights up as one target (D2). Measure the canvas
   with a long pointer bow to the command box, and widen it if the chip is crowded rather than
   hiding it.
4. **Console** (`packages/phrase/src/language`): apply, `normalize.ts`, `print.ts` read the new test
   (D6). Diagnostics are unchanged, except that `noNounAt` no longer fires for `#n.subj` in a command
   or infinitive period.
5. **Chip** (D5 (2)): the hook, and `usePossessivePhrases` keyed by the reduced plan.

## Tests

- `buildNounPhrase.test.ts`: `subject` → link on the object, a complement, an owner's owner (the
  nested case at L107) and a standard. The copy survives for a subject conjunct's owner, the subject's
  owner's owner and `subject/possessor` as antecedent, under the passive, and in a verbless period.
  Rewrite the L91 pin to the link.
- `selectionToPlan` / workspace tests: a command with a stashed subject gives the link, never the
  stashed word. A purpose and an object-controlled infinitive give the link.
- `planToWorkspace` tests: a link at depth round-trips to `PossessorRef: "subject"`.
- Engine parity: every table cell above, as plans built from selections, equals `coreference.test.ts`'s
  expectations where they overlap.
- Console: golden `/subj woman /verb see /obj ( book /poss #1.subj )` (prints itself, plan is the
  link); `/command /verb see /obj ( book /poss #1.subj )` applies; `/subj man /verb run /so ( /verb
  see /obj ( mother /poss #2.subj ) )` applies; a round-trip walk op that points an eligible possessor
  at the subject, green at `SEEDS=5000`.
- Canvas: `CorefPickContext.test.tsx`: the command box is eligible; the group is one target.
  `ownerChain.test.ts`: the pointer's `antecedentKey` for a mood box.
- e2e `possessor-reference.spec.ts`: the existing four languages unchanged, and ja
  男の子は自分の犬を見ます; "the woman sees her book" (en/de); "see your book" built by pointing at the
  command box; the ja chip per D5. Constants are spelled out in the spec (shared types only).

## Verification

1. Rebuild the shared and phrase dists; phrase, frontend, engine and backend suites green; typecheck
   and `npm run build` clean.
2. `SEEDS=5000 npx vitest run packages/frontend/test/console/roundTrip.test.ts` from the repo root.
3. In the browser (5173), build every column of both tables. Then switch the verb to the passive:
   the Japanese goes back to 彼の. Then coordinate the subject: *his* becomes *their*.

## Out of scope

- **An OWN control** (C37's `possessorOwn`). With a link it gives 自分自身の; it is the same
  missing control with or without this ticket.
- **Object coreference** and anything cross-clause (E2's follow-ups). Pointing at the matrix subject
  from a content clause stays refused (`Choose a noun in this period`).
- **English *his* for a gendered animal** built on the canvas: the builder seeds `gender: 'masc'` on
  CAT, and both the copy and the link read it. That is a lead for the bug catalogue, not this control.
- **The passive's 自分** (E2's lead): D3 withholds the link there until the engine decides.
