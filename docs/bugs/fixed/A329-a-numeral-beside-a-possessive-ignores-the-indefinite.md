# A329. A numeral beside a possessive ignores the indefinite

**Languages:** English, Italian, French, German, Spanish, Portuguese (Japanese has no article to lose)

A counted phrase drops its indefinite article because the numeral takes its place (C31): *two
friends*, *due amici*, *zwei Freunde*. [`resolveNounPhrase`](../../../packages/engine/src/translator/functions/resolveNounPhrase.ts)
does it by resolving the head `bare`. But a bare head is one a pronominal possessive fills, since
`bare` is not in [`KEPT_BESIDE_POSSESSIVE`](../../../packages/engine/src/possessive.ts). So the
indefinite that A277 taught every builder to keep beside a possessive is lost again as soon as a
numeral stands next to it: a plan asking for *two friends of mine* renders the definite *my two
friends*.

At one the numeral is not only misplaced, it is ungrammatical: it lands behind the possessive like an
adjective, *mein ein Freund*, *il mio un amico*. That half **predates A277**: before it, the
possessive filled the slot of an indefinite too, and the numeral always followed it. It is filed here
because it is the same path, where a numeral meets a possessive.

| Case | Now | Want |
|---|---|---|
| two (`indefinite`) FRIENDs of mine RUN | `my two friends run.` | `two friends of mine run.` |
| … it | `i miei due amici corrono.` | `due miei amici corrono.` |
| … fr | `mes deux amis courent.` | `deux amis à moi courent.` |
| … de | `meine zwei Freunde laufen.` | `zwei Freunde von mir laufen.` |
| … es | `mis dos amigos corren.` | `dos amigos míos corren.` |
| … pt | `os meus dois amigos correm.` | `dois amigos meus correm.` |
| … ja | `私の二人の友達は走ります。` | unchanged |
| one (`indefinite`) FRIEND of mine RUNs | `my one friend runs.` | `one friend of mine runs.` |
| … it | `il mio un amico corre.` | `un mio amico corre.` |
| … fr | `mon un ami court.` | `un ami à moi court.` |
| … de | `mein ein Freund läuft.` | `ein Freund von mir läuft.` |
| … es | `mi un amigo corre.` | `un amigo mío corre.` |
| … pt | `o meu um amigo corre.` | `um amigo meu corre.` |
| … ja | `私の一人の友達は走ります。` | unchanged |

**Why this target.** Each Want is the counted phrase with A277's detached possessive. The numeral
stands where the indefinite article stood. At one, five of the seven write the numeral as the
article itself (*un*, *ein*, *um*), so the row is exactly A277's *a friend of mine*, which the engine
already renders. English keeps *one*, as it does without the possessive (*one friend runs*, pinned in
`numerals.test.ts`). The two-row Wants were verified by applying a trial fix to a throwaway copy of
the packages: `bare` added to `KEPT_BESIDE_POSSESSIVE`, and Italian's `renderNP` putting the numeral
ahead of the stacked possessive when no article is written. That trial is too broad to ship, because
it also detaches the possessive of every other bare head.

**Already right.** A demonstrative keeps its slot and the numeral follows it: *these two friends of
mine*, *questi miei due amici*, *ces deux amis à moi*, *diese zwei Freunde von mir*, *estos dos amigos
míos*, *estes dois amigos meus*. The definite *my two friends* is right in all seven. Without the
numeral (*a friend of mine*) or without the possessive (*two friends*, *one friend*), every language
is right.

**Found by** the P11-E4 / A277 coverage audit, which probed the indefinite possessed head with a
numeral.

## Shape of the fix

The numeral should count as a determiner that is kept beside the possessive, with no article
written. That means the head is detached as for `indefinite`, but no article comes out. Two ways to do it:

- keep `indefinite` on the forms when a numeral stands beside a pronominal possessive, and have every
  article writer print nothing when a `numeral` is present (`numeralSuppressesArticle` is written
  for this, but nothing calls it today);
