# A03. Modal polarity — each word of the verb group takes its own negation

**Feature:** a negation on each modal of the chain, separate from the main verb's.
**Shape:** `ModalVerb.negative`, the twin of `ModalVerb.modifier`. `VerbPhrase.negative` narrows
to the main verb it sits beside.
**Scope:** all 7 languages. Canvas, keyboard, console and saved phrases. This is a breaking change
to what `negative` means under a modal (§1), with a migration for every plan that relies on the old
meaning.
**Status: shipped.** All seven languages, composing with tense, aspect, voice, mood, relative
clauses and concord; the prohibition falls out of a positive MUST over a negated verb as §3 asked.
Six things landed differently from the plan below, each noted where it occurs:

- **A modal's polarity rides the orbit gap after its disc, not a ring of its own** (§6). A modal is
  a satellite disc, and a disc has no ring: its controls ride the gap on the orbit after it, where
  the controls revealing the next modal and its adverb already sit. That gap stacked two controls
  across the orbit, so the lane spread was generalised to any number and the band grows to hold
  them (`laneShift` / `laneBand` in `ringLayout.ts`) — the geometry yields, nothing is hidden.
- **The console prints a verb's own settings before its modals** (§7), because after an unbracketed
  `/modal can` a `/not` is the modal's. The P02 walkthrough's click-on-*eat* rows now read *can not
  eat*, and that doc says why.
