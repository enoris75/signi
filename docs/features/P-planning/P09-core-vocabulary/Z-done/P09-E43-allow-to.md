# P09-E43. *Allow the cat to run* — an infinitive controlled by a dative object

**Construct:** object control where the controller is an indirect object: *permette **al** gatto
**di** correre*, *permet **au** chat **de** courir*, *erlaubt **dem** Kater zu laufen*, *permite
**al** gato correr*.
**Shape:** the shipped object control (`InfinitiveControl: 'object'`) plus the governing verb's
lexical object case (C35) and `infinitive_link`, read together.
**Scope:** all 7 languages.
**Status:** **shipped, 2026-09-24** — engine and seed, all seven languages; plan-only for the
controller (the builder never sets `control: 'object'`); see [Done](#done). Filed 2026-09-24 from
[P09-E24](P09-E24-ranks-201-400.md)'s §3.
**Words:** *allow* (rank 346, with a person and an infinitive; ALLOW with a thing is seeded by
[B85](../../../../localization/B-needs-seed/B85-pay-provide-spend-win-lose-thank-allow.md)). The same
construct serves HELP_VERB (*aiuta il gatto a correre*) and TELL (*dice al gatto di correre*).

| lang | the man **allows the cat to run** (proposed) | the man helps the cat to run (engine) | the man tells the cat to run (engine) |
|---|---|---|---|
| en | the man allows the cat to run | the man helps the cat to run | the man tells the cat to run |
| it | l'uomo permette al gatto di correre | l'uomo aiuta il gatto correre ✗ | l'uomo racconta il gatto correre ✗ |
| fr | l'homme permet au chat de courir | l'homme aide le chat courir ✗ | l'homme raconte le chat courir ✗ |
| de | der Mann erlaubt dem Kater zu laufen | der Mann hilft dem Kater zu laufen | der Mann erzählt den Kater zu laufen ✗ |
| es | el hombre permite al gato correr | el hombre ayuda el gato correr ✗ | el hombre cuenta el gato correr ✗ |
| pt | o homem permite ao gato correr | o homem ajuda o gato correr ✗ | o homem conta o gato correr ✗ |
| ja | 男は猫に走ることを許します | 男は猫が走ることを手伝います | 男は猫が走ることを伝えます |

**Proposed at filing** in the first column; the other two were the engine's output at 1229928
(HELP_VERB and TELL with an object-controlled infinitive). All three are now as the Done table shows.

## Done

Shipped 2026-09-24. D1–D3 as ruled. The engine's output now (`the man` + verb + `the cat` + an
object-controlled RUN; the fourth column is the past negated, the fifth a pronoun controller):

| lang | allows the cat to run | helps the cat to run | tells the cat to run | did not allow the cat to run | allows her to run |
|---|---|---|---|---|---|
| en | the man allows the cat to run. | the man helps the cat to run. | the man tells the cat to run. | the man did not allow the cat to run. | the man allows her to run. |
| it | l'uomo permette al gatto di correre. | l'uomo aiuta il gatto a correre. | l'uomo dice al gatto di correre. | l'uomo non permise al gatto di correre. | l'uomo le permette di correre. |
| fr | l'homme permet au chat de courir. | l'homme aide le chat à courir. | l'homme dit au chat de courir. | l'homme ne permit pas au chat de courir. | l'homme lui permet de courir. |
| de | der Mann erlaubt dem Kater zu laufen. | der Mann hilft dem Kater zu laufen. | der Mann sagt dem Kater zu laufen. | der Mann erlaubte dem Kater nicht zu laufen. | der Mann erlaubt ihr zu laufen. |
| es | el hombre permite al gato correr. | el hombre ayuda al gato a correr. | el hombre manda al gato correr. | el hombre no permitió al gato correr. | el hombre le permite correr. |
| pt | o homem permite ao gato correr. | o homem ajuda o gato a correr. | o homem diz ao gato para correr. | o homem não permitiu ao gato correr. | o homem permite a ela correr. ✗ |
| ja | 男は猫に走ることを許します。 | 男は猫が走ることを手伝います。 | 男は猫に走るように言います。 | 男は猫に走ることを許しませんでした。 | 男は彼女に走ることを許します。 |

Without an infinitive ALLOW takes a plain object in all seven (*permette il cibo*, *erlaubt das
Essen*, 食べ物を許します), TELL still narrates (*racconta la storia*), and LET renders exactly as before
(*lascia il gatto correre*, *lässt den Kater laufen*, 猫を走らせます). ALLOW's definition is B85's
"to let a person act" (*lasciare una persona agire*, 人を行動させる).

What landed differently from the plan:

1. **The dative is read in the translator, not in each Romance engine.**
   [`controllerCase`](../../../../../packages/engine/src/translator/functions/controllerCase.ts), called
   from `resolvePhrase` under object control only, turns the lexeme's `object_case: 'dat'` into the
   dative `object_prep` (*a*, fr *à*) the Romance engines already render — contraction (*al, au, ao,
   ai, aux, aos*) and, in Italian and French, the dative clitic (*le permette*, *lui permet*) came
   free. Japanese reads `object_case: 'dat'` itself, marking the controller に in place of が
   (`buildClauseSegments`).
