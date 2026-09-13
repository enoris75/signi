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

### Beside a condition or a relative

The IF condition works the same way. A bare main clause after a protasis that has a predicative elides
that predicative. A condition on the pair, or a relative on either subject, leaves the coordination's
elision in place:

| Plan | Language | Now | Want |
|---|---|---|---|
| if CAT BE a legend, DOG BE (negative) | it | `se il gatto fosse una leggenda, il cane non sarebbe.` | `…, il cane non lo sarebbe.` |
| | fr | `si le chat était une légende, le chien ne serait pas.` | `…, le chien ne le serait pas.` |
| | es | `si el gato fuera una leyenda, el perro no sería.` | `…, el perro no lo sería.` |
| | de | `wenn der Kater eine Legende sein würde, würde der Hund nicht sein.` | `…, würde der Hund es nicht sein.` |
| | ja | `もし猫が伝説だったら、犬はです。` | `…犬はそうではありません。` |
| if CAT BE happy, DOG BE | es | `si el gato estuviera feliz, el perro sería.` | `…, el perro lo estaría.` |
| | pt | `se o gato estivesse feliz, o cão seria.` | `…, o cão estaria.` |
| | it / fr / de | `il cane sarebbe` / `le chien serait` / `würde der Hund sein` | `il cane lo sarebbe` / `le chien le serait` / `würde der Hund es sein` |
| | ja | `もし猫が幸せだったら、犬はです。` | `…犬はそうです。` |
| if MAN EAT, CAT BE a legend, but DOG BE (negative) | it | `…, ma il cane non è.` | `…, ma il cane non lo è.` |
| | de | `…, aber der Hund ist nicht.` | `…, aber der Hund ist es nicht.` |
| CAT that RUNs BE a legend, but DOG BE (negative) | it | `il gatto che corre è una leggenda, ma il cane non è.` | `…, ma il cane non lo è.` |
| | fr | `…, mais le chien n'est pas.` | `…, mais le chien ne l'est pas.` |
| CAT BE a legend, but DOG that RUNs BE (negative) | es | `…, pero el perro que corre no es.` | `…, pero el perro que corre no lo es.` |
| | de | `…, aber der Hund, der läuft, ist nicht.` | `…, aber der Hund, der läuft, ist es nicht.` |
| | ja | `猫は伝説です、しかし走る犬はです。` | `…走る犬はそうではありません。` |

The test asserts every language on each row; the table shows a sample. English and Portuguese with ser
are right on each (`if the cat was a legend, the dog would not be`, `se o gato fosse uma lenda, o cão
não seria`).

Already right: English throughout (`but Antarctica will not be`, `but the dog is not`). Portuguese with
ser (`mas a Antártida não será`, `mas o cão não é`): Portuguese allows the null predicate, and the
normative `não o será` is also correct. These are not elliptical, and render correctly today:

- a second clause with a predicate of its own (`but the dog is not happy`, `ma il cane non è felice`);
- a bare BE with no predicative before it, which stays existential: after a non-copular clause (`the
  cat runs, but the dog is not`), after another bare BE (`the cat is, but the dog is not`), after a
  protasis with none (`if the cat ate, the dog would be`), or in a relative (`the dog that is runs`);
- a bare BE *before* the predicative, since the ellipsis only looks back (`the cat is not, but the dog
  is a legend`, `if the cat were not, the dog would be a legend`);
- a relative whose head fills BE's predicative, where the relative pronoun stands for it (`a legend
  that the dog is not`, `una leggenda che il cane non è`). Its Japanese is A123.

Passing tests in `copulaWithoutComplement.test.ts` pin all of these.

Not covered: an antecedent inside a relative clause (`the dog that is a legend runs, but the cat is
not`), where the reading is marginal even in English.

## Shape of the fix

Resolve the ellipsis where both clauses are visible. That is the translator, since neither coordination
nor condition nests. The rule: the clause's verb is a copula with no complements, and the clause before
it (the first clause of a coordination, or the protasis of a main clause) is a copula with a
predicative (or, failing that, a locative). In that case, hand the elliptical clause the elided
complement, marked as elided, and let each engine render it as its pro-form:

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
| | `copulaWithoutComplement.test.ts` → *known bugs: an elided subject complement beside a condition or a relative* (2 `test.fails`) |
