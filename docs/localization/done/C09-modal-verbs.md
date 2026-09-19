# C09. Modal verbs — MUST, CAN, WILL

_(split out of [B08](B08-verb-definitions.md); filed as **C** — no amount of seeding
unblocks these.)_

## Blocked on

**An infinitive complement clause.** Every modal's definition takes another verb as its complement:

| verb | literal | shape needed |
|---|---|---|
| MUST | to be obliged to; necessity | copula + adjective + **infinitive complement** |
| CAN | to be able to; ability or permission | copula + adjective + **infinitive complement** |
| WILL | to want to; volition | verb + **infinitive complement** |

`PhrasePlan.infinitive` renders a *whole plan* as a citation form — it cannot yet appear as the
**complement of another verb** ("to be able **to do**"). That is a nesting capability in the plan
type and a surface in all seven engines, not a seeding gap.

The nouns exist or are trivially seedable (OBLIGATION, ABILITY, VOLITION), so a nominal fallback is
available if this is ever wanted cheaply:

| verb | fallback gloss | shape |
|---|---|---|
| MUST | to have obligation | `infinitiveGloss('HAVE', 'OBLIGATION')` — HAVE is seeded ([B12](B12-possession-verbs.md)); OBLIGATION is not |
| CAN | to have ability | `infinitiveGloss('HAVE', 'ABILITY')` |
| WILL | to have volition | `infinitiveGloss('HAVE', 'VOLITION')` |

Those are grammatically fine but read as stilted dictionary-ese in every language, and they lose the
complement that *is* the modal's meaning. **Recommendation: leave the modals on their English
literals** until nested infinitives land, rather than shipping the fallback.

## Done

2026-09-19. The nested infinitive landed, and all three modals are localized on it — the
recommendation above (the nominal fallback) was not taken.

### (a) Engine — the infinitive complement

A new **`PhrasePlan.infinitiveComplement`** ([packages/shared/src/index.ts](../../../packages/shared/src/index.ts)):
a subject-less clause (`InfinitiveComplement` — verb phrase, object, complements, and one of its own)
that the governing clause's predicate takes. Its subject is the governing clause's own (**subject
control**), so it is never spoken but still agrees a predicate adjective inside it ("la gatta desidera
essere attent**a**"). The translator resolves it recursively in the **`'infinitive'` mood**
([resolvePhrase.ts](../../../packages/engine/src/translator/functions/resolvePhrase.ts)), so it is
tenseless, aspectless and modal-free, exactly as a citation is.

**Which word links it is lexical, not structural.** The governor is the clause's predicate adjective
when it has one, else its verb, and its lexeme names the linker as **`infinitive_link`** (shared
[`infinitiveLink`](../../../packages/engine/src/functions/infinitiveLink.ts)): it *capace **di*** /
*obbligato **a***, fr *capable **de***, es/pt *capaz **de*** / *obligado **a***, and in Japanese the
particle after the nominalizing こと. A governor with none takes the bare infinitive (*desiderare
agire*). Adding a governing word is therefore a seed entry, not an engine change.

Per engine: **en** appends the clause, whose own "to" is the link every English governor takes;
**it/fr/es/pt** append the link plus the clause (Italian adds the euphonic *ad* before another *a*,
French elides *d'* before a vowel); **de** extraposes a zu-infinitive after a comma, behind the whole
verb-final tail ("fähig sein, zu handeln", separable *hinzuzufügen* via `zuInfinitive`); **ja** puts a
**こと clause ahead of the predicate**, marked with the governor's particle (行動すること**が**可能 /
行動すること**を**望む).

Two fixes the construct exposed, both in the citation:

- **Italian** agreed a citation's predicate adjective with the impersonal *si* the throwaway generic
  subject stands for — "essere attent**i**". A citation's subject is nobody, so it now takes the
  citation form, "essere attento"; under a real impersonal *si* the plural agreement stays
  ("si desidera essere felici").
- **Japanese** closed a copula citation politely (慎重**です**). It now closes in the plain written
  style, as a verb's citation closes on its dictionary form: a new `citation` `CopulaForm` — 慎重で
  ある / 大きい / 疲れている / 慎重ではない.

### (b) Seed + localize

Seeded: **ACT** (the general activity verb the three modals govern), **DESIRE** (the lexical wanting
verb, a state), **ABLE** and **OBLIGED** (the adjectives, the latter `transient` so es/pt predicate it
with *estar*). None is a modal's own lemma in any language, so no gloss repeats the word it defines.

| verb | plan | renders |
|---|---|---|
| MUST | `infinitiveGloss('BE', { predicate: 'OBLIGED', infinitive: 'ACT' })` | en *to be obliged to act* · it *essere obbligato ad agire* · fr *être obligé d'agir* · de *verpflichtet sein, zu handeln* · es *estar obligado a actuar* · ja 行動することが義務的である · pt *estar obrigado a agir* |
| CAN | `infinitiveGloss('BE', { predicate: 'ABLE', infinitive: 'ACT' })` | en *to be able to act* · it *essere capace di agire* · fr *être capable d'agir* · de *fähig sein, zu handeln* · es *ser capaz de actuar* · ja 行動することが可能である · pt *ser capaz de agir* |
| WILL | `infinitiveGloss('DESIRE', { infinitive: 'ACT' })` | en *to desire to act* · it *desiderare agire* · fr *désirer agir* · de *wünschen, zu handeln* · es *desear actuar* · ja 行動することを望む · pt *desejar agir* |

`infinitiveGloss` ([verbs/gloss.ts](../../../packages/backend/src/concepts/verbs/gloss.ts)) gained
`infinitive` (a verb id or a whole clause) and `predicate` (the copular genus's predicate adjective).

### Coverage and gaps

Unit: [packages/engine/test/infinitive-complement.test.ts](../../../packages/engine/test/infinitive-complement.test.ts)
(the three definitions in all seven languages, agreement with the controller, negation on either
clause, nesting, the two citation fixes, and the four new words' paradigms), plus colocated tests for
each engine's surface. e2e: the modal tooltip in `definition-tooltip.spec.ts`. The `@signi/engine`
and `@signi/shared` dists must be rebuilt for the backend to serve the new definitions.

Known gap: a **negated** Japanese こと clause inherits the citation's polite negative
(行動しませんこと) — that is [B13](../../bugs/B-can-fix/B13-japanese-plain-negative.md), not this
construct, and no definition uses it. The builder has no UI for an infinitive complement; it is a
plan-level construct the seed uses. The **inchoative** ("to begin to be —") and **causative** glosses
[C08](../C-needs-engine/C08-copular-and-genus-verbs.md) waits on now have the nesting half of what
they need.
