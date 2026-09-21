# A201. The Japanese neuter pronominal possessor is その, not それの

**Language:** Japanese

Japanese does not build the adnominal of それ by adding の. それ has a suppletive adnominal, **その**,
and it is the only one of the こ/そ/あ series that is: この / その / あの, never これの / それの / あれの.
So "its command" is その命令, and the engine's それの命令 is not the word. (それの is heard in speech, as
a contrastive nominal use — "the one belonging to *that*" — but it is not the possessive determiner
this slot renders.) The plural is それら, whose adnominal *is* regular: それらの.

[`possessiveJa`](../../../packages/engine/src/possessive.ts) builds every Japanese possessive as
"antecedent pronoun + の":

```ts
const JA: Record<PN, RubySegment> = { '1sg': { t: '私', r: 'わたし' }, …, '3pl': { t: '彼ら', r: 'かれら' } };

export function possessiveJa(feats: PronominalPossessor): RubySegment[] {
  let pronoun = JA[pn(feats)];
  if (pn(feats) === '3sg') {
    if (feats.gender === 'fem') pronoun = { t: '彼女', r: 'かのじょ' };
    else if (feats.gender === 'neut') pronoun = { t: 'それ' };
  } else if (pn(feats) === '3pl' && feats.gender === 'fem') { … }
  return [pronoun, { t: 'の' }];
}
```

That shape is right for every pronoun that has a regular genitive, and it is right for eight of the
ten cells. It is wrong for the two neuter ones: the singular, where の must not be added to それ, and
the plural, which has no neuter branch at all and falls through to 彼ら.

| Case | Now | Want |
|---|---|---|
| the WORD and **its** COMMANDs | `単語とそれの命令はあります。` | `単語とその命令はあります。` |
| **its** CAT runs | `それの猫は走ります。` | `その猫は走ります。` |
| the CAT sees **its** COMMAND | `猫はそれの命令を見ます。` | `猫はその命令を見ます。` |
| the CAT runs in **its** HOUSE | `猫はそれの家で走ります。` | `猫はその家で走ります。` |
| **their** (neuter plural) CAT runs | `彼らの猫は走ります。` | `それらの猫は走ります。` |
| the coreference chip, `pronoun.possessive.3sg.neut` | `それの` | `その` |

Every **Want** was rendered by a trial fix applied to HEAD in this worktree and then reverted, not
written by hand.

**Already right — eight of the ten cells.** Every person and number but the two neuter ones spells
its possessive by the regular rule, and all eight were probed:

| | singular | plural |
|---|---|---|
| **1st** | `私の猫は走ります。` | `私たちの猫は走ります。` |
| **2nd** | `あなたの猫は走ります。` | `あなたたちの猫は走ります。` |
| **3rd masc** | `彼の猫は走ります。` | `彼らの猫は走ります。` |
| **3rd fem** | `彼女の猫は走ります。` | `彼女らの猫は走ります。` |

The furigana follows each of them (`かれ`, `かのじょ`, `かれら`, `かのじょら`, `わたし`, `わたしたち`),
and その / それら carry none, being kana. The other six languages are right throughout (`its
command`, `sein Befehl`, `il suo comando`, `sa commande`, `su comando`, `o seu comando`). The
**pronoun** それ, as against the possessive, is right in the singular (`猫はそれを見ます。`) — its
plural is [A200](A200-japanese-plural-neuter-pronoun.md).

**How this differs from [A187](A187-pronominal-possessor-drops-the-head-determiner.md) and
[A185](A185-japanese-head-determiner-before-its-possessor.md).** A187 is about the head's own
determiner being thrown away when a possessive is present, in the six non-Japanese languages;
A187's own "Already right" says *"Japanese keeps the determiner"*, and it does — この本, どの本も
survive a possessor. A185 is about where Japanese **puts** that determiner (before the possessor
rather than after it). A201 is about neither the head nor the placement: it is the possessive
**word** itself, one cell of a hardcoded table, and it is wrong with no determiner on the head at
all (`それの猫` from a plain definite CAT). The three are independent, and the trial for this one
touches only `possessive.ts`. One overlap worth naming: "this command of its" renders
`このそれの命令は燃えます。` today and `このその命令は燃えます。` after this fix, where two words of the
same こ/そ/あ series now sit side by side. A185 is the file that decides where that head determiner
goes; this one only decides which word the possessive is.

