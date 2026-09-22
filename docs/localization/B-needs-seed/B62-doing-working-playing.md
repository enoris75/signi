# B62. Doing, working, playing, trying, needing — the P09 verbs a sense split decides, glossed by what each is for

_(from the P09 core-vocabulary sweep of 2026-09-22. Seven P09 rows — DO, WORK_LABOUR, WORK_NOUN,
PLAY_GAME, PLAY_INSTRUMENT, TRY, NEED — and **six ship on this seed with no differentia word**: a
purpose clause on ACT (WORK_LABOUR, PLAY_GAME), an instrument gap (WORK_NOUN), an instrument on
PRODUCE (PLAY_INSTRUMENT), a causative (DO) and MUST's own OBLIGED (NEED). **TRY is literal by
design**, beside DESIRE. It also answers P09's open question on NEED — **one concept** — and shows
what P09's `modal: true` costs TRY. Nothing goes to a C ticket.
The words come from [P09](../../features/P-planning/P09-core-vocabulary/README.md) §2.)_

## Seed first

Proposed forms, for the seed author to check — suggestions, not renders. The seven P09 words; no
differentia word.

| concept | role | sense | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| DO | verb, transitive, `synonym: 'perform'` | P09 rank 17, the main verb; the DO ruling (en/de/ja split it from MAKE) | do | fare | faire | tun | hacer | する | fazer |
| WORK_LABOUR | verb, intransitive, `synonym: 'labour'` | P09 rank 109; the ruling: the seeded WORK is "function" | work | lavorare | travailler | arbeiten | trabajar | 働く (はたらく) | trabalhar |
| WORK_NOUN | noun | P09 rank 109, D2's `_NOUN` | work | lavoro (m) | travail (m, pl. travaux) | Arbeit (f) | trabajo (m) | 仕事 (しごと) | trabalho (m) |
| PLAY_GAME | verb, intransitive, `synonym: 'play a game'` | P09 rank 181, D2 | play | giocare | jouer | spielen | jugar | 遊ぶ (あそぶ) | jogar |
| PLAY_INSTRUMENT | verb, transitive, `synonym: 'play music'` | P09 rank 181, D2 | play | suonare | jouer (`object_prep: 'de'`) | spielen | tocar | 演奏する (えんそうする) | tocar |
| TRY | verb — lexical, or P09's `modal`; see below | P09 rank 119, "tries to run" | try | provare (`infinitive_link: 'a'`) | essayer (`infinitive_link: 'de'`) | versuchen | intentar | 試みる (こころみる, `infinitive_link: 'ことを'`) | tentar |
| NEED | verb, transitive, `stative`, `synonym: 'require'` | P09 rank 122, "needs water" — and "needs to run", see below | need | avere bisogno (`object_prep` / `infinitive_link: 'di'`) | avoir besoin (`object_prep` / `infinitive_link: 'de'`) | brauchen | necesitar | 必要とする (ひつようとする, `infinitive_link: 'ことを'`) | precisar (`object_prep: 'de'`) |

What the sentence probes showed the seed author:

