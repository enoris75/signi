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
     `proper: true` for proper nouns.
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

## Definition of done

- The concept appears in `npm run seed`'s count and the backend boots without throwing.
- All seven languages have forms, and the word's paradigm is complete for its role — an adjective
  that agrees, a verb that conjugates across the persons and tenses its language inflects. A concept
  that renders in only some of the phrases it is grammatically eligible for is not seeded, it is
  half-seeded.
- It shows up in the word palette under its role, and can be picked and built into a phrase that
  translates in every language. That is the check that matters: the corpus exists to be composed
  with.
- Seeding produces data; it never edits `.tsx`.
