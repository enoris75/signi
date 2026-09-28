import { describe, expect, test } from 'vitest';
import { verbs } from '../verbs/index.js';
import { LT_VERBS_B } from './verbs-b.js';

// P18-E6: the Lithuanian verbs, part B (Polish's pl/verbs-b.ts slice). Every form is (verify) until the
// native review (P18-E12).
describe('the Lithuanian verbs, part B', () => {
  const IDS = [
    'SET', 'PIN', 'UNPIN', 'COMPLETE', 'APPLY', 'NAME', 'DESCRIBE', 'MODIFY', 'SPECIFY', 'EDIT', 'GOVERN',
    'ACCEPT', 'NEGATE', 'ASSERT', 'EXPRESS', 'SAY', 'SPEAK', 'CALL', 'CALL_PHONE', 'MEAN', 'BELIEVE', 'THINK',
    'HEAR', 'ANSWER', 'TELL', 'TELL_ORDER', 'ASK', 'REPLACE', 'BREATHE', 'EXCHANGE', 'ENCLOSE', 'GOVERN_STATE',
    'ACCOMPANY', 'SEARCH', 'FIND', 'MEET', 'ARRANGE', 'CONNECT', 'LET', 'ALLOW', 'LIKE', 'HELP_VERB', 'THANK',
    'MARRY', 'LEARN', 'FOLLOW', 'GIVE', 'SELL', 'PAY', 'PROVIDE', 'TRANSFER', 'SHOW', 'SEND', 'CRY', 'SUFFER',
    'BURN', 'COLLAPSE', 'LIVE', 'LIVE_ALIVE', 'DIE', 'STAY', 'WAIT', 'TRADE', 'ACT', 'WORK', 'WORK_LABOUR',
    'PLAY_GAME', 'LOSE_GAME', 'BEGIN', 'STOP_DOING', 'STOP_ONESELF', 'CONTINUE_DOING', 'CHANGE_ONESELF',
    'PRECEDE', 'HAPPEN', 'GROW', 'FLOW', 'RUN', 'JUMP', 'COME', 'GO', 'RETURN', 'TURN', 'LEAVE_DEPART',
    'RUN_AWAY', 'GO_OUT', 'WALK', 'MOVE_ONESELF', 'SIT_DOWN', 'STAND_UP', 'FLY', 'APPEAR', 'BE', 'BE_FARING',
    'BECOME', 'SEEM', 'MUST', 'CAN', 'WILL', 'MAY', 'MIGHT', 'SHOULD',
  ];
  const PERSONS = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'];
  const TENSES = ['present', 'past', 'future'];
  const CELLS = ['base', ...TENSES.flatMap((t) => PERSONS.map((p) => `${p}_${t}`))];
  const entries = Object.entries(LT_VERBS_B);
  const f = (id: string) => LT_VERBS_B[id]!;
  const blank = (id: string, keys: string[]) => keys.filter((k) => !f(id)[k]?.trim()).map((k) => `${id}.${k}`);
  const tense = (id: string, t: string, prefix = '') => PERSONS.map((p) => f(id)[`${prefix}${p}_${t}`]).join(', ');

  test('has an entry for every verb in its slice, and nothing else', () => {
    expect(IDS).toHaveLength(102);
    expect(new Set(IDS).size).toBe(102);
    expect(Object.keys(LT_VERBS_B).sort()).toEqual([...IDS].sort());
  });

  test('holds only verbs', () => {
    const verbIds = new Set(verbs.map((c) => c.id));
    expect(IDS.filter((id) => !verbIds.has(id))).toEqual([]);
  });

  test('gives every verb its base and six present, past and future persons', () => {
    expect(IDS.flatMap((id) => blank(id, CELLS))).toEqual([]);
  });

  test('gives every perfective the same cells, and repeats the 3rd person in the 3pl', () => {
    const paired = entries.filter(([, e]) => e['pf_base']).map(([id]) => id);
    expect(paired.length).toBeGreaterThan(20);
    expect(paired.flatMap((id) => blank(id, CELLS.map((k) => `pf_${k}`)))).toEqual([]);
    const split = entries.flatMap(([id, e]) => ['', 'pf_'].flatMap((pre) => TENSES
      .filter((t) => e[`${pre}base`] && e[`${pre}3sg_${t}`] !== e[`${pre}3pl_${t}`]).map((t) => `${id}.${pre}${t}`)));
    expect(split).toEqual([]);
  });

  test('stores no pf_ key without a pf_base', () => {
    const stray = entries.filter(([, e]) => !e['pf_base'] && Object.keys(e).some((k) => k.startsWith('pf_')));
    expect(stray.map(([id]) => id)).toEqual([]);
  });

  test('gives the modals no perfective and no imperative', () => {
    for (const id of ['MUST', 'CAN', 'WILL', 'MAY', 'MIGHT', 'SHOULD']) {
      expect(Object.keys(f(id)).filter((k) => k.startsWith('pf_') || k.endsWith('_imperative')), id).toEqual([]);
    }
    expect([f('MUST').base, f('CAN').base, f('WILL').base]).toEqual(['turėti', 'galėti', 'norėti']);
    expect(tense('SHOULD', 'present')).toBe('turėčiau, turėtum, turėtų, turėtume, turėtumėte, turėtų');
    expect(f('SHOULD').conditional).toBe('1');
  });

  test('writes a suffix reflexive without -si: -tis on base only, and no perfective', () => {
    const reflexive = entries.filter(([, e]) => e['reflexive'] === '1');
    expect(reflexive.map(([id]) => id).sort()).toEqual(['BE_FARING', 'CHANGE_ONESELF', 'LEARN', 'TURN']);
    for (const [id, e] of reflexive) {
      expect(e['base'], id).toMatch(/tis$/);
      expect(e['pf_base'], id).toBeUndefined();
      // The cells the engine attaches -si to are bare (the 2sg future *mokysi* ends in -si by itself).
      const leaks = ['1sg_present', '3sg_present', '1sg_past', '3sg_past', '3sg_future', '2sg_imperative'].filter((k) => /si$/.test(e[k]!));
      expect(leaks, id).toEqual([]);
    }
    expect(f('LEARN')).toMatchObject({ base: 'mokytis', '3sg_present': 'moko', '1sg_past': 'mokiau' });
    // A prefix reflexive keeps its -si- inside and carries no flag.
    expect(f('SIT_DOWN')).toMatchObject({ base: 'atsisėsti', '3sg_present': 'atsisėda', '3sg_past': 'atsisėdo' });
    expect(f('SIT_DOWN')['reflexive']).toBeUndefined();
  });

  test('stores the irregular and overridden forms', () => {
    expect(tense('BE', 'present')).toBe('esu, esi, yra, esame, esate, yra');
    expect(tense('BE', 'future')).toBe('būsiu, būsi, bus, būsime, būsite, bus');
    expect(f('BE')).toMatchObject({ '1sg_past': 'buvau', '2sg_imperative': 'būk', past_active_fem: 'buvusi', copula: '1' });
    expect(tense('BECOME', 'present')).toBe('tampu, tampi, tampa, tampame, tampate, tampa');
    expect(f('BECOME')).toMatchObject({ base: 'tapti', '3sg_past': 'tapo', '3sg_future': 'taps' });
    expect(f('GO')).toMatchObject({ '1sg_present': 'einu', '1sg_past': 'ėjau', '3sg_future': 'eis', '2sg_imperative': 'eik', pf_base: 'nueiti', pf_3sg_past: 'nuėjo' });
    expect(f('GIVE')).toMatchObject({ '1sg_present': 'duodu', '1sg_past': 'daviau', '3sg_future': 'duos', '2sg_imperative': 'duok', pf_base: 'atiduoti' });
    expect(f('FIND')).toMatchObject({ '1sg_present': 'randu', '1sg_past': 'radau', '3sg_future': 'ras', '2sg_imperative': 'rask' });
    expect(f('DIE')).toMatchObject({ '1sg_present': 'mirštu', '1sg_past': 'miriau', '3sg_future': 'mirs', past_active: 'miręs', past_active_fem: 'mirusi' });
    expect(f('ACCEPT')).toMatchObject({ '1sg_present': 'priimu', '1sg_past': 'priėmiau', past_active_fem: 'priėmusi' });
    expect(f('SEND')).toMatchObject({ '1sg_present': 'siunčiu', '2sg_present': 'siunti', '1sg_past': 'siunčiau', '3sg_future': 'siųs', pf_2sg_present: 'išsiunti', pf_past_active_fem: 'išsiuntusi' });
    expect(f('LET')).toMatchObject({ '1sg_present': 'leidžiu', '2sg_present': 'leidi', '3sg_future': 'leis', object_case: 'dat' });
    expect(f('CALL')).toMatchObject({ '2sg_present': 'kvieti', '1sg_past': 'kviečiau', past_active_fem: 'kvietusi' });
    expect(f('PLAY_GAME')).toMatchObject({ '1sg_present': 'žaidžiu', '2sg_present': 'žaidi', '1sg_past': 'žaidžiau', '3sg_future': 'žais' });
    expect(f('CHANGE_ONESELF')).toMatchObject({ base: 'keistis', '2sg_present': 'keiti', '3sg_present': 'keičia', past_active_fem: 'keitusi' });
    expect(f('SUFFER')).toMatchObject({ '1sg_present': 'kenčiu', '2sg_present': 'kenti' });
    expect(f('COLLAPSE')).toMatchObject({ '3sg_future': 'grius', pf_3sg_future: 'sugrius', pf_3pl_future: 'sugrius', pf_1sg_future: 'sugriūsiu' });
    expect(f('RETURN')).toMatchObject({ '1sg_future': 'grįšiu', '3sg_future': 'grįš' });
    expect(f('EXPRESS')).toMatchObject({ '1sg_future': 'išreikšiu', '2sg_imperative': 'išreikšk', past_active_fem: 'išreiškusi' });
    expect(f('WALK')).toMatchObject({ '1sg_present': 'vaikštau', '3sg_present': 'vaikšto', '3sg_past': 'vaikščiojo' });
    expect(f('FLY')).toMatchObject({ '1sg_present': 'skrendu', '1sg_past': 'skridau', '3sg_future': 'skris', pf_base: 'nuskristi' });
    expect(f('RUN')).toMatchObject({ '2sg_imperative': 'bėk', pf_base: 'nubėgti' });
    expect(f('ASK')['1sg_future']).toBe('klausiu');
  });

  test('keeps -iusi for the -yti verbs and writes -usi for the primary ones', () => {
    expect([f('SAY').past_active_fem, f('SHOW').pf_past_active_fem, f('SEEM').past_active_fem]).toEqual(['sakiusi', 'parodžiusi', 'atrodžiusi']);
    expect([f('COMPLETE').past_active_fem, f('WAIT').pf_past_active_fem, f('GIVE').past_active_fem_plural]).toEqual(['užbaigusi', 'palaukusi', 'davusios']);
  });

  test('marks government where the object is not a plain accusative', () => {
    expect(f('SEARCH').object_case).toBe('gen');
    expect(f('WAIT').object_case).toBe('gen');
    expect(f('LEARN').object_case).toBe('gen');
    expect(f('BREATHE').object_case).toBe('ins');
    expect(f('BELIEVE').object_case).toBe('ins');
    for (const id of ['CALL_PHONE', 'TELL_ORDER', 'HELP_VERB', 'THANK', 'LET', 'ALLOW']) expect(f(id).object_case, id).toBe('dat');
    for (const id of ['GIVE', 'SELL', 'PAY', 'PROVIDE', 'TRANSFER', 'SHOW', 'SEND', 'TELL', 'ANSWER', 'SEEM']) expect(f(id).terminus_case, id).toBe('dat');
    expect(f('GOVERN').object_case).toBeUndefined();
    expect(f('ASK')).toMatchObject({ object_prep: 'apie', object_prep_case: 'acc', terminus_case: 'gen', content_clause_force: 'interrogative' });
    expect(f('ANSWER')).toMatchObject({ object_prep: 'į', object_prep_case: 'acc' });
    expect(f('MEET')).toMatchObject({ object_prep: 'su', object_prep_case: 'ins' });
    expect(f('CONNECT')).toMatchObject({ terminus_prep: 'su', terminus_prep_case: 'ins' });
    expect(f('THINK')).toMatchObject({ topic_prep: 'apie', topic_prep_case: 'acc' });
    expect(f('FOLLOW')).toMatchObject({ object_prep: 'po', object_prep_case: 'gen' });
    expect(f('SEEM').seeming).toBe('1');
    expect(f('CONTINUE_DOING').complement_particle).toBe('toliau');
  });
});
