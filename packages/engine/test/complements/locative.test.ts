import { describe, expect, test } from 'vitest';
import { PATH_SPECIFIERS, type NounPhrase, type PathSpecifier } from '@signi/shared';
import { clause, np, sayAll } from '../harness.js';

// Where the action happens — a static place, with no motion implied. Most verbs that denote a
// concrete act license it: something happens, and it happens *somewhere*. The list mirrors the
// corpus (the `locative` complement on each verb seed) — the five motion/intransitives, the
// copulars ("is in the house"), the plain transitives, the app's own vocabulary, and the B06
// grammar-word verbs. The invariant below is that they all mark the place identically.
const LOCATIVE_VERBS = [
  'RUN', 'JUMP', 'COME', 'COLLAPSE', 'GO', // motion / intransitive
  'CRY', 'BURN', // the other two intransitives
  'SEEM', 'APPEAR', 'BE', // copular
  'CUT', 'EAT', 'DRINK', 'SEE', 'LOVE', 'KILL', 'READ', 'CRY_OUT', 'BITE', 'BEAT',
  'SET_ON_FIRE', 'EXTINGUISH', 'BUY', 'OWN', 'HOLD', 'MAKE', 'CLICK', 'CHOOSE',
  'SELECT', 'TYPE', 'COORDINATE', 'TIDY_UP', 'HIDE', 'START', // transitive / app vocabulary
  'MODIFY', 'EXPRESS', 'REPLACE', // B06 grammar-word verbs
];

const inPlace = (verb: string, place: NounPhrase = np('HOUSE')) =>
  sayAll(clause(np('CAT'), verb, {
    // HIDE is transitive, so it is given something to hide.
    ...(verb === 'HIDE' ? { directObject: np('BOOK') } : {}),
    complements: { locative: { phrase: place } },
  }));

describe('locative', () => {
  test('the adposition each language uses for a static place', () => {
    expect(inPlace('RUN')).toEqual({
      en: 'the cat runs in the house.',
      it: 'il gatto corre nella casa.', // in + la = nella
      fr: 'le chat court dans la maison.',
      es: 'el gato corre en la casa.',
      pt: 'o gato corre na casa.', // em + a = na
      de: 'der Kater läuft im Haus.', // in + dem = im, the dative of place
      // Japanese marks the place of an ACTION with で — not に, which is static existence.
      ja: '猫は家で走ります。',
    });
  });

  // The marking belongs to the complement, not the verb: every licensing verb places its action
  // the same way, and only the verb changes.
  test.each(LOCATIVE_VERBS)('%s takes its locative the same way', (verb) => {
    const said = inPlace(verb);

    expect(said.en).toMatch(/ in the house\.$/);
    expect(said.it).toMatch(/ nella casa\.$/);
    expect(said.fr).toMatch(/ dans la maison\.$/);
    expect(said.es).toMatch(/ en la casa\.$/);
    expect(said.pt).toMatch(/ na casa\.$/);
    expect(said.de).toMatch(/ im Haus\.$/);
    expect(said.ja).toMatch(/^猫は家で/);
  });

  test('the five intransitive verbs', () => {
    expect(inPlace('JUMP')).toMatchObject({
      en: 'the cat jumps in the house.',
      it: 'il gatto salta nella casa.',
      de: 'der Kater springt im Haus.',
      ja: '猫は家で跳びます。',
    });

    expect(inPlace('COME')).toMatchObject({
      en: 'the cat comes in the house.',
      it: 'il gatto viene nella casa.',
      de: 'der Kater kommt im Haus.',
    });

    expect(inPlace('COLLAPSE')).toMatchObject({
      en: 'the cat collapses in the house.',
      it: 'il gatto crolla nella casa.',
      fr: "le chat s'effondre dans la maison.", // a reflexive verb in French
      pt: 'o gato desaba na casa.',
    });

    expect(inPlace('GO')).toMatchObject({
      // GO licenses a locative as well as a direction: this is where the going happens, not
      // where it is headed. Contrast direction.test.ts, which gives "goes TO the market".
      en: 'the cat goes in the house.',
      it: 'il gatto va nella casa.',
    });
  });

  test('HIDE — the object and the place both render (the helper gives it one to hide)', () => {
    expect(inPlace('HIDE')).toMatchObject({
      en: 'the cat hides the book in the house.',
      it: 'il gatto nasconde il libro nella casa.',
      fr: 'le chat cache le livre dans la maison.',
      de: 'der Kater versteckt das Buch im Haus.',
      // Japanese puts the place BEFORE the object; both precede the verb.
      ja: '猫は家で本を隠します。',
    });
  });
});

