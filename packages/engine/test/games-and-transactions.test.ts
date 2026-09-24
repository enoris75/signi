import { describe, expect, test } from 'vitest';
import type { LanguageCode, NounPhrase, PhrasePlan } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

// docs/localization B82 and B85, from P09-E24's ranks 201–400. B82: the nouns KIND_SORT, CHANGE_NOUN,
// GAME, PERCENT and PARTY_CELEBRATION. B85: the verbs PAY, PROVIDE, SPEND_MONEY, SPEND_TIME, LOSE,
// LOSE_GAME, WIN and THANK (ALLOW, the ninth, P09-E43 seeded and glossed). This file pins each new
// word's paradigm and every gloss the two tickets shipped.

/** Render a seeded concept's own `definition` plan (its picker tooltip) into every language. */
function definitionAll(id: string): Record<LanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
}

const the = (concept: string, extra: Partial<NounPhrase> = {}) => np(concept, { definiteness: 'definite', ...extra });
const command = (verb: string, extra: Parameters<typeof clause>[2] = {}): PhrasePlan =>
  ({ ...clause(np('SECOND_PERSON'), verb, extra), imperative: true });
const seed = (id: string) => concepts.find((c) => c.id === id);

// ── B82: the glosses ──────────────────────────────────────────────────

describe('B82: the glosses', () => {
  test.each<[string, Record<LanguageCode, string>]>([
    // SYSTEM's shape: the relative agrees with GROUP in all seven.
    ['KIND_SORT', { en: 'a group of things that has the same features.', it: 'un gruppo di cose che ha le stesse caratteristiche.', fr: 'un groupe de choses qui a les mêmes caractéristiques.', de: 'eine Gruppe von Dingen, die die gleichen Merkmale hat.', es: 'un grupo de cosas que tiene las mismas características.', ja: '同じ特徴があるもののグループ。', pt: 'um grupo de coisas que tem as mesmas características.' }],
    ['CHANGE_NOUN', { en: 'a process that changes objects.', it: 'un processo che cambia oggetti.', fr: 'un processus qui change des objets.', de: 'ein Prozess, der Gegenstände ändert.', es: 'un proceso que cambia objetos.', ja: '物体を変える過程。', pt: 'um processo que muda objetos.' }],
    // The bare mass purpose: French takes the generic article ("pour la joie", the engine fix B82
    // brought), the six others keep it bare.
    ['GAME', { en: 'an action that one does for joy.', it: "un'azione che si fa per gioia.", fr: "une action qu'on fait pour la joie.", de: 'eine Handlung, die man für Freude tut.', es: 'una acción que se hace para alegría.', ja: '喜びのためにする動作。', pt: 'uma ação que se faz para alegria.' }],
    ['PARTY_CELEBRATION', { en: 'a group of happy people.', it: 'un gruppo di persone felici.', fr: 'un groupe de personnes heureuses.', de: 'eine Gruppe glücklicher Personen.', es: 'un grupo de personas felices.', ja: '幸せな人のグループ。', pt: 'um grupo de pessoas felizes.' }],
  ])('%s', (id, rendered) => {
    expect(definitionAll(id)).toEqual(rendered);
  });

  test('PERCENT is literal by design: "one part in a hundred" needs 100', () => {
    expect(seed('PERCENT')?.definition).toBeUndefined();
  });

  test('where the nouns hang, and what the picker says beside them', () => {
    expect(['CHANGE_NOUN', 'GAME'].map((id) => seed(id)?.isA)).toEqual(['PROCESS', 'ACTION']);
    expect(['KIND_SORT', 'PARTY_CELEBRATION'].map((id) => seed(id)?.synonym)).toEqual(['sort', 'celebration']);
  });
});

// ── B82: the words ────────────────────────────────────────────────────

