import { describe, expect, test } from 'vitest';
import type { NounPhrase, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// A155. French puts "bien" before the non-finite verb it modifies: between the auxiliary and the
// participle ("a bien mangé") and before an infinitive ("doit bien manger", "est en train de bien
// manger"). The engine trails it after the non-finite verb, where a -ment adverb goes. After a finite
// verb it is already right ("mange bien la souris").
describe('known bugs: French "bien" before the participle and the infinitive', () => {
  const catEatsMouseWell = (verbPhrase: Partial<VerbPhrase> = {}, object = np('MOUSE')) => sayAll(clause(np('CAT'), 'EAT', {
    directObject: object, verbPhrase: { modifier: 'WELL', ...verbPhrase },
  })).fr;

  test('between the auxiliary and the participle', () => {
    expect(catEatsMouseWell({ aspect: 'resultative' })).toBe('le chat a bien mangé la souris.');
    expect(catEatsMouseWell({ aspect: 'resultative', negative: true })).toBe("le chat n'a pas bien mangé la souris.");
    expect(sayAll(clause(np('DOG', {
      relative: { verbPhrase: { verb: 'EAT', modifier: 'WELL', aspect: 'resultative' }, directObject: np('MOUSE') },
    }), 'RUN')).fr).toBe('le chien qui a bien mangé la souris court.');
  });

  test('before the infinitive', () => {
    expect(catEatsMouseWell({ modals: ['MUST'] })).toBe('le chat doit bien manger la souris.');
    expect(catEatsMouseWell({ aspect: 'progressive' })).toBe('le chat est en train de bien manger la souris.');
    expect(catEatsMouseWell({ aspect: 'prospective' })).toBe('le chat est sur le point de bien manger la souris.');
    expect(sayAll(clause(np('BOOK', { number: 'plural' }), 'NAME', {
      directObject: np('BLADE', { adjectives: ['BROWN'] }),
      verbPhrase: { modifier: 'WELL', aspect: 'prospective', tense: 'future' },
    })).fr).toBe('les livres seront sur le point de bien nommer la lame brune.');
  });

  test('…and at the head of an infinitive clause', () => {
    expect(sayAll({
      ...clause(np('SECOND_PERSON'), 'EAT', { directObject: np('MOUSE'), verbPhrase: { modifier: 'WELL' } }),
      imperative: true, imperativeRegister: 'instruction',
    }).fr).toBe('bien manger la souris.');
  });

  // The generalisation: the slot is right before the non-finite verb, so the object clitic follows
  // "bien" and the periphrasis's "de" precedes it, and both auxiliaries take it the same way.
  test('…ahead of an object clitic, and after "avoir" / "être"', () => {
    expect(catEatsMouseWell({ aspect: 'progressive' }, np('THIRD_PERSON')))
      .toBe('le chat est en train de bien le manger.');
    expect(catEatsMouseWell({ modals: ['MUST'] }, np('THIRD_PERSON'))).toBe('le chat doit bien le manger.');
    expect(catEatsMouseWell({ modals: ['MUST'], aspect: 'resultative' })).toBe('le chat doit avoir bien mangé la souris.');
    expect(sayAll(clause(np('CAT'), 'GO', { verbPhrase: { modifier: 'WELL', aspect: 'resultative' } })).fr)
      .toBe('le chat est bien allé.');
  });

  test('…and behind the "ne pas" of a negated infinitive clause', () => {
    expect(sayAll({
      ...clause(np('SECOND_PERSON'), 'EAT', { directObject: np('MOUSE'), verbPhrase: { modifier: 'WELL', negative: true } }),
      imperative: true, imperativeRegister: 'instruction',
    }).fr).toBe('ne pas bien manger la souris.');
  });

  test('regression: after a finite verb it is already right', () => {
    expect(catEatsMouseWell()).toBe('le chat mange bien la souris.');
    expect(catEatsMouseWell({ negative: true })).toBe('le chat ne mange pas bien la souris.');
    expect(sayAll({
      ...clause(np('SECOND_PERSON'), 'EAT', { directObject: np('MOUSE'), verbPhrase: { modifier: 'WELL' } }),
      imperative: true,
    }).fr).toBe('mange bien la souris.');
  });

  // A long -ment adverb is unmarked and keeps its place after the participle, and the other six
  // languages never read the flag.
  test('regression: a -ment adverb still follows the participle, and the other six are unchanged', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', {
      directObject: np('MOUSE'), verbPhrase: { modifier: 'SLOWLY', aspect: 'resultative' },
    })).fr).toBe('le chat a mangé lentement la souris.');
    expect(sayAll(clause(np('CAT'), 'EAT', {
      directObject: np('MOUSE'), verbPhrase: { modifier: 'WELL', aspect: 'resultative' },
    }))).toMatchObject({
      en: 'the cat has eaten the mouse well.',
      it: 'il gatto ha mangiato bene il topo.',
      es: 'el gato ha comido bien el ratón.',
      pt: 'o gato comeu bem o rato.',
      de: 'der Kater hat gut die Maus gefressen.',
    });
  });
});