- **French lifts a negative frequency adverb out of the governed group** ("je ne dois jamais ne pas
  aller"), where composing it naively gave three negators, and an indefinite object under a governed
  negation takes "de" — the same A149 rule the finite negator already triggers.
- **German counts the denied words of the group** and writes one "nicht" per denial in the slot the
  sentential one already takes; "kein" absorbs a lone negation only, since it is "nicht + ein".
- **Japanese needed a bridge of its own**, `naiSegs`: a `dict` governor takes the plain ない form,
  and 〜たい, which cannot attach to it, goes through 〜ないでいる. Its concord also gives way to a
  negated inner modal, not only to a negated main verb.
- **The saved-phrase migration lives in `hydrateWorkspace`, not `parseSavedPhrase`** (§6): a phrase
  loaded from the database goes through the former only, so the version travels there from each
  load site.

[A236](../../../bugs/fixed/A236-negative-adverb-under-a-modal-negates-the-modal.md) was filed
while this was specified and is **not** fixed here: a negative adverb (NEVER) on the main verb still
negates the modal. The inner negator this feature builds is what that fix will use.

| lang | "I do not want to go" | "I want to not go" | "I do not want to not go" |
|---|---|---|---|
| en | I do not want to go. | I want to not go. | I do not want to not go. |
| it | non voglio andare. | voglio non andare. | non voglio non andare. |
| fr | je ne veux pas aller. | je veux ne pas aller. | je ne veux pas ne pas aller. |
| es | no quiero ir. | quiero no ir. | no quiero no ir. |
| pt | não quero ir. | quero não ir. | não quero não ir. |
| de | ich will nicht gehen. | ich will nicht gehen. | ich will nicht nicht gehen. |
| ja | 私は行きたくないです。 | 私は行かないでいたいです。 | 私は行かないでいたくないです。 |

The first column is what `{ modals: ['WILL'], negative: true }` renders today. The other two cannot
be composed at all.

## Why

A modal chain is a stack of verbs, and each one can be denied on its own. "I do not want to go"
(¬want) and "I want to not go" (want ¬go) say different things. Both together is an ordinary
sentence. The model has one negation flag for the whole group, so it only reaches the first.

The same gap hides the **prohibition**. MUST + negative was pinned to the ¬must reading in every
tense ("does not have to eat", [`modals.test.ts:489`](../../../../packages/engine/test/modals.test.ts#L489)),
because one flag cannot mean two scopes. That left "you must not eat" (must ¬eat) with no plan at
all. Scoped polarity gives it one: MUST over a negated EAT.

The chain already has the shape this needs. Each modal carries its own adverb
(`ModalVerb.modifier`, "I **never** wanted to **always** go"), so polarity follows the same rule:
**a negation belongs to the word it sits on.**

## Design

### Decision: `negative` negates the word it is attached to

- `ModalVerb.negative` negates that modal.
- `VerbPhrase.negative` negates the **main verb**. Without a modal the main verb is the finite
  verb, so a modal-free plan means exactly what it meant before.
- **Breaking:** under a modal, `{ modals: ['WILL'], negative: true }` changes meaning from "I do
  not want to go" to "I want to not go". The old reading is now spelled
  `{ modals: [{ verb: 'WILL', negative: true }] }`. §5 lists every plan that needs rewriting.

The alternative was to keep `negative` on the finite verb and add position-based flags for the rest
of the chain. That was rejected: the canvas would then show the verb's polarity control negating a
different word (the modal), which is the mismatch that per-modal adverbs already removed.

### Decision: the resolved layer keeps `negative` as the finite verb's negation

Do-support, `ne … pas`, German `nicht` placement, negative concord (`negationSources`) and Japanese
ない all key off `ResolvedVerbPhrase.negative` and read it as "negate the finite verb". The
translator keeps that meaning and moves each flag to where the engine needs it:

- `ResolvedVerbPhrase.negative` ← `modals[0].negative` when there is a modal, else `vp.negative`.
- `ResolvedModal.negative` ← that modal's flag, for the **inner** links only (index ≥ 1).
- `ResolvedVerbPhrase.governedNegative` (new) ← `vp.negative` when a modal governs the main verb.

Every existing finite-negation path, and the ~45 engine-internal tests built on
`ResolvedVerbPhrase` fixtures, stay as they are. The new engine work is just the **inner negator**:
the word each language puts in front of a non-finite element it negates.

### Decision: English splits the infinitive

The inner negator follows the governing modal's link: "want to **not** go", matching the example
this feature was asked for. That keeps "not" beside the word it negates at every depth ("must be
able to not go"). The infinitive citation and the infinitive complement keep "**not** to go"
("I desire not to go"). There, "to" belongs to the construction rather than to a modal's `link`,
and nothing in this feature touches them.

## 1. Shared types — [`packages/shared/src/index.ts`](../../../../packages/shared/src/index.ts)

- `ModalVerb` ([line 754](../../../../packages/shared/src/index.ts#L754)): add
  `negative?: boolean` — "this modal's own negation, not the main verb's". Extend the doc comment's
  example to "I **do not** want to **not** go".
- `VerbPhrase.negative` ([line 768](../../../../packages/shared/src/index.ts#L768)): document it as
  the main verb's negation.
- `VerbPhrase.modals` doc ([line 805](../../../../packages/shared/src/index.ts#L805)): replace "it
  carries the tense, the subject agreement, and the negation". The finite modal carries tense and
  agreement. Each link, and the main verb, carries its own negation.
- `SAVED_PHRASE_VERSION` ([line 1128](../../../../packages/shared/src/index.ts#L1128)): 7 → 8
  (§6).

## 2. Translator — [`resolveVerbPhrase.ts`](../../../../packages/engine/src/translator/functions/resolveVerbPhrase.ts)

- Map the flags as described in *Design*. A bare-string `ModalRef` has no negation.
- `ResolvedModal` ([`types.ts:191`](../../../../packages/engine/src/types.ts#L191)): add
  `negative?: boolean`, documented as inner-links-only. The outermost modal's flag lives in
  `ResolvedVerbPhrase.negative`, so no engine reads `modals[0].negative`.
- `ResolvedVerbPhrase` ([`types.ts:126`](../../../../packages/engine/src/types.ts#L126)): add
  `governedNegative?: boolean`.
- The imperative, the infinitive citation and the purpose clause already clear the modals, and
  the flags go with them.

## 3. Per-engine rendering

The inner negator goes in front of the negated element, after the link of the modal that governs
it. The shared [`modalChain`](../../../../packages/engine/src/functions/modalChain.ts) gains a
`negator` argument for inner modals. Each engine's `verbGroupInfinitive` puts the same negator in
front of the main verb's group when `governedNegative` is set.

| lang | inner negator | want ¬go | must ¬go (the prohibition) | can ¬go | must ¬(be able to) go |
|---|---|---|---|---|---|
| en | not | I want to not go. | I must not go. | I can not go. | I must not be able to go. |
| it | non | voglio non andare. | devo non andare. | posso non andare. | devo non poter andare. |
| fr | ne pas | je veux ne pas aller. | je dois ne pas aller. | je peux ne pas aller. | je dois ne pas pouvoir aller. |
| es | no | quiero no ir. | debo no ir. | puedo no ir. | debo no poder ir. |
| pt | não | quero não ir. | devo não ir. | posso não ir. | devo não poder ir. |
| de | nicht | ich will nicht gehen. | ich muss nicht gehen. | ich kann nicht gehen. | ich muss nicht gehen können. |
| ja | ない form | 行かないでいたいです。 | 行かない必要があります。 | 行かないことができます。 | 行くことができない必要があります。 |

Per-language notes:

- **en.** [`modalFinite`](../../../../packages/engine/src/languages/en/modalFinite.ts#L16)
  is unchanged: it still negates the finite modal, and still says MUST periphrastically ("does not
  have to"). The prohibition "must not go" is a **positive** MUST over a negated GO, so the two
  scopes can no longer be confused. "can not" is written as two words, the conventional spelling
  for the "able to refrain" reading, kept apart from the fused "cannot" (¬can). The past "could not
  go" reads both ways, which is English's own ambiguity (see *Accepted ambiguities*). The negator
  also composes with aspect: "must not have eaten", "want to not be going".
- **it / es / pt.** A plain preverbal negator on the infinitive, before any enclitic ("voglio non
  lavarmi").
- **fr.** `ne pas` stays together before the infinitive and its auxiliary ("je dois ne pas avoir
  mangé"). It never splits around the infinitive the way the finite `ne … pas` does, so
  [`modalGroupFr`](../../../../packages/engine/src/languages/fr/modalGroupFr.ts#L17) only needs a
  prefix for inner links.
- **de.** One `nicht` per negated element, all standing where the sentential `nicht` stands today
  (after definite objects, before the infinitive cluster). An inner one comes after the finite
  one: "ich will das Essen nicht nicht essen". A single `nicht` in a modal cluster reads under
  every scope in German, so ¬want and ¬go both render "ich will nicht gehen". This is accepted. The
  verb-final clause keeps the order: "…, der nicht nicht gehen will".
- **ja.** Modality is suffixal ([`modalSegs`](../../../../packages/engine/src/languages/ja/modalSegs.ts#L28)),
  so the negation goes on whatever the suffix attaches to:
  - a `dict` governor (MUST 〜必要がある, CAN 〜ことができる) takes the plain ない form:
    行かない必要がある, 行かないことができる. The engine already derives it: the negated
    citation renders 行かない.
  - a `stem` governor (WILL 〜たい) cannot attach to ない, so it goes through 〜ないでいる, whose
    stem is い: 行かないでいたい.
  - a negated inner modal negates its own suffix: できない必要がある. A chain that goes through
    ようになる (WILL over CAN) reads できないようになりたい. That is marginal, like the chains in
    [`modals.test.ts`'s Japanese block](../../../../packages/engine/test/modals.test.ts#L530).
  - the copula under a modal: 幸せでない必要がある.

### Negative concord under an inner negation

Today a `no` object or complement puts its negator on the **finite** verb, and it still does when
the main verb is positive ("il gatto non vuole mangiare nessun cibo" stays). When the main verb is
itself negated, that inner negator is the one the `no` agrees with. The finite verb gets nothing,
or the sentence would deny the modal as well:

| lang | the cat wants to ¬eat no food |
|---|---|
| en | the cat wants to not eat any food. — `any` NPI under the inner "not" |
| it | il gatto vuole non mangiare nessun cibo. |
| fr | le chat veut ne manger aucune nourriture. — `aucune` takes the place of `pas` |
| es | el gato quiere no comer ninguna comida. |
| pt | o gato quer não comer nenhuma comida. |
| de | der Kater will kein Essen fressen. — `kein` absorbs the inner `nicht`, as it does the finite one |
| ja | 猫はどの食べ物も食べないでいたいです。 |

[`negationSources`](../../../../packages/engine/src/functions/negationSources.ts) needs a second
reading, scoped to the governed group, when `governedNegative` is set. The finite reading stays as
it is.

### Accepted ambiguities

The plan always differs. Only some surfaces coincide, as they do in the languages themselves:

- **de:** `nicht` in a modal cluster takes any scope ("ich will nicht gehen" is ¬want and want
  ¬go). The idiomatic prohibition is a different modal, "darf nicht" (see *Out of scope*).
- **en:** "could not go" is ¬could and could ¬go.

## 4. Engines — what to touch

`modalChain.ts` (the `negator` argument), each language's `verbGroupInfinitive*` (the governed
negator), en `predicateParts`, fr `modalGroupFr`, de `modalStack` / `modalVerbGroup` /
`finiteNegation`, ja `modalSegs` / `modalSuffixSeg` (the ない form and the ないでい bridge), and
`negationSources`. `groupHasNegativeAdverb` is unchanged (see *Out of scope*).

## 5. Plans that change meaning — rewrite before the translator changes

Each plan below spells ¬modal as `negative: true` and must become `modals: [{ verb, negative: true }]`:

- [`adjectives.ts:1114`](../../../../packages/backend/src/concepts/adjectives.ts#L1114) — MISSING,
  "that one cannot find". `stateGloss` passes `modals` through
  ([`gloss.ts:94`](../../../../packages/backend/src/concepts/verbs/gloss.ts#L94)), so this is a
  change to the plan only.
- [`uiStrings.ts:344`](../../../../packages/shared/src/uiStrings.ts#L344) — `couldNotBe`, the
  error messages ("the phrase could not be saved").
- Engine tests: about 55 plan-level sites spell a negated modal as `negative: true`. Most are in
  `modals.test.ts` (26) and `negation.test.ts` (13), plus relative, verb, hypothetical,
  source, coordination, interrogative, voice and objectPronoun. Rewrite each one's plan, **not** its
  expected string. A test that changes expectation is the wrong rewrite.
- Frontend tests that set `verbModal` with `verbNegative`: `buildVerbPhrase`, `PhraseBuilder`,
  the satellite suites, `phraseSerialize/fixtures.ts`, `canvasKeys`, `ringLayout`.

After the corpus edits: `npm run seed`, then rebuild shared → engine. The backend reads both
packages' `dist`, not their source. The boot render of every definition and UI string must stay green.

## 6. Frontend — [`packages/frontend/src/components/PhraseBuilder/`](../../../../packages/frontend/src/components/PhraseBuilder/)

- **Selection** ([`interfaces.ts:158`](../../../../packages/frontend/src/components/PhraseBuilder/interfaces.ts#L158)):
  `verbModalNegative?: boolean`, `verbModal2Negative?: boolean`, beside the modal adverbs. Add the
  two keys to the satellite `SlotKey` union.
- **Slots** ([`slots.ts:92`](../../../../packages/frontend/src/components/PhraseBuilder/slots.ts#L92)):
  `MODAL_NEGATIVE_SLOTS` and `modalNegativeFor(key)`, mirroring `MODAL_ADVERB_SLOTS` /
  `modalAdverbFor`.
- **Satellites** ([`rawSatellites.tsx`](../../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx)):
  one polarity control per modal box, a copy of `verbNegative` (same icon, `directToggle`,
  `alwaysSet`, `valueLabel`) with `parent: "verbModal"` / `"verbModal2"`, available once that modal
  holds a word, withdrawn with the modals under a command. The verb's own `verbNegative` is unchanged:
  it now negates the verb it is drawn on.
- **Rings** ([`ringSpecs.ts:122`](../../../../packages/frontend/src/components/PhraseBuilder/ringSpecs.ts#L122)):
  the modal negatives take `POLARITY_HOUR` on their own box's ring. That ring holds the next
  modal and the adverb today, so it has room. The verb's solid ring gains nothing. It is at
  capacity, and a seventh control there pushes the direct object off its row.
- **Reducers** ([`phraseReducers.ts:312`](../../../../packages/frontend/src/components/PhraseBuilder/phraseReducers.ts#L312)):
  `setNegative` / `toggleNegative` take the slot. Every place that clears a modal's adverb
  (lines 465 and 492, the modal clear and the command toggle) clears its negative too.
- **Plan** ([`buildVerbPhrase.ts`](../../../../packages/frontend/src/components/PhraseBuilder/selectionToPlan/functions/buildVerbPhrase.ts)):
  put `negative: true` on the modal's `ModalVerb` when its slot is set.
- **Keyboard** ([`keymap.ts:596`](../../../../packages/frontend/src/keyboard/keymap.ts#L596)):
  `verb.negate` already runs in `box:verb`, which covers the modal boxes. Give it a
  `negativeOf(slot)` like `adverbOf` ([line 241](../../../../packages/frontend/src/keyboard/keymap.ts#L241)),
  and widen its `satellite` pattern, so <kbd>N</kbd> on a modal negates that modal.
- **Saved phrases** ([`parseSavedPhrase.ts`](../../../../packages/frontend/src/components/PhraseBuilder/phraseSerialize/functions/parseSavedPhrase.ts)):
  this is the first *semantic* migration, since earlier bumps only added fields. A selection read from a
  v ≤ 7 file with a `verbModal` and `verbNegative: true` moves the flag to `verbModalNegative`. That
  keeps "I do not want to go" meaning the same after loading. Apply it to every selection in the
  workspace, including nested ones (relative, possessor, condition). The one saved phrase in
  `signi.db` today has no modal.

## 7. Console — [`packages/frontend/src/console/language/`](../../../../packages/frontend/src/console/language/)

The user's example, in the console:

```
/subj I /verb ( go /not /modal ( want /not ) )
```

- `/not` and `/pos` ([`commands.ts:537`](../../../../packages/frontend/src/console/language/commands.ts#L537))
  target the closest verb or modal, the way `/adv` does ("the adverb of the closest verb or
  modal"). Widen their `satellites` pattern to the modal negatives, and give `setNegative` its slot.
- **Print** ([`print.ts:258`](../../../../packages/frontend/src/console/language/print.ts#L258)):
  the verb's own polarity is written **before** any modal, as its adverb already is, because
  after an unbracketed `/modal want` a `/not` would be the modal's. A modal with a polarity of its
  own wears a bracket, like a modal with an adverb.
- Keep the print → apply round trip, and stress it with `SEEDS=5000`.

## 8. Tests

### How to write a scope test, and how to find one that drifted

**A negation test that asserts only German proves nothing about scope.** German writes one "nicht"
for either reading, so ¬want and want ¬go are the same sentence there, and a test pinning that
string passes whichever word the plan denies. English collapses the same way on "can not go" /
"could not go" and on a negated inner modal. So a test that means to pin a *scope* must assert at
least one language that splits the two — Italian (*non vuole andare* / *vuole non andare*), French,
Spanish, Portuguese or Japanese (走りたくない / 走らないでいたい).

This is not hypothetical: it is how nine tests written for the clause's own negation crossed this
change still green while quietly meaning the other scope (the "kein" object and predicate-nominal
tests, two "nicht" placement tests, four of A230's prospective tests, and one predicative case).
They now spell the denial on the word they mean — `{ negative: false, modals: [{ verb: 'MUST',
negative: true }] }` — with every expected string unchanged, which is the proof the collapse is real.

**Finding them.** Put a temporary `console.warn` in `resolveVerbPhrase`, behind an env var, firing
whenever a plan resolves with modals and `vp.negative` (the governed path), and run the sentence
suite with `--reporter=verbose`: vitest files console output under `stderr | <file> > <test name>`,
so the output is the list of every test whose *meaning* moved, string or no string. Only the tests
that mean to use the governed path should be on it.

**Engine** — `npm test -w @signi/engine`

- `modals.test.ts`: a `describe('modal polarity')` table with the three columns of the top table,
  and the per-engine table in §3, for every language.
- The prohibition: MUST + ¬EAT is "the cat must not eat" in English, and ¬MUST is still "does not
  have to eat". Add both to the MUST-scope block at line 480, so the two scopes are pinned side by side.
- Both negations with tense (past, future), aspect (resultative "must not have eaten"), voice
  (passive "must not be eaten"), a relative clause (de verb-final "nicht nicht gehen will"), a
  conditional protasis, and a question.
- Concord: the §3 concord table.
- A modal-free plan renders byte-identical before and after (the existing `negation.test.ts`
  covers it, once its modal cases are rewritten).

**Frontend** — `npm test -w @signi/frontend`

- `buildVerbPhrase`: `verbModalNegative` → `modals[0].negative`, and `verbNegative` stays on the
  verb phrase.
- Satellites: the modal box offers polarity once it holds a word, and not under a command.
- Reducers: clearing a modal clears its polarity.
- Saved phrases: a v7 fixture with WILL + `verbNegative` loads as `verbModalNegative`.
- Console: `/verb ( go /not /modal ( want /not ) )` applies, prints back identically, and puts
  each flag on its own word.

**E2E**

- Build GO + WILL, negate the modal box and the verb box, and check the panel shows "I do not want
  to not go" / "non voglio non andare" / 行かないでいたくないです.
- Re-run `e2e/keyboard.spec.ts`. The verb's ring is unchanged, but check that the modal's ring
  still keeps the object on its row.

## Verification

1. `npm run build -w @signi/shared && npm run build -w @signi/engine`, then `npm run seed`.
2. Engine and frontend suites green; workspace typecheck clean.
3. Boot the backend. Every definition and UI string renders; MISSING's tooltip and the "could
   not be saved" errors read as they did before.
4. `POST /api/translate` with the three plans of the top table: all 7 languages match.
5. In-browser: the modal box shows a polarity control, <kbd>N</kbd> on it toggles it, and a phrase
   saved before the change still loads as "I do not want to go".

## Out of scope (follow-ups)

- **A negative adverb on an inner verb still negates the finite one.** Today `NEVER` on GO under
  WILL renders "non voglio andare mai" / "nunca quiero ir" / 決して行きたくない — the scope of "I
  never want to go", not "I want to never go". English keeps the scope, and German "nie" is
  ambiguous anyway.
  [`groupHasNegativeAdverb`](../../../../packages/engine/src/functions/groupHasNegativeAdverb.ts)
  sends every negative adverb in the group to the finite verb by design. Once the inner negator
  exists, it can go to the element it modifies ("voglio non andare mai"). That is a separate
  change to a pinned behaviour, so it gets a ticket of its own.
- **German prohibition as "darf nicht".** Must ¬go is idiomatically a different modal (DÜRFEN,
  permission). That is a lexical choice, not polarity, and would need DÜRFEN seeded.
- **Idiomatic Japanese** (行ってはいけない for must ¬go, 行かないことにしたい for want ¬go). The
  compositional forms above are grammatical. The idioms belong with the existing Japanese chain gap.
- **A third modal on the canvas.** The model is uncapped. The canvas still offers two, and each
  gets a polarity control.
