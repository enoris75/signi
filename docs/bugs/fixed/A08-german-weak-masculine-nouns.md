# A8. Weak masculine (n-declension) nouns are not declined

**Language:** German

`Junge` takes `-n` in every case but the nominative singular. It is a property of the **noun**, so
every complement that puts `Junge` in an oblique case hits it. The plural happens to be `Jungen`
anyway, so plural cases pass **by coincidence** — that is not evidence the declension works.

| | Now | Want |
|---|---|---|
| direction | `der Kater geht zum Junge.` | `zum Jungen` |
| locative | `der Kater läuft im Junge.` | `im Jungen` |
| source | `der Kater kommt aus dem Junge.` | `aus dem Jungen` |

| | |
|---|---|
| **Fix** | Needs a weak-noun class marked in the corpus (`Junge`, `Herr`, `Mensch`, `Nachbar`, `Student`, `Kunde`…), then applied in `de.ts` wherever a non-nominative noun surface is emitted. A lexical fact belongs in the seed. |
| **Test** | `complements/direction.test.ts`, `complements/locative.test.ts`, `complements/source.test.ts` → *known bugs* (1 each) |

## Resolved

Fixed 2026-07-15. Marked the weak nouns in the corpus and declined them in `de.ts`.

- **Corpus:** [`packages/backend/src/concepts/nouns.ts`](../../../packages/backend/src/concepts/nouns.ts)
  — `weak: '1'` on the German forms of the three seeded weak masculines: `Junge` (BOY), `Ochse`
  (OX), `Bursche` (YOUNG_MAN). Weak declension is a German-specific morphological fact, so it lives
  as a per-language German **form key** (which flows through `noun_forms` → `forms['weak']`, like
  the existing `takes_article`), not a concept-level `semantic_concepts` column — no schema change
  was needed.
- **Engine:** [`packages/engine/src/languages/de.ts`](../../../packages/engine/src/languages/de.ts)
  — new `weakN(word, case, plural)`: a weak masculine takes `-(e)n` in every case but the
  nominative singular (`-n` after a final `-e`, `-en` otherwise; the plural already carries its own
  `-n`, and a weak genitive takes no `-(e)s`). Applied at **all three** oblique noun-surface
  emitters — `nounPhrase` (subjects/objects/predicatives/relative heads), the inline complement
  renderer (`zum/im/aus dem Jungen` — the pinned path), and `possessorText` (`vom Jungen`).
- **Tests:** the three pinning `test.fails` are now passing `test`s. A generalisation block was
  added in [`complements/direction.test.ts`](../../../packages/engine/test/complements/direction.test.ts)
  → *known bugs: direction*: the sibling weak nouns (`zum Ochsen`, `zum Burschen`); a non-dative
  oblique case and the possessor (`den Jungen` accusative, `das Buch vom Jungen`); and a regression
  guard that the nominative singular (`der Junge läuft.`) and the plural goal (`zu den Jungen`) are
  left untouched.