// The plain transitives and the app's own vocabulary license a locative too: the action still
// happens somewhere. The helper leaves their object off, keeping the place next to the verb, so
// these read "eats in the house" — the object is beside the point here.
describe('locative: the transitive verbs', () => {
  test('EAT, LOVE and the app-vocabulary CLICK all place the action the same way', () => {
    expect(inPlace('EAT')).toMatchObject({
      en: 'the cat eats in the house.',
      it: 'il gatto mangia nella casa.',
      de: 'der Kater isst im Haus.',
      ja: '猫は家で食べます。',
    });
    expect(inPlace('LOVE')).toMatchObject({
      en: 'the cat loves in the house.',
      es: 'el gato ama en la casa.',
      pt: 'o gato ama na casa.',
    });
    expect(inPlace('CLICK')).toMatchObject({
      en: 'the cat clicks in the house.',
      fr: 'le chat clique dans la maison.',
      de: 'der Kater klickt im Haus.',
    });
  });

  test('the B06 grammar-word verbs license it too', () => {
    expect(inPlace('MODIFY')).toMatchObject({
      en: 'the cat modifies in the house.',
      it: 'il gatto modifica nella casa.',
      ja: '猫は家で修飾します。',
    });
    expect(inPlace('REPLACE')).toMatchObject({
      en: 'the cat replaces in the house.',
      de: 'der Kater ersetzt im Haus.',
    });
  });
});

// The copulars carry a locative — "the cat is in the house", the plainest use of all. SEEM and
// APPEAR license it as well; their reading is marginal, but they mark the place like everyone else.
describe('locative: the copular verbs', () => {
  test('BE places the subject — "is in the house"', () => {
    expect(inPlace('BE')).toMatchObject({
      en: 'the cat is in the house.',
      it: 'il gatto è nella casa.',
      fr: 'le chat est dans la maison.',
      de: 'der Kater ist im Haus.',
    });
  });

  test('SEEM and APPEAR mark the place the same way', () => {
    expect(inPlace('SEEM')).toMatchObject({
      en: 'the cat seems in the house.',
      it: 'il gatto sembra nella casa.',
    });
    expect(inPlace('APPEAR')).toMatchObject({
      en: 'the cat appears in the house.',
      de: 'der Kater erscheint im Haus.',
    });
  });
});

// The place is an ordinary noun phrase, so it declines like one — and each language fuses its
// locative preposition with whatever article results.
describe('locative: the place is a full noun phrase', () => {
  test('the preposition fuses with the article, in every gender', () => {
    expect(inPlace('RUN', np('MARKET'))).toMatchObject({
      it: 'il gatto corre nel mercato.', // in + il = nel
      pt: 'o gato corre no mercado.', // em + o = no
      de: 'der Kater läuft im Markt.',
    });
  });

  test('a plural place', () => {
    expect(inPlace('RUN', np('HOUSE', { number: 'plural' }))).toMatchObject({
      en: 'the cat runs in the houses.',
      it: 'il gatto corre nelle case.', // in + le = nelle
      fr: 'le chat court dans les maisons.',
      pt: 'o gato corre nas casas.',
      de: 'der Kater läuft in den Häusern.', // dative plural: den, and the noun takes -n
      ja: '猫は家で走ります。', // no number marking
    });
  });

  test('an indefinite place — nothing to fuse with', () => {
    expect(inPlace('RUN', np('HOUSE', { definiteness: 'indefinite' }))).toMatchObject({
      en: 'the cat runs in a house.',
      it: 'il gatto corre in una casa.', // bare "in", uncontracted
      fr: 'le chat court dans une maison.',
      de: 'der Kater läuft in einem Haus.',
    });
  });
});

