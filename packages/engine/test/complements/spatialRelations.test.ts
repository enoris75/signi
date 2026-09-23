import { describe, expect, test } from 'vitest';
import type { NounElement, NounPhrase, PathSpecifier } from '@signi/shared';
import { clause, np, sayAll, specifierAll } from '../harness.js';

// P09-E1: the three relations the everyday set was missing — support (`on`), a landmark on each side
// (`between`) and contact (`against`). The seeded corpus has no table and no tree, so the house, the
// wall and the market stand in for them; the relation is the complement's, not the noun's.
const at = (value: PathSpecifier, place: NounElement, verb = 'BE') =>
  sayAll(clause(np('CAT'), verb, { complements: { locative: { phrase: place, specifiers: [{ kind: 'path', value }] } } }));
const toward = (value: PathSpecifier, goal: NounElement) =>
  sayAll(clause(np('CAT'), 'JUMP', { complements: { direction: { phrase: goal, specifiers: [{ kind: 'path', value }] } } }));
const via = (value: PathSpecifier, path: NounElement) =>
  sayAll(clause(np('CAT'), 'GO', { complements: { route: { phrase: path, specifiers: [{ kind: 'path', value }] } } }));
const and = (...conjuncts: NounPhrase[]): NounElement => ({ conjuncts, conjunction: 'and' });

describe('on — support, apart from over', () => {
  test('a place', () => {
    expect(at('on', np('HOUSE'))).toEqual({
      en: 'the cat is on the house.',
      it: 'il gatto è sulla casa.', // su + la = sulla
      fr: 'le chat est sur la maison.',
      de: 'der Kater ist auf dem Haus.', // auf is two-way: the dative of place
      // sobre, not the "en" / "em" that `in` already spells (D1).
      es: 'el gato está sobre la casa.',
      pt: 'o gato está sobre a casa.',
      ja: '猫は家の上にいます。',
    });
  });

  test('the determiner still declines, and fuses only where the language fuses it', () => {
    expect(at('on', np('WALL'), 'RUN')).toMatchObject({
      it: 'il gatto corre sul muro.',
      de: 'der Kater läuft auf der Wand.',
      pt: 'o gato corre sobre a parede.',
    });
    expect(at('on', np('WALL', { definiteness: 'indefinite' }), 'RUN')).toMatchObject({
      en: 'the cat runs on a wall.',
      it: 'il gatto corre su un muro.',
      fr: 'le chat court sur un mur.',
      de: 'der Kater läuft auf einer Wand.',
      es: 'el gato corre sobre una pared.',
      pt: 'o gato corre sobre uma parede.',
    });
  });

  // P09-E21: English writes the goal "onto", as it writes `in`'s "into"; the other six are the
  // word of the place, German telling the goal by its accusative and Japanese by its へ.
  test('a goal: English "onto", German the accusative of motion onto it', () => {
    expect(toward('on', np('WALL'))).toEqual({
      en: 'the cat jumps onto the wall.',
      it: 'il gatto salta sul muro.',
      fr: 'le chat saute sur le mur.',
      de: 'der Kater springt auf die Wand.',
      es: 'el gato salta sobre la pared.',
      pt: 'o gato pula sobre a parede.',
      ja: '猫は壁の上へ跳びます。',
    });
  });

  // The goal's "onto" is the direction's alone: the place where the jumping happens keeps "on".
  test('the locative on is unchanged beside the goal', () => {
    expect(at('on', np('WALL'), 'JUMP')).toEqual({
      en: 'the cat jumps on the wall.',
      it: 'il gatto salta sul muro.',
      fr: 'le chat saute sur le mur.',
      de: 'der Kater springt auf der Wand.',
      es: 'el gato salta sobre la pared.',
      pt: 'o gato pula sobre a parede.',
      ja: '猫は壁の上で跳びます。',
    });
  });

  test('a path', () => {
    expect(via('on', np('MARKET'))).toEqual({
      en: 'the cat goes on the market.',
      it: 'il gatto va sul mercato.',
      fr: 'le chat va sur le marché.',
      de: 'der Kater geht auf dem Markt.',
      es: 'el gato va sobre el mercado.',
      pt: 'o gato vai sobre o mercado.',
      ja: '猫は市場の上を行きます。',
    });
  });

  test('six of the seven keep on and over apart', () => {
    const on = at('on', np('HOUSE'));
    const over = at('over', np('HOUSE'));
    for (const lang of ['en', 'it', 'fr', 'de', 'es', 'pt'] as const) expect(on[lang]).not.toBe(over[lang]);
  });

  // Deliberate (D1): Japanese has one word for support and superiority, 〜の上, and 〜の表面に for
  // contact would be a paraphrase rather than a relation. Pinned so nobody "fixes" it by accident.
  test('Japanese does not tell on from over, by design', () => {
    expect(at('on', np('HOUSE')).ja).toBe(at('over', np('HOUSE')).ja);
    expect(at('on', np('HOUSE'), 'RUN').ja).toBe('猫は家の上で走ります。');
    expect(at('over', np('HOUSE'), 'RUN').ja).toBe('猫は家の上で走ります。');
    expect(specifierAll({ kind: 'path', value: 'on' }).ja).toBe(specifierAll({ kind: 'path', value: 'over' }).ja);
  });

  test('a pronoun takes the tonic form', () => {
    expect(at('on', np('THIRD_PERSON'), 'RUN')).toMatchObject({
      it: 'il gatto corre su di lui.',
      fr: 'le chat court sur lui.',
      de: 'der Kater läuft auf ihm.',
      es: 'el gato corre sobre él.',
      pt: 'o gato corre sobre ele.',
    });
  });

  test('a coordinated landmark distributes, as every relation but between does', () => {
    expect(at('on', and(np('HOUSE'), np('MARKET')), 'RUN')).toMatchObject({
      it: 'il gatto corre sulla casa e sul mercato.',
      de: 'der Kater läuft auf dem Haus und auf dem Markt.',
    });
  });
});

