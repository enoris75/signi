import { describe, expect, test } from 'vitest';
import type { LanguageCode, NounPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';
import { ancestors, conceptIndex } from '../../backend/src/concepts/hierarchy.js';

// P09-E24's government and the law (docs/localization B76: POWER, GOVERNMENT, PARTY_POLITICAL, LAW,
// COURT_LAW, RIGHT_NOUN, WAR), its teams, institutions and business (B77: TEAM, COMMUNITY,
// UNIVERSITY, SERVICE, BUSINESS), and the relational adjectives that stand on both (B88: NATIONAL,
// SOCIAL, POLITICAL, PUBLIC): each word's paradigm, and each one's gloss in all seven languages.

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

// ── The words ─────────────────────────────────────────────────────────

describe('the nouns: a singular and a plural in every language', () => {
  test.each<[string, Record<LanguageCode, string>, Record<LanguageCode, string>]>([
    // B76. German Macht umlauts in the plural.
    ['POWER',
      { en: 'the power.', it: 'il potere.', fr: 'le pouvoir.', de: 'die Macht.', es: 'el poder.', ja: '権力。', pt: 'o poder.' },
      { en: 'the powers.', it: 'i poteri.', fr: 'les pouvoirs.', de: 'die Mächte.', es: 'los poderes.', ja: '権力。', pt: 'os poderes.' }],
    ['GOVERNMENT',
      { en: 'the government.', it: 'il governo.', fr: 'le gouvernement.', de: 'die Regierung.', es: 'el gobierno.', ja: '政府。', pt: 'o governo.' },
      { en: 'the governments.', it: 'i governi.', fr: 'les gouvernements.', de: 'die Regierungen.', es: 'los gobiernos.', ja: '政府。', pt: 'os governos.' }],
    ['PARTY_POLITICAL',
      { en: 'the party.', it: 'il partito.', fr: 'le parti.', de: 'die Partei.', es: 'el partido.', ja: '政党。', pt: 'o partido.' },
      { en: 'the parties.', it: 'i partiti.', fr: 'les partis.', de: 'die Parteien.', es: 'los partidos.', ja: '政党。', pt: 'os partidos.' }],
    // Spanish ley takes -es; German Gesetz is neuter.
    ['LAW',
      { en: 'the law.', it: 'la legge.', fr: 'la loi.', de: 'das Gesetz.', es: 'la ley.', ja: '法律。', pt: 'a lei.' },
      { en: 'the laws.', it: 'le leggi.', fr: 'les lois.', de: 'die Gesetze.', es: 'las leyes.', ja: '法律。', pt: 'as leis.' }],
    // French tribunal → tribunaux, Portuguese tribunal → tribunais.
    ['COURT_LAW',
      { en: 'the court.', it: 'il tribunale.', fr: 'le tribunal.', de: 'das Gericht.', es: 'el tribunal.', ja: '裁判所。', pt: 'o tribunal.' },
      { en: 'the courts.', it: 'i tribunali.', fr: 'les tribunaux.', de: 'die Gerichte.', es: 'los tribunales.', ja: '裁判所。', pt: 'os tribunais.' }],
    ['RIGHT_NOUN',
      { en: 'the right.', it: 'il diritto.', fr: 'le droit.', de: 'das Recht.', es: 'el derecho.', ja: '権利。', pt: 'o direito.' },
      { en: 'the rights.', it: 'i diritti.', fr: 'les droits.', de: 'die Rechte.', es: 'los derechos.', ja: '権利。', pt: 'os direitos.' }],
    ['WAR',
      { en: 'the war.', it: 'la guerra.', fr: 'la guerre.', de: 'der Krieg.', es: 'la guerra.', ja: '戦争。', pt: 'a guerra.' },
      { en: 'the wars.', it: 'le guerre.', fr: 'les guerres.', de: 'die Kriege.', es: 'las guerras.', ja: '戦争。', pt: 'as guerras.' }],
    // B77. Spanish equipo is masculine where the other Romance words are feminine.
    ['TEAM',
      { en: 'the team.', it: 'la squadra.', fr: "l'équipe.", de: 'die Mannschaft.', es: 'el equipo.', ja: 'チーム。', pt: 'a equipe.' },
      { en: 'the teams.', it: 'le squadre.', fr: 'les équipes.', de: 'die Mannschaften.', es: 'los equipos.', ja: 'チーム。', pt: 'as equipes.' }],
    // Italian -tà nouns are invariable.
    ['COMMUNITY',
      { en: 'the community.', it: 'la comunità.', fr: 'la communauté.', de: 'die Gemeinschaft.', es: 'la comunidad.', ja: '共同体。', pt: 'a comunidade.' },
      { en: 'the communities.', it: 'le comunità.', fr: 'les communautés.', de: 'die Gemeinschaften.', es: 'las comunidades.', ja: '共同体。', pt: 'as comunidades.' }],
    ['UNIVERSITY',
      { en: 'the university.', it: "l'università.", fr: "l'université.", de: 'die Universität.', es: 'la universidad.', ja: '大学。', pt: 'a universidade.' },
      { en: 'the universities.', it: 'le università.', fr: 'les universités.', de: 'die Universitäten.', es: 'las universidades.', ja: '大学。', pt: 'as universidades.' }],
    ['SERVICE',
      { en: 'the service.', it: 'il servizio.', fr: 'le service.', de: 'der Dienst.', es: 'el servicio.', ja: 'サービス。', pt: 'o serviço.' },
      { en: 'the services.', it: 'i servizi.', fr: 'les services.', de: 'die Dienste.', es: 'los servicios.', ja: 'サービス。', pt: 'os serviços.' }],
  ])('%s', (concept, singular, plural) => {
    expect(said(concept, { definiteness: 'definite' })).toEqual(singular);
    expect(said(concept, { number: 'plural', definiteness: 'definite' })).toEqual(plural);
  });

  test('BUSINESS is a mass noun in its singular word: commercio, commerce, Handel', () => {
    expect(said('BUSINESS', { definiteness: 'definite' })).toEqual({
      en: 'the business.', it: 'il commercio.', fr: 'le commerce.', de: 'der Handel.', es: 'el comercio.', ja: 'ビジネス。', pt: 'o comércio.',
    });
    expect(said('BUSINESS', { definiteness: 'definite', adjectives: ['NATIONAL'] })).toMatchObject({
      it: 'il commercio nazionale.', fr: 'le commerce national.', de: 'der nationale Handel.', es: 'el comercio nacional.',
    });
    expect(concepts.find((c) => c.id === 'BUSINESS')?.countable).toBe(false);
  });

  test('the genders agree: an adjective follows each lexeme', () => {
    // German Macht is feminine, Gesetz and Gericht neuter, Krieg and Dienst masculine.
    expect(said('POWER', { definiteness: 'indefinite', adjectives: ['BIG'] })).toEqual({
      en: 'a big power.', it: 'un grande potere.', fr: 'un grand pouvoir.', de: 'eine große Macht.', es: 'un poder grande.',
      ja: '大きい権力。', pt: 'um poder grande.',
    });
    expect(said('LAW', { definiteness: 'indefinite', adjectives: ['NEW'] })).toEqual({
      en: 'a new law.', it: 'una nuova legge.', fr: 'une nouvelle loi.', de: 'ein neues Gesetz.', es: 'una nueva ley.',
      ja: '新しい法律。', pt: 'uma nova lei.',
    });
    expect(said('WAR', { definiteness: 'indefinite', adjectives: ['BIG'] })).toMatchObject({
      it: 'una grande guerra.', fr: 'une grande guerre.', de: 'ein großer Krieg.', es: 'una guerra grande.',
    });
    expect(said('COURT_LAW', { definiteness: 'indefinite', adjectives: ['NEW'] })).toMatchObject({
      it: 'un nuovo tribunale.', fr: 'un nouveau tribunal.', de: 'ein neues Gericht.',
    });
    expect(said('TEAM', { definiteness: 'indefinite', adjectives: ['NEW'] })).toMatchObject({
      it: 'una nuova squadra.', fr: 'une nouvelle équipe.', de: 'eine neue Mannschaft.', es: 'un nuevo equipo.', pt: 'uma nova equipe.',
    });
    expect(said('SERVICE', { definiteness: 'indefinite', adjectives: ['GOOD'] })).toMatchObject({
      it: 'un buon servizio.', fr: 'un bon service.', de: 'ein guter Dienst.', es: 'un servicio bueno.',
    });
  });

  test('German compound stems: the seeded -(e)s- and the suffix rule', () => {
    const compound = (head: string, modifier: string) =>
      sayAll(clause(np(head, { nounModifiers: [{ concept: modifier, relation: 'feature' }] }), 'BURN')).de;
    expect(compound('TEXT', 'LAW')).toBe('der Gesetzestext brennt.');
    expect(compound('BUILDING', 'COURT_LAW')).toBe('das Gerichtsgebäude brennt.');
    expect(compound('SYSTEM', 'RIGHT_NOUN')).toBe('das Rechtssystem brennt.');
    expect(compound('BOOK', 'WAR')).toBe('das Kriegsbuch brennt.');
    expect(compound('SYSTEM', 'BUSINESS')).toBe('das Handelssystem brennt.');
    // -ung and -tät take the -s- by rule, Partei nothing.
    expect(compound('SYSTEM', 'GOVERNMENT')).toBe('das Regierungssystem brennt.');
    expect(compound('BUILDING', 'UNIVERSITY')).toBe('das Universitätsgebäude brennt.');
    expect(compound('PROGRAM_SOFTWARE', 'PARTY_POLITICAL')).toBe('das Parteiprogramm brennt.');
  });

  test('a locative and an object on the new institutions', () => {
    expect(sayAll(clause(the('STUDENT'), 'LEARN', { complements: { locative: { phrase: the('UNIVERSITY') } } }))).toEqual({
      en: 'the student learns in the university.', it: "lo studente impara nell'università.", fr: "l'étudiant apprend dans l'université.",
      de: 'der Student lernt in der Universität.', es: 'el estudiante aprende en la universidad.', ja: '学生は大学で学びます。',
      pt: 'o estudante aprende na universidade.',
    });
    expect(sayAll(clause(the('GOVERNMENT'), 'WRITE', { directObject: np('LAW', { definiteness: 'indefinite' }) }))).toEqual({
      en: 'the government writes a law.', it: 'il governo scrive una legge.', fr: 'le gouvernement écrit une loi.',
      de: 'die Regierung schreibt ein Gesetz.', es: 'el gobierno escribe una ley.', ja: '政府は法律を書きます。',
      pt: 'o governo escreve uma lei.',
    });
  });

  test('the collectives hang under GROUP, UNIVERSITY under SCHOOL; the synonyms split the homonyms', () => {
    const byId = conceptIndex(concepts);
    const concept = (id: string) => concepts.find((c) => c.id === id)!;
    for (const id of ['GOVERNMENT', 'PARTY_POLITICAL', 'TEAM', 'COMMUNITY']) expect(ancestors(id, byId)[0]).toBe('GROUP');
    expect(ancestors('UNIVERSITY', byId)).toEqual(['SCHOOL', 'BUILDING', 'PLACE']);
    expect(['POWER', 'PARTY_POLITICAL', 'COURT_LAW', 'RIGHT_NOUN', 'BUSINESS'].map((id) => concept(id).synonym))
      .toEqual(['authority', 'political', 'of law', 'entitlement', 'commerce']);
    // The adjective RIGHT_SIDE is droit, derecho and direito too; the synonym tells them apart.
    expect(concept('RIGHT_SIDE').synonym).toBe('right-hand');
  });
});

describe('the relational adjectives: position and agreement', () => {
  test.each<[string, string, Record<LanguageCode, string>]>([
    // All four follow the noun in the Romance languages and precede it in German and Japanese.
    ['NATIONAL', 'LAW', { en: 'a national law.', it: 'una legge nazionale.', fr: 'une loi nationale.', de: 'ein nationales Gesetz.', es: 'una ley nacional.', ja: '国の法律。', pt: 'uma lei nacional.' }],
    ['SOCIAL', 'GROUP', { en: 'a social group.', it: 'un gruppo sociale.', fr: 'un groupe social.', de: 'eine soziale Gruppe.', es: 'un grupo social.', ja: '社会的なグループ。', pt: 'um grupo social.' }],
    // 政治的な政党 doubles the 政, which is the language's own.
    ['POLITICAL', 'PARTY_POLITICAL', { en: 'a political party.', it: 'un partito politico.', fr: 'un parti politique.', de: 'eine politische Partei.', es: 'un partido político.', ja: '政治的な政党。', pt: 'um partido político.' }],
    ['PUBLIC', 'PLACE', { en: 'a public place.', it: 'un luogo pubblico.', fr: 'un lieu public.', de: 'ein öffentlicher Ort.', es: 'un lugar público.', ja: '公共の場所。', pt: 'um lugar público.' }],
  ])('%s: a %s', (adjective, noun, rendered) => {
    expect(said(noun, { definiteness: 'indefinite', adjectives: [adjective] })).toEqual(rendered);
  });

  test('the plurals: French -al → -aux, Italian -ico → -ici, and the feminines', () => {
    expect(said('GOVERNMENT', { definiteness: 'definite', number: 'plural', adjectives: ['NATIONAL'] })).toEqual({
      en: 'the national governments.', it: 'i governi nazionali.', fr: 'les gouvernements nationaux.', de: 'die nationalen Regierungen.',
      es: 'los gobiernos nacionales.', ja: '国の政府。', pt: 'os governos nacionais.',
    });
    expect(said('RIGHT_NOUN', { definiteness: 'definite', number: 'plural', adjectives: ['SOCIAL'] })).toEqual({
      en: 'the social rights.', it: 'i diritti sociali.', fr: 'les droits sociaux.', de: 'die sozialen Rechte.',
      es: 'los derechos sociales.', ja: '社会的な権利。', pt: 'os direitos sociais.',
    });
    expect(said('PARTY_POLITICAL', { definiteness: 'definite', number: 'plural', adjectives: ['POLITICAL'] })).toEqual({
      en: 'the political parties.', it: 'i partiti politici.', fr: 'les partis politiques.', de: 'die politischen Parteien.',
      es: 'los partidos políticos.', ja: '政治的な政党。', pt: 'os partidos políticos.',
    });
    expect(said('PLACE', { definiteness: 'definite', number: 'plural', adjectives: ['PUBLIC'] })).toMatchObject({
      it: 'i luoghi pubblici.', fr: 'les lieux publics.', es: 'los lugares públicos.', pt: 'os lugares públicos.',
    });
  });

  test('French public is publique in the feminine (FR_ADJ_IRREGULAR), not *publice', () => {
    expect(said('LAW', { definiteness: 'indefinite', adjectives: ['PUBLIC'] }).fr).toBe('une loi publique.');
    expect(said('LAW', { definiteness: 'definite', number: 'plural', adjectives: ['PUBLIC'] })).toEqual({
      en: 'the public laws.', it: 'le leggi pubbliche.', fr: 'les lois publiques.', de: 'die öffentlichen Gesetze.',
      es: 'las leyes públicas.', ja: '公共の法律。', pt: 'as leis públicas.',
    });
  });

  test('as a predicate: the の-adjectives keep their の where 的な drops to 的だ', () => {
    expect(sayAll(clause(the('LAW'), 'BE', { complements: { predicative: { phrase: { concept: 'NATIONAL' } } } }))).toEqual({
      en: 'the law is national.', it: 'la legge è nazionale.', fr: 'la loi est nationale.', de: 'das Gesetz ist national.',
      es: 'la ley es nacional.', ja: '法律は国のです。', pt: 'a lei é nacional.',
    });
    expect(sayAll(clause(the('WAR'), 'BE', { complements: { predicative: { phrase: { concept: 'POLITICAL' } } } }))).toEqual({
      en: 'the war is political.', it: 'la guerra è politica.', fr: 'la guerre est politique.', de: 'der Krieg ist politisch.',
      es: 'la guerra es política.', ja: '戦争は政治的です。', pt: 'a guerra é política.',
    });
    expect(sayAll(clause(the('PLACE'), 'BE', { complements: { predicative: { phrase: { concept: 'PUBLIC' } } } }))).toMatchObject({
      fr: 'le lieu est public.', ja: '場所は公共のです。',
    });
    expect(sayAll(clause(the('LAW'), 'BE', { complements: { predicative: { phrase: { concept: 'PUBLIC' } } } })).fr).toBe('la loi est publique.');
  });
});

// ── The glosses ───────────────────────────────────────────────────────

describe('the glosses render in every language', () => {
  test.each<[string, Record<LanguageCode, string>]>([
    // B76. The instrument gap with no object.
    ['POWER', { en: 'an ability with which one governs.', it: 'una capacità con la quale si governa.', fr: 'une capacité avec laquelle on gouverne.', de: 'eine Fähigkeit, mit der man regiert.', es: 'una capacidad con la que se gobierna.', ja: '統治する能力。', pt: 'uma capacidade com a qual se governa.' }],
    // The group governs the state; STATE_NATION is the system that governs a country.
    ['GOVERNMENT', { en: 'a group that governs a state.', it: 'un gruppo che governa uno Stato.', fr: 'un groupe qui gouverne un État.', de: 'eine Gruppe, die einen Staat regiert.', es: 'un grupo que gobierna un Estado.', ja: '国家を統治するグループ。', pt: 'um grupo que governa um Estado.' }],
    // A mass object, bare singular; French writes the generic definite.
    ['PARTY_POLITICAL', { en: 'a group that desires power.', it: 'un gruppo che desidera potere.', fr: 'un groupe qui désire le pouvoir.', de: 'eine Gruppe, die Macht wünscht.', es: 'un grupo que desea poder.', ja: '権力を望むグループ。', pt: 'um grupo que deseja poder.' }],
    // WRITE, not GIVE, whose Japanese is the benefactive あげる.
    ['LAW', { en: 'an instruction that a state writes.', it: "un'istruzione che uno Stato scrive.", fr: "une instruction qu'un État écrit.", de: 'eine Anweisung, die ein Staat schreibt.', es: 'una instrucción que un Estado escribe.', ja: '国家が書く指示。', pt: 'uma instrução que um Estado escreve.' }],
    ['COURT_LAW', { en: 'a group that applies the laws.', it: 'un gruppo che applica le leggi.', fr: 'un groupe qui applique les lois.', de: 'eine Gruppe, die die Gesetze anwendet.', es: 'un grupo que aplica las leyes.', ja: '法律を適用するグループ。', pt: 'um grupo que aplica as leis.' }],
    // MAY in an object-gap relative: the Romance languages say permission with CAN's verb.
    ['RIGHT_NOUN', { en: 'an action that one may do.', it: "un'azione che si può fare.", fr: "une action qu'on peut faire.", de: 'eine Handlung, die man tun darf.', es: 'una acción que se puede hacer.', ja: 'することが許される動作。', pt: 'uma ação que se pode fazer.' }],
    // The indefinite plural subject keeps French des; Spanish and Portuguese then say unas / umas.
    ['WAR', { en: 'a period where nations kill.', it: 'un periodo dove nazioni uccidono.', fr: 'une période où des nations tuent.', de: 'ein Zeitraum, in dem Nationen töten.', es: 'un período donde unas naciones matan.', ja: '国民が殺す期間。', pt: 'um período onde umas nações matam.' }],
    // B77. Japanese PLAY_GAME is 遊ぶ, as in PLAY_GAME's own gloss.
    ['TEAM', { en: 'a group that plays.', it: 'un gruppo che gioca.', fr: 'un groupe qui joue.', de: 'eine Gruppe, die spielt.', es: 'un grupo que juega.', ja: '遊ぶグループ。', pt: 'um grupo que joga.' }],
    // SYSTEM's shape: the relative agrees with GROUP; a locative with SAME.
    ['COMMUNITY', { en: 'a group of people that lives in the same place.', it: 'un gruppo di persone che abita nello stesso luogo.', fr: 'un groupe de personnes qui habite dans le même lieu.', de: 'eine Gruppe von Personen, die am gleichen Ort wohnt.', es: 'un grupo de personas que vive en el mismo lugar.', ja: '同じ場所に住む人のグループ。', pt: 'um grupo de pessoas que mora no mesmo lugar.' }],
    // A locative gap with a subject of its own, under an adjective.
    ['UNIVERSITY', { en: 'a school where adult people learn.', it: 'una scuola dove persone adulte imparano.', fr: 'une école où des personnes adultes apprennent.', de: 'eine Schule, in der erwachsene Personen lernen.', es: 'una escuela donde unas personas adultas aprenden.', ja: '大人の人が学ぶ学校。', pt: 'uma escola onde umas pessoas adultas aprendem.' }],
    // E2's purpose complement inside an object-gap relative, on a bare mass head.
    ['SERVICE', { en: 'work that one does for other people.', it: 'lavoro che si fa per altre persone.', fr: "travail qu'on fait pour d'autres personnes.", de: 'Arbeit, die man für andere Personen tut.', es: 'trabajo que se hace para otras personas.', ja: '別の人のためにする仕事。', pt: 'trabalho que se faz para outras pessoas.' }],
    // MARKET's verb (a place where one trades) on WORK_NOUN.
    ['BUSINESS', { en: 'work with which one trades.', it: 'lavoro con il quale si commercia.', fr: 'travail avec lequel on commerce.', de: 'Arbeit, mit der man handelt.', es: 'trabajo con el que se comercia.', ja: '売買する仕事。', pt: 'trabalho com o qual se comercia.' }],
    // B88. C24's "that indicates …"; Spanish takes the personal a before NATION, which is human.
    ['NATIONAL', { en: 'that indicates a nation.', it: 'che indica una nazione.', fr: 'qui indique une nation.', de: 'der eine Nation bezeichnet.', es: 'que indica a una nación.', ja: '国民を示す。', pt: 'que indica uma nação.' }],
    ['SOCIAL', { en: 'that indicates a community.', it: 'che indica una comunità.', fr: 'qui indique une communauté.', de: 'der eine Gemeinschaft bezeichnet.', es: 'que indica una comunidad.', ja: '共同体を示す。', pt: 'que indica uma comunidade.' }],
    ['POLITICAL', { en: 'that indicates a government.', it: 'che indica un governo.', fr: 'qui indique un gouvernement.', de: 'der eine Regierung bezeichnet.', es: 'que indica un gobierno.', ja: '政府を示す。', pt: 'que indica um governo.' }],
    // A predicate adjective with a purpose complement: Spanish and Portuguese estar.
    ['PUBLIC', { en: 'that is open for all people.', it: 'che è aperto per tutte le persone.', fr: 'qui est ouvert pour toutes les personnes.', de: 'der für alle Personen offen ist.', es: 'que está abierto para todas las personas.', ja: 'すべての人のために開いている。', pt: 'que está aberto para todas as pessoas.' }],
  ])('%s', (concept, rendered) => {
    expect(definitionAll(concept)).toEqual(rendered);
  });
});
