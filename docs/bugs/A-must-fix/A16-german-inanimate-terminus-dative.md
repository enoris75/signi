# A16. Inanimate terminus is marked with a bare dative

**Language:** German

German dativises an inanimate terminus exactly as it dativises a person, so "save the book to the
container" → `der Kater speichert dem Behälter das Buch` — which reads as *giving the book to the
container*, as though it were a recipient. A goal wants a preposition, not a bare dative.

| | |
|---|---|
| **Want** | Asserted negatively (which preposition — `in` / `an` / `zu` — is verb-dependent, a design call): not `der Kater speichert dem Behälter das Buch.` The other six languages are unaffected — their dative preposition doubles as a goal marker. |
| **Test** | `complements/terminus.test.ts` → *known bugs: terminus* (1 test) |
