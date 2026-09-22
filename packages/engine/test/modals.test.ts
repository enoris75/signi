import { describe, expect, test } from 'vitest';
import type { ModalRef, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';

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
      de: 'der Kater muss fressen.',
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
      de: 'der Kater kann fressen.',
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
      de: 'der Kater will fressen.',
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
      de: 'die Kater müssen fressen.',
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
      de: 'der Kater kann die Maus fressen.',
      ja: '猫はネズミを食べることができます。',
    });
  });
});

describe('modals: tense', () => {
  test('the outermost modal carries the tense', () => {
    expect(catModal({ modals: ['MUST'], tense: 'past' })).toMatchObject({
      en: 'the cat had to eat.', // English supplets: must has no past
      it: 'il gatto doveva mangiare.',
      fr: 'le chat devait manger.',
      es: 'el gato debía comer.',
      de: 'der Kater musste fressen.',
      ja: '猫は食べる必要がありました。',
    });
  });

  test('a future modal stacks two infinitives in German', () => {
    expect(catModal({ modals: ['MUST'], tense: 'future' })).toMatchObject({
      en: 'the cat will have to eat.',
      it: 'il gatto dovrà mangiare.',
      fr: 'le chat devra manger.',
      // "wird essen müssen" — the double infinitive, both at the end.
      de: 'der Kater wird fressen müssen.',
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
      de: 'der Kater muss gefressen haben.',
      ja: '猫は食べている必要があります。', // "needs to have eaten": the resultant state (B07)
    });
  });

  test('a progressive under a modal', () => {
    expect(catModal({ modals: ['MUST'], aspect: 'progressive' })).toMatchObject({
      en: 'the cat must be eating.',
      it: 'il gatto deve stare mangiando.',
      es: 'el gato debe estar comiendo.',
      de: 'der Kater muss gerade fressen.',
      ja: '猫は食べている必要があります。',
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
      de: 'der Kater will fressen können.',
    });
  });

  test('the chain order is outermost first', () => {
    // MUST over CAN and CAN over MUST mean different things, and the order is honoured.
    expect(catModal({ modals: ['MUST', 'CAN'] })).toMatchObject({
      en: 'the cat must be able to eat.',
      it: 'il gatto deve poter mangiare.',
      de: 'der Kater muss fressen können.',
    });

    expect(catModal({ modals: ['CAN', 'WILL'] })).toMatchObject({
      en: 'the cat can want to eat.',
      it: 'il gatto può voler mangiare.', // volere → voler
      de: 'der Kater kann fressen wollen.',
    });
  });

  test('the outermost modal of a chain carries the tense and the negation', () => {
    expect(catModal({ modals: [{ verb: 'MUST', negative: true }, 'CAN'], tense: 'past' })).toMatchObject({
      en: 'the cat did not have to be able to eat.',
      it: 'il gatto non doveva poter mangiare.',
      fr: 'le chat ne devait pas pouvoir manger.',
      de: 'der Kater musste nicht fressen können.',
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
      de: 'der Kater will fressen können müssen.',
    });
  });

  test('a three-modal chain carries tense and negation on the outermost only', () => {
    expect(catModal({ modals: [{ verb: 'WILL', negative: true }, 'MUST', 'CAN'], tense: 'past' })).toMatchObject({
      en: 'the cat did not want to have to be able to eat.', // do-support: WILL is the lexical "want"
      it: 'il gatto non voleva dover poter mangiare.',
      fr: 'le chat ne voulait pas devoir pouvoir manger.',
      de: 'der Kater wollte nicht fressen können müssen.',
    });
  });
});

