import { describe, expect, test } from 'vitest';
import type { LanguageCode, NounPhrase, ReadyLanguageCode } from '@signi/shared';
import { READY_LANGUAGES } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';
import { isPreviewLanguage } from '@signi/shared';

// Localization C24's relational, order and time adjectives and B54's relational nine: the glosses
// they ship on the headless relative (`relativeGloss.ts`) and on `dimGloss`, and the fifteen words
// those glosses stand on. The words are pinned here, not in the shared exhaustive tables, so the
// three lanes that seeded words the same day do not edit the same rows.

/** Render a seeded concept's own `definition` plan (its picker tooltip) into every language. */
function definitionAll(id: string): Record<ReadyLanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).filter((t) => !isPreviewLanguage(t.language)).map((t) => [t.language, t.text]),
  ) as Record<ReadyLanguageCode, string>;
}

const said = (concept: string, extra: Partial<NounPhrase> = {}) => sayAll({ subject: np(concept, extra) });
const the = (concept: string, extra: Partial<NounPhrase> = {}) => np(concept, { definiteness: 'definite', ...extra });

// ── The glosses ───────────────────────────────────────────────────────

describe('the relational adjectives are glossed in every language', () => {
  test.each<[string, Record<ReadyLanguageCode, string>]>([
    // The distance scale, `measure` as TEMPERATURE's is. SMALL is its low pole: LOW would say a
    // height ("at low distance", it "a distanza bassa").
    ['NEAR', { en: 'at small distance.', it: 'a piccola distanza.', fr: 'à petite distance.', de: 'bei kleiner Entfernung.', es: 'a distancia pequeña.', ja: '距離が小さい。', pt: 'a distância pequena.' }],
    ['FAR', { en: 'at great distance.', it: 'a grande distanza.', fr: 'à grande distance.', de: 'bei großer Entfernung.', es: 'a distancia grande.', ja: '距離が大きい。', pt: 'a distância grande.' }],
    // The genitive relative: German's "dessen" is Gegenstand's, the unspoken antecedent's.
    ['ROUND', { en: 'whose shape is a circle.', it: 'la cui forma è un cerchio.', fr: 'dont la forme est un cercle.', de: 'dessen Form ein Kreis ist.', es: 'cuya forma es un círculo.', ja: '形が円である。', pt: 'cuja forma é um círculo.' }],
    // The passive state: the participle agrees with the masculine antecedent in every Romance language.
    // SHARP is what it does, once CUT no longer says "sharp" (localization C24's integration pass).
    ['SHARP', { en: 'that cuts well.', it: 'che taglia bene.', fr: 'qui coupe bien.', de: 'der gut schneidet.', es: 'que corta bien.', ja: 'よく切る。', pt: 'que corta bem.' }],
    ['WHOLE', { en: 'that has not been divided.', it: 'che non è stato diviso.', fr: "qui n'a pas été divisé.", de: 'der nicht geteilt worden ist.', es: 'que no ha sido dividido.', ja: '分けられていない。', pt: 'que não foi dividido.' }],
    ['NEW', { en: 'that has been made recently.', it: 'che è stato fatto di recente.', fr: 'qui a été fait récemment.', de: 'der kürzlich gemacht worden ist.', es: 'que ha sido hecho recientemente.', ja: '最近作られた。', pt: 'que foi feito recentemente.' }],
    ['SWEET', { en: 'that has sugar.', it: 'che ha zucchero.', fr: 'qui a du sucre.', de: 'das Zucker hat.', es: 'que tiene azúcar.', ja: '砂糖がある。', pt: 'que tem açúcar.' }],
    ['SOLID', { en: 'that does not flow.', it: 'che non scorre.', fr: 'qui ne coule pas.', de: 'der nicht fließt.', es: 'que no fluye.', ja: '流れない。', pt: 'que não flui.' }],
    // Not on AFFECTION, "a warm feeling", which would make the two define each other.
    ['WARM', { en: 'of great kindness.', it: 'di grande gentilezza.', fr: 'de grande gentillesse.', de: 'von großer Freundlichkeit.', es: 'de amabilidad grande.', ja: '優しさが大きい。', pt: 'de gentileza grande.' }],
  ])('%s', (id, rendered) => {
    expect(definitionAll(id)).toEqual(rendered);
  });
});

