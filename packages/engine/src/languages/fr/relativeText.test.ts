import { describe, expect, test } from 'vitest';
import { ALLER, ANGE, CHAT, CHIEN, el, ETRE, FEMME, FEU, type Forms, GARCON, IL, JE, LIVRE, MAISON, MANGER, np, ON, SOURIS, vp } from './fr.fixtures.js';
import { relativeText } from './relativeText.js';

const CRIER: Forms = { base: 'crier', alarm_cry: '1', participle: 'crié', '3sg_present': 'crie', '3sg_past': 'cria' };
const LOUP: Forms = { base: 'loup', plural: 'loups', gender: 'masc', count: 'singular', animate: '1', alarm: '1' };

describe('relativeText', () => {
  test('renders nothing without a relative clause', () => {
    expect(relativeText(np(CHAT))).toBe('');
  });

  test('a subject relative is qui + a predicate agreeing with the head', () => {
    expect(relativeText(np(CHAT, {}, { relative: { headRole: 'subject', verbPhrase: vp(MANGER), directObject: el(np(SOURIS)) } })))
      .toBe('qui mange la souris');
    expect(relativeText(np(CHAT, { number: 'plural' }, { relative: { headRole: 'subject', verbPhrase: vp(MANGER) } }))).toBe('qui mangent');
    expect(relativeText(np(FEMME, {}, { relative: { headRole: 'subject', verbPhrase: vp(ALLER, { aspect: 'resultative' }) } })))
      .toBe('qui est allée');
  });

  test('a relative with no clause subject of its own falls back to qui', () => {
    expect(relativeText(np(CHAT, {}, { relative: { headRole: 'directObject', verbPhrase: vp(MANGER) } }))).toBe('qui mange');
  });

  test('a direct-object relative is que + the clause’s own subject, which the verb agrees with', () => {
    expect(relativeText(np(SOURIS, {}, { relative: { headRole: 'directObject', subject: el(np(CHAT)), verbPhrase: vp(MANGER) } })))
      .toBe('que le chat mange');
    expect(relativeText(np(SOURIS, {}, { relative: { headRole: 'directObject', subject: el(np(CHAT), np(CHIEN)), verbPhrase: vp(MANGER) } })))
      .toBe('que le chat et le chien mangent');
  });

  test('que elides before a vowel-initial subject', () => {
    const eatenBy = (subject: ReturnType<typeof el>) =>
      relativeText(np(SOURIS, {}, { relative: { headRole: 'directObject', subject, verbPhrase: vp(MANGER) } }));
    expect(eatenBy(el(np(ON)))).toBe("qu'on mange");
    expect(eatenBy(el(np(IL)))).toBe("qu'il mange");
    expect(eatenBy(el(np(ANGE, { definiteness: 'indefinite' })))).toBe("qu'un ange mange");
  });

  // A92: the clause's je elides against its predicate; que stays whole before the j'.
  test('a je subject elides before a vowel-initial predicate, after que, a lequel or où', () => {
    expect(relativeText(np(SOURIS, {}, { relative: { headRole: 'directObject', subject: el(np(JE)), verbPhrase: vp(MANGER, { aspect: 'resultative' }) } })))
      .toBe("que j'ai mangée");
    expect(relativeText(np(MAISON, {}, {
      relative: { headRole: 'locative', subject: el(np(JE)), verbPhrase: vp(MANGER, { aspect: 'resultative' }), headSpecifiers: [{ kind: 'path', value: 'under' }] },
    }))).toBe("sous laquelle j'ai mangé");
    expect(relativeText(np(MAISON, {}, { relative: { headRole: 'locative', subject: el(np(JE)), verbPhrase: vp(MANGER, { aspect: 'resultative' }) } })))
      .toBe("où j'ai mangé");
    expect(relativeText(np(SOURIS, {}, { relative: { headRole: 'directObject', subject: el(np(JE)), verbPhrase: vp(MANGER) } }))).toBe('que je mange');
  });

  // The accord du COD antéposé: the head is the preceding direct object.
  test('an avoir participle agrees with the direct-object head', () => {
    const eaten = (head: ReturnType<typeof np>) =>
      relativeText({ ...head, relative: { headRole: 'directObject', subject: el(np(CHAT)), verbPhrase: vp(MANGER, { aspect: 'resultative' }) } });
    expect(eaten(np(SOURIS))).toBe('que le chat a mangée');
    expect(eaten(np(SOURIS, { number: 'plural' }))).toBe('que le chat a mangées');
    expect(eaten(np(LIVRE, { number: 'plural' }))).toBe('que le chat a mangés');
    expect(eaten(np(LIVRE))).toBe('que le chat a mangé');
  });

  // "lequel" is written as one word with its article, contracted or not.
  test('a head filling a complement takes its preposition with an agreeing lequel', () => {
    expect(relativeText(np(GARCON, { number: 'plural' }, { relative: { headRole: 'direction', subject: el(np(CHAT)), verbPhrase: vp(ALLER, {}, 'GO') } })))
      .toBe('vers lesquels le chat va');
    expect(relativeText(np(CHIEN, {}, {
      relative: { headRole: 'cause', subject: el(np(CHAT)), verbPhrase: vp(MANGER), headSpecifiers: [{ kind: 'sentiment', value: 'negative' }] },
    }))).toBe('par la faute duquel le chat mange');
  });

  // C07: the plain place takes the relative adverb, not "dans laquelle".
  test('a plain locative gap is où, whether or not the default relation was chosen', () => {
    const eatenIn = (rest: Record<string, unknown> = {}) =>
      relativeText(np(MAISON, {}, { relative: { headRole: 'locative', subject: el(np(CHAT)), verbPhrase: vp(MANGER), ...rest } }));
    expect(eatenIn()).toBe('où le chat mange');
    expect(eatenIn({ headSpecifiers: [{ kind: 'path', value: 'in' }] })).toBe('où le chat mange');
    expect(eatenIn({ headSpecifiers: [{ kind: 'path', value: 'behind' }] })).toBe('derrière laquelle le chat mange');
  });

  // A221: the bare copula goes before its noun subject, after où and after lequel.
  test('a bare copula after où or lequel precedes its noun subject', () => {
    const isIn = (rest: Record<string, unknown> = {}, subject = np(CHAT)) =>
      relativeText(np(MAISON, {}, { relative: { headRole: 'locative', subject: el(subject), verbPhrase: vp(ETRE, {}, 'BE'), ...rest } }));
    expect(isIn()).toBe('où est le chat');
    expect(isIn({}, np(CHAT, { number: 'plural' }))).toBe('où sont les chats');
    expect(isIn({ headSpecifiers: [{ kind: 'path', value: 'behind' }] })).toBe('derrière laquelle est le chat');
    // The negative keeps SV, and so do a clitic subject and the generic on.
    expect(isIn({ verbPhrase: vp(ETRE, { negative: true }, 'BE') })).toBe("où le chat n'est pas");
    expect(isIn({}, np(JE))).toBe('où je suis');
    expect(isIn({}, np(ON))).toBe("où l'on est");
  });

  test('the generic on after où takes the euphonic l\'', () => {
    const eatenIn = (verbPhrase = vp(MANGER)) =>
      relativeText(np(MAISON, {}, { relative: { headRole: 'locative', subject: el(np(ON)), verbPhrase } }));
    expect(eatenIn()).toBe("où l'on mange");
    expect(eatenIn(vp(MANGER, { negative: true }))).toBe("où l'on ne mange pas");
    // Only after où: que keeps its own elision.
    expect(relativeText(np(SOURIS, {}, { relative: { headRole: 'directObject', subject: el(np(ON)), verbPhrase: vp(MANGER) } }))).toBe("qu'on mange");
  });

  // A129: the alarm a cry raises is the cry's à-complement, so its relative takes "auquel", not "que", and
  // an avoir participle does not agree with it.
  test('a head that is the alarm a cry raises takes an auquel, with no participle agreement', () => {
    const cried = (extra: Parameters<typeof vp>[1] = { tense: 'past' }) =>
      ({ headRole: 'directObject' as const, subject: el(np(GARCON)), verbPhrase: vp(CRIER, extra) });
    expect(relativeText(np(LOUP, {}, { relative: cried() }))).toBe('auquel le garçon cria');
    expect(relativeText(np(LOUP, { number: 'plural' }, { relative: cried() }))).toBe('auxquels le garçon cria');
    expect(relativeText(np({ ...FEU, alarm: '1' }, {}, { relative: cried({ aspect: 'resultative' }) }))).toBe('auquel le garçon a crié');
    expect(relativeText(np(LOUP, { number: 'plural' }, { relative: { ...cried({}), subject: el(np(ON)) } }))).toBe('auxquels on crie');
    // A plain object of the same verb keeps que, and the agreement.
    expect(relativeText(np(FEU, { number: 'plural' }, { relative: cried({ aspect: 'resultative' }) }))).toBe('que le garçon a criés');
  });

  // A139: the object of a verb that takes it with a preposition relativises on that preposition, and no
  // participle agrees with it.
  test('a head that is the object of a prepositional verb takes the preposition with lequel', () => {
    const CLIQUER: Forms = { base: 'cliquer', object_prep: 'sur', participle: 'cliqué', '3sg_present': 'clique' };
    const clicked = { headRole: 'directObject' as const, subject: el(np(CHAT)), verbPhrase: vp(CLIQUER) };
    expect(relativeText(np(LIVRE, {}, { relative: clicked }))).toBe('sur lequel le chat clique');
    expect(relativeText(np(MAISON, { number: 'plural' }, { relative: { ...clicked, verbPhrase: vp(CLIQUER, { aspect: 'resultative' }) } })))
      .toBe('sur lesquelles le chat a cliqué');
  });

  // DEPEND's dépendre takes its object with "de", which relativises as "dont", not "duquel".
  test('a head that is the de-object of a prepositional verb takes dont', () => {
    const DEPENDRE: Forms = { base: 'dépendre', object_prep: 'de', participle: 'dépendu', '3sg_present': 'dépend' };
    const depends = { headRole: 'directObject' as const, subject: el(np(CHAT)), verbPhrase: vp(DEPENDRE) };
    expect(relativeText(np(MAISON, {}, { relative: depends }))).toBe('dont le chat dépend');
  });

  // B81: a topic taken with "de" ("parler du chat") relativises as "dont" too, not "duquel"; a verb that
  // governs its topic with "à" ("penser au chat") keeps its lequel.
  test('a topic head takes dont when its preposition is de, and lequel otherwise', () => {
    const PARLER: Forms = { base: 'parler', participle: 'parlé', '3sg_present': 'parle', '3pl_present': 'parlent' };
    const PENSER: Forms = { base: 'penser', topic_prep: 'à', participle: 'pensé', '3sg_present': 'pense' };
    const about = (verb: Forms) => ({ headRole: 'topic' as const, subject: el(np(ON)), verbPhrase: vp(verb) });
    expect(relativeText(np(LIVRE, {}, { relative: about(PARLER) }))).toBe('dont on parle');
    expect(relativeText(np(MAISON, { number: 'plural' }, { relative: about(PARLER) }))).toBe('dont on parle');
    expect(relativeText(np(LIVRE, {}, { relative: about(PENSER) }))).toBe('auquel on pense');
  });

  // A167: an "aucun" head negates the matrix clause, not the relative, so it is no self-negating
  // subject of the relative: a positive relative stays positive and a negative one takes "ne … pas".
  // The relative's OWN "aucun" subject does negate it, with "ne" alone.
  test('an aucun head leaves the relative its own polarity', () => {
    const onNoCat = (verbPhrase: ReturnType<typeof vp>) =>
      relativeText(np(CHAT, { definiteness: 'no' }, { relative: { headRole: 'subject', verbPhrase } }));
    expect(onNoCat(vp(MANGER))).toBe('qui mange');
    expect(onNoCat(vp(MANGER, { negative: true }))).toBe('qui ne mange pas');
    expect(relativeText(np(SOURIS, {}, {
      relative: { headRole: 'directObject', subject: el(np(CHAT, { definiteness: 'no' })), verbPhrase: vp(MANGER, { negative: true }) },
    }))).toBe("qu'aucun chat ne mange");
  });
});