2. **German ALLOW names `controller_case: 'dat'`, not `object_case`.** German declines `object_case`
   wherever the object is (C35), and *erlauben* takes a thing in the accusative (*erlaubt das
   Essen*); `object_case: 'dat'` would have written *erlaubt dem Essen*. `controllerCase` turns the new
   key into `object_case` under object control only. TELL_ORDER's *sagen* takes a dative whatever
   follows, so it names `object_case` as *helfen* does.
3. **Spanish gained a dative clitic** (*le / les*, seeded on THIRD_PERSON as `dative` /
   `dative_plural`, read by `es/predicateText` for an object taken with *a*): "le permite correr", not
   "permite a ella correr". **Portuguese did not** — its enclisis rules (*vê-lo*) would need the same
   care for *lhe*, so a pronoun controller stays the tonic "permite a ela correr" (✗ in the table;
   Brazilian speech accepts it, the norm wants *lhe permite*). Reported, not fixed.
4. **TELL_ORDER is a `senseOf` concept selected by a new lexeme key, `infinitive_sense`**, read by
   `resolveVerbPhrase` beside A131's `object_sense` and A157's `subject_sense`, when the clause governs
   an infinitive. Every TELL lexeme names it. Its lexemes: *tell*, *dire di*, *dire de*, *sagen*,
   **es *mandar***, 言う + ように, *dizer para*. Spanish *decir* takes a finite clause (*le dice al gato
   que corra*), which an infinitive complement cannot render, so the Spanish lexeme is *mandar*, which
   governs the infinitive (*manda al gato correr*). Japanese reports the instruction with ように
   (`infinitive_link`), not こと.
5. **HELP_VERB's Spanish takes the personal *a* for every object** (`object_a`), which the ruling's
   *ayuda al gato* needs and which changes the plain *el gato ayuda al perro* too. Two expected strings
   in `lexical-case.test.ts` moved (see the report).
6. **Plan-only for the controller.** The builder's infinitive link never sets `control: 'object'`,
   and `clauseObject` holds one kind, so TELL (`'content'`) cannot offer *to* at all. ALLOW is
   therefore seeded without `clauseObject`, like LET and CAUSE_VERB, and the construct is reached by a
   plan. A builder control for object control is a follow-up.
7. Unit tests: `infinitive-complement.test.ts` (the table above, plural contraction with the
   infinitive's own object, pronouns, the plain object, conjugation and compound past, LET's regression,
   ALLOW's definition), `controllerCase.test.ts`, `resolveVerbPhrase.test.ts` (the sense), the backend's
   `index.test.ts` (every `infinitive_sense` names a sense of its verb), and `verb.test.ts`'s Italian
   resultative table (*ha permesso*, *ha detto*). `hypothetical.test.ts`'s IRREGULAR map gained
   TELL_ORDER (*dizer*, *disséssemos*).

## Why

"Allow / help / tell someone to do something" is one of the commonest verb frames, and the Romance
languages mark it twice: the controller's case (*al, au*) and the infinitive's link (*di, de, a*).
German already gets HELP right, because C35's `object_case: 'dat'` is on *helfen*; the Romance link
and case are missing, and TELL picks its *narrate* lexeme (*raccontare, raconter, erzählen*), which
cannot take an infinitive at all.

## Today

Verified at 1229928, 2026-09-24.

- [`InfinitiveControl`](../../../../../packages/shared/src/index.ts#L1375) `'object'` exists (the
  causative, C08; LET, C36). Probed: LET renders *lascia il gatto correre, laisse le chat courir,
  lässt den Kater laufen*, 猫を走らせます, which is right for a bare-infinitive causative.
- HELP_VERB (`object_case: 'dat'` in German) renders the second column: German right, the four
  Romance languages missing *a* (it/es/pt) or *à* (fr) before the infinitive, and Spanish the personal
  *a* before the person.
- TELL (third column) chooses its *narrate* lexeme under an infinitive.

## Design

### D1. The controller's case

**Recommendation: the governing lexeme names `object_case: 'dat'`** (C35's key) in it/fr/es/pt for
ALLOW and TELL, and the Romance engines, which today read it only in German, learn it: *al gatto, au
chat, al gato, ao gato*. HELP keeps an accusative in Romance (*aiuta il gatto*).

### D2. The infinitive's link

**Recommendation: `infinitive_link`** on the lexemes (*di, de, a, a*), which TRY already uses, read
under object control too.

### D3. TELL's lexeme

**Recommendation: a `senseOf` split** (A131's mechanism): TELL_ORDER (*dire di, dire de, sagen …
zu, decir que*, 言う, *dizer para*), selected when TELL governs an infinitive.

## Engine

- Romance engines: read `object_case` and `infinitive_link` under object control.
- Backend: ALLOW's lexemes (from B85 plus D1–D2), TELL_ORDER.

## Tests

`infinitive-complement.test.ts`: ALLOW, HELP_VERB, TELL with an object-controlled infinitive, seven
languages; LET unchanged.

## Verification

Engine suite green; LET's and the causatives' shipped glosses unchanged (they are accusative, bare).

## Out of scope (follow-ups)

- ***Ask someone to*** — ASK has the same frame (*chiedere a qualcuno di*), next once this lands.
- **The Japanese に of ALLOW** (猫に走ることを許す) is D1 in Japanese; if ALLOW's lexeme names it, it
  comes free.
