# P09-E22. The adversarial *against* — an opponent, not a place

**Construct:** "plays **against** the dog", "fights **against** the dog" — the party an act is
directed against. A complement, not a [`PathSpecifier`](../../../../../packages/shared/src/index.ts#L369):
E1 seeded the physical *against* (contact) and ruled this reading out.
**Shape:** one new plan-only [`ComplementType`](../../../../../packages/shared/src/index.ts#L254),
`opponent`, built the way E2 built `purpose` and `topic`, with the verb allowed to govern its
marker the way THINK governs its topic's (`topic_prep`).
**Scope:** all 7 languages, plan-only (no box, like E2's two).
**Status:** **shipped, 2026-09-24**, plan-only — in the engine for all seven languages, carried
inertly by the frontend; see [Done](#done). Filed 2026-09-23 from P09's follow-ups
([E1](P09-E1-spatial-relations.md#d3-against-is-contact-not-opposition) D3,
[E2](P09-E2-complement-types.md#out-of-scope-follow-ups) *Out of scope*).
**Words:** *against* (opposition). **FIGHT is not seeded**; PLAY_GAME is, and carries the tests.

| lang | the cat plays **against the dog** | the cat plays **against him** | the man fights **against the dog** (FIGHT, unseeded) |
|---|---|---|---|
| en | the cat plays against the dog. | the cat plays against him. | the man fights against the dog. |
| it | il gatto gioca contro il cane. | il gatto gioca contro di lui. | l'uomo combatte contro il cane. |
| fr | le chat joue contre le chien. | le chat joue contre lui. | l'homme lutte contre le chien. |
| de | der Kater spielt gegen den Hund. | der Kater spielt gegen ihn. | der Mann kämpft gegen den Hund. |
| es | el gato juega contra el perro. | el gato juega contra él. | el hombre lucha contra el perro. |
| pt | o gato joga contra o cão. | o gato joga contra ele. | o homem luta contra o cão. |
| ja | 猫は犬を相手に遊びます。 | 猫は彼を相手に遊びます。 | 男は犬と戦います。 |

**Proposed at filing.** The first two columns are now engine output, word for word (see
[Done](#done)); the third waits on FIGHT, and its Japanese override is pinned on a test-only verb.

## Done

Shipped 2026-09-24. D1–D4 as recommended; D3 ruled **を相手に** as the generic, with the verb-governed
override. The table as the engine now writes it (PLAY_GAME; the last column is a test-only verb with
戦う's Japanese lexeme and `opponent_prep: 'と'`, its other six reading PLAY_GAME's):

| lang | the cat plays **against the dog** | the cat plays **against him** | the cat plays **against me** | the man plays **with the cat against the dog** in the house | override (ja) |
|---|---|---|---|---|---|
| en | the cat plays against the dog. | the cat plays against him. | the cat plays against me. | the man plays with the cat against the dog in the house. | — |
| it | il gatto gioca contro il cane. | il gatto gioca contro di lui. | il gatto gioca contro di me. | l'uomo gioca con il gatto contro il cane nella casa. | — |
| fr | le chat joue contre le chien. | le chat joue contre lui. | le chat joue contre moi. | l'homme joue avec le chat contre le chien dans la maison. | — |
| de | der Kater spielt gegen den Hund. | der Kater spielt gegen ihn. | der Kater spielt gegen mich. | der Mann spielt mit dem Kater gegen den Hund im Haus. | — |
| es | el gato juega contra el perro. | el gato juega contra él. | el gato juega contra mí. | el hombre juega con el gato contra el perro en la casa. | — |
| pt | o gato joga contra o cão. | o gato joga contra ele. | o gato joga contra mim. | o homem joga com o gato contra o cão na casa. | — |
| ja | 猫は犬を相手に遊びます。 | 猫は彼を相手に遊びます。 | — | 男は猫と犬を相手に家で遊びます。 | 男は犬と戦います。 |

What landed, and where it differs from the plan below:

1. **`opponent` is a `ComplementType`**, doc-commented with D1 and D3, right after `comitative` in
   `COMPLEMENT_RENDER_ORDER`, in `COMPLEMENT_LABELS` and `DETERMINER_COMPLEMENT_TYPES`, and **not** in
   `COMPLEMENT_TYPES`: no box. `TONIC_COMPLEMENTS` gains it.
2. **Italian needed `contro` in `ItPreposition`** and in its non-fusing set
   ([`it/prepDet.ts`](../../../../../packages/engine/src/languages/it/prepDet.ts)), which the plan did
   not list: the spatial `against` reaches it as an adverb through `spatialHead`, never through
   `prepDet`. *Contro di lui* came for free from `IT_DI_BEFORE_PRONOUN`, as the plan said.
3. **One branch per engine**, directly after its comitative: it / fr / es / pt `prepDet(c.link ||
   <generic>)`, German `_case = 'acc'` with *gegen*. English and Japanese have no per-type branch;
   each takes the word from `PREP` / `PARTICLE`, with one `c.link` line ahead of it. The oblique tonic
   of Spanish and Portuguese (*contra mí*, *contra mim*) needed nothing: the shared tonic path already
   gives it to every preposition but *entre*.
4. **`opponentLink`** ([`functions/opponentLink.ts`](../../../../../packages/engine/src/functions/opponentLink.ts))
   reads `opponent_prep`, and `resolveComplements` carries it on `ResolvedComplement.link` beside the
   topic's. Every engine honours it, not only Japanese; no seeded lexeme names one yet.
5. **The override is pinned on a test-only verb**, `TEST_FIGHT`, through a wrapped lookup in
   [`opponent.test.ts`](../../../../../packages/engine/test/complements/opponent.test.ts): FIGHT stays
   unseeded.
6. **Questions over the gap needed nothing**: P09-E15's stand-in already reaches every complement —
   "who does the cat play against?", it "contro chi gioca il gatto?", de "gegen wen spielt der
   Kater?" / "wogegen spielt der Kater?", 猫は誰を相手に遊びますか？ (probed, not pinned). So do
   relatives: "the dog against which the cat plays", de "der Hund, gegen den der Kater spielt".
7. **Seeded:** OPPONENT_COMPLEMENT behind `slot.opponent`, **literal by design** (no OPPONENT noun
   for "a complement that indicates an opponent") — it "complemento di svantaggio" (the school name
   of the *contro* complement), fr "complément circonstanciel d'opposition", de "adverbiale
   Bestimmung des Gegners", es "complemento circunstancial de oposición", pt "adjunto adverbial de
   oposição", ja 相手の副詞語句. PLAY_GAME licenses `opponent`. **`signi.db` needs a reseed** for both.
8. **Frontend, inert:** `COMPLEMENT_LABEL_KEYS` → `slot.opponent`, `COMPLEMENT_KEYS` → **V** (from
   *versus*; O is the object complement's, A the temporal's), `complementIcons` → a grappling icon,
   and `BoxComplementType` excludes it.
9. **`Complement.negative` on an opponent is ignored**, as on the comitative ("not against the dog"
   renders "against the dog"). Not in the plan; left as it is.

Follow-ups, beside *Out of scope* below:

- **Japanese relatives over a marked complement drop the marker**: "the dog against which the cat
  plays" is 猫が遊ぶ犬, as it is for the comitative, the topic (猫が話す犬) and the purpose.
  Pre-existing, not the opponent's own.

## Why

*Against* is the one opposition marker every language here has, and the corpus has verbs that want
it (PLAY_GAME now, FIGHT and its kin when seeded). Today the only way to write it is to misuse E1's
contact relation, which happens to be right in the four Romance languages and English and wrong in
German and Japanese — see *Today*.

## Today

Verified at HEAD, 2026-09-23.

- **E1's `against` is contact only**, by its doc comment ([`index.ts:362`](../../../../../packages/shared/src/index.ts#L362)):
  "The adversarial 'fights against the dog' is no spatial relation and is not this one."
- **Misusing it shows why it is not this construct.** Probed with `sayAll`, PLAY_GAME + locative
  `against` DOG: en "plays against the dog", it "gioca contro il cane", fr "joue contre le chien", es
  "juega contra el perro", pt "joga contra o cão" — right by coincidence — but de "**spielt am
  Hund**" (the contact *an* + dative, [`de/spatialHead.ts:26`](../../../../../packages/engine/src/languages/de/spatialHead.ts#L26))
  and ja "**犬に遊びます**" (the contact flattening to に, [`ja.consts.ts:179`](../../../../../packages/engine/src/languages/ja/ja.consts.ts#L179)).
  As a direction it is de "spielt an den Hund". German needs *gegen* + accusative, which E1 kept out
  of the spatial set on purpose, and the misuse occupies the locative a real place needs ("plays
  against the dog in the house").
- **The comitative is not it either.** PLAY_GAME + comitative DOG is "plays with the dog" / *con* /
  *avec* / *mit* / 犬と — a partner. `Complement.negative` on it is ignored (probed: unchanged), and
  would mean *without* if anything, not *against*.
- **No seeded verb licenses it.** [`PLAY_GAME`](../../../../../packages/backend/src/concepts/verbs/intransitive.ts#L1046)
  licenses `manner, locative, cause, instrumental`. FIGHT, COMPETE, OPPOSE, DEFEND, ATTACK: none is
  seeded (grepped `packages/backend/src/concepts/`).
- **What a new type costs** is E2's table, all still true at these lines:
  [`ComplementType`](../../../../../packages/shared/src/index.ts#L254),
  [`COMPLEMENT_RENDER_ORDER`](../../../../../packages/shared/src/index.ts#L287),
  [`COMPLEMENT_LABELS`](../../../../../packages/shared/src/index.ts#L289),
  [`DETERMINER_COMPLEMENT_TYPES`](../../../../../packages/shared/src/index.ts#L315),
  [`TONIC_COMPLEMENTS`](../../../../../packages/engine/src/functions/functions.consts.ts#L33), en
  [`PREP`](../../../../../packages/engine/src/languages/en/en.consts.ts#L33), ja
  [`PARTICLE`](../../../../../packages/engine/src/languages/ja/ja.consts.ts#L30), one branch in each
  Romance/German `complementsPhrase`, and the frontend's total maps
  ([`COMPLEMENT_LABEL_KEYS`](../../../../../packages/frontend/src/components/PhraseBuilder/slots.ts#L148),
  [`COMPLEMENT_KEYS`](../../../../../packages/frontend/src/components/PhraseBuilder/slots.ts#L169),
  [`complementIcons`](../../../../../packages/frontend/src/components/PhraseBuilder/satellites/satellites.types.tsx#L116),
  [`BoxComplementType`](../../../../../packages/frontend/src/components/PhraseBuilder/interfaces.ts#L79))
  plus a grammar-name concept for the label, as
  [`PURPOSE_COMPLEMENT`](../../../../../packages/backend/src/concepts/nouns.ts#L3933) was.
- **A verb can already govern a complement's preposition**: THINK's `topic_prep`, read by
  [`topicLink`](../../../../../packages/engine/src/functions/topicLink.ts) and carried on
  `ResolvedComplement.link` by [`resolveComplements.ts:77`](../../../../../packages/engine/src/translator/functions/resolveComplements.ts#L77)
  — for `topic` only.
- Italian reaches a pronoun through *di* after *contro* already
  ([`IT_DI_BEFORE_PRONOUN`](../../../../../packages/engine/src/languages/it/it.consts.ts#L188)).

## Design

### D1. A complement type, not a relation or a specifier

1. **A new `opponent` type**, plan-only, adposition-bearing, in `TONIC_COMPLEMENTS`.
2. **A specifier on the comitative** (`with` / `against`). Tempting — English "fights *with* the dog"
   and Japanese 犬と戦う mark the opponent like a partner — but the Romance and German split is
   lexical (*con* / *contro*, *mit* / *gegen*), the comitative is the partner in everything else it
   does, and its `negative` would then have two meanings.
3. **The spatial `against` under a verb flag.** Wrong in German and Japanese (*Today*), and it
   occupies a spatial slot.

**Recommendation: (1).** Name it for the role, as `terminus` and `purpose` are named: `opponent`.
Render order right after `comitative` (the two co-participants together): "plays with the cat
against the dog".

### D2. The words

en *against*; it *contro* (*contro di lui* for free); fr *contre*; de *gegen* + **accusative** — one
`_case = 'acc'` line, the fourth after E2's *für*, *über*, *ohne*; es/pt *contra*, with the oblique
tonic (*contra él* / *contra mí*, *contra ele* / *contra mim* — not the nominative Spanish *entre*
takes). None fuses with the article.

**Recommendation:** these six, no alternatives. *Wider* (German, formal) and *versus* are register
variants, not relations.

### D3. Japanese has no neutral adposition — pick one, and let the verb override

Candidates for the generic marker, each with a verb it suits and one it does not:

| marker | suits | reads oddly with |
|---|---|---|
| 〜を相手に | play, fight, compete (犬を相手に遊ぶ) | attitude verbs |
| 〜に対して | speak, act, vote (犬に対して話す) | play |
| 〜に対抗して | compete, rival | everyday play |

**Recommendation: 〜を相手に as the generic, and a verb-governed override.** FIGHT's Japanese verb
takes と (犬と戦う), exactly as THINK's Romance verbs take their own topic preposition. Generalize
the `link` plumbing from `topic` to `opponent`: a lexeme key `opponent_prep` (ja と on 戦う; other
languages name none, since *combattere contro*, *kämpfen gegen*, *luchar contra* are the generic
word), read by a `opponentLink` beside `topicLink`. **Open, for a native check:** whether を相手に is
acceptable as the default at all, or the generic should be に対して and PLAY_GAME name を相手に.

### D4. Only the nominal opponent

"Fights against *doing it*" (an act opposed) is a clause host — E4's machinery — and "votes against"
(a proposal, not a party) is the same word with a different sense in Japanese (反対する). **Recommendation:
the noun phrase only**, a party opposed.

## 1. Shared types

The sites in *Today* for `opponent`: `ComplementType`, `COMPLEMENT_RENDER_ORDER` (after
`comitative`), `COMPLEMENT_LABELS`, `DETERMINER_COMPLEMENT_TYPES`. **Not** `COMPLEMENT_TYPES` —
plan-only, as E2's two.

## 2. Engine

- en `PREP.opponent = 'against'`; ja `PARTICLE.opponent = 'を相手に'` with a comment on D3.
- One `type === 'opponent'` branch in it/fr/de/es/pt `complementsPhrase`, German with `_case = 'acc'`.
- `TONIC_COMPLEMENTS` gains `opponent`.
- `opponentLink` + `resolveComplements` carrying it on `link` (D3), and each engine's branch using
  `c.link || <generic>`, as the topic branches do.

## 3. Backend and frontend

- Seed OPPONENT_COMPLEMENT (the grammar term behind `slot.opponent`) so the total label map holds —
  literal by design if no gloss composes.
- PLAY_GAME licenses `opponent`.
- Frontend: the four total maps gain an inert entry; `BoxComplementType` excludes it.
- **`signi.db` needs a reseed** for the grammar term and PLAY_GAME's licence.

## Tests

- `test/complements/opponent.test.ts`: the first two columns in all seven, with definite,
  indefinite, plural and pronoun heads (it *contro di lui*, de *gegen ihn*, es *contra mí*).
- German: *gegen* + accusative, and the spatial `against` still *an* + dative (both in one file).
- Japanese: the generic marker, and a lexeme `opponent_prep` overriding it — pinned on a test-only
  concept or on FIGHT once seeded.
- A plan with both a comitative and an opponent, pinning the order.

## Verification

1. `npm run build -w @signi/shared && npm run build -w @signi/engine`; `npm run seed`.
2. Engine, backend and frontend suites green; typecheck clean (the widened union lists every total
   map).
3. `POST /api/translate` with an `opponent` complement on PLAY_GAME against the table.

## Out of scope (follow-ups)

- **Seed FIGHT** (and COMPETE if wanted) through `/seed`, with ja 戦う naming `opponent_prep: 'と'` —
  a B ticket of its own; the third column of the table waits on it.
- **A box for `opponent`**, in the same layout pass as `purpose`, `topic` and the temporal ring.
- **The clausal opponent** (D4).
- **Register variants** (*wider*, *versus*) (D2).
