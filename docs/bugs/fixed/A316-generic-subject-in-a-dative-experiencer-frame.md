# A316. A generic subject in a dative experiencer frame

**Languages:** German (OKAY), Spanish (LIKE)

German OKAY takes the experiencer frame (P09-E31): the one who fares is a dative, and *es* is the
subject (*dem Kater geht es gut*, *mir geht es gut*, *jemandem geht es gut*). GENERIC_PERSON is
German *man*, which has no dative. The frame then falls back to a nominative subject with no *es*:
*man geht gut*, which is not German. The generic dative is *einem*: *es geht einem gut*.

Spanish LIKE has the same gap in its experiencer frame (C34: *el perro le gusta al gato*). The generic
experiencer is *se*, which cannot be a dative, and it is dropped along with the clitic *le*: *el gato
gusta.* That says "the cat is liked". Spanish says *el gato le gusta a uno* (*a uno le gusta el gato*).

| Case | Now | Want |
|---|---|---|
| GENERIC_PERSON BE OKAY | de `man geht gut.` | de `es geht einem gut.` |
| … negated | de `man geht nicht gut.` | de `es geht einem nicht gut.` |
| … past | de `man ging gut.` | de `es ging einem gut.` |
| GENERIC_PERSON LIKEs the CAT | es `el gato gusta.` | es `el gato le gusta a uno.` |

**Already right.** The generic subject in the other languages under OKAY (`one is okay.`, `si sta
bene.`, `on va bien.`, `se está bien.`, `se está bem.`). A noun or pronoun experiencer in German
(`mir geht es gut.`, `jemandem geht es gut.`). The citation and the controlled infinitive, which have
no dative (`gut gehen.`).

**Also affected, not pinned.** Italian LIKE says `il gatto piace.`: *si* has no dative, and the
generic experiencer is dropped. Italian has no settled generic dative (*a uno piace il gatto* is
colloquial). A refusal, or *piace a uno*, is for the fixer to rule. Japanese says 人は猫が好きです, taking
人 literally, which is the language's general handling of GENERIC_PERSON and not this frame's.

**Found by** the lanes landing P09-E31 (OKAY), re-verified at 48af1d35.

## Shape of the fix

German's experiencer frame is set up in [de/renderClause.ts](../../../packages/engine/src/languages/de/renderClause.ts)
("The experiencer frame of a lexical copula fronts its dative"). It reads the subject's dative form,
and GENERIC_PERSON has none, so it falls back. Give German GENERIC_PERSON a `dative` (and `disjunctive`)
form *einem*, which also serves any other dative slot (*hilft einem*). Or special-case the generic in
the frame. The seed form is the smaller change and the more general one: check it does not turn up
elsewhere as an object (*man* is never an object, so it should not).

For Spanish, GENERIC_PERSON needs a dative realisation in the LIKE frame: the clitic *le* plus *a uno*.
The Spanish experiencer builder now drops the *se* subject and the clitic with it.

| | |
|---|---|
| **Test** | `okay-predicate.test.ts` → *known bugs: a generic subject in a dative experiencer frame (A316)* (4 `test.fails`, one per row, plus a regression test for the other languages' generic subject and a noun or pronoun experiencer in German) |

## Resolved

2026-09-24. The seed form, as proposed: GENERIC_PERSON gets a `disjunctive` (its dative) in German,
*einem*, and in Spanish, *uno*
([backend/src/concepts/pronouns.ts](../../../packages/backend/src/concepts/pronouns.ts); **needs a
reseed of signi.db**). A new helper,
[functions/genericWithoutDative.ts](../../../packages/engine/src/functions/genericWithoutDative.ts),
says whether a generic has no such form, and the three places that dropped a generic experiencer
now drop it only then:
[lexicalCopula.ts](../../../packages/engine/src/translator/functions/lexicalCopula.ts) (German OKAY
takes the frame; a generic dative does not take the front field, so "es geht einem gut"),
[resolvePhrase.ts](../../../packages/engine/src/translator/functions/resolvePhrase.ts) (Spanish LIKE,
"el gato le gusta a uno"; the citation still drops it, "gustar.") and
[resolveRelativeClause.ts](../../../packages/engine/src/translator/functions/resolveRelativeClause.ts)
("el gato que le gusta a uno corre"). Italian *si* has no dative form, so Italian LIKE still drops
the generic (`il gatto piace.`): no settled generic dative, left as the bug file allowed. The seed
also fixes any other dative slot: `der Kater gibt einem das Buch.`, `el gato da el libro a uno.`.

Guarded by the four formerly-failing tests and three new ones (German question, modal and content
clause; Spanish negated, plural and relative, Italian still dropped; the recipient) in `known bugs: a
generic subject in a dative experiencer frame (A316)` in
[okay-predicate.test.ts](../../../packages/engine/test/okay-predicate.test.ts), and the helper's own
[genericWithoutDative.test.ts](../../../packages/engine/src/functions/genericWithoutDative.test.ts).
