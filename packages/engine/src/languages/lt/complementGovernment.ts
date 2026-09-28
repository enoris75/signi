import { DEFAULT_LOCATIVE_SPECIFIER, type ComplementType } from '@signi/shared';
import type { ResolvedComplement } from '../../types.js';
import { causeSentiment } from '../../functions/causeSentiment.js';
import { directionSpecifier } from '../../functions/directionSpecifier.js';
import { isPrivative } from '../../functions/isPrivative.js';
import { mannerRelation } from '../../functions/mannerRelation.js';
import { pathSpecifier } from '../../functions/pathSpecifier.js';
import { temporalRelation } from '../../functions/temporalRelation.js';
import {
  CAUSE, COMPLEMENT_GOVERNMENT, GOAL, MANNER, PERSON_GOAL, PLACE, PLAIN_GOAL, PLAIN_SOURCE, PRIVATIVE, SOURCE, TEMPORAL,
} from './lt.consts.js';
import type { Case, Government } from './lt.types.js';

/**
 * The adposition a complement takes and the case it governs (P18 §2.3):
 *
 * | complement | Lithuanian |
 * |---|---|
 * | locative | the **bare locative** (*namuose*); *ant, virš, už, prie, tarp* + gen, *po* + ins, *prieš, aplink* + acc |
 * | direction | *į* + acc, to a person *pas* + acc (*pas vaiką*); a relation its own (*ant stogo*, *už namo*) |
 * | source | *nuo* + gen; out of *iš* + gen; a relation compounded with *iš* (*iš po stalo*) |
 * | route | *per* + acc; a relation as the locative's |
 * | cause | *dėl* + gen; *dėka* + gen, a **postposition** (*draugo dėka*) |
 * | manner | *kaip* + nom (likeness), *su* + ins (mode), bare ins (means, measure) |
 * | instrumental | bare ins; privative *be* + gen |
 * | terminus | bare dat, or the verb's `terminus_case` / `terminus_prep` + `terminus_prep_case` |
 * | comitative, opponent | *su* + ins (the verb's `opponent_prep` over it) |
 * | topic | *apie* + acc, or the verb's `topic_prep` + `topic_prep_case` |
 * | purpose | the bare dative (verify) |
 * | temporal | by relation (`TEMPORAL`); `at` is the noun's `temporal_prep` / `temporal_case`, else the bare acc |
 * | role | *kaip* + nom |
 *
 * A place noun may name its own locative preposition (`place_prep` + `place_prep_case`, *ant stalo*
 * for a surface) (verify). `head` is the complement's first conjunct's forms; `verb` the governing
 * verb's.
 */
export function complementGovernment(
  type: ComplementType, c: ResolvedComplement, head: Record<string, string>, verb: Record<string, string> = {},
): Government {
  const asCase = (k: string | undefined, fallback: Case): Case => (k as Case | undefined) ?? fallback;
  switch (type) {
    case 'locative': {
      const spec = pathSpecifier(c, DEFAULT_LOCATIVE_SPECIFIER);
      return spec === 'in' && head['place_prep'] ? { prep: head['place_prep'], case: asCase(head['place_prep_case'], 'gen') } : PLACE[spec];
    }
    case 'direction': {
      const spec = directionSpecifier(c);
      if (spec) return GOAL[spec];
      return head['human'] === '1' || (head['person'] !== undefined && head['thing'] !== '1') ? PERSON_GOAL : PLAIN_GOAL;
    }
    case 'source': {
      const spec = c.specifiers?.find((s) => s.kind === 'path')?.value;
      return spec && spec in SOURCE ? SOURCE[spec as keyof typeof SOURCE] : PLAIN_SOURCE;
    }
    case 'route': {
      const spec = pathSpecifier(c);
      return spec === 'through' ? { prep: 'per', case: 'acc' } : PLACE[spec];
    }
    case 'cause': return CAUSE[causeSentiment(c)];
    case 'manner': return MANNER[mannerRelation(head)];
    case 'instrumental': return isPrivative(type, c) ? PRIVATIVE : COMPLEMENT_GOVERNMENT.instrumental!;
    case 'terminus':
      if (verb['terminus_prep']) return { prep: verb['terminus_prep'], case: asCase(verb['terminus_prep_case'], 'gen') };
      return { prep: '', case: asCase(verb['terminus_case'], 'dat') };
    case 'topic':
      return c.link ? { prep: c.link, case: asCase(verb['topic_prep_case'], 'acc') } : COMPLEMENT_GOVERNMENT.topic!;
    case 'opponent':
      return c.link ? { prep: c.link, case: asCase(verb['opponent_prep_case'], 'ins') } : COMPLEMENT_GOVERNMENT.opponent!;
    case 'temporal': {
      const relation = temporalRelation(c);
      if (relation === 'at' && head['temporal_prep']) return { prep: head['temporal_prep'], case: asCase(head['temporal_prep_case'], 'gen') };
      if (relation === 'at' && head['temporal_case']) return { prep: '', case: asCase(head['temporal_case'], 'acc') };
      return TEMPORAL[relation];
    }
    default:
      return COMPLEMENT_GOVERNMENT[type] ?? { prep: '', case: 'nom' };
  }
}
