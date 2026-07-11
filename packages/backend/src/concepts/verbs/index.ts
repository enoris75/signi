import type { ConceptSeed } from '../types.js';
import { transitiveVerbs } from './transitive.js';
import { intransitiveVerbs } from './intransitive.js';
import { ditransitiveVerbs } from './ditransitive.js';
import { motionVerbs } from './motion.js';
import { modals } from './modals.js';

export const verbs: ConceptSeed[] = [
  ...transitiveVerbs,
  ...intransitiveVerbs,
  ...ditransitiveVerbs,
  ...motionVerbs,
  ...modals,
];

export { NONFINITE } from './nonfinite.js';
