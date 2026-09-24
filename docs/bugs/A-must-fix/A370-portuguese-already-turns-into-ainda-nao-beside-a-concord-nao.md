# A370. Portuguese ALREADY turns into "ainda não" beside a concord "não"

**Languages:** Portuguese

P09-E28 gave ALREADY a negative word: under a negated verb it is *not yet*, "o gato ainda não come a
comida". That is for a verb that is itself negated. A `no` object or complement leaves the verb
positive. Portuguese still writes a "não" in front of it, but only for concord with the postverbal
"nenhum" ("o gato não come nenhuma comida"), and that "não" does not deny ALREADY. The adverb should
keep its own word, ahead of the "não": "o gato **já não** come nenhuma comida", the idiomatic
"already … no" (≈ "no longer"). Spanish keeps "ya", Japanese もう and English "already".

[pt/predicateText.ts](../../../packages/engine/src/languages/pt/predicateText.ts) asks
`negativeAdverb(modifier, verbText.startsWith('não '))`, so any "não" on the verb counts, including
the concord one, and "já" becomes "ainda". The other six languages ask about the verb's own
polarity (`verbPhrase.negative` / `verbNegative`). "a criança ainda não perguntará nenhum homem"
says "will not ask any man yet", the opposite of what the plan says.

| Case | Now | Want |
|---|---|---|
| the CAT already EATs no FOOD | `o gato ainda não come nenhuma comida.` | `o gato já não come nenhuma comida.` |
| past | `o gato ainda não comeu nenhuma comida.` | `o gato já não comeu nenhuma comida.` |
| under CAN | `o gato ainda não pode comer nenhuma comida.` | `o gato já não pode comer nenhuma comida.` |
| a `no` locative: … EATs in no HOUSE | `o gato ainda não come em nenhuma casa.` | `o gato já não come em nenhuma casa.` |
| the CHILD will already ASK no MAN | `a criança ainda não perguntará nenhum homem.` | `a criança já não perguntará nenhum homem.` |
| the random phrase | `… os continentes mais adultos que … ainda não perguntarão a vocês ou a ele a nenhuma morte distante …` | `… os continentes mais adultos que … já não perguntarão a vocês ou a ele a nenhuma morte distante …` |

Every **Want** was rendered by applying the fix below to a throwaway copy of HEAD, not written by
hand.

**Already right.** A verb negated on its own keeps *not yet*: `o gato ainda não come a comida.`,
`o gato ainda não come nenhuma comida.` (`negative: true` with a `no` object). The affirmative:
`o gato come já a comida.` STILL and ALSO lead the concord "não" with their own word, which is
right: `o gato também não come nenhuma comida.` The other six languages: `the cat already eats no
food.`, `der Kater frisst schon kein Essen.`, `el gato no come ya ninguna comida.`,
`猫はどの食べ物ももう食べません。`

**Found by** the random phrase of seed 239952, "… so the most adult continents that will broadcast
many tooth feelings and Europe behind which the animals do not play will already ask no far death …":
Portuguese `ainda não perguntarão`.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine suite green.

Leave the pre-negator *slot* alone and gate only the *word swap* on the verb's own negation. In
`pt/predicateText.ts`, the `preVerb` line:

```ts
: outscopesNao ? (modifier?.forms['negative'] && verbNegative === true ? negAdverb.text : modifierText) : '';
```

Do **not** simply pass `verbNegative === true` to `negativeAdverb`, as the other languages do. That
drops the adverb behind the verb ("o gato não come já nenhuma comida") and moves ALSO with it
("o gato não come também nenhuma comida", where `também não` is right today).

**Decision for the fixer:** Italian keeps "già" after the concord "non" (`il bambino non chiederà
già nessun uomo`), and "già non" or "non … più" might read better. That is outside this bug and not pinned.

| | |
|---|---|
| **Test** | `negation.test.ts` → *known bugs: Portuguese ALREADY turns into "ainda não" beside a concord "não" (A370)* (1 `test.fails`: the present, the past, under CAN, a `no` locative, and the random phrase's ASK; plus a regression test for the other languages, a negated verb, the affirmative and ALSO) |
