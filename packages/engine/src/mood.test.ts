import { describe, expect, test } from 'vitest';
import { imperativeForm, moodForm, moodPN, statePastForm } from './mood.js';

const verb = (conceptId: string, forms: Record<string, string>) => ({ conceptId, forms });
const MORDER = verb('BITE', { base: 'morder', '1sg_present': 'muerdo', '3sg_present': 'muerde', '1pl_present': 'mordemos' });
const EMPEZAR = verb('START', { base: 'empezar', '1sg_present': 'empiezo', '3sg_present': 'empieza', '1pl_present': 'empezamos' });
const ENVIAR = verb('SEND', { base: 'enviar', '1sg_present': 'envío', '3sg_present': 'envía', '1pl_present': 'enviamos' });
const VENIR = verb('COME', { base: 'venir', '1sg_present': 'vengo', '3sg_present': 'viene', '1pl_present': 'venimos' });
const HACER = verb('MAKE', { base: 'hacer', '1sg_present': 'hago', '3sg_present': 'hace', '1pl_present': 'hacemos' });

describe('imperativeForm (es)', () => {
  // A103: the 1st/2nd-plural subjunctive of a stem-changing -ar/-er verb takes the unstressed stem.
  test('the 1st and 2nd plural subjunctive take the unstressed stem', () => {
    expect(imperativeForm('es', MORDER, '1pl', false)).toBe('mordamos');
    expect(imperativeForm('es', MORDER, '2pl', true)).toBe('mordáis');
    expect(imperativeForm('es', EMPEZAR, '1pl', false)).toBe('empecemos');
    expect(imperativeForm('es', ENVIAR, '2pl', true)).toBe('enviéis');
  });

  test('the tú negative keeps the stressed stem, and an irregular 1sg stem stays in every person', () => {
    expect(imperativeForm('es', MORDER, '2sg', true)).toBe('muerdas');
    expect(imperativeForm('es', ENVIAR, '2sg', true)).toBe('envíes');
    expect(imperativeForm('es', VENIR, '1pl', false)).toBe('vengamos');
    expect(imperativeForm('es', HACER, '2pl', true)).toBe('hagáis');
  });

  test('GO and GIVE are irregular', () => {
    const IR = verb('GO', { base: 'ir', '1sg_present': 'voy', '3sg_present': 'va', '1pl_present': 'vamos' });
    const DAR = verb('GIVE', { base: 'dar', '1sg_present': 'doy', '3sg_present': 'da', '1pl_present': 'damos' });
    expect(imperativeForm('es', IR, '2sg', false)).toBe('ve');
    expect(imperativeForm('es', IR, '1pl', false)).toBe('vamos');
    expect(imperativeForm('es', IR, '2sg', true)).toBe('vayas');
    expect(imperativeForm('es', DAR, '1pl', false)).toBe('demos');
    expect(imperativeForm('es', DAR, '2sg', true)).toBe('des');
  });

  test('HAVE (tener) takes the short tú command ten; its other persons are regular', () => {
    const TENER = verb('HAVE', { base: 'tener', '1sg_present': 'tengo', '3sg_present': 'tiene', '1pl_present': 'tenemos' });
    expect(imperativeForm('es', TENER, '2sg', false)).toBe('ten');
    expect(imperativeForm('es', TENER, '1pl', false)).toBe('tengamos');
    expect(imperativeForm('es', TENER, '2pl', false)).toBe('tened');
    expect(imperativeForm('es', TENER, '2sg', true)).toBe('tengas');
  });

  test('an -ir verb that diphthongs under stress raises to i in the 1st and 2nd plural', () => {
    const SENTIR = verb('FEEL', { base: 'sentir', '1sg_present': 'siento', '3sg_present': 'siente', '1pl_present': 'sentimos' });
    const ADQUIRIR = verb('ACQUIRE', { base: 'adquirir', '1sg_present': 'adquiero', '3sg_present': 'adquiere', '1pl_present': 'adquirimos' });
    const TRANSFERIR = verb('TRANSFER', { base: 'transferir', '1sg_present': 'transfiero', '3sg_present': 'transfiere', '1pl_present': 'transferimos' });
    expect(imperativeForm('es', SENTIR, '2sg', true)).toBe('sientas');
    expect(imperativeForm('es', SENTIR, '1pl', false)).toBe('sintamos');
    expect(imperativeForm('es', ADQUIRIR, '2pl', true)).toBe('adquiráis');
    expect(imperativeForm('es', TRANSFERIR, '1pl', false)).toBe('transfiramos');
  });

  test('Portuguese keeps the 1sg stem', () => {
    const MORDER_PT = verb('BITE', { base: 'morder', '1sg_present': 'mordo', '1pl_present': 'mordemos' });
    expect(imperativeForm('pt', MORDER_PT, '1pl', false)).toBe('mordamos');
  });
});

