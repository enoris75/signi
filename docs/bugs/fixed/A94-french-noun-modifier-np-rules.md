# A94. The French attributive noun skips the noun-phrase rules

**Language:** French

`frMods` (`languages/fr/frMods.ts`) renders an attributive noun (`créateur de phrases`) with its own
cut-down copy of the noun-phrase logic, and gets two things wrong:

- **Elision.** It elides `de` → `d'` with the first-letter test `VOWEL_START`, not `elidesBefore`. A
  mute h is missed: `homme` carries the corpus `elides` flag since A24, but only the article paths
  read it.
- **Adjective position.** It puts every adjective of the modifier after the modifier noun. Its
  comment says "postnominal as in French", but the `PRENOMINAL` adjectives (petit, beau, vieux, …)
  precede their noun here as everywhere else.

| Modifier | Now | Want |
|---|---|---|
| PRISON + MAN (plural, purpose) | `la prison de hommes brûle.` | `la prison d'hommes brûle.` |
| CREATOR + HOUSE (plural, purpose) + SMALL | `le créateur de maisons petites mange.` | `le créateur de petites maisons mange.` |
| CREATOR + HOUSE (plural, purpose) + BEAUTIFUL | `le créateur de maisons belles mange.` | `le créateur de belles maisons mange.` |

Already right: a postnominal adjective (`le créateur de phrases sémantiques`) and a true vowel
(`la prison d'enfants`).

## Shape of the fix

Render the modifier with the noun-phrase pieces: `splitAdjectives` for the pre/post split, and
`elidesBefore(forms, lead)` against the word that actually follows `de` (the first prenominal
adjective, or else the noun). The relation still chooses the bare preposition, with no article.

| | |
|---|---|
| **Test** | `adjectives.test.ts` → *known bugs: French attributive noun modifier* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed.
[`frMods.ts`](../../../packages/engine/src/languages/fr/frMods.ts) now renders each modifier with the
noun-phrase pieces:

- **Adjective position:** it builds a stand-in noun phrase from the modifier concept and its
  adjectives and runs `splitAdjectives` on it, so a `PRENOMINAL` adjective precedes the modifier
  noun and the rest follow.
- **Liaison:** `liaisonAdjectives` (A95) gives the liaison form.
- **Elision:** `de` elides by `elidesBefore` against the word right after it, so a mute h counts.

Every row now renders as wanted: `la prison d'hommes`, `le créateur de petites maisons`, `le créateur
de belles maisons`. The fix also covers:

- a prenominal and a postnominal adjective together (`de petites maisons froides`);
- BIG (`de grandes maisons`);
- a liaison form (`de vieil homme`).

A true vowel (`d'enfants`), the postnominal `de phrases sémantiques` and a feature `à homme` are
unchanged. Several postnominal adjectives on a modifier are still joined by spaces, not listed with
`et` as in a noun phrase.

- **Tests:** [`packages/engine/test/adjectives.test.ts`](../../../packages/engine/test/adjectives.test.ts)
  → *known bugs: French attributive noun modifier*. The pinning `test.fails` is now a passing `test`.
  New cases cover the split, BIG and the liaison form, with a guard for the true vowel and the feature
  `à`.
- Unit test: `frMods.test.ts`.
