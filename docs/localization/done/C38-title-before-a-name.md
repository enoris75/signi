# C38. MR — a title before a name, and the corpus has no names

**Kind:** was blocked on a construct. P09's *Mr* ranks high only because the frequency list is
news-heavy, and it could not be used without a personal name to precede.

_(from the P09 core-vocabulary sweep of 2026-09-22; [P09](../../features/Z-Done/P09-core-vocabulary/README.md)
§3, **E11**. **Done** on 2026-09-22: personal names and the title shipped; see [Done](#done).)_

## The concepts

| concept | role | verdict |
|---|---|---|
| PETER, MARY | noun (a personal name) | **seeded here**, as what a title precedes |
| MR | noun (a title) | **seeded**: Mr, signor(e), monsieur, Herr, señor, 〜さん (after the name), senhor |

## Was blocked on: personal names — resolved

The corpus's proper nouns were the continents, the countries and the languages; no person had a name,
so there was nothing for a title to precede and nothing to probe. The title itself also behaved
unlike any seeded noun:

- it **fuses** with the name as one noun phrase, taking the name's role and the title's agreement;
- Italian drops its final *-e* before a name (*il signor Rossi*, but *il signore*);
- Spanish and Portuguese put the article before it when speaking *of* the person (*el señor García*)
  and drop it in address;
- Japanese puts it **after** the name, as a suffix (田中さん), and uses it for any person, not only men.

## Done

**2026-09-22.** Two names — PETER and MARY, `proper` and `human`, each language spelling them its own
way as it already spells Europe — and `NounPhrase.title`, the id of a concept flagged `title`,
meaningful only on a head that is both.

**Title and name become one word in the translator.** That is not a shortcut: the two really are one
noun phrase, and fusing the surface is what puts the title in *every* slot a name can fill — subject,
object, complement, possessor — without each of those asking whether there is one. The article then
falls out of the same fusion, because it agrees with the **title**: the title's gender and its own
`takes_article` replace the name's, so Italian, Spanish and Portuguese write one and English, French
and German do not, each fusing with a preposition as it always does.

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| Peter runs | Peter runs. | **Pietro corre.** | **Pierre court.** | Peter läuft. | Pedro corre. | ピーターは走ります。 | o Pedro corre. |
| Mary runs | Mary runs. | Maria corre. | Marie court. | Maria läuft. | María corre. | メアリーは走ります。 | a Maria corre. |
| **Mr** Peter runs | Mr Peter runs. | **il signor Pietro corre.** | monsieur Pierre court. | Herr Peter läuft. | **el señor Pedro corre.** | **ピーターさんは走ります。** | **o senhor Pedro corre.** |
| the cat sees Mr Peter | the cat sees Mr Peter. | il gatto vede il signor Pietro. | le chat voit monsieur Pierre. | der Kater sieht Herr Peter. | el gato ve al señor Pedro. | 猫はピーターさんを見ます。 | o gato vê o senhor Pedro. |
| …gives the book to Mr Peter | to Mr Peter | **al signor Pietro** | **à monsieur Pierre** | Herr Peter | **al señor Pedro** | ピーターさんに | **ao senhor Pedro** |
| Mr Peter's book | Mr Peter's book | il libro del signor Pietro | le livre de monsieur Pierre | das Buch Herr Peters | el libro del señor Pedro | ピーターさんの本 | o livro do senhor Pedro |
| …to Peter (bare name) | to Peter | **a Pietro** | **à Pierre** | Peter | a Pedro | ピーターに | ao Pedro |
| Mr Peter and the cat | Mr Peter and the cat run | il signor Pietro e il gatto corrono | monsieur Pierre et le chat courent | Herr Peter und der Kater laufen | el señor Pedro y el gato corren | ピーターさんと猫は走ります | o senhor Pedro e o gato correm |
| Mr Mary (ja: any person) | | | | | | **メアリーさんは走ります。** | |

What landed differently from the plan:

1. **A personal name resolves *bare*, not definite.** Italian and French article every proper noun,
   which is right for a place and wrong for a person ("il Pietro"), so the names carry
   `takes_article: '0'` — the key Portuguese already used for its bare names, read the other way. And
   the *determiner* had to change, not only the article builder: the paths that fuse a preposition
   with an article read the determiner, so a bare name resolving "definite" still gave "al Pietro",
   "du Pierre". Portuguese keeps its article ("o Pedro"), as Portuguese does.
2. **Two names, not one.** MARY costs nothing and is what lets the feminine article and agreement be
   seen at all; the shared docs' own examples are "Peter and Paul".
3. **MR keeps a picker out, not in.** It is flagged `title`, so the subject and object pickers filter
   it exactly as the verb picker filters a `modal` — the builder can never offer "the Mr eats".
4. **German's title does not decline.** *Herr* is a weak masculine and should be *Herrn* in the
   oblique cases ("sieht Herrn Peter", "das Buch Herrn Peters"). The fused surface has no case to
   decline for — the translator does not know one — so German writes "Herr Peter" everywhere. It is
   the one thing this ticket names and does not do, and it is German's alone.
5. **The vocative is out of scope.** The file's third behaviour — Spanish and Portuguese drop the
   article *in address* — needs a vocative the plan has no notion of; the article is written
   whenever the title is.
6. **MR has no gloss.** "A title before a man's name" would stand on TITLE, which
   [C23](C23-participial-state-adjectives.md) seeded as a **saved phrase's name** (for UNTITLED) — a
   different word in every language (Titel, 題名), and not a form of address in any of them. MR keeps
   its English literal, and so do the two names, which are names.

Pinned in [`personal-names.test.ts`](../../../packages/engine/test/personal-names.test.ts).