describe('modals: negation', () => {
  test('CAN — the negation is unambiguous', () => {
    expect(catModal({ modals: [{ verb: 'CAN', negative: true }] })).toEqual({
      en: 'the cat cannot eat.',
      it: 'il gatto non può mangiare.',
      fr: 'le chat ne peut pas manger.',
      es: 'el gato no puede comer.',
      pt: 'o gato não pode comer.',
      de: 'der Kater kann nicht fressen.',
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
      de: 'der Kater muss fressen können.', // both infinitives at the end
      ja: '猫は食べることができる必要があります。',
    });

    expect(catModal({ modals: ['MUST', 'WILL'] })).toMatchObject({
      en: 'the cat must want to eat.',
      it: 'il gatto deve voler mangiare.', // volere → voler
      es: 'el gato debe querer comer.',
      de: 'der Kater muss fressen wollen.',
    });
  });

  test('CAN over MUST / WILL', () => {
    expect(catModal({ modals: ['CAN', 'MUST'] })).toMatchObject({
      // English has no double modal, so the inner one goes periphrastic: "can have to".
      en: 'the cat can have to eat.',
      it: 'il gatto può dover mangiare.', // dovere → dover
      fr: 'le chat peut devoir manger.',
      de: 'der Kater kann fressen müssen.',
    });

    expect(catModal({ modals: ['CAN', 'WILL'] })).toMatchObject({
      en: 'the cat can want to eat.',
      it: 'il gatto può voler mangiare.',
      de: 'der Kater kann fressen wollen.',
    });
  });

  test('WILL over MUST / CAN', () => {
    expect(catModal({ modals: ['WILL', 'MUST'] })).toMatchObject({
      en: 'the cat wants to have to eat.',
      it: 'il gatto vuole dover mangiare.',
      pt: 'o gato quer dever comer.',
      de: 'der Kater will fressen müssen.',
    });

    expect(catModal({ modals: ['WILL', 'CAN'] })).toMatchObject({
      en: 'the cat wants to be able to eat.',
      it: 'il gatto vuole poter mangiare.',
      de: 'der Kater will fressen können.',
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
  const negPair = (a: string, b: string) => catModal({ modals: [{ verb: a, negative: true }, b] });

  test('MUST outermost', () => {
    expect(negPair('MUST', 'CAN')).toMatchObject({
      // English scopes a negated MUST as ¬obligation ("does not have to"), consistent with its own
      // past and with German/Japanese — see "known bugs: modals" below. The others were already so.
      en: 'the cat does not have to be able to eat.',
      it: 'il gatto non deve poter mangiare.', // "non" precedes the finite modal only
      fr: 'le chat ne doit pas pouvoir manger.', // ne … pas brackets the FINITE modal
      de: 'der Kater muss nicht fressen können.',
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
      de: 'der Kater kann nicht fressen müssen.',
    });

    expect(negPair('CAN', 'WILL')).toMatchObject({
      en: 'the cat cannot want to eat.',
      pt: 'o gato não pode querer comer.',
      de: 'der Kater kann nicht fressen wollen.',
    });
  });

  test('WILL outermost — English needs do-support, "want" being a lexical verb', () => {
    expect(negPair('WILL', 'CAN')).toMatchObject({
      en: 'the cat does not want to be able to eat.', // not "wants not to"
      it: 'il gatto non vuole poter mangiare.',
      fr: 'le chat ne veut pas pouvoir manger.',
      de: 'der Kater will nicht fressen können.',
    });

    expect(negPair('WILL', 'MUST')).toMatchObject({
      en: 'the cat does not want to have to eat.',
      es: 'el gato no quiere deber comer.',
    });
  });

  test('a negated pair in the past — the outermost takes tense AND negation', () => {
    expect(catModal({ modals: [{ verb: 'MUST', negative: true }, 'CAN'], tense: 'past' })).toMatchObject({
      en: 'the cat did not have to be able to eat.',
      it: 'il gatto non doveva poter mangiare.',
      fr: 'le chat ne devait pas pouvoir manger.',
      de: 'der Kater musste nicht fressen können.',
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
      de: 'der Kater kann schnell fressen.', // German puts it before the clause-final infinitive
      ja: '猫は速く食べることができます。',
    });

    expect(catModal({ modals: ['CAN'], modifier: 'WELL' })).toMatchObject({
      en: 'the cat can eat well.',
      it: 'il gatto può mangiare bene.',
      de: 'der Kater kann gut fressen.',
    });
  });

  test('an adverb alongside an object', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', {
      verbPhrase: { modals: ['CAN'], modifier: 'FAST' },
      directObject: np('MOUSE'),
    }))).toMatchObject({
      en: 'the cat can eat the mouse fast.',
      it: 'il gatto può mangiare velocemente il topo.',
      de: 'der Kater kann schnell die Maus fressen.',
      ja: '猫はネズミを速く食べることができます。',
    });
  });

  test('an adverb over a modal CHAIN, and with negation', () => {
    expect(catModal({ modals: ['MUST', 'CAN'], modifier: 'FAST' })).toMatchObject({
      en: 'the cat must be able to eat fast.',
      it: 'il gatto deve poter mangiare velocemente.',
      de: 'der Kater muss schnell fressen können.',
    });

    expect(catModal({ modals: [{ verb: 'MUST', negative: true }, 'CAN'], modifier: 'FAST' }))
      .toMatchObject({
        en: 'the cat does not have to be able to eat fast.', // ¬obligation scope (see below)
        it: 'il gatto non deve poter mangiare velocemente.',
        fr: 'le chat ne doit pas pouvoir manger vite.',
        de: 'der Kater muss nicht schnell fressen können.',
      });

    expect(catModal({ modals: [{ verb: 'CAN', negative: true }], modifier: 'FAST' })).toMatchObject({
      en: 'the cat cannot eat fast.',
      es: 'el gato no puede comer rápido.',
      de: 'der Kater kann nicht schnell fressen.',
    });
  });

  test('everything at once: chain, adverb, object and tense', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', {
      verbPhrase: { modals: ['WILL', 'CAN'], modifier: 'FAST', tense: 'past' },
      directObject: np('MOUSE'),
    }))).toMatchObject({
      en: 'the cat wanted to be able to eat the mouse fast.',
      it: 'il gatto voleva poter mangiare velocemente il topo.',
      fr: 'le chat voulait pouvoir manger vite la souris.',
      de: 'der Kater wollte schnell die Maus fressen können.',
    });
  });

  test('a frequency adverb — the other six place it correctly', () => {
    // Only English gets this wrong (see the bugs below); the rest are pinned here.
    expect(catModal({ modals: ['MUST'], modifier: 'ALWAYS' })).toMatchObject({
      it: 'il gatto deve mangiare sempre.',
      fr: 'le chat doit toujours manger.',
      de: 'der Kater muss immer fressen.',
      ja: '猫はいつも食べる必要があります。',
    });

    expect(catModal({ modals: ['MUST'], modifier: 'NEVER' })).toMatchObject({
      it: 'il gatto non deve mangiare mai.', // non … mai brackets the verb
      fr: 'le chat ne doit jamais manger.',
      es: 'el gato nunca debe comer.',
      de: 'der Kater muss nie fressen.',
    });
  });
});

