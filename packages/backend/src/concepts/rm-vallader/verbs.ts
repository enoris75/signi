import type { LanguageColumn } from '../types.js';

type Forms = Record<string, string>;
type Six = [string, string, string, string, string, string];

/**
 * One Vallader verb's cells: the infinitive, four six-person paradigms (present, imperfect,
 * conditional, present subjunctive), the participle and the three imperatives (2sg, 1pl, 2pl).
 * Past and future are periphrastic (avair/esser + participle, gnir a + infinitive) and are never
 * stored — no `*_past`, `*_future` or `gerund`. Every cell (verify); the rules and the irregular
 * core are in docs/features/P-planning/P04-romansh/style-rm-vallader.md.
 */
interface Paradigm {
  base: string;
  present: Six;
  imperfect: Six;
  conditional: Six;
  subjunctive: Six;
  participle: string;
  imperative: [string, string, string];
}

const PERSONS = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'] as const;
const TENSES = ['present', 'imperfect', 'conditional', 'subjunctive'] as const;

const on = (stem: string, endings: Six): Six => endings.map((e) => stem + e) as Six;
const IMPERFECT_A: Six = ['aiva', 'aivast', 'aiva', 'aivan', 'aivat', 'aivan'];
const IMPERFECT_I: Six = ['iva', 'ivast', 'iva', 'ivan', 'ivat', 'ivan'];
const CONDITIONAL_E: Six = ['ess', 'essast', 'ess', 'essan', 'essat', 'essan'];
const CONDITIONAL_I: Six = ['iss', 'issast', 'iss', 'issan', 'issat', 'issan'];
const SUBJUNCTIVE: Six = ['a', 'ast', 'a', 'an', 'at', 'an'];

/** The cells of a paradigm, with the verb's syntactic keys (as the Italian entry's) and aux. */
function cells(p: Paradigm, extra: Forms = {}): Forms {
  const f: Forms = { base: p.base };
  for (const tense of TENSES) PERSONS.forEach((person, i) => (f[`${person}_${tense}`] = p[tense][i]));
  f['participle'] = p.participle;
  [f['2sg_imperative'], f['1pl_imperative'], f['2pl_imperative']] = p.imperative;
  return { ...f, ...extra };
}

interface Stems {
  /** The stressed stem (1sg–3sg, 3pl, subjunctive, 2sg imperative); default the unstressed one. */
  s?: string;
  /** The bare 1sg, where the stressed stem needs respelling at the word's end (mangi- → mang). */
  first?: string;
  participle?: string;
}

/** First conjugation, -ar: chantar — chant, chantast, chanta, chantain, chantais, chantan. */
function ar(base: string, o: Stems = {}): Paradigm {
  const u = base.slice(0, -2);
  const s = o.s ?? u;
  return {
    base,
    present: [o.first ?? s, s + 'ast', s + 'a', u + 'ain', u + 'ais', s + 'an'],
    imperfect: on(u, IMPERFECT_A),
    conditional: on(u, CONDITIONAL_E),
    subjunctive: on(s, SUBJUNCTIVE),
    participle: o.participle ?? u + 'à',
    imperative: [s + 'a', u + 'ain', u + 'ai'],
  };
}

/** -ar with the -esch- increment in the stressed forms: telefonar — telefonesch, … telefonain. */
const esch = (base: string, o: Stems = {}): Paradigm => ar(base, { ...o, s: base.slice(0, -2) + 'esch' });

/** Unstressed -er: vender — vend, vendast, venda, vendain, vendais, vendan; participle -ü. */
function er(base: string, o: Stems = {}): Paradigm {
  const u = base.slice(0, -2);
  return { ...ar(base, o), participle: o.participle ?? u + 'ü' };
}

/** -air: plaschair — plasch, plaschast, plascha, plaschain, plaschais, plaschan; participle -ü. */
function air(base: string, o: Stems = {}): Paradigm {
  const u = base.slice(0, -3);
  return { ...ar(u + 'ar', o), base, participle: o.participle ?? u + 'ü' };
}

