---
name: seed
description: Add one or more concepts (words) to Signi's corpus so the phrase builder can compose with them. Use when the user says "seed X", "seed the word X", "we need the concept X", or when anything references a concept that does not exist yet. Covers all roles — noun, verb, adjective, adverb, pronoun.
---

# Seeding a concept

**Seeding** = adding a concept to the corpus of words the phrase engine can compose with. A
concept is a *meaning* (`CAT`, `SAVE`, `BIG`), seeded once with its surface forms in **every**
supported language. It is a backend/data change only — seeding never touches the frontend.

Seeding is about the corpus, not about any particular use of it. A seeded word becomes available to
the phrase builder for whatever the user wants to build with it; that some phrases happen to be used
as UI strings is one downstream consumer among others, and is not what seeding is for.

Ask nothing if the user names the concept and its role is obvious. Seed the concept in all seven
languages; a concept missing a language is a bug, not a partial success (see "Definition of done").

## Where things live

| What | Where |
| --- | --- |
| Concept definitions | [packages/backend/src/concepts/](packages/backend/src/concepts/) — `nouns.ts`, `adjectives.ts`, `adverbs.ts`, `pronouns.ts`, `verbs/{transitive,intransitive,ditransitive,motion,modals}.ts` |
| The `ConceptSeed` shape | [packages/backend/src/concepts/types.ts](packages/backend/src/concepts/types.ts) |
| Verb aspect forms (gerund/participle/te-form/aux) | [packages/backend/src/concepts/verbs/nonfinite.ts](packages/backend/src/concepts/verbs/nonfinite.ts) |
| The loader (wipes + reinserts everything) | [packages/backend/src/seed.ts](packages/backend/src/seed.ts) |
| Engine tests (one file per role/feature) | [packages/engine/test/](packages/engine/test/) — `adjectives.test.ts`, `verb.test.ts`, `subject.test.ts`, `nounPhrase.test.ts`, `coordination.test.ts`, … |
| Test harness (seeds the real corpus, renders every language) | [packages/engine/test/harness.ts](packages/engine/test/harness.ts) |

Languages: `en`, `it`, `fr`, `de`, `es`, `ja`, `pt`. Every one is mandatory.

## Steps

1. **Pick the file by role.** A verb goes in the `verbs/` file matching its transitivity; anything
   else goes in the single file for its role. Add the entry near semantically related ones rather
   than appending blindly to the end.
2. **Write the `ConceptSeed`.** `id` is SCREAMING_SNAKE and unique across *all* roles (a grammar
   noun that collides with an everyday one gets a suffix — `SUBJECT_GRAMMAR`, `PERSON_GRAMMAR`,
   `PERIOD_SENTENCE`). Always give `description` and `emoji`.
3. **Fill `forms` for all seven languages**, per role:
   - **noun** — `base`, `plural`, `gender` (`masc`/`fem`/`neut`, not in en/ja), `count`; `fem` +
     `fem_plural` when the noun has a feminine counterpart; `reading` (kana) for `ja`.
     Flags: `animate` (affects motion adpositions), `countable: false` for mass nouns,
     `proper: true` for proper nouns. A handful of columns are **one language's own** and go on that
     language's lexeme only (see *A noun's language-specific columns* below).
   - **verb** — `base` (infinitive) plus the finite paradigm: `1sg_present`…`3pl_present`, and the
     `_past` / `_future` persons each language inflects (en collapses to a single `past`).
     Set `transitivity`, and `complements` for the complement types the verb licenses; `modal: true`
     for verbs governing an infinitive. Add the verb to `NONFINITE` in `verbs/nonfinite.ts` with
     `gerund` / `participle` / `te` + `te_reading` (ja) / `aux: 'be'` where the language selects it.
   - **adjective / adverb** — usually just `base` per language (+ `reading` for ja). Adverbs may
     carry `subtype` (e.g. `frequency`) and `polarity`.
   - **pronoun** — `base`, `person`, `number`, `gender`.
   Add a `synonym` gloss when the English id is ambiguous in the picker (e.g. `CRY` → `weep`).
4. **Reload the corpus:** `npm run seed`. It wipes and re-inserts every concept, so it is safe to
   re-run at any time. The dev backend caches the lexicon; restart it (or rely on `tsx watch`) after
   seeding.
5. **Add unit tests for the new words.** A seeded word that no test pins is a paradigm nobody is
   watching — the next refactor can silently break its plural, its gender agreement, or its past
   participle and the suite stays green. Every new concept gets a test. The engine tests in
   [packages/engine/test/](packages/engine/test/) run the *real* seeded corpus through
   [harness.ts](packages/engine/test/harness.ts) (`sayAll` renders all seven languages at once), so a
   word is testable the moment it is seeded — no fixtures to write.
   - **Find the file by role and extend its exhaustive table.** Where a role already keeps a "every
     word renders" table, add the new concept to it rather than starting a new `describe`:
     - **adjective** → `adjectives.test.ts`, the `EVERY_ADJECTIVE` table (add `[id, en]`, keep it
       sorted); add an Italian pre-/post-nominal position case if the word's placement is notable.
     - **verb** → `verb.test.ts`, the Italian resultative `IT` table (add `[id, it]`). Get the
       essere-vs-avere auxiliary and, for essere verbs, the feminine participle agreement (`-a`)
       right — that table is the check that the verb's compound past is correct.
     - **noun / adverb / pronoun** → `subject.test.ts` / `nounPhrase.test.ts` (nouns),
       `coordination.test.ts` or the nearest feature file otherwise. No exhaustive table exists yet,
       so pin the new word in a small `test.each` or a single `expect(sayAll(...))` that asserts its
       surface form — article, gender, plural, reading — in every language.
   - **Assert the paradigm, not just that it renders.** A noun test should exercise its plural and
     (Romance/German) gender agreement; a verb test, the persons and tenses its languages inflect; an
     adjective, its agreement. Match the depth of the neighbouring cases in the file.
   - **Run them:** `npm run test:unit` from the repo root (or `npx vitest run <file>` for one file).
     Pin the *actual* rendered output — run first, read what the engine produces, assert that — never
     guess the foreign-language strings.

