# A317. TELL with a direct object and a content clause makes the addressee the told thing

**Languages:** Italian, French, German, Spanish, Japanese, Portuguese

TELL's addressee is a terminus (`the man tells the dog that the cat runs`, `racconta al cane che…`,
`erzählt dem Hund, dass…`, 犬に伝えます, pinned in `content-clause.test.ts`). English writes that
addressee bare before a content clause, so from the English side the natural plan puts the addressee
in the direct object. The other six then read TELL's narrating frame, whose object is the thing told:
*racconta il cane che il gatto corre* ("narrates the dog"), *raconte le chien que*, *erzählt den Hund,
dass*, *cuenta el perro que*, 犬を伝えます, *conta o cão que*. A pronoun comes out as *erzählt dich* and
あなたを. English is right by accident.

Next to a content clause, TELL's direct object can only be the addressee, since the clause is the thing
told. It should render as the terminus does.

| Case | Now | Want |
|---|---|---|
| the MAN TELLs the DOG that the CAT RUNs (object) | `racconta il cane che` · `raconte le chien que` · `erzählt den Hund, dass` · `cuenta el perro que` · 犬を伝えます · `conta o cão que` | `racconta al cane che` · `raconte au chien que` · `erzählt dem Hund, dass` · `cuenta al perro que` · 犬に伝えます · `conta ao cão que` |
| … the WOMAN | `racconta la donna che` · `raconte la femme que` · `erzählt die Frau, dass` · 女を伝えます · `conta a mulher que` | `racconta alla donna che` · `raconte à la femme que` · `erzählt der Frau, dass` · 女に伝えます · `conta à mulher que` |
| … you (SECOND_PERSON) | `erzählt dich, dass` · あなたを伝えます | `erzählt dir, dass` · あなたに伝えます |

The Wants are what the same plan renders with the addressee as a terminus.

**Already right.** English (`tells the dog that the cat runs.`). The Romance clitic (`ti racconta`,
`te raconte`, `te cuenta`, `te conta`), whose accusative and dative are the same word. Spanish *cuenta a
la mujer* (the personal *a*). The terminus plan in all seven, and TELL + a story object + a terminus.

**Also affected, not pinned.** SAY with a direct object and a content clause fails the same way, and in
English too: `the man says the dog that the cat runs.`, `dice il cane che`. SAY takes its addressee
with *to* in English (`says to the dog that`), so a person object next to SAY's clause is the same
misplaced addressee. It is for the fixer to route it the same way or refuse it.

**Found by** the lanes landing P09-E25 to E43, while probing saying verbs. Pre-existing (P09-E4), re-verified
at 48af1d35.

## Decisions for the fixer

- **Route or refuse.** The recommended fix moves an animate (or any) direct object into the terminus
  when the clause also has a `contentObject` and the verb licenses a terminus, before either is
  rendered. The other option is to refuse the plan and have the builder offer the addressee only as a
  terminus. Routing keeps the plan an English speaker builds, so it is recommended.
- **Which sense.** The lanes proposed the saying verb as well (*dice al cane che*, *dit au chien que*,
  *sagt dem Hund, dass*, *dice al perro que*, *diz ao cão que*): *raccontare* / *erzählen* / *contar* +
  *che* is "recount that", heavier than "tell that". That would move the terminus test already in
  `content-clause.test.ts` ('TELL, with its addressee') along with these pins. It is a separate lexical
  choice (TELL's lexeme naming a `content_clause` sense), and this bug does not require it.

| | |
|---|---|
| **Test** | `content-clause.test.ts` → *known bugs: TELL with a direct object and a content clause makes the addressee the told thing (A317)* (3 `test.fails`, one per row, plus a regression test for the terminus plan, the story object and the Romance clitic) |
