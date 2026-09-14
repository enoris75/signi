import { describe, expect, test } from 'vitest';
import {
  ANDARE, BENE, CANE, CASA, CIBO, complement, complements, concept, CORRERE, DARE, DONNA, DOVERE, el, ESSERE, type Forms, GATTA,
  FUOCO, GATTO, IO, LEI, LIBRO, LORO, LUI, LUPO, MAI, MANGIARE, modal, NOI, np, POTERE, RAGAZZO, SEMBRARE, SEMPRE, SI, STANCO, TOPO, TU, VEDERE,
  FELICE, VELOCEMENTE, VOLERE, vp,
} from './it.fixtures.js';
import { predicateText } from './predicateText.js';

const VOI: Forms = { ...TU, base: 'voi', number: 'plural' };
// CRY_OUT's lexeme raises an alarm; WOLF and FIRE name a danger (A124).
const GRIDARE: Forms = { base: 'gridare', alarm_cry: '1', '3sg_present': 'grida', '3sg_past': 'gridò', '3pl_present': 'gridano', participle: 'gridato' };
const ALARM_LUPO: Forms = { ...LUPO, alarm: '1' };
const ALARM_FUOCO: Forms = { ...FUOCO, alarm: '1' };
const PLURAL_CATS: Forms = { ...GATTO, number: 'plural' };
const mouse = el(np(TOPO));

