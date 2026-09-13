import { describe, expect, test } from 'vitest';
import type { ResolvedNounPhrase } from '../../types.js';
import {
  AILE, ANGE, ANIMAL, BON, CHAT, CHIEN, concept, CREATEUR, type Forms, FORT, GRAND, HEUREUX, HOMME, INTERESSANT, LIVRE, MAISON,
  MANGER, nounModifier, np, PERE, PETIT, PHRASE, SEMANTIQUE, SOURIS, TRISTE, VIEUX, vp,
} from './fr.fixtures.js';
import { artFor } from './artFor.js';
import { renderNP } from './renderNP.js';

const BATEAU: Forms = { base: 'bateau', plural: 'bateaux', gender: 'masc', count: 'singular' };
const VOILE: Forms = { base: 'voile', plural: 'voiles', gender: 'fem', count: 'singular' };
const PIERRE: Forms = { base: 'pierre', plural: 'pierres', gender: 'fem', count: 'singular', uncountable: '1' };
const OBJET: Forms = { base: 'objet', plural: 'objets', gender: 'masc', count: 'singular' };

/** The ordinary subject/object head: the determiner the phrase's own forms carry. */
const withArticle = (phrase: ResolvedNounPhrase) => renderNP(phrase, (plural, lead) => artFor(phrase.head.forms, plural, lead));

