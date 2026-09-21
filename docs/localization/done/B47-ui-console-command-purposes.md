# B47. UI strings — what each console command is for

**Kind:** hardcoded UI string → [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts) entries, driven
by the [`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Done 2026-09-21.** Every purpose ships on the help page. See [Done](#done) for the renders and what
changed against the plan.

**Was blocked on:** SET, GOVERN and NEGATE, which the console's purposes need as verbs, plus
SENTIMENT, and [B38](B38-link.md)'s LINK and [B46](B46-ui-console-topics-and-labels.md)'s
SPATIAL (both seeded ahead of this task). Every command that acts on a word carries a `purpose`
([commands.ts:120](../../../packages/frontend/src/console/language/commands.ts#L120)), an English verb
phrase with no key. Two places show it:

- the help page, after the description: "/pl · plural — it sets a noun’s number."
  ([Transcript.tsx:164](../../../packages/frontend/src/console/Transcript.tsx#L164)). **Shipped**: it
  reads the command's `purposeKey` now, "Plural — to set a noun's number".
- the misuse diagnostic, "/more sets an adjective’s degree, and cat is a noun."
  ([apply.ts:574-599](../../../packages/frontend/src/console/language/apply.ts#L574-L599), the purpose at
  [apply.ts:584](../../../packages/frontend/src/console/language/apply.ts#L584)). **Left to
  [C21](C21-ui-console-diagnostics.md)**, on the English `purpose`, which stays on
  `CommandDef` for it. It did not fall out: the sentence has the command as its subject, a
  third-person present ("/more sets …"), then a clause about the user's own word ("and cat is a noun"),
  which needs C21's on-request rendering. The infinitive citation the help page reads cannot stand in
  that slot.

**The shape.** A purpose is what a concept's definition is: the gloss of a verb, "to set a noun's
number". It is rendered as the infinitive citation `infinitiveGloss` builds for the verb definitions
(GENERIC_PERSON subject, `infinitive: true`; [verbs/gloss.ts](../../../packages/backend/src/concepts/verbs/gloss.ts#L113)).
The catalogue cannot import the backend, so it has its own two builders,
[`purposeOf`](../../../packages/shared/src/uiStrings.ts#L354) (a verb, its object and an optional
`terminus` goal) and [`setterOf`](../../../packages/shared/src/uiStrings.ts#L366) (SET on a setting,
definite, its word as the possessor, indefinite). A third-person present with the command as subject
was probed before this task and is worse: fr "cela décrit un nom", ja それは名詞を描写します.

## Seeded

| concept | role | where | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|---|---|
| SET | verb, transitive | [transitive.ts:5009](../../../packages/backend/src/concepts/verbs/transitive.ts#L5009) | set | impostare | définir | festlegen (separable: `particle: 'fest'`) | establecer | definir | 設定する |
| GOVERN | verb, transitive | [transitive.ts:5290](../../../packages/backend/src/concepts/verbs/transitive.ts#L5290) | govern | reggere | régir | regieren | regir | reger | 支配する |
| NEGATE | verb, transitive | [transitive.ts:5365](../../../packages/backend/src/concepts/verbs/transitive.ts#L5365) | negate | negare | nier | verneinen | negar | negar | 否定する |
| SENTIMENT | noun, count | [nouns.ts:2662](../../../packages/backend/src/concepts/nouns.ts#L2662) | sentiment(s) | valutazione (f) | appréciation (f) | Bewertung (f) | valoración (f) | avaliação (f) | 評価 |

The three verbs have full finite paradigms and `NONFINITE` entries
([nonfinite.ts:740, 774, 782](../../../packages/backend/src/concepts/verbs/nonfinite.ts#L740)): the gerunds,
the participles (it *retto*, de *festgelegt*, fr *régi*, *nié*) and the Japanese te / nai / passive forms
with readings. None needs a Japanese `label`: each is a する-verb, so the instruction register's verbal
noun is the masu-stem minus its し (設定, 支配, 否定). They are pinned in
[command-purposes.test.ts](../../../packages/engine/test/command-purposes.test.ts) (present, past, future,
the plural and the 1st singular; the aspects, negation, the passive, a command and an instruction; a
German relative clause, where the particle rejoins the verb: "der Kater, der den Wert festlegt, läuft")
and in the Italian `IT` table of [verb.test.ts](../../../packages/engine/test/verb.test.ts#L536)
("la gatta ha retto / negato / impostato").

### The judgments

- **SET** is the software sense everywhere: it *impostare*, fr *définir*, es *establecer*, pt *definir*,
  ja 設定する, the words these languages' interfaces put on "set". German *festlegen* is separable, like
  ADD's *hinzufügen*: "der Hund legt den Wert fest", "leg den Wert fest", "den Wert festlegen".
- **GOVERN** is the grammarian's verb: a modal governs the infinitive after it, as a preposition governs
  its case. Every language but Japanese uses the political verb for it (*reggere*, *régir*, *regieren*,
  *regir*, *reger*); Japanese linguistics says 支配する (格支配, case government). `synonym: 'grammar'`
  keeps it apart in the picker.
- **NEGATE, French *nier*.** Probed in "nier un verbe" against the alternatives a plan can hold:

  | plan for `/not` | en | it | fr | de | es | pt | ja |
  |---|---|---|---|---|---|---|---|
  | NEGATE + VERB indef | to negate a verb | negare un verbo | nier un verbe | ein Verb verneinen | negar un verbo | negar um verbo | 動詞を否定する |
  | SET + POLARITY def, poss VERB | to set a verb's polarity | impostare la polarità di un verbo | définir la polarité d'un verbe | die Polarität eines Verbs festlegen | establecer la polaridad de un verbo | definir a polaridade de um verbo | 動詞の極性を設定する |
  | TRANSFORM + VERB, objectPredicative NEGATIVE | to transform a verb negative | trasformare un verbo negativo | transformer un verbe négatif | ein Verb negativ verwandeln | transformar un verbo negativo | transformar um verbo negativo | 動詞を否定に変える |
  | CAUSE_VERB + VERB, "to be negative" | to cause a verb to be negative | indurre un verbo a essere negativo | induire un verbe à être négatif | ein Verb veranlassen, negativ zu sein | inducir un verbo a ser negativo | induzir um verbo a ser negativo | 動詞が否定であるようにする |

  *Nier* is kept. It is the verb of logical and grammatical negation in French (to negate a proposition,
  a term), and on the help page it stands beside `/not`'s description, *négative*, so the grammar sense
  is the one read. Everyday French reads it as "to deny", which is the weakness. What a French school
  grammar writes, "mettre un verbe à la forme négative", puts fixed words *after* the object, and no
  lexeme can hold them. The polarity plan would make `/not` and `/pos` one purpose, and the other two
  are wrong in every language. The other six are the verbs their grammar teaching uses for it: it
  "negare un verbo", de "ein Verb verneinen", es / pt "negar", ja 動詞を否定する.
- **SENTIMENT** keeps the suggested forms, the word each language uses for a positive or negative
  judgment: it *valutazione*, fr *appréciation*, de *Bewertung*, es *valoración*, pt *avaliação*, ja 評価.
  English says *sentiment*, the name `CauseSentiment` already has. Feminine wherever it has a gender, as
  POLARITY is. Its values are the canvas's NEUTRAL / NEGATIVE / POSITIVE, which agree with it ("una
  valutazione negativa"). Japanese renders NEGATIVE / POSITIVE as 否定の / 肯定の, the polarity sense
  ([B46](B46-ui-console-topics-and-labels.md) records the same issue for POSITIVE). No
  purpose puts them on SENTIMENT.

## Strings

One key per distinct purpose, `purpose.<id>`, 22 in all
([uiStrings.ts:2435-2602](../../../packages/shared/src/uiStrings.ts#L2435-L2602)), and a `purposeKey` on
`CommandDef` beside `purpose` ([commands.ts:125](../../../packages/frontend/src/console/language/commands.ts#L125)).
The ids are the `Setting` ids and the `Action` kinds the commands already have. `setting()` derives
its key from the setting it sets ([`settingPurpose`, commands.ts:186](../../../packages/frontend/src/console/language/commands.ts#L186)):
`purpose.<setting id>`, except `/neut` (a pronoun's gender) and `/not` (it negates the verb). The
object-literal commands name theirs beside their `purpose`
([commands.ts:289-647](../../../packages/frontend/src/console/language/commands.ts#L289-L647)).

| key | commands | plan | verdict |
|---|---|---|---|
| `purpose.instrument` | `/inst` | ADD + INSTRUMENTAL indef, `terminus` VERB **def** | shipped |
| `purpose.adjective` | `/adj` | DESCRIBE + NOUN indef | shipped |
| `purpose.adverb` | `/adv` | MODIFY + VERB **or** MODAL, both indef | shipped |
| `purpose.modal` | `/modal` | GOVERN + VERB indef | shipped |
| `purpose.possessor` | `/poss` | ADD + POSSESSOR indef, `terminus` NOUN indef | shipped |
| `purpose.conjunct` | `/and /or` | LINK + PHRASE indef `[OTHER]`, `terminus` NOUN indef | shipped |
| `purpose.relative` | `/rel` | ADD + RELATIVE_CLAUSE indef, `terminus` NOUN indef | shipped |
| `purpose.number` | `/sg /pl` | SET + NUMBER_GRAMMAR def, `possessor` NOUN indef | shipped |
| `purpose.gender` | `/masc /fem` | SET + GENDER def, `possessor` NOUN indef | shipped |
| `purpose.pronounGender` | `/neut` | SET + GENDER def, `possessor` PRONOUN indef | shipped |
| `purpose.determiner` | `/the /a /zero /this /that /some /no /many /few /all` | SET + DETERMINER def, `possessor` NOUN indef | shipped |
| `purpose.specifier` | `/in /through /under /over /around /behind /front` | SET + RELATIONSHIP def `[SPATIAL]`, `possessor` COMPLEMENT_GRAMMAR indef | shipped |
| `purpose.sentiment` | `/because /fault /thanks` | SET + SENTIMENT def, `possessor` CAUSE_COMPLEMENT indef | shipped |
| `purpose.tense` | `/tense`, `/past /present /future` | SET + TENSE def, `possessor` VERB indef | shipped |
| `purpose.aspect` | `/aspect`, `/neutral /prog /prosp /result` | SET + ASPECT def, `possessor` VERB indef | shipped |
| `purpose.voice` | `/voice`, `/active /passive` | SET + VOICE def, `possessor` VERB indef | shipped |
| `purpose.polarity` | `/pos` | SET + POLARITY def, `possessor` VERB indef | shipped |
| `purpose.negate` | `/not` | NEGATE + VERB indef | shipped |
| `purpose.degree` | `/more /most /less /least /equally /plain` | SET + DEGREE_GRAMMAR def, `possessor` ADJECTIVE indef | shipped |
| `purpose.relation` | `/feature /purpose /material` | SET + RELATIONSHIP def, `possessor` MODIFIER indef | shipped |
| `purpose.condition` | `/if` | ADD + CONDITION indef, `terminus` PERIOD_SENTENCE indef | shipped |
| `purpose.join` | `/join` | LINK + PERIOD_SENTENCE plural bare | shipped |
| the misuse diagnostic | every command above | — | left to [C21](C21-ui-console-diagnostics.md) (see above) |

**Not GIVE.** "Gives a noun its possessor" was probed with the seeded GIVE and a `terminus` before this
task. de reads "es gibt einen Besitzer **in** ein Substantiv", both *there is* and *into*, and ja
所有者を**あげます**, the verb of giving someone a favour. ADD reads right in all seven (below).

## Tests that select on these literals

No test asserted the help page's "— it …". Now: [help.test.ts](../../../packages/frontend/test/console/help.test.ts#L56)
holds every command with a `purpose` to a `purposeKey` the catalogue has, one key per English purpose
and back, 22 of them. [PhraseConsole.test.tsx](../../../packages/frontend/test/console/PhraseConsole.test.tsx#L308)
reads `/help pl`'s fallback ("Plural — to set a noun's number") and, in Italian, `/pl` and `/sg`
sharing one entry and `/not` reading its own. [uiStrings.test.ts](../../../packages/backend/src/uiStrings.test.ts#L674)
pins the boot render (22 entries, none with a full stop, every English one "to …").
[command-purposes.test.ts](../../../packages/engine/test/command-purposes.test.ts) pins every purpose's
render in all seven languages and checks each fallback against the English.
[console.spec.ts](../../../e2e/console.spec.ts#L218) reads `/rel`'s purpose in English, Italian and German.
The diagnostics that embed the English purpose are unchanged: [structured.test.ts](../../../packages/frontend/test/console/structured.test.ts)
(`/more sets an adjective’s degree, and cat is a noun`), the `says` of
[golden.test.ts](../../../packages/frontend/test/console/golden.test.ts) and
[examples.test.ts](../../../packages/frontend/test/console/examples.test.ts#L126). They are C21's.

## Done

**2026-09-21.** 22 new entries and four new concepts. Rendered 2026-09-21 by the engine source at HEAD
over an in-memory seed of the corpus, through `buildUiStrings`, with formats applied, and read back
from a live console (e2e, `/help rel` in en, it and de).

| key | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `purpose.instrument` | to add an instrumental to the verb | aggiungere un complemento di mezzo al verbo | ajouter un complément de moyen au verbe | einen Instrumental zum Verb hinzufügen | añadir un complemento circunstancial de instrumento al verbo | adicionar um adjunto adverbial de instrumento ao verbo | 動詞に手段語を加える |
| `purpose.adjective` | to describe a noun | descrivere un sostantivo | décrire un nom | ein Substantiv beschreiben | describir un sustantivo | descrever um substantivo | 名詞を描写する |
| `purpose.adverb` | to modify a verb or a modal | modificare un verbo o un verbo modale | modifier un verbe ou un verbe modal | ein Verb oder ein Modalverb modifizieren | modificar un verbo o un verbo modal | modificar um verbo ou um verbo modal | 動詞か法助動詞を修飾する |
| `purpose.modal` | to govern a verb | reggere un verbo | régir un verbe | ein Verb regieren | regir un verbo | reger um verbo | 動詞を支配する |
| `purpose.possessor` | to add a possessor to a noun | aggiungere un possessore a un sostantivo | ajouter un possesseur à un nom | einen Besitzer zu einem Substantiv hinzufügen | añadir un poseedor a un sustantivo | adicionar um possuidor a um substantivo | 名詞に所有者を加える |
| `purpose.conjunct` | to link another phrase to a noun | collegare un'altra frase a un sostantivo | relier une autre phrase à un nom | eine andere Phrase mit einem Substantiv verbinden | enlazar otra frase a un sustantivo | ligar outra frase a um substantivo | 名詞に別のフレーズをつなぐ |
| `purpose.relative` | to add a relative clause to a noun | aggiungere una proposizione relativa a un sostantivo | ajouter une proposition relative à un nom | einen Relativsatz zu einem Substantiv hinzufügen | añadir una oración de relativo a un sustantivo | adicionar uma oração relativa a um substantivo | 名詞に関係節を加える |
| `purpose.number` | to set a noun's number | impostare il numero di un sostantivo | définir le nombre d'un nom | den Numerus eines Substantivs festlegen | establecer el número de un sustantivo | definir o número de um substantivo | 名詞の数を設定する |
| `purpose.gender` | to set a noun's gender | impostare il genere di un sostantivo | définir le genre d'un nom | das Geschlecht eines Substantivs festlegen | establecer el género de un sustantivo | definir o género de um substantivo | 名詞の性を設定する |
| `purpose.pronounGender` | to set a pronoun's gender | impostare il genere di un pronome | définir le genre d'un pronom | das Geschlecht eines Pronomens festlegen | establecer el género de un pronombre | definir o género de um pronome | 代名詞の性を設定する |
| `purpose.determiner` | to set a noun's determiner | impostare il determinante di un sostantivo | définir le déterminant d'un nom | das Determinativ eines Substantivs festlegen | establecer el determinante de un sustantivo | definir o determinante de um substantivo | 名詞の限定詞を設定する |
| `purpose.specifier` | to set a complement's spatial relationship | impostare la relazione spaziale di un complemento | définir la relation spatiale d'un complément | die räumliche Beziehung einer Ergänzung festlegen | establecer la relación espacial de un complemento | definir a relação espacial de um complemento | 補語の空間的な関係を設定する |
| `purpose.sentiment` | to set a cause's sentiment | impostare la valutazione di un complemento di causa | définir l'appréciation d'un complément circonstanciel de cause | die Bewertung einer adverbialen Bestimmung des Grundes festlegen | establecer la valoración de un complemento circunstancial de causa | definir a avaliação de um adjunto adverbial de causa | 原因の副詞語句の評価を設定する |
| `purpose.tense` | to set a verb's tense | impostare il tempo di un verbo | définir le temps d'un verbe | das Tempus eines Verbs festlegen | establecer el tiempo de un verbo | definir o tempo de um verbo | 動詞の時制を設定する |
| `purpose.aspect` | to set a verb's aspect | impostare l'aspetto di un verbo | définir l'aspect d'un verbe | den Aspekt eines Verbs festlegen | establecer el aspecto de un verbo | definir o aspecto de um verbo | 動詞のアスペクトを設定する |
| `purpose.voice` | to set a verb's voice | impostare la diatesi di un verbo | définir la voix d'un verbe | die Diathese eines Verbs festlegen | establecer la voz de un verbo | definir a voz de um verbo | 動詞の態を設定する |
| `purpose.polarity` | to set a verb's polarity | impostare la polarità di un verbo | définir la polarité d'un verbe | die Polarität eines Verbs festlegen | establecer la polaridad de un verbo | definir a polaridade de um verbo | 動詞の極性を設定する |
| `purpose.negate` | to negate a verb | negare un verbo | nier un verbe | ein Verb verneinen | negar un verbo | negar um verbo | 動詞を否定する |
| `purpose.degree` | to set an adjective's degree | impostare il grado di un aggettivo | définir le degré d'un adjectif | die Steigerungsstufe eines Adjektivs festlegen | establecer el grado de un adjetivo | definir o grau de um adjetivo | 形容詞の程度を設定する |
| `purpose.relation` | to set a modifier's relationship | impostare la relazione di un modificatore | définir la relation d'un modificateur | die Beziehung eines Modifikators festlegen | establecer la relación de un modificador | definir a relação de um modificador | 修飾語の関係を設定する |
| `purpose.condition` | to add a condition to a period | aggiungere una condizione a un periodo | ajouter une condition à une période | eine Bedingung zu einem Satzgefüge hinzufügen | añadir una condición a un período | adicionar uma condição a um período | 文に条件を加える |
| `purpose.join` | to link periods | collegare periodi | relier des périodes | Satzgefüge verbinden | enlazar períodos | ligar períodos | 文をつなぐ |

The new words, in a clause (from [command-purposes.test.ts](../../../packages/engine/test/command-purposes.test.ts)):

| plan | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| DOG + SET + VALUE def | the dog sets the value. | il cane imposta il valore. | le chien définit la valeur. | der Hund legt den Wert fest. | el perro establece el valor. | o cão define o valor. | 犬は値を設定します。 |
| … past | the dog set the value. | il cane impostò il valore. | le chien définit la valeur. | der Hund legte den Wert fest. | el perro estableció el valor. | o cão definiu o valor. | 犬は値を設定しました。 |
| SECOND_PERSON, imperative | set the value. | imposta il valore. | définis la valeur. | leg den Wert fest. | establece el valor. | defina o valor. | 値を設定してください。 |
| … passive | the value is set. | il valore è impostato. | la valeur est définie. | der Wert wird festgelegt. | el valor es establecido. | o valor é definido. | 値は設定されます。 |
| VERB + GOVERN + NOUN indef | the verb governs a noun. | il verbo regge un sostantivo. | le verbe régit un nom. | das Verb regiert ein Substantiv. | el verbo rige un sustantivo. | o verbo rege um substantivo. | 動詞は名詞を支配します。 |
| … past | the verb governed a noun. | il verbo resse un sostantivo. | le verbe régit un nom. | das Verb regierte ein Substantiv. | el verbo rigió un sustantivo. | o verbo regeu um substantivo. | 動詞は名詞を支配しました。 |
| DOG + NEGATE + VERB def | the dog negates the verb. | il cane nega il verbo. | le chien nie le verbe. | der Hund verneint das Verb. | el perro niega el verbo. | o cão nega o verbo. | 犬は動詞を否定します。 |
| … past | the dog negated the verb. | il cane negò il verbo. | le chien nia le verbe. | der Hund verneinte das Verb. | el perro negó el verbo. | o cão negou o verbo. | 犬は動詞を否定しました。 |
| SENTIMENT def | the sentiment. | la valutazione. | l'appréciation. | die Bewertung. | la valoración. | a avaliação. | 評価。 |
| SENTIMENT indef `[NEGATIVE]` | a negative sentiment. | una valutazione negativa. | une appréciation négative. | eine negative Bewertung. | una valoración negativa. | uma avaliação negativa. | 否定の評価。 |

What landed differently from the plan:

1. **The help page drops "it" and the full stop.** "/pl · plural — it sets a noun’s number." became
   "Plural — to set a noun's number": a gloss, lower-case and without its full stop, like a verb's
   definition in its tooltip (`format: { stripPeriod: true }`). The call site adds nothing after it, so
   Japanese gets no ASCII full stop after 名詞の数を設定する. The fallback is the engine's English, with a
   straight apostrophe.
2. **The keys are named after what the console already calls things**, the `Setting` ids and the
   `Action` kinds: `purpose.specifier` for the place-or-route relation, `purpose.conjunct` for `/and`
   and `/or`, `purpose.negate` and `purpose.pronounGender` for the two commands narrower than their
   setting. `setting()` derives the key from the setting, so none of its call lines changed and the
   English `purpose` beside it stays for C21. [help.test.ts](../../../packages/frontend/test/console/help.test.ts#L56)
   holds the two one to one.
3. **`/if` kept CONDITION.** The description beside it is `clause.conditional`, "Conditional clause",
   so CLAUSE `[CONDITIONAL]` was probed too: en "to add a conditional clause to a period", but de "einen
   **konditionalen Satz** zu einem Satzgefüge hinzufügen" for what German grammars call a
   *Konditionalsatz*. CONDITION reads right in all seven.
4. **French *nier* was kept after probing three other plans** (the table under *The judgments*).
   It is the one purpose a French reader could misread ("to deny a verb").
5. **The misuse diagnostic did not fall out.** It is C21's and keeps the English `purpose`. What is left
   for it is written in [C21](C21-ui-console-diagnostics.md): the purpose half needs a
   third-person present with the command as subject, not the citation. (C21, 2026-09-21: the diagnostic
   leads with the command and says this citation after a dash, "/more — to set an adjective's degree",
   and the English `purpose` is gone from `CommandDef`.)
6. **Not in this task, found while probing:** German negates an indefinite object with *nicht* after it
   instead of *kein*: "das Verb regiert ein Substantiv nicht", "der Kater frisst eine Maus nicht" (want
   "regiert kein Substantiv", "frisst keine Maus"). No purpose is negated, so nothing here shows it.
   Reported for filing, not filed (bug ids race across sessions).
