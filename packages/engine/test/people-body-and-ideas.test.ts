import { describe, expect, test } from 'vitest';
import type { LanguageCode, NounPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

// P09-E24's people, body and idea words (docs/localization B75, B79, B81): GIRL, GUY, KID and MEMBER;
// HEAD, FACE, BACK_BODY and HEALTH; IDEA, REASON, ISSUE, INFORMATION, RESEARCH, STUDY_NOUN and
// HISTORY_PAST. Every word's paradigm, the twelve glosses, the three that are literal by design, and
// the topic-gap relative ISSUE is the first gloss on.

/** Render a seeded concept's own `definition` plan (its picker tooltip) into every language. */
function definitionAll(id: string): Record<LanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
}

const said = (concept: string, extra: Partial<NounPhrase> = {}) => sayAll({ subject: np(concept, extra) });
const the = (concept: string, extra: Partial<NounPhrase> = {}) => np(concept, { definiteness: 'definite', ...extra });
const a = (concept: string, extra: Partial<NounPhrase> = {}) => np(concept, { definiteness: 'indefinite', ...extra });

// ── The words ─────────────────────────────────────────────────────────

describe('the count nouns: a singular and a plural in every language', () => {
  test.each<[string, Record<LanguageCode, string>, Record<LanguageCode, string>]>([
    // B75. Mädchen is neuter and the same word in the plural.
    ['GIRL',
      { en: 'the girl.', it: 'la ragazza.', fr: 'la fille.', de: 'das Mädchen.', es: 'la niña.', ja: '女の子。', pt: 'a menina.' },
      { en: 'the girls.', it: 'le ragazze.', fr: 'les filles.', de: 'die Mädchen.', es: 'las niñas.', ja: '女の子。', pt: 'as meninas.' }],
    ['GUY',
      { en: 'the guy.', it: 'il tipo.', fr: 'le type.', de: 'der Typ.', es: 'el tipo.', ja: '男の人。', pt: 'o cara.' },
      { en: 'the guys.', it: 'i tipi.', fr: 'les types.', de: 'die Typen.', es: 'los tipos.', ja: '男の人。', pt: 'os caras.' }],
    // German Kind is CHILD's word, by design.
    ['KID',
      { en: 'the kid.', it: 'il ragazzino.', fr: 'le gamin.', de: 'das Kind.', es: 'el chico.', ja: '子。', pt: 'o garoto.' },
      { en: 'the kids.', it: 'i ragazzini.', fr: 'les gamins.', de: 'die Kinder.', es: 'los chicos.', ja: '子。', pt: 'os garotos.' }],
    ['MEMBER',
      { en: 'the member.', it: 'il membro.', fr: 'le membre.', de: 'das Mitglied.', es: 'el miembro.', ja: '一員。', pt: 'o membro.' },
      { en: 'the members.', it: 'i membri.', fr: 'les membres.', de: 'die Mitglieder.', es: 'los miembros.', ja: '一員。', pt: 'os membros.' }],
    // B79. German Kopf umlauts in the plural.
    ['HEAD',
      { en: 'the head.', it: 'la testa.', fr: 'la tête.', de: 'der Kopf.', es: 'la cabeza.', ja: '頭。', pt: 'a cabeça.' },
      { en: 'the heads.', it: 'le teste.', fr: 'les têtes.', de: 'die Köpfe.', es: 'las cabezas.', ja: '頭。', pt: 'as cabeças.' }],
    ['FACE',
      { en: 'the face.', it: 'il viso.', fr: 'le visage.', de: 'das Gesicht.', es: 'la cara.', ja: '顔。', pt: 'o rosto.' },
      { en: 'the faces.', it: 'i visi.', fr: 'les visages.', de: 'die Gesichter.', es: 'las caras.', ja: '顔。', pt: 'os rostos.' }],
    // French dos and German Rücken are the same word in the plural; Portuguese costas is plural in
    // every use (P09-E41), so its singular is the plural too.
    ['BACK_BODY',
      { en: 'the back.', it: 'la schiena.', fr: 'le dos.', de: 'der Rücken.', es: 'la espalda.', ja: '背中。', pt: 'as costas.' },
      { en: 'the backs.', it: 'le schiene.', fr: 'les dos.', de: 'die Rücken.', es: 'las espaldas.', ja: '背中。', pt: 'as costas.' }],
    // B81.
    ['IDEA',
      { en: 'the idea.', it: "l'idea.", fr: "l'idée.", de: 'die Idee.', es: 'la idea.', ja: '考え。', pt: 'a ideia.' },
      { en: 'the ideas.', it: 'le idee.', fr: 'les idées.', de: 'die Ideen.', es: 'las ideas.', ja: '考え。', pt: 'as ideias.' }],
    // Italian motivo is masculine; the three other Romance words are feminine.
    ['REASON',
      { en: 'the reason.', it: 'il motivo.', fr: 'la raison.', de: 'der Grund.', es: 'la razón.', ja: '理由。', pt: 'a razão.' },
      { en: 'the reasons.', it: 'i motivi.', fr: 'les raisons.', de: 'die Gründe.', es: 'las razones.', ja: '理由。', pt: 'as razões.' }],
    ['ISSUE',
      { en: 'the issue.', it: 'la questione.', fr: 'la question.', de: 'die Frage.', es: 'la cuestión.', ja: '問題。', pt: 'a questão.' },
      { en: 'the issues.', it: 'le questioni.', fr: 'les questions.', de: 'die Fragen.', es: 'las cuestiones.', ja: '問題。', pt: 'as questões.' }],
    // Italian takes lo/gli before s + consonant.
    ['STUDY_NOUN',
      { en: 'the study.', it: 'lo studio.', fr: "l'étude.", de: 'die Studie.', es: 'el estudio.', ja: '研究論文。', pt: 'o estudo.' },
      { en: 'the studies.', it: 'gli studi.', fr: 'les études.', de: 'die Studien.', es: 'los estudios.', ja: '研究論文。', pt: 'os estudos.' }],
  ])('%s', (concept, singular, plural) => {
    expect(said(concept, { definiteness: 'definite' })).toEqual(singular);
    expect(said(concept, { number: 'plural', definiteness: 'definite' })).toEqual(plural);
  });
});

