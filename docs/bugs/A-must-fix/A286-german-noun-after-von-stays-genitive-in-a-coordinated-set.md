# A286. German leaves a noun genitive after *von* in a coordinated superlative set

**Languages:** German

German's superlative set ([P09-E19](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E19-superlative-partitive.md))
is a bare genitive after a noun ("das größte **der Tiere**") and *von* + the dative after a pronoun
("der größte **von uns**"), chosen per conjunct. In a coordinated set that starts with a pronoun,
*von* stands before the whole group, so the noun after *und* is under *von* too. It still takes the
genitive, which *von* never governs.

| Case | Now | Want |
|---|---|---|
| the CAT BE BIG (`most`, set we and the DOGs) | `der Kater ist der größte von uns und der Hunde.` | `der Kater ist der größte von uns und den Hunden.` |

**Why this target.** *Von* governs the dative, and a coordination under one preposition shares its
case: "von uns und den Hunden", as the passive agent already says "von der Katze und dem Hund". The
masculine *der größte* (the subject's gender, since the coordination names no one understood noun)
is right and stays. The Want string was rendered by applying the fix below to a throwaway copy of the
tree.

**Already right.** A set of nouns alone keeps its genitives (`der Kater ist der größte der Tiere und
der Männer.`), and a pronoun alone its *von* (`der größte von uns`). The other languages: `the cat is
the biggest of us and the dogs.`, `il gatto è il più grande di noi e dei cani.`, `el gato es el más
grande de nosotros y de los perros.`, `o gato é o maior de nós e dos cães.`,
`猫は私たちと犬の中で最も大きいです。`.

**Shape of the fix.** [`deStandard.ts`](../../../packages/engine/src/languages/de/deStandard.ts), the
`forms['domain']` branch: when any conjunct of a coordinated set is a pronoun, write *von* once before
the group and put every conjunct in the dative (`nounPhrase(s, 'dat')`, `tonicPronounDe(…, 'dat')`).
That gives the Want string and breaks no test. The same change turns the reverse order, now `der
Kater ist der größte der Hunde und von uns.`, into `der Kater ist der größte von den Hunden und uns.`

**Not settled here:**
- The reverse order (noun first). *der Hunde und von uns* mixes two constructions but is grammatical;
  *von den Hunden und uns* is smoother. It is not pinned, and the fixer should pick one.
- French `le chat est le plus grand d'entre nous et des chiens.` (and, reversed, `des chiens et
  d'entre nous`) is marginal. *d'entre* is for pronouns, but a mixed set would more naturally be
  *d'entre nous et les chiens* or be recast. Not filed; worth a ruling.

Pinned by `known bugs: German leaves a noun genitive after "von" in a coordinated set (A286)` in
[comparison.test.ts](../../../packages/engine/test/comparison.test.ts).

Found on 2026-09-24 while auditing P09-E19's test coverage.
