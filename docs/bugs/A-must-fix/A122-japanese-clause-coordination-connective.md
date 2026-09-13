# A122. Japanese joins coordinated clauses with 、 before the connective

**Language:** Japanese

`buildSegments` (`languages/ja/buildSegments.ts`) joins a coordinated clause as
`<first clause>、<COORD_WORDS> <second clause>`: `猫は走ります、しかし犬は跳びます。`

The six words in `COORD_WORDS` (`そして`, `または`, `しかし`, `つまり`, `だから`, `それから`) are
connectives (接続詞), not conjunctive particles. After a finite polite predicate (`ます`, `です`,
`ください`) the first clause is a complete sentence. The connective then opens the next sentence and
takes its own comma: `猫は走ります。しかし、犬は跳びます。` A polite predicate followed by `、` and a
connective is not standard written Japanese.

| Plan | Now | Want |
|---|---|---|
| CAT RUN, but DOG JUMP | `猫は走ります、しかし犬は跳びます。` | `猫は走ります。しかし、犬は跳びます。` |
| …, and … | `猫は走ります、そして犬は跳びます。` | `猫は走ります。そして、犬は跳びます。` |
| …, or … | `猫は走ります、または犬は跳びます。` | `猫は走ります。または、犬は跳びます。` |
| …, that is … | `猫は走ります、つまり犬は跳びます。` | `猫は走ります。つまり、犬は跳びます。` |
| …, therefore … | `猫は走ります、だから犬は跳びます。` | `猫は走ります。だから、犬は跳びます。` |
| …, then … | `猫は走ります、それから犬は跳びます。` | `猫は走ります。それから、犬は跳びます。` |
| past | `猫は走りました、しかし犬は跳びました。` | `猫は走りました。しかし、犬は跳びました。` |
| negative first clause | `猫は走りません、しかし犬は跳びます。` | `猫は走りません。しかし、犬は跳びます。` |
| predicate noun first clause | `猫は伝説です、しかし犬は跳びます。` | `猫は伝説です。しかし、犬は跳びます。` |
| after a condition | `もし猫が食べたら、犬は走ります、そして猫は食べます。` | `もし猫が食べたら、犬は走ります。そして、猫は食べます。` |
| two commands | `食べ物を食べてください、そして走ってください。` | `食べ物を食べてください。そして、走ってください。` |

Found from "Africa is a continent in Asia, but Antarctica will not be":
`アフリカはアジアで大陸です、しかし南極大陸は…`.

Already right: the condition's own `たら、`. The instruction register joins non-finite 連用形 clauses
inside one sentence (`食べ物を食べ、それから走り。`), where `、` before the connective is standard, so
it keeps its join.

Passing tests pin the current output and change with the fix:

- `packages/engine/test/coordination.test.ts`: lines 134, 147 and 162 (`join('or' | 'that_is' |
  'then')`), and 200, 211, 278 and 321 (commands, and the coerced indicative);
- `packages/engine/test/relativeCoordinationImperative.test.ts`: lines 30 and 45;
- `packages/engine/src/languages/ja/buildSegments.test.ts`: lines 30–35, 41 and 49;
- `packages/engine/src/languages/ja/japaneseEngine.test.ts`: line 30;
- `e2e/period-links.spec.ts`: line 43 (`犬は走ります、しかし猫は食べます。`).

## Shape of the fix

For a finite first clause, emit `。`, the connective, then `、`, in place of `、` and the connective.
Keep the current join for the instruction register. The engine's `terminator` already closes the second
sentence. For `but`, the conjunctive particle `〜が、` (`猫は走りますが、犬は跳びます。`) is an equally
standard one-sentence alternative, if keeping one sentence matters. `だから` after polite predicates is
slightly informal (`ですから` / `そのため`); that word choice is out of scope here.

| | |
|---|---|
| **Test** | `coordination.test.ts` → *known bugs: Japanese clause coordination* (1 `test.fails`) |