describe('the creature adjectives are said of a BEING: German "das", no animal-only verb', () => {
  test.each<[string, Record<ReadyLanguageCode, string>]>([
    ['WILD', { en: 'that has not been tamed.', it: 'che non è stato domato.', fr: "qui n'a pas été apprivoisé.", de: 'das nicht gezähmt worden ist.', es: 'que no ha sido domado.', ja: '飼い慣らされていない。', pt: 'que não foi domado.' }],
    ['DOMESTIC', { en: 'that lives with people.', it: 'che abita con persone.', fr: 'qui habite avec des personnes.', de: 'das mit Personen wohnt.', es: 'que vive con personas.', ja: '人と住む。', pt: 'que mora com pessoas.' }],
    ['MALE', { en: 'that has testicles.', it: 'che ha testicoli.', fr: 'qui a des testicules.', de: 'das Hoden hat.', es: 'que tiene testículos.', ja: '精巣がある。', pt: 'que tem testículos.' }],
    ['FEMALE', { en: 'that has ovaries.', it: 'che ha ovaie.', fr: 'qui a des ovaires.', de: 'das Eierstöcke hat.', es: 'que tiene ovarios.', ja: '卵巣がある。', pt: 'que tem ovários.' }],
    // A source gap: "that has no testicles" would be FEMALE's too.
    ['CASTRATED', { en: 'from which the testicles have been removed.', it: 'dal quale i testicoli sono stati rimossi.', fr: 'duquel les testicules ont été retirés.', de: 'aus dem die Hoden entfernt worden sind.', es: 'del que los testículos han sido quitados.', ja: '精巣が取り除かれた。', pt: 'do qual os testículos foram removidos.' }],
    // A person eats (essen), an animal feeds (fressen): BEING keeps the person's verb.
    ['HUNGRY', { en: 'that wants to eat.', it: 'che vuole mangiare.', fr: 'qui veut manger.', de: 'das essen will.', es: 'que quiere comer.', ja: '食べたい。', pt: 'que quer comer.' }],
    // NO_LONGER's negation, each language's own: non … più, ne … plus, ya no, もう〜ない.
    ['ADULT', { en: 'that no longer grows.', it: 'che non cresce più.', fr: 'qui ne grandit plus.', de: 'das nicht mehr wächst.', es: 'que ya no crece.', ja: 'もう成長しない。', pt: 'que já não cresce.' }],
  ])('%s', (id, rendered) => {
    expect(definitionAll(id)).toEqual(rendered);
  });
});

describe('the order and time adjectives are glossed in every language', () => {
  test.each<[string, Record<ReadyLanguageCode, string>]>([
    ['NEXT', { en: 'that follows.', it: 'che segue.', fr: 'qui suit.', de: 'der folgt.', es: 'que sigue.', ja: '続く。', pt: 'que segue.' }],
    // The separable German verb closes its clause whole: "vorangeht".
    ['PREVIOUS', { en: 'that precedes.', it: 'che precede.', fr: 'qui précède.', de: 'der vorangeht.', es: 'que precede.', ja: '先行する。', pt: 'que precede.' }],
    // HAPPEN's tense and aspect alone tell the three apart; the masculine PROCESS agrees the
    // Romance participle ("è successo", "est arrivé").
    ['PRESENT', { en: 'that happens now.', it: 'che succede ora.', fr: 'qui arrive maintenant.', de: 'der jetzt geschieht.', es: 'que ocurre ahora.', ja: '今起こる。', pt: 'que acontece agora.' }],
    ['PAST', { en: 'that has happened.', it: 'che è successo.', fr: 'qui est arrivé.', de: 'der geschehen ist.', es: 'que ha ocurrido.', ja: '起こった。', pt: 'que aconteceu.' }],
    ['FUTURE', { en: 'that will happen.', it: 'che succederà.', fr: 'qui arrivera.', de: 'der geschehen wird.', es: 'que ocurrirá.', ja: '起こる。', pt: 'que acontecerá.' }],
  ])('%s', (id, rendered) => {
    expect(definitionAll(id)).toEqual(rendered);
  });
});

// Each family must come apart in every language, member from member — the C05 test, which the
// sweep guard checks corpus-wide; these are the pairs a reader compares side by side.
describe('every family comes apart', () => {
  test.each<[string, string[]]>([
    ['the sexes', ['MALE', 'FEMALE', 'CASTRATED']],
    ['wild and domestic', ['WILD', 'DOMESTIC']],
    ['near and far', ['NEAR', 'FAR']],
    ['next and previous', ['NEXT', 'PREVIOUS']],
    ['the times', ['PRESENT', 'PAST', 'FUTURE']],
    ['new and young', ['NEW', 'YOUNG']],
    ['adult and old', ['ADULT', 'OLD']],
  ])('%s', (_, ids) => {
    for (const language of READY_LANGUAGES) {
      const texts = ids.map((id) => definitionAll(id)[language]);
      expect(new Set(texts).size, `${language}: ${texts.join(' | ')}`).toBe(ids.length);
    }
  });
});

