# A02. Near and far — distance relations on the locative

**Feature:** two new spatial relations, **`near`** and **`far`**, on the `locative` complement.
**Shape:** two more values of the existing `PathSpecifier`; no new complement, no new concept.
**Scope:** all 7 languages; offered on the **locative toolbar only** (the route keeps its seven).

| lang | "the cat is near the house" | "the cat is far from the house" |
|---|---|---|
| en | the cat is near the house. | the cat is far from the house. |
| it | il gatto è vicino alla casa. | il gatto è lontano dalla casa. |
| fr | le chat est près de la maison. | le chat est loin de la maison. |
| es | el gato está cerca de la casa. | el gato está lejos de la casa. |
| pt | o gato está perto da casa. | o gato está longe da casa. |
| de | der Kater ist in der Nähe des Hauses. | der Kater ist weit weg vom Haus. |
| ja | 猫は家の近くにいます。 | 猫は家から遠くにいます。 |

## Why

The locative can place its subject *in*, *under*, *over*, *around*, *behind* or *in front of* a
place, but not *near* or *far from* it. Without these, a phrase like "the cat sleeps near the house"
can't be written at all.

Near and far fill the same slot as the existing relations and are built the same way. Each is a
relation between the subject and the place noun, one choice per locative, rendered as an
adposition (or adverb + adposition) in front of the noun phrase. As with the others, the verb
carries static vs. motion: "is near the house" and "sleeps near the house" use the same relation.
Italian and French already build `in_front_of` and `around` as adverb + preposition
("davanti alla", "autour de la"), so no new rendering pattern is needed in Romance.

They differ from the existing relations in one respect, which shapes the scope below. The existing
six describe **configuration** (containment, the vertical axis, the front/back axis, enclosure).
Near and far describe **distance** only, so they're a second axis ("*far* *behind* the house"),
and they're gradable ("very near", "nearer"). This feature treats them as plain toolbar values
and leaves both combinations and degrees out (see *Out of scope*).

## Design

- **One type, two offered subsets.** `near` and `far` join the `PathSpecifier` union. Every engine
  map that route and locative share (`spatialHead`, `PATH_PREP`, `REL_NOUN`) is a
  `Record<PathSpecifier, …>` or an exhaustive switch, so the compiler lists every site to update.
  Which relations a complement *offers* is a UI concern. The locative toolbar shows all nine and
  the route toolbar shows the original seven.
- **Route doesn't offer them.** A route is a traversed path with a shape. "Goes far from the house"
  doesn't describe one, and "goes near the house" reads as a locative anyway. The engines still
  render near/far on a route if a hand-built plan passes them (Japanese 家の近くを行きます is
  valid), so nothing is normalised away and nothing crashes.
- **Far takes the "from" adposition.** Every language builds *far* with its ablative:
  lontano **da**, loin **de**, weit weg **von**, **から**遠く. *Near* takes the dative or genitive
  instead: vicino **a**, の近く. This is ordinary per-language grammar, handled in each
  `spatialHead`.
- **Neither is a default.** `DEFAULT_LOCATIVE_SPECIFIER` stays `in`. `locativeIdiom` keeps firing
  only for `in`, so HOME under near/far is an ordinary noun phrase (see *Out of scope*).

### Decision: overlap with the Romance source adverb

