# P14. The noun modifier's relation, from the word — "time flies" is *le mosche del tempo*

**Feature:** a noun used as a modifier starts from the relation it usually has, not always `feature`.
A noun seed says which relation it takes when it modifies another noun (`modifierRelation`, the way
`mannerRelation` says how a noun enters a manner adverbial). The canvas chip, the console and the
plan all start from that value. The author still changes it with R, Shift+R or `/feature` · `/purpose`
· `/material` · `/domain`.
**Shape:** a new seed field, carried onto `Concept`, and one helper in `@signi/phrase` that replaces the
six places where `"feature"` is hard-coded as the default. The console round trip treats "the word's
own relation" as the unset value. The engine does not change: a plan always carries its relation.
**Languages:** Italian, French, Spanish and Portuguese, the four where the relation shows in the
output. English, German and Japanese neutralise it (*time flies*, *Zeitfliegen*, 時間のハエ).
**Status:** planning. D1 and D3 carry recommendations. **D2 is open** and blocks phase 5 only.

---

## Why

The console line `/subj ( fly /adj ( time ) /pl /zero ) /verb ( like ) /obj ( arrow /a )` renders in
Italian as *a mosche **a tempo** piace una freccia*. (The missing article is a separate defect,
[A376](../../../bugs/A-must-fix/A376-romance-bare-plural-subject-loses-its-article.md).) *Mosche a
tempo* would be "timed flies", like *contratto a tempo*. The phrase means "flies of time", which is
`domain`: *le mosche del tempo*. The comment on `ModifierRelation` in
[`shared/src/index.ts`](../../../../packages/shared/src/index.ts) uses "time flies" as its own example of
`domain`.

Three things combine to produce it:

1. **Every noun modifier starts as `feature`.** That is the first value of `MODIFIER_RELATIONS`, and
   nothing about the words changes it.
2. **English hides the choice.** "time flies" reads the same under all four relations, so an author
   who reads English output never sees the one they got. The chip under the box does say *feature*,
   but nothing on the page suggests that it is wrong.
3. **The right relation depends on the words.** Italian links TIME in three ways:

| Relation | Italian | Time is… | Heads |
|---|---|---|---|
| `feature` | ***a** tempo* | the mechanism, mode or limit the head works by (like *barca a vela*, *pagamento a rate*) | *bomba, gara, prova, contratto, parcheggio, tariffa a tempo*; *lavoro a tempo pieno* |
| `domain` | ***del** tempo* | the one abstract whole the head belongs to or is about; the article is generic | *le mosche, il signore, la macchina, la freccia, la misura, la gestione del tempo* |
| `material` | ***di** tempo* | stuff, and the head is an amount or stretch of it | *unità, intervallo, lasso, periodo, perdita, spreco, limite, questione di tempo* |
| `purpose` | ***da** tempo* | — reads as the adverb "for a long time" (*è qui da tempo*); no head takes it | — |

The four languages spell the relations differently (TIME modifying FLY_INSECT, rendered at HEAD):

| | `feature` | `purpose` | `material` | `domain` |
|---|---|---|---|---|
| Italian | la mosca a tempo | la mosca da tempo | la mosca di tempo | la mosca del tempo |
| French | la mouche à temps | la mouche de temps | la mouche de temps | la mouche du temps |
| Spanish | la mosca de tiempo | la mosca de tiempo | la mosca de tiempo | la mosca del tiempo |
| Portuguese | a mosca a tempo | a mosca de tempo | a mosca de tempo | a mosca do tempo |

So in all four the wrong default costs the article of `domain`, and in Italian, French and Portuguese
it also shows the wrong preposition. French *à temps* and Italian *da tempo* also read as adverbs
("on time", "for a long time").

The relation belongs to the pair of words more than to either one: TIME is `feature` under BOMB and
`domain` under FLY. But one reading per modifier noun is far more often right than always `feature`:
FRUIT, TIME and SEA are usually `domain`, GOLD and WOOD `material`, SUN `purpose`, SAIL and STEAM
`feature`.

## Today