describe('imperativeForm (pt)', () => {
  // A107: dar and ir are irregular, ç respells to c, z stays, and -ear drops its i when unstressed.
  test('GIVE and GO take their irregular subjunctive', () => {
    const DAR = verb('GIVE', { base: 'dar', '1sg_present': 'dou' });
    const IR = verb('GO', { base: 'ir', '1sg_present': 'vou' });
    expect(imperativeForm('pt', DAR, '2sg', false)).toBe('dê');
    expect(imperativeForm('pt', DAR, '2pl', true)).toBe('deem');
    expect(imperativeForm('pt', IR, '1pl', false)).toBe('vamos');
    expect(imperativeForm('pt', IR, '2pl', false)).toBe('vão');
  });

  test('an -ar stem respells ç as c before -e, and keeps z and the gu / qu respellings', () => {
    expect(imperativeForm('pt', verb('START', { base: 'começar', '1sg_present': 'começo' }), '2sg', false)).toBe('comece');
    expect(imperativeForm('pt', verb('CROSS', { base: 'cruzar', '1sg_present': 'cruzo' }), '2sg', false)).toBe('cruze');
    expect(imperativeForm('pt', verb('LOAD', { base: 'carregar', '1sg_present': 'carrego' }), '2sg', false)).toBe('carregue');
    expect(imperativeForm('pt', verb('CLICK', { base: 'clicar', '1sg_present': 'clico' }), '1pl', false)).toBe('cliquemos');
  });

  test('an -ear verb keeps its i only under stress', () => {
    const NOMEAR = verb('NAME', { base: 'nomear', '1sg_present': 'nomeio' });
    expect(imperativeForm('pt', NOMEAR, '2sg', false)).toBe('nomeie');
    expect(imperativeForm('pt', NOMEAR, '1pl', false)).toBe('nomeemos');
    expect(imperativeForm('pt', NOMEAR, '2pl', false)).toBe('nomeiem');
  });

  test('an -ar stem already ending in gu is not respelled again', () => {
    const AVERIGUAR = verb('FIND_OUT', { base: 'averiguar', '1sg_present': 'averiguo' });
    expect(imperativeForm('pt', AVERIGUAR, '2sg', false)).toBe('averigue');
    expect(imperativeForm('pt', AVERIGUAR, '1pl', false)).toBe('averiguemos');
  });
});

describe('imperativeForm and moodForm: the languages that build them in-engine', () => {
  test('English, German and Japanese get no synthetic form', () => {
    for (const lang of ['en', 'de', 'ja'] as const) {
      const GO = verb('GO', { base: 'go', '1sg_future': 'will go', '1pl_present': 'go' });
      expect(imperativeForm(lang, GO, '2sg', false)).toBeUndefined();
      expect(moodForm(lang, GO, '3sg', 'conditional')).toBeUndefined();
      expect(moodForm(lang, GO, '3sg', 'subjunctive')).toBeUndefined();
    }
  });
});

