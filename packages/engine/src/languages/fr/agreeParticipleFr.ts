/** Agree an être-selecting past participle with the subject: allé → allée / allés / allées. */
export function agreeParticipleFr(base: string, subjectForms: Record<string, string>): string {
  if (!base) return '';
  const fem = (subjectForms['gender'] ?? 'masc') === 'fem';
  const plural = (subjectForms['number'] ?? 'singular') === 'plural';
  return `${base}${fem ? 'e' : ''}${plural ? 's' : ''}`;
}