// B07 (fixed). Japanese used to drop the aspect under a modal (猫は食べる必要があります whatever the
// aspect), while the other six compose the two ("must have eaten"). The aspect now stands under the
// modal in the form the modal governs: the dictionary form for 〜必要がある / 〜ことができる, the stem
// for 〜たい. The progressive and the resultative are both the resultant state 〜ている ("needs to be
// eating / to have eaten"), and the prospective is 〜ようとしている, as in a relative clause (B14).
describe('Japanese aspect under a modal', () => {
  const ja = (verbPhrase: Partial<VerbPhrase>) => catModal(verbPhrase).ja;

  test('Japanese should not drop the aspect under a modal', () => {
    expect(catModal({ modals: ['MUST'], aspect: 'resultative' }).ja)
      .not.toBe('猫は食べる必要があります。');
  });

  test('each modal governs the aspect in its own form', () => {
    expect(ja({ modals: ['MUST'], aspect: 'progressive' })).toBe('猫は食べている必要があります。');
    expect(ja({ modals: ['MUST'], aspect: 'resultative' })).toBe('猫は食べている必要があります。');
    expect(ja({ modals: ['MUST'], aspect: 'prospective' })).toBe('猫は食べようとしている必要があります。');
    expect(ja({ modals: ['CAN'], aspect: 'progressive' })).toBe('猫は食べていることができます。');
    expect(ja({ modals: ['CAN'], aspect: 'resultative' })).toBe('猫は食べていることができます。');
    expect(ja({ modals: ['CAN'], aspect: 'prospective' })).toBe('猫は食べようとしていることができます。');
    // 〜たい governs the stem: いる's is い.
    expect(ja({ modals: ['WILL'], aspect: 'progressive' })).toBe('猫は食べていたいです。');
    expect(ja({ modals: ['WILL'], aspect: 'resultative' })).toBe('猫は食べていたいです。');
    expect(ja({ modals: ['WILL'], aspect: 'prospective' })).toBe('猫は食べようとしていたいです。');
  });

  test('the modal keeps the tense and the polarity', () => {
    expect(ja({ modals: [{ verb: 'MUST', negative: true }], aspect: 'resultative', tense: 'past' })).toBe('猫は食べている必要がありませんでした。');
    expect(ja({ modals: [{ verb: 'CAN', negative: true }], aspect: 'prospective', tense: 'past' })).toBe('猫は食べようとしていることができませんでした。');
    expect(ja({ modals: [{ verb: 'WILL', negative: true }], aspect: 'progressive', tense: 'past' })).toBe('猫は食べていたくなかったです。');
  });

  test('a bridged chain, an object, an adverb, a passive and a state verb all compose', () => {
    expect(ja({ modals: ['WILL', 'CAN'], aspect: 'progressive' })).toBe('猫は食べていることができるようになりたいです。');
    expect(ja({ modals: ['CAN', 'WILL'], aspect: 'progressive' })).toBe('猫は食べていたいと思うことができます。');
    expect(ja({ modals: ['MUST', 'CAN'], aspect: 'resultative' })).toBe('猫は食べていることができる必要があります。');
    expect(ja({ modals: ['MUST'], aspect: 'progressive', modifier: 'ALWAYS' })).toBe('猫はいつも食べている必要があります。');
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { modals: ['MUST'], aspect: 'resultative' }, directObject: np('MOUSE') })).ja)
      .toBe('猫はネズミを食べている必要があります。');
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { modals: ['MUST'], aspect: 'resultative', voice: 'passive' }, directObject: np('FOOD') })).ja)
      .toBe('食べ物は猫に食べられている必要があります。');
    expect(sayAll(clause(np('CAT'), 'HAVE', { verbPhrase: { modals: ['MUST'], aspect: 'progressive' }, directObject: np('BOOK') })).ja)
      .toBe('猫は本を持っている必要があります。');
    expect(sayAll(clause(np('CAT'), 'COME', { verbPhrase: { modals: ['WILL'], aspect: 'prospective' } })).ja).toBe('猫は来ようとしていたいです。');
  });

  test('in a relative clause and an "if" clause, the modal takes the plain and たら endings', () => {
    expect(sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT', modals: ['MUST'], aspect: 'progressive' } } }), 'RUN')).ja)
      .toBe('食べている必要がある猫は走ります。');
    expect(sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT', modals: ['WILL'], aspect: 'prospective' } } }), 'RUN')).ja)
      .toBe('食べようとしていたい猫は走ります。');
    expect(sayAll({ ...clause(np('DOG'), 'RUN'), condition: clause(np('CAT'), 'EAT', { verbPhrase: { modals: ['CAN'], aspect: 'progressive' } }) }).ja)
      .toBe('もし猫が食べていることができたら、犬は走ります。');
  });

  // Aspect on a copula is marginal, and the existential is a state that takes none.
  test('regression: the copula and the existential keep their aspect-less form under a modal', () => {
    expect(sayAll(clause(np('CAT'), 'BE', { verbPhrase: { modals: ['MUST'], aspect: 'progressive' }, complements: { predicative: { phrase: np('HAPPY') } } })).ja)
      .toBe('猫は幸せである必要があります。');
    expect(sayAll(clause(np('CAT'), 'BE', { verbPhrase: { modals: ['MUST'], aspect: 'progressive' }, complements: { locative: { phrase: np('HOUSE') } } })).ja)
      .toBe('猫は家にいる必要があります。');
    expect(ja({ modals: ['MUST'] })).toBe('猫は食べる必要があります。');
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
    expect(catModal({ modals: [{ verb: 'MUST', negative: true }] }))
      .toMatchObject({ en: 'the cat does not have to eat.' });
  });

  // The same divergence ACROSS languages, on one plan. German "muss nicht" is "does not have to"
  // (absence of obligation); the prohibition would be "darf nicht essen". English now agrees with
  // German/Japanese on the ¬must reading, so the same plan no longer reads as opposites.
  test('MUST + negative means the same thing in every language', () => {
    const said = catModal({ modals: [{ verb: 'MUST', negative: true }] });
    // English and German must not read as opposites.
    expect([said.en, said.de]).not.toEqual([
      'the cat must not eat.', // prohibition
      'der Kater muss nicht fressen.', // absence of obligation
    ]);
  });

  // One ¬obligation scope in every tense: "does not / did not / will not have to eat" — no tense
  // is the odd one out any longer.
  test('English negates MUST periphrastically in every tense', () => {
    expect(catModal({ modals: [{ verb: 'MUST', negative: true }] }).en).toBe('the cat does not have to eat.');
    expect(catModal({ modals: [{ verb: 'MUST', negative: true }], tense: 'past' }).en).toBe('the cat did not have to eat.');
    expect(catModal({ modals: [{ verb: 'MUST', negative: true }], tense: 'future' }).en).toBe('the cat will not have to eat.');
  });

  // The do-support agrees with the subject: "the cats do not have to eat".
  test('English MUST negation takes plural do-support', () => {
    expect(sayAll(clause(np('CAT', { number: 'plural' }), 'EAT', {
      verbPhrase: { modals: [{ verb: 'MUST', negative: true }] },
    })).en).toBe('the cats do not have to eat.');
  });

  // Regression: the other true modals are untouched — a negated CAN is still the prohibitive
  // "cannot", and MUST as the INNER member of a chain keeps its "have to" citation ("cannot have
  // to eat"), since only the finite (outermost) form is chosen here.
  test('English still negates CAN as "cannot", and MUST-inner as "have to"', () => {
    expect(catModal({ modals: [{ verb: 'CAN', negative: true }] }).en).toBe('the cat cannot eat.');
    expect(catModal({ modals: [{ verb: 'CAN', negative: true }, 'MUST'] }).en).toBe('the cat cannot have to eat.');
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
    expect(catModal({ modals: [{ verb: 'WILL', negative: true }, 'CAN'] }).ja)
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
        it: 'il gatto non voleva mai mangiare sempre.',
        fr: 'le chat ne voulait jamais toujours manger.',
        es: 'el gato nunca quería comer siempre.',
        pt: 'o gato nunca queria comer sempre.',
        de: 'der Kater wollte nie immer fressen.',
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
      de: 'der Kater muss immer fressen.',
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
      de: 'der Kater will nie fressen.',
      ja: '猫は決して食べたくないです。',
    });
  });
});

