import type { VerbComplex } from './gsw.types.js';

/**
 * The verb complex of a **passive**, from the complex the clause would have built for "werden".
 *
 * German's passive auxiliary is *werden*, not *sein* — "die Tür wird geschlossen" is the event
 * (someone is closing it) where "die Tür ist geschlossen" is the resulting state — so the clause
 * conjugates BECOME and the lexical verb comes along as its Partizip II. Everything the finite slot
 * does has already been done to *werden* by `verbGroup` / `modalVerbGroup`; all that is left is to
 * put the participle at the head of the clause-final material, which is where German wants it:
 *
 *   present    wird gegessen           past       wurde gegessen
 *   future     wird gegessen werden    resultative ist gegessen worden
 *   modal      muss gegessen werden    conditional würde gegessen werden
 *
 * The **resultative** takes the Ersatzform: *werden*'s own participle is "geworden", but the one it
 * lends the passive perfect is the bare "worden" ("ist gegessen worden", never "*ist gegessen
 * geworden"). It is a form of the auxiliary, not of the lexical verb, so it is swapped here rather
 * than seeded.
 *
 * The **prospective** frames a zu-infinitive of its own ("ist im Begriff, gegessen zu werden"), so
 * the participle leads that group instead of the tail.
 */
export function passiveComplex(complex: VerbComplex, participle: string): VerbComplex {
  if (!participle) return complex;
  const worden = (tail: string) => tail.replace(/\bworde\b/, 'worde');
  if (complex.zuInfinitive) {
    return { ...complex, zuInfinitive: `${participle} ${complex.zuInfinitive}` };
  }
  return { ...complex, tail: worden([participle, complex.tail].filter(Boolean).join(' ')) };
}
