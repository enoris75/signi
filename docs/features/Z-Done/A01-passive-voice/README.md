# A01. Passive voice — active / passive as a verb-phrase realisation flag

**Feature:** grammatical **voice** (`active` | `passive`) on the verb phrase.
**Shape:** one plan + a flag; the translator re-maps patient→subject, agent→by-phrase.
**Scope (confirmed):** full composition (voice stacks with aspect / modals / mood / all
tenses), **all 7 languages** incl. the Japanese れる/られる morphology. The **agentless**
passive is deliberately *not* a value of this flag — it is the generic subject the corpus
already has, and §0 says why.
**Status: shipped.** All seven languages, composing with tense, aspect, modals, mood and the
question flag; the agentless passive falls out of `GENERIC_PERSON` as §0 asked. Two things landed
differently from the plan below, both noted where they occur:

- **The voice control rides the direct object's ring, not the verb's** (§4). The verb's solid ring
  was already at capacity — clear, tense, aspect, modal, adverb, polarity — and a seventh control
  widened it enough to push the object off its row on every transitive clause until the canvas was
  tidied. The object's ring had the room, the passive is what promotes *that* object, and the
  control is wanted exactly when the object is there, so the gate the plan asked for comes for free.
- **The console lets a verb take the voice before its object is named** (§4), where the canvas
  waits for both. A line reads left to right — `/verb ( eat /passive ) /obj ( food )` — and a
  setting that could not be written until the object existed could not be printed back either,
  which would break the console's print → apply round trip.

Three concepts were seeded for the control's own label, which the UI renders through the engine
like every other: `VOICE` (diatesi / voix / Diathese / 態), `ACTIVE_VOICE` and `PASSIVE`, plus
`AGENT_GRAMMAR` for the box the demoted agent keeps. The canvas presentation is the caption swap
§4 describes; the boxes keep their slots' colours, so the promoted patient still wears the direct
object's green.

| lang | active → passive ("the cat eats the food" → "the food is eaten (by the cat)") |
|---|---|
| en | the food is eaten (by the cat) |
| it | il cibo è mangiato (dal gatto) — participio agrees with the new subject |
| fr | la nourriture est mangée (par le chat) |
| es | la comida es comida (por el gato) |
| pt | a comida é comida (pelo gato) |
| de | das Futter wird gegessen (von der Katze) |
| ja | 食べ物は（猫に）食べられます |

The es/pt rows are grammatical but marked: the *ser* passive of an imperfective present
event is not what either language reaches for, and the homograph (*comida* "food" /
*comida* "eaten") makes the row read worse than the construction is. The idiomatic
equivalent in both is the impersonal *se*, which is the agentless route in §0 — a reason to
keep that route first-class rather than a fallback.

## Why

Signi is semantic-first: a phrase is a proposition the engine *realises* per language. When
the agent is expressed, active and passive are the **same** event —
`EAT(agent: CAT, patient: FOOD)`, true in exactly the same worlds — so they should be **one
plan plus a realisation flag**, not two phrases. What the passive changes is information
structure: which participant is the subject, i.e. what the sentence is *about*.

