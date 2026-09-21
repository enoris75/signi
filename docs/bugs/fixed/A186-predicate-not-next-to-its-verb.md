# A186. German and Japanese put the predicate first, away from its verb

**Languages:** German, Japanese

A predicate complement belongs next to its verb in both languages.

- **German** closes the Mittelfeld with the predicate noun or adjective, against the verb cluster:
  `der Kater ist wegen des Hundes eine Legende geworden`, `der Hund, der wegen der Maus müde wird`.
  TRANSFORM's resultative `in ein Gefängnis` takes the same last place.
- **Japanese** puts the に / ように phrase straight before なる or 思える: `猫は犬のために伝説になります`.
  Anything placed between them attaches to the verb instead. `伝説に犬のためになります` also reads
  "became beneficial to the dog" (`犬のためになる`), and `伝説に犬となりました` reads "became a dog"
  (`犬となる`).

Both engines render the complements in the shared `COMPLEMENT_RENDER_ORDER`
([`packages/shared/src/index.ts`](../../../packages/shared/src/index.ts)), which puts
`objectPredicative` and `predicative` first. That is the English and Romance order (`becomes a
legend because of the dog`), and German's
[`complementsPhrase`](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts)
and Japanese's [`complementSegs`](../../../packages/engine/src/languages/ja/complementSegs.ts)
inherit it.

| Clause | Language | Now | Want |
|---|---|---|---|
| BECOME a LEGEND, cause DOG | German | `der Kater wird eine Legende wegen des Hundes.` | `der Kater wird wegen des Hundes eine Legende.` |
| … resultative | German | `der Kater ist eine Legende wegen des Hundes geworden.` | `der Kater ist wegen des Hundes eine Legende geworden.` |
| … MUST | German | `der Kater muss eine Legende wegen des Hundes werden.` | `der Kater muss wegen des Hundes eine Legende werden.` |
| BECOME a LEGEND, locative HOUSE, past | German | `der Kater wurde eine Legende im Haus.` | `der Kater wurde im Haus eine Legende.` |
| BECOME TIRED, cause DOG | German | `der Kater wird müde wegen des Hundes.` | `der Kater wird wegen des Hundes müde.` |
| relative clause | German | `der Hund, der müde wegen der Maus wird, läuft.` | `der Hund, der wegen der Maus müde wird, läuft.` |
| SEEM TIRED, cause DOG | German | `der Kater scheint müde wegen des Hundes.` | `der Kater scheint wegen des Hundes müde.` |
| SEEM a LEGEND, locative MARKET | German | `der Kater scheint eine Legende im Markt zu sein.` | `der Kater scheint im Markt eine Legende zu sein.` |
| BE TIRED, cause DOG, resultative | German | `der Kater ist müde wegen des Hundes gewesen.` | `der Kater ist wegen des Hundes müde gewesen.` |
| BE a LEGEND, locative HOUSE, cause DOG | German | `der Kater ist eine Legende im Haus wegen des Hundes.` | `der Kater ist im Haus wegen des Hundes eine Legende.` |
| TRANSFORM the HOUSE into a PRISON, cause DOG, resultative | German | `der Kater hat das Haus in ein Gefängnis wegen des Hundes verwandelt.` | `der Kater hat das Haus wegen des Hundes in ein Gefängnis verwandelt.` |
| the random phrase | German | `sind diese Stöcke keine Person wegen der fehlenden Kuh geworden?` | `sind diese Stöcke wegen der fehlenden Kuh keine Person geworden?` |
| BECOME a LEGEND, cause DOG | Japanese | `猫は伝説に犬のためになります。` | `猫は犬のために伝説になります。` |
| … MUST | Japanese | `猫は伝説に犬のためになる必要があります。` | `猫は犬のために伝説になる必要があります。` |
| … locative HOUSE, past | Japanese | `猫は伝説に家でなりました。` | `猫は家で伝説になりました。` |
| … comitative DOG, past | Japanese | `猫は伝説に犬となりました。` | `猫は犬と伝説になりました。` |
| BECOME TIRED, cause DOG | Japanese | `猫は疲れているように犬のためになります。` | `猫は犬のために疲れているようになります。` |
| not BECOME a LEGEND, cause DOG, resultative | Japanese | `猫は伝説に犬のためになっていません。` | `猫は犬のために伝説になっていません。` |
| SEEM TIRED, cause DOG | Japanese | `猫は疲れているように犬のために思えます。` | `猫は犬のために疲れているように思えます。` |
| SEEM a LEGEND, locative MARKET | Japanese | `猫は伝説に市場で思えます。` | `猫は市場で伝説に思えます。` |
| the random phrase | Japanese | `この棒はどの人にも見つからない牛のためになっていませんか？` | `この棒は見つからない牛のためにどの人にもなっていませんか？` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** A predicate on its own (`der Kater wird eine Legende.`, `猫は伝説になります。`). The
Japanese copula, whose locative A42 already puts ahead of the predicate noun
(`猫は家で犬のために伝説です。`). TRANSFORM's Japanese object predicate, which follows its object
(`猫は犬のために家を刑務所に変えます。`). English and the Romance languages, whose predicate leads
the complements (`the cat has become a legend because of the dog.`, `il gatto è diventato una
leggenda a causa del cane.`).