describe('the mass nouns keep the singular and go bare as an object', () => {
  test.each<[string, Record<LanguageCode, string>, Record<LanguageCode, string>]>([
    ['HEALTH',
      { en: 'the health.', it: 'la salute.', fr: 'la santé.', de: 'die Gesundheit.', es: 'la salud.', ja: '健康。', pt: 'a saúde.' },
      { en: 'the cat sees health.', it: 'il gatto vede salute.', fr: 'le chat voit de la santé.', de: 'der Kater sieht Gesundheit.', es: 'el gato ve salud.', ja: '猫は健康を見ます。', pt: 'o gato vê saúde.' }],
    ['INFORMATION',
      { en: 'the information.', it: "l'informazione.", fr: "l'information.", de: 'die Information.', es: 'la información.', ja: '情報。', pt: 'a informação.' },
      { en: 'the cat sees information.', it: 'il gatto vede informazione.', fr: "le chat voit de l'information.", de: 'der Kater sieht Information.', es: 'el gato ve información.', ja: '猫は情報を見ます。', pt: 'o gato vê informação.' }],
    ['RESEARCH',
      { en: 'the research.', it: 'la ricerca.', fr: 'la recherche.', de: 'die Forschung.', es: 'la investigación.', ja: '研究。', pt: 'a pesquisa.' },
      { en: 'the cat sees research.', it: 'il gatto vede ricerca.', fr: 'le chat voit de la recherche.', de: 'der Kater sieht Forschung.', es: 'el gato ve investigación.', ja: '猫は研究を見ます。', pt: 'o gato vê pesquisa.' }],
    // histoire elides, as STORY's does.
    ['HISTORY_PAST',
      { en: 'the history.', it: 'la storia.', fr: "l'histoire.", de: 'die Geschichte.', es: 'la historia.', ja: '歴史。', pt: 'a história.' },
      { en: 'the cat sees history.', it: 'il gatto vede storia.', fr: "le chat voit de l'histoire.", de: 'der Kater sieht Geschichte.', es: 'el gato ve historia.', ja: '猫は歴史を見ます。', pt: 'o gato vê história.' }],
  ])('%s', (concept, definite, object) => {
    expect(said(concept, { definiteness: 'definite' })).toEqual(definite);
    expect(said(concept, { definiteness: 'definite', number: 'plural' })).toEqual(definite);
    expect(sayAll(clause(the('CAT'), 'SEE', { directObject: np(concept, { definiteness: 'bare' }) }))).toEqual(object);
  });
});

