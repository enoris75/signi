# A336. An Italian or Portuguese addressee with a possessive keeps the article

**Languages:** Italian, Portuguese

A vocative has no article (P11-E3's D2), and a possessed one is no exception. Italian and European
Portuguese put the definite article before a possessive in an argument (*il mio amico corre*, *o meu
amigo corre*), but in address the article goes: *Mio amico, corri*, *Meu amigo, corra*. The address
drops the article of an unpossessed noun already (*Gatto, corri*), and Italian drops it before a
singular unmodified kin noun (*Mio padre, corri*), since its possessed-kin rule does that everywhere.
Every other possessed address keeps it.

| Case | Now | Want |
|---|---|---|
| my FRIEND (it) | `Il mio amico, corri.` | `Mio amico, corri.` |
| my younger SISTER (it) | `La mia sorella minore, corri.` | `Mia sorella minore, corri.` |
| my ELDER BROTHER (it) | `Il mio fratello maggiore, corri.` | `Mio fratello maggiore, corri.` |
| my GRANDPARENTs, 2nd plural (it) | `I miei nonni, correte.` | `Miei nonni, correte.` |
| my FATHER (pt) | `O meu pai, corra.` | `Meu pai, corra.` |
| your MOTHER (pt) | `A sua mãe, corra.` | `Sua mãe, corra.` |
| my GRANDPARENTs, 2nd plural (pt) | `Os meus avós, corram.` | `Meus avós, corram.` |
| my FRIEND (pt) | `O meu amigo, corra.` | `Meu amigo, corra.` |
| my younger SISTER (pt) | `A minha irmã mais nova, corra.` | `Minha irmã mais nova, corra.` |
| my ELDER BROTHER (pt) | `O meu irmão mais velho, corra.` | `Meu irmão mais velho, corra.` |

Each plan is `{ ...clause(np('SECOND_PERSON'), 'RUN'), imperative: true, address }`.

**Why this target.** Italian also allows the possessive after the noun in address, *Amico mio,
corri*, and that is often the more affectionate order. The target keeps it in front, *Mio amico*,
for three reasons: the engine already renders the singular kin noun that way (*Mio padre, corri*,
*Mia moglie, corri*, both pinned in address.test.ts); the defect is the article, and moving the
possessive would be a second, stylistic rule for every address; and *mio amico* before the noun is
grammatical Italian vocative. The Want strings were rendered by applying a trial fix to a throwaway
copy of the packages: `resolveAddress` marks a conjunct as vocative, `itPossessedHeadForms` then
returns the `bare` possessed forms for it, and `ptPossessiveWord` leaves the article off. Every Want
differs from Now only by the article; no other language's output moved.

**Already right.** The Italian singular unmodified kin noun (*Mio padre, corri.*, *Mia madre,
corri.*, *Tua madre, corri.*). A name possessor in both languages (*Madre di Pietro, corri.*, *Mãe do
Pedro, corra.*). French, Spanish and German, which have no article beside a possessive (*Mon ami,
cours.*, *Mi amigo, corre.*, *Mein Freund, lauf.*), and English and Japanese. Outside address the
article is right and stays (*il mio amico corre.*, *o meu amigo corre.*).

**Shape of the fix.** P11-E3's Done §9 names this as the possessed-head work of P11-E4: neither
engine writes a possessed noun without its article, because both build it from the possessed forms
rather than from the address's `bare`. `resolveAddress` resolves each conjunct as definite and then
marks it bare, but for a pronominal possessor the Italian `itPossessedHeadForms` and the Portuguese
`ptPossessiveWord` / `nounPhrase` put the article back. The address needs to reach the possessedHeadForms
path (`functions/possessedHeadForms.ts`) with `bare`. The fixer must decide:

- how the address tells those builders it is a vocative: a head form set in `resolveAddress` (what
  the trial fix did), or a flag on the resolved phrase;
- whether Italian 3rd-plural *loro*, which always keeps its article (*il loro padre*), keeps it in
  address too. Not probed.

When it lands, the existing row `'A minha esposa, corra.'` in address.test.ts's "the honorific is an
elder's only" test becomes `'Minha esposa, corra.'` (the trial fix renders that).

Pinned by `known bugs: an Italian or Portuguese addressee with a possessive keeps the article
(A336)` in [address.test.ts](../../../packages/engine/test/address.test.ts).

Found on 2026-09-24 in the P11-E3 coverage audit, which found Done §9's follow-up still open.
