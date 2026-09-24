# P09-E42. *Stop doing*, *continue doing* — aspectual verbs over a verb

**Construct:** a verb whose complement is another verb's activity: English takes the gerund
(*stops running*), Italian and French a linked infinitive (*smette di correre, continue à courir*),
Spanish a gerund or *dejar de* (*sigue corriendo, deja de correr*), Japanese a compound (走るのをやめる,
走り続ける).
**Shape:** a lexeme key on the governing verb naming how its infinitive complement is spelled
(`complement_form: 'gerund'` in English, `infinitive_link` elsewhere, a Japanese compound form).
**Scope:** all 7 languages.
**Status:** planning, unscheduled. Filed 2026-09-24 from
[P09-E24](Z-done/P09-E24-ranks-201-400.md)'s §3.
**Words:** *stop* (rank 257) and *continue* (350), in their aspectual use. Their plain uses (*stop
the car*, *continue the work*) are seeded by
[B84](../../../localization/B-needs-seed/B84-stop-wait-die-continue.md). P09's sweep noted the same
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

**Proposed** in the first two columns; the other two are the engine's output.

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