// D2: the one relation whose adposition scopes over the coordinated group rather than being said
// on each conjunct. Each conjunct keeps its own article, and in German its own case.
describe('between — one preposition over the whole group', () => {
  const pair = and(np('HOUSE'), np('MARKET'));

  test('a place between two landmarks, in every language', () => {
    expect(at('between', pair, 'RUN')).toEqual({
      en: 'the cat runs between the house and the market.',
      it: 'il gatto corre tra la casa e il mercato.',
      fr: 'le chat court entre la maison et le marché.',
      // Both dative, each on its own article: never "zwischen dem Haus und zwischen dem Markt".
      de: 'der Kater läuft zwischen dem Haus und dem Markt.',
      es: 'el gato corre entre la casa y el mercado.',
      pt: 'o gato corre entre a casa e o mercado.',
      // Japanese needs nothing: の間 follows the whole group, as every relational noun does.
      ja: '猫は家と市場の間で走ります。',
    });
  });

  test('the copula', () => {
    expect(at('between', pair)).toMatchObject({
      en: 'the cat is between the house and the market.',
      es: 'el gato está entre la casa y el mercado.',
      ja: '猫は家と市場の間にいます。',
    });
  });

  test('a goal: German declines each conjunct in the accusative', () => {
    expect(toward('between', pair)).toEqual({
      en: 'the cat jumps between the house and the market.',
      it: 'il gatto salta tra la casa e il mercato.',
      fr: 'le chat saute entre la maison et le marché.',
      de: 'der Kater springt zwischen das Haus und den Markt.',
      es: 'el gato salta entre la casa y el mercado.',
      pt: 'o gato pula entre a casa e o mercado.',
      ja: '猫は家と市場の間へ跳びます。',
    });
  });

  test('a path', () => {
    expect(via('between', pair)).toMatchObject({
      it: 'il gatto va tra la casa e il mercato.',
      de: 'der Kater geht zwischen dem Haus und dem Markt.',
      ja: '猫は家と市場の間を行きます。',
    });
  });

  test('bare plurals keep their own determiners too', () => {
    const plurals = and(np('HOUSE', { definiteness: 'bare', number: 'plural' }), np('MARKET', { definiteness: 'bare', number: 'plural' }));
    expect(at('between', plurals, 'RUN')).toMatchObject({
      en: 'the cat runs between houses and markets.',
      it: 'il gatto corre tra case e mercati.',
      // A196: French has no zero article after a preposition — each conjunct takes its "des".
      fr: 'le chat court entre des maisons et des marchés.',
      de: 'der Kater läuft zwischen Häusern und Märkten.',
    });
  });

  test('pronouns take their tonic forms, and Spanish its nominative', () => {
    expect(at('between', and(np('SECOND_PERSON'), np('FIRST_PERSON')), 'RUN')).toMatchObject({
      en: 'the cat runs between you and me.',
      it: 'il gatto corre tra te e me.',
      fr: 'le chat court entre toi et moi.',
      de: 'der Kater läuft zwischen dir und mir.',
      // "entre" is one of the prepositions that govern the nominative: never "entre ti y mí".
      es: 'el gato corre entre tú y yo.',
    });
    expect(at('between', and(np('THIRD_PERSON'), np('DOG')), 'RUN')).toMatchObject({
      de: 'der Kater läuft zwischen ihm und dem Hund.',
      pt: 'o gato corre entre ele e o cão.',
    });
  });

  // Open point D2: a single landmark is odd but not ill-formed, and asking for two is the
  // builder's business. It renders, with nothing dropped.
  test('a single landmark renders', () => {
    expect(at('between', np('HOUSE'), 'RUN')).toEqual({
      en: 'the cat runs between the house.',
      it: 'il gatto corre tra la casa.',
      fr: 'le chat court entre la maison.',
      de: 'der Kater läuft zwischen dem Haus.',
      es: 'el gato corre entre la casa.',
      pt: 'o gato corre entre a casa.',
      ja: '猫は家の間で走ります。',
    });
  });
});

