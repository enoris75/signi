import { reflexiveFinite } from './reflexiveFinite.js';

/**
 * A verb's infinitive, its reflexive clitic agreeing with the subject: "(je dois) m'effondrer",
 * "(nous sommes sur le point de) nous effondrer". The citation `base` carries the 3rd-person "s'" /
 * "se ", which is stripped and re-added by `reflexiveFinite`. A non-reflexive verb returns its base.
 */
export function reflexiveInfinitive(verbForms: Record<string, string>, subjectForms: Record<string, string>): string {
  const base = verbForms['base'] ?? '';
  const bare = base.replace(/^(?:s'|se )/, '');
  return bare === base ? base : reflexiveFinite(verbForms, subjectForms, bare);
}