describe('B82: the nouns, singular and plural, with an agreeing adjective', () => {
  const sees = (object: NounPhrase) => sayAll(clause(the('CAT'), 'SEE', { directObject: object }));
  test.each<[string, Record<LanguageCode, string>, Record<LanguageCode, string>, Record<LanguageCode, string>]>([
    // Italian and Spanish tipo is GUY's word too (B75); French sorte and German Art are feminine.
    ['KIND_SORT',
      { en: 'the cat sees a kind.', it: 'il gatto vede un tipo.', fr: 'le chat voit une sorte.', de: 'der Kater sieht eine Art.', es: 'el gato ve un tipo.', ja: '猫は種類を見ます。', pt: 'o gato vê um tipo.' },
      { en: 'the cat sees the kinds.', it: 'il gatto vede i tipi.', fr: 'le chat voit les sortes.', de: 'der Kater sieht die Arten.', es: 'el gato ve los tipos.', ja: '猫は種類を見ます。', pt: 'o gato vê os tipos.' },
      { en: 'the big kind.', it: 'il grande tipo.', fr: 'la grande sorte.', de: 'die große Art.', es: 'el tipo grande.', ja: '大きい種類。', pt: 'o tipo grande.' }],
    // Portuguese mudança and German Änderung are feminine.
    ['CHANGE_NOUN',
      { en: 'the cat sees a change.', it: 'il gatto vede un cambiamento.', fr: 'le chat voit un changement.', de: 'der Kater sieht eine Änderung.', es: 'el gato ve un cambio.', ja: '猫は変化を見ます。', pt: 'o gato vê uma mudança.' },
      { en: 'the cat sees the changes.', it: 'il gatto vede i cambiamenti.', fr: 'le chat voit les changements.', de: 'der Kater sieht die Änderungen.', es: 'el gato ve los cambios.', ja: '猫は変化を見ます。', pt: 'o gato vê as mudanças.' },
      { en: 'the big change.', it: 'il grande cambiamento.', fr: 'le grand changement.', de: 'die große Änderung.', es: 'el cambio grande.', ja: '大きい変化。', pt: 'a mudança grande.' }],
    // French jeu takes -x; German Spiel is neuter.
    ['GAME',
      { en: 'the cat sees a game.', it: 'il gatto vede un gioco.', fr: 'le chat voit un jeu.', de: 'der Kater sieht ein Spiel.', es: 'el gato ve un juego.', ja: '猫はゲームを見ます。', pt: 'o gato vê um jogo.' },
      { en: 'the cat sees the games.', it: 'il gatto vede i giochi.', fr: 'le chat voit les jeux.', de: 'der Kater sieht die Spiele.', es: 'el gato ve los juegos.', ja: '猫はゲームを見ます。', pt: 'o gato vê os jogos.' },
      { en: 'the big game.', it: 'il grande gioco.', fr: 'le grand jeu.', de: 'das große Spiel.', es: 'el juego grande.', ja: '大きいゲーム。', pt: 'o jogo grande.' }],
    // German Fest, not the loan Party; neuter.
    ['PARTY_CELEBRATION',
      { en: 'the cat sees a party.', it: 'il gatto vede una festa.', fr: 'le chat voit une fête.', de: 'der Kater sieht ein Fest.', es: 'el gato ve una fiesta.', ja: '猫はパーティーを見ます。', pt: 'o gato vê uma festa.' },
      { en: 'the cat sees the parties.', it: 'il gatto vede le feste.', fr: 'le chat voit les fêtes.', de: 'der Kater sieht die Feste.', es: 'el gato ve las fiestas.', ja: '猫はパーティーを見ます。', pt: 'o gato vê as festas.' },
      { en: 'the big party.', it: 'la grande festa.', fr: 'la grande fête.', de: 'das große Fest.', es: 'la fiesta grande.', ja: '大きいパーティー。', pt: 'a festa grande.' }],
  ])('%s', (id, singular, plural, adjective) => {
    expect(sees(np(id, { definiteness: 'indefinite' }))).toEqual(singular);
    expect(sees(the(id, { number: 'plural' }))).toEqual(plural);
    expect(sayAll({ subject: the(id, { adjectives: ['BIG'] }) })).toEqual(adjective);
  });

  // Invariable everywhere, and counted: Japanese says it as its own counter (五パーセント).
  test('PERCENT: invariable, and counted', () => {
    expect(sayAll({ subject: np('PERCENT', { numeral: 5, definiteness: 'indefinite' }) })).toEqual({
      en: 'five percent.', it: 'cinque per cento.', fr: 'cinq pour cent.', de: 'fünf Prozent.', es: 'cinco por ciento.', ja: '五パーセント。', pt: 'cinco por cento.',
    });
    expect(sayAll(clause(the('CAT'), 'SEE', { directObject: the('PERCENT', { number: 'plural' }) }))).toEqual({
      en: 'the cat sees the percent.', it: 'il gatto vede i per cento.', fr: 'le chat voit les pour cent.', de: 'der Kater sieht die Prozent.',
      es: 'el gato ve los por ciento.', ja: '猫はパーセントを見ます。', pt: 'o gato vê os por cento.',
    });
  });
});

// ── B85: the glosses ──────────────────────────────────────────────────

