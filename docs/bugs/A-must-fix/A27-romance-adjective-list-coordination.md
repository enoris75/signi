# A27. Adjective lists repeat the conjunction instead of comma-separating

**Language:** Romance / Iberian coordination

Three or more coordinated adjectives repeat the conjunction (`grande y viejo y hermoso`) where the
list should be comma-separated with the coordinator only before the last. The engine already does
this correctly for coordinated **nouns** (`el gato, el perro y el ratón`), so the rule exists — it
is simply not applied to the adjective list. Romance-wide: prenominal adjectives juxtapose in
Italian/French and hide it, but a **postnominal** triple exposes it there too.

| | Now | Want |
|---|---|---|
| Spanish (pre) | `el gato grande y viejo y hermoso come.` | `el gato grande, viejo y hermoso come.` |
| Portuguese (pre) | `o gato grande e velho e belo come.` | `o gato grande, velho e belo come.` |
| Italian (post) | `il gatto forte e felice e freddo mangia.` | `il gatto forte, felice e freddo mangia.` |
| French (post) | `le chat fort et heureux et froid mange.` | `le chat fort, heureux et froid mange.` |
| Spanish (post) | `el gato fuerte y feliz y frío come.` | `el gato fuerte, feliz y frío come.` |

| | |
|---|---|
| **Test** | `adjectives.test.ts` → *known bugs: adjectives* (2) and *known bugs: Romance postnominal coordination* (3) |
