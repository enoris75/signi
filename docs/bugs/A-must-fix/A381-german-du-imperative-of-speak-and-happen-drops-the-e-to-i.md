# A381. The German du-imperative of SPEAK and HAPPEN drops the e→i change

**Language:** German

A strong verb whose 2/3 singular present raises *e* to *i* / *ie* keeps that vowel in the du command:
*du sprichst* → *sprich*, *es geschieht* → *geschieh*, as *gib*, *iss*, *lies*, *sieh*, *nimm*, *hilf*,
*triff* and *stirb*. Since [A48](../fixed/A48-german-du-imperative-forms.md) the rule in
`deImperativeWord` builds only the regular stem, and a strong verb's vowel change is seeded on the
lexeme as `2sg_imperative`. SPEAK (`sprechen`) and HAPPEN (`geschehen`) were seeded without it, so
the command falls through to the bare stem.

| Case | Now | Want |
|---|---|---|
| de: SPEAK, a du command | `sprech.` | `sprich.` |
| de: HAPPEN, a du command | `gescheh.` | `geschieh.` |
| de: SPEAK, negated | `sprech nicht.` | `sprich nicht.` |
| de: SPEAK about the MAN | `sprech über den Mann.` | `sprich über den Mann.` |
| de: HAPPEN, negated, SUDDENLY (the random phrase) | `gescheh nicht plötzlich.` | `geschieh nicht plötzlich.` |

The **Want** column was rendered, not written by hand: a throwaway copy of HEAD with the two
`2sg_imperative` forms seeded prints exactly these, and changes nothing else below.

**Already right.** The ihr command and the wir cohortative, which keep the *e* (`sprecht`, `gescheht`,
`sprechen wir`), the instruction register (`sprechen.`), and the finite verb (`der Mann spricht`,
`die Geschichte geschieht`). The other seeded e→i/ie verbs carry their form (EAT, EAT_ANIMAL, SEE,
LOOK_AT, READ, ACQUIRE, TAKE, SPEND_MONEY, MEET, HELP_VERB, DIE, GIVE); a sweep of every German lexeme
whose `2sg_present` raises the stem vowel finds only these two missing. Swiss German's SPEAK and
HAPPEN (`rede`, `passiere`) are weak.

**Found by** random phrase seed 19029 (`npm run phrases:random -- 1 --seed 19029`): a negated command
to HAPPEN, *gescheh nicht plötzlich in allen Lichtern, um schon wegen des übergeordneten Münzflügels zu
brennen.*

## Shape of the fix

Seed `'2sg_imperative': 'sprich'` on SPEAK and `'2sg_imperative': 'geschieh'` on HAPPEN, both in
[verbs/intransitive.ts](../../../packages/backend/src/concepts/verbs/intransitive.ts), as GIVE, EAT and
SEE carry theirs. That is a corpus edit, so reseed `signi.db` for the running app to pick it up; the
engine tests seed from source and need nothing else.

**Decision for the fixer:** whether to stop the next verb falling through the same way. A48's
`test.each` over "every seeded verb" is a hand-kept list that predates both verbs. A test that walks
the corpus and requires `2sg_imperative` on every German lexeme whose `2sg_present` raises an *e*
would catch it; deriving the form from `2sg_present` was set aside in A48 (s-stems, the a→ä verbs).

| | |
|---|---|
| **Test** | `imperative.test.ts` → *known bugs: the German du-imperative of SPEAK and HAPPEN drops the e→i change (A381)* (1 `test.fails`: both verbs bare, negated, with a complement and as found; plus a regression test for ihr, wir, the instruction register and the finite verb) |
