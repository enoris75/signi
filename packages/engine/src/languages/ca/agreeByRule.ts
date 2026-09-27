/** The plural of a feminine in -a: *-es*, with the spelling kept (*-ca → -ques, -ga → -gues, -ça → -ces, -ja → -ges*). */
function femPlural(fem: string): string {
  const stem = fem.slice(0, -1);
  if (stem.endsWith('c')) return `${stem.slice(0, -1)}ques`;
  if (stem.endsWith('g')) return `${stem}ues`;
  if (stem.endsWith('ç')) return `${stem.slice(0, -1)}ces`;
  if (stem.endsWith('j')) return `${stem.slice(0, -1)}ges`;
  return `${stem}es`;
}

/**
 * The regular agreement of a masculine singular adjective or participle, for a form the lexeme does
 * not store: *-at / -it / -ut* voice their *t* (*menjat, menjada, menjats, menjades*); an adjective in
 * *-e* or a consonant after *-e* is taken as invariable in gender (*feliç*, *gran* are stored anyway);
 * otherwise *+a / +s / -es* (*junt, junta, junts, juntes*). *(verify)*: the column stores every
 * adjective in full, so this is a fallback.
 */
export function agreeByRule(base: string, fem: boolean, plural: boolean): string {
  if (!base) return '';
  const femForm = /[aiuï]t$/.test(base) ? `${base.slice(0, -1)}da`
    : base.endsWith('e') ? base
    : `${base}a`;
  if (!plural) return fem ? femForm : base;
  if (fem) return femForm.endsWith('a') ? femPlural(femForm) : `${femForm}s`;
  return /(s|ç|x|sc|st)$/.test(base) ? `${femForm.slice(0, -1)}os` : `${base}s`;
}
