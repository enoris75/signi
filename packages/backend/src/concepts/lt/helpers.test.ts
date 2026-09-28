import { describe, expect, test } from 'vitest';
import { a, adj, as, e, fem, i, is, language, paradigm, soften, us, verb, ys } from './helpers.js';

// P18-E4: the Lithuanian column's helpers. A helper is wrong for every word of its class at once, so
// each is pinned here by one worked paradigm, as a Lithuanian grammar tabulates it. (verify) until the
// native review (P18-E12), like every form they make.
const SG = ['base', 'gen_sg', 'dat_sg', 'acc_sg', 'ins_sg', 'loc_sg', 'voc_sg'];
const PL = ['plural', 'gen_pl', 'dat_pl', 'acc_pl', 'ins_pl', 'loc_pl'];
const row = (forms: Record<string, string>, keys: string[]) => keys.map((k) => forms[k]).join(', ');

describe('soften', () => {
  test('palatalises t and d before i, and nothing else', () => {
    expect([soften('med'), soften('kat'), soften('brol'), soften('arkl')]).toEqual(['medž', 'kač', 'brol', 'arkl']);
  });
});

describe('the noun classes (P18 D3)', () => {
  test.each([
    ['-as', as('nam'), 'namas, namo, namui, namą, namu, name, name', 'namai, namų, namams, namus, namais, namuose'],
    ['-ias', as('keli'), 'kelias, kelio, keliui, kelią, keliu, kelyje, kely', 'keliai, kelių, keliams, kelius, keliais, keliuose'],
    ['-ias, č → t before y', as('sveči'), 'svečias, svečio, svečiui, svečią, svečiu, svetyje, svety', 'svečiai, svečių, svečiams, svečius, svečiais, svečiuose'],
    ['-jas', as('vėj'), 'vėjas, vėjo, vėjui, vėją, vėju, vėjyje, vėjau', 'vėjai, vėjų, vėjams, vėjus, vėjais, vėjuose'],
    ['-is', is('brol'), 'brolis, brolio, broliui, brolį, broliu, brolyje, broli', 'broliai, brolių, broliams, brolius, broliais, broliuose'],
    ['-is, d → dž', is('med'), 'medis, medžio, medžiui, medį, medžiu, medyje, medi', 'medžiai, medžių, medžiams, medžius, medžiais, medžiuose'],
    ['-ys', ys('arkl'), 'arklys, arklio, arkliui, arklį, arkliu, arklyje, arkly', 'arkliai, arklių, arkliams, arklius, arkliais, arkliuose'],
    ['-us', us('sūn'), 'sūnus, sūnaus, sūnui, sūnų, sūnumi, sūnuje, sūnau', 'sūnūs, sūnų, sūnums, sūnus, sūnumis, sūnuose'],
    ['-ius', us('skaiči'), 'skaičius, skaičiaus, skaičiui, skaičių, skaičiumi, skaičiuje, skaičiau', 'skaičiai, skaičių, skaičiams, skaičius, skaičiais, skaičiuose'],
    ['-a', a('rank'), 'ranka, rankos, rankai, ranką, ranka, rankoje, ranka', 'rankos, rankų, rankoms, rankas, rankomis, rankose'],
    ['-ia', a('žini'), 'žinia, žinios, žiniai, žinią, žinia, žinioje, žinia', 'žinios, žinių, žinioms, žinias, žiniomis, žiniose'],
    ['-ė', e('kat'), 'katė, katės, katei, katę, kate, katėje, kate', 'katės, kačių, katėms, kates, katėmis, katėse'],
    ['i-stem', i('šird'), 'širdis, širdies, širdžiai, širdį, širdimi, širdyje, širdie', 'širdys, širdžių, širdims, širdis, širdimis, širdyse'],
  ])('%s', (_, forms, sg, pl) => {
    expect(row(forms, SG)).toBe(sg);
    expect(row(forms, PL)).toBe(pl);
  });

  test('genders: -as, -is, -ys, -us masculine; -a, -ė, i-stems feminine unless told', () => {
    expect([as('nam'), is('brol'), ys('arkl'), us('sūn')].map((f) => f['gender'])).toEqual(['masc', 'masc', 'masc', 'masc']);
    expect([a('rank'), e('kat'), i('pil')].map((f) => f['gender'])).toEqual(['fem', 'fem', 'fem']);
    expect(e('dėd', undefined, 'masc')['gender']).toBe('masc');
  });

  test('the agent nouns in -ojas / -ėjas take the locative -juje; vėjas keeps -yje', () => {
    expect([as('mokytoj')['loc_sg'], as('kūrėj')['loc_sg'], as('vėj')['loc_sg']]).toEqual(['mokytojuje', 'kūrėjuje', 'vėjyje']);
  });

  test('an io-stem in j takes no i before the back vowel', () => {
    expect(row(is('atvej'), SG)).toBe('atvejis, atvejo, atvejui, atvejį, atveju, atvejyje, atveji');
    expect(row(is('atvej'), PL)).toBe('atvejai, atvejų, atvejams, atvejus, atvejais, atvejuose');
  });

  test('a masculine i-stem takes the dative -iui', () => {
    expect(i('dant', { genPl: 'dantų' }, 'masc')).toMatchObject({ dat_sg: 'dančiui', gen_sg: 'danties', gen_pl: 'dantų', gender: 'masc' });
  });

  test('an i-stem that takes -ų in the genitive plural says so', () => {
    expect(i('nakt', { genPl: 'naktų' })['gen_pl']).toBe('naktų');
  });

  test('a mass noun stores no plural', () => {
    const water = as('vanden', { sgOnly: true });
    expect(water['plural']).toBeUndefined();
    expect(water['gen_pl']).toBeUndefined();
    expect(water['count']).toBe('singular');
  });

  test('a feminine rides under fem_ keys', () => {
    const cat = as('katin', { extra: fem(e('kat')) });
    expect(cat).toMatchObject({ base: 'katinas', fem: 'katė', fem_gen_sg: 'katės', fem_plural: 'katės', fem_gen_pl: 'kačių', gender: 'masc' });
    expect(cat['fem_gender']).toBeUndefined();
  });

  test('an irregular noun is written out in full', () => {
    const dog = paradigm('šuo, šuns, šuniui, šunį, šunimi, šunyje, šunie', 'šunys, šunų, šunims, šunis, šunimis, šunyse');
    expect(dog['gen_sg']).toBe('šuns');
    expect(() => paradigm('šuo, šuns')).toThrow(/expected 7 forms/);
  });

  test('a language name declines kalba alone (P18 §3)', () => {
    expect(row(language('lietuvių'), SG)).toBe(
      'lietuvių kalba, lietuvių kalbos, lietuvių kalbai, lietuvių kalbą, lietuvių kalba, lietuvių kalboje, lietuvių kalba',
    );
    expect(language('lietuvių')).toMatchObject({ gender: 'fem', count: 'singular' });
    expect(language('lietuvių')['plural']).toBeUndefined();
  });
});

