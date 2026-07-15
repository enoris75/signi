import { describe, expect, test } from 'vitest';
import { ASPECTS, TENSES, type Aspect, type LanguageCode, type Tense } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// Hypothetical (counterfactual) conditionals, swept combinatorially over tense and aspect.
//
// A hypothetical is two clauses: the MAIN clause (apodosis — "the dog would run", resolved in the
// conditional mood) and the IF clause (protasis — "if the cat ate", resolved in the subjunctive
// mood). condition.test.ts carries the curated, commentary-bearing cases and the documented
// German simplification; this file is the *regression lock* — every tense × aspect the plan can
// put on the MAIN clause, crossed with every tense × aspect on the IF clause. That is
// 3 tenses × 4 aspects = 12 cells per clause, so 12 × 12 = 144 conditionals, each rendered in all
// seven languages (~1 008 surface forms).
//
// There is no hand-authoring assertions at that scale (see verb.conjugation.test.ts for the same
// reasoning on the plain conjugation table): the sweep is snapshotted, and a change in any cell,
// in any language, surfaces as a snapshot diff naming the exact (main cell, if cell) that moved.
// The curated `describe` below anchors a handful of cells to concrete strings so the snapshot
// can't be re-baselined blind.
//
// What the lock documents: mood overrides tense in several engines. English realises the
// subjunctive as the simple past ("if the cat ate") and the conditional as "would" + the verb
// group, so tense on *either* clause is largely inert there while aspect still flows through
// ("if the cat were eating, the dog would be running"). Whatever each engine actually does with
// the tense·aspect it is handed, these snapshots pin it.

const DOG = np('DOG');
const CAT = np('CAT');

/** One tense × aspect combination, as [label, tense, aspect] — the cell of both sweep axes. */
const CELLS: ReadonlyArray<readonly [label: string, tense: Tense, aspect: Aspect]> = TENSES.flatMap(
  (tense) => ASPECTS.map((aspect) => [`${tense} · ${aspect}`, tense, aspect] as const),
);

/** Build a hypothetical: DOG·RUN main clause, CAT·EAT if clause, each in the given cell. */
function hypothetical(
  mainTense: Tense,
  mainAspect: Aspect,
  ifTense: Tense,
  ifAspect: Aspect,
): Record<LanguageCode, string> {
  return sayAll({
    ...clause(DOG, 'RUN', { verbPhrase: { tense: mainTense, aspect: mainAspect } }),
    condition: clause(CAT, 'EAT', { verbPhrase: { tense: ifTense, aspect: ifAspect } }),
  });
}

// One snapshot per MAIN cell; its body is the whole 12-cell IF matrix. A single broken form
// surfaces as a one-line diff inside the block named by the main clause's tense·aspect.
describe.each(CELLS)('main: %s', (_mainLabel, mainTense, mainAspect) => {
  test('over every tense × aspect of the if clause', () => {
    const matrix: Record<string, Record<LanguageCode, string>> = {};
    for (const [ifLabel, ifTense, ifAspect] of CELLS) {
      matrix[ifLabel] = hypothetical(mainTense, mainAspect, ifTense, ifAspect);
    }
    expect(matrix).toMatchSnapshot();
  });
});

