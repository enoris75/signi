# A165. A possessive on a place name keeps the name's own article

**Language:** French, Italian, Spanish, German

A pronominal possessive fills the determiner slot. Where it replaces the article (French, Spanish,
German) the article goes; where it rides on the article (Italian, Portuguese) the article stays, and
fuses with a preposition: `ta maison`, `nella tua casa`. A proper place name is no exception. The
article a name takes as a name (`l'Asie`, `la Antártida`, `die Antarktis`) is the default
determiner, and the possessive displaces it like any other. The same goes for the bare continent
preposition (`en Asie`, `in Asia`): once a possessive stands in front, the name needs the
article-bearing preposition (`dans ton Asie`, `nella tua Asia`).

`possessedHeadForms` (`functions/possessedHeadForms.ts`) gives way the picked determiner, but the
proper-noun branches run first and ignore it:

- **French** `artFor` returns the definite article for every `proper` name, so the article stacks
  with the possessive in every position: subject, object, terminus, cause and possessor. It does not
  even elide, because the possessive now leads (`la ton Asie`, not `l'`).
- **Spanish** `artFor` and **German** `determiner` / `prepDet` do the same for an inherently
  articled name (`takes_article`): `la mi Antártida`, `in der meiner Antarktis`.
- **Italian and French** `complementsPhrase` choose the bare `in` / `en` for a continent in the
  locative and the direction without looking for a possessive.

| Case | Language | Now | Want |
|---|---|---|---|
| object, `your Asia` | French | `le chat voit la ton Asie.` | `le chat voit ton Asie.` |
| subject, `our Europe` | French | `la notre Europe brûle.` | `notre Europe brûle.` |
| terminus | French | `le chat donne le livre à la ton Asie.` | `le chat donne le livre à ton Asie.` |
| cause | French | `le chat court à cause de la ton Asie.` | `le chat court à cause de ton Asie.` |
| possessor | French | `le livre de la ton Asie brûle.` | `le livre de ton Asie brûle.` |
| source, `my Antarctica` | French | `le chat vient du mon Antarctique.` | `le chat vient de mon Antarctique.` |
| locative, `your Asia` | French | `le chat court en ton Asie.` | `le chat court dans ton Asie.` |
| direction, `your Asia` | French | `le chat va en ton Asie.` | `le chat va dans ton Asie.` |
| locative, `your Asia` | Italian | `il gatto corre in tua Asia.` | `il gatto corre nella tua Asia.` |
| direction, `your Asia` | Italian | `il gatto va in tua Asia.` | `il gatto va nella tua Asia.` |
| locative, `my Antarctica` | Spanish | `el gato corre en la mi Antártida.` | `el gato corre en mi Antártida.` |
| source, `my Antarctica` | Spanish | `el gato viene de la mi Antártida.` | `el gato viene de mi Antártida.` |
| locative, `my Antarctica` | German | `der Kater läuft in der meiner Antarktis.` | `der Kater läuft in meiner Antarktis.` |
| source, `my Antarctica` | German | `der Kater kommt aus der meiner Antarktis.` | `der Kater kommt aus meiner Antarktis.` |
| random phrase 1 | French | `le garçon bas et brun brûle la ton Asie vers le bas, …` | `le garçon bas et brun brûle ton Asie vers le bas, …` |
| random phrase 2 | French | `…, ou la notre Europe qui pleura vite sera en train de créer …` | `…, ou notre Europe qui pleura vite sera en train de créer …` |

Every **Want** was rendered, not written by hand. That includes the random phrases, whose other
words do not change. They come from a trial fix applied to a throwaway copy of HEAD (see below).

**Already right.** English and Japanese (`your Asia`, `あなたのアジア`); Portuguese in every position
(`a sua Ásia`, `na sua Ásia`, `da sua Ásia`); Italian outside the bare `in` (`la tua Asia`, `dalla
tua Asia`, `alla tua Asia`); a bare-name continent in Spanish and German (`tu Asia`, `in deinem
Asien`); the German object (`meine Antarktis`); the French feminine source, by accident (`de ton
Asie`: the bare continent `de` happens to be right). Without a possessive the name keeps its article
and its bare preposition everywhere (`l'Asie`, `en Asie`, `in Asia`). A common noun with a
possessive is right in all seven (`dans ta maison`, `nella tua casa`).

Found by the random phrases "the low brown boy burns your Asia down, that is, …" (seed 341682) and
"… or our Europe that cried fast will be creating all lazy boys" (seed 341683).

## Shape of the fix

A pronominal possessive outranks the name's own article. The trial fix was two changes. It was
verified by applying it to a throwaway copy of HEAD, where it renders every **Want** above and
leaves the engine suite green except the unit test pinning `possessedHeadForms`' exact output.

- [`possessedHeadForms`](../../../packages/engine/src/functions/possessedHeadForms.ts): with a
  pronominal possessor, also clear `proper` on the forms it returns. Then the French and Spanish
  `artFor`, the German `determiner` / `prepDet` and the Italian `prepDet` fall through to the
  possessive's `definiteness` (`bare` or `definite`) like a common noun. The French and Italian
  locatives' `nf['proper'] === '1'` test for the bare `en` / `in` stops firing too.
- The **direction** in [`it/complementsPhrase.ts`](../../../packages/engine/src/languages/it/complementsPhrase.ts)
  and [`fr/complementsPhrase.ts`](../../../packages/engine/src/languages/fr/complementsPhrase.ts)
  keys the bare `in` / `en` off `isA === 'CONTINENT'` instead, so it needs the same `proper` guard.
  Without the bare form, the trial routes a possessed continent through `spatialHead('in', …)`
  (`nella`, `dans`). The French continent source (`d'Europe`) wants the guard as well, though it
  happens to render right for a feminine name.

**Decision for the fixer:** the goal preposition. The trial keeps the continent's own `in`, with its
article: `va nella tua Asia`, `va dans ton Asie`. The common-place goal, `alla tua Asia` / `à ton
Asie`, is also idiomatic ("retourner à mon Afrique"). The pins take the first. Change them if you
choose the second.

Clearing `proper` is the smallest change, but not the only one. The flag is read nowhere else on
these paths, which is why the trial works. A dedicated "determiner already filled" flag on the forms
would say what is meant, and survive a later reader of `proper`.

**Neighbouring.** An *adjective* on a bare-name place has the mirror problem: it brings back an
article the name does not take alone (German `große Asien brennt`, Italian `in grande Asia`). That is
[A169](A169-adjective-on-a-place-name.md), which keeps the same goal preposition as the pins here.

| | |
|---|---|
| **Test** | `possession.test.ts` → *known bugs: a possessive on a place name* (3 `test.fails`, plus a regression test for the positions and languages already right) |
