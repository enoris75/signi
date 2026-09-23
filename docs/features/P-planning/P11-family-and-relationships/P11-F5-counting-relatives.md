# P11-F5. Counting relatives — 三人兄弟

**Construct:** "we are three siblings" — a counted phrase where the numeral and its counter compound
straight onto the noun, with no の. From [P11](README.md)'s *Out of scope* follow-ups.
**Shape:** a third value of a flag that already has two, in a builder that already exists
([`jaCounted.ts`](../../../../packages/engine/src/languages/ja/jaCounted.ts)). The smallest task in
this folder, and Japanese-only.
**Scope:** Japanese. The other six count relatives with a plain cardinal and need nothing.
**Status:** planning, unscheduled. Split out of P11's follow-ups on 2026-09-23.

| lang | we are three siblings |
|---|---|
| en | we are three siblings. |
| it | siamo tre fratelli. |
| fr | nous sommes trois frères et sœurs. |
| de | wir sind drei Geschwister. |
| es | somos tres hermanos. |
| pt | somos três irmãos. |
| ja | 私たちは**三人兄弟**です。 |

**Proposed, not engine output.**

## Why

Japanese counts family members as a compound, not as a counted noun phrase. 三人兄弟 is how a
speaker says how many siblings there are, and C31's counted phrase writes 三人**の**兄弟 — which is
"three siblings" as a group of individuals, not the family-size idiom. Both are grammatical and they
do not mean quite the same thing, which is why the idiom is worth the flag.

It is the last of P11's follow-ups and the cheapest, and it is here so that it is not lost.

## Today

Verified in the working tree on 2026-09-23.

[`jaCounted`](../../../../packages/engine/src/languages/ja/jaCounted.ts) builds every counted phrase
and already has exactly two shapes, chosen by one lexeme flag:

```
segs: head ? [{ t: `${numeral}${counter}` }]                       // counter_is_head: 二十四時間
           : [{ t: `${numeral}${counter}` }, { t: 'の' }],         // the default:      二匹の猫
```

- `counter_is_head === '1'` — a time word **is** its own counter, so the noun is not said again:
  二十四時間, 七日, 十二か月.
- otherwise — numeral + counter + **の** + noun: 二匹の猫, 二人の人.

三人兄弟 is **neither**: the noun *is* said, and there is no の. So it is a third shape, and the
smallest possible change to a function that already branches.

The counter itself needs no work: 人 is what `jaCounted` picks for a `human` noun by default, and a
lexeme may name its own.

## Design

### D1. A third value, not a second flag

**Recommendation: replace `counter_is_head`'s boolean with a three-way lexeme value** — the counter
*is* the head (時間), the counter *links* with の (猫, the default), or the counter **compounds**
with the head (兄弟). One field, three values, and the existing two keep their meanings.

Naming it something like `counter_join` reads better than a second boolean beside the first, and
avoids the state where both are set.

### D2. It is a property of the noun, not of the sentence

三人兄弟 is what 兄弟 does with a counter, the same way 時間 is what a time word does. It is not a
choice the speaker makes per phrase, so it belongs on the lexeme — which is where both existing
shapes already live, and why this task has no plan field at all.

Which kin nouns take it: 兄弟 (siblings), 姉妹 (sisters), 親子 (parent and child), 家族 (family
members). P11 seeded the first three's concepts; check each against a dictionary rather than
assuming the pattern generalises to every relative — 三人いとこ is not Japanese.

### D3. Furigana stays off

`jaCounted` draws no furigana over the compound, because a numeral and its counter fuse irregularly
(一匹 *ippiki*, 三匹 *sanbiki*, 七日 *nanoka*). 三人 is *sannin* and follows the same rule.
**Recommendation: keep the existing behaviour** — the kanji are right, which is what is rendered, and
this task must not be the one that relaxes it.

## 1. Corpus

`counter_join` (D1) on the Japanese lexemes of the kin nouns in D2, and the flag documented in the
[seed skill](../../../../.claude/skills/seed/SKILL.md) beside `counter` and `counter_is_head`.

## 2. Engine

One branch in `jaCounted`, and the two existing shapes left exactly as they are.

## 3. Tests

- The ja row of the table above, as a predicate and as a subject.
- The two existing shapes unchanged: 二十四時間 (`counter_is_head`) and 二匹の猫 (the default) —
  this task edits the function that writes both, so C31's tests are the regression surface.
- No furigana over 三人 (D3).

## Verification

1. `npm run seed`, rebuild `@signi/shared` and `@signi/engine`.
2. Engine and backend suites green; typecheck clean.
3. In the browser (5173): SIBLING with a numeral of 3 → 三人兄弟, and CAT with 2 → 二匹の猫.

## Out of scope (follow-ups)

- **Other compound counters** outside kinship (五人家族 is in D2's list; 三日月 is not a count at all).
- **Ordinal kin** ("the second son", 次男), which is a different word rather than a counted phrase.
- **"How many siblings?"** — needs [P09-E6](../P09-core-vocabulary/P09-E6-questions-and-existentials.md).
