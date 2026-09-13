import { VOWEL_START } from './fr.consts.js';

/**
 * Place an object clitic before a finite verb: inside any leading "ne "/"n'" bracket ("ne me voit
 * pas"), and eliding me/te/le/la/se → m'/t'/l'/s' before a vowel-initial verb ("m'aime"). The "ne"
 * is judged again against the clitic that now follows it, so one elided against the verb comes back
 * whole ("ne m'aime pas", not "n'm'aime"). A no-op when there is no clitic.
 */
export function frCliticize(clitic: string, verb: string): string {
  if (!clitic) return verb;
  const m = /^(ne |n')/.exec(verb);
  const rest = m ? verb.slice(m[0].length) : verb;
  const c = /^(me|te|le|la|se)$/.test(clitic) && VOWEL_START.test(rest) ? `${clitic[0]}'` : `${clitic} `;
  const ne = !m ? '' : VOWEL_START.test(c) ? "n'" : 'ne ';
  return `${ne}${c}${rest}`;
}