describe('renderNP', () => {
  test('hands the head the plurality and the word that follows it', () => {
    const show = (plural: boolean, lead: string) => `[${plural ? 'pl' : 'sg'} ${lead}]`;
    expect(renderNP(np(CHAT), show)).toBe('[sg chat] chat');
    expect(renderNP(np(CHAT, { number: 'plural' }, { adjectives: [concept(GRAND, 'BIG')] }), show)).toBe('[pl grands] grands chats');
  });

  test('joins the head to the noun with no space after an elided article', () => {
    expect(withArticle(np(CHAT))).toBe('le chat');
    expect(withArticle(np(HOMME))).toBe("l'homme");
    expect(renderNP(np(CHAT), () => '')).toBe('chat');
  });

  test('reads plurality off number, falling back to count', () => {
    expect(withArticle(np(ANIMAL, { number: 'plural' }))).toBe('les animaux');
    expect(withArticle(np(CHAT, { count: 'plural' }))).toBe('les chats');
    expect(withArticle(np(CHAT, { count: 'plural', number: 'singular' }))).toBe('le chat');
  });

  test('the article is chosen on a prenominal adjective, not the noun', () => {
    expect(withArticle(np(ANGE))).toBe("l'ange");
    expect(withArticle(np(ANGE, {}, { adjectives: [concept(PETIT, 'SMALL')] }))).toBe('le petit ange');
  });

  test('the BAGS adjectives precede the noun and the rest follow, all agreeing with it', () => {
    const cats = np(CHAT, { gender: 'fem', base: 'chatte', plural: 'chattes', number: 'plural' }, {
      adjectives: [concept(GRAND, 'BIG'), concept(VIEUX, 'OLD'), concept(HEUREUX, 'HAPPY')],
    });
    expect(withArticle(cats)).toBe('les grandes vieilles chattes heureuses');
  });

  test('several postnominal adjectives are listed with commas and a final et', () => {
    expect(withArticle(np(CHAT, {}, { adjectives: [concept(FORT, 'STRONG'), concept(HEUREUX, 'HAPPY')] }))).toBe('le chat fort et heureux');
    expect(withArticle(np(CHAT, {}, { adjectives: [concept(FORT, 'STRONG'), concept(HEUREUX, 'HAPPY'), concept(TRISTE, 'SAD')] })))
      .toBe('le chat fort, heureux et triste');
  });

  test('a compared adjective follows the noun, and a superlative repeats the article', () => {
    expect(withArticle(np(CHAT, { definiteness: 'indefinite' }, { adjectives: [concept({ ...GRAND, degree: 'more' }, 'BIG')] })))
      .toBe('un chat plus grand');
    expect(withArticle(np(CHAT, {}, { adjectives: [concept({ ...GRAND, degree: 'most' }, 'BIG')] }))).toBe('le chat le plus grand');
    expect(withArticle(np(SOURIS, {}, { adjectives: [concept({ ...GRAND, degree: 'least' }, 'BIG')] }))).toBe('la souris la moins grande');
    expect(withArticle(np(CHAT, {}, { adjectives: [concept({ ...BON, degree: 'most' }, 'GOOD')] }))).toBe('le chat le meilleur');
  });

  test('a pronominal possessor replaces the head, agreeing with the possessed noun', () => {
    const his = { kind: 'pronominal', person: '3', number: 'singular' } as const;
    expect(renderNP(np(CHIEN, {}, { possessor: his }), () => 'le')).toBe('son chien');
    expect(renderNP(np(MAISON, {}, { possessor: his }), () => 'la')).toBe('sa maison');
    expect(renderNP(np(LIVRE, { number: 'plural' }, { possessor: his }), () => 'les')).toBe('ses livres');
    expect(withArticle(np(MAISON, {}, { possessor: { kind: 'pronominal', person: '1', number: 'plural' } }))).toBe('notre maison');
    expect(withArticle(np(LIVRE, { number: 'plural' }, { possessor: { kind: 'pronominal', person: '3', number: 'plural' } }))).toBe('leurs livres');
  });

  test('mon, ton and son stand in before a vowel-initial feminine, judged on the word that follows', () => {
    const my = { kind: 'pronominal', person: '1', number: 'singular' } as const;
    expect(withArticle(np(AILE, {}, { possessor: my }))).toBe('mon aile');
    expect(withArticle(np(AILE, {}, { possessor: my, adjectives: [concept(GRAND, 'BIG')] }))).toBe('ma grande aile');
  });

  test('an attributive noun follows bare, under the preposition its relation selects', () => {
    expect(withArticle(np(BATEAU, {}, { nounModifiers: [nounModifier(VOILE)] }))).toBe('le bateau à voile');
    expect(withArticle(np(MAISON, {}, { nounModifiers: [nounModifier(PIERRE, [], 'material')] }))).toBe('la maison de pierre');
    expect(withArticle(np(CREATEUR, {}, { nounModifiers: [nounModifier({ ...OBJET, number: 'plural' }, [], 'purpose')] })))
      .toBe("le créateur d'objets");
  });

  test('an attributive noun takes its own number and its adjectives agree with it', () => {
    const phrases = nounModifier({ ...PHRASE, number: 'plural' }, [concept(SEMANTIQUE)], 'purpose');
    expect(withArticle(np(CREATEUR, {}, { nounModifiers: [phrases] }))).toBe('le créateur de phrases sémantiques');
  });

  test('a noun possessor trails under de, fused with its own article', () => {
    expect(withArticle(np(LIVRE, {}, { possessor: np(CHAT) }))).toBe('le livre du chat');
    expect(withArticle(np(LIVRE, {}, { possessor: np(SOURIS) }))).toBe('le livre de la souris');
    expect(withArticle(np(LIVRE, {}, { possessor: np(HOMME) }))).toBe("le livre de l'homme");
    expect(withArticle(np(LIVRE, {}, { possessor: np(CHAT, { number: 'plural' }, { adjectives: [concept(GRAND, 'BIG')] }) })))
      .toBe('le livre des grands chats');
    expect(withArticle(np(LIVRE, {}, { possessor: np(PERE, {}, { possessor: np(CHAT) }) }))).toBe('le livre du père du chat');
  });

  test('postnominal adjectives, attributive nouns, the possessor and the relative clause come in that order', () => {
    expect(withArticle(np(LIVRE, {}, { adjectives: [concept(INTERESSANT)], possessor: np(CHAT) }))).toBe('le livre intéressant du chat');
    const relative = { headRole: 'subject' as const, verbPhrase: vp(MANGER) };
    expect(withArticle(np(CHAT, {}, { relative }))).toBe('le chat qui mange');
    expect(withArticle(np(CHAT, {}, { adjectives: [concept(FORT, 'STRONG')], relative }))).toBe('le chat fort qui mange');
  });
});
