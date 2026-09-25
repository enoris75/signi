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

  // P09-E53: the mark on a box that keeps its relation, which is chosen on the empty asked box.
  test('an empty place asked under its relation asks "under what"', async ({ app, page }) => {
    await app.buildClause('CAT', 'EAT');
    await app.satellite('locative').click();
    await page.keyboard.press('Escape');
    await app.satellite('locativeQuestion').click();
    await app.expectSentences({ en: 'where does the cat eat?' });

    await page.getByTestId('specifier-toolbar').getByRole('button', { name: 'under', exact: true }).click();
    await app.expectSentences({
      en: 'what does the cat eat under?',
      it: 'sotto che cosa mangia il gatto?',
      fr: 'sous quoi est-ce que le chat mange ?',
      de: 'worunter frisst der Kater?',
      es: '¿debajo de qué come el gato?',
      pt: 'debaixo de que o gato come?',
      ja: '猫は何の下で食べますか？',
    });
  });

  test('the companion asks what, and its chip asks who', async ({ app, page }) => {
    await app.buildClause('CAT', 'RUN');
    await app.satellite('comitative').click();
    await page.keyboard.press('Escape');
    await app.satellite('comitativeQuestion').click();
    await app.expectSentences({
      en: 'what does the cat run with?',
      it: 'con che cosa corre il gatto?',
      de: 'womit läuft der Kater?',
    });

    await app.satellite('comitativeQuestionAnimate').click();
    await app.expectSentences({
      en: 'who does the cat run with?',
      it: 'con chi corre il gatto?',
      fr: 'avec qui est-ce que le chat court ?',
      de: 'mit wem läuft der Kater?',
      es: '¿con quién corre el gato?',
      pt: 'com quem o gato corre?',
      ja: '猫は誰と走りますか？',
    });
  });

  // P09-E53 §Implementation 2: the mark, its chip and the relation toolbar share the direction's
  // dotted ring with its other controls, each clear of the others.
  test('the asked direction keeps its ring’s controls apart', async ({ app, page }) => {
    await app.buildClause('CAT', 'GO');
    await app.revealAndPick('direction', 'HOUSE');
    await app.satellite('directionQuestion').click();
    await expect(app.satellite('directionQuestionAnimate')).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(async () => {
      const centers = await page.evaluate(() =>
        [...document.querySelectorAll('[data-testid^="satellite-direction"], [data-testid="direction-toolbar"] button')]
          .map((el) => el.getBoundingClientRect())
          .filter((r) => r.width > 0)
          .map((r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 })),
      );
      expect(centers.length).toBeGreaterThanOrEqual(8);
      for (let i = 0; i < centers.length; i++)
        for (let j = i + 1; j < centers.length; j++)
          expect(Math.hypot(centers[i].x - centers[j].x, centers[i].y - centers[j].y)).toBeGreaterThanOrEqual(19.5);
    }).toPass({ timeout: 5000 });
    await app.expectSentences({ en: 'where does the cat go?', de: 'wohin geht der Kater?' });
  });

  // P09-E54: every mark stays in the passive, and an asked object is the patient.
  test('the passive asks its patient and its agent', async ({ app }) => {
    await app.buildClause('CAT', 'EAT');
    await app.setDirectObject('FOOD');
    await app.satellite('directObjectQuestion').click();
    await app.cycle('verbVoice');
    await app.expectSentences({
      en: 'what is eaten by the cat?',
      it: 'che cosa è mangiato dal gatto?',
      fr: 'qu\'est-ce qui est mangé par le chat ?',
      de: 'was wird vom Kater gefressen?',
      es: '¿qué es comido por el gato?',
      pt: 'o que é comido pelo gato?',
      ja: '何が猫に食べられますか？',
    });

    // The agent: the object's word comes back, and the subject's mark asks who.
    await app.satellite('directObjectQuestion').click();
    await app.satellite('subjectQuestion').click();
    await app.satellite('subjectQuestionAnimate').click();
    await app.expectSentences({
      en: 'who is the food eaten by?',
      it: 'da chi è mangiato il cibo?',
      fr: 'par qui est-ce que la nourriture est mangée ?',
      de: 'von wem wird das Essen gegessen?',
      es: '¿por quién es comida la comida?',
      pt: 'por quem a comida é comida?',
      ja: '食べ物は誰に食べられますか？',
    });
  });

  // P09-E52: whose, marked on the owner's own ring — the mark itself, or Q on the owner's box.
  test('the object’s empty owner ring asks whose', async ({ app, page }) => {
    await app.buildClause('CAT', 'EAT');
    await app.setDirectObject('FOOD');
    await page.getByTestId('possessor-ctl-directObject').getByRole('button').click();
    // The empty owner ring is its word picker, and its mark asks whose.
    await app.satellite('possessorQuestion').click();
    await app.expectSentences({
      en: 'whose food does the cat eat?',
      it: 'di chi mangia il cibo il gatto?',
      fr: 'de qui est-ce que le chat mange la nourriture ?',
      de: 'wessen Essen frisst der Kater?',
      es: '¿de quién come el gato la comida?',
      pt: 'de quem o gato come a comida?',
      ja: '猫は誰の食べ物を食べますか？',
    });
  });

  test('Q on the owner’s box asks whose, and keeps its word unspoken', async ({ app, page }) => {
    await app.buildClause('CAT', 'EAT');
    await app.setDirectObject('FOOD');
    await page.getByTestId('possessor-ctl-directObject').getByRole('button').click();
    await page.getByTestId('typeahead-noun').fill('dog');
    await page.locator('[data-testid="typeahead-option"][data-concept="DOG"]').click();
    await app.expectSentences({ en: "the cat eats the dog's food." });
    // The cursor stays on the word just chosen, the owner's.
    await page.keyboard.press('q');
    await app.expectSentences({ en: 'whose food does the cat eat?', de: 'wessen Essen frisst der Kater?' });

    // The mark itself takes it back, and the word is spoken again.
    await app.satellite('possessorQuestion').click();
    await app.expectSentences({ en: "the cat eats the dog's food." });
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
