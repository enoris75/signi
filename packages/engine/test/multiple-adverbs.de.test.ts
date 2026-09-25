import { describe, expect, test } from 'vitest';
import type { PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, say } from './harness.js';

// P15 in German and Swiss German: a verb's further adverbs take the Mittelfeld slot of their class, in
// its time–manner–place order. A frequency adverb stands beside the frequency primary and a manner
// one behind them, ahead of the objects; a place one follows the objects, and a direction one closes
// the Mittelfeld, "nicht" leading it alone. The relative clause keeps that order behind its objects,
// verb-final. Swiss German forks the engine, so every row renders both.

const run = (verbPhrase: Partial<VerbPhrase>): PhrasePlan => clause(np('CAT'), 'RUN', { verbPhrase });
const move = (verbPhrase: Partial<VerbPhrase>): PhrasePlan => clause(np('CAT'), 'MOVE', { directObject: np('BOOK'), verbPhrase });
const dogWho = (verbPhrase: Partial<VerbPhrase>): PhrasePlan =>
  clause(np('DOG', { relative: { verbPhrase: { verb: 'MOVE', ...verbPhrase }, directObject: np('BOOK') } }), 'EAT');

const OFTEN_FAST = { modifier: 'OFTEN', modifiers: ['FAST'] };
const FAST_HERE = { modifier: 'FAST', modifiers: ['HERE'] };
const OFTEN_HERE = { modifier: 'OFTEN', modifiers: ['HERE'] };
const UP_HERE = { modifier: 'UP', modifiers: ['HERE'] };
const ALREADY_OFTEN = { modifier: 'ALREADY', modifiers: ['OFTEN'] };
const NEVER_FAST = { modifier: 'NEVER', modifiers: ['FAST'] };
const MAYBE_OFTEN = { modifier: 'MAYBE', modifiers: ['OFTEN'] };

