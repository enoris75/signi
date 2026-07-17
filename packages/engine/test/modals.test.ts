import { describe, expect, test } from 'vitest';
import type { VerbPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// A modal is an ordinary verb concept flagged `Concept.modal`; what marks it out is that it
// GOVERNS a non-finite verb group rather than heading one. Only the outermost modal is finite —
// it carries the tense, the subject agreement and the negation — and every inner one takes its
// `nonfinite` form. Two lexical form keys carry the joinery: `nonfinite` (default: `base`) and
// `link`, a particle emitted before the governed element (English "want TO go").
//
// Japanese has no modal verbs at all: modality is suffixal (〜必要がある / 〜ことができる / 〜たい).
const catModal = (verbPhrase: Partial<VerbPhrase>) =>
  sayAll(clause(np('CAT'), 'EAT', { verbPhrase }));

describe('modals', () => {
  test('MUST — obligation', () => {
    expect(catModal({ modals: ['MUST'] })).toEqual({
      en: 'the cat must eat.',
      it: 'il gatto deve mangiare.',
      fr: 'le chat doit manger.',
      es: 'el gato debe comer.',
      pt: 'o gato deve comer.',
      de: 'der Kater muss essen.',
      ja: '猫は食べる必要があります。', // suffixal: 〜必要がある
    });
  });

  test('CAN — ability', () => {
    expect(catModal({ modals: ['CAN'] })).toEqual({
      en: 'the cat can eat.',
      it: 'il gatto può mangiare.',
      fr: 'le chat peut manger.',
      es: 'el gato puede comer.',
      pt: 'o gato pode comer.',
      de: 'der Kater kann essen.',
      ja: '猫は食べることができます。', // 〜ことができる
    });
  });

  test('WILL — volition, not futurity', () => {
    // WILL is *want*, not the future tense (that is `tense: 'future'`). English needs the `link`
    // particle for it — "wants TO eat" — where the other modals govern a bare infinitive.
    expect(catModal({ modals: ['WILL'] })).toEqual({
      en: 'the cat wants to eat.',
      it: 'il gatto vuole mangiare.',
      fr: 'le chat veut manger.',
      es: 'el gato quiere comer.',
      pt: 'o gato quer comer.',
      de: 'der Kater will essen.',
      ja: '猫は食べたいです。', // 〜たい
    });
  });

  test('the modal takes the agreement, and the main verb stays infinitive', () => {
    expect(sayAll(clause(np('CAT', { number: 'plural' }), 'EAT', {
      verbPhrase: { modals: ['MUST'] },
    }))).toMatchObject({
      en: 'the cats must eat.',
      it: 'i gatti devono mangiare.', // devono, not deve — the modal agrees
      fr: 'les chats doivent manger.',
      de: 'die Kater müssen essen.',
    });

    expect(sayAll(clause(np('FIRST_PERSON'), 'EAT', { verbPhrase: { modals: ['CAN'] } })))
      .toMatchObject({
        en: 'I can eat.',
        it: 'posso mangiare.', // posso, 1sg — the pro-drop subject is gone, the ending carries the person
        de: 'ich kann essen.',
      });
  });

  test('the rest of the clause still renders under a modal', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', {
      verbPhrase: { modals: ['CAN'] },
      directObject: np('MOUSE'),
    }))).toMatchObject({
      en: 'the cat can eat the mouse.',
      it: 'il gatto può mangiare il topo.',
      // German sends the governed infinitive to the end, behind the object.
      de: 'der Kater kann die Maus essen.',
      ja: '猫はネズミを食べることができます。',
    });
  });
});

describe('modals: tense', () => {
  test('the outermost modal carries the tense', () => {
    expect(catModal({ modals: ['MUST'], tense: 'past' })).toMatchObject({
      en: 'the cat had to eat.', // English supplets: must has no past
      it: 'il gatto dovette mangiare.',
      fr: 'le chat dut manger.',
      es: 'el gato debió comer.',
      de: 'der Kater musste essen.',
      ja: '猫は食べる必要がありました。',
    });
  });

  test('a future modal stacks two infinitives in German', () => {
    expect(catModal({ modals: ['MUST'], tense: 'future' })).toMatchObject({
      en: 'the cat will have to eat.',
      it: 'il gatto dovrà mangiare.',
      fr: 'le chat devra manger.',
      // "wird essen müssen" — the double infinitive, both at the end.
      de: 'der Kater wird essen müssen.',
    });
  });
});