describe('moodForm', () => {
  test('is undefined with no hypothetical mood', () => {
    const ANDARE = verb('GO', { base: 'andare', '1sg_future': 'andrò' });
    expect(moodForm('it', ANDARE, '3sg', undefined)).toBeUndefined();
    expect(moodForm('it', ANDARE, '3sg', 'indicative')).toBeUndefined();
  });

  test('is undefined when the source stem is missing, so the caller conjugates', () => {
    const BARE = verb('GO', {});
    expect(moodForm('it', BARE, '3sg', 'conditional')).toBeUndefined();
    expect(moodForm('it', BARE, '3sg', 'subjunctive')).toBeUndefined();
    expect(moodForm('es', BARE, '3sg', 'subjunctive')).toBeUndefined();
    expect(moodForm('pt', BARE, '3sg', 'subjunctive')).toBeUndefined();
    expect(moodForm('fr', BARE, '3sg', 'subjunctive')).toBeUndefined();
  });
});

// A170: the relative under a negated antecedent reads the present subjunctive in any person, not
// only the imperative's three. The 3rd persons keep the stressed stem; only 1pl / 2pl take the
// unstressed one.
describe('moodForm: the present subjunctive (es, pt)', () => {
  const persons = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'] as const;
  const paradigm = (lang: 'es' | 'pt', v: ReturnType<typeof verb>) => persons.map((pn) => moodForm(lang, v, pn, 'presentSubjunctive'));

  test('Spanish derives all six persons off the 1sg stem, the plural 1st and 2nd unstressed', () => {
    const COMER = verb('EAT', { base: 'comer', '1sg_present': 'como', '1pl_present': 'comemos' });
    const CANTAR = verb('SING', { base: 'cantar', '1sg_present': 'canto', '1pl_present': 'cantamos' });
    expect(paradigm('es', COMER)).toEqual(['coma', 'comas', 'coma', 'comamos', 'comáis', 'coman']);
    expect(paradigm('es', CANTAR)).toEqual(['cante', 'cantes', 'cante', 'cantemos', 'cantéis', 'canten']);
    expect(paradigm('es', MORDER)).toEqual(['muerda', 'muerdas', 'muerda', 'mordamos', 'mordáis', 'muerdan']);
    expect(paradigm('es', EMPEZAR)).toEqual(['empiece', 'empieces', 'empiece', 'empecemos', 'empecéis', 'empiecen']);
    expect(paradigm('es', ENVIAR)).toEqual(['envíe', 'envíes', 'envíe', 'enviemos', 'enviéis', 'envíen']);
    expect(paradigm('es', VENIR)).toEqual(['venga', 'vengas', 'venga', 'vengamos', 'vengáis', 'vengan']);
  });

  test('Portuguese agrees vocês as the 3rd plural, and keeps the -ear i only under stress', () => {
    const COMER = verb('EAT', { base: 'comer', '1sg_present': 'como' });
    const NOMEAR = verb('NAME', { base: 'nomear', '1sg_present': 'nomeio' });
    expect(paradigm('pt', COMER)).toEqual(['coma', 'coma', 'coma', 'comamos', 'comam', 'comam']);
    expect(paradigm('pt', NOMEAR)).toEqual(['nomeie', 'nomeie', 'nomeie', 'nomeemos', 'nomeiem', 'nomeiem']);
  });

  test('the irregular verbs and the aspect auxiliaries take their own stem in the 3rd persons too', () => {
    const third = (lang: 'es' | 'pt', conceptId: string) =>
      [moodForm(lang, verb(conceptId, {}), '3sg', 'presentSubjunctive'), moodForm(lang, verb(conceptId, {}), '3pl', 'presentSubjunctive')];
    expect(['BE', 'ESTAR', 'GIVE', 'GO', 'KNOW', 'HABER'].map((id) => third('es', id))).toEqual([
      ['sea', 'sean'], ['esté', 'estén'], ['dé', 'den'], ['vaya', 'vayan'], ['sepa', 'sepan'], ['haya', 'hayan'],
    ]);
    expect(['BE', 'ESTAR', 'GIVE', 'GO', 'KNOW', 'TER', 'WILL'].map((id) => third('pt', id))).toEqual([
      ['seja', 'sejam'], ['esteja', 'estejam'], ['dê', 'deem'], ['vá', 'vão'], ['saiba', 'saibam'], ['tenha', 'tenham'], ['queira', 'queiram'],
    ]);
  });

  test('is undefined with no stem to derive from, and in the languages that keep the indicative', () => {
    expect(moodForm('es', verb('EAT', { base: 'comer' }), '3sg', 'presentSubjunctive')).toBeUndefined();
    const MANGIARE = verb('EAT', { base: 'mangiare', '1sg_present': 'mangio' });
    expect(moodForm('it', MANGIARE, '3sg', 'presentSubjunctive')).toBeUndefined();
    expect(moodForm('fr', verb('EAT', { base: 'manger', '1sg_present': 'mange' }), '3sg', 'presentSubjunctive')).toBeUndefined();
    expect(moodForm('en', verb('EAT', { base: 'eat', '1sg_present': 'eat' }), '3sg', 'presentSubjunctive')).toBeUndefined();
  });
});

