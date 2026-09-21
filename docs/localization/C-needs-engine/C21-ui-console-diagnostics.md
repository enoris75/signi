# C21. UI strings — the phrase console's diagnostics

**Kind:** hardcoded UI string. Once unblocked, these become [`UI_STRINGS`](../../../packages/shared/src/uiStrings.ts)
entries and, for messages about the user's own words, plans rendered on request. Driven by the
[`/localize`](../../../.claude/skills/localize/SKILL.md) skill.

**Blocked on:** three things, the first of which is not an engine gap:

1. **Diagnostics have no identity.** About a hundred messages are built as English strings where the
   console throws them ([apply.ts](../../../packages/frontend/src/console/language/apply.ts),
   [parse.ts](../../../packages/frontend/src/console/language/parse.ts),
   [resolve.ts](../../../packages/frontend/src/console/language/resolve.ts),
   [usePhraseConsole.ts](../../../packages/frontend/src/console/usePhraseConsole.ts)). The tests
   assert that English: 34 `says` in [golden.test.ts](../../../packages/frontend/test/console/golden.test.ts),
   plus [parse.test.ts](../../../packages/frontend/test/console/parse.test.ts),
   [structured.test.ts](../../../packages/frontend/test/console/structured.test.ts),
   [examples.test.ts](../../../packages/frontend/test/console/examples.test.ts),
   [PhraseConsole.test.tsx](../../../packages/frontend/test/console/PhraseConsole.test.tsx),
   [console.spec.ts](../../../e2e/console.spec.ts) and [manner.spec.ts](../../../e2e/manner.spec.ts).
   A catalogue entry needs a key, and a message has none.
2. **The existential clause.** Ten messages open "There is no …". `PhrasePlan` has no existential:
   en *there is*, it *c'è*, fr *il y a*, de *es gibt* + accusative, es *hay*, pt *há*, ja ある / いる by
   animacy.
3. **Values inside the sentence.** The messages quote what the user typed ("frobnicate"), command names
   (`/pl`), period numbers (`#2`) and the user's words (*cat*), often mid-sentence. The
   [C14](../done/C14-ui-runtime-values.md) rule (the value after the phrase) suits command names and
   numbers. A sentence *about a word*, though, has to agree with it: "cat is a noun" is it "il gatto è un
   sostantivo" and fr "le chat est un nom". No boot-time entry can do that. It is an ordinary plan over
   the user's concept, rendered on request through the translate route, as
   [C16](../done/C16-ui-possessive-pronoun-chip.md) does for the possessor chip (`usePossessivePhrases`).

Beyond those, many messages explain the language in constructs the engine lacks: a non-restrictive
relative ("which fixes its mood"), *only*, *not X but Y*, *its own*, and consequences after a dash.
Those need rewording before any of them can be planned.

## The messages, by what they need

Counts are approximate. The line numbers are HEAD on 2026-09-21.

