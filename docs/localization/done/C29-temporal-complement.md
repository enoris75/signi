# C29. TODAY, JUST, STILL — no complement says *when*

**Kind:** blocked on a construct. Three P09 adverbs whose gloss places an act in time: *on* this
day, a moment *ago*, *up to* now. The engine has complements for where, whither, whence, which way,
why, with what, how, with whom and to whom, and none for when.

_(from the P09 core-vocabulary sweep of 2026-09-22; [P09](../../features/P-planning/P09-core-vocabulary/README.md)
§3, **E3**. The three words are seeded by their B tickets, [B59](B59-time-words.md)
and [B67](B67-place-and-focus-adverbs.md), where every lead is probed; this ticket
owns their glosses. **All three were seeded on 2026-09-22**, when those tickets were authored, and
each shows the English literal in its tooltip until this construct lands.)_

## The concepts

| concept | seeded by | the gloss it waits for |
|---|---|---|
| TODAY | B59 | on this day (it *in questo giorno*, fr *en ce jour*, de *an diesem Tag*, es *en este día*, ja この日に, pt *neste dia*) |
| JUST | B67 | a moment ago (*poco fa*, *il y a un instant*, *vor einem Augenblick*, *hace un momento*, さっき, *há pouco*) — on MOMENT, seeded then, and kept apart from RECENTLY's "a short time ago" |
| STILL | B67 | up to now (*fino ad ora*, *jusqu'à maintenant*, *bis jetzt*, *hasta ahora*, 今まで, *até agora*) |

## Blocked on

**A temporal complement.** `ComplementType` is `locative | direction | source | route | cause |
instrumental | manner | comitative | terminus | predicative | objectPredicative`.

**Where to start, added 2026-09-22.** A concept can now say it names a time:
[`ConceptSeed.temporal`](../../../packages/backend/src/concepts/types.ts) ("a noun naming a point in
time, an occasion, not a rate"), seeded on TIME and read by the measure rule
[A235](../../bugs/fixed/A235-time-under-an-adjective-goes-bare.md) narrowed, and German already
turns it into *zu* ("zu allen Zeiten", A60). That flag is the natural hook for this construct: the
three words waiting here are DAY, TIME and MOMENT phrases, and what each gloss needs is the
adposition its language puts before a time — en *on*, de *an*, ja に, fr *en ce jour* — which is a
lexeme-level fact about the head noun, not a new relation on the verb. A time adverb's
gloss borrows the nearest one, and each gets the adposition wrong somewhere. Probed 2026-09-22,
engine source at HEAD, DAY and MOMENT seeded in memory:

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| TODAY: DAY `this`, locative | in this day | in questo giorno | dans ce jour | in diesem Tag | en este día | この日で | neste dia |
| TODAY: DAY `this`, manner `measure` | at this day | a questo giorno | à ce jour | zu diesem Tag | a este día | この日で | a este dia |
| TODAY: TIME `this` (NOW's gloss) | at this time | a questo tempo | à ce temps | zu dieser Zeit | a este tiempo | この時間で | a este tempo |
| JUST: TIME PREVIOUS (ALREADY's gloss) | at a previous time | a un tempo precedente | à un temps précédent | zu einer vorherigen Zeit | a un tiempo anterior | 前の時間で | a um tempo anterior |
| JUST: MOMENT `definite` PREVIOUS | at the previous moment | al momento precedente | à l'instant précédent | zu dem vorherigen Augenblick | al momento anterior | 前の瞬間で | ao momento anterior |
| STILL: TIME `this`, direction | to this time | a questo tempo | à ce temps | zu dieser Zeit | a este tiempo | この時間へ | a este tempo |

The locative is right for TODAY in Italian, Spanish and Portuguese only: English wants *on*, German
*an*, Japanese に (で is where an action happens), and *à ce jour* means "to date". The TIME rows
restate NOW's and ALREADY's shipped glosses, the first in all seven. "The previous moment" is the one
before another moment, not before now. STILL's direction collides with NOW's gloss in five
languages, and nothing says *until*: `terminus` is the recipient.

## What would move it

A `temporal` complement with a relation, the way `route` and `locative` take a `PathSpecifier`:

1. **at** a time — *on this day*, de *an* + dative, ja に, fr *en ce jour* (or *ce jour-là*);
2. **ago**, measured back from now — *poco fa*, *il y a*, *vor* + dative, *hace*, 前に, *há*;
3. **until** — *fino a*, *jusqu'à*, *bis*, *hasta*, まで, *até*;

and, for P09's function words, *after*, *before* and *during* as three more relations of the same
complement. As a **relative gap** (`headRole: 'temporal'`) it would also say "a period **in which**",
where en/it/es/pt now write the place words *where / dove / donde / onde*: that is the route by which
YEAR's astronomical gloss could ship ("a period in which the earth turns around the sun", probed in
B59), though YEAR itself is owned by [C31](C31-numerals.md), whose calendar gloss is the direct one.

Each gloss then renders through `complementGloss`, exactly as [C25](C25-place-and-direction-adverbs.md)'s
place adverbs do.

## Done (2026-09-22)

**Built, and all three glossed.** The temporal complement is
[`ComplementType`](../../../packages/shared/src/index.ts)'s twelfth member, carrying a
[`TemporalRelation`](../../../packages/shared/src/index.ts) specifier — `at | ago | until | after |
before | during`, all six of the "what would move it" list, `at` by default. It renders in all seven
languages ([`complementsPhrase`](../../../packages/engine/src/languages/en/complementsPhrase.ts) and
its six siblings, [`complementSegs`](../../../packages/engine/src/languages/ja/complementSegs.ts)),
and each gloss reaches it through `complementGloss`, as C25's place adverbs do.

The three glosses, rendered at HEAD:

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **TODAY** | on this day | in questo giorno | en ce jour | an diesem Tag | en este día | この日に | neste dia |
| **JUST** | a moment ago | un momento fa | il y a un instant | vor einem Augenblick | hace un momento | 瞬間前に | há um momento |
| **STILL** | until this time | fino a questo tempo | jusqu'à ce temps | bis zu dieser Zeit | hasta este tiempo | この時間まで | até este tempo |

TODAY is the ticket's target phrase character for character, in all seven. STILL is *not* the "up to
now" the table above asked for — the idiom is built on the adverb NOW, which is no noun phrase — but
on TIME with NOW's own `this`, and the `until` is the whole of what tells the two apart, which is
exactly what B67 found missing: NOW is *a questo tempo*, STILL *fino a questo tempo*. JUST is the
target phrase in six languages; Japanese composes 瞬間前に where the word is さっき.

Every relation, as a clause, on DAY `this` — the six are distinct in all seven languages but German,
where `ago` and `before` are one preposition:

| relation | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| at | on this day | in questo giorno | en ce jour | an diesem Tag | en este día | この日に | neste dia |
| ago | this day ago | questo giorno fa | il y a ce jour | vor diesem Tag | hace este día | この日前に | há este dia |
| until | until this day | fino a questo giorno | jusqu'à ce jour | bis zu diesem Tag | hasta este día | この日まで | até este dia |
| after | after this day | dopo questo giorno | après ce jour | nach diesem Tag | después de este día | この日の後に | depois deste dia |
| before | before this day | prima di questo giorno | avant ce jour | vor diesem Tag | antes de este día | この日の前に | antes deste dia |
| during | during this day | durante questo giorno | pendant ce jour | während dieses Tages | durante este día | この日の間に | durante este dia |

### What landed differently from the plan

1. **`at` is a lexeme's word, the other five are the relation's.** The "where to start" note was
   right that the *at* adposition is a fact about the head noun — English is *on* a day, *at* a
   time, *in* a week; German *an* dem Tag, *zu* der Zeit, *in* der Woche — but wrong that this
   replaces the relation. Both are needed: the noun names a `temporal_prep` form key read only by
   `at` (DAY and WEEK / MONTH / YEAR now carry one in en, it, fr and de), and each language keeps a
   generic fallback for a noun naming none (en *at*, it *a*, fr *à*, de *zu*, es *en*, pt *em*, ja
   に). Spanish, Portuguese and Japanese name none at all: their generic word is already right for a
   day.
2. **Three languages have no preposition for `ago`.** English and Italian postpose a word ("a moment
   **ago**", "un momento **fa**") and Japanese postposes 前に; French, Spanish and Portuguese front
   an impersonal verb that takes the phrase's own article after it ("**il y a** un instant",
   "**hace** un momento", "**há** um momento"). German alone treats it as an ordinary preposition —
   and it is the *same* preposition it uses for `before`, *vor* + dative, a merger the language
   genuinely has. Japanese keeps the two apart with の alone: 瞬間前に against この日の前に.
3. **`during` is the one relation that governs a case of its own.** German *während* takes the
   genitive ("während dieses Tages"), where every other temporal preposition here takes the dative,
   and it falls back on the dative exactly where the cause's *wegen* does — a bare plural has no
   genitive to show ("während Tagen", `genitiveShows`).
4. **Spanish JUST changed its lexeme, to *recién*.** B67 forecast this: the Spanish word was *hace
   un momento*, and the gloss this ticket composes from MOMENT and `ago` renders *hace un momento*
   character for character, so the tooltip would have said the word back. B67 had already named
   *recién* as the fallback, and it is a true adverb, so it takes the `frequency` position the other
   six have. The two pinned renders in `core-adjectives-and-adverbs.test.ts` moved with it.
5. **MOMENT is seeded and stays on the English literal.** B67 named its seven forms and they are
   what shipped (fr *instant*, de *Augenblick*, the other five *moment* / 瞬間). Its own gloss does
   not: "a very short period" wants SHORT, which is not seeded, and the corpus can only compose "a
   small period" — small is not short. Seeding SHORT for one tooltip costs a seven-language paradigm
   no other gloss in this batch uses, so it is recorded here rather than ticketed.
6. **The complement is plan-only, like `objectPredicative` and `comitative`.** It renders from a plan
   and glosses the three adverbs; the canvas draws no ring for it, so it is absent from
   `COMPLEMENT_TYPES` and excluded from the frontend's `BoxComplementType`. Giving it a box means
   adding its selection fields *and* a toolbar for the relation, the way the route and locative
   rings draw one for their path — a frontend task, not this one.
7. **TEMPORAL_COMPLEMENT was seeded**, the grammar term, so the exhaustive label map has the
   `slot.temporal` string its siblings have ("complemento di tempo", "adverbiale Bestimmung der
   Zeit", "adjunto adverbial de tempo", 時間の副詞語句). Nothing shows it while the complement has no
   box; it is there because `COMPLEMENT_LABEL_KEYS` is a total map over `ComplementType`.

### Not done

- **The relative gap (`headRole: 'temporal'`), and with it YEAR's astronomical gloss.** "A period in
  which the earth turns around the sun" still needs the gap, which is a separate piece of machinery
  from the complement: `relativeGapComplement` and each language's relativizer would have to learn
  the temporal head, where en/it/es/pt today write the place words *where / dove / donde / onde*.
  YEAR is glossed either way — [C31](C31-numerals.md) shipped its calendar gloss, "a period
  of twelve months" — so nothing is blocked on it, and no ticket is filed.
- **`ConceptSeed.temporal` was left alone.** DAY, WEEK, MONTH, YEAR, NIGHT and HOUR all name points
  in time and none carries the flag, which today means only that a German *manner* adverbial on one
  of them would say *wie dem Tag* rather than *zu dem Tag*. The temporal complement does not read
  the flag — it reads `temporal_prep` — so flagging them would change renders this ticket does not
  need and nothing pins. Recorded, not ticketed.
- **P09's E3 also names the subordinating *after* / *before* / *during***, the ones that introduce a
  *clause* ("after the cat eats"). This ticket built them as relations on a noun phrase only. The
  clause reading belongs with E4's subordinate clauses, which no ticket owns yet.

### Tests

- `packages/engine/test/complements/temporal.test.ts` — 18 specs: each of the six relations in all
  seven languages, the default `at`, a noun's own preposition against the generic one, German's
  genitive and its bare-plural fallback, coordination, and a per-language check that no two
  relations render alike.
- `packages/engine/test/core-adjectives-and-adverbs.test.ts` — TODAY, JUST and STILL moved out of
  "the words that stay on the literal" into the seven-language gloss table.
- `e2e/definition-tooltip.spec.ts` — three pins: the German `an diesem Tag` (a noun's own
  preposition), the French `il y a un instant` (the impersonal verb), and the Italian STILL / NOW
  pair that the `until` tells apart.
