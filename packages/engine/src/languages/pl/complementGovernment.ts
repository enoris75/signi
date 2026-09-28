import { DEFAULT_LOCATIVE_SPECIFIER, type ComplementType } from '@signi/shared';
import type { ResolvedComplement } from '../../types.js';
import { causeSentiment } from '../../functions/causeSentiment.js';
import { directionSpecifier } from '../../functions/directionSpecifier.js';
import { isPrivative } from '../../functions/isPrivative.js';
import { mannerRelation } from '../../functions/mannerRelation.js';
import { pathSpecifier } from '../../functions/pathSpecifier.js';
import { temporalRelation } from '../../functions/temporalRelation.js';
import { CAUSE, COMPLEMENT_GOVERNMENT, GOAL, MANNER, PLACE, PLAIN_GOAL, PLAIN_SOURCE, PRIVATIVE, SOURCE, TEMPORAL } from './pl.consts.js';
import type { Case, Government } from './pl.types.js';

/**
 * The preposition a complement takes and the case it governs (P05 §2.3):
 *
 * | complement | Polish |
 * |---|---|
 * | locative | *w* + loc; *na* + loc, *pod / nad / za / przed* + ins, *wokół* + gen |
 * | direction | *do* + gen; a relation with the accusative of motion (*pod dom*, *na dom*) |
 * | source | *od* + gen; a relation fused with *z* (*z domu*, *spod domu*, *zza domu*) |
 * | route | *przez* + acc; a relation as the locative's (*pod mostem*) |
 * | cause | *z powodu* + gen, *dzięki* + dat, *przez* + acc (fault) |
 * | manner | *jak* + nom (likeness), *z* + ins (mode, measure), bare ins (means) |
 * | instrumental | bare ins; privative *bez* + gen |
 * | terminus | bare dat, or the verb's `terminus_case` / `terminus_prep` + `terminus_prep_case` |
 * | comitative, opponent | *z* + ins (the verb's `opponent_prep` over it) |
 * | topic | *o* + loc, or the verb's `topic_prep` + `topic_prep_case` |
 * | purpose | *dla* + gen |
 * | temporal | by relation (`TEMPORAL`); `at` is the noun's `temporal_prep` (+ `temporal_prep_case`), else *w* + loc |
 * | role | *jako* + nom |
 *
 * A place noun may name its own locative preposition (`place_prep`, *na poczcie*), taking the
 * locative. `head` is the complement's first conjunct's forms; `verb` the governing verb's.
 */
export function complementGovernment(
  type: ComplementType, c: ResolvedComplement, head: Record<string, string>, verb: Record<string, string> = {},
): Government {
  const asCase = (k: string | undefined, fallback: Case): Case => (k as Case | undefined) ?? fallback;
  switch (type) {
    case 'locative': {
      const spec = pathSpecifier(c, DEFAULT_LOCATIVE_SPECIFIER);
      return spec === 'in' && head['place_prep'] ? { prep: head['place_prep'], case: 'loc' } : PLACE[spec];
    }
    case 'direction': {
      const spec = directionSpecifier(c);
      return spec ? GOAL[spec] : PLAIN_GOAL;
    }
    case 'source': {
      const spec = c.specifiers?.find((s) => s.kind === 'path')?.value;
      return spec && spec in SOURCE ? SOURCE[spec as keyof typeof SOURCE] : PLAIN_SOURCE;
    }
    case 'route': {
      const spec = pathSpecifier(c);
      return spec === 'through' ? { prep: 'przez', case: 'acc' } : PLACE[spec];
    }
    case 'cause': return CAUSE[causeSentiment(c)];
    case 'manner': return MANNER[mannerRelation(head)];
    case 'instrumental': return isPrivative(type, c) ? PRIVATIVE : COMPLEMENT_GOVERNMENT.instrumental!;
    case 'terminus':
      if (verb['terminus_prep']) return { prep: verb['terminus_prep'], case: asCase(verb['terminus_prep_case'], 'gen') };
      return { prep: '', case: asCase(verb['terminus_case'], 'dat') };
    case 'topic':
      return c.link ? { prep: c.link, case: asCase(verb['topic_prep_case'], 'loc') } : COMPLEMENT_GOVERNMENT.topic!;
    case 'opponent':
      return c.link ? { prep: c.link, case: asCase(verb['opponent_prep_case'], 'ins') } : COMPLEMENT_GOVERNMENT.opponent!;
    case 'temporal': {
      const relation = temporalRelation(c);
      if (relation === 'at' && head['temporal_prep']) return { prep: head['temporal_prep'], case: asCase(head['temporal_prep_case'], 'loc') };
      return TEMPORAL[relation];
    }
    default:
      return COMPLEMENT_GOVERNMENT[type] ?? { prep: '', case: 'nom' };
  }
}
