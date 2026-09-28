import { describe, expect, test } from 'vitest';
import { nouns } from '../nouns.js';
import { PL_NOUNS_B } from './nouns-b.js';

// P05-E4: the Polish nouns, part B. Every form is (verify) until the native review (P05-E11); this
// pins the shape the engine reads (style-pl.md) and a handful of the hardest forms.
describe('the Polish nouns, part B (P05-E4)', () => {
  const IDS = `
    BROTHER_IN_LAW SISTER_IN_LAW STEPFATHER STEPMOTHER MOM DAD PARTNER BOYFRIEND GIRLFRIEND FIANCE
    FRIEND MARKET COIN LEGEND WING TOOTH TEAR YOUNG_MAN YOUNG_WOMAN PRISON BUILDER CREATOR PHRASE SLOT
    SLOT_COMPUTING SLOT_MACHINE WORD MEANING FACT REASON INFORMATION PROBABILITY TRANSLATION QUESTION
    TELEPHONE MIND CONTINENT AFRICA PETER MARY DIETH MR EUROPE ASIA OCEANIA NORTH_AMERICA SOUTH_AMERICA
    ANTARCTICA COUNTRY CITY ENGLAND ITALY FRANCE GERMANY SPAIN JAPAN PORTUGAL ZURICH LANGUAGE ENGLISH
    ITALIAN FRENCH GERMAN SPANISH JAPANESE PORTUGUESE SWISS_GERMAN ROMANSH RUMANTSCH_GRISCHUN SURSILVAN
    VALLADER CATALAN POLISH LITHUANIAN SPELLING PERIOD_TIME MOMENT DAY HOUR MINUTE MONTH WEEK NIGHT MORNING YEAR
    PARTICIPANT_GRAMMAR AGENT_GRAMMAR SUBJECT_GRAMMAR VOCATIVE OBJECT_GRAMMAR SUBJECT_COMPLEMENT
    OBJECT_COMPLEMENT INSTRUMENTAL COMITATIVE ADVERBIAL_OF_MANNER COMPLEMENT_GRAMMAR LOCATIVE DIRECTION
    SOURCE ROUTE CAUSE_COMPLEMENT TEMPORAL_COMPLEMENT PURPOSE_COMPLEMENT OPPONENT_COMPLEMENT
    TOPIC_COMPLEMENT ROLE_COMPLEMENT INTERJECTION TERMINUS NOUN PRONOUN VERB ADVERB ADJECTIVE
    INFINITIVE_PHRASE VERB_PHRASE NOUN_PHRASE CLAUSE RELATIVE_CLAUSE STATEMENT CONDITION COORDINATION
    CONJUNCT CONJUNCTION MODIFIER HYPERNYM DETERMINER ARTICLE DEMONSTRATIVE QUANTIFIER PERIOD_SENTENCE
    PERIOD_PUNCTUATION BRACKET CONTAINER MAP NODE RELATIONSHIP PERSON_GRAMMAR NUMBER NUMBER_LABEL
    QUANTITY UNIT PERCENT CATEGORY KIND_SORT NUMBER_GRAMMAR SINGULAR_GRAMMAR PLURAL_GRAMMAR CASE_GRAMMAR
  `.trim().split(/\s+/);
  const SG = ['base', 'gen_sg', 'dat_sg', 'acc_sg', 'ins_sg', 'loc_sg', 'voc_sg'];
  const PL = ['plural', 'gen_pl', 'dat_pl', 'acc_pl', 'ins_pl', 'loc_pl'];
  const entries = Object.entries(PL_NOUNS_B);
  const concept = (id: string) => nouns.find((c) => c.id === id)!;

  test('gives every noun of the slice an entry', () => {
    expect(IDS).toHaveLength(148);
    expect(IDS.filter((id) => !PL_NOUNS_B[id])).toEqual([]);
  });

  test('gives only nouns', () => {
    expect(Object.keys(PL_NOUNS_B).filter((id) => !nouns.some((c) => c.id === id))).toEqual([]);
  });

  test('stores every singular case and a gender', () => {
    const bad = entries.flatMap(([id, e]) =>
      [...SG.filter((k) => !e[k]), ...(['masc', 'fem', 'neut'].includes(e['gender'] ?? '') ? [] : ['gender'])].map((k) => `${id}.${k}`),
    );
    expect(bad).toEqual([]);
  });

  test('stores a whole plural wherever German or Spanish has one', () => {
    const bad = entries.flatMap(([id, e]) => {
      const c = concept(id);
      if (!c.forms['de']?.['plural'] && !c.forms['es']?.['plural']) return [];
      return PL.filter((k) => !e[k]).map((k) => `${id}.${k}`);
    });
    expect(bad).toEqual([]);
  });

  test('stores a whole feminine wherever Spanish has one', () => {
    const bad = entries.flatMap(([id, e]) => {
      if (!concept(id).forms['es']?.['fem']) return [];
      const keys = ['fem', ...SG.slice(1).map((k) => `fem_${k}`), ...PL.map((k) => `fem_${k}`)];
      return keys.filter((k) => !e[k]).map((k) => `${id}.${k}`);
    });
    expect(bad).toEqual([]);
  });

  // An indeclinable noun (every cell the base) is exempt: its accusative is its nominative.
  test('marks animate_acc exactly on the masculines whose accusative is their genitive', () => {
    const bad = entries
      .filter(([, e]) => e['base'] !== e['gen_sg'])
      .filter(([, e]) => (e['animate_acc'] === '1') !== (e['gender'] === 'masc' && e['acc_sg'] === e['gen_sg']))
      .map(([id]) => id);
    expect(bad).toEqual([]);
  });

  test('declines the tricky forms', () => {
    const e = PL_NOUNS_B;
    expect(e['FRIEND']).toMatchObject({ plural: 'przyjaciele', gen_pl: 'przyjaciół', ins_pl: 'przyjaciółmi', virile: '1' });
    expect(e['DAD']).toMatchObject({ gender: 'masc', acc_sg: 'tatę', loc_sg: 'tacie', virile: '1' });
    expect(e['DAD']!['animate_acc']).toBeUndefined();
    expect(e['STEPMOTHER']).toMatchObject({ dat_sg: 'macosze', gen_pl: 'macoch' });
    expect(e['TOOTH']).toMatchObject({ gen_sg: 'zęba', acc_sg: 'ząb', loc_sg: 'zębie' });
    expect(e['TEAR']).toMatchObject({ gen_pl: 'łez', loc_sg: 'łzie' });
    expect(e['NODE']).toMatchObject({ gen_sg: 'węzła', loc_sg: 'węźle' });
    expect(e['DAY']).toMatchObject({ gen_sg: 'dnia', plural: 'dni' });
    expect(e['WEEK']).toMatchObject({ gen_sg: 'tygodnia', gen_pl: 'tygodni' });
    expect(e['YEAR']).toMatchObject({ plural: 'lata', gen_pl: 'lat' });
    expect(e['CITY']).toMatchObject({ loc_sg: 'mieście' });
    expect(e['WING']).toMatchObject({ gen_pl: 'skrzydeł', loc_sg: 'skrzydle' });
    expect(e['MR']).toMatchObject({ voc_sg: 'panie', plural: 'panowie' });
    expect(e['GERMANY']).toMatchObject({ base: 'Niemcy', loc_pl: 'Niemczech', plurale_tantum: '1' });
    expect(e['POLISH']).toMatchObject({ base: 'polski', gen_sg: 'polskiego', dat_sg: 'polskiemu', acc_sg: 'polski', ins_sg: 'polskim', loc_sg: 'polskim', voc_sg: 'polski', gender: 'masc' });
    expect(e['POLISH']!['plural']).toBeUndefined();
    expect(e['LOCATIVE']).toMatchObject({ base: 'okolicznik miejsca', ins_sg: 'okolicznikiem miejsca' });
    expect(e['TERMINUS']).toMatchObject({ gen_sg: 'dopełnienia dalszego', gen_pl: 'dopełnień dalszych' });
    expect(e['FIANCE']).toMatchObject({ plural: 'narzeczeni', fem: 'narzeczona', fem_acc_sg: 'narzeczoną' });
  });
});
