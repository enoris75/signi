import { describe, expect, test } from 'vitest';
import type { CoordConjunction, NounElement, NounPhrase, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';

// Coordinated nouns. Where the comma falls and whether the conjunction repeats is a fact about
// each language, so the engines do the joining; each conjunct keeps its own determiner, which
// is what Romance needs ("il gatto **e il** cane").
describe('coordinated noun groups', () => {
  test('two conjuncts, and the verb agrees with the pair', () => {
    expect(sayAll(clause({ conjuncts: [np('CAT'), np('DOG')], conjunction: 'and' }, 'RUN')))
      .toEqual({
        en: 'the cat and the dog run.', // plural agreement
        it: 'il gatto e il cane corrono.', // the article repeats
        fr: 'le chat et le chien courent.',
        es: 'el gato y el perro corren.',
        pt: 'o gato e o cão correm.',
        de: 'der Kater und der Hund laufen.',
        ja: '猫と犬は走ります。',
      });
  });

  test('three conjuncts take a comma, and the conjunction does not repeat', () => {
    expect(sayAll(clause(
      { conjuncts: [np('CAT'), np('DOG'), np('MOUSE')], conjunction: 'and' },
      'RUN',
    ))).toMatchObject({
      en: 'the cat, the dog and the mouse run.',
      it: 'il gatto, il cane e il topo corrono.',
      fr: 'le chat, le chien et la souris courent.',
      de: 'der Kater, der Hund und die Maus laufen.',
      // Japanese repeats と between every conjunct instead.
      ja: '猫と犬とネズミは走ります。',
    });
  });

  test('a disjunction agrees in the singular', () => {
    expect(sayAll(clause({ conjuncts: [np('CAT'), np('DOG')], conjunction: 'or' }, 'RUN')))
      .toMatchObject({
        en: 'the cat or the dog runs.',
        it: 'il gatto o il cane corre.',
        es: 'el gato o el perro corre.',
        de: 'der Kater oder der Hund läuft.',
      });
  });

  test('a coordinated direct object takes the object case throughout', () => {
    expect(sayAll(clause(np('BOY'), 'SEE', {
      directObject: { conjuncts: [np('CAT'), np('DOG')], conjunction: 'and' },
    }))).toMatchObject({
      en: 'the boy sees the cat and the dog.',
      // German marks the accusative on both conjuncts.
      de: 'der Junge sieht den Kater und den Hund.',
      ja: '男の子は猫と犬を見ます。',
    });
  });

  test('a disjoined object and disjoined complements repeat their marking per conjunct', () => {
    // OR (か in Japanese) works on a direct object, and on the adposition-bearing complements —
    // where the preposition (with its case and article-fusion) repeats per conjunct, exactly as AND.
    expect(sayAll(clause(np('CAT'), 'EAT', {
      directObject: { conjuncts: [np('MOUSE'), np('FOOD')], conjunction: 'or' },
    }))).toMatchObject({
      en: 'the cat eats the mouse or the food.',
      it: 'il gatto mangia il topo o il cibo.',
      de: 'der Kater isst die Maus oder das Essen.', // accusative on both
      ja: '猫はネズミか食べ物を食べます。', // か, を on the group
    });
    expect(sayAll(clause(np('CAT'), 'RUN', {
      complements: { locative: { phrase: { conjuncts: [np('HOUSE'), np('MARKET')], conjunction: 'or' } } },
    }))).toMatchObject({
      it: 'il gatto corre nella casa o nel mercato.', // the fused preposition repeats: nella / nel
      fr: 'le chat court dans la maison ou dans le marché.',
      de: 'der Kater läuft im Haus oder im Markt.',
      ja: '猫は家か市場で走ります。',
    });
    expect(sayAll(clause(np('CAT'), 'GIVE', {
      directObject: np('BOOK'),
      complements: { terminus: { phrase: { conjuncts: [np('DOG'), np('MOUSE')], conjunction: 'or' } } },
    }))).toMatchObject({
      it: 'il gatto dà il libro al cane o al topo.',
      de: 'der Kater gibt dem Hund oder der Maus das Buch.', // dative on both conjuncts
    });
  });
});

// Two independent clauses joined by a conjunction. Symmetric, unlike a condition.
describe('coordinated clauses', () => {
  test('copulative and adversative', () => {
    const join = (conjunction: 'and' | 'but') =>
      sayAll({
        ...clause(np('CAT'), 'RUN'),
        coordination: { conjunction, clause: clause(np('DOG'), 'JUMP') },
      });

    expect(join('and')).toMatchObject({
      en: 'the cat runs, and the dog jumps.',
      it: 'il gatto corre, e il cane salta.',
      de: 'der Kater läuft, und der Hund springt.',
    });
    expect(join('but')).toMatchObject({
      en: 'the cat runs, but the dog jumps.',
      it: 'il gatto corre, ma il cane salta.',
      es: 'el gato corre, pero el perro salta.',
      de: 'der Kater läuft, aber der Hund springt.',
    });
  });

  test('a conclusive conjunction inverts the German clause it introduces', () => {
    expect(sayAll({
      ...clause(np('CAT'), 'RUN'),
      coordination: { conjunction: 'therefore', clause: clause(np('DOG'), 'JUMP') },
    })).toMatchObject({
      en: 'the cat runs, so the dog jumps.',
      it: 'il gatto corre, quindi il cane salta.',
      fr: 'le chat court, donc le chien saute.',
      // "also" is a V2 adverb: the finite verb comes before the subject.
      de: 'der Kater läuft, also springt der Hund.',
    });
  });

  const join = (conjunction: CoordConjunction) =>
    sayAll({
      ...clause(np('CAT'), 'RUN'),
      coordination: { conjunction, clause: clause(np('DOG'), 'JUMP') },
    });

  test('disjunctive — "or"', () => {
    expect(join('or')).toMatchObject({
      en: 'the cat runs, or the dog jumps.',
      it: 'il gatto corre, o il cane salta.',
      fr: 'le chat court, ou le chien saute.',
      es: 'el gato corre, o el perro salta.',
      de: 'der Kater läuft, oder der Hund springt.',
      ja: '猫は走ります。または、犬は跳びます。',
    });
  });

  test('explicative — "that is"', () => {
    expect(join('that_is')).toMatchObject({
      en: 'the cat runs, that is, the dog jumps.', // parenthetical: a comma on both sides (A69)
      it: 'il gatto corre, cioè il cane salta.',
      fr: "le chat court, c'est-à-dire le chien saute.",
      es: 'el gato corre, es decir, el perro salta.',
      pt: 'o gato corre, isto é, o cão pula.',
      // "das heißt" is parenthetical, so — unlike "also" / "dann" — it does NOT invert.
      de: 'der Kater läuft, das heißt der Hund springt.',
      ja: '猫は走ります。つまり、犬は跳びます。',
    });
  });

  test('temporal — "then" carries its coordinator, and inverts German like "therefore"', () => {
    // Most languages mark sequence with an adverb, so the engines render "then" with a coordinator
    // in front of it ("and then", "e poi", "und dann"). German "dann" is a V2 adverb, so — like
    // "also" — the finite verb precedes the subject.
    expect(join('then')).toMatchObject({
      en: 'the cat runs, and then the dog jumps.',
      it: 'il gatto corre, e poi il cane salta.',
      fr: 'le chat court, et puis le chien saute.',
      es: 'el gato corre, y luego el perro salta.',
      pt: 'o gato corre, e depois o cão pula.',
      de: 'der Kater läuft, und dann springt der Hund.',
      ja: '猫は走ります。それから、犬は跳びます。',
    });
  });

  test('German V2: "therefore" and "then" invert, the other four do not', () => {
    // The finite verb "springt" leads for the inverting pair, and trails the subject "der Hund"
    // for the rest — the one German axis the six conjunctions split on.
    expect(join('therefore').de).toContain('springt der Hund');
    expect(join('then').de).toContain('springt der Hund');
    for (const conjunction of ['and', 'or', 'but', 'that_is'] as const) {
      expect(join(conjunction).de).toContain('der Hund springt');
    }
  });
});

// Two commands coordinate ("eat the bread, then run!"), but a statement and a command do not: a
// symmetric join means both halves carry the same illocutionary force. So the mood belongs to the
// PAIR, and an imperative hands its mood, its register and its addressee down to the clause it
// coordinates with.
describe('coordinated clauses: two imperatives', () => {
  const command = (verb: string, directObject?: string): PhrasePlan => ({
    ...clause(np('SECOND_PERSON'), verb, directObject ? { directObject: np(directObject) } : {}),
    imperative: true,
  });

  const joined = (conjunction: 'and' | 'then' | 'but' | 'or') => sayAll({
    ...command('EAT', 'FOOD'),
    coordination: { conjunction, clause: command('RUN') },
  });

  test('both clauses render as commands', () => {
    expect(joined('and')).toEqual({
      en: 'eat the food, and run.',
      it: 'mangia il cibo, e corri.',
      fr: 'mange la nourriture, et cours.',
      es: 'come la comida, y corre.',
      pt: 'coma a comida, e corra.',
      de: 'iss das Essen, und lauf.',
      ja: '食べ物を食べてください。そして、走ってください。',
    });
  });

  test('each conjunction a command may take', () => {
    // Only these four: `therefore` and `that_is` relate propositions, and a command asserts
    // nothing to relate — see IMPERATIVE_COORD_CONJUNCTIONS.
    expect(joined('then')).toMatchObject({
      en: 'eat the food, and then run.',
      it: 'mangia il cibo, e poi corri.',
      de: 'iss das Essen, und dann lauf.',
      ja: '食べ物を食べてください。それから、走ってください。',
    });
    expect(joined('but')).toMatchObject({
      en: 'eat the food, but run.',
      es: 'come la comida, pero corre.',
      de: 'iss das Essen, aber lauf.',
    });
    expect(joined('or')).toMatchObject({
      en: 'eat the food, or run.',
      it: 'mangia il cibo, o corri.',
      de: 'iss das Essen, oder lauf.',
    });
  });

  test('the register is handed down as well as the mood', () => {
    // An `instruction` parent makes the coordinated clause an instruction too: both go to the
    // infinitive in French/Spanish/German, and both to the verbal noun in Japanese.
    expect(sayAll({
      ...command('EAT', 'FOOD'),
      imperativeRegister: 'instruction',
      coordination: { conjunction: 'then', clause: command('RUN') },
    })).toMatchObject({
      fr: 'manger la nourriture, et puis courir.',
      es: 'comer la comida, y luego correr.',
      de: 'das Essen essen, und dann laufen.',
      ja: '食べ物を食べ、それから走り。',
    });
  });

  test('the addressee is the parent\'s, not the coordinated clause\'s', () => {
    // The second clause names a 2nd-PLURAL addressee, and it is ignored: the command stays 2sg
    // ("corri", not "correte"). One pair, one addressee.
    expect(sayAll({
      ...command('EAT', 'FOOD'),
      coordination: {
        conjunction: 'and',
        clause: { ...clause(np('SECOND_PERSON', { number: 'plural' }), 'RUN'), imperative: true },
      },
    })).toMatchObject({
      it: 'mangia il cibo, e corri.',
      fr: 'mange la nourriture, et cours.',
      de: 'iss das Essen, und lauf.',
    });
  });
});

// Mixing the moods. The pair's mood is the PARENT's, and the coordinated clause is coerced to it
// — in both directions. Neither is an error; the translator normalises rather than refusing.
describe('coordinated clauses: an imperative and an indicative', () => {
  const eatCommand: PhrasePlan = {
    ...clause(np('SECOND_PERSON'), 'EAT', { directObject: np('FOOD') }),
    imperative: true,
  };
  const runStatement: PhrasePlan = clause(np('SECOND_PERSON'), 'RUN');

  test('an imperative parent COERCES an unflagged clause into a command', () => {
    // The coordinated clause is a plain indicative plan — no `imperative` flag — and it still
    // comes out as a command, subject dropped. Identical to flagging it.
    const coerced = sayAll({
      ...eatCommand,
      coordination: { conjunction: 'and', clause: runStatement },
    });

    expect(coerced).toMatchObject({
      en: 'eat the food, and run.', // not "and you run"
      it: 'mangia il cibo, e corri.',
      de: 'iss das Essen, und lauf.',
      ja: '食べ物を食べてください。そして、走ってください。',
    });

    expect(coerced).toEqual(sayAll({
      ...eatCommand,
      coordination: {
        conjunction: 'and',
        clause: { ...runStatement, imperative: true },
      },
    }));
  });

  test('…and it discards the coordinated clause\'s own subject', () => {
    // The second clause names the CAT as its subject. An imperative has no third-person
    // addressee, so the subject is dropped and the parent's addressee governs.
    expect(sayAll({
      ...eatCommand,
      coordination: { conjunction: 'and', clause: clause(np('CAT'), 'RUN') },
    })).toMatchObject({
      en: 'eat the food, and run.', // not "and the cat runs"
      it: 'mangia il cibo, e corri.',
    });
  });

  test('an INDICATIVE parent coerces the other way — the command becomes a statement', () => {
    // Symmetric: the coordinated clause is flagged `imperative`, and the flag is ignored. Both
    // halves conjugate as statements (the indicative "you run", not the command "run"). In the
    // pro-drop languages the second-person subject is dropped either way, so what marks the
    // coercion there is the verb taking its indicative statement form; French, German and English
    // show it with the overt subject restored.
    expect(sayAll({
      ...clause(np('SECOND_PERSON'), 'EAT', { directObject: np('FOOD') }),
      coordination: {
        conjunction: 'and',
        clause: { ...runStatement, imperative: true },
      },
    })).toEqual({
      en: 'you eat the food, and you run.',
      it: 'mangi il cibo, e corri.',
      fr: 'tu manges la nourriture, et tu cours.',
      es: 'comes la comida, y corres.',
      pt: 'come a comida, e corre.',
      de: 'du isst das Essen, und du läufst.',
      ja: 'あなたは食べ物を食べます。そして、あなたは走ります。',
    });
  });

  test('a conjunction a command may not take is rewritten, even on a mixed pair', () => {
    expect(sayAll({
      ...eatCommand,
      coordination: { conjunction: 'therefore', clause: runStatement },
    })).toMatchObject({
      en: 'eat the food, and run.', // "therefore" → "and"
      de: 'iss das Essen, und lauf.',
    });
  });
});

// The agreement a coordinated group resolves to AS A GROUP — the person/number/gender a verb, a
// predicate adjective or a participle must read off it. This is carried on the element's
// `agreement`, separate from any one conjunct: "il gatto e la volpe" is masculine plural though one
// conjunct is feminine, and "the cat and I" is first-person plural though neither conjunct is. The
// verb-number case is pinned above ("run"); this section is the gender and the person.
const and = (...conjuncts: NounPhrase[]): NounElement => ({ conjuncts, conjunction: 'and' });

// Group gender only surfaces through something that agrees with the whole subject — a predicate
// adjective (Romance agrees it with the subject) or a BE-auxiliary participle. A feminine cat
// (la gatta) and a masculine dog (il cane) make the resolution visible.
describe('coordinated noun groups: group gender agreement', () => {
  const FEM = np('CAT', { gender: 'fem' }); // la gatta / la chatte / la gata
  const MASC = np('DOG'); // il cane / le chien (masculine)
  const FEM2 = np('HOUSE'); // la casa / la maison (feminine)

  const seemOld = (group: NounElement) =>
    sayAll(clause(group, 'SEEM', { complements: { predicative: { phrase: np('OLD') } } }));

  test('mixed gender resolves to MASCULINE plural, whatever the order', () => {
    // The predicate adjective agrees with the group: masc plural (vecchi / vieux / viejos / velhos),
    // not feminine, even though one conjunct is feminine.
    expect(seemOld(and(FEM, MASC))).toMatchObject({
      en: 'the cat and the dog seem old.', // English invariant
      it: 'la gatta e il cane sembrano vecchi.',
      fr: 'la chatte et le chien semblent vieux.',
      es: 'la gata y el perro parecen viejos.',
      pt: 'a gata e o cão parecem velhos.',
      de: 'die Katze und der Hund scheinen alt.', // German predicate adjective is uninflected
    });
    // Reversing the conjuncts does not make the group feminine — mixed is masculine either way.
    expect(seemOld(and(MASC, FEM))).toMatchObject({
      it: 'il cane e la gatta sembrano vecchi.',
      fr: 'le chien et la chatte semblent vieux.',
      es: 'el perro y la gata parecen viejos.',
    });
  });

  test('an all-feminine group resolves to FEMININE plural', () => {
    expect(seemOld(and(FEM, FEM2))).toMatchObject({
      it: 'la gatta e la casa sembrano vecchie.', // vecchie, not vecchi
      fr: 'la chatte et la maison semblent vieilles.',
      es: 'la gata y la casa parecen viejas.',
      pt: 'a gata e a casa parecem velhas.',
    });
  });

  test('the same resolution drives BE-auxiliary participle agreement', () => {
    // it/fr select essere/être for GO, and the participle agrees with the group: masc plural for a
    // mixed group (andati / allés), feminine plural for an all-feminine one (andate / allées).
    expect(sayAll(clause(and(FEM, MASC), 'GO', { verbPhrase: { aspect: 'resultative' } })))
      .toMatchObject({
        it: 'la gatta e il cane sono andati.',
        fr: 'la chatte et le chien sont allés.',
      });
    expect(sayAll(clause(and(FEM, FEM2), 'GO', { verbPhrase: { aspect: 'resultative' } })))
      .toMatchObject({
        it: 'la gatta e la casa sono andate.',
        fr: 'la chatte et la maison sont allées.',
      });
  });
});

// Group PERSON follows the 1 > 2 > 3 hierarchy: a group containing a first person is first-person
// plural, else a group containing a second person is second-person plural, else third. The verb
// agrees with the resolved person, not with any one conjunct.
describe('coordinated noun groups: group person agreement', () => {
  const eat = (group: NounElement) => sayAll(clause(group, 'EAT'));
  const I = np('FIRST_PERSON');
  const YOU = np('SECOND_PERSON');
  const CAT = np('CAT');

  test('first + third resolves to FIRST plural', () => {
    // "io e il gatto MANGIAMO" (1pl), not "mangia" (3sg) or "mangiano" (3pl). French dislocates the
    // disjunctive pronouns and resumes them with the subject clitic ("moi et le chat, NOUS mangeons").
    expect(eat(and(I, CAT))).toMatchObject({
      en: 'I and the cat eat.',
      it: 'io e il gatto mangiamo.',
      es: 'yo y el gato comemos.',
      pt: 'eu e o gato comemos.',
      fr: 'moi et le chat, nous mangeons.',
      de: 'ich und der Kater essen.',
    });
    expect(eat(and(CAT, I))).toMatchObject({
      it: 'il gatto e io mangiamo.', // order does not change the person
      es: 'el gato y yo comemos.',
      fr: 'le chat et moi, nous mangeons.',
    });
  });

  test('second + third resolves to SECOND plural', () => {
    expect(eat(and(YOU, CAT))).toMatchObject({
      it: 'tu e il gatto mangiate.', // 2pl
      fr: 'toi et le chat, vous mangez.',
      es: 'tú y el gato coméis.', // vosotros
      de: 'du und der Kater esst.',
      // Brazilian "você" is morphologically third person, so você + cat agrees as third plural.
      pt: 'você e o gato comem.',
    });
  });

  test('first + second resolves to FIRST plural (first wins over second)', () => {
    expect(eat(and(I, YOU))).toMatchObject({
      it: 'io e tu mangiamo.',
      es: 'yo y tú comemos.',
      fr: 'moi et toi, nous mangeons.',
      de: 'ich und du essen.',
      pt: 'eu e você comemos.',
    });
  });
});

// A69. The explicative "that is" joining two clauses is set off by commas on both sides ("…, that
// is, the dog jumps"). `englishEngine` emits only the comma before it. Without the second comma
// the sentence reads "that is the dog" as a clause of its own.
describe('known bugs: English comma after "that is"', () => {
  test('English puts a comma after "that is"', () => {
    expect(say({ ...clause(np('CAT'), 'RUN'), coordination: { conjunction: 'that_is', clause: clause(np('DOG'), 'JUMP') } }, 'en')).toBe('the cat runs, that is, the dog jumps.');
    expect(say({ ...clause(np('CAT'), 'EAT', { directObject: np('FOOD') }), coordination: { conjunction: 'that_is', clause: clause(np('CAT'), 'EAT', { directObject: np('MOUSE') }) } }, 'en')).toBe('the cat eats the food, that is, the cat eats the mouse.');
  });
});

// A69. "es decir" and "por lo tanto" are discourse connectors, not conjunctions. The RAE
// (Ortografía 2010, §3.4.2.2.1.1) wants a comma after them. `spanishEngine.render` joins every
// conjunction as ", <word> <clause>", with no comma after the word.
describe('known bugs: Spanish comma after a discourse connector', () => {
  test('Spanish sets off "es decir" and "por lo tanto" with a following comma', () => {
    expect(sayAll({ ...clause(np('CAT'), 'RUN'), coordination: { conjunction: 'that_is', clause: clause(np('DOG'), 'JUMP') } }).es)
      .toBe('el gato corre, es decir, el perro salta.');
    expect(sayAll({ ...clause(np('CAT'), 'RUN'), coordination: { conjunction: 'therefore', clause: clause(np('DOG'), 'JUMP') } }).es)
      .toBe('el gato corre, por lo tanto, el perro salta.');
  });

  const join = (conjunction: CoordConjunction, extra: Partial<PhrasePlan> = {}) =>
    sayAll({ ...clause(np('CAT'), 'RUN'), ...extra, coordination: { conjunction, clause: clause(np('DOG'), 'JUMP') } });

  test('the connector keeps its comma after a condition, and Portuguese sets off "isto é" too', () => {
    expect(join('that_is', { condition: clause(np('MAN'), 'EAT') })).toMatchObject({
      en: 'if the man ate, the cat would run, that is, the dog jumps.',
      es: 'si el hombre comiera, el gato correría, es decir, el perro salta.',
      pt: 'se o homem comesse, o gato correria, isto é, o cão pula.',
    });
  });

  test('regression: the true conjunctions and a command take no comma after them', () => {
    expect(join('therefore')).toMatchObject({ en: 'the cat runs, so the dog jumps.', pt: 'o gato corre, portanto o cão pula.' });
    expect(join('then')).toMatchObject({ en: 'the cat runs, and then the dog jumps.', es: 'el gato corre, y luego el perro salta.' });
    // A command turns "that is" into "and", which takes no comma.
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'RUN'), imperative: true, coordination: { conjunction: 'that_is', clause: clause(np('SECOND_PERSON'), 'JUMP') } }))
      .toMatchObject({ en: 'run, and jump.', es: 'corre, y salta.' });
  });
});

