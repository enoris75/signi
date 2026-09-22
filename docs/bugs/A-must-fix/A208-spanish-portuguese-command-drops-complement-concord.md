# A208. A negative complement does not negate a Spanish or Portuguese command, instruction or infinitive

**Languages:** Spanish, Portuguese

A `no` word after the verb needs the preverbal negator, and a complement comes after the verb.
[A33](../fixed/A33-romance-complement-negative-concord.md) made a `no`-determined complement trigger
it, so the statement is right: `el gato no corre en ninguna casa`, `o gato não corre em nenhuma
casa`. That rule applies to commands as well. A negative command in Spanish and Portuguese is the
present subjunctive after `no` / `não`: *no corras en ninguna casa*, *não corra em nenhuma casa*. The
infinitive, which the instruction register also uses, takes the bare negator: *no correr en ninguna
casa*.

The engine keeps the affirmative command, and leaves the instruction and the infinitive
un-negated: `corre en ninguna casa`, `correr en ninguna casa`. The output is ungrammatical, and in
the command it contradicts itself, telling someone to run while saying where they must not.

| Case | Language | Now | Want |
|---|---|---|---|
| `tú` command, RUN in no HOUSE | Spanish | `corre en ninguna casa.` | `no corras en ninguna casa.` |
| | Portuguese | `corra em nenhuma casa.` | `não corra em nenhuma casa.` |
| … GO to no MARKET (direction) | Spanish | `ve a ningún mercado.` | `no vayas a ningún mercado.` |
| | Portuguese | `vá a nenhum mercado.` | `não vá a nenhum mercado.` |
| plural command, EAT the MOUSE with no DOG (comitative) | Spanish | `comed el ratón con ningún perro.` | `no comáis el ratón con ningún perro.` |
| | Portuguese | `comam o rato com nenhum cão.` | `não comam o rato com nenhum cão.` |
| command with a clitic object, EAT him in no HOUSE | Spanish | `cómelo en ninguna casa.` | `no lo comas en ninguna casa.` |
| | Portuguese | `coma-o em nenhuma casa.` | `não o coma em nenhuma casa.` |
| reflexive command, MOVE_ONESELF in no HOUSE | Spanish | `muévete en ninguna casa.` | `no te muevas en ninguna casa.` |
| | Portuguese | `mova-se em nenhuma casa.` | `não se mova em nenhuma casa.` |
| cohortative, EDIT the PHRASE in no HOUSE | Spanish | `editemos la frase en ninguna casa.` | `no editemos la frase en ninguna casa.` |
| | Portuguese | `editemos a frase em nenhuma casa.` | `não editemos a frase em nenhuma casa.` |
| instruction, RUN in no HOUSE | Spanish | `correr en ninguna casa.` | `no correr en ninguna casa.` |
| | Portuguese | `correr em nenhuma casa.` | `não correr em nenhuma casa.` |
| instruction, EAT the MOUSE in no HOUSE | Spanish | `comer el ratón en ninguna casa.` | `no comer el ratón en ninguna casa.` |
| | Portuguese | `comer o rato em nenhuma casa.` | `não comer o rato em nenhuma casa.` |
| infinitive, RUN in no HOUSE | Spanish | `correr en ninguna casa.` | `no correr en ninguna casa.` |
| | Portuguese | `correr em nenhuma casa.` | `não correr em nenhuma casa.` |
| the random phrase | Spanish | `editemos todas las frases por ningún dinero menos rápido.` | `no editemos todas las frases por ningún dinero menos rápido.` |
| | Portuguese | `editemos todas as frases por nenhum dinheiro menos rápido.` | `não editemos todas as frases por nenhum dinheiro menos rápido.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** Italian and French, in every row: `non correre in nessuna casa`, `ne cours dans
aucune maison`, `non modifichiamo tutte le frasi attraverso nessun denaro meno veloce`, `ne courir
dans aucune maison`. English, German and Japanese need no concord: `run in no house.`, `lauf in
keinem Haus.`, `どの家でも走るな。`. In Spanish and Portuguese, the statement (A33), a `no` object in a
command (`no edites ninguna frase`), a negated verb beside the negative complement (`no corras en
ninguna casa`), and a comparison's `no`, which leaves the command positive
([A181](../fixed/A181-negative-similative-manner-negates-the-clause.md)): `corre como ningún perro`.

Found by the random phrase "let's edit all phrases through no least quick money." (seed 875933):
`editemos todas las frases por ningún dinero menos rápido.`, `editemos todas as frases por nenhum
dinheiro menos rápido.`, beside Italian's `non modifichiamo …` and Japanese's `…編集するのはやめましょう。`.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine suite green, and no passing test moves.

[`es/predicateText.ts`](../../../packages/engine/src/languages/es/predicateText.ts) and
[`pt/predicateText.ts`](../../../packages/engine/src/languages/pt/predicateText.ts) each build three
negation gates. `needsNo` / `needsNao` serves the statement and already reads
[`hasNegativeComplement`](../../../packages/engine/src/functions/hasNegativeComplement.ts). The
imperative branch's `impNeg` and the infinitive branch's `infNeg` read only the verb, the object and
the adverb:

```ts
const impNeg = verbNegative === true || objectIsNegative || modifierIsNegative;
const infNeg = verbNegative === true || objectIsNegative || modifierIsNegative;
```

Add `hasNegativeComplement(complements)` to all four (both files already import it). Everything else
follows from `impNeg`. It picks the negative imperative form (`corras`, `vayas`, `comáis`), the
proclitic order (`no lo comas`, `não o coma`, `no te muevas`) and the leading negator. The helper
already skips a similative manner phrase, so A181's `corre como ningún perro` stays positive.

Italian computes one `negText` before it branches on the mood, and French folds the complement into
its `aucun` branch the same way, which is why neither has this bug. Unifying the Spanish and
Portuguese gates into one term would close the gap for good. Whether that is worth doing is the
fixer's call: `needsNo` also reads `groupHasNegativeAdverb` for the modals' adverbs, which a command
and an infinitive discard.

| | |
|---|---|
| **Test** | `complements/determiner.test.ts` → *known bugs: complement negative concord in a command or an infinitive* (1 `test.fails`, plus a regression test for Italian, French, English, German, Japanese and the Spanish and Portuguese cases already right) |
