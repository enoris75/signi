# C08. Copular, stative, top-genus and causative verbs — BE, BECOME, SEEM, APPEAR, BURN, CONSUME, SHOW + 9 workspace verbs

_(split out of [B08](B08-verb-definitions.md); filed as **C**, not B — seeding words does
not unblock these.)_

## Blocked on

Three distinct reasons, none of them vocabulary:

**1. No genus above them (BE, CONSUME).** A genus+differentia gloss needs a *superordinate*. BE is
the copula — nothing sits above it. CONSUME is itself the genus that
[B08's done half](B08-verb-definitions.md) used to define EAT and DRINK; glossing it against
EAT/DRINK would be circular. These are the verb equivalent of
[C05](../C-needs-engine/C05-non-distinguishing-genera.md)'s non-distinguishing genera: **deliberately left on the
English literal.**

**2. A construct the engine cannot render (BECOME, SEEM, APPEAR, BURN).**

| verb | literal | missing construct |
|---|---|---|
| BECOME | to come to be; to change into a different state | inchoative — "to begin to be X" over a state variable |
| SEEM | to give the impression of being similar to | evidential/similative complement |
| APPEAR | to come into view; to become visible | inchoative over a perception state |
| BURN | to be on fire; to undergo combustion | passive/stative — "to be consumed by fire" |

BURN is the near miss: FIRE and CONSUME are both seeded, so "to be consumed by fire" is *lexically*
ready and blocked purely on a **passive infinitive** surface across the seven engines.

**3. Causatives, resultatives and the rest of the workspace verbs.** Moved here from
[B15](B15-transfer-verbs.md) (SHOW) and [B19](B19-data-verbs.md) (the nine app verbs
left after EXPORT and IMPORT), 2026-09-14. Their genus verbs could be seeded, but the part that sets
each one apart is a construct the engine does not have.

| verb | literal | missing construct |
|---|---|---|
| SHOW | to make something visible to someone | causative — "to cause a person to see objects" |
| HIDE | to put something out of sight | causative + negation — "to cause not to be seen" |
| COORDINATE | to make separate parts or people work together | causative |
| START | to cause something to begin | causative |
| COMPACT | to press something into a smaller space without losing what it holds | resultative — "into a smaller space" |
| EXPAND | to open something out into a larger space | resultative |
| TIDY_UP | to put back in order what was left in a mess | resultative + prior state |
| SAVE | to store something so it can be retrieved later | purpose clause |
| LOAD | to bring stored content back in | direction "back in" over a prior state |
| ADD | to put something together with something else | comitative |

## If this is ever picked up

The inchoative ("to begin to be —") would cover BECOME and APPEAR together, and pairs naturally with
a **causative** mode, which would clear SHOW, HIDE, COORDINATE and START in one push. A single engine
push at *inchoative + causative + passive infinitive* would clear most of this file. That is the
argument for doing it; the argument against is that all the affected verbs are low-traffic in the
picker.

**Half of it now exists.** [C09](C09-modal-verbs.md) built the **infinitive complement**
(`PhrasePlan.infinitiveComplement`): a subject-controlled clause in the citation mood that the
governing clause's predicate takes, its linking word named by the governor's lexeme. The inchoative
"to begin to be —" is that nesting over the seeded BEGIN plus a predicate, and the causative "to cause
a person to see objects" is the same nesting under a *different* controller — the object, not the
subject, which is the part still missing. The passive infinitive (BURN) is untouched by it.

## Done

2026-09-20. The **causative** — the half of the push above that was actually missing — plus the two
pieces that turned out not to need it: APPEAR's gloss, which the seeded BECOME could already carry,
and the inchoative, which wanted a link in the seed and no engine change at all. Seven of the sixteen
verbs are localized; two stay on the English literal by design, as this file said they would; the
other seven moved to [C19](../C-needs-engine/C19-verbs-needing-voice-purpose-or-comitative.md), each
behind a named construct.

### (a) Engine — object control

[C09](C09-modal-verbs.md) built the infinitive complement under **subject** control: the
clause's unspoken subject is the governing clause's subject ("to desire **to act**" — the desirer
acts). A causative is the same nesting under the **object**: "to cause a person **to see objects**"
is the *person* seeing. That is now
**[`InfinitiveComplement.control`](../../../packages/shared/src/index.ts)**
(`'subject'` | `'object'`, defaulting to subject), which
[resolvePhrase](../../../packages/engine/src/translator/functions/resolvePhrase.ts) reads to pick
which slot the clause's subject comes from — falling back to the subject when there is no object to
control it — and marks on the resolved clause for the engines.

What object control changes, in full:

- **Agreement.** A predicate adjective inside the clause agrees with its controller, so the shared
  [`infinitiveController`](../../../packages/engine/src/functions/infinitiveController.ts) hands the
  four Romance engines the object's features instead of the subject's: *la gatta desidera il cibo
  essere **attento*** (the food is what is careful) against *…essere **attenta*** (the cat is).
- **Word order — Japanese only.** The causee is the one that acts, so Japanese speaks it **inside**
  the clause with が rather than leaving it in the matrix を slot: 人**が**物体を見るようにする.
- **Nothing at all in en/de.** English already appends the clause behind the object ("to cause a
  person to see objects") and German already extraposes its zu-infinitive after the comma ("eine
  Person veranlassen, Gegenstände zu sehen"). The construction was there; only the controller was
  missing.

**Japanese realises the causative as a construction, not as a verb.** There is no transitive "cause"
that governs a clause: the idiom is 〜ようにする, "bring it about that —". So the ja lexeme of the
causative verb names ように as its `infinitive_link` and the engine closes the clause on **する**
(`JA_SURU`) in place of the lexeme's own 引き起こす — the substitution the existential already makes
when it renders the copula as ある / いる. It is keyed on a `causative` form flag, the way `copula`
and `seeming` are, so an ordinary verb governing an object-controlled clause keeps its own word.

One convention changed with it: the Japanese `infinitive_link` now holds the **whole tail** that
closes the nominalized clause (ことが / ことを / ように, default ことを) rather than the particle after a
hard-coded こと, because the causative nominalizes with よう instead. The three C09 lexemes were
updated; their output is unchanged.

### (b) Seeded

- **CAUSE_VERB** (`verbs/transitive.ts`, "to make something or someone come to act or to be in a
  state", `synonym: 'bring about'`) — the genus of every causative gloss. The id is suffixed because
  the noun CAUSE holds the plain one, mirroring `IMPORT_NOUN` / `NAME_NOUN` the other way round.
  The four Romance lexemes are the **induce** family (indurre / induire / inducir / induzir) rather
  than each language's most idiomatic causative periphrasis (fr *amener à*, es *llevar a*): those
  read as "bring" / "carry" when the verb takes a plain object of its own, and a seeded word has to
  work in every phrase it is eligible for, not only in the glosses. de *veranlassen*, ja 引き起こす.
- **VISIBLE** (`adjectives.ts`, `transient` like HIDDEN, ja 可視の) — what APPEAR comes to be and
  what HIDE denies.
- **BEGIN** gained its `infinitive_link` (it *a*, fr *à*, es/pt *a*, ja ことが), which is all the
  **inchoative** ever needed: the nesting was C09's. "il gatto inizia **a** essere visibile",
  「可視であることが始まる」. No definition uses it — see BECOME in C19 — but the construct this file
  asked for is there and pinned.

### (c) The glosses

`causativeGloss(causee, clause)` ([verbs/gloss.ts](../../../packages/backend/src/concepts/verbs/gloss.ts))
writes them: the causee takes the parts any gloss object takes, and the caused clause the parts any
gloss clause takes — a predicate adjective, its `predicateDegree`, an adverb, a `negative`.

| Concept | Plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| SHOW | causee PERSON + SEE OBJECT_THING | to cause a person to see objects | indurre una persona a vedere oggetti | induire une personne à voir des objets | eine Person veranlassen, Gegenstände zu sehen | inducir a una persona a ver objetos | 人が物体を見るようにする | induzir uma pessoa a ver objetos |
| HIDE | causee OBJECT_THING + **not** BE VISIBLE | to cause an object not to be visible | indurre un oggetto a non essere visibile | induire un objet à ne pas être visible | einen Gegenstand veranlassen, nicht sichtbar zu sein | inducir un objeto a no estar visible | 物体が可視ではないようにする | induzir um objeto a não estar visível |
| COORDINATE | causee PERSON pl + ACT + TOGETHER | to cause people to act together | indurre persone ad agire insieme | induire des personnes à agir ensemble | Personen veranlassen, zusammen zu handeln | inducir personas a actuar juntas | 人が一緒に行動するようにする | induzir pessoas a agir juntas |
| START | causee ACTION + BEGIN | to cause an action to begin | indurre un'azione a iniziare | induire une action à commencer | eine Handlung veranlassen, zu beginnen | inducir una acción a empezar | 動作が始まるようにする | induzir uma ação a começar |
| COMPACT | causee OBJECT_THING + BECOME SMALL·more | to cause an object to become smaller | indurre un oggetto a diventare più piccolo | induire un objet à devenir plus petit | einen Gegenstand veranlassen, kleiner zu werden | inducir un objeto a volverse más pequeño | 物体がもっと小さくなるようにする | induzir um objeto a tornar-se menor |
| EXPAND | causee OBJECT_THING + BECOME BIG·more | to cause an object to become bigger | indurre un oggetto a diventare più grande | induire un objet à devenir plus grand | einen Gegenstand veranlassen, größer zu werden | inducir un objeto a volverse más grande | 物体がもっと大きくなるようにする | induzir um objeto a tornar-se maior |
| APPEAR | `infinitiveGloss('BECOME', { predicate: 'VISIBLE' })` | to become visible | diventare visibile | devenir visible | sichtbar werden | volverse visible | 可視になる | tornar-se visível |

**APPEAR needed no construct at all.** This file asked for an inchoative over a perception state;
BECOME is a seeded verb that already takes a predicate adjective, so "to become visible" — the
second half of APPEAR's own description — was a missing *adjective*, not a missing engine. Both
plans render; the idiomatic one won, 可視になる over 「可視であることが始まる」.

**HIDE denies VISIBLE rather than asserting the seeded HIDDEN.** "To cause an object to be hidden"
renders in all seven, but *hidden* is this verb's own participle in English, Italian and French
(hide → hidden, nascondere → nascosto, cacher → caché), and a gloss may not define a word with
itself. Denying VISIBLE is also what this file asked for in the first place — "causative +
negation", the negation riding the caused clause rather than the causing.

### Findings

- **START names its own lemma in five languages, and that is the right answer.** it/fr/de/es/pt are
  labile — *iniziare* is both "to begin" and "to start something" — so the causative gloss cites the
  verb it defines ("indurre un'azione **a iniziare**"). It is not vacuous: it says *this entry is the
  causative one*, which is exactly what tells the picker's two identical Italian entries apart, and
  it is what those languages' own dictionaries say ("far sì che qcs. inizi"). en (start / begin) and
  ja (始める / 始まる) have two words and read cleanly.
- **es/pt agreed "juntos" with nobody** —
  [A162](../../bugs/fixed/A162-spanish-portuguese-juntos-agreement.md). TOGETHER is an adverb in
  the model and was invariant in the lexicon, but the Spanish and Portuguese word is a predicative
  adjective, so COORDINATE's "inducir **personas** a actuar **juntos**" missed the *juntas* both
  languages want. It was not specific to this gloss ("las gatas comen juntos" had always been
  wrong), so the definition shipped and the defect was filed with the fix it needs. **Fixed
  2026-09-20**, as the first of its two shapes: the lexeme carries the agreeing adjective and the
  two engines resolve it against the clause's subject — here the object-controlled causee. The
  table above shows the corrected *juntas*.
- **The Japanese negated-こと gap ([B13](../../bugs/fixed/B13-japanese-plain-negative.md)) is
  still there** and still avoided: "to cause a person **not to act**" renders 行動しません inside the
  clause. HIDE is unaffected because its negation falls on a *copula*, which has its own plain
  negative (可視ではない).
- The Spanish personal *a* follows the object, not the construction: *inducir **a** una persona*
  (human) against *inducir un objeto*.

### Still on the English literal, by design

**BE** and **CONSUME**, for the reason at the top of this file — nothing sits above them. **CAUSE_VERB**
joins them: it is the genus this file introduced, and it is no more definable than CREATE or
PERCEIVE, the genera already seeded without one.

### Coverage

- `packages/engine/test/causative.test.ts` — the seven definitions in all seven languages, the
  subject-vs-object control contrast (Italian agreement and the Japanese が), the fallback with no
  object, a finite causative in the past, negation inside the caused clause, CAUSE_VERB as a plain
  transitive verb (present / future / resultative), and the inchoative.
- Colocated: `functions/infinitiveController.test.ts`, the causative and link cases in
  `languages/ja/buildClauseSegments.test.ts`, the control cases in
  `translator/functions/resolvePhrase.test.ts`, `concepts/verbs/gloss.test.ts` for `causativeGloss`.
- Corpus tables: VISIBLE in `adjectives.test.ts`, CAUSE_VERB in `verb.test.ts`'s Italian resultative
  table (*la gatta ha indotto*).
- e2e: six tooltips in `definition-tooltip.spec.ts` (English plus one other language each).
- The `@signi/engine` and `@signi/shared` dists must be rebuilt for the backend to serve the new
  definitions.