// A90. Subjects of different persons joined by "ou" take a plural verb in the prevailing person,
// as with "et": "toi ou moi, nous mangeons". The shared `groupAgreement` makes an "or" group agree
// with its last conjunct, while French `subjectText` resumes it with the plural "nous"/"vous", so
// the clitic and the verb disagree ("moi ou toi, vous manges", "toi ou moi, nous mange").
describe('known bugs: French disjunction of different persons', () => {
  test('French resolves "ou" across persons to the plural of the prevailing person', () => {
    const eat = (...ids: string[]) =>
      sayAll(clause({ conjuncts: ids.map((id) => np(id)), conjunction: 'or' }, 'EAT')).fr;
    expect(eat('FIRST_PERSON', 'SECOND_PERSON')).toBe('moi ou toi, nous mangeons.');
    expect(eat('SECOND_PERSON', 'FIRST_PERSON')).toBe('toi ou moi, nous mangeons.');
    expect(eat('CAT', 'FIRST_PERSON')).toBe('le chat ou moi, nous mangeons.');
    expect(eat('FIRST_PERSON', 'CAT')).toBe('moi ou le chat, nous mangeons.');
  });

  test('French resolves the second person, gender, the compound past and negation the same way', () => {
    const or = (...conjuncts: ReturnType<typeof np>[]) => ({ conjuncts, conjunction: 'or' as const });
    expect(sayAll(clause(or(np('SECOND_PERSON'), np('CAT')), 'EAT')).fr).toBe('toi ou le chat, vous mangez.');
    expect(sayAll(clause(or(np('CAT'), np('SECOND_PERSON')), 'RUN')).fr).toBe('le chat ou toi, vous courez.');
    expect(sayAll(clause(or(np('SECOND_PERSON', { gender: 'fem' }), np('WOMAN')), 'BE', { complements: { predicative: { phrase: np('TIRED') } } })).fr)
      .toBe('toi ou la femme, vous êtes fatiguées.');
    expect(sayAll(clause(or(np('FIRST_PERSON'), np('SECOND_PERSON')), 'GO', { verbPhrase: { aspect: 'resultative' } })).fr).toBe('moi ou toi, nous sommes allés.');
    expect(sayAll(clause(or(np('FIRST_PERSON'), np('SECOND_PERSON')), 'EAT', { verbPhrase: { negative: true } })).fr).toBe('moi ou toi, nous ne mangeons pas.');
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: or(np('SECOND_PERSON'), np('FIRST_PERSON')), verbPhrase: { aspect: 'resultative' } })).fr)
      .toBe('le chat nous a vus, toi ou moi.');
  });

  test('regression: a French "ou" of one person keeps the nearest conjunct', () => {
    const or = (...conjuncts: ReturnType<typeof np>[]) => ({ conjuncts, conjunction: 'or' as const });
    expect(sayAll(clause(or(np('CAT'), np('DOG')), 'RUN')).fr).toBe('le chat ou le chien court.');
    expect(sayAll(clause(or(np('CAT'), np('DOG', { number: 'plural' })), 'RUN')).fr).toBe('le chat ou les chiens courent.');
  });
});

