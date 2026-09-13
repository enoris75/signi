# A121. A coordinated copula that elides its predicate renders no pro-form

**Language:** Italian, French, Spanish, German, Japanese (Portuguese estar only)

"Africa is a continent in Asia, but Antarctica will not be" coordinates a second BE that has no
complement of its own. It stands for the first clause's predicate: Antarctica will not be *a
continent in Asia*. English can strand the copula. The other languages cannot. Italian, French and
Spanish need the invariable predicate clitic (`lo` / `le`), German needs `es`, and Japanese needs the
pro-form `そう`.

The translator resolves the coordinated clause on its own (`translator.ts`, `coordination`), and every
engine renders it as a bare copula. Without the pro-form, the Romance and German copula reads as
existence: `l'Antartide non sarà` is "Antarctica will not exist". Japanese has no bare copula at all
(A120). Spanish and Portuguese also lose the antecedent's copula: the first clause takes estar, the
bare second clause takes ser.

| Plan | Language | Now | Want |
|---|---|---|---|
| AFRICA BE a continent in ASIA, but ANTARCTICA BE (future, negative) | it | `l'Africa è un continente in Asia, ma l'Antartide non sarà.` | `…, ma l'Antartide non lo sarà.` |
| | fr | `l'Afrique est un continent en Asie, mais l'Antarctique ne sera pas.` | `…, mais l'Antarctique ne le sera pas.` |
| | es | `África es un continente en Asia, pero la Antártida no será.` | `…, pero la Antártida no lo será.` |
| | de | `Afrika ist ein Kontinent in Asien, aber die Antarktis wird nicht sein.` | `…, aber die Antarktis wird es nicht sein.` |
| | ja | `アフリカはアジアで大陸です、しかし南極大陸はです。` | `…南極大陸はそうではありません。` |
| CAT BE a legend, but DOG BE (negative) | it | `…, ma il cane non è.` | `…, ma il cane non lo è.` |
| | fr | `…, mais le chien n'est pas.` | `…, mais le chien ne l'est pas.` |
| | es | `…, pero el perro no es.` | `…, pero el perro no lo es.` |
| | de | `…, aber der Hund ist nicht.` | `…, aber der Hund ist es nicht.` |
| | ja | `猫は伝説です、しかし犬はです。` | `…犬はそうではありません。` |
| CAT BE happy, but DOG BE (negative) | es | `el gato está feliz, pero el perro no es.` | `…, pero el perro no lo está.` |
| | pt | `o gato está feliz, mas o cão não é.` | `…, mas o cão não está.` |
| same, past | it | `il gatto fu felice, ma il cane non fu.` | `…, ma il cane non lo fu.` |
| | fr | `le chat fut heureux, mais le chien ne fut pas.` | `…, mais le chien ne le fut pas.` |
| | es | `el gato estuvo feliz, pero el perro no fue.` | `…, pero el perro no lo estuvo.` |
| | pt | `o gato esteve feliz, mas o cão não foi.` | `…, mas o cão não esteve.` |
| | de | `der Kater war glücklich, aber der Hund war nicht.` | `…, aber der Hund war es nicht.` |
| | ja | `猫は幸せでした、しかし犬はです。` | `…犬はそうではありませんでした。` |
| same, plural DOG | it | `…, ma i cani non sono.` | `…, ma i cani non lo sono.` |
| | fr | `…, mais les chiens ne sont pas.` | `…, mais les chiens ne le sont pas.` |
| | es | `…, pero los perros no son.` | `…, pero los perros no lo están.` |
| | de | `…, aber die Hunde sind nicht.` | `…, aber die Hunde sind es nicht.` |
| CAT BE happy (negative), but DOG BE | it | `il gatto non è felice, ma il cane è.` | `…, ma il cane lo è.` |
| | fr | `le chat n'est pas heureux, mais le chien est.` | `…, mais le chien l'est.` |
| | es | `el gato no está feliz, pero el perro es.` | `…, pero el perro lo está.` |
| | pt | `o gato não está feliz, mas o cão é.` | `…, mas o cão está.` |
| | de | `der Kater ist nicht glücklich, aber der Hund ist.` | `…, aber der Hund ist es.` |
| | ja | `猫は幸せではありません、しかし犬はです。` | `…犬はそうです。` |

The clitic is invariable: Italian `lo`, not `li`, for a plural subject. French elides it before a
vowel (`ne l'est pas`). The Japanese join `、しかし` is A122, so the Japanese want is given for the
second clause only.

A **locative** antecedent leaves the locative pro-form instead:

| CAT BE in the HOUSE, but DOG BE (negative) | Now | Want |
|---|---|---|
| it | `il gatto è nella casa, ma il cane non è.` | `…, ma il cane non c'è.` |
| fr | `le chat est dans la maison, mais le chien n'est pas.` | `…, mais le chien n'y est pas.` |
| es | `el gato está en la casa, pero el perro no es.` | `…, pero el perro no está.` |
| pt | `o gato está na casa, mas o cão não é.` | `…, mas o cão não está.` |
| de | `der Kater ist im Haus, aber der Hund ist nicht.` | `…, aber der Hund ist nicht da.` |

Japanese `犬はいません` here is A120's existential, not a pro-form.

Already right: English throughout (`but Antarctica will not be`, `but the dog is not`). Portuguese with
ser (`mas a Antártida não será`, `mas o cão não é`): Portuguese allows the null predicate, and the
normative `não o será` is also correct. A second clause with a predicate of its own is not elliptical
(`but the dog is not happy`, `ma il cane non è felice`). A bare BE after a non-copular clause has no
antecedent and stays existential (`the cat runs, but the dog is not`).

## Shape of the fix

Resolve the ellipsis where both clauses are visible. That is the translator, since coordination does
not nest. The rule: the coordinated clause's verb is a copula with no complements, and the first
clause is a copula with a predicative (or, failing that, a locative). In that case, hand the
coordinated clause the elided complement, marked as elided, and let each engine render it as its
pro-form:

- **it:** `lo` (predicative) / `ci` (locative), proclitic;
- **fr:** `le` / `y`, with elision;
- **es:** `lo` (predicative) / nothing (locative);
- **pt:** nothing;
- **de:** `es` (predicative), in the object slot before `nicht` / `da` (locative);
- **ja:** `そう` + the copula (`そうです`, `そうではありません`), ahead of A120's existential gate;
- **en:** nothing.

The copula choice (Spanish/Portuguese ser vs estar, A47) should read the elided complement, so the
second clause takes estar exactly when the first does. The Romance object-clitic placement (A32)
already positions a proclitic before the finite verb and after `non` / `ne`.

| | |
|---|---|
| **Test** | `coordination.test.ts` → *known bugs: a coordinated copula elides its predicate* (2 `test.fails`) |