// A156. English puts the main verb's adverb at the very end of the clause, after the complements. A
// manner adverb can stand there ("runs in the house fast"), but UP and DOWN are particles of the verb
// and follow the verb or its object directly: "moves the book up in the house", "jumps down from the
// wall". A142 is the Romance and German side of the same missing distinction.
describe('known bugs: English adverb of direction after the complements', () => {
  test('UP and DOWN come before the complements', () => {
    expect(sayAll(clause(np('CAT'), 'MOVE', {
      directObject: np('BOOK'), verbPhrase: { modifier: 'UP' }, complements: { locative: { phrase: np('HOUSE') } },
    })).en).toBe('the cat moves the book up in the house.');
    expect(sayAll(clause(np('CAT'), 'MOVE', {
      directObject: np('BOOK'), verbPhrase: { modifier: 'DOWN' }, complements: { cause: { phrase: np('DOG') } },
    })).en).toBe('the cat moves the book down because of the dog.');
    expect(sayAll(clause(np('CAT'), 'JUMP', {
      verbPhrase: { modifier: 'DOWN' }, complements: { source: { phrase: np('WALL') } },
    })).en).toBe('the cat jumps down from the wall.');
    expect(sayAll(clause(np('PERSON', { gender: 'fem', definiteness: 'no', adjectives: ['LOW', 'BAD'] }), 'BITE', {
      directObject: np('AFRICA', { definiteness: 'this' }),
      verbPhrase: { tense: 'past', aspect: 'resultative', modifier: 'DOWN', modals: ['CAN'] },
      complements: { locative: { phrase: np('WOMAN', { gender: 'fem', definiteness: 'some' }) } },
    })).en).toBe('no low bad person could have bitten Africa down in some women.');
  });

  // The generalisation: the slot is right after the object, so it holds under a modal, in the
  // periphrastic aspects and in a relative clause, and it takes a pronoun object with it.
  test('…under a modal, in the prospective, and in a relative clause', () => {
    expect(sayAll(clause(np('CAT'), 'MOVE', {
      directObject: np('BOOK'), verbPhrase: { modifier: 'UP', modals: ['MUST'] }, complements: { locative: { phrase: np('HOUSE') } },
    })).en).toBe('the cat must move the book up in the house.');
    expect(sayAll(clause(np('CAT'), 'MOVE', {
      directObject: np('BOOK'), verbPhrase: { modifier: 'UP', aspect: 'prospective' }, complements: { locative: { phrase: np('HOUSE') } },
    })).en).toBe('the cat is about to move the book up in the house.');
    expect(sayAll(clause(np('CAT', {
      relative: { verbPhrase: { verb: 'MOVE', modifier: 'DOWN' }, directObject: np('BOOK'), complements: { locative: { phrase: np('HOUSE') } } },
    }), 'RUN')).en).toBe('the cat that moves the book down in the house runs.');
  });

  test('…and after a pronoun object', () => {
    expect(sayAll(clause(np('CAT'), 'MOVE', {
      directObject: np('THIRD_PERSON', { gender: 'masc' }), verbPhrase: { modifier: 'UP' }, complements: { locative: { phrase: np('HOUSE') } },
    })).en).toBe('the cat moves him up in the house.');
  });

  // Regression: a manner adverb still takes the clause's edge, behind the complements.
  test('regression: a manner adverb still trails the complements', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', {
      verbPhrase: { modifier: 'FAST' }, complements: { locative: { phrase: np('HOUSE') } },
    })).en).toBe('the cat runs in the house fast.');
  });

  test('regression: with no complement it already follows the object, and Japanese is right', () => {
    const plan = clause(np('CAT'), 'MOVE', {
      directObject: np('BOOK'), verbPhrase: { modifier: 'UP' }, complements: { locative: { phrase: np('HOUSE') } },
    });
    expect(sayAll(clause(np('CAT'), 'MOVE', { directObject: np('BOOK'), verbPhrase: { modifier: 'UP' } })).en)
      .toBe('the cat moves the book up.');
    expect(sayAll(plan).ja).toBe('猫は家で本を上に移動します。');
  });
});

