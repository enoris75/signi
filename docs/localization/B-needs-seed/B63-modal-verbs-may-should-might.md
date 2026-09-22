# B63. MAY, SHOULD, MIGHT — permission glosses like MUST and CAN; advice and possibility need the act as a subject

_(from the P09 core-vocabulary sweep of 2026-09-22. P09's three modals. **MAY ships**, as "to be
allowed to act", on one new adjective, ALLOWED: the shape [C09](../done/C09-modal-verbs.md)
gave MUST and CAN. **SHOULD and MIGHT do not.** Each judges the act (right, possible), and the
adjective that says so takes the act as its subject ("it is possible that one acts"). That needs a
content clause, so both go to [C30](../C-needs-engine/C30-content-clause-with-expletive-subject.md),
E4. The ticket also sorts the modals' seeding into seed work and engine work. The words come from
[P09](../../features/P-planning/P09-core-vocabulary/README.md) §2.)_

## Seed first

Proposed forms, for the seed author to check — suggestions, not renders. The three P09 words, then
MAY's differentia word. The Romance present of SHOULD and MIGHT is a conditional, given in brackets.

| concept | role | sense | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| MAY | verb, `modal`, `stative`, `synonym: 'be allowed to'` | P09 rank 111: permission only (see reading 3) | may (`nonfinite: 'be allowed to'`, past *was / were allowed to*) | potere | pouvoir | dürfen | poder | 〜ことが許される (ことがゆるされる, `governs: 'dict'`, kind verb) | poder |
| SHOULD | verb, `modal`, **not** `stative`, `synonym: 'ought to'` | P09 rank 113 | should (`nonfinite: 'be supposed to'`) | dovere (*dovrebbe*; past *avrebbe dovuto*) | devoir (*devrait*; past *aurait dû*) | sollen (*sollte*) | deber (*debería*; past *habría debido*) | 〜べきである (`governs: 'dict'`, kind verb) | dever (*deveria*; past *teria devido*) |
| MIGHT | verb, `modal`, **not** `stative`, `synonym: 'possibly'` | P09 rank 162 | might | potere (*potrebbe*; past *avrebbe potuto*) | pouvoir (*pourrait*; past *aurait pu*) | können (*könnte*) | poder (*podría*; past *habría podido*) | 〜かもしれない (`governs: 'dict'`) | poder (*poderia*; past *teria podido*) |
| ALLOWED | adjective, `transient` | differentia — MAY's gloss; not a P09 row | allowed | autorizzato (`infinitive_link: 'a'`) | autorisé (`infinitive_link: 'à'`) | berechtigt | autorizado (`infinitive_link: 'a'`) | 許可された (きょかされた, `infinitive_link: 'ことが'`) | autorizado (`infinitive_link: 'a'`) |

Three P09 words and one differentia word. ALLOWED takes `infinitive_link` like ABLE and OBLIGED, and
`transient` like OBLIGED: without it the gloss read *ser autorizado a actuar*, the Spanish passive.
It is *autorizzato / autorisé / berechtigt / autorizado*, not *permesso / permis / erlaubt /
permitido*, which are said of the act (*es ist erlaubt*), not of the one allowed (probed: *una
persona autorizzata*, *eine berechtigte Person*, *la mujer está autorizada*, 女は許可されています).

### Seed work and engine work

The candidates above, rendered as modals over RUN (2026-09-22, engine source at HEAD, in memory):

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| MAY: the man may run | the man may run. | l'uomo può correre. | l'homme peut courir. | der Mann darf laufen. | el hombre puede correr. | 男は走ることが許されます。 | o homem pode correr. |
| MAY, negated | the man may not run. | l'uomo non può correre. | l'homme ne peut pas courir. | der Mann darf nicht laufen. | el hombre no puede correr. | 男は走ることが許されません。 | o homem não pode correr. |
| MAY, past | the man was allowed to run. | l'uomo poteva correre. | l'homme pouvait courir. | der Mann durfte laufen. | el hombre podía correr. | 男は走ることが許されました。 | o homem podia correr. |
| MAY, question | may the man run? | l'uomo può correre? | est-ce que l'homme peut courir ? | darf der Mann laufen? | ¿el hombre puede correr? | 男は走ることが許されますか？ | o homem pode correr? |
| SHOULD: the man should run | the man should run. | l'uomo dovrebbe correre. | l'homme devrait courir. | der Mann sollte laufen. | el hombre debería correr. | 男は走るべきであります。 | o homem deveria correr. |
| SHOULD, negated | the man does not be supposed to run. | l'uomo non dovrebbe correre. | l'homme ne devrait pas courir. | der Mann sollte nicht laufen. | el hombre no debería correr. | 男は走るべきでありません。 | o homem não deveria correr. |
| SHOULD, question | does the man be supposed to run? | l'uomo dovrebbe correre? | est-ce que l'homme devrait courir ? | sollte der Mann laufen? | ¿el hombre debería correr? | 男は走るべきでありますか？ | o homem deveria correr? |
| SHOULD, past, with `stative` | the man was supposed to run. | l'uomo doveva correre. | l'homme devriait courir. | der Mann sollte laufen. | el hombre debía correr. | 男は走るべきでありました。 | o homem devia correr. |
| SHOULD, past, without | the man was supposed to run. | l'uomo avrebbe dovuto correre. | l'homme aurait dû courir. | der Mann sollte laufen. | el hombre habría debido correr. | 男は走るべきでありました。 | o homem teria devido correr. |
| MIGHT: the man might run | the man might run. | l'uomo potrebbe correre. | l'homme pourrait courir. | der Mann könnte laufen. | el hombre podría correr. | 男は走るかもしれます。 | o homem poderia correr. |
| MIGHT, negated | the man might not run. | l'uomo non potrebbe correre. | l'homme ne pourrait pas courir. | der Mann könnte nicht laufen. | el hombre no podría correr. | 男は走るかもしれません。 | o homem não poderia correr. |
| MIGHT, past, with `stative` | the man might run. | l'uomo poteva correre. | l'homme pourriait courir. | der Mann könnte laufen. | el hombre podía correr. | 男は走るかもしれました。 | o homem podia correr. |

