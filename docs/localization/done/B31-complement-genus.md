# B31. Complement genus — COMPLEMENT_GRAMMAR over SUBJECT_COMPLEMENT, INSTRUMENTAL, ADVERBIAL_OF_MANNER

_(from the isA audit, 2026-09-14: all three are described as "the complement …", and no complement
noun is seeded.)_

The three seeded complement names have no `isA` and no `definition`: their genus is not a concept, and
[C05](../C-needs-engine/C05-non-distinguishing-genera.md) parks the grammar meta-nouns that lack a
differentia. This task seeds the genus and moves the three under it.
[B23](B23-ui-complement-and-group-names.md) seeded the same noun, `COMPLEMENT_GRAMMAR`, for the
word map's "complements" filter, with the forms below, and the six new complement names under it.
[B24](B24-ui-noun-modifier-chips.md) seeded MEANS. **Nothing is left to seed**: run the two
`/attach`es and author the glosses.

## Seeded (by B23 and B24)

COMPLEMENT_GRAMMAR exists, so there is nothing to `/generalize`:
[`/attach`](../../../.claude/skills/attach/SKILL.md) SUBJECT_COMPLEMENT, INSTRUMENTAL and ADVERBIAL_OF_MANNER
under it.

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| COMPLEMENT_GRAMMAR | noun, countable, synonym `grammar` | a phrase that completes a verb's meaning | complement | complemento (m) | complément (m) | Ergänzung (f) | complemento (m) | 補語 (ほご) | complemento (m) |
| MEANS | noun | that by which something is done | means | mezzo (m) | moyen (m) | Mittel (n) | medio (m) | 手段 (しゅだん) | meio (m) |

The forms are suggestions, not renders. 補語 matches SUBJECT_COMPLEMENT's 主格補語, and 手段 matches
INSTRUMENTAL's 手段語. English *means* has the same form in the plural.

## Hierarchy

| concept | isA before | isA after |
|---|---|---|
| COMPLEMENT_GRAMMAR | — (new) | PHRASE |
| SUBJECT_COMPLEMENT | — | COMPLEMENT_GRAMMAR |
| INSTRUMENTAL | — | COMPLEMENT_GRAMMAR |
| ADVERBIAL_OF_MANNER | — | COMPLEMENT_GRAMMAR |

All three were roots, so nothing is severed. COMPLEMENT_GRAMMAR goes under PHRASE, the genus of its
own gloss, just as INFINITIVE_PHRASE does. B23's six new names (LOCATIVE, DIRECTION, SOURCE, ROUTE,
CAUSE_COMPLEMENT, TERMINUS) should be seeded under it too.

## Unlocks

Probed 2026-09-14. The glosses of the three children used PHRASE in place of COMPLEMENT_GRAMMAR. As
in every `whoGloss` object, French renders the bare plural without an article.

| concept | plan | gloss (en) | status |
|---|---|---|---|
| COMPLEMENT_GRAMMAR | `whoGloss('PHRASE', 'MODIFY', 'VERB')` | a phrase that modifies verbs | ✓ every concept already seeded: it "una frase che modifica verbi", de "eine Phrase, die Verben modifiziert", ja 動詞を修飾するフレーズ |
| SUBJECT_COMPLEMENT | `whoGloss('COMPLEMENT_GRAMMAR', 'DESCRIBE', 'SUBJECT_GRAMMAR')` | a complement that describes subjects | ✓ once seeded: de "…, die Subjekte beschreibt", ja 主語を描写する… |
| INSTRUMENTAL | `whoGloss('COMPLEMENT_GRAMMAR', 'NAME', 'MEANS')` | a complement that names means | ⚠ needs MEANS. With OBJECT_THING instead it reads "a complement that names objects", which also fits a direct object |
| ADVERBIAL_OF_MANNER | `whoGloss('COMPLEMENT_GRAMMAR', 'EXPRESS', 'WAY')` | a complement that expresses ways | ⚠ weak: de "…, die Weisen vermittelt". Try a MANNER noun, or leave it on the literal (C05) |

The first gloss reads close to ADVERB's "a word that modifies verbs", but the genus (phrase, not
word) keeps the two apart.

## What shipped (2026-09-16)

Nothing was seeded: COMPLEMENT_GRAMMAR (B23) and MEANS (B24) were already there. The three older
complement names gained `isA: 'COMPLEMENT_GRAMMAR'` — all were roots, so nothing is severed — and
the genus and its three children gained glosses.

| concept | plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| COMPLEMENT_GRAMMAR | `whoGloss('PHRASE', 'MODIFY', 'VERB')` | a phrase that modifies verbs | una frase che modifica verbi | une phrase qui modifie verbes | eine Phrase, die Verben modifiziert | una frase que modifica verbos | 動詞を修飾するフレーズ | uma frase que modifica verbos |
| SUBJECT_COMPLEMENT | `whoGloss('COMPLEMENT_GRAMMAR', 'DESCRIBE', 'SUBJECT_GRAMMAR')` | a complement that describes subjects | un complemento che descrive soggetti | un complément qui décrit sujets | eine Ergänzung, die Subjekte beschreibt | un complemento que describe sujetos | 主語を描写する補語 | um complemento que descreve sujeitos |
| INSTRUMENTAL | `whoGloss('COMPLEMENT_GRAMMAR', 'INDICATE', 'MEANS')` | a complement that indicates means | un complemento che indica mezzi | un complément qui indique moyens | eine Ergänzung, die Mittel bezeichnet | un complemento que indica medios | 手段を示す補語 | um complemento que indica meios |
| ADVERBIAL_OF_MANNER | `whoGloss('COMPLEMENT_GRAMMAR', 'INDICATE', 'WAY')` | a complement that indicates ways | un complemento che indica modi | un complément qui indique manières | eine Ergänzung, die Weisen bezeichnet | un complemento que indica maneras | 方法を示す補語 | um complemento que indica maneiras |

**INDICATE replaced NAME and EXPRESS in the last two**, on the probe. The table above proposed
`NAME` for INSTRUMENTAL and `EXPRESS` for ADVERBIAL_OF_MANNER; both were rendered and rejected:

| | NAME | EXPRESS | **INDICATE** |
|---|---|---|---|
| de | Mittel benennt | Mittel **vermittelt** ✗ weak | Mittel **bezeichnet** ✓ the grammatical term |
| ja | 手段を**名付ける** ✗ 名付ける is to christen | 手段を表す | 手段を**示す** ✓ |

INDICATE is also the genus of both proposals (B16 glosses NAME as "to indicate objects with
words"), it is the apter verb — a complement *indicates* its means, it does not give it a name —
and it makes the two sibling glosses parallel, differing only in the object that is their
differentia. **No MANNER noun was seeded.** It was probed as an alternative to WAY and came out
identical in six of seven languages (it *modi*, fr *manières*, de *Weisen*, es *maneras*, ja 方法,
pt *maneiras*); only English differed, and "manners" is worse than "ways" — it reads as etiquette.

French renders the bare plural without a partitive in all four ("qui modifie verbes"), the
documented simplification already shipped in NOUN and CREATOR. It was not treated as a blocker.

- Tests: the ancestry — all nine complement names reaching PHRASE through the genus — in
  [index.test.ts](../../../packages/backend/src/concepts/index.test.ts), and the genus plus one
  child in [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts). The child's
  tooltip is the check that matters: it says "complement" (ja 補語), so the gloss is composed on the
  parent it gained, not on PHRASE.
