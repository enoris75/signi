import { describe, expect, test } from 'vitest';
import { ASPECTS, TENSES, type LanguageCode, type NounElement } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// The full conjugation table, swept combinatorially: every verb in the corpus, in every person
// and number, across every tense and every aspect. That is 45 verbs × 6 subjects × 3 tenses ×
// 4 aspects = 3 240 clauses, each rendered in all seven languages — ~22 680 surface forms.
//
// There is no hand-authoring assertions at that scale, and no point pretending to: the value here
// is a *regression lock*, not curated linguistics (verb.test.ts and subject.test.ts carry the
// curated, commentary-bearing cases). So the sweep is snapshotted. A change in any conjugated form,
// in any language, for any cell of the table, shows up as a snapshot diff naming the exact verb,
// subject and tense·aspect cell that moved — and `vitest -u` re-baselines once the change is
// deliberate. The engine is a pure function of (plan, lexicon), so these snapshots are stable.
//
// Snapshots are grouped one-per-(verb, subject): the test title pins the verb and the person/
// number, and the snapshot body is that subject's 12-cell tense × aspect matrix. A single broken
// form therefore surfaces as a one-line diff inside a named block.

/** Every verb concept in the corpus (all transitivities), excluding the governing modals. */
const VERBS = [
  // intransitive
  'RUN', 'JUMP', 'COME', 'CRY', 'BURN', 'COLLAPSE',
  // transitive
  'CUT', 'EAT', 'DRINK', 'SEE', 'LOVE', 'KILL', 'KNOW', 'READ', 'CRY_OUT', 'BITE', 'BEAT',
  'SET_ON_FIRE', 'EXTINGUISH', 'BUY', 'MAKE', 'CLICK', 'CHOOSE', 'SELECT', 'TYPE', 'SAVE', 'LOAD',
  'ADD', 'EXPORT', 'IMPORT', 'CLEAR', 'COORDINATE', 'TIDY_UP', 'COMPACT', 'EXPAND', 'HIDE', 'START',
  // ditransitive
  'GIVE', 'SHOW', 'SEND',
  // motion / copular
  'GO', 'BECOME', 'SEEM', 'APPEAR', 'BE',
] as const;

// The six subject slots: 1st / 2nd / 3rd person, each singular and plural. The three pronoun
// concepts carry the person; `number` toggles singular vs plural (see concepts/pronouns.ts).
const SUBJECTS: [label: string, subject: NounElement][] = [
  ['1st singular', np('FIRST_PERSON')],
  ['1st plural', np('FIRST_PERSON', { number: 'plural' })],
  ['2nd singular', np('SECOND_PERSON')],
  ['2nd plural', np('SECOND_PERSON', { number: 'plural' })],
  ['3rd singular', np('THIRD_PERSON')],
  ['3rd plural', np('THIRD_PERSON', { number: 'plural' })],
];

describe.each(VERBS)('conjugation: %s', (verb) => {
  test.each(SUBJECTS)('%s', (_label, subject) => {
    // One subject's whole tense × aspect matrix, keyed "tense · aspect" → every language.
    const matrix: Record<string, Record<LanguageCode, string>> = {};
    for (const tense of TENSES) {
      for (const aspect of ASPECTS) {
        matrix[`${tense} · ${aspect}`] = sayAll(clause(subject, verb, { verbPhrase: { tense, aspect } }));
      }
    }
    expect(matrix).toMatchSnapshot();
  });
});
