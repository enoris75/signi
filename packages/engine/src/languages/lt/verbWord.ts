/**
 * The reflexive *-si* on an affirmative form, by its ending (P18 §2.2): the vowel it closes on is
 * lengthened or kept, a 1st/2nd plural *-me / -te* takes *-s* (*prausiamės*), a 2nd singular *-i*
 * becomes *-iesi* and a 1st singular *-u* *-uosi*. Checked in order, longest ending first.
 */
const SI_ENDINGS: ReadonlyArray<readonly [RegExp, string]> = [
  [/me$/, 'mės'], // prausiame → prausiamės; prauskime → prauskimės; praustume → praustumės
  [/te$/, 'tės'], // prausiate → prausiatės; prauskite → prauskitės
  [/um$/, 'umeisi'], // praustum → praustumeisi
  [/k$/, 'kis'], // prausk → prauskis
  [/os$/, 'osi'], // prausdamos → prausdamosi
  [/s$/, 'sis'], // praus (future) → prausis; prausdamas → prausdamasis; prausęs → prausęsis
  [/au$/, 'ausi'], // prausiau → prausiausi; prausčiau → prausčiausi
  [/ai$/, 'aisi'], // mokai → mokaisi; prausdavai → prausdavaisi
  [/ei$/, 'eisi'], // prausei → prauseisi
  [/u$/, 'uosi'], // prausiu → prausiuosi
  [/i$/, 'iesi'], // prausi → prausiesi; prausdami → prausdamiesi
  [/a$/, 'asi'], // prausia → prausiasi
  [/o$/, 'osi'], // mokosi; prausdavo → prausdavosi
  [/ė$/, 'ėsi'], // prausė → prausėsi
  [/ų$/, 'ųsi'], // praustų → praustųsi
  [/ę$/, 'ęsi'], // prausę → prausęsi
];

/** *būti*'s present, whose negation fuses (*nesu, nesi, nesame, nesate*; *yra → nėra*). */
const BUTI_NEGATED: Readonly<Record<string, string>> = {
  esu: 'nesu', esi: 'nesi', yra: 'nėra', esame: 'nesame', esate: 'nesate',
};

/**
 * One verb form as the clause writes it (P18 §2.2), from the bare stored cell:
 *
 * - negated, *ne-* is written together (*valgo → nevalgo*, *suvalgė → nesuvalgė*); *būti*'s present
 *   fuses (*nesu, nėra*) and a form of *eiti* (opening on *ei-* or *ėj-*) contracts (*neina, nėjo,
 *   neis*) (verify: a rarer verb opening on *ei-*, *eikvoti*, would contract too);
 * - a **suffix reflexive** (`reflexive`, style-lt.md) takes *-si* after an affirmative form by its
 *   ending (`SI_ENDINGS`: *prausia → prausiasi*, *prausiu → prausiuosi*, *prausk → prauskis*), and
 *   under negation *-si-* moves in after *ne-* on the bare form (*nesiprausia*, *nesiprausk*). The
 *   infinitive is stored with its *-tis* already (*praustis*), and negated loses it (*nesiprausti*).
 *
 * A prefix reflexive (*nusiprausti*) is stored whole and is no `reflexive` here: plain *ne-*
 * (*nenusiprausė*).
 */
export function verbWord(form: string, negated: boolean, reflexive = false): string {
  if (!form) return form;
  const infinitive = reflexive && form.endsWith('tis');
  if (negated) {
    if (reflexive) return `nesi${infinitive ? form.slice(0, -1) : form}`;
    const fused = BUTI_NEGATED[form];
    if (fused) return fused;
    if (/^(ei|ėj)/.test(form)) return `n${form}`;
    return `ne${form}`;
  }
  if (!reflexive || infinitive) return form;
  for (const [ending, replacement] of SI_ENDINGS) {
    if (ending.test(form)) return form.replace(ending, replacement);
  }
  return `${form}si`;
}
