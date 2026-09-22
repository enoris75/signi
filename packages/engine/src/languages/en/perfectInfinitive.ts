import type { Aspect } from '@signi/shared';

/**
 * The main verb's whole group as a perfect infinitive — what a conditional modal governs in the past,
 * where it has no past form of its own: "should **have run**", "might **have been running**". The
 * perfect is the past, so a resultative adds nothing to it ("should have run" either way), and the
 * perfect always takes "have": "should have gone", never the "be gone" of a state (compare
 * `verbGroupInfinitive`).
 */
export function perfectInfinitive(verbForms: Record<string, string>, aspect: Aspect): string {
  const base = verbForms['base'] ?? '';
  switch (aspect) {
    case 'progressive': return `have been ${verbForms['gerund'] ?? base}`;
    case 'prospective': return `have been about to ${base}`;
    default:            return `have ${verbForms['participle'] ?? base}`;
  }
}
