# A189. An adverb of place comes before the predicate and the verb's other complements

**Languages:** English, Italian, French, Spanish, Portuguese

EVERYWHERE says where the action happens, the way a locative complement does, so it stands where a
locative stands: after the object and after the complements the verb takes, before the causal
adjunct. That is the slot [B41](../../localization/done/B41-ui-help-overlay.md) meant to give it
("after the object, where a locative complement stands"), and the one
[`isDirectionAdverb`](../../../packages/engine/src/functions/isDirectionAdverb.ts) describes.

It gets the direction adverb's slot instead. [A156](../fixed/A156-english-direction-adverb-after-complements.md)
put UP and DOWN, which are particles of the verb, at the head of the complements, and
`isDirectionAdverb` answers for both subtypes. So a place adverb comes ahead of every complement,
not just ahead of the cause. With a transitive verb and no complement it looks right (`eats the mouse
everywhere`). With a predicate, a recipient or an object complement it ends up in the middle of the
verb's arguments:

- **English** `the cat seems everywhere tired`, `gives the book everywhere to the dog`.
- **Romance** after a copula, the adverb reads as the copula's own place, and the predicate is left
  over: `el gato está en todas partes cansado` ("the cat is everywhere, tired"), `il gatto è ovunque
  una leggenda`, `le chat est partout fatigué`.

The slot is `complementsText` in the five engines:
[`en/predicateParts.ts`](../../../packages/engine/src/languages/en/predicateParts.ts),
[`it`](../../../packages/engine/src/languages/it/predicateText.ts),
[`fr`](../../../packages/engine/src/languages/fr/predicateText.ts),
[`es`](../../../packages/engine/src/languages/es/predicateText.ts) and
[`pt/predicateText.ts`](../../../packages/engine/src/languages/pt/predicateText.ts), each
`[isDirection ? adverbText : '', complementsPhrase(…)]`.

