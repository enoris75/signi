import type { LanguageColumn } from '../types.js';

/**
 * Catalan verbs (P03), Central Catalan in the IEC standard (P03 D1). Every form is *(verify)* until
 * the native review (P03-E11); `// (verify)` marks the choices the author is specifically unsure of.
 *
 * Stored in full (style-ca.md § Verbs), so the engine never derives a Catalan form from a Spanish rule:
 * `base`; for each person the present, imperfect, future, conditional, present subjunctive
 * (`{p}_subjunctive`) and imperfect subjunctive (`{p}_past_subjunctive`); the gerund; the four
 * participle forms; the 2sg / 1pl / 2pl imperatives. Never a `{p}_past` (the past is the periphrastic
 * *va menjar*, P03 D2) and never an `aux` (Catalan always uses *haver*).
 *
 * The regular classes are built by helpers: `ar` (1st, *-ar*), `re` (2nd, *-er / -re*, whose members
 * are mostly irregular and pass their own stems), `ir` (3rd pure, *dormir*), `eix` (3rd inchoative,
 * *servir → serveixo*). The spelling changes before *e / i* (*c/qu, g/gu, ç/c, j/g, gu/gü, qu/qü*) are
 * `soft`; the diaeresis on an unstressed *i* after a vowel (*agraïm, continuï, construït*) is `dia`.
 *
 * Pronominal verbs follow the Spanish entry of the same concept (`encontrarse`, `me encuentro`): the
 * enclitic on `base` (*tornar-se, moure's*) and the proclitic on every finite cell (*em torno, s'atura,
 * ens asseiem*); the gerund, participles and imperatives stay bare, as the engine attaches the clitic.
 *
 * Spanish keys dropped: `object_a` / `object_no_a` (the Spanish personal *a*, which Catalan does not
 * have: *ajudo el gat*, *tinc un germà*) and `subjunctive_stem` (the Spanish engine's stem for deriving
 * the imperfect subjunctive; Catalan stores that tense in full).
 */

type Entry = Record<string, string>;

const PERSONS = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'] as const;

function cells(tense: string, forms: readonly string[]): Entry {
  return Object.fromEntries(PERSONS.map((p, i) => [`${p}_${tense}`, forms[i]!]));
}

/** A stem ending in a vowel (not the *gu / qu* digraphs): *continu-, agra-, cre-, envi-*. */
function vowelStem(stem: string): boolean {
  return /[aeiouàèéíòóúï]$/.test(stem) && !/[gq]u$/.test(stem);
}

/** Stem + ending, with the diaeresis on an unstressed *i* after a vowel: *agra + im → agraïm*. */
function dia(stem: string, ending: string): string {
  return vowelStem(stem) && ending.startsWith('i') ? `${stem}ï${ending.slice(1)}` : stem + ending;
}

/** The stem before *e / i*: *menj → meng, toc → toqu, començ → comenc, pag → pagu, averigu → averigü*. */
function soft(stem: string): string {
  if (/gu$/.test(stem)) return `${stem.slice(0, -1)}ü`;
  if (/qu$/.test(stem)) return `${stem.slice(0, -1)}ü`;
  if (stem.endsWith('c')) return `${stem.slice(0, -1)}qu`;
  if (stem.endsWith('g')) return `${stem}u`;
  if (stem.endsWith('ç')) return `${stem.slice(0, -1)}c`;
  if (stem.endsWith('j')) return `${stem.slice(0, -1)}g`;
  return stem;
}

/** A feminine form's plural: *-a → -es*, with *-ca → -ques, -ga → -gues, -ça → -ces, -ja → -ges*. */
function femPlural(fem: string): string {
  const stem = fem.slice(0, -1);
  return `${soft(stem)}es`;
}

/**
 * The four participle forms. A regular *-at / -it / -ut* participle voices its *t* (*menjada*);
 * otherwise the feminine is passed or is *+a* (*fet → feta*, *mort → morta*). A masculine ending in
 * *-s, -st* takes *-os* (*pres → presos*, *vist → vistos*, *comprès → compresos*).
 */
function pp(m: string, f?: string): Entry {
  const fem = f ?? (/(a|i|u|ï)t$/.test(m) ? `${m.slice(0, -1)}da` : `${m}a`);
  // The -os plural is built on the feminine's stem, so an accent drops: *comprès → compresos*.
  const plural = /(s|st)$/.test(m) ? `${fem.slice(0, -1)}os` : `${m}s`;
  return { participle: m, participle_fem: fem, participle_plural: plural, participle_fem_plural: femPlural(fem) };
}

function impSubj(stem: string, v: 'e' | 'i'): Entry {
  return v === 'e'
    ? cells('past_subjunctive', [`${stem}és`, `${stem}essis`, `${stem}és`, `${stem}éssim`, `${stem}éssiu`, `${stem}essin`])
    : cells('past_subjunctive', [dia(stem, 'ís'), dia(stem, 'issis'), dia(stem, 'ís'), `${stem}íssim`, `${stem}íssiu`, dia(stem, 'issin')]);
}

