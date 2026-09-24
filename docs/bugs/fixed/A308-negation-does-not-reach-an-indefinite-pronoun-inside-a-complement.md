# A308. Negation does not reach an indefinite pronoun inside a complement

**Languages:** English, Italian, French, German, Spanish, Japanese, Portuguese

SOMETHING and SOMEONE swap to their negative form under a negated clause: *does not see anyone*, *non
vede nessuno*, *ne voit personne*, *sieht niemanden*, *no ve a nadie*, 誰も見ません, *não vê ninguém*
(C32, P09-E40). The swap is `negativePolarity`, and `resolvePhrase` applies it to the subject and the
direct object only. A complement is resolved without it, so the pronoun keeps its positive form under a
negated verb: *does not run with someone*, *läuft nicht mit jemandem*, 誰かと走りません. That reads as
"there is someone the cat does not run with", which is not what the plan says. The negative concord
the swap brings is also missing: French keeps *pas* (*ne court pas avec quelqu'un*), German keeps
*nicht*, and Japanese has no も…ない.

| Case | Now | Want |
|---|---|---|
| the CAT does not RUN with SOMEONE (comitative) | `does not run with someone` · `non corre con qualcuno` · `ne court pas avec quelqu'un` · `läuft nicht mit jemandem` · `no corre con alguien` · 誰かと走りません · `não corre com alguém` | `does not run with anyone` · `non corre con nessuno` · `ne court avec personne` · `läuft mit niemandem` · `no corre con nadie` · 誰とも走りません · `não corre com ninguém` |
| … with SOMETHING (comitative) | `with something` · `con qualcosa` · `ne court pas avec quelque chose` · `läuft nicht mit etwas` · `con algo` · 何かと走りません · `com algo` | `with anything` · `con niente` · `ne court avec rien` · `läuft mit nichts` · `con nada` · 何とも走りません · `com nada` |
| … for SOMEONE (purpose) | `for someone` · `per qualcuno` · `ne court pas pour quelqu'un` · `läuft nicht für jemanden` · `para alguien` · 誰かのために走りません · `para alguém` | `for anyone` · `per nessuno` · `ne court pour personne` · `läuft für niemanden` · `para nadie` · 誰のためにも走りません · `para ninguém` |
| the CAT does not GIVE the BOOK to SOMEONE (terminus) | `does not give the book to someone` · `non dà il libro a qualcuno` · `ne donne pas le livre à quelqu'un` · `gibt jemandem das Buch nicht` · `no da el libro a alguien` · 誰かに本をあげません · `não dá o livro a alguém` | `… to anyone` · `… a nessuno` · `ne donne le livre à personne` · `gibt niemandem das Buch` · `… a nadie` · 誰にも本をあげません · `… a ninguém` |

The Wants were written from the direct object's surfaces (the same words, the same concord), not
rendered by a trial fix.

**Already right.** The direct object and the subject (`does not see anyone`, `nobody runs`). The
positive complement (`runs with someone`, `läuft mit jemandem`). The locative and instrumental go the
same way as the rows above (`ne court pas en quelqu'un`) but make odd plans, so they are not pinned.

**Found by** the lanes landing P09-E25 to E43 (SOMEONE is P09-E40), re-verified at 48af1d35.

## Shape of the fix

Apply `negativePolarity` ([negativePolarity.ts](../../../packages/engine/src/translator/functions/negativePolarity.ts))
to each complement's phrase in `resolvePhrase` / `resolveComplements` when the clause is negative, as
the direct object has it. The swap already marks the phrase `definiteness: 'no'`, which each engine
reads for concord, but the complement renderers have to read it too:

- French and German must drop *pas* / *nicht* when a complement holds the negative word, as they do
  for the object (`frisst nichts`). German also moves the dative ahead: `gibt niemandem das Buch`.
- Japanese needs the も after the particle: 誰とも, 誰にも, 誰のためにも (the circumfix the object has).

**Decisions for the fixer:**

- **Two negative words.** A negated clause with a negative object and a negative complement (*does not
  give anything to anyone*) gets two swaps. Romance concord allows *non dà niente a nessuno*; English
  keeps *anything … anyone*. Check it once both are swapped.

| | |
|---|---|
| **Test** | `indefinite-pronoun.test.ts` → *known bugs: negation does not reach an indefinite pronoun inside a complement (A308)* (4 `test.fails`, one per row, plus a regression test for the direct object and the positive complement) |

## Resolved

Fixed 2026-09-24. [resolvePhrase.ts](../../../packages/engine/src/translator/functions/resolvePhrase.ts)
now runs every complement's phrase through `negativePolarity` when the clause is negative, through the
new `negativeComplements` in [negativePolarity.ts](../../../packages/engine/src/translator/functions/negativePolarity.ts).
No engine needed a change: the swap marks the phrase `definiteness: 'no'`, and every renderer already
reads a `no` complement for concord (French drops *pas*, German *nicht* and moves the dative ahead,
Japanese writes 誰とも / 誰にも / 誰のためにも), as it does for a `no` noun complement.

**Two negative words** (the fixer's check): with a negative object beside a negative complement,
Romance concord says both, *non dà niente a nessuno*, *no da nada a nadie*, *não dá nada a ninguém*;
French *ne donne rien à personne*; English keeps *does not give anything to anyone*; Japanese
誰にも何もあげません. These are pinned. German has no negative concord, and the swap first gave it *gibt niemandem
nichts*. The follow-up
[singleNegativeWord.ts](../../../packages/engine/src/translator/functions/singleNegativeWord.ts), run
by `resolvePhrase` for a negated clause, keeps only the first negative word in German order and puts
every later swapped indefinite back in the positive series. That order is the subject (under the
passive, the patient and then the agent), then *nie*, then the bare dative that leads the object,
then the object, then the other complements. So: *gibt niemandem etwas*, *niemand läuft mit
jemandem*, *niemand sah etwas*, *nichts wird von jemandem gesehen*, *läuft nie mit jemandem*, *kein
Hund läuft mit jemandem*. These are pinned beside the other languages' two-negative cells, and in
[singleNegativeWord.test.ts](../../../packages/engine/src/translator/functions/singleNegativeWord.test.ts).

- **Tests:** [indefinite-pronoun.test.ts](../../../packages/engine/test/indefinite-pronoun.test.ts) →
  *known bugs: negation does not reach an indefinite pronoun inside a complement (A308)*: all four pins
  now pass, plus the past, and the two-negative-word cases (a negative object beside a negative
  recipient, a negative subject beside a negative comitative) in the six languages with concord or
  *any*. [negativePolarity.test.ts](../../../packages/engine/src/translator/functions/negativePolarity.test.ts)
  covers `negativeComplements`.