// A61. In a verb-final clause a double infinitive (a modal's infinitive under werden/würde) keeps
// the finite auxiliary in front of the infinitive cluster, not behind it: "…, der das Buch wird
// essen müssen", "wenn der Kater würde essen müssen". The engine appends the finite verb last, as it
// does for a single infinitive ("der das Buch essen wird", which is right).
describe('known bugs: German double infinitive in a verb-final clause', () => {
  test('German puts werden/würde before the infinitive cluster', () => {
    expect(sayAll(clause(np('DOG', {
      relative: { verbPhrase: { verb: 'EAT', tense: 'future', modals: [{ verb: 'MUST' }] }, directObject: np('BOOK') },
    }), 'RUN')).de).toBe('der Hund, der das Buch wird fressen müssen, läuft.');
    expect(sayAll({
      ...clause(np('DOG'), 'RUN'),
      condition: clause(np('CAT'), 'EAT', { verbPhrase: { modals: [{ verb: 'MUST' }] }, directObject: np('MOUSE') }),
    }).de).toBe('wenn der Kater die Maus würde fressen müssen, würde der Hund laufen.');
  });

  const dogWho = (verbPhrase: Partial<VerbPhrase>, extra: object = { directObject: np('BOOK') }) =>
    sayAll(clause(np('DOG', { relative: { verbPhrase: { verb: 'EAT', ...verbPhrase }, ...extra } }), 'RUN')).de;

  test('German fronts the auxiliary over a modal chain, a perfect, a progressive, a negation and an object relative', () => {
    expect(dogWho({ tense: 'future', modals: [{ verb: 'WILL' }, { verb: 'CAN' }] })).toBe('der Hund, der das Buch wird fressen können wollen, läuft.');
    expect(dogWho({ tense: 'future', aspect: 'resultative', modals: [{ verb: 'MUST' }] })).toBe('der Hund, der das Buch wird gefressen haben müssen, läuft.');
    expect(dogWho({ tense: 'future', aspect: 'progressive', modals: [{ verb: 'MUST' }] })).toBe('der Hund, der gerade das Buch wird fressen müssen, läuft.');
    expect(dogWho({ tense: 'future', modals: [{ verb: 'MUST', negative: true }] })).toBe('der Hund, der das Buch nicht wird fressen müssen, läuft.');
    expect(sayAll(clause(np('MOUSE', {
      relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'EAT', tense: 'future', modals: [{ verb: 'MUST' }] } },
    }), 'RUN')).de).toBe('die Maus, die der Kater wird fressen müssen, läuft.');
  });

  test('German fronts the auxiliary ahead of the prospective\'s "sein" and the modals', () => {
    expect(dogWho({ tense: 'future', aspect: 'prospective', modals: [{ verb: 'MUST' }] }, {})).toBe('der Hund, der im Begriff zu fressen wird sein müssen, läuft.');
    expect(dogWho({ tense: 'future', aspect: 'prospective', modals: [{ verb: 'MUST' }] })).toBe('der Hund, der im Begriff wird sein müssen, das Buch zu fressen, läuft.');
  });

  test('regression: a single infinitive keeps the finite verb last, and the main clause is unchanged', () => {
    expect(dogWho({ tense: 'future' })).toBe('der Hund, der das Buch fressen wird, läuft.');
    expect(dogWho({ modals: [{ verb: 'MUST' }] })).toBe('der Hund, der das Buch fressen muss, läuft.');
    expect(sayAll({ ...clause(np('DOG'), 'RUN'), condition: clause(np('CAT'), 'EAT', { directObject: np('MOUSE') }) }).de)
      .toBe('wenn der Kater die Maus fressen würde, würde der Hund laufen.');
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { tense: 'future', modals: [{ verb: 'MUST' }] }, directObject: np('MOUSE') })).de)
      .toBe('der Kater wird die Maus fressen müssen.');
  });
});

// A80. A modal's own manner adverb is placed right after the modal ("can fast eat", "wants fast to
// eat"). English has no slot for a manner adverb between a modal (or "want to") and its infinitive;
// it trails the verb group and its object, where the main verb's manner adverb already goes
// ("can eat the mouse fast").
describe('known bugs: English manner adverb on a modal', () => {
  test('English trails a modal\'s manner adverb after the verb group', () => {
    expect(say(clause(np('CAT'), 'EAT', { verbPhrase: { modals: [{ verb: 'CAN', modifier: 'FAST' }] } }), 'en')).toBe('the cat can eat fast.');
    expect(say(clause(np('CAT'), 'EAT', { verbPhrase: { modals: [{ verb: 'WILL', modifier: 'FAST' }] } }), 'en')).toBe('the cat wants to eat fast.');
    expect(say(clause(np('CAT'), 'EAT', { verbPhrase: { modals: [{ verb: 'CAN', modifier: 'FAST' }] }, directObject: np('MOUSE') }), 'en')).toBe('the cat can eat the mouse fast.');
    expect(say(clause(np('CAT'), 'EAT', { verbPhrase: { modals: ['MUST', { verb: 'CAN', modifier: 'FAST' }] } }), 'en')).toBe('the cat must be able to eat fast.');
    expect(say({ ...clause(np('DOG'), 'RUN', { verbPhrase: { modals: [{ verb: 'CAN', modifier: 'FAST' }] } }), condition: clause(np('CAT'), 'EAT') }, 'en')).toBe('if the cat ate, the dog would be able to run fast.');
  });

  test('English trails a modal\'s manner adverb in every row of the table', () => {
    const cat = (verbPhrase: Partial<VerbPhrase>, extra: object = {}) => say(clause(np('CAT'), 'EAT', { verbPhrase, ...extra }), 'en');
    expect(cat({ modals: [{ verb: 'WILL', modifier: 'FAST' }] })).toBe('the cat wants to eat fast.');
    expect(cat({ modals: [{ verb: 'CAN', modifier: 'FAST', negative: true }] })).toBe('the cat cannot eat fast.');
    expect(cat({ modals: [{ verb: 'MUST' }, { verb: 'CAN', modifier: 'FAST' }] })).toBe('the cat must be able to eat fast.');
    expect(say({ ...clause(np('DOG'), 'RUN', { verbPhrase: { modals: [{ verb: 'CAN', modifier: 'FAST' }] } }), condition: clause(np('CAT'), 'EAT') }, 'en'))
      .toBe('if the cat ate, the dog would be able to run fast.');
    expect(cat({ modals: [{ verb: 'CAN', modifier: 'TOGETHER' }] })).toBe('the cat can eat together.');
  });
});

