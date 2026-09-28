/**
 * The Polish column's entry builders (P05, style-pl.md), shared by every role file so the keys come
 * out the same everywhere. A paradigm is written as one comma-separated string in a fixed case order,
 * which keeps a 13-form noun on one line and still lets a multiword noun (*język polski*) through.
 */

type Forms = Record<string, string>;

/** Splits a comma-separated paradigm, checking it has exactly `n` cells. */
function cells(list: string, n: number, what: string): string[] {
  const parts = list.split(',').map((s) => s.trim());
  if (parts.length !== n || parts.some((p) => p === '')) {
    throw new Error(`pl ${what}: expected ${n} forms, got ${parts.length} in "${list}"`);
  }
  return parts;
}

const SG_CASES = ['base', 'gen_sg', 'dat_sg', 'acc_sg', 'ins_sg', 'loc_sg', 'voc_sg'] as const;
const PL_CASES = ['plural', 'gen_pl', 'dat_pl', 'acc_pl', 'ins_pl', 'loc_pl'] as const;

/**
 * A noun. `sg` is the singular in the order nom, gen, dat, acc, ins, loc, voc; `pl` the plural in
 * the order nom, gen, dat, acc, ins, loc, or `undefined` for a noun with no plural (a mass noun).
 * `prefix` writes the same paradigm under other keys — `fem_` for a person or animal noun's
 * feminine (*kotka*), so `fem`, `fem_gen_sg`, …, `fem_plural`, `fem_gen_pl`, ….
 */
export function paradigm(sg: string, pl?: string, prefix = ''): Forms {
  const out: Forms = {};
  const key = (k: string) => (prefix === '' ? k : k === 'base' ? prefix.slice(0, -1) : `${prefix}${k}`);
  cells(sg, 7, 'singular').forEach((form, i) => { out[key(SG_CASES[i]!)] = form; });
  if (pl !== undefined) cells(pl, 6, 'plural').forEach((form, i) => { out[key(PL_CASES[i]!)] = form; });
  return out;
}

export type Gender = 'masc' | 'fem' | 'neut';

/**
 * A noun entry: `gender`, `count: 'singular'`, the paradigm, and `extra` (flags such as `virile`,
 * `animate_acc`, or a feminine written with `paradigm(…, …, 'fem_')`).
 */
export function noun(gender: Gender, sg: string, pl?: string, extra: Forms = {}): Forms {
  return { ...paradigm(sg, pl), gender, count: 'singular', ...extra };
}

/** Masculine inanimate: the accusative singular is the nominative (*dom → dom*). */
export const m = (sg: string, pl?: string, extra?: Forms) => noun('masc', sg, pl, extra);
/** Masculine animate (an animal): the accusative singular is the genitive (*pies → psa*). */
export const ma = (sg: string, pl?: string, extra?: Forms) => noun('masc', sg, pl, { animate_acc: '1', ...extra });
/**
 * Masculine personal (a man, a male role): accusative singular = genitive, and the plural is virile
 * (*chłopcy*, accusative *chłopców*; adjectives in *-i/-y* with the consonant change, *dobrzy*).
 */
export const mp = (sg: string, pl?: string, extra?: Forms) => noun('masc', sg, pl, { animate_acc: '1', virile: '1', ...extra });
/**
 * Masculine personal in *-a* (*mężczyzna, tata, twórca*): virile, but its own accusative is not the
 * genitive (*mężczyznę*), so no `animate_acc`. Its adjective still agrees animate (*dobrego tatę*).
 */
export const mv = (sg: string, pl?: string, extra?: Forms) => noun('masc', sg, pl, { virile: '1', ...extra });
/**
 * A plural-only noun (*pieniądze, drzwi, Niemcy*): the plural paradigm, and the same forms again in
 * every singular key (the vocative is `voc`, else the nominative), `plurale_tantum`, agreeing as a
 * non-virile plural (style-pl.md).
 */
