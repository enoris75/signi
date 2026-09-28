import { describe, expect, test } from 'vitest';
import { nouns } from '../nouns.js';
import { PL_NOUNS_A } from '../pl/nouns-a.js';
import { LT_NOUNS_A } from './nouns-a.js';

// P18-E5: the first third of the Lithuanian nouns, the slice of Polish's `pl/nouns-a.ts`. Every form is
// (verify) until the native review (P18-E12); this pins the shape the engine reads (style-lt.md) and a
// handful of the forms most easily got wrong.
const IDS = [
  'ANIMAL', 'MAMMAL', 'FELINE', 'CAT', 'DOG', 'BIRD', 'FISH', 'REPTILE', 'AMPHIBIAN', 'INSECT', 'HORSE',
  'PIG', 'SHEEP', 'GOAT', 'RABBIT', 'BEAR', 'LION', 'TIGER', 'LEOPARD', 'PANTHER', 'PUMA', 'CHEETAH',
  'ELEPHANT', 'MONKEY', 'DEER', 'WHALE', 'CHICKEN', 'DUCK', 'EAGLE', 'OWL', 'PENGUIN', 'SHARK', 'SALMON',
  'SNAKE', 'TURTLE', 'CROCODILE', 'LIZARD', 'FROG', 'BEE', 'ANT', 'BUTTERFLY', 'MOSQUITO', 'SPIDER',
  'FOX', 'WOLF', 'BOVINE', 'COW', 'OX', 'MOUSE', 'FLY_INSECT', 'BOOK', 'AIR', 'GROUND', 'WATER', 'SPEED',
  'LIGHT', 'SOUND', 'WAY', 'TIME', 'CARE', 'SIZE', 'HEIGHT', 'LENGTH', 'QUALITY', 'STRENGTH', 'AGE',
  'TEMPERATURE', 'DISTANCE', 'SHAPE', 'CIRCLE', 'LINE_MARK', 'MONEY', 'FOOD', 'ICE_CREAM', 'SUGAR',
  'LIQUID', 'CONTENT', 'STICK', 'ARROW_PROJECTILE', 'BLADE', 'FIRE', 'FLAME', 'PLACE', 'POINT_NOUN',
  'AREA', 'CENTER', 'SIDE', 'DESTINATION', 'ORIGIN', 'PATH', 'DIRECTION_SPACE', 'BUILDING', 'WALL',
  'HOUSE', 'HOME', 'ROOM', 'OFFICE', 'DOOR', 'CAR', 'CHILD', 'KID', 'PERSON', 'SPEAKER', 'COMPANION',
  'RECIPIENT', 'BOY', 'GIRL', 'MAN', 'GUY', 'WOMAN', 'BUTCHER', 'ANGEL', 'LIFE', 'END', 'BEGINNING',
  'DEATH', 'FEELING', 'AFFECTION', 'FAMILY', 'PARENT', 'FATHER', 'MOTHER', 'RELATIVE', 'CHILD_OFFSPRING',
  'SON', 'DAUGHTER', 'SIBLING', 'BROTHER', 'SISTER', 'SPOUSE', 'HUSBAND', 'WIFE', 'GRANDPARENT',
  'GRANDFATHER', 'GRANDMOTHER', 'GRANDCHILD', 'GRANDSON', 'GRANDDAUGHTER', 'UNCLE', 'AUNT', 'COUSIN',
  'NEPHEW', 'NIECE', 'MOTHER_IN_LAW', 'FATHER_IN_LAW', 'SON_IN_LAW', 'DAUGHTER_IN_LAW',
];

/**
 * Where Polish carries a feminine and Lithuanian does not: the plain Lithuanian word is itself the
 * feminine general word (*katė, kiaulė, antis, lapė*) or epicene (*beždžionė*), so a `fem_` paradigm
 * would only repeat it.
 */
const NO_FEMININE = ['CAT', 'PIG', 'MONKEY', 'DUCK', 'FOX'];

const SG = ['base', 'gen_sg', 'dat_sg', 'acc_sg', 'ins_sg', 'loc_sg', 'voc_sg'];
const PL = ['plural', 'gen_pl', 'dat_pl', 'acc_pl', 'ins_pl', 'loc_pl'];
const FEM = ['fem', ...SG.slice(1).map((k) => `fem_${k}`), ...PL.map((k) => `fem_${k}`)];

