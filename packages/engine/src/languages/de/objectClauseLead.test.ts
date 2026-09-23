import { describe, expect, test } from 'vitest';
import { clause, np, vp } from '../resolved.fixtures.js';
import { objectClauseLead } from './objectClauseLead.js';

const kater = np({ base: 'Kater' });
const frisst = vp({ base: 'fressen' });
const lead = (c: Parameters<typeof objectClauseLead>[0]) => objectClauseLead(c).lead;

describe('objectClauseLead', () => {
  test('"dass" under a statement, "ob" under a yes/no question', () => {
    expect(lead(clause(kater, frisst))).toBe('dass');
    expect(lead(clause(kater, frisst, { embedded: true }))).toBe('ob');
  });

  test('the question word under a wh-question', () => {
    expect(lead(clause(kater, frisst, { embedded: true, question: { role: 'directObject', animate: false } }))).toBe('was');
    expect(lead(clause(kater, frisst, { embedded: true, question: { role: 'locative', animate: false } }))).toBe('wo');
  });

  // The clause writes a subject's word in its own subject slot ("wer das Essen isst", "wessen Kater").
  test('nothing over the subject, or a possessor inside it', () => {
    expect(lead(clause(kater, frisst, { embedded: true, question: { role: 'possessor', possessed: 'subject', animate: true } }))).toBe('');
    expect(lead(clause(kater, frisst, { embedded: true, question: { role: 'subject', animate: true } }))).toBe('');
  });
});
