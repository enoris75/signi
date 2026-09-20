# A164. The canvas offers a determiner the alarm cry cannot spell

**Area:** frontend, the satellite controls
([`satellites/functions/rawSatellites.tsx`](../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx)),
plus the two corpus flags its gate has to read

CRY_OUT's object, when it is an alarm — a noun naming a danger (WOLF, FIRE) — is the shout itself,
the word "Wolf!", and takes no determiner in any language. That is [A163](A163-alarm-cry-determiner.md).
The canvas hangs a determiner satellite off the direct object regardless, because the gate is the
head's role and nothing else:

```ts
// rawSatellites.tsx:358
available: directObjectRole === "noun",
```

Today that control is at least honest about being live: it changes the sentence, just to something
ungrammatical. Once A163 lands it goes inert — the user sets indefinite, and the sentence still reads
`the boy cried wolf`. A control that claims a slot the grammar does not license is the thing the ring
is supposed to never do.

The house already handles the identical case. A *measure* manner adverbial names a rate, the engine
fixes it bare, and so the determiner is **withdrawn**, with the reason written next to it
([`rawSatellites.tsx:508-515`](../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L508-L515)):

```ts
// … the engine fixes it bare (see the translator) — the determiner is not
// user-changeable there, so it is withdrawn.
available:
  DETERMINER_COMPLEMENT_TYPES.includes(type) &&
  concept?.role === "noun" &&
  !(type === "manner" && concept?.mannerRelation === "measure"),
```

Withdrawn, not disabled. A greyed-out control still asserts that the slot exists and merely happens to
be unavailable, when the truth is that there is no slot. Nothing is lost by removing it: "shouted
**at** the wolf" is the terminus, which the canvas offers as its own complement and which A124
explicitly warned against conflating with the alarm.

| Control | Now | Want |
|---|---|---|
| direct-object determiner, CRY_OUT + WOLF | offered (`available: true`), and inert once A163 lands | withdrawn (`available: false`) |
| direct-object determiner, CRY_OUT + WORD | offered | offered, unchanged |
| direct-object determiner, SEE + WOLF | offered | offered, unchanged |

Already right, and the model to copy: the measure manner adverbial's withdrawal, pinned in
`rawSatellites.test.tsx` → *withdraws the determiner from a manner adverbial that names a measure*.

## Shape of the fix

**The gate needs both words, and no determiner gate does that today.** Every existing one is
noun-local — `concept?.role === "noun"`, `mannerRelation === "measure"`. Alarm-ness is a property of
the pairing: WOLF under SEE takes its determiner normally.

- **Corpus.** Neither flag is on the shared `Concept` type. `alarm` is concept-level in the backend
  (seed, DB column, lexicon) but stops at the API; `alarm_cry` is worse — a per-language lexeme
  *form*, carried by `it` and `fr` only, which the frontend must not read to decide a structure that
  is the same in all seven languages. Lift both to `Concept` beside `mannerRelation`
  ([`shared/src/index.ts:426`](../../../packages/shared/src/index.ts#L426)): `alarm?: boolean` and
  `alarmCry?: boolean`. A163's English arm wants the same lift — once three languages carry the flag
  it is a property of the concept, not of the lexeme — so do it once, in whichever lands first.
- **Frontend.** `selection.verb` is already the full concept
  ([`rawSatellites.tsx:57`](../../../packages/frontend/src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx#L57)),
  so the gate is reachable where it stands:
  `available: directObjectRole === "noun" && !(selection.verb?.alarmCry && directObjectConcept?.alarm)`.

**Order this after A163.** Withdrawing the control while the engine still honours the stored value
strands any plan already saved with an indefinite alarm: it goes on rendering `the boy cried a wolf`
with no control left to change it.

Not covered: a coordinated object (`WOLF and FIRE`, A124's case) carries its own determiner controls
on the conjunct rings. The same argument applies to them, and the same gate should reach them, but
this file pins only the direct object.

| | |
|---|---|
| **Test** | `packages/frontend/test/satellites/functions/rawSatellites.test.tsx` → *known bugs: the determiner an alarm cry cannot take* (1 `it.fails`, plus a regression guard for another verb and another object) |
