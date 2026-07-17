import { test, expect } from './fixtures';

// Hovering a word in a picker dropdown surfaces the concept's definition in a tooltip.
//
// A definition comes from one of two sources, both keyed by the current UI language and both
// falling back to English:
//   - an engine-composed `definition` plan (CAT → "a small mammal"), rendered from seeded
//     concepts into every language, so the tooltip is localized like the rest of the UI;
//   - the stored `concept_definitions` literal (DOG → "domestic canine animal"), of which only
//     English is seeded.
test.describe('word definition tooltip', () => {
  const tooltip = '.MuiTooltip-tooltip';

  test('shows the definition on hover in the subject picker', async ({ app, page }) => {
    await app.subjectInput.fill('dog');
    const option = page.locator(
      '[data-testid="typeahead-option"][data-concept="DOG"]',
    );
    await expect(option).toBeVisible();

    await option.hover();

    await expect(page.locator(tooltip)).toBeVisible();
    await expect(page.locator(tooltip)).toHaveText('domestic canine animal');
  });

  test('shows the definition on hover in the verb picker', async ({ app, page }) => {
    // The verb slot only becomes active (and its picker rendered) once a subject is chosen.
    await app.setSubject('CAT');
    await app.verbInput.fill('eat');
    const option = page.locator(
      '[data-testid="typeahead-option"][data-concept="EAT"]',
    );
    await expect(option).toBeVisible();

    await option.hover();

    await expect(page.locator(tooltip)).toHaveText('to consume food');
  });

  test('an engine-composed definition renders in the current UI language', async ({
    app,
    page,
  }) => {
    // English: the composed plan (genus MAMMAL + differentia SMALL) supersedes CAT's stored
    // English literal.
    await app.subjectInput.fill('cat');
    const catEn = page.locator(
      '[data-testid="typeahead-option"][data-concept="CAT"]',
    );
    await expect(catEn).toBeVisible();
    await catEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a small mammal');

    // Italian: the same plan, localized by the engine — no Italian literal is stored.
    await app.setUiLanguage('it');
    await app.subjectInput.fill('gatt');
    const catIt = page.locator(
      '[data-testid="typeahead-option"][data-concept="CAT"]',
    );
    await expect(catIt).toBeVisible();
    await catIt.hover();
    await expect(page.locator(tooltip)).toHaveText('un piccolo mammifero');
  });

  test('a genus+differentia noun definition renders (localize-seed A01: BOY)', async ({
    app,
    page,
  }) => {
    // English: composed from PERSON + YOUNG + MALE.
    await app.subjectInput.fill('boy');
    const boyEn = page.locator('[data-testid="typeahead-option"][data-concept="BOY"]');
    await expect(boyEn).toBeVisible();
    await boyEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a young male person');

    // German: the same plan, localized by the engine. (Filling the English label still matches —
    // the picker searches the English label alongside the shown word.)
    await app.setUiLanguage('de');
    await app.subjectInput.fill('boy');
    const boyDe = page.locator('[data-testid="typeahead-option"][data-concept="BOY"]');
    await expect(boyDe).toBeVisible();
    await boyDe.hover();
    await expect(page.locator(tooltip)).toHaveText('eine junge männliche Person');
  });

  test('a genus+differentia noun definition renders (localize-seed A02: YOUNG_MAN)', async ({
    app,
    page,
  }) => {
    // English: composed from PERSON + YOUNG + MALE (shared with BOY).
    await app.subjectInput.fill('young man');
    const youngManEn = page.locator(
      '[data-testid="typeahead-option"][data-concept="YOUNG_MAN"]',
    );
    await expect(youngManEn).toBeVisible();
    await youngManEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a young male person');

    // Italian: the same plan, localized by the engine — no Italian literal is stored.
    await app.setUiLanguage('it');
    await app.subjectInput.fill('young man');
    const youngManIt = page.locator(
      '[data-testid="typeahead-option"][data-concept="YOUNG_MAN"]',
    );
    await expect(youngManIt).toBeVisible();
    await youngManIt.hover();
    await expect(page.locator(tooltip)).toHaveText('una giovane persona maschile');
  });

  test('a genus+differentia noun definition renders (localize-seed A03: YOUNG_WOMAN)', async ({
    app,
    page,
  }) => {
    // English: composed from PERSON + YOUNG + FEMALE.
    await app.subjectInput.fill('young woman');
    const youngWomanEn = page.locator(
      '[data-testid="typeahead-option"][data-concept="YOUNG_WOMAN"]',
    );
    await expect(youngWomanEn).toBeVisible();
    await youngWomanEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a young female person');

    // Italian: the same plan, localized by the engine — no Italian literal is stored.
    await app.setUiLanguage('it');
    await app.subjectInput.fill('young woman');
    const youngWomanIt = page.locator(
      '[data-testid="typeahead-option"][data-concept="YOUNG_WOMAN"]',
    );
    await expect(youngWomanIt).toBeVisible();
    await youngWomanIt.hover();
    await expect(page.locator(tooltip)).toHaveText('una giovane persona femminile');
  });

  test('a genus+differentia noun definition renders (localize-seed A04: CHILD)', async ({
    app,
    page,
  }) => {
    // English: composed from PERSON + YOUNG.
    await app.subjectInput.fill('child');
    const childEn = page.locator(
      '[data-testid="typeahead-option"][data-concept="CHILD"]',
    );
    await expect(childEn).toBeVisible();
    await childEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a young person');

    // Italian: the same plan, localized by the engine — no Italian literal is stored.
    await app.setUiLanguage('it');
    await app.subjectInput.fill('child');
    const childIt = page.locator(
      '[data-testid="typeahead-option"][data-concept="CHILD"]',
    );
    await expect(childIt).toBeVisible();
    await childIt.hover();
    await expect(page.locator(tooltip)).toHaveText('una giovane persona');
  });

  test('a genus+relative-clause noun definition renders (localize-seed A05: CREATOR)', async ({
    app,
    page,
  }) => {
    // English: composed from PERSON + a subject-gap relative clause (MAKE + bare-plural OBJECT_THING).
    await app.subjectInput.fill('creator');
    const creatorEn = page.locator(
      '[data-testid="typeahead-option"][data-concept="CREATOR"]',
    );
    await expect(creatorEn).toBeVisible();
    await creatorEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a person who makes objects');

    // German: the same plan, localized by the engine — the relative clause is comma-set and
    // verb-final. No German literal is stored.
    await app.setUiLanguage('de');
    await app.subjectInput.fill('creator');
    const creatorDe = page.locator(
      '[data-testid="typeahead-option"][data-concept="CREATOR"]',
    );
    await expect(creatorDe).toBeVisible();
    await creatorDe.hover();
    await expect(page.locator(tooltip)).toHaveText('eine Person, die Gegenstände macht');
  });

  test('a literal definition falls back to English under a non-English UI language', async ({
    app,
    page,
  }) => {
    // DOG has no definition plan and only an English literal, so an Italian UI reverts to it.
    await app.setUiLanguage('it');
    await app.subjectInput.fill('cane');
    const option = page.locator(
      '[data-testid="typeahead-option"][data-concept="DOG"]',
    );
    await expect(option).toBeVisible();

    await option.hover();

    await expect(page.locator(tooltip)).toHaveText('domestic canine animal');
  });
});
