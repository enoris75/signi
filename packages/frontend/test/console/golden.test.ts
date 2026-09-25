// One golden entry per command of the catalogue (P02 §7): what a line using it does, how the result
// prints, and what the console says about the command's common misuse — by the diagnostic's code and
// what it names; diagnostics.test.ts holds each code's words. The last test fails the build when a
// command is added without an entry here.
import { describe, expect, it } from 'vitest';
import { COMMANDS } from '../../src/console/language/commands.ts';
import type { DiagnosticCode } from '../../src/console/language/diagnostics.ts';
import type { PhraseSelection } from '../../src/components/PhraseBuilder/interfaces.ts';
import type { WorkspaceState } from '../../src/console/language/types.ts';
import { ids_, ok, print, run, script, sel } from './helpers.ts';
import { workspaceToPlans } from '@signi/phrase/model/workspacePlan/functions/workspaceToPlans.ts';

interface Golden {
  line: string;
  /** What the first period holds after it, by concept id. */
  holds?: Record<string, unknown>;
  /** A check of its own, for what `holds` can't say. */
  check?: (state: WorkspaceState) => void;
  /** How the first period prints afterwards (the line itself when omitted and `holds` is given). */
  prints?: string;
  misuse?: { line: string; says: { code: DiagnosticCode; args?: Record<string, unknown> } };
}

const noun = (s: PhraseSelection) => ids_(s);

