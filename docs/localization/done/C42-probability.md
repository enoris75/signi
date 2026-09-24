# C42. PROBABILITY — the dimension PROBABLY scales on

**Kind:** **deliberately left on the English literal**, like the dimension nouns of
[C26](../done/C26-root-nouns-on-the-literal.md) (SIZE, HEIGHT, QUALITY, STRENGTH, AGE, TEMPERATURE,
and SPEED, which FAST scales on). PROBABILITY is the noun
[P09-E39](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E39-sentence-adverbs.md) seeded so
that PROBABLY could be glossed "with high probability" (`mannerGloss('PROBABILITY', 'bare', 'HIGH')`);
it is to PROBABLY what SPEED is to FAST.

_(filed on 2026-09-24 for the concepts [P09-E24–E43](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E24-ranks-201-400.md)
seeded with no `definition`. E39's Done called it "a root noun; not probed for a gloss". It is probed
here. It was filed with NEWS, the batch's other root noun, and split from it: NEWS composes today,
[A32](A32-news.md).)_

## The concept

| concept | words | description | verdict |
|---|---|---|---|
| PROBABILITY | probability, probabilità, probabilité, Wahrscheinlichkeit, probabilidad, 確率, probabilidade | "how likely something is to be or to happen" | **literal by design** |

It is an ordinary noun (no `slot`), so the noun picker offers it and the literal shows as its tooltip.

## Probe renders (2026-09-24, engine source at 2c4cee46, lexicon seeded in memory)

Every row was checked against all 497 shipped definitions in all seven languages; none collides.
Rows with a * use POSSIBILITY, which is not seeded (forms below).

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| `glossOf('LEVEL')` | a level | un livello | un niveau | eine Ebene | un nivel | 段階 | um nível |
| LEVEL + `possessorRole: 'whole'` POSSIBILITY, bare * | a level of possibility | un livello di possibilità | un niveau de possibilité | eine Ebene von Möglichkeit | un nivel de posibilidad | 可能性の段階 | um nível de possibilidade |
| the LEVEL + whole a POSSIBILITY * | the level of a possibility | il livello di una possibilità | le niveau d'une possibilité | die Ebene einer Möglichkeit | el nivel de una posibilidad | 可能性の段階 | o nível de uma possibilidade |
| NUMBER + relative INDICATE a POSSIBILITY * | a number that indicates a possibility | un numero che indica una possibilità | un nombre qui indique une possibilité | eine Zahl, die eine Möglichkeit bezeichnet | un número que indica una posibilidad | 可能性を示す数 | um número que indica uma possibilidade |
| `glossOf('POSSIBILITY')` * | a possibility | una possibilità | une possibilité | eine Möglichkeit | una posibilidad | 可能性 | uma possibilidade |

- **LEVEL is the right concept in the wrong words.** Its seed is "a degree on a scale", but B44
  seeded it for the builder's abstraction level, so German is *Ebene* (of *Abstraktionsebene*: a
  plane, a tier) and Japanese 段階 (a step, a stage), neither of which is a degree of likelihood.
  Alone, "a level" says nothing a dimension noun does not.
- **"A level of possibility"** would be the dictionary's "degree of likelihood", and needs
  POSSIBILITY. It inherits LEVEL's German and Japanese (*eine Ebene von Möglichkeit*, 可能性の段階
  "a stage of possibility"), and German writes the undeclinable *von* where the idiom is a
  genitive-free compound (*Möglichkeitsgrad*).
- **"A number that indicates a possibility"** is the mathematical sense (a value between 0 and 1),
  not the everyday one the seed describes, and German *bezeichnet* (INDICATE's *designate*) is not
  what a number does to a possibility.
- **"A possibility"** is a different thing: a probability is how possible something is, not the
  thing that is possible.
- **Every lead needs POSSIBILITY**, which would be a root noun on the literal itself, the same
  distance from POSSIBLE that PROBABILITY is from PROBABLE. Seeding it trades one unglossed root for
  another.

**The C26 test.** A dimension noun is what `dimGloss` and `mannerGloss` scale on: FAST is "at high
speed", GOOD "of high quality", PROBABLY "with high probability". Glossing the dimension by an
adjective or adverb it defines would close a circle ("the degree to which something is probable",
if PROBABLE were seeded, or anything built on PROBABLY). SPEED, SIZE and QUALITY are on the literal
for that reason, and PROBABILITY is their case.

## Candidate forms used above (not seeded)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| POSSIBILITY | possibility | possibilità *f* | possibilité *f* | Möglichkeit *f* | posibilidad *f* | 可能性 (かのうせい) | possibilidade *f* |

Not proposed for seeding: it buys only the rejected rows.

## Mutual definitions

PROBABLY is defined on PROBABILITY and HIGH. Any gloss of PROBABILITY that used PROBABLY (or a
PROBABLE built for it) would make the pair define each other, the scalar kind the catalogue refuses
(WARM / AFFECTION).

## Retires

To [`done/`](../done/) once the verdict is accepted. What would re-open it: a degree noun whose
German and Japanese say a degree (it *grado*, fr *degré*, de *Grad*, es *grado*, ja 度合い, pt
*grau*), a sibling of LEVEL rather than a change to it (the abstraction level needs *Ebene*), with
POSSIBILITY beside it. That would also give the six C26 dimension nouns a genus, so it is a
C26-wide lead, not this ticket's alone.

## Done

2026-09-24. **Literal by design**, verdict accepted. Re-verified against the current engine and seed:
PROBABILITY is seeded with no `definition`; LEVEL still renders *Ebene* / 段階; POSSIBILITY and a
degree noun (DEGREE) are still not seeded, so every lead in the probe table still needs a word the
corpus lacks. One change since filing: **POSSIBLE is now seeded**, but the engine cannot turn an
adjective into a noun ("how possible something is"), and a gloss on POSSIBLE would still need a
degree genus to stand on, so it opens no new lead. PROBABILITY keeps its literal ("how likely
something is to be or to happen"). No file changed but this one; no engine change. The re-open
condition above (a degree noun sibling of LEVEL, plus POSSIBILITY) stands, as a C26-wide lead.