describe('what the new lexemes do beyond their plural', () => {
  test('the genders agree with the lexeme: Mädchen is neuter, ragazza feminine', () => {
    expect(said('GIRL', { definiteness: 'indefinite', adjectives: ['BIG'] })).toEqual({
      en: 'a big girl.', it: 'una grande ragazza.', fr: 'une grande fille.', de: 'ein großes Mädchen.', es: 'una niña grande.',
      ja: '大きい女の子。', pt: 'uma menina grande.',
    });
    expect(said('HEAD', { definiteness: 'indefinite', adjectives: ['BIG'] })).toEqual({
      en: 'a big head.', it: 'una grande testa.', fr: 'une grande tête.', de: 'ein großer Kopf.', es: 'una cabeza grande.',
      ja: '大きい頭。', pt: 'uma cabeça grande.',
    });
    expect(said('FACE', { definiteness: 'indefinite', adjectives: ['BIG'] })).toMatchObject({
      it: 'un grande viso.', fr: 'un grand visage.', de: 'ein großes Gesicht.', es: 'una cara grande.', pt: 'um rosto grande.',
    });
    expect(said('REASON', { definiteness: 'indefinite', adjectives: ['BIG'] })).toMatchObject({
      it: 'un grande motivo.', fr: 'une grande raison.', de: 'ein großer Grund.', es: 'una razón grande.', pt: 'uma razão grande.',
    });
  });

  test('German Typ is a weak masculine: -en in every case but the nominative', () => {
    expect(sayAll(clause(the('CAT'), 'SEE', { directObject: a('GUY') })).de).toBe('der Kater sieht einen Typen.');
    expect(sayAll(clause(the('MAN'), 'GIVE', { directObject: the('BOOK'), complements: { terminus: { phrase: the('GUY') } } })).de)
      .toBe('der Mann gibt dem Typen das Buch.');
    expect(sayAll({ subject: { concept: 'NAME_NOUN', definiteness: 'definite', possessor: the('GUY') } }).de).toBe('der Name des Typen.');
  });

  test('KID has the feminine the Romance words have; German and Japanese do not mark it', () => {
    expect(said('KID', { definiteness: 'indefinite', gender: 'fem' })).toEqual({
      en: 'a kid.', it: 'una ragazzina.', fr: 'une gamine.', de: 'ein Kind.', es: 'una chica.', ja: '子。', pt: 'uma garota.',
    });
  });

  test('Portuguese costas is plural in every use: the article, the adjective and the verb agree', () => {
    expect(sayAll(clause(a('BACK_BODY', { adjectives: ['BIG'] }), 'SEEM', { complements: { predicative: { phrase: np('GOOD') } } })))
      .toMatchObject({ it: 'una grande schiena sembra buona.', pt: 'umas costas grandes parecem boas.' });
    expect(sayAll(clause(the('MAN'), 'GIVE', { directObject: the('BOOK'), complements: { terminus: { phrase: the('BACK_BODY') } } })).pt)
      .toBe('o homem dá o livro às costas.');
  });

  test('the Spanish personal a marks the human words, not MEMBER', () => {
    expect(sayAll(clause(the('CAT'), 'SEE', { directObject: a('GIRL') })).es).toBe('el gato ve a una niña.');
    expect(sayAll(clause(the('CAT'), 'SEE', { directObject: a('GUY') })).es).toBe('el gato ve a un tipo.');
    expect(sayAll(clause(the('CAT'), 'SEE', { directObject: a('KID') })).es).toBe('el gato ve a un chico.');
    expect(sayAll(clause(the('CAT'), 'SEE', { directObject: a('MEMBER') })).es).toBe('el gato ve un miembro.');
  });
});

// ── The glosses ───────────────────────────────────────────────────────