1. **NEED's multiword lemmas** follow no precedent, since no seeded verb has one in Italian or
   French. Seeded as one base with the noun in every finite form (`3sg_present: 'ha bisogno'`, past
   participle *avuto bisogno* / *eu besoin*) and the object's preposition as `object_prep`, like
   DEPEND and CLICK, they render: *l'uomo ha bisogno di acqua*, *l'homme a besoin d'eau*, *o homem
   precisa de água*, *l'uomo aveva avuto bisogno del cibo*. **French negation breaks**: *l'homme
   n'a besoin pas de la nourriture* — the negator wraps the whole two-word finite instead of its
   first word (*n'a pas besoin*). Italian is unaffected (*non ha bisogno del cibo*). Engine; no bug
   file covers it. Japanese takes 〜ている as a state (男は水を必要としています).
2. **PLAY_INSTRUMENT is 演奏する, not P09's 弾く**, which is only for strings and keys (a flute is
   吹く); 演奏する plays any instrument (男は楽器を演奏します). French *jouer* takes *de* (*l'homme
   joue de l'instrument*).
3. **PLAY_GAME's pt *jogar*** (P09) is games and sport; children's play is *brincar*. The gloss
   below fits both — the seed author picks.
4. **DO** reuses MAKE's paradigms in it/fr/es/pt; ja する renders as a plain verb (男は動作をします).
5. **WORK_NOUN** is a mass noun in English ("work", but "a job") and counts in the others (*un
   lavoro*, *des travaux*); the gloss below does not turn on it.

### NEED is one concept

P09 asks whether the infinitive use ("needs to run") is a second, modal concept. **One concept**,
a lexical verb that takes the infinitive the way DESIRE does in WILL's gloss (`infinitive_link`),
not `modal: true`:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| NEED + infinitive complement: the man needs to run | the man needs to run. | l'uomo ha bisogno di correre. | l'homme a besoin de courir. | der Mann braucht, zu laufen. | el hombre necesita correr. | 男は走ることを必要としています。 | o homem precisa correr. |
| NEED_TO as a modal: the man needs to run | the man needs to run. | l'uomo ha bisogno di correre. | l'homme a besoin courir. | der Mann braucht laufen. | el hombre necesita correr. | 男は走る必要があります。 | o homem precisa correr. |
| MUST, for comparison: the man must run | the man must run. | l'uomo deve correre. | l'homme doit courir. | der Mann muss laufen. | el hombre debe correr. | 男は走る必要があります。 | o homem deve correr. |
| NEED_TO's only gloss — MUST's, in all seven | to be obliged to act. | essere obbligato ad agire. | être obligé d'agir. | verpflichtet sein, zu handeln. | estar obligado a actuar. | 行動することが義務的である。 | estar obrigado a agir. |

1. **A modal NEED_TO has no gloss of its own.** "Need to" and "must" differ in en/it/fr/es/pt, but
   the only plan that says "need to" is MUST's, character for character. In Japanese the modal *is*
   MUST's suffix (〜必要がある, "there is a need to"), and German says "needs to" with *müssen*.
2. **The lexical verb already renders the infinitive** in six languages. German *brauchen* takes a
   *zu*-clause only under negation or *nur* (*braucht nicht zu laufen*); the positive "needs to" is
   *muss laufen*. That one row is a reading, not a reason for a second concept.
3. **As a modal it would break where TRY does** (below): French drops the modal's link (*a besoin
   courir*) and German stacks a bare infinitive (*braucht laufen*).
4. **What it waits on is the builder, not the engine.** The frontend never builds an
   `infinitiveComplement`, so "needs to run" is not buildable until the picker offers an infinitive
   on a lexical verb. That one control would serve DESIRE ("desires to eat"), NEED and TRY alike.

### TRY: what `modal: true` costs

P09 gives TRY `modal: true`, like WILL. Probed both ways:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| TRY as a modal (P09): the man tries to run | the man tries to run. | l'uomo prova a correre. | l'homme essaie courir. | der Mann versucht laufen. | el hombre intenta correr. | 男は走ることを試みます。 | o homem tenta correr. |
| TRY as a lexical verb + infinitive complement | the man tries to run. | l'uomo prova a correre. | l'homme essaie de courir. | der Mann versucht, zu laufen. | el hombre intenta correr. | 男は走ることを試みます。 | o homem tenta correr. |

As a modal it is buildable today and wrong in two languages. French reads a modal's `link` only
for the inner modals of a chain (`modalGroupFr`), so the outermost modal loses its *de*.
Italian, Spanish and Portuguese go through the shared `modalChain`, which reads it for every
modal. German's modal stack takes a bare infinitive, and *versuchen* needs *zu*. Both are latent,
because no seeded modal has a Romance link. The Japanese modal would be the suffix
〜ことを試みる (dictionary form + こと, as 〜ことができる): stiff but right. The natural 〜ようとする
governs the volitional form, which the modal chain cannot (`JaForm` is `dict | stem`).
As a lexical verb it is right in all seven and waits on the same builder control as NEED. The
choice is P09's; the gloss does not depend on it.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| DO | `causativeGloss({ object: 'ACTION', definiteness: 'indefinite' }, { verb: 'HAPPEN' })` | to cause an action to happen |
| WORK_LABOUR | `infinitiveGloss('ACT', { purpose: { verb: 'ACQUIRE', object: 'MONEY' } })` | to act to acquire money |
| WORK_NOUN | `instrumentGloss('ACTION', 'ACQUIRE', 'MONEY')` | an action with which one acquires money |
| PLAY_GAME | `infinitiveGloss('ACT', { purpose: { verb: 'FEEL', object: 'JOY' } })` | to act to feel joy |
| PLAY_INSTRUMENT | `infinitiveGloss('PRODUCE', { object: 'SOUND', number: 'plural', complements: { instrumental: { phrase: { concept: 'OBJECT_THING', definiteness: 'indefinite' } } } })` | to produce sounds with an object |
| NEED | `infinitiveGloss('BE', { predicate: 'OBLIGED', infinitive: { verbPhrase: { verb: 'HAVE' }, directObject: { concept: 'OBJECT_THING', definiteness: 'bare', number: 'plural' } } })` | to be obliged to have objects |
| TRY | — literal by design, see **Not solved** | — |

