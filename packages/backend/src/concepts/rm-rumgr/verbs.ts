import type { LanguageColumn } from '../types.js';

/**
 * Rumantsch Grischun verbs (P04-E4). Every form is *(verify)* until P04-E19; `// (verify)` marks the
 * choices the author is specifically unsure of. The irregular core (esser … vesair, plus avair, star,
 * dar, tegnair) and the class models were spot-checked against the Pledari Grond conjugations —
 * see `docs/features/O-open/P04-romansh/conjugation-rm-rumgr.md`.
 *
 * Stored: base, present, imperfect, conditional, present subjunctive (*conjunctiv*), participle,
 * `aux: 'be'` where RG selects *esser*, and the 2sg / 1pl / 2pl imperatives. Never a simple past,
 * a future or a gerund: the past is *avair/esser* + participle (P04 D5), the future *vegnir a* +
 * infinitive (D7), and there is no gerund (§2.2).
 *
 * Participle agreement is RG-regular: *-à → -ada, -ads, -adas*; *-ì → -ida, -ids, -idas*; a
 * consonant-final participle takes *+a, +s, +as*. `participle_fem` / `participle_plural` /
 * `participle_fem_plural` appear only where a participle breaks that rule.
 *
 * Reflexive verbs carry their clitic in the base and the finite cells (*sa fermar*, *jau ma ferm*),
 * as Italian's `fermarsi` / `mi fermo` do; the participle is bare.
 */

type Entry = Record<string, string>;

const PERSONS = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'] as const;

function cells(tense: string, forms: readonly string[]): Entry {
  return Object.fromEntries(PERSONS.map((p, i) => [`${p}_${tense}`, forms[i]!]));
}

/** The present 1sg: a final doubled consonant is written single (*charezzar → jau charez*). */
function bare(stem: string): string {
  return /(.)\1$/.test(stem) ? stem.slice(0, -1) : stem;
}

/** The subjunctive stem: *-i-* is added unless the stem already ends in it (*cumpria*, *mangia*). */
function subj(stem: string): Entry {
  const s = stem.endsWith('i') ? stem : `${stem}i`;
  return cells('subjunctive', [`${s}a`, `${s}as`, `${s}a`, `${s}an`, `${s}as`, `${s}an`]);
}

interface Opts {
  /** The unstressed stem (1pl, 2pl, imperfect, conditional, participle), when it differs: *purtar → purt-*. */
  u?: string;
  /** The present 1sg, when not the bare stressed stem: *mangel*, *legel*. */
  first?: string;
  participle?: string;
  extra?: Entry;
}

/**
 * Class 1, *-ar* (*mangiar*, *purtar*): stressed stem `s` (*port-*), unstressed `u` (*purt-*).
 */
function ar(base: string, s: string, o: Opts = {}): Entry {
  const u = o.u ?? s;
  return {
    base,
    ...cells('present', [o.first ?? bare(s), `${s}as`, `${s}a`, `${u}ain`, `${u}ais`, `${s}an`]),
    ...cells('imperfect', [`${u}ava`, `${u}avas`, `${u}ava`, `${u}avan`, `${u}avas`, `${u}avan`]),
    ...cells('conditional', [`${u}ass`, `${u}assas`, `${u}ass`, `${u}assan`, `${u}assas`, `${u}assan`]),
    ...subj(s),
    participle: o.participle ?? `${u}à`,
    '2sg_imperative': `${s}a`, '1pl_imperative': `${u}ain`, '2pl_imperative': `${u}ai`,
    ...o.extra,
  };
}

/** Classes 2 and 3, *-air* / stressed *-er* (*vender*, *parair*): 1pl *-ain*, imperfect *-eva*, conditional *-ess*. */
function er(base: string, s: string, o: Opts = {}): Entry {
  const u = o.u ?? s;
  return {
    base,
    ...cells('present', [o.first ?? bare(s), `${s}as`, `${s}a`, `${u}ain`, `${u}ais`, `${s}an`]),
    ...cells('imperfect', [`${u}eva`, `${u}evas`, `${u}eva`, `${u}evan`, `${u}evas`, `${u}evan`]),
    ...cells('conditional', [`${u}ess`, `${u}essas`, `${u}ess`, `${u}essan`, `${u}essas`, `${u}essan`]),
    ...subj(s),
    participle: o.participle ?? `${u}ì`,
    '2sg_imperative': `${s}a`, '1pl_imperative': `${u}ain`, '2pl_imperative': `${u}ai`,
    ...o.extra,
  };
}