describe('B85: the glosses', () => {
  test.each<[string, Record<LanguageCode, string>]>([
    // GIVE with money, as SELL is GIVE for money; GIVE's dative recipient.
    ['PAY', { en: 'to give money to a person.', it: 'dare denaro a una persona.', fr: "donner de l'argent à une personne.", de: 'einer Person Geld geben.', es: 'dar dinero a una persona.', ja: '人にお金をあげる。', pt: 'dar dinheiro a uma pessoa.' }],
    // The causative of HAVE, as PUT is of BE.
    ['PROVIDE', { en: 'to cause a person to have objects.', it: 'indurre una persona ad avere oggetti.', fr: 'induire une personne à avoir des objets.', de: 'eine Person veranlassen, Gegenstände zu haben.', es: 'inducir a una persona a tener objetos.', ja: '人が物体を持つようにする。', pt: 'induzir uma pessoa a ter objetos.' }],
    ['SPEND_MONEY', { en: 'to use money.', it: 'usare denaro.', fr: "utiliser de l'argent.", de: 'Geld verwenden.', es: 'usar dinero.', ja: 'お金を使う。', pt: 'usar dinheiro.' }],
    // STAY, with the duration `for` rather than `during` (期間の間に is heavy).
    ['SPEND_TIME', { en: 'to stay in a place for a period.', it: 'restare in un luogo per un periodo.', fr: 'rester dans un lieu pendant une période.', de: 'an einem Ort einen Zeitraum bleiben.', es: 'quedarse en un lugar durante un período.', ja: '場所に期間残る。', pt: 'ficar em um lugar por um período.' }],
    // STOP_DOING over HAVE, which keeps clear of NO_LONGER's infinitive defect (B84).
    ['LOSE', { en: 'to stop having objects.', it: 'smettere di avere oggetti.', fr: "arrêter d'avoir des objets.", de: 'aufhören, Gegenstände zu haben.', es: 'dejar de tener objetos.', ja: '物体を持つのをやめる。', pt: 'parar de ter objetos.' }],
    // Italian and Spanish say the superlative periphrastically (B85 reading 5, a choice).
    ['WIN', { en: 'to be best in a game.', it: 'essere il più buono in un gioco.', fr: 'être le meilleur dans un jeu.', de: 'in einem Spiel am besten sein.', es: 'ser el más bueno en un juego.', ja: 'ゲームで最も良い。', pt: 'ser o melhor em um jogo.' }],
    ['LOSE_GAME', { en: 'not to win in a game.', it: 'non vincere in un gioco.', fr: 'ne pas gagner dans un jeu.', de: 'nicht in einem Spiel gewinnen.', es: 'no ganar en un juego.', ja: 'ゲームで勝たない。', pt: 'não vencer em um jogo.' }],
    ['THANK', { en: 'to say good words to a person.', it: 'dire buone parole a una persona.', fr: 'dire de bons mots à une personne.', de: 'einer Person gute Wörter sagen.', es: 'decir palabras buenas a una persona.', ja: '人に良い単語を言う。', pt: 'dizer palavras boas a uma pessoa.' }],
    // P09-E43's, unchanged.
    ['ALLOW', { en: 'to let a person act.', it: 'lasciare una persona agire.', fr: 'laisser une personne agir.', de: 'eine Person handeln lassen.', es: 'dejar a una persona actuar.', ja: '人を行動させる。', pt: 'deixar uma pessoa agir.' }],
  ])('%s', (id, rendered) => {
    expect(definitionAll(id)).toEqual(rendered);
  });

  test('the two "lose" and the two "spend" tell each other apart in every language', () => {
    for (const [a, b] of [['LOSE', 'LOSE_GAME'], ['SPEND_MONEY', 'SPEND_TIME']]) {
      const x = definitionAll(a!);
      const y = definitionAll(b!);
      for (const language of Object.keys(x) as LanguageCode[]) expect(x[language]).not.toBe(y[language]);
    }
  });

  test('synonyms', () => {
    expect(['PROVIDE', 'SPEND_MONEY', 'SPEND_TIME', 'LOSE_GAME'].map((id) => seed(id)?.synonym))
      .toEqual(['supply', 'spend money', 'spend time', 'be defeated']);
  });
});

// ── B85: the words ────────────────────────────────────────────────────

