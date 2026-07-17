# A01. Passive voice — active / passive as a verb-phrase realisation flag

**Feature:** grammatical **voice** (`active` | `passive`) on the verb phrase.
**Shape:** one plan + a flag; the translator re-maps patient→subject, agent→by-phrase.
**Scope (confirmed):** full composition (voice stacks with aspect / modals / mood / all
tenses), agentless **and** optional by-phrase, **all 7 languages** incl. the Japanese
れる/られる morphology.

| lang | active → passive ("the cat eats the food" → "the food is eaten (by the cat)") |
|---|---|
| en | the food is eaten (by the cat) |
| it | il cibo è mangiato (dal gatto) — participio agrees with the new subject |
| fr | la nourriture est mangée (par le chat) |
| es | la comida es comida (por el gato) |
| pt | a comida é comida (pelo gato) |
| de | das Futter wird gegessen (von der Katze) |
| ja | 食べ物は（猫に）食べられます |

## Why

Signi is semantic-first: a phrase is a proposition the engine *realises* per language. At
the propositional level active and passive are the **same** event —
`EAT(agent: CAT, patient: FOOD)` — so they should be **one plan plus a realisation flag**,
not two phrases. Passive only adds a discourse difference (promote the patient to topic,
optionally demote/drop the agent).

Today there is **no voice** — [`uiStrings.ts:214`](../../../packages/engine/src/uiStrings.ts#L214)
notes the engine "has no passive voice … no participle" to render one with. The data model
also conflates thematic role with grammatical slot: `subject` *is* the agent, `directObject`
*is* the patient. Voice is therefore a **realisation feature on the verb phrase** (like
`aspect`, `mood`, `modals`) that, when passive, re-maps the patient into subject position and
the agent into an oblique "by"-phrase.

Only **transitive / ditransitive** verbs passivize (they have a patient to promote). A passive
flag on an intransitive verb normalises back to active — the same defensive normalisation
`resolveVerbPhrase` already does for imperatives.

## Design: where voice lives

- **Plan shape stays semantic** — keeps `subject`=agent, `directObject`=patient. Voice is a
  flag; how the user *composes* does not change.
- **Re-mapping is centralised in the translator; morphology is per-engine.** When
  `voice === 'passive'` and the verb is transitive, `resolvePhrase` yields a resolved phrase
  whose grammatical **subject is the resolved directObject** (drives agreement), whose
  `directObject` is cleared, and whose original subject is carried as an **agent** oblique.
  `ResolvedVerbPhrase.voice = 'passive'` tells each engine to build *auxiliary + participle*
  instead of conjugating the lexical verb.
- Mirrors the `aspect`/`mood` precedent: shared enum → threaded onto `ResolvedVerbPhrase` →
  each engine branches in its predicate builder. The auxiliaries and participles needed
  **already exist**, so almost no new lexical data is required.

## 1. Shared types — [`packages/shared/src/index.ts`](../../../packages/shared/src/index.ts)

Mirror the `Aspect` block (≈ lines 166–200):

```ts
export type Voice = 'active' | 'passive';
export const VOICES: Voice[] = ['active', 'passive'];
export const VOICE_LABELS: Record<Voice, string> = { active: 'active', passive: 'passive' };
```

Add `voice?: Voice;  // defaults to 'active'` to `VerbPhrase` (near `aspect?`, ≈ line 561),
with a doc comment stating the transitive-only constraint and that the agent survives as a
by-phrase.

## 2. Engine types & translator

- [`packages/engine/src/types.ts`](../../../packages/engine/src/types.ts) — add `voice?: Voice`
  to `ResolvedVerbPhrase` (≈ line 145); import `Voice`.
- [`packages/engine/src/translator.ts`](../../../packages/engine/src/translator.ts)
  - `resolveVerbPhrase` (line 207): thread `voice`. Gate on the verb's transitivity (thread
    `transitivity` into forms via `lexicon.ts`, the trick `role`/`animate` use — see §5);
    passive on a non-transitive verb ⇒ `voice = 'active'`.
  - `resolvePhrase` (line 314): if the top verb is passive with a directObject present, build the
    re-mapped element set — `grammaticalSubject = resolvedDirectObject`,
    `agent = resolvedSubject`, `directObject = undefined`. Expose the agent via a dedicated
    `ResolvedPhrase.agent?: ResolvedNounElement` (keeps `COMPLEMENT_RENDER_ORDER` and the slot
    machinery untouched). Passive with no directObject falls back to active. Relative-clause
    verbs stay active in this cut (documented gap; recursion at `resolveRelativeClause`, line 282).

## 3. Per-engine morphology

