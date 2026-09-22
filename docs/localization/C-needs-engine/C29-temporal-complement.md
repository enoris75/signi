# C29. TODAY, JUST, STILL — no complement says *when*

**Kind:** blocked on a construct. Three P09 adverbs whose gloss places an act in time: *on* this
day, a moment *ago*, *up to* now. The engine has complements for where, whither, whence, which way,
why, with what, how, with whom and to whom, and none for when.

_(from the P09 core-vocabulary sweep of 2026-09-22; [P09](../../features/P-planning/P09-core-vocabulary/README.md)
§3, **E3**. The three words are seeded by their B tickets, [B59](../B-needs-seed/B59-time-words.md)
and [B67](../B-needs-seed/B67-place-and-focus-adverbs.md), where every lead is probed; this ticket
owns their glosses once those tickets are authored.)_

## The concepts

| concept | seeded by | the gloss it waits for |
|---|---|---|
| TODAY | B59 | on this day (it *in questo giorno*, fr *en ce jour*, de *an diesem Tag*, es *en este día*, ja この日に, pt *neste dia*) |
| JUST | B67 | a moment ago (*poco fa*, *il y a un instant*, *vor einem Augenblick*, *hace un momento*, さっき, *há pouco*) — on MOMENT, seeded then, and kept apart from RECENTLY's "a short time ago" |
| STILL | B67 | up to now (*fino ad ora*, *jusqu'à maintenant*, *bis jetzt*, *hasta ahora*, 今まで, *até agora*) |

## Blocked on

**A temporal complement.** `ComplementType` is `locative | direction | source | route | cause |
instrumental | manner | comitative | terminus | predicative | objectPredicative`. A time adverb's
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

Each gloss then renders through `complementGloss`, exactly as [C25](../done/C25-place-and-direction-adverbs.md)'s
place adverbs do.