function future(stem: string): Entry {
  return cells('future', ['é', 'às', 'à', 'em', 'eu', 'an'].map((e) => stem + e));
}

function conditional(stem: string): Entry {
  return cells('conditional', ['ia', 'ies', 'ia', 'íem', 'íeu', 'ien'].map((e) => stem + e));
}

/** 1st conjugation, *-ar* (*menjar*, *tocar*, *començar*, *canviar*, *continuar*). */
function ar(base: string, extra: Entry = {}): Entry {
  const s = base.slice(0, -2);
  const w = soft(s);
  return {
    base,
    ...cells('present', [`${s}o`, `${w}es`, `${s}a`, `${w}em`, `${w}eu`, `${w}en`]),
    ...cells('imperfect', [`${s}ava`, `${s}aves`, `${s}ava`, `${s}àvem`, `${s}àveu`, `${s}aven`]),
    ...future(base),
    ...conditional(base),
    ...cells('subjunctive', [dia(w, 'i'), dia(w, 'is'), dia(w, 'i'), `${w}em`, `${w}eu`, dia(w, 'in')]),
    ...impSubj(w, 'e'),
    gerund: `${s}ant`,
    ...pp(`${s}at`),
    '2sg_imperative': `${s}a`, '1pl_imperative': `${w}em`, '2pl_imperative': `${w}eu`,
    ...extra,
  };
}

interface ReOpts {
  base: string;
  /** The six present cells. */
  present: readonly string[];
  /** The unstressed stem: imperfect *-ia*, gerund *-ent* (*perd-*, *bev-*, *coneix-*). */
  u: string;
  /** The imperfect, when not *u + ia* (*veia … vèiem*, *incloïa*). */
  imperfect?: readonly string[];
  /** The future / conditional stem (*perdr-*, *beur-*, *coneixer-*). */
  fut: string;
  /** The present subjunctive stem (*perd-*, *begu-*, *conegu-*): *-i, -is, -i, -em, -eu, -in*. */
  sj: string;
  /** The present subjunctive 1pl / 2pl stem, when not `sj` (*saber: sàpig- / sapigu-*). */
  sj12?: string;
  /** The imperfect subjunctive stem (*perd-*, *begu-*): *-és …*. */
  ps: string;
  gerund?: string;
  participle: Entry;
  /** The 2sg imperative, when not the present 3sg. */
  imp2sg?: string;
  /** The 2pl imperative, when not the present 2pl. */
  imp2pl?: string;
  extra?: Entry;
}

/** 2nd conjugation, *-er / -re* (*perdre*, *prémer*, *beure*, *conèixer*). */
function re(o: ReOpts): Entry {
  const sj12 = o.sj12 ?? o.sj;
  return {
    base: o.base,
    ...cells('present', o.present),
    ...cells('imperfect', o.imperfect ?? ['ia', 'ies', 'ia', 'íem', 'íeu', 'ien'].map((e) => o.u + e)),
    ...future(o.fut),
    ...conditional(o.fut),
    ...cells('subjunctive', [`${o.sj}i`, `${o.sj}is`, `${o.sj}i`, `${sj12}em`, `${sj12}eu`, `${o.sj}in`]),
    ...impSubj(o.ps, 'e'),
    gerund: o.gerund ?? `${o.u}ent`,
    ...o.participle,
    '2sg_imperative': o.imp2sg ?? o.present[2]!, '1pl_imperative': `${sj12}em`, '2pl_imperative': o.imp2pl ?? o.present[4]!,
    ...o.extra,
  };
}

/** A regular stressed-root 2nd-conjugation verb: *perdre, batre, vendre, prémer* (stem, 2sg *-s*). */
function reg2(base: string, s: string, o: Partial<ReOpts> & { participle?: Entry } = {}): Entry {
  const fut = base.endsWith('re') ? base.slice(0, -1) : base.normalize('NFD').replace(/[̀-ͯ]/g, '');
  return re({
    base, present: [`${s}o`, `${s}s`, s, `${s}em`, `${s}eu`, `${s}en`], u: s, fut, sj: s, ps: s,
    participle: pp(`${s}ut`), ...o,
  });
}