const GOLDEN: Record<string, Golden> = {
  subj: { line: '/subj cat', prints: '/subj ( cat )', holds: { subject: 'CAT' }, misuse: { line: '/subj frobnicate', says: { code: 'unknownWord', args: { text: 'frobnicate' } } } },
  verb: { line: '/verb eat', prints: '/verb ( eat )', holds: { verb: 'EAT' }, misuse: { line: '/verb can', says: { code: 'unknownWord', args: { text: 'can' } } } },
  obj: { line: '/verb eat /obj food', prints: '/verb ( eat ) /obj ( food )', holds: { directObject: 'FOOD' }, misuse: { line: '/verb run /obj food', says: { code: 'takesNoObject', args: { verb: 'run' } } } },
  pred: { line: '/verb seem /pred happy', prints: '/verb ( seem ) /pred ( happy )', holds: { predicative: 'HAPPY' }, misuse: { line: '/verb eat /pred happy', says: { code: 'takesNoComplement', args: { verb: 'eat', slot: 'predicative' } } } },
  term: { line: '/verb read /term child', prints: '/verb ( read ) /term ( child )', holds: { terminus: 'CHILD' }, misuse: { line: '/term child', says: { code: 'complementNeedsVerb', args: { command: 'term' } } } },
  manner: { line: '/verb run /manner care', prints: '/verb ( run ) /manner ( care )', holds: { manner: 'CARE' }, misuse: { line: '/verb eat /manner care', says: { code: 'takesNoComplement', args: { verb: 'eat', slot: 'manner' } } } },
  loc: { line: '/verb run /loc house', prints: '/verb ( run ) /loc ( house )', holds: { locative: 'HOUSE' }, misuse: { line: '/verb see /loc house', says: { code: 'takesNoComplement', args: { verb: 'see', slot: 'locative' } } } },
  dir: { line: '/verb run /dir house', prints: '/verb ( run ) /dir ( house )', holds: { direction: 'HOUSE' } },
  src: { line: '/verb run /src house', prints: '/verb ( run ) /src ( house )', holds: { source: 'HOUSE' } },
  route: { line: '/verb run /route house', prints: '/verb ( run ) /route ( house )', holds: { route: 'HOUSE' } },
  // P09-E12b. The temporal and the purpose go with a verb that licenses neither; the topic does not.
  time: { line: '/verb see /time day', prints: '/verb ( see ) /time ( day )', holds: { temporal: 'DAY' }, misuse: { line: '/time day', says: { code: 'complementNeedsVerb', args: { command: 'time' } } } },
  for: { line: '/verb read /for her', prints: '/verb ( read ) /for ( 3rd /fem )', holds: { purpose: 'THIRD_PERSON', purposeGender: 'fem' } },
  about: { line: '/verb think /about cat', prints: '/verb ( think ) /about ( cat )', holds: { topic: 'CAT' }, misuse: { line: '/verb run /about cat', says: { code: 'takesNoComplement', args: { verb: 'run', slot: 'topic' } } } },
  cause: { line: '/verb run /cause her', holds: { cause: 'THIRD_PERSON', causeGender: 'fem' }, prints: '/verb ( run ) /cause ( 3rd /fem )' },
  inst: {
    line: '/subj child /verb eat /inst ( /subj stick )',
    check: (s) => expect(s.links[0]).toMatchObject({ kind: 'instrumental', level: 'object' }),
    prints: '/subj ( child ) /verb ( eat ) /inst #2',
    misuse: { line: '/verb see /inst ( /subj stick )', says: { code: 'takesNoInstrument', args: { verb: 'see' } } },
  },
  adj: {
    line: '/subj creator /adj phrase /adj semantic',
    check: (s) => {
      expect(noun(sel(s))).toMatchObject({ subjectAdjective: 'PHRASE' });
      expect(sel(s).modifierAdjectives?.subjectAdjective?.id).toBe('SEMANTIC');
    },
    prints: '/subj ( creator /adj ( phrase /adj semantic ) )',
    misuse: { line: '/verb eat /adj brown', says: { code: 'noTarget', args: { command: 'adj', last: { word: 'eat', kind: 'verb' } } } },
  },
  adv: { line: '/verb eat /adv fast', prints: '/verb ( eat /adv fast )', holds: { modifier: 'FAST' }, misuse: { line: '/subj cat /adv fast', says: { code: 'noTarget', args: { command: 'adv', last: { word: 'cat', kind: 'noun' } } } } },
  modal: { line: '/verb eat /modal can /modal want', prints: '/verb ( eat /modal can /modal want )', holds: { verbModal: 'CAN', verbModal2: 'WILL' }, misuse: { line: '/command /verb eat /modal can', says: { code: 'noTarget', args: { command: 'modal' } } } },
  poss: {
    line: '/subj child /poss ( /subj man /adj old ) /pl',
    check: (s) => {
      expect(noun(sel(s))).toMatchObject({ subject: 'CHILD', subjectNumber: 'plural' });
      expect(noun(sel(s).subjectPossessor!)).toMatchObject({ subject: 'MAN', subjectAdjective: 'OLD' });
    },
    prints: '/subj ( child /pl /poss [ man /adj old ] )',
    misuse: { line: '/subj 1st /poss man', says: { code: 'noTarget', args: { command: 'poss', last: { kind: 'pronoun' } } } },
  },
  // The standard of comparison (P09-E12 D5): a phrase in the predicate adjective's bracket, after its
  // degree — or in a noun's, for its compared adjective (P09-E50, below). A pronoun takes no adjective,
  // so it is compared with nothing.
  than: {
    line: '/verb seem /pred big /more /than dog',
    check: (s) => expect(noun(sel(s).predicativeStandard!)).toMatchObject({ subject: 'DOG' }),
    prints: '/verb ( seem ) /pred ( big /more /than [ dog ] )',
    misuse: { line: '/subj 1st /than cat', says: { code: 'noTarget', args: { command: 'than', last: { kind: 'pronoun' } } } },
  },
  // The same field read as a superlative's set (P09-E51 D3): typed with either name, printed `/outof`
  // on `most` / `least`. A pronoun picks nothing out of a set.
  outof: {
    line: '/verb seem /pred big /most /than dog',
    check: (s) => expect(noun(sel(s).predicativeStandard!)).toMatchObject({ subject: 'DOG' }),
    prints: '/verb ( seem ) /pred ( big /most /outof [ dog ] )',
    misuse: { line: '/subj 1st /outof cat', says: { code: 'noTarget', args: { command: 'outof', last: { kind: 'pronoun' } } } },
  },
  // A noun's examples (P09-E48): a phrase in its bracket after its possessor, under its relation's
  // name. A pronoun names no set.
  suchas: {
    line: '/subj animal /zero /pl /suchas cat /verb run',
    check: (s) => {
      expect(noun(sel(s).subjectExamples!)).toMatchObject({ subject: 'CAT' });
      expect(sel(s).exampleRelations).toBeUndefined();
    },
    prints: '/subj ( animal /pl /zero /suchas [ cat ] ) /verb ( run )',
    misuse: { line: '/subj 1st /suchas cat', says: { code: 'noTarget', args: { command: 'suchas', last: { kind: 'pronoun' } } } },
  },
  including: {
    line: '/subj animal /pl /including ( /subj cat /poss man ) /verb run',
    check: (s) => {
      expect(noun(sel(s).subjectExamples!)).toMatchObject({ subject: 'CAT' });
      expect(sel(s).exampleRelations).toEqual({ subject: 'inclusion' });
    },
    prints: '/subj ( animal /pl /including [ cat /poss [ man ] ] ) /verb ( run )',
    misuse: { line: '/verb eat /obj 3rd /including cat', says: { code: 'noTarget', args: { command: 'including', last: { kind: 'pronoun' } } } },
  },
  and: {
    line: '/subj cat /and ( /subj dog /pl )',
    check: (s) => expect(noun(sel(s).subjectConjuncts![0]!)).toMatchObject({ subject: 'DOG', subjectNumber: 'plural' }),
    prints: '/subj ( cat /and [ dog /pl ] )',
    misuse: { line: '/verb eat /and dog', says: { code: 'noTarget', args: { command: 'and' } } },
  },
  or: { line: '/subj cat /or dog', prints: '/subj ( cat /or dog )', holds: { subjectConjunction: 'or' }, check: (s) => expect(sel(s).subjectConjuncts).toHaveLength(1) },
  // "both … and" (P09-E46): an "and" pair spelled with its correlative, printed where its /and goes.
  bothand: {
    line: '/subj cat /bothand dog',
    prints: '/subj ( cat /bothand dog )',
    check: (s) => expect(sel(s).correlatives).toEqual({ subject: true }),
    misuse: { line: '/verb eat /bothand dog', says: { code: 'noTarget', args: { command: 'bothand' } } },
  },
  sg: { line: '/subj cat /pl /sg', holds: { subjectNumber: 'singular' }, prints: '/subj ( cat )', misuse: { line: '/verb eat /sg', says: { code: 'noTarget', args: { command: 'sg' } } } },
  pl: { line: '/subj cat /pl', prints: '/subj ( cat /pl )', holds: { subjectNumber: 'plural' } },
  masc: { line: '/subj cat /fem /masc', holds: { subjectGender: 'masc' }, prints: '/subj ( cat )' },
  fem: { line: '/subj cat /fem', prints: '/subj ( cat /fem )', holds: { subjectGender: 'fem' }, misuse: { line: '/subj dog /fem', says: { code: 'noTarget', args: { command: 'fem' } } } },
  neut: { line: '/subj 3rd /neut', prints: '/subj ( 3rd /neut )', holds: { subjectGender: 'neut' }, misuse: { line: '/subj cat /neut', says: { code: 'noTarget', args: { command: 'neut' } } } },
  the: { line: '/subj cat /a /the', holds: { subjectDefiniteness: 'definite' }, prints: '/subj ( cat )', misuse: { line: '/subj 1st /the', says: { code: 'noTarget', args: { command: 'the' } } } },
  a: { line: '/subj cat /a', prints: '/subj ( cat /a )', holds: { subjectDefiniteness: 'indefinite' } },
  zero: { line: '/subj cat /zero', prints: '/subj ( cat /zero )', holds: { subjectDefiniteness: 'bare' } },
  this: { line: '/subj cat /this', prints: '/subj ( cat /this )', holds: { subjectDefiniteness: 'this' } },
  that: { line: '/subj cat /that', prints: '/subj ( cat /that )', holds: { subjectDefiniteness: 'that' } },
  some: { line: '/subj cat /some', prints: '/subj ( cat /some )', holds: { subjectDefiniteness: 'some' } },
  no: { line: '/subj cat /no', prints: '/subj ( cat /no )', holds: { subjectDefiniteness: 'no' } },
  many: { line: '/subj cat /many', prints: '/subj ( cat /many )', holds: { subjectDefiniteness: 'many' } },
  few: { line: '/subj cat /few', prints: '/subj ( cat /few )', holds: { subjectDefiniteness: 'few' } },
  all: { line: '/subj cat /all', prints: '/subj ( cat /all )', holds: { subjectDefiniteness: 'all' } },
  each: { line: '/subj cat /each', prints: '/subj ( cat /each )', holds: { subjectDefiniteness: 'each' } },
  every: { line: '/subj cat /every', prints: '/subj ( cat /every )', holds: { subjectDefiniteness: 'every' } },
  both: { line: '/subj cat /both', prints: '/subj ( cat /both )', holds: { subjectDefiniteness: 'both' } },
  mostof: { line: '/subj cat /mostof', prints: '/subj ( cat /mostof )', holds: { subjectDefiniteness: 'most' } },
  several: { line: '/subj cat /several', prints: '/subj ( cat /several )', holds: { subjectDefiniteness: 'several' } },
  enough: { line: '/subj cat /enough', prints: '/subj ( cat /enough )', holds: { subjectDefiniteness: 'enough' } },
  such: { line: '/subj cat /such', prints: '/subj ( cat /such )', holds: { subjectDefiniteness: 'such' } },
  rel: {
    line: '/subj child /rel subj ( /verb love /obj cat ) /verb read',
    check: (s) => expect(s.links[0]).toMatchObject({ source: { nounKey: 'subject' }, target: { nounKey: 'subject' } }),
    prints: '/subj ( child /rel #2.subj ) /verb ( read )',
    misuse: { line: '/subj child /verb read /rel #1.subj', says: { code: 'relativeSamePeriod' } },
  },
  // P13's two boxes: what the object is taken as or turned into, and the companion. The object
  // complement is the essive by default on a verb that does not license it, so `/factitive` is written.
  objpred: {
    line: '/verb eat /obj food /objpred cat',
    prints: '/verb ( eat ) /obj ( food ) /objpred ( cat )',
    holds: { objectPredicative: 'CAT' },
    misuse: { line: '/verb run /objpred cat', says: { code: 'takesNoComplement', args: { verb: 'run', slot: 'objectPredicative' } } },
  },
  with: { line: '/verb eat /with dog', prints: '/verb ( eat ) /with ( dog )', holds: { comitative: 'DOG' } },
  // P09-E44: the capacity one acts in, licensed (ACT); a verb that does not license it refuses it.
  role: {
    line: '/verb act /role friend /fem',
    prints: '/verb ( act ) /role ( friend /fem )',
    holds: { role: 'FRIEND', roleGender: 'fem' },
    misuse: { line: '/verb eat /role friend', says: { code: 'takesNoComplement', args: { verb: 'eat', slot: 'role' } } },
  },
  // P09-E45: the party the act is directed against, licensed (PLAY_GAME, WIN); a pronoun too.
  vs: {
    line: '/subj cat /verb play /vs dog',
    prints: '/subj ( cat ) /verb ( play ) /vs ( dog )',
    holds: { opponent: 'DOG' },
    misuse: { line: '/verb eat /vs dog', says: { code: 'takesNoComplement', args: { verb: 'eat', slot: 'opponent' } } },
  },
  // P09-E47: the period's interjection, printed first as it is spoken first; a noun is no interjection.
  interj: {
    line: '/subj cat /verb run /interj hey',
    prints: '/interj ( hey ) /subj ( cat ) /verb ( run )',
    holds: { interjection: 'HEY', subject: 'CAT' },
    misuse: { line: '/interj cat', says: { code: 'unknownWord', args: { text: 'cat' } } },
  },
  factitive: {
    line: '/verb eat /obj food /objpred cat /factitive',
    prints: '/verb ( eat ) /obj ( food ) /objpred ( cat /factitive )',
    holds: { objectPredicativePredication: 'factitive' },
  },
  essive: {
    line: '/verb eat /obj food /objpred cat /factitive /essive',
    prints: '/verb ( eat ) /obj ( food ) /objpred ( cat )',
    check: (s) => expect(sel(s)).not.toHaveProperty('objectPredicativePredication'),
  },
  // What a noun's genitive possessor is to it (P13), said after the possessor's bracket.
  whole: {
    line: '/subj house /poss cat /whole',
    prints: '/subj ( house /poss [ cat ] /whole )',
    check: (s) => expect(sel(s).possessorRoles).toEqual({ subject: 'whole' }),
    misuse: { line: '/subj house /whole', says: { code: 'noTarget', args: { command: 'whole' } } },
  },
  parts: {
    line: '/subj house /poss ( /subj cat /pl ) /parts',
    prints: '/subj ( house /poss [ cat /pl ] /parts )',
    check: (s) => expect(sel(s).possessorRoles).toEqual({ subject: 'parts' }),
  },
  owner: {
    line: '/subj house /poss cat /whole /owner',
    prints: '/subj ( house /poss [ cat ] )',
    check: (s) => expect(sel(s)).not.toHaveProperty('possessorRoles'),
  },
  // How a verbless period's subject reads (P13): a setting whose values have no command of their own.
  gloss: {
    line: '/subj speed /adj big /gloss manner',
    prints: '/subj ( speed /adj big /gloss manner )',
    holds: { subject: 'SPEED', subjectGloss: 'manner' },
    misuse: { line: '/verb eat /obj food /gloss manner', says: { code: 'noTarget', args: { command: 'gloss' } } },
  },
  // A demonstrative pointing away from the rest (P13): only on *this* or *that*.
  contrast: {
    line: '/subj house /that /contrast',
    prints: '/subj ( house /that /contrast )',
    check: (s) => expect(sel(s).contrastives).toEqual({ subject: true }),
    misuse: { line: '/subj house /contrast', says: { code: 'noTarget', args: { command: 'contrast' } } },
  },
  // A cardinal numeral counting a noun (P13), after its determiner; /del num takes it back.
  num: {
    line: '/subj cat /pl /num 12',
    prints: '/subj ( cat /pl /num 12 )',
    check: (s) => expect(sel(s).numerals).toEqual({ subject: 12 }),
    misuse: { line: '/subj cat /num many', says: { code: 'numeralNotANumber' } },
  },
  // An approximator on the quantity (P09-E49), printed after /num; its word is the quantity's own.
  approx: {
    line: '/subj cat /pl /num 5 /approx',
    prints: '/subj ( cat /pl /num 5 /approx )',
    check: (s) => expect(sel(s).approximators).toEqual({ subject: true }),
    misuse: { line: '/subj cat /some /approx', says: { code: 'noTarget', args: { command: 'approx' } } },
  },
  // The relative clause said alone, its head unspoken (P13) — on the link, as /without is.
  headless: {
    line: '/subj child /rel subj ( /verb love /obj cat ) /headless',
    check: (s) => expect(s.links[0]).toMatchObject({ source: { nounKey: 'subject' }, headless: true }),
    prints: '/subj ( child /rel #2.subj /headless )',
    misuse: { line: '/subj child /verb read /headless', says: { code: 'noRelativeLink' } },
  },
  // The direction's plain goal (P13), which its path relations leave: "runs into the house" and back.
  goal: {
    line: '/verb run /dir house /in /goal',
    prints: '/verb ( run ) /dir ( house )',
    check: (s) => expect(sel(s)).not.toHaveProperty('directionSpecifier'),
    misuse: { line: '/verb run /loc house /goal', says: { code: 'noTarget', args: { command: 'goal' } } },
  },
  // …and a direction takes the path relations the place and the route do: "runs into the house".
  in: { line: '/verb run /route house /in', prints: '/verb ( run ) /route ( house /in )', holds: { routeSpecifier: 'in' } },
  through: { line: '/verb run /loc house /through', prints: '/verb ( run ) /loc ( house /through )', holds: { locativeSpecifier: 'through' } },
  under: { line: '/verb run /loc house /under', prints: '/verb ( run ) /loc ( house /under )', holds: { locativeSpecifier: 'under' }, misuse: { line: '/verb run /src house /under', says: { code: 'noTarget', args: { command: 'under' } } } },
  over: { line: '/verb run /loc house /over', prints: '/verb ( run ) /loc ( house /over )', holds: { locativeSpecifier: 'over' } },
  around: { line: '/verb run /route house /around', prints: '/verb ( run ) /route ( house /around )', holds: { routeSpecifier: 'around' } },
  behind: { line: '/verb run /loc house /behind', prints: '/verb ( run ) /loc ( house /behind )', holds: { locativeSpecifier: 'behind' } },
  front: { line: '/verb run /loc house /front', prints: '/verb ( run ) /loc ( house /front )', holds: { locativeSpecifier: 'in_front_of' } },
  // P09-E1.
  on: { line: '/verb run /loc house /on', prints: '/verb ( run ) /loc ( house /on )', holds: { locativeSpecifier: 'on' } },
  between: { line: '/verb run /loc ( house /and dog /between )', prints: '/verb ( run ) /loc ( house /between /and dog )', holds: { locativeSpecifier: 'between' } },
  against: { line: '/verb run /route house /against', prints: '/verb ( run ) /route ( house /against )', holds: { routeSpecifier: 'against' } },
  // P09-E32.
  among: { line: '/verb run /loc house /pl /among', prints: '/verb ( run ) /loc ( house /pl /among )', holds: { locativeSpecifier: 'among' } },
  // P09-E12b: the temporal's relations, `at` its default and so never printed.
  at: { line: '/verb run /time day /ago /at', prints: '/verb ( run ) /time ( day )', holds: { temporalRelation: 'at' } },
  ago: { line: '/verb run /time moment /a /ago', prints: '/verb ( run ) /time ( moment /a /ago )', holds: { temporalRelation: 'ago' }, misuse: { line: '/verb run /loc house /ago', says: { code: 'noTarget', args: { command: 'ago' } } } },
  until: { line: '/verb run /time night /until', prints: '/verb ( run ) /time ( night /until )', holds: { temporalRelation: 'until' } },
  after: { line: '/verb run /time night /after', prints: '/verb ( run ) /time ( night /after )', holds: { temporalRelation: 'after' } },
  before: { line: '/verb run /time night /before', prints: '/verb ( run ) /time ( night /before )', holds: { temporalRelation: 'before' } },
  during: { line: '/verb run /time day /during', prints: '/verb ( run ) /time ( day /during )', holds: { temporalRelation: 'during' } },
  // P09-E20: the time's `between`, named apart from the place's `/between`, since a command has one name.
  span: { line: '/verb run /time ( day /and night /span )', prints: '/verb ( run ) /time ( day /span /and night )', holds: { temporalRelation: 'between' }, misuse: { line: '/verb run /loc house /span', says: { code: 'noTarget', args: { command: 'span' } } } },
  // P09-E27: the time's `since`, free as a command name.
  since: { line: '/verb run /time day /since', prints: '/verb ( run ) /time ( day /since )', holds: { temporalRelation: 'since' }, misuse: { line: '/verb run /loc house /since', says: { code: 'noTarget', args: { command: 'since' } } } },
  // P09-E34: the deadline, free as a command name.
  within: { line: '/verb run /time day /within', prints: '/verb ( run ) /time ( day /within )', holds: { temporalRelation: 'within' } },
  // P09-E35: the duration, named apart from the purpose's `/for`, since a command has one name.
  lasting: { line: '/verb run /time day /lasting', prints: '/verb ( run ) /time ( day /lasting )', holds: { temporalRelation: 'for' }, misuse: { line: '/verb run /loc house /lasting', says: { code: 'noTarget', args: { command: 'lasting' } } } },
  because: { line: '/verb run /cause dog /thanks /because', holds: { causeSentiment: 'neutral' }, prints: '/verb ( run ) /cause ( dog )' },
  fault: { line: '/verb run /cause dog /fault', prints: '/verb ( run ) /cause ( dog /fault )', holds: { causeSentiment: 'negative' } },
  thanks: { line: '/verb run /cause dog /thanks', prints: '/verb ( run ) /cause ( dog /thanks )', holds: { causeSentiment: 'positive' }, misuse: { line: '/subj cat /thanks', says: { code: 'noTarget', args: { command: 'thanks' } } } },
  notcause: { line: '/verb run /cause dog /notcause', prints: '/verb ( run ) /cause ( dog /notcause )', holds: { causeNegative: true }, misuse: { line: '/subj cat /notcause', says: { code: 'noTarget', args: { command: 'notcause' } } } },
  poscause: { line: '/verb run /cause dog /notcause /poscause', prints: '/verb ( run ) /cause ( dog )', holds: { causeNegative: false } },
  tense: {
    line: '/verb eat /tense past',
    holds: { verbTense: 'past' },
    prints: '/verb ( eat /past )',
    misuse: { line: '/verb eat /tense soon', says: { code: 'valueNotTaken', args: { command: 'tense', values: ['past', 'present', 'future'], given: 'soon' } } },
  },
  aspect: {
    line: '/verb eat /aspect prospective',
    holds: { verbAspect: 'prospective' },
    prints: '/verb ( eat /prosp )',
    misuse: { line: '/subj cat /aspect progressive', says: { code: 'noTarget', args: { command: 'aspect' } } },
  },
  present: { line: '/verb eat /past /present', holds: { verbTense: 'present' }, prints: '/verb ( eat )' },
  past: { line: '/verb eat /past', prints: '/verb ( eat /past )', holds: { verbTense: 'past' }, misuse: { line: '/command /verb eat /past', says: { code: 'noTarget', args: { command: 'past' } } } },
  future: { line: '/verb eat /future', prints: '/verb ( eat /future )', holds: { verbTense: 'future' } },
  neutral: { line: '/verb eat /prog /neutral', holds: { verbAspect: 'neutral' }, prints: '/verb ( eat )' },
  prog: { line: '/verb eat /prog', prints: '/verb ( eat /prog )', holds: { verbAspect: 'progressive' } },
  prosp: { line: '/verb eat /prosp', prints: '/verb ( eat /prosp )', holds: { verbAspect: 'prospective' } },
  result: { line: '/verb eat /result', prints: '/verb ( eat /result )', holds: { verbAspect: 'resultative' } },
  voice: {
    line: '/verb eat /voice passive /obj food',
    holds: { verbVoice: 'passive' },
    prints: '/verb ( eat /passive ) /obj ( food )',
    misuse: { line: '/verb run /voice passive', says: { code: 'noTarget', args: { command: 'voice' } } },
  },
  active: { line: '/verb eat /passive /active /obj food', holds: { verbVoice: 'active' }, prints: '/verb ( eat ) /obj ( food )' },
  passive: { line: '/verb eat /passive /obj food', prints: '/verb ( eat /passive ) /obj ( food )', holds: { verbVoice: 'passive' } },
  not: { line: '/verb eat /not', prints: '/verb ( eat /not )', holds: { verbNegative: true }, misuse: { line: '/subj cat /not', says: { code: 'noTarget', args: { command: 'not' } } } },
  pos: { line: '/verb eat /not /pos', holds: { verbNegative: false }, prints: '/verb ( eat )' },
  more: { line: '/subj cat /adj big /more', prints: '/subj ( cat /adj ( big /more ) )', check: (s) => expect(sel(s).adjectiveDegrees?.subjectAdjective).toBe('more'), misuse: { line: '/subj cat /more', says: { code: 'noTarget', args: { command: 'more', last: { word: 'cat', kind: 'noun' } } } } },
  most: { line: '/verb seem /pred happy /most', prints: '/verb ( seem ) /pred ( happy /most )', check: (s) => expect(sel(s).adjectiveDegrees?.predicative).toBe('most') },
  less: { line: '/subj cat /adj big /less', prints: '/subj ( cat /adj ( big /less ) )', check: (s) => expect(sel(s).adjectiveDegrees?.subjectAdjective).toBe('less') },
  least: { line: '/subj cat /adj big /least', prints: '/subj ( cat /adj ( big /least ) )', check: (s) => expect(sel(s).adjectiveDegrees?.subjectAdjective).toBe('least') },
  equally: { line: '/subj cat /adj big /equally', prints: '/subj ( cat /adj ( big /equally ) )', check: (s) => expect(sel(s).adjectiveDegrees?.subjectAdjective).toBe('equally') },
  plain: { line: '/subj cat /adj big /more /plain', check: (s) => expect(sel(s).adjectiveDegrees?.subjectAdjective).toBe('positive'), prints: '/subj ( cat /adj big )' },
  feature: { line: '/subj creator /adj sail /purpose /feature', check: (s) => expect(sel(s).modifierRelations?.subjectAdjective).toBe('feature'), prints: '/subj ( creator /adj sail )' },
  purpose: { line: '/subj creator /adj sail /purpose', prints: '/subj ( creator /adj ( sail /purpose ) )', check: (s) => expect(sel(s).modifierRelations?.subjectAdjective).toBe('purpose') },
  material: {
    line: '/subj creator /adj sail /material', prints: '/subj ( creator /adj ( sail /material ) )',
    check: (s) => expect(sel(s).modifierRelations?.subjectAdjective).toBe('material'),
    misuse: { line: '/subj cat /adj big /material', says: { code: 'noTarget', args: { command: 'material', last: { kind: 'adjective' } } } },
  },
  domain: {
    line: '/subj cat /adj house /domain', prints: '/subj ( cat /adj ( house /domain ) )',
    check: (s) => expect(sel(s).modifierRelations?.subjectAdjective).toBe('domain'),
    misuse: { line: '/subj cat /adj big /domain', says: { code: 'noTarget', args: { command: 'domain', last: { kind: 'adjective' } } } },
  },
  new: { line: '/subj cat /new /subj dog', check: (s) => expect(s.containers.map((c) => c.selection.subject?.id)).toEqual(['CAT', 'DOG']), prints: '/subj ( cat )' },
  command: {
    line: '/command lets instruction /verb run', prints: '/command lets instruction /verb ( run )',
    holds: { imperative: true, imperativePerson: '1pl', imperativeRegister: 'instruction' },
    misuse: { line: '/command soon', says: { code: 'valueNotTaken', args: { command: 'command', given: 'soon' } } },
  },
  inf: { line: '/inf /verb eat', prints: '/inf /verb ( eat )', holds: { infinitive: true } },
  // The question, its gap and the existential (P09-E12 M5–M7).
  ask: {
    line: '/ask /subj cat /verb eat', prints: '/ask /subj ( cat ) /verb ( eat )', holds: { interrogative: true },
    misuse: { line: '/subj ( cat /ask )', says: { code: 'periodCommandInBracket', args: { command: 'ask' } } },
  },
  wh: {
    line: '/wh obj who /subj cat /verb eat', prints: '/wh obj who /subj ( cat ) /verb ( eat )',
    holds: { interrogative: true, questionRole: 'directObject', questionAnimate: true },
    misuse: { line: '/wh who', says: { code: 'setNeedsValue', args: { command: 'wh' } } },
  },
  there: {
    line: '/there /subj cat /verb be /loc house', prints: '/there /subj ( cat ) /verb ( be ) /loc ( house )',
    holds: { existential: true },
    misuse: { line: '/subj cat /del there', says: { code: 'nothingToRemove' } },
  },
  statement: { line: '/command /verb eat /statement', holds: { imperative: false }, prints: '/verb ( eat )' },
  if: {
    line: '/subj dog /verb run /if ( /subj cat /verb eat )',
    check: (s) => expect(s.links[0]).toMatchObject({ kind: 'conditional' }),
    prints: '/subj ( dog ) /verb ( run ) /if #2',
    misuse: { line: '/command /verb run /if ( /subj cat /verb eat )', says: { code: 'cantTakeCondition' } },
  },
  join: {
    line: '/subj dog /verb run /join but ( /subj cat /verb eat )',
    check: (s) => expect(s.links[0]).toMatchObject({ kind: 'coordinative', conjunction: 'but' }),
    prints: '/subj ( dog ) /verb ( run ) /join but #2',
    misuse: { line: '/command /verb run /join therefore ( /verb eat )', says: { code: 'imperativeJoin' } },
  },
  // The subordinate clauses (P09-E12 D9): the object clause of a verb that takes one, an adverbial
  // clause on any verb, and the infinitive complement, whose period is drawn in the infinitive mood.
  clause: {
    line: '/subj man /verb say /clause ( /subj cat /verb run )',
    check: (s) => expect(s.links[0]).toMatchObject({ kind: 'content' }),
    prints: '/subj ( man ) /verb ( say ) /clause #2',
    misuse: { line: '/subj man /verb run /clause ( /subj cat /verb eat )', says: { code: 'takesNoContentClause', args: { verb: 'run' } } },
  },
  sub: {
    line: '/subj man /verb run /sub because ( /subj cat /verb eat )',
    check: (s) => expect(s.links[0]).toMatchObject({ kind: 'adverbial', conjunction: 'because' }),
    prints: '/subj ( man ) /verb ( run ) /sub because #2',
    misuse: { line: '/subj man /verb run /sub soon ( /subj cat /verb eat )', says: { code: 'subTakes' } },
  },
  to: {
    line: '/subj cat /verb need /to ( /verb run )',
    check: (s) => {
      expect(s.links[0]).toMatchObject({ kind: 'infinitive' });
      expect(s.containers[1]!.selection.infinitive).toBe(true);
    },
    prints: '/subj ( cat ) /verb ( need ) /to #2',
    misuse: { line: '/subj cat /verb say /to ( /verb run )', says: { code: 'takesNoInfinitive', args: { verb: 'say' } } },
  },
  level: {
    line: '/subj child /verb start /inst ( /verb choose /obj word ) /level process',
    check: (s) => expect(s.links[0]).toMatchObject({ kind: 'instrumental', level: 'process' }),
    prints: '/subj ( child ) /verb ( start ) /inst #2 /level process',
    misuse: { line: '/verb eat /level process', says: { code: 'noInstrumentLink' } },
  },
  // The instrument denied — the privative, "eats without the stick" (P09-E2) — on the link, as the
  // level is. Said on the clause, or on the line that makes the link.
  without: {
    line: '/subj child /verb eat /inst ( /subj stick ) /without',
    check: (s) => expect(s.links[0]).toMatchObject({ kind: 'instrumental', level: 'object', negative: true }),
    prints: '/subj ( child ) /verb ( eat ) /inst #2 /without',
    misuse: { line: '/verb eat /without', says: { code: 'noInstrumentLink' } },
  },
  // Whose the infinitive is (P13): the object's, a causee's — on the link, as /without is.
  objctl: {
    line: '/subj cat /verb need /obj dog /to ( /verb run ) /objctl',
    check: (s) => expect(s.links[0]).toMatchObject({ kind: 'infinitive', control: 'object' }),
    prints: '/subj ( cat ) /verb ( need ) /obj ( dog ) /to #2 /objctl',
    misuse: { line: '/verb need /objctl', says: { code: 'noInfinitiveLink' } },
  },
  subjctl: {
    line: '/subj cat /verb need /obj dog /to ( /verb run ) /objctl /subjctl',
    check: (s) => expect(s.links[0]).not.toHaveProperty('control'),
    prints: '/subj ( cat ) /verb ( need ) /obj ( dog ) /to #2',
  },
  // A clause of purpose (P13), what the act is for — any verb has one, drawn in the infinitive.
  so: {
    line: '/subj cat /verb eat /obj food /so ( /verb run )',
    check: (s) => {
      expect(s.links[0]).toMatchObject({ kind: 'purpose' });
      expect(s.containers[1]!.selection.infinitive).toBe(true);
    },
    prints: '/subj ( cat ) /verb ( eat ) /obj ( food ) /so #2',
    misuse: { line: '/subj cat /so ( /verb run )', says: { code: 'subordinateNeedsVerb' } },
  },
  posinst: {
    line: '/subj child /verb eat /inst ( /subj stick ) /without /posinst',
    check: (s) => expect(s.links[0]).not.toHaveProperty('negative'),
    prints: '/subj ( child ) /verb ( eat ) /inst #2',
  },
  del: {
    line: '/subj cat /adj brown /adj big /del adj 2',
    check: (s) => {
      expect(sel(s).subjectAdjective?.id).toBe('BROWN');
      expect(sel(s).subjectAdjective2).toBeUndefined();
    },
    prints: '/subj ( cat /adj brown )',
    misuse: { line: '/del everything', says: { code: 'unknownRemoval', args: { what: 'everything' } } },
  },
  // The app's own commands are effects the console runs, not edits of the phrase.
  edit: { line: '/edit', check: () => expect(run('/edit').effects).toEqual([expect.objectContaining({ app: 'edit' })]), prints: '' },
  save: { line: '/save my cats', check: () => expect(run('/save my cats').effects).toEqual([expect.objectContaining({ app: 'save', arg: 'my cats' })]), prints: '' },
  define: { line: '/define cat', check: () => expect(run('/define cat').effects[0]).toMatchObject({ app: 'define', arg: 'cat' }), prints: '' },
  load: { line: '/load my cats', check: () => expect(run('/load my cats').effects[0]).toMatchObject({ app: 'load', arg: 'my cats' }), prints: '' },
  export: { line: '/export', check: () => expect(run('/export').effects[0]).toMatchObject({ app: 'export' }), prints: '' },
  import: { line: '/import', check: () => expect(run('/import').effects[0]).toMatchObject({ app: 'import' }), prints: '' },
  lang: { line: '/lang it', check: () => expect(run('/lang it').effects[0]).toMatchObject({ app: 'lang', arg: 'it' }), prints: '', misuse: { line: '/lang xx', says: { code: 'valueNotTaken', args: { command: 'lang', given: 'xx' } } } },
  undo: { line: '/undo', check: () => expect(run('/undo').effects[0]).toMatchObject({ app: 'undo' }), prints: '' },
  redo: { line: '/redo', check: () => expect(run('/redo').effects[0]).toMatchObject({ app: 'redo' }), prints: '' },
  words: { line: '/words', check: () => expect(run('/words').effects[0]).toMatchObject({ app: 'words' }), prints: '' },
  help: { line: '/help pl', check: () => expect(run('/help pl').effects[0]).toMatchObject({ app: 'help', arg: 'pl' }), prints: '' },
  pin: { line: '/subj cat /pin', holds: { subject: 'CAT' }, check: () => expect(run('/subj cat /pin').effects[0]).toMatchObject({ app: 'pin' }), prints: '/subj ( cat )' },
  unpin: { line: '/unpin', check: () => expect(run('/unpin').effects[0]).toMatchObject({ app: 'unpin' }), prints: '' },
};