| | Where | The default |
|---|---|---|
| The plan | [`modifiers.ts:19`](../../../../packages/phrase/src/model/selectionToPlan/functions/modifiers.ts#L19) | `sel.modifierRelations?.[key] ?? "feature"` |
| The chip | [`phraseRender.tsx:383`](../../../../packages/frontend/src/components/PhraseBuilder/phraseRender.tsx#L383) | same, to label the chip and its tooltip |
| R / Shift+R | [`phraseReducers.ts:535`](../../../../packages/phrase/src/model/phraseReducers.ts#L535) `cycleModifierRelation` | the cycle starts from `feature` |
| The console's value | [`words.ts:338`](../../../../packages/phrase/src/language/words.ts#L338) | an unset relation reads `feature` |
| Normalising | [`normalize.ts:86`](../../../../packages/phrase/src/language/normalize.ts#L86) | a stored `feature` is dropped as the default |
| Plan → canvas | [`planToWorkspace.ts:430`](../../../../packages/phrase/src/model/workspacePlan/functions/planToWorkspace.ts#L430) | only a relation other than `feature` is stored |

Placing a new word in the slot already clears the slot's settings (`clearSlotSettings` in
[`phraseReducers.ts`](../../../../packages/phrase/src/model/phraseReducers.ts)), so a relation set for
one word never carries over to the next. Every one of the six sites has the modifier's `Concept` at hand.

The pattern to copy is `mannerRelation`: a seed field, stored as the lexeme column `manner_relation`
([`lexicon.ts:97`](../../../../packages/backend/src/lexicon.ts#L97)), put onto `Concept` by
`seedConcept` ([`definitionText.ts:61`](../../../../packages/backend/src/concepts/definitionText.ts#L61))
and by `listConcepts`, with a test holding the two equal.

## Design

### 1. The seed field

```ts
// nouns.ts, TIME
// As a modifier it is the whole that a head belongs to: "le mosche del tempo", "la macchina del
// tempo". A timed thing, "bomba a tempo", is the feature, set on the chip.
modifierRelation: 'domain',
```

`modifierRelation?: ModifierRelation` on the noun seed and on `Concept`. Leaving it out means `feature`,
so every noun seeded today keeps its behaviour until someone assigns it.

### 2. One default, in `@signi/phrase`

```ts
/** The relation a noun modifier has when the author has not set one: the word's own, else `feature`. */
export function defaultModifierRelation(modifier: Concept): ModifierRelation {
  return modifier.modifierRelation ?? 'feature';
}
```

All six sites read it instead of the literal. The stored value keeps its meaning: *unset* is "the
word's own", and a stored value is only ever one that differs from it. That is what `normalize.ts` and
`planToWorkspace.ts` both need in order to agree.

### 3. The console

`/adj ( time )` means `domain`. `/adj ( time /feature )` is how an author gets *bomba a tempo*. The
printer emits a relation only when it differs from the word's own, so a canvas-built "time fly" prints
as `/adj ( time )` and applies back to the same thing. The P02 round trip must hold:
stress it with `SEEDS=5000` once seeds carry the field.

Definitions compile through the console, so a definition that names a noun modifier without a
relation would change when its noun gets a default. Today only two do, STICK (`WOOD /material`) and
REGISTER (`FORMALITY /material`), both explicit. The boot check re-renders every definition anyway.

### 4. The chip (D3)

The chip shows the relation it will render, whatever its source. With an Italian, French, Spanish or
Portuguese interface it can add the linking word, *dominio · del*, so the author sees what they get
without switching the output language. See D3.

### 5. Assigning the defaults

Assign `modifierRelation` to the nouns that are commonly modifiers, each with a one-line comment
naming its reading, as `mannerRelation` is commented. Of the nouns named above only TIME, WOOD and
WATER are seeded today, so the first list is TIME `domain` and WOOD / WATER `material`. FRUIT, GOLD,
SUN, SEA, SAIL, STEAM and BOMB take theirs when they are seeded. Leave a noun unset rather than guess,
since unset is today's behaviour. Grep the tests and `uiStrings.ts` for `nounModifiers` first: the 14 `material`
entries there are explicit and do not move.

## Decisions

- **D1 — Does the plan keep writing the relation?** *Recommended: yes.* `NounModifier.relation` stays
  required and `selectionToPlan` resolves the default before the plan leaves the phrase package. The
  engine, the saved workspaces and the backend's plans stay as they are. A default applied in the
  engine instead would change the meaning of every stored plan whose noun gets a default.
- **D2 — Refine by the head's class? (open)** A per-head override,
  `modifierRelations?: { [headIsA: string]: ModifierRelation }` resolved up the head's `isA` chain,
  would let TIME be `feature` under an event or a device (*gara a tempo*, *bomba a tempo*) and
  `material` under a quantity (*unità di tempo*). The seeded classes are sparse: ACT, QUANTITY,
  CONTAINER and SUBSTANCE exist, and there is no DEVICE or EVENT. So this waits until a second pair
  needs it. It then asks for a head-aware `defaultModifierRelation(modifier, head)`, which the canvas
  has (the head is in the same block) and the console has too.
- **D3 — The linking word on the chip.** *Recommended: yes, for the four Romance interface
  languages.* It needs a small per-language table in `@signi/shared` beside the UI strings, not an
  export from the engine, whose `REL_PREP_*` tables are internal. It shows the preposition only, not
  the article of `domain`: *del* is the fused form, and a table of four fused forms per language
  covers it.
- **D4 — Refuse `purpose` for TIME?** *Recommended: no.* *Da tempo* is a misreading, not a
  grammatical error. Once the default is `domain`, authors reach `purpose` only on purpose.

## Out of scope

- **Weather.** Italian *tempo* also means weather, and *del* brings that reading out with some heads
  (*previsioni del tempo* is the weather forecast). Portuguese and Spanish share it. Only a context
  larger than the phrase could avoid it.
- **Compounds that are not a relation.** *Fuso orario* (an adjective), *viaggio nel tempo* (a place),
  *bomba a orologeria* (an idiom). These are words of their own and are seeded as concepts, not built
  from a modifier.
- **English, German and Japanese**, which neutralise the relation.

## Phases

1. **The field.** `modifierRelation` on the seed type, the lexeme column, `seedConcept`,
   `listConcepts` and `Concept`, with the test that holds `seedConcept` and `listConcepts` equal.
2. **The default.** `defaultModifierRelation` and the six sites. Unit tests in `packages/phrase`: an
   unset slot plans the word's relation; R starts its cycle from it; replacing the word resets it.
3. **The console.** Printing, applying and normalising against the word's default; the round-trip
   stress run.
4. **The seeds.** TIME and the first list, each commented. An engine test renders *le mosche del
   tempo*, *les mouches du temps*, *las moscas del tiempo* and *as moscas do tempo* from an unset
   relation. An e2e test picks TIME into FLY's adjective slot and reads *domain* on the chip. Spell
   out constants in the spec, since e2e specs cannot value-import `@signi/shared`.
5. **The chip's linking word (D3)**, and the head-class refinement once D2 is decided.
