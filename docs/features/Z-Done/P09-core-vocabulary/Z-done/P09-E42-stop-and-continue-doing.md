# P09-E42. *Stop doing*, *continue doing* — aspectual verbs over a verb

**Construct:** a verb whose complement is another verb's activity: English takes the gerund
(*stops running*), Italian and French a linked infinitive (*smette di correre, continue à courir*),
Spanish a gerund or *dejar de* (*sigue corriendo, deja de correr*), Japanese a compound (走るのをやめる,
走り続ける).
**Shape:** a lexeme key on the governing verb naming how its infinitive complement is spelled
(`complement_form: 'gerund'` in English, `infinitive_link` elsewhere, a Japanese compound form).
**Scope:** all 7 languages.
**Status:** **shipped, 2026-09-24** — two concepts, the keys of D2–D4 and their reads, all seven
languages; the builder offers both verbs with *to* as it offers TRY; see [Done](#done). Filed
2026-09-24 from [P09-E24](P09-E24-ranks-201-400.md)'s §3.
**Words:** *stop* (rank 257) and *continue* (350), in their aspectual use. Their plain uses (*stop
the car*, *continue the work*) are seeded by
[B84](../../../../localization/done/B84-stop-wait-die-continue.md). P09's sweep noted the same
gap as the "continuative complement" only KEEP's fallback would have used.

| lang | the cat **stops running** (proposed) | the cat **continues to run** (proposed) | the cat **keeps to run** (engine: KEEP + infinitive) | the cat **tries to run** (engine: TRY) |
|---|---|---|---|---|
| en | the cat stops running | the cat continues running | the cat keeps to run ✗ | the cat tries to run |
| it | il gatto smette di correre | il gatto continua a correre | il gatto tiene correre ✗ | il gatto prova a correre |
| fr | le chat arrête de courir | le chat continue à courir | le chat garde courir ✗ | le chat essaie de courir |
| de | der Kater hört auf zu laufen | der Kater läuft weiter | der Kater behält zu laufen ✗ | der Kater versucht zu laufen |
| es | el gato deja de correr | el gato sigue corriendo | el gato conserva correr ✗ | el gato intenta correr |
| pt | o gato para de correr | o gato continua a correr | o gato guarda correr ✗ | o gato tenta correr |
| ja | 猫は走るのをやめます | 猫は走り続けます | 猫は走ることを取っておきます ✗ | 猫は走ることを試みます |

**Proposed at filing** in the first two columns; the other two were the engine's output at 1229928.
The first two are now engine output word for word (see [Done](#done)); KEEP is unchanged.

## Done

Shipped 2026-09-24. D1–D4 as ruled, with one key of D4 spelled by an existing one (item 2). The
engine's output now (subject *the cat*, governed RUN):

| lang | stops running | continues running | stopped running | continued running | does not stop running | does not continue running |
|---|---|---|---|---|---|---|
| en | the cat stops running. | the cat continues running. | the cat stopped running. | the cat continued running. | the cat does not stop running. | the cat does not continue running. |
| it | il gatto smette di correre. | il gatto continua a correre. | il gatto smise di correre. | il gatto continuò a correre. | il gatto non smette di correre. | il gatto non continua a correre. |
| fr | le chat arrête de courir. | le chat continue à courir. | le chat arrêta de courir. | le chat continua à courir. | le chat n'arrête pas de courir. | le chat ne continue pas à courir. |
| de | der Kater hört auf zu laufen. | der Kater läuft weiter. | der Kater hörte auf zu laufen. | der Kater lief weiter. | der Kater hört nicht auf zu laufen. | der Kater läuft nicht weiter. |
| es | el gato deja de correr. | el gato sigue corriendo. | el gato dejó de correr. | el gato siguió corriendo. | el gato no deja de correr. | el gato no sigue corriendo. |
| pt | o gato para de correr. | o gato continua a correr. | o gato parou de correr. | o gato continuou a correr. | o gato não para de correr. | o gato não continua a correr. |
| ja | 猫は走るのをやめます。 | 猫は走り続けます。 | 猫は走るのをやめました。 | 猫は走り続けました。 | 猫は走るのをやめません。 | 猫は走り続けません。 |

With an object of its own the governed verb brings it along: *the cats continue eating the food*,
*die Kater fressen das Essen weiter*, *siguen comiendo la comida*, 食べ物を食べ続けます, and a pronoun
one is the gerund's enclitic (*sigue comiéndola*). The compound past takes the governed verb's
auxiliary in German (*die Katze ist weitergelaufen*). TRY, NEED and DESIRE render exactly as before.

What landed differently from the plan:

1. **STOP_DOING and CONTINUE_DOING are intransitive verbs with `clauseObject: 'infinitive'`** (in
   `verbs/intransitive.ts`, after BEGIN), so the builder offers *to* on them as on TRY and nothing in
   the frontend changed. Glossed: STOP_DOING "not to continue acting" (*non continuare ad agire*,
   *nicht weiterhandeln*, 行動し続けない), CONTINUE_DOING "still to act" (KEEP's shape: *agire ancora*,
   まだ行動する). "No longer to act" was the closer STOP_DOING gloss and meets B84's NO_LONGER defect in
   Spanish and Portuguese (*no actuar ya no*).
2. **Japanese やめる's の clause is its `infinitive_link: 'のを'`**, not a new `ja_complement: 'no'`:
   the link already is "the tail that closes the nominalized clause" (ことが, ことを, ように), so の + を
   is one more value of it, and the Japanese engine needed no change for it. `ja_complement: 'stem'` is
   new, as ruled.
3. **`complement_form: 'gerund'`** is threaded by the translator onto the governed clause's verb
   phrase as `gerundComplement`, as `infinitive_bare` is (C36); English (`predicateParts`) writes the
   -ing form with no "to" and Spanish (`predicateText`) its gerund in the infinitive's place.
4. **German *weiter-* and Japanese 〜続ける are one translator step,
   [`fuseGovernedVerb`](../../../../../packages/engine/src/translator/functions/fuseGovernedVerb.ts)**:
   the governing clause keeps its subject, tense, aspect, negation and modals and takes the governed
   verb (with *weiter* prepended to its particle: *läuft weiter*, *kehrt weiter zurück*) or the
   governed stem compounded onto 続ける (走り続ける, 行動し続ける), with the governed clause's object and
   complements. German's picker word is *weitermachen* (`particle: 'weiter'`), which is also what a
   CONTINUE_DOING with no infinitive says (*der Kater macht weiter*).
5. **A German copula takes *weiter* as an adverb**, since it has no particle slot: *die Katze ist
   weiter glücklich*, never *ist glücklich weiter*. The Japanese copula has no ます stem, so
   *continues being happy* keeps the こと clause: 猫は幸せであることを続けます (grammatical; 幸せであり続けます
   would be the idiom — not built).
6. **An infinitive negated of its own does not fuse**: *continues not running* has two verbs to deny
   apart. German then says *der Kater macht weiter, nicht zu laufen* and Japanese 走らないことを続けます;
   Spanish says *sigue no corriendo* where *sigue sin correr* is the idiom. Edge cases, not in the
   table; reported, not fixed.
7. Unit tests: `infinitive-complement.test.ts` (every cell above, the object and the pronoun, the
   compound past, a separable governed verb, the copula, the citations and glosses, conjugation, and
   TRY / NEED / DESIRE unchanged), `fuseGovernedVerb.test.ts`, and `verb.test.ts`'s Italian resultative
   table (*ha smesso*, *ha continuato*).

## Why

The engine's infinitive complement is right for TRY (a linked infinitive, *prova a*, *essaie de*),
and the aspectual verbs need what it does not have: the English gerund, the Spanish gerund, German
*weiter-* as a particle on the lower verb, and the Japanese compound. KEEP, the one aspectual verb in
the corpus, renders nonsense with an infinitive (third column), because its lexeme is "keep an
object".

## Today

Verified at 1229928, 2026-09-24.

- `PhrasePlan.infinitiveComplement` and the lexeme's `infinitive_link` (*a, de, di*) exist: TRY,
  NEED and DESIRE use them (P09-E12 D9). No lexeme names a gerund complement, and no English engine
  path writes *-ing* after a finite verb (the progressive *is running* is an aspect, not a
  complement).
- Japanese writes an infinitive complement as a こと clause (走ることを試みます), which is right for
  TRY and wrong for やめる (の) and 続ける (the stem compound).

## Design

### D1. Which verbs

**Recommendation: STOP_DOING and CONTINUE_DOING as their own concepts** (P09 D2: the words differ,
*smettere / fermare*, *dejar de / detener*, やめる / 止める), marked `clauseObject: 'infinitive'`, with
their lexemes: *smettere di, arrêter de, aufhören zu, dejar de*, やめる, *parar de*; *continuare a,
continuer à, weitermachen / weiter-, seguir* + gerund, 続ける, *continuar a*.

### D2. The English gerund

**Recommendation: `complement_form: 'gerund'`** on the English lexeme, read by the English infinitive
path, which then writes the lower verb's *-ing* form with no *to* (the forms exist: the progressive
builds them).

### D3. German *weiter* and the Spanish gerund

German *läuft weiter* is not a verb + infinitive but the particle *weiter* on the lower verb.
**Recommendation: German CONTINUE_DOING spells as the lower verb with the separable particle
`weiter`** (the separable path exists). Spanish *seguir* + gerund is the same gerund slot as English,
so it takes D2's key.

### D4. Japanese

**Recommendation: `ja_complement: 'no'`** (走るのをやめる) and `ja_complement: 'stem'` (走り続ける, the
continuative stem + the verb), read by the Japanese infinitive complement.

## Engine

- The keys of D2–D4 and their reads in en, es, de and ja; it/fr/pt use `infinitive_link` as today.

## Tests

`infinitive-complement.test.ts`: STOP_DOING and CONTINUE_DOING in seven, present and past, negated.

## Verification

Engine suite green; TRY, NEED and DESIRE unchanged.

## Out of scope (follow-ups)

- **KEEP as *keep doing*** — a third concept (KEEP_DOING, *continuare a*, *seguir* + gerund), when a
  phrase needs it.
- **Begin / start doing** (*begins running*) — START takes the infinitive today and is right in
  English either way.