describe('predicateText', () => {
  describe('tense and agreement', () => {
    test('the verb agrees with the subject forms', () => {
      expect(predicateText(GATTO, vp(MANGIARE))).toBe('mangia');
      expect(predicateText(IO, vp(MANGIARE))).toBe('mangio');
      expect(predicateText(PLURAL_CATS, vp(MANGIARE))).toBe('mangiano');
      expect(predicateText(VOI, vp(MANGIARE))).toBe('mangiate');
    });

    // The simple past is the passato remoto; the perfect is the resultative aspect (C06).
    test('past is the passato remoto, future the futuro semplice', () => {
      expect(predicateText(GATTO, vp(MANGIARE, { tense: 'past' }))).toBe('mangiò');
      expect(predicateText(PLURAL_CATS, vp(MANGIARE, { tense: 'future' }))).toBe('mangeranno');
    });

    // A130: the passato remoto makes a state an event, so a state's past is the imperfect.
    test('the past of a state is the imperfect, in the finite verb only', () => {
      expect(predicateText(GATTO, vp(SEMBRARE, { tense: 'past' }), undefined, complements({ predicative: complement(np(STANCO)) })))
        .toBe('sembrava stanco');
      expect(predicateText(IO, vp(ESSERE, { tense: 'past' }, 'BE'), undefined, complements({ predicative: complement(np(STANCO)) })))
        .toBe('ero stanco');
      expect(predicateText(PLURAL_CATS, vp(MANGIARE, { tense: 'past', modals: [modal(VOLERE), modal(POTERE)] }))).toBe('volevano poter mangiare');
      // The resultative and the hypothetical moods keep their own forms.
      expect(predicateText(GATTO, vp(MANGIARE, { tense: 'past', modals: [modal(DOVERE)], mood: 'subjunctive' }))).toBe('dovesse mangiare');
      expect(predicateText(GATTO, vp(SEMBRARE, { aspect: 'resultative' }), undefined, complements({ predicative: complement(np(STANCO)) })))
        .toBe('è sembrato stanco');
    });

    test('the adverb, object and complements follow the verb in that order', () => {
      expect(predicateText(GATTO, vp(MANGIARE, { modifier: concept(VELOCEMENTE) }), mouse)).toBe('mangia velocemente il topo');
      expect(predicateText(GATTO, vp(DARE, {}, 'GIVE'), el(np(LIBRO)), complements({ terminus: complement(np(CANE)) })))
        .toBe('dà il libro al cane');
    });
  });

  describe('aspect', () => {
    test('a marked aspect builds its auxiliary group', () => {
      expect(predicateText(GATTO, vp(MANGIARE, { aspect: 'progressive', tense: 'past' }), mouse)).toBe('stava mangiando il topo');
      expect(predicateText(GATTO, vp(MANGIARE, { aspect: 'prospective' }))).toBe('sta per mangiare');
      expect(predicateText(GATTO, vp(MANGIARE, { aspect: 'resultative' }), mouse)).toBe('ha mangiato il topo');
      expect(predicateText(GATTA, vp(ANDARE, { aspect: 'resultative' }))).toBe('è andata');
    });

    // Fixed A28: a frequency adverb sits between auxiliary and participle; a manner adverb trails.
    test('a frequency adverb splits the resultative, a manner adverb follows it', () => {
      expect(predicateText(GATTO, vp(MANGIARE, { aspect: 'resultative', modifier: concept(SEMPRE) }))).toBe('ha sempre mangiato');
      expect(predicateText(GATTO, vp(MANGIARE, { aspect: 'resultative', modifier: concept(MAI) }))).toBe('non ha mai mangiato');
      expect(predicateText(GATTO, vp(MANGIARE, { aspect: 'resultative', modifier: concept(BENE) }))).toBe('ha mangiato bene');
      expect(predicateText(GATTO, vp(MANGIARE, { modifier: concept(SEMPRE) }))).toBe('mangia sempre');
    });
  });

  describe('modals', () => {
    test('the outermost modal is finite and each inner one an apocopated infinitive', () => {
      expect(predicateText(GATTO, vp(MANGIARE, { modals: [modal(DOVERE)] }), mouse)).toBe('deve mangiare il topo');
      expect(predicateText(PLURAL_CATS, vp(MANGIARE, { modals: [modal(DOVERE)] }))).toBe('devono mangiare');
      expect(predicateText(GATTO, vp(MANGIARE, { tense: 'past', modals: [modal(DOVERE)] }))).toBe('doveva mangiare');
      expect(predicateText(GATTO, vp(MANGIARE, { modals: [modal(VOLERE), modal(POTERE)] }))).toBe('vuole poter mangiare');
    });

    test('the main verb closes the chain as the infinitive of its whole group', () => {
      expect(predicateText(GATTO, vp(MANGIARE, { aspect: 'resultative', modals: [modal(DOVERE)] }))).toBe('deve aver mangiato');
      expect(predicateText(GATTA, vp(ANDARE, { aspect: 'resultative', modals: [modal(DOVERE)] }))).toBe('deve essere andata');
      expect(predicateText(GATTO, vp(MANGIARE, { aspect: 'progressive', modals: [modal(DOVERE)] }))).toBe('deve stare mangiando');
    });

    test('a modal adverb trails its own modal; the main verb adverb closes the group', () => {
      expect(predicateText(GATTO, vp(MANGIARE, { modifier: concept(SEMPRE), modals: [modal(DOVERE)] }))).toBe('deve mangiare sempre');
      expect(predicateText(GATTO, vp(MANGIARE, { modifier: concept(SEMPRE), modals: [modal(VOLERE, MAI)] })))
        .toBe('non vuole mai mangiare sempre');
    });
  });

  describe('negation', () => {
    test('non precedes the finite element', () => {
      expect(predicateText(GATTO, vp(MANGIARE, { negative: true }), mouse)).toBe('non mangia il topo');
      expect(predicateText(GATTO, vp(MANGIARE, { negative: true, aspect: 'progressive' }))).toBe('non sta mangiando');
      expect(predicateText(GATTO, vp(MANGIARE, { negative: true, modals: [modal(DOVERE), modal(POTERE)] }))).toBe('non deve poter mangiare');
    });

    test('mai demands non even without the negative flag, and non is never doubled', () => {
      expect(predicateText(GATTO, vp(MANGIARE, { modifier: concept(MAI) }))).toBe('non mangia mai');
      expect(predicateText(GATTO, vp(MANGIARE, { negative: true, modifier: concept(MAI) }))).toBe('non mangia mai');
    });

    // Fixed A33: a postverbal nessun is negative concord with a preverbal non.
    test('a nessun object or complement demands non', () => {
      expect(predicateText(GATTO, vp(MANGIARE), el(np(TOPO, { definiteness: 'no' })))).toBe('non mangia nessun topo');
      expect(predicateText(GATTO, vp(VEDERE), el(np(RAGAZZO, { definiteness: 'no' }), np(DONNA, { definiteness: 'no' }))))
        .toBe('non vede nessun ragazzo e nessuna donna');
      expect(predicateText(GATTO, vp(CORRERE), undefined, complements({ locative: complement(np(CASA, { definiteness: 'no' })) })))
        .toBe('non corre in nessuna casa');
    });

    test('a nessun subject already negates the clause, so non is suppressed', () => {
      const noCat = { ...GATTO, definiteness: 'no' };
      expect(predicateText(noCat, vp(MANGIARE), el(np(TOPO, { definiteness: 'no' })))).toBe('mangia nessun topo');
      expect(predicateText(noCat, vp(MANGIARE, { negative: true }))).toBe('mangia');
    });
  });

  describe('object pronouns', () => {
    test('a pronoun object is a proclitic before the verb', () => {
      expect(predicateText(GATTO, vp(VEDERE), el(np(IO)))).toBe('mi vede');
      expect(predicateText(GATTO, vp(VEDERE), el(np(LEI)))).toBe('la vede');
      expect(predicateText(GATTO, vp(VEDERE), el(np(LORO)))).toBe('li vede');
      expect(predicateText(GATTO, vp(VEDERE), el(np(LORO, { gender: 'fem' })))).toBe('le vede');
      expect(predicateText(GATTO, vp(VEDERE), el(np(NOI)))).toBe('ci vede');
    });

    test('the clitic sits after non and ahead of the auxiliary or modal', () => {
      expect(predicateText(GATTO, vp(VEDERE, { negative: true }), el(np(IO)))).toBe('non mi vede');
      expect(predicateText(GATTO, vp(VEDERE, { aspect: 'resultative' }), el(np(TU)))).toBe('ti ha visto');
      expect(predicateText(GATTO, vp(VEDERE, { aspect: 'resultative', modifier: concept(SEMPRE) }), el(np(IO)))).toBe('mi ha sempre visto');
      expect(predicateText(GATTO, vp(VEDERE, { modals: [modal(VOLERE)] }), el(np(IO)))).toBe('mi vuole vedere');
    });

    test('a third-person clitic agrees the avere participle; mi / ti leave it alone', () => {
      expect(predicateText(GATTO, vp(VEDERE, { aspect: 'resultative' }), el(np(LEI)))).toBe('la ha vista');
      expect(predicateText(GATTO, vp(VEDERE, { aspect: 'resultative' }), el(np(LORO)))).toBe('li ha visti');
      expect(predicateText(GATTO, vp(VEDERE, { aspect: 'resultative', modals: [modal(DOVERE)] }), el(np(LEI)))).toBe('la deve aver vista');
      expect(predicateText(GATTO, vp(VEDERE, { aspect: 'resultative' }), el(np(IO, { gender: 'fem' })))).toBe('mi ha visto');
    });

    test('a coordinated object keeps the post-verbal slot', () => {
      expect(predicateText(GATTO, vp(VEDERE), el(np(CANE), np(TOPO)))).toBe('vede il cane e il topo');
    });

    test('a pronoun in a coordinated object takes its tonic form, with no article', () => {
      expect(predicateText(GATTO, vp(VEDERE), el(np(LUI), np(IO)))).toBe('vede lui e me');
      expect(predicateText(GATTO, vp(VEDERE), el(np(CANE), np(TU)))).toBe('vede il cane e te');
      expect(predicateText(GATTO, vp(VEDERE, { negative: true }), el(np(LEI), np(IO)))).toBe('non vede lei e me');
    });
  });

  describe('impersonal si', () => {
    test('a generic subject is the preverbal clitic si, after non', () => {
      expect(predicateText(SI, vp(MANGIARE))).toBe('si mangia');
      expect(predicateText(SI, vp(MANGIARE, { negative: true }), mouse)).toBe('non si mangia il topo');
    });

    // A82: an object clitic comes before the impersonal si.
    test('an object clitic precedes si, after non', () => {
      expect(predicateText(SI, vp(MANGIARE), el(np(LUI)))).toBe('lo si mangia');
      expect(predicateText(SI, vp(MANGIARE, { negative: true }), el(np(LEI)))).toBe('non la si mangia');
    });

    // A73: with a plural noun object si is passive, and the finite verb agrees with its patient.
    test('a plural noun object agrees the finite verb, a clitic or singular object does not', () => {
      expect(predicateText(SI, vp(MANGIARE), el(np(TOPO, { number: 'plural' })))).toBe('si mangiano i topi');
      expect(predicateText(SI, vp(MANGIARE, { modals: [modal(DOVERE)] }), el(np(TOPO, { number: 'plural' })))).toBe('si devono mangiare i topi');
      expect(predicateText(SI, vp(MANGIARE), mouse)).toBe('si mangia il topo');
    });
  });

  describe('hypothetical moods', () => {
    test('the finite verb takes the conditional or the imperfect subjunctive', () => {
      expect(predicateText(CANE, vp(CORRERE, { mood: 'conditional' }))).toBe('correrebbe');
      expect(predicateText(GATTO, vp(MANGIARE, { mood: 'subjunctive' }), el(np(LIBRO)))).toBe('mangiasse il libro');
      expect(predicateText(IO, vp(CORRERE, { mood: 'subjunctive' }))).toBe('corressi');
      expect(predicateText(GATTO, vp(ESSERE, { mood: 'subjunctive' }, 'BE'), undefined, complements({ predicative: complement(np(STANCO)) })))
        .toBe('fosse stanco');
    });

    test('under a modal or a marked aspect the mood goes onto the finite element', () => {
      expect(predicateText(GATTO, vp(MANGIARE, { mood: 'conditional', modals: [modal(DOVERE)] }))).toBe('dovrebbe mangiare');
      expect(predicateText(CANE, vp(CORRERE, { mood: 'conditional', aspect: 'resultative' }))).toBe('avrebbe corso');
      expect(predicateText(GATTO, vp(MANGIARE, { mood: 'subjunctive', aspect: 'progressive' }))).toBe('stesse mangiando');
    });
  });

  describe('imperative', () => {
    const command = (extra: Parameters<typeof vp>[1] = {}, verb: Forms = MANGIARE, conceptId = 'EAT') =>
      vp(verb, { mood: 'imperative', ...extra }, conceptId);

    test('the addressee picks the tu, noi or voi form', () => {
      expect(predicateText(TU, command())).toBe('mangia');
      expect(predicateText(TU, command({}, VEDERE, 'SEE'))).toBe('vedi');
      expect(predicateText(NOI, command())).toBe('mangiamo');
      expect(predicateText(VOI, command())).toBe('mangiate');
    });

    test('a negative tu is non + infinitive; noi and voi keep their form', () => {
      expect(predicateText(TU, command({ negative: true }), mouse)).toBe('non mangiare il topo');
      expect(predicateText(VOI, command({ negative: true }))).toBe('non mangiate');
    });

    test('an irregular verb takes its override', () => {
      expect(predicateText(TU, command({}, ESSERE, 'BE'), undefined, complements({ predicative: complement(np(STANCO)) })))
        .toBe('sii stanco');
    });

    test('an object pronoun attaches enclitically', () => {
      expect(predicateText(TU, command(), el(np(LUI)))).toBe('mangialo');
      expect(predicateText(NOI, command(), el(np(LEI)))).toBe('mangiamola');
    });

    // A86: the negative tu's infinitive drops its -e before the clitic.
    test('an object pronoun on the negative tu attaches to the infinitive without its -e', () => {
      expect(predicateText(TU, command({ negative: true }), el(np(LUI)))).toBe('non mangiarlo');
      expect(predicateText(TU, command({ negative: true }, VEDERE, 'SEE'), el(np(IO)))).toBe('non vedermi');
      expect(predicateText(VOI, command({ negative: true }), el(np(LUI)))).toBe('non mangiatelo');
    });

    // A87: dare / fare / andare take the short tu command, which doubles an enclitic's consonant.
    test('the short tu command of dare doubles the clitic consonant', () => {
      expect(predicateText(TU, command({}, DARE, 'GIVE'), el(np(LIBRO)))).toBe("da' il libro");
      expect(predicateText(TU, command({}, DARE, 'GIVE'), el(np(LUI)))).toBe('dallo');
      expect(predicateText(TU, command({ negative: true }, DARE, 'GIVE'), el(np(LUI)))).toBe('non darlo');
    });

    test('the adverb precedes the object and the complements close', () => {
      const inTheHouse = complements({ locative: complement(np(CASA)) });
      expect(predicateText(TU, command({ modifier: concept(VELOCEMENTE) }), el(np(CIBO)), inTheHouse))
        .toBe('mangia velocemente il cibo nella casa');
    });

    // C02: an instruction stays imperative in Italian, pinned to tu whatever the addressee.
    test('the instruction register pins the tu form', () => {
      expect(predicateText(NOI, command({ register: 'instruction' }))).toBe('mangia');
      expect(predicateText(VOI, command({ register: 'instruction', negative: true }))).toBe('non mangiare');
    });
  });

  describe('infinitive', () => {
    const infinitive = (extra: Parameters<typeof vp>[1] = {}, verb: Forms = MANGIARE) => vp(verb, { mood: 'infinitive', ...extra });

    test('the bare infinitive with its adverb, object and complements', () => {
      expect(predicateText(GATTO, infinitive(), el(np(CIBO)))).toBe('mangiare il cibo');
      expect(predicateText(GATTO, infinitive({ modifier: concept(VELOCEMENTE) }), undefined, complements({ locative: complement(np(CASA)) })))
        .toBe('mangiare velocemente nella casa');
      expect(predicateText(GATTO, infinitive({ negative: true }), el(np(CIBO)))).toBe('non mangiare il cibo');
    });

    test('an object pronoun attaches, dropping the final -e', () => {
      expect(predicateText(GATTO, infinitive(), el(np(LUI)))).toBe('mangiarlo');
      expect(predicateText(GATTO, infinitive({}, VEDERE), el(np(LEI)))).toBe('vederla');
    });
  });

  describe('an alarm cry (A124)', () => {
    test('a danger cried out takes "a" and the article, bare or not', () => {
      expect(predicateText(RAGAZZO, vp(GRIDARE, { tense: 'past' }), el(np(ALARM_LUPO)))).toBe('gridò al lupo');
      expect(predicateText(RAGAZZO, vp(GRIDARE, { tense: 'past' }), el(np(ALARM_LUPO, { definiteness: 'bare' })))).toBe('gridò al lupo');
      expect(predicateText(RAGAZZO, vp(GRIDARE), el(np(ALARM_FUOCO, { definiteness: 'bare', number: 'plural' })))).toBe('grida ai fuochi');
      expect(predicateText(RAGAZZO, vp(GRIDARE, { negative: true }), el(np(ALARM_LUPO), np(ALARM_FUOCO)))).toBe('non grida al lupo e al fuoco');
    });

    test('the frame needs both the crying verb and the danger', () => {
      expect(predicateText(RAGAZZO, vp(GRIDARE), el(np(LUPO)))).toBe('grida il lupo');
      expect(predicateText(RAGAZZO, vp(VEDERE), el(np(ALARM_LUPO)))).toBe('vede il lupo');
    });

    test('the impersonal si stays impersonal, since the cry is no direct object', () => {
      expect(predicateText(SI, vp(GRIDARE), el(np(ALARM_LUPO, { number: 'plural' })))).toBe('si grida ai lupi');
    });
  });

  // A121: a bare copula that elides the subject complement before it leaves its pro-form.
  describe('an elided subject complement', () => {
    const happy = { type: 'predicative' as const, complement: complement(np(FELICE)) };
    const inTheHouse = { type: 'locative' as const, complement: complement(np(CASA)) };

    test('a predicate leaves the invariable lo, in the clitic slot', () => {
      expect(predicateText(CANE, vp(ESSERE, { negative: true, elided: happy }))).toBe('non lo è');
      expect(predicateText({ ...CANE, number: 'plural' }, vp(ESSERE, { elided: happy }))).toBe('lo sono');
      expect(predicateText(CANE, vp(ESSERE, { tense: 'future', negative: true, elided: happy }))).toBe('non lo sarà');
    });

    test('a place leaves ci, which elides before the e- forms of essere', () => {
      expect(predicateText(CANE, vp(ESSERE, { negative: true, elided: inTheHouse }))).toBe("non c'è");
      expect(predicateText(CANE, vp(ESSERE, { aspect: 'resultative', elided: inTheHouse }))).toBe("c'è stato");
      expect(predicateText(CANE, vp(ESSERE, { tense: 'future', elided: inTheHouse }))).toBe('ci sarà');
    });
  });
});
