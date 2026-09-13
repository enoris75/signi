/**
 * Apocope: "primero" and "tercero" lose their final -o immediately before a masculine
 * singular noun ("el primer día", but "la primera vez", "los primeros días"). It happens
 * only in that prenominal position — the postnominal and predicate forms keep the -o.
 */
export function apocopate(concept: string, surface: string, gender: string, plural: boolean): string {
  if (plural || gender === 'fem') return surface;
  if (concept !== 'FIRST' && concept !== 'THIRD') return surface;
  return surface.endsWith('o') ? surface.slice(0, -1) : surface;
}
