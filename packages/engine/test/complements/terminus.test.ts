import { describe, expect, test } from 'vitest';
import { clause, np, sayAll } from '../harness.js';

// The recipient. Not a slot of its own — it is the `terminus` complement, declared by every verb
// that licenses one. These ten take a transitive recipient — the three ditransitives, and seven
// transitives that take a goal — so the helper below gives each an object to hand over. (SEEM and
// APPEAR license a terminus too, but as an experiencer with no object — "seems to me" — so they
// get their own block at the end.)
const TERMINUS_VERBS = ['GIVE', 'SHOW', 'SEND', 'CUT', 'READ', 'CRY_OUT', 'SAVE', 'ADD', 'EXPORT', 'START'];

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
    // German is the interesting one: dative recipient, then accusative object. ADD's separable
    // particle closes the clause after them ("fügt dem Hund das Buch hinzu", A138).
    expect(said.de).toMatch(/^der Kater \p{L}+ dem Hund das Buch(?: hinzu)?\.$/u);
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

// CRY_OUT — shouting something TO someone. Transitive, so it fits the frame above, but its lexeme
// is a plain "cry" in English, giving the slightly odd "cries the book to the dog"; the dative
// marking is what matters, and it is the same as every other recipient.
describe('terminus: CRY_OUT shouts it to a recipient', () => {
  test('the recipient is dativised like any other', () => {
    expect(sendTo('CRY_OUT', 'DOG')).toMatchObject({
      en: 'the cat cries the book to the dog.',
      it: 'il gatto grida il libro al cane.',
      de: 'der Kater ruft dem Hund das Buch.',
      ja: '猫は犬に本を叫びます。',
    });
  });
});

