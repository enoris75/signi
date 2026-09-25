import { test, expect } from './fixtures';

// A noun's own controls: the number and gender toggles on its box border, the determiner menu,
// the adjective chain, the pronoun chooser, and coordination. Each writes a field of the noun
// phrase in the plan, and agreement is how the sentence shows it arrived — verb number, article
// gender, adjective endings.
test.describe('noun phrase', () => {
  test('the number toggle pluralises the subject and the verb agrees', async ({ app }) => {
    await app.buildClause('CAT', 'EAT');
    await app.setDirectObject('MOUSE');

    await app.satellite('subjectNumber').click();
    await app.expectSentences({
      en: 'the cats eat the mouse.',
      it: 'i gatti mangiano il topo.',
      fr: 'les chats mangent la souris.',
      de: 'die Kater fressen die Maus.',
      es: 'los gatos comen el ratón.',
      pt: 'os gatos comem o rato.',
      ja: '猫はネズミを食べます。', // Japanese marks no number
    });

    await app.satellite('subjectNumber').click();
    await app.expectSentences({ en: 'the cat eats the mouse.' });
  });

  test('the gender toggle switches a gendered noun to its feminine lexeme', async ({ app }) => {
    await app.buildClause('CAT', 'EAT');
    await app.setDirectObject('MOUSE');

    await app.satellite('subjectGender').click();
    await app.expectSentences({
      en: 'the cat eats the mouse.',
      it: 'la gatta mangia il topo.',
      fr: 'la chatte mange la souris.',
      de: 'die Katze frisst die Maus.',
      es: 'la gata come el ratón.',
      pt: 'a gata come o rato.',
    });
  });

  test('adjectives chain on the subject and the object, and agree with each head', async ({ app }) => {
    await app.buildClause('DOG', 'SEE');
    await app.setDirectObject('CAT');

    // Adjective 2's control only appears on Adjective 1's box once that box holds a word.
    await app.revealAndPick('subjectAdjective', 'BIG');
    await app.revealAndPick('subjectAdjective2', 'BROWN');
    await app.revealAndPick('directObjectAdjective', 'SMALL');

    await app.expectSentences({
      en: 'the big brown dog sees the small cat.',
      it: 'il grande cane marrone vede il piccolo gatto.',
      fr: 'le grand chien brun voit le petit chat.',
      de: 'der große braune Hund sieht den kleinen Kater.',
      es: 'el perro grande y marrón ve el gato pequeño.',
      pt: 'o cão grande e castanho vê o gato pequeno.',
      ja: '大きい茶色の犬は小さい猫を見ます。',
    });
  });

  test('the determiner menu sets an article and a quantifier', async ({ app }) => {
    await app.buildClause('DOG', 'SEE');
    await app.setDirectObject('CAT');
    await app.revealAndPick('directObjectAdjective', 'SMALL');

    await app.setDeterminer('subject', 'Indefinite');
    await app.expectSentences({ en: 'a dog sees the small cat.' });

    // A quantifier like "many" also forces the plural — and the adjective follows it.
    await app.setDeterminer('directObject', 'Multal');
    await app.expectSentences({
      en: 'a dog sees many small cats.',
      it: 'un cane vede molti piccoli gatti.',
      fr: 'un chien voit beaucoup de petits chats.',
      de: 'ein Hund sieht viele kleine Kater.',
      es: 'un perro ve muchos gatos pequeños.',
      pt: 'um cão vê muitos gatos pequenos.',
      ja: '犬は多くの小さい猫を見ます。',
    });
  });

  test('a personal pronoun subject from the pronoun chooser', async ({ app }) => {
    await app.setPronounSubject('third', 'singular', 'female');
    await app.setVerb('SEE');
    await app.setDirectObject('DOG');

    await app.expectSentences({
      en: 'she sees the dog.',
      it: 'vede il cane.', // pro-drop
      fr: 'elle voit le chien.',
      de: 'sie sieht den Hund.',
      es: 've el perro.',
      pt: 'vê o cão.',
      ja: '彼女は犬を見ます。',
    });
  });

  test('a second-person plural pronoun subject', async ({ app }) => {
    await app.setPronounSubject('second', 'plural', 'male');
    await app.setVerb('RUN');

    await app.expectSentences({
      en: 'you run.',
      it: 'correte.',
      fr: 'vous courez.',
      de: 'ihr lauft.',
      es: 'corréis.',
      pt: 'correm.',
      ja: 'あなたたちは走ります。',
    });
  });

  // The object box takes a pronoun on the same footing as the subject, and the engines then do what
  // each language does with one: English and German leave it after the verb in its accusative form,
  // the Romance languages move it in front of the finite verb as a clitic, Japanese marks it with を.
  test('a personal pronoun direct object cliticises where the language wants it', async ({ app }) => {
    await app.setPronounSubject('first', 'singular', 'male');
    await app.setVerb('SEE');
    await app.setPronounObject('second', 'singular', 'male');

    await app.expectSentences({
      en: 'I see you.',
      it: 'ti vedo.', // pro-drop subject, proclitic object
      fr: 'je te vois.',
      de: 'ich sehe dich.',
      es: 'te veo.',
      pt: 'te vejo.',
      ja: '私はあなたを見ます。',
    });
  });

  test('the gender toggle picks the third-person object clitic, and no article rides it', async ({
    app,
  }) => {
    await app.buildClause('CAT', 'SEE');
    await app.setPronounObject('third', 'singular', 'female');

    await app.expectSentences({
      en: 'the cat sees her.',
      it: 'il gatto la vede.',
      fr: 'le chat la voit.',
      de: 'der Kater sieht sie.',
      es: 'el gato la ve.',
      pt: 'o gato a vê.',
      ja: '猫は彼女を見ます。',
    });

    // What a pronoun head has: number and gender (and coordination). What it has not: the controls
    // that only a noun phrase can wear.
    await expect(app.satellite('directObjectNumber')).toBeVisible();
    await expect(app.satellite('directObjectGender')).toBeVisible();
    for (const key of ['directObjectAdjective', 'directObjectDefiniteness', 'directObjectRelative', 'directObjectPossessor'])
      await expect(app.satellite(key)).toHaveCount(0);
  });

  test('coordinating the subject adds a conjunct, and the chip cycles the conjunction', async ({
    app,
    page,
  }) => {
    await app.buildClause('CAT', 'RUN');

    // The coordination control adds a conjunct's ring to the subject's group, on the same canvas.
    await app.satellite('subjectConjunct').click();
    await page.getByTestId('typeahead-subject').last().fill('dog');
    await page.locator('[data-testid="typeahead-option"][data-concept="DOG"]').click();

    await app.expectSentences({
      en: 'the cat and the dog run.',
      it: 'il gatto e il cane corrono.',
      fr: 'le chat et le chien courent.',
      de: 'der Kater und der Hund laufen.',
      es: 'el gato y el perro corren.',
      pt: 'o gato e o cão correm.',
      ja: '猫と犬は走ります。',
    });
    const period = app.period(0);
    await expect(period.getByTestId('phrase-canvas')).toHaveCount(1);
    await expect(period.getByTestId('group-box')).toHaveCount(3);

    // "or" makes the verb agree with the nearest conjunct — singular again.
    await page.getByRole('button', { name: /^and$/i }).click();
    await app.expectSentences({
      en: 'the cat or the dog runs.',
      it: 'il gatto o il cane corre.',
      fr: 'le chat ou le chien court.',
      de: 'der Kater oder der Hund läuft.',
      es: 'el gato o el perro corre.',
      pt: 'o gato ou o cão corre.',
      ja: '猫か犬は走ります。',
    });
    await expect(page.getByRole('button', { name: /^or$/i })).toBeVisible();
  });

  test('a group grows from its last ring and drops a conjunct from its own ring', async ({
    app,
    page,
  }) => {
    await app.buildClause('CAT', 'RUN');
    await app.satellite('subjectConjunct').click();
    await page.getByTestId('typeahead-subject').last().fill('dog');
    await page.locator('[data-testid="typeahead-option"][data-concept="DOG"]').click();

    // The control that extends the group has moved to the dog's ring, the group's last.
    await expect(app.satellite('subjectConjunct')).toHaveCount(1);
    await app.satellite('subjectConjunct').click();
    await page.getByTestId('typeahead-subject').last().fill('fox');
    await page.locator('[data-testid="typeahead-option"][data-concept="FOX"]').click();

    await app.expectSentences({ en: 'the cat, the dog and the fox run.' });
    await expect(page.getByRole('button', { name: /^and$/i })).toHaveCount(2);

    await page.getByRole('button', { name: 'Remove this conjunct' }).first().click();

    await app.expectSentences({ en: 'the cat and the fox run.' });
    await expect(page.getByRole('button', { name: /^and$/i })).toHaveCount(1);
  });

  // P09-E48: a noun's examples, on a hosted ring whose line carries the relation's chip.
  test('names a set’s members: such as and including, in all seven languages', async ({ app, page }) => {
    await app.buildClause('ANIMAL', 'RUN');
    await app.satellite('subjectNumber').click();
    await app.expectSentences({ en: 'the animals run.' });
    const rects = () =>
      page.getByTestId('group-box').evaluateAll((els) =>
        els.map((el) => {
          const r = el.getBoundingClientRect();
          return { group: (el as HTMLElement).dataset['group'], x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
        }),
      );
    const before = await rects();

    await app.satellite('subjectExamples').click();
    const examples = page.getByTestId('box-subject').nth(1);
    await examples.locator('input').fill('cat');
    await page.locator('[data-testid="typeahead-option"][data-concept="CAT"]').click();
    await app.expectSentences({ en: 'the animals such as the cat run.' });
    const after = await rects();
    // The period's own rings keep their places relative to one another; the examples' ring is one more.
    const fromSubject = (all: typeof before) => {
      const origin = all.find((r) => r.group === 'Subject')!;
      return all.map((r) => ({ ...r, x: r.x - origin.x, y: r.y - origin.y }));
    };
    for (const ring of fromSubject(before)) expect(fromSubject(after)).toContainEqual(ring);
    expect(after).toHaveLength(before.length + 1);

    // The chip on the line says the relation, and a click flips it.
    const chip = page.getByTestId('examples-chip');
    await expect(chip).toHaveText(/such as/i);
    await chip.click();
    await expect(chip).toHaveText(/including/i);
    await app.expectSentences({
      en: 'the animals, including the cat, run.',
      it: 'gli animali, compreso il gatto, corrono.',
      fr: 'les animaux, y compris le chat, courent.',
      de: 'die Tiere, einschließlich des Katers, laufen.',
      es: 'los animales, incluido el gato, corren.',
      pt: 'os animais, incluindo o gato, correm.',
      ja: '猫を含む動物は走ります。',
    });

    await chip.click();
    // The period's own subject's determiner: the examples' ring has a subject box of its own.
    await page.getByTestId('satellite-subjectDefiniteness').first().click();
    await page.getByTestId('box-subjectDefiniteness').first().click();
    await page.getByRole('menuitem', { name: /^Zero/ }).click();
    await app.expectSentences({
      en: 'animals such as the cat run.',
      it: 'animali come il gatto corrono.',
      fr: 'animaux comme le chat courent.',
      de: 'Tiere wie der Kater laufen.',
      es: 'animales como el gato corren.',
      pt: 'animais como o gato correm.',
      ja: '猫のような動物は走ります。',
    });
  });
});
