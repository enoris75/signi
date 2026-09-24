# A367. An experiencer verb asked about its object keeps the one who likes as the subject

**Languages:** Italian, Spanish

Italian *piacere* and Spanish *gustar* turn LIKE round: the thing liked is the subject and the one
who likes is a dative (localization C34, `experiencer`). `resolvePhrase` does this only when the
object slot holds a noun. A wh-question asking about the thing liked leaves that slot empty, since
the plan names the gap by `questionRole: 'directObject'`. So the frame is never turned round: the
one who likes stays the subject, the verb agrees with it, and *chi piaccio?* means "who do I
please?". The statement (*l'angelo mi piace*), the yes/no question and the relative clause (*il cane
che piace al gatto*) all turn it round.

| Case | Now | Want |
|---|---|---|
| who do I like? | it `chi piaccio?` · es `¿a quién gusto?` | it `chi mi piace?` · es `¿quién me gusta a mí?` |
| what does the cat like? | it `che cosa piace il gatto?` · es `¿qué gusta el gato?` | it `che cosa piace al gatto?` · es `¿qué le gusta al gato?` |
| what do the cats like? | it `che cosa piacciono i gatti?` · es `¿qué gustan los gatos?` | it `che cosa piace ai gatti?` · es `¿qué les gusta a los gatos?` |
| what did the cat not like? | it `che cosa non piaceva il gatto?` · es `¿qué no gustaba el gato?` | it `che cosa non piaceva al gatto?` · es `¿qué no le gustaba al gato?` |
| what does one like? | it `che cosa si piace?` · es `¿qué se gusta?` | it `che cosa piace?` · es `¿qué le gusta a uno?` |

The Spanish Want was first written as *¿quién me gusta a mí?*, following the statement then pinned as
*el perro me gusta a mí*. [A369](A369-experiencer-verb-keeps-the-thing-liked-in-front-of-the-verb.md)
dropped the contrastive *a mí*, and the pin now reads *¿quién me gusta?*.

Reported from the phrase console as `/wh obj /subj ( 1st ) /verb ( like ) /obj ( angel /a )`. The
console drops the angel as the gap, and the angel only makes the question ask *who*.

**Already right.** English, French, German, Japanese and Portuguese (`who do I like?`, `qui est-ce
que j'aime ?`, `wen mag ich?`, `私は誰が好きですか？`, `de quem gosto?`).

## Shape of the fix

Move the gap with the slots, as a passive wh-question does (`passiveGap`, P09-E16). The thing liked,
gapped as the object, is the subject's gap: the wordless stand-in a subject question has
(`questionSubject`). The one who likes becomes the dative, as in the statement.

| | |
|---|---|
| **Test** | `experiencer-verb.test.ts` → *known bugs: an experiencer verb asked about its object keeps the one who likes as the subject (A367)* (2 `test.fails`: the question word, the one who likes and its number; tense, negation and the generic experiencer; plus a regression test for the five plain transitive languages) |

Found from a phrase-console line, 2026-09-24.

## Resolved

2026-09-24. [resolvePhrase.ts](../../../packages/engine/src/translator/functions/resolvePhrase.ts)
now turns the clause round when the object is the gap as well as when it is filled. A new
[experiencerGap.ts](../../../packages/engine/src/translator/functions/experiencerGap.ts) places the
gap, as `passiveGap` does under the passive: the object's gap becomes the subject's, and the
subject is the `questionSubject` stand-in (3rd singular, whatever the answer: *che cosa piace*, never
*piacciono*). The one who likes is the `terminus` dative as in the statement, and a generic one is
dropped in Italian and kept as *a uno* in Spanish (A316).

A possessor question inside the frame ("whose dog does the cat like?") is not moved. It was already
broken at HEAD (*di chi piace al gatto il cane di chi?*) and is a separate lead.

Guarded by `experiencer-verb.test.ts` → *known bugs: an experiencer verb asked about its object
keeps the one who likes as the subject (A367)*: the two former `test.fails`, now plain tests, and
the regression test; `experiencerGap.test.ts` for the placement.
