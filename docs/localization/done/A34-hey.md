# A34. HEY — a word with which one calls a person

_(filed on 2026-09-24 for the concepts [P09-E24–E43](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E24-ranks-201-400.md)
seeded with no `definition`. HEY is the only concept of the `interjection` role, which
[P09-E30](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E30-interjections.md) built. Its
Done item 4 left it on the literal ("a word said to catch someone's attention") because "a word that
asks attention" and "a word that calls attention" did not compose, and waited for a CATCH or ATTRACT
verb. The **instrument gap** on CALL, with a person as its object, composes in all seven. No new
word, no new construct. **Read [Where the tooltip shows](#where-the-tooltip-shows) first**: today
no surface displays it.)_

## Plan

Inline on the HEY block in [concepts/interjections.ts](../../../packages/backend/src/concepts/interjections.ts).
`instrumentGloss` is private to `nouns.ts`, so either export it or write the plan out, as below:

| concept | plan | gloss (en) |
|---|---|---|
| HEY | WORD indefinite + `relative: { headRole: 'instrumental', subject: GENERIC_PERSON, verbPhrase: { verb: 'CALL' }, directObject: PERSON indefinite }` (`instrumentGloss('WORD', 'CALL', 'PERSON')`) | a word with which one calls a person |

## Vocabulary

All seeded: WORD, CALL (B60; "to cause a person to come", *chiamare, appeler, rufen, llamar*, 呼ぶ,
*chamar*), PERSON and the generic subject. The instrument gap is C26's (QUESTION ships on it: "a
phrase with which one asks").

## Probe renders (2026-09-24, engine source at 2c4cee46, lexicon seeded in memory)

Every row was checked against all 497 shipped definitions in all seven languages; none collides.

| candidate | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **a word with which one calls a person** (proposed) | a word with which one calls a person | una parola con la quale si chiama una persona | un mot avec lequel on appelle une personne | ein Wort, mit dem man eine Person ruft | una palabra con la que se llama a una persona | 人を呼ぶ単語 | uma palavra com a qual se chama uma pessoa |
| a word with which one calls | a word with which one calls | una parola con la quale si chiama | un mot avec lequel on appelle | ein Wort, mit dem man ruft | una palabra con la que se llama | 呼ぶ単語 | uma palavra com a qual se chama |
| a word that one says to a person | a word that one says to a person | una parola che si dice a una persona | un mot qu'on dit à une personne | ein Wort, das man einer Person sagt | una palabra que se dice a una persona | 人に言う単語 | uma palavra que se diz a uma pessoa |
| a word that calls attention (E30's) | a word that calls attention | una parola che chiama attenzione | un mot qui appelle de l'attention | ein Wort, das Aufmerksamkeit ruft | una palabra que llama atención | 注目を呼ぶ単語 | uma palavra que chama atenção |

Readings to judge on authoring:

1. **The person is the object, not the attention.** E30's row failed because attention is not what
   *chiamare* or 呼ぶ take (*chiama attenzione*, 注目を呼ぶ, fr *appelle de l'attention*). Calling a
   person is what all seven say plainly, and the Spanish personal *a* (*llama a una persona*) and
   the Japanese 人を呼ぶ come out right.
2. **CALL is a summons** ("to cause a person to come"), and *hey* catches attention more often than it
   brings anyone over. The gloss is the nearer half of the seed's literal; the other half waits for
   the CATCH / ATTRACT verb E30 named, which would buy nothing else in the corpus.
3. **Without the object** ("a word with which one calls") German *mit dem man ruft* and Japanese
   呼ぶ単語 read as shouting, not calling someone. **"A word that one says to a person"** is any word.
4. It does not say the word back (*hey, ehi, hé, hey, oye*, ねえ, *ei*): Spanish *oye* is the
   imperative of *oír*, which the gloss does not use.

## Mutual definitions

HEY stands on WORD (no definition), CALL (on CAUSE_VERB, PERSON and COME) and PERSON. None names HEY.

## Where the tooltip shows

**Nowhere yet.** `buildConceptDefinitions` ([definitions.ts](../../../packages/backend/src/definitions.ts))
renders every concept that has a plan, whatever its role, so the boot check would render and verify
HEY's gloss, and `/api/concepts` serves it: `GET /api/concepts?role=interjection` lists HEY with its
labels ([index.test.ts:92](../../../packages/backend/src/index.test.ts#L92)), and the unfiltered list
includes it. But no picker asks for the role. `PickerRole`
([shared/src/index.ts:11](../../../packages/shared/src/index.ts#L11)) is every role but
`interjection`, and it types the word palette and the console's `WordSpec`;
[ConceptPalette.tsx:22](../../../packages/frontend/src/components/ConceptPalette.tsx#L22) keeps an
`interjection` entry only to stay total; the word map
([WordMap.tsx:75](../../../packages/frontend/src/components/WordMap/WordMap.tsx#L75)) colours HEY and
shows no definition. The tooltips are drawn by `useConceptDefinition` in the palette, the builder's
`ConceptOption`, the pronoun chooser and the console's completion list, and none of them lists an
interjection.

So the gloss can be authored now, and it will show when E30's follow-up lands (a picker heading and a
builder control for the role, which needs an INTERJECTION grammar noun). Authoring it first is what
every other concept got: the tooltip is ready the day the picker is.

## Not solved

Nothing: HEY is the ticket's one concept.

## Coverage

There is no tooltip to click, so no e2e row until a picker lists the role. Pin the gloss in
[interjection.test.ts](../../../packages/engine/test/interjection.test.ts) (the definition in all
seven), and extend the `/api/concepts?role=interjection` test in
[index.test.ts](../../../packages/backend/src/index.test.ts) to expect HEY's composed
`definitions`. [sweep-definitions.test.ts](../../../packages/engine/test/sweep-definitions.test.ts)
must pass.

## Done

2026-09-24. Shipped the proposed row, **a word with which one calls a person**, written out inline
on the HEY block in [concepts/interjections.ts](../../../packages/backend/src/concepts/interjections.ts)
(WORD indefinite, `headRole: 'instrumental'`, generic subject, CALL, PERSON indefinite as object);
`instrumentGloss` stays private to nouns.ts. Re-probed against the current engine: every language
matches the probe table.

| en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|
| a word with which one calls a person | una parola con la quale si chiama una persona | un mot avec lequel on appelle une personne | ein Wort, mit dem man eine Person ruft | una palabra con la que se llama a una persona | 人を呼ぶ単語 | uma palavra com a qual se chama uma pessoa |

- The backend boots clean with it, and `/api/concepts` (unfiltered and `?role=interjection`) serves
  all seven.
- Unit pins: "HEY's definition" in
  [interjection.test.ts](../../../packages/engine/test/interjection.test.ts), and the
  `?role=interjection` test in [index.test.ts](../../../packages/backend/src/index.test.ts) now
  expects the composed `definitions`.
- No e2e row: no picker lists the interjection role yet (see
  [Where the tooltip shows](#where-the-tooltip-shows)); the tooltip shows once E30's follow-up adds
  one.
- [sweep-definitions.test.ts](../../../packages/engine/test/sweep-definitions.test.ts) passes. No
  engine change.
