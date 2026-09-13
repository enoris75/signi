/** The comparative stem: "-er", or a bare "-r" on a base already ending in -e (müde → müder). */
export function deComparative(base: string): string {
  return base.endsWith('e') ? `${base}r` : `${base}er`;
}