// B11: the 1st-plural imperfect subjunctive is stressed on the stem's last vowel, and the spelling
// marks it. Only that person: the others are stressed on the ending's first syllable.
describe('moodForm: the 1st-plural imperfect subjunctive accent (es, pt)', () => {
  test('Spanish writes the acute on the stem\'s last vowel, irregular preterites included', () => {
    const COMER = verb('EAT', { base: 'comer', '3pl_past': 'comieron' });
    expect(moodForm('es', COMER, '1pl', 'subjunctive')).toBe('comiéramos');
    expect(moodForm('es', COMER, '2pl', 'subjunctive')).toBe('comierais');
    expect(moodForm('es', COMER, '3pl', 'subjunctive')).toBe('comieran');
    expect(moodForm('es', verb('SING', { base: 'cantar', '3pl_past': 'cantaron' }), '1pl', 'subjunctive')).toBe('cantáramos');
    expect(moodForm('es', verb('BE', { base: 'ser', '3pl_past': 'fueron' }), '1pl', 'subjunctive')).toBe('fuéramos');
    expect(moodForm('es', verb('HABER', { '3pl_past': 'hubieron' }), '1pl', 'subjunctive')).toBe('hubiéramos');
    expect(moodForm('es', verb('READ', { base: 'leer', '3pl_past': 'leyeron' }), '1pl', 'subjunctive')).toBe('leyéramos');
  });

  test('Portuguese writes á, í and ô by the stem vowel', () => {
    expect(moodForm('pt', verb('SPEAK', { base: 'falar', '3sg_past': 'falou', '3pl_past': 'falaram' }), '1pl', 'subjunctive')).toBe('falássemos');
    expect(moodForm('pt', verb('LEAVE', { base: 'partir', '3sg_past': 'partiu', '3pl_past': 'partiram' }), '1pl', 'subjunctive')).toBe('partíssemos');
    expect(moodForm('pt', verb('BE', { base: 'ser', '3sg_past': 'foi', '3pl_past': 'foram' }), '1pl', 'subjunctive')).toBe('fôssemos');
    // A stem vowel already written with its accent keeps it.
    expect(moodForm('pt', verb('OWN', { base: 'possuir', '3sg_past': 'possuiu', '3pl_past': 'possuíram' }), '1pl', 'subjunctive')).toBe('possuíssemos');
  });

  // The spelling cannot choose: "comeram" and "tiveram" look alike. The 3sg preterite can: -eu for a
  // regular -er verb, anything else for a strong one. "dar" is strong though its 3sg is "deu".
  test('Portuguese writes ê for a regular -er preterite and é for a strong one', () => {
    const COMER = verb('EAT', { base: 'comer', '3sg_past': 'comeu', '3pl_past': 'comeram' });
    expect(moodForm('pt', COMER, '1pl', 'subjunctive')).toBe('comêssemos');
    expect(moodForm('pt', COMER, '3pl', 'subjunctive')).toBe('comessem');
    expect(moodForm('pt', verb('HAVE', { base: 'ter', '3sg_past': 'teve', '3pl_past': 'tiveram' }), '1pl', 'subjunctive')).toBe('tivéssemos');
    expect(moodForm('pt', verb('GIVE', { base: 'dar', '3sg_past': 'deu', '3pl_past': 'deram' }), '1pl', 'subjunctive')).toBe('déssemos');
    expect(moodForm('pt', verb('COME', { base: 'vir', '3sg_past': 'veio', '3pl_past': 'vieram' }), '1pl', 'subjunctive')).toBe('viéssemos');
    // A reflexive verb's stored forms keep their "-se" and clitic; the rule sees through them.
    expect(moodForm('pt', verb('MOVE_ONESELF', { base: 'mover-se', '3sg_past': 'se moveu', '3pl_past': 'se moveram' }), '1pl', 'subjunctive'))
      .toBe('se movêssemos');
    // The aspect auxiliaries carry only their preterite stem, and are strong.
    expect(moodForm('pt', verb('ESTAR', { '3pl_past': 'estiveram' }), '1pl', 'subjunctive')).toBe('estivéssemos');
    expect(moodForm('pt', verb('TER', { '3pl_past': 'tiveram' }), '1pl', 'subjunctive')).toBe('tivéssemos');
  });
});

