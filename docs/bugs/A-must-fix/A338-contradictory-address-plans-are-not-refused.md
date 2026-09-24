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
