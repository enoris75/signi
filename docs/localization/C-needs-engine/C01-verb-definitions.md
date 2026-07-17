# C01. Verb definitions — all 48 verbs

**Blocked on:** a **verb-definition render mode**. A verb's definition is naturally an infinitive
phrase ("to consume food", "to move from one place to another"), but the engine only renders finite
periods (a clause with a subject) and the imperative `instruction` register ("consume food"). Neither
is an infinitive gloss.

## What's needed (grammatical construct)

One of:
- an **infinitive / citation register** on `PhrasePlan` that renders a subject-less verb group as a
  dictionary infinitive (en "to consume", it "consumare", de "konsumieren", ja 〜する dictionary
  form), so a verb definition can be a genus-verb + object plan; or
- reuse the existing imperative `instruction` register as the gloss ("consume food") — cheaper, but
  reads as a command, not a definition.

## Blocks (representative — all non-modal verbs)

EAT ("to consume food"), DRINK ("to consume liquid"), GO ("to move from one place to another"),
RUN, SEE, MAKE, GIVE, BUY, CUT, READ, … (48 total). Genus verbs (CONSUME, MOVE, …) would also need
seeding once the render mode exists.

Until the render mode lands, all verbs stay on the English literal (`description`).
