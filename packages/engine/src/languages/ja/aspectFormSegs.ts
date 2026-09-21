import type { Aspect } from '@signi/shared';
import type { ConceptForms, RubySegment } from '../../types.js';
import type { JaForm } from './ja.types.js';
import { volitionalSeg } from './volitionalSeg.js';
import { wordSeg } from './wordSeg.js';

/**
 * A non-neutral aspect in the form a modal governs (B07). A modal suffixes the predicate and takes the
 * tense and polarity itself, so the aspect only has to stand in the modal's form: the dictionary form
 * 〜必要がある and 〜ことができる attach to (`dict`), or the stem 〜たい attaches to (`stem`). Each aspect
 * builds on the auxiliary いる (dictionary いる, stem い), exactly as its plain form does (see
 * `aspectVerbSegs`):
 *   progressive → 〜ている: 食べている必要があります, 食べていることができます, 食べていたいです
 *   resultative → the resultant state 〜ている as well, "needs to have eaten" (登録している必要がある);
 *                 the past a finite perfect takes (食べました) cannot stand under a modal
 *   prospective → 〜ようとしている on the volitional: 食べようとしている必要があります, 食べようとしていたいです;
 *                 with no nai-form to build the volitional on, ところ + である / であり
 */
export function aspectFormSegs(verb: ConceptForms, aspect: Exclude<Aspect, 'neutral'>, form: JaForm): RubySegment[] {
  const dictSeg = wordSeg(verb.forms['base'] ?? '', verb.forms['reading']);
  const iru = form === 'dict' ? 'いる' : 'い';
  if (aspect === 'prospective') {
    const volitional = volitionalSeg(verb);
    if (volitional) return [volitional, { t: 'として' }, { t: iru }];
    return [dictSeg, { t: 'ところ' }, { t: form === 'dict' ? 'である' : 'であり' }];
  }
  const te = verb.forms['te'];
  return [te ? wordSeg(te, verb.forms['te_reading']) : dictSeg, { t: iru }];
}