## A verb's language-specific columns

A few verb columns belong to **one language's lexeme**, as the noun's below do: ordinary `forms` keys
that only the engine reading them knows about, and a lexeme without one is the regular case.

| column | language | what it does |
| --- | --- | --- |
| `honorific`, `honorific_masu_present`, `honorific_te`, `honorific_nai` | ja | The **尊敬語** word, said when the subject is **someone else's relative** (あなたのお母さんは召し上がります, P11-E1). Automatic, in a polite main clause only — a relative, content, adverbial or citation clause keeps the plain verb. |
| `humble`, `humble_masu_present`, `humble_te`, `humble_nai` | ja | The **謙譲語** word, said when the plan sets `VerbPhrase.humble` and the subject is the 1st person or one's own relative (父は参ります, P11-E1 D4). Ignored for any other subject. |

Seed a register only where the verb has a **suppletive** word a dictionary gives as its 尊敬語 or
謙譲語 (召し上がる, いらっしゃる, なさる, おっしゃる; いただく, 参る, いたす, 申す, 差し上げる), and cite the
sense in a comment beside it — the productive お〜になる / お〜する is not seeded. The four columns are
the forms every polite path conjugates from, and the ます form is stored because the stem is
irregular (いらっしゃいます). Each takes a `_reading` where the word has kanji (`honorific_reading`,
`humble_masu_present_reading`, …); a kana word takes none, and none of the plain verb's is kept. BE's
own lexeme is the copula, so its existential いる carries the pair in the engine (`JA_IRU`:
いらっしゃる / おる).

## A noun's language-specific columns

A few noun columns belong to **one language's lexeme**, not to the concept: the fact they record is a
fact about that language's word. They are ordinary `forms` keys, so nothing but the engine that reads
one has to know about it, and a lexeme without one is simply the regular case.

| column | language | what it does |
| --- | --- | --- |
| `kinship: '1'` | it | Drops the article before a possessive on the singular: "**mio** padre", but "**il mio** cane", "**il loro** padre", "i miei fratelli", "il mio vecchio padre" (A85). Italian itself splits the meaning — "mia madre" but "**la mia** mamma" — so it is flagged word by word, not by concept. |
| `weak: '1'` | de | An n-declension masculine: -(e)n in every case but the nominative singular ("der Junge", "den/dem/des Jungen"), and no genitive -(e)s. |
| `adjectival: '1'` | de | An **adjectival noun**, which declines like an adjective: *der Verwandte*, *ein Verwandter*, *einem Verwandten*, bare plural *Verwandte* (P11 D8). Seed `base` as the bare **stem** (`Verwandt`), and seed `plural` — and `fem` for the feminine — as that same stem, since the ending is what carries the number and gender. The noun rules (genitive -(e)s, weak -(e)n, dative-plural -n) do not apply. |
| `possessed`, `possessed_plural` | fr, de, ja | The word once the thing has an **owner**: "ma **femme**" but "une **épouse**", "meine **Frau**" but "eine **Ehefrau**", and Japanese 母 for one's own mother against 母親 for nobody's (P11 D2/D6). Applies under any possessor at all. |
| `honorific`, `plural_honorific` | ja | The word for **someone else's** relative: お母さん, 奥さん, ご主人, ご両親 (P11 D2). It is chosen for a possessor who is a person outside the speaker's family; a missing column falls back to `possessed`, then to `base`. |
| `kin: '1'` | ja | Marks the noun as a **relative**, which is what lets one's own family carry down a genitive chain (私の兄の妻 → 兄の妻) and what lets 私の drop in front of it (P11 D3/D4). Every Japanese kin noun carries it — including MOM's お母さん, which has no `possessed` or `honorific` of its own. |
| `with_<ADJECTIVE>` | ja | The one word that says the noun **and** an adjective: 兄弟 with ELDER is 兄, with YOUNGER 弟 (P11 D5). The adjective is then not said again. Each takes `with_<ADJECTIVE>_reading` and, where someone else's has its own word, `with_<ADJECTIVE>_honorific` (+ `_reading`). A head with no column for the adjective renders it as itself (上の息子). |

Each of the surface columns above takes a `_reading` of its own in Japanese (`possessed_reading`,
`honorific_reading`, `plural_honorific_reading`): the furigana follows whichever word is selected, and
a column with no reading leaves none behind — お母さん must not be read ははおや.

## Definition of done

- The concept appears in `npm run seed`'s count and the backend boots without throwing.
- All seven languages have forms, and the word's paradigm is complete for its role — an adjective
  that agrees, a verb that conjugates across the persons and tenses its language inflects. A concept
  that renders in only some of the phrases it is grammatically eligible for is not seeded, it is
  half-seeded.
- It shows up in the word palette under its role, and can be picked and built into a phrase that
  translates in every language. That is the check that matters: the corpus exists to be composed
  with.
- Every new concept is pinned by a unit test in [packages/engine/test/](packages/engine/test/), and
  `npm run test:unit` passes. A word with no test is not seeded, it is seeded and unguarded.
- Seeding produces data and its tests; it never edits `.tsx`.
