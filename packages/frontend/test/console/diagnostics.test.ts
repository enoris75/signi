// What each diagnostic says, one row per code (and per way a code can read). The other console tests
// hold a line to the code it earns and what the code names; this table holds each code to its
// English — the catalogue entries' fallbacks, which the prompt shows until the catalogue arrives —
// so the words are still watched. A code with no row fails the typecheck, and the last test fails the
// run. The entries' renders in all seven languages are pinned in packages/engine/test/console-diagnostics.test.ts.
import { describe, expect, it } from 'vitest';
import { UI_STRINGS, type UiStringKey } from '@signi/shared';
import {
  DIAGNOSTIC_CODES,
  english,
  sayDiagnostic,
  sayHere,
  segmentsOf,
  fallbackOf,
  type Coded,
  type DiagnosticArgs,
  type DiagnosticCode,
} from '../../src/console/language/diagnostics.ts';

type Samples = { [C in DiagnosticCode]: [DiagnosticArgs<C>, string][] };

const SAMPLES: Samples = {
  strayCloser: [[{}, 'Unexpected bracket']],
  lineStartsWithWord: [[{}, 'Unexpected word. Type a command: /subj ( … )']],
  strayBracket: [[{}, 'Open a bracket with a command: /subj ( … ), /poss [ … ], /rel subj { … }']],
  unexpectedText: [[{}, 'Unexpected text']],
  commandNameMissing: [[{}, 'Choose a command in the list']],
  unknownCommand: [[{ command: 'frob' }, 'Unknown command: /frob']],
  takesNoWord: [[{ command: 'pl' }, 'This command accepts no word: /pl']],
  valueNotTaken: [
    [{ command: 'tense', values: ['past', 'present', 'future'], given: 'soon' }, 'Unknown value: “soon”. Choose a value: past, present, future'],
  ],
  valueAlreadyGiven: [
    [{ command: 'level', max: 1, given: 'process' }, 'This command already has a value: process'],
    [{ command: 'command', max: 2, given: 'lets' }, 'This command already has a value: lets'],
  ],
  conjunctTakesNoReference: [[{ command: 'and' }, 'Unexpected reference']],
  wordOrReference: [[{ command: 'poss' }, 'Unexpected reference']],
  wordInsideBracket: [
    [{ command: 'subj', word: 'cat', shape: '(' }, 'Move the word: /subj ( cat … )'],
    [{ command: 'poss', word: 'man', shape: '[' }, 'Move the word: /poss [ man … ]'],
  ],
  openNewClause: [[{ gap: 'subj' }, 'Open a new clause: /rel subj { … }']],
  relativeTakes: [[{}, 'Choose a relative clause: /rel #2.subj, /rel subj { … }, /rel obj { … }']],
  clauseLinkTakes: [[{ command: 'if' }, 'Choose a period: /if #2, /if { … }']],
  joinTakes: [[{}, 'Choose a conjunction: and, or, but, thatis, therefore, then, however']],
  subTakes: [[{}, 'Choose a conjunction: when, while, because, after, before, until, since, though, as']],
  referenceStartsWithNumber: [[{}, 'Choose a period: #2, #2.obj']],
  periodsFromOne: [[{}, 'Missing period: #0']],
  notANoun: [[{ step: 'foo' }, 'Unknown noun: “foo”. Choose a noun: subj, obj, pred, loc, …']],
  notAStep: [[{ step: 'foo' }, 'Unknown noun: “foo”. Choose a noun: poss, and2, …']],
  periodCommandInBracket: [[{ command: 'verb', via: 'subj' }, 'Close the bracket: /subj ( … )']],
  gotoInsideBracket: [
    [{ kind: 'period', via: 'rel' }, 'Close the bracket: /rel { … }'],
    [{ kind: 'possessor', via: 'poss' }, 'Close the bracket: /poss [ … ]'],
  ],
  noSuchPeriod: [[{ period: 3 }, 'Missing period: #3']],
  noNounThere: [[{ period: 2, ref: '#2.obj' }, 'Missing noun: #2.obj']],
  referenceIncomplete: [[{}, 'Choose a period: #2, #2.obj']],
  nestedRoleNotSubj: [[{ kind: 'possessor', via: 'poss' }, 'Close the bracket: /poss [ … ]']],
  instrumentAsThing: [[{}, 'Change the level: /level process']],
  objectNeedsVerb: [[{}, 'Choose a verb: /verb ( … )']],
  takesNoObject: [[{ verb: 'run' }, 'This verb accepts no object: run']],
  complementNeedsVerb: [[{ command: 'term' }, 'Choose a verb: /verb ( … )']],
  takesNoComplement: [
    [{ verb: 'eat', command: 'pred', slot: 'predicative' }, 'This verb accepts no subject complement: eat'],
    [{ verb: 'see', command: 'loc', slot: 'locative' }, 'This verb accepts no locative: see'],
  ],
  ambiguousWord: [[{ text: 'cry', candidates: ['CRY', 'CRY_OUT'] }, 'Choose a word: CRY, CRY_OUT']],
  unknownWord: [[{ command: 'obj', text: 'frob' }, 'Unknown word: “frob”']],
  setNeedsValue: [[{ command: 'tense', values: ['past', 'present', 'future'] }, 'Choose a value: past, present, future']],
  describesAWord: [[{ command: 'pl', role: 'subj', word: 'cat' }, 'Move the command: /subj ( cat … /pl )']],
  noTarget: [
    [
      { command: 'past', last: { word: 'food', kind: 'noun' }, fit: { word: 'eat', role: 'verb' }, inElement: false },
      "/past — to set a verb's tense. This word is a noun: food. Move the command: /verb ( eat … /past )",
    ],
    [{ command: 'more', last: { word: 'cat', kind: 'noun' }, inElement: true }, "/more — to set an adjective's degree. This word is a noun: cat"],
    [{ command: 'adj', last: { word: 'eat', kind: 'verb' }, inElement: false }, '/adj — to describe a noun. This word is a verb: eat'],
    [{ command: 'pl', inElement: false }, "/pl — to set a noun's number. Missing word"],
    // A fitting word nested in a phrase has no role command to write it with: no line to move to.
    [{ command: 'pl', last: { word: 'eat', kind: 'verb' }, fit: { word: 'man' }, inElement: false }, "/pl — to set a noun's number. This word is a verb: eat"],
  ],
  possessorOwnPeriod: [[{ period: 1 }, 'Choose a noun in this period: #1.subj']],
  possessorNeedsNoun: [[{ period: 1 }, 'Choose a noun in this period: #1.subj']],
  ownPossessor: [[{}, 'Choose another noun']],
  relativeNeedsNoun: [[{ period: 2 }, 'Choose a noun: #2.subj, #2.obj']],
  relativeNounOfPeriod: [[{ period: 2 }, 'Choose a noun: #2.subj, #2.obj']],
  relativeNeedsClause: [[{}, 'Choose a relative clause: /rel #2.subj, /rel subj { … }']],
  linkInsideNounPhrase: [[{ command: 'if', kind: 'possessor', via: 'poss' }, 'Close the bracket: /poss [ … ]']],
  imperativeJoin: [[{}, 'This period is a command. Choose a conjunction: and, or, but, then']],
  instrumentNeedsVerb: [[{}, 'Choose a verb: /verb ( … )']],
  takesNoInstrument: [[{ verb: 'see' }, 'This verb accepts no instrumental: see']],
  linksWholePeriods: [[{ command: 'if', period: 2 }, 'Choose a period: #2']],
  clauseLinkNeedsTarget: [
    [{ command: 'if' }, 'Choose a period: /if #2, /if { … }'],
    [{ command: 'join', conjunction: 'and' }, 'Choose a period: /join and #2, /join and { … }'],
  ],
  levelNeedsValue: [[{}, 'Choose a value: process, concept, object']],
  levelNotTaken: [[{ text: 'soon' }, 'Unknown value: “soon”. Choose a value: process, concept, object']],
  moodInNounPhrase: [[{ kind: 'conjunct', via: 'and' }, 'Close the bracket: /and [ … ]']],
  moodLocked: [[{}, 'Remove the condition or the coordination: /del if, /del join, /del clause, /del sub, /del to']],
  newPeriodInBracket: [[{ kind: 'element', via: 'verb' }, 'Close the bracket: /verb ( … )']],
  nothingToRemove: [[{}, 'Remove a word or the period: /del obj, /del adj, /del period']],
  nestedRemovesOnlySubj: [[{ kind: 'possessor', via: 'poss' }, 'Close the bracket: /poss [ … ]']],
  noAdjectiveToRemove: [[{}, 'No noun has an adjective']],
  noSuchAdjective: [[{ index: 2 }, 'Missing adjective: 2']],
  noAdverbToRemove: [[{}, 'No verb has an adverb']],
  noModalToRemove: [
    [{}, 'The verb has no modal'],
    [{ index: 2 }, 'Missing modal: 2'],
  ],
  noPossessorToRemove: [[{}, 'No noun has a possessor']],
  noStandardToRemove: [[{}, 'No adjective has a standard of comparison']],
  noConjunctToRemove: [[{}, 'No noun is coordinated']],
  noSuchConjunct: [[{ index: 3 }, 'Missing conjunct: 3']],
  noRelativeToRemove: [[{}, 'No noun has a relative clause']],
  unknownRemoval: [
    [{ what: 'everything' }, 'Unknown value: “everything”. Choose a value: subj, verb, obj, adj, adv, modal, poss, than, and, …, wh, there, rel, if, join, clause, sub, to, inst, period'],
  ],
  removePeriodInBracket: [[{ kind: 'element', via: 'subj' }, 'Close the bracket: /subj ( … )']],
  linkTargetRemoved: [[{}, 'Missing period']],
  linkSourceRemoved: [[{}, 'Missing period']],
  cantTakeCondition: [[{}, 'This period accepts no condition']],
  cantStartCoordination: [[{}, 'This period accepts no coordination']],
  cantTakeSubordinate: [[{}, 'This period accepts no subordinate clause']],
  subordinateNeedsVerb: [[{}, 'Choose a verb: /verb ( … )']],
  takesNoContentClause: [[{ verb: 'run' }, 'This verb accepts no subordinate clause: run']],
  takesNoInfinitive: [[{ verb: 'say' }, 'This verb accepts no infinitive phrase: say']],
  contentClauseHasObject: [[{}, 'This period has an object: /del obj']],
  joinMoodMismatch: [
    [{ imperative: true }, 'This period is a command. Choose another period'],
    [{ imperative: false }, 'This period is a statement. Choose another period'],
  ],
  instrumentThingHasVerb: [[{}, 'That period has a verb. Choose a level: /level process, /level concept']],
  noNounAt: [[{ ref: '#1.obj' }, 'Missing noun: #1.obj']],
  noInstrumentLink: [[{}, 'This period has no instrumental']],
  noLinkToRemove: [
    [{ link: 'condition' }, 'This period has no condition'],
    [{ link: 'join' }, 'This period has no coordination'],
    [{ link: 'subordinate' }, 'This period has no subordinate clause'],
    [{ link: 'instrument' }, 'This period has no instrumental'],
  ],
  relativeSamePeriod: [[{}, 'Choose another period']],
  relativeGapEmpty: [[{ ref: '#2.subj' }, 'Missing word: #2.subj']],
  relativeGapTaken: [[{ ref: '#2.subj' }, 'Another relative clause already has this noun: #2.subj']],
  linkCircle: [[{ period: 2 }, 'Choose another period']],
  clauseSelf: [[{ role: 'condition' }, 'Choose another period']],
  clauseInOtherLink: [[{ period: 2 }, 'That period is already linked: #2']],
  clauseQuestion: [[{ period: 2, role: 'condition' }, 'This period is a question. Choose another period']],
  clauseCannot: [[{ period: 2, role: 'instrument' }, 'Choose another period']],
  lineNotRead: [[{}, 'This line could not be read.']],
  phraseNotSaved: [[{}, 'The phrase could not be saved.']],
  phraseNotLoaded: [[{}, 'That phrase could not be loaded.']],
  noSavedPhrase: [[{ name: 'x' }, 'Unknown phrase: “x”']],
};

