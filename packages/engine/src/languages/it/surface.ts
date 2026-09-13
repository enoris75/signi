export function surface(forms: Record<string, string>, plural: boolean): string {
  return (plural ? forms['plural'] : forms['base']) ?? forms['base'] ?? '';
}
