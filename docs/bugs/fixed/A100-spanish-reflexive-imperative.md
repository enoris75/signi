# A100. The Spanish reflexive command has the wrong clitic, in the wrong place

**Language:** Spanish

`imperativeForm` (`mood.ts`) derives every Spanish command from stored forms, and for BECOME
(`volverse`) those carry a clitic:

- the affirmative tú form is `3sg_present`, i.e. `se vuelve`;
- the subjunctive persons (every negative, plus the affirmative nosotros) come from `1sg_present`
  minus `-o`, i.e. `me vuelv-`;
- vosotros is `base` minus `-r` plus `-d`, and `volverse` doesn't end in `-r`, so it stays
  `volverse`.

The clitic must be the addressee's (te / nos / os). It goes in front of a negative command and is
attached to an affirmative one, which then takes a written accent. Before `nos` the 1st plural drops
its `-s`, and before `os` the 2nd plural drops its `-d`.

| Command | Now | Want |
|---|---|---|
| tú | `se vuelve una leyenda.` | `vuélvete una leyenda.` |
| tú, negative | `no me vuelvas una leyenda.` | `no te vuelvas una leyenda.` |
| vosotros | `volverse una leyenda.` | `volveos una leyenda.` |
| nosotros | `me vuelvamos una leyenda.` | `volvámonos una leyenda.` |
| nosotros, negative | `no me vuelvamos una leyenda.` | `no nos volvamos una leyenda.` |
| vosotros, negative | `no me vuelváis una leyenda.` | `no os volváis una leyenda.` |

The last three rows also need A103 (Spanish subjunctive stem), because the stem is `volv-`, not `vuelv-`.
They are not pinned. Already right: the instruction register and the infinitive (`volverse una
leyenda.`).

## Shape of the fix

Derive the command from the non-reflexive verb: strip the clitic from the stored forms, and `-se`
from the base. Then place `ES_REFLEXIVE` for the addressee: in front of the verb in the negative,
attached in the affirmative. The affirmative needs the same attach-and-accent rule as A70
(Romance clitic enclisis), plus the `-s`/`-d` loss before `nos`/`os`.

| | |
|---|---|
| **Test** | `imperative.test.ts` → *known bugs: Spanish reflexive imperative* (2 `test.fails`) |

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed, in three pieces:

- **Plain verb.** The new [`nonReflexiveVerb.ts`](../../../packages/engine/src/languages/es/nonReflexiveVerb.ts)
  strips `-se` from the base and the leading clitic from every stored form. `imperativeForm` then
  derives the command as for a plain verb: `vuelve`, `volved`.
- **Clitic placement.** In the imperative branch of [`predicateText.ts`](../../../packages/engine/src/languages/es/predicateText.ts),
  the addressee's clitic comes from `reflexiveClitic`, ahead of any object clitic. It goes in front
  of a negative command (`no te vuelvas`) and is attached to an affirmative one through `esEnclitic`
  (`vuélvete`). The instruction register keeps the citation infinitive.
- **Letter loss.** [`esEnclitic.ts`](../../../packages/engine/src/languages/es/esEnclitic.ts) now drops
  the 1st plural's `-s` before `nos` and the 2nd plural's `-d` before `os` (`volvámonos`, `volveos`),
  after placing the accent.

Both pinned tests pass: `no te vuelvas una leyenda.`, `vuélvete una leyenda.`, `volveos una leyenda.`.
The unpinned rows now have the right clitic and place, but still show the A103 stem: `vuelvámonos`,
`no nos vuelvamos`, `no os vuelváis`. A regular verb shows the full pattern: `lávate`, `lavémonos`,
`lavaos`, `no te laves`, `no nos lavemos`, `no os lavéis`.

These are unchanged:
- the instruction register (`volverse`, `no volverse`);
- the infinitive;
- the finite forms (`me vuelvo`);
- a plain verb's enclitics (`comámoslo`, `vednos`).

- **Tests:** [`packages/engine/test/imperative.test.ts`](../../../packages/engine/test/imperative.test.ts)
  → *known bugs: Spanish reflexive imperative*. Both pinning `test.fails` are now passing `test`s. New
  cases cover `nunca` and the unchanged instruction, infinitive and finite forms, with a guard for a
  plain verb's enclitics.
- Unit tests: the new `nonReflexiveVerb.test.ts`, plus `esEnclitic.test.ts` and `predicateText.test.ts`
  (es). The `predicateText` case uses a regular reflexive verb, so it does not depend on A103.