- or make `KEPT_BESIDE_POSSESSIVE`'s readers treat a counted `bare` head as kept. Test the counted
  case, not `bare` alone, so a bare head without a numeral keeps giving its slot to the possessive.

Italian stacks the possessive after its determiner. With no article, the numeral leads: *due miei
amici*, not *miei due amici* (see `IT_KEPT_BESIDE_POSSESSIVE` and `renderNP`'s `preChain`). At one,
the numeral should become Italian's article, *un mio amico*.

**Not settled here:**

- **The definite with one.** `np('FRIEND', { numeral: 1, possessor: mine })` renders *my one friend*,
  *il mio un amico*, *mon un ami*, *mein ein Freund*, *mi un amigo*, *o meu um amigo*. No target is
  proposed, because the definite with one is broken even **without** a possessive: *l'un amico*,
  *l'un ami*, *der ein Freund*, *el un amigo*, *o um amigo* (en *the one friend* is fine). That is its
  own defect, not catalogued yet. Its fixer should decide whether one keeps its word under a definite
  (*der eine Freund*, *l'unico amico*) or disappears (*my friend*).
- Other persons, a noun possessor (*two friends of the woman*), and the complements, where A291/A292
  already change the numeral's own spelling. None of these were probed.

Pinned by `known bugs: a numeral beside a possessive ignores the indefinite (A329)` in
[numerals.test.ts](../../../packages/engine/test/numerals.test.ts).

Found on 2026-09-24 while landing the P11-E4 / P11-E5 coverage audit.

## Resolved

Fixed on 2026-09-24, by the second way in the shape above: a counted `bare` head is marked, and the
readers of `KEPT_BESIDE_POSSESSIVE` treat it as kept.

- [translator/functions/resolveNounPhrase.ts](../../../packages/engine/src/translator/functions/resolveNounPhrase.ts):
  when a numeral takes the indefinite's place, the head's forms carry `indefinite_dropped: '1'` beside
  the `bare` it resolves to.
- [possessive.ts](../../../packages/engine/src/possessive.ts): `keptBesidePossessive(forms)` is
  `KEPT_BESIDE_POSSESSIVE` plus a `bare` head with that mark. A bare head the plan asked for has no mark
  and still gives its slot to the possessive (*my friends*).
- [functions/possessedHeadForms.ts](../../../packages/engine/src/functions/possessedHeadForms.ts):
  `possessedHeadForms` drops the mark, because in those forms the possessive has the slot. The new
  `ownHeadForms` is the head's own forms with only `proper` dropped, for the detached branches.
- The readers now call `keptBesidePossessive`: `en/isPostModified.ts`, `fr/renderNP.ts`,
  `de/nounPhrase.ts`, `de/possessedDeclension.ts`, `de/complementsPhrase/complementsPhrase.ts`,
  `es/nounPhrase.ts`, `es/complementsPhrase.ts`, `es/possessorText.ts`, `pt/nounPhrase.ts`,
  `pt/complementsPhrase.ts` and `pt/possessorText.ts`.
- Italian: `it/itPossessedHeadForms.ts` keeps the slot for a marked bare head that carries a numeral,
  and `it/renderNP.ts` puts that numeral ahead of the stacked possessive (*due miei amici*; at one,
  *un mio amico*).

Both `test.fails` in `known bugs: a numeral beside a possessive ignores the indefinite (A329)` in
[numerals.test.ts](../../../packages/engine/test/numerals.test.ts) are plain tests now. The same
block gained the object (*two houses of mine*), the locative complement (*in zwei Häusern von mir*,
*en dos casas mías*, *em duas casas minhas*), another person with an adjective (*two old friends of
hers*), and a regression test for the definite, the demonstrative and a genuinely bare head. The
colocated `possessive.test.ts`, `possessedHeadForms.test.ts` and `itPossessedHeadForms.test.ts` gained
cases for the mark.

Still open: German *ein* does not decline in a complement (*in ein Haus von mir*), which is
[A321](../A-must-fix/A321-german-cardinal-one-does-not-decline-in-a-bare-phrase.md). The definite with
one is not changed.
