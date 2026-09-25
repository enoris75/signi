# P09-E38. Approximators — *about five*, *almost all*

**Construct:** a word that makes a quantity approximate: on a numeral ("about five cats") or on a
quantity determiner ("almost all cats").
**Shape:** one `NounPhrase` field (`approximator: 'about' | 'almost'`) read by the numeral and
determiner paths.
**Scope:** all 7 languages.
**Status:** **shipped, 2026-09-24** — `NounPhrase.approximator` in all seven languages, plan-only;
see [Done](#done). Filed 2026-09-24 from
[P09-E24](P09-E24-ranks-201-400.md)'s §3.
**Words:** *about* (rank 204, the adverb: COCA's *about/r* is the approximator, the preposition is
rank 45) and *almost* (357). *Around* (314, the adverb) is a third spelling of `about` (P09 D1).

| lang | **about** five cats run | **almost all** cats run | **almost no** cat runs | five cats run (`indefinite`) |
|---|---|---|---|---|
| en | about five cats run. | almost all cats run. | almost no cat runs. | five cats run. |
| it | circa cinque gatti corrono. | quasi tutti i gatti corrono. | quasi nessun gatto corre. | cinque gatti corrono. |
| fr | environ cinq chats courent. | presque tous les chats courent. | presque aucun chat ne court. | cinq chats courent. |
| de | etwa fünf Kater laufen. | fast alle Kater laufen. | fast kein Kater läuft. | fünf Kater laufen. |
| es | unos cinco gatos corren. | casi todos los gatos corren. | casi ningún gato corre. | cinco gatos corren. |
| pt | cerca de cinco gatos correm. | quase todos os gatos correm. | quase nenhum gato corre. | cinco gatos correm. |
| ja | 約五匹の猫は走ります。 | ほとんどすべての猫は走ります。 | ほとんどどの猫も走りません。 | 五匹の猫は走ります。 |

Engine output since 2026-09-24; the first two columns were the proposal and landed as proposed,
except Japanese は for the proposal's が (the engine's existing topic choice, unchanged here).

## Done

Shipped 2026-09-24. `NounPhrase.approximator?: Approximator` (`'about' | 'almost'`) sits after
`numeral`. `resolveNounPhrase` puts the word, with its separator, on the head's forms —
`approximator` when there is a numeral and the value is `about`, `approximator_det` when the value
is `almost` and the resolved determiner is `all`, `no` or `many` (`APPROXIMATOR_WORDS`,
`ALMOST_DETERMINERS` in `translator.consts.ts`) — and every engine reads it where it already spells
the numeral (`numeralText`, shared) or the determiner (a `withApproximator` wrapper around each
language's determiner function; Japanese's `npSegs`). No builder control (D1, plan-only). Engine
output, pinned in [`approximators.test.ts`](../../../../../packages/engine/test/approximators.test.ts):

| | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| about 5 (subject) | about five cats run. | circa cinque gatti corrono. | environ cinq chats courent. | etwa fünf Kater laufen. | unos cinco gatos corren. | cerca de cinco gatos correm. | 約五匹の猫は走ります。 |
| about 12 (fem) | about twelve houses burn. | circa dodici case bruciano. | environ douze maisons brûlent. | etwa zwölf Häuser brennen. | unas doce casas arden. | cerca de doze casas ardem. | 約十二軒の家は燃えます。 |
| about 5 (object + adjective) | the dog sees about five big cats. | il cane vede circa cinque grandi gatti. | le chien voit environ cinq grands chats. | der Hund sieht etwa fünf große Kater. | el perro ve unos cinco gatos grandes. | o cão vê cerca de cinco gatos grandes. | 犬は約五匹の大きい猫を見ます。 |
| almost all | almost all cats run. | quasi tutti i gatti corrono. | presque tous les chats courent. | fast alle Kater laufen. | casi todos los gatos corren. | quase todos os gatos correm. | ほとんどすべての猫は走ります。 |
| almost no (subject) | almost no cat runs. | quasi nessun gatto corre. | presque aucun chat ne court. | fast kein Kater läuft. | casi ningún gato corre. | quase nenhum gato corre. | ほとんどどの猫も走りません。 |
| almost no (object) | the dog sees almost no cat. | il cane non vede quasi nessun gatto. | le chien ne voit presque aucun chat. | der Hund sieht fast keinen Kater. | el perro no ve casi ningún gato. | o cão não vê quase nenhum gato. | 犬はほとんどどの猫も見ません。 |
| almost many | almost many cats run. | quasi molti gatti corrono. | presque beaucoup de chats courent. | fast viele Kater laufen. | casi muchos gatos corren. | quase muitos gatos correm. | ほとんど多くの猫は走ります。 |
| almost all (locative) | the cat runs in almost all houses. | il gatto corre in quasi tutte le case. | le chat court dans presque toutes les maisons. | der Kater läuft in fast allen Häusern. | el gato corre en casi todas las casas. | o gato corre em quase todas as casas. | 猫はほとんどすべての家で走ります。 |