// A162. Spanish and Portuguese say "together" with "juntos", which is a predicative *adjective* and
// agrees with the subject — "las gatas comen juntas". The seed carried it as an ordinary invariant
// adverb, so a feminine subject kept the masculine form. The other five languages have a real
// adverb (insieme / ensemble / zusammen / together / 一緒に) and are unaffected; it surfaced on
// COORDINATE's definition, "inducir personas a actuar juntos" (localization C08).
describe('known bugs: Spanish and Portuguese "juntos" does not agree with the subject', () => {
  const eatTogether = (extra: Partial<NounPhrase>, verbPhrase: Partial<VerbPhrase> = {}) =>
    sayAll(clause(np('CAT', { number: 'plural', ...extra }), 'EAT', { verbPhrase: { modifier: 'TOGETHER', ...verbPhrase } }));

  test('a feminine plural subject takes the feminine juntas', () => {
    expect(eatTogether({ gender: 'fem' })).toMatchObject({
      es: 'las gatas comen juntas.',
      pt: 'as gatas comem juntas.',
    });
  });

  test('a masculine plural subject is already right, and the other five are invariant', () => {
    expect(eatTogether({})).toMatchObject({
      en: 'the cats eat together.',
      it: 'i gatti mangiano insieme.',
      fr: 'les chats mangent ensemble.',
      de: 'die Kater fressen zusammen.',
      es: 'los gatos comen juntos.',
      ja: '猫は一緒に食べます。',
      pt: 'os gatos comem juntos.',
    });
  });

  // The generalisation: the word agrees wherever the clause puts it, because it is read off the
  // subject and not off the verb — so every shape of the verb group carries the agreement along.
  test('…under a modal, in the marked aspects, and negated', () => {
    expect(eatTogether({ gender: 'fem' }, { modals: ['MUST'] })).toMatchObject({
      es: 'las gatas deben comer juntas.',
      pt: 'as gatas devem comer juntas.',
    });
    expect(eatTogether({ gender: 'fem' }, { aspect: 'progressive' })).toMatchObject({
      es: 'las gatas están comiendo juntas.',
      pt: 'as gatas estão comendo juntas.',
    });
    expect(eatTogether({ gender: 'fem' }, { aspect: 'resultative' })).toMatchObject({
      es: 'las gatas han comido juntas.',
      pt: 'as gatas comeram juntas.',
    });
    expect(eatTogether({ gender: 'fem' }, { negative: true })).toMatchObject({
      es: 'las gatas no comen juntas.',
      pt: 'as gatas não comem juntas.',
    });
  });

  // A relative clause and an imperative agree with the noun standing in for the subject — the head
  // noun and the addressee — which is the same `subjectForms` the finite verb already agrees with.
  test('…in a relative clause, and in an imperative', () => {
    expect(sayAll(clause(np('CAT', {
      number: 'plural', gender: 'fem',
      relative: { verbPhrase: { verb: 'EAT', modifier: 'TOGETHER' } },
    }), 'RUN'))).toMatchObject({
      es: 'las gatas que comen juntas corren.',
      pt: 'as gatas que comem juntas correm.',
    });
    expect(sayAll({
      ...clause(np('SECOND_PERSON', { number: 'plural', gender: 'fem' }), 'EAT', { verbPhrase: { modifier: 'TOGETHER' } }),
      imperative: true,
    })).toMatchObject({ es: 'comed juntas.', pt: 'comam juntas.' });
  });

  // The defect was found on COORDINATE's definition, an object-controlled infinitive whose causee is
  // the feminine PERSON (localization C08); it agrees with the controller, as a predicate adjective
  // in such a clause already did. The whole definition is pinned in `causative.test.ts`.
  test('…and with the causee of an object-controlled infinitive', () => {
    expect(sayAll({
      subject: np('GENERIC_PERSON'),
      verbPhrase: { verb: 'CAUSE_VERB' },
      directObject: np('PERSON', { number: 'plural', definiteness: 'bare' }),
      infinitiveComplement: { verbPhrase: { verb: 'ACT', modifier: 'TOGETHER' }, control: 'object' },
      infinitive: true,
    })).toMatchObject({
      es: 'inducir personas a actuar juntas.',
      pt: 'induzir pessoas a agir juntas.',
    });
  });

  // A singular subject is a semantically odd plan — "together" needs somebody to be together with —
  // but the form still tracks the subject rather than sitting frozen in the masculine plural.
  test('…and a singular subject, which no longer keeps a plural form', () => {
    expect(eatTogether({ number: 'singular', gender: 'fem' })).toMatchObject({
      es: 'la gata come junta.',
      pt: 'a gata come junta.',
    });
    expect(eatTogether({ number: 'singular' })).toMatchObject({
      es: 'el gato come junto.',
      pt: 'o gato come junto.',
    });
  });

  // Regression: only a lexeme carrying an agreeing stem is inflected. An ordinary adverb still emits
  // its one form whatever the subject, and the preverbal "nunca" slot is untouched.
  test('regression: a true adverb is invariant, and "nunca" still fronts', () => {
    expect(sayAll(clause(np('CAT', { number: 'plural', gender: 'fem' }), 'EAT', { verbPhrase: { modifier: 'FAST' } })))
      .toMatchObject({ es: 'las gatas comen rápido.', pt: 'as gatas comem rapidamente.' });
    expect(sayAll(clause(np('CAT', { number: 'plural', gender: 'fem' }), 'EAT', { verbPhrase: { modifier: 'NEVER' } })))
      .toMatchObject({ es: 'las gatas nunca comen.', pt: 'as gatas nunca comem.' });
  });
});