/** 3rd conjugation, pure *-ir* (*dormir*, *sentir*): stressed stem `s`, unstressed `u`. */
function ir(base: string, s: string, o: { u?: string; first?: string; e?: boolean; participle?: Entry; extra?: Entry } = {}): Entry {
  const u = o.u ?? s;
  // *obrir, omplir*: a stem ending in a consonant cluster takes *-es, -e* in the 2sg / 3sg.
  const p2 = o.e ? `${s}es` : `${s}s`;
  const p3 = o.e ? `${s}e` : s;
  return {
    base,
    ...cells('present', [o.first ?? `${s}o`, p2, p3, dia(u, 'im'), dia(u, 'iu'), `${s}en`]),
    ...cells('imperfect', [dia(u, 'ia'), dia(u, 'ies'), dia(u, 'ia'), `${u}íem`, `${u}íeu`, dia(u, 'ien')]),
    ...future(`${u}ir`),
    ...conditional(`${u}ir`),
    ...cells('subjunctive', [`${s}i`, `${s}is`, `${s}i`, dia(u, 'im'), dia(u, 'iu'), `${s}in`]),
    ...impSubj(u, 'i'),
    gerund: `${u}int`,
    ...(o.participle ?? pp(dia(u, 'it'))),
    '2sg_imperative': p3, '1pl_imperative': dia(u, 'im'), '2pl_imperative': dia(u, 'iu'),
    ...o.extra,
  };
}

/** 3rd conjugation, inchoative *-ir* with *-eix-* (*servir → serveixo*, *agrair → agraeixo, agraïm*). */
function eix(base: string, extra: Entry = {}): Entry {
  const u = base.slice(0, -2);
  const e = `${u}eix`;
  return {
    base,
    ...cells('present', [`${e}o`, `${e}es`, e, dia(u, 'im'), dia(u, 'iu'), `${e}en`]),
    ...cells('imperfect', [dia(u, 'ia'), dia(u, 'ies'), dia(u, 'ia'), `${u}íem`, `${u}íeu`, dia(u, 'ien')]),
    ...future(`${u}ir`),
    ...conditional(`${u}ir`),
    ...cells('subjunctive', [`${e}i`, `${e}is`, `${e}i`, dia(u, 'im'), dia(u, 'iu'), `${e}in`]),
    ...impSubj(u, 'i'),
    gerund: `${u}int`,
    ...pp(dia(u, 'it')),
    '2sg_imperative': e, '1pl_imperative': dia(u, 'im'), '2pl_imperative': dia(u, 'iu'),
    ...extra,
  };
}

// ── Pronominal verbs ──

const PROCLITIC: Record<string, [string, string]> = {
  '1sg': ['em', "m'"], '2sg': ['et', "t'"], '3sg': ['es', "s'"], '1pl': ['ens', 'ens'], '2pl': ['us', 'us'], '3pl': ['es', "s'"],
};

function proclitic(person: string, form: string): string {
  const [full, elided] = PROCLITIC[person]!;
  return /^h?[aeiouàèéíòóú]/i.test(form) && elided.endsWith("'") ? `${elided}${form}` : `${full} ${form}`;
}

/** Enclitic on the base (*tornar-se*, *moure's*), proclitic on every finite cell (*em torno, s'atura*). */
function pron(v: Entry, extra: Entry = {}): Entry {
  const b = v['base']!;
  const out: Entry = { ...v, base: /[aeiou]$/.test(b) ? `${b}'s` : `${b}-se` };
  for (const [k, f] of Object.entries(v)) {
    const person = /^(\d(?:sg|pl))_(present|imperfect|future|conditional|subjunctive|past_subjunctive)$/.exec(k)?.[1];
    if (person) out[k] = proclitic(person, f);
  }
  return { ...out, ...extra };
}

// ── The irregular core (style-ca.md § Verbs) ──

const SER: Entry = {
  base: 'ser',
  ...cells('present', ['sóc', 'ets', 'és', 'som', 'sou', 'són']),
  ...cells('imperfect', ['era', 'eres', 'era', 'érem', 'éreu', 'eren']),
  ...future('ser'),
  ...conditional('ser'),
  ...cells('subjunctive', ['sigui', 'siguis', 'sigui', 'siguem', 'sigueu', 'siguin']),
  ...cells('past_subjunctive', ['fos', 'fossis', 'fos', 'fóssim', 'fóssiu', 'fossin']),
  gerund: 'sent',
  ...pp('estat'),
  '2sg_imperative': 'sigues', '1pl_imperative': 'siguem', '2pl_imperative': 'sigueu',
};

const ESTAR: Entry = {
  ...ar('estar'),
  ...cells('present', ['estic', 'estàs', 'està', 'estem', 'esteu', 'estan']),
  ...cells('subjunctive', ['estigui', 'estiguis', 'estigui', 'estiguem', 'estigueu', 'estiguin']),
  ...impSubj('estigu', 'e'),
  '2sg_imperative': 'estigues', '1pl_imperative': 'estiguem', '2pl_imperative': 'estigueu',
};

const HAVER: Entry = re({
  base: 'haver',
  present: ['he', 'has', 'ha', 'hem', 'heu', 'han'],
  u: 'hav', fut: 'haur', sj: 'hag', ps: 'hagu',
  participle: pp('hagut'),
  extra: {
    // Central 1pl / 2pl subjunctive *hàgim, hàgiu* (also *haguem, hagueu*) (verify).
    '1pl_subjunctive': 'hàgim', '2pl_subjunctive': 'hàgiu',
    // haver has no imperative of its own; the subjunctive-based forms stand in (verify).
    '2sg_imperative': 'hagues', '1pl_imperative': 'haguem', '2pl_imperative': 'hagueu',
  },
});