/** -ir: partir — part, partast, parta, partin, partis, partan; imperfect -iva, participle -i. */
function ir(base: string, o: Stems = {}): Paradigm {
  const u = base.slice(0, -2);
  const s = o.s ?? u;
  return {
    base,
    present: [o.first ?? s, s + 'ast', s + 'a', u + 'in', u + 'is', s + 'an'],
    imperfect: on(u, IMPERFECT_I),
    conditional: on(u, CONDITIONAL_I),
    subjunctive: on(s, SUBJUNCTIVE),
    participle: o.participle ?? u + 'i',
    imperative: [s + 'a', u + 'in', u + 'i'],
  };
}

/** -ir with the -isch- increment: finir — finisch, finischast, finischa, finin, finis, finischan. */
const isch = (base: string, o: Stems = {}): Paradigm => ir(base, { ...o, s: base.slice(0, -2) + 'isch' });

/**
 * A pronominal verb: the reflexive clitic before every finite cell (am, at, as, ans, as, as —
 * elided before a vowel) and after the imperative. Infinitive as the dictionaries cite it: as fermar.
 */
function refl(p: Paradigm): Paradigm {
  const CLITIC: Six = ['am', 'at', 'as', 'ans', 'as', 'as'];
  const lean = (clitic: string, verb: string) => (/^[aeiouàèìòùöü]/i.test(verb) && clitic !== 'ans' ? `${clitic.slice(-1)}'${verb}` : `${clitic} ${verb}`);
  const each = (six: Six): Six => six.map((v, i) => lean(CLITIC[i], v)) as Six;
  return {
    ...p,
    base: lean('as', p.base),
    present: each(p.present),
    imperfect: each(p.imperfect),
    conditional: each(p.conditional),
    subjunctive: each(p.subjunctive),
    imperative: [`${p.imperative[0]}'t`, `${p.imperative[1]}'ans`, `${p.imperative[2]}'as`], // (verify) enclisis
  };
}

/** A verb phrase built on a verb: avair bsögn (to need) is avair's cells + bsögn. */
function phrase(p: Paradigm, tail: string): Paradigm {
  const add = (six: Six): Six => six.map((v) => `${v} ${tail}`) as Six;
  return {
    base: `${p.base} ${tail}`,
    present: add(p.present),
    imperfect: add(p.imperfect),
    conditional: add(p.conditional),
    subjunctive: add(p.subjunctive),
    participle: `${p.participle} ${tail}`,
    imperative: p.imperative.map((v) => `${v} ${tail}`) as [string, string, string],
  };
}

// ── The irregular core (style sheet table) ──────────────────────────────────────────────────

const ESSER: Paradigm = {
  base: 'esser',
  present: ['sun', 'est', 'es', 'eschan', 'eschat', 'sun'],
  imperfect: ["d'eira", "d'eirast", "d'eira", "d'eiran", "d'eirat", "d'eiran"],
  conditional: ['füss', 'füssast', 'füss', 'füssan', 'füssat', 'füssan'],
  subjunctive: ['saja', 'sajast', 'saja', 'sajan', 'sajat', 'sajan'],
  participle: 'stat',
  imperative: ['sajast', 'sajan', 'sajat'], // (verify) the subjunctive serves
};

// eu n'ha: the 1sg carries the euphonic n' (eu n'ha, eu nu n'ha).
const AVAIR: Paradigm = {
  base: 'avair',
  present: ["n'ha", 'hast', 'ha', 'vain', 'vais', 'han'],
  imperfect: on('v', IMPERFECT_A),
  conditional: ['vess', 'vessast', 'vess', 'vessan', 'vessat', 'vessan'],
  subjunctive: on('haj', SUBJUNCTIVE),
  participle: 'gnü', // (verify) avair's participle as gnir's
  imperative: ['hajast', 'hajan', 'hajat'], // (verify)
};

const GNIR: Paradigm = {
  base: 'gnir',
  present: ['vegn', 'vainst', 'vain', 'gnin', 'gnis', 'vegnan'],
  imperfect: on('gn', IMPERFECT_I),
  conditional: on('gn', CONDITIONAL_I),
  subjunctive: on('vegn', SUBJUNCTIVE),
  participle: 'gnü',
  imperative: ['vè', 'gnin', 'gni'], // (verify)
};

// eu vegn is also ir's 1sg in the Engadine (verify).
const IR: Paradigm = {
  base: 'ir',
  present: ['vegn', 'vast', 'va', 'giain', 'giais', 'van'],
  imperfect: on('gi', IMPERFECT_A),
  conditional: on('gi', CONDITIONAL_E),
  subjunctive: on('giaj', SUBJUNCTIVE),
  participle: 'i',
  imperative: ['va', 'giain', 'giai'],
};

