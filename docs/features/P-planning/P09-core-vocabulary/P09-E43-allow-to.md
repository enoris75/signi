# P09-E43. *Allow the cat to run* — an infinitive controlled by a dative object

**Construct:** object control where the controller is an indirect object: *permette **al** gatto
**di** correre*, *permet **au** chat **de** courir*, *erlaubt **dem** Kater zu laufen*, *permite
**al** gato correr*.
**Shape:** the shipped object control (`InfinitiveControl: 'object'`) plus the governing verb's
lexical object case (C35) and `infinitive_link`, read together.
**Scope:** all 7 languages.
**Status:** planning, unscheduled. Filed 2026-09-24 from
[P09-E24](Z-done/P09-E24-ranks-201-400.md)'s §3.
**Words:** *allow* (rank 346, with a person and an infinitive; ALLOW with a thing is seeded by
[B85](../../../localization/B-needs-seed/B85-pay-provide-spend-win-lose-thank-allow.md)). The same
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

**Proposed** in the first column; the other two are the engine's output (HELP_VERB and TELL with an
object-controlled infinitive).

## Why

"Allow / help / tell someone to do something" is one of the commonest verb frames, and the Romance
languages mark it twice: the controller's case (*al, au*) and the infinitive's link (*di, de, a*).
German already gets HELP right, because C35's `object_case: 'dat'` is on *helfen*; the Romance link
and case are missing, and TELL picks its *narrate* lexeme (*raccontare, raconter, erzählen*), which
cannot take an infinitive at all.

## Today

Verified at 1229928, 2026-09-24.

- [`InfinitiveControl`](../../../../packages/shared/src/index.ts#L1296) `'object'` exists (the
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
