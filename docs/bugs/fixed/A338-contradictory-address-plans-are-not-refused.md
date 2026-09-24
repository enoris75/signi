# A338. Contradictory address plans are not refused

**Languages:** all seven

An address (`PhrasePlan.address`, P11-E3) calls the hearer. Two plans the API accepts contradict
that, and the engine renders both as if they made sense:

- an address on an **instruction** (`imperativeRegister: 'instruction'`), which is by definition
  addressed to nobody: the label on a control, a recipe step. It comes out as a name followed by an
  infinitive;
- an address that is a **pronoun other than the hearer**: a 1st- or 3rd-person pronoun.

| Case | Now | Want |
|---|---|---|
| `{ ...clause(np('SECOND_PERSON'), 'RUN'), imperative: true, imperativeRegister: 'instruction', address: np('MOM') }` | en `Mom, run.`, it `Mamma, corri.`, fr `Maman, courir.`, de `Mama, laufen.`, es `Mamá, correr.`, ja `お母さん、走り。`, pt `Mamãe, correr.` | refused by name |
| `{ ...clause(np('CAT'), 'RUN'), address: np('FIRST_PERSON') }` | en `I, the cat runs.`, it `Io, il gatto corre.`, fr `Je, le chat court.`, de `Ich, der Kater läuft.`, es `Yo, el gato corre.`, ja `私、猫は走ります。`, pt `Eu, o gato corre.` | refused by name |
| `{ ...clause(np('CAT'), 'RUN'), address: np('THIRD_PERSON') }` | en `He, the cat runs.`, fr `Il, le chat court.`, … | refused by name |

The 1st-plural address (*We, the cat runs.*) is the same case.

**Why this target.** The engine refuses other malformed plans by name rather than rendering
nonsense: a clause with no subject (A267), a relative clause with no verb phrase (A273), and a role
gap (A288). A refusal has no correct output, so the pins assert the throw, `toThrow(/address/)`, as
A288's do in `complements/role.test.ts`.

**Already right.** The same address on a request (`imperativeRegister: 'request'`, or none) renders
*Mom, run.* in all seven, and an instruction with no address is the plain infinitive (*courir.*,
*laufen.*, *走り。*). The 2nd-person pronoun address is a real vocative (*You, run.*; see A335 for its
French form).

**Shape of the fix.** The refusal belongs where the address is read, `translate.ts` (which calls
`resolveAddress`) or `resolveAddress.ts` itself: throw when the top clause is an instruction, or when
an address conjunct is a pronoun whose `person` is not 2. The fixer must decide, as an open question:

- **refuse or drop.** Dropping the address instead would render the instruction and the clause as
  if no address were set. That is gentler for the UI, but it hides a plan error. If the fixer drops,
  these pins become ordinary rows asserting the address-less output.
- whether a group with one bad conjunct (*Mom and I*) is refused whole.
- whether the UI can build either plan at all; if it can, it needs the same guard.

Pinned by `known bugs: contradictory address plans are not refused (A338)` in
[address.test.ts](../../../packages/engine/test/address.test.ts).

Found on 2026-09-24 in the P11-E3 coverage audit, by rendering the address against the plan keys it
contradicts.

## Resolved

2026-09-24. Refused, not dropped: a plan error stays visible. Decided on the open questions:

- **Instruction.** [`translate.ts`](../../../packages/engine/src/translator/functions/translate.ts)
  throws, once and before any language renders, when the top clause is an `imperative` with
  `imperativeRegister: 'instruction'` and an `address`: *an instruction addresses nobody, so it takes
  no address: plan.address must be left out (A338)*. A register on a non-imperative clause is moot,
  so it is not checked.
- **Pronoun.** [`resolveAddress.ts`](../../../packages/engine/src/translator/functions/resolveAddress.ts)
  throws on a conjunct whose `person` is 1 or 3: *an address calls the hearer: plan.address cannot be
  a 1st-person pronoun (A338)*. A group with one such conjunct (*Mom and I*) is refused whole. An
  indefinite pronoun (`indefinite: '1'`, SOMEONE) is not a personal one and stays an address
  (*Someone, run.*, all seven).
- **Backend.** As for A273/A275, [`planError.ts`](../../../packages/backend/src/planError.ts) names
  both at the boundary, so `/api/translate` answers a 400 rather than the 500 of an engine throw:
  `plan.address: an instruction addresses nobody, so it takes no address`, and `plan.address` (or
  `plan.address.conjuncts[i]`) `: an address calls the hearer, so it cannot be a 1st-person pronoun`.
  The pronoun check reads the lexicon, which [`index.ts`](../../../packages/backend/src/index.ts)
  passes in as `formsOf`.
- **UI.** The builder sets no `address` (Plan-only, as `PhrasePlan.address` says), so it needs no
  guard.

The three `test.fails` in [address.test.ts](../../../packages/engine/test/address.test.ts) (*known
bugs: contradictory address plans are not refused (A338)*) are plain tests now, assertions unchanged.
Added in the same block: the 1st plural, a group with a 1st-person conjunct and the 3rd plural
refused, and an indefinite-pronoun regression. `resolveAddress.test.ts` and `translate.test.ts` each
gained a case; `planError.test.ts` gained *planError: the address* and `index.test.ts` *the address on
/api/translate (A338)*.

