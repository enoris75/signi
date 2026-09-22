# A205. A feminine plural pronoun is masculine after an adposition

**Languages:** French, Spanish, Portuguese

A pronoun governed by an adposition takes its tonic (disjunctive) form, and the three languages that
spell a feminine plural spell it there too: *avec **elles***, *con **ellas***, *com **elas***. The
engine gives all three the masculine — *avec eux*, *con ellos*, *com eles* — for a group the plan
says is feminine.

[`resolveNounPhrase`](../../../packages/engine/src/translator/functions/resolveNounPhrase.ts) selects
the tonic surface from two keys and no gender:

```ts
const disj = number === 'plural'
  ? head.forms['disjunctive_plural'] ?? head.forms['disjunctive']
  : …
```

There is no `disjunctive_plural_fem` for it to read, in the resolver or in the seed
([pronouns.ts](../../../packages/backend/src/concepts/pronouns.ts)): the THIRD_PERSON rows carry
`disjunctive`, `disjunctive_fem`, `disjunctive_neut` and `disjunctive_plural`, so the feminine is
spelled in the singular and lost in the plural. The **subject** surface is right — A36 seeded
`plural_fem` and A161 the Japanese one, and the resolver reads it — which is what localises this to
the tonic form.

| Slot | Now | Want |
|---|---|---|
| cause, fr / es / pt | `à cause d'eux` · `a causa de ellos` · `por causa deles` | `à cause d'elles` · `a causa de ellas` · `por causa delas` |
| comitative | `avec eux` · `con ellos` · `com eles` | `avec elles` · `con ellas` · `com elas` |
| passive agent | `par eux` · `por ellos` · `por eles` | `par elles` · `por ellas` · `por elas` |
| prepositional object | `sur eux` · `en ellos` · `neles` | `sur elles` · `en ellas` · `nelas` |
| 1st plural, es | `con nosotros` | `con nosotras` |
| 2nd plural, es | `con vosotros` | `con vosotras` |

The **Now** column was rendered by the engine; the **Want** column is the feminine of each form as
the lexicon already spells it in the subject (*elles*, *ellas*, *elas*, *nosotras*, *vosotras*).

**Already right.** The subject in all three (`elles courent.`, and the pro-drop agreement Spanish and
Portuguese carry on the participle). The singular tonic, which reads `disjunctive_fem` (`avec elle`,
`con ella`, `com ela`). English, German and Italian, which have no gendered plural tonic at all
(*them*, *ihnen*, *loro*). Japanese, whose 彼女ら goes into every slot.

**Reachable today**, through the phrase builder: the cause is the one complement whose box offers the
pronoun vocabulary, and its gender is a toggle. The other slots above are plan-only (see
[A203](A203-pronoun-in-the-other-complements.md)).

**Nothing shipped shows it.** No concept `definition` and no `UI_STRINGS` entry uses a plural
pronoun, which is what C20 recorded when it checked the same question for
[A200](A200-japanese-plural-neuter-pronoun.md).

Found while fixing [A197](A197-pronoun-in-the-comitative.md), which gave the comitative a
tonic pronoun and so a fourth place for this to show.

## Shape of the fix

The same two halves [A200](A200-japanese-plural-neuter-pronoun.md) took — a seed form and a
generic read — and the second half is the line right below the one A200 generalised:

- **The seed.** `disjunctive_plural_fem` on the `fr`, `es` and `pt` rows of THIRD_PERSON (*elles*,
  *ellas*, *elas*), and on the Spanish FIRST_PERSON and SECOND_PERSON rows (*nosotras*, *vosotras*).
  French *nous* / *vous* and Portuguese *nós* / *vocês* are invariable and need none.
- **The engine.** `resolveNounPhrase` reads the plural tonic off the gender in hand:
  `head.forms[\`disjunctive_plural_${gender}\`] ?? head.forms['disjunctive_plural'] ?? head.forms['disjunctive']`.
  A row that has no such key falls through exactly as it does now, so English, German, Italian and
  Japanese are untouched.

**Decision for the fixer — the neuter plural.** Spanish *ellos* and Portuguese *eles* cover a neuter
group as they cover a masculine one, and neither language has a distinct *ellas*-style neuter, so
only the feminine key is wanted. Japanese is the language with a neuter plural, and its tonic form
is its base form (A200's それら), which needs no `disjunctive` row at all.

| | |
|---|---|
| **Test** | `pronoun.test.ts` → *known bugs: the feminine plural tonic pronoun* (1 `test.fails` covering the cause, the comitative, the passive agent, a prepositional object and the Spanish 1st and 2nd plurals, plus a regression test for the subject surface and the languages with no feminine plural tonic) |

## Resolved

**2026-09-22.** The two halves the file sets out, and no more:

- **The seed.** `disjunctive_plural_fem` on the `fr`, `es` and `pt` THIRD_PERSON rows (*elles*,
  *ellas*, *elas*) and on the Spanish FIRST_PERSON and SECOND_PERSON rows (*nosotras*, *vosotras*),
  in [pronouns.ts](../../../packages/backend/src/concepts/pronouns.ts). French *nous* / *vous* and
  Portuguese *nós* / *vocês* are invariable and got none, so they fall through to the form they had.
- **The engine.** [`resolveNounPhrase`](../../../packages/engine/src/translator/functions/resolveNounPhrase.ts)
  reads the plural tonic off the gender in hand, one line below the one A200 generalised:
  `disjunctive_plural_${gender}` first, then the two keys it read before. English, German, Italian
  and Japanese spell no such key and are untouched.

**The neuter plural was ruled as the file rules it.** Only the feminine key is seeded, so a neuter
group keeps *ellos* / *eles* / *eux* — neither Iberian language spells a neuter group apart from a
masculine one, and French has no neuter plural at all. That is also what an antecedent naming things
resolves to.

| | |
|---|---|
| **Tests** | `pronoun.test.ts` → *known bugs: the feminine plural tonic pronoun*, the `test.fails` now passing, plus two added cases: the masculine and neuter plurals keeping the masculine tonic form (including through an antecedent), and the instrumental — the other slot A197 gave the tonic form — beside the invariable French and Portuguese 1st and 2nd plurals |
