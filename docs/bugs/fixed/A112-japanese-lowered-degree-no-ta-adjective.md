# A112. Japanese less/least keeps the の or た of the adjective it negates

**Language:** Japanese

`jaComparisonAdj` (`languages/ja/jaComparisonAdj.ts`) puts a `less`/`least` adjective into its
plain negative (fixed A10). It knows two classes: an i-adjective (`大きい` → `大きくない`) and a
na-adjective (`幸せな` → `幸せではない`). Anything else gets `ではない` glued onto the stored base.
The corpus stores every Japanese adjective in its attributive form, and 34 of the 58 end in neither
い nor な:

- 30 **の-adjectives**, nouns linked by の (BROWN `茶色の`, ADULT `大人の`, MALE `男性の`, WILD `野生の`, …).
  The の has to go before `ではない`.
- 4 **た-adjectives**, a verb's plain past used attributively (TIRED `疲れた`, UNCONNECTED `孤立した`,
  CASTRATED `去勢された`, WRITTEN `書かれた`). Their negative state is `〜ていない`.

The result feeds every adjective position (attributive, `copulaSegs`, the `思える`/`なる`
predicative), so the error shows up in all of them.

| Plan | Now | Want |
|---|---|---|
| less BROWN cat | `それほど茶色のではない猫は食べます。` | `それほど茶色ではない猫は食べます。` |
| least ADULT cat | `最も大人のではない猫は食べます。` | `最も大人ではない猫は食べます。` |
| less TIRED cat | `それほど疲れたではない猫は食べます。` | `それほど疲れていない猫は食べます。` |
| cat BE less BROWN | `猫はそれほど茶色のではないです。` | `猫はそれほど茶色ではないです。` |
| cat SEEM less BROWN | `猫はそれほど茶色のではなく思えます。` | `猫はそれほど茶色ではなく思えます。` |

Already right: `それほど大きくない猫`, `最も幸せではない猫`.

The positive-degree predicate has the same blind spot in a different function (`茶色のです`). That is
filed separately (the の/た adjective as a predicate).

## Shape of the fix

Classify the stored base before negating it:

- `…の` → strip の, add `ではない`;
- `…た` → replace た with `ていない` (`疲れた` → `疲れていない`, `孤立した` → `孤立していない`); a
  `…だ` base would take `でいない`;
- keep the existing い / な / bare-stem branches.

The reading follows the same substitution. `jaComparisonAdj.test.ts` has no の/た case yet; add one.
The same class helper can serve the predicate fix.

| | |
|---|---|
| **Test** | `adjectives.test.ts` → *known bugs: Japanese lowered degree on a の/た adjective* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed. The new
[`jaAdjClass.ts`](../../../packages/engine/src/languages/ja/jaAdjClass.ts) classifies the stored
attributive base and returns the stem each class builds on, with its reading cut the same way:

- `…い` → i-adjective;
- `…な` / `…の` → na-adjective (the particle dropped);
- `…た` / `…だ` → the te-form (`疲れて`);
- anything else → a bare na stem.

[`jaComparisonAdj.ts`](../../../packages/engine/src/languages/ja/jaComparisonAdj.ts) builds the
lowered degree on it: `くない`, `ではない`, or the negative state `いない` on the te-form. The same helper
serves A115's predicate fix.

Every row now renders as wanted: `それほど茶色ではない猫`, `最も大人ではない猫`, `それほど疲れていない猫`,
`猫はそれほど茶色ではないです`, `猫はそれほど茶色ではなく思えます`. Also covered: `最も孤立していない猫` and
`猫はそれほど疲れていないです`.

Unchanged:
- the i- and na-adjectives (`それほど大きくない`, `最も幸せではない`);
- the bare stem (`静かではない`);
- the positive `茶色の猫`.

- **Tests:** [`packages/engine/test/adjectives.test.ts`](../../../packages/engine/test/adjectives.test.ts)
  → *known bugs: Japanese lowered degree on a の/た adjective*. The pinning `test.fails` is now a
  passing `test`. New cases cover `孤立した` and the SEEM and BE positions, with a guard for the other
  classes.
- Unit tests: the new `jaAdjClass.test.ts`, and `jaComparisonAdj.test.ts`, with the の/た cases it lacked.