const ANAR: Entry = {
  ...ar('anar'),
  ...cells('present', ['vaig', 'vas', 'va', 'anem', 'aneu', 'van']),
  ...future('anir'),
  ...conditional('anir'),
  ...cells('subjunctive', ['vagi', 'vagis', 'vagi', 'anem', 'aneu', 'vagin']),
  '2sg_imperative': 'vés', '1pl_imperative': 'anem', '2pl_imperative': 'aneu',
};

/** *fer* and its compounds (*desfer, refer*): a compound accents its oxytones (*desfàs, desfà, desfés*). */
function FER(prefix = ''): Entry {
  const acc = (plain: string, accented: string) => (prefix ? prefix + accented : plain);
  const p = prefix;
  return {
    base: `${p}fer`,
    ...cells('present', [`${p}faig`, acc('fas', 'fàs'), acc('fa', 'fà'), `${p}fem`, `${p}feu`, `${p}fan`]),
    ...cells('imperfect', [`${p}feia`, `${p}feies`, `${p}feia`, `${p}fèiem`, `${p}fèieu`, `${p}feien`]),
    ...future(`${p}far`),
    ...conditional(`${p}far`),
    ...cells('subjunctive', [`${p}faci`, `${p}facis`, `${p}faci`, `${p}fem`, `${p}feu`, `${p}facin`]),
    ...cells('past_subjunctive', [acc('fes', 'fés'), `${p}fessis`, acc('fes', 'fés'), `${p}féssim`, `${p}féssiu`, `${p}fessin`]),
    gerund: `${p}fent`,
    ...pp(`${p}fet`, `${p}feta`),
    '2sg_imperative': acc('fes', 'fés'), '1pl_imperative': `${p}fem`, '2pl_imperative': `${p}feu`,
  };
}

/** *tenir* and its compounds (*contenir, sostenir, obtenir*): a compound's 3sg is *-té*. */
function TENIR(prefix = ''): Entry {
  const p = prefix;
  return {
    base: `${p}tenir`,
    // Compound 2sg *contens, obtens* without an accent (-ens is not an accented ending) (verify).
    ...cells('present', [`${p}tinc`, `${p}tens`, `${p}té`, `${p}tenim`, `${p}teniu`, `${p}tenen`]),
    ...cells('imperfect', [`${p}tenia`, `${p}tenies`, `${p}tenia`, `${p}teníem`, `${p}teníeu`, `${p}tenien`]),
    ...future(`${p}tindr`),
    ...conditional(`${p}tindr`),
    ...cells('subjunctive', [`${p}tingui`, `${p}tinguis`, `${p}tingui`, `${p}tinguem`, `${p}tingueu`, `${p}tinguin`]),
    ...impSubj(`${p}tingu`, 'e'),
    gerund: `${p}tenint`,
    ...pp(`${p}tingut`),
    '2sg_imperative': `${p}tingues`, '1pl_imperative': `${p}tinguem`, '2pl_imperative': `${p}tingueu`,
  };
}

const VENIR: Entry = {
  base: 'venir',
  ...cells('present', ['vinc', 'véns', 've', 'venim', 'veniu', 'vénen']),
  ...cells('imperfect', ['venia', 'venies', 'venia', 'veníem', 'veníeu', 'venien']),
  ...future('vindr'),
  ...conditional('vindr'),
  ...cells('subjunctive', ['vingui', 'vinguis', 'vingui', 'vinguem', 'vingueu', 'vinguin']),
  ...impSubj('vingu', 'e'),
  gerund: 'venint',
  ...pp('vingut'),
  '2sg_imperative': 'vine', '1pl_imperative': 'vinguem', '2pl_imperative': 'veniu',
};

const PODER: Entry = re({
  base: 'poder', present: ['puc', 'pots', 'pot', 'podem', 'podeu', 'poden'],
  u: 'pod', fut: 'podr', sj: 'pugu', ps: 'pogu', participle: pp('pogut'),
  imp2sg: 'pugues', imp2pl: 'pugueu', // (verify) poder's imperative is marginal
});

const VOLER: Entry = re({
  base: 'voler', present: ['vull', 'vols', 'vol', 'volem', 'voleu', 'volen'],
  u: 'vol', fut: 'voldr', sj: 'vulgu', ps: 'volgu', participle: pp('volgut'),
  imp2sg: 'vulgues', imp2pl: 'vulgueu',
});

