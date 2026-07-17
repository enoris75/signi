# B04. Possession & containers — POSSESSOR, CONTAINER

**Blocked on:** no ownership / holding verb is seeded.

## Seed first

- `OWN` (verb) — to have as property. (it possedere, fr posséder, de besitzen, es poseer, ja 所有する, pt possuir)
- `HOLD` (verb) — to contain or keep. (it contenere, fr contenir, de enthalten, es contener, ja 保持する/入れる, pt conter)

## Unlocks (genus + relative clause)

| concept | plan | gloss |
|---|---|---|
| POSSESSOR | `whoGloss('PERSON', 'OWN', 'OBJECT_THING')` | a person who owns objects |
| CONTAINER | `whoGloss('OBJECT_THING', 'HOLD', 'OBJECT_THING')` | an object that holds objects |
