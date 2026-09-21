import { expect, test } from './fixtures';

// The verb's own controls: the tense and aspect toggle boxes (click to cycle), the polarity toggle
// on the verb box border, and the modal chain. Each changes the finite verb the plan carries, a
// path no other spec drives. The selection → plan step has unit tests of its own
// (packages/frontend/test/selectionToPlan); this spec checks the canvas and the engines agree with it.
test.describe('verb', () => {
  test('tense cycles present → past → future', async ({ app }) => {
    await app.buildClause('CAT', 'EAT');
    await app.setDirectObject('MOUSE');

    await app.cycle('verbTense');
    await app.expectSentences({
      en: 'the cat ate the mouse.',
      it: 'il gatto mangiò il topo.',
      fr: 'le chat mangea la souris.',
      de: 'der Kater fraß die Maus.',
      es: 'el gato comió el ratón.',
      pt: 'o gato comeu o rato.',
      ja: '猫はネズミを食べました。',
    });

    await app.cycle('verbTense');
    await app.expectSentences({
      en: 'the cat will eat the mouse.',
      it: 'il gatto mangerà il topo.',
      fr: 'le chat mangera la souris.',
      de: 'der Kater wird die Maus fressen.', // periphrastic werden + clause-final infinitive
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
      de: 'der Kater frisst gerade die Maus.', // German has no progressive; "gerade" stands in (C05)
      es: 'el gato está comiendo el ratón.',
      pt: 'o gato está comendo o rato.',
      ja: '猫はネズミを食べています。',
    });

    await app.cycle('verbAspect');
    await app.expectSentences({
      en: 'the cat is about to eat the mouse.',
      it: 'il gatto sta per mangiare il topo.',
      fr: 'le chat est sur le point de manger la souris.',
      de: 'der Kater ist im Begriff, die Maus zu fressen.',
      es: 'el gato está a punto de comer el ratón.',
      pt: 'o gato está prestes a comer o rato.',
      ja: '猫はネズミを食べるところです。',
    });

    // Japanese says the present perfect with the past, as Portuguese does (B05).
    await app.cycle('verbAspect');
    await app.expectSentences({
      en: 'the cat has eaten the mouse.',
      it: 'il gatto ha mangiato il topo.',
      fr: 'le chat a mangé la souris.',
      de: 'der Kater hat die Maus gefressen.',
      es: 'el gato ha comido el ratón.',
      pt: 'o gato comeu o rato.',
      ja: '猫はネズミを食べました。',
    });
  });

  // A01. The voice satellite is there only on a transitive verb that has an object to promote, so
  // this is also the check that the gate lets it through; the canvas then has to agree with the
  // translations about which box is the subject.
  test('voice cycles active → passive, and the boxes change their names with it', async ({ app, page }) => {
    await app.buildClause('CAT', 'EAT');
    await app.setDirectObject('MOUSE');
    // A box's text starts with its caption, then its word.
    const subjectBox = page.getByTestId('box-subject');
    const objectBox = page.getByTestId('box-directObject');
    await expect(subjectBox).toHaveText(/^Subject/);
    await expect(objectBox).toHaveText(/^Object/);

    await app.cycle('verbVoice');
    await app.expectSentences({
      en: 'the mouse is eaten by the cat.',
      it: 'il topo è mangiato dal gatto.',
      fr: 'la souris est mangée par le chat.',
      de: 'die Maus wird vom Kater gefressen.',
      es: 'el ratón es comido por el gato.',
      pt: 'o rato é comido pelo gato.',
      ja: 'ネズミは猫に食べられます。',
    });
    // The patient is the subject now, and the box still holding the agent says so.
    await expect(subjectBox).toHaveText(/^Agent/);
    await expect(objectBox).toHaveText(/^Subject/);
    // Only the captions change: each ring is still stored under the name it had, which is what its
    // collapse state and its place in a tidied row are keyed by (A19).
    await expect(app.groupBox('Subject')).toBeVisible();
    await expect(app.groupBox('Direct Object')).toBeVisible();

    // Cycling back restores the active clause and the names it had.
    await app.cycle('verbVoice');
    await app.expectSentences({ en: 'the cat eats the mouse.' });
    await expect(subjectBox).toHaveText(/^Subject/);
    await expect(objectBox).toHaveText(/^Object/);
  });

  // A19. The passive's agent and the voice box came after the catalog's control families, so their
  // controls said "Clear Agent" and "Hide Diatesi" whatever the interface language. Each is named
  // here in Italian, and each still does what it says.
  test('names the passive’s agent and the voice box in the interface language', async ({ app, page }) => {
    await app.buildClause('CAT', 'EAT');
    await app.setDirectObject('MOUSE');
    await app.cycle('verbVoice');
    await app.expectSentences({ en: 'the mouse is eaten by the cat.' });
    await app.setUiLanguage('it');

    // Cycling opened the voice box, so its control offers to hide it; hidden, it names the value.
    const voiceBox = page.getByTestId('box-verbVoice');
    await expect(app.satellite('verbVoice')).toHaveAttribute('aria-label', 'Nascondi la diatesi');
    await app.satellite('verbVoice').click();
    await expect(voiceBox).toHaveCount(0);
    await expect(app.satellite('verbVoice')).toHaveAttribute('aria-label', 'Diatesi: Passiva');
    await app.satellite('verbVoice').click();
    await expect(voiceBox).toBeVisible();
    await expect(app.satellite('verbVoice')).toHaveAttribute('aria-label', 'Nascondi la diatesi');

    // The agent's ring folds its own satellites away, and the patient's ring — the subject now —
    // folds its own, not the agent's.
    const agentDeterminer = page.getByTestId('box-subjectDefiniteness');
    const patientDeterminer = page.getByTestId('box-directObjectDefiniteness');
    await app.satellite('subjectDefiniteness').click();
    await app.satellite('directObjectDefiniteness').click();
    await expect(agentDeterminer).toBeVisible();
    await expect(patientDeterminer).toBeVisible();
    await page.getByRole('button', { name: "Compatta l'agente", exact: true }).click();
    await expect(agentDeterminer).toHaveCount(0);
    await expect(patientDeterminer).toBeVisible();
    await page.getByRole('button', { name: "Espandi l'agente", exact: true }).click();
    await expect(agentDeterminer).toBeVisible();
    await page.getByRole('button', { name: 'Compatta il soggetto', exact: true }).click();
    await expect(patientDeterminer).toHaveCount(0);
    await expect(agentDeterminer).toBeVisible();
    await page.getByRole('button', { name: 'Espandi il soggetto', exact: true }).click();
    await expect(patientDeterminer).toBeVisible();

    // Clearing the agent empties its box, which keeps its caption.
    await page.getByRole('button', { name: "Cancella l'agente", exact: true }).click();
    await expect(page.getByTestId('box-subject')).toHaveText(/^Agente \*.*vuoto$/);
    await expect(page.getByRole('button', { name: "Cancella l'agente", exact: true })).toHaveCount(0);
  });

  test('the polarity toggle negates the clause', async ({ app }) => {
    await app.buildClause('CAT', 'EAT');
    await app.setDirectObject('MOUSE');

    await app.satellite('verbNegative').click();
    await app.expectSentences({
      en: 'the cat does not eat the mouse.',
      it: 'il gatto non mangia il topo.',
      fr: 'le chat ne mange pas la souris.',
      de: 'der Kater frisst die Maus nicht.',
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