describe('modals: aspect', () => {
  test('a modal composes with the aspect of what it governs', () => {
    // The innermost element is the infinitive of the main verb's WHOLE group, so an aspect
    // survives underneath the modal: "must have eaten", "deve aver visto".
    expect(catModal({ modals: ['MUST'], aspect: 'resultative' })).toMatchObject({
      en: 'the cat must have eaten.',
      it: 'il gatto deve aver mangiato.', // avere apocopates to aver before the participle
      fr: 'le chat doit avoir mangé.',
      es: 'el gato debe haber comido.',
      pt: 'o gato deve ter comido.',
      de: 'der Kater muss gegessen haben.',
    });
  });

  test('a progressive under a modal', () => {
    expect(catModal({ modals: ['MUST'], aspect: 'progressive' })).toMatchObject({
      en: 'the cat must be eating.',
      it: 'il gatto deve stare mangiando.',
      es: 'el gato debe estar comiendo.',
      de: 'der Kater muss gerade essen.',
    });
  });
});

describe('modals: chains', () => {
  test('only the outermost stays finite; the inner ones go non-finite', () => {
    // WILL over CAN — "wants to be able to eat". English is suppletive (can → be able to);
    // Italian apocopates the inner modal (potere → poter); German stacks both at the end.
    expect(catModal({ modals: ['WILL', 'CAN'] })).toMatchObject({
      en: 'the cat wants to be able to eat.',
      it: 'il gatto vuole poter mangiare.',
      fr: 'le chat veut pouvoir manger.',
      es: 'el gato quiere poder comer.',
      pt: 'o gato quer poder comer.',
      de: 'der Kater will essen können.',
    });
  });

  test('the chain order is outermost first', () => {
    // MUST over CAN and CAN over MUST mean different things, and the order is honoured.
    expect(catModal({ modals: ['MUST', 'CAN'] })).toMatchObject({
      en: 'the cat must be able to eat.',
      it: 'il gatto deve poter mangiare.',
      de: 'der Kater muss essen können.',
    });

    expect(catModal({ modals: ['CAN', 'WILL'] })).toMatchObject({
      en: 'the cat can want to eat.',
      it: 'il gatto può voler mangiare.', // volere → voler
      de: 'der Kater kann essen wollen.',
    });
  });

  test('the outermost modal of a chain carries the tense and the negation', () => {
    expect(catModal({ modals: ['MUST', 'CAN'], tense: 'past', negative: true })).toMatchObject({
      en: 'the cat did not have to be able to eat.',
      it: 'il gatto non dovette poter mangiare.',
      fr: 'le chat ne dut pas pouvoir manger.',
      de: 'der Kater musste nicht essen können.',
    });
  });

  test('a three-modal chain — the UI stops at two, but the model is uncapped', () => {
    // WILL > MUST > CAN: English supplets both inner modals ("have to", "be able to"), Romance
    // apocopates them (dover, poter), and German stacks all three infinitives clause-finally,
    // innermost first — "essen können müssen".
    expect(catModal({ modals: ['WILL', 'MUST', 'CAN'] })).toMatchObject({
      en: 'the cat wants to have to be able to eat.',
      it: 'il gatto vuole dover poter mangiare.',
      fr: 'le chat veut devoir pouvoir manger.',
      es: 'el gato quiere deber poder comer.',
      pt: 'o gato quer dever poder comer.',
      de: 'der Kater will essen können müssen.',
    });
  });

  test('a three-modal chain carries tense and negation on the outermost only', () => {
    expect(catModal({ modals: ['WILL', 'MUST', 'CAN'], tense: 'past', negative: true })).toMatchObject({
      en: 'the cat did not want to have to be able to eat.', // do-support: WILL is the lexical "want"
      it: 'il gatto non volle dover poter mangiare.',
      fr: 'le chat ne voulut pas devoir pouvoir manger.',
      de: 'der Kater wollte nicht essen können müssen.',
    });
  });
});