Today there is **no voice** — [`uiStrings.ts:363`](../../../../packages/shared/src/uiStrings.ts#L363)
and [`:1289`](../../../../packages/shared/src/uiStrings.ts#L1289) both note the engine "has no
passive voice … no participle" to render one with, and reword around it. The data model also
conflates thematic role with grammatical slot: `subject` *is* the agent, `directObject` *is*
the patient. Voice is therefore a **realisation feature on the verb phrase** (like `aspect`,
`mood`, `modals`) that, when passive, re-maps the patient into subject position and the agent
into an oblique "by"-phrase.

Only **transitive / ditransitive** verbs passivize (they have a patient to promote). A passive
flag on an intransitive verb normalises back to active — the same defensive normalisation
`resolveVerbPhrase` already does for imperatives.

## 0. What voice is *not*: agent suppression

"The food is eaten" is not the proposition above with a word left out. It asserts
`∃x. EAT(x, FOOD)` — **entailed** by the active, not equivalent to it. Modelling it as
`voice: 'passive'` with the by-phrase merely unprinted would leave the plan saying the cat did
it while the rendering says somebody did, and two plans that assert different things would
round-trip to the same string.

The corpus already has the right primitive: `GENERIC_PERSON`
([`pronouns.ts:85`](../../../../packages/backend/src/concepts/pronouns.ts#L85)) — *one* / *si* /
*on* / *man* / *se* / *se* / 人 — and the it/es engines already turn it into the **passive
si/se**, agreeing the finite verb with the patient wherever that agreement is visible
([`it/predicateText.ts:48`](../../../../packages/engine/src/languages/it/predicateText.ts#L48),
[`es/predicateText.ts:51`](../../../../packages/engine/src/languages/es/predicateText.ts#L51)).
So agentlessness is a **subject choice**, not a voice value:

- **agent named** → `voice: 'passive'`; the translator re-maps the slots and renders the
  by-phrase. Pure realisation — the plan asserts what the active asserted.
- **agent unknown or irrelevant** → the subject **is** `GENERIC_PERSON`. Under `active` that is
  already "si mangia il cibo" / "man isst das Futter"; under `passive` the agent oblique is
  **dropped** — no *by one*, *da si*, *von man* — and each language gets its plain agentless
  passive ("the food is eaten", "das Futter wird gegessen").

That is the one extra rule the translator needs: **a generic agent is never rendered as a
by-phrase.** It costs a conditional, it keeps `voice` honest (it never changes what the plan
asserts), and it gives it/es/pt their idiomatic agentless form for free.

## Design: where voice lives

- **Plan shape stays semantic** — keeps `subject`=agent, `directObject`=patient. Voice is a
  flag; how the user *composes* does not change.
- **Re-mapping is centralised in the translator; morphology is per-engine.** When
  `voice === 'passive'` and the verb is transitive, `resolvePhrase` yields a resolved phrase
  whose grammatical **subject is the resolved directObject** (drives agreement), whose
  `directObject` is cleared, and whose original subject is carried as an **agent** oblique —
  unless that subject is generic, in which case no agent oblique is emitted at all (§0).
  `ResolvedVerbPhrase.voice = 'passive'` tells each engine to build *auxiliary + participle*
  instead of conjugating the lexical verb.
- Mirrors the `aspect`/`mood` precedent: shared enum → threaded onto `ResolvedVerbPhrase` →
  each engine branches in its predicate builder. The auxiliaries and participles needed
  **already exist**, so almost no new lexical data is required.

## 1. Shared types — [`packages/shared/src/index.ts`](../../../../packages/shared/src/index.ts)

Mirror the [`Aspect` block (lines 154–156)](../../../../packages/shared/src/index.ts#L154):

```ts
export type Voice = 'active' | 'passive';
export const VOICES: Voice[] = ['active', 'passive'];
export const VOICE_LABELS: Record<Voice, string> = { active: 'active', passive: 'passive' };
```

Add `voice?: Voice;  // defaults to 'active'` to `VerbPhrase`, next to
[`aspect?` (line 629)](../../../../packages/shared/src/index.ts#L629), with a doc comment
stating the transitive-only constraint, that the agent survives as a by-phrase, and that a
**generic** agent survives as nothing (§0).

## 2. Engine types & translator

- [`packages/engine/src/types.ts`](../../../../packages/engine/src/types.ts) — add `voice?: Voice`
  to [`ResolvedVerbPhrase`](../../../../packages/engine/src/types.ts#L93), beside
  [`aspect?` (line 97)](../../../../packages/engine/src/types.ts#L97); import `Voice`.
- [`packages/engine/src/translator/functions/`](../../../../packages/engine/src/translator/functions/)
  - `resolveVerbPhrase.ts`: thread `voice`. Gate on the verb's
    [`transitivity`](../../../../packages/shared/src/index.ts#L381) (thread it into forms via
    `lexicon.ts`, the trick `role`/`animate` use — see §5); passive on a non-transitive verb
    ⇒ `voice = 'active'`.
  - `resolvePhrase.ts`: if the top verb is passive with a directObject present, build the
    re-mapped element set — `grammaticalSubject = resolvedDirectObject`,
    `agent = resolvedSubject`, `directObject = undefined`. Expose the agent via a dedicated
    `ResolvedPhrase.agent?: ResolvedNounElement` (keeps `COMPLEMENT_RENDER_ORDER` and the slot
    machinery untouched). **Drop the agent entirely when its forms carry `generic: '1'`** —
    that is the agentless passive, and no language says *by one*. Passive with no directObject
    falls back to active. Relative-clause verbs stayed active in this cut; the follow-up
    re-maps them in `resolveRelativeClause.ts` and moves the gap with the head — an object gap
    becomes the subject ("the book that is written by the child"), a subject gap becomes the
    new `'agent'` gap ("the child by whom the book is written"), a complement gap stays put. A
    genitive relative stays active (its head owns the agent), and so does a Japanese subject
    gap (`RELATIVIZES_AGENT`: Japanese relativises no agent).

## 3. Per-engine morphology

Each engine branches on `verbPhrase.voice === 'passive'` inside its existing verb-group
builder(s) and renders the agent oblique when there is one. Reuse the existing auxiliary +
participle infra.

| Lang | Passive construction | Reuses | Agent prep |
|------|----------------------|--------|-----------|
| en | `be` + participle: *is/was/will be eaten*; prog *is being eaten*; modal *must be eaten*; cond *would be eaten*. Negation on aux. | `auxBe` (en/auxBe.ts), `participle` | `by` |
| it | `essere` + participio **agreeing w/ new subject** | `ESSERE_IT` (it/it.consts.ts), `agreeAdj` (it/agreeAdj.ts) | `da` |
| fr | `être` + participe agreeing | `agreeAdjFr`, `participle` | `par` |
| es | `ser` + participio agreeing | `participle`, es `agreeAdj` | `por` |
| pt | `ser` + particípio agreeing | `participle`, pt `agreeAdj` | `por` |
| de | `werden` + Partizip II: *wird/wurde gegessen*; future *wird gegessen werden* | `WERDEN` (de/de.consts.ts), `participle` | `von` |
| ja | verb `passive` form (〜れる/られる) + polite ます; patient は, agent に | new `passive`/`passive_reading` seed form (§5) | `に` |

In every row the agent prep is emitted only for a named agent; a generic one is dropped (§0).

**Documented gaps** (consistent with existing ja/de gap notes): de passive-perfect *…worden*
under resultative aspect is approximated; ja passive under a modal is marginal; Romance
progressive-passive (*sta essendo mangiato*) is marginal — accept the periphrasis or fall back
to simple passive. `werden` is the *eventive* passive only, so a plan meaning a resulting state
("the door is closed") still renders as an event — see Out of scope. Copular verbs
(BE/BECOME/SEEM/APPEAR) are intransitive → passive never applies.

## 4. Frontend — `packages/frontend/src/components/PhraseBuilder/`

Follow the `verbAspect` satellite wiring exactly:
- **Boxes.tsx** — `VoiceToggleBox`, mirroring
  [`AspectToggleBox` (line 900)](../../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx#L900).
- **phraseReducers.ts** — `verbVoice: 'active'` default beside the
  [`verbAspect` defaults (lines 445, 472)](../../../../packages/frontend/src/components/PhraseBuilder/phraseReducers.ts#L445);
  `setVoice` / `handleCycleVoice` mirroring
  [`setAspect` (line 311)](../../../../packages/frontend/src/components/PhraseBuilder/phraseReducers.ts#L311)
  and [the aspect cycle (line 515)](../../../../packages/frontend/src/components/PhraseBuilder/phraseReducers.ts#L515).
- **selectionToPlan/functions/buildVerbPhrase.ts** — thread `voice: sel.verbVoice` in beside
  [`aspect` (line 24)](../../../../packages/frontend/src/components/PhraseBuilder/selectionToPlan/functions/buildVerbPhrase.ts#L24).
- **VerbPhraseBuilder.tsx / slots.ts / satellites.tsx / graph.ts / layout.ts** — add the
  `verbVoice` satellite next to `verbAspect`. **Gate** it on the verb being transitive *and* a
  directObject present, the same conditional-availability pattern the imperative controls use.
- Passive presentation: relabel the promoted patient as subject and caption the demoted agent
  "by" (minimal — a caption swap; agent can ride the existing subject box). **No agentless
  control is needed**: picking `GENERIC_PERSON` in the subject box *is* the agentless passive,
  and the caption simply disappears with the by-phrase.
- **phraseSerialize/** — `verbVoice` rides the generic string passthrough; bump
  [`SAVED_PHRASE_VERSION`](../../../../packages/shared/src/index.ts#L938) (6 → 7).

## 5. Seed / lexicon data — `packages/backend/src`

- **`lexicon.ts`** — thread `transitivity` into verb `forms` in `lookupLexicalEntry` (where
  `role`/`animate` are exposed), so the translator can gate passive with no DB change.
- **[`concepts/verbs/nonfinite.ts`](../../../../packages/backend/src/concepts/verbs/nonfinite.ts)**
  — add ja `passive` + `passive_reading` to each **transitive** verb (EAT 食べられる/たべられる,
  DRINK 飲まれる, SEE 見られる, READ 読まれる, LOVE 愛される, KNOW 知られる, plus CUT/BUY/…
  and ditransitives GIVE/SHOW/SEND). Stored explicitly, not rule-derived: ichidan +られる,
  godan あ-stem +れる, irregulars (する→される, 来る→来られる) share no single rule, matching how
  this table already stores irregular participles/te-forms. **No new data for the six European
  languages** — they reuse the `participle` already here. **No new concept for the agentless
  passive** — `GENERIC_PERSON` is already seeded.

## Verification

1. **Engine unit tests** — `packages/engine/test/voice.test.ts` (aspect/mood test pattern): per
   language assert active vs passive of "the cat eats the food", plus present/past/future,
   negation, and passive+progressive, passive+modal (*must be eaten*), passive+conditional
   (*would be eaten*).
2. **Agentless** — the same phrase with `GENERIC_PERSON` as subject, once active and once
   passive: active gives the impersonal ("si mangia il cibo", "man isst das Futter"), passive
   gives the bare passive with **no by-phrase in any of the seven** ("the food is eaten",
   "das Futter wird gegessen", never "*by one*" / "*von man*"). This is the regression test for
   §0 — it is the one behaviour a naive "hide the by-phrase" implementation gets wrong.
3. **API** — backend on 3001, `POST /api/translate` passive plans; check all 7 incl. Romance
   participle agreement (*è mangiata* for a feminine patient) and de *wird gegessen*.
4. **In-browser** (5173): toggle the voice satellite on a transitive phrase, confirm object
   promotes to subject and the agent shows "by" across the panel; save/load round-trips (v7).
5. Typecheck the workspace — `Voice` and `voice` must thread cleanly shared → engine → frontend.

## Out of scope (follow-ups)

- **Quantifier scope.** Signi has quantifier determiners
  ([`index.ts:58`](../../../../packages/shared/src/index.ts#L58) — `some / no / many / few / all`),
  and surface order drives the preferred reading once they meet a passive: *all the boys love a
  girl* (one each) vs *a girl is loved by all the boys* (one specific girl). Same plan, different
  preferred truth conditions — not fixable from the plan, and not modelled. Noted so that
  "one plan, seven renderings" is not read as "one proposition" for quantified passives.
- **Stative vs eventive.** German forces the choice — *die Tür wird geschlossen* (someone is
  closing it) vs *die Tür ist geschlossen* (it is shut) — and this cut always emits *werden*,
  so a state renders as an event. English *the door was closed* stays ambiguous. The plan
  underspecifies this; a `stative` voice value or an aspect interaction would be the fix.
- **Japanese adversative passive** (迷惑の受身, 雨に降られた "I was rained on"): 〜れる/られる also
  covers an affectedness reading that applies to *intransitives* and has no active counterpart.
  The transitive-only gate correctly excludes it — the `ja` column here implements a narrower
  construction than the morphology's name suggests.
- Passive inside a genitive relative ("by whose cat…"); agent as an *action* ("by being…");
  the get-passive. Each is a documented gap, not a blocker. (Passive inside the other relatives,
  and de perfect-passive *worden*, have since landed.)
