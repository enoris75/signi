# A227. French does not elide before a verb opening on an h muet

**Language:** French

French elides *je*, *ne* and *de* before a vowel **sound**, and an h muet is one: *j'habite*, *je
n'habite pas*, *capable d'habiter*. Whether an h is muet (*habiter*, *l'homme*) or aspiré (*le
héros*, *je hurle*) is lexical, and the noun side knows it: a noun's lexeme says `elides`, which
[`elidesBefore`](../../../packages/engine/src/languages/fr/elidesBefore.ts) reads (*l'homme*,
*l'histoire*, *l'herbe*).

The verb side tests the first letter only (`VOWEL_START`, in
[`joinSubject`](../../../packages/engine/src/languages/fr/joinSubject.ts), `negateFinite` and
`negateInfinitive` in [`predicateText`](../../../packages/engine/src/languages/fr/predicateText.ts),
and the periphrasis's *de* in [`aspectVerbFr`](../../../packages/engine/src/languages/fr/aspectVerbFr.ts)),
and no verb lexeme carries the flag. LIVE is *habiter*, the one such verb seeded, so every clause
over it that puts *je*, *ne* or *de* in front of it is wrong.

| Case | Now | Want |
|---|---|---|
| I LIVE | `je habite.` | `j'habite.` |
| … past | `je habitai.` | `j'habitai.` |
| … future | `je habiterai.` | `j'habiterai.` |
| I do not LIVE | `je ne habite pas.` | `je n'habite pas.` |
| the MAN does not LIVE | `l'homme ne habite pas.` | `l'homme n'habite pas.` |
| the MAN never LIVEs | `l'homme ne habite jamais.` | `l'homme n'habite jamais.` |
| I am about to LIVE | `je suis sur le point de habiter.` | `je suis sur le point d'habiter.` |
| if I LIVEd, the DOG would RUN | `si je habitais, le chien courrait.` | `si j'habitais, le chien courrait.` |
| do not live! | `ne habite pas.` | `n'habite pas.` |
| the PERSON who does not LIVE with PERSONS | `la personne qui ne habite pas avec des personnes.` | `la personne qui n'habite pas avec des personnes.` |
| the HOUSE where I LIVE | `la maison où je habite.` | `la maison où j'habite.` |
| to be able to LIVE | `être capable de habiter.` | `être capable d'habiter.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** Whatever does not put the verb's own form after the clitic: an auxiliary (`j'ai
habité.`), a modal (`je dois habiter.`), the citation's *ne pas* (`ne pas habiter.`), and *est-ce
que* before a noun subject (`est-ce que l'homme habite ?`). A verb on a consonant (`je ne cours
pas.`, `je mange.`). The other six languages have no elision of the kind.

**Nothing shipped shows it.** WILD's gloss was written around it ("that does not live with people"
would have said *qui ne habite pas*, per its comment in
[`adjectives.ts`](../../../packages/backend/src/concepts/adjectives.ts)).

Found authoring C24's relational adjectives (WILD, DOMESTIC).

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine and backend suites green, and no passing test moves.

- The verb's lexeme says it, as a noun's does: `elides: '1'` on *habiter* in
  [`intransitive.ts`](../../../packages/backend/src/concepts/verbs/intransitive.ts).
- A helper decides whether a clitic elides before a text that opens on the verb's own form:
  `VOWEL_START.test(text) || (forms['elides'] === '1' && /^h/i.test(text))`.
- `joinSubject` takes the verb's forms (its callers, `renderClause` and `relativeText`, pass
  `verbPhrase.verb.forms`), and `negateFinite`, `negateInfinitive` and `aspectVerbFr`'s *de* ask the
  helper in place of `VOWEL_START`.
- [`infinitiveComplementText`](../../../packages/engine/src/languages/fr/infinitiveComplementText.ts)
  already asks `elidesBefore` with the verb's forms, so *capable d'habiter* falls out of the flag
  alone.

**Decisions for the fixer:**

- **The lead-word test.** The trial's `/^h/` stands in for "the text opens on this verb", which holds
  at every site it touched. A real fix should compare the lead word with the verb's forms (the
  imperfect and the conditional are derived, not stored, so `forms` alone does not list them).
- **The object clitics.** `frCliticize` elides *me*, *te*, *le*, *la*, *se* by `VOWEL_START` too, and
  a transitive h-muet verb (*habiller*, *honorer*) would need the same. None is seeded. Not pinned.

| | |
|---|---|
| **Test** | `clause.test.ts` → *known bugs: French does not elide before a verb opening on an h muet (A227)* (1 `test.fails`, plus a regression test for an auxiliary or a modal, the citation, *est-ce que* and a verb on a consonant) |