describe('modals: negation', () => {
  test('CAN — the negation is unambiguous', () => {
    expect(catModal({ modals: ['CAN'], negative: true })).toEqual({
      en: 'the cat cannot eat.',
      it: 'il gatto non può mangiare.',
      fr: 'le chat ne peut pas manger.',
      es: 'el gato no puede comer.',
      pt: 'o gato não pode comer.',
      de: 'der Kater kann nicht essen.',
      ja: '猫は食べることができません。',
    });
  });
});

// Every ordered pair of the three modals. The order is meaningful — MUST over CAN ("must be able
// to") is not CAN over MUST ("can have to") — so all six are distinct plans.
describe('modals: every pair', () => {
  test('MUST over CAN / WILL', () => {
    expect(catModal({ modals: ['MUST', 'CAN'] })).toMatchObject({
      en: 'the cat must be able to eat.', // English supplets the inner modal
      it: 'il gatto deve poter mangiare.', // potere → poter
      fr: 'le chat doit pouvoir manger.',
      de: 'der Kater muss essen können.', // both infinitives at the end
      ja: '猫は食べることができる必要があります。',
    });

    expect(catModal({ modals: ['MUST', 'WILL'] })).toMatchObject({
      en: 'the cat must want to eat.',
      it: 'il gatto deve voler mangiare.', // volere → voler
      es: 'el gato debe querer comer.',
      de: 'der Kater muss essen wollen.',
    });
  });

  test('CAN over MUST / WILL', () => {
    expect(catModal({ modals: ['CAN', 'MUST'] })).toMatchObject({
      // English has no double modal, so the inner one goes periphrastic: "can have to".
      en: 'the cat can have to eat.',
      it: 'il gatto può dover mangiare.', // dovere → dover
      fr: 'le chat peut devoir manger.',
      de: 'der Kater kann essen müssen.',
    });

    expect(catModal({ modals: ['CAN', 'WILL'] })).toMatchObject({
      en: 'the cat can want to eat.',
      it: 'il gatto può voler mangiare.',
      de: 'der Kater kann essen wollen.',
    });
  });

  test('WILL over MUST / CAN', () => {
    expect(catModal({ modals: ['WILL', 'MUST'] })).toMatchObject({
      en: 'the cat wants to have to eat.',
      it: 'il gatto vuole dover mangiare.',
      pt: 'o gato quer dever comer.',
      de: 'der Kater will essen müssen.',
    });

    expect(catModal({ modals: ['WILL', 'CAN'] })).toMatchObject({
      en: 'the cat wants to be able to eat.',
      it: 'il gatto vuole poter mangiare.',
      de: 'der Kater will essen können.',
    });
  });

  test('the pair is not commutative', () => {
    // "must be able to eat" ≠ "can have to eat" — the order is honoured, not normalised away.
    expect(catModal({ modals: ['MUST', 'CAN'] }).en).not.toBe(catModal({ modals: ['CAN', 'MUST'] }).en);
    expect(catModal({ modals: ['MUST', 'CAN'] }).de).not.toBe(catModal({ modals: ['CAN', 'MUST'] }).de);
  });
});

