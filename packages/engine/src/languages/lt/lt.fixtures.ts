import type { ConceptForms } from '../../types.js';

// A fixture lexicon for the Lithuanian function-level unit tests (P18-E8): about fifty core words in
// exactly the keys of docs/features/P-planning/P18-lithuanian/style-lt.md, as the column
// (packages/backend/src/concepts/lt/) writes them through `concepts/lt/helpers.ts` — whose builders
// are copied below in brief, because the engine never imports the backend. The concept-level flags the
// lexicon adds (`role`, `animate`, `human`, `uncountable`, `stative`, `transitivity`) are written in
// by hand, as `pl.fixtures.ts` does. The sentence suite (test/languages/lt.test.ts) runs over the real
// column instead, once it is written.

export type Forms = Record<string, string>;

const cells = (list: string, n: number): string[] => {
  const parts = list.split(',').map((s) => s.trim());
  if (parts.length !== n) throw new Error(`lt fixture: expected ${n} forms in "${list}"`);
  return parts;
};

const soften = (stem: string): string =>
  stem.endsWith('t') ? `${stem.slice(0, -1)}č` : stem.endsWith('d') ? `${stem.slice(0, -1)}dž` : stem;

const SG = ['base', 'gen_sg', 'dat_sg', 'acc_sg', 'ins_sg', 'loc_sg', 'voc_sg'] as const;
const PL = ['plural', 'gen_pl', 'dat_pl', 'acc_pl', 'ins_pl', 'loc_pl'] as const;

/** A noun paradigm (helpers.ts `paradigm`); `prefix` `fem_` writes a feminine variant. */
export function paradigm(sg: string, pl?: string, prefix = ''): Forms {
  const key = (k: string) => (prefix === '' ? k : k === 'base' ? prefix.slice(0, -1) : `${prefix}${k}`);
  const out: Forms = {};
  cells(sg, 7).forEach((form, i) => { out[key(SG[i]!)] = form; });
  if (pl !== undefined) cells(pl, 6).forEach((form, i) => { out[key(PL[i]!)] = form; });
  return out;
}

const noun = (gender: 'masc' | 'fem', sg: string, pl?: string, extra: Forms = {}): Forms =>
  ({ role: 'noun', ...paradigm(sg, pl), gender, count: 'singular', ...(pl ? {} : { uncountable: '1' }), ...extra });

// The class helpers (helpers.ts `as`, `is`, `a`, `e`), enough for the fixtures.
const asN = (s: string, extra: Forms = {}, sgOnly = false) =>
  noun('masc', `${s}as, ${s}o, ${s}ui, ${s}ą, ${s}u, ${s.endsWith('j') ? `${s}yje` : `${s}e`}, ${s.endsWith('j') ? `${s}au` : `${s}e`}`,
    sgOnly ? undefined : `${s}ai, ${s}ų, ${s}ams, ${s}us, ${s}ais, ${s}uose`, extra);
const isN = (s: string, extra: Forms = {}) => {
  const g = `${soften(s)}i`;
  return noun('masc', `${s}is, ${g}o, ${g}ui, ${s}į, ${g}u, ${s}yje, ${s}i`, `${g}ai, ${g}ų, ${g}ams, ${g}us, ${g}ais, ${g}uose`, extra);
};
const aN = (s: string, extra: Forms = {}) =>
  noun('fem', `${s}a, ${s}os, ${s}ai, ${s}ą, ${s}a, ${s}oje, ${s}a`, `${s}os, ${s}ų, ${s}oms, ${s}as, ${s}omis, ${s}ose`, extra);
const eN = (s: string, extra: Forms = {}) =>
  noun('fem', `${s}ė, ${s}ės, ${s}ei, ${s}ę, ${s}e, ${s}ėje, ${s}e`, `${s}ės, ${soften(s)}ių, ${s}ėms, ${s}es, ${s}ėmis, ${s}ėse`, extra);

const PERSONS = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'] as const;
const six = (f: [string, string, string, string, string]) => [...f, f[2]];

function present(p3: string): string[] {
  const s = p3.slice(0, -1);
  if (p3.endsWith('o')) return six([`${s}au`, `${s}ai`, p3, `${s}ome`, `${s}ote`]);
  if (p3.endsWith('i')) return six([`${soften(s)}iu`, `${s}i`, p3, `${s}ime`, `${s}ite`]);
  return six([`${s}u`, s.endsWith('i') ? s : `${s}i`, p3, `${s}ame`, `${s}ate`]);
}

