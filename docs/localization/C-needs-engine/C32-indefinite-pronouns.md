# C32. SOMETHING, and ONLY's "nothing more" — no indefinite pronoun

**Kind:** blocked on a construct. P09's *something* is a pronoun that is not a person, and it turns
into *nothing* or *anything* under negation. ONLY's gloss needs the negative one.

_(from the P09 core-vocabulary sweep of 2026-09-22; [P09](../../features/P-planning/P09-core-vocabulary/README.md)
§3, **E7**. ONLY is seeded by [B67](../done/B67-place-and-focus-adverbs.md), which probes
every lead; this ticket owns its gloss. **ONLY was seeded on 2026-09-22**, when B67 was authored,
and shows the English literal in its tooltip until the indefinite pronoun lands.)_

## The concepts

| concept | role | why it waits |
|---|---|---|
| SOMETHING | pronoun | cannot be seeded: *qualcosa, quelque chose, etwas, algo, 何か, algo*, and under negation *niente, rien (ne … rien), nichts, nada, 何も…ない, nada* — English *nothing* or *not … anything* |
| ONLY | adverb (B67) | its gloss: and nothing more (*e nient'altro*, *et rien d'autre*, *und nichts anderes*, *y nada más*, 他には何もない, *e nada mais*) |

## Blocked on

**An indefinite pronoun.** The seeded pronouns are the three grammatical persons and GENERIC_PERSON
("one"), all rendered from person and number; none stands for an unnamed thing, and none changes
under negation. There is no plan to probe for SOMETHING. ONLY's construct-free leads, probed
2026-09-22 at HEAD:

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| ONLY: WAY SOLE, `mode` | in a sole way | in un modo unico | d'une manière unique | auf eine einzige Weise | de una manera única | 単一の方法で | de uma maneira única |
| ONLY: OBJECT_THING `no` OTHER, similative | like no other object | come nessun altro oggetto | comme aucun autre objet | wie kein anderer Gegenstand | como ningún otro objeto | どの別の物体もない | como nenhum outro objeto |

SOLE says "unique"; the negated similative says "unlike anything", and どの別の物体もない is "there is
no other object".

## What would move it

1. **An indefinite pronoun concept** with a positive and a negative form, swapped under negation the
   way the `no` determiner already becomes *any* ([C03](../done/C03-adverb-definitions.md) built the
   Japanese どの…も…ない circumfix NEVER uses; 何も…ない is the same pattern), with French's *ne …
   rien* in the negation slot.
2. For ONLY's gloss, a **verbless "and" fragment** as well — "and nothing more" coordinates a pronoun
   with nothing before it. If that proves awkward, ONLY is the candidate for literal by design once
   the pronoun exists; its commonest use, over a noun ("only the cat"), is
   [C39](C39-focus-particle-on-a-noun-phrase.md)'s.

Numerals are [C31](C31-numerals.md): the same P09 row, a different mechanism.
