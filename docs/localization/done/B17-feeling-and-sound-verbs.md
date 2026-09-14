# B17. Feeling & sound verbs — LOVE, CRY, CRY_OUT

_(split out of [B08](B08-verb-definitions.md).)_

Two small genera. This batch overlaps the **emotion gap** that
[B07](B07-scalar-adjective-definitions.md) deferred for HAPPY/SAD/TIRED/HUNGRY: emotion
nouns are not seeded, and no participial/copular construct renders "feeling joy". Seeding the nouns
here would also unblock those four adjectives.

## Seed first (2 verbs + 2 nouns)

| concept | role | gloss | note |
|---|---|---|---|
| FEEL | verb, transitive | to experience an emotion | genus for LOVE |
| PRODUCE_SOUND | verb, intransitive | to make a sound | genus for CRY, CRY_OUT |
| AFFECTION | noun | warm feeling toward someone | differentia for LOVE |
| TEAR | noun | a drop of liquid from the eye | differentia for CRY (needs plural) |

German FEEL should be *fühlen*: *empfinden* is already PERCEIVE's German verb
([B11](B11-perception-verbs.md)).

## Unlocks

| verb | plan | gloss (en) | status |
|---|---|---|---|
| LOVE | `infinitiveGloss('FEEL', 'AFFECTION')` | to feel affection | additive once seeded |
| CRY | `infinitiveGloss('PRODUCE_SOUND', 'TEAR')` | — shape is wrong; see note | ⚠ |
| CRY_OUT | PRODUCE_SOUND + manner LOUDLY | to produce sound loudly | ⚠ manner adverb |

Notes:
- **CRY** ("to weep; to shed tears") is not sound production — it wants a separate SHED genus over
  TEAR, or it stays literal. Do not force it under PRODUCE_SOUND.
- **CRY_OUT**'s differentia is a manner adverb (LOUDLY, not seeded). Confirm `mannerGloss` composes
  inside an infinitive plan — same open question as [B13](B13-contact-verbs.md)'s BEAT.

LOVE alone is a clean additive win; the other two may well end up as Cs.

## Done

**2026-09-14.** All three verbs are authored. None became a C.

| concept | role | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| FEEL | verb | feel | provare | éprouver | fühlen | sentir | 感じる | sentir |
| SHED | verb | shed | versare | verser | vergießen | derramar | 流す | derramar |
| PRODUCE | verb | produce | produrre | produire | erzeugen | producir | 出す | produzir |
| AFFECTION | noun | affection | affetto | affection | Zuneigung | afecto | 愛情 | afeto |
| TEAR | noun | tear | lacrima | larme | Träne | lágrima | 涙 | lágrima |
| SOUND | noun | sound | suono | son | Geräusch | sonido | 音 | som |
| LOUD | adjective | loud | forte | fort | laut | fuerte | 大きい | alto |

| verb | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| LOVE | to feel affection | provare affetto | éprouver affection | Zuneigung fühlen | sentir afecto | 愛情を感じる | sentir afeto |
| CRY | to shed tears | versare lacrime | verser larmes | Tränen vergießen | derramar lágrimas | 涙を流す | derramar lágrimas |
| CRY_OUT | to produce loud sounds | produrre suoni forti | produire sons forts | laute Geräusche erzeugen | producir sonidos fuertes | 大きい音を出す | produzir sons altos |

Changes against the plan:
- **CRY glosses on a SHED genus**, the option the plan left open: "to shed tears", a collocation
  every language has (*versare lacrime*, *Tränen vergießen*, 涙を流す).
- **CRY_OUT uses PRODUCE + SOUND + LOUD instead of PRODUCE_SOUND + LOUDLY.** "To produce loud sounds"
  needs no manner adverb, and PRODUCE, SOUND and LOUD are each words the corpus can reuse. A
  one-verb PRODUCE_SOUND genus could not be reused.
- German FEEL is *fühlen*, as planned. German SHED is the inseparable *vergießen*.
- Engine overrides: it PRODUCE subjunctive stem *produce-* (*producesse*), and es FEEL subjunctive
  *sintamos / sintáis*.
- The emotion nouns that would unblock B07's HAPPY/SAD/TIRED/HUNGRY are still not seeded;
  AFFECTION alone does not cover them.
- LOUD in pt (*alto*) and ja (大きい) means "loud" only on a sound noun.

Pinned by [genus-verbs.test.ts](../../../packages/engine/test/genus-verbs.test.ts), [verb.test.ts](../../../packages/engine/test/verb.test.ts),
[adjectives.test.ts](../../../packages/engine/test/adjectives.test.ts) (LOUD),
[nounPhrase.test.ts](../../../packages/engine/test/nounPhrase.test.ts) (AFFECTION),
[subject.test.ts](../../../packages/engine/test/subject.test.ts) (TEAR, SOUND), and [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) (LOVE
en+it, CRY en+de, CRY_OUT en+fr).
