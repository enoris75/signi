import { describe, expect, it } from 'vitest';
import { nearestInDirection, type BoxRect } from '../../src/keyboard/spatialNav.ts';

const box = (key: string, x: number, y: number): BoxRect => ({ key, x, y, width: 60, height: 30 });

describe('nearestInDirection', () => {
  // A period laid out as it reads: subject, verb, object in a row, with the subject's adjective
  // above its noun and the verb's tense below the verb.
  const SUBJECT = box('subject', 100, 200);
  const ADJECTIVE = box('subjectAdjective', 100, 120);
  const VERB = box('verb', 300, 200);
  const TENSE = box('verbTense', 300, 280);
  const OBJECT = box('directObject', 500, 200);
  const ROW = [ADJECTIVE, SUBJECT, VERB, TENSE, OBJECT];

  it('takes the nearest box the way the arrow points', () => {
    expect(nearestInDirection(SUBJECT, ROW, 'right')).toBe('verb');
    expect(nearestInDirection(VERB, ROW, 'right')).toBe('directObject');
    expect(nearestInDirection(VERB, ROW, 'left')).toBe('subject');
    expect(nearestInDirection(SUBJECT, ROW, 'up')).toBe('subjectAdjective');
    expect(nearestInDirection(VERB, ROW, 'down')).toBe('verbTense');
  });

  it('stops at the edge rather than wrapping round', () => {
    expect(nearestInDirection(SUBJECT, ROW, 'left')).toBeUndefined();
    expect(nearestInDirection(OBJECT, ROW, 'right')).toBeUndefined();
    expect(nearestInDirection(ADJECTIVE, ROW, 'up')).toBeUndefined();
  });

  it('never answers with the box the cursor is already on', () => {
    expect(nearestInDirection(SUBJECT, [SUBJECT], 'right')).toBeUndefined();
    // Even where a satellite is seated exactly on its word, and so lies in no direction at all.
    expect(nearestInDirection(SUBJECT, [SUBJECT, { ...SUBJECT, key: 'twin' }], 'right')).toBeUndefined();
  });

  it('keeps to a 90° cone: a box off to the side is not in that direction', () => {
    const farUp = box('above', 400, 0);
    // `above` is 100px right of the verb and 200 up — outside the cone for →, inside it for ↑.
    expect(nearestInDirection(VERB, [VERB, farUp], 'right')).toBeUndefined();
    expect(nearestInDirection(VERB, [VERB, farUp], 'up')).toBe('above');
  });

  it('prefers a box straight ahead to a nearer one off to the side', () => {
    const ahead = box('ahead', 500, 200);
    const nearerButAside = box('aside', 440, 330);
    expect(nearestInDirection(VERB, [VERB, ahead, nearerButAside], 'right')).toBe('ahead');
  });

  // The rects are measured against the viewport, so a period below this one is simply further
  // down the same space — ↓ crosses into it without the search knowing periods exist.
  it('crosses into the period below', () => {
    const nextPeriodSubject = box('subject2', 100, 600);
    expect(nearestInDirection(SUBJECT, [SUBJECT, VERB, nextPeriodSubject], 'down')).toBe('subject2');
    expect(nearestInDirection(nextPeriodSubject, [SUBJECT, nextPeriodSubject], 'up')).toBe('subject');
  });
});