Found by the random phrase "have these sticks not become any person because of the missing cow?"
(seed 530539). **This overrules passing tests.** The order was pinned as right, raised with the user
as a question, and ruled a defect on 2026-09-21.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
rest of the engine suite green.

- **German.** In [`complementsPhrase`](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts),
  walk the complements in `COMPLEMENT_RENDER_ORDER` with `objectPredicative` and `predicative`
  moved to the end. SEEM's `zu sein` is appended after the complements, so it still closes them
  (`scheint im Markt eine Legende zu sein`).
- **Japanese.** In [`complementSegs`](../../../packages/engine/src/languages/ja/complementSegs.ts),
  the same with `predicative` alone moved to the end. The object predicate is already placed with
  its object.

**It changes eleven passing assertions,** all of which pinned the current order. Update them with the
fix:

| Test | Now asserted | Becomes |
|---|---|---|
| `complements/combined.test.ts` → *predicative + cause* | de `der Kater wird eine Legende wegen des Hundes.`, ja `猫は伝説に犬のためになります。` | `der Kater wird wegen des Hundes eine Legende.`, `猫は犬のために伝説になります。` |
| `complements/combined.test.ts` → *predicative + locative* | de `der Kater ist eine Legende im Haus.` | `der Kater ist im Haus eine Legende.` |
| `complements/combined.test.ts` → *predicative + terminus* | ja `猫は幸せに犬に思えます。` | `猫は犬に幸せに思えます。` |
| `complements/combined.test.ts` → *Japanese keeps a cause under a predicate nominal* | de `der Kater ist eine Legende wegen des Hundes.` | `der Kater ist wegen des Hundes eine Legende.` |
| `complements/combined.test.ts` → *a bare predicate nominal and a verb-like copular are unchanged* | ja `猫は幸せに家で思えます。` | `猫は家で幸せに思えます。` |
| `complements/combined-triples.test.ts` → *predicative · terminus · cause (SEEM)* | de `der Kater scheint dem Hund glücklich wegen der Maus.`, ja `猫は幸せに犬にネズミのために思えます。` | `der Kater scheint dem Hund wegen der Maus glücklich.`, `猫は犬にネズミのために幸せに思えます。` |
| `complements/combined-triples.test.ts` → *predicative · terminus · locative (SEEM)* | de `der Kater scheint dem Hund glücklich im Haus.`, ja `猫は幸せに犬に家で思えます。` | `der Kater scheint dem Hund im Haus glücklich.`, `猫は犬に家で幸せに思えます。` |
| `complements/combined-triples.test.ts` → *predicative · locative · cause (BE)* | de `der Kater ist eine Legende im Haus wegen des Hundes.` | `der Kater ist im Haus wegen des Hundes eine Legende.` |
| `complements/predicative.test.ts` → *the infinitival copula with other complements and a relative clause* | de `der Kater scheint eine Legende im Markt zu sein.` | `der Kater scheint im Markt eine Legende zu sein.` |
| `coordination.test.ts` → *the elided predicate leaves its pro-form …* | de `Afrika ist ein Kontinent in Asien, aber die Antarktis wird es nicht sein.` | `Afrika ist in Asien ein Kontinent, aber die Antarktis wird es nicht sein.` |
| `de/complementsPhrase/complementsPhrase.test.ts` → *the infinitival copula closes the complements* | `eine Legende im Markt zu sein` | `im Markt eine Legende zu sein` |