/** Class 4, *-ir* and *-er* like *currer* (*durmir*): 1pl *-in*, imperfect *-iva*, conditional *-iss*. */
function ir(base: string, s: string, o: Opts = {}): Entry {
  const u = o.u ?? s;
  return {
    base,
    ...cells('present', [o.first ?? bare(s), `${s}as`, `${s}a`, `${u}in`, `${u}is`, `${s}an`]),
    ...cells('imperfect', [`${u}iva`, `${u}ivas`, `${u}iva`, `${u}ivan`, `${u}ivas`, `${u}ivan`]),
    ...cells('conditional', [`${u}iss`, `${u}issas`, `${u}iss`, `${u}issan`, `${u}issas`, `${u}issan`]),
    ...subj(s),
    participle: o.participle ?? `${u}ì`,
    '2sg_imperative': `${s}a`, '1pl_imperative': `${u}in`, '2pl_imperative': `${u}i`,
    ...o.extra,
  };
}

/** The *-esch* extension (*finir → jau finesch*, *inditgar → jau inditgesch*), on an *-ar* or an *-ir* verb. */
function esch(base: string, u: string, extra: Entry = {}): Entry {
  const a = base.endsWith('ar');
  const e = `${u}esch`;
  return {
    base,
    ...cells('present', [e, `${e}as`, `${e}a`, a ? `${u}ain` : `${u}in`, a ? `${u}ais` : `${u}is`, `${e}an`]),
    ...cells('imperfect', (a ? ['ava', 'avas', 'ava', 'avan', 'avas', 'avan'] : ['iva', 'ivas', 'iva', 'ivan', 'ivas', 'ivan']).map((x) => u + x)),
    ...cells('conditional', (a ? ['ass', 'assas', 'ass', 'assan', 'assas', 'assan'] : ['iss', 'issas', 'iss', 'issan', 'issas', 'issan']).map((x) => u + x)),
    ...subj(`${e}i`),
    participle: a ? `${u}à` : `${u}ì`,
    '2sg_imperative': `${e}a`, '1pl_imperative': a ? `${u}ain` : `${u}in`, '2pl_imperative': a ? `${u}ai` : `${u}i`,
    ...extra,
  };
}

const CLITIC: Record<string, string> = { '1sg': 'ma', '2sg': 'ta', '3sg': 'sa', '1pl': 'ans', '2pl': 'as', '3pl': 'sa' };
const ENCLITIC: Record<string, string> = { '2sg_imperative': 'ta', '1pl_imperative': 'ans', '2pl_imperative': 'as' };

/** A reflexive verb: *sa* on the base, the person's clitic before each finite cell, *esser* in the past. */
function reflexive(v: Entry): Entry {
  const out: Entry = { ...v, base: `sa ${v['base']}`, aux: 'be' };
  for (const [k, f] of Object.entries(v)) {
    const person = /^(\d(?:sg|pl))_(present|imperfect|conditional|subjunctive)$/.exec(k)?.[1];
    if (person) out[k] = `${CLITIC[person]} ${f}`;
    // Enclitic on the imperative, hyphenated: *ferma-ta!* (verify the spelling).
    if (ENCLITIC[k]) out[k] = `${f}-${ENCLITIC[k]}`;
  }
  return out;
}

/** A fixed word after every form (*avair basegn*, *ir or*): the participle's agreeing forms spelled out. */
function tail(v: Entry, word: string, extra: Entry = {}): Entry {
  const out: Entry = {};
  for (const [k, f] of Object.entries(v)) out[k] = k === 'aux' ? f : `${f} ${word}`;
  return { ...out, ...extra };
}

// ── The irregular core (P04 §1, E3 D3), spot-checked against the Pledari Grond. ──

const ESSER: Entry = {
  base: 'esser',
  ...cells('present', ['sun', 'es', 'è', 'essan', 'essas', 'èn']),
  ...cells('imperfect', ['era', 'eras', 'era', 'eran', 'eras', 'eran']),
  ...cells('conditional', ['fiss', 'fissas', 'fiss', 'fissan', 'fissas', 'fissan']),
  ...cells('subjunctive', ['saja', 'sajas', 'saja', 'sajan', 'sajas', 'sajan']),
  participle: 'stà', aux: 'be',
  '2sg_imperative': 'sajas', '1pl_imperative': 'sajan', '2pl_imperative': 'sajas', // 1pl (verify)
};

