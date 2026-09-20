# C06. Grammatical-person pronoun definitions — FIRST / SECOND / THIRD_PERSON

**Blocked on:** a **definition tooltip surface in the pronoun picker.** The three definitions
themselves compose and render cleanly in all 7 languages (verified — see below); the block is purely
in the frontend: a pronoun's `definition` is never shown to a user, so there is no tooltip to author
against and the `/localize-seed` step-5 e2e assertion cannot be written.

Every picker renders its options through
[`ConceptOption`](../../../packages/frontend/src/components/PhraseBuilder/ConceptOption.tsx) — the
**sole** site that emits `data-concept` and reads `useConceptDefinition`, i.e. the only place the
composed definition surfaces as a hover tooltip. **Pronouns never reach it.** The subject picker is
the only picker that lists pronouns, and its pronoun tab
([`SubjectTypeahead.tsx`](../../../packages/frontend/src/components/PhraseBuilder/SubjectTypeahead.tsx),
the `tab === "pronoun"` branch) is a **person / number / gender toggle chooser**, not a
`ConceptOption` list. No other picker offers pronouns.

So although these are composable from seeded concepts (they would otherwise be A-class), they are not
completable as pure seed data: the localized definition has nowhere to appear, and there is no
`[data-concept="FIRST_PERSON"]` element for the tooltip spec to hover.

## What's needed

- A hoverable definition surface in the pronoun chooser — e.g. render each person option (or the
  committed pronoun) through a `ConceptOption`-style element that carries `data-concept={concept.id}`
  and a `useConceptDefinition` tooltip, the way the noun list does. Once that exists, all three become
  genuine A-tasks: add the `definition` to each pronoun seed in
  [`pronouns.ts`](../../../packages/backend/src/concepts/pronouns.ts) and cover it in
  [`e2e/definition-tooltip.spec.ts`](../../../e2e/definition-tooltip.spec.ts).

## Blocks

The three grammatical-person pronouns. Each is a definite genus + differentia gloss (a fixed,
identifiable category, so it reads with the definite article):

| id | plan | renders (en / it / de / es / fr / ja / pt) |
|---|---|---|
| FIRST_PERSON | `{ subject: { concept: 'PERSON_GRAMMAR', definiteness: 'definite', adjectives: ['FIRST'] } }` | the first person / la prima persona / die erste Person / la primera persona / la première personne / 第一の人称 / a primeira pessoa |
| SECOND_PERSON | `{ subject: { concept: 'PERSON_GRAMMAR', definiteness: 'definite', adjectives: ['SECOND'] } }` | the second person / la seconda persona / die zweite Person / la segunda persona / la deuxième personne / 第二の人称 / a segunda pessoa |
| THIRD_PERSON | `{ subject: { concept: 'PERSON_GRAMMAR', definiteness: 'definite', adjectives: ['THIRD'] } }` | the third person / la terza persona / die dritte Person / la tercera persona / la troisième personne / 第三の人称 / a terceira pessoa |

(FIRST_PERSON's 7-language render was verified live against the backend boot before this file was
written; PERSON_GRAMMAR, FIRST, SECOND, THIRD are all seeded. The gloss shape is sound — only the
frontend surface is missing.)

Until the pronoun tooltip surface exists, these stay on the English literal. Was catalogued as
A08–A10; reclassified to C when the frontend gap was found.

## Done

2026-09-20. Built the missing frontend surface, then localized all three as plain seed data.

**(a) Frontend — the pronoun definition surface.** The person row of the pronoun chooser
([`PronounChooser.tsx`](../../../packages/frontend/src/components/PhraseBuilder/PronounChooser.tsx))
now renders each option through a `PersonToggle`: a `ToggleButton` carrying `data-concept={concept.id}`
inside a `useConceptDefinition` `Tooltip`, the same hover definition
[`ConceptOption`](../../../packages/frontend/src/components/PhraseBuilder/ConceptOption.tsx) gives a
noun. Two things made this cheap rather than a rewrite:

- MUI's `ToggleButtonGroup` passes `value` / `selected` down by **context**, not by cloning its
  children, so a `Tooltip` may sit between the group and its button without breaking the toggle.
- The tooltip is `describeChild`. Without it MUI hangs the title on the child as an `aria-label` and
  the option stops being named "second" — the definition *describes* the person, it does not rename
  it. The unit test pins that.

The person → concept lookup moved out of `SubjectTypeahead.commitPronoun` into a shared
[`pronounFor`](../../../packages/frontend/src/components/PhraseBuilder/hooks/usePronounChooser.ts),
so the option's tooltip and the pronoun it commits cannot drift apart (the generic "one" shares
person 3 with THIRD_PERSON and must be matched by id — the one thing there was to get wrong).

**(b) Seed.** A `personGloss(ordinal)` helper in
[`pronouns.ts`](../../../packages/backend/src/concepts/pronouns.ts) — the definite genus + ordinal
the **Blocks** table above proposed, unchanged. Renders, live from the backend boot:

- **FIRST_PERSON** — en `the first person` · it `la prima persona` · de `die erste Person` ·
  es `la primera persona` · fr `la première personne` · ja `第一の人称` · pt `a primeira pessoa`
- **SECOND_PERSON** — en `the second person` · it `la seconda persona` · de `die zweite Person` ·
  es `la segunda persona` · fr `la deuxième personne` · ja `第二の人称` · pt `a segunda pessoa`
- **THIRD_PERSON** — en `the third person` · it `la terza persona` · de `die dritte Person` ·
  es `la tercera persona` · fr `la troisième personne` · ja `第三の人称` · pt `a terceira pessoa`

No engine change was needed — the gloss shape was already sound, as the file said.

**Coverage.** `e2e/definition-tooltip.spec.ts` hovers FIRST_PERSON and THIRD_PERSON in English and
SECOND_PERSON under a German UI; `packages/frontend/test/SubjectTypeahead.test.tsx` pins the
`data-concept` on all four options, the `describeChild` description, and that a person names no
concept while the pronouns have not loaded.

**Left for later.** GENERIC_PERSON now has the surface too but keeps its English literal
("one (generic person)"). Its gloss would be `personGloss('IMPERSONAL')` → "the impersonal person",
using the IMPERSONAL adjective already seeded for the chooser's own label — outside this task's
three, and worth judging on its own.