// The negation lands on the OUTERMOST modal, wherever the pair puts it.
describe('modals: a pair with negation', () => {
  const negPair = (a: string, b: string) => catModal({ modals: [a, b], negative: true });

  test('MUST outermost', () => {
    expect(negPair('MUST', 'CAN')).toMatchObject({
      // English scopes a negated MUST as ¬obligation ("does not have to"), consistent with its own
      // past and with German/Japanese — see "known bugs: modals" below. The others were already so.
      en: 'the cat does not have to be able to eat.',
      it: 'il gatto non deve poter mangiare.', // "non" precedes the finite modal only
      fr: 'le chat ne doit pas pouvoir manger.', // ne … pas brackets the FINITE modal
      de: 'der Kater muss nicht essen können.',
      ja: '猫は食べることができる必要がありません。',
    });

    expect(negPair('MUST', 'WILL')).toMatchObject({
      en: 'the cat does not have to want to eat.',
      it: 'il gatto non deve voler mangiare.',
      es: 'el gato no debe querer comer.',
    });
  });

  test('CAN outermost', () => {
    expect(negPair('CAN', 'MUST')).toMatchObject({
      en: 'the cat cannot have to eat.',
      it: 'il gatto non può dover mangiare.',
      fr: 'le chat ne peut pas devoir manger.',
      de: 'der Kater kann nicht essen müssen.',
    });

    expect(negPair('CAN', 'WILL')).toMatchObject({
      en: 'the cat cannot want to eat.',
      pt: 'o gato não pode querer comer.',
      de: 'der Kater kann nicht essen wollen.',
    });
  });

  test('WILL outermost — English needs do-support, "want" being a lexical verb', () => {
    expect(negPair('WILL', 'CAN')).toMatchObject({
      en: 'the cat does not want to be able to eat.', // not "wants not to"
      it: 'il gatto non vuole poter mangiare.',
      fr: 'le chat ne veut pas pouvoir manger.',
      de: 'der Kater will nicht essen können.',
    });

    expect(negPair('WILL', 'MUST')).toMatchObject({
      en: 'the cat does not want to have to eat.',
      es: 'el gato no quiere deber comer.',
    });
  });

  test('a negated pair in the past — the outermost takes tense AND negation', () => {
    expect(catModal({ modals: ['MUST', 'CAN'], tense: 'past', negative: true })).toMatchObject({
      en: 'the cat did not have to be able to eat.',
      it: 'il gatto non dovette poter mangiare.',
      fr: 'le chat ne dut pas pouvoir manger.',
      de: 'der Kater musste nicht essen können.',
    });
  });
});

// The adverb modifies the main verb, not the modal, and each language slots it accordingly.
describe('modals: with an adverb', () => {
  test('a manner adverb', () => {
    expect(catModal({ modals: ['CAN'], modifier: 'FAST' })).toEqual({
      en: 'the cat can eat fast.',
      it: 'il gatto può mangiare velocemente.',
      fr: 'le chat peut manger vite.',
      es: 'el gato puede comer rápido.',
      pt: 'o gato pode comer rapidamente.',
      de: 'der Kater kann schnell essen.', // German puts it before the clause-final infinitive
      ja: '猫は速く食べることができます。',
    });

    expect(catModal({ modals: ['CAN'], modifier: 'WELL' })).toMatchObject({
      en: 'the cat can eat well.',
      it: 'il gatto può mangiare bene.',
      de: 'der Kater kann gut essen.',
    });
  });

  test('an adverb alongside an object', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', {
      verbPhrase: { modals: ['CAN'], modifier: 'FAST' },
      directObject: np('MOUSE'),
    }))).toMatchObject({
      en: 'the cat can eat the mouse fast.',
      it: 'il gatto può mangiare velocemente il topo.',
      de: 'der Kater kann schnell die Maus essen.',
      ja: '猫はネズミを速く食べることができます。',
    });
  });

  test('an adverb over a modal CHAIN, and with negation', () => {
    expect(catModal({ modals: ['MUST', 'CAN'], modifier: 'FAST' })).toMatchObject({
      en: 'the cat must be able to eat fast.',
      it: 'il gatto deve poter mangiare velocemente.',
      de: 'der Kater muss schnell essen können.',
    });

    expect(catModal({ modals: ['MUST', 'CAN'], modifier: 'FAST', negative: true }))
      .toMatchObject({
        en: 'the cat does not have to be able to eat fast.', // ¬obligation scope (see below)
        it: 'il gatto non deve poter mangiare velocemente.',
        fr: 'le chat ne doit pas pouvoir manger vite.',
        de: 'der Kater muss nicht schnell essen können.',
      });

    expect(catModal({ modals: ['CAN'], modifier: 'FAST', negative: true })).toMatchObject({
      en: 'the cat cannot eat fast.',
      es: 'el gato no puede comer rápido.',
      de: 'der Kater kann nicht schnell essen.',
    });
  });

  test('everything at once: chain, adverb, object and tense', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', {
      verbPhrase: { modals: ['WILL', 'CAN'], modifier: 'FAST', tense: 'past' },
      directObject: np('MOUSE'),
    }))).toMatchObject({
      en: 'the cat wanted to be able to eat the mouse fast.',
      it: 'il gatto volle poter mangiare velocemente il topo.',
      fr: 'le chat voulut pouvoir manger vite la souris.',
      de: 'der Kater wollte schnell die Maus essen können.',
    });
  });

  test('a frequency adverb — the other six place it correctly', () => {
    // Only English gets this wrong (see the bugs below); the rest are pinned here.
    expect(catModal({ modals: ['MUST'], modifier: 'ALWAYS' })).toMatchObject({
      it: 'il gatto deve mangiare sempre.',
      fr: 'le chat doit toujours manger.',
      de: 'der Kater muss immer essen.',
      ja: '猫はいつも食べる必要があります。',
    });

    expect(catModal({ modals: ['MUST'], modifier: 'NEVER' })).toMatchObject({
      it: 'il gatto non deve mangiare mai.', // non … mai brackets the verb
      fr: 'le chat ne doit jamais manger.',
      es: 'el gato nunca debe comer.',
      de: 'der Kater muss nie essen.',
    });
  });
});