// SEEM and APPEAR take a terminus as an EXPERIENCER — the one it seems that way *to* — not as the
// goal of a handed-over object. They are intransitive, so no direct object: "the cat seems to the
// dog". The dative marking is the same one the ditransitives use, which is the point worth pinning.
describe('terminus: the copular experiencer', () => {
  const seemsTo = (verb: string, experiencer: string) =>
    sayAll(clause(np('CAT'), verb, { complements: { terminus: { phrase: np(experiencer) } } }));

  test('SEEM marks its experiencer with the dative', () => {
    expect(seemsTo('SEEM', 'DOG')).toMatchObject({
      en: 'the cat seems to the dog.',
      it: 'il gatto sembra al cane.',
      fr: 'le chat semble au chien.',
      es: 'el gato parece al perro.',
      pt: 'o gato parece ao cão.',
      de: 'der Kater scheint dem Hund.',
      ja: '猫は犬に思えます。',
    });
  });

  // APPEAR marks the witness the same way — but only Japanese distinguishes the two verbs here.
  // 見える + に is "looks like a dog", the SEEM reading; the coming-into-view verb 現れる keeps
  // に unambiguously the person the subject shows up before.
  test('APPEAR marks it the same way', () => {
    expect(seemsTo('APPEAR', 'DOG')).toMatchObject({
      en: 'the cat appears to the dog.',
      it: 'il gatto appare al cane.',
      de: 'der Kater erscheint dem Hund.',
      ja: '猫は犬に現れます。',
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
    expect(sendTo('EXPORT', 'CONTAINER').de).toBe('der Kater exportiert das Buch in den Behälter.');
    expect(sendTo('SEND', 'MARKET').de).toBe('der Kater schickt das Buch in den Markt.');
    // Regression: a person recipient keeps the bare dative, leading the object.
    expect(sendTo('SEND', 'DOG').de).toBe('der Kater schickt dem Hund das Buch.');
    expect(sendTo('GIVE', 'DOG').de).toBe('der Kater gibt dem Hund das Buch.');
  });
});

// A143. The inanimate goal's "in" + accusative is the app's default, and right for putting a thing into
// a container ("speichert das Buch in den Behälter"). ADD is "hinzufügen" (A138), which adds a thing TO
// something: "fügt das Buch zum Behälter hinzu", never "*fügt das Buch in den Behälter hinzu".
describe('known bugs: German ADD takes its goal with zu', () => {
  const addTo = (goal: ReturnType<typeof np>) =>
    sayAll(clause(np('CAT'), 'ADD', { directObject: np('BOOK'), complements: { terminus: { phrase: goal } } })).de;

  test('German adds a thing to a goal with zu + dative', () => {
    expect(addTo(np('CONTAINER'))).toBe('der Kater fügt das Buch zum Behälter hinzu.');
    expect(addTo(np('CONDITION'))).toBe('der Kater fügt das Buch zur Bedingung hinzu.');
    expect(addTo(np('CONTAINER', { definiteness: 'indefinite' }))).toBe('der Kater fügt das Buch zu einem Behälter hinzu.');
    expect(addTo(np('HOUSE', { number: 'plural' }))).toBe('der Kater fügt das Buch zu den Häusern hinzu.');
  });

  test('a relative on the goal takes zu too', () => {
    expect(sayAll(clause(np('CONTAINER', {
      relative: { headRole: 'terminus', subject: np('CAT'), verbPhrase: { verb: 'ADD' }, directObject: np('BOOK') },
    }), 'RUN')).de).toBe('der Behälter, zu dem der Kater das Buch hinzufügt, läuft.');
  });

  // The generalisation: "zu" is the verb's, so it rides through every determiner and every clause
  // shape, and `prepDet` fuses it only with a definite article ("zum", "zur", but "zu keinem").
  test('zu takes the dative under any determiner, tense or modal', () => {
    expect(addTo(np('CONTAINER', { definiteness: 'no' }))).toBe('der Kater fügt das Buch zu keinem Behälter hinzu.');
    expect(addTo(np('CONTAINER', { adjectives: ['SMALL'] }))).toBe('der Kater fügt das Buch zum kleinen Behälter hinzu.');
    expect(addTo(np('AFRICA'))).toBe('der Kater fügt das Buch zu Afrika hinzu.');
    expect(sayAll(clause(np('CAT'), 'ADD', {
      directObject: np('BOOK'), complements: { terminus: { phrase: np('CONTAINER') } }, verbPhrase: { tense: 'past' },
    })).de).toBe('der Kater fügte das Buch zum Behälter hinzu.');
    expect(sayAll(clause(np('CAT'), 'ADD', {
      directObject: np('BOOK'), complements: { terminus: { phrase: np('CONTAINER') } }, verbPhrase: { modals: ['MUST'] },
    })).de).toBe('der Kater muss das Buch zum Behälter hinzufügen.');
  });

  // Regression guard: a verb that puts a thing into a container keeps "in", and a person recipient
  // keeps the bare dative — including A8's weak masculine, which ADD takes as a recipient.
  test('regression: SAVE keeps in, and ADD keeps the dative of a person', () => {
    expect(sendTo('SAVE', 'CONTAINER').de).toBe('der Kater speichert das Buch in den Behälter.');
    expect(sendTo('ADD', 'DOG').de).toBe('der Kater fügt dem Hund das Buch hinzu.');
    expect(addTo(np('BOY'))).toBe('der Kater fügt dem Jungen das Buch hinzu.');
  });

  // The other six never read `terminus_prep`; they have their own preposition for a goal.
  test('regression: the other six are unchanged', () => {
    expect(sayAll(clause(np('CAT'), 'ADD', { directObject: np('BOOK'), complements: { terminus: { phrase: np('CONTAINER') } } })))
      .toMatchObject({
        en: 'the cat adds the book to the container.',
        it: 'il gatto aggiunge il libro al contenitore.',
        fr: 'le chat ajoute le livre au récipient.',
        es: 'el gato añade el libro al recipiente.',
        pt: 'o gato adiciona o livro ao recipiente.',
        ja: '猫は容器に本を加えます。',
      });
  });
});

// A59. The preposition-article fusion covers in+dem, zu+dem and zu+der, but not in+das. An inanimate
// neuter goal takes "in" + the accusative "das", which standard German contracts to "ins".
describe('known bugs: German "ins" contraction', () => {
  test('German contracts "in das" to "ins"', () => {
    expect(sendTo('SAVE', 'HOUSE').de).toBe('der Kater speichert das Buch ins Haus.');
  });

  const saveInto = (goal: Parameters<typeof np>[1]) =>
    sayAll(clause(np('CAT'), 'SAVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('HOUSE', goal) } } })).de;

  test('German contracts before an adjective and inside a relative clause', () => {
    expect(saveInto({ adjectives: ['SMALL'] })).toBe('der Kater speichert das Buch ins kleine Haus.');
    expect(sayAll(clause(np('MAN', {
      relative: { verbPhrase: { verb: 'SAVE' }, directObject: np('BOOK'), complements: { terminus: { phrase: np('HOUSE') } } },
    }), 'RUN')).de).toBe('der Mann, der das Buch ins Haus speichert, läuft.');
  });

  test('regression: only the definite neuter singular contracts', () => {
    expect(saveInto({ definiteness: 'indefinite' })).toBe('der Kater speichert das Buch in ein Haus.');
    expect(saveInto({ definiteness: 'this' })).toBe('der Kater speichert das Buch in dieses Haus.');
    expect(saveInto({ number: 'plural' })).toBe('der Kater speichert das Buch in die Häuser.');
    expect(sendTo('SAVE', 'CONTAINER').de).toBe('der Kater speichert das Buch in den Behälter.');
  });
});

// A223. A16 gave an inanimate German terminus "in" + the accusative, the goal of SAVE and EXPORT
// ("speichert das Buch in den Behälter"), and A143 let a verb name another preposition
// (`terminus_prep`). Two verbs were left on the default that is not theirs. GIVE's terminus is its
// dative object whatever it names — one gives a value TO an option, "gibt der Option den Wert", not
// INTO it. CONNECT is "verbinden", the verb LINK already joins WITH ("mit einem anderen Knoten"), but
// its lexeme named no `terminus_prep`. Found authoring the C23-C28 sweep. The fix gave CONNECT's
// lexeme "mit", and GIVE's `terminus_dative`, which `splitDative` and the terminus branch read.
describe('known bugs: a German inanimate terminus of GIVE and CONNECT takes "in" (A223)', () => {
  const G = np('PERSON');
  const give = (goal: Parameters<typeof clause>[0], extra: Parameters<typeof clause>[2] = {}) =>
    sayAll(clause(G, 'GIVE', { directObject: np('VALUE'), complements: { terminus: { phrase: goal } }, ...extra })).de;
  const connect = (goal: Parameters<typeof clause>[0], extra: Parameters<typeof clause>[2] = {}) =>
    sayAll(clause(G, 'CONNECT', { directObject: np('NODE'), complements: { terminus: { phrase: goal } }, ...extra })).de;
  const ANOTHER_NODE = np('NODE', { definiteness: 'indefinite', adjectives: ['OTHER'] });

  test('GIVE takes the bare dative ahead of its object, and CONNECT takes "mit"', () => {
    expect(give(np('OPTION'))).toBe('die Person gibt der Option den Wert.');
    expect(give(np('OPTION', { definiteness: 'indefinite' }))).toBe('die Person gibt einer Option den Wert.');
    expect(give(np('OPTION', { number: 'plural' }))).toBe('die Person gibt den Optionen den Wert.');
    expect(give(np('OPTION'), { verbPhrase: { tense: 'past' } })).toBe('die Person gab der Option den Wert.');
    expect(give(np('OPTION'), { verbPhrase: { aspect: 'resultative' } })).toBe('die Person hat der Option den Wert gegeben.');
    expect(give(np('OPTION'), { verbPhrase: { negative: true } })).toBe('die Person gibt der Option den Wert nicht.');
    expect(sayAll({
      subject: np('OPTION', { relative: { headRole: 'terminus', subject: G, verbPhrase: { verb: 'GIVE' }, directObject: np('VALUE') } }),
    }).de).toBe('die Option, der die Person den Wert gibt.');
    expect(sayAll({
      ...clause(np('GENERIC_PERSON'), 'GIVE', {
        directObject: np('VALUE', { definiteness: 'indefinite' }),
        complements: { terminus: { phrase: np('OPTION', { definiteness: 'indefinite' }) } },
      }),
      infinitive: true,
    }).de).toBe('einer Option einen Wert geben.');
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'GIVE', { directObject: np('VALUE'), complements: { terminus: { phrase: np('OPTION') } } }), imperative: true }).de)
      .toBe('gib der Option den Wert.');
    expect(sayAll(clause(np('MAN'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('THIRD_PERSON', { gender: 'neut' }) } } })).de)
      .toBe('der Mann gibt ihm das Buch.');
    expect(connect(ANOTHER_NODE)).toBe('die Person verbindet den Knoten mit einem anderen Knoten.');
    expect(connect(np('NODE', { number: 'plural' }))).toBe('die Person verbindet den Knoten mit den Knoten.');
    expect(connect(ANOTHER_NODE, { verbPhrase: { tense: 'past' } })).toBe('die Person verband den Knoten mit einem anderen Knoten.');
    expect(sayAll({
      subject: np('NODE', { relative: { headRole: 'terminus', subject: G, verbPhrase: { verb: 'CONNECT' }, directObject: np('NODE', { definiteness: 'indefinite' }) } }),
    }).de).toBe('der Knoten, mit dem die Person einen Knoten verbindet.');
  });

  // GIVE's inanimate dative takes a recipient's slot in every clause: ahead of the object and of the
  // "nicht" (which spells a known indefinite object as "kein" and leads an adverb or a place behind
  // it), in a subject relative, beside a passive's by-phrase, and for a group. The two rows that used
  // GIVE for its "in" (an adjective on a place name, "nicht" before a PP) moved onto SAVE; these are
  // what GIVE says now. CONNECT's "mit" is the verb's in every clause, and before a pronoun.
  test("GIVE's dative stands where a recipient's does, and CONNECT's \"mit\" in every clause", () => {
    expect(sayAll(clause(np('CAT'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('ASIA', { adjectives: ['BIG'] }) } } })).de)
      .toBe('der Kater gibt dem großen Asien das Buch.');
    expect(sayAll(clause(np('MAN'), 'GIVE', { verbPhrase: { negative: true }, directObject: np('BOOK'), complements: { terminus: { phrase: np('HOUSE') } } })).de)
      .toBe('der Mann gibt dem Haus das Buch nicht.');
    expect(give(np('OPTION'), { directObject: np('VALUE', { definiteness: 'indefinite' }), verbPhrase: { negative: true } }))
      .toBe('die Person gibt der Option keinen Wert.');
    expect(give(np('OPTION'), { verbPhrase: { negative: true, modifier: 'FAST' } })).toBe('die Person gibt der Option den Wert nicht schnell.');
    expect(give(np('OPTION'), { complements: { terminus: { phrase: np('OPTION') }, locative: { phrase: np('HOUSE') } } }))
      .toBe('die Person gibt der Option den Wert im Haus.');
    expect(sayAll(clause(np('PERSON', {
      relative: { verbPhrase: { verb: 'GIVE' }, directObject: np('VALUE'), complements: { terminus: { phrase: np('OPTION') } } },
    }), 'RUN')).de).toBe('die Person, die der Option den Wert gibt, läuft.');
    expect(give(np('OPTION'), { verbPhrase: { voice: 'passive' } })).toBe('der Wert wird der Option von der Person gegeben.');
    expect(give({ conjunction: 'and', conjuncts: [np('OPTION'), np('HOUSE', { definiteness: 'indefinite' })] }))
      .toBe('die Person gibt der Option und einem Haus den Wert.');
    expect(connect(np('NODE', { number: 'plural' }), { verbPhrase: { negative: true } })).toBe('die Person verbindet den Knoten nicht mit den Knoten.');
    expect(connect(np('THIRD_PERSON', { gender: 'neut' }))).toBe('die Person verbindet den Knoten mit ihm.');
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'CONNECT', { directObject: np('NODE'), complements: { terminus: { phrase: np('NODE', { number: 'plural' }) } } }), imperative: true }).de)
      .toBe('verbinde den Knoten mit den Knoten.');
    expect(sayAll({
      ...clause(np('GENERIC_PERSON'), 'CONNECT', { directObject: np('NODE', { definiteness: 'indefinite' }), complements: { terminus: { phrase: ANOTHER_NODE } } }),
      infinitive: true,
    }).de).toBe('einen Knoten mit einem anderen Knoten verbinden.');
    expect(sayAll(clause(np('PERSON', {
      relative: { verbPhrase: { verb: 'CONNECT' }, directObject: np('NODE'), complements: { terminus: { phrase: ANOTHER_NODE } } },
    }), 'RUN')).de).toBe('die Person, die den Knoten mit einem anderen Knoten verbindet, läuft.');
  });

  test('regression: a living recipient, LINK, the goals of SAVE and ADD, and the other six', () => {
    expect(give(np('DOG'))).toBe('die Person gibt dem Hund den Wert.');
    expect(sayAll(clause(G, 'LINK', { directObject: np('NODE'), complements: { terminus: { phrase: ANOTHER_NODE } } })).de)
      .toBe('die Person verbindet den Knoten mit einem anderen Knoten.');
    expect(sendTo('SAVE', 'CONTAINER').de).toBe('der Kater speichert das Buch in den Behälter.');
    expect(sendTo('ADD', 'CONTAINER').de).toBe('der Kater fügt das Buch zum Behälter hinzu.');
    expect(sayAll(clause(G, 'GIVE', { directObject: np('VALUE'), complements: { terminus: { phrase: np('OPTION') } } }))).toMatchObject({
      en: 'the person gives the value to the option.',
      it: "la persona dà il valore all'opzione.",
      fr: "la personne donne la valeur à l'option.",
      es: 'la persona da el valor a la opción.',
      ja: '人は選択肢に値をあげます。',
      pt: 'a pessoa dá o valor à opção.',
    });
    expect(sayAll(clause(G, 'CONNECT', { directObject: np('NODE'), complements: { terminus: { phrase: ANOTHER_NODE } } }))).toMatchObject({
      en: 'the person connects the node to another node.',
      it: 'la persona connette il nodo a un altro nodo.',
      fr: 'la personne connecte le nœud à un autre nœud.',
      ja: '人は別のノードにノードを接続します。',
      pt: 'a pessoa conecta o nó a outro nó.',
    });
  });
});

