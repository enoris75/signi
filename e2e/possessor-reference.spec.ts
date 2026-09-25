import { test, expect } from './fixtures';

// A noun's owner is filled from its possessor control. Opening it draws an empty owner ring — its
// word picker — on the canvas, and lights up the nouns it could point to instead.
//
// Pointing to one makes a pronominal possessor: the engine renders a possessive pronoun agreeing with
// the noun pointed to ("the boy … HIS dog"). This drives the whole wiring: the gesture → the
// PossessorRef in the selection → the plan → the API → the rendered sentence. The grammar itself is
// covered in the engine unit suite (possessivePronoun.test.ts); here we only prove the canvas produces
// the right plan.
test('point to a noun as the owner', async ({ app, page }) => {
  await app.buildClause('BOY', 'SEE');
  await app.setDirectObject('DOG');

  // Open the direct object's owner, and point to the subject (BOY) — the period's own subject box,
  // ahead of the empty owner ring's.
  await page.getByTestId('possessor-ctl-directObject').getByRole('button').click();
  await page.getByTestId('box-subject').first().click();

  // The empty ring is gone; a dashed line to the boy carries the phrase the link will say.
  await expect(page.getByTestId('box-subject')).toHaveCount(1);
  await expect(page.getByTestId('pronoun-chip')).toHaveText('his dog');
  // The reference now renders as a possessive pronoun agreeing with BOY (3rd-sing masc → "his").
  expect(await app.sentence('en')).toBe('the boy sees his dog.');
  expect(await app.sentence('it')).toBe('il ragazzo vede il suo cane.');
  expect(await app.sentence('de')).toBe('der Junge sieht seinen Hund.');
  expect(await app.sentence('es')).toBe('el niño ve su perro.');
  // The pointer at the clause's subject is the link to it (P11-E7): Japanese says 自分の.
  expect(await app.sentence('ja')).toBe('男の子は自分の犬を見ます。');
});

// The chip shows the **possessed noun phrase** the link will render, in the interface language
// (C16). The bare possessive could not be shown correctly: English, German and Japanese spell it
// from the antecedent alone, but the Romance languages also agree it with the noun possessed — "il
// **suo** cane" against "la **sua** casa" — and which gender that noun has is a per-language fact
// about a word the user picks at run time, so no catalog entry rendered once at boot can hold it.
// Rendering the phrase lets the engine do the agreement, and says more than the pronoun did.
test('the chip shows the whole phrase, in the interface language', async ({ app, page }) => {
  await app.buildClause('BOY', 'SEE');
  await app.setDirectObject('DOG');
  await page.getByTestId('possessor-ctl-directObject').getByRole('button').click();
  await page.getByTestId('box-subject').first().click();
  await expect(page.getByTestId('pronoun-chip')).toHaveText('his dog');

  await app.setUiLanguage('it');
  await expect(page.getByTestId('pronoun-chip')).toHaveText('il suo cane');

  await app.setUiLanguage('de');
  await expect(page.getByTestId('pronoun-chip')).toHaveText('sein Hund');

  await app.setUiLanguage('ja');
  // The link is rendered in its clause, so the chip says what the sentence says: 自分の (P11-E7 D5).
  await expect(page.getByTestId('pronoun-chip')).toHaveText('自分の犬');
});

// The agreement the phrase is there for: a feminine possessed noun takes "la sua", where the boy
// who owns it is masculine. The old chip, cited on the grammar noun NOUN, said "suo" for both.
test('the Romance possessive agrees with what is possessed, not with who possesses it', async ({ app, page }) => {
  await app.buildClause('BOY', 'SEE');
  await app.setDirectObject('HOUSE');
  await page.getByTestId('possessor-ctl-directObject').getByRole('button').click();
  await page.getByTestId('box-subject').first().click();
  await expect.poll(() => app.sentence('it')).toBe('il ragazzo vede la sua casa.');

  await app.setUiLanguage('it');
  await expect(page.getByTestId('pronoun-chip')).toHaveText('la sua casa');
});

// The reference is a `NounAddress` stored in the selection, so it must survive the trip through
// the database (the v6 saved-phrase format) and re-resolve on load.
test('a pronominal possessor survives a save/load round trip', async ({ app, page }, testInfo) => {
  const name = `Boy dog ${testInfo.testId}-${testInfo.repeatEachIndex}`;

  await app.buildClause('BOY', 'SEE');
  await app.setDirectObject('DOG');
  await page.getByTestId('possessor-ctl-directObject').getByRole('button').click();
  await page.getByTestId('box-subject').first().click();
  await expect.poll(() => app.sentence('en')).toBe('the boy sees his dog.');

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

  // The possessive pronoun re-resolves from the reloaded reference, and its line is drawn again.
  await expect.poll(() => app.sentence('en')).toBe('the boy sees his dog.');
  expect(await app.sentence('it')).toBe('il ragazzo vede il suo cane.');
  await expect(page.getByTestId('pronoun-chip')).toHaveText('his dog');
});