function past(p3: string): string[] {
  const s = p3.slice(0, -1);
  if (p3.endsWith('o')) return six([`${s}au`, `${s}ai`, p3, `${s}ome`, `${s}ote`]);
  return six([`${soften(s)}iau`, `${s}ei`, p3, `${s}ėme`, `${s}ėte`]);
}

function future(stem: string): string[] {
  const fs = /[sš]$/.test(stem) ? stem : `${stem}s`;
  const oneSyllable = (stem.match(/[aeiouyąęėįųūo]+/g) ?? []).length === 1;
  const third = oneSyllable && /[yū]s$/.test(fs) ? fs.replace(/y(s)$/, 'i$1').replace(/ū(s)$/, 'u$1') : fs;
  return six([`${fs}iu`, `${fs}i`, third, `${fs}ime`, `${fs}ite`]);
}

/** One aspect's cells from the three principal parts (helpers.ts `aspect`). */
function aspect(parts: string, prefix: '' | 'pf_', over: Forms = {}): Forms {
  const [inf, pres3, past3] = cells(parts, 3) as [string, string, string];
  const stem = inf.replace(/tis?$/, '');
  const out: Forms = { base: inf };
  const put = (tense: string, forms: string[]) => forms.forEach((f, n) => { out[`${PERSONS[n]}_${tense}`] = f; });
  put('present', present(pres3));
  put('past', past(past3));
  put('frequentative', six([`${stem}davau`, `${stem}davai`, `${stem}davo`, `${stem}davome`, `${stem}davote`]));
  put('future', future(stem));
  put('conditional', six([`${stem}čiau`, `${stem}tum`, `${stem}tų`, `${stem}tume`, `${stem}tumėte`]));
  const k = /[gk]$/.test(stem) ? stem.slice(0, -1) : stem;
  Object.assign(out, { '2sg_imperative': `${k}k`, '1pl_imperative': `${k}kime`, '2pl_imperative': `${k}kite` });
  Object.assign(out, { adverbial: `${stem}damas`, adverbial_fem: `${stem}dama`, adverbial_plural: `${stem}dami`, adverbial_fem_plural: `${stem}damos` });
  const ps = past3.slice(0, -1);
  const pf = past3.endsWith('ė') ? `${soften(ps)}i` : ps;
  Object.assign(out, {
    past_active: `${ps}ęs`, past_active_fem: `${pf}usi`, past_active_plural: `${ps}ę`, past_active_fem_plural: `${pf}usios`,
    passive: `${stem}tas`, passive_fem: `${stem}ta`, passive_plural: `${stem}ti`, passive_fem_plural: `${stem}tos`, passive_neut: `${stem}ta`,
  }, over);
  return prefix === '' ? out : Object.fromEntries(Object.entries(out).map(([key, v]) => [`${prefix}${key}`, v]));
}

/** A verb (helpers.ts `verb`): the imperfective, and the perfective under `pf_` where it has one. */
const verb = (ipf: string, pf?: string, extra: Forms = {}, over: Forms = {}): Forms =>
  ({ role: 'verb', ...aspect(ipf, '', over), ...(pf ? aspect(pf, 'pf_') : {}), ...extra });

/** An adjective (helpers.ts `adj`): `base`, `fem`, `neuter`, the synthetic degrees. */
function adj(base: string, extra: Forms = {}): Forms {
  const m = /^(.*?)(ias|as|us|is)$/.exec(base)!;
  const s = m[1]!;
  const end = m[2] as 'ias' | 'as' | 'us' | 'is';
  const [femForm, neuter] = { ias: [`${s}ia`, `${s}ia`], as: [`${s}a`, `${s}a`], us: [`${s}i`, `${s}u`], is: [`${s}ė`, `${s}i`] }[end];
  return { role: 'adjective', base, fem: femForm!, neuter: neuter!, comparative: `${s}esnis`, superlative: `${soften(s)}iausias`, ...extra };
}

// ── Nouns ───────────────────────────────────────────────────────────────────

/** CAT is *katė*, the general word, feminine (style-lt.md). */
export const KATE: Forms = eN('kat', { animate: '1' });
export const SUO: Forms = noun('masc', 'šuo, šuns, šuniui, šunį, šunimi, šunyje, šunie', 'šunys, šunų, šunims, šunis, šunimis, šunyse', { animate: '1' });
export const PELE: Forms = eN('pel', { animate: '1' });
export const VYRAS: Forms = asN('vyr', { animate: '1', human: '1' });
export const MOTERIS: Forms = noun('fem', 'moteris, moters, moteriai, moterį, moterimi, moteryje, moterie',
  'moterys, moterų, moterims, moteris, moterimis, moteryse', { animate: '1', human: '1' });
