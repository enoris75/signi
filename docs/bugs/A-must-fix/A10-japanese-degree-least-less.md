# A10. Attributive/predicative degree: `least` renders as `最も` (= *most*), `less` misuses `あまり`

**Language:** Japanese

`least` comes out as `最も` — which is **most** — so "the least big cat" and "the most big cat" are
byte-identical, inverting the meaning. `less` reuses `あまり`, a **negative-polarity** adverb that
is ungrammatical without a negated predicate (`あまり大きい` ✗; `あまり大きくない` ✓).

| | |
|---|---|
| **Want** | `least` ≠ `most`; a lowered superlative wants `最も〜ない` / `一番〜ない`. `less` must not emit `あまり` with an affirmative adjective. |
| **Test** | `adjectives.test.ts` → *known bugs: degree (extended)* (2); `complements/predicative.test.ts` → *known bugs: predicative degree* (2) |
