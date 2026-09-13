# A89. A French continent source keeps its article ("de l'Europe")

**Language:** French

A continent of origin takes a bare `de`, elided to `d'` (`il vient d'Europe`, `d'Afrique`). This is
the source counterpart of the bare `en` that A31 gave the goal (`va en Europe`) and A29 gave the
locative. The `source` head in `complementsPhrase` (`languages/fr/complementsPhrase.ts`) has no
continent case. It sends the proper noun through `deDet` → `dePrep`, which keeps the name's fixed
article.

| Source | Now | Want |
|---|---|---|
| EUROPE | `le chat vient de l'Europe.` | `le chat vient d'Europe.` |
| AFRICA | `le chat vient de l'Afrique.` | `le chat vient d'Afrique.` |
| NORTH_AMERICA | `le chat vient de l'Amérique du Nord.` | `le chat vient d'Amérique du Nord.` |
| AFRICA → EUROPE | `le chat vient de l'Afrique en Europe.` | `le chat vient d'Afrique en Europe.` |

Left out on purpose: ANTARCTICA, where `de l'Antarctique` is common usage (it is also treated as a
masculine region), and the `loin de l'Europe` of the self-propelled verbs (RUN), where the article is
normal.

**Existing passing tests pin the wrong output:** `complements/direction.test.ts` line 293
(`le chat vient de l'Europe.`, in *a continent SOURCE keeps its article — the drop is goal-only*) and
line 306 (`le chat vient de l'Afrique en Europe.`). Both, and the comment above them, change with the
fix.

## Shape of the fix

In the `source` branch, check `nf['isA'] === 'CONTINENT'` the way `direction` already does. For a
continent, return `elidesBefore(nf, lead) ? "d'" : 'de'` with no article. Decide ANTARCTICA
explicitly.

| | |
|---|---|
| **Test** | `complements/source.test.ts` → *known bugs: French continent source* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed. The `source` head in
[`complementsPhrase.ts`](../../../packages/engine/src/languages/fr/complementsPhrase.ts) now returns a
bare `de` for a continent, elided by `elidesBefore` (`d'Europe`). Three cases keep the article:

- **Masculine continents:** only `Antarctique` is seeded. The rule applies to feminine continents
  alone, so it keeps `de l'Antarctique` as the bug file recommended.
- **`loin de`:** a self-propelled verb keeps `loin de l'Europe`.
- **Other nouns:** they still go through `deDet`.

Every row now renders as wanted. The fix also covers:

- ASIA (`d'Asie`);
- a coordinated source (`d'Europe et d'Afrique`);
- a transitive verb (`importe le livre d'Europe`).

The two passing tests in [`complements/direction.test.ts`](../../../packages/engine/test/complements/direction.test.ts)
that pinned `de l'Europe` and `de l'Afrique en Europe` now assert the bare form, with their names and
comment updated. Italian keeps `dall'Europa`.

A continent with an adjective also drops the article now (`d'Europe froide`, `de vieille Europe`). The
goal and the locative already do the same (`en vieille Europe`). Bringing the article back on a
modified continent would be a separate change covering all three.

- **Tests:** [`packages/engine/test/complements/source.test.ts`](../../../packages/engine/test/complements/source.test.ts)
  → *known bugs: French continent source*. The pinning `test.fails` is now a passing `test`. New cases
  cover ASIA, the group and the transitive verb, with guards for Antarctique, `loin de`, a common noun
  and a cause.
- Unit test: `complementsPhrase.test.ts` (fr).
