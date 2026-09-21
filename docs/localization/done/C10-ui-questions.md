# C10. UI strings — confirmation questions (interrogative mood)

**Kind:** hardcoded UI string. Once unblocked it becomes a [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts)
entry, driven by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** `PhrasePlan` has no **interrogative mood**. It models statements, `imperative`,
`infinitive` and a counterfactual `condition`, but not a yes/no question: no inversion (en *do*-support,
de verb-first), no ja 〜か, and `UiStringFormat` can only strip a full stop, not end on "?".

## Strings

| literal | where | also needs |
|---|---|---|
| Clear this main clause and everything in it? | [HeaderControls.tsx:110](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/HeaderControls.tsx#L110) | EVERYTHING (an indefinite pronoun head) + a locative whose phrase is a pronoun ("in it"); CLAUSE, MAIN (seeded by [B21](../done/B21-ui-clause-and-coordination-vocabulary.md)) |
| Remove this main clause and everything in it? | [HeaderControls.tsx:111](../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/HeaderControls.tsx#L111) | the same, + REMOVE ([B20](../done/B20-ui-remove-and-delete.md)) |
| Is the translation server running? | [WordMap.tsx:208](../../../packages/frontend/src/components/WordMap/WordMap.tsx#L208) (second sentence) | SERVER, RUN in the machine sense (the seeded RUN is the legs) |

## `window.confirm` can't be localized anyway

The two prompts go through `window.confirm`, whose **OK / Cancel buttons are drawn by the browser in
the browser's language**, not the UI language. Whatever happens to the question, move these to an
MUI dialog whose buttons are catalog entries (`action.remove` / `action.clear`, `action.cancel` from B25).

## To unblock

1. Add a yes/no `interrogative` mood to `PhrasePlan`, exclusive with `imperative` / `infinitive` /
   `condition` like those are with each other, and render it in every engine.
2. Let `UiStringFormat` keep or normalize the question mark ("?" / "？").
3. Or skip the question: a statement plus labelled buttons ("This removes the main clause and
   everything in it." [Remove] [Cancel]). That still needs EVERYTHING and a pronoun in the locative, but no new mood.

## Done

**2026-09-20.** Took **option 1**: `PhrasePlan.interrogative` is a yes/no question every engine renders,
and the catalog holds the one question the UI still asks. The two confirmations were gone before this
task ran, so `window.confirm` never needed the MUI dialog — see the changes below.

### The construct

`interrogative` is **not a `Mood`** but a flag beside it, on the plan and on `ResolvedVerbPhrase`. A
question is a statement's clause with another force: the verb keeps its indicative forms, its tense,
aspect and modals. Adding a sixth `Mood` value would have changed those forms behind the flag's back —
[`pt/aspectVerb.ts`](../../../packages/engine/src/languages/pt/aspectVerb.ts) and
[`mood.ts`](../../../packages/engine/src/mood.ts)'s `statePastForm` both read "any mood set" as
"not indicative", so `pt` would have said *tem comido* for *comeu* in every question.

It holds only where the mood is indicative — under a `condition`, an `imperative` or an `infinitive` the
translator drops it, as the task asked — and a coordinated clause shares the force of the first (a
question does not coordinate with a statement). A relative clause never takes it.

Each language asks its own way, and the question mark replaces the full stop (`LanguageEngine.questionMark`,
with `questionOpener` for the one language that opens as well as closes):

| | how it asks | "does the cat eat the food?" |
|---|---|---|
| en | subject–auxiliary inversion, with *do*-support where the group has no auxiliary (new `doSupport` / `invertSubject`) | does the cat eat the food? |
| it | the statement's order, "?" | il gatto mangia il cibo? |
| fr | "est-ce que", elided before a vowel; "?" after a no-break space | est-ce que le chat mange la nourriture ? |
| de | V1 — the finite verb leads, which `renderClause`'s `inverted` already did for a fronted "wenn" clause | isst der Kater das Essen? |
| es | the statement's order between "¿" and "?" | ¿el gato come la comida? |
| ja | か on the polite predicate, closed by the full-width "？" | 猫は食べ物を食べますか？ |
| pt | the statement's order, "?" | o gato come a comida? |

English is the language that needed real work: the auxiliary a question inverts is the one its negation
would use, so *do*-support, the "cannot" → "can … not" split and the frequency-adverb slot all follow the
negation's rules ("does the cat never eat?", "can the cat not run?", "did the cat have to run?").

### The string

Seeded **SERVER** ([nouns.ts](../../../packages/backend/src/concepts/nouns.ts)) and **ACTIVE**
([adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts), `synonym: 'running'`, transient so
es/pt predicate it with *estar*).

| key | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| `status.isServerActive` | Is the server active? | Il server è attivo? | Est-ce que le serveur est actif ? | Ist der Server aktiv? | ¿El servidor está activo? | サーバーは稼働中ですか？ | O servidor está ativo? |

[WordMap.tsx](../../../packages/frontend/src/components/WordMap/WordMap.tsx) asks it after a failed load.

### Changes against the plan

- **Two of the three strings no longer exist.** [P01](../../features/Z-Done/P01-keyboard-first-ux/README.md)
  phase 5 (commit 9cad4d6) took the confirmation out of `HeaderControls`: the removal happens and the page
  offers Ctrl Z, because asking first costs every user a dialog to save the few who did not mean it. So
  EVERYTHING, the pronoun locative and the MUI dialog were not needed, and `window.confirm` is gone from
  the app. The **deliberative infinitive question** those two would have wanted ("Remove this clause?",
  it *Rimuovere…?*, ja 削除しますか？) is therefore **not built**: `interrogative` is exclusive with
  `infinitive`, as the task specified. A confirmation dialog that comes back needs that combination.
- **"active", not "running".** A verb in the progressive asks it well in en/es/pt/ja but not in fr
  (*est en train de fonctionner*) or de (*läuft … gerade*), and the neutral aspect asks the habitual in
  English ("does the server run?"). The state adjective reads naturally in all seven.
- **Not "the translation server".** German compounds an attributive noun with no linking element
  ([B10](../../bugs/fixed/B10-german-compound-linking-element.md), a documented simplification that
  is not to be fixed without a product decision), so TRANSLATION + SERVER renders *Übersetzungserver*,
  missing its Fugen-s. The modifier was dropped rather than shipped misspelled; the app has one server,
  so nothing is lost but the word. Restoring it is one line once B10 is decided.
- **The first sentence is still English.** "Could not load the words." is
  [C11](C11-ui-failure-messages-passive.md)'s, waiting on the passive voice; only the question after it
  is the catalog's.
- **`UiStringFormat` needed only half of point 2.** `stripPeriod` strips "." and "。" and never touched a
  question mark, so the mark is kept by doing nothing. `capitalize` did need fixing: it uppercased the
  first *character*, which for Spanish is the "¿". It now capitalizes the first *letter*, past any opening mark.
- **No builder control.** The canvas has no toggle for a question (the imperative has its megaphone); the
  mood is reachable from a plan only. [P09 E6](../../features/P-planning/P09-core-vocabulary/README.md)
  wants the rest of it — question words, wh-order — and can build on this.

Pinned by [interrogative.test.ts](../../../packages/engine/test/interrogative.test.ts) (every language,
across tense, aspect, negation, adverbs, modals, pronouns, coordination, a relative clause inside a
question, and the moods that ignore the flag), the colocated unit tests `doSupport`, `invertSubject`,
`estCeQue`, `modalFinite`, `predicateParts`, `resolvePhrase` and `translate`, the `EVERY_ADJECTIVE` table
in [adjectives.test.ts](../../../packages/engine/test/adjectives.test.ts),
[uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts) (the renders above, and capitalizing
past the "¿"), `WordMap.test.tsx`, and
[language.spec.ts](../../../e2e/language.spec.ts), which fails the word map's request with the interface
in Italian.
