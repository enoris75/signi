# A19. UI strings — English that leaks past the catalogue

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries and two
call-site fixes, driven by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Ready:** every word is seeded and every plan is a shape the catalogue already uses. These are not
new surfaces. They are places where a translated UI still shows English because a lookup misses
(items 1–2) or a component reads an English source where a localized one exists (items 3–4). Items 1
and 2 postdate the 2026-09-13 sweep. That sweep missed items 3 and 4 because neither is a string
literal in a component.

## 1. The passive's agent: "Clear Agent", "Expand Agent"

In the passive, [`passiveCaptions`](../../../packages/frontend/src/components/PhraseBuilder/functions/visibleSlots.ts#L33)
captions the subject box `slot.agent`, and [graph.ts:102-106](../../../packages/frontend/src/components/PhraseBuilder/graph.ts#L102-L106)
names its dotted ring the same way. [canvasCommands.ts](../../../packages/frontend/src/components/PhraseBuilder/canvasCommands.ts#L20-L41)
finds a control's part through `PART_BY_LABEL_KEY`, which has no `slot.agent`, so three tooltips fall
back to `` `${verb} ${label}` `` with the English label, in every interface language:

| control | where | shows today, in every language | key | plan |
|---|---|---|---|---|
| the agent box's clear button | [Boxes.tsx:161](../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx#L161) | Clear Agent | `action.clear.agent` | the `commandOnEach` family: `agent: { concept: 'AGENT_GRAMMAR', en: 'agent' }` in `CANVAS_PARTS`, `'agent'` in `CLEARABLE_PARTS` |
| the agent ring's collapse toggle | [GroupBox.tsx:107](../../../packages/frontend/src/components/PhraseBuilder/GroupBox.tsx#L107) | Collapse Agent / Expand Agent | `action.compact.agent`, `action.expand.agent` | `'agent'` in `COLLAPSIBLE_PARTS` |

Then add `"slot.agent": "agent"` to `PART_BY_LABEL_KEY`. While you are there, make the English
fallback in `collapseTitle` say "Compact" rather than "Collapse". A15 put that control's words on
COMPACT, so the English should read the same whichever path renders it.

## 2. The voice control: "Hide Diatesi"

The voice satellite ([rawSatellites.tsx:222-235](../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L222-L235))
has `labelKey: "satellite.voice"`, which `PART_BY_LABEL_KEY` also lacks. While its box is shown,
[`revealTitle`](../../../packages/frontend/src/components/PhraseBuilder/canvasCommands.ts#L56-L65)
(called from [Boxes.tsx:504](../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx#L504))
puts the English verb in front of the localized noun: it "Hide Diatesi", ja "Hide 態". Tense and aspect
are the same kind of control and are in the family.

| key | plan |
|---|---|
| `action.show.voice`, `action.hide.voice` | `voice: { concept: 'VOICE', en: 'voice' }` in `CANVAS_PARTS`, `'voice'` in `REVEALABLE_PARTS`, `"satellite.voice": "voice"` in `PART_BY_LABEL_KEY` |

**Keep it from happening again.** A unit test should require every `labelKey` a control can carry
to name a part: the slots in `ALL_SLOTS`, their `passiveCaptions`, `roleSlotFor`'s owner caption, the
boxed `COMPLEMENT_LABEL_KEYS`, and each satellite's key that is neither a direct toggle nor a link.
A15 left the English fallback in place on purpose, for the parts no family covered yet (modal, tense,
aspect, the verb phrase, six complements), and B22 and B23 then brought all of those in. The agent and
the voice came later, with A01 (the passive voice, 2026-09-21), and nothing failed.

## 3. The words panel's tooltips are the English seed descriptions

[ConceptPalette.tsx:57-59](../../../packages/frontend/src/components/ConceptPalette.tsx#L57-L59) titles
every word with `concept.description`, the English description from the seed. Everywhere else a word is
listed, the tooltip is the localized definition from
[`useConceptDefinition()`](../../../packages/frontend/src/i18n/useConceptLabel.ts#L36-L41)
([ConceptOption.tsx:29-32](../../../packages/frontend/src/components/PhraseBuilder/ConceptOption.tsx#L29-L32),
[PronounChooser.tsx:126-134](../../../packages/frontend/src/components/PhraseBuilder/PronounChooser.tsx#L126-L134)).
The words panel ([PhraseSidebar.tsx:248, 269](../../../packages/frontend/src/components/PhraseBuilder/PhraseSidebar.tsx#L248))
is the one list that still shows English, so every definition the `/localize-seed` track has shipped
since A01 is invisible there. There is no catalog entry to add. Swap the source to the hook, which
already falls back to `definitions.en` and then `description`.

## 4. The page's title and language

[index.html:2](../../../packages/frontend/index.html#L2) is `<html lang="en">` and
[index.html:6](../../../packages/frontend/index.html#L6) is `<title>Signi — Semantic Translator</title>`,
and nothing updates either one:

- The tab title is English in every interface language, and its tagline no longer matches the
  header's (`app.payoff`, "semantic phrase creator").
- `lang` stays `en` when the interface is Japanese. A screen reader then reads the page with an English
  voice, and when no font is named for a run of text, the browser uses `lang` to pick CJK glyph forms.

| what | proposal |
|---|---|
| `document.title` | `` `Signi — ${t('app.payoff')}` `` with the first letter capitalized, set in an effect in [`LanguageProvider`](../../../packages/frontend/src/i18n/LanguageContext.tsx) on each language change. "Signi" stays literal ([C15](../done/C15-ui-literal-by-design.md)) |
| `document.documentElement.lang` | the interface language code, set in the same effect |

Keep `index.html` as the pre-boot default, with its tagline changed to match `app.payoff`.

## Probe renders

Rendered 2026-09-21 by the engine source at HEAD over an in-memory seed of the corpus, through the
entry renderer [`buildUiStrings`](../../../packages/backend/src/uiStrings.ts) uses, with formats
applied. Re-verify on authoring.

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `action.clear.agent` | Clear the agent | Cancella l'agente | Effacer l'agent | Das Agens löschen | Borrar el agente | Limpar o agente | 動作主を消去 |
| `action.expand.agent` | Expand the agent | Espandi l'agente | Étendre l'agent | Das Agens erweitern | Expandir el agente | Expandir o agente | 動作主を展開 |
| `action.compact.agent` | Compact the agent | Compatta l'agente | Compacter l'agent | Das Agens verdichten | Compactar el agente | Compactar o agente | 動作主を圧縮 |
| `action.show.voice` | Show the voice | Mostra la diatesi | Montrer la voix | Die Diathese zeigen | Mostrar la voz | Mostrar a voz | 態を見せ |
| `action.hide.voice` | Hide the voice | Nascondi la diatesi | Cacher la voix | Die Diathese verstecken | Esconder la voz | Esconder a voz | 態を隠し |
| `app.payoff` (existing) | semantic phrase creator | creatore di frasi semantiche | créateur de phrases sémantiques | Schöpfer semantischer Phrasen | creador de frases semánticas | criador de frases semânticas | 意味的なフレーズの創造者 |

The Japanese 見せ / 隠し stems are the house style of the shipped `action.show.tense` (時制を見せ).

## Tests that select on these literals

None. No test clears the agent box, collapses its ring or opens a shown voice box, which is how items 1
and 2 went unnoticed. Add both to [verb.spec.ts](../../../e2e/verb.spec.ts#L81), which already drives the
passive, and assert the tooltips in a second language.
[ConceptPalette.test.tsx](../../../packages/frontend/test/ConceptPalette.test.tsx) builds its concepts with
`description` only, so give them `definitions` and assert the tooltip follows the language.