- **MAY is seed work only.** All seven are right in the present, the negation, the past and the
  question. Japanese 〜ことが許される governs the dictionary form, as 〜ことができる does, and its
  ichidan 〜れる takes the endings the engine already writes. The everyday 〜てもいい would govern
  the te-form, which the modal chain cannot (`JaForm` is `dict | stem`).
- **SHOULD needs `should` in English `MODAL_AUX`** (P09 says so). Without it the negation and the
  question fall to do-support over the suppletive *be supposed to*: *does not be supposed to run*.
  That is engine work, one word. Japanese 〜べきである is seedable as a verb-kind modal but reads
  stiff (べきであります / べきでありません for べきです / べきではありません); a copula-kind modal
  is engine work.
- **SHOULD and MIGHT must not be `stative`**, unlike MUST, CAN and WILL. A stative modal's Romance
  past is derived as an imperfect. French derives it from the 1pl present, which here is the
  conditional (*devrions → devriait*, *pourrions → pourriait*). Italian, Spanish and Portuguese
  derive *doveva / debía / devia*, which is "had to", not "should have". Left off, the seeded
  conditional perfect is read: *avrebbe dovuto correre*, *aurait dû courir*. That is seed work.
  The English, German and Japanese past are engine work: "should have run" and "might have run" put
  the perfect under the modal, German says *hätte laufen sollen*, and Japanese puts it on the verb.
- **MIGHT's Japanese is engine work.** 〜かもしれない keeps its own ending and puts polarity and
  tense on the verb it follows: 走らないかもしれません, 走ったかもしれません. The verb-kind endings
  give *走るかもしれます*, a negation that reads as the positive (走るかもしれません), and
  *走るかもしれました*.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| MAY | `infinitiveGloss('BE', { predicate: 'ALLOWED', infinitive: 'ACT' })` | to be allowed to act |
| SHOULD | — blocked on a content clause (E4), see **Not solved** | — |
| MIGHT | — blocked on a content clause (E4), see **Not solved** | — |

MAY is C09's plan with a third adjective: BE + a predicate that governs ACT, like MUST (OBLIGED)
and CAN (ABLE).

## Probe renders (2026-09-22, engine source at HEAD, lexicon seeded in memory with the forms above)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| MAY | to be allowed to act | essere autorizzato ad agire | être autorisé à agir | berechtigt sein, zu handeln | estar autorizado a actuar | 行動することが許可されている | estar autorizado a agir |
| CAN (shipped, for comparison) | to be able to act | essere capace di agire | être capable d'agir | fähig sein, zu handeln | ser capaz de actuar | 行動することが可能である | ser capaz de agir |
| MUST (shipped, for comparison) | to be obliged to act | essere obbligato ad agire | être obligé d'agir | verpflichtet sein, zu handeln | estar obligado a actuar | 行動することが義務的である | estar obrigado a agir |

MAY renders in all seven and collides with nothing shipped. Readings to judge on authoring:

1. **In it/fr/es/pt MAY is CAN's verb** (*potere, pouvoir, poder*). The modal picker lists two
   identical words, told apart by the tooltip alone: *essere autorizzato ad agire* against *essere
   capace di agire*. This is the DO ruling's case, and the gloss never says *potere*. German
   *dürfen* and Japanese 〜ことが許される split them.
2. **Japanese 許可された is predicated as 許可されている**, as the engine already predicates 閉じた
   (閉じている). MAY's own suffix 許される and the gloss's 許可された are two lexemes (許す, 許可する)
   that share the character 許, so a Japanese reader sees it twice. If the author finds that
   circular, MAY's suffix can be 〜ことが認められる, which also governs the dictionary form and
   renders right as a modal (男は走ることが認められます / 認められません / 認められました).