const FAR: Paradigm = {
  base: 'far',
  present: ['fetsch', 'fast', 'fa', 'fain', 'fais', 'fan'],
  imperfect: on('f', IMPERFECT_A),
  conditional: on('f', CONDITIONAL_E),
  subjunctive: on('fetsch', SUBJUNCTIVE),
  participle: 'fat',
  imperative: ['fa', 'fain', 'fai'],
};

const DIR: Paradigm = {
  base: 'dir',
  present: ['di', 'dist', 'disch', 'dschain', 'dschais', 'dischan'],
  imperfect: on('dsch', IMPERFECT_A),
  conditional: on('dsch', CONDITIONAL_E),
  subjunctive: on('di', SUBJUNCTIVE), // (verify) ch'eu dia
  participle: 'dit',
  imperative: ['di', 'dschain', 'dschai'],
};

const SAVAIR: Paradigm = {
  base: 'savair',
  present: ['sa', 'sast', 'sa', 'savain', 'savais', 'san'],
  imperfect: on('sav', IMPERFECT_A),
  conditional: on('sav', CONDITIONAL_E),
  subjunctive: on('sapch', SUBJUNCTIVE),
  participle: 'savü',
  imperative: ['sapchast', 'sapchan', 'sapchat'], // (verify)
};

const PUDAIR: Paradigm = {
  base: 'pudair',
  present: ['poss', 'poust', 'po', 'pudain', 'pudais', 'pon'],
  imperfect: on('pud', IMPERFECT_A),
  conditional: on('pud', CONDITIONAL_E),
  subjunctive: on('poss', SUBJUNCTIVE),
  participle: 'pudü',
  imperative: ['possast', 'possan', 'possat'], // (verify) no true imperative
};

const VULAIR: Paradigm = {
  base: 'vulair',
  present: ['vögl', 'voust', 'voul', 'vulain', 'vulais', 'vöglian'],
  imperfect: on('vul', IMPERFECT_A),
  conditional: on('vul', CONDITIONAL_E),
  subjunctive: on('vögli', SUBJUNCTIVE),
  participle: 'vuglü', // (verify)
  imperative: ['vögliast', 'vöglian', 'vögliat'], // (verify) no true imperative
};

const STUVAIR: Paradigm = {
  base: 'stuvair',
  present: ['stögl', 'stoust', 'sto', 'stuvain', 'stuvais', 'ston'],
  imperfect: on('stuv', IMPERFECT_A),
  conditional: on('stuv', CONDITIONAL_E),
  subjunctive: on('stögli', SUBJUNCTIVE),
  participle: 'stuvü',
  imperative: ['stögliast', 'stöglian', 'stögliat'], // (verify) no true imperative
};

// verer (verify the infinitive): vez, vezzast, vezza, vzain, vzais, vezzan; participle vis.
const VERER: Paradigm = {
  base: 'verer',
  present: ['vez', 'vezzast', 'vezza', 'vzain', 'vzais', 'vezzan'],
  imperfect: on('vz', IMPERFECT_A),
  conditional: on('vz', CONDITIONAL_E),
  subjunctive: on('vezz', SUBJUNCTIVE),
  participle: 'vis',
  imperative: ['vezza', 'vzain', 'vzai'],
};

const DAR: Paradigm = {
  base: 'dar',
  present: ['dun', 'dast', 'da', 'dain', 'dais', 'dan'],
  imperfect: on('d', IMPERFECT_A),
  conditional: on('d', CONDITIONAL_E),
  subjunctive: on('dett', SUBJUNCTIVE),
  participle: 'dat',
  imperative: ['da', 'dain', 'dai'],
};

const STAR: Paradigm = {
  base: 'star',
  present: ['stun', 'stast', 'sta', 'stain', 'stais', 'stan'],
  imperfect: on('st', IMPERFECT_A),
  conditional: on('st', CONDITIONAL_E),
  subjunctive: on('stett', SUBJUNCTIVE),
  participle: 'stat',
  imperative: ['sta', 'stain', 'stai'],
};