Each engine branches on `verbPhrase.voice === 'passive'` inside its existing verb-group
builder(s) and renders the agent oblique. Reuse the existing auxiliary + participle infra.

| Lang | Passive construction | Reuses | Agent prep |
|------|----------------------|--------|-----------|
| en | `be` + participle: *is/was/will be eaten*; prog *is being eaten*; modal *must be eaten*; cond *would be eaten*. Negation on aux. | `auxBe` (en.ts:170), `participle` | `by` |
| it | `essere` + participio **agreeing w/ new subject** | `ESSERE_IT` (it.ts:404), `agreeAdj` (it.ts:215) | `da` |
| fr | `être` + participe agreeing | `agreeAdjFr`, `participle` | `par` |
| es | `ser` + participio agreeing | `participle`, es `agreeAdj` | `por` |
| pt | `ser` + particípio agreeing | `participle`, pt `agreeAdj` | `por` |
| de | `werden` + Partizip II: *wird/wurde gegessen*; future *wird gegessen werden* | `WERDEN` (de.ts:304), `participle` | `von` |
| ja | verb `passive` form (〜れる/られる) + polite ます; patient は, agent に | new `passive`/`passive_reading` seed form (§5) | `に` |

**Documented gaps** (consistent with existing ja/de gap notes): de passive-perfect *…worden*
under resultative aspect is approximated; ja passive under a modal is marginal; Romance
progressive-passive (*sta essendo mangiato*) is marginal — accept the periphrasis or fall back
to simple passive. Copular verbs (BE/BECOME/SEEM/APPEAR) are intransitive → passive never applies.

## 4. Frontend — `packages/frontend/src/components/PhraseBuilder/`

Follow the `verbAspect` satellite wiring exactly:
- **Boxes.tsx** — `VoiceToggleBox` (mirror `AspectToggleBox`, ≈ line 554).
- **phraseReducers.ts** — `verbVoice: 'active'` default (≈ line 326); `handleCycleVoice`
  (mirror `handleCycleAspect`, ≈ line 366).
- **selectionToPlan.ts** — thread `voice: sel.verbVoice` in `buildVerbPhrase` (≈ line 177).
- **VerbPhraseBuilder.tsx / slots.ts / satellites.tsx / graph.ts / layout.ts** — add the
  `verbVoice` satellite next to `verbAspect`. **Gate** it on the verb being transitive *and* a
  directObject present, the same conditional-availability pattern the imperative controls use.
- Passive presentation: relabel the promoted patient as subject and caption the demoted agent
  "by" (minimal — a caption swap; agent can ride the existing subject box).
- **phraseSerialize.ts** — `verbVoice` rides the generic string passthrough; bump
  `SAVED_PHRASE_VERSION` (4 → 5).

## 5. Seed / lexicon data — `packages/backend/src`

- **`lexicon.ts`** — thread `transitivity` into verb `forms` in `lookupLexicalEntry` (where
  `role`/`animate` are exposed), so the translator can gate passive with no DB change.
- **[`concepts/verbs/nonfinite.ts`](../../../packages/backend/src/concepts/verbs/nonfinite.ts)**
  — add ja `passive` + `passive_reading` to each **transitive** verb (EAT 食べられる/たべられる,
  DRINK 飲まれる, SEE 見られる, READ 読まれる, LOVE 愛される, KNOW 知られる, plus CUT/BUY/…
  and ditransitives GIVE/SHOW/SEND). Stored explicitly, not rule-derived: ichidan +られる,
  godan あ-stem +れる, irregulars (する→される, 来る→来られる) share no single rule, matching how
  this table already stores irregular participles/te-forms. **No new data for the six European
  languages** — they reuse the `participle` already here.

## Verification

1. **Engine unit tests** — `packages/engine/test/voice.test.ts` (aspect/mood test pattern): per
   language assert active vs passive of "the cat eats the food", plus present/past/future,
   negation, and passive+progressive, passive+modal (*must be eaten*), passive+conditional
   (*would be eaten*); agentless and with-agent. `npm test -w @signi/engine`.
2. **API** — backend on 3001, `POST /api/translate` passive plans; check all 7 incl. Romance
   participle agreement (*è mangiata* for a feminine patient) and de *wird gegessen*.
3. **In-browser** (5173): toggle the voice satellite on a transitive phrase, confirm object
   promotes to subject and the agent shows "by" across the panel; save/load round-trips (v5).
4. Typecheck the workspace — `Voice` and `voice` must thread cleanly shared → engine → frontend.

## Out of scope (follow-ups)

Passive inside relative clauses; de perfect-passive *worden*; agent as an *action* ("by being…");
the get/stative passive split. Each is a documented gap, not a blocker.
