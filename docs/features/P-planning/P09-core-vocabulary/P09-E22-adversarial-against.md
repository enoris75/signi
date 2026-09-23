# P09-E22. The adversarial *against* — an opponent, not a place

**Construct:** "plays **against** the dog", "fights **against** the dog" — the party an act is
directed against. A complement, not a [`PathSpecifier`](../../../../packages/shared/src/index.ts#L369):
E1 seeded the physical *against* (contact) and ruled this reading out.
**Shape:** one new plan-only [`ComplementType`](../../../../packages/shared/src/index.ts#L254),
`opponent`, built the way E2 built `purpose` and `topic`, with the verb allowed to govern its
marker the way THINK governs its topic's (`topic_prep`).
**Scope:** all 7 languages, plan-only (no box, like E2's two).
**Status:** planning, unscheduled. Filed 2026-09-23 from P09's follow-ups
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

**Proposed, not engine output.** The Japanese generic marker is D3's open question and wants a
native check; 犬と戦います is the verb's own particle, not the complement's.

## Why

*Against* is the one opposition marker every language here has, and the corpus has verbs that want
it (PLAY_GAME now, FIGHT and its kin when seeded). Today the only way to write it is to misuse E1's
contact relation, which happens to be right in the four Romance languages and English and wrong in
German and Japanese — see *Today*.

## Today

Verified at HEAD, 2026-09-23.

- **E1's `against` is contact only**, by its doc comment ([`index.ts:362`](../../../../packages/shared/src/index.ts#L362)):
  "The adversarial 'fights against the dog' is no spatial relation and is not this one."
- **Misusing it shows why it is not this construct.** Probed with `sayAll`, PLAY_GAME + locative
  `against` DOG: en "plays against the dog", it "gioca contro il cane", fr "joue contre le chien", es
  "juega contra el perro", pt "joga contra o cão" — right by coincidence — but de "**spielt am
  Hund**" (the contact *an* + dative, [`de/spatialHead.ts:26`](../../../../packages/engine/src/languages/de/spatialHead.ts#L26))
  and ja "**犬に遊びます**" (the contact flattening to に, [`ja.consts.ts:179`](../../../../packages/engine/src/languages/ja/ja.consts.ts#L179)).
  As a direction it is de "spielt an den Hund". German needs *gegen* + accusative, which E1 kept out
  of the spatial set on purpose, and the misuse occupies the locative a real place needs ("plays
  against the dog in the house").
- **The comitative is not it either.** PLAY_GAME + comitative DOG is "plays with the dog" / *con* /
  *avec* / *mit* / 犬と — a partner. `Complement.negative` on it is ignored (probed: unchanged), and
  would mean *without* if anything, not *against*.
- **No seeded verb licenses it.** [`PLAY_GAME`](../../../../packages/backend/src/concepts/verbs/intransitive.ts#L1046)
  licenses `manner, locative, cause, instrumental`. FIGHT, COMPETE, OPPOSE, DEFEND, ATTACK: none is
  seeded (grepped `packages/backend/src/concepts/`).
- **What a new type costs** is E2's table, all still true at these lines:
  [`ComplementType`](../../../../packages/shared/src/index.ts#L254),
  [`COMPLEMENT_RENDER_ORDER`](../../../../packages/shared/src/index.ts#L287),
  [`COMPLEMENT_LABELS`](../../../../packages/shared/src/index.ts#L289),
  [`DETERMINER_COMPLEMENT_TYPES`](../../../../packages/shared/src/index.ts#L315),
  [`TONIC_COMPLEMENTS`](../../../../packages/engine/src/functions/functions.consts.ts#L33), en
  [`PREP`](../../../../packages/engine/src/languages/en/en.consts.ts#L33), ja
  [`PARTICLE`](../../../../packages/engine/src/languages/ja/ja.consts.ts#L30), one branch in each
  Romance/German `complementsPhrase`, and the frontend's total maps
  ([`COMPLEMENT_LABEL_KEYS`](../../../../packages/frontend/src/components/PhraseBuilder/slots.ts#L148),
  [`COMPLEMENT_KEYS`](../../../../packages/frontend/src/components/PhraseBuilder/slots.ts#L169),
  [`complementIcons`](../../../../packages/frontend/src/components/PhraseBuilder/satellites/satellites.types.tsx#L116),
  [`BoxComplementType`](../../../../packages/frontend/src/components/PhraseBuilder/interfaces.ts#L79))
  plus a grammar-name concept for the label, as
  [`PURPOSE_COMPLEMENT`](../../../../packages/backend/src/concepts/nouns.ts#L3933) was.
- **A verb can already govern a complement's preposition**: THINK's `topic_prep`, read by
  [`topicLink`](../../../../packages/engine/src/functions/topicLink.ts) and carried on
  `ResolvedComplement.link` by [`resolveComplements.ts:77`](../../../../packages/engine/src/translator/functions/resolveComplements.ts#L77)
  — for `topic` only.
- Italian reaches a pronoun through *di* after *contro* already
  ([`IT_DI_BEFORE_PRONOUN`](../../../../packages/engine/src/languages/it/it.consts.ts#L188)).

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