// tgnair (to hold, keep) and its compounds: tegn, tegnast, tegna, tgnain, tgnais, tegnan (verify).
const tgnair = (prefix = ''): Paradigm => ({
  base: `${prefix}tgnair`,
  present: [`${prefix}tegn`, `${prefix}tegnast`, `${prefix}tegna`, `${prefix}tgnain`, `${prefix}tgnais`, `${prefix}tegnan`],
  imperfect: on(`${prefix}tgn`, IMPERFECT_A),
  conditional: on(`${prefix}tgn`, CONDITIONAL_E),
  subjunctive: on(`${prefix}tegn`, SUBJUNCTIVE),
  participle: `${prefix}tgnü`,
  imperative: [`${prefix}tegna`, `${prefix}tgnain`, `${prefix}tgnai`],
});

// survgnir (to get, receive): gnir's pattern with a prefix.
const SURVGNIR: Paradigm = {
  base: 'survgnir',
  present: ['survegn', 'survainst', 'survain', 'survgnin', 'survgnis', 'survegnan'],
  imperfect: on('survgn', IMPERFECT_I),
  conditional: on('survgn', CONDITIONAL_I),
  subjunctive: on('survegn', SUBJUNCTIVE),
  participle: 'survgnü',
  imperative: ['survegna', 'survgnin', 'survgni'],
};

// tour (to take): tuoch, tuochast, tuocha, tollain, tollais, tuochan; participle tut (verify all).
const TOUR: Paradigm = {
  base: 'tour',
  present: ['tuoch', 'tuochast', 'tuocha', 'tollain', 'tollais', 'tuochan'],
  imperfect: on('toll', IMPERFECT_A),
  conditional: on('toll', CONDITIONAL_E),
  subjunctive: on('tuoch', SUBJUNCTIVE),
  participle: 'tut',
  imperative: ['tuocha', 'tollain', 'tollai'],
};

// trar (to pull): trag, trast, tra, train, trais, tran; participle trat (verify).
const TRAR: Paradigm = {
  base: 'trar',
  present: ['trag', 'trast', 'tra', 'train', 'trais', 'tran'],
  imperfect: on('tr', IMPERFECT_A),
  conditional: on('tr', CONDITIONAL_E),
  subjunctive: on('trag', SUBJUNCTIVE),
  participle: 'trat',
  imperative: ['tra', 'train', 'trai'],
};

// The conditional of a modal as its present, for SHOULD and MIGHT (it: dovrebbe, potrebbe).
const conditionalOnly = (p: Paradigm): Paradigm => ({ ...p, present: p.conditional });

const BE = { aux: 'be' };

