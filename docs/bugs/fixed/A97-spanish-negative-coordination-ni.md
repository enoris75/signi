# A97. Spanish joins a group of negative conjuncts with "y" instead of "ni"

**Language:** Spanish

Under negation, Spanish links a group of `ningún` conjuncts after the verb with `ni`. The engine's
own comment in `predicateText` (`languages/es/predicateText.ts`) gives the target: "no veo ningún
niño ni ninguna niña". `coordinateElement` (`languages/es/coordinateElement.ts`) picks its link
only from the conjunction and the sound of the next word (`y`/`e`, `o`/`u`). It never learns that
the group is negative, so it always writes `y`. The concord `no` in front of the verb is already
right. Only the link is wrong.

| Clause | Now | Want |
|---|---|---|
| object, two conjuncts | `el gato no ve ningún ratón y ninguna vaca.` | `el gato no ve ningún ratón ni ninguna vaca.` |
| object, three conjuncts | `el gato no ve ningún ratón, ninguna vaca y ningún perro.` | `el gato no ve ningún ratón, ninguna vaca ni ningún perro.` |
| locative | `el gato no corre en ninguna casa y en ningún mercado.` | `el gato no corre en ninguna casa ni en ningún mercado.` |
| command | `no comas ningún ratón y ninguna vaca.` | `no comas ningún ratón ni ninguna vaca.` |

Not pinned:

- the `or` group (`no ve ningún ratón o ninguna vaca`), which also wants `ni`;
- a negative group as the subject, before the verb (`ningún ratón y ninguna vaca corren.`);
- a group mixing `ningún` with another determiner.

The last two have no settled target.

## Shape of the fix

Give `coordinateElement` a flag, or a second link function, for a negative group: link with `ni`
before a conjunct determined `no`, in every slot after the verb (`predicateText`'s direct object and
`complementsPhrase`'s generic branch). The commas between the earlier conjuncts stay as they are.

| | |
|---|---|
| **Test** | `negation.test.ts` → *known bugs: Spanish "ni" in a negative coordination* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed, with a flag.
[`coordinateElement.ts`](../../../packages/engine/src/languages/es/coordinateElement.ts) takes
`afterVerb`. When it is set and the last conjunct is determined `no`, the link is `ni`, whether the
conjunction is `and` or `or`. The commas between earlier conjuncts are unchanged. Two slots after the
verb pass the flag:

- the direct object in [`predicateText.ts`](../../../packages/engine/src/languages/es/predicateText.ts);
- the generic branch of [`complementsPhrase.ts`](../../../packages/engine/src/languages/es/complementsPhrase.ts).

Every row now renders as wanted. The fix also covers:

- the unpinned `or` group (`no ve ningún ratón ni ninguna vaca`);
- a relative clause, the infinitive (`no comer … ni …`) and a direction (`no va a ninguna casa ni a
  ningún mercado`).

The subject slot does not pass the flag, so a negative subject group before the verb still reads
`ningún ratón y ninguna vaca corren`. That output has no settled target and is not asserted either
way. An affirmative group under a negated verb keeps `y`.

- **Tests:** [`packages/engine/test/negation.test.ts`](../../../packages/engine/test/negation.test.ts)
  → *known bugs: Spanish "ni" in a negative coordination*. The pinning `test.fails` is now a passing
  `test`. New cases cover `o`, the relative, the infinitive and the direction, with a guard for an
  affirmative group.
- Unit test: `coordinateElement.test.ts` (es).