3. **MAY is permission only.** P09 left open whether its possibility sense ("it may rain") merges
   with MIGHT. Yes: German and Japanese, which split the two as English does, say permission with
   *dürfen* / 〜ことが許される and possibility with *könnte* / 〜かもしれない, the MIGHT rows above. An English "may" of possibility would be a secondary lexeme of MIGHT, P09's
   *secondary lexemes* follow-up, not a second MAY.

## Not solved by this seed

1. **SHOULD → [C30](../C-needs-engine/C30-content-clause-with-expletive-subject.md), E4.** SHOULD is
   the right or advisable thing to do (Longman: "used to say what is the right or sensible thing to
   do"). It is not a weaker obligation the one who acts carries, which is why MUST's frame does not
   stretch to it. Every lead, probed:

   | lead | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | OBLIGED at `less` | to be less obliged to act. | essere meno obbligato ad agire. | être moins obligé d'agir. | weniger verpflichtet sein, zu handeln. | estar menos obligado a actuar. | 行動することがそれほど義務的ではない。 | estar menos obrigado a agir. |
   | RIGHT_CORRECT (B66's word; `infinitive_link` given in memory) | to be right to act. | essere giusto di agire. | être juste d'agir. | richtig sein, zu handeln. | ser correcto de actuar. | 行動することが正しい。 | ser certo de agir. |
   | GOOD | to be good to act. | essere buono agire. | être bon agir. | gut sein, zu handeln. | ser bueno actuar. | 行動することを良い。 | ser bom agir. |
   | HAVE + DUTY | to have a duty to act. | avere un dovere agire. | avoir un devoir agir. | eine Pflicht haben, zu handeln. | tener un deber actuar. | 行動することを義務を持つ。 | ter um dever agir. |
   | EXPECT in the passive | to expect to act. | prevedere agire. | attendre agir. | erwarten, zu handeln. | esperar actuar. | 行動することを予想する。 | esperar agir. |

   - `less` renders in all seven, but it is a comparative with no standard (E5), and Japanese
     それほど義務的ではない ("not that obligatory") denies the obligation.
   - RIGHT_CORRECT is the natural word. English and Japanese read right: 行動することが正しい,
     because the こと clause is 正しい's subject. The other five are wrong because *giusto,
     juste, richtig, correcto, certo* are said of the act: *è giusto agire*, *es ist richtig, zu
     handeln*. The infinitive is their subject, not something the one who acts governs. GOOD fails
     in all seven, English included, and takes no link at all (行動することを良い).
   - A noun links no infinitive (*avere un dovere agire*), and DUTY's Italian *dovere* is SHOULD's
     own lemma.
   - A citation has no object for a passive to promote, so EXPECT comes out active.

   What SHOULD needs is the act as the subject of an evaluative adjective, "it is right that one
   acts" (*è giusto che si agisca*, *es ist richtig, dass man handelt*): a content clause, with the
   expletive subject that goes with it. Japanese already renders it.
2. **MIGHT → C30, E4, for the same reason.** Its gloss is "it is possible that one acts", which is
   not "to be able to act" (CAN's gloss, character for character):

   | lead | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | POSSIBLE (a candidate, in memory; `infinitive_link` it *di*, fr *de*, es/pt *de*, ja ことが) | to be possible to act. | essere possibile di agire. | être possible d'agir. | möglich sein, zu handeln. | ser posible de actuar. | 行動することがありうるである。 | ser possível de agir. |
   | ACT + PERHAPS (a candidate adverb, `subtype: 'frequency'`) | perhaps to act. | agire forse. | agir peut-être. | vielleicht handeln. | actuar quizás. | もしかすると行動する。 | agir talvez. |

   POSSIBLE fails in English, the Romance four and German, since it too is said of the act (one
   is not "possible to act"). Its Japanese cannot be 可能な, which is ABLE's word (CAN's gloss already reads
   行動することが可能である), and the candidate ありうる took a stray である. Even with the construct,
   "possible to act" says *can*; the content clause is what says *might*. **PERHAPS is the
   construct-free route**, and English, German and Japanese read right. But the Romance engines put
   a `frequency` adverb after the verb, and *forse* and *talvez* stand before it: *agire forse*
   and *agir talvez* are marked (*agir peut-être*, *actuar quizás* pass). PERHAPS would be the
   corpus's first sentence adverb, so it is worth seeding once that position exists (P09 D4 asks
   for each language's position to be pinned). Its own gloss would then face E4 too. Forms,
   kept: *perhaps / forse / peut-être / vielleicht / quizás / もしかすると / talvez*,
   `subtype: 'frequency'`, `synonym: 'maybe'`.
3. **ALLOWED's own gloss is not in this ticket.** It is the state LET leaves, as SAVED is SAVE's
   ([C23](../done/C23-participial-state-adjectives.md)'s `stateGloss`), and LET is
   [C36](../C-needs-engine/C36-let-bare-infinitive.md) (E9), which records it beside LET.

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored,
in the modal picker C09's test opens:

- **MAY in English and Italian.** The Italian list shows *potere* twice, MAY and CAN, told apart
  only by *essere autorizzato ad agire* against *essere capace di agire*.
