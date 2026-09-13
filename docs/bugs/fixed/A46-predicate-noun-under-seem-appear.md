# A46. A predicate NOUN under SEEM is rendered bare, as if the verb were BECOME

**Language:** English, German

The `predicative` complement renderer branches on the **complement head** — adjective vs noun —
and never on the **verb**:

```ts
// en/complementsPhrase.ts, de/complementsPhrase.ts, and the same shape in it/fr/es/pt
if (type === 'predicative') {
  return coordinate(c.phrase, (np) =>
    np.head.forms['role'] === 'adjective' ? enAdj(np.head) : npText(np),
  );
}
```

That is correct for `BECOME` and `BE`, where every language takes a bare predicate nominative
(`becomes a legend`, `wird eine Legende`, `diventa una leggenda`). `SEEM` licenses the same
complement and so inherits the same rendering — but the seeming verb does not admit a bare
predicate noun on the same terms. A predicate **adjective** is fine under all three verbs
(`seems tired`, `scheint müde`, `sembra stanco`); only the **nominal** complement is affected.

| | Now | Want |
|---|---|---|
| English | `the cat seems a legend.` | `the cat seems to be a legend.` |
| German | `der Kater scheint eine Legende.` | `der Kater scheint eine Legende zu sein.` |
| Italian | `il gatto sembra una leggenda.` | *(already correct)* |
| French | `le chat semble une légende.` | *(already correct)* |
| Spanish | `el gato parece una leyenda.` | *(already correct)* |
| Portuguese | `o gato parece uma lenda.` | *(already correct)* |

English `seems a legend` is archaic/literary, not ungrammatical; German `scheint eine Legende` **is**
ungrammatical — `scheinen` takes no predicate nominative at all and requires the infinitival copula
`zu sein`. Romance is already right: `sembrare` / `sembler` / `parecer` do license a bare predicate
noun. Japanese is already right (`伝説に思えます` — the に-marked predicate nominal).

## Shape of the fix

The predicative branch must consult the **governing verb** as well as the complement head, and in
en/de append an infinitival copula after the noun phrase (`to be …`, `… zu sein`) when the verb is
a seeming verb and the complement head is a noun. The predicate-adjective path is untouched.

The trigger is a property of the **verb**, not of the complement or the noun, so it belongs next to
the `predicative` branch in each language module and not in the noun-phrase machinery. A
`copula`-style form flag on the concept (as `BE` already carries) is the natural encoding: mark
which verbs are seeming verbs, and let each language decide whether it needs the repair.

## Why APPEAR is not part of this

The original report was the triple `I appear a bovine.` / `appaio un bovino.` /
`ich erscheine ein Rind.` — marginal in English and ill-formed in Italian and German. That turned
out to be a **corpus** defect rather than an engine one: `APPEAR` was seeded with a conflated gloss
("to come into view; to look or seem a certain way") and licensed `predicative`, while every
language's APPEAR lexeme (`apparire`, `apparaître`, `aparecer`, `erscheinen`) is strictly the
come-into-view verb, which takes no predicate nominative in any of them.

The two senses are now split at the corpus level:

- **SEEM** — *to look like; to give the impression of being similar to*. Keeps `predicative`.
- **APPEAR** — *to come into view; to become visible* (opposite: disappearing). Licenses
  `locative`, `cause`, `terminus` and **no** `predicative`, so the ill-formed strings are
  unreachable rather than repaired.

Japanese was also carrying the conflation lexically: `APPEAR` was 見える ("be visible / look like"),
which collides with the terminus に — `猫は犬に見えます` reads as *the cat looks like a dog*, not
"the cat appears to the dog". It is now 現れる, which keeps に unambiguously the witness.

| | |
|---|---|
| **Test** | `complements/predicative.test.ts` → *known bugs: a predicate NOUN under SEEM* (1 `test.fails`), plus *predicative is licensed by SEEM, not by APPEAR* pinning the split |

## Resolved

Fixed 2026-09-13, using the corpus flag and verb-aware predicative branch the shape of the fix
proposed:

