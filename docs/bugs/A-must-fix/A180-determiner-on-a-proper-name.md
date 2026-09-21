# A180. A determiner picked on a proper name still reaches the grammar around the name

**Languages:** German, Spanish, Japanese, Italian, French, Portuguese

A proper name takes the article its language fixes, and the determiner on the plan is ignored. The
lexicon marks the head `proper` ("the language fixes the article, not the user"), and
`nounPhrase.test.ts` pins the rule. The article builders follow it: German
[`determiner`](../../../packages/engine/src/languages/de/determiner.ts), Spanish
[`artFor`](../../../packages/engine/src/languages/es/artFor.ts) and the other languages' article
builders return the name's own article, whatever `definiteness` says. But `definiteness` stays on the
head's forms, and every other reader of it acts on a choice the name has already dropped:

- **German** declines the adjective after the plan's determiner
  ([`possessedDeclension`](../../../packages/engine/src/languages/de/possessedDeclension.ts), and the
  same `forms['definiteness']` in `possessorText`'s `vonDative`). `determiner` meanwhile gives the
  article. The result is an article with a strong or mixed ending: `das großes Europa`, `der großer
  Antarktis`, `im großem Asien`.
- **Spanish** fuses `a` / `de` with `el` only under `definite`
  ([`aDet`](../../../packages/engine/src/languages/es/aDet.ts),
  [`deDet`](../../../packages/engine/src/languages/es/deDet.ts)). An articled name under any other
  determiner falls through to `prepDet` and keeps the article unfused: `a el Asia grande`, `de el
  África grande`.
- **Japanese** never looks at `proper`, so [`npSegs`](../../../packages/engine/src/languages/ja/npSegs.ts)
  spells the quantifier out: `多くのヨーロッパ` ("many Europes"), `すべての`, `いくつかの`, `少しの`.
- **A `no`** still counts as a negative word of the clause. The subject, object and complement
  checks read `definiteness === 'no'` (`negationSources`, `hasNegativeComplement`). So the four
  Romance languages add their negator, and Japanese its どの…も and a negative verb, though no
  `nessun` / `aucun` / `ningún` / `nenhum` is rendered. The clause is negated in five languages and
  positive in English and German (`the cat sees Europe.`). French is left with a bare `ne` that
  nothing licenses: `l'Asie ne brûle.`

| Case | Language | Now | Want |
|---|---|---|---|
| subject, `many` + BIG | German | `das großes Asien brennt.` | `das große Asien brennt.` |
| object, `indefinite` + BIG | German | `der Kater sieht das großes Europa.` | `der Kater sieht das große Europa.` |
| object, `bare` + BIG | German | `der Kater sieht das großes Europa.` | `der Kater sieht das große Europa.` |
| possessor, `many` + BIG | German | `das Buch der großer Antarktis brennt.` | `das Buch der großen Antarktis brennt.` |
| terminus, `many` + BIG | German | `der Kater schickt das Buch ins großes Asien.` | `der Kater schickt das Buch ins große Asien.` |
| locative, `few` + BIG | German | `der Kater läuft im großem Asien.` | `der Kater läuft im großen Asien.` |
| source, `some` + BIG | German | `der Kater kommt aus dem großem Afrika.` | `der Kater kommt aus dem großen Afrika.` |
| relative clause, `many` + BEAUTIFUL `less` | German | `die Frau, die das weniger schönes Asien nicht lädt, läuft.` | `die Frau, die das weniger schöne Asien nicht lädt, läuft.` |
| terminus, `many` + BIG | Spanish | `el gato envía el libro a el Asia grande.` | `el gato envía el libro al Asia grande.` |
| direction, `indefinite` + BIG | Spanish | `el gato va a el Asia grande.` | `el gato va al Asia grande.` |
| source, `some` + BIG | Spanish | `el gato viene de el África grande.` | `el gato viene del África grande.` |
| object, `many` / `few` / `some` / `all` | Japanese | `猫は多くのヨーロッパを見ます。` (`少しの`, `いくつかの`, `すべての`) | `猫はヨーロッパを見ます。` |
| subject, `many` + BIG | Japanese | `多くの大きいアジアは燃えます。` | `大きいアジアは燃えます。` |
| source, `some` + BIG | Japanese | `猫はいくつかの大きいアフリカから来ます。` | `猫は大きいアフリカから来ます。` |
| object, `no` | Italian | `il gatto non vede l'Europa.` | `il gatto vede l'Europa.` |
| object, `no` | French | `le chat ne voit l'Europe.` | `le chat voit l'Europe.` |
| object, `no` | Spanish | `el gato no ve Europa.` | `el gato ve Europa.` |
| object, `no` | Portuguese | `o gato não vê a Europa.` | `o gato vê a Europa.` |
| object, `no` | Japanese | `猫はどのヨーロッパも見ません。` | `猫はヨーロッパを見ます。` |
| subject, `no` | French | `l'Asie ne brûle.` | `l'Asie brûle.` |
| subject, `no` | Japanese | `どのアジアも燃えません。` | `アジアは燃えます。` |
| locative, `no` | Italian | `il gatto non corre in Asia.` | `il gatto corre in Asia.` |
| locative, `no` | French | `le chat ne court en Asie.` | `le chat court en Asie.` |
| locative, `no` | Spanish | `el gato no corre en Asia.` | `el gato corre en Asia.` |
| locative, `no` | Portuguese | `o gato não corre na Ásia.` | `o gato corre na Ásia.` |
| locative, `no` | Japanese | `猫はどのアジアでも走りません。` | `猫はアジアで走ります。` |
| the random phrase | German | `wenn die junge Frau, die das weniger schönes Asien nicht lädt, …` | `wenn die junge Frau, die das weniger schöne Asien nicht lädt, …` |
| the random phrase | Japanese | `もし多くのそれほど美しくないアジアを読み込まない若い女が…` | `もしそれほど美しくないアジアを読み込まない若い女が…` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** The default determiner (`das große Europa`, `al Asia grande`, `del África grande`).
German `this` and `all`, whose weak endings happen to be the article's (`das große Europa`). A
pronominal possessive on the name (`dein großes Asien`, `tu Asia grande`). English and German under a
`no` (`the cat sees Europe.`, `der Kater sieht Europa.`). The Italian, French and Portuguese articles.
A common noun, which keeps its quantifier and its concord (`viele große Mäuse`, `多くの大きいネズミ`,
`il gatto non vede nessun topo`).

Found by the random phrase "if the young woman who does not load less beautiful Asia had the ice
cream because of a new equally sharp ox together, the blade would start the hungry file that has
replaced some people with no young women." (seed 857730), whose relative clause puts `many` on ASIA:
German `das weniger schönes Asien`, Japanese `多くのそれほど美しくないアジア`.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine suite green.

Resolve the determiner once, in the translator, the way [A175](../fixed/A175-superlative-under-an-indefinite-determiner.md)
resolves a superlative's. In
[`resolveNounPhrase`](../../../packages/engine/src/translator/functions/resolveNounPhrase.ts), a
`proper` head gets `definite` whatever the plan picked, before `definiteness` is written to its
forms:

```ts
const picked = head.forms['proper'] === '1'
  ? 'definite'
  : superlative && SUPERLATIVE_MAKES_DEFINITE.has(np.definiteness ?? 'definite') ? 'definite' : np.definiteness ?? 'definite';
```

The name then carries only what its article builders already assumed. German declines weak after
`das`, Spanish contracts, Japanese has nothing to spell, and no `no` reaches a concord check. No
engine file changes, and no passing test moves.

**Decisions for the fixer:**

- **A Japanese demonstrative.** The trial also drops `この` / `その` on a name (`猫はこの大きいヨーロッパを見ます。`
  → `猫は大きいヨーロッパを見ます。`), as the other six languages already drop `this` (`the cat sees big
  Europe.`). `このヨーロッパ` is a possible Japanese phrase, but keeping it means an exception to the
  translator rule. Not pinned.
- **The builder.** The frontend offers the determiner control on a name, because `/api/concepts`
  does not carry `proper`. Hiding it is a separate UI question. The engine must still ignore a
  determiner that arrives, which is what this fix does.

| | |
|---|---|
| **Test** | `nounPhrase.test.ts` → *known bugs: a determiner on a proper name* (4 `test.fails`, plus a regression test for the determiners, possessive, languages and common nouns already right) |