describe('the glosses', () => {
  test.each<[string, Record<LanguageCode, string>]>([
    // B75. GIRL's is YOUNG_WOMAN's by design (sweep-definitions.test.ts allows the pair).
    ['GIRL', { en: 'a young female person.', it: 'una giovane persona femminile.', fr: 'une jeune personne féminine.', de: 'eine junge weibliche Person.', es: 'una persona joven y femenina.', ja: '若い女性の人。', pt: 'uma pessoa jovem e feminina.' }],
    ['MEMBER', { en: 'a part of a group.', it: 'una parte di un gruppo.', fr: "une partie d'un groupe.", de: 'ein Teil einer Gruppe.', es: 'una parte de un grupo.', ja: 'グループの部分。', pt: 'uma parte de um grupo.' }],
    // B79.
    ['HEAD', { en: 'the high part of a body.', it: 'la parte alta di un corpo.', fr: "la partie haute d'un corps.", de: 'der hohe Teil eines Körpers.', es: 'la parte alta de un cuerpo.', ja: '体の高い部分。', pt: 'a parte alta de um corpo.' }],
    ['FACE', { en: 'the part of a head that has the eyes.', it: 'la parte di una testa che ha gli occhi.', fr: "la partie d'une tête qui a les yeux.", de: 'der Teil eines Kopfes, der die Augen hat.', es: 'la parte de una cabeza que tiene los ojos.', ja: '目がある頭の部分。', pt: 'a parte de uma cabeça que tem os olhos.' }],
    ['HEALTH', { en: "a body's good state.", it: 'il buono stato di un corpo.', fr: "le bon état d'un corps.", de: 'der gute Zustand eines Körpers.', es: 'el estado bueno de un cuerpo.', ja: '体の良い状態。', pt: 'o estado bom de um corpo.' }],
    // B81.
    ['IDEA', { en: 'a concept that is in a mind.', it: 'un concetto che è in una mente.', fr: 'un concept qui est dans un esprit.', de: 'ein Begriff, der in einem Verstand ist.', es: 'un concepto que está en una mente.', ja: '頭脳にある概念。', pt: 'um conceito que está em uma mente.' }],
    ['REASON', { en: 'a fact that causes an action.', it: "un fatto che induce un'azione.", fr: 'un fait qui induit une action.', de: 'eine Tatsache, die eine Handlung veranlasst.', es: 'un hecho que induce una acción.', ja: '動作を引き起こす事実。', pt: 'um fato que induz uma ação.' }],
    // The first gloss on a topic gap; French writes dont, not duquel.
    ['ISSUE', { en: 'a problem about which one speaks.', it: 'un problema del quale si parla.', fr: 'un problème dont on parle.', de: 'ein Problem, über das man spricht.', es: 'un problema sobre el que se habla.', ja: '話す問題。', pt: 'um problema sobre o qual se fala.' }],
    ['INFORMATION', { en: 'content that one learns.', it: 'contenuto che si impara.', fr: "contenu qu'on apprend.", de: 'Inhalt, den man lernt.', es: 'contenido que se aprende.', ja: '学ぶ内容。', pt: 'conteúdo que se aprende.' }],
    ['RESEARCH', { en: 'work with which one finds new facts.', it: 'lavoro con il quale si trovano nuovi fatti.', fr: 'travail avec lequel on trouve de nouveaux faits.', de: 'Arbeit, mit der man neue Tatsachen findet.', es: 'trabajo con el que se encuentran nuevos hechos.', ja: '新しい事実を見つける仕事。', pt: 'trabalho com o qual se encontram novos fatos.' }],
    ['STUDY_NOUN', { en: 'a text that describes research.', it: 'un testo che descrive ricerca.', fr: 'un texte qui décrit de la recherche.', de: 'ein Text, der Forschung beschreibt.', es: 'un texto que describe investigación.', ja: '研究を描写するテキスト。', pt: 'um texto que descreve pesquisa.' }],
    ['HISTORY_PAST', { en: 'the past facts.', it: 'i fatti passati.', fr: 'les faits passés.', de: 'die vergangenen Tatsachen.', es: 'los hechos pasados.', ja: '過去の事実。', pt: 'os fatos passados.' }],
  ])('%s', (concept, gloss) => {
    expect(definitionAll(concept)).toEqual(gloss);
  });

  test('GUY, KID and BACK_BODY are literal by design', () => {
    for (const id of ['GUY', 'KID', 'BACK_BODY']) {
      const concept = concepts.find((c) => c.id === id);
      expect(concept, id).toBeDefined();
      expect(concept!.definition, id).toBeUndefined();
    }
  });
});

// ── The topic gap ─────────────────────────────────────────────────────

describe('a topic-gap relative', () => {
  const about = (head: string, verb: string, extra: Partial<NounPhrase> = {}) => sayAll({
    subject: a(head, { ...extra, relative: { headRole: 'topic', subject: { concept: 'GENERIC_PERSON' }, verbPhrase: { verb } } }),
  });

  test('speak takes each language\'s own topic word, and French writes dont', () => {
    expect(about('HOUSE', 'SPEAK', { definiteness: 'definite', number: 'plural' })).toEqual({
      en: 'the houses about which one speaks.', it: 'le case delle quali si parla.', fr: 'les maisons dont on parle.',
      de: 'die Häuser, über die man spricht.', es: 'las casas sobre las que se habla.', ja: '話す家。', pt: 'as casas sobre as quais se fala.',
    });
  });

  test('think keeps the preposition it governs its topic with', () => {
    expect(about('CAT', 'THINK')).toEqual({
      en: 'a cat about which one thinks.', it: 'un gatto al quale si pensa.', fr: 'un chat auquel on pense.',
      de: 'ein Kater, an den man denkt.', es: 'un gato en el que se piensa.', ja: '考える猫。', pt: 'um gato no qual se pensa.',
    });
  });
});