const AVAIR: Entry = {
  base: 'avair',
  ...cells('present', ['hai', 'has', 'ha', 'avain', 'avais', 'han']),
  ...cells('imperfect', ['aveva', 'avevas', 'aveva', 'avevan', 'avevas', 'avevan']),
  ...cells('conditional', ['avess', 'avessas', 'avess', 'avessan', 'avessas', 'avessan']),
  ...cells('subjunctive', ['haja', 'hajas', 'haja', 'hajan', 'hajas', 'hajan']),
  participle: 'gì', // no agreeing forms: avair takes avair, which never agrees
  '2sg_imperative': 'hajas', '1pl_imperative': 'hajan', '2pl_imperative': 'hajas', // 1pl (verify)
};

const VEGNIR: Entry = {
  base: 'vegnir',
  ...cells('present', ['vegn', 'vegns', 'vegn', 'vegnin', 'vegnis', 'vegnan']),
  ...cells('imperfect', ['vegniva', 'vegnivas', 'vegniva', 'vegnivan', 'vegnivas', 'vegnivan']),
  ...cells('conditional', ['vegniss', 'vegnissas', 'vegniss', 'vegnissan', 'vegnissas', 'vegnissan']),
  ...cells('subjunctive', ['vegnia', 'vegnias', 'vegnia', 'vegnian', 'vegnias', 'vegnian']),
  participle: 'vegnì', aux: 'be',
  '2sg_imperative': 've', '1pl_imperative': 'vegnin', '2pl_imperative': 'vegni',
};

const IR: Entry = {
  base: 'ir',
  ...cells('present', ['vom', 'vas', 'va', 'giain', 'giais', 'van']),
  ...cells('imperfect', ['gieva', 'gievas', 'gieva', 'gievan', 'gievas', 'gievan']),
  ...cells('conditional', ['giess', 'giessas', 'giess', 'giessan', 'giessas', 'giessan']),
  ...cells('subjunctive', ['giaja', 'giajas', 'giaja', 'giajan', 'giajas', 'giajan']),
  participle: 'ì', aux: 'be',
  '2sg_imperative': 'va', '1pl_imperative': 'giain', '2pl_imperative': 'giai',
};

const FAR: Entry = {
  base: 'far',
  ...cells('present', ['fatsch', 'fas', 'fa', 'faschain', 'faschais', 'fan']),
  ...cells('imperfect', ['fascheva', 'faschevas', 'fascheva', 'faschevan', 'faschevas', 'faschevan']),
  ...cells('conditional', ['faschess', 'faschessas', 'faschess', 'faschessan', 'faschessas', 'faschessan']),
  ...cells('subjunctive', ['fetschia', 'fetschias', 'fetschia', 'fetschian', 'fetschias', 'fetschian']),
  participle: 'fatg',
  '2sg_imperative': 'fa', '1pl_imperative': 'faschain', '2pl_imperative': 'faschai',
};

const DIR: Entry = {
  base: 'dir',
  ...cells('present', ['di', 'dis', 'di', 'schain', 'schais', 'din']),
  ...cells('imperfect', ['scheva', 'schevas', 'scheva', 'schevan', 'schevas', 'schevan']),
  ...cells('conditional', ['schess', 'schessas', 'schess', 'schessan', 'schessas', 'schessan']),
  ...cells('subjunctive', ['dia', 'dias', 'dia', 'dian', 'dias', 'dian']),
  participle: 'ditg',
  '2sg_imperative': 'di', '1pl_imperative': 'schain', '2pl_imperative': 'schai',
};

const SAVAIR: Entry = {
  base: 'savair',
  ...cells('present', ['sai', 'sas', 'sa', 'savain', 'savais', 'san']),
  ...cells('imperfect', ['saveva', 'savevas', 'saveva', 'savevan', 'savevas', 'savevan']),
  ...cells('conditional', ['savess', 'savessas', 'savess', 'savessan', 'savessas', 'savessan']),
  ...cells('subjunctive', ['sappia', 'sappias', 'sappia', 'sappian', 'sappias', 'sappian']),
  participle: 'savì',
  '2sg_imperative': 'sappias', '1pl_imperative': 'sappian', '2pl_imperative': 'sappias', // 1pl (verify)
};

