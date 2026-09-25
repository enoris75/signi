# P09-E50. Attributive standard — a standard control on the noun's ring

**Feature:** the canvas and console control for [E18](P09-E18-attributive-comparison.md)'s
`adjectiveStandards`: "the man sees a bigger cat **than the dog**", "the cat is a bigger animal
**than the dog**". The standard on an attributive adjective, inside a noun phrase.
**Shape:** no engine or seed work. One standard per period noun, kept under the key the predicate
adjective already uses (`${noun}Standard`) and mapped onto the first compared adjective when the
plan is built (D1). Its control sits on the noun's dotted ring and its ring is hosted, as E12c's is
(D2). The console's `/than` covers it, printed in the noun's bracket (D5).
**Scope:** frontend and console, all 7 languages. Every period noun (subject, object, predicate noun,
the box complements); not the hosted rings (D4). No new UI string.
**Status:** **done** 2026-09-25 (see *Done*); filed 2026-09-25 from P09's plan-only constructs; the
engine side is [P09-E18](P09-E18-attributive-comparison.md).

Rendered at HEAD (2026-09-25) from hand-written plans, with the real lexicon:

| lang | the man sees **a bigger cat than the dog** | the cat is **a bigger animal than the dog** | **a cat as big as the dog** eats | the man sees **a less big cat than the dog** |
|---|---|---|---|---|
| en | the man sees a bigger cat than the dog. | the cat is a bigger animal than the dog. | a cat as big as the dog eats. | the man sees a less big cat than the dog. |
| it | l'uomo vede un gatto più grande del cane. | il gatto è un animale più grande del cane. | un gatto tanto grande quanto il cane mangia. | l'uomo vede un gatto meno grande del cane. |
| fr | l'homme voit un chat plus grand que le chien. | le chat est un animal plus grand que le chien. | un chat aussi grand que le chien mange. | l'homme voit un chat moins grand que le chien. |
| de | der Mann sieht einen größeren Kater als den Hund. | der Kater ist ein größeres Tier als der Hund. | ein so großer Kater wie der Hund frisst. | der Mann sieht einen weniger großen Kater als den Hund. |
| es | el hombre ve un gato más grande que el perro. | el gato es un animal más grande que el perro. | un gato tan grande como el perro come. | el hombre ve un gato menos grande que el perro. |
| pt | o homem vê um gato maior do que o cão. | o gato é um animal maior do que o cão. | um gato tão grande como o cão come. | o homem vê um gato menos grande do que o cão. |
| ja | 男は犬より大きい猫を見ます。 | 猫は犬より大きい動物です。 | 犬と同じくらい大きい猫は食べます。 | 男は犬ほど大きくない猫を見ます。 |

## Why

E12c put the standard on the canvas, but only for a predicate adjective: "the cat is bigger than the
dog". The commoner case is a compared adjective inside a noun phrase ("sees a bigger cat than the
dog"), and E18 taught the engine to place it in all seven languages. Nothing can build it yet. P13's
definitions go through the console, so a plan with `adjectiveStandards` cannot become a definition
until the console can print it and read it back.

## Today

Verified at HEAD, 2026-09-25.

