import type { PhrasePlan } from "@signi/shared";

// One serialized sentence: the plan plus the id of its root container (used as a React key
// and to label "Sentence N").
export interface WorkspaceSentence {
  containerId: string;
  plan: Partial<PhrasePlan>;
}