export const RM_VALLADER_VERBS: LanguageColumn = {
  // ── The irregular core ──
  BE: cells(ESSER, { copula: '1', ...BE }),
  HAVE: cells(AVAIR),
  COME: cells(GNIR, BE),
  GO: cells(IR, BE),
  MAKE: cells(FAR),
  DO: cells(FAR),
  SAY: cells(DIR, { content_clause_force: 'either' }),
  TELL_ORDER: cells(DIR, { object_case: 'dat', infinitive_link: 'da' }),
  KNOW: cells(SAVAIR, { content_clause_force: 'either', object_sense: 'KNOW_ACQUAINTED' }),
  CAN: cells(PUDAIR, { nonfinite: 'pudair' }),
  WILL: cells(VULAIR, { nonfinite: 'vulair' }),
  MUST: cells(STUVAIR, { nonfinite: 'stuvair' }),
  // dastar: may, be allowed to (de dürfen).
  MAY: cells(ar('dastar'), { nonfinite: 'dastar' }),
  SHOULD: cells(conditionalOnly(STUVAIR), { nonfinite: 'stuvair' }),
  MIGHT: cells(conditionalOnly(PUDAIR), { nonfinite: 'pudair' }),
  SEE: cells(VERER),
  GIVE: cells(DAR),
  // star: to be (well), to fare — co stast?
  BE_FARING: cells(STAR, BE),

  // ── Consuming, perceiving, feeling ──
  CUT: cells(ar('tagliar', { first: 'tagl' })),
  EAT: cells(ar('mangiar', { first: 'mang' })), // (verify) 1sg mang
  EAT_ANIMAL: cells(ar('mangiar', { first: 'mang' })),
  DRINK: cells(er('baiver', { s: 'baiv' })),
  POUR: cells(ar('versar')), // (verify)
  CONSUME: cells(ar('consumar')),
  LOVE: cells(ar('amar')),
  DESIRE: cells(ar('giavüschar')),
  KILL: cells(ar('mazzar', { first: 'mazz' })),
  KNOW_ACQUAINTED: cells(er('cugnuoscher', { s: 'cugnuosch', participle: 'cugnuschü' })), // unstressed stem cugnusch-? (verify)
  // as algordar da: to remember (a pronominal verb with da).
  REMEMBER: cells(refl(ar('algordar')), { object_prep: 'da' }),
  CONSIDER: cells(ar('considerar')),
  EXPECT: cells(ar('spettar')),
  READ: cells(er('leger', { s: 'legi', first: 'leg', participle: 'let' })), // (verify) stems
  CRY_OUT: cells(ir('sbragir', { s: 'sbragi', first: 'sbrai' })), // (verify)
  BITE: cells(er('morder', { participle: 'mors' })),
  BEAT: cells(er('batter')),
  SET_ON_FIRE: cells(ar('brüschar')),
  EXTINGUISH: cells(er('stüder')), // (verify) participle
  FEEL: cells(ir('sentir', { s: 'saint' })), // (verify) stressed saint-
  HEAR: cells(ir('dudir', { s: 'od' })),
  PERCEIVE: cells(isch('percepir')),
  UNDERSTAND: cells(er('incleger', { s: 'inclegi', first: 'incleg', participle: 'inclet' })), // (verify)
  BREATHE: cells(ar('respirar')),
  LIKE: cells(air('plaschair'), { experiencer: '1' }),
  THINK: cells(ar('impissar'), { content_clause_mood: 'subjunctive', topic_prep: 'a' }),
  BELIEVE: cells(er('crajer', { first: 'crai', participle: 'crettü' }), { object_prep: 'a', content_clause_mood: 'subjunctive' }), // (verify)
  SUFFER: cells(ir('patir')),
  CRY: cells(ir('bragir', { s: 'bragi', first: 'brai' })), // (verify)

  // ── Having, holding, taking ──
  BUY: cells(ar('cumprar')),
  OWN: cells(air('possedair')), // (verify)
  HOLD: cells(tgnair('cun')),
  HOLD_GRASP: cells(tgnair()),
  KEEP: cells(tgnair()),
  INCLUDE: cells(er('includer', { participle: 'inclus' })),
  CONFINE: cells(ar('inserrar')),
  TAME: cells(ar('dumasgiar', { first: 'dumasch' })), // (verify)
  // avair bsögn da: to need.
  NEED: cells(phrase(AVAIR, 'bsögn'), { object_prep: 'da', infinitive_link: 'da' }),
  ACQUIRE: cells(ar('acquistar')),
  TAKE: cells(TOUR),
  GET: cells(SURVGNIR),
  PUT: cells(er('metter', { participle: 'miss' })),
  LOSE: cells(er('perder', { participle: 'pers' })),
  LOSE_GAME: cells(er('perder', { participle: 'pers' })),
  WIN: cells(ar('guadagnar')),
  BRING: cells(ar('portar')),
  LEAD: cells(ar('manar')),
  LEAVE_BEHIND: cells(ar('laschar')),
  LOOK_AT: cells(ar('guardar')),
  LET: cells(ar('laschar')),
  EXCHANGE: cells(ar('barattar')),

  // ── Making, changing ──
  CONTINUE: cells(esch('cuntinuar')),
  CONTINUE_DOING: cells(esch('cuntinuar'), { infinitive_link: 'a' }),
  PLAY_INSTRUMENT: cells(ar('sunar')),
  TRY: cells(ar('provar', { s: 'prouv' }), { infinitive_link: 'da' }),
  RETRY: cells(ar('reprovar', { s: 'reprouv' })),
  CREATE: cells(esch('crear')),
  DESTROY: cells(isch('destruir', { participle: 'destrut' })), // (verify)
  CHANGE: cells(ar('müdar')),
  CHANGE_ONESELF: cells(refl(ar('müdar')), BE),
  STOP: cells(ar('fermar')),
  STOP_ONESELF: cells(refl(ar('fermar')), BE),
  // chalar da: to stop doing.
  STOP_DOING: cells(ar('chalar'), { infinitive_link: 'da' }),
  TRANSFORM: cells(ar('transfuormar'), { object_predicative_link: 'in' }),
  SHED: cells(er('spander')), // (verify)
  PRODUCE: cells(er('prodüer', { s: 'prodü', participle: 'prodot' })), // (verify)
  TRANSLATE: cells(er('tradüer', { s: 'tradü', participle: 'tradüt' })), // (verify)
  CAUSE_VERB: cells(ar('chaschunar'), { causative: '1', infinitive_link: 'a' }), // (verify) link
  PRESS: cells(ar('squitschar')),
  WRITE: cells(er('scriver', { participle: 'scrit' })),
  DESCRIBE: cells(er('descriver', { participle: 'descrit' })),
  CLICK: cells(ar('cliccar', { first: 'clic' }), { object_prep: 'sün' }),
  DEPEND: cells(er('depender'), { object_prep: 'da' }), // avair, not esser (it: è dipeso) (verify)
  CHOOSE: cells(er('tscherner')),
  FILTER: cells(ar('filtrar')),
  SELECT: cells(ar('selecziunar')),
  TYPE: cells(ar('tippar')),
  // arcunar: to store, save (a file).
  SAVE: cells(ar('arcunar')),
  LOAD: cells(ar('chargiar', { first: 'charg' })),
  ADD: cells(er('agiundscher', { participle: 'agiunt' }), { terminus_tonic: '1' }),
  LINK: cells(esch('colliar'), { terminus_tonic: '1' }),
  CONNECT: cells(ar('connectar'), { terminus_tonic: '1' }),
  EXPORT: cells(ar('exportar')),
  IMPORT: cells(ar('importar')),
  BROADCAST: cells(er('emetter', { participle: 'emiss' })),
  // svödar: to empty.
  CLEAR: cells(ar('svödar')),
  REMOVE: cells(ar('allontanar')),
  // stüzzar: to erase, delete.
  DELETE: cells(ar('stüzzar')),
  COORDINATE: cells(ar('coordinar')),
  // rumir: to tidy up.
  TIDY_UP: cells(isch('rumir')), // (verify)
  ARRANGE: cells(ar('ordinar')),
  COMPACT: cells(ar('compactar')),
  // sgrondir / impitschnir: to make bigger / smaller.
  EXPAND: cells(isch('sgrondir')),
  SHRINK: cells(isch('impitschnir')),
  HIDE: cells(ar('zoppar')),
  START: cells(ar('cumanzar', { s: 'cumainz' })), // (verify) stressed cumainz-
  BEGIN: cells(ar('cumanzar', { s: 'cumainz' }), { infinitive_link: 'a' }), // avair (it: è iniziato) (verify)
  CANCEL: cells(ar('annullar')),
  UNDO: cells(ar('annullar')),
  REDO: cells(er('repeter')),
  RESTORE: cells(ar('restaurar')),
  OPEN: cells(ir('avrir', { first: 'avr', participle: 'avert' })), // (verify)
  CLOSE: cells(ar('serrar')),
  ENCLOSE: cells(ar('circundar')),
  // dovrar: to use.
  USE: cells(ar('dovrar')),
  SPEND_MONEY: cells(er('spender')), // (verify) participle
  SPEND_TIME: cells(ar('passantar')),
  COPY: cells(ar('copchar')),
  MOVE: cells(ar('spostar')), // (verify)
  RESIZE: cells(ar('redimensiunar')),
  DRAG: cells(TRAR),
  TURN_OFF: cells(ar('deactivar')),
  SET: cells(isch('definir')),
  PIN: cells(ar('fixar')),
  UNPIN: cells(ar('distachar')),
  COMPLETE: cells(ar('cumplettar', { first: 'cumplet' })),
  APPLY: cells(ar('applichar')),
  NAME: cells(ar('nomnar')),
  MODIFY: cells(ar('modifichar')),
  EDIT: cells(ar('elavurar')),
  SPECIFY: cells(ar('specifichar')),
  GOVERN: cells(er('reger', { s: 'regi', first: 'reg', participle: 'ret' })), // (verify)
  GOVERN_STATE: cells(ar('guvernar')),
  ACCEPT: cells(ar('acceptar')),
  NEGATE: cells(ar('negar')),
  ASSERT: cells(ar('affirmar')),
  EXPRESS: cells(er('exprimer')), // (verify) participle
  INDICATE: cells(ar('indichar')),
  DIRECT_VERB: cells(ar('drizzar')),
  DIVIDE: cells(er('divider', { participle: 'divis' })),
  STRIKE: cells(er('batter')), // (verify) a word apart from BEAT
  REPLACE: cells(ar('rimplazzar')),

  // ── Speaking, meeting ──
  CALL: cells(ar('clamar')),
  CALL_PHONE: cells(esch('telefonar'), { object_prep: 'a' }),
  MEAN: cells(ar('significhar')),
  SPEAK: cells(er('discuorrer', { participle: 'discurrü' })), // (verify) unstressed discurr-
  TELL: cells(ar('raquintar'), { content_clause_force: 'either', infinitive_sense: 'TELL_ORDER' }),
  ASK: cells(ar('dumandar'), { content_clause_force: 'interrogative' }),
  ANSWER: cells(er('respuonder', { participle: 'respost' })), // (verify)
  SEARCH: cells(ar('tscherchar')),
  FIND: cells(ar('chattar')),
  MEET: cells(ar('inscuntrar')),
  ALLOW: cells(er('permetter', { participle: 'permiss' }), { object_case: 'dat', infinitive_link: 'da' }),
  HELP_VERB: cells(ar('güdar'), { infinitive_link: 'a' }),
  THANK: cells(ar('ingrazchar')),
  MARRY: cells(ar('maridar')),
  ACCOMPANY: cells(ar('accumpagnar')),
  LEARN: cells(er('imprender', { participle: 'imprais' })), // (verify)
  PRECEDE: cells(er('preceder')),
  FOLLOW: cells(ar('suondar')),
  ACT: cells(isch('agir')),
  WORK: cells(ar('funcziunar')),
  WORK_LABOUR: cells(ar('lavurar')),
  PLAY_GAME: cells(ar('giovar', { s: 'giouv' })),
  TRADE: cells(ar('commerziar')), // (verify)
  WAIT: cells(ar('spettar')),
  LIVE: cells(ar('abitar')),
  LIVE_ALIVE: cells(er('viver')),
  SELL: cells(er('vender')),
  PAY: cells(ar('pajar')),
  PROVIDE: cells(isch('furnir')),
  TRANSFER: cells(isch('transferir')),
  SHOW: cells(ar('muossar')),
  // trametter: to send.
  SEND: cells(er('trametter', { participle: 'tramiss' })),

  // ── Motion and change of state (esser) ──
  RUN: cells(er('cuorrer', { participle: 'curri' })), // (verify) unstressed curr-
  JUMP: cells(ir('siglir')),
  BURN: cells(ar('brüschar')),
  COLLAPSE: cells(ar('crodar'), BE),
  DIE: cells(ir('murir', { s: 'mour', participle: 'mort' }), BE),
  STAY: cells(ar('restar'), BE),
  LEAVE: cells(ir('sortir'), { object_prep: 'da', ...BE }),
  GO_OUT: cells(ir('sortir'), BE),
  HAPPEN: cells(ar('capitar'), BE),
  GROW: cells(er('crescher'), BE),
  FLOW: cells(er('cuorrer', { participle: 'curri' }), BE), // (verify)
  RETURN: cells(ar('tuornar'), BE),
  TURN: cells(ar('girar')),
  LEAVE_DEPART: cells(ir('partir'), BE),
  RUN_AWAY: cells(ir('fügir', { s: 'fügi', first: 'füg' }), BE), // (verify)
  WALK: cells(ar('chaminar')),
  MOVE_ONESELF: cells(refl(er('mouver', { participle: 'mouvü' })), { direction_prep: 'vers', ...BE }), // (verify)
  SIT_DOWN: cells(refl(ar('tschantar')), BE), // (verify)
  STAND_UP: cells(refl(ar('levar')), BE),
  BECOME: cells(ar('dvantar'), BE),
  SEEM: cells(air('parair'), { seeming: '1', ...BE }),
  APPEAR: cells(air('cumparair'), BE), // (verify)
  FLY: cells(ar('svolar', { s: 'svoul' }), { direction_prep: 'vers' }),
};