describe('every command', () => {
  for (const [name, g] of Object.entries(GOLDEN)) {
    describe(`/${name}`, () => {
      it(`applies “${g.line}”`, () => {
        const state = ok(g.line);
        if (g.holds) expect(noun(sel(state))).toMatchObject(g.holds);
        g.check?.(state);
        expect(print(state)).toBe(g.prints ?? g.line);
      });
      if (g.misuse) {
        it(`says what is wrong with “${g.misuse.line}”`, () => {
          expect(run(g.misuse!.line).diagnostic).toMatchObject(g.misuse!.says);
        });
      }
    });
  }

  it('has a golden entry for every command of the catalogue', () => {
    expect(Object.keys(GOLDEN).sort()).toEqual(COMMANDS.map((c) => c.name).sort());
  });
});

// P09-E49: the other reading of /approx, and /del approx.
describe('/approx on a determiner', () => {
  it('says almost on all, and /del approx takes it back', () => {
    const state = ok('/subj cat /pl /all /approx');
    expect(sel(state).approximators).toEqual({ subject: true });
    expect(print(state)).toBe('/subj ( cat /pl /all /approx )');
    expect(sel(ok('/subj cat /pl /all /approx /del approx'))).not.toHaveProperty('approximators');
  });

  it('goes with a quantity that takes none any more', () => {
    expect(sel(ok('/subj cat /pl /all /approx /some'))).not.toHaveProperty('approximators');
  });
});