What landed differently from the plan:

1. **An approximated numeral drops the article.** A plan's default determiner is `definite`, which
   would give "the about five cats"; `about` with a numeral resolves a definite (as C31 already
   resolves an indefinite) bare. A demonstrative keeps its place ("these about five cats", *questi
   circa cinque gatti*), pinned.
2. **Japanese *almost no* is ほとんどどの…も…ない** (ほとんどどの猫も走りません), ほとんど before the
   circumfix's どの, the shape of ほとんど誰も…ない ("almost nobody"). The alternatives were rejected:
   ほとんどの猫は走りません says "most cats do not run", and 猫はほとんど走りません is the verb *almost*
   ("the cat hardly runs") that D3 keeps out.
3. **Japanese *about* is 約 before the numeral and its counter**, 約五匹の猫, through the same
   `numeralText` the other six read.
4. ***almost many* ships as D1 ruled, and reads poorly**: "almost many cats", *quasi molti gatti*,
   *fast viele Kater* are marginal in every language (pinned as rendered, a product call to drop
   `many` from `ALMOST_DETERMINERS`). *Almost* on a numeral ("almost five cats") is ignored, as D1
   says, though it is natural in all seven.
5. **Inside a complement `about` inherits the numeral defects already filed**: de/es/pt drop the
   numeral there ([A291](../../../../bugs/fixed/A291-german-spanish-portuguese-drop-the-numeral-inside-a-complement.md):
   "läuft in Häusern" for *in etwa fünf Häusern*), and French writes *de* before a bare numeral
   ([A292](../../../../bugs/fixed/A292-french-writes-de-before-a-bare-numeral-in-a-complement.md):
   "dans d'environ cinq maisons"). Not pinned; they close with those bugs. *almost* inside a
   complement renders correctly (row above).
6. The tests are all in `approximators.test.ts` (twelve cases) rather than split with
   `numerals.test.ts`.

## Why

Approximate numbers are ordinary, and *almost* is as often on a quantity as on a verb. Both words fail
as verb adverbs. The probe of ALMOST as a frequency adverb (B-ticket candidate, dropped) rendered
*猫はほとんど走ります*, which is "the cat mostly runs", and "did not almost eat", which negates the wrong
thing.

## Today

Verified at 1229928, 2026-09-24.

- C31's `NounPhrase.numeral` renders the third column (with the Japanese counter 匹).
- The quantity determiners (`all`, `many`, …) render (*tutti i gatti*, すべての猫). Nothing modifies
  either.

## Design

### D1. One field, two values

**Recommendation: `approximator?: 'about' | 'almost'`**, valid with a numeral or with `all`, `no`
and `many`, and ignored elsewhere. *About* on a numeral is *circa, environ, etwa, unos, cerca de*,
約; *almost* is *quasi, presque, fast, casi, quase*, ほとんど.

### D2. Spanish *unos*

*Unos cinco* is the article, not an adverb, and it agrees (*unas cinco casas*). **Recommendation: the
Spanish engine agrees it.** *Aproximadamente* is the invariable alternative.

### D3. *Almost* on a verb

"The cat almost fell" (*per poco non cadde, a failli tomber, wäre fast gefallen*, もう少しで倒れるところだった)
is a different construct in four languages. **Recommendation: out of scope**, so ALMOST gets no verb
adverb concept until it is designed.

## Engine

- `shared`: the field. Each engine's numeral and determiner paths.

## Tests

`numerals.test.ts`: *about* on 5 and 12; `quantity` rows: *almost all*, *almost no*.

## Verification

Engine suite green.

## Out of scope (follow-ups)

- ***Almost* on a verb** (D3).
- ***Enough* after an adjective** ("big enough") — a postposed degree word; noted in
  [P09-E25](P09-E25-quantity-determiners.md).
