import { describe, expect, test } from 'vitest';
import { clause, np, vp } from '../resolved.fixtures.js';
import { objectClauseLead } from './objectClauseLead.js';

const kater = np({ base: 'Kater' });
const frisst = vp({ base: 'fressen' });

describe('objectClauseLead', () => {
  test('"dass" under a statement, "ob" under a yes/no question', () => {
    expect(objectClauseLead(clause(kater, frisst))).toBe('dass');
    expect(objectClauseLead(clause(kater, frisst, { embedded: true }))).toBe('ob');
  });

  test('the question word under a wh-question', () => {
    expect(objectClauseLead(clause(kater, frisst, { embedded: true, question: { role: 'directObject', animate: false } }))).toBe('was');
    expect(objectClauseLead(clause(kater, frisst, { embedded: true, question: { role: 'locative', animate: false } }))).toBe('wo');
  });

  // The clause writes a subject's word in its own subject slot ("wer das Essen isst").
  test('nothing over the subject', () => {
    expect(objectClauseLead(clause(kater, frisst, { embedded: true, question: { role: 'subject', animate: true } }))).toBe('');
  });
});
