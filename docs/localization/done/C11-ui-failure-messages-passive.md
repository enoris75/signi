# C11. UI strings — "Could not …" failure messages (passive voice)

**Kind:** hardcoded UI string. Once unblocked it becomes a [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts)
entry, driven by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Was blocked on:** the **passive voice**, planned as
[docs/features/A01-passive-voice](../../features/Z-Done/A01-passive-voice/README.md).
"Could not save the phrase" has no subject: the failure is about the phrase, not about who tried.
Each language says it as an agentless passive under a negated past modal: en "the phrase could not
be saved", de "die Phrase konnte nicht gespeichert werden", ja 保存できませんでした.

The active with the impersonal subject (GENERIC_PERSON, from [C04](C04-impersonal-subject.md))
reads well in it/fr/de ("non si è potuto…", "man konnte…") but not in English ("one could not save
the phrase"), so it was not a fix.

## Strings

| literal | where | also needs |
|---|---|---|
| Could not save the phrase. | [SavedPhrasesToolbar.tsx:123](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L123) | — |
| Could not load that phrase. | [SavedPhrasesToolbar.tsx:170](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L170) | — |
| Could not load saved phrases. | [SavedPhrasesToolbar.tsx:302](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L302) | — |
| Could not put it back. | [SavedPhrasesToolbar.tsx:158](../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx#L158) | **not in the original list** — P01's undo added it after this file was written |
| Could not save the period. | [PeriodSaveLoad.tsx:78](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L78) | — |
| Could not load that period. | [PeriodSaveLoad.tsx:114](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L114) | — |
| Could not load saved periods. | [PeriodSaveLoad.tsx:159](../../../packages/frontend/src/components/PhraseBuilder/PeriodSaveLoad.tsx#L159) | — |
| Could not reach the translation server. | [App.tsx:318](../../../packages/frontend/src/App.tsx#L318) | REACH (SERVER was seeded by [C10](C10-ui-questions.md); German compounds "translation server" without its linking -s-, so say "the server", as C10 does) |
| Could not load the words. | [WordMap.tsx:210](../../../packages/frontend/src/components/WordMap/WordMap.tsx#L210) (first sentence; the question after it, `status.isServerActive`, shipped with [C10](C10-ui-questions.md) and was the only localized half of this message) | — |

All modals, tense and negation these need already rendered. Voice was the only missing piece.

One string that reached for the passive had left: the instrumental pick hint ("whose noun is what
the action **is done with**") was [C12](C12-ui-purpose-and-object-complements.md)'s, and
C12's genitive relative says it in the active — "the period whose noun is the instrumental" — by
naming the complement the noun fills instead of the act done with it. Where a sentence can name a
role rather than describe an action done to something, it needs no voice.

## Done

**2026-09-21.** A01 shipped, so all nine messages are now `failure.*` entries. Every one is the
same shape, `couldNotBe(verb, patient)` in
[uiStrings.ts](../../../packages/shared/src/uiStrings.ts): the thing acted on as the direct object
of a **passive** verb phrase under `modals: ['CAN'], tense: 'past', negative: true`, with
GENERIC_PERSON as the agent. Agentlessness is a subject choice and not a value of `voice` (A01 §0),
so the translator drops that agent rather than spelling a by-phrase, and what is left is the plain
agentless passive.

| key | en | it | de | ja |
|---|---|---|---|---|
| `failure.phraseNotSaved` | The phrase could not be saved. | La frase non poteva essere salvata. | Die Phrase konnte nicht gespeichert werden. | フレーズは保存することができませんでした。 |
| `failure.phraseNotLoaded` | That phrase could not be loaded. | Quella frase non poteva essere caricata. | Jene Phrase konnte nicht geladen werden. | そのフレーズは読み込むことができませんでした。 |
| `failure.savedPhrasesNotLoaded` | The saved phrases could not be loaded. | Le frasi salvate non potevano essere caricate. | Die gespeicherten Phrasen konnten nicht geladen werden. | 保存済みのフレーズは読み込むことができませんでした。 |
| `failure.periodNotSaved` | The period could not be saved. | Il periodo non poteva essere salvato. | Das Satzgefüge konnte nicht gespeichert werden. | 文は保存することができませんでした。 |
| `failure.periodNotLoaded` | That period could not be loaded. | Quel periodo non poteva essere caricato. | Jenes Satzgefüge konnte nicht geladen werden. | その文は読み込むことができませんでした。 |
| `failure.savedPeriodsNotLoaded` | The saved periods could not be loaded. | I periodi salvati non potevano essere caricati. | Die gespeicherten Satzgefüge konnten nicht geladen werden. | 保存済みの文は読み込むことができませんでした。 |
| `failure.phraseNotTranslated` | The phrase could not be translated. | La frase non poteva essere tradotta. | Die Phrase konnte nicht übersetzt werden. | フレーズは翻訳することができませんでした。 |
| `failure.wordsNotLoaded` | The words could not be loaded. | Le parole non potevano essere caricate. | Die Wörter konnten nicht geladen werden. | 単語は読み込むことができませんでした。 |

Four things landed differently from the plan above.

### 1. REACH was not seeded — the message says what failed, not what it could not reach

"Could not reach the translation server" names the *server*, and REACH is the one verb in the list
that does not survive translation: Japanese 到達する takes に, not を, so it cannot carry a direct
object at all, and there is no を-taking Japanese verb for it. A concept that renders in only some
of the phrases it is grammatically eligible for is half-seeded, so it was not seeded.

The message says what did not happen instead — **the phrase could not be translated** — and the
call site follows it with `status.isServerActive`, which is the question about the server and
already says it without the compound German cannot form ([B10](../../bugs/fixed/B10-german-compound-linking-element.md)).
That is the shape `WordMap.tsx` already used for the same failure. The diagnosis is not lost; it
has moved out of the sentence, which is what C14 concluded about runtime values and what this
file's own last paragraph says about the instrumental hint.

**TRANSLATE** was seeded in its place ([transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts)),
transitive in all seven, with its own gloss — "to express concepts with another language",
ja 別の言語で概念を表す.

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| TRANSLATE | translate | tradurre | traduire | übersetzen | traducir | 翻訳する | traduzir |

### 2. Japanese: an agentless passive under the potential drops its 〜られる

The plan rendered 「フレーズは保存**される**ことができませんでした」 — the passive morphology *and*
〜ことができる, which demote the agent twice. Japanese does not stack them: what it says for "X
cannot be V-ed" is the ability on the plain verb, the topic は already doing the promotion. That is
exactly the 保存できませんでした this file asked for, in its periphrastic form.

[`isPotentialPassive`](../../../packages/engine/src/languages/ja/isPotentialPassive.ts) is the
rule, and it holds only for the **agentless** passive: with an agent spoken, the に phrase needs the
〜られる to attach to. CAN's Japanese lexeme carries `potential: '1'` to mark it out among the
modals, and the modal has to be the innermost link of the chain. Pinned in `voice.test.ts`.

### 3. Portuguese: the passive takes the short participle of an abundant pair

`ser` + *salvado* is wrong; Portuguese says **foi salva**. `salvar` is one of a class with two
participles — the regular one the perfect auxiliary governs (*tinha salvado*) and the short one the
copula does — and a passive is always built on a copula. The new lexical key
`participle_passive` carries the short form, and
[`passiveParticiple`](../../../packages/engine/src/functions/passiveParticiple.ts) is what all six
non-Japanese engines now read for a passive. Only SAVE needs one today; aceitar/aceito,
entregar/entregue, gastar/gasto and pagar/pago are the rest of the Portuguese class when they are
seeded.

### 4. French: a plural patient takes the definite article

`bare` gave *"phrases enregistrées ne pouvaient pas être chargées"*, and French spells no
zero-article plural subject. The two list messages are definite anyway — it is *the* stored ones,
all of them — so they say "the saved phrases".

### The ninth message

"Could not put it back." is the *undo* of a delete failing, and it reuses `failure.phraseNotSaved`:
putting a deleted phrase back **is** saving it again, which is what the code does and what the
comment there already said. A distinct "it could not be put back" would want the prior state that
[C19](../C-needs-engine/C19-verbs-needing-voice-purpose-or-comitative.md) catalogues for TIDY_UP —
nothing in the plan model says "back".

## Tests that select on these literals

`Could not` → `SavedPhrasesToolbar.test.tsx`, `App.test.tsx`, `WordMap.test.tsx`,
`PeriodSaveLoad.test.tsx` — all four now select on the new fallbacks. The renders themselves are
pinned in `packages/backend/src/uiStrings.test.ts`, and the Japanese rule in
`packages/engine/test/voice.test.ts`.
