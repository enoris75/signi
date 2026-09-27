import type { LanguageColumn } from '../types.js';

type Forms = Record<string, string>;

/**
 * The four agreeing forms of a Vallader adjective, the regular ones spelled out by rule: the
 * feminine adds -a (grond → gronda), a participle in -à/-ü/-i takes -ada/-üda/-ida (chargià →
 * chargiada), and each plural adds -s to its singular (gronds, grondas). Any form given overrides.
 */
function adj(base: string, over: Forms = {}): Forms {
  const last = base.slice(-1);
  const fem = over.fem ?? ({ à: base.slice(0, -1) + 'ada', ü: base + 'da', ì: base.slice(0, -1) + 'ida' } as Forms)[last] ?? base + 'a';
  const masc_plural = over.masc_plural ?? (last === 'à' ? base.slice(0, -1) + 'ats' : last === 'ü' ? base + 'ts' : base + 's');
  return { base, fem, masc_plural, fem_plural: over.fem_plural ?? fem + 's', ...over };
}

/** An adjective whose form does not change (standard, zero, a prepositional phrase). */
const same = (base: string, over: Forms = {}): Forms => ({ base, fem: base, masc_plural: base, fem_plural: base, ...over });

/** -el / -er adjectives that lose the vowel before an ending: pussibel → pussibla. */
const syncope = (base: string, stem: string, over: Forms = {}): Forms => adj(base, { fem: stem + 'a', masc_plural: base + 's', fem_plural: stem + 'as', ...over });

// position 'pre': the few adjectives Vallader normally puts before the noun (ün bun di, üna bella
// chasa, il prüm di). Every placement (verify).
const PRE = { position: 'pre' };