// Present, simple past, resultative (a feminine subject, for the Romance agreement), future and
// negation, for every new verb with an object.
describe('B85: the verbs with an object: persons, tenses and aspects', () => {
  test.each<[string, string, Record<LanguageCode, string>[]]>([
    // pagare keeps its h (pagheranno); payer's mute ai (paie, paieront); bezahlen has no ge-.
    ['PAY', 'MONEY', [
      { en: 'the woman pays the money.', it: 'la donna paga il denaro.', fr: "la femme paie l'argent.", de: 'die Frau bezahlt das Geld.', es: 'la mujer paga el dinero.', ja: '女はお金を払います。', pt: 'a mulher paga o dinheiro.' },
      { en: 'the woman paid the money.', it: 'la donna pagò il denaro.', fr: "la femme paya l'argent.", de: 'die Frau bezahlte das Geld.', es: 'la mujer pagó el dinero.', ja: '女はお金を払いました。', pt: 'a mulher pagou o dinheiro.' },
      { en: 'the cat has paid the money.', it: 'la gatta ha pagato il denaro.', fr: "la chatte a payé l'argent.", de: 'die Katze hat das Geld bezahlt.', es: 'la gata ha pagado el dinero.', ja: '猫はお金を払いました。', pt: 'a gata pagou o dinheiro.' },
      { en: 'the men will pay the money.', it: 'gli uomini pagheranno il denaro.', fr: "les hommes paieront l'argent.", de: 'die Männer werden das Geld bezahlen.', es: 'los hombres pagarán el dinero.', ja: '男はお金を払います。', pt: 'os homens pagarão o dinheiro.' },
      { en: 'the man does not pay the money.', it: "l'uomo non paga il denaro.", fr: "l'homme ne paie pas l'argent.", de: 'der Mann bezahlt das Geld nicht.', es: 'el hombre no paga el dinero.', ja: '男はお金を払いません。', pt: 'o homem não paga o dinheiro.' },
    ]],
    // fornire's -isc-, fournir's second group.
    ['PROVIDE', 'BOOK', [
      { en: 'the woman provides the book.', it: 'la donna fornisce il libro.', fr: 'la femme fournit le livre.', de: 'die Frau liefert das Buch.', es: 'la mujer proporciona el libro.', ja: '女は本を提供します。', pt: 'a mulher fornece o livro.' },
      { en: 'the woman provided the book.', it: 'la donna fornì il libro.', fr: 'la femme fournit le livre.', de: 'die Frau lieferte das Buch.', es: 'la mujer proporcionó el libro.', ja: '女は本を提供しました。', pt: 'a mulher forneceu o livro.' },
      { en: 'the cat has provided the book.', it: 'la gatta ha fornito il libro.', fr: 'la chatte a fourni le livre.', de: 'die Katze hat das Buch geliefert.', es: 'la gata ha proporcionado el libro.', ja: '猫は本を提供しました。', pt: 'a gata forneceu o livro.' },
      { en: 'the men will provide the book.', it: 'gli uomini forniranno il libro.', fr: 'les hommes fourniront le livre.', de: 'die Männer werden das Buch liefern.', es: 'los hombres proporcionarán el libro.', ja: '男は本を提供します。', pt: 'os homens fornecerão o livro.' },
      { en: 'the man does not provide the book.', it: "l'uomo non fornisce il libro.", fr: "l'homme ne fournit pas le livre.", de: 'der Mann liefert das Buch nicht.', es: 'el hombre no proporciona el libro.', ja: '男は本を提供しません。', pt: 'o homem não fornece o livro.' },
    ]],
    // spendere is strong (spese, speso); ausgeben is separable.
    ['SPEND_MONEY', 'MONEY', [
      { en: 'the woman spends the money.', it: 'la donna spende il denaro.', fr: "la femme dépense l'argent.", de: 'die Frau gibt das Geld aus.', es: 'la mujer gasta el dinero.', ja: '女はお金を費やします。', pt: 'a mulher gasta o dinheiro.' },
      { en: 'the woman spent the money.', it: 'la donna spese il denaro.', fr: "la femme dépensa l'argent.", de: 'die Frau gab das Geld aus.', es: 'la mujer gastó el dinero.', ja: '女はお金を費やしました。', pt: 'a mulher gastou o dinheiro.' },
      { en: 'the cat has spent the money.', it: 'la gatta ha speso il denaro.', fr: "la chatte a dépensé l'argent.", de: 'die Katze hat das Geld ausgegeben.', es: 'la gata ha gastado el dinero.', ja: '猫はお金を費やしました。', pt: 'a gata gastou o dinheiro.' },
      { en: 'the men will spend the money.', it: 'gli uomini spenderanno il denaro.', fr: "les hommes dépenseront l'argent.", de: 'die Männer werden das Geld ausgeben.', es: 'los hombres gastarán el dinero.', ja: '男はお金を費やします。', pt: 'os homens gastarão o dinheiro.' },
      { en: 'the man does not spend the money.', it: "l'uomo non spende il denaro.", fr: "l'homme ne dépense pas l'argent.", de: 'der Mann gibt das Geld nicht aus.', es: 'el hombre no gasta el dinero.', ja: '男はお金を費やしません。', pt: 'o homem não gasta o dinheiro.' },
    ]],
    // Transitive, so passare and passer take HAVE; verbringen is inseparable.
    ['SPEND_TIME', 'DAY', [
      { en: 'the woman spends the day.', it: 'la donna passa il giorno.', fr: 'la femme passe le jour.', de: 'die Frau verbringt den Tag.', es: 'la mujer pasa el día.', ja: '女は日を過ごします。', pt: 'a mulher passa o dia.' },
      { en: 'the woman spent the day.', it: 'la donna passò il giorno.', fr: 'la femme passa le jour.', de: 'die Frau verbrachte den Tag.', es: 'la mujer pasó el día.', ja: '女は日を過ごしました。', pt: 'a mulher passou o dia.' },
      { en: 'the cat has spent the day.', it: 'la gatta ha passato il giorno.', fr: 'la chatte a passé le jour.', de: 'die Katze hat den Tag verbracht.', es: 'la gata ha pasado el día.', ja: '猫は日を過ごしました。', pt: 'a gata passou o dia.' },
      { en: 'the men will spend the day.', it: 'gli uomini passeranno il giorno.', fr: 'les hommes passeront le jour.', de: 'die Männer werden den Tag verbringen.', es: 'los hombres pasarán el día.', ja: '男は日を過ごします。', pt: 'os homens passarão o dia.' },
      { en: 'the man does not spend the day.', it: "l'uomo non passa il giorno.", fr: "l'homme ne passe pas le jour.", de: 'der Mann verbringt den Tag nicht.', es: 'el hombre no pasa el día.', ja: '男は日を過ごしません。', pt: 'o homem não passa o dia.' },
    ]],
    // The strong ones: persi / perso, perdit / perdu, verlor / verloren; pierde diphthongs.
    ['LOSE', 'BOOK', [
      { en: 'the woman loses the book.', it: 'la donna perde il libro.', fr: 'la femme perd le livre.', de: 'die Frau verliert das Buch.', es: 'la mujer pierde el libro.', ja: '女は本を失います。', pt: 'a mulher perde o livro.' },
      { en: 'the woman lost the book.', it: 'la donna perse il libro.', fr: 'la femme perdit le livre.', de: 'die Frau verlor das Buch.', es: 'la mujer perdió el libro.', ja: '女は本を失いました。', pt: 'a mulher perdeu o livro.' },
      { en: 'the cat has lost the book.', it: 'la gatta ha perso il libro.', fr: 'la chatte a perdu le livre.', de: 'die Katze hat das Buch verloren.', es: 'la gata ha perdido el libro.', ja: '猫は本を失いました。', pt: 'a gata perdeu o livro.' },
      { en: 'the men will lose the book.', it: 'gli uomini perderanno il libro.', fr: 'les hommes perdront le livre.', de: 'die Männer werden das Buch verlieren.', es: 'los hombres perderán el libro.', ja: '男は本を失います。', pt: 'os homens perderão o livro.' },
      { en: 'the man does not lose the book.', it: "l'uomo non perde il libro.", fr: "l'homme ne perd pas le livre.", de: 'der Mann verliert das Buch nicht.', es: 'el hombre no pierde el libro.', ja: '男は本を失いません。', pt: 'o homem não perde o livro.' },
    ]],
    // Japanese marks the game に (ゲームに勝ちます).
    ['WIN', 'GAME', [
      { en: 'the woman wins the game.', it: 'la donna vince il gioco.', fr: 'la femme gagne le jeu.', de: 'die Frau gewinnt das Spiel.', es: 'la mujer gana el juego.', ja: '女はゲームに勝ちます。', pt: 'a mulher vence o jogo.' },
      { en: 'the woman won the game.', it: 'la donna vinse il gioco.', fr: 'la femme gagna le jeu.', de: 'die Frau gewann das Spiel.', es: 'la mujer ganó el juego.', ja: '女はゲームに勝ちました。', pt: 'a mulher venceu o jogo.' },
      { en: 'the cat has won the game.', it: 'la gatta ha vinto il gioco.', fr: 'la chatte a gagné le jeu.', de: 'die Katze hat das Spiel gewonnen.', es: 'la gata ha ganado el juego.', ja: '猫はゲームに勝ちました。', pt: 'a gata venceu o jogo.' },
      { en: 'the men will win the game.', it: 'gli uomini vinceranno il gioco.', fr: 'les hommes gagneront le jeu.', de: 'die Männer werden das Spiel gewinnen.', es: 'los hombres ganarán el juego.', ja: '男はゲームに勝ちます。', pt: 'os homens vencerão o jogo.' },
      { en: 'the man does not win the game.', it: "l'uomo non vince il gioco.", fr: "l'homme ne gagne pas le jeu.", de: 'der Mann gewinnt das Spiel nicht.', es: 'el hombre no gana el juego.', ja: '男はゲームに勝ちません。', pt: 'o homem não vence o jogo.' },
    ]],
    // The one thanked: German dative, Japanese に, Portuguese a.
    ['THANK', 'CHILD', [
      { en: 'the woman thanks the child.', it: 'la donna ringrazia il bambino.', fr: "la femme remercie l'enfant.", de: 'die Frau dankt dem Kind.', es: 'la mujer agradece al niño.', ja: '女は子供に感謝します。', pt: 'a mulher agradece à criança.' },
      { en: 'the woman thanked the child.', it: 'la donna ringraziò il bambino.', fr: "la femme remercia l'enfant.", de: 'die Frau dankte dem Kind.', es: 'la mujer agradeció al niño.', ja: '女は子供に感謝しました。', pt: 'a mulher agradeceu à criança.' },
      { en: 'the cat has thanked the child.', it: 'la gatta ha ringraziato il bambino.', fr: "la chatte a remercié l'enfant.", de: 'die Katze hat dem Kind gedankt.', es: 'la gata ha agradecido al niño.', ja: '猫は子供に感謝しました。', pt: 'a gata agradeceu à criança.' },
      { en: 'the men will thank the child.', it: 'gli uomini ringrazieranno il bambino.', fr: "les hommes remercieront l'enfant.", de: 'die Männer werden dem Kind danken.', es: 'los hombres agradecerán al niño.', ja: '男は子供に感謝します。', pt: 'os homens agradecerão à criança.' },
      { en: 'the man does not thank the child.', it: "l'uomo non ringrazia il bambino.", fr: "l'homme ne remercie pas l'enfant.", de: 'der Mann dankt dem Kind nicht.', es: 'el hombre no agradece al niño.', ja: '男は子供に感謝しません。', pt: 'o homem não agradece à criança.' },
    ]],
  ])('%s', (verb, object, [present, past, resultative, future, negative]) => {
    expect(sayAll(clause(the('WOMAN'), verb, { directObject: the(object) }))).toEqual(present);
    expect(sayAll(clause(the('WOMAN'), verb, { directObject: the(object), verbPhrase: { tense: 'past' } }))).toEqual(past);
    expect(sayAll(clause(the('CAT', { gender: 'fem' }), verb, { directObject: the(object), verbPhrase: { aspect: 'resultative' } }))).toEqual(resultative);
    expect(sayAll(clause(the('MAN', { number: 'plural' }), verb, { directObject: the(object), verbPhrase: { tense: 'future' } }))).toEqual(future);
    expect(sayAll(clause(the('MAN'), verb, { directObject: the(object), verbPhrase: { negative: true } }))).toEqual(negative);
  });
});

