# C20. A pronoun that agrees with what it stands for — SELECT, and SAVE's German

_(split out of [C05](../done/C05-non-distinguishing-genera.md) on 2026-09-21. C05 had SELECT on the literal
because its gloss would read the same as CHOOSE's. A gloss that does not has since become
composable. It is blocked on something else.)_

## The gloss

SELECT is "to mark out an item as the one to act on". CHOOSE ships as "to indicate an option"
([B18](../done/B18-selection-verbs.md)). The **purpose clause**
([C12](../done/C12-ui-purpose-and-object-complements.md), the shape SAVE ships on) says what sets
SELECT apart: the object is indicated in order to be used.

| plan | gloss (en) |
|---|---|
| `infinitiveGloss('INDICATE', { object: 'OBJECT_THING', definiteness: 'indefinite', purpose: { verb: 'USE', object: 'THIRD_PERSON', gender: … } })` | to indicate an object to use it |

## Blocked on: the pronoun's gender

The purpose clause's object is a pronoun standing for the object. `GlossParts.gender` gives it one
gender for all seven languages, but the languages want two different things. English and Japanese
want the **natural** gender (a thing is "it", それ). German and the Romance languages want the
**grammatical** gender of the noun the pronoun stands for, and that is a fact of each lexicon, not
of the plan: *Gegenstand* is masculine, so German wants *ihn*.

Probed 2026-09-21, engine source at HEAD:

| `gender` | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| `neut` | to indicate an object to use it | indicare un oggetto per usarlo | indiquer un objet pour l'utiliser | einen Gegenstand bezeichnen, um **es** zu verwenden | indicar un objeto para usarlo | それを使うために物体を示す | indicar um objeto para usá-lo |
| `masc` | to indicate an object to use **him** | indicare un oggetto per usarlo | indiquer un objet pour l'utiliser | einen Gegenstand bezeichnen, um ihn zu verwenden | indicar un objeto para usarlo | **彼**を使うために物体を示す | indicar um objeto para usá-lo |

No value is right in all seven. The Romance languages come out right under either value, but only
because the neuter falls back to the masculine and *oggetto*, *objet*, *objeto* happen to be
masculine. A feminine antecedent would expose them too.

### SAVE already ships the German error

SAVE's gloss, shipped in [C19](../done/C19-verbs-needing-voice-purpose-or-comitative.md), has the
same shape and took `neut` to keep English off "him". Its German is **"Inhalt schreiben, um es zu
laden"**: *Inhalt* is masculine, so it should be *ihn*.
[e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) (the C19 SAVE case) pins
the wrong string.

## The construct

A pronoun that names its **antecedent** instead of a gender: `{ concept: 'THIRD_PERSON',
antecedent: 'OBJECT_THING' }`. Each engine would read the gender it needs from its own lexeme for
that concept: grammatical gender in de/it/fr/es/pt, and in en and ja the natural gender, with a
thing being neuter.

Once it exists:

1. Re-author SAVE's `purpose` object with `antecedent: 'CONTENT'`, and update the SAVE e2e
   assertion to "Inhalt schreiben, um ihn zu laden".
2. Author SELECT as above, with `antecedent: 'OBJECT_THING'`. Probe it again: USE is the proposed
   purpose verb, and MODIFY ("to indicate an object to modify it") rendered as cleanly.

## Other routes, and why not

- **A purpose clause with no pronoun** reads in English and Japanese but not in the other five.
  Probed: "to indicate an object to use", 使うために物体を示す, but "per usare", "pour utiliser",
  "um zu verwenden", "para usar": without the clitic, the object is no longer the thing being used.
- **The essive** ("to indicate an object as the one to use") wants a noun for "the one to act on"
  that is not seeded, and the probe of SEEM ([A16](../done/A16-seem.md)) found the essive works
  for nouns only.
