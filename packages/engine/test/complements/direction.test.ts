import { describe, expect, test } from 'vitest';
import type { NounElement, NounPhrase } from '@signi/shared';
import { clause, np, sayAll } from '../harness.js';

// The goal of a motion — where it is headed. The adposition is chosen by the goal's ANIMACY:
// Italian goes *a* a place but *da* a person, and Iberian Romance and French likewise switch.
const goTo = (goal: NounElement) =>
  sayAll(clause(np('CAT'), 'GO', { complements: { direction: { phrase: goal } } }));

const place = (extra: Partial<NounPhrase> = {}) => np('MARKET', extra);
const person = (extra: Partial<NounPhrase> = {}) => np('BOY', extra);

describe('direction', () => {
  test('an inanimate goal', () => {
    expect(goTo(place())).toMatchObject({
      en: 'the cat goes to the market.',
      it: 'il gatto va al mercato.', // a + il
      fr: 'le chat va au marché.',
      de: 'der Kater geht zum Markt.',
      ja: '猫は市場へ行きます。',
    });
  });

  test('an animate goal selects a different adposition', () => {
    expect(goTo(person())).toMatchObject({
      it: 'il gatto va dal ragazzo.', // da, not a
      fr: 'le chat va vers le garçon.', // vers, not à
      es: 'el gato va hacia el niño.', // hacia, not a
      pt: 'o gato vai para o menino.',
    });
  });
});

// A plural goal. What is worth holding here is that the two choices are INDEPENDENT: animacy
// picks the preposition, number picks the article, and each language then fuses the two.
describe('direction: a plural goal', () => {
  test('an inanimate plural goal fuses the preposition with the plural article', () => {
    expect(goTo(place({ number: 'plural' }))).toEqual({
      en: 'the cat goes to the markets.',
      it: 'il gatto va ai mercati.', // a + i = ai
      fr: 'le chat va aux marchés.', // à + les = aux
      es: 'el gato va a los mercados.', // no fusion in the plural
      pt: 'o gato vai aos mercados.', // a + os = aos
      de: 'der Kater geht zu den Märkten.', // dative plural: den, and the noun takes -n
      ja: '猫は市場へ行きます。', // Japanese does not mark number
    });
  });

  test('an animate plural goal keeps the animate preposition', () => {
    // The animacy switch survives pluralisation: Italian fuses *da* with the plural article
    // (da + i = dai), it does not fall back to *a*.
    expect(goTo(person({ number: 'plural' }))).toEqual({
      en: 'the cat goes to the boys.',
      it: 'il gatto va dai ragazzi.', // dai, not ai
      fr: 'le chat va vers les garçons.', // vers does not fuse
      es: 'el gato va hacia los niños.',
      pt: 'o gato vai para os meninos.',
      de: 'der Kater geht zu den Jungen.',
      ja: '猫は男の子へ行きます。',
    });
  });

  test('an indefinite plural goal, of each kind', () => {
    expect(goTo(place({ number: 'plural', definiteness: 'indefinite' }))).toMatchObject({
      en: 'the cat goes to markets.',
      it: 'il gatto va a mercati.',
      fr: 'le chat va à des marchés.', // the partitive survives the preposition
      de: 'der Kater geht zu Märkten.',
    });

    expect(goTo(person({ number: 'plural', definiteness: 'indefinite' }))).toMatchObject({
      it: 'il gatto va da ragazzi.', // still da — bare, so nothing to fuse with
      fr: 'le chat va vers des garçons.',
      es: 'el gato va hacia unos niños.',
    });
  });

  test('a plural goal carries its own adjectives, which agree with it', () => {
    expect(goTo(person({ number: 'plural', adjectives: ['BIG'] }))).toMatchObject({
      en: 'the cat goes to the big boys.',
      it: 'il gatto va dai grandi ragazzi.',
      fr: 'le chat va vers les grands garçons.',
      es: 'el gato va hacia los niños grandes.',
      de: 'der Kater geht zu den großen Jungen.',
    });
  });

  test('goals coordinate, and each conjunct repeats the preposition', () => {
    // Romance repeats the fused preposition per conjunct — "al mercato E ALLA casa" — because
    // each conjunct carries its own article for it to fuse with.
    expect(goTo({ conjuncts: [place(), np('HOUSE')], conjunction: 'and' })).toMatchObject({
      en: 'the cat goes to the market and the house.',
      it: 'il gatto va al mercato e alla casa.',
      fr: 'le chat va au marché et à la maison.',
      de: 'der Kater geht zum Markt und zum Haus.',
      ja: '猫は市場と家へ行きます。',
    });

    // And the animate preposition is repeated in its turn. Italian elides the second one against
    // the vowel of "uomo" (da + l' = dall'). French should do the same against "homme" and does
    // not — see the h-muet bug in nounPhrase.test.ts — so it is left unasserted here.
    expect(goTo({ conjuncts: [person(), np('MAN')], conjunction: 'and' })).toMatchObject({
      it: "il gatto va dal ragazzo e dall'uomo.",
      es: 'el gato va hacia el niño y hacia el hombre.',
    });
  });
});

