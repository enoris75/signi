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

  test('a relative clause with no verb yet leaves the main sentence standing until it gets one', async ({
    app,
    page,
  }) => {
    // A verbless relative clause once reached the engine, which threw on its missing verb phrase,
    // and every translate answered 500 until the clause had a verb.
    const failures: string[] = [];
    page.on('response', (r) => {
      if (r.url().includes('/api/translate') && r.status() >= 500) failures.push(`${r.status()} ${r.url()}`);
    });

    // The relative clause holds only its subject — the gap — built while it is the only period.
    await app.setSubject('BOY');
    await app.addPeriod();
    await app.buildClauseIn(1, 'BOY', 'SEE');
    await app.setDirectObjectIn(1, 'DOG');
    await app.linkRelative(1, 'subject', 0, 'subject');

    await expect.poll(() => app.sentence('en')).toBe('the boy sees the dog.');

    await app.setVerbIn(0, 'CRY');

    await expect.poll(() => app.sentence('en')).toBe('the boy who cries sees the dog.');
    expect(failures).toEqual([]);
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

  test('a relative on a complement slot takes that complement\'s preposition and relation', async ({
    app,
    page,
  }) => {
    // The relative clause "… under which the cat runs": its locative is the gap, set to "under",
    // and holds a placeholder word only to be an eligible pick target. Built while it is the only
    // period, so the page-wide slot helpers are unambiguous.
    await app.buildClause('CAT', 'RUN');
    await app.revealAndPick('locative', 'HOUSE');
    await page.getByRole('button', { name: 'under', exact: true }).click();

    // Main clause "the house burns" in a second period; its subject is the head.
    await app.addPeriod();
    await app.buildClauseIn(1, 'HOUSE', 'BURN');
    await app.linkRelative(1, 'subject', 0, 'locative');

    await app.expectSentences({
      en: 'the house under which the cat runs burns.',
      de: 'das Haus, unter dem der Kater läuft, brennt.',
      it: 'la casa sotto la quale il gatto corre brucia.',
      fr: 'la maison sous laquelle le chat court brûle.',
    });
  });

  test('a relative clause survives a save/load round-trip', async ({ app, page }, testInfo) => {
    const name = `Relative ${testInfo.testId}-${testInfo.repeatEachIndex}`;

    await app.buildClauseIn(0, 'BOY', 'SEE');
    await app.setDirectObjectIn(0, 'DOG');
    await app.addPeriod();
    await app.buildClauseIn(1, 'BOY', 'CRY');
    await app.linkRelative(0, 'subject', 1, 'subject');
    await expect.poll(() => app.sentence('en')).toBe('the boy who cries sees the dog.');

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    const saveDialog = page.getByRole('dialog');
    await saveDialog.getByLabel('Name').fill(name);
    await saveDialog.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Saved phrase')).toBeVisible();

    await app.goto();
    await expect(page.getByTestId('translations-empty')).toBeVisible();

    await page.getByRole('button', { name: 'Load a saved phrase' }).click();
    await page.getByRole('dialog').getByText(name).click();
    await expect(page.getByText('Loaded phrase')).toBeVisible();

    // Both periods and the link between them come back: still one sentence, not two.
    await expect(page.getByTestId('period-container')).toHaveCount(2);
    await expect.poll(() => app.sentence('en')).toBe('the boy who cries sees the dog.');
    await expect(app.sentences('en')).toHaveCount(1);
    expect(await app.sentence('de')).toBe('der Junge, der weint, sieht den Hund.');
  });
});