// P09-E46: the correlative spells a pair alone. A third conjunct drops it, as the chip does, so the line
// reads back plain — whichever of the two conjuncts carried it.
describe('/bothand past a pair', () => {
  it.each(['/subj cat /bothand dog /and man', '/subj cat /and dog /bothand man'])('reads “%s” back as a plain and', (line) => {
    const state = ok(line);
    expect(sel(state)).not.toHaveProperty('correlatives');
    expect(print(state)).toBe('/subj ( cat /and dog /and man )');
  });

  it('is dropped by /or, which the pair no longer spells', () => {
    expect(sel(ok('/subj cat /bothand dog /del and /or dog'))).not.toHaveProperty('correlatives');
  });
});

// P09-E44 D3: a role's conjuncts are nouns, as its head is — a pronoun in the group would drop the whole
// role ("the man acts."). The opponent's take a pronoun, which renders ("against the dog and him").
describe('a complement’s conjuncts', () => {
  it('refuses a pronoun beside the role, and takes a noun', () => {
    expect(run('/verb act /role ( friend /and he )').diagnostic).toMatchObject({ code: 'unknownWord', args: { text: 'he' } });
    expect(print(ok('/verb act /role ( friend /and man )'))).toBe('/verb ( act ) /role ( friend /and man )');
  });

  it('takes a pronoun beside the opponent', () => {
    expect(run('/verb play /vs ( dog /and he )').diagnostic).toBeUndefined();
  });
});

