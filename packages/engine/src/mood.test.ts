import { describe, expect, test } from 'vitest';
import { imperativeForm, moodForm, moodPN } from './mood.js';

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