// A189. EVERYWHERE says where the action happens, as a locative complement does, so it stands where
// a locative stands: after the complements the verb takes, before the cause. It takes the direction
// adverb's slot instead, at the head of the complements (A156), which puts it ahead of a predicate,
// a recipient and an object complement: "the cat seems everywhere tired", "gives the book everywhere
// to the dog". After a Romance copula it reads as the copula's own place ("el gato está en todas
// partes cansado"). Found by the random phrase "can those ice creams that hold all young men seem
// everywhere young to the fox?" (seed 502394).
describe('known bugs: an adverb of place before the complements', () => {
  const everywhere = (verb: string, extra: Omit<Partial<PhrasePlan>, 'subject' | 'verbPhrase'> = {}, verbPhrase: Partial<VerbPhrase> = {}) =>
    sayAll(clause(np('CAT'), verb, { verbPhrase: { modifier: 'EVERYWHERE', ...verbPhrase }, ...extra }));
  const tired = { complements: { predicative: { phrase: np('TIRED') } } };
  const aLegend = { complements: { predicative: { phrase: np('LEGEND', { definiteness: 'indefinite' }) } } };

  test('EVERYWHERE follows the predicate, the recipient and the object complement', () => {
    expect(everywhere('SEEM', tired)).toMatchObject({
      en: 'the cat seems tired everywhere.', // now: "seems everywhere tired"
      it: 'il gatto sembra stanco ovunque.',
      fr: 'le chat semble fatigué partout.',
      es: 'el gato parece cansado en todas partes.',
      pt: 'o gato parece cansado em toda parte.',
    });
    expect(everywhere('BE', { complements: { predicative: { phrase: np('TIRED') }, cause: { phrase: np('DOG') } } })).toMatchObject({
      en: 'the cat is tired everywhere because of the dog.',
      it: 'il gatto è stanco ovunque a causa del cane.',
      fr: 'le chat est fatigué partout à cause du chien.',
      es: 'el gato está cansado en todas partes a causa del perro.', // now: "está en todas partes cansado"
      pt: 'o gato está cansado em toda parte por causa do cão.',
    });
    expect(everywhere('BE', aLegend)).toMatchObject({ en: 'the cat is a legend everywhere.', es: 'el gato es una leyenda en todas partes.' });
    expect(everywhere('BECOME', aLegend)).toMatchObject({ en: 'the cat becomes a legend everywhere.', it: 'il gatto diventa una leggenda ovunque.' });
    expect(everywhere('BE', tired, { negative: true })).toMatchObject({ en: 'the cat is not tired everywhere.', fr: "le chat n'est pas fatigué partout." });
    expect(everywhere('BE', tired, { modals: ['CAN'] })).toMatchObject({ en: 'the cat can be tired everywhere.', es: 'el gato puede estar cansado en todas partes.' });
    expect(everywhere('BE', tired, { aspect: 'resultative' })).toMatchObject({ en: 'the cat has been tired everywhere.', pt: 'o gato esteve cansado em toda parte.' });
    expect(everywhere('GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('DOG') } } })).toMatchObject({
      en: 'the cat gives the book to the dog everywhere.', // now: "gives the book everywhere to the dog"
      it: 'il gatto dà il libro al cane ovunque.',
      fr: 'le chat donne le livre au chien partout.',
      es: 'el gato da el libro al perro en todas partes.',
      pt: 'o gato dá o livro ao cão em toda parte.',
    });
    expect(everywhere('TRANSFORM', { directObject: np('HOUSE'), complements: { objectPredicative: { phrase: np('PRISON', { definiteness: 'indefinite' }) } } })).toMatchObject({
      en: 'the cat transforms the house into a prison everywhere.',
      fr: 'le chat transforme la maison en une prison partout.',
      pt: 'o gato transforma a casa em uma prisão em toda parte.',
    });
    expect(sayAll({
      subject: np('ICE_CREAM', {
        number: 'plural', definiteness: 'that',
        relative: { verbPhrase: { verb: 'HOLD' }, directObject: np('YOUNG_MAN', { definiteness: 'all' }) },
      }),
      verbPhrase: { verb: 'SEEM', modifier: 'EVERYWHERE', modals: ['CAN'] },
      complements: { predicative: { phrase: np('YOUNG') }, terminus: { phrase: np('FOX') } },
      interrogative: true,
    })).toMatchObject({
      en: 'can those ice creams that hold all young men seem young to the fox everywhere?',
      it: 'quei gelati che contengono tutti i giovani possono sembrare giovani alla volpe ovunque?',
      fr: 'est-ce que ces glaces qui contiennent tous les jeunes hommes peuvent sembler jeunes au renard partout\u00a0?',
      es: '¿esos helados que contienen a todos los jóvenes pueden parecer jóvenes al zorro en todas partes?',
      pt: 'esses sorvetes que contêm todos os jovens podem parecer jovens à raposa em toda parte?',
    });
  });

  // The generalisation: the slot is the locative's own, so it holds wherever a locative stands —
  // behind the motion path, just ahead of a locative — and in every branch that renders the
  // complements: a question, a command, a relative clause.
  test('…just ahead of a locative, behind the path, and in the other branches', () => {
    expect(everywhere('RUN', { complements: { locative: { phrase: np('HOUSE') } } })).toMatchObject({
      en: 'the cat runs everywhere in the house.',
      it: 'il gatto corre ovunque nella casa.',
      fr: 'le chat court partout dans la maison.',
      es: 'el gato corre en todas partes en la casa.',
      pt: 'o gato corre em toda parte na casa.',
    });
    expect(everywhere('RUN', { complements: { source: { phrase: np('HOUSE') }, locative: { phrase: np('MARKET') } } })).toMatchObject({
      en: 'the cat runs from the house everywhere in the market.',
      it: 'il gatto corre via dalla casa ovunque nel mercato.',
      fr: 'le chat court loin de la maison partout dans le marché.',
      es: 'el gato corre lejos de la casa en todas partes en el mercado.',
      pt: 'o gato corre longe da casa em toda parte no mercado.',
    });
    expect(everywhere('SEEM', { complements: { predicative: { phrase: np('TIRED') }, locative: { phrase: np('HOUSE') } } })).toMatchObject({
      en: 'the cat seems tired everywhere in the house.',
      fr: 'le chat semble fatigué partout dans la maison.',
      pt: 'o gato parece cansado em toda parte na casa.',
    });
    expect(everywhere('EAT', { directObject: np('MOUSE'), interrogative: true })).toMatchObject({
      en: 'does the cat eat the mouse everywhere?',
      fr: 'est-ce que le chat mange la souris partout ?',
      it: 'il gatto mangia il topo ovunque?',
    });
    expect(sayAll({
      subject: np('SECOND_PERSON'), verbPhrase: { verb: 'EAT', modifier: 'EVERYWHERE' }, directObject: np('MOUSE'), imperative: true,
    })).toMatchObject({ en: 'eat the mouse everywhere.', es: 'come el ratón en todas partes.' });
    expect(sayAll(clause(np('DOG', {
      relative: { verbPhrase: { verb: 'SEEM', modifier: 'EVERYWHERE' }, complements: { predicative: { phrase: np('TIRED') } } },
    }), 'RUN'))).toMatchObject({
      en: 'the dog that seems tired everywhere runs.',
      it: 'il cane che sembra stanco ovunque corre.',
      es: 'el perro que parece cansado en todas partes corre.',
    });
  });

  // Regression: after an object and ahead of a cause it is already where a locative stands, German's
  // middle field rightly puts it before the predicate, and Japanese is right.
  test('regression: an object and a cause, German and Japanese are right', () => {
    expect(everywhere('EAT', { directObject: np('MOUSE'), complements: { cause: { phrase: np('DOG') } } })).toMatchObject({
      en: 'the cat eats the mouse everywhere because of the dog.',
      it: 'il gatto mangia il topo ovunque a causa del cane.',
      fr: 'le chat mange la souris partout à cause du chien.',
      es: 'el gato come el ratón en todas partes a causa del perro.',
      pt: 'o gato come o rato em toda parte por causa do cão.',
    });
    expect(everywhere('RUN', { complements: { cause: { phrase: np('DOG') } } })).toMatchObject({
      en: 'the cat runs everywhere because of the dog.', it: 'il gatto corre ovunque a causa del cane.',
    });
    expect(everywhere('SEEM', tired).de).toBe('der Kater scheint überall müde.');
    expect(everywhere('BE', aLegend)).toMatchObject({ de: 'der Kater ist überall eine Legende.', ja: '猫はどこでも伝説です。' });
    expect(everywhere('BE', tired).ja).toBe('猫はどこでも疲れています。');
    expect(everywhere('RUN', { complements: { locative: { phrase: np('HOUSE') } } }))
      .toMatchObject({ de: 'der Kater läuft überall im Haus.', ja: '猫は家でどこでも走ります。' });
  });
});

