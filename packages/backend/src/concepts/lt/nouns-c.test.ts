import { describe, expect, it } from 'vitest';
import { nouns } from '../nouns.js';
import { PL_NOUNS_C } from '../pl/nouns-c.js';
import { LT_NOUNS_C } from './nouns-c.js';

// P18-E5, part C: the slice's nouns all have a full Lithuanian paradigm (style-lt.md).
const IDS = `
DATIVE GENITIVE GENDER TENSE PRESENT_TENSE PAST_TENSE FUTURE_TENSE ASPECT VOICE POLARITY SENTIMENT MOOD
DEGREE_GRAMMAR POSITIVE_DEGREE STANDARD_OF_COMPARISON COMPARISON_SET MODAL COMMAND ORDER INSTRUCTION REGISTER
FORMALITY OPTION BUTTON KEYBOARD KEY ARROW REGION GROUP MEMBER PARTY_CELEBRATION ROW MENU TAB TARGET HELP
NAVIGATION NAME_NOUN ALIAS TITLE LOADING INTERFACE SERVER RESULT IMPORT_NOUN ICON FILE CLIPBOARD LINE HISTORY
WORKSPACE USAGE EXAMPLE CONSOLE CANVAS PREVIEW TOOLBAR LIST VALUE CURSOR TEXT REFERENCE CAUSE POSSESSOR PROPERTY
FEATURE DOMAIN MEANS PURPOSE USE_NOUN WORK_NOUN RESEARCH STUDY_NOUN MATERIAL WOOD LEVEL PROCESS CHANGE_NOUN SYSTEM
PROGRAM_SOFTWARE PROGRAM_SHOW CONCEPT IDEA ACTION EVENT RACE GAME OBJECT_THING DEVICE BOMB THING PROBLEM ISSUE
CASE_INSTANCE BEING BODY ORGAN TESTICLE OVARY MILK GRASS HEAT EYE HAND HEAD FACE BACK_BODY HEALTH STORY
HISTORY_PAST NEWS SUBSTANCE STATE GAS JOY SORROW ERROR REALITY REST ATTENTION ABILITY DUTY KINDNESS WISDOM FOLLY
LAND NATION SCHOOL STUDENT COMPANY_BUSINESS TEAM COMMUNITY UNIVERSITY SERVICE BUSINESS STATE_NATION POWER
GOVERNMENT PARTY_POLITICAL LAW COURT_LAW RIGHT_NOUN WAR WORLD PICTURE SCREEN PART SEAGULL SWALLOW PARROT
`.trim().split(/\s+/);

const SG = ['base', 'gen_sg', 'dat_sg', 'acc_sg', 'ins_sg', 'loc_sg', 'voc_sg'];
const PL = ['plural', 'gen_pl', 'dat_pl', 'acc_pl', 'ins_pl', 'loc_pl'];
const FEM = [...SG.map((s) => (s === 'base' ? 'fem' : `fem_${s}`)), ...PL.map((p) => `fem_${p}`)];
const byId = new Map(nouns.map((c) => [c.id, c]));
const L = LT_NOUNS_C;