// Literal by design: each is a primitive the definition language is built from, or a concept every
// composable gloss either restates or defines in a circle
// (docs/localization/done/C24-grammar-feature-adjectives.md).
test('the literal-by-design adjectives have no gloss', () => {
  const literal = ['GREAT', 'LOW', 'OTHER', 'OPPOSITE', 'SOLE', 'MANIFOLD', 'BROWN', 'CANINE', 'BEAUTIFUL'];
  expect(literal.filter((id) => concepts.find((c) => c.id === id)?.definition)).toEqual([]);
});

// ── The words ─────────────────────────────────────────────────────────

describe('the nouns: a singular and a plural in every language', () => {
  test.each<[string, Record<ReadyLanguageCode, string>, Record<ReadyLanguageCode, string>]>([
    // German Hoden is the same word in the plural; Japanese has no plural to show.
    ['TESTICLE',
      { en: 'the testicle.', it: 'il testicolo.', fr: 'le testicule.', de: 'der Hoden.', es: 'el testículo.', ja: '精巣。', pt: 'o testículo.' },
      { en: 'the testicles.', it: 'i testicoli.', fr: 'les testicules.', de: 'die Hoden.', es: 'los testículos.', ja: '精巣。', pt: 'os testículos.' }],
    // Italian ovaia is feminine, French ovaire masculine; Eierstock umlauts its plural.
    ['OVARY',
      { en: 'the ovary.', it: "l'ovaia.", fr: "l'ovaire.", de: 'der Eierstock.', es: 'el ovario.', ja: '卵巣。', pt: 'o ovário.' },
      { en: 'the ovaries.', it: 'le ovaie.', fr: 'les ovaires.', de: 'die Eierstöcke.', es: 'los ovarios.', ja: '卵巣。', pt: 'os ovários.' }],
    ['SHAPE',
      { en: 'the shape.', it: 'la forma.', fr: 'la forme.', de: 'die Form.', es: 'la forma.', ja: '形。', pt: 'a forma.' },
      { en: 'the shapes.', it: 'le forme.', fr: 'les formes.', de: 'die Formen.', es: 'las formas.', ja: '形。', pt: 'as formas.' }],
    ['CIRCLE',
      { en: 'the circle.', it: 'il cerchio.', fr: 'le cercle.', de: 'der Kreis.', es: 'el círculo.', ja: '円。', pt: 'o círculo.' },
      { en: 'the circles.', it: 'i cerchi.', fr: 'les cercles.', de: 'die Kreise.', es: 'los círculos.', ja: '円。', pt: 'os círculos.' }],
    ['DISTANCE',
      { en: 'the distance.', it: 'la distanza.', fr: 'la distance.', de: 'die Entfernung.', es: 'la distancia.', ja: '距離。', pt: 'a distância.' },
      { en: 'the distances.', it: 'le distanze.', fr: 'les distances.', de: 'die Entfernungen.', es: 'las distancias.', ja: '距離。', pt: 'as distâncias.' }],
    // The two mass words keep the singular under a plural determiner; Italian takes lo before z.
    ['SUGAR',
      { en: 'the sugar.', it: 'lo zucchero.', fr: 'le sucre.', de: 'der Zucker.', es: 'el azúcar.', ja: '砂糖。', pt: 'o açúcar.' },
      { en: 'the sugar.', it: 'lo zucchero.', fr: 'le sucre.', de: 'der Zucker.', es: 'el azúcar.', ja: '砂糖。', pt: 'o açúcar.' }],
    ['KINDNESS',
      { en: 'the kindness.', it: 'la gentilezza.', fr: 'la gentillesse.', de: 'die Freundlichkeit.', es: 'la amabilidad.', ja: '優しさ。', pt: 'a gentileza.' },
      { en: 'the kindness.', it: 'la gentilezza.', fr: 'la gentillesse.', de: 'die Freundlichkeit.', es: 'la amabilidad.', ja: '優しさ。', pt: 'a gentileza.' }],
  ])('%s', (concept, singular, plural) => {
    expect(said(concept, { definiteness: 'definite' })).toEqual(singular);
    expect(said(concept, { number: 'plural', definiteness: 'definite' })).toEqual(plural);
  });

  test('the organs hang under ORGAN, and a circle is a shape', () => {
    const isA = (id: string) => concepts.find((c) => c.id === id)?.isA;
    expect([isA('TESTICLE'), isA('OVARY'), isA('CIRCLE'), isA('SUGAR')]).toEqual(['ORGAN', 'ORGAN', 'SHAPE', 'FOOD']);
  });
});

