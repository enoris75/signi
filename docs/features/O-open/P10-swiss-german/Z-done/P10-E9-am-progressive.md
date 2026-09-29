# P10-E9. The *am* progressive — the one aspect `gsw` has and `de` does not

**Feature:** `aspect: 'progressive'` renders as *sii* + *am* + nominalised infinitive: *d Chatz isch
am Frässe*.
**Shape:** a real construction in `gsw`'s verb group, replacing `de`'s *gerade* adverb.
**Scope:** engine; `gsw` suite.
**Status:** **shipped, 2026-09-25** — see [Done](#done). Filed 2026-09-25 from P10 D9 and phase 2. Depends on E6 and E7.

| plan | `de` today | `gsw` *(verify)* |
|---|---|---|
| the cat is eating | der Kater frisst gerade. | d Chatz **isch am Frässe**. |
| the cat is eating the mouse | der Kater frisst gerade die Maus. | d Chatz **isch** d Muus **am Frässe**. |
| the cat was eating | der Kater fraß gerade. | d Chatz **isch am Frässe gsii**. |
| the cat is not eating | der Kater frisst gerade nicht. | d Chatz isch nöd am Frässe. |
| I know that the cat is eating | … dass der Kater gerade frisst. | … das d Chatz am Frässe isch. |

## Why

P10 D9: *"the one place `gsw` is richer than its parent, and it should get a real implementation
rather than being folded into the present."* It is also the one construction in the plan that tests
the engine's aspect abstraction by addition.

## Today

Verified at HEAD (7a392187), 2026-09-25. `de` renders the progressive as *gerade* over the plain
finite verb ([`verbGroup.ts:12`](../../../../../packages/engine/src/languages/de/verbGroup.ts#L12),
[`modalVerbGroup.ts:36`](../../../../../packages/engine/src/languages/de/modalVerbGroup.ts#L36),
[`renderClause.ts:338`](../../../../../packages/engine/src/languages/de/renderClause.ts#L338)).

## Design

### D1. The form

The infinitive is nominalised: capitalised (*am Frässe*), and a separable particle joins it (*am
Zruggcho*). **Recommendation:** derive it from the `base` form, capitalise per E3's style sheet, and
join the particle — no new form key.

### D2. Where the object goes

Between *isch* and *am* (*isch d Muus am Frässe*), not inside the *am*-phrase. **Open point:**
whether a pronoun object stays there (*isch si am Frässe*) — E14 rules.

### D3. Transitivity limits

The *am* progressive is natural with activities and marginal with states (*ich bi am Wüsse* is
wrong). **Recommendation:** render it for every verb the plan offers the aspect on, and let E14
list the verbs where it should fall back to the present; do not invent a lexical flag before the
review says it is needed.

## Tests

The table above, plus a particle verb, a modal (*ich mues am Schaffe sii*, *verify*), and the future
(= present progressive, per E8).

## Out of scope

The progressive in other languages.

## Done

Shipped 2026-09-25, D1–D3 as recommended. `amInfinitive` capitalises the `base` and joins its particle
(*am Frässe*, *am Zruggchoo*); the *am*-phrase is clause-final, so an object stands between *isch* and
*am* (*isch d Muus am Frässe*) — a pronoun object too, pending E14 (D2). The past closes on *gsii*, a
verb-final clause on the finite verb (*… das d Chatz am Frässe isch*), a modal keeps it (*ich mues am
Schaffe sii*), the future is the present progressive. Rendered for every verb (D3); the stative ones
E14 lists will fall back.