// GO licenses the whole spatial family at once (locative, direction, source, route — see
// motion.ts), so a single clause can carry several. What is worth pinning is that they compose
// without interfering: each keeps the adposition it renders in isolation, and they surface in the
// fixed COMPLEMENT_RENDER_ORDER — source, then direction, then route, then locative — regardless of
// the order the plan lists them in.
const goWith = (complements: Record<string, unknown>) =>
  sayAll(clause(np('CAT'), 'GO', { complements }));

describe('direction: combined with the other directionals', () => {
  test('source + direction — "from X to Y", each with its own adposition', () => {
    expect(goWith({
      source: { phrase: place() },
      direction: { phrase: np('HOUSE') },
    })).toEqual({
      en: 'the cat goes from the market to the house.',
      it: 'il gatto va dal mercato alla casa.', // da+il=dal, a+la=alla
      fr: 'le chat va du marché à la maison.', // de+le=du
      es: 'el gato va del mercado a la casa.',
      pt: 'o gato vai do mercado à casa.', // a+a=à
      de: 'der Kater geht aus dem Markt zum Haus.', // aus (source) + zu (direction)
      ja: '猫は市場から家へ行きます。', // から (source) … へ (direction)
    });
  });

  test('direction + route — the goal and the path it takes to get there', () => {
    expect(goWith({
      direction: { phrase: place() },
      route: { phrase: np('HOUSE'), specifiers: [{ kind: 'path', value: 'through' }] },
    })).toEqual({
      en: 'the cat goes to the market through the house.',
      it: 'il gatto va al mercato attraverso la casa.',
      fr: 'le chat va au marché à travers la maison.',
      es: 'el gato va al mercado por la casa.',
      pt: 'o gato vai ao mercado pela casa.', // por+a=pela
      de: 'der Kater geht zum Markt durch das Haus.', // durch governs the accusative: das Haus
      ja: '猫は市場へ家を行きます。', // へ (direction) … を (traversed path)
    });
  });

  test('source + direction + route — the full path "from X through Z to Y"', () => {
    expect(goWith({
      source: { phrase: np('HOUSE') },
      direction: { phrase: place() },
      route: { phrase: np('ANGEL'), specifiers: [{ kind: 'path', value: 'over' }] },
    })).toEqual({
      en: 'the cat goes from the house to the market over the angel.',
      it: "il gatto va dalla casa al mercato sopra l'angelo.",
      fr: "le chat va de la maison au marché au-dessus de l'ange.",
      es: 'el gato va de la casa al mercado por encima del ángel.',
      pt: 'o gato vai da casa ao mercado por cima do anjo.',
      de: 'der Kater geht aus dem Haus zum Markt über dem Engel.', // über is two-way: dative here
      ja: '猫は家から市場へ天使の上を行きます。',
    });
  });

  test('all four directionals at once — source, direction, route, locative', () => {
    // Every adposition each complement uses in isolation survives the pile-up, and they appear in
    // COMPLEMENT_RENDER_ORDER: source ("from the house"), direction ("to the market"), route
    // ("through the market"), locative ("in the house") — the last where the going happens.
    expect(goWith({
      locative: { phrase: np('HOUSE') },
      route: { phrase: place(), specifiers: [{ kind: 'path', value: 'through' }] },
      direction: { phrase: place() },
      source: { phrase: np('HOUSE') },
    })).toEqual({
      en: 'the cat goes from the house to the market through the market in the house.',
      it: 'il gatto va dalla casa al mercato attraverso il mercato nella casa.',
      fr: 'le chat va de la maison au marché à travers le marché dans la maison.',
      es: 'el gato va de la casa al mercado por el mercado en la casa.',
      pt: 'o gato vai da casa ao mercado pelo mercado na casa.',
      de: 'der Kater geht aus dem Haus zum Markt durch den Markt im Haus.',
      ja: '猫は家から市場へ市場を家で行きます。',
    });
  });

  test('the render order is fixed, not the order the plan lists the complements in', () => {
    // Two plans that disagree only on key order produce the identical sentence, because the engine
    // walks COMPLEMENT_RENDER_ORDER, not object insertion order.
    const listedOneWay = goWith({
      source: { phrase: np('HOUSE') },
      direction: { phrase: place() },
    });
    const listedReversed = goWith({
      direction: { phrase: place() },
      source: { phrase: np('HOUSE') },
    });
    expect(listedReversed).toEqual(listedOneWay);
    expect(listedOneWay).toMatchObject({
      en: 'the cat goes from the house to the market.',
      it: 'il gatto va dalla casa al mercato.',
      ja: '猫は家から市場へ行きます。',
    });
  });
});