export const VAIKAS: Forms = asN('vaik', { animate: '1', human: '1' });
export const BERNIUKAS: Forms = asN('berniuk', { animate: '1', human: '1' });
export const MERGAITE: Forms = eN('mergait', { animate: '1', human: '1' });
/** A person noun with a feminine under `fem_` (style-lt.md). */
export const MOKYTOJAS: Forms = asN('mokytoj', {
  animate: '1', human: '1',
  ...paradigm('mokytoja, mokytojos, mokytojai, mokytoją, mokytoja, mokytojoje, mokytoja', 'mokytojos, mokytojų, mokytojoms, mokytojas, mokytojomis, mokytojose', 'fem_'),
});
export const DRAUGAS: Forms = asN('draug', { animate: '1', human: '1' });
export const BROLIS: Forms = isN('brol', { animate: '1', human: '1' });
export const NAMAS: Forms = asN('nam');
export const KNYGA: Forms = aN('knyg');
export const MAISTAS: Forms = asN('maist', {}, true);
export const VANDUO: Forms = noun('masc', 'vanduo, vandens, vandeniui, vandenį, vandeniu, vandenyje, vandenie');
export const PEILIS: Forms = isN('peil');
export const LAZDA: Forms = aN('lazd');
export const LEGENDA: Forms = aN('legend');
export const MOKYKLA: Forms = aN('mokykl');
export const SIENA: Forms = aN('sien');
export const STALAS: Forms = asN('stal');
export const DZIAUGSMAS: Forms = asN('džiaugsm', { mannerRelation: 'mode' }, true);
export const FRAZE: Forms = eN('fraz');
export const KURĖJAS: Forms = asN('kūrėj', { animate: '1', human: '1' });
/** A plurale tantum: the plural in every singular key too (style-lt.md). */
export const PINIGAI: Forms = noun('masc', 'pinigai, pinigų, pinigams, pinigus, pinigais, piniguose, pinigai',
  'pinigai, pinigų, pinigams, pinigus, pinigais, piniguose', { plurale_tantum: '1' });

// ── Verbs ───────────────────────────────────────────────────────────────────

export const VALGYTI: Forms = verb('valgyti, valgo, valgė', 'suvalgyti, suvalgo, suvalgė', { transitivity: 'transitive' });
export const MATYTI: Forms = verb('matyti, mato, matė', 'pamatyti, pamato, pamatė', { transitivity: 'transitive' });
export const BEGTI: Forms = verb('bėgti, bėga, bėgo', 'nubėgti, nubėga, nubėgo', { transitivity: 'intransitive' });
export const EITI: Forms = verb('eiti, eina, ėjo', 'nueiti, nueina, nuėjo', { transitivity: 'intransitive' });
export const DUOTI: Forms = verb('duoti, duoda, davė', 'atiduoti, atiduoda, atidavė', { transitivity: 'ditransitive' });
export const BUTI_VERB: Forms = verb('būti, yra, buvo', undefined, { copula: '1', stative: '1' },
  { '1sg_present': 'esu', '2sg_present': 'esi', '1pl_present': 'esame', '2pl_present': 'esate' });
/** BECOME, *tapti* + instrumental (P18 §2.2); unpaired. */
export const TAPTI: Forms = verb('tapti, tampa, tapo');
export const TURETI: Forms = verb('turėti, turi, turėjo', undefined, { stative: '1', transitivity: 'transitive' });
export const MYLETI: Forms = verb('mylėti, myli, mylėjo', undefined, { stative: '1', transitivity: 'transitive' });
export const PRIVALETI: Forms = verb('turėti, turi, turėjo', undefined, { modal: '1' });
export const GALETI: Forms = verb('galėti, gali, galėjo', undefined, { modal: '1' });
export const NORETI: Forms = verb('norėti, nori, norėjo', undefined, { modal: '1' });
/** *padėti* + dative (style-lt.md government). */
export const PADETI: Forms = verb('padėti, padeda, padėjo', undefined, { object_case: 'dat' });
/** *laukti* + genitive. */
export const LAUKTI: Forms = verb('laukti, laukia, laukė', 'palaukti, palaukia, palaukė', { object_case: 'gen' });
/** *galvoti apie* + accusative. */
export const GALVOTI: Forms = verb('galvoti, galvoja, galvojo', undefined, { object_prep: 'apie', object_prep_case: 'acc' });
/** A suffix reflexive paired with a prefix reflexive (style-lt.md): *praustis / nusiprausti*. */
export const PRAUSTIS: Forms = verb('praustis, prausia, prausė', 'nusiprausti, nusiprausia, nusiprausė', { reflexive: '1', transitivity: 'intransitive' });
export const SAKYTI: Forms = verb('sakyti, sako, sakė', 'pasakyti, pasako, pasakė', { transitivity: 'transitive' });
export const ZINOTI: Forms = verb('žinoti, žino, žinojo', undefined, { stative: '1', transitivity: 'transitive', content_clause_force: 'either' });
/** NEED, *reikėti*: the experiencer in the dative, the thing needed in the genitive (*katei reikia pelės*). */
export const REIKETI: Forms = verb('reikėti, reikia, reikėjo', undefined, { experiencer: '1', object_case: 'gen', stative: '1' });
/** An unpaired suffix reflexive: *juoktis*. */
export const JUOKTIS: Forms = verb('juoktis, juokia, juokė', undefined, { reflexive: '1', transitivity: 'intransitive' });

