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

    // The `dovesse` (imperfect subjunctive of *dovere*) protasis governs the progressive verb
    // group as an infinitive ("dovesse stare andando"), so aspect there is untouched by mood. The
    // prospective main clause is the apodosis and now carries the conditional on its auxiliary
    // ("starebbe per bere" — gap A38 fixed). The `direction` goal to a continent selects *in* (no
    // article) — "in Antartide" — since A31 landed (was "all'Antartide").
    expect(said).toMatchObject({
      it: "se l'animale dovesse stare andando in Antartide, l'angelo starebbe per bere l'acqua.",
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

describe('known bugs: aspect drops the conditional mood', () => {
  // Gap A38 (docs/bugs/A-must-fix). A marked aspect (progressive / prospective / resultative)
  // on the apodosis loses the conditional mood in the four Romance engines: the periphrastic
  // auxiliary (stare / estar /
  // être) is conjugated in the plain PRESENT INDICATIVE, not the conditional. The Italian engine said:
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
  test('the progressive apodosis should be conditional, not present indicative', () => {
    expect(hypothetical('present', 'progressive', 'present', 'neutral')).toMatchObject({
      it: 'se il gatto mangiasse, il cane starebbe correndo.',
      fr: 'si le chat mangeait, le chien serait en train de courir.',
      es: 'si el gato comiera, el perro estaría corriendo.',
      pt: 'se o gato comesse, o cão estaria correndo.',
    });
  });
  // Prospective: the same auxiliary (stare / être / estar) fronts the "about to" periphrasis and
  // must carry the conditional — currently plain present indicative (sta per / est sur le point de
  // / está a punto de / está prestes a).
  test('the prospective apodosis should be conditional, not present indicative', () => {
    expect(hypothetical('present', 'prospective', 'present', 'neutral')).toMatchObject({
      it: 'se il gatto mangiasse, il cane starebbe per correre.',
      fr: 'si le chat mangeait, le chien serait sur le point de courir.',
      es: 'si el gato comiera, el perro estaría a punto de correr.',
      pt: 'se o gato comesse, o cão estaria prestes a correr.',
    });
  });
  // Resultative (the conditional perfect, "would have run"): it/fr/es carry the perfect auxiliary
  // (avere / avoir / haber) into the conditional over the participle. Portuguese is the odd one —
  // its present resultative collapses to the pretérito perfeito (fixed A9), so under a conditional
  // apodosis that collapse must be bypassed for the true conditional perfect "teria corrido", not
  // the present-indicative "correu" it emits today.
  test('the resultative apodosis should be the conditional perfect', () => {
    expect(hypothetical('present', 'resultative', 'present', 'neutral')).toMatchObject({
      it: 'se il gatto mangiasse, il cane avrebbe corso.',
      fr: 'si le chat mangeait, le chien aurait couru.',
      es: 'si el gato comiera, el perro habría corrido.',
      pt: 'se o gato comesse, o cão teria corrido.',
    });
  });

  // The same fix carries the *protasis*: a marked aspect on the IF clause takes the imperfect
  // subjunctive of its auxiliary (fr: the imparfait), not the plain present indicative — the
  // auxiliary is the finite element, so mood reaches it exactly as it does a plain verb. The
  // irregular auxiliary subjunctives are exercised here: it stesse / avesse, es estuviera /
  // hubiera, pt estivesse / tivesse, fr était / avait.
  test('a marked aspect on the protasis takes the subjunctive of its auxiliary', () => {
    expect(hypothetical('present', 'neutral', 'present', 'progressive')).toMatchObject({
      it: 'se il gatto stesse mangiando, il cane correrebbe.',
      fr: 'si le chat était en train de manger, le chien courrait.',
      es: 'si el gato estuviera comiendo, el perro correría.',
      pt: 'se o gato estivesse comendo, o cão correria.',
    });
    expect(hypothetical('present', 'neutral', 'present', 'resultative')).toMatchObject({
      it: 'se il gatto avesse mangiato, il cane correrebbe.',
      fr: 'si le chat avait mangé, le chien courrait.',
      es: 'si el gato hubiera comido, el perro correría.',
      pt: 'se o gato tivesse comido, o cão correria.',
    });
  });

  // Regression on the A9 interaction: OUTSIDE a hypothetical (no mood) the Portuguese present
  // resultative still collapses to the pretérito perfeito ("o gato correu"), not "tem corrido".
  // The conditional perfect above is a genuine perfect, so it bypasses that collapse; a plain
  // clause is unaffected.
  test('the Portuguese present resultative still collapses to the pretérito outside a conditional', () => {
    expect(sayAll(clause(np('DOG'), 'RUN', { verbPhrase: { aspect: 'resultative' } })).pt)
      .toBe('o cão correu.');
  });
});

// B11. `mood.ts` derives the imperfect subjunctive from the 3pl preterite stem plus -ra endings.
// Its header lists the 1st plural's missing stem accent as a known gap: "the es/pt 1st-plural
// forms omit the stem accent (comieramos, not comiéramos)". The accent is required, so this is
// the correct target.
describe('documented simplifications: Spanish 1st-plural imperfect subjunctive', () => {
  test.fails('Spanish writes the stem accent on the 1st-plural imperfect subjunctive', () => {
    const ifWe = (aspect: 'neutral' | 'progressive' | 'resultative') => sayAll({
      ...clause(np('DOG'), 'RUN'),
      condition: clause(np('FIRST_PERSON', { number: 'plural' }), 'EAT', { verbPhrase: { aspect } }),
    }).es;
    expect(ifWe('neutral')).toBe('si comiéramos, el perro correría.');
    expect(ifWe('resultative')).toBe('si hubiéramos comido, el perro correría.');
    expect(ifWe('progressive')).toBe('si estuviéramos comiendo, el perro correría.');
  });
});

// B11. `mood.ts` builds the Portuguese imperfect subjunctive as the 3pl preterite stem + the
// endings, and its header lists "the es/pt 1st-plural forms omit the stem accent" as a known gap.
// The 1st plural stresses the syllable before -ssemos, which Portuguese always writes with an
// accent: comêssemos, estivéssemos, tivéssemos, fôssemos.
describe('documented simplifications: Portuguese 1st-plural imperfect subjunctive', () => {
  const ifWe = (verb: string, extra: Parameters<typeof clause>[2] = {}) =>
    sayAll({ ...clause(np('DOG'), 'RUN'), condition: clause(np('FIRST_PERSON', { number: 'plural' }), verb, extra) }).pt;

  test.fails('Portuguese accents the 1st-plural imperfect subjunctive', () => {
    expect(ifWe('EAT')).toBe('se comêssemos, o cão correria.');
    expect(ifWe('BE', { complements: { predicative: { phrase: np('STRONG') } } })).toBe('se fôssemos fortes, o cão correria.');
    expect(ifWe('BE', { complements: { locative: { phrase: np('HOUSE') } } })).toBe('se estivéssemos na casa, o cão correria.');
    expect(ifWe('EAT', { verbPhrase: { aspect: 'resultative' } })).toBe('se tivéssemos comido, o cão correria.');
  });
});

// A101. `moodForm` builds the conditional on the stored `1sg_future` and the imperfect subjunctive on
// the stored `3pl_past`. For a reflexive verb those forms carry a clitic ("me volveré", "se
// volvieron"), so every person gets "me volvería" and "se volviera".
describe('known bugs: Spanish reflexive verb in a conditional', () => {
  test.fails('Spanish agrees the reflexive clitic of the conditional and the imperfect subjunctive', () => {
    const legend = { predicative: { phrase: np('LEGEND', { definiteness: 'indefinite' }) } };
    expect(sayAll({ ...clause(np('DOG'), 'BECOME', { complements: legend }), condition: clause(np('CAT'), 'EAT') }).es)
      .toBe('si el gato comiera, el perro se volvería una leyenda.');
    expect(sayAll({ ...clause(np('DOG', { number: 'plural' }), 'BECOME', { complements: legend }), condition: clause(np('CAT'), 'EAT') }).es)
      .toBe('si el gato comiera, los perros se volverían una leyenda.');
    expect(sayAll({ ...clause(np('DOG'), 'RUN'), condition: clause(np('FIRST_PERSON'), 'BECOME', { complements: legend }) }).es)
      .toBe('si me volviera una leyenda, el perro correría.');
    expect(sayAll({ ...clause(np('DOG'), 'RUN'), condition: clause(np('SECOND_PERSON'), 'BECOME', { complements: legend }) }).es)
      .toBe('si te volvieras una leyenda, el perro correría.');
  });
});

// A117. The copula branch of `predicateSegs` runs before the subjunctive check. A BE "if" clause
// therefore keeps the main-clause です and never takes たら: もし猫が幸せです、犬は走ります, two finite
// clauses in a row. Want the たら form of the copula: 幸せだったら / 大きかったら / 伝説だったら.
describe('known bugs: Japanese copular condition', () => {
  test.fails('Japanese puts a copular condition in the たら form', () => {
    const ifCatIs = (predicate: string) => sayAll({
      ...clause(np('DOG'), 'RUN'),
      condition: clause(np('CAT'), 'BE', { complements: { predicative: { phrase: np(predicate) } } }),
    }).ja;
    expect(ifCatIs('HAPPY')).toBe('もし猫が幸せだったら、犬は走ります。');
    expect(ifCatIs('BIG')).toBe('もし猫が大きかったら、犬は走ります。');
    expect(ifCatIs('LEGEND')).toBe('もし猫が伝説だったら、犬は走ります。');
  });
});

// A118. `predicateSegs` renders the subjunctive "if" clause as taraSeg(verb) alone, before the modal
// and aspect branches and with no polarity. Negation (negative, NEVER, a `no` argument), modals and
// aspect all vanish, so "if the cat did not eat" reads "if the cat ate" (もし猫が食べたら).
describe('known bugs: Japanese たら protasis', () => {
  test.fails('Japanese keeps the negation, modal and aspect of the たら clause', () => {
    const ifCat = (verbPhrase: object, subject = np('CAT')) =>
      sayAll({ ...clause(np('DOG'), 'RUN'), condition: clause(subject, 'EAT', { verbPhrase }) }).ja;
    expect(ifCat({ negative: true })).toBe('もし猫が食べなかったら、犬は走ります。');
    expect(ifCat({ modifier: 'NEVER' })).toBe('もし猫が決して食べなかったら、犬は走ります。');
    expect(ifCat({}, np('CAT', { definiteness: 'no' }))).toBe('もしどの猫も食べなかったら、犬は走ります。');
    expect(ifCat({ modals: ['CAN'] })).toBe('もし猫が食べることができたら、犬は走ります。');
    expect(ifCat({ modals: ['WILL'] })).toBe('もし猫が食べたかったら、犬は走ります。');
    expect(ifCat({ aspect: 'progressive' })).toBe('もし猫が食べていたら、犬は走ります。');
    expect(ifCat({ aspect: 'resultative' })).toBe('もし猫が食べてしまったら、犬は走ります。');
  });
});
