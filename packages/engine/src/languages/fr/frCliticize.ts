import { VOWEL_START } from './fr.consts.js';

/**
 * Place an object clitic before a finite verb: inside any leading "ne "/"n'" bracket ("ne me voit
 * pas"), and eliding me/te/le/la/se → m'/t'/l'/s' before a vowel-initial verb ("m'aime"). The "ne"
 * is judged again against the clitic that now follows it, so one elided against the verb comes back
 * whole ("ne m'aime pas", not "n'm'aime"). A cluster elides only its last clitic ("me l'a", "le lui a").
 * A no-op when there is no clitic.
 */
export function frCliticize(clitic: string, verb: string): string {
  if (!clitic) return verb;
  const m = /^(ne |n')/.exec(verb);
  const rest = m ? verb.slice(m[0].length) : verb;
  // A cluster ("me le", "le lui", A359) elides its last clitic, the one against the verb: "me l'a donné".
  const lead = clitic.slice(0, clitic.lastIndexOf(' ') + 1);
  const last = clitic.slice(lead.length);
  const c = lead + (/^(me|te|le|la|se)$/.test(last) && VOWEL_START.test(rest) ? `${last[0]}'` : `${last} `);
  // "y" elides the "ne" before it too ("n'y est pas"), though it is no vowel to VOWEL_START.
  const ne = !m ? '' : VOWEL_START.test(c) || c === 'y ' ? "n'" : 'ne ';
  return `${ne}${c}${rest}`;
}