describe('the verbs: a present, a resultative and a future clause in every language', () => {
  test.each<[string, NounPhrase, Record<ReadyLanguageCode, string>, Record<ReadyLanguageCode, string>]>([
    // vorangehen is separable: the particle closes the main clause and the participle takes -ge- inside.
    ['PRECEDE', the('WOMAN'),
      { en: 'the woman precedes.', it: 'la donna precede.', fr: 'la femme précède.', de: 'die Frau geht voran.', es: 'la mujer precede.', ja: '女は先行します。', pt: 'a mulher precede.' },
      { en: 'the woman has preceded.', it: 'la donna ha preceduto.', fr: 'la femme a précédé.', de: 'die Frau ist vorangegangen.', es: 'la mujer ha precedido.', ja: '女は先行しました。', pt: 'a mulher precedeu.' }],
    // seguire takes avere where folgen takes sein.
    ['FOLLOW', the('WOMAN'),
      { en: 'the woman follows.', it: 'la donna segue.', fr: 'la femme suit.', de: 'die Frau folgt.', es: 'la mujer sigue.', ja: '女は続きます。', pt: 'a mulher segue.' },
      { en: 'the woman has followed.', it: 'la donna ha seguito.', fr: 'la femme a suivi.', de: 'die Frau ist gefolgt.', es: 'la mujer ha seguido.', ja: '女は続きました。', pt: 'a mulher seguiu.' }],
    // succedere and arriver take essere / être and agree: "è successa", "est arrivée".
    ['HAPPEN', the('STORY'),
      { en: 'the story happens.', it: 'la storia succede.', fr: "l'histoire arrive.", de: 'die Geschichte geschieht.', es: 'la historia ocurre.', ja: '物語は起こります。', pt: 'a história acontece.' },
      { en: 'the story has happened.', it: 'la storia è successa.', fr: "l'histoire est arrivée.", de: 'die Geschichte ist geschehen.', es: 'la historia ha ocurrido.', ja: '物語は起こりました。', pt: 'a história aconteceu.' }],
    ['GROW', the('CHILD'),
      { en: 'the child grows.', it: 'il bambino cresce.', fr: "l'enfant grandit.", de: 'das Kind wächst.', es: 'el niño crece.', ja: '子供は成長します。', pt: 'a criança cresce.' },
      { en: 'the child has grown.', it: 'il bambino è cresciuto.', fr: "l'enfant a grandi.", de: 'das Kind ist gewachsen.', es: 'el niño ha crecido.', ja: '子供は成長しました。', pt: 'a criança cresceu.' }],
    // scorrere takes essere, couler avoir.
    ['FLOW', the('WATER'),
      { en: 'the water flows.', it: "l'acqua scorre.", fr: "l'eau coule.", de: 'das Wasser fließt.', es: 'el agua fluye.', ja: '水は流れます。', pt: 'a água flui.' },
      { en: 'the water has flowed.', it: "l'acqua è scorsa.", fr: "l'eau a coulé.", de: 'das Wasser ist geflossen.', es: 'el agua ha fluido.', ja: '水は流れました。', pt: 'a água fluiu.' }],
  ])('%s', (verb, subject, present, resultative) => {
    expect(sayAll(clause(subject, verb))).toEqual(present);
    expect(sayAll(clause(subject, verb, { verbPhrase: { aspect: 'resultative' } }))).toEqual(resultative);
  });

  test('HAPPEN in the future, and GROW in the simple past', () => {
    expect(sayAll(clause(the('STORY'), 'HAPPEN', { verbPhrase: { tense: 'future' } }))).toEqual({
      en: 'the story will happen.', it: 'la storia succederà.', fr: "l'histoire arrivera.", de: 'die Geschichte wird geschehen.',
      es: 'la historia ocurrirá.', ja: '物語は起こります。', pt: 'a história acontecerá.',
    });
    // The strong pasts: crebbe, wuchs, creció.
    expect(sayAll(clause(the('MAN'), 'GROW', { verbPhrase: { tense: 'past' } }))).toEqual({
      en: 'the man grew.', it: "l'uomo crebbe.", fr: "l'homme grandit.", de: 'der Mann wuchs.', es: 'el hombre creció.',
      ja: '男は成長しました。', pt: 'o homem cresceu.',
    });
  });

  test('TAME takes an object, and its passive the Japanese 〜される form', () => {
    expect(sayAll(clause(the('MAN'), 'TAME', { directObject: the('WOLF') }))).toEqual({
      en: 'the man tames the wolf.', it: "l'uomo doma il lupo.", fr: "l'homme apprivoise le loup.", de: 'der Mann zähmt den Wolf.',
      es: 'el hombre doma el lobo.', ja: '男は狼を飼い慣らします。', pt: 'o homem doma o lobo.',
    });
    expect(sayAll(clause(np('GENERIC_PERSON'), 'TAME', { directObject: the('WOLF'), verbPhrase: { voice: 'passive', aspect: 'resultative' } }))).toEqual({
      en: 'the wolf has been tamed.', it: 'il lupo è stato domato.', fr: 'le loup a été apprivoisé.', de: 'der Wolf ist gezähmt worden.',
      es: 'el lobo ha sido domado.', ja: '狼は飼い慣らされました。', pt: 'o lobo foi domado.',
    });
  });

  // The Italian auxiliary and participle agreement, as verb.test.ts's table checks them for every
  // other verb: a feminine subject shows both.
  test.each<[string, string]>([
    ['PRECEDE', 'la gatta ha preceduto.'], ['FOLLOW', 'la gatta ha seguito.'], ['HAPPEN', 'la gatta è successa.'],
    ['GROW', 'la gatta è cresciuta.'], ['FLOW', 'la gatta è scorsa.'], ['TAME', 'la gatta ha domato.'],
  ])('Italian resultative: %s → %s', (verb, it) => {
    expect(sayAll(clause(np('CAT', { gender: 'fem', definiteness: 'definite' }), verb, { verbPhrase: { aspect: 'resultative' } })).it).toBe(it);
  });
});