// D3: physical contact only. German "an", not "gegen"; Japanese has no adposition for it at all.
describe('against — contact', () => {
  test('a place', () => {
    expect(at('against', np('WALL'), 'RUN')).toEqual({
      en: 'the cat runs against the wall.',
      it: 'il gatto corre contro il muro.',
      fr: 'le chat court contre le mur.',
      de: 'der Kater läuft an der Wand.',
      es: 'el gato corre contra la pared.',
      pt: 'o gato corre contra a parede.',
      ja: '猫は壁に走ります。',
    });
  });

  test('German "an" fuses with the definite dative, and takes the accusative under a goal', () => {
    expect(at('against', np('HOUSE'), 'RUN').de).toBe('der Kater läuft am Haus.');
    expect(at('against', np('WALL', { definiteness: 'indefinite' }), 'RUN').de).toBe('der Kater läuft an einer Wand.');
    expect(toward('against', np('WALL'))).toEqual({
      en: 'the cat jumps against the wall.',
      it: 'il gatto salta contro il muro.',
      fr: 'le chat saute contre le mur.',
      de: 'der Kater springt an die Wand.',
      es: 'el gato salta contra la pared.',
      pt: 'o gato pula contra a parede.',
      ja: '猫は壁に跳びます。',
    });
  });

  test('a pronoun takes the tonic form', () => {
    expect(at('against', np('THIRD_PERSON'), 'RUN')).toMatchObject({
      it: 'il gatto corre contro di lui.',
      fr: 'le chat court contre lui.',
      de: 'der Kater läuft an ihm.',
      es: 'el gato corre contra él.',
    });
  });

  // A known flattening (D3), pinned as deliberate: the relation lives in a Japanese verb (もたれる),
  // so a place and a goal take plain に with no relational noun — never the locative's で or the
  // goal's へ. A route keeps its を, which marks the traversal and not the relation.
  test('Japanese renders contact with plain に', () => {
    expect(at('against', np('WALL'), 'RUN').ja).toBe('猫は壁に走ります。');
    expect(toward('against', np('WALL')).ja).toBe('猫は壁に跳びます。');
    expect(via('against', np('MARKET')).ja).toBe('猫は市場を行きます。');
    expect(specifierAll({ kind: 'path', value: 'against' }).ja).toBe('〜に');
  });
});

describe('the toolbar names each relation by its adposition', () => {
  test.each([
    ['on', { en: 'on', it: 'su', fr: 'sur', de: 'auf', es: 'sobre', pt: 'sobre', ja: '〜の上で' }],
    ['between', { en: 'between', it: 'tra', fr: 'entre', de: 'zwischen', es: 'entre', pt: 'entre', ja: '〜の間で' }],
    ['against', { en: 'against', it: 'contro', fr: 'contre', de: 'an', es: 'contra', pt: 'contra', ja: '〜に' }],
  ] as const)('%s', (value, labels) => {
    expect(specifierAll({ kind: 'path', value })).toEqual(labels);
  });
});
