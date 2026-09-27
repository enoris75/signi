import { describe, expect, test } from 'vitest';
import { BUTTUN, CHAUN, ELLA, GIAT, GROND, MANGIAR, NAIR, adj, concept, el, group, np } from './rumgr.fixtures.js';
import { agentPhrase } from './agentPhrase.js';
import { indefiniteModifierRumgr } from './indefiniteModifier.js';
import { prepObjectText } from './prepObjectText.js';
import { questionWord } from './questionWord.js';
import { questionOrder } from './questionOrder.js';
import { subjectText } from './subjectText.js';

describe('agentPhrase', () => {
  test('da, contracting per conjunct; a pronoun tonic', () => {
    expect(agentPhrase(group('and', np(GIAT), np(CHAUN)))).toBe('dal giat e dal chaun');
    expect(agentPhrase(el(np(ELLA)))).toBe('da ella');
    expect(agentPhrase(undefined)).toBe('');
  });
});

describe('prepObjectText', () => {
  test("the verb's own preposition, contracting through its last word", () => {
    expect(prepObjectText(np(BUTTUN), 'sin')).toBe('sin il buttun');
    expect(prepObjectText(np(GIAT), 'vi da')).toBe('vi dal giat');
    expect(prepObjectText(np(ELLA), 'a')).toBe('ad ella');
  });
});

describe('questionWord / questionOrder', () => {
  const verb = concept(MANGIAR);
  test('tgi, tge and the adverbs', () => {
    expect(questionWord({ role: 'subject', animate: true } as never, verb)).toBe('tgi');
    expect(questionWord({ role: 'directObject', animate: false } as never, verb)).toBe('tge');
    expect(questionWord({ role: 'possessor' } as never, verb)).toBe('da tgi');
  });

  test('the subject follows the predicate in a non-subject question', () => {
    expect(questionOrder({ role: 'directObject', animate: false } as never, 'il giat', 'mangia', verb)).toEqual(['tge', 'mangia il giat']);
    expect(questionOrder(undefined, 'il giat', 'mangia', verb)).toEqual(['il giat', 'mangia']);
  });
});

describe('indefiniteModifierRumgr', () => {
  test('the adjective straight after the pronoun', () => {
    expect(indefiniteModifierRumgr('insatge', 'insatge', concept(GROND), 'base')).toBe('insatge grond');
    expect(indefiniteModifierRumgr('insatgi', 'insatgi', concept({ base: 'auter', after_pronoun: 'auter' }), 'base')).toBe('insatgi auter');
  });
});

describe('subjectText', () => {
  test('a coordinated subject, adjectives agreeing', () => {
    expect(subjectText(group('and', np(GIAT, {}, { adjectives: [adj(NAIR)] }), np(CHAUN)))).toBe('il giat nair e il chaun');
  });
});