const SABER: Entry = re({
  base: 'saber', present: ['sé', 'saps', 'sap', 'sabem', 'sabeu', 'saben'],
  u: 'sab', fut: 'sabr', sj: 'sàpig', sj12: 'sapigu', ps: 'sab', participle: pp('sabut'),
  imp2sg: 'sàpigues', imp2pl: 'sapigueu',
  extra: cells('subjunctive', ['sàpiga', 'sàpigues', 'sàpiga', 'sapiguem', 'sapigueu', 'sàpiguen']),
});

const DIR: Entry = {
  base: 'dir',
  ...cells('present', ['dic', 'dius', 'diu', 'diem', 'dieu', 'diuen']),
  ...cells('imperfect', ['deia', 'deies', 'deia', 'dèiem', 'dèieu', 'deien']),
  ...future('dir'),
  ...conditional('dir'),
  ...cells('subjunctive', ['digui', 'diguis', 'digui', 'diguem', 'digueu', 'diguin']),
  ...impSubj('digu', 'e'),
  gerund: 'dient',
  ...pp('dit', 'dita'),
  '2sg_imperative': 'digues', '1pl_imperative': 'diguem', '2pl_imperative': 'digueu',
};

const VEURE: Entry = re({
  base: 'veure', present: ['veig', 'veus', 'veu', 'veiem', 'veieu', 'veuen'],
  u: 've', imperfect: ['veia', 'veies', 'veia', 'vèiem', 'vèieu', 'veien'],
  fut: 'veur', sj: 'veg', ps: 'vei', gerund: 'veient', participle: pp('vist'),
  imp2sg: 'veges', // (verify) Central *veges* (also *ves*)
});

const BEURE: Entry = re({
  base: 'beure', present: ['bec', 'beus', 'beu', 'bevem', 'beveu', 'beuen'],
  u: 'bev', fut: 'beur', sj: 'begu', ps: 'begu', participle: pp('begut'),
});

/** *córrer* and its compounds (*ocórrer*): participle *corregut*, imperfect subjunctive *corregués*. */
const CORRER: Entry = re({
  base: 'córrer', present: ['corro', 'corres', 'corre', 'correm', 'correu', 'corren'],
  u: 'corr', fut: 'correr', sj: 'corr', ps: 'corregu', participle: pp('corregut'),
});

/** *-èixer* verbs (*conèixer, aparèixer*): *conec, coneixes*, subjunctive *conegui*. */
function EIXER(base: string, first: string, root: string): Entry {
  const x = `${root}eix`;
  return re({
    base, present: [first, `${x}es`, x, `${x}em`, `${x}eu`, `${x}en`],
    u: x, fut: `${x}er`, sj: `${root}egu`, ps: `${root}egu`, participle: pp(`${root}egut`),
  });
}

const VIURE: Entry = {
  ...re({
    base: 'viure', present: ['visc', 'vius', 'viu', 'vivim', 'viviu', 'viuen'],
    u: 'viv', fut: 'viur', sj: 'visqu', ps: 'visqu', gerund: 'vivint', participle: pp('viscut'),
  }),
  '1pl_subjunctive': 'visquem', '2pl_subjunctive': 'visqueu',
};

/** *escriure, descriure*: *escric, escrivim*, subjunctive *escrigui*, imperfect subjunctive *escrivís*. */
function ESCRIURE(prefix = ''): Entry {
  const s = `${prefix}escri`;
  return {
    ...re({
      base: `${s}ure`, present: [`${s}c`, `${s}us`, `${s}u`, `${s}vim`, `${s}viu`, `${s}uen`],
      u: `${s}v`, fut: `${s}ur`, sj: `${s}gu`, ps: `${s}gu`, gerund: `${s}vint`, participle: pp(`${s}t`, `${s}ta`),
    }),
    ...impSubj(`${s}v`, 'i'), // escrivís (verify against escrigués)
  };
}

/** *prendre* and the *-endre* family (*comprendre, aprendre, entendre, dependre, vendre*…). */
function ENDRE(base: string, root: string, p3: string, participle: Entry): Entry {
  return re({
    base, present: [`${root}c`, `${root}s`, p3, `${root}em`, `${root}eu`, `${root}en`],
    u: root, fut: base.slice(0, -1), sj: `${root}gu`, ps: `${root}gu`, participle,
  });
}

/** *metre* compounds (*permetre, emetre*): participle *-mès, -mesa*. */
function METRE(prefix: string): Entry {
  return reg2(`${prefix}metre`, `${prefix}met`, { participle: pp(`${prefix}mès`, `${prefix}mesa`) });
}

const MOURE: Entry = re({
  base: 'moure', present: ['moc', 'mous', 'mou', 'movem', 'moveu', 'mouen'],
  u: 'mov', fut: 'mour', sj: 'mogu', ps: 'mogu', participle: pp('mogut'),
});