describe('B85: without an object — LOSE_GAME, and WIN', () => {
  test.each<[string, Record<LanguageCode, string>[]]>([
    // LOSE's word in six languages, 負ける in Japanese.
    ['LOSE_GAME', [
      { en: 'the woman loses.', it: 'la donna perde.', fr: 'la femme perd.', de: 'die Frau verliert.', es: 'la mujer pierde.', ja: '女は負けます。', pt: 'a mulher perde.' },
      { en: 'the woman lost.', it: 'la donna perse.', fr: 'la femme perdit.', de: 'die Frau verlor.', es: 'la mujer perdió.', ja: '女は負けました。', pt: 'a mulher perdeu.' },
      { en: 'the cat has lost.', it: 'la gatta ha perso.', fr: 'la chatte a perdu.', de: 'die Katze hat verloren.', es: 'la gata ha perdido.', ja: '猫は負けました。', pt: 'a gata perdeu.' },
      { en: 'the men will lose.', it: 'gli uomini perderanno.', fr: 'les hommes perdront.', de: 'die Männer werden verlieren.', es: 'los hombres perderán.', ja: '男は負けます。', pt: 'os homens perderão.' },
      { en: 'the man does not lose.', it: "l'uomo non perde.", fr: "l'homme ne perd pas.", de: 'der Mann verliert nicht.', es: 'el hombre no pierde.', ja: '男は負けません。', pt: 'o homem não perde.' },
    ]],
    ['WIN', [
      { en: 'the woman wins.', it: 'la donna vince.', fr: 'la femme gagne.', de: 'die Frau gewinnt.', es: 'la mujer gana.', ja: '女は勝ちます。', pt: 'a mulher vence.' },
      { en: 'the woman won.', it: 'la donna vinse.', fr: 'la femme gagna.', de: 'die Frau gewann.', es: 'la mujer ganó.', ja: '女は勝ちました。', pt: 'a mulher venceu.' },
      { en: 'the cat has won.', it: 'la gatta ha vinto.', fr: 'la chatte a gagné.', de: 'die Katze hat gewonnen.', es: 'la gata ha ganado.', ja: '猫は勝ちました。', pt: 'a gata venceu.' },
      { en: 'the men will win.', it: 'gli uomini vinceranno.', fr: 'les hommes gagneront.', de: 'die Männer werden gewinnen.', es: 'los hombres ganarán.', ja: '男は勝ちます。', pt: 'os homens vencerão.' },
      { en: 'the man does not win.', it: "l'uomo non vince.", fr: "l'homme ne gagne pas.", de: 'der Mann gewinnt nicht.', es: 'el hombre no gana.', ja: '男は勝ちません。', pt: 'o homem não vence.' },
    ]],
  ])('%s', (verb, [present, past, resultative, future, negative]) => {
    expect(sayAll(clause(the('WOMAN'), verb))).toEqual(present);
    expect(sayAll(clause(the('WOMAN'), verb, { verbPhrase: { tense: 'past' } }))).toEqual(past);
    expect(sayAll(clause(the('CAT', { gender: 'fem' }), verb, { verbPhrase: { aspect: 'resultative' } }))).toEqual(resultative);
    expect(sayAll(clause(the('MAN', { number: 'plural' }), verb, { verbPhrase: { tense: 'future' } }))).toEqual(future);
    expect(sayAll(clause(the('MAN'), verb, { verbPhrase: { negative: true } }))).toEqual(negative);
  });
});

