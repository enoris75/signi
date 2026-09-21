# A169. An adjective on a bare-name place leaves out the article it brings back

**Language:** German, Italian, French

A place name that takes no article on its own (German `Asien`, `Europa`) takes one once an attributive
adjective modifies it: `das große Asien`, `im fernen Asien`. The bare continent prepositions of Italian
and French (`in Asia`, `en Asie`) likewise fit only the bare name. A prenominal adjective in front
needs the article-bearing preposition (`nella grande Asia`, `dans la grande Asie`).

- **German** `determiner` returns nothing for a bare-name `proper` noun, whatever else the phrase
  holds. Meanwhile `adjPhrase` declines the adjective weak, as if an article were there. So the
  phrase is missing its article and has the wrong ending: `große Asien` is neither `das große Asien`
  nor the strong `großes Asien`.
- **Italian and French** `complementsPhrase` choose the bare `in` / `en` (and French's bare source
  `de`) for any `proper` / continent head, without looking for an adjective before the noun.

| Case | Language | Now | Want |
|---|---|---|---|
| subject | German | `große Asien brennt.` | `das große Asien brennt.` |
| object | German | `der Kater sieht große Asien.` | `der Kater sieht das große Asien.` |
| object, `far` | German | `der Kater sieht ferne Asien.` | `der Kater sieht das ferne Asien.` |
| locative | German | `der Kater läuft in großen Asien.` | `der Kater läuft im großen Asien.` |
| direction | German | `der Kater geht zu großen Asien.` | `der Kater geht zum großen Asien.` |
| source | German | `der Kater kommt aus großen Asien.` | `der Kater kommt aus dem großen Asien.` |
| possessor | German | `das Buch von großen Asien brennt.` | `das Buch vom großen Asien brennt.` |
| locative | Italian | `il gatto corre in grande Asia.` | `il gatto corre nella grande Asia.` |
| direction | Italian | `il gatto va in grande Asia.` | `il gatto va nella grande Asia.` |
| locative | French | `le chat court en grande Asie.` | `le chat court dans la grande Asie.` |
| direction | French | `le chat va en grande Asie.` | `le chat va dans la grande Asie.` |
| source | French | `le chat vient de grande Asie.` | `le chat vient de la grande Asie.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** English (`big Asia`, `in big Asia`) and Portuguese, which always articles the
name (`na Ásia grande`). Italian and French outside the bare prepositions (`la grande Asia`, `dalla
grande Asia`, `le livre de la grande Asie`). A name that is articled anyway (`die große Antarktis`).
The bare name with no adjective in every language (`in Asien`, `in Asia`, `en Asie`).

Found while probing the neighbours of the random phrase "the low brown boy burns your Asia down, …"
(seed 341682, see [A165](A165-possessive-on-a-place-name.md)).

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine suite green.

- **German.** Treat a bare-name `proper` head that has adjectives, and no pronominal possessor, as
  articled (`takes_article: '1'`) on the forms the determiner reads. That covers
  [`nounPhrase.ts`](../../../packages/engine/src/languages/de/nounPhrase.ts) (subject and object),
  [`possessorText.ts`](../../../packages/engine/src/languages/de/possessorText.ts) (the `vom`) and
  [`complementsPhrase.ts`](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts)
  (after `possessedHeadForms`). `prepDet` then fuses as for `die Antarktis` (`im`, `zum`, `vom`), and
  the weak ending the adjective already takes becomes right.
- **Italian and French.** In [`it/complementsPhrase.ts`](../../../packages/engine/src/languages/it/complementsPhrase.ts)
  and [`fr/complementsPhrase.ts`](../../../packages/engine/src/languages/fr/complementsPhrase.ts),
  the bare `in` / `en` (locative and direction) and French's bare continent `de` (source) fire only
  when nothing precedes the noun: the `lead` the head builder receives is the name itself. Otherwise
  the locative and direction go through `spatialHead('in', …)` (`nella`, `dans la`) and the source
  through `deDet` (`de la`).

**Decisions for the fixer:**

- **A postnominal adjective.** The trial leaves `in Asia lontana` / `en Asie lointaine` bare. That
  matches established region names (`en Asie centrale`, `in Africa settentrionale`), but a
  descriptive adjective often takes the article (`nell'Asia lontana`). Not pinned.
