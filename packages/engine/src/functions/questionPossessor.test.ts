import { describe, expect, test } from 'vitest';
import type { ResolvedNounElement, ResolvedPhrase } from '../types.js';
import { isQuestionPossessor, possessedPrepObject, questionPossessor, withoutQuestionPossessor } from './questionPossessor.js';

const noun = (base: string): ResolvedNounElement => {
  const head = { conceptId: base.toUpperCase(), forms: { base } };
  return { conjuncts: [{ head, adjectives: [], nounModifiers: [], possessor: questionPossessor() }], agreement: head.forms };
};

describe('questionPossessor', () => {
  test('a wordless, conceptless person, marked as the question', () => {
    const stand = questionPossessor();
    expect(stand.head.conceptId).toBe('');
    expect(stand.head.forms).toMatchObject({ question: '1', animate: '1', human: '1', definiteness: 'bare' });
    expect(stand.head.forms['base']).toBeUndefined();
  });

  test('isQuestionPossessor tells it from a noun or a pronominal possessor', () => {
    expect(isQuestionPossessor(questionPossessor())).toBe(true);
    expect(isQuestionPossessor({ head: { conceptId: 'MAN', forms: { base: 'man' } }, adjectives: [], nounModifiers: [] })).toBe(false);
    expect(isQuestionPossessor({ kind: 'pronominal', person: '3', number: 'singular' })).toBe(false);
    expect(isQuestionPossessor(undefined)).toBe(false);
  });

  test('withoutQuestionPossessor takes the stand-in off an object whose de-phrase fronts alone', () => {
    const food = noun('cibo');
    expect(withoutQuestionPossessor(food, { role: 'possessor', possessed: 'directObject', animate: true })?.conjuncts[0].possessor)
      .toBeUndefined();
    // Over the subject, or any other gap, nothing fronts, so nothing is taken.
    expect(withoutQuestionPossessor(food, { role: 'possessor', possessed: 'subject', animate: true })).toBe(food);
    expect(withoutQuestionPossessor(food, { role: 'directObject', animate: false })).toBe(food);
  });

  test('possessedPrepObject finds the object a verb takes with a preposition, which fronts whole', () => {
    const phrase = (prep?: string): ResolvedPhrase => ({
      subject: noun('gatto'),
      verbPhrase: { verb: { conceptId: 'DEPEND', forms: prep ? { object_prep: prep } : {} }, modals: [] } as never,
      directObject: noun('casa'),
      question: { role: 'possessor', possessed: 'directObject', animate: true },
    });
    expect(possessedPrepObject(phrase('da'))?.prep).toBe('da');
    expect(possessedPrepObject(phrase())).toBeUndefined();
  });
});