**How this differs from [A200](A200-japanese-plural-neuter-pronoun.md).** A200 is the *pronoun*
surface: a seed row (`plural_neut` on THIRD_PERSON) plus a generic read in `resolveNounPhrase`. A201
is the *possessive* surface, which A161's test comment already flags as "a second surface, off a
hardcoded table rather than the seed". Fixing A200 does not touch `possessiveJa`, so 彼らの stands;
fixing A201 does not touch the seed, so 彼ら stands. The plural-neuter row above is filed here, with
its sibling cell, because it is one branch of the one function.

**Shipped strings.** One is wrong on screen today:
[`pronoun.possessive.3sg.neut`](../../../packages/shared/src/uiStrings.ts) — the chip on a
coreference link, "naming the possessive pronoun that link will spell". Its Japanese reads それの. A
second was written around rather than shipped: `help.console.bracket` says *"A bracket holds a word
and commands"*, and the comment above it gives the reason — *"Not 'its commands': Japanese spells
that possessive それの, where it would say その"*. When this is fixed, that string can be reconsidered
on its merits. The [`CorefPickContext`](../../../packages/frontend/src/components/PhraseBuilder/CorefPickContext.tsx)
comment and the `UI_STRINGS` header comment both cite `ja 彼の/彼女の/それの` as the split, and want the
same correction.

Found by an agent localizing; verified at 80b21ff.

## Shape of the fix

Verified by applying it to HEAD and reverting it. It renders every **Want** above.

Two branches in [`possessiveJa`](../../../packages/engine/src/possessive.ts):

- **3rd singular neuter** returns the adnominal whole, with no の appended:
  `if (pn(feats) === '3sg' && feats.gender === 'neut') return [{ t: 'その' }];` — an early return,
  because the function's shared tail is exactly the `+ の` this cell must not take.
- **3rd plural neuter** joins the other gendered plural branch: `pronoun = { t: 'それら' }`, and the
  regular tail then gives それらの. No reading: それら is kana.

Update the function's doc comment, which today says "Japanese juxtaposes the antecedent pronoun +
の" — true of eight cells, not of the ninth.

**Two passing tests pin the wrong forms and must be corrected as part of the fix, not merely
unmarked:**

- [`packages/engine/src/possessive.test.ts`](../../../packages/engine/src/possessive.test.ts) →
  *possessiveJa* → "is the antecedent pronoun + の, its 3rd person split on gender", which asserts
  `possessiveJa(possessor('3', 'singular', 'neut'))` is `[{ t: 'それ' }, { t: 'の' }]` and
  `possessiveJa(possessor('3', 'plural', 'neut'))` is `[{ t: '彼ら', r: 'かれら' }, { t: 'の' }]`. Its
  comment — "the masculine and neuter plural keep 彼ら" — goes with them.
- [`packages/engine/test/uiLabel.test.ts`](../../../packages/engine/test/uiLabel.test.ts) →
  *coreference chip: the possessive the link spells* → "only the languages that spell the
  antecedent's gender split his from her", which asserts `ja: 'それの'`.

Both are unit-level and neither is a `test.fails`; they are the reason the defect reads as intended
behaviour. Correct the assertions, do not weaken them.

**Decision for the fixer — the shape of the branch.** The trial returns a `RubySegment[]` of one
from an early return. The alternative is to let the table carry the whole adnominal and make the の
conditional, which would suit a future pronoun with the same suppletion (あの, if the engine ever
grows a distal). Either reads; the early return is the smaller change and keeps the eight regular
cells sharing one tail.

| | |
|---|---|
| **Test** | `possessivePronoun.test.ts` → *known bugs: the Japanese neuter pronominal possessor* (1 `test.fails` covering the singular and the plural, plus a regression test tabling all eight cells that are already right and their furigana) |