- **Corpus:** every SEEM lexeme in
  [`verbs/motion.ts`](../../../packages/backend/src/concepts/verbs/motion.ts) now has
  `seeming: '1'`, the same way `copula: '1'` marks BE. Each engine decides what the flag means for
  it. Only en and de read it. `packages/backend/signi.db` was reseeded.
- [`types.ts`](../../../packages/engine/src/types.ts): `isSeemingPredicateNoun(complement, verb)`
  is true when the verb has the flag and at least one conjunct of the predicative is a noun. A
  predicate adjective on its own stays bare. A mixed group gets the copula once, for the whole group.
- [`en/complementsPhrase.ts`](../../../packages/engine/src/languages/en/complementsPhrase.ts) now
  takes the governing verb's forms, passed in by
  [`predicateParts.ts`](../../../packages/engine/src/languages/en/predicateParts.ts). The
  predicative branch puts `to be` in front of the predicate. Because the copula follows whatever
  verb group carries tense, negation or a modal, it is right in every group: `seemed to be`,
  `does not seem to be`, `can seem to be`, `has seemed to be`, `seem to be` (command),
  `to seem to be`, `if the cat seemed to be`, `that seems to be`.
- [`de/complementsPhrase.ts`](../../../packages/engine/src/languages/de/complementsPhrase.ts) also
  takes the verb's forms. It is passed in by every German clause order in
  [`renderClause.ts`](../../../packages/engine/src/languages/de/renderClause.ts) and by
  [`subordinateClause.ts`](../../../packages/engine/src/languages/de/subordinateClause.ts).
  `zu sein` closes the whole complement block, so it sits directly against the verb cluster in every
  order:
  - `scheint eine Legende zu sein`;
  - `wird eine Legende zu sein scheinen`;
  - `hat eine Legende zu sein geschienen`;
  - `wenn der Kater eine Legende zu sein scheinen würde`;
  - `, der eine Legende zu sein scheint,`.

  Other complements come before it, in the engine's existing order: `scheint eine Legende im Markt zu
  sein`, `scheint dem Hund eine Legende zu sein`. A relative clause on the predicate noun is closed
  off by its commas: `scheint eine Legende, die brennt, zu sein`.

BECOME and BE are unchanged. So are it/fr/es/pt/ja. Two related German problems are still open
because they belong to other defects. First, a negated predicate noun reads `scheint nicht eine
Legende zu sein`, which matches today's `wird nicht eine Legende`; `keine Legende` would be better.
Second, the relative clause puts adverbs and `nicht` after the complements (A50).

- **Tests:** [`packages/engine/test/complements/predicative.test.ts`](../../../packages/engine/test/complements/predicative.test.ts)
  → *known bugs: a predicate NOUN under SEEM*. The pinning `test.fails` is now a passing `test`. New
  cases:
  - tense, negation, future, modal, resultative and an adverb;
  - the command, the infinitive, the `wenn` protasis and a relative clause;
  - other complements (locative, terminus) and a relative clause on the predicate noun;
  - a mixed adjective + noun group and a noun + noun group;
  - guards that a predicate adjective under SEEM (plain and negated) and a predicate noun under
    BECOME and BE stay bare;
  - a guard that it/fr/es/pt/ja keep the bare noun.

  Colocated unit tests now cover the verb flag:
  - [`en/complementsPhrase.test.ts`](../../../packages/engine/src/languages/en/complementsPhrase.test.ts)
    and [`de/complementsPhrase.test.ts`](../../../packages/engine/src/languages/de/complementsPhrase.test.ts):
    noun, mixed group, adjective and non-seeming verb, and the copula's place among the other
    complements;
  - [`en/predicateParts.test.ts`](../../../packages/engine/src/languages/en/predicateParts.test.ts):
    the verb groups;
  - [`de/renderClause.test.ts`](../../../packages/engine/src/languages/de/renderClause.test.ts):
    declarative, negated, future, modal, verb-final and infinitive;
  - [`de/subordinateClause.test.ts`](../../../packages/engine/src/languages/de/subordinateClause.test.ts):
    the relative clause.

  The en fixture `SEEM` and a new de fixture `SCHEINEN` both carry the flag.
