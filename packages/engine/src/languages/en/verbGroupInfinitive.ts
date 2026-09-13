import type { Aspect } from '@signi/shared';

/**
 * The main verb's whole group as an infinitive — what a modal governs. For the neutral
 * aspect that is the bare base ("must **go**"); the marked aspects put their auxiliary in
 * the infinitive and keep their own non-finite form ("must **be going**", "must **have
 * seen**", "must **be gone**" for the verbs whose perfect selects BE).
 */
export function verbGroupInfinitive(verbForms: Record<string, string>, aspect: Aspect): string {
  const base = verbForms['base'] ?? '';
  switch (aspect) {
    case 'progressive': return `be ${verbForms['gerund'] ?? base}`;
    case 'prospective': return `be about to ${base}`;
    case 'resultative': return `${verbForms['aux'] === 'be' ? 'be' : 'have'} ${verbForms['participle'] ?? base}`;
    default:            return base;
  }
}
