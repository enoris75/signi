import { describe, expect, test } from 'vitest';
import { PATH_SPECIFIERS, type PathSpecifier } from '@signi/shared';
import { clause, np, sayAll } from '../harness.js';

const goVia = (value: PathSpecifier) =>
  sayAll(clause(np('CAT'), 'GO', {
    complements: { route: { phrase: np('MARKET'), specifiers: [{ kind: 'path', value }] } },
  }));

// The path a motion takes. The route carries a spatial specifier selecting the relation — through
// / under / over / around / behind / in front of / in. Each is a distinct adposition in every
// language, so all are pinned here. The locative shares the set (see locative.test.ts); what makes
// the two complements differ is the fallback, `through` here and `in` there.
describe('route', () => {
  test('through', () => {
    expect(goVia('through')).toEqual({
      en: 'the cat goes through the market.',
      it: 'il gatto va attraverso il mercato.',
      fr: 'le chat va à travers le marché.',
      // durch governs the ACCUSATIVE (den Markt), not the dative the two-way prepositions take.
      de: 'der Kater geht durch den Markt.',
      es: 'el gato va por el mercado.',
      pt: 'o gato vai pelo mercado.', // por + o = pelo
      // Japanese marks a traversed path with を, even though the verb is intransitive.
      ja: '猫は市場を行きます。',
    });
  });

  test('under', () => {
    expect(goVia('under')).toEqual({
      en: 'the cat goes under the market.',
      it: 'il gatto va sotto il mercato.',
      fr: 'le chat va sous le marché.',
      // unter is a two-way (Wechsel-) preposition and here takes the DATIVE (dem Markt).
      de: 'der Kater geht unter dem Markt.',
      es: 'el gato va debajo del mercado.',
      pt: 'o gato vai debaixo do mercado.',
      // The relational nouns (下 / 上 / 周り / 後ろ / 前) still take を for the traversal.
      ja: '猫は市場の下を行きます。',
    });
  });

  test('over', () => {
    expect(goVia('over')).toEqual({
      en: 'the cat goes over the market.',
      it: 'il gatto va sopra il mercato.',
      fr: 'le chat va au-dessus du marché.',
      de: 'der Kater geht über dem Markt.', // dative again — über is two-way
      es: 'el gato va por encima del mercado.',
      pt: 'o gato vai por cima do mercado.',
      ja: '猫は市場の上を行きます。',
    });
  });

  test('around', () => {
    expect(goVia('around')).toEqual({
      en: 'the cat goes around the market.',
      it: 'il gatto va intorno al mercato.', // intorno a + il = al
      fr: 'le chat va autour du marché.',
      de: 'der Kater geht um den Markt.', // um governs the accusative, like durch
      es: 'el gato va alrededor del mercado.',
      pt: 'o gato vai ao redor do mercado.',
      ja: '猫は市場の周りを行きます。',
    });
  });

  test('behind', () => {
    expect(goVia('behind')).toEqual({
      en: 'the cat goes behind the market.',
      it: 'il gatto va dietro il mercato.',
      fr: 'le chat va derrière le marché.',
      de: 'der Kater geht hinter dem Markt.', // dative — hinter is two-way
      es: 'el gato va detrás del mercado.',
      pt: 'o gato vai atrás do mercado.',
      ja: '猫は市場の後ろを行きます。',
    });
  });

  test('in front of', () => {
    expect(goVia('in_front_of')).toEqual({
      en: 'the cat goes in front of the market.',
      it: 'il gatto va davanti al mercato.', // davanti a + il = al
      fr: 'le chat va devant le marché.',
      de: 'der Kater geht vor dem Markt.', // dative — vor is two-way
      es: 'el gato va delante del mercado.',
      pt: 'o gato vai em frente do mercado.',
      ja: '猫は市場の前を行きます。',
    });
  });
});

// German is the interesting axis: durch and um govern the accusative, while the two-way (Wechsel-)
// prepositions — in / unter / über / hinter / vor — take the dative for a path. So the case on the
// article ("den Markt" vs "dem Markt") splits the relations into two classes.
describe('route: German accusative vs dative', () => {
  test('durch and um take the accusative', () => {
    expect(goVia('through').de).toBe('der Kater geht durch den Markt.');
    expect(goVia('around').de).toBe('der Kater geht um den Markt.');
  });

  test('the two-way prepositions take the dative', () => {
    for (const value of ['under', 'over', 'behind', 'in_front_of'] as const) {
      expect(goVia(value).de).toContain('dem Markt.');
    }
  });
});

// Every specifier renders, in every language — no dropped adposition or empty path.
describe('route: every specifier renders in every language', () => {
  test.each(PATH_SPECIFIERS)('%s', (value) => {
    const said = goVia(value);
    for (const lang of ['en', 'it', 'fr', 'es', 'pt', 'de', 'ja'] as const) {
      expect(said[lang]).toMatch(/[.。]$/);
      expect(said[lang]).not.toContain('undefined');
    }
    // The traversed noun and its を survive in Japanese for every relation.
    expect(said.ja).toContain('市場');
    expect(said.ja).toContain('を行きます');
  });
});
