# C23. The participial state adjectives — an adjective the engine can only say as a noun

**Kind:** blocked on a construct. Twenty-two adjectives, every one of them the state a seeded verb
leaves behind — SAVED is what SAVE leaves, PINNED what PIN leaves — and the engine has exactly one
adjective gloss, `dimGloss`, which says "at/of <degree> <dimension>" and nothing else.

_(from the unsorted sweep of 2026-09-22.)_

## The concepts

WRITTEN, LOADED, TIDY, SAVED, ADDED, REMOVED, FAILED, COPIED, LINKED, PINNED, UNPINNED, RECENT,
NUMBERED, ACTIVE, UNTITLED, EMPTY, VALID, MISSING, UNKNOWN, UNEXPECTED, HIDDEN, VISIBLE.

Eighteen of the twenty-two have their verb seeded already: WRITE, LOAD, TIDY_UP, SAVE, ADD, REMOVE,
COPY, LINK, PIN, UNPIN, HIDE, SEE, KNOW, EXPECT (not seeded — see below), NAME, NUMBER. This is not
a vocabulary problem.

## Blocked on

**A resultative participle gloss: an adjective defined as the state left by a verb.** In words, "that
one has saved"; in the plan, an object-gap relative clause with no head, attached to whatever noun
the adjective ends up modifying.

`patientGloss` builds that clause today and gives it a head, which makes it a **noun phrase** — and
a noun phrase is the wrong category for an adjective's tooltip. Probed 2026-09-22, engine source at
HEAD, with the head dropped to `bare` to get as close as the engine allows:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| SAVED as `patientGloss('OBJECT_THING', 'SAVE')` at `bare` | object that one saves | oggetto che si salva | objet qu'on enregistre | Gegenstand, den man speichert | objeto que se guarda | 保存する物体 | objeto que se salva |

That renders in all seven and is still wrong: it defines *a saved thing*, not *saved*. Put in the
picker beside FILE, which [A23](../done/A23-ui-nouns-patient-and-place.md) ships as "an object
that one saves", the two would read as the same word.

## What would move it

One of two, and the first is much the smaller:

1. **A headless variant of the relative clause** — the same `headRole: 'directObject'` gap that
   `patientGloss` opens, rendered without a head noun and without an article: en *that one saves*,
   de *den man speichert*, ja 保存する. Every engine already builds the clause; what is missing is a
   render mode that emits it alone, the way `PhrasePlan.infinitive` emits a verb phrase alone for
   `infinitiveGloss`. That is the shape [B08](../done/B08-verb-definitions.md) added for verbs, and
   this is its adjective counterpart.
2. **A true participle on the lexeme.** Each language's engine already inflects participles —
   [A194](../../bugs/fixed/A194-french-participle-in-s-doubles-it.md) and
   `agreeParticipleFr` are about exactly that — so an adjective could be glossed as *the participle
   of* a verb and let each engine spell it. This is more faithful and much larger: the gloss would
   have to agree with a noun it does not have.

**Option 1 is the recommendation.** It reuses the clause, it needs no new agreement, and it is one
render mode, not a new grammar.

## Not blocked on vocabulary, with two exceptions

UNEXPECTED needs EXPECT, and UNTITLED needs TITLE, neither seeded. Both are cheap and neither is
worth a B ticket of its own while the construct is missing; whoever builds the construct should
seed the two words in the same change.

RECENT is the one concept here that is **not** participial — "used a short time ago" is a measure on
TIME, not a state left by a verb. [B55](../done/B55-sequence-and-position.md) did not seed SEQUENCE,
which bought nothing it could author, and its own five order words went to
[C24](C24-grammar-feature-adjectives.md) on the reason RECENT shares: an adjective cannot be glossed
by a noun phrase, and position in time is not a scale `dimGloss` reaches. Re-probe RECENT with them,
not here.

## Why this is worth building

Twenty-two concepts is the second-largest block in the sweep, and the construct is also what
[C24](C24-grammar-feature-adjectives.md) needs for its relational adjectives and what
[B54](../B-needs-seed/B54-sensation-and-quality-adjectives.md) names as the blocker on ten of its
nineteen. Between the three tickets, a headless relative clause unblocks **roughly fifty
concepts** — more than any other single piece of engine work the catalogue has ever named.
