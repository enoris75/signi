# C13. UI strings — conjunctions, spatial prepositions, cause connectors, degree words

**Kind:** hardcoded UI string. Once unblocked it becomes a [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts)
entry, driven by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** a catalog **entry kind for function words the engines build in context**. The catalog
can already cite one such word: a `determiner` entry calls `translateDeterminer` and cites the
determiner on a noun, because its form depends on that noun. These menus show words just as
context-dependent, and there is no citation for them.

| word class | depends on | examples |
|---|---|---|
| coordinating conjunction | what it joins (clauses vs nouns) | ja 〜と between nouns, そして between clauses; `then` carries its own adverb ("e poi", "und dann") |
| path specifier | the complement noun (gender, case, contraction) | it *in* / *nel* / *nella*; de *in* + dative vs accusative; ja 〜の中で |
| cause connector | sentiment and the noun | *a causa di* / *per colpa di* / *grazie a*; de *wegen* + genitive |
| comparative degree | the adjective (periphrastic vs synthetic) | it *più* / *il più*; de *-er* / *am -sten*; en *more* vs *-er* |

## Strings

| literal | where |
|---|---|
| And / Or / But / That is / Therefore / Then | `COORD_CONJUNCTION_OPTIONS` [interfaces.ts:13-18](../../../packages/frontend/src/components/PhraseBuilder/interfaces.ts#L13-L18) → conjunction menu ([ConjunctionMenu.tsx:32](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/ConjunctionMenu.tsx#L32)) and every `COORD_CONJUNCTION_LABEL` use ([CoordinationButton.tsx:28](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/CoordinationButton.tsx#L28), [periodAppearance.ts:93](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/functions/periodAppearance.ts#L93), [PhraseWorkspace.tsx:337](../../../packages/frontend/src/components/PhraseBuilder/PhraseWorkspace.tsx#L337)) |
| in / through / under / over / around / behind / in front of | `PATH_SPECIFIER_LABELS` [shared/index.ts:264](../../../packages/shared/src/index.ts#L264) → specifier tooltips ([Boxes.tsx:429](../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx#L429)) |
| Neutral — because of / Negative — fault of / Positive — thanks to | `CAUSE_SENTIMENT_LABELS` [shared/index.ts:287](../../../packages/shared/src/index.ts#L287) → sentiment tooltips ([Boxes.tsx:490](../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx#L490)) |
| — / More / Most / Less / Least / Equally | `DEGREE_LABELS` [shared/index.ts:120](../../../packages/shared/src/index.ts#L120) → degree chip ([phraseRender.tsx:355](../../../packages/frontend/src/components/PhraseBuilder/phraseRender.tsx#L355)) |

The *names* beside these words are ordinary adjectives and can be seeded now: the conjunction kinds
(copulative, disjunctive, …) are in [B21](../B-needs-seed/B21-ui-clause-and-coordination-vocabulary.md);
Neutral / Negative / Positive share NEUTRAL and POSITIVE with
[B22](../B-needs-seed/B22-ui-verb-feature-controls.md).

## To unblock

Add three entry kinds beside `UiStringDeterminerDef`, each with an engine citation function like
`translateDeterminer`:

1. `conjunction: CoordConjunction`: cite it between two clauses (the menu joins periods).
2. `specifier: Specifier` + `agreesWith` (a noun): cite the adposition on it, as a determiner is cited
   on NOUN.
3. `degree: Degree` + `agreesWith` (an adjective): cite the periphrasis, or the synthetic form's
   marker, on it.

Then author the labels, delete the four English label maps, and move their tests off the English.

## Tests that select on these literals

`Therefore` → `PeriodContainer/CoordinationButton.test.tsx`, `PeriodContainer/ConjunctionMenu.test.tsx`; `in front of` → `Boxes.test.tsx`, `VerbPhraseBuilder.test.tsx`;
`thanks to` → `complements.spec.ts`, `PhraseBuilder.test.tsx`; `Degree:` values → `phraseRender.test.tsx`,
`NounPhraseBuilder.test.tsx`, `VerbPhraseBuilder.test.tsx`, `PhraseBuilder.test.tsx`.
