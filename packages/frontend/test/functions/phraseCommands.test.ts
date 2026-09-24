import { describe, expect, it, vi } from 'vitest';
import type { Concept } from '@signi/shared';
import type { PhraseSelection } from '../../src/components/PhraseBuilder/interfaces.ts';
import * as reducers from '../../src/components/PhraseBuilder/phraseReducers.ts';
import { phraseCommands } from '../../src/components/PhraseBuilder/functions/phraseCommands.ts';

const CAT: Concept = { id: 'CAT', role: 'noun', description: 'CAT', label: 'cat' };
const EAT: Concept = { id: 'EAT', role: 'verb', description: 'EAT', label: 'eat', transitivity: 'transitive' };
const BIG: Concept = { id: 'BIG', role: 'adjective', description: 'BIG', label: 'big' };

// A period with something for every command to act on.
const PERIOD: PhraseSelection = {
  subject: CAT,
  subjectConjuncts: [{ subject: CAT }],
  verb: EAT,
  directObject: CAT,
  modifier: CAT,
  route: CAT,
  locative: CAT,
  cause: CAT,
  predicative: BIG,
  predicativeStandard: { subject: CAT },
  imperative: true,
};

type Commands = ReturnType<typeof phraseCommands>;

// Each command, run with its arguments, against the reducer edit it should hand up.
const CASES: [keyof Commands, (c: Commands) => void, (prev: PhraseSelection) => PhraseSelection][] = [
  ['handleAddConjunct', (c) => c.handleAddConjunct('subject'), (p) => reducers.addConjunct(p, 'subject')],
  ['handleCycleConjunction', (c) => c.handleCycleConjunction('subject'), (p) => reducers.cycleNounConjunction(p, 'subject')],
  ['handleToggleNumber', (c) => c.handleToggleNumber('directObject'), (p) => reducers.toggleNumber(p, 'directObject')],
  ['handleToggleGender', (c) => c.handleToggleGender('subject'), (p) => reducers.toggleGender(p, 'subject')],
  ['handleToggleNegative', (c) => c.handleToggleNegative(), reducers.toggleNegative],
  ['handleToggleCauseNegative', (c) => c.handleToggleCauseNegative(), reducers.toggleCauseNegative],
  ['handleSetDefiniteness', (c) => c.handleSetDefiniteness('subject', 'indefinite'), (p) => reducers.setDefiniteness(p, 'subject', 'indefinite')],
  ['handleCycleModifierRelation', (c) => c.handleCycleModifierRelation('modifier'), (p) => reducers.cycleModifierRelation(p, 'modifier')],
  ['handleCycleModifierNumber', (c) => c.handleCycleModifierNumber('modifier'), (p) => reducers.cycleModifierNumber(p, 'modifier')],
  ['handleSetModifierAdjective', (c) => c.handleSetModifierAdjective('modifier', BIG), (p) => reducers.setModifierAdjective(p, 'modifier', BIG)],
  ['handleCycleDegree', (c) => c.handleCycleDegree('subjectAdjective'), (p) => reducers.cycleDegree(p, 'subjectAdjective')],
  ['handleRemoveStandard', (c) => c.handleRemoveStandard(), (p) => reducers.removeStandard(p, 'predicative')],
  ['handleCycleTense', (c) => c.handleCycleTense(), reducers.cycleTense],
  ['handleCycleAspect', (c) => c.handleCycleAspect(), reducers.cycleAspect],
  ['handleCycleVoice', (c) => c.handleCycleVoice(), reducers.cycleVoice],
  ['handleSetImperativePerson', (c) => c.handleSetImperativePerson('2pl'), (p) => reducers.setImperativePerson(p, '2pl')],
  ['handleSetImperativeRegister', (c) => c.handleSetImperativeRegister('instruction'), (p) => reducers.setImperativeRegister(p, 'instruction')],
  // The question's mark, its who / what and the existential (P09-E12 M6, M7).
  ['handleToggleQuestion', (c) => c.handleToggleQuestion('directObject'), (p) => reducers.toggleQuestionRole(p, 'directObject')],
  ['handleToggleQuestionAnimate', (c) => c.handleToggleQuestionAnimate(), reducers.toggleQuestionAnimate],
  ['handleToggleExistential', (c) => c.handleToggleExistential(), reducers.toggleExistential],
  // How a verbless period's subject reads, and a time reading's relation (P13).
  ['handleCycleGloss', (c) => c.handleCycleGloss(-1), (p) => reducers.cycleSubjectGloss(p, -1)],
  ['handleCycleGlossRelation', (c) => c.handleCycleGlossRelation(), reducers.cycleGlossRelation],
  ['handleSelectSpecifier', (c) => c.handleSelectSpecifier('over'), (p) => reducers.setSpecifier(p, 'over', 'route')],
  ['handleSelectLocativeSpecifier', (c) => c.handleSelectLocativeSpecifier('under'), (p) => reducers.setSpecifier(p, 'under', 'locative')],
  ['handleSelectTemporalRelation', (c) => c.handleSelectTemporalRelation('ago'), (p) => reducers.setTemporalRelation(p, 'ago')],
  ['handleSelectSentiment', (c) => c.handleSelectSentiment('positive'), (p) => reducers.setSentiment(p, 'positive')],
];

describe('phraseCommands', () => {
  it('binds every command it offers', () => {
    expect(Object.keys(phraseCommands(() => {})).sort()).toEqual(CASES.map(([name]) => name).sort());
  });

  it.each(CASES)('%s hands up its reducer’s edit, once', (_name, run, reduce) => {
    const onPhraseUpdate = vi.fn();

    run(phraseCommands(onPhraseUpdate));

    expect(onPhraseUpdate).toHaveBeenCalledOnce();
    const updater = onPhraseUpdate.mock.calls[0][0] as (prev: PhraseSelection) => PhraseSelection;
    expect(updater(PERIOD)).toEqual(reduce(PERIOD));
  });
});
