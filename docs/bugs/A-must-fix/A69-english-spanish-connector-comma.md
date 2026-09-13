# A69. English and Spanish discourse connectors between clauses lack their following comma

**Language:** English, Spanish

A clause coordination is joined as `<clause>, <conjunction> <clause>`. That suits the true conjunctions, but the explicative and consecutive connectors (`that is`, `es decir`, `por lo tanto`) are set off by a comma after them as well.

## English

`englishEngine` (`languages/en/englishEngine.ts`) joins a coordinated clause as `<clause>,
<conjunction> <clause>`. That suits `and`, `or`, `but`, `so` and `and then`. The explicative `that
is` is parenthetical and is set off by commas on both sides (`…, that is, …`, like `i.e.`). Without
the second comma the next words read as a clause of their own: `that is the dog`.

| Clause | Now | Want |
|---|---|---|
| CAT RUN, that is DOG JUMP | `the cat runs, that is the dog jumps.` | `the cat runs, that is, the dog jumps.` |
| CAT EAT FOOD, that is CAT EAT MOUSE | `the cat eats the food, that is the cat eats the mouse.` | `the cat eats the food, that is, the cat eats the mouse.` |

Already right: the other five conjunctions (`, and`, `, or`, `, but`, `, so`, `, and then`).

Two existing passing tests pin the current output and change with the fix:

- `packages/engine/test/coordination.test.ts:140`: `en: 'the cat runs, that is the dog jumps.'`
- `packages/engine/src/languages/en/englishEngine.test.ts:34`: `'the cat runs, that is the dog eats'`

### Shape of the fix

Give `that_is` a trailing comma in the clause join, e.g. `COORD_WORDS` → `that is,` for clauses
only. `coordinate` also reads `COORD_WORDS` for noun groups, where the UI allows only `and` / `or`,
so keep the comma to the clause join or give it its own map entry.

## Spanish

`es decir` (`that_is`) and `por lo tanto` (`therefore`) are discourse connectors (*conectores*), not
conjunctions. At the head of the clause they introduce, the RAE's *Ortografía* (2010, §3.4.2.2.1.1)
sets them off with a comma after them: *…, es decir, …* / *…; por lo tanto, …*. `spanishEngine.render`
(`languages/es/spanishEngine.ts`) joins every conjunction as `, <word> <clause>`, with no comma
after the word.

| Conjunction | Now | Want |
|---|---|---|
| `that_is` | `el gato corre, es decir el perro salta.` | `el gato corre, es decir, el perro salta.` |
| `therefore` | `el gato corre, por lo tanto el perro salta.` | `el gato corre, por lo tanto, el perro salta.` |

Already right: `y`, `o`, `pero` and `y luego`, which are conjunctions and take no comma after them.
Commands are not affected, because the translator turns `that_is` and `therefore` into `and` in an
imperative.

The existing passing test `coordination.test.ts:143` (*coordinated clauses* → *explicative — "that
is"*) pins the wrong `es: 'el gato corre, es decir el perro salta.'`.

### Shape of the fix

In `spanishEngine.render`, add a comma after the two connectors, e.g. with a set of connector
conjunctions next to `COORD_WORDS` in `es.consts.ts`. Update `coordination.test.ts:143`.

| | |
|---|---|
| **Test** | `coordination.test.ts` → *known bugs: English comma after "that is"*; `coordination.test.ts` → *known bugs: Spanish comma after a discourse connector* (2 `test.fails`) |
