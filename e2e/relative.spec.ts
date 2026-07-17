import { test, expect } from './fixtures';

// Subordinate clauses (relative / condition / coordination) are cross-container links — a path
// the engine unit tests cover richly (see packages/engine/test/relative.test.ts) but that no e2e
// exercised. This is the first: build two clauses in the canvas, join one to the other as a
// restrictive relative clause, and assert the engine folds it into a single embedded sentence and
// that it survives a save/load round-trip.
test.describe('subordinate clauses', () => {
  test('a relative clause built across two periods renders embedded in the main sentence', async ({
    app,
  }) => {
    // Main clause: "the boy sees the dog".
    await app.buildClauseIn(0, 'BOY', 'SEE');
    await app.setDirectObjectIn(0, 'DOG');

    // A second period holds the relative clause "… who cries". Its own subject is the gap the
    // head fills, so it only needs a word to be an eligible pick target; CRY is the clause verb.
    await app.addPeriod();
    await app.buildClauseIn(1, 'BOY', 'CRY');

    // Join them: the boy (subject of period 0) is the head; period 1's subject is the gap.
    await app.linkRelative(0, 'subject', 1, 'subject');

    // The two periods collapse into one root sentence, the relative folded onto the head noun.
    await expect.poll(() => app.sentence('en')).toBe('the boy who cries sees the dog.');
    expect(await app.sentence('it')).toBe('il ragazzo che piange vede il cane.');
  });

  test('a non-subject relative links the head to the direct-object gap of the clause', async ({
    app,
  }) => {
    // Main clause: "the dog runs".
    await app.buildClauseIn(0, 'DOG', 'RUN');

    // The relative clause "… that the boy sees" keeps its own subject (BOY) and drops its direct
    // object — that slot is the gap the head fills, so it holds a placeholder word (DOG) only to
    // be an eligible pick target, and its surface is discarded for the head's.
    await app.addPeriod();
    await app.buildClauseIn(1, 'BOY', 'SEE');
    await app.setDirectObjectIn(1, 'DOG');

    // Join them: the dog (subject of period 0) is the head; period 1's direct object is the gap.
    await app.linkRelative(0, 'subject', 1, 'directObject');

    await expect.poll(() => app.sentence('en')).toBe('the dog that the boy sees runs.');
    expect(await app.sentence('it')).toBe('il cane che il ragazzo vede corre.');
  });
});