// A113. `modalSegs` bridges WILL over a verb-kind modal with ようになる. When another modal governs
// that WILL, the branch returns ように + なる and never emits the たい, so MUST > WILL > CAN reads
// "must think it comes to be able to eat" (…ようになると思う必要があります). Only a three-modal plan
// reaches it; the UI chains two.
describe('known bugs: Japanese 〜たい bridge inside a longer modal chain', () => {
  test('Japanese keeps 〜たい when the ようになる bridge is itself governed', () => {
    const eats = (modals: string[]) => sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { modals } })).ja;
    expect(eats(['MUST', 'WILL', 'CAN'])).toBe('猫は食べることができるようになりたいと思う必要があります。');
    expect(eats(['CAN', 'WILL', 'CAN'])).toBe('猫は食べることができるようになりたいと思うことができます。');
    expect(eats(['CAN', 'WILL', 'MUST'])).toBe('猫は食べる必要があるようになりたいと思うことができます。');
  });

  test('Japanese keeps 〜たい through tense and polarity and in a four-modal chain', () => {
    const eats = (modals: ModalRef[], verbPhrase = {}) => sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { modals, ...verbPhrase } })).ja;
    expect(eats([{ verb: 'MUST', negative: true }, 'WILL', 'CAN'], { tense: 'past' })).toBe('猫は食べることができるようになりたいと思う必要がありませんでした。');
    expect(eats(['WILL', 'CAN', 'WILL', 'CAN'])).toBe('猫は食べることができるようになりたいと思うことができるようになりたいです。');
  });

  test('regression: the two-modal bridges are unchanged', () => {
    const eats = (modals: string[]) => sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { modals } })).ja;
    expect(eats(['WILL', 'CAN'])).toBe('猫は食べることができるようになりたいです。');
    expect(eats(['CAN', 'WILL'])).toBe('猫は食べたいと思うことができます。');
  });
});

// A128. A modal on the Japanese copula is dropped. `predicateSegs` returns from its copula branch
// (predicate + です) before the modal path, so "the cat must be happy" renders "the cat is happy"
// (猫は幸せです), and MUST, CAN and WILL all vanish. The existential BE, a real verb, keeps its modal
// (家にいる必要があります). The copula's plain form governs the modal as a verb's dictionary form does:
// 幸せである必要があります, 伝説であることができます, and its stem takes 〜たい: 伝説でありたいです.
describe('known bugs: Japanese modal on the copula', () => {
  const isA = (predicate: string, verbPhrase: Partial<VerbPhrase>) =>
    clause(np('CAT'), 'BE', { verbPhrase, complements: { predicative: { phrase: np(predicate) } } });

  test('Japanese keeps the modal on a predicate adjective or noun', () => {
    const ja = (predicate: string, verbPhrase: Partial<VerbPhrase>) => say(isA(predicate, verbPhrase), 'ja');
    expect(ja('HAPPY', { modals: ['MUST'] })).toBe('猫は幸せである必要があります。');
    expect(ja('BIG', { modals: ['MUST'] })).toBe('猫は大きい必要があります。');
    expect(ja('TIRED', { modals: ['MUST'] })).toBe('猫は疲れている必要があります。');
    expect(ja('LEGEND', { modals: ['MUST'] })).toBe('猫は伝説である必要があります。');
    expect(ja('HAPPY', { modals: [{ verb: 'MUST', negative: true }] })).toBe('猫は幸せである必要がありません。');
    expect(ja('LEGEND', { modals: ['MUST'], tense: 'past' })).toBe('猫は伝説である必要がありました。');
    expect(ja('LEGEND', { modals: ['CAN'] })).toBe('猫は伝説であることができます。');
    expect(ja('LEGEND', { modals: ['WILL'] })).toBe('猫は伝説でありたいです。');
    expect(say(clause(np('CAT', { relative: { verbPhrase: { verb: 'BE', modals: ['MUST'] }, complements: { predicative: { phrase: np('LEGEND') } } } }), 'RUN'), 'ja'))
      .toBe('伝説である必要がある猫は走ります。');
    // A121's elided predicate carries the modal too.
    expect(say({
      ...isA('HAPPY', {}),
      coordination: { conjunction: 'but', clause: clause(np('DOG'), 'BE', { verbPhrase: { modals: [{ verb: 'MUST', negative: true }] } }) },
    }, 'ja')).toMatch(/犬はそうである必要がありません。$/);
  });

  // The たら protasis, a modal chain, 〜たい on each adjective class, the relative's past, the modals' adverbs
  // and the other complements, which lead the predicate as they do without a modal.
  test('Japanese composes the copula\'s modal in the protasis, a chain and every adjective class', () => {
    const ja = (plan: PhrasePlan) => say(plan, 'ja');
    expect(ja({ ...clause(np('DOG'), 'RUN'), condition: isA('LEGEND', { modals: ['CAN'] }) })).toBe('もし猫が伝説であることができたら、犬は走ります。');
    expect(ja({ ...clause(np('DOG'), 'RUN'), condition: isA('HAPPY', { modals: [{ verb: 'MUST', negative: true }] }) }))
      .toBe('もし猫が幸せである必要がなかったら、犬は走ります。');
    expect(ja(isA('LEGEND', { modals: ['WILL', 'CAN'] }))).toBe('猫は伝説であることができるようになりたいです。');
    expect(ja(isA('HAPPY', { modals: ['MUST', 'CAN'] }))).toBe('猫は幸せであることができる必要があります。');
    expect(ja(isA('BIG', { modals: ['WILL'] }))).toBe('猫は大きくありたいです。');
    expect(ja(isA('TIRED', { modals: ['WILL'] }))).toBe('猫は疲れていたいです。');
    expect(ja(isA('HAPPY', { modals: [{ verb: 'WILL', negative: true }] }))).toBe('猫は幸せでありたくないです。');
    expect(ja(isA('TIRED', { modals: [{ verb: 'CAN', negative: true }], tense: 'past' }))).toBe('猫は疲れていることができませんでした。');
    expect(ja(clause(np('CAT', { relative: { verbPhrase: { verb: 'BE', modals: ['CAN'], tense: 'past' }, complements: { predicative: { phrase: np('HAPPY') } } } }), 'RUN')))
      .toBe('幸せであることができた猫は走ります。');
    expect(ja(isA('HAPPY', { modals: [{ verb: 'MUST', modifier: 'ALWAYS' }], modifier: 'NEVER' }))).toBe('猫はいつも決して幸せである必要がありません。');
    expect(ja(clause(np('CAT'), 'BE', { verbPhrase: { modals: ['MUST'] }, complements: { predicative: { phrase: np('HAPPY') }, locative: { phrase: np('HOUSE') } } })))
      .toBe('猫は家で幸せである必要があります。');
  });

  test('regression: the existential and a verb keep their modal, and the other languages render it', () => {
    expect(say(clause(np('CAT'), 'BE', { verbPhrase: { modals: ['MUST'] }, complements: { locative: { phrase: np('HOUSE') } } }), 'ja'))
      .toBe('猫は家にいる必要があります。');
    expect(catModal({ modals: ['MUST'] }).ja).toBe('猫は食べる必要があります。');
    expect(sayAll(isA('HAPPY', { modals: ['MUST'] }))).toMatchObject({
      en: 'the cat must be happy.',
      de: 'der Kater muss glücklich sein.',
      es: 'el gato debe estar feliz.',
    });
  });
});