- **The plan builder never writes `adjectiveStandards`.**
  [`modifiers`](../../../../../packages/phrase/src/model/selectionToPlan/functions/modifiers.ts#L10)
  builds `adjectives` and `adjectiveDegrees` from the three adjective slots, skipping noun modifiers.
  [`buildNounPhrase`](../../../../../packages/phrase/src/model/selectionToPlan/functions/buildNounPhrase.ts#L40)
  sets `headStandard` only on an adjective head
  ([L46–L49](../../../../../packages/phrase/src/model/selectionToPlan/functions/buildNounPhrase.ts#L46)).
- **The selection key is already per noun.** `STANDARD_KEY(which)` is `${which}Standard`
  ([`interfaces.ts:633`](../../../../../packages/phrase/src/model/interfaces.ts#L633)) and
  `standardAddress` appends `/standard` to any noun address
  ([L610](../../../../../packages/phrase/src/model/interfaces.ts#L610)). Only `predicativeStandard` is
  declared ([L491](../../../../../packages/phrase/src/model/interfaces.ts#L491)).
  `updateStandard` / `removeStandard` take any `NounKey`
  ([`phraseReducers.ts:837`](../../../../../packages/phrase/src/model/phraseReducers.ts#L837)), and
  `clearNoun` drops the standard of any noun ([L153](../../../../../packages/phrase/src/model/phraseReducers.ts#L153)).
  A noun head replacing the predicate adjective drops it
  ([L272–L274](../../../../../packages/phrase/src/model/phraseReducers.ts#L272)); that was E12c's
  deviation "no noun takes one".
- **The canvas has one standard, hard-wired to the predicative.** `STANDARD_ADDRESS` is a constant
  ([`standardRing.ts:15`](../../../../../packages/frontend/src/components/PhraseBuilder/standardRing.ts#L15)).
  `takesStandard` and `standardSpotFor` read `selection.predicative`
  ([L28–L60](../../../../../packages/frontend/src/components/PhraseBuilder/standardRing.ts#L28)).
  `PhraseBuilder` keeps one `standardOpen` boolean
  ([`PhraseBuilder.tsx:263`](../../../../../packages/frontend/src/components/PhraseBuilder/PhraseBuilder.tsx#L263))
  and draws at most one spot ([L588](../../../../../packages/frontend/src/components/PhraseBuilder/PhraseBuilder.tsx#L588)).
  `possessionsFor` takes one `standard`
  ([`ownerChain.ts:92`](../../../../../packages/frontend/src/components/PhraseBuilder/ownerChain.ts#L92)),
  and so does `hostedRects` ([L69](../../../../../packages/frontend/src/components/PhraseBuilder/functions/hostedRects.ts#L69)).
  The owners beside them are already lists keyed by address (`ownersOpen`).
- **The control.** The `predicativeStandard` satellite (Balance icon) exists only for
  `type === "predicative"`
  ([`rawSatellites.tsx:771`](../../../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L771)).
  `buildSatelliteIcons` routes that one key onto the dotted ring's `standard` perimeter kind
  ([L271](../../../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/buildSatelliteIcons.ts#L271)).
  `ringSpecs` already seats a `standard` entry on **any** noun's dotted ring, among the relations at
  `RELATIONS_HOUR` or aimed at its ring once drawn
  ([L240–L249](../../../../../packages/frontend/src/components/PhraseBuilder/ringSpecs.ts#L240)).
- **An attributive adjective has no ring.** It is a disc on its noun's orbit, and a control on a
  disc is a gap control after it, which the next-adjective reveal already uses
  ([`ringSpecs.ts:203`](../../../../../packages/frontend/src/components/PhraseBuilder/ringSpecs.ts#L203)).
- **Console.** `/than` (alias `standard`) takes a `[ … ]` phrase
  ([`commands.ts:435`](../../../../../packages/phrase/src/language/commands.ts#L435)). `takes` accepts only
  the period's predicate adjective
  ([`words.ts:402`](../../../../../packages/phrase/src/language/words.ts#L402)), and the printer writes it
  only there ([`print.ts:449`](../../../../../packages/phrase/src/language/print.ts#L449)). The reference
  step `than` resolves on any noun already
  ([`resolve.ts:229`](../../../../../packages/phrase/src/language/resolve.ts#L229)). The golden misuse
  `/verb seem /pred dog /than cat` pins `noTarget` on a predicate noun
  ([`golden.test.ts:73`](../../../../../packages/frontend/test/console/golden.test.ts#L73)).
- **Plan → workspace.** `NOUN_FIELDS` has `headStandard` but not `adjectiveStandards`
  ([`planToWorkspace.ts:61`](../../../../../packages/phrase/src/model/workspacePlan/functions/planToWorkspace.ts#L61)),
  so a definition that uses the field is reported unsupported. `getNoun`'s `standard` step reads only
  `headStandard` ([L25](../../../../../packages/phrase/src/model/workspacePlan/functions/getNoun.ts#L25)).
- **One reading to know about** (probed): with a possessor and a standard on the same noun,
  fr/es/pt put the possessor after the standard ("un chat plus grand que le chien **de la femme**"),
  which reads as the dog's owner. Italian no longer does, since A271 ("un gatto della donna più
  grande del cane"). E18 chose this placement. The canvas makes it reachable for the first time.

## Design

### D1. One standard per noun, mapped onto the compared adjective

1. **Per noun:** keep `${noun}Standard`. `buildNounPhrase` places it at the index, in `adjectives`,
   of the first adjective whose degree is in `STANDARD_DEGREES`. An adjective head still takes it as
   `headStandard`.
2. **Per adjective slot:** `${adjSlot}Standard` (for example `directObjectAdjective2Standard`), with a
   new address step under the noun.

The engine renders at most one attributive standard per phrase (E18 D1,
[`resolveAdjectiveStandard.ts:23`](../../../../../packages/engine/src/translator/functions/resolveAdjectiveStandard.ts#L23)),
so (2) could hold standards that never render. (1) reuses the address, the `than` reference step,
`isNestedSelectionKey`, the reducers and the hosted ring kind. It also follows the degree: move
"more" from BIG to OLD, and the standard follows it.

**Recommendation: (1).** The index counts real adjectives only, since `modifiers` drops noun
modifiers from `adjectives`. With no compared adjective the field is left out.

### D2. The control sits on the noun's dotted ring

1. **The noun's dotted ring**, as the `standard` perimeter kind, fanned with the relations and aimed
   at its ring once drawn. This is the predicative's seat, so it is the same code.
2. **A gap control after the compared adjective's disc.** It is nearer to what it compares, but it
   shares the gap with the next-adjective reveal, and the ring's line would leave from a disc.

**Recommendation: (1).** The standard is a phrase hosted off the noun, like the owner, whose control
is on the same ring. Subject and object rings took E12a's controls with no growth. The control
appears only once an adjective compares, so plain *cat eats mouse* is unchanged. Measure *the man
sees a bigger cat* before and after anyway (`group-box` rects), and keep `keyboard.spec.ts` green.

### D3. When it is offered, kept and dimmed

- **Offered** on a noun head holding a real adjective whose degree is in `STANDARD_DEGREES`.
- **Kept, and dimmed,** when that degree cycles away or the adjective is removed. This is E12c's rule
  for the predicative: the word survives, and the plan leaves it out.
- **Dropped** with the noun (`clearNoun`), and when a pronoun takes the head.
- **The predicative's head swap keeps it** from adjective to noun and back. "Bigger than the dog"
  becomes "a bigger animal than the dog". This reverses E12c's drop at
  [`phraseReducers.ts:272`](../../../../../packages/phrase/src/model/phraseReducers.ts#L272), because a
  noun now takes one.

**Recommendation: as above.** A shared `comparedAdjectiveIndex(sel, which)` in `packages/phrase`
answers the gate, the dimming and the plan index, so the three cannot disagree.

### D4. Period nouns only

Owners, conjuncts and a standard's own head are hosted rings, and E12a gave them none of its controls.
An attributive standard on them ("the woman's bigger cat than …" inside a possessor) would be a
standard hosted off a hosted ring.

**Recommendation: every `NOUN_KEYS` noun, and no hosted ring**, in a first pass.

### D5. The console: `/than`, in the noun's bracket

`/than` is the only name the construct needs, and there is no collision: it is one command whose
target widens. It is printed in the noun's own bracket after its adjectives and settings, before
`/poss`, which is exactly where the predicate adjective's is:

`/verb ( see ) /obj ( cat /adj ( big /more ) /than [ dog ] )`

Apply's closest-word rule skips the adjective (which does not take `/than`) and reaches the noun.
Because the standard is kept without a compared adjective (D3), `takes` accepts any period noun with
a noun or adjective head, under any degree, as E12c's already does for a predicate adjective. It
refuses a pronoun and a hosted slice. The golden misuse moves to one of those refusals (a pronoun
subject). The reference step (`#1.obj.than`) and `/del than` need nothing new.

**Recommendation: as above.** Printing `/than` inside the adjective's bracket would read better, but
it breaks down when no adjective compares (D3). What a superlative spells is
[E51](P09-E51-superlative-set.md)'s question.

## 1. Model — [`packages/phrase/src/model/`](../../../../../packages/phrase/src/model/)

- `PhraseSelection` declares the standard of each boxed noun beside `predicativeStandard`. It could
  be a mapped type over `NounKey`, but the hand-written fields are the file's convention.
- `buildNounPhrase` writes `adjectiveStandards` (D1). `applyConceptSelect` keeps the standard for a
  noun or adjective head and drops it for a pronoun (D3).
- `planToWorkspace` adds `adjectiveStandards` to `NOUN_FIELDS` and maps the entry that renders onto
  `${which}Standard`. Any other entry is reported unsupported, and so is a `headStandard` on a noun
  head, which renders nothing. `getNoun`'s `standard` step reads either field.

## 2. Canvas — [`packages/frontend/src/components/PhraseBuilder/`](../../../../../packages/frontend/src/components/PhraseBuilder/)

- `standardRing.ts`: `standardSpotsFor` returns one spot per noun, keyed by `standardAddress(noun)`.
  `takesStandard(selection, which)` replaces the predicative-only gate, and `STANDARD_ADDRESS` goes.
- `PhraseBuilder.tsx`: `standardOpen` becomes a record keyed by address, as `ownersOpen` is.
  `besideSpots`, `possessionsFor`, `hostedRects` and `packPeriod` take the list. Each spot packs after
  its own noun's conjuncts.
- `rawSatellites.tsx`: a `${type}Standard` satellite on every `NOUN_KEYS` type, gated per D3.
  `buildSatelliteIcons` routes `/Standard$/` on a noun to its `standard` perimeter entry.
- `visibleSlots.ts` names the ring `slot.standard` in its own noun's colour, which it already does
  through `hostRole`.

## 3. Keyboard — [`keymap.ts`](../../../../../packages/frontend/src/keyboard/keymap.ts)

`noun.standard`, **H** at `box:noun`, when the noun's standard satellite is offered. H is free there
(the scope uses N, G, D, A, V, Q, E, P, C, O, M, L, R and S). The predicate adjective keeps
`predicative.standard`, H at `box:adjective`
([L709](../../../../../packages/frontend/src/keyboard/keymap.ts#L709)), so H means "standard" in both
scopes. `KEY_COMMANDS['noun.standard'] = 'than'`. There is no Alt layer.

## 4. Console — [`packages/phrase/src/language/`](../../../../../packages/phrase/src/language/)

- `words.ts` `takes('standard')` widens (D5). `print.ts` drops `which === "predicative"` from its
  condition and keeps the `!slice` guard. `commands.ts`: `satellites: /Standard$/`.
- Complete (`packages/frontend/src/console/language/complete.ts`) offers `/than` on a period noun.
- **P02 debt:** a `KEY_COMMANDS` entry in `coverage.test.ts`; a `golden.test.ts` line for an object's
  standard, with the misuse moved (D5); a help example; a `phraseCommands` case; and a round-trip walk
  op that names a noun's standard, cycles its adjective's degree and removes the adjective.

## 5. UI strings

None new. `slot.standard`, `action.removeStandard`, `purpose.standard` ("to add a standard of
comparison to an adjective") and `diagnostic.noAdjectiveHasStandard`
([`uiStrings.ts:720`](../../../../../packages/shared/src/uiStrings.ts#L720),
[L2459](../../../../../packages/shared/src/uiStrings.ts#L2459),
[L3119](../../../../../packages/shared/src/uiStrings.ts#L3119),
[L3687](../../../../../packages/shared/src/uiStrings.ts#L3687)) all still say the right thing.

## Tests

- **Model:** `buildNounPhrase.test.ts` covers the index past a noun modifier, two comparatives (the
  first gets it), `positive` (omitted) and the adjective head (still `headStandard`). Reducer cases
  cover the head swap and the pronoun drop. `planToWorkspace` round-trips the table's three plans.
- **Canvas:** `standardRing.test.ts` gives one spot per noun and dims each on its own adjective.
  `rawSatellites.test.tsx` offers the control per noun. `ringSpecs.test.ts` puts the object's standard
  among its relations. `compactLayout.test.ts` packs two standards. `keymap` tests cover H at
  `box:noun`.
- **Console:** the round trip at `SEEDS=5000`, run from the repo root, and the five coverage tests.
  The walk's reach check (`roundTrip.test.ts:509`) also reaches an attributive standard.
- **e2e:** `comparison.spec.ts` builds "the man sees a bigger cat than the dog", checks all seven,
  and checks that the period's rings keep their places. `keyboard.spec.ts` is unchanged.

## Verification

1. Frontend, phrase and backend suites green; workspace typecheck clean. No dist rebuild or reseed.
2. `SEEDS=5000 npx vitest run packages/frontend/test/console/roundTrip.test.ts`.
3. In the browser (5173), build the table's first three columns and read all seven. Cycle BIG to
   `positive` and back, and check that the ring dims and the standard returns.

## Out of scope (follow-ups)

- **The attributive superlative's set** ("the biggest cat of the three"): the engine drops it
  (probed: "the man sees the biggest cat."), so it is an engine ticket first. D1's per-noun key
  already carries it; see [E51](P09-E51-superlative-set.md) D4.
- **A standard on a hosted ring's adjective** (D4), and coordinated standards (E12c's follow-up).
- **The fr/es/pt possessor behind a standard** (*Today*). File it as a bug if it is wanted otherwise.
- The object predicative's standard (A269's field, a predicate `headStandard`, not this one).

## Done

Shipped 2026-09-25, after [E51](P09-E51-superlative-set.md). Each period noun keeps one standard under
`${noun}Standard` (the fourteen fields beside `predicativeStandard` in `PhraseSelection`).
`comparedAdjectiveIndex(sel, which)`, beside E51's predicates in
[`comparison.ts`](../../../../../packages/phrase/src/model/functions/comparison.ts), answers the plan
index, the control's gate and the ring's dimming; `buildNounPhrase` writes `adjectiveStandards` for a
noun head at that index. On the canvas `standardSpotsFor` returns one spot per noun, `standardsOpen`
is a record by address as `ownersOpen` is, and `possessionsFor` / `hostedRectsFor` take the list; the
`${type}Standard` satellite rides every noun's dotted ring (routed by `/Standard$/`), **H** on a noun
box toggles it (`noun.standard`). `/than` widens to any period noun with a noun head and prints in its
bracket before `/poss`; `planToWorkspace` maps the entry that renders and reports the rest.

Engine output from the plans the builder now makes, rendered 2026-09-25:

| | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| sees a bigger cat than the dog | the man sees a bigger cat than the dog. | l'uomo vede un gatto più grande del cane. | l'homme voit un chat plus grand que le chien. | der Mann sieht einen größeren Kater als den Hund. | el hombre ve un gato más grande que el perro. | o homem vê um gato maior do que o cão. | 男は犬より大きい猫を見ます。 |
| is a bigger animal than the dog | the cat is a bigger animal than the dog. | il gatto è un animale più grande del cane. | le chat est un animal plus grand que le chien. | der Kater ist ein größeres Tier als der Hund. | el gato es un animal más grande que el perro. | o gato é um animal maior do que o cão. | 猫は犬より大きい動物です。 |
| a cat as big as the dog eats | a cat as big as the dog eats. | un gatto tanto grande quanto il cane mangia. | un chat aussi grand que le chien mange. | ein so großer Kater wie der Hund frisst. | un gato tan grande como el perro come. | um gato tão grande como o cão come. | 犬と同じくらい大きい猫は食べます。 |
| sees a less big cat than the dog | the man sees a less big cat than the dog. | l'uomo vede un gatto meno grande del cane. | l'homme voit un chat moins grand que le chien. | der Mann sieht einen weniger großen Kater als den Hund. | el hombre ve un gato menos grande que el perro. | o homem vê um gato menos grande do que o cão. | 男は犬ほど大きくない猫を見ます。 |

Measured in `e2e/comparison.spec.ts` (1500×1000): the three `group-box` rects of *the man sees a big
cat* are identical once BIG compares and the object's ring carries the standard control (Subject
147², Verb Phrase 236², Direct Object 283²), so the relations fan took it without growing; the open
standard's ring (190²) is placed below, between the subject and the verb, and the period's rings keep
their places relative to one another.

What landed differently from the plan:

1. **Completion offers a noun `/than` as the canvas offers its control**: once an adjective of the
   noun compares, or while it holds a standard. Offered on every noun, it pushed *meaning* out of the
   first eight topics of a plain noun's command list. Apply still takes `/than` on any period noun.
2. **The golden `than` entry keeps its predicate-adjective line**, with its misuse moved to a pronoun
   (`/subj 1st /than cat`); the object's line, the before-`/poss` print and the hosted refusal are a
   `the attributive standard` block beside it. `help.ts` keeps its one `than` example.
3. **A superlative attributive adjective offers no control** (`takesStandard` reads
   `STANDARD_DEGREES` through `comparedAdjectiveIndex`), per E51 D4.
4. **The e2e measures the rings from the subject's**: opening the standard's picker can scroll the
   page, which moves every rect by the same amount.
5. **Leads, not filed**: fr/es/pt put a possessor after the standard ("un chat plus grand que le
   chien de la femme", "un gato más grande que el perro de la mujer", "um gato maior do que o cão da
   mulher"), which reads as the dog's; English turns the indefinite into "the woman's bigger cat than
   the dog"; Japanese 犬より大きい女の猫 lets より大きい attach to 女.