// P09-E48 D4: either relation's examples go with `/del eg`, and the reference step `eg` reaches them.
describe('the examples', () => {
  it('are removed by /del eg, whichever relation', () => {
    const state = ok('/subj animal /pl /including cat /verb run /del eg');
    expect(sel(state).subjectExamples).toBeUndefined();
    expect(sel(state).exampleRelations).toBeUndefined();
    expect(run('/subj cat /del eg').diagnostic).toMatchObject({ code: 'noExamplesToRemove' });
  });

  it('head a relative clause of their own, printed inside their bracket', () => {
    const state = ok('/subj animal /pl /suchas ( /subj cat /rel obj ( /subj man /verb see ) ) /verb run');
    expect(state.links[0]).toMatchObject({ source: { nounKey: 'subject/examples' } });
    expect(print(state)).toBe('/subj ( animal /pl /suchas [ cat /rel #2.obj ] ) /verb ( run )');
  });
});

// P09-E50 D5: a noun's standard, for its compared adjective, printed in the noun's bracket after its
// adjectives and before its possessor. /than skips the adjective, which takes none, for its noun.
describe('the attributive standard', () => {
  it('applies to the object through its compared adjective', () => {
    const state = ok('/verb see /obj cat /adj big /more /than dog');
    expect(noun(sel(state).directObjectStandard!)).toMatchObject({ subject: 'DOG' });
    expect(print(state)).toBe('/verb ( see ) /obj ( cat /adj ( big /more ) /than [ dog ] )');
  });

  it('prints before the possessor, and is kept while no adjective compares', () => {
    const line = '/verb see /obj ( cat /adj big /than [ dog ] /poss [ woman ] )';
    const state = ok(line);
    expect(print(state)).toBe('/verb ( see ) /obj ( cat /adj big /than [ dog ] /poss [ woman ] )');
  });

  it('takes a predicate noun too, and refuses a hosted noun', () => {
    expect(print(ok('/verb seem /pred dog /adj big /more /than cat'))).toBe('/verb ( seem ) /pred ( dog /adj ( big /more ) /than [ cat ] )');
    expect(run('/subj cat /poss ( /subj woman /than dog )').diagnostic).toMatchObject({ code: 'noTarget', args: { command: 'than' } });
  });
});

