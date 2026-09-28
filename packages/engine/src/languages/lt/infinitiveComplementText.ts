import type { ResolvedPhrase } from '../../types.js';
import { infinitiveLink } from '../../functions/infinitiveLink.js';
import { predicateText } from './predicateText.js';
import { verbAgr } from './verbAgr.js';

/**
 * An infinitive complement as it follows its governor: the governor's link, if Lithuanian writes one
 * (most take the infinitive bare: *nori valgyti*, *pradeda valgyti*), then the bare infinitive clause
 * agreeing with its controller (*gali būti laiminga*), and any clause it governs in turn. A causative
 * governor takes the plain infinitive too (*verčia katę bėgti*), where Polish needs *żeby*.
 */
export function infinitiveComplementText(clause: ResolvedPhrase, controller: Record<string, string>, link: string): string {
  const vp = clause.verbPhrase;
  if (!vp) return '';
  const own = predicateText({ subject: controller, agr: verbAgr(controller), verbPhrase: vp, directObject: clause.directObject, complements: clause.complements });
  const nested = clause.infinitiveComplement ? infinitiveComplementText(clause.infinitiveComplement, controller, infinitiveLink(clause)) : '';
  return [link, own, nested].filter(Boolean).join(' ');
}
