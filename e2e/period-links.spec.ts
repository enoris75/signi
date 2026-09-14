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
      de: 'wenn der Kater essen würde, würde der Hund laufen.',
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
      de: 'der Hund läuft, aber der Kater isst.',
      es: 'el perro corre, pero el gato come.',
      pt: 'o cão corre, mas o gato come.',
      ja: '犬は走ります。しかし、猫は食べます。',
    });
    await expect(app.sentences('en')).toHaveCount(1);

    await app.period(0).getByRole('button', { name: 'Remove the coordination (But)' }).click();
    await expect(app.sentences('en')).toHaveCount(2);
  });
});