// A222. A modal is kept out of the main-verb picker because it governs a verb group rather than heading
// one, but a definition can still name one as its genus — "to want to have objects" is WILL governing
// an infinitive complement, since the citation mood drops `modals`. The Romance four render that as the
// complement it is ("volere avere oggetti"), and so does English WILL. The other modals are not verbs of
// that kind: Japanese glued its infinitive to the modal with ことを (行動することをたい), German extraposed
// it as a zu-clause after a comma (wollen, zu handeln), and English cited a defective CAN or MUST with
// "to" (to can to act). Found authoring the C23-C28 sweep.
describe('known bugs: a modal as the verb of a clause that governs an infinitive (A222)', () => {
  const G = np('GENERIC_PERSON');
  const OBJECTS = np('OBJECT_THING', { definiteness: 'bare', number: 'plural' });
  const ACT = { verbPhrase: { verb: 'ACT' } };
  const HAVE_OBJECTS = { verbPhrase: { verb: 'HAVE' }, directObject: OBJECTS };
  const citeModal = (modal: string, infinitive: NonNullable<PhrasePlan['infinitiveComplement']>, verbPhrase: Partial<VerbPhrase> = {}): PhrasePlan =>
    ({ subject: G, verbPhrase: { verb: modal, ...verbPhrase }, infinitiveComplement: infinitive, infinitive: true });

  test('the modal governs its verb as it does in a modal chain', () => {
    expect(sayAll(citeModal('WILL', ACT))).toMatchObject({ de: 'handeln wollen.', ja: '行動したい。' });
    expect(sayAll(citeModal('WILL', HAVE_OBJECTS))).toMatchObject({ de: 'Gegenstände haben wollen.', ja: '物体を持ちたい。' });
    expect(sayAll(citeModal('CAN', ACT))).toMatchObject({ en: 'to be able to act.', de: 'handeln können.', ja: '行動することができる。' });
    expect(sayAll(citeModal('CAN', HAVE_OBJECTS)))
      .toMatchObject({ en: 'to be able to have objects.', de: 'Gegenstände haben können.', ja: '物体を持つことができる。' });
    expect(sayAll(citeModal('MUST', ACT))).toMatchObject({ en: 'to have to act.', de: 'handeln müssen.', ja: '行動する必要がある。' });
    expect(sayAll(citeModal('WILL', ACT, { negative: true }))).toMatchObject({ de: 'nicht handeln wollen.', ja: '行動したくない。' });
    // Governed in turn, and in a finite clause.
    expect(sayAll({ subject: G, verbPhrase: { verb: 'DESIRE' }, infinitiveComplement: { verbPhrase: { verb: 'WILL' }, infinitiveComplement: ACT }, infinitive: true }))
      .toMatchObject({ de: 'wünschen, handeln zu wollen.', ja: '行動したいことを望む。' });
    expect(sayAll({ subject: np('CAT'), verbPhrase: { verb: 'WILL', tense: 'past' }, infinitiveComplement: HAVE_OBJECTS }))
      .toMatchObject({ de: 'der Kater wollte Gegenstände haben.', ja: '猫は物体を持ちたかったです。' });
  });

  test('regression: the Romance four, English WILL, a lexical governor and the modal chain', () => {
    expect(sayAll(citeModal('WILL', HAVE_OBJECTS))).toMatchObject({
      en: 'to want to have objects.', it: 'volere avere oggetti.', fr: 'vouloir avoir des objets.',
      es: 'querer tener objetos.', pt: 'querer ter objetos.',
    });
    expect(sayAll(citeModal('CAN', ACT))).toMatchObject({ it: 'potere agire.', fr: 'pouvoir agir.', es: 'poder actuar.', pt: 'poder agir.' });
    expect(sayAll(citeModal('MUST', ACT))).toMatchObject({ it: 'dovere agire.', fr: 'devoir agir.', es: 'deber actuar.', pt: 'dever agir.' });
    expect(sayAll({ subject: G, verbPhrase: { verb: 'DESIRE' }, infinitiveComplement: ACT, infinitive: true })).toEqual({
      en: 'to desire to act.', it: 'desiderare agire.', fr: 'désirer agir.', de: 'wünschen, zu handeln.',
      es: 'desear actuar.', ja: '行動することを望む。', pt: 'desejar agir.',
    });
    expect(sayAll(clause(np('CAT'), 'HAVE', { verbPhrase: { modals: ['WILL'], tense: 'past' }, directObject: OBJECTS }))).toMatchObject({
      en: 'the cat wanted to have objects.', de: 'der Kater wollte Gegenstände haben.', ja: '猫は物体を持ちたかったです。',
    });
  });

  // The fold applies to its own result, so a modal governing a modal is one chain, outermost first, as
  // `modals: ['WILL', 'CAN']` gives it; the Romance four keep the complement they render.
  test('a modal governing a modal by complements is one chain', () => {
    expect(sayAll(citeModal('WILL', { verbPhrase: { verb: 'CAN' }, infinitiveComplement: ACT }))).toMatchObject({
      en: 'to want to be able to act.', de: 'handeln können wollen.', ja: '行動することができるようになりたい。',
      it: 'volere potere agire.', fr: 'vouloir pouvoir agir.',
    });
    expect(sayAll(citeModal('MUST', { verbPhrase: { verb: 'CAN' }, infinitiveComplement: ACT }))).toMatchObject({
      en: 'to have to be able to act.', de: 'handeln können müssen.', ja: '行動することができる必要がある。',
    });
  });

  // The chain keeps the governing clause's negation, tense, question, condition, own modals and
  // adverb, and the complement's object, adverb, copula and the infinitive it governs in turn.
  test('the chain keeps what the governing clause and its complement each carried', () => {
    const catGoverns = (verbPhrase: VerbPhrase, infinitiveComplement: NonNullable<PhrasePlan['infinitiveComplement']>, rest: Partial<PhrasePlan> = {}): PhrasePlan =>
      ({ subject: np('CAT'), verbPhrase, infinitiveComplement, ...rest });
    expect(sayAll(citeModal('MUST', ACT, { negative: true }))).toMatchObject({ en: 'not to have to act.', de: 'nicht handeln müssen.', ja: '行動する必要がない。' });
    expect(sayAll(catGoverns({ verb: 'CAN', negative: true }, ACT)))
      .toMatchObject({ en: 'the cat cannot act.', de: 'der Kater kann nicht handeln.', ja: '猫は行動することができません。' });
    expect(sayAll(catGoverns({ verb: 'MUST' }, ACT, { interrogative: true })))
      .toMatchObject({ en: 'must the cat act?', de: 'muss der Kater handeln?', ja: '猫は行動する必要がありますか？' });
    expect(sayAll(catGoverns({ verb: 'WILL', modals: ['MUST'] }, ACT)))
      .toMatchObject({ en: 'the cat must want to act.', de: 'der Kater muss handeln wollen.', ja: '猫は行動したいと思う必要があります。' });
    expect(sayAll(catGoverns({ verb: 'CAN', tense: 'future' }, { verbPhrase: { verb: 'EAT', modifier: 'FAST' }, directObject: np('MOUSE') }))).toMatchObject({
      en: 'the cat will be able to eat the mouse fast.', de: 'der Kater wird schnell die Maus fressen können.', ja: '猫はネズミを速く食べることができます。',
    });
    expect(sayAll({ subject: np('DOG'), verbPhrase: { verb: 'RUN' }, condition: catGoverns({ verb: 'WILL' }, ACT) })).toMatchObject({
      en: 'if the cat wanted to act, the dog would run.', de: 'wenn der Kater würde handeln wollen, würde der Hund laufen.',
      ja: 'もし猫が行動したかったら、犬は走ります。',
    });
    expect(sayAll(citeModal('WILL', ACT, { modifier: 'ALWAYS' }))).toMatchObject({ en: 'to always want to act.', de: 'immer handeln wollen.', ja: 'いつも行動したい。' });
    expect(sayAll(citeModal('WILL', { verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: np('HAPPY') } } })))
      .toMatchObject({ en: 'to want to be happy.', de: 'glücklich sein wollen.', ja: '幸せでありたい。' });
    expect(sayAll(citeModal('WILL', { verbPhrase: { verb: 'DESIRE' }, infinitiveComplement: ACT })))
      .toMatchObject({ en: 'to want to desire to act.', de: 'wünschen wollen, zu handeln.', ja: '行動することを望みたい。' });
  });
});


