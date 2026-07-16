import { describe, expect, test } from 'vitest';
import { clause, np, sayAll } from '../harness.js';

// The recipient. Not a slot of its own — it is the `terminus` complement, declared by every verb
// that licenses one. Nine do: the three ditransitives, and six transitives that take a goal.
const TERMINUS_VERBS = ['GIVE', 'SHOW', 'SEND', 'CUT', 'READ', 'SAVE', 'ADD', 'EXPORT', 'START'];

const sendTo = (verb: string, recipient: string) =>
  sayAll(clause(np('CAT'), verb, {
    directObject: np('BOOK'),
    complements: { terminus: { phrase: np(recipient) } },
  }));

describe('terminus', () => {
  test('the dative recipient', () => {
    expect(sendTo('GIVE', 'DOG')).toMatchObject({
      en: 'the cat gives the book to the dog.',
      it: 'il gatto dà il libro al cane.',
      fr: 'le chat donne le livre au chien.',
      es: 'el gato da el libro al perro.',
      pt: 'o gato dá o livro ao cão.',
      // German inflects the recipient and puts the dative BEFORE the accusative.
      de: 'der Kater gibt dem Hund das Buch.',
      // Japanese marks it with に.
      ja: '猫は犬に本をあげます。',
    });
  });

  // The marking is a property of the COMPLEMENT, not of the verb: every licensing verb dativises
  // its recipient the same way, and only the verb itself changes. This is the invariant worth
  // holding — it is what would break if a verb ever grew its own special-cased terminus.
  test.each(TERMINUS_VERBS)('%s marks its recipient the same way', (verb) => {
    const said = sendTo(verb, 'DOG');

    expect(said.en).toMatch(/ the book to the dog\.$/);
    expect(said.it).toMatch(/ il libro al cane\.$/);
    expect(said.fr).toMatch(/ le livre au chien\.$/);
    expect(said.es).toMatch(/ el libro al perro\.$/);
    expect(said.pt).toMatch(/ o livro ao cão\.$/);
    // German is the interesting one: dative recipient, then accusative object.
    expect(said.de).toMatch(/^der Kater \w+ dem Hund das Buch\.$/);
    expect(said.ja).toMatch(/^猫は犬に本を.+ます。$/);
  });
});

// The three verbs whose recipient is a person.
describe('terminus: ditransitives', () => {
  test('GIVE, SHOW and SEND', () => {
    expect(sendTo('SHOW', 'DOG')).toMatchObject({
      en: 'the cat shows the book to the dog.',
      it: 'il gatto mostra il libro al cane.',
      de: 'der Kater zeigt dem Hund das Buch.',
      ja: '猫は犬に本を見せます。',
    });

    expect(sendTo('SEND', 'DOG')).toMatchObject({
      en: 'the cat sends the book to the dog.',
      fr: 'le chat envoie le livre au chien.',
      de: 'der Kater schickt dem Hund das Buch.',
      ja: '猫は犬に本を送ります。',
    });
  });

  test('READ — the recipient is who it is read TO', () => {
    expect(sendTo('READ', 'DOG')).toMatchObject({
      en: 'the cat reads the book to the dog.',
      it: 'il gatto legge il libro al cane.',
      de: 'der Kater liest dem Hund das Buch.',
      ja: '猫は犬に本を読みます。',
    });
  });
});

// The transitive verbs that license a terminus are the app's own vocabulary — saving, adding and
// exporting a phrase INTO something. Their recipient is a place, not a person.
describe('terminus: an inanimate goal', () => {
  test('SAVE, ADD and EXPORT take a container', () => {
    expect(sendTo('SAVE', 'CONTAINER')).toMatchObject({
      en: 'the cat saves the book to the container.',
      it: 'il gatto salva il libro al contenitore.',
      ja: '猫は容器に本を保存します。',
    });

    expect(sendTo('ADD', 'CONTAINER')).toMatchObject({
      en: 'the cat adds the book to the container.',
      it: 'il gatto aggiunge il libro al contenitore.',
    });

    expect(sendTo('EXPORT', 'CONTAINER')).toMatchObject({
      en: 'the cat exports the book to the container.',
      fr: 'le chat exporte le livre au récipient.',
    });
  });

  test('the terminus does NOT vary with animacy, unlike direction', () => {
    // `direction` picks its adposition from the goal's animacy — Italian goes *da* a person but
    // *a* a place ("va dal ragazzo" / "va al mercato"). A dative recipient does not: it is "al"
    // either way. Pinned because the two complements sit next to each other and look alike.
    expect(sendTo('SEND', 'MARKET')).toMatchObject({
      en: 'the cat sends the book to the market.',
      it: 'il gatto manda il libro al mercato.',
      ja: '猫は市場に本を送ります。',
    });
    expect(sendTo('SEND', 'DOG')).toMatchObject({
      it: 'il gatto manda il libro al cane.',
    });
  });
});

describe('known bugs: terminus', () => {
  // German dativises an inanimate terminus exactly as it dativises a person, so "save the book to
  // the container" comes out as "der Kater speichert dem Behälter das Buch" — which reads as
  // *giving the book TO the container*, as though the container were a recipient. German marks a
  // goal with a preposition, not a bare dative: "speichert das Buch IN DEN Behälter", "schickt das
  // Buch AN DEN Markt". The other six languages are unaffected, because their dative preposition
  // (to / a / à) doubles as a goal marker anyway.
  //
  // Asserted negatively: which preposition German should choose (in / an / zu) depends on the
  // verb, so the surface is a design call — what is not in doubt is that the bare dative is wrong.
  test('German should not mark an inanimate terminus with a bare dative', () => {
    expect(sendTo('SAVE', 'CONTAINER').de).not.toBe('der Kater speichert dem Behälter das Buch.');
  });

  // The fix in full: an inanimate goal takes the directional "in" + accusative and trails the
  // object ("das Buch in den Behälter"), across the verbs that license it — while an animate
  // recipient is unchanged, still the bare dative that leads the object ("dem Hund das Buch").
  // So the German terminus DOES vary with animacy, unlike the other six languages.
  test('German marks an inanimate terminus with a preposition, an animate one with the dative', () => {
    expect(sendTo('SAVE', 'CONTAINER').de).toBe('der Kater speichert das Buch in den Behälter.');
    expect(sendTo('ADD', 'CONTAINER').de).toBe('der Kater addiert das Buch in den Behälter.');
    expect(sendTo('EXPORT', 'CONTAINER').de).toBe('der Kater exportiert das Buch in den Behälter.');
    expect(sendTo('SEND', 'MARKET').de).toBe('der Kater schickt das Buch in den Markt.');
    // Regression: a person recipient keeps the bare dative, leading the object.
    expect(sendTo('SEND', 'DOG').de).toBe('der Kater schickt dem Hund das Buch.');
    expect(sendTo('GIVE', 'DOG').de).toBe('der Kater gibt dem Hund das Buch.');
  });
});