// ── Adjectives ──────────────────────────────────────────────────────────────

export const DIDELIS: Forms = adj('didelis', { comparative: 'didesnis', superlative: 'didžiausias' });
export const MAZAS: Forms = adj('mažas');
export const GERAS: Forms = adj('geras');
export const LAIMINGAS: Forms = adj('laimingas');
export const BALTAS: Forms = adj('baltas');
export const GRAZUS: Forms = adj('gražus');
export const SALDUS: Forms = adj('saldus');
export const ZALIAS: Forms = adj('žalias');
export const SEMANTINIS: Forms = adj('semantinis', { comparative: '', superlative: '' });
export const PASKUTINIS: Forms = adj('paskutinis', { comparative: '', superlative: '' });
export const KITAS: Forms = adj('kitas', { comparative: '', superlative: '', after_pronoun: 'kita' });
/** An invariable phrase after its noun (the column's UNTITLED). */
export const BE_PAVADINIMO: Forms = { role: 'adjective', base: 'be pavadinimo', invariable: '1', position: 'post' };
/** A stored table (the column's SAME). */
export const TAS_PATS: Forms = {
  role: 'adjective', base: 'tas pats', fem: 'ta pati', plural: 'tie patys', plural_fem: 'tos pačios', neuter: 'tas pats',
  gen: 'to paties', dat: 'tam pačiam', acc: 'tą patį', ins: 'tuo pačiu', loc: 'tame pačiame',
  fem_gen: 'tos pačios', fem_dat: 'tai pačiai', fem_acc: 'tą pačią', fem_ins: 'ta pačia', fem_loc: 'toje pačioje',
};

// ── Adverbs ─────────────────────────────────────────────────────────────────

export const NIEKADA: Forms = { role: 'adverb', base: 'niekada', subtype: 'frequency', polarity: 'negative', interrogative: 'kada nors' };
export const VISADA: Forms = { role: 'adverb', base: 'visada', subtype: 'frequency' };
export const DAZNAI: Forms = { role: 'adverb', base: 'dažnai', subtype: 'frequency' };
export const JAU: Forms = { role: 'adverb', base: 'jau', subtype: 'frequency', negative: 'dar', negative_slot: 'pre-negator' };
export const JAU_NE: Forms = { role: 'adverb', base: 'jau ne', subtype: 'frequency', polarity: 'negative', negator_lead: 'jau' };
export const GREITAI: Forms ={ role: 'adverb', base: 'greitai', comparative: 'greičiau', superlative: 'greičiausiai' };

// ── Pronouns ────────────────────────────────────────────────────────────────

const cases = (prefix: string, list: string): Forms =>
  Object.fromEntries(cells(list, 5).map((form, i) => [`${prefix}${['gen', 'dat', 'acc', 'ins', 'loc'][i]}`, form]));

