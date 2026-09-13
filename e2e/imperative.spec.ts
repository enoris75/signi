import { test, expect } from './fixtures';

// The imperative toggle on the Period Container turns the period into a command: the subject box
// becomes the command box, which asks for the register (order / instruction) and, for an order, the
// person the verb agrees with. The subject is dropped from every surface but still selects the
// form, so each choice here is a different plan — asserted as rendered sentences.
test.describe('imperative', () => {
  const toggle = 'Toggle imperative (command)';

  test('a command drops the subject and withdraws tense, aspect and modals', async ({ app, page }) => {
    await page.getByLabel(toggle).click();
    await app.setVerb('EAT');
    await app.setDirectObject('FOOD');

    await app.expectSentences({
      en: 'eat the food.',
      it: 'mangia il cibo.',
      fr: 'mange la nourriture.',
      de: 'iss das Essen.',
      es: 'come la comida.',
      pt: 'coma a comida.',
      ja: '食べ物を食べてください。',
    });

    // A command is present, neutral and modal-free, so those controls are gone; polarity stays.
    await expect(app.satellite('verbTense')).toHaveCount(0);
    await expect(app.satellite('verbAspect')).toHaveCount(0);
    await expect(app.satellite('verbModal')).toHaveCount(0);
    await expect(app.satellite('verbNegative')).toBeVisible();
  });

  test('a negative command', async ({ app, page }) => {
    await page.getByLabel(toggle).click();
    await app.setVerb('EAT');
    await app.setDirectObject('FOOD');
    await app.satellite('verbNegative').click();

    await app.expectSentences({
      en: 'do not eat the food.',
      it: 'non mangiare il cibo.', // the 2sg prohibitive is "non" + infinitive
      fr: 'ne mange pas la nourriture.',
      de: 'iss das Essen nicht.',
      es: 'no comas la comida.', // the prohibitive takes the subjunctive
      pt: 'não coma a comida.',
      ja: '食べ物を食べるな。', // the plain prohibitive ～な
    });
  });

  test('the person row picks the cohortative and the plural', async ({ app, page }) => {
    await page.getByLabel(toggle).click();
    await app.setVerb('RUN');

    await page.getByRole('button', { name: 'first plural' }).click();
    await app.expectSentences({
      en: "let's run.",
      it: 'corriamo.',
      fr: 'courons.',
      de: 'laufen wir.',
      es: 'corramos.',
      pt: 'corramos.',
      ja: '走りましょう。',
    });

    await page.getByRole('button', { name: 'second plural' }).click();
    await app.expectSentences({
      en: 'run.',
      it: 'correte.',
      fr: 'courez.',
      de: 'lauft.',
      es: 'corred.',
      pt: 'corram.',
      ja: '走ってください。',
    });
  });

  test('the instruction register renders outside the imperative', async ({ app, page }) => {
    await page.getByLabel(toggle).click();
    await app.setVerb('RUN');

    // An instruction is addressed to nobody, so the person row goes away.
    await page.getByRole('button', { name: 'Instruction', exact: true }).click();
    await expect(page.getByRole('button', { name: 'first plural' })).toHaveCount(0);

    // Japanese is left out: it renders the verbal noun, a separate, deliberate choice (C03).
    await app.expectSentences({
      en: 'run.',
      it: 'corri.', // Italian labels instructions with the imperative (C02)
      fr: 'courir.',
      de: 'laufen.',
      es: 'correr.',
      pt: 'correr.',
    });
  });
});