// The locative carries the same spatial specifier the route does — without it there is no way to
// say "the cat is under the bed" or "behind the tree", only the containment "in" the bare
// complement defaults to. The relation is the same one route names; what differs is the verb, not
// the adposition ("goes under the bed" / "is under the bed"), so every language reuses the phrase
// it already builds for a route and only the default changes: locative falls back to `in`, route
// to `through`.
const atPlace = (value: PathSpecifier, verb = 'BE', place: NounPhrase = np('HOUSE')) =>
  sayAll(clause(np('CAT'), verb, {
    complements: { locative: { phrase: place, specifiers: [{ kind: 'path', value }] } },
  }));

describe('locative: spatial specifiers', () => {
  test('under — the relation the bare locative cannot express', () => {
    expect(atPlace('under')).toMatchObject({
      en: 'the cat is under the house.',
      it: 'il gatto è sotto la casa.',
      fr: 'le chat est sous la maison.',
      // unter is a two-way (Wechsel-) preposition; a static place takes the DATIVE, the same case
      // the route already gives it — "unter dem Haus", never the accusative "unter das Haus".
      de: 'der Kater ist unter dem Haus.',
      es: 'el gato es debajo de la casa.',
      pt: 'o gato é debaixo da casa.',
      // The relational noun 下 sits between the place and its particle, exactly as it does for a
      // route (市場の下を) — only the particle differs.
      ja: '猫は家の下でです。',
    });
  });

  test('behind', () => {
    expect(atPlace('behind')).toMatchObject({
      en: 'the cat is behind the house.',
      it: 'il gatto è dietro la casa.',
      fr: 'le chat est derrière la maison.',
      de: 'der Kater ist hinter dem Haus.', // dative — hinter is two-way
      es: 'el gato es detrás de la casa.',
      pt: 'o gato é atrás da casa.',
      ja: '猫は家の後ろでです。',
    });
  });

  test('over and in front of', () => {
    expect(atPlace('over')).toMatchObject({
      en: 'the cat is over the house.',
      fr: 'le chat est au-dessus de la maison.',
      de: 'der Kater ist über dem Haus.',
      es: 'el gato es por encima de la casa.',
    });
    expect(atPlace('in_front_of')).toMatchObject({
      en: 'the cat is in front of the house.',
      it: 'il gatto è davanti alla casa.', // davanti a + la = alla
      de: 'der Kater ist vor dem Haus.',
      ja: '猫は家の前でです。',
    });
  });

  // "um" governs the accusative whether the relation is a path or a place ("die Mauer um das
  // Haus"), so `around` is the one locative relation that does NOT take the dative.
  test('around takes the accusative in German, unlike the two-way prepositions', () => {
    expect(atPlace('around')).toMatchObject({
      en: 'the cat is around the house.',
      it: 'il gatto è intorno alla casa.',
      de: 'der Kater ist um das Haus.',
      pt: 'o gato é ao redor da casa.',
    });
  });

  // The default is what makes locative and route different complements: neither the absent
  // specifier nor an explicit `in` may drift from the containment reading pinned at the top.
  test('an absent specifier and an explicit `in` are the same containment', () => {
    expect(atPlace('in', 'RUN')).toEqual(inPlace('RUN'));
    expect(atPlace('in')).toEqual(inPlace('BE'));
  });

  // The relation belongs to the complement, not the verb: an action placed under something marks
  // it exactly as the copula does, and only the verb changes.
  test('a non-copular verb takes the same relation', () => {
    expect(atPlace('under', 'RUN')).toMatchObject({
      en: 'the cat runs under the house.',
      it: 'il gatto corre sotto la casa.',
      fr: 'le chat court sous la maison.',
      de: 'der Kater läuft unter dem Haus.',
      ja: '猫は家の下で走ります。',
    });
  });

  // Every relation renders in every language — no dropped adposition, no empty place.
  test.each(PATH_SPECIFIERS)('%s renders in every language', (value) => {
    const said = atPlace(value);
    for (const lang of ['en', 'it', 'fr', 'es', 'pt', 'de', 'ja'] as const) {
      expect(said[lang]).toMatch(/[.。]$/);
      expect(said[lang]).not.toContain('undefined');
    }
    expect(said.ja).toContain('家');
  });

  // The place stays an ordinary noun phrase under a relation: the determiner still declines and
  // still fuses where the language fuses it.
  test('the place still declines under a relation', () => {
    expect(atPlace('under', 'RUN', np('HOUSE', { definiteness: 'indefinite' }))).toMatchObject({
      en: 'the cat runs under a house.',
      it: 'il gatto corre sotto una casa.',
      fr: 'le chat court sous une maison.',
      de: 'der Kater läuft unter einem Haus.', // dative indefinite
    });
    expect(atPlace('behind', 'RUN', np('HOUSE', { number: 'plural' }))).toMatchObject({
      en: 'the cat runs behind the houses.',
      de: 'der Kater läuft hinter den Häusern.', // dative plural
      pt: 'o gato corre atrás das casas.',
    });
  });

  // The continent article-drop is a property of plain containment ("corre in Europa"), not of the
  // locative slot: a relational locative keeps the adverb and the article the relation governs.
  test('a proper-noun place keeps its article under a relation', () => {
    expect(atPlace('under', 'RUN', np('EUROPE'))).toMatchObject({
      it: "il gatto corre sotto l'Europa.",
      fr: "le chat court sous l'Europe.",
    });
    // …while the bare containment still drops it.
    expect(inPlace('RUN', np('EUROPE'))).toMatchObject({ it: 'il gatto corre in Europa.' });
  });
});