export function pluraleTantum(pl: string, voc?: string, extra: Forms = {}): Forms {
  const [nom, gen, dat, acc, ins, loc] = cells(pl, 6, 'plurale tantum');
  return noun('masc', [nom, gen, dat, acc, ins, loc, voc ?? nom].join(', '), pl, { plurale_tantum: '1', ...extra });
}
/** An indeclinable noun (*kakao, menu*): the base in every singular cell. */
export const indeclinable = (gender: Gender, base: string, extra?: Forms) => noun(gender, Array(7).fill(base).join(', '), undefined, extra);
export const f = (sg: string, pl?: string, extra?: Forms) => noun('fem', sg, pl, extra);
export const n = (sg: string, pl?: string, extra?: Forms) => noun('neut', sg, pl, extra);

const PERSONS = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'] as const;

/** One aspect of a verb, as `verb` takes it. Every list is comma-separated. */
export interface AspectForms {
  /** The infinitive, with *się* for a reflexive verb (*stać się*). */
  inf: string;
  /**
   * The six persons 1sg … 3pl of the non-past: the present of an imperfective, the simple future of
   * a perfective. Bare, never with *się*.
   */
  nonpast: string;
  /** The *l*-participle: masc sg, fem sg, neut sg, virile pl, non-virile pl (*jadł, jadła, jadło, jedli, jadły*). */
  past: string;
  /**
   * The masculine stem the 1sg/2sg past endings attach to, only where it differs from the masc sg
   * (*mógł → mogł-em*, *niósł → niosł-em*, *szedł* keeps *szedł-em* and needs none).
   */
  pastStem?: string;
  /** 2sg, 1pl, 2pl imperative (*jedz, jedzmy, jedzcie*); omitted for a verb with none (*musieć*). */
  imperative?: string;
  /** The contemporary adverbial participle (*jedząc*); imperfective only. */
  adverbial?: string;
  /** The passive participle, masc sg and virile pl (*jedzony, jedzeni*); transitive verbs only. */
  passive?: string;
}

function aspect(a: AspectForms, prefix: '' | 'pf_', tense: 'present' | 'future'): Forms {
  const out: Forms = { [`${prefix}base`]: a.inf };
  cells(a.nonpast, 6, `${a.inf} non-past`).forEach((form, i) => { out[`${prefix}${PERSONS[i]}_${tense}`] = form; });
  const [masc, fem, neut, virile, nonvirile] = cells(a.past, 5, `${a.inf} past`);
  Object.assign(out, {
    [`${prefix}past_masc`]: masc, [`${prefix}past_fem`]: fem, [`${prefix}past_neut`]: neut,
    [`${prefix}past_virile`]: virile, [`${prefix}past_nonvirile`]: nonvirile,
  });
  if (a.pastStem) out[`${prefix}past_stem_masc`] = a.pastStem;
  if (a.imperative) {
    const [s2, p1, p2] = cells(a.imperative, 3, `${a.inf} imperative`);
    Object.assign(out, { [`${prefix}2sg_imperative`]: s2, [`${prefix}1pl_imperative`]: p1, [`${prefix}2pl_imperative`]: p2 });
  }
  if (a.adverbial) out[`${prefix}adverbial`] = a.adverbial;
  if (a.passive) {
    const [pm, pv] = cells(a.passive, 2, `${a.inf} passive`);
    Object.assign(out, { [`${prefix}passive`]: pm, [`${prefix}passive_virile`]: pv });
  }
  return out;
}

/**
 * A verb: its imperfective (unprefixed keys, the non-past stored as `{p}_present`) and, where it has
 * one, its perfective partner (`pf_` keys, the non-past stored as `pf_{p}_future`) — P05 D1. A verb
 * with no perfective (unpaired or biaspectual: *kochać*, *musieć*) passes `undefined`. A reflexive
 * verb passes `{ reflexive: '1' }` in `extra` and keeps *się* only on `inf`.
 */
export function verb(ipf: AspectForms, pf?: AspectForms, extra: Forms = {}): Forms {
  return { ...aspect(ipf, '', 'present'), ...(pf ? aspect(pf, 'pf_', 'future') : {}), ...extra };
}

/**
 * An adjective: `base` (masc nom sg, *dobry*), `virile` (the masculine-personal nominative plural,
 * *dobrzy*), and the synthetic comparative where Polish has one (*lepszy*; omitted → *bardziej*).
 * Everything else is declined by the engine from `base`.
 */
export function adj(base: string, virile: string, comparative?: string, extra: Forms = {}): Forms {
  return { base, virile, ...(comparative ? { comparative } : {}), ...extra };
}
