import type { Aspect, Tense } from '@signi/shared';
import type { VerbComplex } from './gsw.types.js';
import { HABEN, HAETTE, HAA_PARTICIPLE, SEIN, SII_PARTICIPLE, WUERDE } from './gsw.consts.js';
import { amInfinitive } from './amInfinitive.js';
import { isConditionalMood } from './isConditionalMood.js';
import { particleGap } from './particleGap.js';
import { zuInfinitive } from './zuInfinitive.js';

/** The prospective's frame: "isch drum und dra, d Muus z frässe" — about to (verify, E14). */
export const PROSPECTIVE_MID = 'drum und dra';

/**
 * The Swiss German verb complex for a tense + aspect, split across the clause as German's is (see
 * `VerbComplex`): `v2` the finite verb, `mid` what follows it in the Mittelfeld, `tail` the
 * clause-final non-finite material. Where the German fork had three tenses, Swiss German has one
 * finite tense and a perfect:
 *
 * - **the past is the perfect** (P10 D5, E7): *haa* or *sii* + participle, the auxiliary the verb's own
 *   (`aux: 'be'`, as in German) — "d Chatz hät d Muus gfrässe", "si isch ggange". It is the present
 *   resultative's shape exactly, so the two render alike (P10 D6); the past resultative is the double
 *   perfect, "hät gfrässe ghaa" (E7 D3).
 * - **the future is the present** (P10 D8, E8): "d Chatz frisst d Muus (morn)". No *werde*.
 * - **the progressive is *am* + the nominalised infinitive** (P10 D9, E9): *sii* + "am Frässe", the
 *   *am*-phrase clause-final, so an object stands between the two — "d Chatz isch d Muus am Frässe";
 *   in the past the participle *gsii* closes it — "isch am Frässe gsii".
 * - **the conditional** (E13 D1) is *würd* + infinitive, except for a verb that stores a synthetic
 *   conditional (`<pn>_conditional`: *wär*, *hett*), which takes it: "wenn de Hund würd springe",
 *   "wenn er dihei wär".
 */
export function verbGroup(
  verbForms: Record<string, string>,
  pn: string,
  tenseAsked: Tense,
  aspect: Aspect,
  mood?: string,
): VerbComplex {
  const base = verbForms['base'] ?? '';
  const participle = verbForms['participle'] ?? base;
  // One finite tense: the future is the present (E8), and the past is carried by the perfect below.
  const past = tenseAsked === 'past';
  const conditional = isConditionalMood(mood);
  const synthetic = conditional ? verbForms[`${pn}_conditional`] : undefined;
  const periphrastic = conditional && !synthetic;
  const wuerd = WUERDE[pn] ?? 'würd';
  const beAux = verbForms['aux'] === 'be';
  const sii = SEIN.present[pn] ?? 'isch';
  const perfFinite = (beAux ? SEIN : HABEN).present[pn] ?? (beAux ? 'isch' : 'hät');
  // The conditional perfect: *hett* / *wär* + participle ("hett gfrässe", "wär ggange").
  const perfConditional = beAux ? (conditionalSii(pn) ?? 'wär') : (HAETTE[pn] ?? 'hett');
  const conjug = synthetic ?? verbForms[`${pn}_present`] ?? base;
  // A separable verb's own finite form leaves its particle for the clause to place (A138): "chunt …
  // zrugg". One written apart from its verb says so, to be rejoined with a space (B40).
  const gap = particleGap(verbForms);
  const particle = !periphrastic && verbForms['particle']
    ? { particle: verbForms['particle'], ...(gap ? { particleGap: gap } : {}) }
    : {};
  switch (aspect) {
    case 'progressive': {
      const am = amInfinitive(verbForms);
      if (conditional) return { v2: conditionalSii(pn) ?? 'wär', mid: '', tail: past ? `${am} ${SII_PARTICIPLE}` : am, zuInfinitive: '' };
      return { v2: sii, mid: '', tail: past ? `${am} ${SII_PARTICIPLE}` : am, zuInfinitive: '' };
    }
    case 'prospective':
      return {
        v2: conditional ? (conditionalSii(pn) ?? 'wär') : sii,
        mid: PROSPECTIVE_MID,
        tail: past ? SII_PARTICIPLE : '',
        zuInfinitive: zuInfinitive(verbForms),
      };
    case 'resultative':
      if (conditional) return { v2: perfConditional, mid: '', tail: past ? `${participle} ${beAux ? SII_PARTICIPLE : HAA_PARTICIPLE}` : participle, zuInfinitive: '' };
      // The past resultative is the double perfect: "hät gfrässe ghaa", "isch ggange gsii" (E7 D3).
      return { v2: perfFinite, mid: '', tail: past ? `${participle} ${beAux ? SII_PARTICIPLE : HAA_PARTICIPLE}` : participle, zuInfinitive: '' };
    default: // neutral
      // The past is the perfect (E7): the present resultative's shape.
      if (past && conditional) return { v2: perfConditional, mid: '', tail: participle, zuInfinitive: '' };
      if (past) return { v2: perfFinite, mid: '', tail: participle, zuInfinitive: '' };
      if (periphrastic) return { v2: wuerd, mid: '', tail: base, zuInfinitive: '' };
      return { v2: conjug, mid: '', tail: '', zuInfinitive: '', ...particle };
  }
}

/** *sii*'s conditional, *wär* (verify, E14): the auxiliary of a conditional progressive or prospective. */
export function conditionalSii(pn: string): string | undefined {
  return ({ '1sg': 'wär', '2sg': 'wärsch', '3sg': 'wär', '1pl': 'wäred', '2pl': 'wäred', '3pl': 'wäred' } as Record<string, string>)[pn];
}
