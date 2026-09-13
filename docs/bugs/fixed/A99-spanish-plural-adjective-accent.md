# A99. Spanish plural adjectives in -es get the written accent wrong

**Language:** Spanish

`pluralize` (`languages/es/pluralize.ts`) adds `-es` to a consonant-final word and never touches the
accent. Adding a syllable changes which accent the spelling rules require. `agreeAdj` pluralises
every adjective through it, attributive or predicative, and so does the UI-label path
(`renderWord`). Nouns are unaffected because they carry a seeded `plural`.

- A word ending in `-n`/`-s` with no accent is stressed on its second-to-last syllable. With `-es`
  that becomes the third-to-last, which must carry an accent: `joven` → `jóvenes`.
- A word ending in a stressed `-ón`/`-án`/`-és`/`-ín` has that stress on its second-to-last syllable
  once `-es` is added, so the accent goes: `marrón` → `marrones`.

Two seeded adjectives are affected:

| Adjective | Now | Want |
|---|---|---|
| YOUNG, attributive | `los gatos jovenes comen.` | `los gatos jóvenes comen.` |
| BROWN, attributive | `los perros marrónes comen.` | `los perros marrones comen.` |
| BROWN, predicative | `los gatos son marrónes.` | `los gatos son marrones.` |

Already right: `débiles`, `felices`, `singulares` (a final `-l`/`-z`/`-r` without an accent is
stressed on its last syllable, so `-es` needs no accent, and `débil` keeps its own).

## Shape of the fix

In `pluralize`, when adding `-es`:

- remove the accent from a final stressed vowel before `n`/`s` (`-ón`, `-án`, `-és`, `-ín`);
- if the word ends in `n`/`s` with no accent anywhere, put one on the vowel of its second-to-last
  syllable (`jo·ven` → `jó·ve·nes`).

The few words whose stress moves (`carácter` → `caracteres`, `régimen` → `regímenes`) are not
seeded. They would need a seeded plural, as nouns already have.

| | |
|---|---|
| **Test** | `adjectives.test.ts` → *known bugs: Spanish plural adjective accent* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed. When [`pluralize.ts`](../../../packages/engine/src/languages/es/pluralize.ts)
adds `-es`, it now moves the written accent with the stress:

- A stressed final vowel before `-n`/`-s` loses its accent: `marrón` → `marrones`, `inglés` →
  `ingleses`.
- An unaccented word in `-n`/`-s` of two or more syllables gains an accent on its second-to-last
  syllable's vowel, on the strong vowel of a diphthong: `joven` → `jóvenes`, `orden` → `órdenes`. A
  one-syllable word needs none (`gris` → `grises`).

It works on the last word of a multi-word form.

Every row now renders as wanted. Also covered:
- the feminine (`las vacas marrones`, `las mujeres jóvenes`);
- SEEM (`parecen jóvenes`);
- the comparative (`más jóvenes`).

The singular and the `-l`/`-z` adjectives (`débiles`, `felices`) are unchanged. Every seeded Spanish
base in `-n`/`-s` was checked. The only odd result is the adverb `juntos`, which no path pluralises.

- **Tests:** [`packages/engine/test/adjectives.test.ts`](../../../packages/engine/test/adjectives.test.ts)
  → *known bugs: Spanish plural adjective accent*. The pinning `test.fails` is now a passing `test`.
  New cases cover the feminine, SEEM and the comparative, with a guard for the singular and the
  `-l`/`-z` adjectives.
- Unit test: `pluralize.test.ts` (es).
