import { expect, test } from './fixtures';

// The complements a verb licenses, each revealed from its toggle on the Verb Phrase dotted box.
// The manner adverbial has its own spec (manner.spec.ts); these cover the rest. Where a complement
// carries a relation toolbar (the locative and route specifiers, the cause sentiment), the
// toolbar is driven too, since each value is a separate specifier in the plan.
test.describe('complements', () => {
  test('a predicate adjective agrees with the subject', async ({ app, page }) => {
    await app.buildClause('CAT', 'BECOME');
    await app.satellite('subjectGender').click();

    // The predicative picker opens on nouns; switch it to adjectives before searching. HAPPY, not
    // TIRED: a Japanese た-adjective predicate keeps its attributive ending (疲れたになります, A115).
    await app.satellite('predicative').click();
    const box = page.getByTestId('box-predicative');
    await box.getByRole('button', { name: 'Adjective', exact: true }).click();
    await box.locator('input').fill('happy');
    await page.locator('[data-testid="typeahead-option"][data-concept="HAPPY"]').click();

    await app.expectSentences({
      en: 'the cat becomes happy.',
      it: 'la gatta diventa felice.',
      fr: 'la chatte devient heureuse.', // feminine agreement with the subject
      de: 'die Katze wird glücklich.',
      es: 'la gata se vuelve feliz.',
      pt: 'a gata se torna feliz.',
      ja: '猫は幸せになります。',
    });
  });

  test('a predicate noun under BECOME', async ({ app }) => {
    await app.buildClause('BOY', 'BECOME');
    await app.revealAndPick('predicative', 'LEGEND');

    await app.expectSentences({
      en: 'the boy becomes a legend.',
      it: 'il ragazzo diventa una leggenda.',
      fr: 'le garçon devient une légende.',
      de: 'der Junge wird eine Legende.',
      es: 'el niño se vuelve una leyenda.',
      pt: 'o menino se torna uma lenda.',
      ja: '男の子は伝説になります。',
    });
  });

  test('the terminus renders as the recipient', async ({ app }) => {
    await app.buildClause('MAN', 'GIVE');
    await app.setDirectObject('BOOK');
    await app.revealAndPick('terminus', 'CHILD');

    await app.expectSentences({
      en: 'the man gives the book to the child.',
      it: "l'uomo dà il libro al bambino.",
      fr: "l'homme donne le livre à l'enfant.",
      de: 'der Mann gibt dem Kind das Buch.', // dative recipient before the accusative object
      es: 'el hombre da el libro al niño.',
      pt: 'o homem dá o livro à criança.',
      ja: '男は子供に本をあげます。',
    });
  });

  test('source and direction render as a from → to pair', async ({ app }) => {
    await app.buildClause('CAT', 'RUN');
    await app.revealAndPick('source', 'HOUSE');
    await app.revealAndPick('direction', 'MARKET');

    await app.expectSentences({
      en: 'the cat runs from the house to the market.',
      it: 'il gatto corre via dalla casa al mercato.', // Romance prefixes an ablative adverb
      fr: 'le chat court loin de la maison au marché.',
      de: 'der Kater läuft aus dem Haus zum Markt.',
      es: 'el gato corre lejos de la casa al mercado.',
      pt: 'o gato corre longe da casa ao mercado.',
      ja: '猫は家から市場へ走ります。',
    });
  });

  // A prepositional complement coordinates like the subject does. The goal is the hard case: its
  // conjuncts differ in animacy, so Italian needs a different preposition for each ("dal bambino
  // e alla casa"), while English shares its one ("to the child and the house").
  test('a direction coordinates, each goal taking its own preposition', async ({ app, page }) => {
    await app.buildClause('CAT', 'RUN');
    await app.revealAndPick('direction', 'CHILD');

    await app.satellite('directionConjunct').click();
    await page.getByTestId('typeahead-subject').last().fill('house');
    await page.locator('[data-testid="typeahead-option"][data-concept="HOUSE"]').click();

    await app.expectSentences({
      en: 'the cat runs to the child and the house.',
      it: 'il gatto corre dal bambino e alla casa.',
      fr: "le chat court vers l'enfant et à la maison.",
      de: 'der Kater läuft zum Kind und zum Haus.',
      es: 'el gato corre hacia el niño y a la casa.',
      pt: 'o gato corre para a criança e à casa.',
      ja: '猫は子供と家へ走ります。',
    });
  });

  test('the route takes its relation from the specifier toolbar', async ({ app, page }) => {
    await app.buildClause('CAT', 'RUN');
    await app.revealAndPick('route', 'HOUSE');
    await app.expectSentences({ en: 'the cat runs through the house.' });

    await page.getByRole('button', { name: 'around', exact: true }).click();
    await app.expectSentences({
      en: 'the cat runs around the house.',
      it: 'il gatto corre intorno alla casa.',
      fr: 'le chat court autour de la maison.',
      de: 'der Kater läuft um das Haus.',
      es: 'el gato corre alrededor de la casa.',
      pt: 'o gato corre ao redor da casa.',
      ja: '猫は家の周りを走ります。',
    });
  });

  test('the locative takes its relation from the specifier toolbar', async ({ app, page }) => {
    await app.buildClause('CAT', 'RUN');
    await app.revealAndPick('locative', 'HOUSE');
    await app.expectSentences({
      en: 'the cat runs in the house.',
      it: 'il gatto corre nella casa.',
      de: 'der Kater läuft im Haus.',
      ja: '猫は家で走ります。',
    });

    await page.getByRole('button', { name: 'behind', exact: true }).click();
    await app.expectSentences({
      en: 'the cat runs behind the house.',
      it: 'il gatto corre dietro la casa.',
      fr: 'le chat court derrière la maison.',
      de: 'der Kater läuft hinter dem Haus.',
      es: 'el gato corre detrás de la casa.',
      pt: 'o gato corre atrás da casa.',
      ja: '猫は家の後ろで走ります。',
    });
  });

  test('the cause takes its stance from the sentiment toolbar', async ({ app, page }) => {
    await app.buildClause('CAT', 'RUN');
    await app.revealAndPick('cause', 'DOG');
    await app.expectSentences({ en: 'the cat runs because of the dog.' });

    // German "dank" takes the dative, standard beside its genitive; "wegen" takes the genitive (B09).
    await page.getByRole('button', { name: 'Positive — thanks to' }).click();
    await app.expectSentences({
      en: 'the cat runs thanks to the dog.',
      it: 'il gatto corre grazie al cane.',
      fr: 'le chat court grâce au chien.',
      de: 'der Kater läuft dank dem Hund.',
      es: 'el gato corre gracias al perro.',
      pt: 'o gato corre graças ao cão.',
      ja: '猫は犬のおかげで走ります。',
    });
  });

  // The cause's connector fuses only the definite article ("a causa del cane"); any other
  // determiner follows it unfused, and "no" brings the Romance preverbal negator with it.
  test('the cause takes a determiner', async ({ app }) => {
    await app.buildClause('CAT', 'RUN');
    await app.revealAndPick('cause', 'DOG');

    await app.setDeterminer('cause', 'Indefinite');
    await app.expectSentences({
      en: 'the cat runs because of a dog.',
      it: 'il gatto corre a causa di un cane.',
      fr: "le chat court à cause d'un chien.",
      de: 'der Kater läuft wegen eines Hundes.',
      es: 'el gato corre a causa de un perro.',
      pt: 'o gato corre por causa de um cão.',
    });

    await app.setDeterminer('cause', 'Negative');
    await app.expectSentences({
      en: 'the cat runs because of no dog.',
      it: 'il gatto non corre a causa di nessun cane.',
      fr: "le chat ne court à cause d'aucun chien.",
      de: 'der Kater läuft wegen keines Hundes.',
      es: 'el gato no corre a causa de ningún perro.',
      pt: 'o gato não corre por causa de nenhum cão.',
      ja: '猫はどの犬のためにも走りません。',
    });
  });

  // P09-E12b. The temporal and the purpose are offered on every verb (RUN and READ license
  // neither); the topic only where the verb licenses it (THINK). The temporal's relation is a
  // toolbar like the route's, `at` until one is chosen.
  test('the temporal takes its relation from its toolbar', async ({ app, page }) => {
    await app.buildClause('MAN', 'RUN');
    await app.revealAndPick('temporal', 'DAY');
    await app.expectSentences({ en: 'the man runs on the day.' });
    await expect(page.getByTestId('temporal-toolbar')).toBeVisible();

    await page.getByRole('button', { name: 'during', exact: true }).click();
    await app.expectSentences({
      en: 'the man runs during the day.',
      it: "l'uomo corre durante il giorno.",
      fr: "l'homme court pendant le jour.",
      de: 'der Mann läuft während des Tages.', // "während" governs the genitive
      es: 'el hombre corre durante el día.',
      pt: 'o homem corre durante o dia.',
      ja: '男は日の間に走ります。',
    });

    // P09-E27, E34, E35: the toolbar's last three. The duration takes no adposition in German
    // (a bare accusative) or Japanese (a bare measure).
    await page.getByRole('button', { name: 'since', exact: true }).click();
    await app.expectSentences({ en: 'the man runs since the day.', de: 'der Mann läuft seit dem Tag.', ja: '男は日から走ります。' });
    await page.getByRole('button', { name: 'within', exact: true }).click();
    await app.expectSentences({ en: 'the man runs within the day.', de: 'der Mann läuft innerhalb des Tages.' });
    await page.getByRole('button', { name: 'for', exact: true }).click();
    await app.expectSentences({
      en: 'the man runs for the day.',
      it: "l'uomo corre per il giorno.",
      de: 'der Mann läuft den Tag.',
      ja: '男は日走ります。',
    });
  });

  test('the purpose names who the act is for, on a verb that licenses none', async ({ app }) => {
    await app.buildClause('WOMAN', 'READ');
    await app.revealAndPick('purpose', 'MAN');

    await app.expectSentences({
      en: 'the woman reads for the man.',
      it: "la donna legge per l'uomo.",
      fr: "la femme lit pour l'homme.",
      de: 'die Frau liest für den Mann.',
      es: 'la mujer lee para el hombre.',
      pt: 'a mulher lê para o homem.',
      ja: '女は男のために読みます。',
    });
  });

  test('the topic, where the verb licenses one', async ({ app }) => {
    await app.buildClause('WOMAN', 'THINK');
    await app.revealAndPick('topic', 'CAT');

    await app.expectSentences({
      en: 'the woman thinks about the cat.',
      it: 'la donna pensa al gatto.',
      fr: 'la femme pense au chat.',
      de: 'die Frau denkt an den Kater.',
      es: 'la mujer piensa en el gato.',
      pt: 'a mulher pensa no gato.',
      ja: '女は猫について考えます。',
    });
  });

  // P09-E44. The capacity the subject acts in, where the verb licenses it (ACT). Nothing infers its
  // gender from the subject, so the feminine is the box's own chip; six languages print it bare.
  test('the role, with the gender its own chip gives it', async ({ app }) => {
    await app.buildClause('WOMAN', 'ACT');
    await app.revealAndPick('role', 'FRIEND');
    await app.expectSentences({ en: 'the woman acts as a friend.', it: 'la donna agisce come amico.' });

    await app.satellite('roleGender').click();
    await app.expectSentences({
      en: 'the woman acts as a friend.',
      it: 'la donna agisce come amica.',
      fr: 'la femme agit comme amie.',
      de: 'die Frau handelt als Freundin.',
      es: 'la mujer actúa como amiga.',
      pt: 'a mulher age como amiga.',
      ja: '女は友達として行動します。',
    });
  });
});