// COME licenses the same spatial family as GO (locative, direction, source, route — see
// intransitive.ts), and the marking belongs to the complement, not the verb: swapping the verb
// only swaps the verb form (comes / viene / vient / vem / kommt / 来ます), every adposition and its
// render order is unchanged from GO above. That verb-independence is the point of this block.
const comeWith = (complements: Record<string, unknown>) =>
  sayAll(clause(np('CAT'), 'COME', { complements }));

describe('COME takes the combined directionals the same way GO does', () => {
  test('source + direction', () => {
    expect(comeWith({
      source: { phrase: np('HOUSE') },
      direction: { phrase: place() },
    })).toEqual({
      en: 'the cat comes from the house to the market.',
      it: 'il gatto viene dalla casa al mercato.',
      fr: 'le chat vient de la maison au marché.',
      es: 'el gato viene de la casa al mercado.',
      pt: 'o gato vem da casa ao mercado.',
      de: 'der Kater kommt aus dem Haus zum Markt.',
      ja: '猫は家から市場へ来ます。',
    });
  });

  test('direction + route', () => {
    expect(comeWith({
      direction: { phrase: place() },
      route: { phrase: np('HOUSE'), specifiers: [{ kind: 'path', value: 'through' }] },
    })).toEqual({
      en: 'the cat comes to the market through the house.',
      it: 'il gatto viene al mercato attraverso la casa.',
      fr: 'le chat vient au marché à travers la maison.',
      es: 'el gato viene al mercado por la casa.',
      pt: 'o gato vem ao mercado pela casa.',
      de: 'der Kater kommt zum Markt durch das Haus.', // durch → accusative das Haus
      ja: '猫は市場へ家を来ます。',
    });
  });

  test('all four directionals at once — only the verb form differs from GO', () => {
    expect(comeWith({
      source: { phrase: np('HOUSE') },
      direction: { phrase: place() },
      route: { phrase: place(), specifiers: [{ kind: 'path', value: 'through' }] },
      locative: { phrase: np('HOUSE') },
    })).toEqual({
      en: 'the cat comes from the house to the market through the market in the house.',
      it: 'il gatto viene dalla casa al mercato attraverso il mercato nella casa.',
      fr: 'le chat vient de la maison au marché à travers le marché dans la maison.',
      es: 'el gato viene de la casa al mercado por el mercado en la casa.',
      pt: 'o gato vem da casa ao mercado pelo mercado na casa.',
      de: 'der Kater kommt aus dem Haus zum Markt durch den Markt im Haus.',
      ja: '猫は家から市場へ市場を家で来ます。',
    });
  });
});

