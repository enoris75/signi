import { test, expect } from './fixtures';

// The condition and coordination links: like the relative clause (relative.spec.ts), each joins two
// periods into one sentence, and each is made from a control on the period's side rail. Removing
// the link splits the sentence back into two, which is asserted too — the link state lives in the
// workspace, not in either period's selection.
test.describe('period links', () => {
  test('an IF condition folds one period into a counterfactual conditional', async ({ app }) => {
    await app.buildClauseIn(0, 'DOG', 'RUN');
    await app.addPeriod();
    await app.buildClauseIn(1, 'CAT', 'EAT');

    await app.linkCondition(0, 1);
    await app.expectSentences({
      en: 'if the cat ate, the dog would run.',
      it: 'se il gatto mangiasse, il cane correrebbe.',
      fr: 'si le chat mangeait, le chien courrait.',
      de: 'wenn der Kater fressen würde, würde der Hund laufen.',
      es: 'si el gato comiera, el perro correría.',
      pt: 'se o gato comesse, o cão correria.',
      ja: 'もし猫が食べたら、犬は走ります。',
    });
    await expect(app.sentences('en')).toHaveCount(1);

    await app.period(0).getByRole('button', { name: 'Remove the condition' }).click();
    await expect(app.sentences('en')).toHaveCount(2);
    await expect(app.sentences('en').nth(0)).toHaveText('the dog runs.');
  });

  test('a coordination joins two periods with the chosen conjunction', async ({ app }) => {
    await app.buildClauseIn(0, 'DOG', 'RUN');
    await app.addPeriod();
    await app.buildClauseIn(1, 'CAT', 'EAT');

    await app.linkCoordination(0, 1, 'But');
    await app.expectSentences({
      en: 'the dog runs, but the cat eats.',
      it: 'il cane corre, ma il gatto mangia.',
      fr: 'le chien court, mais le chat mange.',
      de: 'der Hund läuft, aber der Kater frisst.',
      es: 'el perro corre, pero el gato come.',
      pt: 'o cão corre, mas o gato come.',
      ja: '犬は走ります。しかし、猫は食べます。',
    });
    await expect(app.sentences('en')).toHaveCount(1);

    await app.period(0).getByRole('button', { name: 'Remove the coordination (But)' }).click();
    await expect(app.sentences('en')).toHaveCount(2);
  });

  // The subordinate clauses (P09-E12 D9): one border control, a menu of what the verb takes.
  test('a that-clause becomes the object of a verb of saying', async ({ app }) => {
    await app.buildClauseIn(0, 'MAN', 'SAY');
    await app.addPeriod();
    await app.buildClauseIn(1, 'CAT', 'RUN');

    await app.linkSubordinate(0, 1, 'That');
    await app.expectSentences({
      en: 'the man says that the cat runs.',
      it: "l'uomo dice che il gatto corre.",
      fr: "l'homme dit que le chat court.",
      de: 'der Mann sagt, dass der Kater läuft.',
      es: 'el hombre dice que el gato corre.',
      pt: 'o homem diz que o gato corre.',
      ja: '男は猫が走ると言います。',
    });
    await expect(app.sentences('en')).toHaveCount(1);

    await app.period(0).getByRole('button', { name: 'Remove the subordinate clause (That)' }).click();
    await expect(app.sentences('en')).toHaveCount(2);
  });

  test('an adverbial clause joins any verb with its conjunction', async ({ app }) => {
    await app.buildClauseIn(0, 'MAN', 'RUN');
    await app.addPeriod();
    await app.buildClauseIn(1, 'CAT', 'EAT');

    // RUN takes no clause as its object, so the menu offers the conjunctions alone.
    await app.period(0).getByRole('button', { name: 'Add a subordinate clause' }).click();
    await expect(app.page.getByRole('menuitem', { name: /^That/ })).toHaveCount(0);
    await app.page.keyboard.press('Escape');

    await app.linkSubordinate(0, 1, 'When');
    await app.expectSentences({
      en: 'the man runs when the cat eats.',
      it: "l'uomo corre quando il gatto mangia.",
      fr: "l'homme court quand le chat mange.",
      de: 'der Mann läuft, wenn der Kater frisst.',
      es: 'el hombre corre cuando el gato come.',
      pt: 'o homem corre quando o gato come.',
      ja: '男は猫が食べる時に走ります。',
    });
    await expect(app.sentences('en')).toHaveCount(1);
  });

  test('an infinitive complement is drawn in the infinitive, its mood locked while linked', async ({ app }) => {
    await app.buildClauseIn(0, 'CAT', 'NEED');
    await app.addPeriod();
    await app.buildClauseIn(1, 'DOG', 'RUN');

    await app.linkSubordinate(0, 1, 'Infinitive phrase');
    await expect(app.period(1).getByTestId('infinitive-box')).toBeVisible();
    await expect(app.period(1).getByRole('button', { name: 'Infinitive phrase', exact: true })).toBeDisabled();
    await app.expectSentences({
      en: 'the cat needs to run.',
      it: 'il gatto ha bisogno di correre.',
      fr: 'le chat a besoin de courir.',
      de: 'der Kater braucht zu laufen.',
      es: 'el gato necesita correr.',
      pt: 'o gato precisa correr.',
      ja: '猫は走ることを必要としています。',
    });
    await expect(app.sentences('en')).toHaveCount(1);
  });
});
