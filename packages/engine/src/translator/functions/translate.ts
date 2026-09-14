import type { PhrasePlan, Translation } from '@signi/shared';
import type { Mood } from '../../types.js';
import { engines } from '../translator.consts.js';
import type { LexiconLookup } from '../translator.types.js';
import { resolvePhrase } from './resolvePhrase.js';

export function translate(plan: PhrasePlan, lookup: LexiconLookup): Translation[] {
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
    const resolved = resolvePhrase(plan, engine.language, lookup, topMood);
    // Every rendered period closes with its language's full stop, appended here rather
    // than by each engine — the ruby segments must carry the same one, unread.
    const stop = engine.terminator ?? '.';
    const ruby = engine.renderRuby?.(resolved);
    return {
      language: engine.language,
      text: engine.render(resolved) + stop,
      ...(ruby ? { ruby: [...ruby, { t: stop }] } : {}),
    };
  });
}
