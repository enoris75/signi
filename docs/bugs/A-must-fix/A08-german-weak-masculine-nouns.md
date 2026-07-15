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