describe('P15: several adverbs on the German verb', () => {
  test.each<[string, PhrasePlan, string, string]>([
    // frequency + manner
    ['often fast', run(OFTEN_FAST), 'der Kater läuft oft schnell.', 'de Chater springt oft schnäll.'],
    ['often fast, negated', run({ ...OFTEN_FAST, negative: true }), 'der Kater läuft nicht oft schnell.', 'de Chater springt nöd oft schnäll.'],
    ['often fast, an object', move(OFTEN_FAST), 'der Kater verschiebt oft schnell das Buch.', 'de Chater verschiebt oft schnäll s Buech.'],
    ['often fast, negated, a known object leads', move({ ...OFTEN_FAST, negative: true }), 'der Kater verschiebt das Buch nicht oft schnell.', 'de Chater verschiebt s Buech nöd oft schnäll.'],
    ['often fast, the perfect', move({ ...OFTEN_FAST, aspect: 'resultative' }), 'der Kater hat oft schnell das Buch verschoben.', 'de Chater hät oft schnäll s Buech verschobe.'],
    ['often fast, a modal', run({ ...OFTEN_FAST, modals: ['MUST'] }), 'der Kater muss oft schnell laufen.', 'de Chater mues oft schnäll springe.'],
    ['often fast, the passive', move({ ...OFTEN_FAST, voice: 'passive' }), 'das Buch wird oft schnell vom Kater verschoben.', 's Buech wird oft schnäll vom Chater verschobe.'],
    // The frequency adverb scopes over the prospective; the manner one stays in the zu-group.
    ['often fast, the prospective', run({ ...OFTEN_FAST, aspect: 'prospective' }), 'der Kater ist oft im Begriff, schnell zu laufen.', 'de Chater isch oft drum und dra, schnäll z springe.'],
    ['often fast, a question', { ...move(OFTEN_FAST), interrogative: true }, 'verschiebt der Kater oft schnell das Buch?', 'verschiebt de Chater oft schnäll s Buech?'],
    ['often fast, a command', { ...move(OFTEN_FAST), subject: np('SECOND_PERSON'), imperative: true }, 'verschieb oft schnell das Buch.', 'verschieb oft schnäll s Buech.'],
    ['often fast, an instruction', { ...move(OFTEN_FAST), subject: np('SECOND_PERSON'), imperative: true, imperativeRegister: 'instruction' }, 'oft schnell das Buch verschieben.', 'oft schnäll s Buech verschiebe.'],
    ['often fast, a relative clause', dogWho(OFTEN_FAST), 'der Hund, der das Buch oft schnell verschiebt, frisst.', 'de Hund, wo s Buech oft schnäll verschiebt, frisst.'],
    ['often fast, a negated relative clause', dogWho({ ...OFTEN_FAST, negative: true }), 'der Hund, der das Buch nicht oft schnell verschiebt, frisst.', 'de Hund, wo s Buech nöd oft schnäll verschiebt, frisst.'],
    ['often fast, a protasis', { ...clause(np('DOG'), 'EAT'), condition: run(OFTEN_FAST) }, 'wenn der Kater oft schnell laufen würde, würde der Hund fressen.', 'wenn de Chater oft schnäll springe würd, würd de Hund frässe.'],
    // manner + place
    ['fast here', run(FAST_HERE), 'der Kater läuft schnell hier.', 'de Chater springt schnäll da.'],
    ['fast here, an object', move(FAST_HERE), 'der Kater verschiebt schnell das Buch hier.', 'de Chater verschiebt schnäll s Buech da.'],
    ['fast here, negated', move({ ...FAST_HERE, negative: true }), 'der Kater verschiebt das Buch nicht schnell hier.', 'de Chater verschiebt s Buech nöd schnäll da.'],
    ['fast here, a modal', move({ ...FAST_HERE, modals: ['MUST'] }), 'der Kater muss schnell das Buch hier verschieben.', 'de Chater mues schnäll s Buech da verschiebe.'],
    ['fast here, a relative clause', dogWho(FAST_HERE), 'der Hund, der das Buch schnell hier verschiebt, frisst.', 'de Hund, wo s Buech schnäll da verschiebt, frisst.'],
    // frequency + place
    ['often here', run(OFTEN_HERE), 'der Kater läuft oft hier.', 'de Chater springt oft da.'],
    ['often here, the perfect', run({ ...OFTEN_HERE, tense: 'past', aspect: 'resultative' }), 'der Kater war oft hier gelaufen.', 'de Chater isch oft da gsprunge gsii.'],
    ['often here, the prospective', move({ ...OFTEN_HERE, aspect: 'prospective' }), 'der Kater ist oft im Begriff, das Buch hier zu verschieben.', 'de Chater isch oft drum und dra, s Buech da z verschiebe.'],
    ['often here, a relative clause in the perfect', dogWho({ ...OFTEN_HERE, aspect: 'resultative' }), 'der Hund, der das Buch oft hier verschoben hat, frisst.', 'de Hund, wo s Buech oft da verschobe hät, frisst.'],
    ['often fast here', run({ modifier: 'OFTEN', modifiers: ['FAST', 'HERE'] }), 'der Kater läuft oft schnell hier.', 'de Chater springt oft schnäll da.'],
    // direction + place: the direction closes the Mittelfeld, and "nicht" leads it alone.
    ['up here', move(UP_HERE), 'der Kater verschiebt das Buch hier nach oben.', 'de Chater verschiebt s Buech da ufe.'],
    ['here up, either order', move({ modifier: 'HERE', modifiers: ['UP'] }), 'der Kater verschiebt das Buch hier nach oben.', 'de Chater verschiebt s Buech da ufe.'],
    ['up here, negated', move({ ...UP_HERE, negative: true }), 'der Kater verschiebt das Buch hier nicht nach oben.', 'de Chater verschiebt s Buech da nöd ufe.'],
    ['up here, a modal', move({ ...UP_HERE, modals: ['MUST'] }), 'der Kater muss das Buch hier nach oben verschieben.', 'de Chater mues s Buech da ufe verschiebe.'],
    ['up here, the prospective', move({ ...UP_HERE, aspect: 'prospective' }), 'der Kater ist im Begriff, das Buch hier nach oben zu verschieben.', 'de Chater isch drum und dra, s Buech da ufe z verschiebe.'],
    ['up here, a negated relative clause', dogWho({ ...UP_HERE, negative: true }), 'der Hund, der das Buch hier nicht nach oben verschiebt, frisst.', 'de Hund, wo s Buech da nöd ufe verschiebt, frisst.'],
    ['often up', move({ modifier: 'OFTEN', modifiers: ['UP'] }), 'der Kater verschiebt oft das Buch nach oben.', 'de Chater verschiebt oft s Buech ufe.'],
    // frequency + frequency, and ALREADY's "noch nicht" under negation
    ['already often', run(ALREADY_OFTEN), 'der Kater läuft schon oft.', 'de Chater springt scho oft.'],
    ['already often, negated', move({ ...ALREADY_OFTEN, negative: true }), 'der Kater verschiebt das Buch noch nicht oft.', 'de Chater verschiebt s Buech no nöd oft.'],
    ['already often, a modal', run({ ...ALREADY_OFTEN, modals: ['MUST'] }), 'der Kater muss schon oft laufen.', 'de Chater mues scho oft springe.'],
    ['already often, the prospective', run({ ...ALREADY_OFTEN, aspect: 'prospective' }), 'der Kater ist schon oft im Begriff zu laufen.', 'de Chater isch scho oft drum und dra z springe.'],
    ['already often, a negated relative clause', dogWho({ ...ALREADY_OFTEN, negative: true }), 'der Hund, der das Buch noch nicht oft verschiebt, frisst.', 'de Hund, wo s Buech no nöd oft verschiebt, frisst.'],
    // manner + manner, side by side
    ['slowly well', move({ modifier: 'SLOWLY', modifiers: ['WELL'], aspect: 'resultative' }), 'der Kater hat langsam gut das Buch verschoben.', 'de Chater hät langsam guet s Buech verschobe.'],
    // negative + manner: "nie" negates, no "nicht" beside it
    ['never fast', move(NEVER_FAST), 'der Kater verschiebt nie schnell das Buch.', 'de Chater verschiebt nie schnäll s Buech.'],
    ['never fast, the perfect', move({ ...NEVER_FAST, aspect: 'resultative' }), 'der Kater hat nie schnell das Buch verschoben.', 'de Chater hät nie schnäll s Buech verschobe.'],
    ['never fast, a question', { ...move(NEVER_FAST), interrogative: true }, 'verschiebt der Kater je schnell das Buch?', 'verschiebt de Chater je schnäll s Buech?'],
    ['never fast, a relative clause', dogWho(NEVER_FAST), 'der Hund, der das Buch nie schnell verschiebt, frisst.', 'de Hund, wo s Buech nie schnäll verschiebt, frisst.'],
    // sentence + frequency: the sentence adverb opens the clause and OFTEN keeps the frequency slot;
    // a question and a relative clause keep both in it.
    ['maybe often', run(MAYBE_OFTEN), 'vielleicht läuft der Kater oft.', 'vilicht springt de Chater oft.'],
    ['maybe often, negated', move({ ...MAYBE_OFTEN, negative: true }), 'vielleicht verschiebt der Kater das Buch nicht oft.', 'vilicht verschiebt de Chater s Buech nöd oft.'],
    ['maybe often, a question', { ...move(MAYBE_OFTEN), interrogative: true }, 'verschiebt der Kater vielleicht oft das Buch?', 'verschiebt de Chater vilicht oft s Buech?'],
    ['maybe often, a negated relative clause', dogWho({ ...MAYBE_OFTEN, negative: true }), 'der Hund, der das Buch vielleicht nicht oft verschiebt, frisst.', 'de Hund, wo s Buech vilicht nöd oft verschiebt, frisst.'],
  ])('%s', (_, plan, de, gsw) => {
    expect(say(plan, 'de')).toBe(de);
    expect(say(plan, 'gsw')).toBe(gsw);
  });
});