// A193. A particle after an object that carries a relative clause attaches to the relative clause's
// verb: "the cat moves the book that sees the dog up" reads as "sees the dog up". English puts the
// particle ahead of such an object, "moves up the book that sees the dog". A156's split order is only
// for a short object and a pronoun. Found by the random phrase "no careful missing death was drinking
// their least cold prison that feels missing Asia up because of all food, …" (seed 502396).
describe('known bugs: an English particle after an object with a relative clause', () => {
  const bookThat = (relative: NonNullable<NounPhrase['relative']> = { verbPhrase: { verb: 'SEE' }, directObject: np('DOG') }) =>
    np('BOOK', { relative });
  const moves = (verbPhrase: Partial<VerbPhrase> = {}, object: NounPhrase = bookThat()) =>
    clause(np('CAT'), 'MOVE', { directObject: object, verbPhrase: { modifier: 'UP', ...verbPhrase } });
  const command = (register?: 'instruction') =>
    ({ ...moves(), subject: np('SECOND_PERSON'), imperative: true, ...(register ? { imperativeRegister: register } : {}) });

  test('UP and DOWN come before an object with a relative clause', () => {
    expect(sayAll(moves()).en).toBe('the cat moves up the book that sees the dog.'); // now: "… sees the dog up"
    expect(sayAll(moves({ modifier: 'DOWN' })).en).toBe('the cat moves down the book that sees the dog.');
    expect(sayAll(moves({ tense: 'past' })).en).toBe('the cat moved up the book that sees the dog.');
    expect(sayAll(moves({ negative: true })).en).toBe('the cat does not move up the book that sees the dog.');
    expect(sayAll(moves({ modals: ['MUST'] })).en).toBe('the cat must move up the book that sees the dog.');
    expect(sayAll(moves({ aspect: 'progressive' })).en).toBe('the cat is moving up the book that sees the dog.');
    expect(sayAll(moves({ aspect: 'resultative' })).en).toBe('the cat has moved up the book that sees the dog.');
    expect(sayAll(moves({}, bookThat({ headRole: 'directObject', subject: np('DOG'), verbPhrase: { verb: 'SEE' } }))).en)
      .toBe('the cat moves up the book that the dog sees.');
    expect(sayAll(command()).en).toBe('move up the book that sees the dog.');
    expect(sayAll(command('instruction')).en).toBe('move up the book that sees the dog.');
    expect(sayAll({ ...moves(), interrogative: true }).en).toBe('does the cat move up the book that sees the dog?');
    expect(sayAll({
      subject: np('DEATH', { definiteness: 'no', adjectives: ['CAREFUL', 'MISSING'] }),
      verbPhrase: { verb: 'DRINK', tense: 'past', aspect: 'progressive', modifier: 'UP' },
      directObject: np('PRISON', {
        adjectives: ['COLD'], adjectiveDegrees: ['least'],
        possessor: { kind: 'pronominal', person: '3', number: 'plural', gender: 'fem' },
        relative: { verbPhrase: { verb: 'FEEL' }, directObject: np('ASIA', { adjectives: ['MISSING'] }) },
      }),
      complements: { cause: { phrase: np('FOOD', { definiteness: 'all' }) } },
    }).en).toBe('no careful missing death was drinking up their least cold prison that feels missing Asia because of all food.');
  });

  // The generalisation: the hoist is on the object slot, so it reaches a relative clause's own
  // predicate and the future's verb group, and a coordinated object takes it as soon as one conjunct
  // carries a relative clause. A place adverb is no particle — it stands where a locative does
  // (A189) — so it stays behind the object whatever the object holds.
  test('…inside a relative clause, in the future, and across a coordinated object', () => {
    expect(sayAll(clause(np('CAT', {
      relative: { verbPhrase: { verb: 'MOVE', modifier: 'UP' }, directObject: bookThat() },
    }), 'RUN')).en).toBe('the cat that moves up the book that sees the dog runs.');
    expect(sayAll(moves({ tense: 'future' })).en).toBe('the cat will move up the book that sees the dog.');
    expect(sayAll(clause(np('CAT'), 'MOVE', {
      directObject: { conjuncts: [bookThat(), np('FOOD')], conjunction: 'and' }, verbPhrase: { modifier: 'UP' },
    })).en).toBe('the cat moves up the book that sees the dog and the food.');
    expect(sayAll(clause(np('CAT'), 'MOVE', {
      directObject: { conjuncts: [np('BOOK'), np('FOOD')], conjunction: 'and' }, verbPhrase: { modifier: 'UP' },
    })).en).toBe('the cat moves the book and the food up.');
    expect(sayAll(moves({ modifier: 'EVERYWHERE' })).en).toBe('the cat moves the book that sees the dog everywhere.');
  });

  // Regression: a short object and a pronoun keep A156's order, and German and Japanese are right.
  test('regression: a short object, a pronoun, German and Japanese are right', () => {
    expect(sayAll(moves({}, np('BOOK'))).en).toBe('the cat moves the book up.');
    expect(sayAll(moves({}, np('THIRD_PERSON', { gender: 'masc' }))).en).toBe('the cat moves him up.');
    expect(sayAll(clause(np('CAT'), 'MOVE', {
      directObject: np('BOOK'), verbPhrase: { modifier: 'UP' }, complements: { locative: { phrase: np('HOUSE') } },
    })).en).toBe('the cat moves the book up in the house.');
    expect(sayAll(moves())).toMatchObject({
      de: 'der Kater verschiebt das Buch, das den Hund sieht, nach oben.',
      ja: '猫は犬を見る本を上に移動します。',
    });
  });
});