// DELIBERATE — do not "fix" without a product decision.
describe('documented simplifications: modals', () => {
  // ja.ts: "Known gap: `aspect` is dropped under a modal. Stacking ～ています inside 〜必要がある
  // is [not built]." So a Japanese modal renders identically whatever the aspect, while the other
  // six compose the two ("must have eaten").
  test.fails('Japanese should not drop the aspect under a modal', () => {
    expect(catModal({ modals: ['MUST'], aspect: 'resultative' }).ja)
      .not.toBe('猫は食べる必要があります。');
  });
});

describe('known bugs: modals', () => {
  // English used to contradict ITSELF across tenses. Negating MUST gave:
  //
  //     present  "the cat must not eat."           → prohibition        (must ¬eat)
  //     past     "the cat did not have to eat."    → no obligation      (¬must eat)
  //
  // Those are opposite scopes for the same plan, and nothing in the plan chose between them —
  // `negative` is a flag on the verb phrase, with no scope marker. Signi resolves it to the ¬must
  // reading (no obligation) that the past, German and Japanese already take, so the present now
  // reads "does not have to eat" — the "have to" periphrasis with do-support, like every tense.
  test('English MUST + negative does not flip scope between present and past', () => {
    expect(catModal({ modals: ['MUST'], negative: true }))
      .toMatchObject({ en: 'the cat does not have to eat.' });
  });

  // The same divergence ACROSS languages, on one plan. German "muss nicht" is "does not have to"
  // (absence of obligation); the prohibition would be "darf nicht essen". English now agrees with
  // German/Japanese on the ¬must reading, so the same plan no longer reads as opposites.
  test('MUST + negative means the same thing in every language', () => {
    const said = catModal({ modals: ['MUST'], negative: true });
    // English and German must not read as opposites.
    expect([said.en, said.de]).not.toEqual([
      'the cat must not eat.', // prohibition
      'der Kater muss nicht essen.', // absence of obligation
    ]);
  });

  // One ¬obligation scope in every tense: "does not / did not / will not have to eat" — no tense
  // is the odd one out any longer.
  test('English negates MUST periphrastically in every tense', () => {
    expect(catModal({ modals: ['MUST'], negative: true }).en).toBe('the cat does not have to eat.');
    expect(catModal({ modals: ['MUST'], tense: 'past', negative: true }).en).toBe('the cat did not have to eat.');
    expect(catModal({ modals: ['MUST'], tense: 'future', negative: true }).en).toBe('the cat will not have to eat.');
  });

  // The do-support agrees with the subject: "the cats do not have to eat".
  test('English MUST negation takes plural do-support', () => {
    expect(sayAll(clause(np('CAT', { number: 'plural' }), 'EAT', {
      verbPhrase: { modals: ['MUST'], negative: true },
    })).en).toBe('the cats do not have to eat.');
  });

  // Regression: the other true modals are untouched — a negated CAN is still the prohibitive
  // "cannot", and MUST as the INNER member of a chain keeps its "have to" citation ("cannot have
  // to eat"), since only the finite (outermost) form is chosen here.
  test('English still negates CAN as "cannot", and MUST-inner as "have to"', () => {
    expect(catModal({ modals: ['CAN'], negative: true }).en).toBe('the cat cannot eat.');
    expect(catModal({ modals: ['CAN', 'MUST'], negative: true }).en).toBe('the cat cannot have to eat.');
  });

  // Japanese modality is suffixal, so a CHAIN has to nest suffixes — and the engine stacks them
  // naively: 〜たい (want) glued onto 〜ことができる (can) gives できたい, which is not Japanese
  // (たい is an i-adjective and cannot suffix できる that way). The reverse order is no better:
  // CAN over WILL yields 食べたいことができます.
  //
  // Asserted negatively — the idiomatic renderings (食べられるようになりたい and the like) are a
  // design call. What is not in doubt is that the current stacking is ungrammatical.
  test('Japanese modal chains should not stack suffixes into できたい', () => {
    expect(catModal({ modals: ['WILL', 'CAN'] }).ja).not.toContain('できたい');
  });

  test('Japanese modal chains should not stack suffixes into たいこと', () => {
    expect(catModal({ modals: ['CAN', 'WILL'] }).ja).not.toContain('たいこと');
  });

  // The bridged forms in full. 〜たい *over* a modal rides ようになる ("come to be able"); a modal
  // *over* 〜たい makes it a clause with と思う ("think that …"). The fix keys off the 〜たい
  // i-adjective, so it covers CAN and MUST alike, in either order.
  test('Japanese bridges a volitional (〜たい) modal chain instead of stacking suffixes', () => {
    expect(catModal({ modals: ['WILL', 'CAN'] }).ja).toBe('猫は食べることができるようになりたいです。');
    expect(catModal({ modals: ['CAN', 'WILL'] }).ja).toBe('猫は食べたいと思うことができます。');
    expect(catModal({ modals: ['WILL', 'MUST'] }).ja).toBe('猫は食べる必要があるようになりたいです。');
    expect(catModal({ modals: ['MUST', 'WILL'] }).ja).toBe('猫は食べたいと思う必要があります。');
  });

  test('the volitional bridge carries tense and polarity on the outer element', () => {
    // Negation and past land on the bridging なる (なりたくない) / と思う-modal, as they would on
    // any outermost modal.
    expect(catModal({ modals: ['WILL', 'CAN'], negative: true }).ja)
      .toBe('猫は食べることができるようになりたくないです。');
    expect(catModal({ modals: ['CAN', 'WILL'], tense: 'past' }).ja)
      .toBe('猫は食べたいと思うことができました。');
  });

  // Regression: a chain with no 〜たい never triggers the bridge — two verb-kind modals still
  // stack directly (they compose grammatically), and a lone 〜たい is untouched.
  test('Japanese still stacks two verb-kind modals directly', () => {
    expect(catModal({ modals: ['MUST', 'CAN'] }).ja).toBe('猫は食べることができる必要があります。');
    expect(catModal({ modals: ['WILL'] }).ja).toBe('猫は食べたいです。');
  });

  // An English frequency adverb goes AFTER the first auxiliary, not before it:
  //
  //     no auxiliary   "the cat always eats."          ✓ pre-verbal, correct
  //     perfect        "the cat has always eaten."     ✓ after the auxiliary, correct
  //     modal          "the cat ALWAYS MUST eat."      ✗ want "must always eat"
  //     future         "the cat ALWAYS WILL eat."      ✗ want "will always eat"
  //
  // The engine had the rule and applied it for the perfect — it simply did not treat a modal or
  // the future auxiliary as an auxiliary for this purpose. Now it does: the frequency adverb
  // follows the finite auxiliary (modal, "will" or the perfect "has") alike. A manner adverb
  // ("eat fast") is unaffected, being post-verbal; only the pre-verbal (frequency) class moves.
  test('English places a frequency adverb after the modal, not before it', () => {
    expect(catModal({ modals: ['MUST'], modifier: 'ALWAYS' }))
      .toMatchObject({ en: 'the cat must always eat.' });
  });

  test('English places NEVER after the modal', () => {
    expect(catModal({ modals: ['MUST'], modifier: 'NEVER' }))
      .toMatchObject({ en: 'the cat must never eat.' });
  });

  test('English places a frequency adverb after the future auxiliary', () => {
    expect(catModal({ tense: 'future', modifier: 'ALWAYS' }))
      .toMatchObject({ en: 'the cat will always eat.' });
  });

  test('…but it gets the perfect right, which is why the above is a bug', () => {
    expect(catModal({ aspect: 'resultative', modifier: 'ALWAYS' }))
      .toMatchObject({ en: 'the cat has always eaten.' });
  });

  // A chain-level `modifier` is the MAIN verb's own adverb, so it sits right before the main verb
  // ("must be able to always eat"). To adverb a modal itself, give that modal its own `modifier` —
  // then the frequency adverb follows that (true modal auxiliary) finite: "must always be able to".
  test('English scopes a chain-level adverb to the main verb, a modal adverb to the modal', () => {
    expect(catModal({ modals: ['MUST', 'CAN'], modifier: 'ALWAYS' }).en)
      .toBe('the cat must be able to always eat.');
    expect(catModal({ modals: [{ verb: 'MUST', modifier: 'ALWAYS' }, 'CAN'] }).en)
      .toBe('the cat must always be able to eat.');
  });

  // NEVER after the future auxiliary too, matching ALWAYS.
  test('English places NEVER after the future auxiliary', () => {
    expect(catModal({ tense: 'future', modifier: 'NEVER' }).en).toBe('the cat will never eat.');
  });

  // Regression: a MANNER adverb is post-verbal and does NOT move to the auxiliary slot, with a
  // modal or in the future ("must eat fast", "will eat fast").
  test('English keeps a manner adverb post-verbal under a modal and in the future', () => {
    expect(catModal({ modals: ['MUST'], modifier: 'FAST' }).en).toBe('the cat must eat fast.');
    expect(catModal({ tense: 'future', modifier: 'FAST' }).en).toBe('the cat will eat fast.');
  });

  // Regression: with NO auxiliary (present/past) the frequency adverb stays pre-verbal.
  test('English keeps a frequency adverb pre-verbal when there is no auxiliary', () => {
    expect(catModal({ modifier: 'ALWAYS' }).en).toBe('the cat always eats.');
    expect(catModal({ tense: 'past', modifier: 'ALWAYS' }).en).toBe('the cat always ate.');
  });
});