// P09-E12: a subordinate clause has no mood of its own, the question's included — it would be spoken
// inside the clause ("says that does the cat run") — so the question is locked on it as the other two
// moods are, by /ask and by /wh alike; the clause that governs it may still ask ("does the man say
// that the cat runs?"). Not on the clause of a verb that reports a question (P09-E55, below), so BELIEVE.
describe('the question on a subordinate clause', () => {
  const linked = () => ok('/subj man /verb believe /clause ( /subj cat /verb run )');

  it.each(['/ask', '/wh subj', '/command'])('is locked on the clause: %s', (line) => {
    const state = linked();
    expect(run(line, { state, context: { containerId: state.containers[1]!.id } }).diagnostic).toMatchObject({ code: 'moodLocked' });
  });

  it('is free on the clause that governs it', () => {
    expect(sel(ok('/ask', { state: linked() })).interrogative).toBe(true);
    expect(sel(ok('/wh subj who', { state: linked() }))).toMatchObject({ interrogative: true, questionRole: 'subject' });
  });
});

// P09-E53: the complements that keep their relation, and an empty asked box's relation on /wh (D5).
describe('the question over a marked relation', () => {
  it.each<[string, string, Record<string, unknown>]>([
    ['/wh with who /subj cat /verb run', '/wh with who /subj ( cat ) /verb ( run )', { questionRole: 'comitative', questionAnimate: true }],
    ['/wh loc under /subj cat /verb eat', '/wh loc under /subj ( cat ) /verb ( eat )', { questionRole: 'locative', locativeSpecifier: 'under' }],
    ['/wh cause thanks who /subj cat /verb run', '/wh cause who thanks /subj ( cat ) /verb ( run )', { questionRole: 'cause', causeSentiment: 'positive', questionAnimate: true }],
    ['/wh time until /subj cat /verb eat', '/wh time until /subj ( cat ) /verb ( eat )', { questionRole: 'temporal', temporalRelation: 'until' }],
    ['/wh dir goal /subj cat /verb run', '/wh dir /subj ( cat ) /verb ( run )', { questionRole: 'direction' }],
    ['/wh src /subj cat /verb run', '/wh src /subj ( cat ) /verb ( run )', { questionRole: 'source' }],
  ])('%s', (line, prints, holds) => {
    const state = ok(line);
    expect(sel(state)).toMatchObject({ interrogative: true, ...holds });
    expect(print(state)).toBe(prints);
  });

  it('says the relation in the bracket of a box that holds a word, and on /wh only when it is empty', () => {
    expect(print(ok('/wh loc /subj cat /verb eat /loc ( house /under )'))).toBe('/wh loc /subj ( cat ) /verb ( eat ) /loc ( house /under )');
  });

  it('refuses a relation the asked box has not', () => {
    expect(run('/wh with under').diagnostic).toMatchObject({ code: 'valueNotTaken', args: { command: 'wh', given: 'under', values: [] } });
    expect(run('/wh time under').diagnostic).toMatchObject({ code: 'valueNotTaken', args: { command: 'wh', given: 'under' } });
    expect(run('/wh loc under thanks').diagnostic).toMatchObject({ code: 'valueAlreadyGiven' });
  });
});

