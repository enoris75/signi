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