// A03. Polarity is per word of the verb group: each modal carries its own `negative`, and
// `VerbPhrase.negative` carries the main verb's. A chain can deny any of them, or several — "I do
// not want to not go". The finite modal's negation is the clause's sentential one (unchanged, and
// still what do-support / ne…pas / nicht-placement / concord read); every element below it takes
// its language's non-finite negator in front of it.
describe('modal polarity — each word of the group takes its own negation', () => {
  const iGo = (verbPhrase: Partial<VerbPhrase>) => sayAll(clause(np('FIRST_PERSON'), 'GO', { verbPhrase }));

  test('the modal is denied, the verb is denied, or both', () => {
    // ¬want go — what a modal chain has always been able to say, now spelled on the modal itself.
    expect(iGo({ modals: [{ verb: 'WILL', negative: true }] })).toEqual({
      en: 'I do not want to go.',
      it: 'non voglio andare.',
      fr: 'je ne veux pas aller.',
      es: 'no quiero ir.',
      pt: 'não quero ir.',
      de: 'ich will nicht gehen.',
      ja: '私は行きたくないです。',
    });
    // want ¬go — the governed verb's own negation, which had no plan before A03.
    expect(iGo({ modals: ['WILL'], negative: true })).toEqual({
      en: 'I want to not go.',
      it: 'voglio non andare.',
      fr: 'je veux ne pas aller.',
      es: 'quiero no ir.',
      pt: 'quero não ir.',
      de: 'ich will nicht gehen.', // one "nicht" in a cluster reads under either scope in German
      ja: '私は行かないでいたいです。',
    });
    // Both at once, the sentence this feature was asked for.
    expect(iGo({ modals: [{ verb: 'WILL', negative: true }], negative: true })).toEqual({
      en: 'I do not want to not go.',
      it: 'non voglio non andare.',
      fr: 'je ne veux pas ne pas aller.',
      es: 'no quiero no ir.',
      pt: 'não quero não ir.',
      de: 'ich will nicht nicht gehen.',
      ja: '私は行かないでいたくないです。',
    });
  });

  // The prohibition, which one flag could not express: a POSITIVE must over a negated verb. A
  // negated MUST stays the ¬obligation reading every language already took.
  test('MUST over a negated verb is the prohibition, and a negated MUST is still no obligation', () => {
    expect(iGo({ modals: ['MUST'], negative: true })).toEqual({
      en: 'I must not go.',
      it: 'devo non andare.',
      fr: 'je dois ne pas aller.',
      es: 'debo no ir.',
      pt: 'devo não ir.',
      de: 'ich muss nicht gehen.',
      ja: '私は行かない必要があります。',
    });
    expect(iGo({ modals: [{ verb: 'MUST', negative: true }] })).toMatchObject({
      en: 'I do not have to go.',
      it: 'non devo andare.',
      ja: '私は行く必要がありません。',
    });
  });

  test('CAN over a negated verb is the ability to refrain', () => {
    expect(iGo({ modals: ['CAN'], negative: true })).toEqual({
      en: 'I can not go.', // two words: "cannot" is the negated CAN
      it: 'posso non andare.',
      fr: 'je peux ne pas aller.',
      es: 'puedo no ir.',
      pt: 'posso não ir.',
      de: 'ich kann nicht gehen.',
      ja: '私は行かないことができます。',
    });
  });

  // Every element of a chain is deniable, not just its ends.
  test('an inner modal carries its own negation', () => {
    expect(iGo({ modals: ['MUST', { verb: 'CAN', negative: true }] })).toMatchObject({
      en: 'I must not be able to go.',
      it: 'devo non poter andare.',
      fr: 'je dois ne pas pouvoir aller.',
      es: 'debo no poder ir.',
      pt: 'devo não poder ir.',
      ja: '私は行くことができない必要があります。',
    });
    expect(iGo({ modals: ['MUST', 'CAN'], negative: true })).toMatchObject({
      en: 'I must be able to not go.',
      it: 'devo poter non andare.',
      fr: 'je dois pouvoir ne pas aller.',
      es: 'debo poder no ir.',
      pt: 'devo poder não ir.',
    });
  });

  test('a governed negation composes with tense and aspect', () => {
    expect(iGo({ modals: ['WILL'], negative: true, tense: 'past' })).toMatchObject({
      en: 'I wanted to not go.',
      it: 'volevo non andare.',
      fr: 'je voulais ne pas aller.',
    });
    expect(sayAll(clause(np('FIRST_PERSON'), 'EAT', { verbPhrase: { modals: ['MUST'], negative: true, aspect: 'resultative' } })))
      .toMatchObject({
        en: 'I must not have eaten.',
        it: 'devo non aver mangiato.',
        fr: 'je dois ne pas avoir mangé.',
      });
  });

  // A negator inside the governed group stands ahead of the object, so a `no` object concords with
  // THAT one: the finite verb takes none, and English switches to its "any"-series as it does after
  // any negator ahead of the object.
  test('a `no` object concords with the governed negation, not the modal', () => {
    const wantsNotToEat = sayAll(clause(np('CAT'), 'EAT', {
      verbPhrase: { modals: ['WILL'], negative: true },
      directObject: np('FOOD', { definiteness: 'no' }),
    }));
    expect(wantsNotToEat).toMatchObject({
      en: 'the cat wants to not eat any food.',
      it: 'il gatto vuole non mangiare nessun cibo.',
      es: 'el gato quiere no comer ninguna comida.',
      pt: 'o gato quer não comer nenhuma comida.',
      de: 'der Kater will kein Essen fressen.', // "kein" absorbs the nicht, as it does the finite one
    });
    // Unchanged where the governed verb is positive: the concord is the finite verb's.
    expect(sayAll(clause(np('CAT'), 'EAT', {
      verbPhrase: { modals: ['WILL'] },
      directObject: np('FOOD', { definiteness: 'no' }),
    }))).toMatchObject({
      it: 'il gatto non vuole mangiare nessun cibo.',
      es: 'el gato no quiere comer ninguna comida.',
    });
  });

  test('a governed negation survives a relative clause and a conditional', () => {
    expect(sayAll(clause(np('CAT', {
      relative: { verbPhrase: { verb: 'EAT', modals: ['WILL'], negative: true } },
    }), 'RUN'))).toMatchObject({
      en: 'the cat that wants to not eat runs.',
      it: 'il gatto che vuole non mangiare corre.',
    });
    expect(sayAll({
      ...clause(np('DOG'), 'RUN'),
      condition: clause(np('CAT'), 'EAT', { verbPhrase: { modals: ['WILL'], negative: true } }),
    })).toMatchObject({
      en: 'if the cat wanted to not eat, the dog would run.',
      it: 'se il gatto volesse non mangiare, il cane correrebbe.',
    });
  });

  // A modal heading a clause folds into the chain (A222), and what denied it comes along: the
  // clause's own negation stays the finite one, and a modal ITS modals deny becomes a denied link.
  test('a folded modal governor keeps the negation that denied it', () => {
    // A citation drops a clause's own modals, so the two scopes are only tellable apart in a
    // finite clause, where MUST governs the WILL that governs the complement.
    const wantToAct = { verbPhrase: { verb: 'ACT' } };
    expect(sayAll({
      subject: np('CAT'),
      verbPhrase: { verb: 'WILL', modals: ['MUST'], negative: true },
      infinitiveComplement: wantToAct,
    })).toMatchObject({
      en: 'the cat must not want to act.',
      it: 'il gatto deve non volere agire.',
      ja: '猫は行動したくないと思う必要があります。',
    });
    expect(sayAll({
      subject: np('CAT'),
      verbPhrase: { verb: 'WILL', modals: [{ verb: 'MUST', negative: true }] },
      infinitiveComplement: wantToAct,
    })).toMatchObject({
      en: 'the cat does not have to want to act.',
      it: 'il gatto non deve volere agire.',
      ja: '猫は行動したいと思う必要がありません。',
    });
  });

  // With no modal the main verb IS the finite one, so `negative` means exactly what it meant: this
  // is the whole of the compatibility promise, and `negation.test.ts` holds the rest of it.
  test('a modal-free clause is untouched', () => {
    expect(iGo({ negative: true })).toEqual({
      en: 'I do not go.',
      it: 'non vado.',
      fr: 'je ne vais pas.',
      es: 'no voy.',
      pt: 'não vou.',
      de: 'ich gehe nicht.',
      ja: '私は行きません。',
    });
  });
});

