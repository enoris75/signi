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
