// The guard against the two views drifting apart (P02 §7, §8): every control on the canvas has a
// console command. A new satellite, reducer or key fails here until the console can say it too.
import { describe, expect, it } from 'vitest';
import * as reducers from '../../src/components/PhraseBuilder/phraseReducers.ts';
import { buildSatellites } from '../../src/components/PhraseBuilder/satellites/index.ts';
import { APP_KEYMAP, KEYMAP, PERIOD_KEYMAP } from '../../src/keyboard/keymap.ts';
import { COMMANDS, commandNamed } from '../../src/console/language/commands.ts';

/** The reducers that read rather than write, or reach into a nested phrase for another one. */
const NOT_EDITS = new Set([
  'gendersOf',
  'possessorRefOf',
  'conjunctsOf',
  'conjunctionOf',
  'nounSliceAt',
  'updateNounAt',
]);

/** The canvas's toggles and cycles are the set-value reducers fed the next value. */
const WRAPS: Record<string, string> = {
  toggleNumber: 'setNumber',
  toggleGender: 'setGender',
  toggleNegative: 'setNegative',
  toggleCauseNegative: 'setCauseNegative',
  cycleTense: 'setTense',
  cycleAspect: 'setAspect',
  cycleVoice: 'setVoice',
  cycleDegree: 'setDegree',
  cycleModifierRelation: 'setModifierRelation',
  cycleModifierNumber: 'setModifierNumber',
  toggleImperative: 'setImperative',
  toggleInfinitive: 'setInfinitive',
  cycleNounConjunction: 'setNounConjunction',
};

/**
 * Every key the app binds, and the console command that does what it does — or null for the keys
 * that move the cursor or change the view, which say nothing about the phrase.
 */
const KEY_COMMANDS: Record<string, string | null> = {
  'box.move.left': null,
  'box.move.up': null,
  'box.move.right': null,
  'box.move.down': null,
  'box.nudge.left': null,
  'box.nudge.up': null,
  'box.nudge.right': null,
  'box.nudge.down': null,
  'box.next': null,
  'box.previous': null,
  'box.word': 'subj',
  'box.clear': 'del',
  'box.fold': null,
  'box.out': null,
  'noun.number': 'pl',
  'noun.gender': 'fem',
  'noun.gender.back': 'masc',
  'noun.determiner': 'a',
  'noun.adjective': 'adj',
  'noun.possessor': 'poss',
  'object.voice': 'passive',
  'object.voice.back': 'active',
  'noun.coordinate': 'and',
  'noun.conjunction': 'or',
  'noun.relative': 'rel',
  'noun.relation': 'under',
  'noun.removeComplement': 'del',
  'adjective.next': 'adj',
  'adjective.degree': 'more',
  'adjective.degree.back': 'less',
  'adjective.relation': 'purpose',
  'adjective.relation.back': 'feature',
  'adjective.number': 'pl',
  'verb.negate': 'not',
  'cause.negate': 'notcause',
  'verb.tense': 'past',
  'verb.tense.back': 'future',
  'verb.aspect': 'prog',
  'verb.aspect.back': 'result',
  'verb.modal': 'modal',
  'verb.adverb': 'adv',
  'verb.complement': 'loc',
  'verb.object': 'obj',
  'mood.person.2sg': 'command',
  'mood.person.1pl': 'command',
  'mood.person.2pl': 'command',
  'mood.register': 'command',
  'app.console': null,
  'app.console.command': null,
  'app.help': 'help',
  'app.region.next': null,
  'app.region.previous': null,
  'app.save': 'save',
  'app.load': 'load',
  'app.export': 'export',
  'app.import': 'import',
  'app.undo': 'undo',
  'app.redo': 'redo',
  'app.words': 'words',
  'period.enter': null,
  'period.previous': null,
  'period.next': null,
  'period.move.up': null,
  'period.move.down': null,
  'period.add': 'new',
  'period.load': 'load',
  'period.save': 'save',
  'period.remove': 'del',
  'period.command': 'command',
  'period.infinitive': 'inf',
  'period.condition': 'if',
  'period.join': 'join',
  'period.level': 'level',
  'period.compact': null,
  'period.tidy': null,
  'period.taller': null,
  'period.taller.alt': null,
  'period.shorter': null,
  'period.out': null,
};

describe('every control on the canvas has a command', () => {
  it('reaches every satellite', () => {
    const { satellites } = buildSatellites({}, {}, 'en', (key) => key);
    const missing = satellites.map((s) => s.key).filter((key) => !COMMANDS.some((c) => c.satellites?.test(key)));
    expect(missing).toEqual([]);
  });

  it('calls every reducer that edits the phrase', () => {
    const used = new Set(COMMANDS.flatMap((c) => c.reducers ?? []));
    const missing = Object.entries(reducers)
      .filter(([, value]) => typeof value === 'function')
      .map(([name]) => name)
      .filter((name) => !NOT_EDITS.has(name))
      .map((name) => WRAPS[name] ?? name)
      .filter((name) => !used.has(name));
    expect(missing).toEqual([]);
  });

  it('names only reducers that exist', () => {
    const names = new Set(Object.keys(reducers));
    expect(COMMANDS.flatMap((c) => c.reducers ?? []).filter((r) => !names.has(r))).toEqual([]);
  });

  it('matches every key binding with a command, or says it only moves the cursor or the view', () => {
    const ids = [...KEYMAP, ...PERIOD_KEYMAP, ...APP_KEYMAP].map((c) => c.id);
    expect(ids.filter((id) => !(id in KEY_COMMANDS))).toEqual([]);
    for (const [id, name] of Object.entries(KEY_COMMANDS)) {
      if (name) expect(commandNamed(name), `${id} → /${name}`).toBeDefined();
    }
  });

  it('gives every command a name no other command or alias takes', () => {
    const names = COMMANDS.flatMap((c) => [c.name, ...c.aliases]);
    expect(names.filter((n, i) => names.indexOf(n) !== i)).toEqual([]);
  });
});
