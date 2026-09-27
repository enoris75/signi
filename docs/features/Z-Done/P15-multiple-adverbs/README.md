# P15. Multiple adverbs — "the cat **often** runs **fast** **here**"

**Feature:** a verb takes more than one adverb. Today it takes one, so *often runs fast*, *already
eats here* and *maybe always sleeps* cannot be said.
**Shape:** `VerbPhrase.modifiers?: string[]` next to `modifier`, which stays as shorthand for a list
of one. The translator merges the two, and each engine places each adverb by its class, the way it
already places the single adverb. On the canvas the adverb disc chains the next one, as a noun's
adjectives do.
**Languages:** all seven. Every engine changes, because each one reads a single `modifier` in its
predicate renderer.
**Status: shipped** in all seven languages (and gsw), on the canvas, in the console and in saved
phrases. One thing landed differently from the plan below:

- **D2 is a primary plus a list, not one slot per class.** The translator keeps `modifier` as the
  **primary** adverb, the highest-ranked one (negative > frequency > manner > direction > place), and
  hands the rest over as `ResolvedVerbPhrase.moreAdverbs` (`verbAdverbs`). A lone adverb is exactly
  the primary it always was, so every engine's negation, concord and slot logic runs unchanged, and a
  frequency extra always has a frequency primary to stand beside. Each engine places the extras by
  class (`moreAdverbsOf` / `moreAdverbText`); English and the four Romance engines share the
  direction and place placement through `complementsAroundAdverb`'s new `more` argument.
  `liftSentenceAdverb` lifts the first sentence adverb wherever it stands and re-picks the primary.

---

## Why

`VerbPhrase.modifier` is one adverb id ([`shared/src/index.ts`](../../../../packages/shared/src/index.ts)),
and `ModalVerb.modifier` is one per modal. The selection has one `modifier` slot and one
`verbModalAdverb` / `verbModal2Adverb` slot per modal. The console's `/adv` fills that one box
(`adverbTarget` in [`words.ts`](../../../../packages/phrase/src/language/words.ts)), so a second
`/adv` replaces the first.

The seeded adverbs fall into classes, and each engine already places each class differently:

| Class (`subtype`) | Words | Where it goes (en) |
|---|---|---|
| manner (none) | FAST, SLOWLY, WELL, TOGETHER, SUDDENLY, EXACTLY, REALLY, … | after the verb and object |
| frequency / time | ALWAYS, OFTEN, NEVER, AGAIN, ALREADY, STILL, NOW, TODAY, … | before the lexical verb |
| place | HERE, THERE, EVERYWHERE, OUTSIDE, FAR_AWAY | with the complements |
| direction | UP, DOWN, LEFT, RIGHT, BACKWARDS | with the complements, before place |
| sentence | MAYBE, PROBABLY, ACTUALLY, OF_COURSE | lifted to the head (`liftSentenceAdverb`) |
| negative polarity | NEVER, NO_LONGER, … | also drives negation and concord |

Two adverbs of *different* classes are the common case, and each one already has a slot. Two of the
*same* class ("fast and well", "here and there") are rarer and belong to coordination.

## Target renderings

CAT RUN, present, with OFTEN + FAST + HERE:

| | |
|---|---|
| en | the cat **often** runs **fast** **here** |
| it | il gatto corre **spesso** **velocemente** **qui** |
| fr | le chat court **souvent** **vite** **ici** |
| es | el gato corre **a menudo** **rápido** **aquí** |
| pt | o gato corre **frequentemente** **rápido** **aqui** |
| de | die Katze läuft **oft** **schnell** **hier** (TeKaMoLo: time before manner before place) |
| ja | 猫が**よく**ここで**速く**走る (frequency first; place after the subject; manner next to the verb) |

These are sketches. Each engine's actual order is written in phase 3, and a native check decides
anything unclear.

## Decisions

