# A199. Spanish and Portuguese use *ser* in a place relative clause

**Languages:** Spanish, Portuguese

[A47](../fixed/A47-spanish-portuguese-ser-vs-estar.md) settled the locative copula: a place is
`estar`, unconditionally, whatever the spatial relation — `el gato **está** en la casa`, `o gato
**está** na casa`. Relativise that place and both languages fall back to `ser`. *The slot where the
cursor is* comes out `el slot donde el cursor **es**` / `o slot onde o cursor **é**`, which is the
copula of identity and reads as "the slot that the cursor is".

The choice is made in [`predicateText`](../../../packages/engine/src/languages/es/predicateText.ts)
(and its Portuguese twin, [`pt/predicateText`](../../../packages/engine/src/languages/pt/predicateText.ts)),
off the complements it is handed:

```ts
const locative = complements?.locative ?? (elided?.type === 'locative' ? elided.complement : undefined);
const locativeAlone = !!locative && !predicative;
```

In a relative clause the locative is the **gap**. It is not in `rel.complements` — it is the head
itself, and [`withRelative`](../../../packages/engine/src/languages/es/withRelative.ts) renders it
separately as the relativizer, either the relative adverb (`isPlainLocativeGap` → `donde` / `onde`)
or the complement's preposition (`relativeGapComplement` → `debajo de la que`). `predicateText` is
then handed a clause with no locative in it and picks `ser`. The same relative clause built with a
locative *complement* rather than a locative gap is right (`el gato que **está** en la casa corre.`),
which is what localises the defect to the gap.

| Case | Language | Now | Want |
|---|---|---|---|
| the SLOT where the CURSOR is, is | Spanish | `el slot donde el cursor es es.` | `el slot donde el cursor está es.` |
| | Portuguese | `o slot onde o cursor é é.` | `o slot onde o cursor está é.` |
| … as the subject of BURN | Spanish | `el slot donde el cursor es arde.` | `el slot donde el cursor está arde.` |
| | Portuguese | `o slot onde o cursor é arde.` | `o slot onde o cursor está arde.` |
| the HOUSE where the CAT is burns | Spanish | `la casa donde el gato es arde.` | `la casa donde el gato está arde.` |
| | Portuguese | `a casa onde o gato é arde.` | `a casa onde o gato está arde.` |
| … past | Spanish | `la casa donde el gato era arde.` | `la casa donde el gato estaba arde.` |
| | Portuguese | `a casa onde o gato era arde.` | `a casa onde o gato estava arde.` |
| … negative | Spanish | `la casa donde el gato no es arde.` | `la casa donde el gato no está arde.` |
| | Portuguese | `a casa onde o gato não é arde.` | `a casa onde o gato não está arde.` |
| the HOUSE **under** which the CAT is | Spanish | `la casa debajo de la que el gato es arde.` | `la casa debajo de la que el gato está arde.` |
| | Portuguese | `a casa debaixo da qual o gato é arde.` | `a casa debaixo da qual o gato está arde.` |
| … in the object slot | Spanish | `el perro ve la casa donde el gato es.` | `el perro ve la casa donde el gato está.` |
| | Portuguese | `o cão vê a casa onde o gato é.` | `o cão vê a casa onde o gato está.` |

Every **Want** was rendered by a trial fix applied to HEAD in this worktree and then reverted, not
written by hand. The past is the imperfect (`estaba` / `estava`), which A130's state-verb rule gives
for free once `estar` is selected — the same form the main clause already produces (`el gato estaba
en la casa.`).

**Already right.** The main clause A47 fixed, in every tense (`el gato está en la casa.`, `o gato
está na casa.`, `el gato estaba en la casa.`). A relative clause whose locative is a **complement**
rather than the gap (`el gato que está en la casa corre.`, `o gato que está na casa corre.`). A
relative clause with a predicate nominal, which keeps `ser` (`el gato que es una leyenda corre.`). A
locative gap over any other verb (`la casa donde el gato come arde.`, `um lugar onde se mora.`). The
relativizer itself, in both shapes (`donde` / `onde`, `debajo de la que` / `debaixo da qual`). The
other five languages' copula (`the house where the cat is`, `das Haus, in dem der Kater ist`,
猫がいる家, which takes the existential いる).

