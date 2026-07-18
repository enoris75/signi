# C07. Places — HOUSE, HOME, MARKET, PRISON (locative relative clause)

**Blocked on:** the engine cannot render a **locative relative clause** — one whose head noun fills a
*where* slot rather than the subject or object gap. Every distinguishing definition for these place
nouns is locative:

| concept | intended gloss | head fills |
|---|---|---|
| HOME | a place **where** one lives | location of `live` |
| MARKET | a place **where** one buys and sells | location of `buy`/`sell` |
| PRISON | a building **where** people are confined | location of `confine` |

## Why seeding words is not enough

This was catalogued as B03 (needs-seed) because it also lacks a place genus (`PLACE`/`BUILDING`) and
the verbs `LIVE`/`DWELL`, `CONFINE`/`IMPRISON`. But seeding those does **not** unblock it, so it is
really a C.

The relative-clause helper `whoGloss(genus, verb, object?)` fills the clause's **subject** gap: the
head noun *is* the actor. `whoGloss('PLACE', 'LIVE')` therefore renders "a place that lives" — the
place is made the subject of *live*, which is wrong. C04 added the *impersonal subject* ("one eats"),
but that is still a subject gap; the actor is just generic.

A locative gloss needs the head to fill an **oblique/locative** slot instead — "a place **where**
[someone] lives," where the clause has its own (generic) subject and the head is co-indexed with a
locative adjunct. That co-indexing target does not exist in the relative-clause renderer:

- `RelativeClause` only models a subject gap (optionally with a direct object). There is no gap role
  for a locative/oblique complement.
- Even with such a role, each of the 7 target languages realises the locative relativiser
  differently (English *where*, French *où*, German *wo*/*in dem*, Japanese relative-clause + place
  noun, …), so the renderer needs per-language locative-relativiser surface forms.

## To unblock

1. Extend the relative-clause construct with a **locative (oblique) gap** role, co-indexing the head
   with a locative adjunct in the embedded clause.
2. Add per-language locative-relativiser realisation (English *where*, etc.).
3. Then seed `PLACE`/`BUILDING`, `LIVE`/`DWELL`, `CONFINE`/`IMPRISON` and author the glosses above.

Until step 1–2 exist, these nouns stay on the English literal.