// A121. A coordinated BE with no complement of its own elides its antecedent's predicate ("the cat is
// happy, but the dog is not"). English strands the copula, but Italian, French and Spanish need the
// invariable predicate clitic (lo / le), German the pronoun "es", and Japanese the pro-form そう. Each
// engine renders the second clause alone, as a bare copula, which reads as existence: "ma il cane non
// è". Spanish and Portuguese also lose the antecedent's estar ("está feliz, pero el perro no es"). A
// locative antecedent leaves the locative pro-form instead (ci / y / da).
describe('known bugs: a coordinated copula elides its predicate', () => {
  const but = (first: PhrasePlan, verbPhrase: Partial<VerbPhrase> = {}, subject: NounPhrase = np('DOG')) =>
    sayAll({ ...first, coordination: { conjunction: 'but', clause: clause(subject, 'BE', { verbPhrase }) } });
  const catIs = (predicate: string, verbPhrase: Partial<VerbPhrase> = {}) =>
    clause(np('CAT'), 'BE', { verbPhrase, complements: { predicative: { phrase: np(predicate) } } });

  test('the elided predicate leaves its pro-form, in the tense, number and polarity of its clause', () => {
    expect(sayAll({
      ...clause(np('AFRICA'), 'BE', {
        complements: { predicative: { phrase: np('CONTINENT') }, locative: { phrase: np('ASIA') } },
      }),
      coordination: {
        conjunction: 'but',
        clause: clause(np('ANTARCTICA'), 'BE', { verbPhrase: { tense: 'future', negative: true } }),
      },
    })).toMatchObject({
      en: 'Africa is a continent in Asia, but Antarctica will not be.',
      it: "l'Africa è un continente in Asia, ma l'Antartide non lo sarà.",
      fr: "l'Afrique est un continent en Asie, mais l'Antarctique ne le sera pas.",
      es: 'África es un continente en Asia, pero la Antártida no lo será.',
      pt: 'a África é um continente na Ásia, mas a Antártida não será.',
      de: 'Afrika ist ein Kontinent in Asien, aber die Antarktis wird es nicht sein.',
      ja: expect.stringMatching(/南極大陸はそうではありません。$/),
    });
    expect(but(catIs('LEGEND'), { negative: true })).toMatchObject({
      it: 'il gatto è una leggenda, ma il cane non lo è.',
      fr: "le chat est une légende, mais le chien ne l'est pas.",
      es: 'el gato es una leyenda, pero el perro no lo es.',
      de: 'der Kater ist eine Legende, aber der Hund ist es nicht.',
      ja: expect.stringMatching(/犬はそうではありません。$/),
    });
    // estar: Spanish and Portuguese keep the antecedent's copula.
    expect(but(catIs('HAPPY'), { negative: true })).toMatchObject({
      it: 'il gatto è felice, ma il cane non lo è.',
      fr: "le chat est heureux, mais le chien ne l'est pas.",
      es: 'el gato está feliz, pero el perro no lo está.',
      pt: 'o gato está feliz, mas o cão não está.',
      de: 'der Kater ist glücklich, aber der Hund ist es nicht.',
    });
    expect(but(catIs('HAPPY', { tense: 'past' }), { tense: 'past', negative: true })).toMatchObject({
      it: 'il gatto fu felice, ma il cane non lo fu.',
      fr: 'le chat fut heureux, mais le chien ne le fut pas.',
      es: 'el gato estuvo feliz, pero el perro no lo estuvo.',
      pt: 'o gato esteve feliz, mas o cão não esteve.',
      de: 'der Kater war glücklich, aber der Hund war es nicht.',
      ja: expect.stringMatching(/犬はそうではありませんでした。$/),
    });
    // The clitic is invariable: "lo", not "li", for a plural subject.
    expect(but(catIs('HAPPY'), { negative: true }, np('DOG', { number: 'plural' }))).toMatchObject({
      it: 'il gatto è felice, ma i cani non lo sono.',
      fr: 'le chat est heureux, mais les chiens ne le sont pas.',
      es: 'el gato está feliz, pero los perros no lo están.',
      pt: 'o gato está feliz, mas os cães não estão.',
      de: 'der Kater ist glücklich, aber die Hunde sind es nicht.',
    });
    expect(but(catIs('HAPPY', { negative: true }))).toMatchObject({
      it: 'il gatto non è felice, ma il cane lo è.',
      fr: "le chat n'est pas heureux, mais le chien l'est.",
      es: 'el gato no está feliz, pero el perro lo está.',
      pt: 'o gato não está feliz, mas o cão está.',
      de: 'der Kater ist nicht glücklich, aber der Hund ist es.',
      ja: expect.stringMatching(/犬はそうです。$/),
    });
  });

  test('an elided locative leaves the locative pro-form', () => {
    expect(but(clause(np('CAT'), 'BE', { complements: { locative: { phrase: np('HOUSE') } } }), { negative: true })).toMatchObject({
      en: 'the cat is in the house, but the dog is not.',
      it: "il gatto è nella casa, ma il cane non c'è.",
      fr: "le chat est dans la maison, mais le chien n'y est pas.",
      es: 'el gato está en la casa, pero el perro no está.',
      pt: 'o gato está na casa, mas o cão não está.',
      de: 'der Kater ist im Haus, aber der Hund ist nicht da.',
    });
  });

  // The pro-form rides the clitic placement of each language: before the finite verb, before the
  // infinitive under a French modal, ahead of "nicht" and the German non-finite tail.
  test('the pro-form under a modal, in the compound past and after a pronoun subject', () => {
    expect(but(catIs('HAPPY'), { modals: ['MUST'], negative: true })).toMatchObject({
      it: 'il gatto è felice, ma il cane non lo deve essere.',
      fr: "le chat est heureux, mais le chien ne doit pas l'être.",
      es: 'el gato está feliz, pero el perro no lo debe estar.',
      pt: 'o gato está feliz, mas o cão não deve estar.',
      de: 'der Kater ist glücklich, aber der Hund muss es nicht sein.',
    });
    expect(but(catIs('LEGEND'), { aspect: 'resultative', negative: true })).toMatchObject({
      en: 'the cat is a legend, but the dog has not been.',
      it: 'il gatto è una leggenda, ma il cane non lo è stato.',
      fr: "le chat est une légende, mais le chien ne l'a pas été.",
      es: 'el gato es una leyenda, pero el perro no lo ha sido.',
      de: 'der Kater ist eine Legende, aber der Hund ist es nicht gewesen.',
    });
    expect(but(catIs('LEGEND'), {}, np('FIRST_PERSON'))).toMatchObject({
      it: 'il gatto è una leggenda, ma lo sono.',
      fr: 'le chat est une légende, mais je le suis.',
      es: 'el gato es una leyenda, pero lo soy.',
      de: 'der Kater ist eine Legende, aber ich bin es.',
      ja: '猫は伝説です。しかし、私はそうです。',
    });
  });

  test('the locative pro-form under a modal and after a pronoun subject', () => {
    const catInTheHouse = clause(np('CAT'), 'BE', { complements: { locative: { phrase: np('HOUSE') } } });
    expect(but(catInTheHouse, { modals: ['CAN'] })).toMatchObject({
      it: 'il gatto è nella casa, ma il cane ci può essere.',
      fr: 'le chat est dans la maison, mais le chien peut y être.',
      es: 'el gato está en la casa, pero el perro puede estar.',
      de: 'der Kater ist im Haus, aber der Hund kann da sein.',
    });
    expect(but(catInTheHouse, {}, np('FIRST_PERSON'))).toMatchObject({
      it: 'il gatto è nella casa, ma ci sono.',
      fr: "le chat est dans la maison, mais j'y suis.",
      es: 'el gato está en la casa, pero estoy.',
      pt: 'o gato está na casa, mas estou.',
      de: 'der Kater ist im Haus, aber ich bin da.',
    });
  });

  // Two commands coordinate like two statements, and a coordinated clause can elide a complement its
  // main clause itself elided from the protasis.
  test('a coordinated command, and a chain through the protasis', () => {
    const beHappy = { ...clause(np('SECOND_PERSON'), 'BE', { complements: { predicative: { phrase: np('HAPPY') } } }), imperative: true };
    expect(sayAll({ ...beHappy, coordination: { conjunction: 'but', clause: clause(np('SECOND_PERSON'), 'BE', { verbPhrase: { negative: true } }) } }))
      .toMatchObject({
        it: 'sii felice, ma non esserlo.',
        fr: 'sois heureux, mais ne le sois pas.',
        es: 'está feliz, pero no lo estés.',
        de: 'sei glücklich, aber sei es nicht.',
        ja: '幸せになってください。しかし、そうならないでください。',
      });
    expect(sayAll({
      ...clause(np('DOG'), 'BE', { verbPhrase: { negative: true } }),
      condition: catIs('LEGEND'),
      coordination: { conjunction: 'but', clause: clause(np('MAN'), 'BE') },
    })).toMatchObject({
      it: 'se il gatto fosse una leggenda, il cane non lo sarebbe, ma l\'uomo lo è.',
      fr: "si le chat était une légende, le chien ne le serait pas, mais l'homme l'est.",
      es: 'si el gato fuera una leyenda, el perro no lo sería, pero el hombre lo es.',
      de: 'wenn der Kater eine Legende sein würde, würde der Hund es nicht sein, aber der Mann ist es.',
      ja: 'もし猫が伝説だったら、犬はそうではありません。しかし、男はそうです。',
    });
  });

  // Regression: only a copula hands on a subject complement, and only a bare copula takes it. SEEM's
  // predicate is not elided into BE, and BECOME with no complement stays a bare verb.
  test('regression: a non-copular antecedent or ellipsis site elides nothing', () => {
    expect(but(clause(np('CAT'), 'SEEM', { complements: { predicative: { phrase: np('HAPPY') } } }), { negative: true })).toMatchObject({
      it: 'il gatto sembra felice, ma il cane non è.',
      fr: "le chat semble heureux, mais le chien n'est pas.",
      de: 'der Kater scheint glücklich, aber der Hund ist nicht.',
    });
    expect(sayAll({ ...catIs('HAPPY'), coordination: { conjunction: 'but', clause: clause(np('DOG'), 'BECOME', { verbPhrase: { negative: true } }) } }))
      .toMatchObject({
        it: 'il gatto è felice, ma il cane non diventa.',
        fr: 'le chat est heureux, mais le chien ne devient pas.',
        de: 'der Kater ist glücklich, aber der Hund wird nicht.',
      });
  });
});

