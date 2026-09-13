import { test } from './fixtures';

// The verb's own controls: the tense and aspect toggle boxes (click to cycle), the polarity toggle
// on the verb box border, and the modal chain. Each changes the finite verb the plan carries, a
// path no other spec drives — and one with no unit test between the canvas and the engine, since
// the selection → plan code (selectionToPlan.ts) is only exercised end to end.
test.describe('verb', () => {
  test('tense cycles present → past → future', async ({ app }) => {
    await app.buildClause('CAT', 'EAT');
    await app.setDirectObject('MOUSE');

    await app.cycle('verbTense');
    await app.expectSentences({
      en: 'the cat ate the mouse.',
      it: 'il gatto mangiò il topo.',
      fr: 'le chat mangea la souris.',
      de: 'der Kater aß die Maus.',
      es: 'el gato comió el ratón.',
      pt: 'o gato comeu o rato.',
      ja: '猫はネズミを食べました。',
    });

    await app.cycle('verbTense');
    await app.expectSentences({
      en: 'the cat will eat the mouse.',
      it: 'il gatto mangerà il topo.',
      fr: 'le chat mangera la souris.',
      de: 'der Kater wird die Maus essen.', // periphrastic werden + clause-final infinitive
      es: 'el gato comerá el ratón.',
      pt: 'o gato comerá o rato.',
      ja: '猫はネズミを食べます。', // Japanese future is the non-past (C04)
    });

    // A third click wraps back to the present.
    await app.cycle('verbTense');
    await app.expectSentences({ en: 'the cat eats the mouse.' });
  });

  test('aspect cycles progressive → prospective → resultative', async ({ app }) => {
    await app.buildClause('CAT', 'EAT');
    await app.setDirectObject('MOUSE');

    await app.cycle('verbAspect');
    await app.expectSentences({
      en: 'the cat is eating the mouse.',
      it: 'il gatto sta mangiando il topo.',
      fr: 'le chat est en train de manger la souris.',
      de: 'der Kater isst gerade die Maus.', // German has no progressive; "gerade" stands in (C05)
      es: 'el gato está comiendo el ratón.',
      pt: 'o gato está comendo o rato.',
      ja: '猫はネズミを食べています。',
    });

    await app.cycle('verbAspect');
    await app.expectSentences({
      en: 'the cat is about to eat the mouse.',
      it: 'il gatto sta per mangiare il topo.',
      fr: 'le chat est sur le point de manger la souris.',
      de: 'der Kater ist im Begriff, die Maus zu essen.',
      es: 'el gato está a punto de comer el ratón.',
      pt: 'o gato está prestes a comer o rato.',
      ja: '猫はネズミを食べるところです。',
    });

    // Japanese is left out: its resultative is a documented completive simplification (B05).
    await app.cycle('verbAspect');
    await app.expectSentences({
      en: 'the cat has eaten the mouse.',
      it: 'il gatto ha mangiato il topo.',
      fr: 'le chat a mangé la souris.',
      de: 'der Kater hat die Maus gegessen.',
      es: 'el gato ha comido el ratón.',
      pt: 'o gato comeu o rato.',
    });
  });

  test('the polarity toggle negates the clause', async ({ app }) => {
    await app.buildClause('CAT', 'EAT');
    await app.setDirectObject('MOUSE');

    await app.satellite('verbNegative').click();
    await app.expectSentences({
      en: 'the cat does not eat the mouse.',
      it: 'il gatto non mangia il topo.',
      fr: 'le chat ne mange pas la souris.',
      de: 'der Kater isst die Maus nicht.',
      es: 'el gato no come el ratón.',
      pt: 'o gato não come o rato.',
      ja: '猫はネズミを食べません。',
    });

    await app.satellite('verbNegative').click();
    await app.expectSentences({ en: 'the cat eats the mouse.' });
  });

  test('a second modal chains under the first', async ({ app }) => {
    await app.buildClause('CAT', 'RUN');

    // The outer modal rides the verb box; the inner one's control rides the outer modal's box.
    await app.revealAndPick('verbModal', 'MUST');
    await app.revealAndPick('verbModal2', 'CAN');

    await app.expectSentences({
      en: 'the cat must be able to run.',
      it: 'il gatto deve poter correre.',
      fr: 'le chat doit pouvoir courir.',
      de: 'der Kater muss laufen können.',
      es: 'el gato debe poder correr.',
      pt: 'o gato deve poder correr.',
      ja: '猫は走ることができる必要があります。',
    });
  });
});