describe('what each diagnostic says in English', () => {
  for (const [code, samples] of Object.entries(SAMPLES) as [DiagnosticCode, [unknown, string][]][]) {
    it.each(samples)(`${code} %j`, (args, text) => {
      expect(english({ code, args } as Coded)).toBe(text);
    });
  }

  it('has a row for every code', () => {
    expect(Object.keys(SAMPLES).sort()).toEqual([...DIAGNOSTIC_CODES].sort());
  });

  it('says every code with entries the catalogue has', () => {
    for (const [code, samples] of Object.entries(SAMPLES) as [DiagnosticCode, [unknown, string][]][])
      for (const [args] of samples)
        for (const s of segmentsOf({ code, args } as Coded)) expect(UI_STRINGS[s.key], `${code} → ${s.key}`).toBeDefined();
  });
});

describe('putting a diagnostic together in the interface language', () => {
  // Stand-ins for a bundle: the catalogue's own words in a language, keyed.
  const bundle = (words: Partial<Record<UiStringKey, string>>) => (key: UiStringKey) => words[key] ?? fallbackOf(key);

  it('writes the value after the phrase, and joins two sentences with the language’s full stop', () => {
    const it_ = bundle({ 'diagnostic.unknownValue': 'Valore sconosciuto', 'diagnostic.chooseValue': 'Scegli un valore' });
    expect(sayDiagnostic({ code: 'valueNotTaken', args: { command: 'tense', values: ['past', 'present'], given: 'presto' } }, it_, 'it')).toBe(
      'Valore sconosciuto: “presto”. Scegli un valore: past, present',
    );
    const ja = bundle({ 'diagnostic.unknownValue': '不明な値', 'diagnostic.chooseValue': '値を選び' });
    expect(sayDiagnostic({ code: 'valueNotTaken', args: { command: 'tense', values: ['past'], given: 'x' } }, ja, 'ja')).toBe(
      '不明な値: “x”。値を選び: past',
    );
  });

  it('leads a purpose with its command, as the help page does', () => {
    const de = bundle({ 'purpose.degree': 'die Steigerungsstufe eines Adjektivs festlegen', 'diagnostic.wordIs.noun': 'Dieses Wort ist ein Substantiv' });
    expect(sayDiagnostic({ code: 'noTarget', args: { command: 'more', last: { word: 'Katze', kind: 'noun' }, inElement: true } }, de, 'de')).toBe(
      '/more — die Steigerungsstufe eines Adjektivs festlegen. Dieses Wort ist ein Substantiv: Katze',
    );
  });
});

describe('what a help page says it would act on', () => {
  it('names the word under the cursor, and what it holds now', () => {
    expect(sayHere({ kind: 'nothing' }, fallbackOf)).toBe('No word is under the cursor');
    expect(sayHere({ kind: 'refused', word: 'cat' }, fallbackOf)).toBe('This word does not accept the command: cat');
    expect(sayHere({ kind: 'on', word: 'cat' }, fallbackOf)).toBe('Cursor: cat');
    expect(sayHere({ kind: 'on', word: 'cat', now: { value: 'singular', key: 'number.value.singular' } }, fallbackOf)).toBe(
      'Cursor: cat · now Singular',
    );
    expect(sayHere({ kind: 'on', word: 'cat', now: { value: 'feature' } }, fallbackOf)).toBe('Cursor: cat · now feature');
  });
});
