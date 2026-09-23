# A266. German sets a bare zu-infinitive off with a comma

**Languages:** German

[`renderClause`](../../../packages/engine/src/languages/de/renderClause.ts) extraposes an infinitive
complement behind a comma whatever it holds: `${withObject}, ${renderClause(…, zu)}`. For a group
(*braucht, das Essen zu fressen*) that is the recommended style, but a zu-infinitive with nothing of
its own takes none: *er braucht zu laufen*, *er versucht zu laufen*, *fähig zu handeln*. After
*brauchen*, which governs its infinitive the way a modal does (*du brauchst nicht zu kommen*), the
comma is wrong, not just unusual.

| Case | Now | Want |
|---|---|---|
| the CAT NEEDs to RUN | `der Kater braucht, zu laufen.` | `der Kater braucht zu laufen.` |
| the DOG DESIREs to ACT | `der Hund wünscht, zu handeln.` | `der Hund wünscht zu handeln.` |
| the CAT is ABLE to EAT | `der Kater ist fähig, zu fressen.` | `der Kater ist fähig zu fressen.` |

**Why this target.** The line is the one the engine already draws for the prospective
([`prospectiveFrame`](../../../packages/engine/src/languages/de/prospectiveFrame.ts)): *ist im Begriff
zu essen*, but *im Begriff, die Maus zu essen*. Duden's rule (§75 of the official rules, Duden K117)
is the same. A bare zu-infinitive is written without a comma. A group, meaning an infinitive with an
object, a complement or an adverb of its own, takes one. A group introduced by *um*, *ohne*, *statt*
must take one.

**Already right, and kept.** A group keeps its comma (`der Kater braucht, das Essen zu fressen.`), so
does *um … zu* (`der Mann läuft, um zu weinen.`), and the bare infinitive a causative takes with no
*zu* has none (`der Kater lässt den Hund laufen`, C36).

**Shape of the fix.** In `renderClause`, the comma goes only in front of a governed infinitive that
renders more than its own zu-infinitive, as `prospectiveFrame` tests `own.length`. What counts as "more"
is the fix's decision. A negated infinitive (*braucht nicht zu laufen*, where *nicht* belongs to
*brauchen*) and a nested one (*veranlassen, berechtigt zu sein, zu handeln*) are not pinned.

**Shipped, and pinned the wrong way.** The definitions show it: LEARN (`beginnen, zu wissen.`), CALL
(`veranlassen, zu kommen.`), ALLOWED (`berechtigt sein, zu handeln.`), DESIRE (`wünschen, zu
handeln.`) and the other causative and inchoative glosses. Around thirty passing assertions pin the
comma and must change with the fix. They are in doing-verbs, modals, modal-verbs-may-should-might,
everyday-nouns, saying-verbs, handling-verbs, bare-infinitive, causative, negation, verb,
infinitive-complement, sweep-definitions, complements/predicative and complements/instrumental (grep
`, zu [a-zäöüß]*[.,]`), plus `e2e/definition-tooltip.spec.ts` and `e2e/period-links.spec.ts`.

Pinned by `known bugs: German sets a bare zu-infinitive off with a comma (A266)` in
[infinitive-complement.test.ts](../../../packages/engine/test/infinitive-complement.test.ts).

Found by P09-E12 (the builder's infinitive link, `e2e/period-links.spec.ts`).

## Resolved

2026-09-23. [`renderClause`](../../../packages/engine/src/languages/de/renderClause.ts) joins a
governed zu-infinitive through `zuGroupComma`: it renders the infinitive twice, as it is and cut down
to its verb by the new [`zuVerbOnly`](../../../packages/engine/src/languages/de/zuVerbOnly.ts), and
writes the comma only when the two differ. `zuVerbOnly` is a whitelist: it keeps the verb, its voice
and passive auxiliary, mood, tense, aspect and register, and drops everything else. So:

- **Bare, no comma:** `zu <verb>` and the one-word separable `zurückzukehren`, under any tense of the
  governor (`der Kater wird brauchen zu laufen.`). A passive cluster (`gesehen zu werden`) would count
  as bare too; no plan renders one today.
- **A group, comma kept:** an object, a complement, an adverb, a negation of its own (`braucht,
  nicht zu laufen`), a nested infinitive, and a modal chain, which is a nested infinitive
  (`wünschen, handeln zu wollen.`). A reflexive pronoun is taken as part of the verb (none is pinned).
- **Nested:** each level decides for itself, so the outer group keeps its comma and a bare inner
  infinitive loses its own: `eine Person veranlassen, berechtigt zu sein zu handeln.`
- `um … zu` is untouched and always keeps its comma.

Guarded by the flipped test and three added ones in `known bugs: German sets a bare zu-infinitive off
with a comma (A266)` in [infinitive-complement.test.ts](../../../packages/engine/test/infinitive-complement.test.ts),
and by [zuVerbOnly.test.ts](../../../packages/engine/src/languages/de/zuVerbOnly.test.ts). About
thirty assertions that pinned the comma moved with it, in doing-verbs, modals,
modal-verbs-may-should-might, everyday-nouns, saying-verbs, handling-verbs, bare-infinitive,
causative, negation, infinitive-complement, sweep-definitions and verb-roots, plus
`e2e/definition-tooltip.spec.ts` and `e2e/period-links.spec.ts`.