const PUDAIR: Entry = {
  base: 'pudair', nonfinite: 'pudair',
  ...cells('present', ['poss', 'pos', 'po', 'pudain', 'pudais', 'pon']),
  ...cells('imperfect', ['pudeva', 'pudevas', 'pudeva', 'pudevan', 'pudevas', 'pudevan']),
  ...cells('conditional', ['pudess', 'pudessas', 'pudess', 'pudessan', 'pudessas', 'pudessan']),
  ...cells('subjunctive', ['possia', 'possias', 'possia', 'possian', 'possias', 'possian']),
  participle: 'pudì',
  // The Pledari Grond gives no imperative; the subjunctive stands in (verify).
  '2sg_imperative': 'possias', '1pl_imperative': 'possian', '2pl_imperative': 'possias',
};

const VULAIR: Entry = {
  base: 'vulair', nonfinite: 'vulair',
  ...cells('present', ['vi', 'vuls', 'vul', 'vulain', 'vulais', 'vulan']),
  ...cells('imperfect', ['vuleva', 'vulevas', 'vuleva', 'vulevan', 'vulevas', 'vulevan']),
  ...cells('conditional', ['vuless', 'vulessas', 'vuless', 'vulessan', 'vulessas', 'vulessan']),
  ...cells('subjunctive', ['veglia', 'veglias', 'veglia', 'veglian', 'veglias', 'veglian']),
  participle: 'vulì',
  '2sg_imperative': 'veglias', '1pl_imperative': 'veglian', '2pl_imperative': 'veglias', // 1pl (verify)
};

const STUAIR: Entry = {
  base: 'stuair', nonfinite: 'stuair',
  ...cells('present', ['stoss', 'stos', 'sto', 'stuain', 'stuais', 'ston']),
  ...cells('imperfect', ['stueva', 'stuevas', 'stueva', 'stuevan', 'stuevas', 'stuevan']),
  ...cells('conditional', ['stuess', 'stuessas', 'stuess', 'stuessan', 'stuessas', 'stuessan']),
  ...cells('subjunctive', ['stoppia', 'stoppias', 'stoppia', 'stoppian', 'stoppias', 'stoppian']),
  participle: 'stuì',
  // The Pledari Grond gives no imperative; the subjunctive stands in (verify).
  '2sg_imperative': 'stoppias', '1pl_imperative': 'stoppian', '2pl_imperative': 'stoppias',
};

// PG also gives the short participle *vis*, and no imperative: *vesa!*, *vesai!* are regular (verify).
const VESAIR: Entry = er('vesair', 'ves');

const STAR: Entry = {
  base: 'star',
  ...cells('present', ['stun', 'stas', 'stat', 'stain', 'stais', 'stattan']), // 3pl: PG gives stan and stattan (verify)
  ...cells('imperfect', ['steva', 'stevas', 'steva', 'stevan', 'stevas', 'stevan']),
  ...cells('conditional', ['stess', 'stessas', 'stess', 'stessan', 'stessas', 'stessan']),
  ...cells('subjunctive', ['stettia', 'stettias', 'stettia', 'stettian', 'stettias', 'stettian']),
  participle: 'stà', aux: 'be',
  '2sg_imperative': 'sta', '1pl_imperative': 'stain', '2pl_imperative': 'stai', // (verify)
};

const DAR: Entry = {
  base: 'dar',
  ...cells('present', ['dun', 'das', 'dat', 'dain', 'dais', 'dattan']),
  ...cells('imperfect', ['deva', 'devas', 'deva', 'devan', 'devas', 'devan']),
  ...cells('conditional', ['dess', 'dessas', 'dess', 'dessan', 'dessas', 'dessan']),
  ...cells('subjunctive', ['dettia', 'dettias', 'dettia', 'dettian', 'dettias', 'dettian']),
  participle: 'dà',
  '2sg_imperative': 'dà', '1pl_imperative': 'dain', '2pl_imperative': 'dai', // 2sg (verify)
};

/** A modal whose present cells hold its conditional, as Italian's SHOULD (*dovrei*) and MIGHT (*potrei*). */
function conditionalAsPresent(v: Entry): Entry {
  return { ...v, ...cells('present', PERSONS.map((p) => v[`${p}_conditional`]!)) };
}

// tegnair: PG *jau tegn, ti tegnas* — a class-2 verb with a bare 1sg.
const TEGNAIR: Entry = er('tegnair', 'tegn');
const VEGNIR_LIKE = (prefix: string): Entry =>
  Object.fromEntries(Object.entries(VEGNIR).filter(([k]) => k !== 'aux').map(([k, f]) => [k, `${prefix}${f}`]));