describe('known bugs: locative', () => {
  // A proper noun keeps the article its language fixes for it — correct as a SUBJECT ("l'Europa
  // mangia") — but Italian and French drop that article after a locative preposition:
  //
  //     was   "corre nell'Europa" / "court dans l'Europe"
  //     now   "corre in Europa"   / "court en Europe"
  //
  // The engine used to apply the proper-noun article rule uniformly, so the fixed article survived
  // into a position that forbids it. The locative now drops the article for a proper noun. Spanish
  // ("en Europa"), German ("in Europa") and Portuguese ("na Europa" — Portuguese genuinely keeps
  // it) were all already right.
  test('Italian says "in Europa", not "nell\'Europa"', () => {
    expect(inPlace('RUN', np('EUROPE'))).toMatchObject({ it: 'il gatto corre in Europa.' });
  });

  test('French says "en Europe", not "dans l\'Europe"', () => {
    expect(inPlace('RUN', np('EUROPE'))).toMatchObject({ fr: 'le chat court en Europe.' });
  });

  // Every seeded continent drops the article the same way, including a compound name.
  test('the article-drop covers the other continents, compound names included', () => {
    expect(inPlace('RUN', np('AFRICA'))).toMatchObject({
      it: 'il gatto corre in Africa.', fr: 'le chat court en Afrique.',
    });
    expect(inPlace('RUN', np('ASIA'))).toMatchObject({
      it: 'il gatto corre in Asia.', fr: 'le chat court en Asie.',
    });
    expect(inPlace('RUN', np('NORTH_AMERICA'))).toMatchObject({
      it: 'il gatto corre in America del Nord.', fr: 'le chat court en Amérique du Nord.',
    });
  });

  // Regression: a COMMON noun in the locative still takes the article-fused preposition, and the
  // proper noun keeps its article as a SUBJECT — only the locative position drops it.
  test('a common-noun locative still contracts, and a proper-noun subject keeps its article', () => {
    expect(inPlace('RUN', np('HOUSE'))).toMatchObject({
      it: 'il gatto corre nella casa.', fr: 'le chat court dans la maison.',
    });
    expect(sayAll(clause(np('EUROPE'), 'EAT'))).toMatchObject({
      it: "l'Europa mangia.", fr: "l'Europe mange.",
    });
  });

  test('the other four get the proper noun right', () => {
    expect(inPlace('RUN', np('EUROPE'))).toMatchObject({
      en: 'the cat runs in Europe.',
      es: 'el gato corre en Europa.',
      pt: 'o gato corre na Europa.',
      de: 'der Kater läuft in Europa.',
    });
  });

  // The same weak-masculine (n-declension) miss pinned in direction.test.ts, showing up here too:
  // it is a property of the NOUN, not of the complement, so every complement that puts "Junge"
  // in an oblique case hits it. "im Junge" should be "im Jungen".
  test('German should decline the weak masculine in a locative too: "im Jungen"', () => {
    expect(inPlace('RUN', np('BOY'))).toMatchObject({ de: 'der Kater läuft im Jungen.' });
  });

  // A41. HOME resists the plain "in the <place>" locative: every language marks "at home" with a
  // fixed idiom, not the article-fused preposition the engine reaches for on any common noun. So
  // "the cat runs at home" comes out as "in the home" / "dans le foyer" / "en el hogar" / "no lar"
  // / "im Zuhause" — each grammatical but wrong: HOME names a hearth, and none of these idioms
  // takes a locative that way. The fix is a per-noun locative override on HOME (like the
  // proper-noun article-drop of A29, but keyed to the lexeme, not to `proper`); it is a property
  // of the NOUN, so every licensing verb inherits it. Japanese is already right — 家で is exactly
  // "at home" — and HOUSE ("in the house", "nella casa", …) stays untouched, which is why the
  // suite tests the complement itself with HOUSE, not HOME.
  test.fails('HOME wants the "at home" idiom, not "in the <home-word>"', () => {
    expect(inPlace('RUN', np('HOME'))).toMatchObject({
      en: 'the cat runs at home.',
      it: 'il gatto corre a casa.',
      fr: 'le chat court à la maison.',
      es: 'el gato corre en casa.',
      pt: 'o gato corre em casa.',
      de: 'der Kater läuft zu Hause.',
      ja: '猫は家で走ります。', // already correct
    });
  });
});

