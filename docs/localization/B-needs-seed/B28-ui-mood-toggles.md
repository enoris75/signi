# B28. UI strings — the command and infinitive toggles

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** TURN_OFF is not seeded. The rest of what these two toggles say while *on* is ready:
BE + predicative renders "this period is a command" in all 7 languages (probe, 2026-09-13).

## Seed first

| concept | role | gloss | note |
|---|---|---|---|
| TURN_OFF | verb, transitive | to stop a device or setting from working | German is separable (*ausschalten*); the instruction register renders the infinitive, so the prefix stays attached |

## Unlocks

| literal | where | key | plan |
|---|---|---|---|
| This period is a command — turn it off | [PeriodContainer.tsx:491](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L491) | `period.isCommand` + `action.turnOff` | joined with " — " at the call site: `PERIOD_SENTENCE this` + `BE` + `predicative: COMMAND indefinite`; `commandOf('TURN_OFF')` + `directObject: THIRD_PERSON neut` |
| This period is an infinitive phrase — turn it off | [PeriodContainer.tsx:521](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L521) | `period.isInfinitive` + `action.turnOff` | same, `predicative: INFINITIVE_PHRASE indefinite` |
| Toggle imperative (command) (aria-label) | [PeriodContainer.tsx:500](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L500) | reuse `imperative.command` | name the toggle by its mode and expose on/off with `aria-pressed`. No new wording, no seed |
| Toggle infinitive phrase (citation) (aria-label) | [PeriodContainer.tsx:530](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer.tsx#L530) | reuse `infinitive.phrase` | same |

Check the object pronoun on authoring. Nothing in the catalog yet puts a pronoun object under an
`instruction` imperative (it *disattivalo*, fr *le désactiver*, es *desactivarlo* each attach or
place the clitic differently).

What the toggles say while *off* or *disabled* ("Make this period a command", "Remove the IF /
coordination link to make this a command") needs an object complement and a purpose clause:
[C12](../C-needs-engine/C12-ui-purpose-and-object-complements.md).

## Probe renders

| plan | en | it | de | ja |
|---|---|---|---|---|
| PERIOD_SENTENCE this + BE + predicative COMMAND | this period is a command | questo periodo è un comando | dieses Satzgefüge ist ein Befehl | この文は命令です |

## Tests that select on these literals

`Toggle imperative` → `infinitive.spec.ts`, `tidy.spec.ts`, `imperative.spec.ts`, `PhraseBuilder.test.tsx`,
`PeriodContainer.test.tsx`; `Toggle infinitive` → `infinitive.spec.ts`, `PhraseBuilder.test.tsx`,
`PeriodContainer.test.tsx`. Move them to `getByRole('button', { name, pressed })` or a `data-testid`.