For RUN and JUMP, French, Spanish and Portuguese already prefix a `source` with their "far" adverb
(`SOURCE_ABLATIVE_ADVERB_VERBS`, [`types.ts:23`](../../../../packages/engine/src/types.ts#L23)). So
source and locative-`far` render identically on those two verbs:

| | source (runs *away from*) | locative `far` (runs *far from*) |
|---|---|---|
| fr | le chat court loin de la maison. | le chat court loin de la maison. |
| es | el gato corre lejos de la casa. | el gato corre lejos de la casa. |
| pt | o gato corre longe da casa. | o gato corre longe da casa. |
| it | il gatto corre **via** dalla casa. | il gatto corre **lontano** dalla casa. |

**Accepted.** The two meanings overlap: running *away from* the house takes you *far from* it,
and native speakers read both plans from the same sentence. Italian stays distinct. The overlap is
pinned by a test (§5) so it stays a known, documented equivalence rather than an accident. If it
ever needs breaking, the fix belongs on the source side, not here.

## 1. Shared types — [`packages/shared/src/index.ts`](../../../../packages/shared/src/index.ts)

- `PathSpecifier` ([line 256](../../../../packages/shared/src/index.ts#L256)): add `'near' | 'far'`.
- `PATH_SPECIFIERS` ([line 258](../../../../packages/shared/src/index.ts#L258)): append
  `'near', 'far'`. This stays "every relation an engine renders", and is what the locative offers.
- Add `ROUTE_SPECIFIERS`, the original seven as a literal list, for the route toolbar. Give it a
  one-line doc comment saying the distance relations are locative-only.
- `PATH_SPECIFIER_LABELS` ([line 264](../../../../packages/shared/src/index.ts#L264)):
  `near: 'near'`, `far: 'far from'`.
- Extend the `PathSpecifier` doc comment (≈ lines 242–255) with a paragraph on the distance axis
  and the locative-only offering.

No change to `Specifier`, `Complement`, or the frontend selection shape: `locativeSpecifier` is
already typed `PathSpecifier`.

## 2. Per-engine rendering

Each engine adds two cases to its shared spatial map. Determiners follow the existing rule:
only the definite article fuses with the preposition.

| lang | file | `near` | `far` | determiner behaviour |
|---|---|---|---|---|
| en | [`en.consts.ts:54`](../../../../packages/engine/src/languages/en/en.consts.ts#L54) `PATH_PREP` | `near` | `far from` | none (`nounPhrase` supplies the article) |
| it | [`it/spatialHead.ts`](../../../../packages/engine/src/languages/it/spatialHead.ts) | `` `vicino ${prepDet('a', …)}` `` | `` `lontano ${prepDet('da', …)}` `` | vicino alla / vicino a una; lontano dalla / lontano da una |
| fr | [`fr/spatialHead.ts`](../../../../packages/engine/src/languages/fr/spatialHead.ts) | `` `près ${deDet(…)}` `` | `` `loin ${deDet(…)}` `` | près de la / près du / près d'une / près de maisons |
| es | [`es/spatialHead.ts`](../../../../packages/engine/src/languages/es/spatialHead.ts) | `` `cerca ${deDet(…)}` `` | `` `lejos ${deDet(…)}` `` | cerca del / cerca de una; proper: cerca de África |
| pt | [`pt/spatialHead.ts`](../../../../packages/engine/src/languages/pt/spatialHead.ts) | `` `perto ${contractDet(dePrep, 'de', …)}` `` | `` `longe ${contractDet(dePrep, 'de', …)}` `` | perto da / perto de uma |
| ja | [`ja.consts.ts:56`](../../../../packages/engine/src/languages/ja/ja.consts.ts#L56) `REL_NOUN` / `REL_NOUN_READING` | `'の近く'` / `'のちかく'` | `'から遠く'` / `'からとおく'` | none |
| de | see §3 | `in der Nähe` + genitive | `weit weg von` + dative | see §3 |

Japanese needs no code change. [`complementSegs.ts:92`](../../../../packages/engine/src/languages/ja/complementSegs.ts#L92)
already places the relational noun between the place and its particle, and picks に (existential)
or で (action): 家の近くにいます, 家の近くで走ります, 家から遠くで走ります. The から is part
of the map value, exactly as の is for the existing entries.

The Italian and French proper-noun shortcut ([`it/complementsPhrase.ts:110`](../../../../packages/engine/src/languages/it/complementsPhrase.ts#L110),
[`fr/complementsPhrase.ts:91`](../../../../packages/engine/src/languages/fr/complementsPhrase.ts#L91))
only fires for `in`. Near/far fall through to `spatialHead` like every other relation:
"vicino all'Africa", "près de l'Afrique".

## 3. German

German is the one engine that needs more than two new cases.

- **Near → `in der Nähe` + genitive.** This is the standard written form: "in der Nähe des Hauses",
  "in der Nähe einer Katze", "in der Nähe der Häuser". When the determiner is empty (bare plural,
  or a proper noun without an article), the genitive has no article to carry it, so German
  switches to **`in der Nähe von` + dative**: "in der Nähe von Häusern", "in der Nähe von Afrika".
  (The alternative "nahe" + dative, as in "nahe dem Haus", is grammatical but stilted.)
- **Far → `weit weg von` + dative**: "weit weg vom Haus", "weit weg von der Katze",
  "weit weg von einem Haus".

Changes:

- [`de/spatialCase.ts`](../../../../packages/engine/src/languages/de/spatialCase.ts): widen the
  return type to `'acc' | 'dat' | 'gen'`. `near` → `'gen'`, `far` → `'dat'`.
- [`de/spatialHead.ts`](../../../../packages/engine/src/languages/de/spatialHead.ts):
  `near` → `prepDet('in der Nähe', f, 'gen', plural)`, falling back to
  `prepDet('in der Nähe von', f, 'dat', plural)` when the genitive determiner is empty.
  `far` → `` `weit weg ${prepDet('von', f, 'dat', plural)}` ``.
  The bare fallback changes the case, so `spatialHead` should return `{ head, case }` (or
  `spatialCase` should take the forms). Otherwise the noun below declines in the wrong case.
- [`de/prepDet.ts`](../../../../packages/engine/src/languages/de/prepDet.ts): add the
  **von + dem → vom** fusion alongside in+dem/zu+dem. It is obligatory with the definite article.
  A01 (passive agent "vom Kater") will want it too.
- [`de/complementsPhrase/complementsPhrase.ts`](../../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts):
  - line 68: widen `_case` to `Case` (`'nom' | 'acc' | 'dat' | 'gen'`).
  - line 110: a genitive head noun takes `genitiveS` ("des Hauses", "des Markt**e**s"), not
    `datPluralN`. Weak nouns already decline through `weakN(…, 'gen', …)`.
  - Check that `adjPhrase` and `possessiveDe` decline the genitive on this path
    ("in der Nähe des kleinen Hauses", "in der Nähe meines Hauses"). Both take a `Case`, but
    neither has been exercised in the genitive on a spatial complement yet.

## 4. Frontend — `packages/frontend/src/components/PhraseBuilder/`

- **[`Boxes.tsx`](../../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx)**
  - `SPECIFIER_ICONS` ([line 391](../../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx#L391)):
    `near: <CompressIcon/>`, `far: <ExpandIcon/>`. These are vertical arrows toward and away from a
    line, matching the `VerticalAlign*` icons already used for in/under/over. Both ship in
    `@mui/icons-material`.
  - `SpecifierSelector` ([line 405](../../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx#L405)):
    take an `options: PathSpecifier[]` prop and map over it instead of `PATH_SPECIFIERS`.
- **[`VerbPhraseBuilder.tsx`](../../../../packages/frontend/src/components/PhraseBuilder/VerbPhraseBuilder.tsx)**:
  pass `options={ROUTE_SPECIFIERS}` to the route selector (≈ line 141) and
  `options={PATH_SPECIFIERS}` to the locative selector (≈ line 160). Update the locative comment
  to mention the distance relations.
- **[`graph.ts:67`](../../../../packages/frontend/src/components/PhraseBuilder/graph.ts#L67)**
  `toolbarButtons`: route → `ROUTE_SPECIFIERS.length` (7), locative → `PATH_SPECIFIERS.length` (9).
  The locative toolbar grows by 48px (two 22px buttons plus two 2px gaps), and the box padding that
  keeps the toolbar clear of the corner buttons is derived from this count.
- No reducer, `selectionToPlan`, or `phraseSerialize` change. `locativeSpecifier` already carries
  any `PathSpecifier` straight into the plan. Saved phrases only gain new *values*, so
  `SAVED_PHRASE_VERSION` stays as is.
- Tooltips read `PATH_SPECIFIER_LABELS`, which is English-only like the other relation labels.
  Localizing the toolbar is a separate task.

## 5. Tests

**Engine** — `npm test -w @signi/engine`

- [`test/complements/locative.test.ts`](../../../../packages/engine/test/complements/locative.test.ts):
  a `near` and a `far` test using the existing `atPlace` helper (line 195), asserting the full
  7-language table at the top of this doc. The existing `test.each(PATH_SPECIFIERS)` "renders in
  every language" (line 276) picks up both automatically.
  - **Action verb:** `atPlace('near', 'RUN')` → ja 家の近くで走ります, de "läuft in der Nähe des
    Hauses".
  - **Determiners:** indefinite (it "vicino a una casa", fr "près d'une maison", de "in der Nähe
    eines Hauses", "weit weg von einem Haus"); plural (de "in der Nähe der Häuser", "weit weg von
    den Häusern"); bare plural (de "in der Nähe von Häusern").
  - **Proper noun:** AFRICA (en "near Africa", it "vicino all'Africa", de "in der Nähe von Afrika").
  - **Genitive noun ending:** a masculine head, e.g. de "in der Nähe des Marktes".
- [`test/complements/source.test.ts`](../../../../packages/engine/test/complements/source.test.ts):
  pin the accepted overlap. RUN + source HOUSE equals RUN + locative `far` HOUSE in fr/es/pt, and
  the two differ in it ("via dalla" vs "lontano dalla").
- `route.test.ts`: leave `test.each(PATH_SPECIFIERS)` as is. It now also proves a hand-built route
  with near/far renders without an empty adposition.
- Colocated unit tests: add near/far rows to each `*/spatialHead.test.ts` (it/fr/es/pt/de).
  [`de/spatialCase.test.ts`](../../../../packages/engine/src/languages/de/spatialCase.test.ts):
  `near` → `gen`, `far` → `dat`. Add a von+dem→vom case to the `prepDet` tests.

**Frontend** — `npm test -w @signi/frontend`

- [`test/Boxes.test.tsx:431`](../../../../packages/frontend/test/Boxes.test.tsx#L431): "offers
  every spatial relation, in order" renders with an explicit `options` list. Add one case for
  `ROUTE_SPECIFIERS` (no near/far) and one for `PATH_SPECIFIERS` (both present).
- `VerbPhraseBuilder.test.tsx`: the locative toolbar offers "near" / "far from" and the route
  toolbar does not. Selecting "near" sets `locativeSpecifier: 'near'`.

**E2E**

- The wider locative toolbar shifts box geometry. Re-run
  [`e2e/tidy.spec.ts`](../../../../e2e/tidy.spec.ts) and
  [`e2e/compact.spec.ts`](../../../../e2e/compact.spec.ts), which check toolbar overlap and
  visibility.
- Add one spec: reveal a locative on BE, pick HOUSE, click "near", and assert the translations
  panel shows "near the house" / "vicino alla casa" / 家の近く.

## Verification

1. `npm run build -w @signi/engine`. The backend runs the built engine `dist`, not `src`.
2. Engine and frontend test suites green; workspace typecheck clean. The widened `PathSpecifier`
   must be handled in every `Record`/switch, and German `_case` must thread `'gen'` cleanly.
3. API: `POST /api/translate` with a BE + locative `{ kind: 'path', value: 'near' | 'far' }` plan.
   Check all 7 languages against the table, plus the German bare and proper-noun fallbacks.
4. In-browser (5173): the locative toolbar shows nine relations and the route toolbar seven. Pick
   near/far and watch the panel update, and check the toolbar doesn't overlap the corner buttons.

## Out of scope (follow-ups)

- **Combined distance + configuration** ("far behind the house", "right under the bed"). Model
  distance as its own optional control beside the relation, not as combined toolbar values like
  `far_behind`.
- **Degrees and comparatives** ("very near", "nearer the house", "farthest from"). `en.consts.ts`
  already lists `far: ['farther', 'farthest']`, but nothing on a complement reads a degree today.
- **Adverbial near/far without a place** ("sleeps nearby", "lives far away"). These are adverb
  concepts to seed, not locative relations.
- **HOME idioms under near/far** ("near home", "vicino a casa", "cerca de casa", "perto de casa").
  `locativeIdiom` is `in`-only, so these render as "near the home" for now. This is a documented
  gap.
- **Localized toolbar tooltips.** All relation labels are English-only today.