export const RM_VALLADER_ADJECTIVES: LanguageColumn = {
  BIG: adj('grond', PRE),
  SMALL: syncope('pitschen', 'pitschn', PRE),
  HIGH: adj('ot'),
  LONG: adj('lung'),
  GREAT: adj('grond', PRE),
  LOW: adj('bass', { masc_plural: 'bass' }),
  NEAR: adj('dastrusch'),
  FAR: adj('lontan'),
  GOOD: adj('bun', { ...PRE, content_clause_mood: 'subjunctive' }),
  BAD: adj('nosch'),
  HAPPY: adj('cuntaint'),
  // "el sta bain": an adverb after BE_FARING, so it does not agree.
  OKAY: same('bain', { copula: 'BE_FARING' }),
  SAD: adj('trist'),
  OLD: adj('vegl', { ...PRE, fem: 'veglia', fem_plural: 'veglias' }),
  YOUNG: syncope('giuven', 'giuvn'),
  ELDER: adj('plü vegl', { fem: 'plü veglia', masc_plural: 'plü vegls', fem_plural: 'plü veglias' }),
  YOUNGER: adj('plü giuven', { fem: 'plü giuvna', masc_plural: 'plü giuvens', fem_plural: 'plü giuvnas' }),
  ADULT: adj('creschü'),
  MALE: adj('masculin'),
  FEMALE: adj('feminin'),
  CASTRATED: adj('chastrà'),
  NEW: adj('nouv'),
  BEAUTIFUL: adj('bel', { ...PRE, fem: 'bella' }),
  STRONG: adj('ferm'),
  WEAK: syncope('flaivel', 'flaivl'),
  TIRED: syncope('stanguel', 'stangl'), // (verify) stanguel, stangla
  HUNGRY: adj('fomantà'), // (verify) fomantà / affamà
  COLD: adj('fraid'),
  COLD_CLIMATE: adj('fraid'),
  // warm of feeling: cordial.
  WARM: adj('cordial'),
  HOT: adj('chod'),
  HOT_CLIMATE: adj('chod'),
  INTERESTING: adj('interessant'),
  IMPORTANT: adj('important'),
  QUICK: adj('svelt'),
  BROWN: adj('brün'),
  BLACK: adj('nair'),
  WHITE: adj('alv'),
  DARK: adj('s-chür'),
  WILD: adj('selvadi'), // (verify) selvadi, selvadia
  DOMESTIC: adj('domestic'),
  CANINE: adj('chanin'),
  LAZY: syncope('pigher', 'pigr'), // (verify)
  CAREFUL: adj('attent'),
  POSSIBLE: syncope('pussibel', 'pussibl', { content_clause_mood: 'subjunctive' }),
  ABLE: syncope('abel', 'abl', { infinitive_link: 'da' }),
  OBLIGED: adj('obligà', { infinitive_link: 'da' }),
  ALLOWED: adj('permiss', { masc_plural: 'permiss', infinitive_link: 'da' }),
  WHOLE: adj('inter'),
  ROUND: adj('radond'),
  SHARP: adj('agüz'),
  LOUD: adj('ferm'),
  WRITTEN: adj('scrit', { fem: 'scritta' }),
  LOADED: adj('chargià'),
  TIDY: adj('ordinà'),
  SAVED: adj('arcunà'),
  ADDED: adj('agiunt'),
  REMOVED: adj('allontanà'),
  FAILED: adj('fallà'),
  COPIED: adj('copchà'),
  LINKED: adj('collià'),
  PINNED: adj('fixà'),
  UNPINNED: adj('distachà'),
  RECENT: adj('recent'),
  NUMBERED: adj('numerà'),
  ACTIVE: adj('activ'),
  UNTITLED: same('sainza titel'),
  EMPTY: adj('vöd'),
  VALID: adj('valid'),
  MISSING: adj('mancant'),
  UNKNOWN: adj('incuntschaint'),
  KNOWN: adj('cuntschaint'),
  UNEXPECTED: adj('inaspettà'),
  SINGULAR: adj('singular'),
  PLURAL: adj('plural'),
  NEUTER: syncope('neuter', 'neutr'),
  DEFINITE: adj('definit'),
  INDEFINITE: adj('indefinit'),
  ZERO: same('zero'),
  PROXIMAL: adj('proximal'),
  DISTAL: adj('distal'),
  PARTITIVE: adj('partitiv'),
  NEGATIVE: adj('negativ'),
  MULTAL: adj('multal'),
  PAUCAL: adj('paucal'),
  UNIVERSAL: adj('universal'),
  DISTRIBUTIVE: adj('distributiv'),
  EXHAUSTIVE: adj('exhaustiv'),
  DUAL: adj('dual'),
  PROPORTIONAL: adj('proporziunal'),
  MULTIPLE: syncope('multipel', 'multipl'),
  SUFFICIENT: adj('suffizient'),
  APPROXIMATE: adj('approximativ'),
  SIMILATIVE: adj('similativ'),
  FIRST: adj('prüm', PRE),
  SECOND: adj('seguond', PRE),
  THIRD: adj('terz', PRE),
  NEXT: adj('seguaint'),
  PREVIOUS: adj('precedent'),
  LAST_FINAL: adj('ultim', PRE),
  // l'eivna passada.
  LAST_PREVIOUS: adj('passà'),
  NEXT_COMING: syncope('prossem', 'prossm', PRE),
  SAME: adj('listess', { ...PRE, masc_plural: 'listess', predicate_article: '1' }),
  DIFFERENT: adj('different'),
  SURE: adj('sgür'),
  REAL_EXISTING: adj('real'),
  REAL_GENUINE: adj('ver', { fem: 'vaira', fem_plural: 'vairas' }),
  AMERICAN: adj('american'),
  RIGHT_CORRECT: adj('güst', { content_clause_mood: 'subjunctive' }),
  RIGHT_SIDE: adj('dret', { fem: 'dretta' }),
  IMPERSONAL: adj('impersunal'),
  OTHER: adj('oter', { ...PRE, fem: 'otra', fem_plural: 'otras', after_pronoun: 'oter' }),
  OPPOSITE: adj('oppost'),
  MAIN: adj('principal'),
  CONDITIONAL: adj('condiziunal'),
  COORDINATED: adj('coordinà'),
  SUBORDINATE: adj('subordinà'),
  COPULATIVE: adj('copulativ'),
  DISJUNCTIVE: adj('disjunctiv'),
  ADVERSATIVE: adj('adversativ'),
  EXPLICATIVE: adj('explicativ'),
  CONCLUSIVE: adj('conclusiv'),
  TEMPORAL: adj('temporal'),
  SPATIAL: adj('spazial'),
  NATIONAL: adj('naziunal'),
  SOCIAL: adj('social'),
  POLITICAL: adj('politic'),
  PUBLIC: adj('public'),
  NEUTRAL: adj('neutral'),
  ACTIVE_VOICE: adj('activ'),
  PASSIVE: adj('passiv'),
  HUMBLE_GRAMMAR: adj('umil'),
  PROGRESSIVE: adj('progressiv'),
  PROSPECTIVE: adj('prospectiv'),
  RESULTATIVE: adj('resultativ'),
  POSITIVE: adj('positiv'),
  SEMANTIC: adj('semantic'),
  DIRECT: adj('direct'),
  INDIRECT: adj('indirect'),
  UNCONNECTED: same('sainza colliaziun'), // (verify)
  HIDDEN: adj('zoppà'),
  CLOSED: adj('serrà'),
  OPEN_ADJECTIVE: adj('avert'),
  VISIBLE: syncope('visibel', 'visibl'),
  SWEET: adj('dutsch'),
  SOLID: adj('solid'),
  PRESENT: adj('preschaint'),
  PAST: adj('passà'),
  FUTURE: adj('futur'),
  OWN_ADJECTIVE: syncope('agen', 'agn', PRE),
  SOLE: adj('unic'),
  STANDARD: same('standard'),
  MANIFOLD: adj('multiplic'), // (verify)
};
