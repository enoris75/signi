# B06. Grammar words — NOUN, VERB, ADJECTIVE, ADVERB, PRONOUN

**Blocked on:** the verbs that define a part of speech (name, describe, modify, express, stand for)
are not seeded. The genus WORD **is** seeded.

## Seed first (verbs, all 7 langs)

- `NAME` — to be the name of. (NOUN → "a word that names things")
- `DESCRIBE` — to say what something is like. (ADJECTIVE → "a word that describes a noun")
- `MODIFY` — to qualify another word. (ADVERB → "a word that modifies a verb")
- `EXPRESS` — to convey. (VERB → "a word that expresses an action")
- `STAND_FOR` / `REPLACE` — to stand in for. (PRONOUN → "a word that replaces a noun phrase")

## Unlocks (genus WORD + relative clause)

| concept | plan | gloss |
|---|---|---|
| NOUN | `whoGloss('WORD', 'NAME', 'OBJECT_THING')` | a word that names objects |
| ADJECTIVE | `whoGloss('WORD', 'DESCRIBE', 'NOUN')` | a word that describes nouns |
| ADVERB | `whoGloss('WORD', 'MODIFY', 'VERB')` | a word that modifies verbs |
| VERB | `whoGloss('WORD', 'EXPRESS', <ACTION>)` | a word that expresses actions |
| PRONOUN | `whoGloss('WORD', 'STAND_FOR', 'NOUN')` | a word that stands for nouns |

Note: these definitions reference other grammar concepts (NOUN, VERB) that are themselves being
localized here — fine, since each is independently seeded; the relative clauses don't recurse.

## Done

**2026-07-18.** Seeded the five defining verbs — `NAME`, `DESCRIBE`, `MODIFY`, `EXPRESS`, and
`REPLACE` (the clean transitive chosen over the phrasal `STAND_FOR`; kept as its `synonym`) — plus
the abstract noun `ACTION` to fill VERB's object slot, in all 7 languages
([verbs/transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts),
[verbs/nonfinite.ts](../../../packages/backend/src/concepts/verbs/nonfinite.ts),
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts)). German uses non-separable stems
(`benennen`, `beschreiben`, `modifizieren`, `vermitteln`, `ersetzen`) so the finite form stays whole
at the end of a verb-final relative clause. That turned this B into an A, authored the same turn.

Authored five `definition: whoGloss('WORD', <verb>, <object>)` plans on the grammar nouns in
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts). Rendered strings:

| concept | plan | en | de |
|---|---|---|---|
| NOUN | `whoGloss('WORD', 'NAME', 'OBJECT_THING')` | a word that names objects | ein Wort, das Gegenstände benennt |
| ADJECTIVE | `whoGloss('WORD', 'DESCRIBE', 'NOUN')` | a word that describes nouns | ein Wort, das Substantive beschreibt |
| ADVERB | `whoGloss('WORD', 'MODIFY', 'VERB')` | a word that modifies verbs | ein Wort, das Verben modifiziert |
| VERB | `whoGloss('WORD', 'EXPRESS', 'ACTION')` | a word that expresses actions | ein Wort, das Handlungen vermittelt |
| PRONOUN | `whoGloss('WORD', 'REPLACE', 'NOUN')` | a word that replaces nouns | ein Wort, das Substantive ersetzt |

Other languages (it/fr/es/ja/pt) all render — e.g. VERB it "una parola che esprime azioni", ja
"動作を表す単語", pt "uma palavra que exprime ações". Backend boots clean with all 7 present.
Seed pinned by unit tests (verb.test.ts IT resultative table + subject.test.ts ACTION); five e2e
tooltip assertions added (definition-tooltip.spec.ts, one per concept, EN + one other language).
`npm run test:unit` and `npm run test:e2e` both green.
