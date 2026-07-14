import { test, expect } from './fixtures';

// The canvas is a geometry feedback loop — node positions are stored as a percentage of a
// canvas height that layout effects write back into — so these drive the real pointer
// sequences rather than trusting a static render. The `page` fixture fails the test on any
// uncaught error, which is what catches the "Maximum update depth exceeded" class of bug.
test.describe('canvas', () => {
  test('compact hides the role boxes, expand brings them back', async ({ app }) => {
    await app.buildClause('CAT', 'EAT');

    const boxes = app.page.getByTestId('group-box');
    await expect(boxes).toHaveCount(3); // Subject, Verb Phrase, Direct Object
    await expect(app.compactToggle).toHaveAttribute('data-compact', 'false');

    // Compact keeps the word chips but drops the dashed boxes entirely.
    await app.compactToggle.click();
    await expect(app.compactToggle).toHaveAttribute('data-compact', 'true');
    await expect(boxes).toHaveCount(0);

    await app.compactToggle.click();
    await expect(app.compactToggle).toHaveAttribute('data-compact', 'false');
    await expect(boxes).toHaveCount(3);
  });

  test('a dragged group stays where it is put, and tidy lays it out again', async ({ app }) => {
    await app.buildClause('CAT', 'EAT');

    // Tidy converges rather than canonicalising in one pass: the first click collapses the
    // canvas to its tidy height but positions the groups against the *old* height, so it lands
    // a few px short and a second click settles on the fixed point. Hence tidy() clicks twice.
    // The invariant pinned here is that the fixed point is the same wherever the group was
    // dragged from — not that one tidy restores the previous layout, which it does not.
    await app.tidy();
    const settled = await app.groupOrigin('Subject');

    await app.dragGroup('Subject', 140, 90);
    const dragged = await app.groupOrigin('Subject');
    expect(Math.abs(dragged.x - settled.x)).toBeGreaterThan(50);

    await app.tidy();
    const retidied = await app.groupOrigin('Subject');
    expect(Math.round(retidied.x)).toBe(Math.round(settled.x));
    expect(Math.round(retidied.y)).toBe(Math.round(settled.y));
  });
});
