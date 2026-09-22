# A238. An English addressee that takes no "to" gets one anyway

**Language:** English

English renders every `terminus` complement with "to"
([`en.consts.ts`](../../../packages/engine/src/languages/en/en.consts.ts)'s `PREP`), so a verb whose
addressee is a bare object — the double-object *ask someone something*, the plain object of *answer
someone* — says it with the preposition instead. The verb cannot ask for another shape: no lexeme
key selects a bare or double-object recipient, the way `object_prep` selects one for a direct object.

| Case | Now | Want |
|---|---|---|
| the WOMAN ASKs the NAME, terminus the MAN | `the woman asks the name to the man.` | `the woman asks the man the name.` |
| the WOMAN ANSWERs, terminus the MAN | `the woman answers to the man.` | `the woman answers the man.` |

"Answers to the man" is not merely stilted: it reads *is accountable to*.

**Already right.** The other six languages mark the addressee themselves and are correct
(`la donna chiede il nome all'uomo.`, `la mujer pregunta el nombre al hombre.`, 女は男に名前を尋ねます。),
and a verb whose English addressee really does take "to" keeps it (`the woman says the word to the
man.`). **German is a different bug**: *fragen* takes the person in the accusative, and it renders
*fragt dem Mann*, which is [C35](../../localization/C-needs-engine/C35-lexical-object-case.md)'s
lexical object case — already recorded there, and not this file's.

**Nothing shipped shows it.** ANSWER's own gloss is SAY with a terminus, which takes "to" correctly.

Pinned by `known bugs: an English addressee that takes no "to" (A238)` in
[saying-verbs.test.ts](../../../packages/engine/test/saying-verbs.test.ts).

Found seeding ASK and ANSWER for [B60](../../localization/done/B60-saying-and-thinking-verbs.md).