// ── B85: the frames each verb was seeded for ──────────────────────────

describe('B85: the frames', () => {
  test('PAY and PROVIDE: the recipient is GIVE\'s terminus, a German dative', () => {
    expect(sayAll(clause(the('MAN'), 'PAY', { directObject: the('MONEY'), complements: { terminus: { phrase: the('CHILD') } } }))).toEqual({
      en: 'the man pays the money to the child.', it: "l'uomo paga il denaro al bambino.", fr: "l'homme paie l'argent à l'enfant.",
      de: 'der Mann bezahlt dem Kind das Geld.', es: 'el hombre paga el dinero al niño.', ja: '男は子供にお金を払います。', pt: 'o homem paga o dinheiro à criança.',
    });
    expect(sayAll(clause(the('MAN'), 'PROVIDE', { directObject: the('BOOK'), complements: { terminus: { phrase: the('CHILD') } } }))).toMatchObject({
      de: 'der Mann liefert dem Kind das Buch.', ja: '男は子供に本を提供します。', pt: 'o homem fornece o livro à criança.',
    });
  });

  test('SPEND_TIME: the place', () => {
    expect(sayAll(clause(the('MAN'), 'SPEND_TIME', { directObject: the('DAY'), complements: { locative: { phrase: the('HOUSE') } } }))).toEqual({
      en: 'the man spends the day in the house.', it: "l'uomo passa il giorno nella casa.", fr: "l'homme passe le jour dans la maison.",
      de: 'der Mann verbringt den Tag im Haus.', es: 'el hombre pasa el día en la casa.', ja: '男は家で日を過ごします。', pt: 'o homem passa o dia na casa.',
    });
  });

  // Japanese marks the opponent に with both verbs (`opponent_prep`), where the generic is を相手に.
  test.each([
    ['WIN', { en: 'the cat wins against the dog.', it: 'il gatto vince contro il cane.', fr: 'le chat gagne contre le chien.', de: 'der Kater gewinnt gegen den Hund.', es: 'el gato gana contra el perro.', ja: '猫は犬に勝ちます。', pt: 'o gato vence contra o cão.' }],
    ['LOSE_GAME', { en: 'the cat loses against the dog.', it: 'il gatto perde contro il cane.', fr: 'le chat perd contre le chien.', de: 'der Kater verliert gegen den Hund.', es: 'el gato pierde contra el perro.', ja: '猫は犬に負けます。', pt: 'o gato perde contra o cão.' }],
  ])('%s: the opponent', (verb, rendered) => {
    expect(sayAll(clause(the('CAT'), verb, { complements: { opponent: { phrase: the('DOG') } } }))).toEqual(rendered);
  });

  test('LOSE_GAME: the game is the place', () => {
    expect(sayAll(clause(the('CAT'), 'LOSE_GAME', { complements: { locative: { phrase: the('GAME') } } }))).toEqual({
      en: 'the cat loses in the game.', it: 'il gatto perde nel gioco.', fr: 'le chat perd dans le jeu.', de: 'der Kater verliert im Spiel.',
      es: 'el gato pierde en el juego.', ja: '猫はゲームで負けます。', pt: 'o gato perde no jogo.',
    });
  });

  test('THANK: a pronoun object is German\'s dative and Japanese\'s に', () => {
    expect(sayAll(clause(the('MAN'), 'THANK', { directObject: { concept: 'THIRD_PERSON' } }))).toMatchObject({
      en: 'the man thanks him.', it: "l'uomo lo ringrazia.", fr: "l'homme le remercie.", de: 'der Mann dankt ihm.', ja: '男は彼に感謝します。',
    });
  });
});

