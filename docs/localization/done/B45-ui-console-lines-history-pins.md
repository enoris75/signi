# B45. UI strings — the console's lines, history and pins

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Done 2026-09-21.** Every item below shipped. See [Done](#done) for the renders and what changed
against the plan.

**Why it was blocked:** the console works in *lines* that can be pinned, recalled from a history and
completed, and none of those words was seeded. With them, each string is a shape the catalogue already
uses. The one failure message is [C11](C11-ui-failure-messages-passive.md)'s passive.

## Seeded

LIST was seeded ahead of this task, with LINK, VALUE and SPATIAL, so that the tasks sharing them could
run side by side. The other nine are new. The forms are the ones seeded, which the probe below renders.

| concept | role | gloss | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|---|---|
| LINE | noun, count | a row of text typed as one command | line(s) | riga, -he (f) | ligne(s) (f) | Zeile, -n (f) | línea(s) (f) | linha(s) (f) | 行 (ぎょう) |
| LIST | noun, count | items written one after another | list(s) | elenco, -chi (m) | liste(s) (f) | Liste, -n (f) | lista(s) (f) | lista(s) (f) | 一覧 |
| HISTORY | noun, mass | the lines typed before, in order | history | cronologia (f) | historique (m, h muet: *l'historique*) | Verlauf (m) | historial (m) | histórico (m) | 履歴 |
| PIN | verb, transitive | to keep an item at the top of a list | pin | fissare | épingler | anheften (separable) | fijar | fixar | ピン留めする, label ピン留め |
| UNPIN | verb, transitive | to stop keeping an item at the top of a list | unpin | sbloccare | désépingler | lösen | desfijar | desafixar | ピン留め解除する, label ピン留め解除 |
| PINNED | adjective, transient | kept at the top of a list | pinned | fissato | épinglé | angeheftet | fijado | fixado | ピン留め済みの |
| UNPINNED | adjective, transient | no longer kept at the top of a list | unpinned | non più fissato | désépinglé | nicht mehr angeheftet | desfijado | desafixado | ピン留め解除済みの |
| RECENT | adjective | used a short time ago | recent | recente | récent | zuletzt verwendet | reciente | recente | 最近使用された |
| COMPLETE | verb, transitive | to finish a word that has been started | complete | completare | compléter | vervollständigen | completar | completar | 補完する, label 補完 |
| APPLY | verb, transitive | to put a change into effect | apply | applicare | appliquer | anwenden (separable; wandte, angewandt) | aplicar | aplicar | 適用する, label 適用 |

ROW ([B44](B44-ui-keyboard-movement-labels.md)) and LINE share the Japanese 行 and the
German *Zeile*. They are different concepts, a row of a list and a line of text, so both are seeded.

### The words in their paradigms

Rendered 2026-09-21 by the engine source over an in-memory seed of the corpus. Pinned by
[console-words.test.ts](../../../packages/engine/test/console-words.test.ts), the `EVERY_ADJECTIVE` table of
[adjectives.test.ts](../../../packages/engine/test/adjectives.test.ts) and the Italian resultative table of
[verb.test.ts](../../../packages/engine/test/verb.test.ts).

| plan | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| LINE indefinite | a line. | una riga. | une ligne. | eine Zeile. | una línea. | uma linha. | 行。 |
| LINE plural | the lines. | le righe. | les lignes. | die Zeilen. | las líneas. | as linhas. | 行。 |
| HISTORY definite | the history. | la cronologia. | l'historique. | der Verlauf. | el historial. | o histórico. | 履歴。 |
| HISTORY `some` | some history. | della cronologia. | de l'historique. | etwas Verlauf. | algo de historial. | um pouco de histórico. | いくつかの履歴。 |
| dog PIN line | the dog pins the line. | il cane fissa la riga. | le chien épingle la ligne. | der Hund heftet die Zeile an. | el perro fija la línea. | o cão fixa a linha. | 犬は行をピン留めします。 |
| dogs PIN line, past | the dogs pinned the line. | i cani fissarono la riga. | les chiens épinglèrent la ligne. | die Hunde hefteten die Zeile an. | los perros fijaron la línea. | os cães fixaram a linha. | 犬は行をピン留めしました。 |
| dog PIN lines, future | the dog will pin the lines. | il cane fisserà le righe. | le chien épinglera les lignes. | der Hund wird die Zeilen anheften. | el perro fijará las líneas. | o cão fixará as linhas. | 犬は行をピン留めします。 |
| PIN, resultative | the dog has pinned the line. | il cane ha fissato la riga. | le chien a épinglé la ligne. | der Hund hat die Zeile angeheftet. | el perro ha fijado la línea. | o cão fixou a linha. | 犬は行をピン留めしました。 |
| PIN, imperative | pin the line. | fissa la riga. | épingle la ligne. | hefte die Zeile an. | fija la línea. | fixe a linha. | 行をピン留めしてください。 |
| PIN, passive | the line is pinned by the dog. | la riga è fissata dal cane. | la ligne est épinglée par le chien. | die Zeile wird vom Hund angeheftet. | la línea es fijada por el perro. | a linha é fixada pelo cão. | 行は犬にピン留めされます。 |
| line the dog PINs, relative | the line that the dog pins runs. | la riga che il cane fissa corre. | la ligne que le chien épingle court. | die Zeile, die der Hund anheftet, läuft. | la línea que el perro fija corre. | a linha que o cão fixa corre. | 犬がピン留めする行は走ります。 |
| dog UNPIN line | the dog unpins the line. | il cane sblocca la riga. | le chien désépingle la ligne. | der Hund löst die Zeile. | el perro desfija la línea. | o cão desafixa a linha. | 犬は行をピン留め解除します。 |
| UNPIN, resultative | the dog has unpinned the line. | il cane ha sbloccato la riga. | le chien a désépinglé la ligne. | der Hund hat die Zeile gelöst. | el perro ha desfijado la línea. | o cão desafixou a linha. | 犬は行をピン留め解除しました。 |
| UNPIN, progressive, negative | the dog is not unpinning the line. | il cane non sta sbloccando la riga. | le chien n'est pas en train de désépingler la ligne. | der Hund löst gerade die Zeile nicht. | el perro no está desfijando la línea. | o cão não está desafixando a linha. | 犬は行をピン留め解除していません。 |
| dog COMPLETE line | the dog completes the line. | il cane completa la riga. | le chien complète la ligne. | der Hund vervollständigt die Zeile. | el perro completa la línea. | o cão completa a linha. | 犬は行を補完します。 |
| COMPLETE, passive | the line is completed by the dog. | la riga è completata dal cane. | la ligne est complétée par le chien. | die Zeile wird vom Hund vervollständigt. | la línea es completada por el perro. | a linha é completada pelo cão. | 行は犬に補完されます。 |
| dogs APPLY line, past | the dogs applied the line. | i cani applicarono la riga. | les chiens appliquèrent la ligne. | die Hunde wandten die Zeile an. | los perros aplicaron la línea. | os cães aplicaram a linha. | 犬は行を適用しました。 |
| APPLY, resultative | the dog has applied the line. | il cane ha applicato la riga. | le chien a appliqué la ligne. | der Hund hat die Zeile angewandt. | el perro ha aplicado la línea. | o cão aplicou a linha. | 犬は行を適用しました。 |
| line the dog APPLYs, relative | the line that the dog applies runs. | la riga che il cane applica corre. | la ligne que le chien applique court. | die Zeile, die der Hund anwendet, läuft. | la línea que el perro aplica corre. | a linha que o cão aplica corre. | 犬が適用する行は走ります。 |
| a PINNED line | a pinned line. | una riga fissata. | une ligne épinglée. | eine angeheftete Zeile. | una línea fijada. | uma linha fixada. | ピン留め済みの行。 |
| the PINNED books | the pinned books. | i libri fissati. | les livres épinglés. | die angehefteten Bücher. | los libros fijados. | os livros fixados. | ピン留め済みの本。 |
| the line is PINNED | the line is pinned. | la riga è fissata. | la ligne est épinglée. | die Zeile ist angeheftet. | la línea está fijada. | a linha está fixada. | 行はピン留め済みです。 |
| an UNPINNED line | an unpinned line. | una riga non più fissata. | une ligne désépinglée. | eine nicht mehr angeheftete Zeile. | una línea desfijada. | uma linha desafixada. | ピン留め解除済みの行。 |
| the UNPINNED books | the unpinned books. | i libri non più fissati. | les livres désépinglés. | die nicht mehr angehefteten Bücher. | los libros desfijados. | os livros desafixados. | ピン留め解除済みの本。 |
| the line is UNPINNED | the line is unpinned. | la riga è non più fissata. | la ligne est désépinglée. | die Zeile ist nicht mehr angeheftet. | la línea está desfijada. | a linha está desafixada. | 行はピン留め解除済みです。 |
| a RECENT line | a recent line. | una riga recente. | une ligne récente. | eine zuletzt verwendete Zeile. | una línea reciente. | uma linha recente. | 最近使用された行。 |
| the line is RECENT | the line is recent. | la riga è recente. | la ligne est récente. | die Zeile ist zuletzt verwendet. | la línea es reciente. | a linha é recente. | 行は最近使用されています。 |

## Strings

The line references are to the code as it reads after this task. All shipped.

| literal | where now | key | plan |
|---|---|---|---|
| Pin this line · Unpin this line (the transcript's pin) | [Transcript.tsx:113](../../../packages/frontend/src/console/Transcript.tsx#L113) | `action.pinLine`, `action.unpinLine` | `commandOf('PIN' / 'UNPIN')` + LINE `this`, `NAME_FORMAT` |
| pin this line, or the last one run (`/pin` and `/unpin`) | [commands.ts:754, 764](../../../packages/frontend/src/console/language/commands.ts#L754) | `descriptionKey`: the same two | the help page's examples show what "or the last one run" adds: `/subj ( cat ) /verb ( eat ) /pin` and `/unpin` alone |
| Pinned. · Unpinned. | [usePhraseConsole.ts:585](../../../packages/frontend/src/console/usePhraseConsole.ts#L585) | `toast.linePinned`, `toast.lineUnpinned` | LINE bare `[PINNED]` / `[UNPINNED]`, the `toast.phraseSaved` shape ("Pinned line"), as the transcript entry's `detailKey` |
| history · {n} of {m} | [ConsolePrompt.tsx:383](../../../packages/frontend/src/console/ConsolePrompt.tsx#L383) | `console.history` | `nameOf('HISTORY')`, lower-case. The position stays outside the phrase as figures, "history · 3/7" (the [C14](C14-ui-runtime-values.md) rule), which also drops the English "of" |
| recent lines · pinned and recent lines (list titles) | [complete.ts:196-206](../../../packages/frontend/src/console/language/complete.ts#L196-L206) | `console.list.recent`, `console.list.pinned` | LINE plural bare `[RECENT]` / `[PINNED]`. One title per kind the list holds: "pinned lines · recent lines" when it holds both (see Done, 3) |
| pinned · recent (each history row's note) | [complete.ts:193](../../../packages/frontend/src/console/language/complete.ts#L193) | `console.line.pinned`, `console.line.recent` | not in the plan: `word` PINNED / RECENT `agreesWith` LINE (it "fissata" / "recente") |
| complete (×3) | [ConsolePrompt.tsx:395, 401](../../../packages/frontend/src/console/ConsolePrompt.tsx#L395), [CompletionList.tsx:263](../../../packages/frontend/src/console/CompletionList.tsx#L263) | `action.complete` | `commandOf('COMPLETE')`, lower-case |
| apply | [ConsolePrompt.tsx:402](../../../packages/frontend/src/console/ConsolePrompt.tsx#L402) | `action.apply` | `commandOf('APPLY')`, lower-case |
| close the list | [ConsolePrompt.tsx:397](../../../packages/frontend/src/console/ConsolePrompt.tsx#L397) | `action.closeList` | `commandOf('CLOSE')` + LIST definite, lower-case |
| The console could not read this line. | [usePhraseConsole.ts:113](../../../packages/frontend/src/console/usePhraseConsole.ts#L113), shown at [ConsolePrompt.tsx:234](../../../packages/frontend/src/console/ConsolePrompt.tsx#L234) | `failure.lineNotRead` | `couldNotBe('READ', LINE this)`, [C11](C11-ui-failure-messages-passive.md)'s agentless passive: "This line could not be read." A `Diagnostic` now carries a `messageKey` ([types.ts:50](../../../packages/frontend/src/console/language/types.ts#L50)) |

"next word" and "back to the canvas", beside these keys, are [B44](B44-ui-keyboard-movement-labels.md)'s
and [B43](B43-ui-canvas-preview-edit.md)'s.

## Tests that select on these literals

[PhraseConsole.test.tsx](../../../packages/frontend/test/console/PhraseConsole.test.tsx) read "Pinned." and
"history · 1 of 1"; it now reads "Pinned line" and "history · 1/1", checks the pin's accessible name
beside its `aria-pressed`, and gained an Italian pass over the pin, the transcript's note, the list's
titles and notes, the key hints and the tag. [complete.test.ts](../../../packages/frontend/test/console/complete.test.ts)
pins the rows' `detailKey`s and the titles for each mix of kinds, and `/pin`'s and `/unpin`'s keys.
[console.spec.ts](../../../e2e/console.spec.ts) read the same two literals, and gained a spec that pins,
walks and reads the list in Italian and German. [uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts)
pins every new entry in all seven languages.

## Done

**2026-09-21.** Nine concepts seeded (LIST came seeded), twelve new entries. Rendered by the engine source
over an in-memory seed of the corpus, through `buildUiStrings`, with formats applied; the e2e stack then
seeded 391 concepts and booted clean on the built catalogue.

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `action.pinLine` | Pin this line | Fissa questa riga | Épingler cette ligne | Diese Zeile anheften | Fijar esta línea | Fixar esta linha | この行をピン留め |
| `action.unpinLine` | Unpin this line | Sblocca questa riga | Désépingler cette ligne | Diese Zeile lösen | Desfijar esta línea | Desafixar esta linha | この行をピン留め解除 |
| `toast.linePinned` | Pinned line | Riga fissata | Ligne épinglée | Angeheftete Zeile | Línea fijada | Linha fixada | ピン留め済みの行 |
| `toast.lineUnpinned` | Unpinned line | Riga non più fissata | Ligne désépinglée | Nicht mehr angeheftete Zeile | Línea desfijada | Linha desafixada | ピン留め解除済みの行 |
| `console.history` | history | cronologia | historique | Verlauf | historial | histórico | 履歴 |
| `console.list.pinned` | pinned lines | righe fissate | lignes épinglées | angeheftete Zeilen | líneas fijadas | linhas fixadas | ピン留め済みの行 |
| `console.list.recent` | recent lines | righe recenti | lignes récentes | zuletzt verwendete Zeilen | líneas recientes | linhas recentes | 最近使用された行 |
| `console.line.pinned` | pinned | fissata | épinglée | angeheftet | fijada | fixada | ピン留め済み |
| `console.line.recent` | recent | recente | récente | zuletzt verwendet | reciente | recente | 最近使用された |
| `action.complete` | complete | completa | compléter | vervollständigen | completar | completar | 補完 |
| `action.apply` | apply | applica | appliquer | anwenden | aplicar | aplicar | 適用 |
| `action.closeList` | close the list | chiudi l'elenco | fermer la liste | die Liste schließen | cerrar la lista | fechar a lista | 一覧を閉じる |
| `failure.lineNotRead` | This line could not be read. | Questa riga non poteva essere letta. | Cette ligne ne pouvait pas être lue. | Diese Zeile konnte nicht gelesen werden. | Esta línea no podía ser leída. | Esta linha não podia ser lida. | この行は読むことができませんでした。 |

What landed differently from the plan:

1. **UNPINNED is "no longer pinned" in Italian and German.** The participle of UNPIN reads "unlocked"
   (it *sbloccata*) and "solved" (de *gelöste*) without the list around it, so the adjective is its own
   phrase: it *non più fissato*, de *nicht mehr angeheftet*, which the gloss says anyway. Both inflect on
   their last word ("Nicht mehr angeheftete Zeile"). Recorded, not fixed: a predicate the builder makes
   with it reads it *la riga è non più fissata*, where Italian would put *non* before the verb (*non è più
   fissata*). The console never predicates it.
2. **RECENT is what an interface says in German and Japanese.** The suggested *letzt-* has no form
   standing alone, which a row's note needs; *zuletzt verwendet* does ("zuletzt verwendete Zeilen", the
   note "zuletzt verwendet"). Japanese 最近の was probed and predicates as 行は最近です; 最近使用された
   gives 最近使用された行 and, as a predicate, 行は最近使用されています.
3. **One list title per kind of row.** The English said "pinned and recent lines" whenever a line was
   pinned, even with no recent one. The title is now `console.list.pinned`, `console.list.recent`, or both
   joined by " · " ("pinned lines · recent lines"), for which `Completion.titleKey` takes a list of keys
   ([complete.ts:101](../../../packages/frontend/src/console/language/complete.ts#L101),
   [CompletionList.tsx:33](../../../packages/frontend/src/console/CompletionList.tsx#L33)).
4. **The rows' notes were English too.** Each history row said "pinned" or "recent" beside its line;
   they read `console.line.pinned` / `.recent`, agreeing with LINE.
5. **`/pin`'s description drops "or the last one run".** It reads what the transcript's pin says, "Pin
   this line"; the help page's two examples show both uses.
6. **French *historique* elides.** The first probe gave *le historique*: the noun is marked `elides`, an
   h muet like *homme*, so *l'historique*, *de l'historique*.
7. **A console diagnostic can carry a key.** `Diagnostic.messageKey` is the first; C21's message codes
   would give every diagnostic one.
8. **German and Japanese verbs.** PIN and APPLY are separable (*heftet … an*, *wendet … an*, and
   *die der Hund anheftet* in a relative clause), and APPLY takes the strong *wandte*, *angewandt*. UNPIN is *lösen* (as in "Von Taskleiste
   lösen"), not a second separable verb. Japanese UNPIN is ピン留め解除する, one verbal noun, since
   ピン留めを外す would put a second を beside the object's ("この行をピン留め解除").