- **Spanish.** `Asia grande`, `en Asia grande` never gains an article. A modified place name usually
  takes one in Spanish (`la Europa medieval`), but before stressed *a* the choice between `el` and `la`
  (`el Asia` / `la Asia`) wants a ruling first. Not pinned.
- **The German goal.** `zum großen Asien` follows the pinned `zur Antarktis`, the goal the engine
  gives an articled name. If [A168](A168-german-continent-goal-nach.md)'s fixer moves articled
  regions to `in` + accusative, this becomes `ins große Asien`.

| | |
|---|---|
| **Test** | `adjectives.test.ts` → *known bugs: an adjective on a place name* (2 `test.fails`, plus a regression test for the positions and languages already right) |

## Resolved

Fixed on 2026-09-21.

- **German.** A new [`articledNameForms`](../../../packages/engine/src/languages/de/articledNameForms.ts)
  marks a bare-name `proper` head that carries an adjective, and no pronominal possessive, as
  inherently articled (`takes_article: '1'`). [`nounPhrase.ts`](../../../packages/engine/src/languages/de/nounPhrase.ts)
  (subject, object, the cause's noun phrase), [`possessorText.ts`](../../../packages/engine/src/languages/de/possessorText.ts),
  [`complementsPhrase.ts`](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts)
  (after `possessedHeadForms`) and the passive's [`agentPhrase.ts`](../../../packages/engine/src/languages/de/agentPhrase.ts)
  read their determiner off it, so `determiner` gives the article and `prepDet` fuses it as for `die
  Antarktis` (`im`, `zum`, `vom`, `ins`). The weak adjective ending was already right for it.
- **Italian and French.** In [`it/complementsPhrase.ts`](../../../packages/engine/src/languages/it/complementsPhrase.ts)
  and [`fr/complementsPhrase.ts`](../../../packages/engine/src/languages/fr/complementsPhrase.ts)
  a `bareName(nf, lead)` test gates the bare locative and goal `in` / `en` and French's bare
  continent source `de`: the name must still be `proper` (A165) and must lead its phrase (`lead ===
  base`). Otherwise the locative and goal go through `spatialHead('in', …)` and the source through
  `deDet`.

**Decisions.** The postnominal adjective (`in Asia lontana`, `en Asie lointaine`) and Spanish (`en Asia
grande`) are left as they are and unpinned, as the file proposed. The German goal keeps `zum großen
Asien`: [A168](A168-german-continent-goal-nach.md) gives `nach` only to a bare name, and this one is
articled.

Guarded by `adjectives.test.ts` → *known bugs: an adjective on a place name*: both former
`test.fails` now pass, plus two new tests. One covers the German comitative, terminus (`ins große
Asien`) and passive agent (`vom großen Asien gesehen`), two adjectives (`das große ferne Europa`,
`im großen fernen Europa`, `nella grande Europa lontana`, `dans la grande Europe lointaine`) and the
source in three languages. The other covers a possessive with an adjective (`in deinem großen Asien`,
`nella tua grande Asia`, `dans ta grande Asie`). The existing regression test is kept. Colocated
cases: the new `articledNameForms.test.ts`, `de/nounPhrase.test.ts`, `de/possessorText.test.ts`,
`de/complementsPhrase.test.ts`, and the French and Italian `complementsPhrase.test.ts`.

No passing test changed its expectation.

**Later the same day,** [B09](B09-german-genitive-vs-colloquial-dative.md) made the German possessor a
genitive. The possessor pin in `adjectives.test.ts` changed from `das Buch vom großen Asien brennt.`
to `das Buch des großen Asiens brennt.`, and the colocated `possessorText.test.ts` case from ` vom
großen Europa` to ` des großen Europas`. The passive agent keeps `vom großen Asien`.
