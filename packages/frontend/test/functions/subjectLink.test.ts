import { describe, expect, it } from 'vitest';
import type { Concept } from '@signi/shared';
import type { PhraseSelection } from '../../src/components/PhraseBuilder/interfaces.ts';
import { linkClauseOf, pointedAt } from '../../src/components/PhraseBuilder/functions/subjectLink.ts';

const BOY: Concept = { id: 'BOY', role: 'noun', description: 'BOY' };
const BOOK: Concept = { id: 'BOOK', role: 'noun', description: 'BOOK' };
const SEE: Concept = { id: 'SEE', role: 'verb', description: 'SEE', transitivity: 'transitive' };

// P11-E7 D4, D5: what a pointer at the subject names on the canvas, and the clause its chip is said in.
describe('pointedAt', () => {
  it('names the box’s word in a plain clause', () => {
    expect(pointedAt({ subject: BOY, verb: SEE }, 'subject')?.concept).toBe(BOY);
  });

  it('names the addressee under a command, not the word kept behind the box', () => {
    expect(pointedAt({ subject: BOY, imperative: true, imperativePerson: '1pl', verb: SEE }, 'subject')).toEqual({
      concept: { id: 'FIRST_PERSON', role: 'pronoun', person: '1', description: 'FIRST_PERSON' },
      features: { kind: 'pronominal', person: '1', number: 'plural' },
    });
  });

  it('names the generic "one" under a citation, and nothing in a governed infinitive', () => {
    const citation: PhraseSelection = { infinitive: true, verb: SEE };
    expect(pointedAt(citation, 'subject')?.concept.id).toBe('GENERIC_PERSON');
    expect(pointedAt(citation, 'subject', true)).toBeUndefined();
  });
});

describe('linkClauseOf', () => {
  const clause: PhraseSelection = { subject: BOY, verb: SEE, directObject: BOOK, directObjectPossessorRef: 'subject' };

  it('is the period’s subject for a pointer the plan writes as the link', () => {
    expect(linkClauseOf(clause, 'directObject', 'subject')).toMatchObject({ subject: { concept: 'BOY' } });
  });

  it('is nothing for a copy: under the passive, and for a governed infinitive', () => {
    expect(linkClauseOf({ ...clause, verbVoice: 'passive' }, 'directObject', 'subject')).toBeUndefined();
    expect(linkClauseOf({ ...clause, infinitive: true }, 'directObject', 'subject', true)).toBeUndefined();
  });

  it('says a citation’s clause in the infinitive, its subject the placeholder "one"', () => {
    expect(linkClauseOf({ ...clause, infinitive: true }, 'directObject', 'subject')).toEqual({
      subject: { concept: 'GENERIC_PERSON' },
      infinitive: true,
    });
  });
});