// A few cells pinned to concrete strings — the human-verified anchors the sweep leans on. English
// is asserted throughout (its conditional/subjunctive is the most stable across tense), with a
// Romance witness where the aspect surfaces distinctly.
describe('hypothetical: anchored cells', () => {
  test('neutral present both clauses is the plain counterfactual', () => {
    expect(hypothetical('present', 'neutral', 'present', 'neutral')).toMatchObject({
      en: 'if the cat ate, the dog would run.',
      it: 'se il gatto mangiasse, il cane correrebbe.',
      es: 'si el gato comiera, el perro correría.',
    });
  });

  test('the progressive aspect flows through both moods', () => {
    // The subjunctive protasis carries the progressive on the simple past of "be" ("was eating",
    // not the modal "were"); the conditional apodosis carries it on "would be".
    expect(hypothetical('present', 'progressive', 'present', 'progressive')).toMatchObject({
      en: 'if the cat was eating, the dog would be running.',
    });
  });

  test('prospective present main, with a future progressive MUST-governed if clause', () => {
    // MAIN: prospective + present ("is about to run"). IF: future + progressive under the modal
    // MUST — the modal is the finite verb of the if clause and governs the progressive verb group.
    expect(sayAll({
      ...clause(DOG, 'RUN', { verbPhrase: { tense: 'present', aspect: 'prospective' } }),
      condition: clause(CAT, 'EAT', {
        verbPhrase: { tense: 'future', aspect: 'progressive', modals: ['MUST'] },
      }),
    })).toMatchSnapshot();
  });

  test('a fully-loaded conditional: motion goal, direct object, aspect, tense and a modal', () => {
    // MAIN: the angel is about-to drink the water — prospective + present, transitive.
    // IF: the animal should be going to Antarctica — future + progressive under MUST, with a
    // `direction` goal. Exercises every feature stacking at once in a single hypothetical.
    const said = sayAll({
      ...clause(np('ANGEL'), 'DRINK', {
        directObject: np('WATER'),
        verbPhrase: { tense: 'present', aspect: 'prospective' },
      }),
      condition: clause(np('ANIMAL'), 'GO', {
        complements: { direction: { phrase: np('ANTARCTICA') } },
        verbPhrase: { tense: 'future', aspect: 'progressive', modals: ['MUST'] },
      }),
    });

    // The `dovesse` (imperfect subjunctive of *dovere*) protasis pairs with a present-indicative
    // apodosis — the valid Italian "were-to / should…" pattern, so the missing conditional on the
    // prospective main clause reads correctly *here* (contrast the plain counterfactual pinned in
    // the documented-simplifications block below — gap B8). KNOWN BUG A31: the `direction` goal
    // renders "all'Antartide" (a + article), but Italian selects *in* (no article) for a
    // continent — "in Antartide". Pinned as current output; flip it when A31 lands.
    expect(said).toMatchObject({
      it: "se l'animale dovesse stare andando all'Antartide, l'angelo sta per bere l'acqua.",
    });
    expect(said).toMatchSnapshot();
  });

  test('English forces the if clause to the past regardless of the plan tense', () => {
    // The subjunctive is realised as the simple past, so present / past / future if clauses all
    // render identically in English — the tense on the condition is inert here.
    const present = hypothetical('present', 'neutral', 'present', 'neutral').en;
    const past = hypothetical('present', 'neutral', 'past', 'neutral').en;
    const future = hypothetical('present', 'neutral', 'future', 'neutral').en;
    expect(past).toBe(present);
    expect(future).toBe(present);
  });
});

describe('documented simplifications: aspect drops the conditional mood', () => {
  // Gap B8 (docs/engine-grammar-bugs.md). A marked aspect (progressive / prospective / resultative)
  // on the apodosis loses the conditional mood in the four Romance engines: the periphrastic
  // auxiliary (stare / estar /
  // être) is conjugated in the plain PRESENT INDICATIVE, not the conditional. See it.ts ~line 605:
  // "the marked aspects keep their indicative auxiliary (aspect under a conditional is a
  // documented gap)." The neutral aspect is fine — it takes the conditional ("il cane
  // correrebbe") — so the gap is invisible until an aspect is set.
  //
  // It bites hardest under a genuine (non-`dovere`) counterfactual: "se il gatto mangiasse" is a
  // plain imperfect subjunctive, which licenses ONLY a conditional apodosis, so "il cane sta
  // correndo" is not an approximation but ungrammatical. (Contrast the `dovesse` protasis in the
  // anchored cells above, whose "were-to / should…" reading does permit a present apodosis.)
  //
  // Recorded as the correct target, not asserted as current behaviour: 3sg conditional of the
  // aspect auxiliary + the same non-finite form the indicative already gets right.
  test.fails('the progressive apodosis should be conditional, not present indicative', () => {
    expect(hypothetical('present', 'progressive', 'present', 'neutral')).toMatchObject({
      it: 'se il gatto mangiasse, il cane starebbe correndo.',
      fr: 'si le chat mangeait, le chien serait en train de courir.',
      es: 'si el gato comiera, el perro estaría corriendo.',
      pt: 'se o gato comesse, o cão estaria correndo.',
    });
  });
});