// A294. A155 put French "bien" before the non-finite verb it modifies, but a passive's participle is
// that verb too. In a simple tense "bien" still trails it ("est mangée bien par le chien"), and in a
// periphrastic passive it lands before "être" / "été" ("a bien été mangée"), where it reads as the
// assertive "indeed" rather than the manner. It belongs right before the participle.
describe('known bugs: French "bien" before the passive participle', () => {
  const mouseEatenWell = (verbPhrase: Partial<VerbPhrase> = {}, extra: Partial<PhrasePlan> = {}) => sayAll({
    ...clause(np('DOG'), 'EAT', { directObject: np('MOUSE'), verbPhrase: { modifier: 'WELL', voice: 'passive', ...verbPhrase } }),
    ...extra,
  }).fr;

  test('in a simple tense, between être and the participle', () => {
    expect(mouseEatenWell()).toBe('la souris est bien mangée par le chien.');
    expect(mouseEatenWell({ tense: 'future' })).toBe('la souris sera bien mangée par le chien.');
    expect(mouseEatenWell({ negative: true })).toBe("la souris n'est pas bien mangée par le chien.");
    expect(sayAll(clause(np('MOUSE', {
      relative: {
        verbPhrase: { verb: 'EAT', tense: 'future', modifier: 'WELL', voice: 'passive', negative: true },
        headRole: 'directObject', subject: np('DOG'),
      },
    }), 'RUN')).fr).toBe('la souris qui ne sera pas bien mangée par le chien court.');
  });

  test('in a periphrastic passive, after être / été rather than before it', () => {
    expect(mouseEatenWell({ aspect: 'resultative' })).toBe('la souris a été bien mangée par le chien.');
    expect(mouseEatenWell({ aspect: 'resultative', negative: true })).toBe("la souris n'a pas été bien mangée par le chien.");
    expect(mouseEatenWell({ aspect: 'progressive' })).toBe("la souris est en train d'être bien mangée par le chien.");
    expect(mouseEatenWell({ modals: ['MUST'] })).toBe('la souris doit être bien mangée par le chien.');
    expect(mouseEatenWell({ modals: ['MUST'], aspect: 'resultative' })).toBe('la souris doit avoir été bien mangée par le chien.');
    expect(mouseEatenWell({}, { infinitive: true })).toBe('être bien mangée par le chien.');
  });

  test('the prospective, the passé simple, a plural participle, the agentless passive and a negated citation', () => {
    expect(mouseEatenWell({ aspect: 'prospective' })).toBe("la souris est sur le point d'être bien mangée par le chien.");
    expect(mouseEatenWell({ tense: 'past' })).toBe('la souris fut bien mangée par le chien.');
    expect(sayAll(clause(np('DOG'), 'EAT', {
      directObject: np('MOUSE', { number: 'plural' }), verbPhrase: { modifier: 'WELL', voice: 'passive', aspect: 'resultative' },
    })).fr).toBe('les souris ont été bien mangées par le chien.');
    expect(sayAll(clause(np('GENERIC_PERSON'), 'EAT', { directObject: np('MOUSE'), verbPhrase: { modifier: 'WELL', voice: 'passive' } })).fr)
      .toBe('la souris est bien mangée.');
    expect(mouseEatenWell({ negative: true }, { infinitive: true })).toBe('ne pas être bien mangée par le chien.');
  });

  test('regression: the active participle, a -ment adverb and a frequency adverb are already placed', () => {
    expect(sayAll(clause(np('DOG'), 'EAT', { directObject: np('MOUSE'), verbPhrase: { modifier: 'WELL', aspect: 'resultative' } })).fr)
      .toBe('le chien a bien mangé la souris.');
    expect(mouseEatenWell({ tense: 'future', modifier: 'SLOWLY' })).toBe('la souris sera mangée lentement par le chien.');
    expect(mouseEatenWell({ tense: 'future', modifier: 'ALWAYS' })).toBe('la souris sera toujours mangée par le chien.');
  });
});

