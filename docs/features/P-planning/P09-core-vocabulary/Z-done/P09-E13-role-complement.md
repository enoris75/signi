# P09-E13. The role complement — as

**Construct:** a role said of the **subject** while the verb does something else — "the woman acts
**as a friend**", *come amica*, *als Freundin*, 友達として. From
[P09-E2's D3](P09-E2-complement-types.md#d3-as-is-a-role-on-the-subject-and-its-host-is-the-open-question),
deferred there with "if it is wanted, take (1)", and its [Done](P09-E2-complement-types.md#done)
follow-ups.
**Shape:** one new `ComplementType`, `role`, paying E2's seven-site table once more. Its marker, its
article rule and its seven words are the essive's
([`ObjectPredication`](../../../../../packages/shared/src/index.ts#L533)); only the **controller**
differs — the subject instead of the object.
**Scope:** all 7 languages, noun heads only (D4). Plan-only in a first pass: no box, like E2's
`purpose` and `topic`.
**Status:** **shipped, 2026-09-23**, plan-only — in the engine for all seven languages, carried
inertly by the frontend; see [Done](#done). Filed the same day from P09-E2's follow-ups.
**Words:** *as*. The brief's own "works as a teacher" needs TEACHER and a labour-sense WORK, neither
seeded (the corpus's WORK is *function*: "funziona", "fonctionne"); ACT, READ, FRIEND and STUDENT
stand in below. File the two as seed tickets if the table should use them.

| lang | the woman acts **as a friend** | the man acts **as a friend** | the man reads the book **as a student** | *contrast:* the man acts **like a friend** (manner, today) |
|---|---|---|---|---|
| en | the woman acts as a friend. | the man acts as a friend. | the man reads the book as a student. | the man acts like a friend. |
| it | la donna agisce come amica. | l'uomo agisce come amico. | l'uomo legge il libro come studente. | l'uomo agisce come un amico. |
| fr | la femme agit comme amie. | l'homme agit comme ami. | l'homme lit le livre comme étudiant. | l'homme agit comme un ami. |
| de | die Frau handelt als Freundin. | der Mann handelt als Freund. | der Mann liest das Buch als Student. | der Mann handelt wie ein Freund. |
| es | la mujer actúa como amiga. | el hombre actúa como amigo. | el hombre lee el libro como estudiante. | el hombre actúa como un amigo. |
| pt | a mulher age como amiga. | o homem age como amigo. | o homem lê o livro como estudante. | o homem age como um amigo. |
| ja | 女は友達として行動します。 | 男は友達として行動します。 | 男は学生として本を読みます。 | 男は友達のように行動します。 |

**Proposed, not engine output.** The first two columns are what an essive `objectPredicative` with no
object already renders at HEAD (*Today*); the third is where that stand-in goes wrong in German
("als **Studenten**", the accusative) and Japanese (本を学生として, the object reading). The last
column is engine output today, the `manner` similative — shown because it is the construct the role
must stay distinct from (D3).

## Done

Shipped 2026-09-23, as designed. What landed, and where it differs from the plan below:

- **`role` is a `ComplementType`** (D1), doc-commented with D1–D4, placed right after `terminus` in
  `COMPLEMENT_RENDER_ORDER` (D6), in `COMPLEMENT_LABELS` and `DETERMINER_COMPLEMENT_TYPES`, and
  **not** in `COMPLEMENT_TYPES`: no box. `defaultDefiniteness('role')` is `indefinite` (D3), and
  `ObjectPredication`'s doc comment names it as the essive's subject-oriented counterpart.
- **Every column of the table renders as proposed**, the similative column unchanged — tested in
  [`role.test.ts`](../../../../../packages/engine/test/complements/role.test.ts), with a plural, a
  coordinated role, a past tense, the order beside a recipient, the article rule and D4's drops.
- **One essive helper per engine** (D2), `essivePhrase(c, controller)` in the it / fr / es / pt
  `complementsPhrase`, called by the essive `objectPredicative` with `objectForms` and by `role` with
  the subject's forms. The factitive branch lost its `essive ?` ternaries; `objectPredicative.test.ts`
  is untouched and green. Spanish's shared predicate-noun rendering became `predicateNoun`.
- **German** treats `role` as the essive for the bare noun and takes `ESSIVE_ROLE_CASE = 'nom'`
  ([`de.consts.ts`](../../../../../packages/engine/src/languages/de/de.consts.ts)): "liest das Buch
  **als Student**" beside the essive's "verwendet das Buch als Studenten" (tested). It sits with the
  adjuncts, not the Mittelfeld-final predicates.
- **Japanese** needed no code beyond `PARTICLE.role = 'として'`: the role goes through the adjunct
  block ahead of the object (男は学生として本を読みます), the essive stays after it (tested).
- **English** is `PREP.role = 'as'` on the shared path, which keeps the plan's article.
- **The translator drops a role headed by an adjective or a pronoun** (D4), the whole group if any
  conjunct is one (`ROLE_EXCLUDED_HEADS` in `resolveComplements`).
- **Gender and number are the plan's own** (D5): "la donna agisce come amic**a**" is FRIEND with
  `gender: 'fem'`; nothing is inferred from the subject.
- **Frontend, inert** (§4): `COMPLEMENT_LABEL_KEYS` → `slot.role`, `COMPLEMENT_KEYS` → **E** (from the
  essive; R and A are taken), `complementIcons` → a badge, and `BoxComplementType` excludes it with
  the object complement and the comitative.
- **Seeded:** ROLE_COMPLEMENT behind `slot.role`, **literal by design** (no ROLE noun to gloss it
  with: "a complement that indicates roles") — it "complemento di ruolo", fr "complément
  circonstanciel de rôle", de "adverbiale Bestimmung der Rolle", es "complemento circunstancial de
  función", pt "adjunto adverbial de papel", ja 役割の副詞語句. ACT licenses `role`. **`signi.db`
  needs a reseed** for both.
- **The weak-feminine defect** met in *Today* is [A270](../../../../bugs/fixed/A270-german-feminine-of-a-weak-noun-takes-the-weak-ending.md),
  already filed, and it does **not** reach the role: the nominative takes no weak ending, so "als
  Studentin" is right today. It was not fixed first, contrary to §3's note.

Follow-ups, beside *Out of scope* below:

- **A relative clause over a role gap** — "the friend the man acts as" — renders wrong in six
  languages ("the friend as whom the man acts", "l'amico come quale…", "den Freund, als  der Mann
  handelt"). No control can build one (the console and the canvas relativise only `COMPLEMENT_TYPES`),
  so the random-phrase tool now leaves `role` out of its gaps, as it does the predicates. Wants either
  a stranded *as* or a refusal in the translator, like the predicative's.
- **A ROLE noun**, so ROLE_COMPLEMENT can be glossed like PURPOSE_COMPLEMENT.
- **More verbs licensing `role`** — only ACT does. READ and the others render it as a free adjunct,
  but the word map and the console name only what a verb licenses.

## Why

A role is how a sentence says in what capacity someone does something: "acts as a friend", "reads
the book as a student", "speaks as the speaker". E2 filed *as* with *for*, *about* and *without*, and
deferred it as the weakest by frequency; the other three shipped. What is left is small: the marker,
the article-dropping and all seven words already exist in the essive branch of every engine, and a
plan today can only reach them by putting a role on the **object** — which is the wrong controller
for agreement in German and the wrong order in Japanese the moment the verb has an object.

## Today

Verified at HEAD, 2026-09-23.

- [`ComplementType`](../../../../../packages/shared/src/index.ts#L254) has fourteen members and no
  `role`. The subject's predication is `predicative`, the copula's complement ("becomes a
  student"), which renders a predicate noun **with** its article — "la donna diventa uno studente",
  "die Frau wird ein Student" (probe) — and German returns from it early
  ([`de/complementsPhrase.ts#L95`](../../../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts#L95)).
- **The essive is spelled in all seven** and names a role: en
  [`ESSIVE = 'as'`](../../../../../packages/engine/src/languages/en/en.consts.ts#L53), it *come*
  ([`it/complementsPhrase.ts#L99`](../../../../../packages/engine/src/languages/it/complementsPhrase.ts#L99)),
  fr *comme* ([L90](../../../../../packages/engine/src/languages/fr/complementsPhrase.ts#L90)), es *como*
  ([L94](../../../../../packages/engine/src/languages/es/complementsPhrase.ts#L94)), pt *como*
  ([L97](../../../../../packages/engine/src/languages/pt/complementsPhrase.ts#L97)), de *als*
  ([L108](../../../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts#L108)),
  ja [`JA_ESSIVE = 'として'`](../../../../../packages/engine/src/languages/ja/ja.consts.ts#L106). Romance and
  German force the noun bare (`withDefiniteness(conjunct, 'bare')`); English keeps the article.
- **The essive's controller is the object, hard-wired.** Italian agrees an adjective head with
  `objectForms`
  ([L101-L103](../../../../../packages/engine/src/languages/it/complementsPhrase.ts#L101)); German takes
  the object's case through
  [`OBJECT_PREDICATIVE_CASE`](../../../../../packages/engine/src/languages/de/de.consts.ts#L13)
  (`als: 'acc'`,
  [L204-L208](../../../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts#L204));
  Japanese emits the `objectPredicative` **after** the direct object
  ([`predicateSegs.ts#L245-L247`](../../../../../packages/engine/src/languages/ja/predicateSegs.ts#L245)),
  where the adjuncts precede it.
- Probed with an essive `objectPredicative` and **no object** on ACT: "the woman acts as a friend",
  "la donna agisce come amica" (with `gender: 'fem'`), "die Frau handelt als Freundin", 女は友達として
  行動します — right, because FRIEND's accusative is its nominative. With a weak noun it breaks: "der
  Mann liest das Buch als **Studenten**" (accusative), and 男は本を学生として読みます reads "treats the
  book as a student". Nothing rejects an `objectPredicative` on an intransitive verb: the engine does
  not check `Concept.complements`
  ([`resolveComplements`](../../../../../packages/engine/src/translator/functions/resolveComplements.ts#L20)).
- The **similative manner** is the neighbouring construct and renders today: "acts like a friend",
  "agisce come **un** amico", "handelt **wie** ein Freund", 友達**のように** — en
  [`MANNER_PREP`](../../../../../packages/engine/src/languages/en/en.consts.ts#L65), de
  [`mannerPrepCase`](../../../../../packages/engine/src/languages/de/mannerPrepCase.ts). The Romance
  engines spell both *come / comme / como*; only the article tells them apart.
- [`defaultDefiniteness`](../../../../../packages/shared/src/index.ts#L86) returns `indefinite` for
  `predicative` and `objectPredicative` only; every other slot defaults to `definite`.
- **A defect met on the way, not this task's:** German declines the feminine counterpart of a weak
  noun as weak — "der Mann sieht die **Studentinen**", "gibt der Studentinen das Buch" (STUDENT
  `weak: '1'` with `fem: 'Studentin'`; [`applyNounGender`](../../../../../packages/engine/src/translator/functions/applyNounGender.ts)
  swaps the base and keeps the flag). Any slot, not only a role; it wants a bug file of its own.

## Design

### D1. A `role` complement type, not an essive with no object

E2's D3 laid out three hosts and recommended option 1 if the construct was wanted. The probe above
adds the reason the cheapest stand-in — an essive `objectPredicative` on a verb with no object — is
not enough: the controller is **per-construction**, not per-sentence. A transitive verb holds both
readings ("uses the house as a prison" / "reads the book as a student"), and German's case and
Japanese order differ between them. A `predication` value of `'role'` on `objectPredicative` would
make the object complement predicate of the subject, which its name and every branch contradict.

**Recommendation: `role` as a new `ComplementType`** (E2 D3 option 1), adposition-bearing in the
sense that it carries a marker, in `DETERMINER_COMPLEMENT_TYPES` so its determiner reaches English.

### D2. The role is the essive with the subject as controller

Everything the essive decides carries over — the word, the bare noun in Romance and German, the
English article kept. What changes is what it agrees with:

| | essive (`objectPredicative`) | role |
|---|---|---|
| controller | direct object | subject |
| de case after *als* | accusative ("als den Ersten") | **nominative** ("als Student") |
| ja position | after the object (本を条件として使う) | with the adjuncts, **before** the object (学生として本を読む) |

**Recommendation: extract each engine's essive noun rendering into one helper that takes the
controller** — `objectForms` / `object.case` for the essive, the subject's agreement and `'nom'` for
the role — and call it from both branches. No second copy of *come* / *als* / として. Japanese needs no
helper: `role` goes through the adjunct path with `PARTICLE.role = 'として'`, and the adjunct block
already precedes the object (L245-L246).

### D3. The role against the similative manner

"As a friend" (in the capacity of) and "like a friend" (in the manner of) are different claims, and
four languages mark them differently (as / like, als / wie, として / のように, and French *en tant que*
at the formal end). The Romance four spell both *come / comme / como* and separate them **only by the
article**: *agisce come amico* is the role, *come un amico* the likeness.

**Recommendation: the role's noun is bare in it/fr/es/pt/de whatever the plan's determiner** — the
essive's rule, kept as a hard rule rather than a default, because an article there turns the role
into the manner. English keeps the plan's article and defaults it to `indefinite` ("as a friend", not
"as the friend"): `defaultDefiniteness` gains `role`. Italian's colloquial *da* ("fa da padre") and
French's *en* ("agit en ami") are variants; *come* / *comme* are the neutral choice.

### D4. Noun heads only

A role names a class: "as a student", "as the speaker". An adjective there is a different construct
— the depictive, "arrives **happy**" — and the essive stand-in shows why it cannot ride here: "la
femme agit comme **heureux**" agrees with nothing. A pronoun ("as him") is a disguise, not a role.

**Recommendation: the translator drops an adjective or pronoun head on `role`** (so `role` stays out
of `TONIC_COMPLEMENTS`), with the reason in the doc comment. The depictive is a follow-up of its own.

### D5. Gender and number come from the plan

"La donna agisce come amic**a**" needs FRIEND's feminine, and the engine has no way to infer it: a noun
lexeme carries grammatical gender, not natural gender (the `antecedent` doc comment says so), and
*la persona* is feminine without being a woman. `predicative` has the same gap today ("la donna
diventa uno studente").

**Recommendation: the role's `gender` and `number` are the plan's own**, as on every noun phrase,
and no agreement with the subject is inferred. Agreement of a role or predicate noun with a natural
gender is a follow-up for both slots at once.

### D6. Render order

"Gives the book to the cat as a friend" reads better than "gives the book as a friend to the cat";
"acts as a friend in the house" and "in the house as a friend" are both fine.

**Recommendation: `role` right after `terminus`** in
[`COMPLEMENT_RENDER_ORDER`](../../../../../packages/shared/src/index.ts#L287), before the comitative.
Japanese takes it from there into the adjunct block, before the object (D2).

## 1. Shared types — [`packages/shared/src/index.ts`](../../../../../packages/shared/src/index.ts)

- `role` in `ComplementType` ([L254](../../../../../packages/shared/src/index.ts#L254)), doc-commented
  with D1-D4 and pointed at `ObjectPredication` for the word.
- `COMPLEMENT_RENDER_ORDER` ([L287](../../../../../packages/shared/src/index.ts#L287)) per D6,
  `COMPLEMENT_LABELS` ([L289](../../../../../packages/shared/src/index.ts#L289)) `role: 'Role'`,
  `DETERMINER_COMPLEMENT_TYPES` ([L315](../../../../../packages/shared/src/index.ts#L315)). **Not** in
  `COMPLEMENT_TYPES` ([L265](../../../../../packages/shared/src/index.ts#L265)) — no box yet.
- `defaultDefiniteness` ([L86](../../../../../packages/shared/src/index.ts#L86)): `role` joins the two
  predicatives' `indefinite`.
- `ObjectPredication`'s doc comment ([L514](../../../../../packages/shared/src/index.ts#L514)): one line
  naming `role` as the essive's subject-oriented counterpart.

## 2. Translator

[`resolveComplements`](../../../../../packages/engine/src/translator/functions/resolveComplements.ts)
drops a `role` whose conjunct heads are not all nouns (D4). Nothing else: the controller's features
are the subject's, which every engine already holds as `subjectForms`.

## 3. Per-engine rendering

- **en**: `PREP.role = 'as'` in [`en.consts.ts`](../../../../../packages/engine/src/languages/en/en.consts.ts#L33)
  (the shared path keeps the article), or reuse `ESSIVE`.
- **it / fr / es / pt**: the essive helper (D2) with `agreementForms(subjectForms)`; a `role` branch
  beside `objectPredicative` in each `complementsPhrase`.
- **de**: the helper with case `'nom'`; weak nouns then take their nominative ("als Student"). The
  weak-feminine defect in *Today* shows up here first ("als Studentinen") and should be fixed first.
- **ja**: `PARTICLE.role = 'として'` in [`ja.consts.ts`](../../../../../packages/engine/src/languages/ja/ja.consts.ts#L30);
  the na-adjective stem rule of A224 does not apply (D4 excludes adjectives).

## 4. Frontend (plan-only first pass)

The exhaustive maps carry `role` inertly, as E2 did for `purpose` and `topic`: `COMPLEMENT_LABEL_KEYS`
([`slots.ts#L148`](../../../../../packages/frontend/src/components/PhraseBuilder/slots.ts#L148)),
`COMPLEMENT_KEYS`, `complementIcons`, `BoxComplementType`. That needs a grammar-name concept
ROLE_COMPLEMENT behind `slot.role`, literal by design unless a ROLE noun is seeded to gloss it
("a complement that indicates roles") — reseed `signi.db`. ACT (and WORK, if a labour sense is
seeded) license `role` in `Concept.complements`. The box itself waits for the temporal ring, with
`purpose` and `topic`; the verb ring is at capacity.

## Tests

- `test/complements/role.test.ts`: the table's first three columns in all seven, plus a plural
  ("the men act as friends"), a coordinated role ("as a friend and a student") and a past tense.
- The article: a `definite` role renders bare in it/fr/es/pt/de and keeps "the" in English; the
  default is `indefinite` (D3).
- German nominative on a weak noun ("als Student"), against the essive's accusative on the same noun.
- Japanese order: として before the object (男は学生として本を読みます), and the essive unchanged
  after it (家を条件として使います).
- The similative untouched: the table's last column still renders "like" / "come un" / "wie" / のように.
- An adjective and a pronoun head on `role` render nothing (D4).
- `test/complements/objectPredicative.test.ts` unchanged — the extracted helper must not move a word.

## Verification

1. `npm run build -w @signi/shared && npm run build -w @signi/engine`.
2. Engine, frontend and backend suites green; typecheck clean — the widened union makes the compiler
   list every `Record<ComplementType, …>` (`PREP`, `PARTICLE`, `COMPLEMENT_LABELS`, the frontend maps).
3. Reseed `signi.db` for ROLE_COMPLEMENT and ACT's licence; `POST /api/translate` with a `role`
   complement for each column of the table.

## Out of scope (follow-ups)

- **The box** for `role`, laid out with the temporal ring, `purpose` and `topic`.
- **The depictive** ("arrives happy", "arriva stanca") — an adjective said of the subject during the
  act (D4).
- **Natural-gender agreement** of a role or predicate noun with its subject (D5).
- **TEACHER and a labour-sense WORK**, so the canonical "works as a teacher" can be built.
- **The German weak-feminine declension** ("die Studentinen") — a bug, not part of this construct.
