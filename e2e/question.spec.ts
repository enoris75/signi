import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';

// The border's toggle — the rings' question marks go by the same name, so it is found in its stack.
const border = (page: Page) =>
  page.getByTestId('period-border-controls').getByRole('button', { name: 'Question', exact: true });

// P09-E12 M5–M7: the question, the third mood on the card's border; the slot a wh-question asks
// about, marked on that slot's own dotted ring with its who / what; and the existential on the
// subject's ring. Each is asserted as rendered sentences.
test.describe('the question', () => {
  test('the border toggle asks a yes/no question, and a command takes it back', async ({ app, page }) => {
    await app.buildClause('CAT', 'EAT');
    await app.setDirectObject('FOOD');
    await border(page).click();

    await expect(border(page)).toHaveAttribute('aria-pressed', 'true');
    await app.expectSentences({
      en: 'does the cat eat the food?',
      it: 'il gatto mangia il cibo?',
      fr: 'est-ce que le chat mange la nourriture ?',
      de: 'frisst der Kater das Essen?',
      es: '¿el gato come la comida?',
      pt: 'o gato come a comida?',
      ja: '猫は食べ物を食べますか？',
    });

    // The three moods exclude each other.
    await page.getByRole('button', { name: 'Command', exact: true }).click();
    await expect(border(page)).toHaveAttribute('aria-pressed', 'false');
    await app.expectSentences({ en: 'eat the food.' });
  });

  test('the mark on the object’s ring asks what, and its chip asks who', async ({ app, page }) => {
    await app.buildClause('CAT', 'SEE');
    await app.setDirectObject('FOOD');
    await app.satellite('directObjectQuestion').click();

    await expect(border(page)).toHaveAttribute('aria-pressed', 'true');
    await app.expectSentences({
      en: 'what does the cat see?',
      de: 'was sieht der Kater?',
      es: '¿qué ve el gato?',
    });

    await app.satellite('directObjectQuestionAnimate').click();
    await app.expectSentences({
      en: 'who does the cat see?',
      it: 'chi vede il gatto?',
      fr: 'qui est-ce que le chat voit ?',
      de: 'wen sieht der Kater?',
      es: '¿a quién ve el gato?',
      pt: 'quem o gato vê?',
      ja: '猫は誰を見ますか？',
    });

    // Unmarking takes the question with it: no yes/no is left behind.
    await app.satellite('directObjectQuestion').click();
    await app.expectSentences({ en: 'the cat sees the food.' });
  });

  test('the existential on the subject’s ring says there is', async ({ app, page }) => {
    await app.buildClause('CAT', 'BE');
    await app.revealAndPick('locative', 'HOUSE');
    await app.setDeterminer('subject', 'Indefinite');
    await app.satellite('subjectExistential').click();

    await app.expectSentences({
      en: 'there is a cat in the house.',
      it: "c'è un gatto nella casa.",
      fr: 'il y a un chat dans la maison.',
      de: 'es gibt einen Kater im Haus.',
      es: 'hay un gato en la casa.',
      pt: 'há um gato na casa.',
      ja: '家に猫がいます。',
    });

    // A question of it: "is there a cat in the house?".
    await border(page).click();
    await app.expectSentences({ en: 'is there a cat in the house?', de: 'gibt es einen Kater im Haus?' });
  });
});