// Naming the owner instead: its word goes in the empty ring, on the same canvas as the noun it owns.
test('name the owner in a ring of its own', async ({ app, page }) => {
  await app.buildClause('BOY', 'SEE');
  await app.setDirectObject('DOG');

  await page.getByTestId('possessor-ctl-directObject').getByRole('button').click();
  await page.getByTestId('typeahead-noun').fill('cat');
  await page.locator('[data-testid="typeahead-option"][data-concept="CAT"]').click();

  await expect.poll(() => app.sentence('en')).toBe("the boy sees the cat's dog.");
  expect(await app.sentence('it')).toBe('il ragazzo vede il cane del gatto.');
  // One period card, one canvas: the owner is a ring on it, not a panel of its own.
  await expect(page.getByTestId('period-container')).toHaveCount(1);
  await expect(page.getByTestId('phrase-canvas')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Clear the possessor' })).toBeVisible();

  // Its ring's remove control takes the owner off again.
  await page.getByRole('button', { name: 'Remove this possessor' }).click();
  await expect.poll(() => app.sentence('en')).toBe('the boy sees the dog.');
});

// P11-E7: the pointer at the clause's own subject is E2's link, so the possessive agrees with the
// subject as the engine reads it — German *ihr* for the woman, whose gender no pick states.
test('a pointer at the subject is the link: her book', async ({ app, page }) => {
  await app.buildClause('WOMAN', 'SEE');
  await app.setDirectObject('BOOK');
  await page.getByTestId('possessor-ctl-directObject').getByRole('button').click();
  await page.getByTestId('box-subject').first().click();

  await expect.poll(() => app.sentence('en')).toBe('the woman sees her book.');
  expect(await app.sentence('de')).toBe('die Frau sieht ihr Buch.');
  expect(await app.sentence('ja')).toBe('女は自分の本を見ます。');
  await expect(page.getByTestId('pronoun-chip')).toHaveText('her book');
});

// P11-E7 D4: under a command the command box stands for the subject, and pointing at it is pointing
// at the addressee — "see your book" — never at a subject word the period keeps behind the box.
test('pointing at the command box: see your book', async ({ app, page }) => {
  await page.getByRole('button', { name: 'Command', exact: true }).click();
  await app.setVerb('SEE');
  await app.setDirectObject('BOOK');

  await page.getByTestId('possessor-ctl-directObject').getByRole('button').click();
  const moodBox = page.getByTestId('mood-box');
  await expect(moodBox).toHaveAttribute('data-kb-pick-target', 'subject');
  await moodBox.click({ position: { x: 4, y: 4 } });

  await expect.poll(() => app.sentence('en')).toBe('see your book.');
  expect(await app.sentence('de')).toBe('sieh dein Buch.');
  expect(await app.sentence('ja')).toBe('自分の本を見てください。');
  await expect(page.getByTestId('pronoun-chip')).toHaveText('your book');
});

// A375. The owner ring's word picker takes ↵ as "point to" rather than as the word typed: filling
// "dog" and pressing Enter builds a pronominal possessor on the subject ("the cat eats his food"),
// while a click on the same row builds "the dog's food". The picker's own rule is ↵ to choose
// (usePickerKeys). Reproduced at 1d8f359b, before P09-E52 touched the owner ring. Fixed: while a pick
// is in flight, ↵ and ⇥ in a text field are the field's (usePickKeys); the digits and esc stay the
// pick's. Opened from the possessor control or from the noun's owner satellite alike.
test.describe('known bugs: Enter in the owner picker points to the subject (A375)', () => {
  test('↵ takes the word typed', async ({ app, page }) => {
    await app.buildClause('CAT', 'EAT');
    await app.setDirectObject('FOOD');
    await page.getByTestId('possessor-ctl-directObject').getByRole('button').click();
    await page.getByTestId('typeahead-noun').fill('dog');
    await page.keyboard.press('Enter');
    await app.expectSentences({ en: "the cat eats the dog's food." });
  });

  test('a click on the row takes it', async ({ app, page }) => {
    await app.buildClause('CAT', 'EAT');
    await app.setDirectObject('FOOD');
    await page.getByTestId('possessor-ctl-directObject').getByRole('button').click();
    await page.getByTestId('typeahead-noun').fill('dog');
    await page.locator('[data-testid="typeahead-option"][data-concept="DOG"]').click();
    await app.expectSentences({ en: "the cat eats the dog's food." });
  });

  test('a row is highlighted while the list is open', async ({ app, page }) => {
    await app.buildClause('CAT', 'EAT');
    await app.setDirectObject('FOOD');
    await page.getByTestId('possessor-ctl-directObject').getByRole('button').click();
    await page.getByTestId('typeahead-noun').fill('dog');
    await expect(page.locator('[data-testid="typeahead-option"][data-highlighted]')).toHaveCount(1);
    await expect(page.locator('[data-testid="typeahead-option"][data-concept="DOG"]')).toHaveAttribute('data-highlighted', '');
  });

  test('↵ takes the word typed, with the owner opened from its satellite', async ({ app, page }) => {
    await app.buildClause('CAT', 'EAT');
    await app.setDirectObject('FOOD');
    await page.getByTestId('satellite-directObjectPossessor').click();
    await page.getByTestId('typeahead-noun').fill('dog');
    await page.keyboard.press('Enter');
    await app.expectSentences({ en: "the cat eats the dog's food." });
  });
});
