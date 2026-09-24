# A344. The French and German detached possessor linked to the generic subject names someone else

**Languages:** French, German

A possessor linked to the subject (P11-E2) on an indefinite head detaches, as A277 has it (*un ami à
moi*, *ein Freund von mir*). Under the generic subject GENERIC_PERSON (*on*, *man*), French and German
write the detached pronoun of an ordinary 3rd person: *on voit un ami à lui*, *man sieht einen
Freund von ihm*. That is someone else's friend. The generic subject binds the reflexive in the
detached slot: *un ami à soi*, *einen Freund von sich*.

| Case | Now | Want |
|---|---|---|
| GENERIC_PERSON SEEs FRIEND {indefinite, possessor: coreferent} | fr `on voit un ami à lui.` · de `man sieht einen Freund von ihm.` | fr `on voit un ami à soi.` · de `man sieht einen Freund von sich.` |
| … FRIEND {indefinite, plural} | fr `on voit des amis à lui.` · de `man sieht Freunde von ihm.` | fr `on voit des amis à soi.` · de `man sieht Freunde von sich.` |
| … BOOK {indefinite} | fr `on voit un livre à lui.` · de `man sieht ein Buch von ihm.` | fr `on voit un livre à soi.` · de `man sieht ein Buch von sich.` |
| GENERIC_PERSON RUNs with FRIEND {indefinite, coreferent} | fr `on court avec un ami à lui.` · de `man läuft mit einem Freund von ihm.` | fr `on court avec un ami à soi.` · de `man läuft mit einem Freund von sich.` |

**Why these targets.** *Soi* is the French disjunctive bound by *on* (*on a besoin d'un ami à soi*),
and *sich* the German reflexive bound by *man* after a preposition (*man denkt an sich*). Both were
written by hand from those forms, not rendered.

**Already right.** The definite head (`on voit son ami.`, `man sieht seinen Freund.`, as
[A332](../fixed/A332-english-italian-write-his-for-a-possessor-linked-to-the-generic-subject.md)
found). A noun subject (`l'homme voit un ami à lui.`, `der Mann sieht einen Freund von ihm.`). The
other five: `one sees a friend of one's own.`, `si vede un proprio amico.`, `se ve a un amigo suyo.`
(A332 accepts *suyo* / *seu* under the impersonal *se*), 人は自分の友達を見ます。, `se vê um amigo seu.`

## Shape of the fix

A332 gave `BoundPossessor` a generic mark in
[bindCoreferents.ts](../../../packages/engine/src/translator/functions/bindCoreferents.ts). The French
detached pronoun ([disjunctiveFr in possessive.ts](../../../packages/engine/src/possessive.ts)) and the
German one (`dativePronounDe` beside it, used by [de/possessorText.ts](../../../packages/engine/src/languages/de/possessorText.ts))
should read that mark and write *soi* / *sich*.

| | |
|---|---|
| **Test** | `coreference.test.ts` → *known bugs: the French and German detached possessor linked to the generic subject names someone else (A344)* (2 `test.fails`: the object, then the plural, a thing and a comitative; plus a regression test for the definite head, a noun subject and the other five) |

Found by the lanes and the cross-lane probe while fixing A278–A338, 2026-09-24.

## Resolved

2026-09-24. [possessive.ts](../../../packages/engine/src/possessive.ts): `disjunctiveFr` and
`dativePronounDe` read A332's generic mark (`isGenericBound`) and write *soi* / *sich*. Every detached
slot goes through them (the French noun phrase, the German noun phrase, the German complements and
[de/possessorText.ts](../../../packages/engine/src/languages/de/possessorText.ts)), so the object, the
complements and a possessor chain all bind the reflexive; `bindCoreferents.ts` needed no change.

Guarded by `coreference.test.ts` → *known bugs: the French and German detached possessor linked to the
generic subject names someone else (A344)*: the two former `test.fails`, now plain tests, a new test (a
demonstrative, a numeral, a locative, a possessor chain), and the regression test. Unit case in
`possessive.test.ts`.