// A296. An English passive carries its participle and by-phrase in the object slot, so a manner
// adverb trails them like it trails an object: "is eaten by the dog well". In a passive the manner
// adverb goes with the participle, ahead of the demoted agent: "is eaten well by the dog".
describe('known bugs: English manner adverb after the by-phrase', () => {
  const mouseEaten = (verbPhrase: Partial<VerbPhrase> = {}, extra: Partial<PhrasePlan> = {}) => sayAll({
    ...clause(np('DOG'), 'EAT', { directObject: np('MOUSE'), verbPhrase: { modifier: 'WELL', voice: 'passive', ...verbPhrase } }),
    ...extra,
  }).en;

  test('English puts a manner adverb before the by-phrase', () => {
    expect(mouseEaten()).toBe('the mouse is eaten well by the dog.');
    expect(mouseEaten({ tense: 'future' })).toBe('the mouse will be eaten well by the dog.');
    expect(mouseEaten({ negative: true })).toBe('the mouse is not eaten well by the dog.');
    expect(mouseEaten({ tense: 'future', modifier: 'SLOWLY' })).toBe('the mouse will be eaten slowly by the dog.');
    expect(mouseEaten({}, { interrogative: true })).toBe('is the mouse eaten well by the dog?');
    expect(mouseEaten({}, { complements: { locative: { phrase: np('HOUSE') } } })).toBe('the mouse is eaten well by the dog in the house.');
  });

  test('English puts it there in every verb group and in a relative clause', () => {
    expect(mouseEaten({ aspect: 'resultative' })).toBe('the mouse has been eaten well by the dog.');
    expect(mouseEaten({ aspect: 'progressive' })).toBe('the mouse is being eaten well by the dog.');
    expect(mouseEaten({ modals: ['MUST'] })).toBe('the mouse must be eaten well by the dog.');
    expect(mouseEaten({}, { infinitive: true })).toBe('to be eaten well by the dog.');
    expect(sayAll(clause(np('MOUSE', {
      relative: {
        verbPhrase: { verb: 'EAT', tense: 'future', modifier: 'WELL', voice: 'passive', negative: true },
        headRole: 'directObject', subject: np('DOG'),
      },
    }), 'RUN')).en).toBe('the mouse that will not be eaten well by the dog runs.');
  });

  test('the prospective, the past, a plural subject and agent, and a pronoun agent', () => {
    expect(mouseEaten({ aspect: 'prospective' })).toBe('the mouse is about to be eaten well by the dog.');
    expect(mouseEaten({ tense: 'past' })).toBe('the mouse was eaten well by the dog.');
    expect(sayAll(clause(np('DOG', { number: 'plural' }), 'EAT', {
      directObject: np('MOUSE', { number: 'plural' }), verbPhrase: { modifier: 'SLOWLY', voice: 'passive', tense: 'past' },
    })).en).toBe('the mice were eaten slowly by the dogs.');
    expect(sayAll(clause(np('FIRST_PERSON'), 'EAT', { directObject: np('MOUSE'), verbPhrase: { modifier: 'WELL', voice: 'passive' } })).en)
      .toBe('the mouse is eaten well by me.');
  });

  test('regression: a place adverb, a negated time adverb and a sentence adverb keep their own slots', () => {
    expect(mouseEaten({ modifier: 'EVERYWHERE' })).toBe('the mouse is eaten by the dog everywhere.');
    expect(mouseEaten({ modifier: 'ALREADY', negative: true })).toBe('the mouse is not eaten by the dog yet.');
    expect(mouseEaten({ modifier: 'MAYBE' })).toBe('maybe the mouse is eaten by the dog.');
  });

  test('regression: the active clause, the agentless passive and a frequency adverb are already placed', () => {
    expect(sayAll(clause(np('DOG'), 'EAT', { directObject: np('MOUSE'), verbPhrase: { modifier: 'WELL' } })).en)
      .toBe('the dog eats the mouse well.');
    expect(sayAll(clause(np('GENERIC_PERSON'), 'EAT', { directObject: np('MOUSE'), verbPhrase: { modifier: 'WELL', voice: 'passive' } })).en)
      .toBe('the mouse is eaten well.');
    expect(mouseEaten({ tense: 'future', modifier: 'ALWAYS' })).toBe('the mouse will always be eaten by the dog.');
  });
});

