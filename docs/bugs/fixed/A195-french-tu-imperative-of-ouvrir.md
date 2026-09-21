# A195. The French tu imperative of an -ir verb is conjugated like an -er verb

**Language:** French

The French *tu* imperative is the second-person singular present, and it drops that form's final
*-s* — but only where the form ends in *-es*. That is the *-er* paradigm (*tu manges* → *mange*),
and with it the small *ouvrir / offrir / couvrir / souffrir / cueillir* class, which takes *-er*
endings on an *-ir* infinitive: *tu ouvres* → ***ouvre***. An *-ir* or *-re* verb whose 2sg ends in
*-is* or *-s* keeps it: *tu choisis* → *choisis*, *tu cours* → *cours*.

[`imperativeForm`](../../../packages/engine/src/mood.ts) keys the drop off the **infinitive**
instead of off the form: `base.endsWith('er') ? two.replace(/s$/, '') : two`. *ouvrir* does not end
in *-er*, so it keeps the *-s* it should lose and the command reads `ouvres le livre.`

**The corpus has exactly one verb in the class.** Of the 117 French verbs seeded, two have a
non-*-er* infinitive and an *-es* second-person singular: OPEN (*ouvrir* / *ouvres*) and BE (*être*
/ *es*). BE never reaches the rule — `FR_IMP_OVERRIDE` gives it the suppletive *sois*. So OPEN is
the whole of the defect today, and the other verbs named above are what it will catch when they are
seeded.

| Case | Now | Want |
|---|---|---|
| OPEN the BOOK, request register | `ouvres le livre.` | `ouvre le livre.` |
| … negative | `n'ouvres pas le livre.` | `n'ouvre pas le livre.` |
| … a feminine object | `ouvres la parenthèse.` | `ouvre la parenthèse.` |
| … a clitic object | `ouvres-le.` | `ouvre-le.` |

Every **Want** was rendered by a trial fix applied to HEAD, not written by hand, and reverted after.

**Already right.** The instruction register, which is the infinitive (`ouvrir le livre.`). The
plural addressee (`ouvrez le livre.`) and the 1pl (`ouvrons le livre.`), both taken straight from
the present. The plain declarative 2sg, which *keeps* its *-s* (`tu ouvres le livre.`, `tu dois
ouvrir le livre.`). Every *-er* verb (`ferme le livre.`, `mange le livre.`). Every *-ir* / *-re*
verb whose 2sg ends in *-is* or *-s* (`choisis le livre.`, `cours.`). The overridden forms (`sois
heureux.`, `va.`). The other six languages (`open the book.`, `apri il libro.`, `öffne das Buch.`,
`abre el libro.`, `abra o livro.`, `本を開いてください。`).

**Nothing shipped shows it.** The 5,180 strings the app ships — every concept `definition` and every
UI string, in all seven languages — render byte-identically at HEAD and under the trial fix. C21's
own "Open a bracket with a command" hint is in the *instruction* register, the infinitive (*Ouvrir
une parenthèse avec une commande*), which the defect does not touch.

The suite already works around it:
[`console-diagnostics.test.ts`](../../../packages/engine/test/console-diagnostics.test.ts) asserts
the OPEN command with `toMatchObject` and leaves French out, with a comment naming this exact
defect. Fixing it means adding `fr: 'ouvre le livre.'` back to that case and dropping the comment.

Found while probing for [C21](../../localization/done/C21-ui-console-diagnostics.md) ("Found while
probing, outside this task's lane"), which reported it for the catalogue without filing it.

## Shape of the fix

Verified by applying it to HEAD. It renders every **Want** above, leaves `npm run typecheck` and the
whole unit suite green (8,808 passing, 23 expected failures), and moves no passing test.

In the `fr` branch of [`imperativeForm`](../../../packages/engine/src/mood.ts), read the drop off
the form the imperative is actually built from, not off the infinitive:

```ts
const two = f['2sg_present'] ?? '';
return two.endsWith('es') ? two.replace(/s$/, '') : two; // an -es 2sg drops its -s
```

**Decisions for the fixer:**

- **Form or class?** The trial tests the form (`two.endsWith('es')`), which is the rule as French
  grammars state it and needs no list of verbs. Testing the infinitive against the class
  (`/(?:ouv|off|couv|souff)rir$|cueillir$/`) would work too and says more plainly *which* verbs are
  meant. The form test also quietly covers BE, whose `es` would otherwise be a lone exception — but
  BE never reaches the rule, so nothing turns on that.
- **The *-s* before *y* and *en*.** French restores the dropped *-s* for the liaison (*vas-y*,
  *manges-en*). Neither *y* nor *en* is in the model, so there is nothing to restore it before.
  Unaffected either way; not pinned.

| | |
|---|---|
| **Test** | `imperative.test.ts` → *known bugs: the French tu imperative of an -ir verb conjugated like an -er verb* (1 `test.fails` covering the request register, the negative, a feminine object and a clitic object — plus a regression test for the instruction register, the other persons, the declarative 2sg, the *-er* and *-is* verbs, the overrides and the other six languages) |

## Resolved

2026-09-21. Took the shape above.

The `fr` branch of [`imperativeForm`](../../../packages/engine/src/mood.ts) reads the drop off the
form the imperative is built from rather than off the infinitive:

```ts
const two = f['2sg_present'] ?? '';
return two.endsWith('es') ? two.replace(/s$/, '') : two; // an -es 2sg drops its -s
```

The **Decisions for the fixer** were ruled as follows:

- **Form, not class.** The form test is the rule as French states it and needs no list of verbs.
  Confirmed against the corpus before the change: of the 117 seeded French verbs, exactly three
  part company with their infinitive's class — *aller* (*vas*), *ouvrir* (*ouvres*) and *être*
  (*es*) — and `FR_IMP_OVERRIDE` takes *aller* and *être* before the rule is reached, so the only
  behaviour that moves is *ouvrir*'s.
- **The *-s* before *y* and *en*:** nothing to do. Neither is in the model.

The function's doc comment now states the rule as the form's, and names the *ouvrir / offrir /
couvrir / souffrir / cueillir* class the fix will catch when those verbs are seeded.

**Tests guarding it.** `packages/engine/test/imperative.test.ts` → *known bugs: the French tu
imperative of an -ir verb conjugated like an -er verb*: the former `test.fails` is now a plain
passing test, with its assertions unchanged (the request register, the negative, a feminine object
and a clitic object), beside its regression test. Added there: the rule across the seeded
paradigms — OPEN and CREATE drop the *-s*, SEE, READ, WRITE and BITE keep it, HAVE takes its
override.

`packages/engine/src/mood.test.ts` gains an *imperativeForm (fr)* block covering the same rule at
unit level, the negative and the other two persons, and `FR_IMP_OVERRIDE` winning for *être* and
*aller*.

`packages/engine/test/console-diagnostics.test.ts` — the C21 command case that left French out with
a comment naming this defect now asserts all seven languages with `toEqual`, French included
(`ouvre le livre.`). No other passing test changed its expectation.
