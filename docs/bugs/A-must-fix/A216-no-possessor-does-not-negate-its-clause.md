# A216. A `no` possessor does not negate its clause

**Languages:** Italian, French, Spanish, Portuguese, Japanese

A `no` possessor is a negative word like any other. After the verb, *la casa di **nessun** uomo*
obliges the Romance preverbal negator exactly as *nessuna casa* does. Italian says *il gatto **non**
vede la casa di nessun uomo* ("the cat sees no man's house"), never *il gatto vede la casa di nessun
uomo*. [A33](../fixed/A33-romance-complement-negative-concord.md) made a `no` complement trigger the
negator, as a `no` object already did. Neither looks past the noun's own determiner into its
possessor, so the clause stays positive and comes out ungrammatical.

Japanese goes wrong the other way. It closes the どの…も circumfix on the possessor itself, before its
の, and leaves the predicate positive: *猫はどの男**もの**家を見ます*, where it wants the circumfix
around the whole phrase and a negated verb, *猫はどの男の家**も**見**ません***.
[`npSegs`](../../../packages/engine/src/languages/ja/npSegs.ts) names this in a comment ("a separate,
unhandled case: どの猫もの本"), but nothing catalogues it.

| Case | Language | Now | Want |
|---|---|---|---|
| CAT SEE the HOUSE of no MAN | Italian | `il gatto vede la casa di nessun uomo.` | `il gatto non vede la casa di nessun uomo.` |
| | French | `le chat voit la maison d'aucun homme.` | `le chat ne voit la maison d'aucun homme.` |
| | Spanish | `el gato ve la casa de ningún hombre.` | `el gato no ve la casa de ningún hombre.` |
| | Portuguese | `o gato vê a casa de nenhum homem.` | `o gato não vê a casa de nenhum homem.` |
| | Japanese | `猫はどの男もの家を見ます。` | `猫はどの男の家も見ません。` |
| CAT RUN in the HOUSE of no MAN | Italian | `il gatto corre nella casa di nessun uomo.` | `il gatto non corre nella casa di nessun uomo.` |
| | French | `le chat court dans la maison d'aucun homme.` | `le chat ne court dans la maison d'aucun homme.` |
| | Spanish | `el gato corre en la casa de ningún hombre.` | `el gato no corre en la casa de ningún hombre.` |
| | Portuguese | `o gato corre na casa de nenhum homem.` | `o gato não corre na casa de nenhum homem.` |
| | Japanese | `猫はどの男もの家で走ります。` | `猫はどの男の家でも走りません。` |
| the BOOK of the HOUSE of no MAN | Italian | `il gatto vede il libro della casa di nessun uomo.` | `il gatto non vede il libro della casa di nessun uomo.` |
| | Spanish | `el gato ve el libro de la casa de ningún hombre.` | `el gato no ve el libro de la casa de ningún hombre.` |
| | Japanese | `猫はどの男もの家の本を見ます。` | `猫はどの男の家の本も見ません。` |
| command | Italian | `vedi la casa di nessun uomo.` | `non vedere la casa di nessun uomo.` |
| | French | `vois la maison d'aucun homme.` | `ne vois la maison d'aucun homme.` |
| | Spanish | `ve la casa de ningún hombre.` | `no veas la casa de ningún hombre.` |
| | Portuguese | `veja a casa de nenhum homem.` | `não veja a casa de nenhum homem.` |
| | Japanese | `どの男もの家を見てください。` | `どの男の家も見るな。` |
| relative clause | Italian | `il cane che vede la casa di nessun uomo corre.` | `il cane che non vede la casa di nessun uomo corre.` |
| | French | `le chien qui voit la maison d'aucun homme court.` | `le chien qui ne voit la maison d'aucun homme court.` |
| | Spanish | `el perro que ve la casa de ningún hombre corre.` | `el perro que no ve la casa de ningún hombre corre.` |
| | Portuguese | `o cão que vê a casa de nenhum homem corre.` | `o cão que não vê a casa de nenhum homem corre.` |
| | Japanese | `どの男もの家を見る犬は走ります。` | `どの男の家も見ない犬は走ります。` |
| subject | Japanese | `どの男もの家は燃えます。` | `どの男の家も燃えません。` |
| beside a negated verb | French | `le chat ne voit pas la maison d'aucun homme.` | `le chat ne voit la maison d'aucun homme.` |
| | Japanese | `猫はどの男もの家を見ません。` | `猫はどの男の家も見ません。` |
| the random phrase | Italian | `la mucca nascosta e calda rinchiude ripetutamente … per colpa di tutti i genitori di nessun'acqua?` | `la mucca nascosta e calda non rinchiude ripetutamente … per colpa di tutti i genitori di nessun'acqua?` |
| | Spanish | `¿la vaca oculta y caliente encierra repetidamente … de ninguna agua?` | `¿la vaca oculta y caliente no encierra repetidamente … de ninguna agua?` |
| | Portuguese | `a vaca oculta e quente encarcera repetidamente … de nenhuma água?` | `a vaca oculta e quente não encarcera repetidamente … de nenhuma água?` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** English and German, which need no concord: `the cat sees no man's house.`, `der
Kater sieht das Haus keines Mannes.` A comparison, which licenses its own negative word and leaves
the Romance clause positive ([A181](../fixed/A181-negative-similative-manner-negates-the-clause.md)):
`il gatto corre come la casa di nessun uomo.` A `no` on the head itself (`il gatto non vede nessuna
casa`, `猫はどの家も見ません`). A Romance possessor inside the subject, which stands before the verb and
needs no negator (`la casa di nessun uomo brucia.`, A58's own row).

Found by the random phrase "does the hidden hot cow confine little big money through the fault of all
no water's parents repeatedly?" (seed 942836): `rinchiude … per colpa di tutti i genitori di
nessun'acqua?`, `どの水もの…`.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine suite green, and no passing test moves. No concept definition and no UI string changes, in any
language.

The trial added one helper, `possessorIsNegative(np)`, which walks a noun phrase's possessor chain
(a pronominal possessor ends it) for a `no`, and a complement version that skips a similative
`manner` conjunct as [`hasNegativeComplement`](../../../packages/engine/src/functions/hasNegativeComplement.ts)
does. It then read them beside the existing checks:

- **Romance.** `objectIsNegative` in [`it`](../../../packages/engine/src/languages/it/predicateText.ts),
  [`es`](../../../packages/engine/src/languages/es/predicateText.ts) and
  [`pt`](../../../packages/engine/src/languages/pt/predicateText.ts) `predicateText`, and French's
  `aucun` gate in [`fr/predicateText.ts`](../../../packages/engine/src/languages/fr/predicateText.ts),
  also take a conjunct whose possessor is negative. Each `hasNegativeComplement(complements)` term
  gains the complement version. The command and the relative clause follow, because they read the
  same gates.
- **Japanese.** [`isNegativeGroup`](../../../packages/engine/src/languages/ja/isNegativeGroup.ts) counts
  a negative possessor, so `jaParticleSegs` closes the も at the phrase's particle and the predicate
  negates. `npSegs` stops writing the possessor's own も, and `predicateSegs` adds the complement
  version (counting comparisons, as it does for a `no` head).

The trial kept [`hasNegativeComplement`](../../../packages/engine/src/functions/hasNegativeComplement.ts)
and [`negationSources`](../../../packages/engine/src/functions/negationSources.ts) as they are, so
English and German do not move. Folding the possessor into those two instead is the tidier fix, and
it reaches English and German, which is the first decision below.

**Decisions for the fixer:**

- **English and German beside a clause negation.** A negated verb, or NEVER, with a `no` possessor
  doubles the negation: `the cat does not see no man's house.`, `the cat never sees no man's house.`,
  `der Kater sieht das Haus keines Mannes nicht.`
  [A158](../fixed/A158-negative-complement-not-collapsed.md)'s collapse would give `does not see any
  man's house`. German has no settled target: `sieht das Haus keines Mannes` drops the verb's
  negation, and `sieht das Haus eines Mannes nicht` moves it. Not pinned.
- **French with the possessor in the subject.** `la maison d'aucun homme brûle.` Whether French wants
  its `ne` there too (`… ne brûle`) is left as it is. Not pinned.
- **A group mixing a negative possessor with a positive conjunct** (`vede il cane e la casa di nessun
  uomo`) negates the clause in the trial, as a `no` conjunct does today. That is the open question of
  mixed-polarity groups, not this bug's.

| | |
|---|---|
| **Test** | `possession.test.ts` → *known bugs: a `no` possessor does not negate its clause* (1 `test.fails`, plus a regression test for English, German, a comparison, a `no` head and the Romance subject) |