// A122. Japanese joins two clauses as "<clause>、<connective><clause>": 猫は走ります、しかし犬は跳びます.
// しかし, そして, または, つまり, だから and それから are connectives (接続詞), not conjunctive particles. After
// a finite polite predicate (ます / です / ください) the first clause ends, and the connective opens the
// next sentence with its own comma: 猫は走ります。しかし、犬は跳びます。
describe('known bugs: Japanese clause coordination', () => {
  test('Japanese closes the first clause and sets the connective off with a comma', () => {
    const join = (conjunction: CoordConjunction, first: PhrasePlan = clause(np('CAT'), 'RUN'), second: PhrasePlan = clause(np('DOG'), 'JUMP')) =>
      say({ ...first, coordination: { conjunction, clause: second } }, 'ja');
    expect(join('but')).toBe('猫は走ります。しかし、犬は跳びます。');
    expect(join('and')).toBe('猫は走ります。そして、犬は跳びます。');
    expect(join('or')).toBe('猫は走ります。または、犬は跳びます。');
    expect(join('that_is')).toBe('猫は走ります。つまり、犬は跳びます。');
    expect(join('therefore')).toBe('猫は走ります。だから、犬は跳びます。');
    expect(join('then')).toBe('猫は走ります。それから、犬は跳びます。');
    expect(join('but', clause(np('CAT'), 'RUN', { verbPhrase: { tense: 'past' } }), clause(np('DOG'), 'JUMP', { verbPhrase: { tense: 'past' } })))
      .toBe('猫は走りました。しかし、犬は跳びました。');
    expect(join('but', clause(np('CAT'), 'RUN', { verbPhrase: { negative: true } }))).toBe('猫は走りません。しかし、犬は跳びます。');
    expect(join('but', clause(np('CAT'), 'BE', { complements: { predicative: { phrase: np('LEGEND') } } })))
      .toBe('猫は伝説です。しかし、犬は跳びます。');
    expect(join('and', { ...clause(np('DOG'), 'RUN'), condition: clause(np('CAT'), 'EAT') }, clause(np('CAT'), 'EAT')))
      .toBe('もし猫が食べたら、犬は走ります。そして、猫は食べます。');
    const command = (verb: string, directObject?: string): PhrasePlan => ({
      ...clause(np('SECOND_PERSON'), verb, directObject ? { directObject: np(directObject) } : {}),
      imperative: true,
    });
    expect(join('and', command('EAT', 'FOOD'), command('RUN'))).toBe('食べ物を食べてください。そして、走ってください。');
  });

  // Every finite polite ending closes its sentence: the past negative, the copula, the existential, a
  // modal and the hortative ましょう.
  test('Japanese closes the sentence after every polite ending', () => {
    const join = (first: PhrasePlan, second: PhrasePlan = clause(np('DOG'), 'JUMP'), conjunction: CoordConjunction = 'but') =>
      say({ ...first, coordination: { conjunction, clause: second } }, 'ja');
    expect(join(clause(np('DOG'), 'RUN', { verbPhrase: { tense: 'past', negative: true } }), clause(np('CAT'), 'EAT', { directObject: np('MOUSE') }), 'therefore'))
      .toBe('犬は走りませんでした。だから、猫はネズミを食べます。');
    expect(join(clause(np('CAT'), 'BE', { verbPhrase: { tense: 'past', negative: true }, complements: { predicative: { phrase: np('HAPPY') } } })))
      .toBe('猫は幸せではありませんでした。しかし、犬は跳びます。');
    expect(join(clause(np('CAT'), 'BE', { complements: { locative: { phrase: np('HOUSE') } } }))).toBe('猫は家にいます。しかし、犬は跳びます。');
    expect(join(clause(np('CAT'), 'EAT', { verbPhrase: { modals: ['CAN'] } }))).toBe('猫は食べることができます。しかし、犬は跳びます。');
    const letUs = (verb: string): PhrasePlan => ({ ...clause(np('FIRST_PERSON', { number: 'plural' }), verb), imperative: true });
    expect(join(letUs('RUN'), letUs('EAT'), 'and')).toBe('走りましょう。そして、食べましょう。');
  });

  // Regression: the instruction register's 連用形 stays inside one sentence, and the other languages
  // keep their comma.
  test('regression: coordinated instructions and the other languages keep their join', () => {
    const instruction = (verb: string, directObject?: string): PhrasePlan => ({
      ...clause(np('SECOND_PERSON'), verb, directObject ? { directObject: np(directObject) } : {}),
      imperative: true,
      imperativeRegister: 'instruction',
    });
    expect(say({ ...instruction('EAT', 'FOOD'), coordination: { conjunction: 'then', clause: instruction('RUN') } }, 'ja'))
      .toBe('食べ物を食べ、それから走り。');
    expect(sayAll({ ...clause(np('CAT'), 'RUN'), coordination: { conjunction: 'but', clause: clause(np('DOG'), 'JUMP') } })).toMatchObject({
      en: 'the cat runs, but the dog jumps.',
      it: 'il gatto corre, ma il cane salta.',
    });
  });
});