**Six of seven, on no new word.** Every shape is shipped: the purpose clause SAVE and EXCHANGE
stand on, the causative START and HIDE stand on, the instrument gap EYE stands on, the instrument
complement TYPE and BUY stand on, and MUST's own "to be obliged to" frame. **No pair defines
each other.** WORK_LABOUR and WORK_NOUN both stand on ACQUIRE + MONEY, one from the verb's end and
one from the noun's; neither names the other.

## Probe renders (2026-09-22, engine source at HEAD, lexicon seeded in memory with the forms above)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| DO | to cause an action to happen | indurre un'azione a succedere | induire une action à arriver | eine Handlung veranlassen, zu geschehen | inducir una acción a ocurrir | 動作が起こるようにする | induzir uma ação a acontecer |
| WORK_LABOUR | to act to acquire money | agire per acquisire denaro | agir pour acquérir de l'argent | handeln, um Geld zu erwerben | actuar para adquirir dinero | お金を取得するために行動する | agir para adquirir dinheiro |
| WORK_NOUN | an action with which one acquires money | un'azione con la quale si acquisisce denaro | une action avec laquelle on acquiert de l'argent | eine Handlung, mit der man Geld erwirbt | una acción con la que se adquiere dinero | お金を取得する動作 | uma ação com a qual se adquire dinheiro |
| PLAY_GAME | to act to feel joy | agire per provare gioia | agir pour éprouver de la joie | handeln, um Freude zu fühlen | actuar para sentir alegría | 喜びを感じるために行動する | agir para sentir alegria |
| PLAY_INSTRUMENT | to produce sounds with an object | produrre suoni con un oggetto | produire des sons avec un objet | Geräusche mit einem Gegenstand erzeugen | producir sonidos con un objeto | 物体で音を出す | produzir sons com um objeto |
| NEED | to be obliged to have objects | essere obbligato ad avere oggetti | être obligé d'avoir des objets | verpflichtet sein, Gegenstände zu haben | estar obligado a tener objetos | 物体を持つことが義務的である | estar obrigado a ter objetos |
| START (shipped, for comparison) | to cause an action to begin | indurre un'azione a iniziare | induire une action à commencer | eine Handlung veranlassen, zu beginnen | inducir una acción a empezar | 動作が始まるようにする | induzir uma ação a começar |
| CRY_OUT (shipped, for comparison) | to produce loud sounds | produrre suoni forti | produire des sons forts | laute Geräusche erzeugen | producir sonidos fuertes | 大きい音を出す | produzir sons altos |

All six render in all seven. None collides with a shipped gloss, and no two collide with each
other in any language. Readings to judge on authoring:

