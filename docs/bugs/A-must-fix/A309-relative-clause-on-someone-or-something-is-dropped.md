# A309. A relative clause on SOMEONE or SOMETHING is silently dropped

**Languages:** English, Italian, French, German, Spanish, Portuguese

SOMEONE and SOMETHING are pronouns by their lexicon and full phrases by their syntax
(`isPronounElement`, C32, P09-E40). A relative clause on them should render as it does on a noun:
*someone who runs*, *qualcuno che corre*, *quelqu'un qui court*, *jemanden, der läuft*, *alguien que
corre*, *alguém que corre*. The pronoun path never reads the relative, so it is dropped without a word:
*the cat sees someone.* The plan's content is lost and nothing flags it.

Where it is dropped depends on the slot:

- **As the direct object and in a complement:** all six European languages.
- **As the subject:** Italian, French and German. English, Spanish and Portuguese keep it there
  (`someone who runs sees the cat.`, `alguien que corre ve el gato.`).

| Case | Now | Want |
|---|---|---|
| the CAT SEEs SOMEONE who RUNs (object) | `the cat sees someone.` · `vede qualcuno.` · `voit quelqu'un.` · `sieht jemanden.` · `ve a alguien.` · `vê alguém.` | `the cat sees someone who runs.` · `vede qualcuno che corre.` · `voit quelqu'un qui court.` · `sieht jemanden, der läuft.` · `ve a alguien que corre.` · `vê alguém que corre.` |
| … SOMETHING that BURNs (object) | `sees something.` · `vede qualcosa.` · `voit quelque chose.` · `sieht etwas.` · `ve algo.` · `vê algo.` | `sees something that burns.` · `qualcosa che brucia` · `quelque chose qui brûle` · `etwas, das brennt` · `algo que arde` · `algo que arde` |
| … SOMETHING the DOG EATs (object gap) | as above | `something that the dog eats` · `qualcosa che il cane mangia` · `quelque chose que le chien mange` · `etwas, das der Hund frisst` · `algo que el perro come` · `algo que o cão come` |
| SOMEONE who RUNs SEEs the CAT (subject) | `qualcuno vede il gatto.` · `quelqu'un voit le chat.` · `jemand sieht den Kater.` | `qualcuno che corre vede il gatto.` · `quelqu'un qui court voit le chat.` · `jemand, der läuft, sieht den Kater.` |
| the CAT RUNs with SOMEONE who RUNs (comitative) | `runs with someone.` · `con qualcuno` · `avec quelqu'un` · `mit jemandem` · `con alguien` · `com alguém` | `with someone who runs` · `con qualcuno che corre` · `avec quelqu'un qui court` · `mit jemandem, der läuft` · `con alguien que corre` · `com alguém que corre` |

The Wants follow the relative a noun head gets in each language (`the person who runs`, `la personne
qui court`, `die Person, die läuft`). They were not rendered by a trial fix.

**Already right.** Japanese in every slot (走る誰かを見ます, 犬が食べる何かを見ます, 走る誰かと走ります).
English, Spanish and Portuguese as the subject. A noun head everywhere (`the cat sees the person who
runs.`).

**Found by** the lanes landing P09-E25 to E43 (SOMEONE is P09-E40), re-verified at 48af1d35.

## Shape of the fix

The pronoun path in each language's noun phrase (the `indefinite` branch that spells *qualcuno* /
*jemanden* and folds a modifier in, `foldIndefiniteModifier`) returns before the relative is joined.
It should join the resolved relative as the noun path does. In German it needs the comma pair and the
relative pronoun's gender: *jemand* takes *der*, *etwas* takes *das* (not *was*, which is for *alles*
and *nichts*; the fixer may rule *was* for *etwas*, since both are heard). French takes *qui* / *que*
as after a noun.

The subject is already joined in en/es/pt, so compare their subject path with the object path to find
the branch that drops it.

| | |
|---|---|
| **Test** | `indefinite-pronoun.test.ts` → *known bugs: a relative clause on SOMEONE or SOMETHING is dropped (A309)* (5 `test.fails`, one per row, plus a regression test for a noun head) |
