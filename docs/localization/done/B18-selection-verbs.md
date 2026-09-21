# B18. Selection & input verbs — CLICK, CHOOSE, SELECT, TYPE

_(split out of [B08](B08-verb-definitions.md).)_

The app's own UI vocabulary. Genus **SELECT_GENUS** (an "indicate one of several" sense) plus an
input genus for TYPE. Differentiae are mostly unseeded device/UI nouns.

## Seed first (1–2 verbs + 2–3 nouns)

| concept | role | gloss | note |
|---|---|---|---|
| INDICATE | verb, transitive | to point out | shared with [B16](B16-word-verbs.md) — seed once |
| OPTION | noun | one of several possibilities | differentia for CHOOSE, SELECT |
| BUTTON | noun | a control that is pressed | differentia for CLICK |
| KEYBOARD | noun | a set of keys for typing | instrument for TYPE |

## Unlocks

| verb | plan | gloss (en) | status |
|---|---|---|---|
| CHOOSE | `infinitiveGloss('INDICATE', 'OPTION')` | to indicate an option | additive once seeded |
| SELECT | `infinitiveGloss('INDICATE', 'OPTION')` | to indicate an option | ⚠ collides with CHOOSE |
| CLICK | `infinitiveGloss('PRESS', 'BUTTON')` | to press a button | needs a PRESS genus too |
| TYPE | WRITE + instrumental KEYBOARD | to write with a keyboard | ⚠ builder change (see B14) |

**CHOOSE and SELECT are near-synonyms** and will render identically under this shape — the same
duplicate-gloss trap as [B16](B16-word-verbs.md). Their seeded literals already differ only subtly
("to pick one option from several" vs "to mark out an item as the one to act on"). Either find a
distinguishing differentia or localize only one of the pair.

## Done

**2026-09-14.** Seeded **PRESS**, **WRITE**, **OPTION**, **BUTTON** and **KEYBOARD**. INDICATE came
from [B16](B16-word-verbs.md). Three of the four verbs are authored.

| concept | role | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| PRESS | verb | press | premere | presser | drücken | pulsar | 押す | pressionar |
| WRITE | verb | write | scrivere | écrire | schreiben | escribir | 書く | escrever |
| OPTION | noun | option | opzione | option | Option | opción | 選択肢 | opção |
| BUTTON | noun | button | pulsante | bouton | Taste | botón | ボタン | botão |
| KEYBOARD | noun | keyboard | tastiera | clavier | Tastatur | teclado | キーボード | teclado |

| verb | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| CHOOSE | to indicate an option | indicare un'opzione | indiquer une option | eine Option bezeichnen | indicar una opción | 選択肢を示す | indicar uma opção |
| CLICK | to press a button | premere un pulsante | presser un bouton | eine Taste drücken | pulsar un botón | ボタンを押す | pressionar um botão |
| TYPE | to write with a keyboard | scrivere con una tastiera | écrire avec un clavier | mit einer Tastatur schreiben | escribir con un teclado | キーボードで書く | escrever com um teclado |

- **CHOOSE** takes an indefinite object, "to indicate **an** option", using the new `definiteness`
  part: a choice picks one.
- **SELECT stays literal.** Every composable shape duplicated CHOOSE's gloss. It is listed in
  [C05](C05-non-distinguishing-genera.md).
- **TYPE's instrument** needed B12's builder change, not B14's.
- BUTTON and KEYBOARD have no ja `reading`. A katakana word with a reading gets its hiragana printed
  over it ([furigana.test.ts](../../../packages/engine/test/furigana.test.ts)).
- The Japanese instruction-register label for PRESS is 押し, after the
  [A126](../../bugs/fixed/A126-japanese-godan-su-instruction-label.md) fix.

Pinned by [genus-verbs.test.ts](../../../packages/engine/test/genus-verbs.test.ts), [verb.test.ts](../../../packages/engine/test/verb.test.ts),
[subject.test.ts](../../../packages/engine/test/subject.test.ts) and [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) (CHOOSE en+it, CLICK
en+es, TYPE en+ja).
