import type { ConceptSeed } from '../types.js';
import { transitiveVerbs } from './transitive.js';
import { intransitiveVerbs } from './intransitive.js';
import { ditransitiveVerbs } from './ditransitive.js';
import { motionVerbs } from './motion.js';
import { modals } from './modals.js';

// A verb is defined by its dictionary citation, an infinitive (`/inf`, PhrasePlan.infinitive) whose
// verb is the genus and whose object is the differentia, rendered bare — `/inf /verb ( CONSUME ) /obj
// ( FOOD /zero )` → en "to consume food", it "consumare cibo", de "Nahrung konsumieren", ja
// "食べ物を摂取する" (localization B08). A mass object stays singular; a count noun reads bare only in
// the plural, `/obj ( OBJECT_THING /pl /zero )` → "to create objects", not "to create object".
// Beyond the object the differentia is whatever the verb phrase can hold: adjectives on the object
// ("to understand written words"), an instrument ("to acquire objects with money"), an adverb ("to
// strike repeatedly"). The shapes that take a second period:
//
//  - **A governed infinitive** — `/to #2`, "to desire to act"; under BE a predicate adjective may
//    govern it instead, `/inf /verb ( BE ) /pred ( ABLE ) /to #2` → "to be able to act", it "essere
//    capace di agire" (C09; see modals.ts).
//  - **A purpose** — `/so #2`, "to write content to load it", de "Inhalt schreiben, um ihn zu
//    laden": an adjunct, not a governed clause. A third-person pronoun object in it stands for the
//    governing object, and takes its gender in each language (C19, C20).
//  - **A causative** — CAUSE_VERB with its causee as the object and an object-controlled infinitive,
//    `/inf /verb ( CAUSE_VERB ) /obj ( PERSON /a ) /to #2 /objctl` over `/inf /verb ( SEE ) /obj (
//    OBJECT_THING /pl /zero )` → en "to cause a person to see objects", it "indurre una persona a
//    vedere oggetti", de "eine Person veranlassen, Gegenstände zu sehen", ja 人が物体を見るようにする
//    (C08). The infinitive's unspoken subject is the causee, not the causer, which is what sets it
//    apart from the subject control the modals use; only Japanese says the difference.
export const verbs: ConceptSeed[] = [
  ...transitiveVerbs,
  ...intransitiveVerbs,
  ...ditransitiveVerbs,
  ...motionVerbs,
  ...modals,
];

export { NONFINITE } from './nonfinite.js';
