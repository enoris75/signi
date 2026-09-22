# C36. LET — a bare infinitive, and a Japanese causative verb form

**Kind:** was blocked on a construct. P09's *let* (allow someone to act) was closer than P09's §3 row
suggested: [C08](C08-copular-and-genus-verbs.md)'s object-controlled infinitive already rendered four
languages. What was missing was the bare infinitive of English and German and the Japanese causative.

_(from the P09 core-vocabulary sweep of 2026-09-22; [P09](../../features/P-planning/P09-core-vocabulary/README.md)
§3, **E9**, split from the other two verbs of that row, with which it shares no mechanism: LIKE is
[C34](C34-like-experiencer-verb.md) and HELP is [C35](C35-lexical-object-case.md). **Done** on
2026-09-22: both flags shipped, LET is seeded and glossed, ALLOWED is literal by design; see
[Done](#done).)_

## The concepts

| concept | role | verdict |
|---|---|---|
| LET | verb | **seeded**: let, lasciare, laisser, lassen, dejar, 〜させる (a suffix), deixar |
| ALLOWED | adjective ([B63](B63-modal-verbs-may-should-might.md)) | **literal by design**; see [Done](#done) |

## Was blocked on: a bare infinitive and a causative suffix — resolved

Probed 2026-09-22, engine source at HEAD, LET seeded in memory with `causative: '1'` and no
`infinitive_link`, beside the shipped CAUSE_VERB:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| the cat lets the dog run | **the cat lets the dog to run.** | il gatto lascia il cane correre. | le chat laisse le chien courir. | **der Kater lässt den Hund, zu laufen.** | el gato deja el perro correr. | **猫は犬が走ることをします。** | o gato deixa o cão correr. |

French, Spanish and Portuguese were right, and Italian grammatical. English wrote *to* and German *zu*
with a comma, where both take a **bare** infinitive. Japanese lost the verb entirely: the candidate's
許す was replaced by the causative's する, and what Japanese says is the causative form of the
governed verb.

## Done

**2026-09-22.** Two lexical flags on the governor, as the file asked, and each is read by the
languages that need it and nowhere else:

- **`infinitive_bare`** (en *let*, de *lassen*) — no "to", no "zu", no comma, and in German the
  governed verb joins the clause's own **verb cluster**, behind the finite verb in a V2 clause and in
  front of it in a verb-final one, which is the *Ersatzinfinitiv* order.
- **`causative_suffix`** (ja) — the governed verb takes its 〜せる / させる form and there is no
  governing verb at all. The form is **derived**, not seeded
  ([`jaCausativeVerb.ts`](../../../packages/engine/src/languages/ja/jaCausativeVerb.ts)): the stored
  `nai` gives the stem and the stored `passive` says which suffix it is, because the two make the same
  godan/ichidan distinction (走られる/走らせる, 食べられる/食べさせる). The causee takes を when what it is
  made to do is intransitive and に when that verb has an object of its own.

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| the cat lets the dog run | **the cat lets the dog run.** | il gatto lascia il cane correre. | le chat laisse le chien courir. | **der Kater lässt den Hund laufen.** | el gato deja el perro correr. | **猫は犬を走らせます。** | o gato deixa o cão correr. |
| …the dog eat the food | the cat lets the dog eat the food. | il gatto lascia il cane mangiare il cibo. | le chat laisse le chien manger la nourriture. | der Kater lässt den Hund das Essen fressen. | el gato deja el perro comer la comida. | **猫は犬に食べ物を食べさせます。** | o gato deixa o cão comer a comida. |
| past | the cat let the dog run. | il gatto lasciò il cane correre. | le chat laissa le chien courir. | der Kater ließ den Hund laufen. | el gato dejó el perro correr. | 猫は犬を走らせました。 | o gato deixou o cão correr. |
| negated | the cat does not let the dog run. | il gatto non lascia il cane correre. | le chat ne laisse pas le chien courir. | der Kater lässt den Hund nicht laufen. | el gato no deja el perro correr. | 猫は犬を走らせません。 | o gato não deixa o cão correr. |
| the citation | to let a person act. | lasciare una persona agire. | laisser une personne agir. | **eine Person handeln lassen.** | dejar a una persona actuar. | 人を行動させる。 | deixar uma pessoa agir. |
| CAUSE_VERB (unchanged) | the cat causes the dog to run. | il gatto induce il cane a correre. | le chat induit le chien à courir. | der Kater veranlasst den Hund, zu laufen. | el gato induce el perro a correr. | 猫は犬が走るようにします。 | o gato induz o cão a correr. |

What landed differently from the plan:

1. **The German cluster order is a placement, not a suppression.** Dropping the comma and the "zu"
   was not enough: the governed infinitive has to be *inside* the clause, so it is passed into the
   clause builder rather than appended after it — which is what makes the citation "eine Person
   handeln lassen" and not "*eine Person lassen handeln".
2. **The Japanese causative form is derived from two forms the lexeme already stores**, so no verb
   needed a new seed. That also means every verb the corpus has can already stand under LET.
3. **LET is glossed and ALLOWED is not** — the other way round from the file, which expected ALLOWED
   to take "that one has let" (`stateGloss`). It cannot: *lassen* and *lasciare* without a governed
   infinitive mean **leave**, so "die man gelassen hat" and "che si è lasciata" say "that one has left".
   Every other lead defines ALLOWED by the word it was itself seeded for — "who may act" and MAY's "to
   be allowed to act" would define each other and nothing else — and ABLE's and OBLIGED's shape ("of
   high ability") wants a scalar noun, which permission is not. ALLOWED keeps its English literal.
   LET, meanwhile, glosses cleanly on it:

   | | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | **LET** | to cause a person to be allowed to act | indurre una persona a essere autorizzata ad agire | induire une personne à être autorisée à agir | eine Person veranlassen, berechtigt zu sein, zu handeln | inducir a una persona a estar autorizada a actuar | 人が行動することが許可されているようにする | induzir uma pessoa a estar autorizada a agir |

4. **Spanish's *deja el perro* still wants the personal *a***, which is the same open question
   [C35](C35-lexical-object-case.md) records and not this ticket's.
5. **Noted, not fixed:** a **relative clause carries no infinitive complement** in any language —
   "the cat that lets the dog" loses the governed verb, and so does "the cat that causes the dog to
   run". `ResolvedRelativeClause` has no such slot. It is not this construct's (CAUSE_VERB has had it
   since C08) and is worth a ticket of its own.

Pinned in [`bare-infinitive.test.ts`](../../../packages/engine/test/bare-infinitive.test.ts).