describe('lt nouns, part C', () => {
  it('covers the whole slice, and only nouns', () => {
    expect(IDS).toHaveLength(150);
    expect(Object.keys(L).sort()).toEqual([...IDS].sort());
    expect(Object.keys(PL_NOUNS_C).sort()).toEqual([...IDS].sort());
    for (const id of IDS) expect(byId.get(id)?.role, id).toBe('noun');
  });

  it.each(IDS)('%s has every singular case, a gender and count', (id) => {
    const e = L[id]!;
    for (const k of SG) expect(e[k], `${id}.${k}`).toBeTruthy();
    expect(['masc', 'fem']).toContain(e.gender);
    expect(e.count).toBe('singular');
  });

  // No justified exceptions: every noun Polish counts, Lithuanian counts too. The mass nouns are
  // singular-only in both; GAS (*dujos*) is plural-only in Lithuanian and so has a plural where Polish's
  // *gaz* has none.
  it.each(IDS)('%s has a whole plural wherever Polish has one', (id) => {
    const e = L[id]!;
    if (PL_NOUNS_C[id]!.plural !== undefined) for (const k of PL) expect(e[k], `${id}.${k}`).toBeTruthy();
    else if (e.plurale_tantum !== '1') expect(e.plural, id).toBeUndefined();
  });

  it.each(IDS)('%s has a whole feminine wherever Polish has one', (id) => {
    const e = L[id]!;
    if (PL_NOUNS_C[id]!.fem === undefined) return expect(e.fem, id).toBeUndefined();
    for (const k of FEM) expect(e[k], `${id}.${k}`).toBeTruthy();
    expect(e.gender).toBe('masc');
  });

  it.each(IDS)('%s, if plural-only, reads its plural in every singular key', (id) => {
    const e = L[id]!;
    if (e.plurale_tantum !== '1') return;
    expect(SG.map((k) => e[k])).toEqual([...PL.map((k) => e[k]), e.plural]);
  });

  it('spells the tricky forms', () => {
    // i-stems, softening t → č before -ių and the dative -iai.
    expect([L.CAUSE!.gen_pl, L.CAUSE!.dat_sg, L.OPTION!.gen_pl]).toEqual(['priežasčių', 'priežasčiai', 'parinkčių']);
    expect([L.EYE!.gen_sg, L.EYE!.ins_sg, L.EYE!.loc_sg, L.EYE!.plural]).toEqual(['akies', 'akimi', 'akyje', 'akys']);
    // io-stems, softening t/d → č/dž.
    expect([L.CHANGE_NOUN!.gen_sg, L.CHANGE_NOUN!.acc_sg, L.EXAMPLE!.plural]).toEqual(['pokyčio', 'pokytį', 'pavyzdžiai']);
    // -ė softening in the genitive plural.
    expect([L.TITLE!.gen_pl, L.TESTICLE!.gen_pl, L.SWALLOW!.gen_pl]).toEqual(['antraščių', 'sėklidžių', 'kregždžių']);
    // A j-stem, written out: no i after j.
    expect([L.CASE_INSTANCE!.gen_sg, L.CASE_INSTANCE!.dat_sg, L.CASE_INSTANCE!.plural]).toEqual(['atvejo', 'atvejui', 'atvejai']);
    // School grammar's pronominal adjectives decline with the noun.
    expect([L.PRESENT_TENSE!.gen_sg, L.PRESENT_TENSE!.acc_sg, L.PRESENT_TENSE!.loc_sg])
      .toEqual(['esamojo laiko', 'esamąjį laiką', 'esamajame laike']);
    expect(L.POSITIVE_DEGREE!.ins_pl).toBe('nelyginamaisiais laipsniais');
    expect(L.MODAL!.loc_sg).toBe('modaliniame veiksmažodyje');
    // A genitive complement stays put; only the head declines.
    expect([L.TOOLBAR!.gen_sg, L.TOOLBAR!.ins_pl]).toEqual(['įrankių juostos', 'įrankių juostomis']);
    expect(L.WORKSPACE!.dat_sg).toBe('darbo sričiai');
    // Plural-only nouns.
    expect([L.RACE!.base, L.RACE!.gen_sg, L.RACE!.plurale_tantum, L.RACE!.gender]).toEqual(['lenktynės', 'lenktynių', '1', 'fem']);
    expect([L.GAS!.base, L.GAS!.acc_sg]).toEqual(['dujos', 'dujas']);
    expect([L.RESEARCH!.base, L.RESEARCH!.loc_sg, L.RESEARCH!.gender]).toEqual(['tyrimai', 'tyrimuose', 'masc']);
    // The feminines.
    expect([L.STUDENT!.fem, L.STUDENT!.fem_gen_pl, L.POSSESSOR!.fem_ins_sg]).toEqual(['studentė', 'studenčių', 'savininke']);
    // Indeclinable.
    expect([L.MENU!.gen_sg, L.MENU!.ins_pl]).toEqual(['meniu', 'meniu']);
    // Soft -ia: *valdžia*.
    expect([L.POWER!.gen_sg, L.POWER!.acc_sg]).toEqual(['valdžios', 'valdžią']);
  });
});