// A236. A negative-polarity adverb (NEVER) is sent to the FINITE verb whatever it modifies
// (`groupHasNegativeAdverb`), so a NEVER on the main verb under a modal denies the modal instead:
// "il gatto non vuole mangiare mai" says the cat never wants to eat, where the plan says it wants
// to never eat. Italian moves the adverb (mangiare mai / mai mangiare) but keeps the negator on the
// modal; French, Spanish, Portuguese and Japanese render the two plans identically. English alone
// keeps the scope, and German "nie" reads under either. Deliberate while a governed verb had no
// negation of its own — A03's inner negator gives it one, which is where this adverb belongs.
describe('known bugs: a negative adverb on the main verb negates the modal (A236)', () => {
  const neverEats = (verbPhrase: Partial<VerbPhrase>) => sayAll(clause(np('CAT'), 'EAT', { verbPhrase }));

  test.fails('a negative adverb on the main verb negates the verb it modifies, not the modal', () => {
    expect(neverEats({ modals: ['WILL'], modifier: 'NEVER' })).toMatchObject({
      it: 'il gatto vuole non mangiare mai.',
      fr: 'le chat veut ne jamais manger.',
      es: 'el gato quiere no comer nunca.',
      pt: 'o gato quer não comer nunca.',
      ja: '猫は決して食べないでいたいです。',
    });
  });

  // Already right: English keeps the two scopes apart, the adverb on the MODAL is the modal's own
  // negation in every language, and a modal-free clause never reached the defect.
  test('English keeps the scope, and a NEVER on the modal itself is right everywhere', () => {
    expect(neverEats({ modals: ['WILL'], modifier: 'NEVER' }).en).toBe('the cat wants to never eat.');
    expect(neverEats({ modals: [{ verb: 'WILL', modifier: 'NEVER' }] }).en).toBe('the cat never wants to eat.');
    expect(neverEats({ modals: [{ verb: 'WILL', modifier: 'NEVER' }] })).toMatchObject({
      it: 'il gatto non vuole mai mangiare.',
      fr: 'le chat ne veut jamais manger.',
      es: 'el gato nunca quiere comer.',
      pt: 'o gato nunca quer comer.',
      ja: '猫は決して食べたくないです。',
    });
    expect(neverEats({ modifier: 'NEVER' })).toMatchObject({
      it: 'il gatto non mangia mai.',
      fr: 'le chat ne mange jamais.',
      es: 'el gato nunca come.',
      pt: 'o gato nunca come.',
      ja: '猫は決して食べません。',
    });
  });
});