const ASSEURE: Entry = re({
  base: 'asseure', present: ['assec', 'asseus', 'asseu', 'asseiem', 'asseieu', 'asseuen'],
  u: 'asse', imperfect: ['asseia', 'asseies', 'asseia', 'assèiem', 'assèieu', 'asseien'],
  fut: 'asseur', sj: 'assegu', ps: 'assegu', gerund: 'asseient', participle: pp('assegut'),
});

const CREURE: Entry = re({
  base: 'creure', present: ['crec', 'creus', 'creu', 'creiem', 'creieu', 'creuen'],
  u: 'cre', imperfect: ['creia', 'creies', 'creia', 'crèiem', 'crèieu', 'creien'],
  fut: 'creur', sj: 'cregu', ps: 'cregu', gerund: 'creient', participle: pp('cregut'),
});

const TREURE: Entry = re({
  base: 'treure', present: ['trec', 'treus', 'treu', 'traiem', 'traieu', 'treuen'],
  u: 'tra', imperfect: ['treia', 'treies', 'treia', 'trèiem', 'trèieu', 'treien'],
  fut: 'traur', sj: 'tregu', sj12: 'tragu', ps: 'tragu', gerund: 'traient', participle: pp('tret'),
});

const CAURE: Entry = re({
  base: 'caure', present: ['caic', 'caus', 'cau', 'caiem', 'caieu', 'cauen'],
  u: 'ca', imperfect: ['queia', 'queies', 'queia', 'quèiem', 'quèieu', 'queien'],
  fut: 'caur', sj: 'caigu', ps: 'caigu', gerund: 'caient', participle: pp('caigut'),
});

const INCLOURE: Entry = re({
  base: 'incloure', present: ['incloc', 'inclous', 'inclou', 'incloem', 'incloeu', 'inclouen'],
  u: 'inclo', imperfect: ['incloïa', 'incloïes', 'incloïa', 'incloíem', 'incloíeu', 'incloïen'],
  fut: 'inclour', sj: 'inclogu', ps: 'inclogu', gerund: 'incloent', participle: pp('inclòs', 'inclosa'),
});

const CREIXER: Entry = re({
  base: 'créixer', present: ['creixo', 'creixes', 'creix', 'creixem', 'creixeu', 'creixen'],
  u: 'creix', fut: 'creixer', sj: 'creix', ps: 'cresqu', participle: pp('crescut'),
});

const RESPONDRE: Entry = re({
  base: 'respondre', present: ['responc', 'responds', 'respon', 'responem', 'responeu', 'responen'],
  u: 'respon', fut: 'respondr', sj: 'respongu', ps: 'respongu', participle: pp('respost'),
});

const PERCEBRE: Entry = re({
  base: 'percebre', present: ['percebo', 'perceps', 'percep', 'percebem', 'percebeu', 'perceben'],
  u: 'perceb', fut: 'percebr', sj: 'perceb', ps: 'perceb', participle: pp('percebut'),
});

const PREMER: Entry = reg2('prémer', 'prem');

const SORTIR: Entry = ir('sortir', 'surt', { u: 'sort' });
const MORIR: Entry = ir('morir', 'mor', { participle: pp('mort') });
const OBRIR: Entry = ir('obrir', 'obr', { e: true, participle: pp('obert') });
const FUGIR: Entry = {
  ...ir('fugir', 'fug', { first: 'fujo', e: true }),
  '3sg_present': 'fuig', '2sg_imperative': 'fuig',
};

/** A modal whose present cells hold its conditional, as Spanish's SHOULD (*debería*) and MIGHT (*podría*). */
function conditionalAsPresent(v: Entry): Entry {
  return { ...v, ...cells('present', PERSONS.map((p) => v[`${p}_conditional`]!)) };
}