describe('moodPN', () => {
  test('reads the person and number off the subject, defaulting to the 3rd singular', () => {
    expect(moodPN({ person: '1', number: 'plural' })).toBe('1pl');
    expect(moodPN({ person: '2' })).toBe('2sg');
    expect(moodPN({ number: 'plural' })).toBe('3pl');
    expect(moodPN({})).toBe('3sg');
  });
});

describe('imperativeForm (it) and moodForm (it): irregular stems', () => {
  test('HAVE (avere) takes the subjunctive-based abbi / abbiamo / abbiate', () => {
    const AVERE = verb('HAVE', { base: 'avere', '2sg_present': 'hai', '1pl_present': 'abbiamo', '2pl_present': 'avete' });
    expect(imperativeForm('it', AVERE, '2sg', false)).toBe('abbi');
    expect(imperativeForm('it', AVERE, '2pl', false)).toBe('abbiate');
    expect(imperativeForm('it', AVERE, '2pl', true)).toBe('abbiate');
    expect(imperativeForm('it', AVERE, '2sg', true)).toBe('avere'); // negative tu → infinitive
  });

  test('PRODUCE (produrre) builds its imperfect subjunctive on produc-, its conditional on produrr-', () => {
    const PRODURRE = verb('PRODUCE', { base: 'produrre', '1sg_future': 'produrrò' });
    expect(moodForm('it', PRODURRE, '3sg', 'subjunctive')).toBe('producesse');
    expect(moodForm('it', PRODURRE, '1pl', 'subjunctive')).toBe('producessimo');
    expect(moodForm('it', PRODURRE, '3sg', 'conditional')).toBe('produrrebbe');
  });
});

