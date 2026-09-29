# P17-E2. Surface forms in the Phrase view — "cats", not "cat · plural"

**Feature:** each row of the Phrase view shows its word as the sentence renders it in the UI
language (*cats*, *ate*, *the big*), not the lemma with a chip for each feature.
**Shape:** a per-role span alongside a translation, and `RoleList` reading it.
**Scope:** shared types, engine, backend, frontend.
**Status:** done 2026-09-28 (see Done). Filed 2026-09-27 from phase 2's "Surface forms".

## Why

Phase 2: *"A translation carries no per-role text, so the list shows the lemma plus its chips, not
'cats'. A per-role render would need a new request type."* A phone user reads the list, not the
canvas; the lemma and a row of chips make them assemble the word in their head.

## Today

Verified at HEAD (37b533a9), 2026-09-27.

- `Translation` is `{ language, text, ruby? }`
  ([`shared/src/index.ts:2080`](../../../../packages/shared/src/index.ts#L2080)): one string per
  language, nothing that maps a role to its words.
- `RoleList` renders the concept's label and a chip per set feature
  ([`RoleList.tsx`](../../../../packages/frontend/src/components/PhraseBuilder/RoleList.tsx)).

## Design

### D1. What the engine returns

Recommendation: an optional `spans?: { slot: string; start: number; end: number }[]` on
`Translation`, filled only when the request asks (`TranslateRequest.withSpans`), so every other
caller pays nothing. A span is the role's head word(s) in `text`. **Open point:** whether a role whose
words are discontinuous (a French negation *ne … pas*, a German separable verb, a Japanese verb and
its auxiliaries) is one span or several. Recommendation: several spans per slot, joined with *…* in
the row.

### D2. Where it's measured

The engine assembles each language's text from per-role pieces; record the offsets there rather than
searching the finished string (a word can occur twice). **Open point:** how much of each language's
assembly already keeps role identity to the end — measure before designing further; if some language
loses it early, that language returns no spans and the row falls back to today's lemma.

### D3. The row

`RoleList` shows the surface form as the row's word, keeps the lemma as a secondary line, and keeps
the chips (they are also the controls' state). Only the UI language is requested.

## Tests

- Engine: spans for a noun with number, a verb with tense, a French negation, a German separable verb
  — each span's substring equals the expected surface form.
- `RoleList` test: a row shows the span's text, and the lemma when there are no spans.
- e2e (mobile.spec): pick *cat*, set plural, the subject row reads *cats*.

## Verification

In the running app at 390 px, in each of the seven languages as the UI language.

## Out of scope

Spans on the canvas or in the translations panel (a hover that highlights a role across rows would use
the same data — its own ticket).

## Done

Shipped 2026-09-28.

**What the engine returns (D1).** `Translation.spans?: RoleSpan[]`, `RoleSpan = { slot, start, end }`,
filled only when `TranslateRequest.withSpans` asks — `true` for every language, or a list of languages
(the Phrase view sends `[uiLanguage]`). `/api/translate` passes it through and answers 400 on a language
it does not have; every other caller sends nothing and gets exactly what it got before. A slot is named
by its place in the plan: `subject`, `verb`, `directObject`, a complement's type, `address` (the
vocative), `interjection`, `modifier.<i>` and `modal.<i>` (the i-th of the filled chain — the frontend
maps `modifier2` / `verbModal2` onto it by counting, `spanSlotOf`). Only a concept the plan names once
gets a slot, and a command's subject and a subject question's throwaway get none.

**Where it's measured (D2).** Not threaded through the engines: their assembly is hundreds of functions
per language, all returning strings. Instead (`translator/functions/roleSpans.ts`) the role's words are
marked where they leave the lexicon — a private-use character before and after each *surface* form key
of the slot's concept (an allow-list: `base`, `plural`, the person/tense keys, `past`, `participle*`,
`particle`, the pronoun cases, …; never a fact like `gender` or `aux`), plus any `*_sense` a verb hands
itself on to (German EAT → "fressen") — the period is said a second time, and the marks are read out of
the finished text. A word said twice is two marks, never a search. Where a mark changes what it rides on
(en "a"/"an", fr "le"/"l'", a capital, an ending cut off with the close mark), the marked sentence is
lined up against the real one (longest common subsequence) and each mark placed by its neighbours; in a
spaced language a span then grows to its whole word. A render the marks break (it throws) costs the
spans, never the translation. `text` itself always comes from the unmarked render, so no output changed.

Measured on 600 random plans (subject noun or pronoun, transitive verb with random tense and negation,
object, optional adverb, locative, question):

| language | subject | verb | object | locative | adverb |
|---|---|---|---|---|---|
| en, fr, de, gsw, rm-rumgr, rm-sursilv, rm-vallader | 99% | 100% | 99% | 99% | 99–100% |
| it, es, pt | ~80% (a dropped subject pronoun has no word) | 100% | 99% | 99% | 98–100% |
| ja | 99% | **55%** | 99% | 99% | 100% |

The 1% misses are plans naming one concept twice. **Japanese** is the one language that loses role
identity early, and only for verbs: it inflects by rewriting the end of the form (食べます → 食べました), and
with no spaces there is no word edge to recover the cut-off mark from, so a verb whose ending the tense
or polarity rewrote returns no span and its row falls back to the lemma; a present affirmative (食べます)
or a te-form (走って) keeps its span, and nouns and adverbs always do. Every other language carries spans
for every role it says.

**Open point — discontinuous words.** Several spans per slot, as recommended; the row joins them with
" … " (German "fügt … hinzu", Swiss German "füegt … dezue"). What counts as the role's word is its own
lexeme's forms: French *ne … pas*, auxiliaries (*has eaten*, *wird … gefressen*) and Japanese
auxiliaries are not in the verb's span — the chips already say negative / perfect / passive. A form the
lexicon seeds with its clitic (it "si alzarono") comes with it.

**The row (D3).** `RoleList` shows the span's text as the row's word (`role-word-<slot>`), the lemma under
it (`role-lemma-<slot>`) only where the two differ, and keeps every chip. The words come from
`i18n/useRoleWords.ts`: one `/api/translate` per plan with `withSpans: [uiLanguage]`; while a new one is
in flight the last render stands, but only for a row whose slot still names the same concept in the same
UI language (a number change keeps "cat" until "cats" arrives; a new word or language shows its lemma at
once). The plan is the one the period translates as (`workspaceToPlans` in `PhraseWorkspace`, passed
through `PhraseBuilder.listPlan`), so a conditional's "would eat" is what the verb row says; a linked
(non-root) period has no plan of its own and keeps its lemmas. No new UI string.

**Tests.** Engine: `roleSpans.test.ts` (9 — slots, marks kept, an ending grown to its word, the a/an and
le/l' alignment, a split word, ja drops a rewritten verb, only surface keys marked, a throwing render)
and `test/role-spans.test.ts` (8, real lexicon — en "cats"/"ate", it "gatti"/"mangiarono", fr negation
"mange", de separable "fügt … hinzu", de "frisst" via EAT's animal sense, capital and elision, an Italian
dropped pronoun, ja present vs past, opt-in and unchanged text). Backend: 2 in `index.test.ts` (spans for
the languages asked; 400 on an unknown one). Frontend: `test/RoleList.test.tsx` (5 — the span's word and
the lemma under it, the lemma alone without spans, no request without a plan, the chain slot names).
e2e: `mobile.spec` "a row shows its word as the sentence says it" (cat → plural → the subject row reads
*cats*, lemma *cat*). Full vitest suite 994 files / 15857 passed; `mobile.spec` 29/29, `translation.spec`
+ `compact.spec` 17/17.

**Verification.** Driven at 390 px on isolated ports, *the cats ate the food* with the UI language set
to each of the seven: en cats/ate, it gatti/mangiarono, fr chats/mangèrent, de Kater/fraßen, es
gatos/comieron, pt gatos/comeram, each with its lemma under it where it differs; ja 猫 and 食べ物, the
verb on its lemma 食べる (see above). Not verified on a real phone, nor with the preview languages as the
UI language.
