# B47. UI strings — what each console command is for

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** SET, GOVERN and NEGATE, which the console's purposes need as verbs, plus [B38](B38-link.md)'s
LINK and [B46](B46-ui-console-topics-and-labels.md)'s SPATIAL. Every command that acts on a word
carries a `purpose` ([commands.ts:120](../../../packages/frontend/src/console/language/commands.ts#L120)),
an English verb phrase with no key. Two places show it:

- the help page, after the description: "/pl · plural — it sets a noun’s number."
  ([Transcript.tsx:148](../../../packages/frontend/src/console/Transcript.tsx#L148));
- the misuse diagnostic, "/more sets an adjective’s degree, and cat is a noun."
  ([apply.ts:569-576](../../../packages/frontend/src/console/language/apply.ts#L569-L576)), which is
  [C21](../C-needs-engine/C21-ui-console-diagnostics.md)'s.

**The shape.** A purpose is what a concept's definition is: the gloss of a verb, "to set a noun's
number". Render it with the infinitive citation `infinitiveGloss` builds for the verb definitions
(GENERIC_PERSON subject, `infinitive: true`; [verbs/gloss.ts](../../../packages/backend/src/concepts/verbs/gloss.ts#L113)).
The help page's "— it …" becomes "— to set a noun's number". A third-person present with the
command as subject was probed and is worse: fr "cela décrit un nom", ja それは名詞を描写します.

## Seed first

| concept | role | gloss | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|---|---|
| SET | verb, transitive | to give a setting a value | set | impostare | définir | festlegen | establecer | definir | 設定する |
| GOVERN | verb, transitive | to determine the form of another word | govern | reggere | régir | regieren | regir | reger | 支配する |
| NEGATE | verb, transitive | to make a clause say the opposite | negate | negare | nier | verneinen | negar | negar | 否定する |
| SENTIMENT | noun, count | the feeling a cause is given | sentiment(s) | valutazione (f) | appréciation (f) | Bewertung (f) | valoración (f) | avaliação (f) | 評価 |

Forms are suggestions for the seed author. GOVERN is the grammarian's verb (it *reggere*, de
*regieren*), not the political one. SENTIMENT names what `/because /fault /thanks` choose, the
`CauseSentiment` the canvas labels `sentiment.value.*`.

## Unlocks

One key per distinct purpose, `purpose.<id>`, and a `purposeKey` on `CommandDef` beside `purpose`.

| purpose | commands | plan (infinitive citation) |
|---|---|---|
| gives the verb an instrument | `/inst` | ADD + INSTRUMENTAL indefinite + `terminus` VERB definite |
| describes a noun | `/adj` | DESCRIBE + NOUN indefinite |
| qualifies a verb or a modal | `/adv` | MODIFY + VERB or MODAL, indefinite |
| governs a verb | `/modal` | GOVERN + VERB indefinite |
| gives a noun its possessor | `/poss` | ADD + POSSESSOR indefinite + `terminus` NOUN indefinite |
| coordinates another phrase with a noun | `/and /or` | LINK + PHRASE indefinite `[OTHER]` + `terminus` NOUN indefinite |
| gives a noun a relative clause | `/rel` | ADD + RELATIVE_CLAUSE indefinite + `terminus` NOUN indefinite |
| sets a noun’s number · gender · determiner | `/sg /pl` · `/masc /fem` · `/the /a /zero /this /that /some /no /many /few /all` | SET + NUMBER_GRAMMAR / GENDER / DETERMINER definite, `possessor`: NOUN indefinite |
| sets a pronoun’s gender | `/neut` | SET + GENDER definite, `possessor`: PRONOUN indefinite |
| sets the relation of a place or a route | `/in /through /under /over /around /behind /front` | SET + RELATIONSHIP definite `[SPATIAL]`, `possessor`: COMPLEMENT_GRAMMAR indefinite |
| sets how a cause is felt | `/because /fault /thanks` | SET + SENTIMENT definite, `possessor`: CAUSE_COMPLEMENT indefinite. "How it is felt" is an embedded question, which no plan holds |
| sets a verb’s tense · aspect · voice · polarity | the tense, aspect, voice and `/pos` commands | SET + TENSE / ASPECT / VOICE / POLARITY definite, `possessor`: VERB indefinite |
| negates a verb | `/not` | NEGATE + VERB indefinite |
| sets an adjective’s degree | `/more … /plain` | SET + DEGREE_GRAMMAR definite, `possessor`: ADJECTIVE indefinite |
| sets how a noun modifier relates to its noun | `/feature /purpose /material` | SET + RELATIONSHIP definite, `possessor`: MODIFIER indefinite (the embedded question again) |
| gives a period its if-condition | `/if` | ADD + CONDITION indefinite + `terminus` PERIOD_SENTENCE indefinite |
| coordinates two periods | `/join` | LINK + PERIOD_SENTENCE plural bare |

The purposes are at [commands.ts:274-615](../../../packages/frontend/src/console/language/commands.ts#L274-L615).
Five need no new word (DESCRIBE, MODIFY, and ADD three times). Ship them with the rest so the family
reads one way.

**Not GIVE.** "Gives a noun its possessor" was probed with the seeded GIVE and a `terminus`. de reads
"es gibt einen Besitzer **in** ein Substantiv", both *there is* and *into*, and ja 所有者を**あげます**, the
verb of giving someone a favour. ADD reads right in all seven (below).

### Shape check (2026-09-21)

The infinitive citation with a possessor and with a `terminus`, rendered with seeded verbs standing in
for SET (CHANGE here):

| plan | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| CHANGE + NUMBER_GRAMMAR def, poss NOUN indef | to change a noun's number | cambiare il numero di un sostantivo | changer le nombre d'un nom | den Numerus eines Substantivs ändern | cambiar el número de un sustantivo | mudar o número de um substantivo | 名詞の数を変える |
| CHANGE + RELATIONSHIP def, poss MODIFIER indef | to change a modifier's relationship | cambiare la relazione di un modificatore | changer la relation d'un modificateur | die Beziehung eines Modifikators ändern | cambiar la relación de un modificador | mudar a relação de um modificador | 修飾語の関係を変える |
| DESCRIBE + NOUN indef | to describe a noun | descrivere un sostantivo | décrire un nom | ein Substantiv beschreiben | describir un sustantivo | descrever um substantivo | 名詞を描写する |
| ADD + POSSESSOR indef, terminus NOUN indef | to add a possessor to a noun | aggiungere un possessore a un sostantivo | ajouter un possesseur à un nom | einen Besitzer zu einem Substantiv hinzufügen | añadir un poseedor a un sustantivo | adicionar um possuidor a um substantivo | 名詞に所有者を加える |

## Tests that select on these literals

No test asserts the help page's "— it …". The diagnostics that embed a purpose are pinned by
[structured.test.ts](../../../packages/frontend/test/console/structured.test.ts) (`/more sets an
adjective’s degree, and cat is a noun`) and by the `says` of
[golden.test.ts](../../../packages/frontend/test/console/golden.test.ts). See [C21](../C-needs-engine/C21-ui-console-diagnostics.md), whose first
step (message codes) should land before this.
