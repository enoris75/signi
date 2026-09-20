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
| This period is a command — turn it off | [MoodToggle.tsx:15](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/MoodToggle.tsx#L15) | `period.isCommand` + `action.turnOff` | joined with " — " at the call site: `PERIOD_SENTENCE this` + `BE` + `predicative: COMMAND indefinite`; `commandOf('TURN_OFF')` + `directObject: THIRD_PERSON neut` |
| This period is an infinitive phrase — turn it off | [MoodToggle.tsx:23](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/MoodToggle.tsx#L23) | `period.isInfinitive` + `action.turnOff` | same, `predicative: INFINITIVE_PHRASE indefinite` |
| Toggle imperative (command) (aria-label) | [MoodToggle.tsx:13](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/MoodToggle.tsx#L13) | reuse `imperative.command` | name the toggle by its mode and expose on/off with `aria-pressed`. No new wording, no seed |
| Toggle infinitive phrase (citation) (aria-label) | [MoodToggle.tsx:20](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/MoodToggle.tsx#L20) | reuse `infinitive.phrase` | same |

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
`PeriodContainer/MoodToggle.test.tsx`, `PeriodContainer/BorderControls.test.tsx`,
`PeriodContainer/PeriodContainer.test.tsx`; `Toggle infinitive` → `infinitive.spec.ts`,
`PhraseBuilder.test.tsx`, `PeriodContainer/MoodToggle.test.tsx`, `PeriodContainer/BorderControls.test.tsx`.
Move them to `getByRole('button', { name, pressed })` or a `data-testid`.

## Done

**2026-09-14.** Seeded TURN_OFF with the control verbs in
[transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts): en *turn off*, it *disattivare*,
fr *désactiver*, de *deaktivieren*, es *desactivar*, ja オフにする, pt *desativar* — the setting switched
off, not the lamp put out (it *spegnere*).

| key | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| `period.isCommand` | This period is a command | Questo periodo è un comando | Cette période est une commande | Dieses Satzgefüge ist ein Befehl | Este período es un comando | この文は命令です | Este período é um comando |
| `period.isInfinitive` | This period is an infinitive phrase | Questo periodo è una frase infinitiva | Cette période est une proposition infinitive | Dieses Satzgefüge ist eine Infinitivphrase | Este período es una frase de infinitivo | この文は不定詞句です | Este período é uma frase infinitiva |
| `action.turnOff` | turn it off | disattivalo | le désactiver | es deaktivieren | desactivarlo | それをオフに | desativá-lo |

The toggles' tooltips while on are `period.is… — action.turnOff`. Their aria-labels are `imperative.command`
and `infinitive.phrase`, with `aria-pressed` saying whether the mode is on.

Changes against the plan:
- **German TURN_OFF is *deaktivieren*.** *ausschalten* is separable, which renders right in the instruction
  but not in a finite clause ([A138](../../bugs/fixed/A138-german-add-is-arithmetic.md)).
- **English phrasal verbs move their particle after a pronoun object.** The probe gave "turn off it". An
  English verb form now names its `particle`, and `predicateParts` moves it across a lone pronoun object in
  every verb group: "turn it off", "has turned it off", "must turn it off", while a noun object keeps it by
  the verb ("turn off the option"). EXTINGUISH (*put out*) and TIDY_UP (*tidy up*) name theirs too.
- The object clitic under the instruction was checked in every language, as the task asked (table above).

Pinned by [objectPronoun.test.ts](../../../packages/engine/test/objectPronoun.test.ts) (*English phrasal verb
with a pronoun object*), `predicateParts.test.ts`, [uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts),
the frontend tests `MoodToggle`, `BorderControls`, `PeriodCard`, `PeriodContainer` and `PhraseBuilder`, and
[language.spec.ts](../../../e2e/language.spec.ts), which turns a command on in Italian.
