# A66. Spanish and Portuguese pick estar only for the plain finite copula

**Language:** Spanish, Portuguese

A47 (`docs/bugs/fixed/`) made BE render `estar` for a location or a transient state. The choice (`copulaVerb` in each `predicateText`) reaches only the neutral, modal-free finite branch; the modal chain, the aspect auxiliaries, the imperative and the instruction/infinitive branches still read the seeded `ser`.

## Spanish

A47 (`docs/bugs/fixed/`) taught `predicateText` (`languages/es/predicateText.ts`) to swap BE for
`ESTAR_COPULA` for a location or a transient predicate adjective. The fix is incomplete: the swapped
`copulaVerb` goes only to the neutral, non-modal branch, `finite(copulaVerb)`. Every other branch
still reads the lexical BE (`ser`):

- the modal chain's `verbGroupInfinitive(verb.forms, …)`;
- `aspectVerb(verb.forms, …)`;
- `imperativeForm('es', verb, …)`;
- the instruction and infinitive branches' `verb.forms['base']`.

| Clause | Now | Want |
|---|---|---|
| MUST + locative | `el gato debe ser en la casa.` | `el gato debe estar en la casa.` |
| MUST + TIRED | `el gato debe ser cansado.` | `el gato debe estar cansado.` |
| resultative + locative | `el gato ha sido en la casa.` | `el gato ha estado en la casa.` |
| resultative + TIRED | `el gato ha sido cansado.` | `el gato ha estado cansado.` |
| command, tú negative | `no seas en la casa.` | `no estés en la casa.` |
| command, nosotros | `seamos en la casa.` | `estemos en la casa.` |
| command, vosotros | `sed en la casa.` | `estad en la casa.` |
| instruction | `ser en la casa.` | `estar en la casa.` |
| infinitive | `ser en la casa.` | `estar en la casa.` |

The same paths give `había sido en la casa`, `habría sido en la casa`, `el gato que ha sido cansado
corre.`, `no seas cansado.` and `está a punto de ser cansado`. Not pinned:

- the affirmative tú command `sé en la casa.`, whose target is `está en la casa.` or `estate en la
  casa.` (both standard);
- the progressive `está siendo en la casa.`, which has no clean target.

Already right: the plain finite verb in every tense and mood (`está`, `estuvo`, `estaría`,
`estuviera`), and predicate nouns and inherent adjectives, which keep `ser` everywhere (`debe ser una
leyenda`, `sé una leyenda`).

### Shape of the fix

Pass `copulaVerb` to every branch in place of `verb`. `ESTAR_COPULA` (`es.consts.ts`) then needs:

- `participle: 'estado'` and `gerund: 'estando'`;
- entries in `mood.ts`'s `ES_SUBJ_OVERRIDE` (`estés / estemos / estéis`) and `ES_IMP_OVERRIDE` for
  `ESTAR`, because its 1sg present `estoy` does not end in `-o`, and `subjPresent` would otherwise
  build `estoyas`.

## Portuguese

A47 made `predicateText` (`languages/pt/predicateText.ts`) choose `ESTAR_COPULA` over the seeded
`ser` when BE takes a lone locative or a transient predicate adjective. The choice is stored in
`copulaVerb`, but only the neutral, modal-free finite branch reads it (`finite(copulaVerb)`). The
other branches still read `verb`, the seeded BE, and render `ser`:

- `verbGroupInfinitive` under a modal;
- `aspectVerb`, whose resultative is ter + participle (`sido`) or, in the present, the preterite
  (`foi`);
- `imperativeForm` in the imperative (`seja`);
- `verb.forms['base']` in the instruction register and the infinitive (`ser`).

A place or a transient state keeps `estar` in every one of these forms.

| Plan (BE) | Now | Want |
|---|---|---|
| MUST + TIRED | `o gato deve ser cansado.` | `o gato deve estar cansado.` |
| MUST + locative HOUSE | `o gato deve ser na casa.` | `o gato deve estar na casa.` |
| imperative + locative | `seja na casa.` | `esteja na casa.` |
| negative imperative + TIRED | `não seja cansado.` | `não esteja cansado.` |
| infinitive + locative | `ser na casa.` | `estar na casa.` |
| instruction + TIRED | `ser cansado.` | `estar cansado.` |
| present resultative + locative | `o gato foi na casa.` | `o gato esteve na casa.` |
| past resultative + TIRED | `o gato tinha sido cansado.` | `o gato tinha estado cansado.` |
| MUST, resultative + locative | `o gato deve ter sido na casa.` | `o gato deve ter estado na casa.` |
| condition, resultative + locative | `se o gato tivesse sido na casa, o cão correria.` | `se o gato tivesse estado na casa, o cão correria.` |

Already right: the finite copula in every tense and mood (`o gato está cansado.`, `o gato esteve na
casa.` in the past, `se o gato estivesse na casa, …`) and in a relative clause (`o cão que está na
casa corre.`). Not pinned: the progressive and prospective (`está sendo cansado`, `está prestes a ser
na casa`). `estar` does not naturally take its own progressive, so those have no single clean target.

### Shape of the fix

Pass `copulaVerb` rather than `verb` to every verb-group builder in `predicateText`:

- `verbGroupInfinitive` (`estar` / `ter estado`);
- `aspectVerb` (the participle `estado`, the preterite `esteve`);
- the imperative and infinitive branches (`estar`).

`ESTAR_COPULA` then needs a `participle: 'estado'`. `imperativeForm` needs an `ESTAR` entry in
`PT_SUBJ_OVERRIDE` (`esteja` / `estejamos` / `estejam`), because its 1sg-minus-`o` rule would
otherwise build `estoue`.

| | |
|---|---|
| **Test** | `complements/locative.test.ts` → *known bugs: Spanish estar outside the plain finite verb*; `complements/predicative.test.ts` → *known bugs: Portuguese ser vs estar outside the finite copula* (3 `test.fails`) |
