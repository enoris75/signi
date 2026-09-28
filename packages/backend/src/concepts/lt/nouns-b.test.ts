import { describe, expect, test } from 'vitest';
import { nouns } from '../nouns.js';
import { PL_NOUNS_B } from '../pl/nouns-b.js';
import { LT_NOUNS_B } from './nouns-b.js';

// P18-E5: the Lithuanian nouns, part B — Polish's slice. Every form is (verify) until the native review
// (P18-E12); this pins the shape the engine reads (style-lt.md) and a handful of the hardest forms.
describe('the Lithuanian nouns, part B (P18-E5)', () => {
  const IDS = `
    BROTHER_IN_LAW SISTER_IN_LAW STEPFATHER STEPMOTHER MOM DAD PARTNER BOYFRIEND GIRLFRIEND FIANCE
    FRIEND YOUNG_MAN YOUNG_WOMAN BUILDER CREATOR PETER MARY DIETH MR MARKET COIN LEGEND WING TOOTH TEAR
    PRISON PHRASE SLOT SLOT_COMPUTING SLOT_MACHINE WORD MEANING FACT REASON INFORMATION PROBABILITY
    TRANSLATION QUESTION TELEPHONE MIND BRACKET CONTAINER MAP NODE RELATIONSHIP CONDITION NUMBER
    NUMBER_LABEL QUANTITY UNIT PERCENT CATEGORY KIND_SORT CONTINENT AFRICA EUROPE ASIA OCEANIA
    NORTH_AMERICA SOUTH_AMERICA ANTARCTICA COUNTRY CITY ENGLAND ITALY FRANCE GERMANY SPAIN JAPAN PORTUGAL
    ZURICH LANGUAGE ENGLISH ITALIAN FRENCH GERMAN SPANISH JAPANESE PORTUGUESE SWISS_GERMAN ROMANSH
    RUMANTSCH_GRISCHUN SURSILVAN VALLADER CATALAN POLISH LITHUANIAN SPELLING PERIOD_TIME MOMENT DAY HOUR
    MINUTE MONTH WEEK NIGHT MORNING YEAR PARTICIPANT_GRAMMAR AGENT_GRAMMAR SUBJECT_GRAMMAR VOCATIVE
    OBJECT_GRAMMAR SUBJECT_COMPLEMENT OBJECT_COMPLEMENT INSTRUMENTAL COMITATIVE ADVERBIAL_OF_MANNER
    COMPLEMENT_GRAMMAR LOCATIVE DIRECTION SOURCE ROUTE CAUSE_COMPLEMENT TEMPORAL_COMPLEMENT
    PURPOSE_COMPLEMENT OPPONENT_COMPLEMENT TOPIC_COMPLEMENT ROLE_COMPLEMENT INTERJECTION TERMINUS NOUN
    PRONOUN VERB ADVERB ADJECTIVE INFINITIVE_PHRASE VERB_PHRASE NOUN_PHRASE CLAUSE RELATIVE_CLAUSE
    STATEMENT COORDINATION CONJUNCT CONJUNCTION MODIFIER HYPERNYM DETERMINER ARTICLE DEMONSTRATIVE
    QUANTIFIER PERIOD_SENTENCE PERIOD_PUNCTUATION PERSON_GRAMMAR NUMBER_GRAMMAR SINGULAR_GRAMMAR
    PLURAL_GRAMMAR CASE_GRAMMAR
  `.trim().split(/\s+/);
  const SG = ['base', 'gen_sg', 'dat_sg', 'acc_sg', 'ins_sg', 'loc_sg', 'voc_sg'];
  const PL = ['plural', 'gen_pl', 'dat_pl', 'acc_pl', 'ins_pl', 'loc_pl'];
  const FEM = ['fem', ...SG.slice(1).map((k) => `fem_${k}`), ...PL.map((k) => `fem_${k}`)];
  const entries = Object.entries(LT_NOUNS_B);

  /** Polish's plurale tantum countries, singular in Lithuanian: *Italija, Vokietija*. */
  const SINGULAR_WHERE_POLISH_IS_PLURAL = ['ITALY', 'GERMANY'];

  test('covers exactly the slice, and only nouns', () => {
    expect(IDS).toHaveLength(148);
    expect(new Set(IDS).size).toBe(148);
    expect(Object.keys(LT_NOUNS_B).sort()).toEqual([...IDS].sort());
    expect(Object.keys(PL_NOUNS_B).sort()).toEqual([...IDS].sort());
    expect(IDS.filter((id) => !nouns.some((c) => c.id === id))).toEqual([]);
  });

  test('stores every singular case and a masc|fem gender', () => {
    const bad = entries.flatMap(([id, e]) =>
      [...SG.filter((k) => !e[k]), ...(['masc', 'fem'].includes(e['gender'] ?? '') ? [] : ['gender'])].map((k) => `${id}.${k}`),
    );
    expect(bad).toEqual([]);
  });

  test('stores a whole plural wherever Polish has one', () => {
    const bad = entries.flatMap(([id, e]) => {
      if (!PL_NOUNS_B[id]!['plural'] || SINGULAR_WHERE_POLISH_IS_PLURAL.includes(id)) return [];
      return PL.filter((k) => !e[k]).map((k) => `${id}.${k}`);
    });
    expect(bad).toEqual([]);
    for (const id of SINGULAR_WHERE_POLISH_IS_PLURAL) expect(LT_NOUNS_B[id]!['plural']).toBeUndefined();
  });

  test('stores a whole feminine wherever Polish has one, and nowhere else', () => {
    const polish = IDS.filter((id) => PL_NOUNS_B[id]!['fem']);
    const lithuanian = IDS.filter((id) => LT_NOUNS_B[id]!['fem']);
    expect(lithuanian).toEqual(polish);
    const bad = lithuanian.flatMap((id) => FEM.filter((k) => !LT_NOUNS_B[id]![k]).map((k) => `${id}.${k}`));
    expect(bad).toEqual([]);
  });

  test('names every language with the people\'s genitive plural + kalba, feminine, no plural', () => {
    const languages = IDS.filter((id) => nouns.find((c) => c.id === id)!.isA?.match(/^(LANGUAGE|ROMANSH)$/));
    expect(languages).toHaveLength(15);
    for (const id of languages) {
      expect(LT_NOUNS_B[id]!['base'], id).toMatch(/ kalba$/);
      expect(LT_NOUNS_B[id]!['ins_sg'], id).toMatch(/ kalba$/);
      expect(LT_NOUNS_B[id]!['gender'], id).toBe('fem');
      expect(LT_NOUNS_B[id]!['plural'], id).toBeUndefined();
    }
  });

  test('declines the tricky forms', () => {
    const e = LT_NOUNS_B;
    // The masculine i-stem and the consonant stems, written out.
    expect(e['TOOTH']).toMatchObject({ gender: 'masc', dat_sg: 'dančiui', ins_sg: 'dantimi', gen_pl: 'dantų', dat_pl: 'dantims' });
    expect(e['MONTH']).toMatchObject({ base: 'mėnuo', gen_sg: 'mėnesio', loc_sg: 'mėnesyje', plural: 'mėnesiai' });
    expect(e['PERSON_GRAMMAR']).toMatchObject({ base: 'asmuo', gen_sg: 'asmens', dat_sg: 'asmeniui', gen_pl: 'asmenų' });
    // Softening before io / ių.
    expect(e['DAD']).toMatchObject({ base: 'tėtis', gen_sg: 'tėčio', acc_sg: 'tėtį', loc_sg: 'tėtyje', plural: 'tėčiai', as_name: '1' });
    expect(e['NOUN']).toMatchObject({ gen_sg: 'daiktavardžio', voc_sg: 'daiktavardi' });
    expect(e['WEEK']).toMatchObject({ gen_pl: 'savaičių', loc_sg: 'savaitėje' });
    expect(e['REASON']).toMatchObject({ base: 'motyvas' });
    expect(e['NIGHT']).toMatchObject({ gen_sg: 'nakties', dat_sg: 'nakčiai', gen_pl: 'naktų' });
    // Plural-only: the singular keys hold the plural.
    expect(e['YEAR']).toMatchObject({ base: 'metai', gen_sg: 'metų', acc_sg: 'metus', loc_sg: 'metuose', voc_sg: 'metai', plurale_tantum: '1' });
    // The u-stem and the -ius noun with the io plural.
    expect(e['MARKET']).toMatchObject({ gen_sg: 'turgaus', ins_sg: 'turgumi', plural: 'turgūs', dat_pl: 'turgums' });
    expect(e['NUMBER']).toMatchObject({ gen_sg: 'skaičiaus', loc_sg: 'skaičiuje', plural: 'skaičiai', loc_pl: 'skaičiuose' });
    // The proper-name vocative.
    expect(e['PETER']).toMatchObject({ base: 'Petras', loc_sg: 'Petre', voc_sg: 'Petrai' });
    expect(e['PETER']!['plural']).toBeUndefined();
    // Multiword: an agreeing adjective, an undeclined genitive, both.
    expect(e['YOUNG_WOMAN']).toMatchObject({ dat_sg: 'jaunai moteriai', acc_sg: 'jauną moterį', loc_sg: 'jaunoje moteryje', gen_pl: 'jaunų moterų' });
    expect(e['TERMINUS']).toMatchObject({ dat_sg: 'netiesioginiam papildiniui', loc_sg: 'netiesioginiame papildinyje', ins_pl: 'netiesioginiais papildiniais' });
    expect(e['DEMONSTRATIVE']).toMatchObject({ acc_sg: 'parodomąjį įvardį', dat_pl: 'parodomiesiems įvardžiams' });
    expect(e['RELATIVE_CLAUSE']).toMatchObject({ base: 'šalutinis pažyminio sakinys', gen_sg: 'šalutinio pažyminio sakinio' });
    expect(e['COMPLEMENT_GRAMMAR']).toMatchObject({ dat_sg: 'antrininei sakinio daliai', gen_pl: 'antrininių sakinio dalių', gender: 'fem' });
    expect(e['LOCATIVE']).toMatchObject({ base: 'vietos aplinkybė', ins_sg: 'vietos aplinkybe', gen_pl: 'vietos aplinkybių' });
    expect(e['NORTH_AMERICA']).toMatchObject({ base: 'Šiaurės Amerika', loc_sg: 'Šiaurės Amerikoje' });
    expect(e['SWISS_GERMAN']).toMatchObject({ base: 'šveicarų vokiečių kalba', acc_sg: 'šveicarų vokiečių kalbą' });
    // The feminines.
    expect(e['FRIEND']).toMatchObject({ base: 'draugas', voc_sg: 'drauge', fem: 'draugė', fem_gen_pl: 'draugių' });
    expect(e['CREATOR']).toMatchObject({ voc_sg: 'kūrėjau', fem: 'kūrėja', fem_loc_sg: 'kūrėjoje' });
  });
});