// P09-E54: the passive question needs no new word — /passive on the verb and /wh on the period.
describe('the passive question', () => {
  it('asks the patient of a passive: "what is eaten by the cat?"', () => {
    const state = ok('/subj cat /verb ( eat /passive ) /wh obj');
    expect(sel(state)).toMatchObject({ interrogative: true, questionRole: 'directObject', verbVoice: 'passive' });
    expect(print(state)).toBe('/wh obj /subj ( cat ) /verb ( eat /passive )');
    expect(print(ok(print(state)))).toBe(print(state));
  });
});

// P11-E7 D6: `/poss #n.subj` keeps its syntax and means the link to the clause's subject wherever the
// clause allows one — also where no box holds the subject: a command's addressee, an infinitive's
// controller.
describe('a pointer at the clause’s subject', () => {
  const LINK = { kind: 'coreferent', slot: 'subject' };
  const plans = (state: WorkspaceState) => workspaceToPlans(state.containers, state.links).map((p) => p.plan);

  it.each<[string, string]>([
    ['/subj woman /verb see /obj ( book /poss #1.subj )', '/subj ( woman ) /verb ( see ) /obj ( book /poss #1.subj )'],
    ['/command /verb see /obj ( book /poss #1.subj )', '/command /verb ( see ) /obj ( book /poss #1.subj )'],
  ])('%s: prints itself, and plans the link', (line, prints) => {
    const state = ok(line);
    expect(print(state)).toBe(prints);
    expect(print(ok(prints))).toBe(prints);
    expect(plans(state)[0]!.directObject).toMatchObject({ possessor: LINK });
  });

  it('links a purpose clause’s owner to the controller no box holds', () => {
    const state = ok('/subj man /verb run /so ( /verb see /obj ( mother /poss #2.subj ) )');
    expect(plans(state)[0]!.purpose).toMatchObject({ directObject: { possessor: LINK } });
    expect(script(ok(script(state)))).toBe(script(state));
  });

  it('keeps the copy where the clause allows no link: under the passive', () => {
    const state = ok('/subj woman /verb ( see /passive ) /obj ( book /poss #1.subj )');
    expect(plans(state)[0]!.directObject).toMatchObject({ possessor: { kind: 'pronominal' } });
  });
});