// A229. A German dative pronoun leads a noun object: "gibt ihm das Buch", as a dative noun does ("gibt
// dem Hund das Buch"). `splitDative` hoisted the recipient into that slot only when its head's forms
// said `animate`, and a pronoun's forms carry no such key — A203 made `tonicHeadForms` count a
// personal pronoun as animate, which is why it takes the bare dative at all, but `splitDative` read
// the raw forms. So the pronoun trailed the object, "gibt das Buch ihm", which reads as contrastive
// ("gives the book to HIM"), and after "nicht" as "not to him". Found reproducing A223. The fix
// reads the recipient's animacy off `tonicHeadForms` when the recipient is a pronoun.
describe('known bugs: a German dative pronoun trails the object (A229)', () => {
  const to = (verb: string, recipient: Parameters<typeof np>[0], extra: Parameters<typeof clause>[2] = {}, recipientExtra = {}) =>
    sayAll(clause(np('CAT'), verb, { directObject: np('BOOK'), complements: { terminus: { phrase: np(recipient, recipientExtra) } }, ...extra })).de;

  test('the pronoun leads the noun object, in every ditransitive and every clause', () => {
    expect(to('GIVE', 'THIRD_PERSON')).toBe('der Kater gibt ihm das Buch.');
    expect(to('GIVE', 'THIRD_PERSON', {}, { gender: 'fem' })).toBe('der Kater gibt ihr das Buch.');
    expect(to('GIVE', 'FIRST_PERSON')).toBe('der Kater gibt mir das Buch.');
    expect(to('GIVE', 'FIRST_PERSON', {}, { number: 'plural' })).toBe('der Kater gibt uns das Buch.');
    expect(to('GIVE', 'THIRD_PERSON', {}, { number: 'plural' })).toBe('der Kater gibt ihnen das Buch.');
    expect(to('SHOW', 'THIRD_PERSON')).toBe('der Kater zeigt ihm das Buch.');
    expect(to('SEND', 'FIRST_PERSON')).toBe('der Kater schickt mir das Buch.');
    expect(to('READ', 'THIRD_PERSON')).toBe('der Kater liest ihm das Buch.');
    expect(to('GIVE', 'THIRD_PERSON', { verbPhrase: { tense: 'past' } })).toBe('der Kater gab ihm das Buch.');
    expect(to('GIVE', 'THIRD_PERSON', { verbPhrase: { aspect: 'resultative' } })).toBe('der Kater hat ihm das Buch gegeben.');
    expect(to('GIVE', 'THIRD_PERSON', { verbPhrase: { negative: true } })).toBe('der Kater gibt ihm das Buch nicht.');
    expect(sayAll(clause(np('CAT'), 'GIVE', { directObject: np('BOOK', { definiteness: 'indefinite' }), complements: { terminus: { phrase: np('THIRD_PERSON') } } })).de)
      .toBe('der Kater gibt ihm ein Buch.');
    expect(sayAll(clause(np('CAT', {
      relative: { verbPhrase: { verb: 'GIVE' }, directObject: np('BOOK'), complements: { terminus: { phrase: np('THIRD_PERSON') } } },
    }), 'RUN')).de).toBe('der Kater, der ihm das Buch gibt, läuft.');
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('THIRD_PERSON') } } }), imperative: true }).de)
      .toBe('gib ihm das Buch.');
    expect(sayAll({
      ...clause(np('GENERIC_PERSON'), 'GIVE', { directObject: np('BOOK', { definiteness: 'indefinite' }), complements: { terminus: { phrase: np('THIRD_PERSON') } } }),
      infinitive: true,
    }).de).toBe('ihm ein Buch geben.');
  });

  // The pronoun takes the noun recipient's slot wherever that slot is: in front of the object in the
  // verb-final tail, the prospective's zu-group and a negated relative, and ahead of the "nicht" that
  // leads a place, exactly where "dem Hund" stands.
  test('the pronoun stands where a noun recipient stands, in every tense and clause', () => {
    expect(to('SEND', 'THIRD_PERSON', { verbPhrase: { tense: 'future' } }, { number: 'plural' })).toBe('der Kater wird ihnen das Buch schicken.');
    expect(to('SHOW', 'SECOND_PERSON', { verbPhrase: { tense: 'past' } })).toBe('der Kater zeigte dir das Buch.');
    expect(to('GIVE', 'THIRD_PERSON', { verbPhrase: { aspect: 'prospective' } })).toBe('der Kater ist im Begriff, ihm das Buch zu geben.');
    expect(sayAll(clause(np('CAT', {
      relative: { verbPhrase: { verb: 'GIVE', negative: true }, directObject: np('BOOK'), complements: { terminus: { phrase: np('THIRD_PERSON', { gender: 'fem' }) } } },
    }), 'RUN')).de).toBe('der Kater, der ihr das Buch nicht gibt, läuft.');
    const withPlace = (recipient: string) => sayAll(clause(np('CAT'), 'GIVE', {
      directObject: np('BOOK'), verbPhrase: { negative: true },
      complements: { terminus: { phrase: np(recipient) }, locative: { phrase: np('HOUSE') } },
    })).de;
    expect(withPlace('THIRD_PERSON')).toBe('der Kater gibt ihm das Buch nicht im Haus.');
    expect(withPlace('DOG')).toBe('der Kater gibt dem Hund das Buch nicht im Haus.');
  });

  test('regression: two pronouns, a noun recipient, the experiencer, and English and Japanese', () => {
    expect(sayAll(clause(np('CAT'), 'GIVE', { directObject: np('THIRD_PERSON', { gender: 'neut' }), complements: { terminus: { phrase: np('THIRD_PERSON') } } })).de)
      .toBe('der Kater gibt es ihm.');
    expect(sayAll(clause(np('CAT'), 'GIVE', { directObject: np('THIRD_PERSON'), complements: { terminus: { phrase: np('FIRST_PERSON') } } })).de)
      .toBe('der Kater gibt ihn mir.');
    expect(to('GIVE', 'DOG')).toBe('der Kater gibt dem Hund das Buch.');
    expect(sayAll(clause(np('CAT'), 'SEEM', { complements: { terminus: { phrase: np('THIRD_PERSON') } } })).de).toBe('der Kater scheint ihm.');
    expect(sayAll(clause(np('CAT'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('THIRD_PERSON') } } }))).toMatchObject({
      en: 'the cat gives the book to him.',
      ja: '猫は彼に本をあげます。',
    });
  });
});
