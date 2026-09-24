export function isPlural(forms: Record<string, string>): boolean {
  // A `no`-determined phrase is always singular in Italian: the negative quantifier "nessuno" has no
  // plural, so a requested plural is ignored ("nessun topo", never the mismatched "nessun topi").
  // A plurale tantum has no singular to fall back on, and takes the rare plural "nessune notizie".
  if (forms['definiteness'] === 'no') return forms['count'] === 'plural';
  return (forms['number'] ?? forms['count']) === 'plural';
}
