export function isPlural(forms: Record<string, string>): boolean {
  // A `no`-determined phrase is always singular in Italian: the negative quantifier "nessuno" has no
  // plural, so a requested plural is ignored ("nessun topo", never the mismatched "nessun topi").
  if (forms['definiteness'] === 'no') return false;
  return (forms['number'] ?? forms['count']) === 'plural';
}
