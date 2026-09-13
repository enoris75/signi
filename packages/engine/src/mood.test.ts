import { describe, expect, test } from 'vitest';
import { imperativeForm } from './mood.js';

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
});
