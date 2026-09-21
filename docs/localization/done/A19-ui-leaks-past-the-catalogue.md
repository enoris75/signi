# A19. UI strings — English that leaks past the catalogue

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries and two
call-site fixes, driven by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Ready:** every word is seeded and every plan is a shape the catalogue already uses. These are not
new surfaces. They are places where a translated UI still shows English because a lookup misses
(items 1–2) or a component reads an English source where a localized one exists (items 3–4). Items 1
and 2 postdate the 2026-09-13 sweep. That sweep missed items 3 and 4 because neither is a string
literal in a component.

**Done 2026-09-21**, all four items. See [Done](#done) for what landed differently.

## 1. The passive's agent: "Clear Agent", "Expand Agent" — done

In the passive, [`passiveCaptions`](../../../packages/frontend/src/components/PhraseBuilder/functions/visibleSlots.ts#L32-L39)
captions the subject box `slot.agent`, and [`roleGroups`](../../../packages/frontend/src/components/PhraseBuilder/graph.ts#L98-L110)
captions its dotted ring the same way. [canvasCommands.ts](../../../packages/frontend/src/components/PhraseBuilder/canvasCommands.ts#L23-L46)
finds a control's part through `PART_BY_LABEL_KEY`, which had no `slot.agent`, so three tooltips fell
back to `` `${verb} ${label}` `` with the English label, in every interface language:

| control | where | showed, in every language | key | plan |
|---|---|---|---|---|
| the agent box's clear button | [Boxes.tsx:161](../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx#L161), seated by [SatelliteControls.tsx:69](../../../packages/frontend/src/components/PhraseBuilder/SatelliteControls.tsx#L69) | Clear Agent | `action.clear.agent` | the `commandOnEach` family: `agent: { concept: 'AGENT_GRAMMAR', en: 'agent' }` in `CANVAS_PARTS`, `'agent'` in `CLEARABLE_PARTS` |
| the agent ring's collapse toggle | [GroupBox.tsx:107](../../../packages/frontend/src/components/PhraseBuilder/GroupBox.tsx#L107) | Collapse Agent / Expand Agent | `action.compact.agent`, `action.expand.agent` | `'agent'` in `COLLAPSIBLE_PARTS` |

**Verdict: done as planned.** `"slot.agent": "agent"` is in `PART_BY_LABEL_KEY`, and the English
fallback in [`collapseTitle`](../../../packages/frontend/src/components/PhraseBuilder/canvasCommands.ts#L72-L83)
says "Compact", as the catalog's COMPACT does. Making the tooltip right exposed that the toggle itself
did nothing on the agent's ring (see [Done](#done), item 3), which is fixed too.

## 2. The voice control: "Hide Diatesi" — done

The voice satellite ([rawSatellites.tsx:222-237](../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L222-L237))
has `labelKey: "satellite.voice"`, which `PART_BY_LABEL_KEY` also lacked. While its box is shown,
[`revealTitle`](../../../packages/frontend/src/components/PhraseBuilder/canvasCommands.ts#L60-L70)
(called from [Boxes.tsx:504](../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx#L504))
put the English verb in front of the localized noun: it "Hide Diatesi", ja "Hide 態". Tense and aspect
are the same kind of control and are in the family.

| key | plan |
|---|---|
| `action.show.voice`, `action.hide.voice` | `voice: { concept: 'VOICE', en: 'voice' }` in `CANVAS_PARTS`, `'voice'` in `REVEALABLE_PARTS`, `"satellite.voice": "voice"` in `PART_BY_LABEL_KEY` |

**Verdict: done as planned.** Only the hide form is ever on screen: like the tense and the aspect, the
voice always holds a value, so while its box is hidden the control names the value ("Diatesi: Passiva")
rather than offering to show it. `action.show.voice` exists because a family is one list of parts.

**Keep it from happening again: done.** [canvasCommands.test.ts](../../../packages/frontend/test/canvasCommands.test.ts)
walks every `labelKey` a control can carry, from the sources the canvas itself reads: the slots in
`ALL_SLOTS`, their `passiveCaptions`, `roleSlotFor`'s conjunct and owner dressings, the rings
`roleGroups` draws in both voices (which carry the boxed `COMPLEMENT_LABEL_KEYS`), and every satellite
control `buildSatelliteIcons` builds that shows and hides a box, which leaves out the direct toggles, the
links and the coordination control. Each key goes through the real `clearTitle` / `collapseTitle` /
`removeTitle` / `revealTitle`, so a key that is in the map but missing from the family fails as well.
At HEAD it fails on `slot.agent: Clear …`, `slot.agent: Collapse …` and `satellite.voice: Hide …`. With
the map fixed and the families not, it still fails on the same three.

## 3. The words panel's tooltips were the English seed descriptions — done

[ConceptPalette.tsx:57-59](../../../packages/frontend/src/components/ConceptPalette.tsx#L57-L59) titled
every word with `concept.description`, the English description from the seed ("domestic feline
animal"). Everywhere else a word is listed, the tooltip is the localized definition from
[`useConceptDefinition()`](../../../packages/frontend/src/i18n/useConceptLabel.ts#L36-L43)
([ConceptOption.tsx:29-32](../../../packages/frontend/src/components/PhraseBuilder/ConceptOption.tsx#L29-L32),
[PronounChooser.tsx:126-134](../../../packages/frontend/src/components/PhraseBuilder/PronounChooser.tsx#L126-L134)).
The words panel ([PhraseSidebar.tsx:248, 269](../../../packages/frontend/src/components/PhraseBuilder/PhraseSidebar.tsx#L248))
was the one list that still showed English, so no definition the `/localize-seed` track has shipped
since A01 reached it.

**Verdict: done as planned.** [ConceptPalette.tsx:36, 63](../../../packages/frontend/src/components/ConceptPalette.tsx#L36)
reads the hook, which falls back to `definitions.en` and then `description`. No catalog entry. CAT now
reads "a small mammal", it "un piccolo mammifero".

## 4. The page's title and language — done

[index.html:2](../../../packages/frontend/index.html#L2) is `<html lang="en">` and
[index.html:6](../../../packages/frontend/index.html#L6) was `<title>Signi — Semantic Translator</title>`,
and nothing updated either one:

- The tab title was English in every interface language, and its tagline no longer matched the
  header's (`app.payoff`, "semantic phrase creator").
- `lang` stayed `en` when the interface was Japanese. A screen reader then reads the page with an
  English voice, and when no font is named for a run of text, the browser uses `lang` to pick CJK
  glyph forms.

| what | proposal | shipped |
|---|---|---|
| `document.title` | `` `Signi — ${t('app.payoff')}` `` with the first letter capitalized, set in an effect in [`LanguageProvider`](../../../packages/frontend/src/i18n/LanguageContext.tsx) on each language change. "Signi" stays literal ([C15](C15-ui-literal-by-design.md)) | as proposed, but in an effect in [App.tsx:111-113](../../../packages/frontend/src/App.tsx#L111-L113), keyed on the rendered tagline |
| `document.documentElement.lang` | the interface language code, set in the same effect | [LanguageContext.tsx:34-36](../../../packages/frontend/src/i18n/LanguageContext.tsx#L34-L36), an effect on `uiLanguage` |

`index.html` stays the pre-boot default, its tagline now `Signi — Semantic phrase creator`.

**Verdict: done, the title in a different place** ([Done](#done), item 1).

## Probe renders

Rendered 2026-09-21 by the engine at this commit over an in-memory seed of the corpus (370 concepts),
through [`buildUiStrings`](../../../packages/backend/src/uiStrings.ts), formats applied. They match the
task's table exactly.

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `action.clear.agent` | Clear the agent | Cancella l'agente | Effacer l'agent | Das Agens löschen | Borrar el agente | Limpar o agente | 動作主を消去 |
| `action.expand.agent` | Expand the agent | Espandi l'agente | Étendre l'agent | Das Agens erweitern | Expandir el agente | Expandir o agente | 動作主を展開 |
| `action.compact.agent` | Compact the agent | Compatta l'agente | Compacter l'agent | Das Agens verdichten | Compactar el agente | Compactar o agente | 動作主を圧縮 |
| `action.show.voice` | Show the voice | Mostra la diatesi | Montrer la voix | Die Diathese zeigen | Mostrar la voz | Mostrar a voz | 態を見せ |
| `action.hide.voice` | Hide the voice | Nascondi la diatesi | Cacher la voix | Die Diathese verstecken | Esconder la voz | Esconder a voz | 態を隠し |
| `app.payoff` (existing) | semantic phrase creator | creatore di frasi semantiche | créateur de phrases sémantiques | Schöpfer semantischer Phrasen | creador de frases semánticas | criador de frases semânticas | 意味的なフレーズの創造者 |
| `slot.agent` (existing, for reference) | Agent | Agente | Agent | Agens | Agente | Agente | 動作主 |
| `satellite.voice` (existing, for reference) | Voice | Diatesi | Voix | Diathese | Voz | Voz | 態 |

The Japanese 見せ / 隠し stems are the house style of the shipped `action.show.tense` (時制を見せ,
bug [A126](../../bugs/fixed/A126-japanese-godan-su-instruction-label.md)).

## Tests that selected on these literals

The plan found none. There were two: `GroupBox.test.tsx` asserted the English collapse fallback
("Collapse Subject", now "Compact Subject"), and `App.test.tsx` the payoff's fallback ("Semantic phrase
builder", now "semantic phrase creator"). No test cleared the agent box, collapsed its ring or opened a
shown voice box, which is how items 1 and 2 went unnoticed, and how the collapse defect below did.

## Done

**2026-09-21.** Two `CANVAS_PARTS` in [uiStrings.ts](../../../packages/shared/src/uiStrings.ts), `agent`
(AGENT_GRAMMAR, in the clear and the expand / compact families) and `voice` (VOICE, in the show / hide
family), and their two keys in `PART_BY_LABEL_KEY`. Five new catalog keys, rendered in all seven:

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `action.clear.agent` | Clear the agent | Cancella l'agente | Effacer l'agent | Das Agens löschen | Borrar el agente | Limpar o agente | 動作主を消去 |
| `action.compact.agent` | Compact the agent | Compatta l'agente | Compacter l'agent | Das Agens verdichten | Compactar el agente | Compactar o agente | 動作主を圧縮 |
| `action.expand.agent` | Expand the agent | Espandi l'agente | Étendre l'agent | Das Agens erweitern | Expandir el agente | Expandir o agente | 動作主を展開 |
| `action.hide.voice` | Hide the voice | Nascondi la diatesi | Cacher la voix | Die Diathese verstecken | Esconder la voz | Esconder a voz | 態を隠し |
| `action.show.voice` | Show the voice | Mostra la diatesi | Montrer la voix | Die Diathese zeigen | Mostrar la voz | Mostrar a voz | 態を見せ |

The tab title is the header's tagline behind the literal brand:

| en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|
| Signi — Semantic phrase creator | Signi — Creatore di frasi semantiche | Signi — Créateur de phrases sémantiques | Signi — Schöpfer semantischer Phrasen | Signi — Creador de frases semánticas | Signi — Criador de frases semânticas | Signi — 意味的なフレーズの創造者 |

Changes against the plan:

1. **The title is set in `App`, not in `LanguageProvider`.** It is a function of the rendered tagline,
   and the tagline comes from the UI-string bundle, which can land after the language is chosen (a
   stored `ja` boots on the English fallback). So the effect sits where the header already reads
   `t('app.payoff')` and is keyed on that string, which catches the bundle arriving as well as a
   language change. `LanguageProvider` sets `lang`, which needs nothing but the language, and so stays
   usable without the query client its own tests render it without.
2. **`app.payoff`'s fallback now matches its render.** It was "Semantic phrase builder", so before the
   bundle landed the header said *builder* and then *creator*, and the new tab title would have
   flickered the same way. It is "semantic phrase creator" now, the English render (the header's CSS
   uppercases it, and the title capitalizes it).
3. **The agent's ring did not collapse, and the patient's collapsed the agent.** A01 renamed the rings'
   English `label` along with their captions (the subject's ring "Agent", the object's "Subject"). But
   `label` is a ring's identity: its collapse state (`COLLAPSIBLE_GROUPS`), its layout rank and its
   control keys are stored under it, which A15 kept language- and voice-independent on purpose. So the
   agent's compact toggle flipped its own icon and folded nothing, and the patient's folded the agent's
   satellites. The new e2e caught it. [`roleGroups`](../../../packages/frontend/src/components/PhraseBuilder/graph.ts#L98-L110)
   now swaps only the `labelKey`. In the passive, `data-group` stays "Subject" / "Direct Object", so
   A01's e2e now checks the box captions ("Agent", "Subject") rather than the ring names. A tidied
   passive keeps agent · verb phrase · patient in that order, as the boxes do. Before, the patient's ring
   read first and the agent's, whose name was unranked, last. Pinned in
   [graph.test.ts](../../../packages/frontend/test/graph.test.ts).
4. **`action.show.voice` is never on screen** (item 2's verdict). It ships because the family is one list,
   and the voice would need it the day it stops being always-valued.
5. **The guard test runs the title functions, not the map.** A test on `PART_BY_LABEL_KEY` alone would
   pass a key that is mapped to a part no family covers, which renders the same English. So each key
   goes through the function its control calls, and must come back as a catalog key.

Pinned by [canvasCommands.test.ts](../../../packages/frontend/test/canvasCommands.test.ts) (new: the
titles, the compact fallback and the guard), [uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts)
(the agent and voice commands, `action.clear.agent` and `action.hide.voice` in all seven),
[graph.test.ts](../../../packages/frontend/test/graph.test.ts), `GroupBox.test.tsx`,
[ConceptPalette.test.tsx](../../../packages/frontend/test/ConceptPalette.test.tsx) (the tooltip is the
Italian definition, not the description), `LanguageContext.test.tsx` (`lang` follows the language) and
`App.test.tsx` (the title in en, it, ja). In e2e, [verb.spec.ts](../../../e2e/verb.spec.ts) drives a passive
in Italian: it hides and shows the voice box ("Nascondi la diatesi"), compacts and expands the agent's
ring and the patient's, each folding only its own determiner, and clears the agent ("Cancella
l'agente"). [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) hovers CAT in the words
panel in English and Italian. [language.spec.ts](../../../e2e/language.spec.ts) checks the tab title and
`<html lang>` in en, ja and fr.