// The continent article-drop (see the known-bugs block below: Italian/French say "in"/"en" with no
// article for a continent GOAL) is not a GO-only rule — it fires on COME too, because it keys off
// the goal's hypernym, not the verb. And it is a GOAL phenomenon: the same continent as a SOURCE
// keeps its article ("viene dall'Europa"), so a "from one continent to another" clause shows both
// treatments of the same word side by side.
describe('COME to a continent — the article-dropping goal', () => {
  test('Italian/French drop the article for a continent goal, on COME as on GO', () => {
    expect(comeWith({ direction: { phrase: np('EUROPE') } })).toMatchObject({
      en: 'the cat comes to Europe.',
      it: 'il gatto viene in Europa.', // in, no article
      fr: 'le chat vient en Europe.', // en, no article
      ja: '猫はヨーロッパへ来ます。',
    });
  });

  test('the drop covers the other continents, compound names included', () => {
    expect(comeWith({ direction: { phrase: np('ANTARCTICA') } })).toMatchObject({
      it: 'il gatto viene in Antartide.', fr: 'le chat vient en Antarctique.',
    });
    expect(comeWith({ direction: { phrase: np('AFRICA') } })).toMatchObject({
      it: 'il gatto viene in Africa.', fr: 'le chat vient en Afrique.',
    });
    expect(comeWith({ direction: { phrase: np('NORTH_AMERICA') } })).toMatchObject({
      it: 'il gatto viene in America del Nord.', fr: 'le chat vient en Amérique du Nord.',
    });
  });

  test('a continent SOURCE keeps its article — the drop is goal-only', () => {
    // Contrast the goal above: as an origin the continent behaves like any other proper noun,
    // so Italian fuses and elides da + l' = dall', and French keeps "de l'".
    expect(comeWith({ source: { phrase: np('EUROPE') } })).toMatchObject({
      en: 'the cat comes from Europe.',
      it: "il gatto viene dall'Europa.",
      fr: "le chat vient de l'Europe.",
      de: 'der Kater kommt aus Europa.',
      ja: '猫はヨーロッパから来ます。',
    });
  });

  test('from one continent to another — the article kept on the source, dropped on the goal', () => {
    expect(comeWith({
      source: { phrase: np('AFRICA') },
      direction: { phrase: np('EUROPE') },
    })).toMatchObject({
      en: 'the cat comes from Africa to Europe.',
      it: "il gatto viene dall'Africa in Europa.", // dall' (source, kept) … in (goal, dropped)
      fr: "le chat vient de l'Afrique en Europe.",
      de: 'der Kater kommt aus Afrika zu Europa.',
      ja: '猫はアフリカからヨーロッパへ来ます。',
    });
  });
});

describe('known bugs: direction', () => {
  // Junge is a weak masculine (n-declension) noun: every case but the nominative singular is
  // "Jungen". The engine misses it — but ONLY in the singular, because the plural happens to be
  // "Jungen" anyway, so "zu den Jungen" above comes out right by coincidence. That is worth
  // knowing: the plural test passing is not evidence the declension works.
  //
  // Fixing it needs a weak-noun class in the corpus (Junge, Herr, Mensch, Student…), since which
  // nouns decline this way is lexical and cannot be derived.
  test('German should decline the weak masculine: "zum Jungen", not "zum Junge"', () => {
    expect(goTo(person())).toMatchObject({ de: 'der Kater geht zum Jungen.' });
  });

  // The weak-noun class generalises. It is a lexical property of the noun (forms.weak), so it
  // fires for every weak masculine, not just Junge, and in every oblique case — the accusative
  // direct object and the "von"-dative possessor as much as the dative goal — while leaving the
  // nominative singular and the (already -n) plural alone.
  test('German declines the other weak masculines too (Ochse, Bursche)', () => {
    expect(goTo(np('OX')).de).toBe('der Kater geht zum Ochsen.');
    expect(goTo(np('YOUNG_MAN')).de).toBe('der Kater geht zum Burschen.');
  });

  test('German declines a weak masculine in the accusative and as a possessor', () => {
    // Accusative direct object: "den Jungen", not "den Junge".
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('BOY') })).de)
      .toBe('der Kater sieht den Jungen.');
    // Possessor via the colloquial "von" + dative: "vom Jungen".
    expect(sayAll(clause(np('BOOK', { possessor: np('BOY') }), 'BURN')).de)
      .toBe('das Buch vom Jungen brennt.');
  });

  test('German leaves the nominative singular and the plural of a weak noun alone', () => {
    // Nominative subject keeps the bare stem; the plural already ends in -n, so it is unchanged.
    expect(sayAll(clause(np('BOY'), 'RUN')).de).toBe('der Junge läuft.');
    expect(goTo(np('BOY', { number: 'plural' })).de).toBe('der Kater geht zu den Jungen.');
  });

  // A continent goal is a proper noun that fixes its own article (correct as a subject:
  // "l'Antartide è fredda"), but a continent takes a DIFFERENT goal preposition in Italian and
  // French — *in* / *en*, and with no article: "va in Antartide", "va en Antarctique". The engine
  // used to apply the default inanimate-goal adposition (*a* / *à*) and keep the proper-noun
  // article, emitting "va all'Antartide" / "va à l'Antarctique" — wrong on both counts. It now keys
  // the adposition off the goal's hypernym (ANTARCTICA isA CONTINENT, threaded into the noun forms).
  // Spanish/Portuguese genuinely keep the article ("a la Antártida", "à Antártida") and are right;
  // German "zur Antarktis" is acceptable.
  test('Italian/French select "in"/"en" (no article) for a continent goal', () => {
    expect(goTo(np('ANTARCTICA'))).toMatchObject({
      it: 'il gatto va in Antartide.',
      fr: 'le chat va en Antarctique.',
    });
  });

  // Every continent goal drops the article the same way, including a compound name.
  test('the continent-goal preposition covers the other continents', () => {
    expect(goTo(np('EUROPE'))).toMatchObject({
      it: 'il gatto va in Europa.', fr: 'le chat va en Europe.',
    });
    expect(goTo(np('AFRICA'))).toMatchObject({
      it: 'il gatto va in Africa.', fr: 'le chat va en Afrique.',
    });
    expect(goTo(np('NORTH_AMERICA'))).toMatchObject({
      it: 'il gatto va in America del Nord.', fr: 'le chat va en Amérique du Nord.',
    });
  });

  // Spanish and Portuguese genuinely keep the article for a continent goal, and German articles this
  // one continent ("zur Antarktis") — none is touched by the Italian/French fix.
  test('Spanish, Portuguese and German keep their continent-goal forms', () => {
    expect(goTo(np('ANTARCTICA'))).toMatchObject({
      es: 'el gato va a la Antártida.',
      pt: 'o gato vai à Antártida.',
      de: 'der Kater geht zur Antarktis.',
    });
  });

  // Regression: a common-noun place goal still takes "a" + article ("al mercato" / "au marché"), and
  // an animate goal still takes "da" / "vers" — only a continent switches to "in" / "en".
  test('Italian/French leave the common-place and animate goals untouched', () => {
    expect(goTo(place())).toMatchObject({ it: 'il gatto va al mercato.', fr: 'le chat va au marché.' });
    expect(goTo(person())).toMatchObject({ it: 'il gatto va dal ragazzo.', fr: 'le chat va vers le garçon.' });
  });
});