describe('the adverbs, in a clause in every language', () => {
  test('NO_LONGER negates as NEVER does, each language with its own bracket', () => {
    expect(sayAll(clause(the('CAT'), 'EAT', { directObject: the('MOUSE'), verbPhrase: { modifier: 'NO_LONGER' } }))).toEqual({
      en: 'the cat no longer eats the mouse.', it: 'il gatto non mangia più il topo.', fr: 'le chat ne mange plus la souris.',
      de: 'der Kater frisst nicht mehr die Maus.', es: 'el gato ya no come el ratón.', ja: '猫はネズミをもう食べません。',
      pt: 'o gato já não come o rato.',
    });
    expect(sayAll(clause(the('CAT'), 'EAT', { verbPhrase: { modifier: 'NO_LONGER', tense: 'past' } }))).toEqual({
      en: 'the cat no longer ate.', it: 'il gatto non mangiò più.', fr: 'le chat ne mangea plus.', de: 'der Kater fraß nicht mehr.',
      es: 'el gato ya no comió.', ja: '猫はもう食べませんでした。', pt: 'o gato já não comeu.',
    });
  });

  test('RECENTLY follows the verb, and a compound tense keeps it after the participle', () => {
    expect(sayAll(clause(the('CAT'), 'EAT', { verbPhrase: { modifier: 'RECENTLY', tense: 'past' } }))).toEqual({
      en: 'the cat ate recently.', it: 'il gatto mangiò di recente.', fr: 'le chat mangea récemment.', de: 'der Kater fraß kürzlich.',
      es: 'el gato comió recientemente.', ja: '猫は最近食べました。', pt: 'o gato comeu recentemente.',
    });
    expect(sayAll(clause(the('CAT'), 'EAT', { directObject: the('MOUSE'), verbPhrase: { modifier: 'RECENTLY', aspect: 'resultative' } }))).toEqual({
      en: 'the cat has eaten the mouse recently.', it: 'il gatto ha mangiato di recente il topo.', fr: 'le chat a mangé récemment la souris.',
      de: 'der Kater hat kürzlich die Maus gefressen.', es: 'el gato ha comido recientemente el ratón.', ja: '猫はネズミを最近食べました。',
      pt: 'o gato comeu recentemente o rato.',
    });
  });
});
