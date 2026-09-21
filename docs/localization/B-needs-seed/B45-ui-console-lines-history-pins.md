# B45. UI strings — the console's lines, history and pins

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** the console works in *lines* that can be pinned, recalled from a history and completed,
and none of those words is seeded. With them, each string is a shape the catalogue already uses. The
one failure message is [C11](../done/C11-ui-failure-messages-passive.md)'s passive.

## Seed first

| concept | role | gloss | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|---|---|
| LINE | noun, count | a row of text typed as one command | line(s) | riga, -he (f) | ligne(s) (f) | Zeile, -n (f) | línea(s) (f) | linha(s) (f) | 行 |
| LIST | noun, count | items written one after another | list(s) | elenco, -chi (m) | liste(s) (f) | Liste, -n (f) | lista(s) (f) | lista(s) (f) | 一覧 |
| HISTORY | noun, mass | the lines typed before, in order | history | cronologia (f) | historique (m) | Verlauf (m) | historial (m) | histórico (m) | 履歴 |
| PIN | verb, transitive | to keep an item at the top of a list | pin | fissare | épingler | anheften | fijar | fixar | ピン留めする |
| UNPIN | verb, transitive | to stop keeping an item at the top | unpin | sbloccare | désépingler | lösen | desfijar | desafixar | ピン留めを外す |
| PINNED | adjective | kept at the top of a list | pinned | fissato | épinglé | angeheftet | fijado | fixado | ピン留め済み |
| UNPINNED | adjective | no longer kept at the top | unpinned | sbloccato | désépinglé | gelöst | desfijado | desafixado | ピン留め解除済み |
| RECENT | adjective | used a short time ago | recent | recente | récent | letzt- | reciente | recente | 最近の |
| COMPLETE | verb, transitive | to finish a word that has been started | complete | completare | compléter | vervollständigen | completar | completar | 補完する |
| APPLY | verb, transitive | to put a change into effect | apply | applicare | appliquer | anwenden | aplicar | aplicar | 適用する |

Forms are suggestions for the seed author. ROW ([B44](B44-ui-keyboard-movement-labels.md)) and LINE
share the Japanese 行 and the German *Zeile*. They are different concepts, a row of a list and a line
of text, so both are seeded. LIST also names the help sheet's word-picker section
([B41](B41-ui-help-overlay.md)).

## Unlocks

| literal | where | key | plan |
|---|---|---|---|
| Pin this line · Unpin this line (the transcript's pin) | [Transcript.tsx:104](../../../packages/frontend/src/console/Transcript.tsx#L104) | `action.pinLine`, `action.unpinLine` | `commandOf('PIN' / 'UNPIN')` + LINE this, `NAME_FORMAT` |
| pin this line, or the last one run (`/pin` and `/unpin`) | [commands.ts:743, 752](../../../packages/frontend/src/console/language/commands.ts#L743) | `descriptionKey`: the same two | the help page says what "or the last one run" adds |
| Pinned. · Unpinned. | [usePhraseConsole.ts:579](../../../packages/frontend/src/console/usePhraseConsole.ts#L579) | `toast.linePinned`, `toast.lineUnpinned` | LINE bare `[PINNED]` / `[UNPINNED]`, the `toast.phraseSaved` shape ("Pinned line") |
| history · {n} of {m} | [ConsolePrompt.tsx:380](../../../packages/frontend/src/console/ConsolePrompt.tsx#L380) | `console.history` | `nameOf('HISTORY')`. The position stays outside the phrase as figures, "3/7" (the [C14](../done/C14-ui-runtime-values.md) rule), which also drops the English "of" |
| recent lines · pinned and recent lines (list titles) | [complete.ts:197](../../../packages/frontend/src/console/language/complete.ts#L197) | `console.list.recent`, `console.list.pinned` | LINE plural bare `[RECENT]` / `[PINNED]`. The list shows the pinned lines first, so when there are any, give it both titles, `pinned · recent`, rather than coordinating two adjectives |
| complete (×3) | [ConsolePrompt.tsx:391, 397](../../../packages/frontend/src/console/ConsolePrompt.tsx#L391), [CompletionList.tsx:259](../../../packages/frontend/src/console/CompletionList.tsx#L259) | `action.complete` | `commandOf('COMPLETE')`, lower-case |
| apply | [ConsolePrompt.tsx:398](../../../packages/frontend/src/console/ConsolePrompt.tsx#L398) | `action.apply` | `commandOf('APPLY')`, lower-case |
| close the list | [ConsolePrompt.tsx:393](../../../packages/frontend/src/console/ConsolePrompt.tsx#L393) | `action.closeList` | `commandOf('CLOSE')` + LIST definite, lower-case |
| The console could not read this line. | [usePhraseConsole.ts:112](../../../packages/frontend/src/console/usePhraseConsole.ts#L112) | `failure.lineNotRead` | `couldNotBe('READ', LINE this)`, [C11](../done/C11-ui-failure-messages-passive.md)'s agentless passive: "This line could not be read." |

### Shape check (2026-09-21)

The failure message's shape, rendered with the seeded WORD standing in for LINE:

| plan | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `couldNotBe('READ', WORD this)` | This word could not be read. | Questa parola non poteva essere letta. | Ce mot ne pouvait pas être lu. | Dieses Wort konnte nicht gelesen werden. | Esta palabra no podía ser leída. | Esta palavra não podia ser lida. | この単語は読むことができませんでした。 |

## Tests that select on these literals

[console.spec.ts](../../../e2e/console.spec.ts) and [PhraseConsole.test.tsx](../../../packages/frontend/test/console/PhraseConsole.test.tsx)
read "Pinned." and "history ·". The history tag has `data-testid="console-history-tag"` and the pin
`data-testid="pin-line"`, so move the assertions to those ids and `aria-pressed`.
