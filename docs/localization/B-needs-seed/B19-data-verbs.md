# B19. Data & workspace verbs — 11 app verbs

_(split out of [B08](../done/B08-verb-definitions.md).)_

SAVE, LOAD, ADD, EXPORT, IMPORT, HIDE, COMPACT, EXPAND, TIDY_UP, COORDINATE, START.

**Lowest priority in the split, and the least well-formed.** These are the app's workspace verbs.
Their senses are computing-domain ("to store something so it can be retrieved later", "to send
content out to another place or format") and mostly resist a genus+differentia gloss: the
distinguishing element is a *direction* or *purpose clause*, not an object.

## Why this is one bucket rather than per-genus tasks

Unlike B09–B18, there is no shared genus verb worth seeding here — each would need its own (STORE,
RETRIEVE, COMBINE, COMPRESS, …) for a single verb, and the differentia nouns (CONTENT, FORMAT,
WORKSPACE) are all unseeded and exist only to serve these glosses. That is a poor ratio: a lot of new
corpus vocabulary that no user-facing phrase composes with, purely to fill eleven tooltips.

## Recommendation

**Leave these on their English literals for now.** Revisit only if either becomes true:

1. A user-facing need appears for the nouns (CONTENT, FORMAT, PLACE) independent of these tooltips.
2. The picker starts surfacing these verbs prominently enough that untranslated tooltips are a
   visible gap in the non-English UIs.

If the batch is taken up, split it then — per genus, the same way B09–B18 are split — rather than
authoring eleven one-off genera in a single pass.

## Members and their blocking shape

| verb | distinguishing element | composable today? |
|---|---|---|
| SAVE | purpose clause ("so it can be retrieved later") | no |
| LOAD | direction ("back in") | no |
| ADD | comitative ("together with something else") | no |
| EXPORT / IMPORT | direction + source/terminus | needs B14 builder + PLACE |
| HIDE | causative + negation ("cause not to be seen") | no |
| COMPACT / EXPAND | resultative ("into a smaller space") | no |
| TIDY_UP | resultative + prior state | no |
| COORDINATE | causative ("make parts work together") | no |
| START | causative ("cause to begin") | no |

Note how many are **causatives** — HIDE, COORDINATE, START, and [B15](B15-transfer-verbs.md)'s SHOW.
A causative render mode would unblock all four at once and is the single best engine investment this
bucket points at; file it as a C if it is ever picked up.