| Case | Language | Now | Want |
|---|---|---|---|
| CAT SEEM TIRED, EVERYWHERE | English | `the cat seems everywhere tired.` | `the cat seems tired everywhere.` |
| | Italian | `il gatto sembra ovunque stanco.` | `il gatto sembra stanco ovunque.` |
| | French | `le chat semble partout fatigué.` | `le chat semble fatigué partout.` |
| | Spanish | `el gato parece en todas partes cansado.` | `el gato parece cansado en todas partes.` |
| | Portuguese | `o gato parece em toda parte cansado.` | `o gato parece cansado em toda parte.` |
| BE TIRED, cause DOG | English | `the cat is everywhere tired because of the dog.` | `the cat is tired everywhere because of the dog.` |
| | Italian | `il gatto è ovunque stanco a causa del cane.` | `il gatto è stanco ovunque a causa del cane.` |
| | French | `le chat est partout fatigué à cause du chien.` | `le chat est fatigué partout à cause du chien.` |
| | Spanish | `el gato está en todas partes cansado a causa del perro.` | `el gato está cansado en todas partes a causa del perro.` |
| | Portuguese | `o gato está em toda parte cansado por causa do cão.` | `o gato está cansado em toda parte por causa do cão.` |
| BE a LEGEND | English | `the cat is everywhere a legend.` | `the cat is a legend everywhere.` |
| | Spanish | `el gato es en todas partes una leyenda.` | `el gato es una leyenda en todas partes.` |
| BECOME a LEGEND | English | `the cat becomes everywhere a legend.` | `the cat becomes a legend everywhere.` |
| | Italian | `il gatto diventa ovunque una leggenda.` | `il gatto diventa una leggenda ovunque.` |
| not BE TIRED | English | `the cat is not everywhere tired.` | `the cat is not tired everywhere.` |
| | French | `le chat n'est pas partout fatigué.` | `le chat n'est pas fatigué partout.` |
| CAN BE TIRED | English | `the cat can be everywhere tired.` | `the cat can be tired everywhere.` |
| | Spanish | `el gato puede estar en todas partes cansado.` | `el gato puede estar cansado en todas partes.` |
| BE TIRED, resultative | English | `the cat has been everywhere tired.` | `the cat has been tired everywhere.` |
| | Portuguese | `o gato esteve em toda parte cansado.` | `o gato esteve cansado em toda parte.` |
| GIVE the BOOK to the DOG | English | `the cat gives the book everywhere to the dog.` | `the cat gives the book to the dog everywhere.` |
| | Italian | `il gatto dà il libro ovunque al cane.` | `il gatto dà il libro al cane ovunque.` |
| | French | `le chat donne le livre partout au chien.` | `le chat donne le livre au chien partout.` |
| | Spanish | `el gato da el libro en todas partes al perro.` | `el gato da el libro al perro en todas partes.` |
| | Portuguese | `o gato dá o livro em toda parte ao cão.` | `o gato dá o livro ao cão em toda parte.` |
| TRANSFORM the HOUSE into a PRISON | English | `the cat transforms the house everywhere into a prison.` | `the cat transforms the house into a prison everywhere.` |
| | French | `le chat transforme la maison partout en une prison.` | `le chat transforme la maison en une prison partout.` |
| | Portuguese | `o gato transforma a casa em toda parte em uma prisão.` | `o gato transforma a casa em uma prisão em toda parte.` |
| the random phrase | English | `can those ice creams … seem everywhere young to the fox?` | `can those ice creams … seem young to the fox everywhere?` |
| | Italian | `… possono sembrare ovunque giovani alla volpe?` | `… possono sembrare giovani alla volpe ovunque?` |
| | French | `… peuvent sembler partout jeunes au renard ?` | `… peuvent sembler jeunes au renard partout ?` |
| | Spanish | `¿… pueden parecer en todas partes jóvenes al zorro?` | `¿… pueden parecer jóvenes al zorro en todas partes?` |
| | Portuguese | `… podem parecer em toda parte jovens à raposa?` | `… podem parecer jovens à raposa em toda parte?` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** A place adverb after an object or on its own, which `keyboard-words.test.ts` pins
(`the cat eats the mouse everywhere.`), and ahead of a cause (`the cat eats the mouse everywhere
because of the dog.`, `il gatto corre ovunque a causa del cane.`). German, whose middle field puts the adverb before the predicate (`der
Kater scheint überall müde.`, `der Kater ist überall eine Legende.`). Japanese (`猫はどこでも疲れています。`,
`猫はどこでも伝説です。`). UP and DOWN, which keep A156's slot.

Found by the random phrase "can those ice creams that hold all young men seem everywhere young to
the fox?" (seed 502394).

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine suite green. No passing test moves.

Give a place adverb the locative's slot in `COMPLEMENT_RENDER_ORDER`. In each of the five
`complementsText`s, when the modifier's `subtype` is `place`, render the complements that come
before `locative` in the order, then the adverb, then `locative` and `cause`. A direction adverb
keeps the head of the complements, as A156 has it. The trial wrapped each engine's own
`complementsPhrase` in one shared helper in `functions/`, which splits the complements at `locative`,
so each engine needed only the one line changed.

`isDirectionAdverb` then answers for two subtypes that no longer share a slot in these five engines.
Split it (an `isPlaceAdverb` beside it), and let German's
[`adverbSlots`](../../../packages/engine/src/languages/de/adverbSlots.ts) keep reading both, since
German is right as it stands.

**Decisions for the fixer:**

- **Before or after a locative.** The trial puts the adverb just ahead of a locative complement, so
  `the cat runs everywhere in the house.` does not move. The two together are odd in either order.
  Not pinned.
- **A direction adverb on a copular verb.** UP keeps the head of the complements, so it still comes
  before the predicate: `the cat seems up tired.`, `il gatto sembra su stanco.` A verb particle has
  no reading on SEEM or BE. Not pinned.

| | |
|---|---|
| **Test** | `adverb.test.ts` → *known bugs: an adverb of place before the complements* (1 `test.fails`, plus a regression test for an object and a cause, German and Japanese) |