1. **DO is START's shape with HAPPEN for BEGIN.** CAUSE_VERB said of an event reads marked in the
   Romance four (*indurre un'azione a succedere*), exactly as START ships it. Japanese says every
   causative with 〜ようにする, so DO's tooltip (する) ends on its own lemma, as the causative's
   auxiliary. No causative gloss avoids that. The other leads were worse: "to produce actions" (ja
   動作を出す) and "to complete an action" (COMPLETE is the autocomplete verb: *vervollständigen*,
   補完する). The ruling's own trap is avoided: no Romance gloss says *fare / faire / hacer / fazer*.
2. **WORK_NOUN does not stand on WORK_LABOUR.** "The action of a person who works" renders in all
   seven but reads *work … works* in six (*l'azione di una persona che lavora*; Spanish *trabajo*
   is also *trabajar*'s 1sg), so it is rejected. ACQUIRE is formal: *acquérir de l'argent*, *adquirir
   dinero*, *adquirir dinheiro* and お金を取得する are marked where the idiom is *gagner / ganar /
   ganhar* / 稼ぐ. German *Geld erwerben* is idiomatic, and BUY ships on the same verb ("to acquire
   objects with money"). An EARN verb would read better, but its own gloss would be this phrase
   ("to acquire money"), so it is not proposed. `instrumentGloss` gives its object `indefinite`,
   and MONEY is a mass noun: probed against the plan with `bare` written out, both render
   identically in all seven. Japanese 動作 is ACTION's seeded word ("movement").
3. **PLAY_GAME against PLAY_INSTRUMENT is joy against sounds.** German *spielen* and French *jouer*
   are both, so there the two tooltips differ by the gloss alone. German *Freude fühlen* is
   understandable (*empfinden* is the idiom). German *Geräusche* is SOUND's seeded word (noises),
   so the German reads as making noise with a thing. Two alternatives render in all seven:
   "to cause an object to produce sounds" (*indurre un oggetto a produrre suoni*) and "to use an
   object to produce sounds" (音を出すために物体を使う). The one chosen keeps PRODUCE, CRY_OUT's
   genus, so the two sound verbs differ by instrument against loudness. "To act in a game" needs a
   new GAME noun, cognate with the verb in five languages (*gioco / giocare*, *Spiel / spielen*), and
   "to produce sounds with an instrument" needs an INSTRUMENT noun. Neither is proposed.
4. **NEED is "must have"** (Longman: "to have to have something"), so it borrows MUST's OBLIGED.
   It is clean against MUST ("to be obliged to act") and HOLD ("to have objects"). In it/fr the
   gloss's *avere / avoir* is the light verb of NEED's own lemma (*avere bisogno*, *avoir besoin*),
   though not the lemma. "To desire an object that one does not have" also renders in all seven
   (持たない物体を望む), but need is not desire.

## Not solved by this seed

1. **TRY — literal by design**, beside DESIRE ([C28](../done/C28-verb-roots-without-a-gloss.md):
   "the genus word proposed does not hold"). Every lead, probed:

   | lead | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | DESIRE + ACT — WILL's gloss, in all seven | to desire to act. | desiderare agire. | désirer agir. | wünschen, zu handeln. | desear actuar. | 行動することを望む。 | desejar agir. |
   | SEARCH + ACT (SEARCH given `infinitive_link` it *di*, fr *à*, ja ことを, in memory) | to seek to act. | cercare di agire. | chercher à agir. | suchen, zu handeln. | buscar actuar. | 行動することを探す。 | procurar agir. |
   | BEGIN + ACT | to begin to act. | iniziare ad agire. | commencer à agir. | beginnen, zu handeln. | empezar a actuar. | 行動することが始まる。 | começar a agir. |
   | MAKE + EFFORT (a candidate, in memory) + purpose | to make an effort to act. | fare uno sforzo per agire. | faire un effort pour agir. | eine Anstrengung machen, um zu handeln. | hacer un esfuerzo para actuar. | 行動するために努力を作る。 | fazer um esforço para agir. |
   | ACT + purpose "to be able" | to act to be able. | agire per essere capace. | agir pour être capable. | handeln, um fähig zu sein. | actuar para ser capaz. | 可能であるために行動する。 | agir para ser capaz. |

   SEARCH comes closest. *Cercare di*, *chercher à* and *procurar* + infinitive *are* "try to" in
   those languages. But 行動することを探す is "look for acting", and *suchen, zu* is literary and the
   root of *versuchen* itself. BEGIN says starting, and its Japanese is intransitive ("acting
   begins"). "To make an effort to act" is the idiom in five languages, but Japanese makes effort
   with する (努力する): 作る is wrong, and DO would give English "to do an effort". It would also
   need EFFORT seeded (effort / *sforzo* (m) / *effort* (m) / *Anstrengung* (f) / *esfuerzo* (m) /
   努力 (どりょく) / *esforço* (m)). The last lead says nothing.

   **P09's `/attach RETRY under TRY` changes no gloss.** RETRY keeps "to start again".
   `infinitiveGloss('TRY', { modifier: 'AGAIN' })` renders *provare di nuovo*, *erneut versuchen* and
   *tentar de novo*. But with TRY a modal, Japanese cites the modal's suffix as a verb
   (もう一度ことを試みる), the A222
   family; with TRY a lexical verb it is もう一度試みる. One more reason to weigh the modal flag.

## Coverage

Three rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once
authored:

- **PLAY_GAME and PLAY_INSTRUMENT in German and English**: one German verb, *spielen*, twice in the
  picker, told apart only by *handeln, um Freude zu fühlen* and *Geräusche mit einem Gegenstand
  erzeugen*.
- **DO in English and Italian**: *fare*, the MAKE lemma, whose gloss must not say *fare* (*indurre
  un'azione a succedere*).
- **NEED in English and French**: the first multiword Romance lemma in the picker (*avoir besoin*),
  with an infinitive-governed gloss (*être obligé d'avoir des objets*).