// metter and its compounds: participle *mess*, whose plural is *mess* (a final -s takes no -s).
const METTER = (prefix = ''): Entry =>
  er(`${prefix}metter`, `${prefix}mett`, { first: `${prefix}met`, participle: `${prefix}mess`, extra: { participle_plural: `${prefix}mess` } });

export const RM_RUMGR_VERBS: LanguageColumn = {
  // ── Consumption ──
  CUT: ar('tagliar', 'tagli', { first: 'tagl' }),
  EAT: ar('mangiar', 'mangi', { first: 'mangel' }),
  EAT_ANIMAL: ar('mangiar', 'mangi', { first: 'mangel' }),
  DRINK: er('baiver', 'baiv', { u: 'bav' }),
  POUR: ar('cular', 'cul'), // PG: cular = giessen
  CONSUME: ar('consumar', 'consum'),

  // ── Perception, cognition, feeling ──
  SEE: VESAIR,
  LOVE: ar('charezzar', 'charezz'), // (verify) charezzar vs amar for "love"
  DESIRE: ar('giavischar', 'giavisch'),
  KILL: ar('mazzar', 'mazz'),
  KNOW: { ...SAVAIR, content_clause_force: 'either', object_sense: 'KNOW_ACQUAINTED' },
  KNOW_ACQUAINTED: er('enconuscher', 'enconusch'),
  // sa regurdar da: remember is reflexive in RG and takes da (verify).
  REMEMBER: { ...reflexive(ar('regurdar', 'regord', { u: 'regurd' })), object_prep: 'da' },
  CONSIDER: ar('considerar', 'consider'),
  EXPECT: ar('spetgar', 'spetg'), // (verify) spetgar for "expect" as well as "wait"
  READ: {
    // PG: nus legiain but legeva, legess, legì.
    ...er('leger', 'legi', { u: 'leg', first: 'legel' }),
    '1pl_present': 'legiain', '2pl_present': 'legiais', '1pl_imperative': 'legiain', '2pl_imperative': 'legiai', // 2pl imperative (verify)
  },
  CRY_OUT: ar('cridar', 'crid'),
  BITE: er('morder', 'mord', { u: 'murd', participle: 'mors', extra: { participle_plural: 'mors' } }),
  BEAT: er('batter', 'batt', { participle: 'battì' }), // (verify)
  SET_ON_FIRE: ar('envidar', 'envid'), // envidar = anzünden (verify)
  EXTINGUISH: ar('stizzar', 'stizz'),

  // ── Possession ──
  BUY: ar('cumprar', 'cumpr'),
  OWN: er('posseder', 'possed'),
  HOLD: er('cuntegnair', 'cuntegn'), // like tegnair (verify)
  HOLD_GRASP: TEGNAIR,
  INCLUDE: ar('cumpigliar', 'cumpigli', { first: 'cumpigl' }), // (verify)
  CONFINE: ar('enserrar', 'enserr'), // (verify)
  TAME: esch('dumestitgar', 'dumestitg'), // (verify)
  MAKE: FAR,
  DO: FAR,
  CONTINUE: esch('cuntinuar', 'cuntinu'), // -esch (verify)
  PLAY_INSTRUMENT: ar('sunar', 'sun'),
  NEED: tail(AVAIR, 'basegn', { object_prep: 'da', infinitive_link: 'da' }), // avair basegn da (verify)
  TRY: { ...ar('empruvar', 'emprov', { u: 'empruv' }), infinitive_link: 'da' },
  CREATE: esch('crear', 'cre'), // (verify) -esch
  DESTROY: esch('destruir', 'destru'), // (verify)
  PERCEIVE: esch('percepir', 'percep'), // (verify)
  UNDERSTAND: esch('chapir', 'chap'),
  HAVE: AVAIR,
  ACQUIRE: ar('acquistar', 'acquist'),
  TAKE: er('prender', 'prend'),
  GET: { ...VEGNIR_LIKE('sur'), '2sg_imperative': 'survegna' }, // survegnir = bekommen; takes avair; imperative (verify)
  PUT: METTER(),
  KEEP: TEGNAIR,
  LOSE: er('perder', 'perd', { participle: 'pers', extra: { participle_plural: 'pers' } }), // participle (verify)
  WIN: ar('gudagnar', 'gudogn', { u: 'gudagn' }),
  BRING: ar('purtar', 'port', { u: 'purt' }),
  LEAD: ar('manar', 'man'),
  LEAVE_BEHIND: ar('laschar', 'lasch'),
  LOOK_AT: ar('guardar', 'guard'),
  DIRECT_VERB: ar('drizzar', 'drizz'),
  DIVIDE: er('divider', 'divid'), // (verify) class and participle
  STRIKE: ar('pitgar', 'pitg'), // (verify) pitgar for "strike"
  INDICATE: esch('inditgar', 'inditg'),
  CHANGE: ar('midar', 'mid'),
  STOP: ar('fermar', 'ferm'),
  TRANSFORM: { ...ar('transfurmar', 'transform', { u: 'transfurm' }), object_predicative_link: 'en' }, // (verify)
  FEEL: ir('sentir', 'sent'),
  SHED: ar('versar', 'vers'), // versar larmas (verify)
  PRODUCE: esch('producir', 'produc'), // (verify)
  CAUSE_VERB: { ...ar('chaschunar', 'chaschun'), causative: '1', infinitive_link: 'da' }, // link (verify)
  PRESS: ar('smatgar', 'smatg'),
  WRITE: er('scriver', 'scriv', { participle: 'scrit', extra: { participle_fem: 'scritta', participle_fem_plural: 'scrittas' } }),
  CLICK: { ...ar('cliccar', 'clicc'), object_prep: 'sin' }, // cliccar sin (verify)
  DEPEND: { ...er('depender', 'depend'), object_prep: 'da' }, // avair, not esser (verify)
  CHOOSE: er('tscherner', 'tschern'),

  // ── Interface actions ──
  FILTER: esch('filtrar', 'filtr'), // (verify)
  SELECT: ar('selecziunar', 'selecziun'),
  TYPE: ar('tippar', 'tipp'),
  TRANSLATE: ar('translatar', 'translat'),
  SAVE: esch('memorisar', 'memoris'), // memorisar for saving data (verify)
  LOAD: ar('chargiar', 'chargi', { first: 'chargel' }),
  ADD: { ...ar('agiuntar', 'agiunt'), terminus_tonic: '1' },
  LINK: { ...ar('colliar', 'colli', { first: 'colliel' }), terminus_tonic: '1' }, // (verify)
  EXPORT: ar('exportar', 'export'),
  BROADCAST: METTER('e'), // emetter (verify)
  IMPORT: ar('importar', 'import'),
  CLEAR: ar('svidar', 'svid'),
  REMOVE: ar('allontanar', 'allontan'),
  DELETE: ar('stizzar', 'stizz'), // stizzar = löschen, as EXTINGUISH
  COORDINATE: esch('coordinar', 'coordin'), // (verify)
  TIDY_UP: tail(FAR, 'urden'), // far urden (verify)
  COMPACT: ar('cumpactar', 'cumpact'), // (verify)
  EXPAND: er('extender', 'extend'), // (verify)
  SHRINK: esch('reducir', 'reduc'), // (verify)
  HIDE: ar('zuppar', 'zupp'),
  START: ar('cumenzar', 'cumenz'),
  CANCEL: ar('annullar', 'annull'),
  UNDO: ar('annullar', 'annull'),
  REDO: er('repeter', 'repet'), // (verify)
  RESTORE: esch('restabilir', 'restabil'), // (verify)
  OPEN: ir('avrir', 'avr', { participle: 'avert' }),
  CLOSE: ar('serrar', 'serr'),
  RETRY: tail(ar('empruvar', 'emprov', { u: 'empruv' }), 'danovamain'), // (verify)
  USE: ar('duvrar', 'dovr', { u: 'duvr' }),
  SPEND_MONEY: er('spender', 'spend'),
  SPEND_TIME: ar('passentar', 'passent'),
  COPY: ar('copiar', 'copi', { first: 'copiel' }), // (verify)
  MOVE: ar('spustar', 'spost', { u: 'spust' }),
  LEAVE: { ...ir('partir', 'part'), object_prep: 'da', aux: 'be' }, // partir da (verify)
  RESIZE: ar('redimensiunar', 'redimensiun'),
  DRAG: ar('trair', 'tir', { participle: 'tratg' }), // PG: jau tir, part. tratg
  TURN_OFF: esch('deactivar', 'deactiv'), // (verify)
  SET: esch('definir', 'defin'), // (verify)
  PIN: ar('fixar', 'fix'),
  UNPIN: ar('distatgar', 'distatg'), // (verify)
  COMPLETE: esch('cumplettar', 'cumplett'), // (verify)
  APPLY: esch('applitgar', 'applitg'), // (verify)

  // ── Language and speech ──
  NAME: ar('numnar', 'numn'),
  DESCRIBE: er('descriver', 'descriv', { participle: 'descrit', extra: { participle_fem: 'descritta', participle_fem_plural: 'descrittas' } }),
  MODIFY: esch('modifitgar', 'modifitg'), // (verify)
  SPECIFY: esch('specifitgar', 'specifitg'), // (verify)
  EDIT: ar('elavurar', 'elavur'),
  GOVERN: er('reger', 'reg'), // grammar sense (verify)
  ACCEPT: ar('acceptar', 'accept'),
  NEGATE: ar('negar', 'neg'), // (verify)
  ASSERT: ar('affirmar', 'affirm'),
  EXPRESS: er('exprimer', 'exprim'), // (verify)
  SAY: { ...DIR, content_clause_force: 'either' },
  CALL: ar('clamar', 'clom', { u: 'clam' }),
  CALL_PHONE: { ...ar('telefonar', 'telefon'), object_prep: 'a' },
  MEAN: ar('muntar', 'munt'),
  // crair en (verify); PG also gives cartain/carteva/cartess/cartì — the craj- forms kept.
  BELIEVE: {
    base: 'crair',
    ...cells('present', ['crai', 'crais', 'crai', 'crajain', 'crajais', 'crain']),
    ...cells('imperfect', ['crajeva', 'crajevas', 'crajeva', 'crajevan', 'crajevas', 'crajevan']),
    ...cells('conditional', ['crajess', 'crajessas', 'crajess', 'crajessan', 'crajessas', 'crajessan']),
    ...cells('subjunctive', ['craja', 'crajas', 'craja', 'crajan', 'crajas', 'crajan']),
    participle: 'cret', participle_fem: 'cretta', participle_fem_plural: 'crettas',
    '2sg_imperative': 'crai', '1pl_imperative': 'crajain', '2pl_imperative': 'crajai', // (verify)
    object_prep: 'en', content_clause_mood: 'subjunctive',
  },
  REPLACE: ar('remplazzar', 'remplazz'),
  BREATHE: ar('respirar', 'respir'),
  EXCHANGE: ar('barattar', 'baratt'),
  ENCLOSE: ar('circumdar', 'circumd'), // (verify)
  HEAR: ir('udir', 'aud', { u: 'ud' }),
  GOVERN_STATE: ar('guvernar', 'guvern'),
  ACCOMPANY: ar('accumpagnar', 'accumpogn', { u: 'accumpagn' }),
  ANSWER: er('respunder', 'respund'),
  SEARCH: ar('tschertgar', 'tschertg'),
  FIND: ar('chattar', 'chatt'),
  MEET: ar('entupar', 'entup'), // (verify)
  ARRANGE: ar('arranschar', 'arransch'), // (verify)
  CONNECT: { ...ar('colliar', 'colli', { first: 'colliel' }), terminus_tonic: '1' }, // (verify)
  LET: ar('laschar', 'lasch'),
  ALLOW: { ...METTER('per'), object_case: 'dat', infinitive_link: 'da' },
  LIKE: { ...er('plaschair', 'plasch'), experiencer: '1' }, // avair in the past (verify)
  HELP_VERB: { ...ar('gidar', 'gid'), infinitive_link: 'a' }, // (verify) link
  THANK: ar('engraziar', 'engrazi', { first: 'engraziel' }),
  MARRY: ar('maridar', 'marid'), // (verify)

  // ── Intransitive activity and state ──
  RUN: ir('currer', 'curr'),
  JUMP: ir('siglir', 'sigli', { u: 'sigl', first: 'sigl' }),
  COME: VEGNIR,
  CRY: ir('bragir', 'bragi', { u: 'brag', first: 'bragel' }),
  SUFFER: esch('patir', 'pat'),
  BURN: ar('brischar', 'brisch'), // intransitive "la chasa brischa" (verify)
  COLLAPSE: { ...ar('collapsar', 'collaps'), aux: 'be' }, // (verify)
  LIVE: ar('abitar', 'abit'),
  LIVE_ALIVE: er('viver', 'viv'), // participle (verify)
  DIE: { ...ir('murir', 'mor', { u: 'mur', participle: 'mort' }), aux: 'be' },
  STAY: { ...ar('restar', 'rest'), aux: 'be' },
  WAIT: ar('spetgar', 'spetg'),
  TRADE: ar('commerziar', 'commerzi', { first: 'commerziel' }), // (verify)
  ACT: esch('agir', 'ag'),
  WORK: ar('funcziunar', 'funcziun'),
  WORK_LABOUR: ar('lavurar', 'lavur'),
  PLAY_GAME: ar('giugar', 'giog', { u: 'giug' }),
  LOSE_GAME: er('perder', 'perd', { participle: 'pers', extra: { participle_plural: 'pers' } }),
  BEGIN: { ...ar('cumenzar', 'cumenz'), infinitive_link: 'a' }, // avair in the past (verify)
  STOP_DOING: { ...ar('chalar', 'chal'), infinitive_link: 'da' },
  STOP_ONESELF: reflexive(ar('fermar', 'ferm')),
  CONTINUE_DOING: { ...esch('cuntinuar', 'cuntinu'), infinitive_link: 'a' }, // (verify)
  CHANGE_ONESELF: reflexive(ar('midar', 'mid')),
  LEARN: er('emprender', 'emprend'),
  SPEAK: ir('discurrer', 'discurr'),
  // patratgar vi da: "think of" (verify the two-word preposition).
  THINK: { ...ar('patratgar', 'patratg'), content_clause_mood: 'subjunctive', topic_prep: 'vi da' },
  PRECEDE: er('preceder', 'preced'),
  FOLLOW: ar('suandar', 'suond', { u: 'suand' }),
  HAPPEN: { ...ar('capitar', 'capit'), aux: 'be' },
  GROW: { ...ir('crescher', 'cresch'), aux: 'be' },
  FLOW: { ...esch('fluir', 'flu'), aux: 'be' }, // aux (verify)

  // ── Transfer ──
  GIVE: DAR,
  SELL: er('vender', 'vend'),
  PAY: ar('pajar', 'paj'),
  PROVIDE: esch('furnir', 'furn'),
  TRANSFER: esch('transferir', 'transfer'), // (verify)
  SHOW: ar('mussar', 'muss'),
  SEND: METTER('tra'),
  TELL: { ...ar('raquintar', 'raquint'), content_clause_force: 'either', infinitive_sense: 'TELL_ORDER' },
  TELL_ORDER: { ...DIR, object_case: 'dat', infinitive_link: 'da' },
  ASK: { ...ar('dumandar', 'dumond', { u: 'dumand' }), content_clause_force: 'interrogative' },

  // ── Motion ──
  GO: IR,
  RETURN: { ...ar('turnar', 'turn'), aux: 'be' },
  TURN: ar('girar', 'gir'), // (verify)
  LEAVE_DEPART: { ...ir('partir', 'part'), aux: 'be' },
  RUN_AWAY: { ...ir('fugir', 'fugi', { u: 'fug', first: 'fugel' }), aux: 'be' },
  GO_OUT: tail(IR, 'or', { participle_fem: 'ida or', participle_plural: 'ids or', participle_fem_plural: 'idas or' }),
  WALK: tail(IR, 'a pe', { participle_fem: 'ida a pe', participle_plural: 'ids a pe', participle_fem_plural: 'idas a pe' }), // ir a pe (verify)
  MOVE_ONESELF: { ...reflexive(er('mover', 'mov', { u: 'muv' })), direction_prep: 'vers' },
  SIT_DOWN: reflexive(ar('tschentar', 'tschent')),
  STAND_UP: reflexive(ar('levar', 'lev')),
  BECOME: { ...ar('daventar', 'davent'), aux: 'be' },
  SEEM: { ...er('parair', 'par'), seeming: '1', aux: 'be' }, // aux (verify)
  APPEAR: { ...er('cumparair', 'cumpar'), aux: 'be' },
  BE: { ...ESSER, copula: '1' },
  BE_FARING: STAR,
  FLY: { ...ar('sgular', 'sgol', { u: 'sgul' }), direction_prep: 'vers' },

  // ── Modals (`nonfinite` is the infinitive the chain uses; RG does not truncate it) ──
  MUST: STUAIR,
  CAN: PUDAIR,
  WILL: VULAIR,
  MAY: { ...ar('dastgar', 'dastg'), nonfinite: 'dastgar' }, // dastgar = dürfen
  // SHOULD / MIGHT: as Italian, the present cells hold the conditional (*jau stuess*, *jau pudess*).
  SHOULD: conditionalAsPresent(STUAIR),
  MIGHT: conditionalAsPresent(PUDAIR),
};
