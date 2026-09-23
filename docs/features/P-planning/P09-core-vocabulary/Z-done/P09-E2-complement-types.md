# P09-E2. New complement types — for, about, as, without

**Construct:** the complements [`ComplementType`](../../../../../packages/shared/src/index.ts#L238) has
no member for, from [P09 §3](../README.md#3-needs-the-engine-first-11-constructs--5-open).
**Shape:** P09 filed four. **Two are new types** (`purpose`, `topic`); the other two are already in
the model and need a host, not a type — see *Today*.
**Scope:** all 7 languages, and the first complement box added to the canvas since it was laid out.
**Status:** shipped, 2026-09-23. Split out of P09 §3 the same day. `purpose` and `topic` render in
all seven, plan-only; the privative renders in all seven and has its toggle on the canvas and in the
console. *as* (D3) is deferred — see *Done*.
**Words:** *for*, *about*, *as*, *without*.

| lang | speaks **about** the cat | reads **for** the man | thinks **about** the cat | cuts **without** the stick |
|---|---|---|---|---|
| en | the woman speaks about the cat. | the woman reads for the man. | the woman thinks about the cat. | the woman cuts without the stick. |
| it | la donna parla del gatto. | la donna legge per l'uomo. | la donna pensa al gatto. | la donna taglia senza il bastone. |
| fr | la femme parle du chat. | la femme lit pour l'homme. | la femme pense au chat. | la femme coupe sans le bâton. |
| de | die Frau spricht über den Kater. | die Frau liest für den Mann. | die Frau denkt an den Kater. | die Frau schneidet ohne den Stock. |
| es | la mujer habla sobre el gato. | la mujer lee para el hombre. | la mujer piensa en el gato. | la mujer corta sin el palo. |
| pt | a mulher fala sobre o gato. | a mulher lê para o homem. | a mulher pensa no gato. | a mulher corta sem o pau. |
| ja | 女は猫について話します。 | 女は男のために読みます。 | 女は猫について考えます。 | 女は棒なしで切ります。 |

**Engine output**, pinned in `test/complements/topic.test.ts`, `purpose.test.ts` and
`privative.test.ts`. The planned table's *works for* and *bread / knife* are gone because the corpus
has neither: its WORK is the *function* sense ("la donna funziona per l'uomo"), and BREAD and KNIFE
are not seeded, so READ and STICK stand in. The *as* column is D3's, deferred.

## Done

Shipped 2026-09-23. What landed, and where it differs from the design below:

- **Two types, plan-only** (D1, D2). `purpose` and `topic` are in `ComplementType`,
  `COMPLEMENT_RENDER_ORDER` (topic between the instrument and the manner, purpose right after the
  cause), `COMPLEMENT_LABELS` and `DETERMINER_COMPLEMENT_TYPES`, and **not** in `COMPLEMENT_TYPES`,
  as C29's temporal: the canvas draws no box for either, and the frontend's exhaustive maps
  (`COMPLEMENT_LABEL_KEYS`, `COMPLEMENT_KEYS` F / B, `complementIcons`, `BoxComplementType`) carry
  them inertly. Both are adposition-bearing and in `TONIC_COMPLEMENTS`: "for her", "per lei",
  "über ihn", "d'eux".
- **German takes the accusative on all three** — *für*, *über*, *ohne* — each a `_case = 'acc'`
  line in the head chain; the spatial *über* + dative is untouched (tested).
- **Japanese** (D4): のために for the purpose, について for the topic with a comment in `PARTICLE`
  that it is not は, なしで for the privative (`JA_PRIVATIVE`).
- **A verb may govern its topic's preposition** — not in the plan. THINK in five languages does not
  take the generic word ("*pensa del gatto*", "*pense du chat*"): it "pensare a", fr "penser à", de
  "denken an", es "pensar en", pt "pensar em". The lexeme names it as `topic_prep`, the translator
  carries it on `ResolvedComplement.link` (the factitive link's field, `topicLink`), and each engine
  fuses it as that preposition fuses anywhere ("pensa al gatto", "denkt ans Haus", "pensa nele").
  THINK and SPEAK now license `topic`.
- **The privative** is `instrumental` + `Complement.negative` (`isPrivative`), a swap of the
  adposition, never a negator: *without / senza / sans / sin / sem / ohne* / なしで. The clause stays
  positive and a negated clause keeps its own negation beside it (tested). French "sans" drops the
  plural indefinite and the partitive ("sans bâtons", "sans eau"); Italian reaches a pronoun through
  "di" ("senza di lui"); Spanish and Portuguese fuse no pronoun ("sin mí", "sem mim").
- **The action levels are denied too**, which the plan did not cover: en "without choosing a word",
  it/fr/es/pt the bare infinitive ("senza scegliere", "sans choisir"), de the subjectless ", ohne ein
  Wort zu wählen" in the Nachfeld and "ohne das Wählen eines Wortes", ja 選ばないで / 選ぶことなしで.
  Without them the canvas toggle would have silently rendered a positive act.
- **The privative toggle rides the instrumental link, not `PhraseSelection`** (§3). The cause's
  polarity is `causeNegative` on the selection because the cause is a box; the instrument is a
  period of its own reached by a link, and its reification level already lives on that link for
  the same reason. So `negative` is on the instrumental `PhraseLink` (`setInstrumentalNegative` in
  `linkRules`, `InstrumentalBinding.negative`, saved and hydrated), `attachInstrumental` puts it on
  the plan, and the instrument period shows a polarity chip beside its reification switch
  (`PrivativeSwitch`, the verb's `polarity.value.*` words under `satellite.polarity` — no new UI
  string). Its key is ⇧N on the period, as the cause's is ⇧N on its box. The console takes
  `/without` (aliases `/notinst`, `/privative`) and `/posinst`, said on either period of the pair
  or on the line that makes the link, printed after `/level`; the round trip holds at 5000 seeds.
- **Two grammar-name concepts seeded**, because `COMPLEMENT_LABEL_KEYS` is exhaustive:
  PURPOSE_COMPLEMENT (glossed "a complement that indicates purposes") and TOPIC_COMPLEMENT (literal
  by design: its gloss needs a TOPIC noun the corpus lacks), behind `slot.purpose` / `slot.topic`.
  **`signi.db` needs a reseed** for them and for THINK / SPEAK's new forms.

Follow-ups:

- **The role complement** (D3), *works as a teacher* — deferred as recommended; if taken, option 1.
- **Boxes for `purpose` and `topic`**, to be laid out together with the temporal ring (§3).
- **A TOPIC noun**, so TOPIC_COMPLEMENT can be glossed like its siblings.
- **More verbs licensing the two**: TALK and SAY are unseeded, and no verb licenses `purpose` yet —
  it reads as a free adjunct in the plan, but the word map and the console name only what a verb
  licenses.
- The planned order put *for* before *because of* in its own example ("works for the man because
  of the money"), against the ruling followed here (purpose after cause). Worth a look once a box
  makes the order visible.
- Japanese spells the purpose and the neutral cause alike (のために), so 犬のために男のために is
  ambiguous in the one sentence that holds both; a purpose could take 〜のために and the cause
  〜のせいで / 〜が原因で if that ever matters.

## Why

A complement type is how this engine says "an adposition whose choice is grammar, not vocabulary".
Every one it has is a *place*, a *means*, a *reason* or a *recipient*. It has nothing for what an
act is **for**, and nothing for what it is **about** — the two commonest adjuncts after place and
time, and the ones that block *say*, *think*, *talk* and *ask* from saying what they are about.
Without a `topic`, "thinks about the cat" cannot be built at all, and P09 §2 seeded THINK and TALK
with that gap written into their notes.

## Today

Verified at HEAD, 2026-09-23. **Two of P09's four are already in the model**, which is the finding
that shapes this task:

- **`without` is `instrumental` + `negative`, not a new type.**
  [`Complement.negative`](../../../../../packages/shared/src/index.ts#L1031) exists and its doc comment
  says why it is on `Complement` rather than on the cause alone: "so a second adjunct can take it
  without a model change; every other complement ignores it today." A privative is the negated
  means, exactly as the negative cause is the denied reason. This is the change the field was put
  there for.
- **`as` is already spelled in all seven.** The essive
  ([`ObjectPredication`](../../../../../packages/shared/src/index.ts#L475)) renders *as / come / comme /
  como / als / として* and drops the article in Romance and German ("come condizione", "als
  Bedingung"). What it has no host for is a role said of the **subject** ("works as a teacher")
  rather than of the object ("use this as the condition"). The marker, the article-dropping and the
  seven words are done; only the slot is missing.
- **`for` is not the purpose clause.** [`PurposeClause`](../../../../../packages/shared/src/index.ts#L1126)
  already renders the *clausal* purpose ("click **to change**", German *um … zu* extraposed, Japanese
  before the predicate). E2's *for* is the **nominal** one — a beneficiary or a goal that is a thing,
  not an act. The two must be told apart in the doc comment or they will be built twice.

What a new complement type costs, all of it verified:

| site | file | what it is |
|---|---|---|
| the union | [`index.ts:238`](../../../../../packages/shared/src/index.ts#L238) | `ComplementType` |
| the builder's set | [`index.ts:248`](../../../../../packages/shared/src/index.ts#L248) | `COMPLEMENT_TYPES` — **presence here is what gives a box on the canvas** |
| the engine's order | [`index.ts:266`](../../../../../packages/shared/src/index.ts#L266) | `COMPLEMENT_RENDER_ORDER` — holds all of them, not just the offered ones |
| the label | [`index.ts:268`](../../../../../packages/shared/src/index.ts#L268) | `COMPLEMENT_LABELS` |
| the determiner rule | [`index.ts:291`](../../../../../packages/shared/src/index.ts#L291) | `DETERMINER_COMPLEMENT_TYPES` |
| what a verb licenses | [`index.ts:537`](../../../../../packages/shared/src/index.ts#L537) | `Concept.complements` |
| en | [`en.consts.ts:23`](../../../../../packages/engine/src/languages/en/en.consts.ts#L23) | one `PREP` entry |
| ja | [`ja.consts.ts:16`](../../../../../packages/engine/src/languages/ja/ja.consts.ts#L16) | one `PARTICLE` entry |
| it/fr/es/pt/de | each `complementsPhrase` | one `else if (type === …)` branch in the head-selection chain |

## Design

### D1. Two new types, not four

**Recommendation: `purpose` and `topic` only.** `without` becomes `instrumental` + `negative`
(*Today*), and `as` becomes a role slot rather than a complement — see D3. Four types would put four
boxes on a canvas that has no room for the one C29 already owes it, and two of the four would
duplicate machinery that renders today.

### D2. `purpose` covers the beneficiary and the goal with one adposition

*For the man* (who benefits) and *for the work* (what it is for) take the same preposition in all
seven — *per / pour / para / para / für / のために* — and no language splits them the way it splits
the instrument from the companion. **Recommendation: one type, and let the noun's animacy carry the
reading**, as `manner` lets the head noun carry its relation
([`MannerRelation`](../../../../../packages/shared/src/index.ts#L401), read off `Concept.mannerRelation`
and never exposed). If a language later needs the split, it is a specifier on the type, not a second
type.

German is the one to check: *für* governs the **accusative**, where almost every other complement
preposition in the engine governs the dative. That is one `_case` line in the branch, and the
existing `prepDet` handles it.

### D3. `as` is a role on the subject, and its host is the open question

"Works as a teacher" predicates a role of the **subject** while a verb is doing something else,
which is neither `predicative` (that is a copula's complement — "becomes a teacher") nor
`objectPredicative` (that is said of the object). Three shapes, in order of preference:

1. **A `role` complement type** — a third type, paying the table above a third time, but it sits
   where the meaning does and the essive marker is already per-language.
2. **A `predication` specifier on a `predicative` complement licensed by a non-copular verb** —
   cheapest, and wrong: `predicative` is defined as the copula's complement and the engines branch
   on it early (German returns from `coordinate` before the prepositional path).
3. **Defer it.** P09 §2 seeded no word that needs it, and the essive covers the object reading the
   UI strings actually use.

**Recommendation: (3), and file it as this task's own follow-up.** *as* is the weakest of P09's four
by frequency in the corpus's own sentences, and the other three pay for themselves immediately.
If it is wanted, take (1).

### D4. Japanese は the topic particle is **not** the topic complement

Japanese marks the sentence topic with は, which is already how every subject is rendered. The
`topic` complement is 〜について ("about"), a compound postposition on the noun, and the two must not
be confused: 猫について話します is "speaks about the cat", 猫は話します is "the cat speaks". Say it in
the `PARTICLE` entry's comment, because the word "topic" invites exactly this mistake.

German `über` takes the **accusative** in this sense (*über den Kater*), against the dative it takes
as a spatial relation (*über dem Kater*) — the same two-way alternation
[`spatialCase`](../../../../../packages/engine/src/languages/de/spatialCase.ts) already encodes for the
locative, and a second reason the branch needs its own `_case`.

## 1. Shared types

The seven sites in the table above, for `purpose` and `topic`. Both are adposition-bearing, so both
join `DETERMINER_COMPLEMENT_TYPES`. Both go in `COMPLEMENT_RENDER_ORDER` — the recommendation is
after `cause` for `purpose` (the reason and the goal belong together, and English says "works for
the man because of the money") and beside `manner` for `topic`, which is closer to the verb.

Extend `Complement.negative`'s doc comment with the privative reading, and `PurposeClause`'s with a
line telling it apart from the `purpose` complement (D1, *Today*).

## 2. Per-engine rendering

One branch per engine, following the shape of the `temporal` branch C29 added — the most recent
example, and the one that shows the whole pattern including a per-lexeme adposition fallback.
German needs the accusative on both new types (D2, D4). Japanese needs のために and について as
compound postpositions, which `PARTICLE` already holds the shape for (the cause's のために is there).

The privative needs no new branch: each engine's instrumental path gains a `negative` check that
swaps *with* for *without* — *senza / sans / sin / sem / ohne* / なしで. German *ohne* governs the
accusative, which is the third time this task needs that line.

## 3. Frontend

`purpose` and `topic` in `COMPLEMENT_TYPES` gives each a box, its selection fields and its console
slot for free — the frontend derives all three from that list. **But the canvas is the constraint,
not the code**: C29's temporal complement is already owed a box, and the verb ring is at capacity.
Two more boxes is a layout question first and a control question second, and it should be settled
together with the temporal ring rather than twice.

The privative wants no box at all — a polarity toggle on the instrumental box, beside the one the
cause already has (`{ id: "causePolarity" }` in the console's command set).

## 4. Tests

- `test/complements/` gains `purpose.test.ts` and `topic.test.ts`, each the full 7-language table
  with definite, indefinite, plural and pronoun heads.
- The instrumental suite gains a negative case per language, and one test pinning that the clause
  itself stays positive — the invariant `Complement.negative` already documents for the cause.
- German: accusative on *für*, *über* and *ohne*, and a test that the spatial *über* + dative is
  unchanged.
- Japanese: 〜について against a は-marked subject in the same sentence (D4).
- `sweep-definitions.test.ts` picks up any definition that starts using the new types.

## Verification

1. `npm run build -w @signi/shared && npm run build -w @signi/engine`.
2. Engine, frontend and backend suites green; typecheck clean. The widened union makes the compiler
   list every `Record<ComplementType, …>` — `PREP`, `PARTICLE` and `COMPLEMENT_LABELS` are total.
3. `POST /api/translate` with each new complement against the table, plus a negative instrumental.
4. In the browser (5173): each new box appears in its place, takes a noun and a determiner, and the
   instrumental's polarity toggle flips *with* to *without*.

## Out of scope (follow-ups)

- **The role complement** (D3), if the deferral is taken.
- **The adversarial *against*** ("fights against the dog") — [E1](P09-E1-spatial-relations.md) rules
  it out as a spatial relation, and it would be a complement here if anywhere.
- **Splitting beneficiary from purpose** (D2), should a language ever need it.
- **A topic that is a clause** ("speaks about what the cat did") — that is
  [E4](P09-E4-clauses.md)'s content clause in a complement, and needs both.
