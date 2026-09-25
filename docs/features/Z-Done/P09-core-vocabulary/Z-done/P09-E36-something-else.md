# P09-E36. *Something else*, *something big* — a modifier on an indefinite pronoun

**Construct:** an adjective (and *else*) on SOMETHING and its kin: postposed in English, with *di*
/ *de* in Italian and French, as a neuter adjectival noun in German.
**Shape:** the indefinite pronoun accepts `adjectives`; each engine spells them its own way; *else*
is OTHER's form on a pronoun.
**Scope:** all 7 languages.
**Status:** **shipped, 2026-09-24** — D1 and D2 as ruled, SOMEONE's rows included; see
[Done](#done). Filed 2026-09-24 from [P09-E24](P09-E24-ranks-201-400.md)'s §3.
**Words:** *else* (rank 373). The same construct gives *something big*, *someone new*, *nothing
important*.

| lang | the cat eats **something else** (proposed) | … **something big** (proposed) | engine at 1229928 (SOMETHING + BIG) |
|---|---|---|---|
| en | something else | something big | the cat eats something ✗ |
| it | qualcos'altro | qualcosa di grande | il gatto mangia qualcosa ✗ |
| fr | autre chose | quelque chose de grand | le chat mange quelque chose ✗ |
| de | etwas anderes | etwas Großes | der Kater frisst etwas ✗ |
| es | otra cosa | algo grande | el gato come algo ✗ |
| pt | outra coisa | algo grande | o gato come algo ✗ |
| ja | 別の何か | 大きい何か | 猫は大きい何かを食べます ✓ |

**Proposed** in the first two columns; the third is the engine's output.

## Done

Shipped 2026-09-24, as recommended in D1 and D2, for SOMETHING and for SOMEONE
([P09-E40](P09-E40-someone.md), shipped the same day). The adjective is folded into the indefinite
pronoun's own surfaces at resolution time
([`foldIndefiniteModifier`](../../../../../packages/engine/src/translator/functions/foldIndefiniteModifier.ts),
called from [`resolveNounPhrase`](../../../../../packages/engine/src/translator/functions/resolveNounPhrase.ts)),
each language spelling it in its own `languages/<lang>/indefiniteModifier.ts`; OTHER carries
`after_pronoun` ([`adjectives.ts`](../../../../../packages/backend/src/concepts/adjectives.ts)) and the
pronouns that fuse with it carry `with_other` / `negative_with_other`
([`pronouns.ts`](../../../../../packages/backend/src/concepts/pronouns.ts)). Engine output, pinned in
[`indefinite-pronoun.test.ts`](../../../../../packages/engine/test/indefinite-pronoun.test.ts)
(*the cat eats …* / *the cat sees …* for the objects):

| | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| SOMETHING + BIG | something big | qualcosa di grande | quelque chose de grand | etwas Großes | algo grande | algo grande | 大きい何かを |
| SOMETHING + OTHER | something else | qualcos'altro | autre chose | etwas anderes | otra cosa | outra coisa | 別の何かを |
| … negated | does not eat anything big / else | non mangia niente di grande / nient'altro | ne mange rien de grand / rien d'autre | frisst nichts Großes / nichts anderes | no come nada grande / nada más | não come nada grande / nada mais | 大きいものを何も食べません / ほかに何も食べません |
| subject, negated | nothing big / nothing else runs | niente di grande / nient'altro corre | rien de grand / rien d'autre ne court | nichts Großes / nichts anderes läuft | nada grande / nada más corre | nada grande / nada mais corre | 大きいものは何も / ほかに何も走りません |
| SOMEONE + NEW | someone new | qualcuno di nuovo | quelqu'un de nouveau | jemand Neues | a alguien nuevo | alguém novo | 新しい誰かを |
| SOMEONE + OTHER | someone else | qualcun altro | quelqu'un d'autre | jemand anderes | a alguien más | outra pessoa | 別の誰かを |
| … negated | does not see anyone new / else | non vede nessuno di nuovo / nessun altro | ne voit personne de nouveau / personne d'autre | sieht niemand Neues / niemand anderes | no ve a nadie nuevo / nadie más | não vê ninguém novo / ninguém mais | 新しい人を誰も見ません / ほかに誰も見ません |
| subject, negated | nobody new / nobody else runs | nessuno di nuovo / nessun altro corre | personne de nouveau / personne d'autre ne court | niemand Neues / niemand anderes läuft | nadie nuevo / nadie más corre | ninguém novo / ninguém mais corre | 新しい人は誰も / ほかに誰も走りません |
| dative (de) | helps someone else | aiuta qualcun altro | aide quelqu'un d'autre | hilft jemand anderem | ayuda a alguien más | ajuda outra pessoa | 別の誰かを手伝います |
| after a preposition | with something big | con qualcosa di grande | avec quelque chose de grand | mit etwas Großem | con algo grande | com algo grande | 大きい何かと |

Full sentences, e.g. the first row: *the cat eats something big.* / *il gatto mangia qualcosa di
grande.* / *le chat mange quelque chose de grand.* / *der Kater frisst etwas Großes.* / *el gato come
algo grande.* / *o gato come algo grande.* / 猫は大きい何かを食べます。 French elides (*quelque chose
d'intéressant*), German declines the dative (*hilft niemand Neuem*, *mit etwas Großem*) and keeps
the accusative strong (*für jemand Neues*). SOMETHING's own rows and its gloss are unchanged; no
existing test's expected string changed.

What landed differently from the plan:

1. **One fold, seven spellers — not seven pronoun paths.** Every engine reads a pronoun's `base` /
   `object` / `disjunctive` wherever it stands (subject, object, dative object, after a
   preposition), so the modifier is written into those forms and their `negative_*` counterparts
   before `negativePolarity` swaps them. No engine's clause code changed for the six European
   languages; each language's spelling is its own small file, tested beside it.
2. **German: the pronoun stays undeclined before the adjectival noun** — *sieht jemand Neues*, *hilft
   niemand Neuem*, not *jemanden Neues* — as Duden's *jemand* entry has it ("jemand Fremdes, mit
   jemand Fremdem"). **For SOMEONE + OTHER, *jemand anderes*** (the neuter, which is what the
   pronoun's adjectival noun is everywhere else; Duden also accepts *jemand anders* and the southern
   *jemand anderer*), dative *jemand anderem*. OTHER is lowercase (*etwas anderes*, Duden's
   recommended spelling); every other adjective is capitalised.
3. **Negated OTHER in Spanish and Portuguese is *nada más* / *nada mais* and *ninguém mais***, the
   pronoun's `negative_with_other`: the positive *otra cosa* would read "no come otra cosa", which
   is Spanish, but the negative pronoun is the concord the rest of the clause is built on (and the
   plan's negation is sentential). Spanish SOMEONE takes the generic *más* (*alguien más*, *nadie
   más*); Portuguese SOMEONE fuses (*outra pessoa*, *ninguém mais*).
4. **Japanese negation, probed and picked:** *大きい何も is not Japanese, so a negated indefinite with
   an adjective puts the adjective on a plain noun (`negative_modified`: もの, 人) that takes the case
   particle, and the negative word follows with its も — 猫は大きいものを何も食べません, 新しい人は誰も走り
   ません (the subject's が / は becomes the contrastive は; を and every other particle are kept:
   新しい人に誰も). OTHER is the adverb ほかに there instead (`before_negative_pronoun` on OTHER):
   猫はほかに何も食べません, ほかに誰も走りません. The positive keeps the prenominal adjective as before
   (大きい何か, 別の誰か). See [`jaModifiedNegative`](../../../../../packages/engine/src/languages/ja/jaModifiedNegative.ts).
5. **The guard refuses rather than drops, by throwing** — the engine's convention for a plan it
   cannot say (as P09-E14's possessor questions do). Three cases: an adjective on a **personal**
   pronoun ("a personal pronoun takes no adjective", all seven languages; Japanese used to write
   大きい彼), **more than one** adjective on an indefinite, and a **degree, intensifier or standard**
   on its adjective (the builder's explicit `positive` degree is no degree). Japanese could say the
   last two, but a plan renders in all seven at once, so it is refused for all. The builder already
   clears a pronoun's adjectives (`phraseReducers`), so no UI path reaches the refusals.
6. **Italian SOMEONE + NEW is *qualcuno di nuovo*** as ruled; it can also read "someone again" out of
   context, which the task accepted.

## Why

An indefinite pronoun with a modifier is ordinary speech ("something else", "nothing new"), and at
1229928 the adjective is **silently dropped** in six languages: the plan says *big* and the sentence
does not. Only Japanese, whose pronoun is a noun, writes it.

## Today

Verified at 1229928, 2026-09-24.

- Probed: SOMETHING with `adjectives: ['BIG']` and with `['OTHER']` renders the third column in the
  six European languages, and 大きい何か / 別の何か in Japanese.
- SOMETHING's forms ([`pronouns.ts:122`](../../../../../packages/backend/src/concepts/pronouns.ts#L122))
  are a pronoun's, with no gender where the European languages would need one for an adjective (it
  *qualcosa* takes a masculine adjective: *qualcosa di bello*).

## Design

### D1. The spellings

- **en**: the adjective after the pronoun ("something big"); OTHER as *else*.
- **it / fr**: *di* / *de* + the masculine singular adjective (*qualcosa di grande*, *quelque chose
  de grand*); OTHER fuses: *qualcos'altro*, *autre chose* (which replaces the pronoun).
- **de**: the adjective as a capitalised neuter noun in the pronoun's case (*etwas Großes*, *nichts
  Neues*); OTHER as *anderes*. The adjectival-noun declension exists (P11 D8, four surfaces).
- **es / pt**: the adjective after the pronoun (*algo grande*); OTHER replaces it: *otra cosa, outra
  coisa*.
- **ja**: prenominal, as today.

**Recommendation: implement each spelling in the engine's pronoun path, and stop dropping
adjectives** — a pronoun that cannot take one should fail loudly rather than lose it.

### D2. *Else* is OTHER

**Recommendation: no ELSE concept.** *Else* is what English writes for OTHER after an indefinite or
a wh-word ("who else"), which is the lexeme's own form (`after_pronoun: 'else'`).

## Engine

- Each engine's pronoun phrase: the adjective spellings of D1; OTHER's fused forms.
- A guard (test) that no adjective on a pronoun is dropped.

## Tests

`indefinite-pronoun.test.ts`: SOMETHING + BIG, SOMETHING + OTHER, negated (*nothing big*: *niente di
grande, rien de grand, nichts Großes, nada grande*, 大きいものは何も… — ja to probe).

## Verification

Engine suite green. SOMETHING's shipped gloss ("an unknown thing") is a noun, so it does not move.

## Out of scope (follow-ups)

- ***Who else, what else*** — OTHER after a wh-word, once the question word takes modifiers.
- **SOMEONE and EVERYTHING** take the same path once seeded
  ([P09-E40](P09-E40-someone.md), [B90](../../../../localization/done/B90-everything.md)).