describe('the Lithuanian nouns, part A (P18-E5)', () => {
  const seed = new Map(nouns.map((c) => [c.id, c]));
  const entries = Object.entries(LT_NOUNS_A);

  test('has an entry for every id of the part, and nothing else — the Polish slice exactly', () => {
    expect(IDS).toHaveLength(147);
    expect(Object.keys(LT_NOUNS_A).sort()).toEqual([...IDS].sort());
    expect(Object.keys(PL_NOUNS_A).sort()).toEqual([...IDS].sort());
  });

  test('keys only seeded nouns', () => {
    const bad = entries.filter(([id]) => seed.get(id)?.role !== 'noun').map(([id]) => id);
    expect(bad).toEqual([]);
  });

  test('stores all seven singular cases and a masc|fem gender on every noun', () => {
    const bad = entries.flatMap(([id, e]) => [
      ...SG.filter((k) => !e[k]).map((k) => `${id}.${k}`),
      ...(['masc', 'fem'].includes(e['gender']!) ? [] : [`${id}.gender`]),
      ...(e['count'] === 'singular' ? [] : [`${id}.count`]),
    ]);
    expect(bad).toEqual([]);
  });

  test('stores the six plural cases wherever Polish has a plural, and none on a mass noun', () => {
    const bad = entries.flatMap(([id, e]) => {
      const counts = PL_NOUNS_A[id]!['plural'] !== undefined;
      return counts
        ? PL.filter((k) => !e[k]).map((k) => `${id}.${k}`)
        : PL.filter((k) => e[k]).map((k) => `${id}.${k} (mass)`);
    });
    expect(bad).toEqual([]);
  });

  test('stores no plural on the concepts marked uncountable, unless plural-only', () => {
    const bad = entries
      .filter(([id, e]) => seed.get(id)!.countable === false && e['plurale_tantum'] !== '1' && e['plural'] !== undefined)
      .map(([id]) => id);
    expect(bad).toEqual([]);
  });

  test('carries a whole feminine paradigm wherever Polish has one (bar the justified few), and only there', () => {
    const bad = entries.flatMap(([id, e]) => {
      const hasFem = PL_NOUNS_A[id]!['fem'] !== undefined && !NO_FEMININE.includes(id);
      return hasFem
        ? FEM.filter((k) => !e[k]).map((k) => `${id}.${k}`)
        : FEM.filter((k) => e[k]).map((k) => `${id}.${k} (no feminine)`);
    });
    expect(bad).toEqual([]);
    expect(NO_FEMININE.every((id) => PL_NOUNS_A[id]!['fem'] !== undefined)).toBe(true);
  });

  test('a plural-only noun stores its plural in the singular keys too, vocative = nominative plural', () => {
    const tantum = entries.filter(([, e]) => e['plurale_tantum'] === '1');
    expect(tantum.map(([id]) => id).sort()).toEqual(['DOOR', 'HOME', 'ICE_CREAM', 'MONEY']);
    const bad = tantum.filter(([, e]) => SG.slice(0, 6).some((k, n) => e[k] !== e[PL[n]!]) || e['voc_sg'] !== e['plural'])
      .map(([id]) => id);
    expect(bad).toEqual([]);
  });

  test('stores no Polish-only key', () => {
    const bad = entries.filter(([, e]) => e['animate_acc'] !== undefined || e['virile'] !== undefined).map(([id]) => id);
    expect(bad).toEqual([]);
  });

  test.each([
    ['DOG', 'gen_sg', 'šuns'],
    ['DOG', 'ins_sg', 'šunimi'],
    ['DOG', 'fem_gen_pl', 'kalių'],
    ['CAT', 'gen_pl', 'kačių'],
    ['FISH', 'gen_pl', 'žuvų'],
    ['BIRD', 'gen_sg', 'paukščio'],
    ['OX', 'gen_sg', 'jaučio'],
    ['SIZE', 'gen_sg', 'dydžio'],
    ['DEER', 'loc_sg', 'elnyje'],
    ['DUCK', 'dat_sg', 'ančiai'],
    ['WATER', 'gen_sg', 'vandens'],
    ['PERSON', 'plural', 'žmonės'],
    ['PERSON', 'voc_sg', 'žmogau'],
    ['WOMAN', 'gen_sg', 'moters'],
    ['SISTER', 'acc_sg', 'seserį'],
    ['DAUGHTER', 'gen_pl', 'dukterų'],
    ['DAUGHTER_IN_LAW', 'gen_sg', 'marčios'],
    ['SON', 'plural', 'sūnūs'],
    ['UNCLE', 'gen_pl', 'dėdžių'],
    ['UNCLE', 'gender', 'masc'],
    ['DOOR', 'base', 'durys'],
    ['HOME', 'loc_sg', 'namuose'],
    ['MONEY', 'gen_sg', 'pinigų'],
    ['DESTINATION', 'loc_sg', 'paskirties vietoje'],
    ['ORIGIN', 'gen_pl', 'išvykimo vietų'],
    ['BEGINNING', 'gen_sg', 'pradžios'],
  ])('%s.%s is %s', (id, key, form) => {
    expect(LT_NOUNS_A[id]![key]).toBe(form);
  });
});