// Every verb in a modal group can carry its OWN adverb — the main verb via `modifier`, each modal
// via its own `{ verb, modifier }`. This is what lets "I never wanted to always go" put NEVER on the
// volition modal and ALWAYS on the main verb, two adverbs at two scope points in one group.
describe('per-modal adverbs', () => {
  // The anchor case: NEVER scopes the outermost (volition) modal, ALWAYS scopes the main verb.
  test('an adverb on the modal and another on the main verb, at once', () => {
    expect(catModal({ modals: [{ verb: 'WILL', modifier: 'NEVER' }], modifier: 'ALWAYS', tense: 'past' }))
      .toEqual({
        en: 'the cat never wanted to always eat.',
        it: 'il gatto non volle mai mangiare sempre.',
        fr: 'le chat ne voulut jamais toujours manger.',
        es: 'el gato nunca quiso comer siempre.',
        pt: 'o gato nunca quis comer sempre.',
        de: 'der Kater wollte nie immer essen.',
        ja: '猫は決していつも食べたくなかったです。',
      });
  });

  // A modal's own frequency adverb sits with that modal (after the finite verb in most langs),
  // distinct from a chain-level adverb, which belongs to the main verb.
  test('a frequency adverb scoped to the modal itself', () => {
    expect(catModal({ modals: [{ verb: 'MUST', modifier: 'ALWAYS' }] })).toEqual({
      en: 'the cat must always eat.',
      it: 'il gatto deve sempre mangiare.',
      fr: 'le chat doit toujours manger.',
      es: 'el gato debe siempre comer.',
      pt: 'o gato deve sempre comer.',
      de: 'der Kater muss immer essen.',
      ja: '猫はいつも食べる必要があります。',
    });
  });

  // Negation scope: a NEVER on the modal forces the whole predicate negative — the finite verb is
  // negated (or the adverb itself carries the negation) even though nothing else is marked negative.
  test('a negative-polarity adverb on the modal negates the predicate', () => {
    expect(catModal({ modals: [{ verb: 'WILL', modifier: 'NEVER' }] })).toEqual({
      en: 'the cat never wants to eat.',
      it: 'il gatto non vuole mai mangiare.',
      fr: 'le chat ne veut jamais manger.',
      es: 'el gato nunca quiere comer.',
      pt: 'o gato nunca quer comer.',
      de: 'der Kater will nie essen.',
      ja: '猫は決して食べたくないです。',
    });
  });
});
