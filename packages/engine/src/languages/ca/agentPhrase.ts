import type { ResolvedNounElement } from '../../types.js';
import { coordinateElement } from './coordinateElement.js';
import { caSurface } from './caSurface.js';
import { npText } from './npText.js';
import { withRelative } from './withRelative.js';

/**
 * The by-phrase of a passive clause — the demoted agent under *per* ("és menjat **pel gat**"). Each
 * conjunct takes its own *per*, which contracts with its article ("pel gat i pel gos"); a pronoun takes
 * its tonic form after it ("per mi").
 *
 * Empty when there is no agent to speak (see ResolvedPhrase.agent).
 */
export function agentPhrase(agent?: ResolvedNounElement): string {
  if (!agent) return '';
  return coordinateElement(agent, (np) =>
    np.head.forms['person'] ? withRelative(`per ${np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? ''}`, np) : caSurface(`per ${npText(np)}`));
}
