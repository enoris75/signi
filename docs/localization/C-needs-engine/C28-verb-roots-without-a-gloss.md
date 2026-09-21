# C28. The verb roots — the genera every other verb gloss stands on

**Kind:** mostly **deliberately left on the English literal**, like
[C05](../done/C05-non-distinguishing-genera.md); a few blocked on a named construct. Forty-five
verbs, and they are to the verb lexicon what [C26](C26-root-nouns-on-the-literal.md)'s roots are to
the nouns: CREATE, CHANGE, HAVE, INDICATE, TRANSFER, MOVE_ONESELF, BE. Almost every verb gloss
[B09](../done/B09-create-verbs.md)–[B19](../done/B19-data-verbs.md) shipped is built out of one of
them.

_(from the unsorted sweep of 2026-09-22. Fifteen verbs went to
[A24](../A-ready/A24-ui-verbs-genus-and-object.md) and three to
[A25](../A-ready/A25-causative-verbs.md). These forty-five are the rest of the 63 undefined verbs.)_

## The concepts

CONSUME, DESIRE, KNOW_ACQUAINTED, INCLUDE, CONFINE, CREATE, DESTROY, PERCEIVE, UNDERSTAND, HAVE,
DIVIDE, STRIKE, INDICATE, CHANGE, TRANSFORM, SHED, PRODUCE, CAUSE_VERB, PRESS, WRITE, FILTER, LINK,
REMOVE, CANCEL, RESTORE, OPEN, CLOSE, MOVE, LEAVE, DRAG, SET, PIN, UNPIN, APPLY, GOVERN, ACCEPT,
REPLACE, ACT, WORK, BEGIN, CHANGE_ONESELF, TRANSFER, MOVE_ONESELF, BECOME, BE.

## Why a verb root gets no gloss

`infinitiveGloss` says *genus + differentia*: "to consume food", "to create objects". A root has no
genus, and reaching for one produces its own child's gloss. Probed 2026-09-22, engine source at
HEAD:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| CREATE as `infinitiveGloss('MAKE', 'OBJECT_THING', 'plural')` | to make objects | fare oggetti | faire des objets | Gegenstände machen | hacer objetos | 物体を作る | fazer objetos |
| CHANGE as `infinitiveGloss('MAKE', { object: 'OBJECT_THING', adjectives: ['OTHER'] })` | to make another object | fare un altro oggetto | faire un autre objet | einen anderen Gegenstand machen | hacer otro objeto | 別の物体を作る | fazer outro objeto |

Both render in all seven, and the second is already COPY's plan in
[A24](../A-ready/A24-ui-verbs-genus-and-object.md). MAKE is the only verb above CREATE and CHANGE,
and it is glossed itself — so a gloss here either restates MAKE or steals a sibling's.

**TRANSFORM and DRAG were drafted into A24 and moved here for exactly this reason**:
`infinitiveGloss('CHANGE', …)` renders TRANSFORM as "to change objects" and
`infinitiveGloss('MOVE', …)` renders DRAG as "to move objects", each indistinguishable from its own
genus — and its genus, being on this list, has no gloss to be distinguished from.

## The ones blocked on something nameable

### BE, CONSUME and CAUSE_VERB — already decided

[C08](../done/C08-copular-and-genus-verbs.md) recorded all three as literal by design. Carried here
so the sweep's verbs are counted in one place; **not re-opened**. BE renders "to be active" on
`infinitiveGloss('BE', { predicate: 'ACTIVE' })` in all seven, which defines the copula by one
arbitrary predicate.

### REPLACE — already decided

[C05](../done/C05-non-distinguishing-genera.md) probed it four ways on 2026-09-21 and found that
"in place of" is an idiom in each language, not a locative on PLACE: it *al posto di*, fr *à la
place de*, de *an der Stelle*, ja の代わりに. What would move it is a preposition-like "instead of"
relation, which no complement has, and [C22](../done/C22-ui-help-prose.md) already found another way
to say the same idiom for the help prose. **Not re-opened.**

### EAT_ANIMAL's problem, which six verbs share

A24 ships EAT_ANIMAL as "to consume food" with a warning: its real differentia is its **subject** —
*to consume food, **of an animal*** — and an infinitive gloss has no subject to constrain. The same
is true of WORK ("of a thing, to function"), ACT, BECOME, CHANGE_ONESELF and MOVE_ONESELF, whose
meanings are all about who or what does them.

**What would move them: a subject constraint on an infinitive gloss** — a way to say *of an animal*,
*of a thing* alongside the citation form. Every language spells it as a parenthetical, which is
editorial rather than grammatical, so this may be better solved by leaving the six on the literal
than by building it. Recorded, not recommended.

### PERCEIVE, UNDERSTAND, KNOW_ACQUAINTED, DESIRE

These four are genuinely distinguishable and genuinely hard. Probes on 2026-09-22:

- `infinitiveGloss('KNOW', 'MEANING')` gives UNDERSTAND "to know meaning" — fr *connaître **du**
  sens*, a partitive where the sense wants none.
- `infinitiveGloss('FEEL', { infinitive: 'ACT' })` gives DESIRE "**to feel to act**", ungrammatical
  in English: FEEL does not govern an infinitive in any of the seven.

Both want a genus that is not seeded — a verb of wanting above DESIRE, a verb of grasping above
UNDERSTAND — which makes them **B work, not C**, the day someone proposes the words. They are here
because no one has, and the sweep did not want to invent four verbs to gloss four verbs.

## What would move the whole ticket

Nothing worth building. Thirty-eight of the forty-five are primitives of the verb lexicon, three
were decided by C08, one by C05, and the remaining four are a B ticket waiting on a vocabulary
proposal. The honest summary is the same as [C26](C26-root-nouns-on-the-literal.md)'s: **a language
describes itself with something**, and this is most of what Signi describes itself with.
