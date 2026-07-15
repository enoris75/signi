# A10. Attributive/predicative degree: `least` renders as `最も` (= *most*), `less` misuses `あまり`

**Language:** Japanese

`least` comes out as `最も` — which is **most** — so "the least big cat" and "the most big cat" are
byte-identical, inverting the meaning. `less` reuses `あまり`, a **negative-polarity** adverb that
is ungrammatical without a negated predicate (`あまり大きい` ✗; `あまり大きくない` ✓).

| | |
|---|---|
| **Want** | `least` ≠ `most`; a lowered superlative wants `最も〜ない` / `一番〜ない`. `less` must not emit `あまり` with an affirmative adjective. |
| **Test** | `adjectives.test.ts` → *known bugs: degree (extended)* (2); `complements/predicative.test.ts` → *known bugs: predicative degree* (2) |

## Resolved

Fixed 2026-07-15.

- **Engine:** [`packages/engine/src/languages/ja.ts`](../../../packages/engine/src/languages/ja.ts).
  A lowered degree is negative-polarity in Japanese, so it is realised by **negating the
  adjective**, not by a positive-polarity adverb. New `jaComparisonAdj(concept)` puts a `less`/
  `least` adjective into its plain negative — i-adjective `大きい → 大きくない`, na-adjective `幸せな →
  幸せではない`. The result itself ends in …ない (an い-adjective), so the existing い-adjective
  machinery renders it in every position: attributive `大きくない`, adverbial (見える/思える) `大きくなく`,
  copula `大きくないです`. `JA_DEGREE` now pairs `least` with `最も` (最も大きくない "least big",
  distinct from `most`'s 最も大きい) and `less` with `それほど` (それほど大きくない "not so big"),
  replacing the old `least: 最も` (identical to *most*) and `less: あまり` (a negative-polarity adverb
  emitted on an affirmative adjective). The helper is threaded into all three adjective render
  sites: the attributive noun phrase, the `見える/思える` predicative (`complementSegs`), and the
  copula `です` predicative (`copulaSegs`).
- **Tests:** the four pinning `test.fails` are now passing `test`s (2 in
  [`adjectives.test.ts`](../../../packages/engine/test/adjectives.test.ts) → *known bugs: degree
  (extended)*, 2 in
  [`complements/predicative.test.ts`](../../../packages/engine/test/complements/predicative.test.ts)
  → *known bugs: predicative degree*). Each block gained a case asserting the concrete rendered
  strings — attributive `最も大きくない` / `それほど大きくない` and the na-adjective `最も幸せではない`;
  predicative `最も幸せではなく思えます` / `それほど幸せではなく思えます` and the copula `最も大きくないです` —
  plus a regression guard that the raised degrees (`最も大きい`, `もっと大きい`, `最も幸せに思えます`) are
  untouched.
- Japanese comparison remains a documented MVP approximation (context normally carries it, より
  marks the standard); this fix removes the two outright errors — the meaning-inverting `least = 最も`
  and the ungrammatical affirmative `あまり` — without claiming a full comparative grammar.
