import type { PhrasePlan, RubySegment, Translation } from '@signi/shared';
import type { Mood } from '../../types.js';
import { engines } from '../translator.consts.js';
import type { LexiconLookup } from '../translator.types.js';
import { resolveAddress } from './resolveAddress.js';
import { resolvePhrase } from './resolvePhrase.js';
import { liftSentenceAdverb } from './sentenceAdverb.js';
import { tidyCommas } from './tidyCommas.js';

/** An interjection's word as a ruby segment: its kana reading over it where it has one (P09-E30). */
const interjectionSeg = (forms: Record<string, string>): RubySegment => {
  const t = forms['base'] ?? '';
  const r = forms['reading'];
  return r && r !== t ? { t, r } : { t };
};

/** A sentence's first word, capitalized where the script has case. */
const capitalized = (text: string): string => text.charAt(0).toLocaleUpperCase() + text.slice(1);

export function translate(plan: PhrasePlan, lookup: LexiconLookup): Translation[] {
  // An address calls the hearer, and an instruction (the label on a control, a recipe step) is
  // addressed to nobody, so the two contradict each other: refused by name rather than rendered as a
  // name before an infinitive (A338). `/api/translate` says the same as a 400 (`planError`).
  if (plan.address && plan.imperative && plan.imperativeRegister === 'instruction') {
    throw new Error('an instruction addresses nobody, so it takes no address: plan.address must be left out (A338)');
  }
  return engines.map((engine) => {
    // The top clause's mood: 'conditional' when a hypothetical condition is attached,
    // 'imperative' for a command, 'infinitive' for a bare citation phrase (a verb definition),
    // else plain indicative (undefined). These are mutually exclusive (the UI never sets more
    // than one). A command hands its mood on to a coordinated second clause (see resolvePhrase)
    // but never to a relative clause.
    const topMood: Mood | undefined = plan.condition
      ? 'conditional'
      : plan.imperative
        ? 'imperative'
        : plan.infinitive
          ? 'infinitive'
          : undefined;
    // A sentence adverb opens a main statement (P09-E39, see `liftSentenceAdverb`).
    const resolved = liftSentenceAdverb(resolvePhrase(plan, engine.language, lookup, topMood, undefined, !!plan.infinitive), topMood);
    // Every rendered period closes with its language's full stop, appended here rather
    // than by each engine — the ruby segments must carry the same one, unread. A question closes
    // on its question mark instead, and opens on one where the language writes it (es "¿").
    const question = !!resolved.verbPhrase?.interrogative;
    const open = question ? (engine.questionOpener ?? '') : '';
    const stop = question ? (engine.questionMark ?? '?') : (engine.terminator ?? '.');
    // The vocative opens the sentence, set off by the language's separator and capitalized as its
    // first word (P11-E3): "Mom, run.", お母さん、…. It stands **outside** Spanish's opening mark, which
    // encloses only the question itself: "Mamá, ¿el gato corre?" (RAE, *Ortografía* 3.4.2.1).
    const separator = engine.addressSeparator ?? ', ';
    // An interjection comes before even the vocative (P09-E30): "Hey, Mom, run.", ねえ、お母さん、…. It
    // is a word outside the clause, set off by the vocative's separator, and it stands outside the
    // Spanish ¿ too ("Oye, ¿el gato corre?"). As the sentence's first word it takes the capital, and a
    // vocative behind it is no longer first: "Hey, cat, run." (a name keeps the capital it is seeded
    // with, "Hey, Mom, run.").
    const interjection = plan.interjection ? lookup(plan.interjection, engine.language)?.forms : undefined;
    const exclaimed = interjection?.['base'] ? capitalized(interjection['base']) + separator : '';
    const address = plan.address ? resolveAddress(plan.address, engine.language, lookup) : undefined;
    const addressed = address ? engine.render(address) : '';
    const called = address ? (exclaimed ? addressed : capitalized(addressed)) + separator : '';
    const ruby = engine.renderRuby?.(resolved);
    const exclaimedRuby = exclaimed && ruby ? [interjectionSeg(interjection!), { t: separator }] : [];
    const calledRuby = address && ruby ? [...engine.renderRuby!(address), { t: separator }] : [];
    return {
      language: engine.language,
      // A parenthetical's closing comma (P09-E33) gives way to the stop, or to a comma it meets.
      text: exclaimed + called + open + tidyCommas(engine.render(resolved)) + stop,
      ...(ruby ? { ruby: [...exclaimedRuby, ...calledRuby, ...(open ? [{ t: open }] : []), ...ruby, { t: stop }] } : {}),
    };
  });
}