describe('B85: the commands', () => {
  test('the affirmative', () => {
    expect(sayAll(command('PAY', { directObject: the('MONEY') }))).toEqual({
      en: 'pay the money.', it: 'paga il denaro.', fr: "paie l'argent.", de: 'bezahl das Geld.', es: 'paga el dinero.', ja: 'お金を払ってください。', pt: 'pague o dinheiro.',
    });
    // ausgeben's du command keeps geben's e→i, and the particle goes last.
    expect(sayAll(command('SPEND_MONEY', { directObject: the('MONEY') }))).toMatchObject({ de: 'gib das Geld aus.', it: 'spendi il denaro.', pt: 'gaste o dinheiro.' });
    expect(sayAll(command('PROVIDE', { directObject: the('BOOK') }))).toMatchObject({ it: 'fornisci il libro.', fr: 'fournis le livre.', pt: 'forneça o livro.' });
    expect(sayAll(command('LOSE', { directObject: the('BOOK') }))).toMatchObject({ es: 'pierde el libro.', pt: 'perca o livro.', de: 'verlier das Buch.' });
    expect(sayAll(command('THANK', { directObject: the('CHILD') }))).toMatchObject({ de: 'dank dem Kind.', ja: '子供に感謝してください。', pt: 'agradeça à criança.' });
  });

  // The subjunctive-based ones carry the 1st singular's stem: pagues (gu), pierdas, agradezcas, vença.
  test('the negative', () => {
    expect(sayAll(command('PAY', { directObject: the('MONEY'), verbPhrase: { negative: true } })))
      .toMatchObject({ es: 'no pagues el dinero.', it: 'non pagare il denaro.', ja: 'お金を払うな。' });
    expect(sayAll(command('LOSE', { directObject: the('BOOK'), verbPhrase: { negative: true } }))).toMatchObject({ es: 'no pierdas el libro.', pt: 'não perca o livro.' });
    expect(sayAll(command('THANK', { directObject: the('CHILD'), verbPhrase: { negative: true } }))).toMatchObject({ es: 'no agradezcas al niño.' });
    expect(sayAll(command('WIN', { directObject: the('GAME'), verbPhrase: { negative: true } }))).toMatchObject({ pt: 'não vença o jogo.', es: 'no ganes el juego.' });
  });
});

// ── Known bugs ───────────────────────────────────────────────────────

// Spanish agradecer's person is an indirect object: the clitic is "le", not "lo". The personal a
// hides it for a noun ("agradece al niño"), and a pronoun shows it. The Romance `object_case: 'dat'`
// is read under object control only (ALLOW's), so THANK does not carry it.
describe('known bugs: the Spanish dative clitic of agradecer', () => {
  // Now: "el hombre lo agradece." — Want: "el hombre le agradece."
  test.fails('THANK takes "le"', () => {
    expect(sayAll(clause(the('MAN'), 'THANK', { directObject: { concept: 'THIRD_PERSON' } })).es).toBe('el hombre le agradece.');
  });
});