// A353. A156 put English UP and DOWN right after the verb or its object, ahead of the complements
// ("moves the book up in the house"). In a passive the by-phrase comes first, so the particle trails
// the agent: "the book is moved by the cat up". The particle goes with the participle, as it does
// with no agent ("the book is moved up"): "the book is moved up by the cat". A296 did the same for a
// manner adverb.
describe('known bugs: English direction adverb after the by-phrase (A353)', () => {
  const moved = (verbPhrase: Partial<VerbPhrase>, extra: Omit<Partial<PhrasePlan>, 'verbPhrase'> = {}) =>
    sayAll(clause(np('CAT'), 'MOVE', { directObject: np('BOOK'), verbPhrase: { voice: 'passive', ...verbPhrase }, ...extra })).en;

  test('the simple tenses', () => {
    expect(moved({ modifier: 'UP' })).toBe('the book is moved up by the cat.');
    expect(moved({ modifier: 'DOWN', tense: 'past' })).toBe('the book was moved down by the cat.');
  });

  test('under a modal, and with a complement', () => {
    expect(moved({ modifier: 'UP', modals: ['MUST'] })).toBe('the book must be moved up by the cat.');
    expect(moved({ modifier: 'UP' }, { complements: { locative: { phrase: np('HOUSE') } } })).toBe('the book is moved up by the cat in the house.');
  });

  test('the prospective, the negative, a plural or pronoun agent, a recipient and an agent question', () => {
    expect(moved({ modifier: 'UP', aspect: 'prospective' })).toBe('the book is about to be moved up by the cat.');
    expect(moved({ modifier: 'UP', negative: true })).toBe('the book is not moved up by the cat.');
    expect(sayAll(clause(np('CAT', { number: 'plural' }), 'MOVE', { directObject: np('BOOK'), verbPhrase: { voice: 'passive', modifier: 'DOWN', tense: 'past' } })).en)
      .toBe('the book was moved down by the cats.');
    expect(sayAll(clause(np('FIRST_PERSON'), 'MOVE', { directObject: np('BOOK'), verbPhrase: { voice: 'passive', modifier: 'UP' } })).en)
      .toBe('the book is moved up by me.');
    expect(moved({ modifier: 'UP' }, { complements: { terminus: { phrase: np('CHILD') } } })).toBe('the book is moved up by the cat to the child.');
    // The stranded "by" of an agent question still closes the verb's arguments (A282).
    const whoMoves = (extra: Omit<Partial<PhrasePlan>, 'verbPhrase'> = {}): PhrasePlan => ({
      ...clause(np('GENERIC_PERSON'), 'MOVE', { directObject: np('BOOK'), verbPhrase: { voice: 'passive', modifier: 'UP' }, ...extra }),
      questionRole: 'subject', questionAnimate: true,
    });
    expect(sayAll(whoMoves()).en).toBe('who is the book moved up by?');
    expect(sayAll(whoMoves({ complements: { terminus: { phrase: np('CHILD') } } })).en).toBe('who is the book moved up to the child by?');
  });

  test('regression: the agentless passive, the active, and a manner adverb', () => {
    expect(sayAll(clause(np('GENERIC_PERSON'), 'MOVE', { directObject: np('BOOK'), verbPhrase: { voice: 'passive', modifier: 'UP' } })).en)
      .toBe('the book is moved up.');
    expect(sayAll(clause(np('CAT'), 'MOVE', { directObject: np('BOOK'), verbPhrase: { modifier: 'UP' } })).en).toBe('the cat moves the book up.');
    expect(moved({ modifier: 'WELL' })).toBe('the book is moved well by the cat.');
  });
});