// A39. Spanish drops the definite article before most continent names ("va a Europa", "viene de
// África"), keeping it only for the lexically-articled few — "la Antártida", "los Estados Unidos".
// The locative already gets this right ("corre en Europa", the A29 fix) because it routes the proper
// noun through `artFor`, which honors the `takes_article` flag. But the `direction` (goal) and
// `source` heads use `aDet`/`deDet`, whose definite branch (`datPrep`/`dePrep`) calls `defArticle`
// UNCONDITIONALLY — so every continent is articled: "a la Europa", "de la África". Antártida
// (takes_article=1) then comes out right BY COINCIDENCE, and it is the one continent A31's Spanish
// control happened to check — masking the miss on all the others. Same coincidence shape as the
// German weak-noun plural above.
describe('known bugs: Spanish over-articles a continent goal/source', () => {
  test.fails('a continent goal drops the article: "a Europa", not "a la Europa"', () => {
    expect(goTo(np('EUROPE')).es).toBe('el gato va a Europa.');
    expect(goTo(np('AFRICA')).es).toBe('el gato va a África.');
    expect(goTo(np('NORTH_AMERICA')).es).toBe('el gato va a América del Norte.');
  });

  test.fails('a continent source drops it too: "de Europa" / "de África a Europa"', () => {
    expect(comeWith({ source: { phrase: np('EUROPE') } }).es).toBe('el gato viene de Europa.');
    expect(comeWith({ source: { phrase: np('AFRICA') }, direction: { phrase: np('EUROPE') } }).es)
      .toBe('el gato viene de África a Europa.');
  });

  // Control — passes today and must keep passing after the fix: Antártida is lexically articled
  // (takes_article=1), so it KEEPS the article under either treatment. Its passing today is the
  // coincidence that hid the bug, not evidence the rule works.
  test('Antártida keeps its article, as a goal and as a source', () => {
    expect(goTo(np('ANTARCTICA')).es).toBe('el gato va a la Antártida.');
    expect(comeWith({ source: { phrase: np('ANTARCTICA') } }).es).toBe('el gato viene de la Antártida.');
  });
});
