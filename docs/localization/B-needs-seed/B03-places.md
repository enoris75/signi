# B03. Places — HOUSE, HOME, MARKET, PRISON

**Blocked on:** there is no generic place/building genus, and the verbs that define these places
(live, confine) are not seeded.

## Seed first

- `PLACE` or `BUILDING` (noun, genus). PLACE is the more general genus (covers HOME, MARKET);
  BUILDING fits HOUSE, PRISON.
- `LIVE` / `DWELL` (verb) — to have one's home somewhere. (HOME, HOUSE)
- `CONFINE` / `IMPRISON` (verb) — to shut someone in. (PRISON)
- BUY/SELL already seeded (MARKET).

## Unlocks (genus + relative clause)

| concept | plan | gloss |
|---|---|---|
| HOME | `whoGloss('PLACE', 'LIVE')` (subject-gap reads "a place that lives" — needs a non-subject gap; see C04) | a place where one lives |
| MARKET | genus PLACE + relative BUY/SELL | a place where one buys and sells |
| PRISON | genus BUILDING + relative CONFINE | a building where people are confined |

Note: "a place **where** one lives/buys" is a **locative** relative (the head is the place, not the
actor), which needs the impersonal-subject construct (see [C04](../C-needs-engine/C04-impersonal-subject.md)).
So B03 is only partly unblocked by seeding words — flag the C04 dependency when picking it up.
