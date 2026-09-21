# A178. A Portuguese suppletive superlative follows the noun, where it should precede it

**Languages:** Portuguese

[A6](../fixed/A06-portuguese-suppletive-comparative.md) gave Portuguese its four suppletive
comparatives. At `more` and `most`, *grande*, *bom*, *pequeno* and *mau* become *maior*, *melhor*,
*menor* and *pior*. A6 kept every compared adjective after the noun, and
[`ptAdj`](../../../packages/engine/src/languages/pt/ptAdj.ts) says so in a comment.

After the noun is right for the comparative: *o gato maior* is "the bigger cat". It is also right
for a periphrastic superlative: *o gato mais belo*. But a suppletive superlative normally stands
**before** the noun: *o maior continente*, *o melhor gato*. After the noun, *o continente maior*
leans towards the comparative ("the bigger continent"). The superlative then loses the one thing
that marks it in Portuguese, since the definite article is on the comparative too
([C01](../C-do-not-fix/C01-italian-spanish-superlative-comparative-homophony.md)).

| Plan | Now | Want |
|---|---|---|
| CAT + BIG, `most` | `o gato maior come.` | `o maior gato come.` |
| CAT + GOOD, `most` | `o gato melhor come.` | `o melhor gato come.` |
| CAT + BAD, `most` | `o gato pior come.` | `o pior gato come.` |
| HOUSE + SMALL, `most` | `a casa menor arde.` | `a menor casa arde.` |
| CAT + GREAT, `most` | `o gato maior come.` | `o maior gato come.` |
| DOG (plural) + BIG, `most` | `os cães maiores correm.` | `os maiores cães correm.` |
| CAT (fem plural) + BIG, `most` | `as gatas maiores comem.` | `as maiores gatas comem.` |
| source HOUSE + BIG, `most` | `o gato vem da casa maior.` | `o gato vem da maior casa.` |
| my DOG + BIG, `most` | `o gato vê o meu cão maior.` | `o gato vê o meu maior cão.` |
| CAT + BIG `most` + BROWN | `o gato maior e castanho come.` | `o maior gato castanho come.` |
| the ASIA definition: CONTINENT + BIG, `most` | `o continente maior` | `o maior continente` |
| the OCEANIA definition: CONTINENT + SMALL, `most` | `o continente menor` | `o menor continente` |

Every **Want** was rendered by a trial fix (below) applied in the worktree, not written by hand.
The last plain-adjective row gets better too. Today the superlative and BROWN are coordinated after
the noun, "the cat bigger and brown". With the fix the superlative moves out of that list.

**Already right, and must stay so:**
- the comparative, whose suppletive does follow the noun: `o gato maior come.`, `o gato melhor come.`;
- a lowered degree: `o gato menos grande come.`;
- a periphrastic superlative, which keeps the postnominal place: `o gato mais belo come.`;
- the predicative superlative: `o gato é o maior.`;
- Italian `il gatto più grande`, Spanish `el gato más grande` and French `le chat le plus grand`.
  Each is a normal superlative in its language, and none of them is suppletive except French
  *meilleur* / *pire*, whose position is a separate question and is not filed here.

Found by authoring the ASIA and OCEANIA definitions
([localization A17](../../localization/done/A17-continent-superlatives.md)), which ship with the
postnominal form until this is fixed.

## Shape of the fix

In [`ptAdj`](../../../packages/engine/src/languages/pt/ptAdj.ts), send a suppletive at `most` to
the prenominal list. That means an adjective whose Portuguese base is a key of `PT_SUPPLETIVE`
([`pt.consts.ts`](../../../packages/engine/src/languages/pt/pt.consts.ts)). Test it before the
`PRENOMINAL` check, and take its surface from `ptComparison` as now:

```ts
if (PT_SUPPLETIVE[a.forms['base'] ?? ''] && adjDegree(a) === 'most') {
  const surface = ptComparison(a, gender, plural);
  if (surface) pre.push(surface);
} else if (PRENOMINAL.has(a.conceptId) && adjDegree(a) === 'positive') {
```

The trial turns the pin green, and every regression case stays as it is. **It also changes passing
assertions that pinned the postnominal superlative.** Update these to the prenominal form with the
fix:

- `adjectives.test.ts` → *French relative superlative doubles the article* → *French comparative is
  NOT doubled, and It/Es/Pt superlatives keep one article*: `o gato maior come.` → `o maior gato come.`
- `adjectives.test.ts` → *known bugs: a superlative under an indefinite or bare determiner* (A175,
  fixed). Three of its tests assert pt at `most`: `o cão maior`, `os cães maiores`, `a gata maior`,
  `da casa maior`, `à casa maior`, `na casa maior`, `do cão maior`, `pelo cão maior`. The fix puts
  `maior` / `maiores` before the noun in each. The `least` cases (`menos grande`) are unchanged.

Rewrite `ptAdj`'s comment on compared adjectives in the same change. Nothing else in the engine
suite moves.

| | |
|---|---|
| **Test** | `adjectives.test.ts` → *known bugs: Portuguese suppletive superlative before the noun* (1 `test.fails`, plus a regression test) |
