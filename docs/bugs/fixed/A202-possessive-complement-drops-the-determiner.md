# A202. A German, Spanish or Portuguese complement still drops the head's determiner beside a possessive

**Languages:** German, Spanish, Portuguese

[A187](A187-pronominal-possessor-drops-the-head-determiner.md) gave every language back the
head's own determiner beside a pronominal possessive — `this book of hers`, `questo suo libro`, `ce
livre à elle`, `dieses Buch von ihr`, `este libro suyo`, `este livro seu`. It did so in the subject,
the direct object and the genitive possessor, by teaching each language's noun-phrase builder where
its language puts the possessive.

A complement is built by a different function in three of those languages. German
[`complementsPhrase`](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts),
Spanish [`complementsPhrase`](../../../packages/engine/src/languages/es/complementsPhrase.ts) and
Portuguese [`complementsPhrase`](../../../packages/engine/src/languages/pt/complementsPhrase.ts) each
decline the head themselves and place the possessive prenominally, reading the forms
[`possessedHeadForms`](../../../packages/engine/src/functions/possessedHeadForms.ts) hands them — which
still overwrites `definiteness` for a pronominal possessor. So in a complement, and only in these
three languages, the determiner is dropped as it was before A187.

A `no` is the worse half. The concord checks read the head's own `definiteness`, so Spanish and
Portuguese negate the verb while the `ninguna` / `nenhuma` that answers to it is gone, and German
renders neither `kein` nor `nicht`.

| Case | Language | Now | Want |
|---|---|---|---|
| locative, `this` HOUSE, `my` | German | `der Kater läuft in meinem Haus.` | `der Kater läuft in diesem Haus von mir.` |
| | Spanish | `el gato corre en mi casa.` | `el gato corre en esta casa mía.` |
| | Portuguese | `o gato corre na minha casa.` | `o gato corre nesta casa minha.` |
| locative, `no` HOUSE, `my` | German | `der Kater läuft in meinem Haus.` | `der Kater läuft in keinem Haus von mir.` |
| | Spanish | `el gato no corre en mi casa.` | `el gato no corre en ninguna casa mía.` |
| | Portuguese | `o gato não corre na minha casa.` | `o gato não corre em nenhuma casa minha.` |

The **Want** column is the target these three languages already render in the subject and the object,
carried into the complement; it is not trial output, as this defect has had no trial fix.

Not [A198](A198-spanish-portuguese-predicative-drops-a-pronominal-possessor.md), which is the
*predicative* branch of the same two files losing the possessive word altogether. Here the possessive
is rendered and it is the head's determiner that is lost, on the adjunct complements A198 calls
right.

**Already right.** The subject, the direct object and the genitive possessor in all seven languages
(`dieses Haus von mir brennt.`, `esta casa mía arde.`, `esta casa minha arde.`). The complement in
English, French, Italian and Japanese, whose builders route through the same noun-phrase function
A187 fixed (`in this house of mine`, `dans cette maison à moi`, `in questa mia casa`,
`私のこの家で`). The definite, indefinite and bare heads everywhere (`in meinem Haus` for "in my
house", which is what these three still give for all of them).

Found while fixing A187 on 2026-09-21: the first shape of that fix changed `possessedHeadForms`
itself, which fixed all seven languages in every position but made these three builders stack the two
(`en esta mi casa`, `in diesem meinem Haus`), because they place the possessive themselves. The fix
was narrowed to the noun-phrase builders and this half was left.

## Shape of the fix

Each of the three complement builders has to place the possessive the way its language's
noun-phrase builder now does — German `von` + the dative pronoun after the noun, Spanish and
Portuguese the stressed possessive after the noun — and decline the adjectives after the head's own
determiner rather than after `possessedDeclension`'s `no`. The shared helpers A187 added
(`KEPT_BESIDE_POSSESSIVE`, `dativePronounDe`, `possessiveEsStressed` in
[`possessive.ts`](../../../packages/engine/src/possessive.ts)) are what they need; the pieces exist,
they are simply not reached from the complement path.

The alternative is to make the three complement builders delegate to their own `nounPhrase` /
`renderNP` for a possessed head, as the other four languages do, and then `possessedHeadForms` can
keep the determiner for everyone.

| | |
|---|---|
| **Test** | `possessivePronoun.test.ts` → *known bugs: a possessive in a German, Spanish or Portuguese complement* (1 `test.fails`, plus a regression test for the four languages already right and for the plain possessive) |

## Resolved

2026-09-22. Took the first of the two shapes: each of the three complement builders now places the
possessive the way its language's noun-phrase builder does, rather than delegating to that builder.
`possessedHeadForms` is untouched, so the other four languages and the other positions are as they
were.

The three edits are the same two lines in each file. Where the head carries a determiner of its own
(`KEPT_BESIDE_POSSESSIVE`), the forms the determiner builders read keep that determiner instead of
the `bare` a prenominal possessive would fill, and the possessive moves behind the noun:

- **German**
  ([complementsPhrase](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts))
  — `von` + `dativePronounDe` after the noun, in the same place `nounPhrase` puts it (after the
  modifier genitives, before a genitive possessor and a relative clause). The adjectives decline
  after the head's determiner because `possessedDeclension` reads those same forms: *in diesem
  großen Haus von mir*.
- **Spanish** ([complementsPhrase](../../../packages/engine/src/languages/es/complementsPhrase.ts))
  — `possessiveEsStressed` after the noun, the preposition taking the head's own determiner as it
  would any other: *en esta casa mía*, *en ninguna casa mía*.
- **Portuguese** ([complementsPhrase](../../../packages/engine/src/languages/pt/complementsPhrase.ts))
  — the possessive after the noun, article and all left to the determiner, which the preposition
  contracts with: *nesta casa minha*, *em nenhuma casa minha*.

**`all` came with it**, though the bug file's table does not name it. It is the other determiner
A187 settled, and it does *not* detach — it stands in front of the possessive, which stays where it
is. The same three builders were dropping it for the same reason (`el gato corre en mis casas` for
"in all my houses"), while they spell it correctly with no possessor (`en todas las casas`) and the
subject and object slots spell it correctly with one (`todas mis casas arden`). Now: **de** `in
allen meinen Häusern`, **es** `en todas mis casas`, **pt** `em todas as minhas casas`. Spanish
writes the quantifier in the builder rather than taking it from `artFor`, which would put the
article back (*todas las mis casas*); Portuguese takes it from `artFor`, whose "todas as" is exactly
the article its possessive rides on.

The `no` concord needed nothing of its own: with the head's `definiteness` back in the forms the
Spanish and Portuguese checks read, the negative word and the verb's negation answer to each other
again — `el gato no corre en ninguna casa mía`.

**Tests guarding it.** `packages/engine/test/possessivePronoun.test.ts` → *known bugs: a possessive
in a German, Spanish or Portuguese complement*: the former `test.fails` is now a plain passing test,
with its assertions unchanged (`this` and `no` in the three languages), beside the regression test
for the four languages already right and for the plain possessive.

Added there: `that`, `some`, `many` and `few` on a plural head; `all`, which prefixes rather than
detaches, in all seven; an adjective declining after the kept determiner; and the sister
complements, each with its own preposition and — in German — its own case (the source's `aus
diesem Haus von mir`, the cause's genitive `wegen dieses Hundes von mir`, the terminus's bare dative
`diesem Kater von ihr`). Unit level: the German
[`complementsPhrase.test.ts`](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.test.ts)
gains the same six shapes against the builder directly.

No passing test changed its expectation.
