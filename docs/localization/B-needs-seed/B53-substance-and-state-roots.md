# B53. Substances, states and the stuff nouns — seed the genera above them

_(from the unsorted sweep of 2026-09-22. Nine nouns that sit at the top of the corpus with
nothing above them, and that a single seeded genus would drop one level and make glossable.
Same pattern as [B52](B52-natural-kind-genera.md); split from it because these are stuffs and
states, not kinds of thing, and they want different genera.)_

## Seed first

Proposed forms, for the seed author to check — suggestions, not renders.

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| SUBSTANCE | noun | what things are made of; matter | substance | sostanza | substance | Stoff | sustancia | 物質 | substância |
| STATE | noun | the way a thing is at a time | state | stato | état | Zustand | estado | 状態 | estado |
| GAS | noun | a substance that is neither solid nor liquid | gas | gas | gaz | Gas | gas | 気体 | gás |
| SOLID | adjective | keeping its shape, neither liquid nor gas | solid | solido | solide | fest | sólido | 固体の | sólido |
| BREATHE | verb | to draw air in and let it out | breathe | respirare | respirer | atmen | respirar | 呼吸する | respirar |
| EXCHANGE | verb | to give one thing and take another for it | exchange | scambiare | échanger | tauschen | intercambiar | 交換する | trocar |
| ENCLOSE | verb | to shut a space in on its sides | enclose | racchiudere | enclore | umschließen | encerrar | 囲む | encerrar |
| HEAR | verb | to take in through the ears | hear | sentire | entendre | hören | oír | 聞く | ouvir |

Two genus nouns, one kind noun, one adjective, four verbs. SUBSTANCE and STATE are the two that
earn their keep: between them they take eight of the twelve.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| AIR | `patientGloss('GAS', 'BREATHE')` at `bare` | gas that one breathes |
| LIQUID | `glossOf('SUBSTANCE', …)` with SOLID negated — see **Not solved** | — |
| GROUND | `glossOf('SUBSTANCE', 'SOLID')` at `bare` | solid substance |
| MATERIAL | `patientGloss('SUBSTANCE', 'MAKE')` at `bare` | substance that one makes with — see **Not solved** |
| SOUND | `patientGloss('CONCEPT', 'HEAR')` at `bare` | concept that one hears |
| LIGHT | `patientGloss('CONCEPT', 'SEE')` at `bare` | concept that one sees |
| MONEY | `patientGloss('OBJECT_THING', 'EXCHANGE')` at `bare` | object that one exchanges |
| WALL | `whoGloss('OBJECT_THING', 'ENCLOSE', 'PLACE')` | an object that encloses places |
| LIFE | `glossOf('STATE', …)` on LIVE — see **Not solved** | — |
| DEATH | `glossOf('STATE', …)` as LIFE's end — see **Not solved** | — |
| FEELING | `patientGloss('STATE', 'FEEL')` at `bare` | state that one feels |
| CONTENT | `patientGloss('OBJECT_THING', 'INCLUDE')` at `bare` | object that one includes |
| BRACKET | `whoGloss('WORD', 'ENCLOSE', 'PHRASE')` | a word that encloses phrases |

Eight of the nine land on shapes the engine renders today and become an A with the seed, and
ENCLOSE pays for itself twice — WALL and BRACKET.

**BRACKET is in this ticket because of a register accident.** It is one of the console's own words
and would otherwise have gone to [B57](B57-ui-nouns-needing-a-word.md), but the only seeded verb
that fits is CONFINE, which means *to imprison*: `whoGloss('WORD', 'CONFINE', 'PHRASE')` renders de
*ein Wort, das Phrasen **inhaftiert*** and pt *uma palavra que **encarcera** frases* — a word that
jails phrases. ENCLOSE is the neutral verb the four Romance languages and German all want, and WALL
needs it anyway.

**FEELING is the one to check first.** [C05](../done/C05-non-distinguishing-genera.md) probed it as
`patientGloss('CONCEPT', 'FEEL')` — "a concept that one feels" — and left it on the literal, because
CONCEPT is the wrong parent for an emotion and its own seed says so. STATE is the parent C05 was
missing: *a state that one feels* is what a feeling is, and it does not restate CONCEPT. If that
reads, C05's FEELING entry retires and this ticket says so.

## Not solved by this seed

1. **LIQUID and DEATH need a negation on an adjective or a noun in a fragment.** A liquid is a
   substance that is *not* solid; death is the *end* of life. `GlossParts.negative` negates a
   clause, and these are verbless fragments, so there is nothing to negate. Both go to
   [C26](../C-needs-engine/C26-root-nouns-on-the-literal.md) unless the authoring probe finds a
   copular shape that takes the negative.
2. **LIFE is the state of LIVE**, which needs a state noun derived from a verb — "the state of one
   who lives" — a genitive on a relative clause head. C26 names the construct.
3. **MATERIAL's plan needs an instrumental gap**, not an object gap: a material is what one makes
   *with*, not what one makes. `patientGloss` only gaps the direct object, and no helper gaps a
   complement. That is the same gap [C19](../done/C19-verbs-needing-voice-purpose-or-comitative.md)
   worked around with a purpose clause; here there is no clause to hang one on. C26.

## Coverage

Two rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once
authored: FEELING in English and German (and the C05 entry retired in the same change), and WALL in
English and French (a subject-gap relative with a bare-plural object, *qui enclôt des lieux*).
