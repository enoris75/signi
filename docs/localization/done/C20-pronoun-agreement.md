# C20. A pronoun that agrees with what it stands for — SELECT, and SAVE's German

_(split out of [C05](C05-non-distinguishing-genera.md) on 2026-09-21. C05 had SELECT on the literal
because its gloss would read the same as CHOOSE's. A gloss that does not had since become
composable, but it was blocked on something else. **Done** on 2026-09-21: see [Done](#done).)_

## The gloss

SELECT is "to mark out an item as the one to act on". CHOOSE ships as "to indicate an option"
([B18](B18-selection-verbs.md)). The **purpose clause**
([C12](C12-ui-purpose-and-object-complements.md), the shape SAVE ships on) says what sets
SELECT apart: the object is indicated in order to be used.

| plan | gloss (en) |
|---|---|
| `infinitiveGloss('INDICATE', { object: 'OBJECT_THING', definiteness: 'indefinite', purpose: { verb: 'USE', object: 'THIRD_PERSON', antecedent: 'OBJECT_THING' } })` | to indicate an object to use it |

## Was blocked on: the pronoun's gender — resolved

The purpose clause's object is a pronoun standing for the object. `GlossParts.gender` gave it one
gender for all seven languages, but the languages want two different things. English and Japanese
want the **natural** gender (a thing is "it", それ). German and the Romance languages want the
**grammatical** gender of the noun the pronoun stands for, and that is a fact of each lexicon, not
of the plan: *Gegenstand* is masculine, so German wants *ihn*.

**Verdict: resolved by the construct below.** Re-probed 2026-09-21 with the construct in place. The
first two rows are the old `gender` field, which still renders as it did; the third is the
antecedent:

| pronoun | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| `gender: 'neut'` | to indicate an object to use it | indicare un oggetto per usarlo | indiquer un objet pour l'utiliser | einen Gegenstand bezeichnen, um **es** zu verwenden | indicar un objeto para usarlo | それを使うために物体を示す | indicar um objeto para usá-lo |
| `gender: 'masc'` | to indicate an object to use **him** | indicare un oggetto per usarlo | indiquer un objet pour l'utiliser | einen Gegenstand bezeichnen, um ihn zu verwenden | indicar un objeto para usarlo | **彼**を使うために物体を示す | indicar um objeto para usá-lo |
| `antecedent: 'OBJECT_THING'` | to indicate an object to use it | indicare un oggetto per usarlo | indiquer un objet pour l'utiliser | einen Gegenstand bezeichnen, um ihn zu verwenden | indicar un objeto para usarlo | それを使うために物体を示す | indicar um objeto para usá-lo |

The Romance languages came out right under either value, but only because the neuter falls back
to the masculine and *oggetto*, *objet*, *objeto* happen to be masculine. A feminine antecedent
exposes the fallback, and shows the construct reads the lexicon instead. OPTION is feminine in all
five gendered languages:

| pronoun | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| `gender: 'neut'` | to indicate an option to use it | indicare un'opzione per **usarlo** | indiquer une option pour l'utiliser | eine Option bezeichnen, um **es** zu verwenden | indicar una opción para **usarlo** | それを使うために選択肢を示す | indicar uma opção para **usá-lo** |
| `antecedent: 'OPTION'` | to indicate an option to use it | indicare un'opzione per usarla | indiquer une option pour l'utiliser | eine Option bezeichnen, um sie zu verwenden | indicar una opción para usarla | それを使うために選択肢を示す | indicar uma opção para usá-la |

### SAVE already shipped the German error — fixed

SAVE's gloss, shipped in [C19](C19-verbs-needing-voice-purpose-or-comitative.md), has the
same shape and took `neut` to keep English off "him". Its German was **"Inhalt schreiben, um es zu
laden"**: *Inhalt* is masculine, so it should be *ihn*.

**Verdict: fixed.** SAVE's purpose object now names `antecedent: 'CONTENT'`, and
[e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) (the C19 SAVE case)
pins "Inhalt schreiben, um ihn zu laden". The table is in [Done](#done).

## The construct

A pronoun that names its **antecedent** instead of a gender: `{ concept: 'THIRD_PERSON',
antecedent: 'OBJECT_THING' }`. Each engine reads the gender it needs from its own lexeme for that
concept: grammatical gender in de/it/fr/es/pt, and in en and ja the natural gender, with a thing
being neuter.

**Verdict: built, in the shape sketched.** It works in every slot a pronoun can fill, not only the
purpose clause. How each language resolves it, and the two decisions the sketch left open, are in
[Done](#done).

Once it existed:

1. Re-author SAVE's `purpose` object with `antecedent: 'CONTENT'`, and update the SAVE e2e
   assertion to "Inhalt schreiben, um ihn zu laden". **Done.**
2. Author SELECT as above, with `antecedent: 'OBJECT_THING'`. Probe it again: USE is the proposed
   purpose verb, and MODIFY ("to indicate an object to modify it") rendered as cleanly. **Done, on
   USE.** MODIFY does not read as cleanly in Japanese. Probed 2026-09-21:

| purpose verb | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| USE (shipped) | to indicate an object to use it | indicare un oggetto per usarlo | indiquer un objet pour l'utiliser | einen Gegenstand bezeichnen, um ihn zu verwenden | indicar un objeto para usarlo | それを使うために物体を示す | indicar um objeto para usá-lo |
| MODIFY | to indicate an object to modify it | indicare un oggetto per modificarlo | indiquer un objet pour le modifier | einen Gegenstand bezeichnen, um ihn zu modifizieren | indicar un objeto para modificarlo | それを**修飾する**ために物体を示す | indicar um objeto para modificá-lo |

MODIFY's Japanese lexeme is 修飾する, the *grammatical* sense (a word modifying another, or
decoration), so the Japanese says "to indicate an object in order to qualify it". USE reads right
in all seven, and "to use" is also closer to the literal's "the one to act on".

## Other routes, and why not

Both stay rejected. They were re-probed on 2026-09-21 for the record, and neither is needed now.

- **A purpose clause with no pronoun** reads in English and Japanese but not in the other five.
  Without the clitic, the object is no longer the thing being used:

  | en | it | fr | de | es | ja | pt |
  |---|---|---|---|---|---|---|
  | to indicate an object to use | indicare un oggetto per usare | indiquer un objet pour utiliser | einen Gegenstand bezeichnen, um zu verwenden | indicar un objeto para usar | 使うために物体を示す | indicar um objeto para usar |

- **The essive** ("to indicate an object as the one to use") wanted a noun for "the one to act on".
  None was seeded when this file was written. **TARGET** has been seeded since, but it is a link's
  target, and Italian and Spanish take the word their DESTINATION uses. So the essive says
  "as the destination":

  | en | it | fr | de | es | ja | pt |
  |---|---|---|---|---|---|---|
  | to indicate an object as the target | indicare un oggetto come **destinazione** | indiquer un objet comme cible | einen Gegenstand als Ziel bezeichnen | indicar un objeto como **destino** | 物体を対象として示す | indicar um objeto como alvo |

## Done

**2026-09-21.** The construct shipped, and SAVE and SELECT are both glossed with it.

### The construct: `NounPhrase.antecedent`

`antecedent?: string` on [`NounPhrase`](../../../packages/shared/src/index.ts) is the concept id of
the noun a 3rd-person pronoun head stands for. The translator settles its gender in
[`antecedentAgreement`](../../../packages/engine/src/translator/functions/antecedentAgreement.ts),
called from [`resolveNounPhrase`](../../../packages/engine/src/translator/functions/resolveNounPhrase.ts)
*before* the pronoun's surface is picked. Every engine reads a pronoun's gender and number off the
resolved forms, so no language engine changed. Subject, object, the Romance clitic (and its
climbing to a modal), the Portuguese enclitic (*usá-la*), the imperative enclitic (*vedila*), the
French participle (*l'a vue*), German word order in a relative clause and in *um … zu*, and the
disjunctive after a preposition all agree alike. The tests are in
[pronounAntecedent.test.ts](../../../packages/engine/test/pronounAntecedent.test.ts).

**Which gender, per language.** The lexicon decides, not a list of languages. Every noun lexeme
in de/it/fr/es/pt carries a `gender`, and no noun lexeme in en or ja does (checked over the whole
corpus, 0 exceptions either way):

- **de, it, fr, es, pt: the antecedent's grammatical gender**, from their own lexeme. A `gender`
  on the pronoun is the referent's. It is applied to the noun the way a noun phrase applies it, so
  it matters only where the noun has a feminine counterpart ("la compagna" → *la*). A fixed gender
  holds whoever it names: "la persona" → *la*, and *die Person* → *sie*, even for a man.
- **en, ja: the natural gender.** The pronoun's own `gender` when the plan states one. Otherwise
  neuter for anything that is not a person: a thing, or an animal of unknown sex ("it", それ).
  "Not a person" is the concept-level `human` flag, which every language's forms carry.

| antecedent | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| CONTENT (masc) | the cat sees it | il gatto lo vede | le chat le voit | der Kater sieht ihn | el gato lo ve | 猫はそれを見ます | o gato o vê |
| FLAME (fem) | the cat sees it | il gatto la vede | le chat la voit | der Kater sieht sie | el gato la ve | 猫はそれを見ます | o gato a vê |
| ANIMAL (de neut) | the cat sees it | il gatto lo vede | le chat le voit | der Kater sieht es | el gato lo ve | 猫はそれを見ます | o gato o vê |
| CAT (an animal) | the cat sees it | il gatto lo vede | le chat le voit | der Kater sieht ihn | el gato lo ve | 猫はそれを見ます | o gato o vê |

**A person antecedent.** No lexeme records a person's natural gender. The en and ja lexemes carry
none, and grammatical gender is no guide to it: PERSON is feminine in all five gendered lexicons,
exactly as WOMAN is (`[fffff]` both), ANGEL is masculine in all five, and SPEAKER, COMPANION and
RECIPIENT are masculine as the generic. So a person's sex is the plan's to state, on the pronoun,
as it is on any pronoun. The canvas already hands a pronominal possessor the antecedent's gender
pick the same way. When nobody states it, en and ja do not guess. The plural pronoun is neutral
already ("them", 彼ら). The singular is not pronominalised: the antecedent stands in under the
anaphoric demonstrative ("that person", その人).

| antecedent | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| BOY, `gender: 'masc'` | the cat sees him | il gatto lo vede | le chat le voit | der Kater sieht ihn | el gato lo ve | 猫は彼を見ます | o gato o vê |
| WOMAN, `gender: 'fem'` | the cat sees her | il gatto la vede | le chat la voit | der Kater sieht sie | el gato la ve | 猫は彼女を見ます | o gato a vê |
| PERSON, `gender: 'masc'` | the cat sees him | il gatto la vede | le chat la voit | der Kater sieht sie | el gato la ve | 猫は彼を見ます | o gato a vê |
| SPEAKER, `gender: 'fem'` | the cat sees her | il gatto la vede | le chat la voit | der Kater sieht sie | el gato la ve | 猫は彼女を見ます | o gato a vê |
| PERSON | the cat sees that person | il gatto la vede | le chat la voit | der Kater sieht sie | el gato la ve | 猫はその人を見ます | o gato a vê |
| PERSON, plural | the cat sees them | il gatto le vede | le chat les voit | der Kater sieht sie | el gato las ve | 猫は彼らを見ます | o gato as vê |
| BOY | the cat sees that boy | il gatto lo vede | le chat le voit | der Kater sieht ihn | el gato lo ve | 猫はその男の子を見ます | o gato o vê |

**Number** is the pronoun's own `number`, singular by default. The antecedent is a concept id,
which names a word, not a referent, and a word has no number. A plural antecedent is said the way
a plan already says "them": the pronoun is set plural. Following the antecedent's lexeme would only
differ for a *plurale tantum*, and none is seeded (every noun's `count` is singular).

### SAVE and SELECT

| verb | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| SAVE (C19, `gender: 'neut'`) | to write content to load it | scrivere contenuto per caricarlo | écrire du contenu pour le charger | Inhalt schreiben, um **es** zu laden | escribir contenido para cargarlo | それを読み込むために内容を書く | escrever conteúdo para carregá-lo |
| SAVE (now) | to write content to load it | scrivere contenuto per caricarlo | écrire du contenu pour le charger | Inhalt schreiben, um ihn zu laden | escribir contenido para cargarlo | それを読み込むために内容を書く | escrever conteúdo para carregá-lo |
| SELECT | to indicate an object to use it | indicare un oggetto per usarlo | indiquer un objet pour l'utiliser | einen Gegenstand bezeichnen, um ihn zu verwenden | indicar un objeto para usarlo | それを使うために物体を示す | indicar um objeto para usá-lo |

Read from `/api/concepts?role=verb` on a backend booted against a freshly seeded database, after
rebuilding the shared and engine dist. The boot check (all 138 definitions in seven languages)
passes. Pinned in [genus-verbs.test.ts](../../../packages/engine/test/genus-verbs.test.ts) and, in
English and German, in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts).

### What landed differently from the plan

1. **`GlossParts.gender` is gone.** SAVE was its only user. It is replaced by
   `GlossParts.antecedent` ([verbs/gloss.ts](../../../packages/backend/src/concepts/verbs/gloss.ts)),
   which passes the antecedent through to the pronoun object. `NounPhrase.gender` itself stays: it
   is every pronoun's gender control, and under an antecedent it is the referent's natural gender.
2. **The gender languages are not listed anywhere.** Nobody tells the engine that en and ja use
   natural gender. It checks whether the antecedent's own lexeme carries a gender. That is exact
   over today's corpus, and a language added later sorts itself by its data.
3. **A person of unstated sex is not pronominalised in en and ja.** The file sketched only "a thing
   being neuter". The ruling was not to guess "he". Since nothing in the lexicon can tell BOY from
   PERSON from WOMAN, the singular becomes the antecedent under the demonstrative ("that person",
   その人). English singular *they* was the other candidate. The demonstrative won because it is one
   rule for both languages. It needs no switch to plural agreement, and it is the anaphor Japanese
   actually uses. A plan that knows the referent's sex states it on the pronoun, and then BOY is
   "him". Reading the sex off the concept would take new data (a concept-level natural gender, or
   the MALE / FEMALE differentia of the definition), which no gloss needs yet.
4. **The pronoun's gender still counts in the gendered languages**, but only through the noun: it
   picks the feminine counterpart where the noun has one (SPEAKER → *la* / *sie*). The antecedent's
   gender otherwise wins, which is what fixes SAVE's `neut`.
5. **An antecedent on a 1st- or 2nd-person pronoun, or on GENERIC_PERSON, is ignored.** Those have
   no noun to stand for.
6. **The canvas does not expose `antecedent`.** It is plan-only, like `purpose` and the comitative
   ([C12](C12-ui-purpose-and-object-complements.md#done)). The pronominal possessor's "point to a
   noun" gesture ([CorefPickContext](../../../packages/frontend/src/components/PhraseBuilder/CorefPickContext.tsx))
   is the obvious way to offer it on a pronoun box later. The frontend typechecks unchanged.
7. **One gap it exposes, not fixed here:** a *plural* thing antecedent reads 彼ら in Japanese
   ("the cat sees them", 猫は彼らを見ます for FLAME), because the Japanese THIRD_PERSON lexeme has no
   neuter plural (それら) and the translator knows only `plural_fem`. The same happens with a plain
   `{ gender: 'neut', number: 'plural' }` pronoun, so it predates the construct. No gloss uses a
   plural antecedent.
