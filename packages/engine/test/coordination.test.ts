import { describe, expect, test } from 'vitest';
import type { CoordConjunction, NounElement, NounPhrase, PhrasePlan } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

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
      ja: '猫は走ります、または犬は跳びます。',
    });
  });

  test('explicative — "that is"', () => {
    expect(join('that_is')).toMatchObject({
      en: 'the cat runs, that is the dog jumps.',
      it: 'il gatto corre, cioè il cane salta.',
      fr: "le chat court, c'est-à-dire le chien saute.",
      es: 'el gato corre, es decir el perro salta.',
      pt: 'o gato corre, isto é o cão pula.',
      // "das heißt" is parenthetical, so — unlike "also" / "dann" — it does NOT invert.
      de: 'der Kater läuft, das heißt der Hund springt.',
      ja: '猫は走ります、つまり犬は跳びます。',
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
      ja: '猫は走ります、それから犬は跳びます。',
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
      ja: '食べ物を食べてください、そして走ってください。',
    });
  });

  test('each conjunction a command may take', () => {
    // Only these four: `therefore` and `that_is` relate propositions, and a command asserts
    // nothing to relate — see IMPERATIVE_COORD_CONJUNCTIONS.
    expect(joined('then')).toMatchObject({
      en: 'eat the food, and then run.',
      it: 'mangia il cibo, e poi corri.',
      de: 'iss das Essen, und dann lauf.',
      ja: '食べ物を食べてください、それから走ってください。',
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
      ja: '食べ物を食べてください、そして走ってください。',
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
    // Symmetric: the coordinated clause is flagged `imperative`, and the flag is ignored. The
    // subject comes back, and both halves conjugate as statements.
    expect(sayAll({
      ...clause(np('SECOND_PERSON'), 'EAT', { directObject: np('FOOD') }),
      coordination: {
        conjunction: 'and',
        clause: { ...runStatement, imperative: true },
      },
    })).toEqual({
      en: 'you eat the food, and you run.',
      it: 'tu mangi il cibo, e tu corri.',
      fr: 'tu manges la nourriture, et tu cours.',
      es: 'tú comes la comida, y tú corres.',
      pt: 'você come a comida, e você corre.',
      de: 'du isst das Essen, und du läufst.',
      ja: 'あなたは食べ物を食べます、そしてあなたは走ります。',
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
