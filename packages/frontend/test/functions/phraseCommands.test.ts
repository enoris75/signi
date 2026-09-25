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
  // A quantity an approximator takes (P09-E49).
  subjectDefiniteness: 'all',
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
  // The interjection's border toggle taking its box away, word and all (P09-E47).
  ['handleRemoveInterjection', (c) => c.handleRemoveInterjection(), (p) => reducers.applyClear(p, 'interjection')],
  // The vocative's border toggle taking its box away, words and all (P11-E8).
  ['handleRemoveVocative', (c) => c.handleRemoveVocative(), (p) => reducers.applyClear(p, 'vocative')],
  ['handleRemoveStandard', (c) => c.handleRemoveStandard('directObject'), (p) => reducers.removeStandard(p, 'directObject')],
  ['handleRemoveExamples', (c) => c.handleRemoveExamples('subject'), (p) => reducers.removeExamples(p, 'subject')],
  ['handleToggleExampleRelation', (c) => c.handleToggleExampleRelation('subject'), (p) => reducers.toggleExampleRelation(p, 'subject')],
  ['handleCycleTense', (c) => c.handleCycleTense(), reducers.cycleTense],
  ['handleCycleAspect', (c) => c.handleCycleAspect(), reducers.cycleAspect],
  ['handleCycleVoice', (c) => c.handleCycleVoice(), reducers.cycleVoice],
  ['handleSetImperativePerson', (c) => c.handleSetImperativePerson('2pl'), (p) => reducers.setImperativePerson(p, '2pl')],
  ['handleSetImperativeRegister', (c) => c.handleSetImperativeRegister('instruction'), (p) => reducers.setImperativeRegister(p, 'instruction')],
  // The question's mark, its who / what and the existential (P09-E12 M6, M7).
  ['handleToggleQuestion', (c) => c.handleToggleQuestion('directObject'), (p) => reducers.toggleQuestionRole(p, 'directObject')],
  ['handleToggleQuestionAnimate', (c) => c.handleToggleQuestionAnimate(), reducers.toggleQuestionAnimate],
  ['handleToggleExistential', (c) => c.handleToggleExistential(), reducers.toggleExistential],
  // The humble register, on the subject's ring (P11-E6).
  ['handleToggleHumble', (c) => c.handleToggleHumble(), reducers.toggleHumble],
  // How a verbless period's subject reads, and a time reading's relation (P13).
  ['handleCycleGloss', (c) => c.handleCycleGloss(-1), (p) => reducers.cycleSubjectGloss(p, -1)],
  ['handleCycleGlossRelation', (c) => c.handleCycleGlossRelation(), reducers.cycleGlossRelation],
  ['handleCyclePossessorRole', (c) => c.handleCyclePossessorRole('subject'), (p) => reducers.cyclePossessorRole(p, 'subject')],
  ['handleSelectSpecifier', (c) => c.handleSelectSpecifier('over'), (p) => reducers.setSpecifier(p, 'over', 'route')],
  ['handleSelectLocativeSpecifier', (c) => c.handleSelectLocativeSpecifier('under'), (p) => reducers.setSpecifier(p, 'under', 'locative')],
  ['handleSelectTemporalRelation', (c) => c.handleSelectTemporalRelation('ago'), (p) => reducers.setTemporalRelation(p, 'ago')],
  ['handleSelectPredication', (c) => c.handleSelectPredication('factitive'), (p) => reducers.setPredication(p, 'factitive')],
  ['handleSetContrastive', (c) => c.handleSetContrastive('subject', true), (p) => reducers.setContrastive(p, 'subject', true)],
  ['handleSetNumeral', (c) => c.handleSetNumeral('subject', 24), (p) => reducers.setNumeral(p, 'subject', 24)],
  ['handleSetApproximated', (c) => c.handleSetApproximated('subject', true), (p) => reducers.setApproximated(p, 'subject', true)],
  ['handleSelectDirectionSpecifier', (c) => c.handleSelectDirectionSpecifier('in'), (p) => reducers.setSpecifier(p, 'in', 'direction')],
  ['handleSelectSentiment', (c) => c.handleSelectSentiment('positive'), (p) => reducers.setSentiment(p, 'positive')],
];

describe('phraseCommands', () => {
  // P09-E46: PERIOD's subject is a pair, so the chip's cycle hands up its correlative first.
  it('handleCycleConjunction spells a pair "both … and" before "or"', () => {
    const onPhraseUpdate = vi.fn();
    phraseCommands(onPhraseUpdate).handleCycleConjunction('subject');
    const updater = onPhraseUpdate.mock.calls[0][0] as (prev: PhraseSelection) => PhraseSelection;
    expect(updater(PERIOD).correlatives).toEqual({ subject: true });
  });

  it('handleSetApproximated hands up a change, not a no-op', () => {
    const onPhraseUpdate = vi.fn();
    phraseCommands(onPhraseUpdate).handleSetApproximated('subject', true);
    const updater = onPhraseUpdate.mock.calls[0][0] as (prev: PhraseSelection) => PhraseSelection;
    expect(updater(PERIOD).approximators).toEqual({ subject: true });
  });

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