export const AS: Forms = {
  role: 'pronoun', base: 'aš', person: '1', number: 'singular', gender: 'masc',
  ...cases('', 'manęs, man, mane, manimi, manyje'), plural: 'mes', ...cases('plural_', 'mūsų, mums, mus, mumis, mumyse'),
};
export const TU: Forms = {
  role: 'pronoun', base: 'tu', person: '2', number: 'singular', gender: 'masc',
  ...cases('', 'tavęs, tau, tave, tavimi, tavyje'), plural: 'jūs', ...cases('plural_', 'jūsų, jums, jus, jumis, jumyse'),
};
export const JIS: Forms = {
  role: 'pronoun', base: 'jis', person: '3', number: 'singular', gender: 'masc',
  ...cases('', 'jo, jam, jį, juo, jame'),
  singular_fem: 'ji', ...cases('fem_', 'jos, jai, ją, ja, joje'),
  plural: 'jie', ...cases('plural_', 'jų, jiems, juos, jais, juose'),
  plural_fem: 'jos', ...cases('plural_fem_', 'jų, joms, jas, jomis, jose'),
};
/** P18 D7: the subjectless 3rd person; `base` is only the picker's label (verify). */
export const GENERIC: Forms = { role: 'pronoun', base: 'žmogus', person: '3', number: 'singular', gender: 'masc', generic: '1' };
export const KAZKAS: Forms = {
  role: 'pronoun', base: 'kažkas', person: '3', number: 'singular', gender: 'masc', thing: '1', indefinite: '1',
  ...cases('', 'kažko, kažkam, kažką, kažkuo, kažkame'), negative: 'niekas', ...cases('negative_', 'nieko, niekam, nieką, niekuo, niekame'),
  with_other: 'kažkas kita', ...cases('with_other_', 'kažko kito, kažkam kitam, kažką kita, kažkuo kitu, kažkame kitame'),
  negative_with_other: 'niekas kita', ...cases('negative_with_other_', 'nieko kito, niekam kitam, nieko kito, niekuo kitu, niekame kitame'),
};
export const KAZKAS_PERSON: Forms = {
  role: 'pronoun', base: 'kažkas', person: '3', number: 'singular', gender: 'masc', indefinite: '1', human: '1',
  ...cases('', 'kažko, kažkam, kažką, kažkuo, kažkame'), negative: 'niekas', ...cases('negative_', 'nieko, niekam, nieką, niekuo, niekame'),
};

/** The fixture lexicon keyed by concept id, as `LanguageColumn` keys the column. */
export const LT_FIXTURES: Readonly<Record<string, Forms>> = {
  CAT: KATE, DOG: SUO, MOUSE: PELE, MAN: VYRAS, WOMAN: MOTERIS, CHILD: VAIKAS, BOY: BERNIUKAS, GIRL: MERGAITE,
  TEACHER: MOKYTOJAS, FRIEND: DRAUGAS, BROTHER: BROLIS, HOUSE: NAMAS, BOOK: KNYGA, FOOD: MAISTAS, WATER: VANDUO,
  KNIFE: PEILIS, STICK: LAZDA, LEGEND: LEGENDA, SCHOOL: MOKYKLA, WALL: SIENA, TABLE: STALAS, JOY: DZIAUGSMAS,
  PHRASE: FRAZE, CREATOR: KURĖJAS, MONEY: PINIGAI,
  EAT: VALGYTI, SEE: MATYTI, RUN: BEGTI, GO: EITI, GIVE: DUOTI, BE: BUTI_VERB, BECOME: TAPTI, HAVE: TURETI, LOVE: MYLETI,
  MUST: PRIVALETI, CAN: GALETI, WILL: NORETI, HELP_VERB: PADETI, WAIT: LAUKTI, THINK: GALVOTI, WASH: PRAUSTIS, LAUGH: JUOKTIS,
  SAY: SAKYTI, KNOW: ZINOTI, NEED: REIKETI,
  BIG: DIDELIS, SMALL: MAZAS, GOOD: GERAS, HAPPY: LAIMINGAS, WHITE: BALTAS, BEAUTIFUL: GRAZUS, SWEET: SALDUS, GREEN: ZALIAS,
  SEMANTIC: SEMANTINIS, LAST_FINAL: PASKUTINIS, OTHER: KITAS, UNTITLED: BE_PAVADINIMO, SAME: TAS_PATS,
  NEVER: NIEKADA, ALWAYS: VISADA, OFTEN: DAZNAI, FAST: GREITAI, ALREADY: JAU, NO_LONGER: JAU_NE,
  FIRST_PERSON: AS, SECOND_PERSON: TU, THIRD_PERSON: JIS, GENERIC_PERSON: GENERIC, SOMETHING: KAZKAS, SOMEONE: KAZKAS_PERSON,
};

/** A concept's resolved forms, as the translator hands them to the engine, with extra keys threaded on. */
export const cf = (conceptId: string, extra: Forms = {}): ConceptForms =>
  ({ conceptId, forms: { ...(LT_FIXTURES[conceptId] ?? {}), ...extra } });