// A47. Spanish and Portuguese split the copula: `ser` for identity and inherent properties,
// `estar` for location and transient states. The engine has only one BE lexeme (ser/ser), so a
// located subject comes out as "*el gato es en la casa" / "*o gato é na casa" — the single most
// basic thing es/pt do that the other five languages do not. The locative half is mechanical:
// a place is ALWAYS estar, whatever the noun and whatever the spatial relation.
describe('known bugs: Spanish/Portuguese ser vs estar in a locative', () => {
  test.fails('a located subject takes estar, not ser', () => {
    expect(inPlace('BE')).toMatchObject({
      es: 'el gato está en la casa.',
      pt: 'o gato está na casa.',
    });
  });

  test.fails('the spatial relations take estar too', () => {
    expect(atPlace('under')).toMatchObject({
      es: 'el gato está debajo de la casa.',
      pt: 'o gato está debaixo da casa.',
    });
    expect(atPlace('behind')).toMatchObject({
      es: 'el gato está detrás de la casa.',
      pt: 'o gato está atrás da casa.',
    });
  });

  // The past inherits the same choice — the preterite of estar, not of ser ("fue"/"foi").
  test.fails('the past locative is the preterite of estar', () => {
    expect(sayAll(clause(np('CAT'), 'BE', {
      verbPhrase: { verb: 'BE', tense: 'past' },
      complements: { locative: { phrase: np('HOUSE') } },
    }))).toMatchObject({
      es: 'el gato estuvo en la casa.',
      pt: 'o gato esteve na casa.',
    });
  });
});
