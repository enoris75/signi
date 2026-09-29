# P04-E15. Complements, relatives and coordination

**Feature:** every complement role renders with its Romansh preposition; relative clauses and
coordination render in all three.
**Shape:** each fork's `complementsPhrase`, `prepObjectText`, `relativeText` and `coordinate`,
re-sourced. The prepositions P04 §2.3 drafts for RG, per variety from E3's sources.
**Scope:** engine, three folders; the verbs' syntactic keys in E4–E6. Phase 3.
**Status:** **shipped for `rm-rumgr`, 2026-09-27** and **for `rm-sursilv`, 2026-09-27** — see [Done](#done); Vallader waits on its fork (E8). Filed 2026-09-27 from P04 §2.3 and phase 3. Depends on E10–E14.

## Why

P04 phase 3's done-when: *"every sentence suite has three Romansh expectations under the preview
gate."* Most suites exercise complements.

## Design

### D1. The complement table (RG draft, *verify all*)

| complement | RG | notes |
|---|---|---|
| locative | *en*; *sin, sut, davos, davant, enturn* | |
| direction | *a / en* for places; ***tar*** for a person | the animate split mirrors `it` *da* / `es` *hacia* |
| source | *da* | |
| route | *tras* | |
| cause | *pervia da / grazia a / per cuolpa da* | the three sentiments |
| manner | similative *sco*; measure/means *cun* | |
| instrumental | *cun* | P12's hosted instrument included |
| terminus | *a* | |
| predicative | none | Sursilvan's predicative form (E9) |

**Open point (P04 §2.3):** the process-level instrumental needs a non-gerund means construction. Pin
`test.fails` until E3's sources or E19 give one.

### D2. Relatives

*che*; *nua* for place; *cun il qual / da la quala* after other prepositions *(verify)*. Each idiom from
its style sheet.

### D3. Coordination

*e, ma, u*. **Open point:** whether any variety has a euphonic *ed* before a vowel, which `it` has and
the fork would otherwise keep silently.

## Tests

Each suite: one row per complement role, a subject and an object relative, a prepositional relative,
the three coordinators.

## Verification

Engine suite green; a random-phrase run (`/test-random-phrases`) shows no empty Romansh row for a plan
whose words are all seeded.

## Out of scope

Verb-second after a fronted complement (D9, E16).

## Done

Shipped for `rm-rumgr` 2026-09-27.

- **D1, the complement table** as drafted, every word *(verify)*: locative *en* and the relations of
  `spatialHead` (*sut, sur, enturn, davos, davant, sin, tranter, cunter, tras*), none contracting;
  direction *a* for a place, *tar* for a person, *en* for a land (*en Europa*), *a chasa* for HOME;
  source *da* (*davent da* under RUN / JUMP and for a person under a goal-taking verb, in `it`'s *via*
  slot); route *tras*; cause *pervia da / grazia a / per cuolpa da*; manner *sco / cun / a / en*;
  instrument and companion *cun*, denied *senza*; terminus *a*; purpose *per*; topic *da* or the verb's
  own (*patratgar vi da*: *vi dal giat*); opponent *cunter*; temporal *a, avant, suenter, durant, fin
  a, dapi, entaifer, per*, *ago* as *avant* before the phrase. A pronoun is tonic after any of them
  (*cun el*, *ad el*, *da ella*). The process-level instrumental says *cun* + the infinitive; D1's open
  point stays a `test.todo`.
- **D2, relatives:** invariant *che*, *ch'* before a vowel; the relative clause's own subject always
  spoken (*il cudesch che jau legel*); after a preposition *il qual / la quala / ils quals / las qualas*
  agreeing with the head (*sut la quala*, *cun il qual*, *al qual*, *dal qual* for the passive's agent);
  *nua* for a plain place. The possessor relative is `possessed da il qual` (*il num dal qual*)
  *(verify)*. The experiencer's dative is fronted, a pronoun one too: *al chaun plascha la mieur*, *a
  mai plascha*.
- **D3, coordination:** *e, u, ma*, *numnadamain, perquai, e lura, dentant*; ruled **no euphonic
  *ed*** before a vowel (*il giat e l'um*), pinned as the engine's row *(verify)*. The correlative is
  *tant … sco*.

Tests: `rm-rumgr.test.ts` "P04-E15" — one row per complement role, subject, object, prepositional,
place, terminus and agent relatives, the coordinators; D1's `test.todo`.

### Sursilvan, 2026-09-27

Every word *(verify)*; where the style sheet is silent the implementer's Sursilvan. Locative *en* (*el
cudisch*, *en la casa*), *sut, sur, entuorn, davos, davon, sin, denter, encunter, tras*; direction *a*,
***tier*** for a person, *en* for a land, *a casa*; source *da*, *naven da* under a running verb; cause
***per mor da*** / *grazia a* / *per cuolpa da*; comitative *cun* (*cun mei*); terminus *a* (*ad el*);
purpose *per*; topic *da*; opponent *encunter*; temporal *avon, suenter, duront, tochen, dapi, entaifer,
per*. Relatives *che* (*ch'* before a vowel), *nua*, *il qual* after a preposition (*al qual*, *dil
qual*). Coordinators *e* / ***ed*** before a vowel (style sheet, where RG has no *ed*), ***ni*** (or),
***mo*** (but), *numnadamein, perquei, e lu, denton*. D1's process-level instrumental stays a
`test.todo`.

### Vallader, 2026-09-27

The style sheet has no preposition table: every word below is the author's draft
*(verify)*. Locative *in* (contracting: *illa chasa, i'l cudesch*), *suot, sur, intuorn, davo, davant,
sün, tanter, cunter, tras*; direction *a*, ***pro*** for a person, *in* for a land, *a chasa*; source *da*,
*davent da*; cause *pervia da / grazcha a / per cuolpa da*; *cun*, *sainza*; temporal *avant, davo, dürant,
daspö, infra, fin a*. **D2:** a subject relative is ***chi***, an object one ***cha*** (*il giat chi mangia*,
*la mür cha'l giat mangia*, *il cudesch ch'eu leg*), *il qual* agreeing after a preposition, ***ingio*** for
a place. **D3:** *e, o, ma*, *tuottüna* (however); no euphonic *ed*. D1's process-level instrumental stays
a `test.todo`.
