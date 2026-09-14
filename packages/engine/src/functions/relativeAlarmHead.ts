import type { ResolvedNounPhrase } from '../types.js';
import { alarmCry } from './alarmCry.js';
import { firstConjunct } from './firstConjunct.js';
import { relativeGapComplement } from './relativeGapComplement.js';

/**
 * The relativizer stand-in for a relative clause whose head is the alarm its cry raises, or
 * `undefined` for any other head (A129). The head fills the cry's direct object, but the alarm frame
 * makes that object the a / à complement (A124), so the gap is a complement gap, not a plain object:
 * Italian "il lupo al quale il ragazzo gridò", French "le loup auquel le garçon cria", never "che" /
 * "que". The stand-in is the one `relativeGapComplement` builds from `forms` (A62), for the engine's
 * `alarmCryText` to fuse with its a / à.
 */
export function relativeAlarmHead(np: ResolvedNounPhrase, forms: Record<string, string>): ResolvedNounPhrase | undefined {
  const rel = np.relative;
  if (!rel || rel.headRole !== 'directObject' || !alarmCry(rel.verbPhrase.verb, np)) return undefined;
  const gap = relativeGapComplement({ ...np, relative: { ...rel, headRole: 'terminus' } }, forms);
  return gap?.['terminus'] && firstConjunct(gap['terminus'].phrase);
}
