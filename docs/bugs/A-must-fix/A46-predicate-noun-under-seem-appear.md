# A46. A predicate NOUN under SEEM is rendered bare, as if the verb were BECOME

**Language:** English, German

The `predicative` complement renderer branches on the **complement head** — adjective vs noun —
and never on the **verb**:

```ts
// en.ts:433, de.ts:735, and the same shape in it/fr/es/pt
if (type === 'predicative') {
  return coordinate(c.phrase, (np) =>
    np.head.forms['role'] === 'adjective' ? enAdj(np.head) : npText(np),
  );
}
```

That is correct for `BECOME` and `BE`, where every language takes a bare predicate nominative
(`becomes a legend`, `wird eine Legende`, `diventa una leggenda`). `SEEM` licenses the same
complement and so inherits the same rendering — but the seeming verb does not admit a bare
predicate noun on the same terms. A predicate **adjective** is fine under all three verbs
(`seems tired`, `scheint müde`, `sembra stanco`); only the **nominal** complement is affected.

| | Now | Want |
|---|---|---|
| English | `the cat seems a legend.` | `the cat seems to be a legend.` |
| German | `der Kater scheint eine Legende.` | `der Kater scheint eine Legende zu sein.` |
| Italian | `il gatto sembra una leggenda.` | *(already correct)* |
| French | `le chat semble une légende.` | *(already correct)* |
| Spanish | `el gato parece una leyenda.` | *(already correct)* |
| Portuguese | `o gato parece uma lenda.` | *(already correct)* |

English `seems a legend` is archaic/literary, not ungrammatical; German `scheint eine Legende` **is**
ungrammatical — `scheinen` takes no predicate nominative at all and requires the infinitival copula
`zu sein`. Romance is already right: `sembrare` / `sembler` / `parecer` do license a bare predicate
noun. Japanese is already right (`伝説に思えます` — the に-marked predicate nominal).

## Shape of the fix

The predicative branch must consult the **governing verb** as well as the complement head, and in
en/de append an infinitival copula after the noun phrase (`to be …`, `… zu sein`) when the verb is
a seeming verb and the complement head is a noun. The predicate-adjective path is untouched.

The trigger is a property of the **verb**, not of the complement or the noun, so it belongs next to
the `predicative` branch in each language module and not in the noun-phrase machinery. A
`copula`-style form flag on the concept (as `BE` already carries) is the natural encoding: mark
which verbs are seeming verbs, and let each language decide whether it needs the repair.

## Why APPEAR is not part of this

The original report was the triple `I appear a bovine.` / `appaio un bovino.` /
`ich erscheine ein Rind.` — marginal in English and ill-formed in Italian and German. That turned
out to be a **corpus** defect rather than an engine one: `APPEAR` was seeded with a conflated gloss
("to come into view; to look or seem a certain way") and licensed `predicative`, while every
language's APPEAR lexeme (`apparire`, `apparaître`, `aparecer`, `erscheinen`) is strictly the
come-into-view verb, which takes no predicate nominative in any of them.

The two senses are now split at the corpus level:

- **SEEM** — *to look like; to give the impression of being similar to*. Keeps `predicative`.
- **APPEAR** — *to come into view; to become visible* (opposite: disappearing). Licenses
  `locative`, `cause`, `terminus` and **no** `predicative`, so the ill-formed strings are
  unreachable rather than repaired.

Japanese was also carrying the conflation lexically: `APPEAR` was 見える ("be visible / look like"),
which collides with the terminus に — `猫は犬に見えます` reads as *the cat looks like a dog*, not
"the cat appears to the dog". It is now 現れる, which keeps に unambiguously the witness.

| | |
|---|---|
| **Test** | `complements/predicative.test.ts` → *known bugs: a predicate NOUN under SEEM* (1 `test.fails`), plus *predicative is licensed by SEEM, not by APPEAR* pinning the split |
