# B86. Meet, remember and consider

_(from the [P09-E24](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E24-ranks-201-400.md)
coverage check of 2026-09-24: *meet* (rank 294), *remember* (334) and *consider* (395). None is a
concept at 1229928. Three verbs, two glosses. MEET is literal by design. *Watch* (315), which looked
like a fourth, is covered by LOOK_AT (P09 D1; see the E24 checklist). None goes to a C ticket.)_

## Seed first

Proposed forms, for the seed author to check. **The verbs were not seeded in memory** (see
[B83](B83-sit-stand-walk-run-away-lead.md)'s note); their glosses were rendered.

| concept | role | sense | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| MEET | verb | **E24**, rank 294, D2: to come upon, to get together. Meeting for the first time (*conoscere, faire la connaissance, kennenlernen, conocer*, 知り合う, *conhecer*) is another concept, later. Transitive; ja takes the person with に | meet (met) | incontrare | rencontrer | treffen (trifft; getroffen) | encontrarse con (refl. + `object_prep: 'con'`) | 会う (あう) | encontrar |
| REMEMBER | verb | **E24**, rank 334. Transitive, `stative: true`: the Romance past is the imperfect and Japanese says it with 〜ている (A130, A132), as KNOW does | remember | ricordare | se rappeler (refl.; rappelle) | sich erinnern (refl., `object_prep: 'an'` + acc.) | recordar (recuerdo) | 覚える (おぼえる) | lembrar |
| CONSIDER | verb | **E24**, rank 395. Think about, transitive. The object-predicative *consider X a Y* (*considerare, considérer comme, halten für*) is the objectPredicative's, later | consider | considerare | considérer (considère) | erwägen (erwog, erwogen) | considerar | 考慮する (こうりょする) | considerar |

- **REMEMBER is the one reflexive + prepositional verb in the batch.** German *sich an etwas
  erinnern* needs both the reflexive (C17) and `object_prep` with a governed case. The author's first
  probe is "der Kater erinnert sich an den Hund". If the two do not combine, *(im Gedächtnis)
  behalten* is the fallback, and it is KEEP's word. French *se rappeler* takes a direct object, so
  it avoids *se souvenir de*. Italian, Spanish and Portuguese take the non-reflexive transitive.
- **Japanese 覚える is "to memorize"**; with `stative: true` the engine writes 覚えています, which is
  "remembers". That is why the flag is on the seed.
- **CONSIDER's Japanese is 考慮する** because 考える is THINK's. German *erwägen* is "weigh up";
  *betrachten* is the object-predicative sense.
- **MEET's Spanish *encontrarse con*** is the reflexive + preposition "meet up with". *Encontrar*
  alone is FIND's word.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| REMEMBER | `infinitiveGloss('KNOW', { object: 'FACT', number: 'plural', modifier: 'STILL' })` | still to know facts |
| CONSIDER | `infinitiveGloss('THINK', { complements: { topic: THING indefinite } })` | to think about a thing |

**Two of three.** MEET is literal by design (reading 3).

## Probe renders (2026-09-24, engine source at 1229928, lexicon as seeded)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| REMEMBER | still to know facts | conoscere ancora fatti | connaître encore des faits | noch Tatsachen kennen | conocer todavía hechos | 事実をまだ知る | conhecer ainda fatos |
| CONSIDER | to think about a thing | pensare a una cosa | penser à une chose | an ein Ding denken | pensar en una cosa | ものについて考える | pensar em uma coisa |

The leads that were not taken:

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| MEET: COME + TOGETHER + comitative a person | to come with a person together | venire insieme con una persona | venir ensemble avec une personne | zusammen mit einer Person kommen | venir junto con una persona | 人と一緒に来る | vir junto com uma pessoa |
| MEET: to find a person | to find a person | trovare una persona | trouver une personne | eine Person finden | encontrar a una persona | 人を見つける | encontrar uma pessoa |

Readings to judge on authoring:

1. **REMEMBER is KEEP's shape on KNOW** ("still to have objects" → "still to know facts"). KNOW's
   lexeme picks its acquaintance sense for a noun object (A131: *conoscere, connaître, kennen,
   conocer*), which reads "be acquainted with facts" rather than "know facts" (*sapere*). That is
   acceptable for a gloss and is KNOW's own sense selection.
2. **CONSIDER is THINK with E2's topic**, and THINK's own topic prepositions (*pensare a, denken
   an*) are the ones E2 shipped. Japanese ものについて考える is exactly "think about a thing".
3. **MEET is literal by design.** A meeting is two people coming to the same place, and the corpus
   has no way to say "each other" or "the same place as a person". The comitative lead is
   ACCOMPANY's sense (人と一緒に来る, "come along with a person"), with English word order the probe
   shows. FIND is FIND.

## Not solved by this seed

1. **MEET's gloss** — a reciprocal ("each other") would give it one. None is planned.
2. **The first-meeting sense and CONSIDER's object-predicative sense** — later concepts.

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored:
CONSIDER in German and Italian (THINK's lexical topic preposition in a verb's gloss: *an ein Ding
denken*, *pensare a una cosa*).