// P11-E9 D8: an owner named as one of the three persons — "my mother runs" — printed as its person.
describe('a pronoun as the owner', () => {
  it.each<[string, string, Record<string, unknown>]>([
    ['/subj ( mother /poss [ 1st ] ) /verb ( run )', '/subj ( mother /poss [ 1st ] ) /verb ( run )', { subject: 'FIRST_PERSON' }],
    ['/subj ( mother /poss [ 1st /pl ] ) /verb ( run )', '/subj ( mother /poss [ 1st /pl ] ) /verb ( run )', { subject: 'FIRST_PERSON', subjectNumber: 'plural' }],
    ['/subj 1st /verb see /obj ( book /poss [ 3rd /fem ] )', '/subj ( 1st ) /verb ( see ) /obj ( book /poss [ 3rd /fem ] )', { subject: 'THIRD_PERSON', subjectGender: 'fem' }],
    // The English forms, and the possessive determiners in this frame alone; the person is what prints.
    ['/subj mother /poss my /verb run', '/subj ( mother /poss [ 1st ] ) /verb ( run )', { subject: 'FIRST_PERSON', subjectNumber: 'singular' }],
    ['/subj mother /poss we /verb run', '/subj ( mother /poss [ 1st /pl ] ) /verb ( run )', { subject: 'FIRST_PERSON', subjectNumber: 'plural' }],
    ['/subj 1st /verb see /obj ( book /poss her )', '/subj ( 1st ) /verb ( see ) /obj ( book /poss [ 3rd /fem ] )', { subject: 'THIRD_PERSON', subjectGender: 'fem' }],
    ['/subj 1st /verb see /obj ( book /poss their )', '/subj ( 1st ) /verb ( see ) /obj ( book /poss [ 3rd /pl ] )', { subject: 'THIRD_PERSON', subjectNumber: 'plural' }],
  ])('%s', (line, prints, owner) => {
    const state = ok(line);
    const possessor = sel(state).subjectPossessor ?? sel(state).directObjectPossessor!;
    expect(noun(possessor)).toMatchObject(owner);
    expect(print(state)).toBe(prints);
    expect(print(ok(prints))).toBe(prints);
  });

  it('holds both owners of “my son marries your daughter”', () => {
    const line = '/subj ( son /poss [ 1st ] ) /verb ( marry ) /obj ( daughter /poss [ 2nd ] )';
    const state = ok(line);
    expect(noun(sel(state).subjectPossessor!)).toMatchObject({ subject: 'FIRST_PERSON' });
    expect(noun(sel(state).directObjectPossessor!)).toMatchObject({ subject: 'SECOND_PERSON' });
    expect(print(state)).toBe(line);
  });

  it('holds a role after a pronoun owner, which the plan leaves out (the stale-mark rule)', () => {
    const line = '/subj 1st /verb see /obj ( book /poss [ 1st ] /whole )';
    expect(print(ok(line))).toBe('/subj ( 1st ) /verb ( see ) /obj ( book /poss [ 1st ] /whole )');
  });

  it.each([
    ['/subj mother /poss one /verb run', 'one'],
    ['/subj mother /poss someone /verb run', 'someone'],
    ['/subj mother /poss [ one ] /verb run', 'one'],
  ])('takes no generic and no indefinite owner: %s', (line, text) => {
    expect(run(line).diagnostic).toMatchObject({ code: 'unknownWord', args: { text } });
  });

  it('reads *my* in an owner’s frame alone: it is no subject', () => {
    expect(run('/subj my /verb run').diagnostic).toMatchObject({ code: 'unknownWord', args: { text: 'my' } });
  });
});

// P09-E52 D5: the owner's gap, and the noun it is inside, on /wh.
describe('the possessor question', () => {
  it.each<[string, string, Record<string, unknown>]>([
    ['/wh poss obj /subj cat /verb eat /obj food', '/wh poss obj /subj ( cat ) /verb ( eat ) /obj ( food )', { questionRole: 'possessor', questionPossessed: 'directObject' }],
    ['/wh whose /subj cat /verb eat', '/wh poss subj /subj ( cat ) /verb ( eat )', { questionRole: 'possessor', questionPossessed: 'subject' }],
    // The owner's word is kept in its bracket, and not spoken while the owner is asked.
    ['/wh poss subj /subj cat /poss man /verb eat', '/wh poss subj /subj ( cat /poss [ man ] ) /verb ( eat )', { questionRole: 'possessor', questionPossessed: 'subject' }],
  ])('%s', (line, prints, holds) => {
    const state = ok(line);
    expect(sel(state)).toMatchObject({ interrogative: true, ...holds });
    expect(print(state)).toBe(prints);
    expect(print(ok(prints))).toBe(prints);
  });

  it('takes one noun for the owner to be inside, and no other slot beside it', () => {
    expect(run('/wh poss subj obj').diagnostic).toMatchObject({ code: 'valueAlreadyGiven' });
    expect(run('/wh poss loc').diagnostic).toMatchObject({ code: 'valueAlreadyGiven' });
    // Another slot moves the mark, and the owner's noun goes with it.
    expect(sel(ok('/wh poss obj /wh subj'))).not.toHaveProperty('questionPossessed');
  });
});

// P09-E55: the indirect question — a that-clause of a verb that reports one may be a question.
describe('the indirect question', () => {
  it('makes the clause of ASK a question on linking: "the man asks whether the cat runs"', () => {
    const state = ok('/subj man /verb ask /clause { /subj cat /verb run }');
    expect(sel(state, 1)).toMatchObject({ interrogative: true });
    expect(script(state)).toBe(script(ok(script(state))));
  });

  it('asks a gap in the clause: "the man asks what the cat eats"', () => {
    const state = ok('/subj man /verb ask /clause { /wh obj /subj cat /verb eat }');
    expect(sel(state, 1)).toMatchObject({ interrogative: true, questionRole: 'directObject' });
    expect(script(ok(script(state)))).toBe(script(state));
  });

  it('frees the question of an either verb’s clause, and keeps ASK’s one', () => {
    const say = ok('/subj man /verb say /clause { /subj cat /verb run }');
    const clause = { containerId: say.containers[1]!.id };
    expect(sel(ok('/ask', { state: say, context: clause }), 1).interrogative).toBe(true);
    expect(run('/command', { state: say, context: clause }).diagnostic).toMatchObject({ code: 'moodLocked' });
    const ask = ok('/subj man /verb ask /clause { /subj cat /verb run }');
    expect(run('/statement', { state: ask, context: { containerId: ask.containers[1]!.id } }).diagnostic).toMatchObject({ code: 'moodLocked' });
    // Unmarking the gap leaves a yes/no question, not a statement ASK cannot report.
    const wh = ok('/subj man /verb ask /clause { /wh obj /subj cat /verb eat }');
    expect(sel(ok('/del wh', { state: wh, context: { containerId: wh.containers[1]!.id } }), 1)).toMatchObject({ interrogative: true });
  });

  it('still refuses a question as the clause of a verb that reports none, or as an adverbial clause', () => {
    const withQuestion = (line: string) => ok(`/new /ask /subj cat /verb run`, { state: ok(line) });
    const onFirst = (state: WorkspaceState) => ({ state, context: { containerId: state.containers[0]!.id } });
    expect(run('/clause #2', onFirst(withQuestion('/subj man /verb say'))).diagnostic).toBeUndefined();
    expect(run('/clause #2', onFirst(withQuestion('/subj man /verb believe'))).diagnostic).toMatchObject({ code: 'clauseQuestion' });
    expect(run('/sub when #2', onFirst(withQuestion('/subj man /verb say'))).diagnostic).toMatchObject({ code: 'clauseQuestion' });
  });
});

// A268: an if-clause is rendered in its own mood and asks nothing, so `/if` refuses a question as one,
// and says why, as it refuses one as a subordinate clause; the main clause may not ask either
// (`cantTakeCondition`).
describe('the question as an if-clause', () => {
  const withQuestion = (line: string) => ok(`/new ${line}`, { state: ok('/subj man /verb run') });
  const onFirst = (state: WorkspaceState) => ({ state, context: { containerId: state.containers[0]!.id } });

  it.each(['/ask /subj cat /verb eat', '/wh subj /verb eat'])('refuses “%s” as the if-clause, naming the question', (line) => {
    const refused = run('/if #2', onFirst(withQuestion(line))).diagnostic;
    expect(refused).toMatchObject({ code: 'clauseQuestion', args: { period: 2, role: 'condition' } });
    expect(refused?.message).toBe('This period is a question. Choose another period');
  });

  it('names the question on a subordinate clause the same way', () => {
    expect(run('/sub because #2', onFirst(withQuestion('/ask /subj cat /verb eat'))).diagnostic)
      .toMatchObject({ code: 'clauseQuestion', args: { period: 2, role: 'subordinate' } });
  });

  it('still takes a statement', () => {
    expect(ok('/if #2', onFirst(withQuestion('/subj cat /verb eat'))).links[0]).toMatchObject({ kind: 'conditional' });
  });
});