// A130: a state in the past takes the imperfect, derived from the stored stems.
describe('statePastForm', () => {
  const state = (conceptId: string, forms: Record<string, string>) => verb(conceptId, { ...forms, stative: '1' });

  test('Italian drops -re for -va, and essere and the contracted infinitives keep their own stem', () => {
    const VOLERE = state('WILL', { base: 'volere' });
    expect(statePastForm('it', VOLERE, '3sg', 'past', undefined)).toBe('voleva');
    expect(statePastForm('it', VOLERE, '1pl', 'past', undefined)).toBe('volevamo');
    expect(statePastForm('it', state('LOVE', { base: 'amare' }), '3pl', 'past', undefined)).toBe('amavano');
    expect(statePastForm('it', state('BE', { base: 'essere' }), '1sg', 'past', undefined)).toBe('ero');
    expect(statePastForm('it', state('BE', { base: 'essere' }), '2pl', 'past', undefined)).toBe('eravate');
    expect(statePastForm('it', state('PRODUCE', { base: 'produrre' }), '3sg', 'past', undefined)).toBe('produceva');
    expect(statePastForm('it', state('SAY', { base: 'dire' }), '3sg', 'past', undefined)).toBe('diceva');
  });

  test('French is the imparfait on the nous stem, être on ét-', () => {
    expect(statePastForm('fr', state('HAVE', { base: 'avoir', '1pl_present': 'avons' }), '3sg', 'past', undefined)).toBe('avait');
    expect(statePastForm('fr', state('KNOW', { base: 'connaître', '1pl_present': 'connaissons' }), '1pl', 'past', undefined)).toBe('connaissions');
    expect(statePastForm('fr', state('BE', { base: 'être', '1pl_present': 'sommes' }), '3pl', 'past', undefined)).toBe('étaient');
  });

  test('Spanish takes -aba or -ía, with ser, ir and ver irregular', () => {
    expect(statePastForm('es', state('LOVE', { base: 'amar' }), '1pl', 'past', undefined)).toBe('amábamos');
    expect(statePastForm('es', state('HAVE', { base: 'tener' }), '3sg', 'past', undefined)).toBe('tenía');
    expect(statePastForm('es', state('OWN', { base: 'poseer' }), '3pl', 'past', undefined)).toBe('poseían');
    expect(statePastForm('es', state('BE', { base: 'ser' }), '1pl', 'past', undefined)).toBe('éramos');
    expect(statePastForm('es', state('GO', { base: 'ir' }), '2sg', 'past', undefined)).toBe('ibas');
    expect(statePastForm('es', state('SEE', { base: 'ver' }), '3sg', 'past', undefined)).toBe('veía');
  });

  test('Portuguese takes -ava or -ia, with -ía after a vowel and ser, ter, vir and pôr irregular', () => {
    expect(statePastForm('pt', state('LOVE', { base: 'amar' }), '1pl', 'past', undefined)).toBe('amávamos');
    expect(statePastForm('pt', state('WILL', { base: 'querer' }), '2pl', 'past', undefined)).toBe('queriam');
    expect(statePastForm('pt', state('OWN', { base: 'possuir' }), '3sg', 'past', undefined)).toBe('possuía');
    expect(statePastForm('pt', state('OWN', { base: 'possuir' }), '3pl', 'past', undefined)).toBe('possuíam');
    expect(statePastForm('pt', state('BE', { base: 'ser' }), '1pl', 'past', undefined)).toBe('éramos');
    expect(statePastForm('pt', state('HAVE', { base: 'ter', '3sg_present': 'tem' }), '3sg', 'past', undefined)).toBe('tinha');
    expect(statePastForm('pt', state('HOLD', { base: 'conter', '3sg_present': 'contém' }), '1pl', 'past', undefined)).toBe('contínhamos');
    expect(statePastForm('pt', state('COME', { base: 'vir', '3sg_present': 'vem' }), '3sg', 'past', undefined)).toBe('vinha');
    expect(statePastForm('pt', state('PUT', { base: 'pôr', '3sg_present': 'põe' }), '1pl', 'past', undefined)).toBe('púnhamos');
    // bater and servir only look like ter / vir: their 3sg is no "tem" / "vem".
    expect(statePastForm('pt', state('BEAT', { base: 'bater', '3sg_present': 'bate' }), '3sg', 'past', undefined)).toBe('batia');
    expect(statePastForm('pt', state('SERVE', { base: 'servir', '3sg_present': 'serve' }), '3sg', 'past', undefined)).toBe('servia');
  });

  test('is undefined for an event, another tense, a hypothetical mood, a language that builds its own past, or no stem', () => {
    const VOLERE = state('WILL', { base: 'volere' });
    expect(statePastForm('it', verb('EAT', { base: 'mangiare' }), '3sg', 'past', undefined)).toBeUndefined();
    expect(statePastForm('it', VOLERE, '3sg', 'present', undefined)).toBeUndefined();
    expect(statePastForm('it', VOLERE, '3sg', undefined, undefined)).toBeUndefined();
    expect(statePastForm('it', VOLERE, '3sg', 'past', 'subjunctive')).toBeUndefined();
    expect(statePastForm('it', VOLERE, '3sg', 'past', 'imperative')).toBeUndefined();
    expect(statePastForm('it', VOLERE, '3sg', 'past', 'indicative')).toBe('voleva');
    expect(statePastForm('de', state('WILL', { base: 'wollen' }), '3sg', 'past', undefined)).toBeUndefined();
    expect(statePastForm('it', state('WILL', {}), '3sg', 'past', undefined)).toBeUndefined();
  });
});