**D1. Plan shape: a list next to the shorthand.** *Recommendation:* add `modifiers?: string[]` and
keep `modifier?: string`. The translator reads `[modifier, ...modifiers]`. That keeps every existing
fixture, test and saved phrase valid with no migration. A03 needed a migration because it changed
what a field meant, and this change does not.
*Alternative:* retype `modifier` as `string | string[]`. That is terser in plans, but every reader
has to branch on the type.

**D2. Resolved shape: a primary and the rest** (as shipped; see Status). The plan first proposed
one resolved slot per class. That would have moved the single adverb out of `modifier` in every
engine, where about 40 files read it; keeping it as the primary left all of them untouched.

**D3. At most one negative adverb per verb.** *Recommendation:* the translator keeps the first
negative-polarity adverb and drops any later one, and the console and canvas do not offer a second
(NEVER + NO_LONGER). Negative concord and `finiteHasNegativeAdverb` assume one, and "never no
longer runs" is not a sentence in any of the seven. Two adverbs of the same non-negative class are
kept in author order and joined with a space. Joining them with "and" is left to coordination.

**D4. Main verb only, for now.** *Recommendation:* modals keep one adverb each (`ModalVerb.modifier`).
"never wanted to always go" already works. Stacking adverbs on a modal would repeat all of this work
per link for little gain. The plan type can grow `ModalVerb.modifiers` later in the same way.

## Phases

1. **Model and translator.** `VerbPhrase.modifiers`, the merge, the per-class sort (D2), and the
   D3 rule. Existing tests stay green because a single adverb resolves exactly as it does today.
2. **Selection and plan round trip.** Chained slots `modifier` → `modifier2` → `modifier3`, like
   `subjectAdjective` → `…2` → `…3`, with `buildVerbPhrase` and `planToWorkspace` in both directions.
3. **Engines, one language per commit:** en, it, fr, es, pt, de (with gsw, which forks it), ja. Each
   gets probe renders over the class pairs (frequency+manner, manner+place, frequency+place,
   sentence+frequency, negative+manner), crossed with a modal, a negation, the passive, a question
   and a relative clause.
4. **Console.** `/adv` fills the next free adverb box of the verb instead of replacing the first,
   and the print → apply round trip holds (stress it with `SEEDS=5000`). Clearing one adverb shifts
   the later ones up, as it does for adjectives.
5. **Canvas.** Each adverb disc gets a control that reveals the next one. The control rides the
   orbit gap after the disc, where the modal-chain controls already sit (see A03 §6), so the verb's
   solid ring gains nothing. Measure `CAT EAT MOUSE` anyway before and after, and check that the
   object stays on its row.
6. **Tests.** Engine tests per class pair and language, a console round-trip spec, and an e2e test
   that builds *often runs fast* on the canvas.

## Out of scope

- Coordinated adverbs ("fast **and** well").
- Adverbs on modals (D4).
- Adverbs modifying adjectives or other adverbs. VERY / TOO / A_LITTLE are intensifiers (C33), not
  verb adverbs.

## Follow-ups noticed while shipping

None of these is a P15 regression. Each also shows with a single adverb, or is a lexicon choice:

- **A manner adverb before a noun object** in it, fr, es, pt and de ("sposta velocemente il libro",
  "déplace vite le livre", "hat gut das Buch verschoben"): the existing single-adverb slot. Extras
  follow it, so the stiffness now shows more often.
- **French frequency after an infinitive** ("bien manger souvent la souris"): the frequency primary
  already trails the infinitive, so a short manner extra leads it.
- **AGAIN is a manner adverb**, so NEVER + AGAIN is "non corre mai di nuovo", "ne court jamais de
  nouveau", "läuft nie erneut", where *mai più*, *plus jamais*, *nie wieder* are the idioms.
- **ja WELL and OFTEN are both よく**, so WELL + SLOWLY reads "often slowly".
- **An extra adverb keeps its plain form under negation**: only the primary takes a negative form
  (ALREADY → *yet*). A second focus adverb under a negation would need its own.
- **An instrument's action** (`Complement.action`, "by eating slowly") still reads one adverb.