**Shipped strings.** None is wrong, because C22 wrote around this defect rather than ship it.
[`help.keyWorks`](../../../packages/shared/src/uiStrings.ts) says the comment out loud: *"HAVE, not
BE in a place relative ('the slot where the cursor is'): Spanish and Portuguese render that one with
ser, 'donde el cursor es'."* The string ships as `a key works in the slot that **has** the cursor` /
`una tecla funciona en el slot que tiene el cursor`. The place glosses that do use a locative gap
([`whereGloss`](../../../packages/backend/src/concepts/nouns.ts), B32/C07) are all over lexical verbs
— `un lugar donde se vive`, `um lugar onde se mora` — so none of them reaches the copula. When this
is fixed, `help.keyWorks` can be reconsidered on its merits rather than on the engine's.

Found by an agent localizing; verified at 80b21ff.

## Shape of the fix

Verified by applying it to HEAD and reverting it. It renders every **Want** above and leaves the
whole suite green: nothing pins `donde … es`, so no passing test moves.

`predicateText` has to be told that the clause predicates a place even though the place is not in
its complements. The trial threads the gap's role down as one optional parameter:

- `predicateText` (es and pt) takes a trailing `gapComplement?: ComplementType` and reads
  `const locativeAlone = (!!locative || gapComplement === 'locative') && !predicative;`. Every branch
  below already builds its verb group out of `copulaVerb`, so the non-finite forms, the negation and
  the mood follow without further change.
- [`es/withRelative`](../../../packages/engine/src/languages/es/withRelative.ts) and
  [`pt/withRelative`](../../../packages/engine/src/languages/pt/withRelative.ts) pass `rel.headRole`
  in their `predicateFor` helper. `RelativeClause.headRole` is
  `'subject' | 'directObject' | 'possessor' | ComplementType`, so the fix wants a narrowing rather
  than the trial's cast — a small `relativeGapType(rel)` in
  [`functions/`](../../../packages/engine/src/functions/) beside `relativeGapComplement`, returning
  the `ComplementType` or `undefined`, would serve both engines and read better than a raw role.

**Decisions for the fixer:**

- **The other `estar` frame.** A transient predicate adjective also selects `estar`, and a
  `predicative` gap ("the legend the cat becomes") is a gap the same way a locative one is. It takes
  no preposition and renders like a direct object, so `relativeGapComplement` excludes it and
  `predicative` is likewise absent from `rel.complements`. A `headRole: 'predicative'` relative on
  BE with a transient adjective head would pick `ser` for the same reason. Not reachable from the
  builder today (a predicative gap over BE is a tautology), and not pinned.
- **`elided`.** A121's elided subject complement is read from `verbPhrase.elided`, not from
  `complements`, and is untouched by this.

## Closing note — the Romance word order, a separate concern

`dove il cursore è`, `où le curseur est`, and after this fix `donde el cursor está`, `onde o cursor
está`, all strand the copula at the end of the clause. The unmarked order after a relative adverb
inverts the subject: **it** `dove è il cursore`, **fr** `où est le curseur`, **es** `donde está el
cursor`, **pt** `onde está o cursor`. In Italian and French the stranded copula is not merely marked
but ill-formed; in Spanish and Portuguese it is grammatical and stilted.

Those four forms are **hand-written**: no trial rendered them. They are recorded here rather than
opened as an id of their own because they are a different defect on a different axis — subject
inversion after a relativizer, in four languages, over *any* short predicate, not the lexical choice
between two copulas in two languages. They do not overlap: the fix above changes `es` to `está` and
leaves the order exactly as it is, and an inversion fix would leave `es` exactly as it is. Whoever
opens that one should check the other relativizers (`que` + a short predicate, `cuyo`) and the other
short verbs, not just BE, and should note that German already inverts by rule (`das Haus, in dem der
Kater ist`) and Japanese has no order to choose.

| | |
|---|---|
| **Test** | `relative.test.ts` → *known bugs: Spanish and Portuguese use ser in a place relative clause* (1 `test.fails`, plus a regression test for the main clause, a locative complement inside a relative clause, a predicate nominal, a lexical verb under the gap and the other five languages) |