export const CA_VERBS: LanguageColumn = {
  // ── Consumption ──
  CUT: ar('tallar'),
  EAT: ar('menjar'),
  EAT_ANIMAL: ar('menjar'),
  DRINK: BEURE,
  POUR: ar('abocar'),
  CONSUME: eix('consumir'),

  // ── Perception, cognition, feeling ──
  SEE: VEURE,
  LOVE: ar('estimar'),
  DESIRE: ar('desitjar'),
  KILL: ar('matar'),
  KNOW: { ...SABER, content_clause_force: 'either', object_sense: 'KNOW_ACQUAINTED' },
  KNOW_ACQUAINTED: EIXER('conèixer', 'conec', 'con'),
  REMEMBER: ar('recordar'),
  CONSIDER: ar('considerar'),
  EXPECT: ar('esperar'),
  READ: eix('llegir'),
  CRY_OUT: ar('cridar'),
  BITE: ar('mossegar'),
  BEAT: reg2('batre', 'bat'),
  SET_ON_FIRE: ar('cremar'),
  EXTINGUISH: ar('apagar'),

  // ── Possession ──
  BUY: ar('comprar'),
  OWN: eix('posseir'),
  HOLD: TENIR('con'),
  HOLD_GRASP: TENIR('sos'),
  INCLUDE: INCLOURE,
  CONFINE: ar('tancar'), // (verify) tancar (shut in) over confinar
  TAME: ar('domesticar'),
  MAKE: FER(),
  DO: FER(),
  CONTINUE: ar('continuar'),
  PLAY_INSTRUMENT: ar('tocar'),
  NEED: ar('necessitar'),
  TRY: ar('intentar'),
  CREATE: ar('crear'),
  DESTROY: eix('destruir'),
  PERCEIVE: PERCEBRE,
  UNDERSTAND: ENDRE('comprendre', 'compren', 'comprèn', pp('comprès', 'compresa')),
  HAVE: TENIR(), // Spanish object_no_a dropped: Catalan has no personal a
  ACQUIRE: eix('adquirir'),
  TAKE: ar('agafar'),
  GET: TENIR('ob'),
  PUT: ar('posar'),
  KEEP: ar('conservar'),
  LOSE: reg2('perdre', 'perd'),
  WIN: ar('guanyar'),
  BRING: ar('portar'),
  LEAD: ar('guiar'),
  LEAVE_BEHIND: ar('deixar'),
  LOOK_AT: ar('mirar'),
  DIRECT_VERB: eix('dirigir'),
  DIVIDE: eix('dividir'),
  STRIKE: ar('colpejar'),
  INDICATE: ar('indicar'),
  CHANGE: ar('canviar'),
  STOP: ar('aturar'),
  TRANSFORM: { ...ar('transformar'), object_predicative_link: 'en' },
  FEEL: ir('sentir', 'sent'),
  SHED: ar('vessar'),
  PRODUCE: eix('produir'),
  CAUSE_VERB: { ...eix('induir'), causative: '1', infinitive_link: 'a' },
  PRESS: PREMER,
  WRITE: ESCRIURE(),
  CLICK: { ...ar('clicar'), object_prep: 'a' }, // clicar a (verify: also clicar + direct object)
  DEPEND: { ...ENDRE('dependre', 'depen', 'depèn', pp('depès', 'depesa')), object_prep: 'de' }, // participle (verify)
  CHOOSE: ar('triar'),

  // ── Interface actions ──
  FILTER: ar('filtrar'),
  SELECT: ar('seleccionar'),
  TYPE: ar('teclejar'),
  TRANSLATE: eix('traduir'),
  SAVE: ar('desar'),
  LOAD: ar('carregar'),
  ADD: { ...eix('afegir'), terminus_tonic: '1' },
  LINK: { ...ar('enllaçar'), terminus_tonic: '1' },
  EXPORT: ar('exportar'),
  BROADCAST: METRE('e'),
  IMPORT: ar('importar'),
  CLEAR: ar('buidar'),
  REMOVE: TREURE,
  DELETE: eix('suprimir'),
  COORDINATE: ar('coordinar'),
  TIDY_UP: ar('endreçar'),
  COMPACT: ar('compactar'),
  EXPAND: ar('desplegar'), // (verify) desplegar, the UI word, over expandir
  SHRINK: eix('reduir'),
  HIDE: ar('amagar'),
  START: ar('començar'),
  CANCEL: ar('cancel·lar'),
  UNDO: FER('des'),
  REDO: FER('re'),
  RESTORE: ar('restaurar'),
  OPEN: OBRIR,
  CLOSE: ar('tancar'),
  RETRY: ar('reintentar'), // (verify) also tornar a provar
  USE: ar('utilitzar'),
  SPEND_MONEY: ar('gastar'),
  SPEND_TIME: ar('passar'),
  COPY: ar('copiar'),
  MOVE: MOURE,
  LEAVE: { ...SORTIR, object_prep: 'de' },
  RESIZE: ar('redimensionar'),
  DRAG: ar('arrossegar'),
  TURN_OFF: ar('desactivar'),
  SET: eix('establir'),
  PIN: ar('fixar'),
  UNPIN: ar('desfixar'), // (verify)
  COMPLETE: ar('completar'),
  APPLY: ar('aplicar'),

  // ── Language and speech ──
  NAME: ar('anomenar'),
  DESCRIBE: ESCRIURE('d'),
  MODIFY: ar('modificar'),
  SPECIFY: ar('especificar'),
  EDIT: ar('editar'),
  GOVERN: eix('regir'),
  ACCEPT: ar('acceptar'),
  NEGATE: ar('negar'),
  ASSERT: ar('afirmar'),
  EXPRESS: ar('expressar'),
  SAY: { ...DIR, content_clause_force: 'either' },
  CALL: ar('cridar'),
  // Italian's `telefonare a` key: trucar takes its person with a (trucar a la mare).
  CALL_PHONE: { ...ar('trucar'), object_prep: 'a' },
  MEAN: ar('significar'),
  BELIEVE: { ...CREURE, content_clause_mood_negative: 'subjunctive' },
  REPLACE: eix('substituir'),
  BREATHE: ar('respirar'),
  EXCHANGE: ar('intercanviar'),
  ENCLOSE: ar('envoltar'), // (verify) envoltar (surround) for "shut a space in on its sides"
  HEAR: ir('sentir', 'sent'), // sentir, the everyday "hear" (oir is literary)
  GOVERN_STATE: ar('governar'),
  ACCOMPANY: ar('acompanyar'),
  ANSWER: RESPONDRE,
  SEARCH: ar('cercar'),
  FIND: ar('trobar'),
  MEET: pron(ar('trobar'), { object_prep: 'amb' }),
  ARRANGE: ar('ordenar'),
  CONNECT: { ...ar('connectar'), terminus_tonic: '1' },
  LET: ar('deixar'),
  ALLOW: { ...METRE('per'), object_case: 'dat' },
  LIKE: { ...ar('agradar'), experiencer: '1' },
  HELP_VERB: { ...ar('ajudar'), infinitive_link: 'a' }, // object_a dropped: ajudar takes a bare object
  THANK: eix('agrair'),
  MARRY: pron(ar('casar'), { object_prep: 'amb' }),

  // ── Intransitive activity and state ──
  RUN: CORRER,
  JUMP: ar('saltar'),
  COME: VENIR,
  CRY: ar('plorar'),
  SUFFER: eix('patir'),
  BURN: ar('cremar'),
  // caure (fall down); the closer ensorrar-se is pronominal, and Spanish colapsar is not (verify).
  COLLAPSE: CAURE,
  LIVE: VIURE,
  LIVE_ALIVE: VIURE,
  DIE: MORIR,
  STAY: pron(ar('quedar')),
  WAIT: ar('esperar'),
  TRADE: ar('comerciar'),
  ACT: ar('actuar'),
  WORK: ar('funcionar'),
  WORK_LABOUR: ar('treballar'),
  PLAY_GAME: ar('jugar'),
  LOSE_GAME: reg2('perdre', 'perd'),
  BEGIN: { ...ar('començar'), infinitive_link: 'a' },
  STOP_DOING: { ...ar('deixar'), infinitive_link: 'de' },
  STOP_ONESELF: pron(ar('aturar')),
  CONTINUE_DOING: { ...eix('seguir'), complement_form: 'gerund', negative_complement_link: 'sense' },
  CHANGE_ONESELF: ar('canviar'), // bare, as Spanish's cambiar
  LEARN: ENDRE('aprendre', 'apren', 'aprèn', pp('après', 'apresa')),
  SPEAK: ar('parlar'),
  THINK: { ...ar('pensar'), topic_prep: 'en', content_clause_mood_negative: 'subjunctive' },
  PRECEDE: eix('precedir'),
  FOLLOW: eix('seguir'), // object_a dropped: seguir takes a bare object
  HAPPEN: eix('succeir'),
  GROW: CREIXER,
  FLOW: eix('fluir'),

  // ── Transfer ──
  GIVE: ar('donar'),
  SELL: ENDRE('vendre', 'ven', 'ven', pp('venut')),
  PAY: ar('pagar'),
  PROVIDE: ar('proporcionar'),
  TRANSFER: eix('transferir'),
  SHOW: ar('mostrar'),
  SEND: ar('enviar'),
  TELL: { ...ar('explicar'), content_clause_force: 'either', infinitive_sense: 'TELL_ORDER' }, // (verify) explicar vs contar
  TELL_ORDER: { ...ar('manar'), object_case: 'dat' },
  ASK: { ...ar('preguntar'), content_clause_force: 'interrogative' },

  // ── Motion ──
  GO: ANAR,
  RETURN: ar('tornar'),
  TURN: ar('girar'),
  LEAVE_DEPART: ar('marxar'),
  RUN_AWAY: FUGIR,
  GO_OUT: SORTIR,
  WALK: ar('caminar'),
  MOVE_ONESELF: pron(MOURE),
  SIT_DOWN: pron(ASSEURE),
  STAND_UP: pron(ar('aixecar')),
  BECOME: pron(ar('tornar')),
  SEEM: { ...ar('semblar'), seeming: '1' },
  APPEAR: EIXER('aparèixer', 'aparec', 'apar'),
  BE: { ...SER, copula: '1' },
  BE_FARING: ESTAR,
  FLY: ar('volar'),

  // ── Modals ──
  // haver de (P03 §2.2): the modal is haver, and the de is the infinitive link.
  MUST: { ...HAVER, infinitive_link: 'de' },
  CAN: PODER,
  WILL: VOLER,
  MAY: PODER,
  // SHOULD / MIGHT: as Spanish, the present cells hold the conditional (hauria de, podria).
  // Spanish's subjunctive_stem is dropped: the imperfect subjunctive is stored in full.
  SHOULD: { ...conditionalAsPresent(HAVER), infinitive_link: 'de' },
  MIGHT: conditionalAsPresent(PODER),
};