// The instrumental is the one complement with no box on the verb's canvas: its noun phrase lives in
// a period of its own, linked from the verb's instrumental control, and that period's level switch
// decides whether it is a thing ("with the stick") or an act ("by choosing the word").
test.describe('instrumental', () => {
  test('a linked noun period renders as the instrument', async ({ app }) => {
    await app.buildClauseIn(0, 'MAN', 'CUT');
    await app.setDirectObjectIn(0, 'BOOK');

    // The instrument period holds only a noun: at the default `object` level it is a noun phrase.
    await app.addPeriod();
    await app.period(1).getByTestId('typeahead-subject').fill('stick');
    await app.page.locator('[data-testid="typeahead-option"][data-concept="STICK"]').click();

    await app.linkInstrument(0, 1);
    await app.expectSentences({
      en: 'the man cuts the book with the stick.',
      it: "l'uomo taglia il libro con il bastone.",
      fr: "l'homme coupe le livre avec le bâton.",
      de: 'der Mann schneidet das Buch mit dem Stock.',
      es: 'el hombre corta el libro con el palo.',
      pt: 'o homem corta o livro com o pau.',
      ja: '男は棒で本を切ります。',
    });
  });

  test('the process level renders the instrument as an act', async ({ app }) => {
    await app.buildClauseIn(0, 'BOY', 'START');
    await app.setDirectObjectIn(0, 'TRANSLATION');
    await app.addPeriod();
    await app.linkInstrument(0, 1);

    // Switching to `process` swaps the instrument period's canvas for a verb and its object.
    const instrument = app.period(1);
    await instrument.getByText('Process', { exact: true }).click();
    await instrument.getByTestId('box-verb').click();
    await instrument.getByTestId('typeahead-verb').fill('choose');
    await app.page.locator('[data-testid="typeahead-option"][data-concept="CHOOSE"]').click();
    // The box is activated by its title: an empty object box wears the Noun | Pronoun switch
    // across its middle, and the switch takes the pointer for itself.
    await instrument.getByTestId('box-directObject').getByText('Object', { exact: true }).click();
    await instrument.getByTestId('typeahead-noun').fill('word');
    await app.page.locator('[data-testid="typeahead-option"][data-concept="WORD"]').click();

    // German is left out: its means clause is a documented impersonal-"man" simplification (B06).
    await app.expectSentences({
      en: 'the boy starts the translation by choosing the word.',
      it: 'il ragazzo inizia la traduzione scegliendo la parola.',
      fr: 'le garçon commence la traduction en choisissant le mot.',
      es: 'el niño empieza la traducción eligiendo la palabra.',
      pt: 'o menino começa a tradução escolhendo a palavra.',
      ja: '男の子は単語を選んで翻訳を始めます。',
    });

    // The `concept` level names the same act instead.
    await instrument.getByText('Concept', { exact: true }).click();
    await app.expectSentences({
      en: 'the boy starts the translation with the choosing of the word.',
      it: 'il ragazzo inizia la traduzione con lo scegliere la parola.',
      de: 'der Junge beginnt die Übersetzung mit dem Wählen des Wortes.',
    });
  });
});
