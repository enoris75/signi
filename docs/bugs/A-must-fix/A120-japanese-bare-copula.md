# A120. Japanese BE with no complement renders です whatever the tense, polarity or clause

**Language:** Japanese

A plan may give BE no complement at all ("the cat is", "Antarctica will not be"). `predicateSegs`
(`languages/ja/predicateSegs.ts`) has two copular paths:

- the です frame, which needs a predicative;
- A109's existential `いる` / `ある`, which needs a locative (line 41:
  `copula === '1' && !predicative && !!locative`).

A bare BE matches neither, so it runs down the ordinary verb path on BE's ja lexeme. That lexeme's
only forms are `base: 'です'` and `masu_present: 'です'`. It has no ます-stem, so `verbSeg` returns
`です` unchanged: the tense and polarity are lost, and the modal, aspect, command, relative and たら
constructions are glued straight onto it.

| Plan | Now | Want |
|---|---|---|
| cat BE | `猫はです。` | `猫はいます。` |
| book BE | `本はです。` | `本はあります。` |
| cat BE, negative | `猫はです。` | `猫はいません。` |
| cat BE, past | `猫はです。` | `猫はいました。` |
| cat BE, past negative | `猫はです。` | `猫はいませんでした。` |
| Antarctica BE, future negative | `南極大陸はです。` | `南極大陸はありません。` |
| cat CAN BE | `猫はですことができます。` | `猫はいることができます。` |
| cat BE, progressive | `猫はですいます。` | `猫はいます。` |
| command: be | `ですください。` | `いてください。` |
| the dog that is runs | `です犬は走ります。` | `いる犬は走ります。` |
| if the cat were | `もし猫がですたら、犬は走ります。` | `もし猫がいたら、犬は走ります。` |

With no complement, the other six languages read BE as existence (`the cat is.`, `il gatto è.`,
`l'Antartide non sarà.`), so the existential is the matching Japanese. The future renders as the
present (C04).

Found from "Africa is a continent in Asia, but Antarctica will not be", whose Japanese ends
`しかし南極大陸はです。`. In that sentence the second clause is not existential: it elides the first
clause's predicate, and that is A121. Its want is `南極大陸はそうではありません`, not `ありません`.

Passing tests pin the wrong output: `packages/engine/test/__snapshots__/verb.conjugation.test.ts.snap`
records the bare-BE matrix for all six persons, 72 `ja` cells (`私たちはです。`, `私たちはですいます。`,
`私たちはですところです。`, …). The fix changes them, so update the snapshot deliberately.

The same fallback shows up in every clause a period link joins:

| Plan | Now | Want |
|---|---|---|
| if the cat were not, the dog would run | `もし猫がですたら、犬は走ります。` | `もし猫がいなかったら、犬は走ります。` |
| if the cat ate, the dog would be | `もし猫が食べたら、犬はです。` | `もし猫が食べたら、犬はいます。` |
| if the cat were not, the dog would be a legend | `もし猫がですたら、犬は伝説です。` | `もし猫がいなかったら、犬は伝説です。` |
| the dog that was runs | `です犬は走ります。` | `いた犬は走ります。` |
| the cat that is runs, but the dog jumps | `です猫は走ります、…` | `いる猫は走ります…` |
| the cat runs, but the dog that is jumps | `…、しかしです犬は跳びます。` | `…いる犬は跳びます。` |
| the cat is, but the dog is not | `猫はです、しかし犬はです。` | `猫はいます…犬はいません。` |
| if the man were, the cat would run, and the dog is not | `もし男がですたら、猫は走ります、そして犬はです。` | `もし男がいたら、猫は走ります…犬はいません。` |

The coordinated rows give only the clauses; their join is A122. A negated relative (`いない犬`) is left
out: the plain negative in a relative is B13.

## Shape of the fix

Drop the locative from the existential gate: BE with no predicative is existential, with or without a
place. The prototype `copula === '1' && !predicative` produces every Want row above, and leaves
`猫は伝説です。` and `猫は家にいます。` unchanged. Two cases must reach their own branch before this gate:

- A121's elliptical clause, or it will render `ありません` where `そうではありません` is wanted;
- A123's relative whose head fills the subject complement: it has no predicative of its own, and the
  prototype renders `犬がいません伝説` for "a legend that the dog is not".

| | |
|---|---|
| **Test** | `clause.test.ts` → *known bugs: Japanese BE with no complement* (1 `test.fails`) |
| | `copulaWithoutComplement.test.ts` → *known bugs: Japanese BE with no complement, in linked clauses* (1 `test.fails`) |
