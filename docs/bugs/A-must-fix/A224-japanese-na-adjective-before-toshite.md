# A224. A Japanese na-adjective keeps its な before として

**Language:** Japanese

The essive object complement ("takes the object *as* X", C12) is として in Japanese, attached to the
word as it stands: 家を刑務所として使います. An adjective head is rendered as it stands too, and a
na-adjective's stored form is its attributive one, 有効な: so ACCEPT's candidate gloss "to acquire
objects as valid" comes out 物体を有効なとして取得する. The な links an adjective to a noun after it
(有効な物体), and として is no noun: the stem takes it, 有効として. The same holds of a noun-adjective
linked by の (茶色の → 茶色として).

[`complementSegs`](../../../packages/engine/src/languages/ja/complementSegs.ts) already cuts the stem
for the factitive, by [`jaAdjClass`](../../../packages/engine/src/languages/ja/jaAdjClass.ts)
(幸せにする); the essive "falls through to the particle path below", which renders the head with
`elSegs`.

| Case | Now | Want |
|---|---|---|
| to acquire objects as VALID (ACCEPT's C28 candidate) | `物体を有効なとして取得する。` | `物体を有効として取得する。` |
| … an object | `物体を有効なとして取得する。` | `物体を有効として取得する。` |
| the CAT SEEs the HOUSE as HAPPY | `猫は家を幸せなとして見ます。` | `猫は家を幸せとして見ます。` |
| … as VALID, past | `猫は家を有効なとして見ました。` | `猫は家を有効として見ました。` |
| … as BROWN (a の-adjective) | `猫は家を茶色のとして見ます。` | `猫は家を茶色として見ます。` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** A noun head (`猫は家を刑務所として使います。`) and the factitive, which cuts the stem
already (`猫は家を幸せに作ります。`). The other six languages have an essive word that takes the
adjective as it is (`to acquire objects as valid.`, `acquisire oggetti come validi.`, `acquérir des
objets comme valides.`, `Gegenstände als gültig erwerben.`, `adquirir objetos como válidos.`,
`adquirir objetos como válidos.`).

**Nothing shipped shows it.** C28 left ACCEPT on its literal for it.

Found authoring C28 (ACCEPT).

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine and backend suites green, and no passing test moves.

On the particle path of `complementSegs`, an essive object complement whose one conjunct is an
adjective of `jaAdjClass` kind `na` pushes its stem (`wordSeg(stem, reading)`) in place of
`elSegs(c.phrase)`; everything else keeps `elSegs`. として then follows as it does now.

**Decisions for the fixer:**

- **A coordination.** The trial handles a lone adjective, so `幸せなか茶色のとして` keeps both links;
  per conjunct it would be `幸せか茶色として`. Not pinned.
- **An i- or た-adjective.** `大きいとして`, `疲れたとして` read as "assuming it is big / tired". The
  essive reading wants a noun to hang on (大きいものとして) or another frame (大きいと見る). Not pinned.

| | |
|---|---|
| **Test** | `complements/objectPredicative.test.ts` → *known bugs: a Japanese na-adjective keeps its な before として (A224)* (1 `test.fails`, plus a regression test for a noun, the factitive and the other six) |
