# P11-E4. "A friend of mine" — the indefinite possessed head

**Construct:** how a language says *a* friend of mine as opposed to *my* friend. P11 filed it as
**German *ein Freund von mir***; it is the same gap in five of the seven.
**Shape:** one member of one `Set`, and a per-language rule about which determiners a possessive
stands beside. The smallest of [P11](README.md)'s follow-ups, and the only one that is arguably a
**defect** rather than a feature — see D3.
**Scope:** all 7 languages.
**Status:** planning, unscheduled. Split out of P11's follow-ups on 2026-09-23.

| lang | "my friend" (definite) | "a friend of mine" (indefinite) |
|---|---|---|
| en | my friend | a friend of mine |
| it | il mio amico | un mio amico |
| fr | mon ami | un ami à moi |
| de | mein Freund | ein Freund von mir |
| es | mi amigo | un amigo mío |
| pt | o meu amigo | um amigo meu |
| ja | 私の友達 | 友達 (no article to lose) |

**Proposed, not engine output.** The right-hand column is what the task wants; the left is what the
engine writes today for **both**.

## Why

A possessive and an indefinite article compete for the determiner slot, and today the possessive
always wins. So a plan that says *indefinite* + *my* renders "my friend" — a definite phrase — and
the indefiniteness is silently dropped. Six of the seven have a way to say it and none of them is
reached.

P11 met it through German, where the loss is most visible, but it is not a German problem: Italian
*un mio amico* and Spanish *un amigo mío* are everyday, and English *a friend of mine* is the
ordinary way to introduce someone.

## Today

Verified in the working tree on 2026-09-23.

[`KEPT_BESIDE_POSSESSIVE`](../../../../packages/engine/src/possessive.ts#L33) is the set of
determiners a possessive stands **beside** rather than replaces:

```
new Set(['this', 'that', 'some', 'many', 'few', 'no'])
```

Its doc comment states the rule it implements: *"A possessive fills the determiner slot of a
definite, indefinite or bare head ('her book', 'il suo libro'), but a demonstrative or a quantifier
keeps its slot and pushes the possessive somewhere else."* **`indefinite` is deliberately on the
wrong side of that line** — and the machinery for the other side is fully built:

- German moves the possessive into a postnominal *von* + dative ("dieses Buch von ihr"), in
  [`nounPhrase.ts:51`](../../../../packages/engine/src/languages/de/nounPhrase.ts#L51) and again in
  [`complementsPhrase.ts`](../../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts)
  — A187 for the phrase, A202 for the complement.
- French postposes *à elle*, English *of hers*, Spanish *suyo*, Portuguese *seu*, and Italian
  **stacks** instead ("questo suo libro").
- `possessedDeclension` and `possessedHeadForms` already ask the head for its own determiner back
  when the possessive detaches.

So every engine already knows how to render a detached possessive. What none of them has been asked
is to detach one under an indefinite.

## Design

### D1. Add `indefinite` to the set, and let each engine's existing branch fire

**Recommendation:** one member, and the five postposing languages get their form for free. Italian is
the one that needs a second look: it stacks a demonstrative ("questo suo libro") but an indefinite
is *un mio amico* — the possessive **between** the article and the noun, which is stacking in a
different position. Check what `it/nounPhrase` writes for a stacked possessive under an indefinite
before assuming it falls out.

### D2. Not every indefinite wants it

"A friend of mine" is one reading; the other is a plain indefinite with a possessor that happens to
be generic. And in Japanese there is no article at all, so nothing changes — 私の友達 is both.

**Recommendation: no new field.** A plan that carries an indefinite determiner *and* a possessive is
unambiguous — it is asking for exactly the right-hand column. A speaker who wants "my friend" says
definite, which is the default and what every existing plan carries.

This is what makes the task small: the information is already in the plan and is being discarded.

### D3. This may be a bug, not a feature

The phrase renders **wrong today**, not merely poorly: a plan that says indefinite gets a definite
rendering in six languages, and no test pins it. That is the shape of a catalogued defect.

**Recommendation: check `docs/bugs/` for an existing id before scheduling this**, and if none covers
it, file it as a bug and fix it there instead of as a feature task — the fix-bug protocol gives it a
pinning test, which is what this most needs. It is written up here because P11 named it, not because
a feature task is the right home.

### D4. English is the odd one, and the easiest

*A friend of mine* uses the possessive **pronoun** (*mine*, *hers*), not the determiner (*my*,
*her*). Every other language reuses one form. English's second set is small, closed, and already
needed for a bare possessive elsewhere — check whether `possessiveEn` holds it.

## 1. Engine

`KEPT_BESIDE_POSSESSIVE` gains `'indefinite'`, and its doc comment is rewritten: the rule is no
longer "definite, indefinite or bare" but "definite or bare". Then one pass per engine to confirm the
detached branch produces the right-hand column, with Italian (D1) and English (D4) the two to write
by hand.

## 2. Tests

- `test/possession.test.ts`: the table above, all seven, and the same for a **plural** head ("some
  friends of mine", *einige Freunde von mir*).
- A bare possessed head is unchanged (it is not in the set and must not join it).
- The demonstrative and quantifier rows are unchanged — the set's existing members.
- German's complement surface too ("mit einem Freund von mir"), since
  `complementsPhrase` reads the same set.

## Verification

1. Rebuild `@signi/shared` and `@signi/engine`.
2. Engine, frontend and backend suites green; typecheck clean. **Every existing possession test is
   the regression surface** — this changes a rule that fires on every possessed phrase.
3. `POST /api/translate` with an indefinite determiner and a pronominal possessor.
4. In the browser (5173): set a possessor, switch the determiner to indefinite, watch six of the
   seven change.

## Out of scope (follow-ups)

- **A genitive possessor under an indefinite** ("a friend of the cat's") — English's double genitive,
  which the other six do not have.
- **The partitive reading** ("one of my friends"), a different construct with a different meaning.
- **Italian's stacking position** if D1's check finds it needs its own branch.
