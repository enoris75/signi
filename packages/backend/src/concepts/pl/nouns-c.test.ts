import { describe, expect, it } from 'vitest';
import { nouns } from '../nouns.js';
import { PL_NOUNS_C } from './nouns-c.js';

// P05-E4, part C: the slice's nouns all have a full Polish paradigm (style-pl.md).
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
GOVERNMENT PARTY_POLITICAL LAW COURT_LAW RIGHT_NOUN WAR WORLD PICTURE SCREEN PART
`.trim().split(/\s+/);

const SG = ['base', 'gen_sg', 'dat_sg', 'acc_sg', 'ins_sg', 'loc_sg', 'voc_sg'];
const PL = ['plural', 'gen_pl', 'dat_pl', 'acc_pl', 'ins_pl', 'loc_pl'];
const byId = new Map(nouns.map((c) => [c.id, c]));

describe('pl nouns, part C', () => {
  it('covers the whole slice, and only nouns', () => {
    expect(IDS).toHaveLength(147);
    expect(Object.keys(PL_NOUNS_C).sort()).toEqual([...IDS].sort());
    for (const id of IDS) expect(byId.get(id)?.role, id).toBe('noun');
  });

  it.each(IDS)('%s has every singular case, a gender and count', (id) => {
    const e = PL_NOUNS_C[id]!;
    for (const k of SG) expect(e[k], `${id}.${k}`).toBeTruthy();
    expect(['masc', 'fem', 'neut']).toContain(e.gender);
    expect(e.count).toBe('singular');
  });

  it.each(IDS)('%s has a plural paradigm wherever German or Spanish has a plural', (id) => {
    const c = byId.get(id)!;
    const e = PL_NOUNS_C[id]!;
    if (c.forms.de?.plural !== undefined || c.forms.es?.plural !== undefined) {
      for (const k of PL) expect(e[k], `${id}.${k}`).toBeTruthy();
    }
  });

  it.each(IDS)('%s has a feminine paradigm wherever Spanish has a feminine', (id) => {
    const e = PL_NOUNS_C[id]!;
    if (byId.get(id)!.forms.es?.fem === undefined) return;
    for (const k of [...SG.map((s) => (s === 'base' ? 'fem' : `fem_${s}`)), ...PL.map((p) => `fem_${p}`)]) {
      expect(e[k], `${id}.${k}`).toBeTruthy();
    }
  });

  it.each(IDS)('%s is animate_acc exactly when it is masculine with accusative = genitive', (id) => {
    const e = PL_NOUNS_C[id]!;
    // A plurale tantum (*wiadomości*) can have accusative = genitive without being animate.
    if (e.plurale_tantum === '1') return expect(e.animate_acc).toBeUndefined();
    expect(e.animate_acc === '1', id).toBe(e.gender === 'masc' && e.acc_sg === e.gen_sg);
  });

  it('spells the tricky forms', () => {
    const P = PL_NOUNS_C;
    expect([P.HAND!.dat_sg, P.HAND!.plural, P.HAND!.gen_pl]).toEqual(['ręce', 'ręce', 'rąk']);
    expect([P.EYE!.plural, P.EYE!.gen_pl]).toEqual(['oczy', 'oczu']);
    expect([P.ROW!.gen_sg, P.GOVERNMENT!.gen_sg]).toEqual(['rzędu', 'rządu']);
    expect([P.ERROR!.gen_sg, P.ERROR!.loc_sg]).toEqual(['błędu', 'błędzie']);
    expect([P.GAME!.dat_sg, P.GAME!.gen_pl]).toEqual(['grze', 'gier']);
    expect([P.WAR!.gen_pl, P.CANVAS!.gen_pl]).toEqual(['wojen', 'płócien']);
    expect([P.WORLD!.gen_sg, P.WORLD!.dat_sg, P.WORLD!.loc_sg]).toEqual(['świata', 'światu', 'świecie']);
    expect([P.STUDENT!.plural, P.STUDENT!.acc_pl, P.STUDENT!.fem_gen_pl]).toEqual(['studenci', 'studentów', 'studentek']);
    expect([P.POSSESSOR!.plural, P.POSSESSOR!.acc_pl, P.POSSESSOR!.virile]).toEqual(['posiadacze', 'posiadaczy', '1']);
    expect([P.FEATURE!.dat_sg, P.ATTENTION!.loc_sg]).toEqual(['cesze', 'uwadze']);
    expect(P.PRESENT_TENSE!.ins_sg).toBe('czasem teraźniejszym');
    expect(P.TOOLBAR!.gen_sg).toBe('paska narzędzi');
    expect([P.BACK_BODY!.base, P.BACK_BODY!.gen_sg, P.BACK_BODY!.plurale_tantum]).toEqual(['plecy', 'pleców', '1']);
    expect(P.MENU!.ins_pl).toBe('menu');
  });
});