Rewrite the comments that describe the old order with them, including the one above the `zu sein`
at the end of German `complementsPhrase` ("scheint eine Legende im Markt zu sein").

**Decisions for the fixer:**

- **German `nicht`.** A159's slot puts `nicht` ahead of the complements, so with the predicate last a
  negated clause reads `der Kater ist nicht wegen des Hundes eine Legende geworden.` That is "not
  because of the dog", a constituent negation. Sentence negation wants `nicht` right before the
  predicate (`ist wegen des Hundes nicht eine Legende geworden`), or `keine Legende` if
  [A182](A182-german-nicht-with-an-indefinite-object.md)'s predicate decision goes that way. Rule on
  it with the fix. Not pinned.
- **The shared order.** The trial reorders inside the two engines and leaves
  `COMPLEMENT_RENDER_ORDER` alone, since English and Romance want the predicate first. A per-language
  order in the shared constants is the alternative.

| | |
|---|---|
| **Test** | `complements/predicative.test.ts` → *known bugs: the predicate is not next to its verb* (2 `test.fails`, plus a regression test for a lone predicate, the Japanese copula and object predicate, and English and Italian) |

## Resolved

Fixed on 2026-09-21.

**German.** [`complementsPhrase`](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts)
now renders the adjuncts and the predicate apart, as `complementsParts`: `DE_ADJUNCT_ORDER` is the
shared `COMPLEMENT_RENDER_ORDER` without the two predicate slots, and `objectPredicative` +
`predicative` close the Mittelfeld against the verb cluster. `complementsPhrase` itself is the two
joined, so the callers that want the whole phrase (`dativeText`, a gapped relative) are unchanged.
SEEM's `zu sein` is appended to the predicate part, so it still closes the complements
(`scheint im Markt eine Legende zu sein`).

**The `nicht` decision, ruled by the user on 2026-09-21:** with the predicate last, A159's slot at the
head of the complements would read as a constituent negation of the adjunct — `ist nicht wegen des
Hundes müde` says the dog is not the reason. Sentence negation stands right before the predicate
instead. New
[`complementsWithNicht`](../../../packages/engine/src/languages/de/complementsWithNicht.ts) places it,
and the four Mittelfeld builders call it: the declarative (shared by the question and the `wenn`
protasis), the command/instruction and the infinitive in
[`renderClause`](../../../packages/engine/src/languages/de/renderClause.ts), and
[`subordinateClause`](../../../packages/engine/src/languages/de/subordinateClause.ts). With no
predicate to close on, `nicht` keeps A159's slot (`ist nicht im Haus`). A predicate *nominal* takes
`kein` and no `nicht` at all ([A182](A182-german-nicht-with-an-indefinite-object.md), fixed in the
same run): `wird wegen des Hundes keine Legende`.

The user also asked, in the same ruling, for the other half of that distinction — a negation that
belongs to the complement rather than to the verb, so that `nicht` can sit *before* the complement on
purpose (`der Kater ist nicht wegen des Hundes nicht müde`). The plan model had no such thing; it was
added afterwards as the cause complement's own negation.

**Japanese.** [`complementSegs`](../../../packages/engine/src/languages/ja/complementSegs.ts) walks
`JA_COMPLEMENT_ORDER`, the shared order with `predicative` alone moved to the end, straight before
なる / 思える. The object predicate keeps its place beside its own object (家を刑務所に変える).

**Tests.** `complements/predicative.test.ts` → *known bugs: the predicate is not next to its verb*
(both pins now passing, assertions unchanged), plus *"nicht" stands right before the predicate, not
before the adjuncts*, which pins the ruling across BE / BECOME / SEEM, the resultative, a modal, the
relative clause, the command, the infinitive, an object predicative, the `kein` nominal, the two
no-predicate cases that keep A159's slot, and the Japanese negation. The eleven passing assertions
this overruled were rewritten as the table above says, in `complements/combined.test.ts`,
`complements/combined-triples.test.ts`, `complements/predicative.test.ts`, `coordination.test.ts` and
`de/complementsPhrase/complementsPhrase.test.ts`.
