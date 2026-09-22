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

Two genus nouns, one kind noun, one adjective, four verbs — all eight seeded as proposed. SUBSTANCE
and STATE earn their keep, and ENCLOSE pays for itself twice.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| AIR | `patientGloss('GAS', 'BREATHE')` at `bare` | gas that one breathes |
| LIQUID | `glossOf('SUBSTANCE', …)` with SOLID negated — see **Not solved** | — |
| GROUND | `massGlossOf('SUBSTANCE', 'SOLID')` | solid substance |
| MATERIAL | `patientGloss('SUBSTANCE', 'MAKE')` at `bare` | substance that one makes with — see **Not solved** |
| SOUND | `patientGloss('CONCEPT', 'HEAR')` | a concept that one hears |
| LIGHT | `patientGloss('CONCEPT', 'SEE')` | a concept that one sees |
| MONEY | `patientGloss('OBJECT_THING', 'EXCHANGE')` | an object that one exchanges |
| WALL | `whoGloss('OBJECT_THING', 'ENCLOSE', 'PLACE')` | an object that encloses places |
| LIFE | `glossOf('STATE', …)` on LIVE — see **Not solved** | — |
| DEATH | `glossOf('STATE', …)` as LIFE's end — see **Not solved** | — |
| FEELING | `patientGloss('STATE', 'FEEL')` | a state that one feels |
| CONTENT | `patientGloss('OBJECT_THING', 'INCLUDE')` | an object that one includes |
| BRACKET | `whoGloss('WORD', 'ENCLOSE', 'PHRASE')` | a word that encloses phrases |

Nine of the thirteen land on shapes the engine renders today, and ENCLOSE pays for itself twice —
WALL and BRACKET.

**Only the mass heads take `bare`.** AIR and GROUND are mass and read "gas that one breathes",
"solid substance"; the five whose genus is a count noun (CONCEPT, OBJECT_THING, STATE) take the
indefinite the shape gives by default, because *state that one feels* is not what a count noun
does. That is the same argument [A23](A23-ui-nouns-patient-and-place.md) made, applied in
the other direction.

**BRACKET is in this ticket because of a register accident.** It is one of the console's own words
and would otherwise have gone to [B57](B57-ui-nouns-needing-a-word.md), but the only seeded verb
that fits is CONFINE, which means *to imprison*: `whoGloss('WORD', 'CONFINE', 'PHRASE')` renders de
*ein Wort, das Phrasen **inhaftiert*** and pt *uma palavra que **encarcera** frases* — a word that
jails phrases. ENCLOSE is the neutral verb the four Romance languages and German all want, and WALL
needs it anyway.

**FEELING was checked first, and it reads.** [C05](../done/C05-non-distinguishing-genera.md) probed
it as `patientGloss('CONCEPT', 'FEEL')` — "a concept that one feels" — and left it on the literal,
because CONCEPT is the wrong parent for an emotion and its own seed says so. STATE is the parent C05
was missing: *a state that one feels* is what a feeling is. **C05's FEELING entry is retired by this
ticket**, and the two e2e tests that used FEELING as the example of a concept still on its English
literal now use PERSON, which C26 keeps there by design.

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
   worked around with a purpose clause; here there is no clause to hang one on. C26 — and
   [B57](B57-ui-nouns-needing-a-word.md)'s NAME_NOUN joins it there on the same gap, since a name is
   what one names *with*.

## Coverage

Two rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once
authored: FEELING in English and German (and the C05 entry retired in the same change), and WALL in
English and French (a subject-gap relative with a bare-plural object, *qui enclôt des lieux*).

## Done

Shipped 2026-09-22. **Eight words seeded** (SUBSTANCE, STATE, GAS, the adjective SOLID and the verbs
BREATHE, EXCHANGE, ENCLOSE, HEAR) and **nine glosses** authored on them in
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts).

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| AIR | gas that one breathes | gas che si respira | gaz qu'on respire | Gas, das man atmet | gas que se respira | 呼吸する気体 | gás que se respira |
| GROUND | solid substance | sostanza solida | substance solide | fester Stoff | sustancia sólida | 固体の物質 | substância sólida |
| SOUND | a concept that one hears | un concetto che si sente | un concept qu'on entend | ein Begriff, den man hört | un concepto que se oye | 聞く概念 | um conceito que se ouve |
| LIGHT | a concept that one sees | un concetto che si vede | un concept qu'on voit | ein Begriff, den man sieht | un concepto que se ve | 見る概念 | um conceito que se vê |
| MONEY | an object that one exchanges | un oggetto che si scambia | un objet qu'on échange | ein Gegenstand, den man tauscht | un objeto que se intercambia | 交換する物体 | um objeto que se troca |
| WALL | an object that encloses places | un oggetto che racchiude luoghi | un objet qui entoure des lieux | ein Gegenstand, der Orte umschließt | un objeto que encierra lugares | 場所を囲む物体 | um objeto que cerca lugares |
| FEELING | a state that one feels | uno stato che si prova | un état qu'on éprouve | ein Zustand, den man fühlt | un estado que se siente | 感じる状態 | um estado que se sente |
| CONTENT | an object that one includes | un oggetto che si include | un objet qu'on inclut | ein Gegenstand, den man umfasst | un objeto que se incluye | 含む物体 | um objeto que se inclui |
| BRACKET | a word that encloses phrases | una parola che racchiude frasi | un mot qui entoure des phrases | ein Wort, das Phrasen umschließt | una palabra que encierra frases | フレーズを囲む単語 | uma palavra que cerca frases |

What landed differently from the plan:

1. **ENCLOSE's French and Portuguese are not the words the table proposed.** French *enclore* has no
   passé simple at all, and the corpus conjugates one, so it is *entourer*; Portuguese *encerrar*
   means to close or to end, so it is *cercar*. German *umschließen* is inseparable, which its
   participle shows (*umschlossen*, no ge-). The register argument the ticket made against CONFINE
   holds for all three.
2. **The indefinite, not the bare, head is the default.** The plan wrote "at `bare`" on five glosses
   whose genus is a count noun; see the note under **Unlocks**.
3. **C05's FEELING entry is retired**, and with it the e2e example of a concept on its literal.
4. **SOUND has a gloss and LOUD has one too**, from [A28](A28-scalar-adjectives.md):
   "of great sound" sits above "a concept that one hears" in the picker, with no circularity between
   them.