| family | e.g. | where | needs |
|---|---|---|---|
| **existential** (10) | There is no period 3. · There is no command /frob. · There is no saved phrase “x”. · There is no adjective 2 there. · There is no modal to remove. · There is no 3rd phrase in that group. · There is no noun at #2.obj. · There is no bracket open here to close. | [apply.ts:415, 817, 836, 856, 942, 996](../../../packages/frontend/src/console/language/apply.ts#L415), [parse.ts:88, 112](../../../packages/frontend/src/console/language/parse.ts#L88), [usePhraseConsole.ts:637, 912](../../../packages/frontend/src/console/usePhraseConsole.ts#L637) | the existential clause, or the rewording in *To unblock* §2 |
| **possession, negated** (8) | No noun here has an adjective to remove. · This period has no if-condition to remove. · Period 2 has no obj there. · …this period has no instrument link. | [apply.ts:421, 814, 827, 843, 853, 868, 1004, 1015](../../../packages/frontend/src/console/language/apply.ts#L814) | HAVE with a `no` subject, and a purpose infinitive ("to remove", [C12](../done/C12-ui-purpose-and-object-complements.md)). Composable once codes exist. The `no` determiner has French and Japanese quirks ([B25](../done/B25-ui-dialog-and-app-controls.md)), so probe it |
| **licensing: "/x takes …"** (10) | /pl takes no word. · /level takes process, concept or object. · /tense takes past, present, future — not “y”. · /command takes one value — “y” is already given. · eat takes no instrument. · eat takes no object. | [parse.ts:161, 195, 201, 215-216, 240-244](../../../packages/frontend/src/console/language/parse.ts#L161), [apply.ts:699, 728, 1070, 1073](../../../packages/frontend/src/console/language/apply.ts#L699) | TAKE in the licensing sense (unseeded). A command name as the *subject* is a literal token, not a concept, and no plan has a slot for quoted text. Reword with the command outside ("/pl: takes no word" → a subjectless sentence), or build that slot |
| **instructions with a syntax example** (~20) | Put the word inside the bracket: /subj ( cat … ). · Name a period after the #: #2, #2.obj. · Say which: /level process, concept or object. · Close the bracket before removing the period. · …— close the bracket first. | [parse.ts:104, 106, 110, 168, 224, 230](../../../packages/frontend/src/console/language/parse.ts#L104), [apply.ts:388, 412, 429, 506, 560, 602, 645, 657, 712, 726, 774, 801, 911](../../../packages/frontend/src/console/language/apply.ts#L388) | the easy family. An imperative head (PUT, NAME, SAY, CLOSE, OPEN + BRACKET, CLAUSE, …: vocabulary), a colon, and the example as a literal. Composable once codes exist and the words are seeded |
| **explanations of the language** (~20) | A relative clause is another period — not the one its noun is in. · A possessor can only refer to a noun of its own period. · A noun cannot be its own possessor, nor one of its own parts’. · A command joins another command only with and, then, but or or. · This period is in an if-condition or a coordination, which fixes its mood — /del if or /del join first. · Period 2 already leads to this one — the link would go round in a circle. | [apply.ts:444, 601, 605, 646, 687, 694, 697, 704, 741, 759, 806, 883, 938, 951, 964, 973, 977, 988](../../../packages/frontend/src/console/language/apply.ts#L444), [apply.ts:1022-1073](../../../packages/frontend/src/console/language/apply.ts#L1022-L1073) (`relativeRefusal`, `clauseRefusal`, `roleRefusal`) | the hard family: the constructs above. Reword each into two short statements, or keep it and record why, as [C15](../done/C15-ui-literal-by-design.md) does |
| **about the user's words** (6) | “ca” names 3 words — choose one: CAT, CAR. · /obj has no word “frob” — the list shows the ones it takes. · /adj describes a word: write it inside its bracket, /subj ( cat … /adj ). · /more sets an adjective’s degree, and cat is a noun. · cat is empty: the clause needs a word there to be about. | [apply.ts:480-481, 560-578, 1027-1029](../../../packages/frontend/src/console/language/apply.ts#L480), with [`kindName`](../../../packages/frontend/src/console/language/words.ts#L333-L349) ("a noun", "a noun modifier") | on-request rendering over the user's concept (point 3). The purpose half is left by [B47](../done/B47-ui-console-command-purposes.md), which localized the help page’s purposes as infinitive citations (`purpose.*`, one per purpose, named by `CommandDef.purposeKey`: "to set an adjective's degree") and kept the English `purpose` here. This sentence wants a third-person present with the command as its subject ("/more sets …"), the licensing family’s problem, or a rewording around the citation. `kindName`'s nouns exist (`hint.aNoun`, and `category.*` with an indefinite) |
| **references** (4) | a reference starts with a period number: #2, #2.obj · periods are numbered from 1 · “x” is not a noun of a period: subj, obj, pred, loc, … · “x” is not a step of a noun: poss, and2, … | [resolve.ts:201-212](../../../packages/frontend/src/console/language/resolve.ts#L201-L212) | the syntax is most of the message. A head and a literal, like the instructions |
| **the help page's "Here:"** (3) | Here: nothing under the cursor yet. · Here: cat does not take it. · Here: on cat, now singular. | [usePhraseConsole.ts:937-941](../../../packages/frontend/src/console/usePhraseConsole.ts#L937-L941) | CURSOR, and the word on request. "now singular" is [B46](../done/B46-ui-console-topics-and-labels.md)'s `console.now` |
| **Unexpected text.** (1) | — | [parse.ts:107](../../../packages/frontend/src/console/language/parse.ts#L107) | UNEXPECTED + TEXT. Composable once codes exist |

## To unblock

1. **Codes first, as a pure refactor.** Give each diagnostic a `code` and its `args`
   (`{ code: 'takesNoWord', args: { command: 'pl' } }`), keep the English as that code's fallback, and
   move every assertion to the code. Nothing on screen changes. After this, each family above is its
   own A or B task, and the families can ship one at a time.
2. **Either build the existential or reword around it.** A `PhrasePlan.existential` clause in every
   engine follows [C10](../done/C10-ui-questions.md)'s precedent for a clause-level construct, and the
   Japanese engine already picks ある / いる by animacy for possession (`isAnimate.ts`). The cheaper
   route is C14's "Loaded phrase — missing words: …": say the missing thing as a noun phrase with the
   value after it ("Missing period: 3", "Unknown command: /frob"). MISSING is seeded, and UNKNOWN is
   one word.
3. **Messages about words go through the translate route**, built as plans over the concepts the
   diagnostic already holds. The console already renders its preview that way.
4. Then file the families as tasks.

## Tests that select on these literals

All of the suites under *Blocked on* point 1. Step 1 exists to move them.
