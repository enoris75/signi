import { VOWEL_START } from './fr.consts.js';

// A pronominal verb's own clitic, leading its form: "se rappelle", "s'est rappelé", "nous rappelons".
const LEADING_REFLEXIVE = /^(me |te |se |nous |vous |m'|t'|s')/;
const UNELIDED: Record<string, string> = { "m'": 'me', "t'": 'te', "s'": 'se' };

/** A clitic, eliding me/te/le/la/se → m'/t'/l'/s' against a vowel-initial word ("m'aime") or "y" ("s'y"). */
function clitic(word: string, before: string): string {
  return /^(me|te|le|la|se)$/.test(word) && (VOWEL_START.test(before) || before === 'y ') ? `${word[0]}'` : `${word} `;
}

/**
 * Place an object clitic before a finite verb: inside any leading "ne "/"n'" bracket ("ne me voit
 * pas"), and eliding me/te/le/la/se → m'/t'/l'/s' before a vowel-initial verb ("m'aime"). The "ne"
 * is judged again against the clitic that now follows it, so one elided against the verb comes back
 * whole ("ne m'aime pas", not "n'm'aime"). A cluster elides only its last clitic ("me l'a", "le lui a").
 * A no-op when there is no clitic.
 *
 * A pronominal verb's own clitic stays first, as French orders them ("se le rappelle", "ne se le
 * rappelle pas", "se l'est rappelé"), and it is judged again against the object clitic that now
 * follows it, as "ne" is: "s'est rappelé" gives "se l'est rappelé" (localization B86).
 */
export function frCliticize(object: string, verb: string): string {
  if (!object) return verb;
  const m = /^(ne |n')/.exec(verb);
  const afterNe = m ? verb.slice(m[0].length) : verb;
  const r = LEADING_REFLEXIVE.exec(afterNe);
  const rest = r ? afterNe.slice(r[0].length) : afterNe;
  // A cluster ("me le", "le lui", A359) elides its last clitic, the one against the verb: "me l'a donné".
  const lead = object.slice(0, object.lastIndexOf(' ') + 1);
  const c = lead + clitic(object.slice(lead.length), rest);
  const reflexive = r ? clitic(UNELIDED[r[0]] ?? r[0].trim(), c) : '';
  const first = reflexive || c;
  // "y" elides the "ne" before it too ("n'y est pas"), though it is no vowel to VOWEL_START.
  const ne = !m ? '' : VOWEL_START.test(first) || first === 'y ' ? "n'" : 'ne ';
  return `${ne}${reflexive}${c}${rest}`;
}