describe('verbs from their principal parts (P18 D4)', () => {
  const tense = (v: Record<string, string>, t: string, prefix = '') =>
    ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'].map((p) => v[`${prefix}${p}_${t}`]).join(', ');
  const eat = verb('valgyti, valgo, valgė', 'suvalgyti, suvalgo, suvalgė');

  test('valgyti: the o-present and the ė-past', () => {
    expect(eat['base']).toBe('valgyti');
    expect(tense(eat, 'present')).toBe('valgau, valgai, valgo, valgome, valgote, valgo');
    expect(tense(eat, 'past')).toBe('valgiau, valgei, valgė, valgėme, valgėte, valgė');
    expect(tense(eat, 'frequentative')).toBe('valgydavau, valgydavai, valgydavo, valgydavome, valgydavote, valgydavo');
    expect(tense(eat, 'future')).toBe('valgysiu, valgysi, valgys, valgysime, valgysite, valgys');
    expect(tense(eat, 'conditional')).toBe('valgyčiau, valgytum, valgytų, valgytume, valgytumėte, valgytų');
    expect([eat['2sg_imperative'], eat['1pl_imperative'], eat['2pl_imperative']]).toEqual(['valgyk', 'valgykime', 'valgykite']);
  });

  test('the participles: half-participle, active past (the resultative), passive past (A01)', () => {
    expect([eat['adverbial'], eat['adverbial_fem'], eat['adverbial_plural'], eat['adverbial_fem_plural']]).toEqual(['valgydamas', 'valgydama', 'valgydami', 'valgydamos']);
    expect([eat['pf_past_active'], eat['pf_past_active_fem'], eat['pf_past_active_plural'], eat['pf_past_active_fem_plural']]).toEqual(['suvalgęs', 'suvalgiusi', 'suvalgę', 'suvalgiusios']);
    expect([eat['pf_passive'], eat['pf_passive_fem'], eat['pf_passive_plural'], eat['pf_passive_fem_plural'], eat['pf_passive_neut']]).toEqual(['suvalgytas', 'suvalgyta', 'suvalgyti', 'suvalgytos', 'suvalgyta']);
  });

  test('the perfective rides under pf_ keys, future included (P05 D1)', () => {
    expect(eat['pf_base']).toBe('suvalgyti');
    expect(tense(eat, 'future', 'pf_')).toBe('suvalgysiu, suvalgysi, suvalgys, suvalgysime, suvalgysite, suvalgys');
    expect(tense(eat, 'past', 'pf_')).toBe('suvalgiau, suvalgei, suvalgė, suvalgėme, suvalgėte, suvalgė');
    expect(verb('mylėti, myli, mylėjo')['pf_base']).toBeUndefined();
  });

  test('the a-present, and the i-present with t/d softened in the 1sg', () => {
    expect(tense(verb('eiti, eina, ėjo'), 'present')).toBe('einu, eini, eina, einame, einate, eina');
    expect(tense(verb('šaukti, šaukia, šaukė'), 'present')).toBe('šaukiu, šauki, šaukia, šaukiame, šaukiate, šaukia');
    expect(tense(verb('mylėti, myli, mylėjo'), 'present')).toBe('myliu, myli, myli, mylime, mylite, myli');
    expect(tense(verb('girdėti, girdi, girdėjo'), 'present')).toBe('girdžiu, girdi, girdi, girdime, girdite, girdi');
  });

  test('the o-past, and the ė-past with t softened in the 1sg', () => {
    expect(tense(verb('eiti, eina, ėjo'), 'past')).toBe('ėjau, ėjai, ėjo, ėjome, ėjote, ėjo');
    expect(tense(verb('matyti, mato, matė'), 'past')).toBe('mačiau, matei, matė, matėme, matėte, matė');
    expect(verb('matyti, mato, matė')['past_active_fem']).toBe('mačiusi');
  });

  test('the future: sibilant stems take no second s, a one-syllable y/ū stem shortens the 3rd person', () => {
    expect(tense(verb('nešti, neša, nešė'), 'future')).toBe('nešiu, neši, neš, nešime, nešite, neš');
    expect(tense(verb('vežti, veža, vežė'), 'future')).toBe('vešiu, veši, veš, vešime, vešite, veš');
    expect(verb('būti, būna, buvo')['3sg_future']).toBe('bus');
    expect(verb('būti, būna, buvo')['1sg_future']).toBe('būsiu');
    expect(verb('matyti, mato, matė')['3sg_future']).toBe('matys');
  });

  test('the imperative drops a stem-final g or k before -k', () => {
    const run = verb('bėgti, bėga, bėgo');
    expect([run['2sg_imperative'], run['1pl_imperative'], run['2pl_imperative']]).toEqual(['bėk', 'bėkime', 'bėkite']);
    expect(verb('eiti, eina, ėjo')['2sg_imperative']).toBe('eik');
  });

  test('a reflexive keeps -tis on base only; its cells are bare for the engine to attach -si', () => {
    const wash = verb('praustis, prausia, prausė', undefined, { reflexive: '1' });
    expect(wash).toMatchObject({ base: 'praustis', '3sg_present': 'prausia', '3sg_past': 'prausė', reflexive: '1' });
  });

  test('over replaces the cells that break the rules', () => {
    const be = verb({ parts: 'būti, yra, buvo', over: { '1sg_present': 'esu', '2sg_present': 'esi', '1pl_present': 'esame', '2pl_present': 'esate' } });
    expect(tense(be, 'present')).toBe('esu, esi, yra, esame, esate, yra');
    expect(tense(be, 'past')).toBe('buvau, buvai, buvo, buvome, buvote, buvo');
  });

  test('refuses parts it cannot read', () => {
    expect(() => verb('valgyti, valgo')).toThrow(/expected 3 forms/);
    expect(() => verb('valgyt, valgo, valgė')).toThrow(/neither -ti nor -tis/);
  });
});

describe('adjectives (P18 §2.1)', () => {
  test.each([
    ['geras', { fem: 'gera', neuter: 'gera', comparative: 'geresnis', superlative: 'geriausias' }],
    ['baltas', { fem: 'balta', neuter: 'balta', comparative: 'baltesnis', superlative: 'balčiausias' }],
    ['žalias', { fem: 'žalia', neuter: 'žalia', comparative: 'žalesnis', superlative: 'žaliausias' }],
    ['gražus', { fem: 'graži', neuter: 'gražu', comparative: 'gražesnis', superlative: 'gražiausias' }],
    ['saldus', { fem: 'saldi', neuter: 'saldu', comparative: 'saldesnis', superlative: 'saldžiausias' }],
    ['tuščias', { fem: 'tuščia', neuter: 'tuščia', comparative: 'tuštesnis', superlative: 'tuščiausias' }],
  ])('%s', (base, expected) => {
    expect(adj(base)).toMatchObject({ base, ...expected });
  });

  test('an irregular degree is passed in', () => {
    expect(adj('didelis', { comparative: 'didesnis', superlative: 'didžiausias' })).toMatchObject({ fem: 'didelė', comparative: 'didesnis', superlative: 'didžiausias' });
  });
});
