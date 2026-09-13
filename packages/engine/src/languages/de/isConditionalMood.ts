/** True when a resolved verb phrase's mood calls for the würde-periphrasis (either half of a
 *  conditional). */
export function isConditionalMood(mood: string | undefined): boolean {
  return mood === 'conditional' || mood === 'subjunctive';
}
