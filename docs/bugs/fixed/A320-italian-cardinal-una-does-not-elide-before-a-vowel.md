# A320. The Italian cardinal *una* does not elide before a vowel

**Languages:** Italian

Italian elides the feminine *una* before a vowel: *un'ora*, *un'amica*. The indefinite article does
this ([indefArticle.ts](../../../packages/engine/src/languages/it/indefArticle.ts): `VOWEL_START ?
"un'" : 'una'`), so an indefinite HOUR says *entro un'ora*. The cardinal one (`numeral: 1`) is spelled
from the numeral table instead (`numeralText`, C31), and that table writes *una* whatever follows: *entro
una ora*, *una ora brucia*, *vede una amica*. Masculine *un* needs no elision (*un amico*), so only the
feminine is affected, in every slot.

| Case | Now | Want |
|---|---|---|
| the CAT RUNs within one HOUR | `il gatto corre entro una ora.` | `il gatto corre entro un'ora.` |
| … for one HOUR | `il gatto corre per una ora.` | `il gatto corre per un'ora.` |
| … during one HOUR | `il gatto corre durante una ora.` | `il gatto corre durante un'ora.` |
| one HOUR BURNs (subject) | `una ora brucia.` | `un'ora brucia.` |
| the CAT SEEs one FRIEND (feminine, object) | `il gatto vede una amica.` | `il gatto vede un'amica.` |

**Already right.** The indefinite article (`entro un'ora`, `per un'ora`). A consonant (`una casa`), the
masculine (`un cane`, `un amico`). The other six have no elision here. French *une heure* is
unelided by rule.

**Found by** the lanes landing P09-E34 and E35 (`within`, `for`) after A291 put the numeral into the
complement, re-verified at 48af1d35. The P09-E35 test 'for one hour, and two' leaves Italian out for
this reason.

## Shape of the fix

Where Italian spells the numeral (the `numeralText` call in its noun phrase and complement renderer),
give the cardinal *una* the article's elision: if the numeral is one, feminine, and the next word
starts with a vowel, write *un'* joined to the word with no space. The simplest route is to take the
indefinite article's word for one (`indefArticle`), since Italian's cardinal one *is* that word, as the
Italian `CARDINALS` table already says by agreeing it.

| | |
|---|---|
| **Test** | `numerals.test.ts` → *known bugs: the Italian cardinal una does not elide before a vowel (A320)* (5 `test.fails`, one per row, plus a regression test for the indefinite article, a consonant and the masculine) |

## Resolved

2026-09-24. Italian's [renderNP.ts](../../../packages/engine/src/languages/it/renderNP.ts) spells the
cardinal one with `indefArticle` (its approximator still in front), taking the word that follows it as
the lead, so the feminine elides before a vowel (`un'ora`, `un'amica`, `un'altra ora`) and the masculine
takes `uno` before an s-impura (`uno studente`), as the article does. Every other value still comes from
`numeralText`. The noun phrase is Italian's only `numeralText` site, so the complement follows.

Guarded by the five tests of *known bugs: the Italian cardinal una does not elide before a vowel
(A320)* in [numerals.test.ts](../../../packages/engine/test/numerals.test.ts), now plain tests with
their assertions unchanged, plus a new case in the same block (`uno studente`, `per circa un'ora`,
`un'altra ora brucia`). The colocated
[renderNP.test.ts](../../../packages/engine/src/languages/it/renderNP.test.ts) gained a cardinal-one
case (`un'ala`, `un'azione`, `una casa`, `un cane`, `uno studente`).
