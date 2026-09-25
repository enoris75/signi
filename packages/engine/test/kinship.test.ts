import { describe, expect, test } from 'vitest';
import type { LanguageCode, NounPhrase, PronominalPossessor, ReadyLanguageCode } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';
import { isPreviewLanguage } from '@signi/shared';

// P11's corpus: the 38 kin nouns of its §4 with the two adjectives ELDER and YOUNGER and the verb
// MARRY, 41 concepts seeded by localization B68–B74. This file pins what the words do that no
// other noun in the corpus does — the Japanese own / other's / nobody's split, the fusion of an
// adjective into the head, the French and German short words, the plurals that are another word,
// the German adjectival noun and the Italian article — and the 38 glosses the tickets authored.
//
// The verbs' compound past is in verb.test.ts's Italian table and the adjectives' attributive form
// in adjectives.test.ts's EVERY_ADJECTIVE, where those exhaustive tables already live.

/** Render a seeded concept's own `definition` plan (its picker tooltip) into every language. */
function definitionAll(id: string): Record<ReadyLanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).filter((t) => !isPreviewLanguage(t.language)).map((t) => [t.language, t.text]),
  ) as Record<ReadyLanguageCode, string>;
}

const said = (concept: string, extra: Partial<NounPhrase> = {}) => sayAll({ subject: np(concept, extra) });
const runs = (concept: string, extra: Partial<NounPhrase> = {}) => sayAll(clause(np(concept, extra), 'RUN'));
const of = (person: '1' | '2' | '3', number: 'singular' | 'plural' = 'singular'): PronominalPossessor =>
  ({ kind: 'pronominal', person, number });

// ── The words ─────────────────────────────────────────────────────────

describe('the kin terms: a definite singular and plural in every language', () => {
  test.each<[string, Record<ReadyLanguageCode, string>, Record<ReadyLanguageCode, string>]>([
    ['RELATIVE',
      { en: 'the relative.', it: 'il parente.', fr: 'le parent.', de: 'der Verwandte.', es: 'el pariente.', ja: '親戚。', pt: 'o parente.' },
      { en: 'the relatives.', it: 'i parenti.', fr: 'les parents.', de: 'die Verwandten.', es: 'los parientes.', ja: '親戚。', pt: 'os parentes.' }],
    ['FAMILY',
      { en: 'the family.', it: 'la famiglia.', fr: 'la famille.', de: 'die Familie.', es: 'la familia.', ja: '家族。', pt: 'a família.' },
      { en: 'the families.', it: 'le famiglie.', fr: 'les familles.', de: 'die Familien.', es: 'las familias.', ja: '家族。', pt: 'as famílias.' }],
    ['MOTHER',
      { en: 'the mother.', it: 'la madre.', fr: 'la mère.', de: 'die Mutter.', es: 'la madre.', ja: '母親。', pt: 'a mãe.' },
      { en: 'the mothers.', it: 'le madri.', fr: 'les mères.', de: 'die Mütter.', es: 'las madres.', ja: '母親。', pt: 'as mães.' }],
    ['CHILD_OFFSPRING',
      { en: 'the child.', it: 'il figlio.', fr: "l'enfant.", de: 'das Kind.', es: 'el hijo.', ja: '子供。', pt: 'o filho.' },
      { en: 'the children.', it: 'i figli.', fr: 'les enfants.', de: 'die Kinder.', es: 'los hijos.', ja: '子供。', pt: 'os filhos.' }],
    ['SON',
      { en: 'the son.', it: 'il figlio.', fr: 'le fils.', de: 'der Sohn.', es: 'el hijo.', ja: '息子。', pt: 'o filho.' },
      { en: 'the sons.', it: 'i figli.', fr: 'les fils.', de: 'die Söhne.', es: 'los hijos.', ja: '息子。', pt: 'os filhos.' }],
    ['DAUGHTER',
      { en: 'the daughter.', it: 'la figlia.', fr: 'la fille.', de: 'die Tochter.', es: 'la hija.', ja: '娘。', pt: 'a filha.' },
      { en: 'the daughters.', it: 'le figlie.', fr: 'les filles.', de: 'die Töchter.', es: 'las hijas.', ja: '娘。', pt: 'as filhas.' }],
    ['SIBLING',
      { en: 'the sibling.', it: 'il fratello.', fr: 'le frère.', de: 'das Geschwister.', es: 'el hermano.', ja: '兄弟。', pt: 'o irmão.' },
      { en: 'the siblings.', it: 'i fratelli.', fr: 'les frères et sœurs.', de: 'die Geschwister.', es: 'los hermanos.', ja: '兄弟。', pt: 'os irmãos.' }],
    ['BROTHER',
      { en: 'the brother.', it: 'il fratello.', fr: 'le frère.', de: 'der Bruder.', es: 'el hermano.', ja: '兄弟。', pt: 'o irmão.' },
      { en: 'the brothers.', it: 'i fratelli.', fr: 'les frères.', de: 'die Brüder.', es: 'los hermanos.', ja: '兄弟。', pt: 'os irmãos.' }],
    ['SISTER',
      { en: 'the sister.', it: 'la sorella.', fr: 'la sœur.', de: 'die Schwester.', es: 'la hermana.', ja: '姉妹。', pt: 'a irmã.' },
      { en: 'the sisters.', it: 'le sorelle.', fr: 'les sœurs.', de: 'die Schwestern.', es: 'las hermanas.', ja: '姉妹。', pt: 'as irmãs.' }],
    ['SPOUSE',
      { en: 'the spouse.', it: 'il coniuge.', fr: 'le conjoint.', de: 'der Ehepartner.', es: 'el cónyuge.', ja: '配偶者。', pt: 'o cônjuge.' },
      { en: 'the spouses.', it: 'i coniugi.', fr: 'les conjoints.', de: 'die Ehepartner.', es: 'los cónyuges.', ja: '配偶者。', pt: 'os cônjuges.' }],
    ['HUSBAND',
      { en: 'the husband.', it: 'il marito.', fr: 'le mari.', de: 'der Ehemann.', es: 'el marido.', ja: '夫。', pt: 'o marido.' },
      { en: 'the husbands.', it: 'i mariti.', fr: 'les maris.', de: 'die Ehemänner.', es: 'los maridos.', ja: '夫。', pt: 'os maridos.' }],
    ['WIFE',
      { en: 'the wife.', it: 'la moglie.', fr: "l'épouse.", de: 'die Ehefrau.', es: 'la esposa.', ja: '妻。', pt: 'a esposa.' },
      { en: 'the wives.', it: 'le mogli.', fr: 'les épouses.', de: 'die Ehefrauen.', es: 'las esposas.', ja: '妻。', pt: 'as esposas.' }],
    ['GRANDPARENT',
      { en: 'the grandparent.', it: 'il nonno.', fr: 'le grand-parent.', de: 'das Großelternteil.', es: 'el abuelo.', ja: '祖父母。', pt: 'o avô.' },
      { en: 'the grandparents.', it: 'i nonni.', fr: 'les grands-parents.', de: 'die Großeltern.', es: 'los abuelos.', ja: '祖父母。', pt: 'os avós.' }],
    ['GRANDFATHER',
      { en: 'the grandfather.', it: 'il nonno.', fr: 'le grand-père.', de: 'der Großvater.', es: 'el abuelo.', ja: '祖父。', pt: 'o avô.' },
      { en: 'the grandfathers.', it: 'i nonni.', fr: 'les grands-pères.', de: 'die Großväter.', es: 'los abuelos.', ja: '祖父。', pt: 'os avôs.' }],
    ['GRANDMOTHER',
      { en: 'the grandmother.', it: 'la nonna.', fr: 'la grand-mère.', de: 'die Großmutter.', es: 'la abuela.', ja: '祖母。', pt: 'a avó.' },
      { en: 'the grandmothers.', it: 'le nonne.', fr: 'les grands-mères.', de: 'die Großmütter.', es: 'las abuelas.', ja: '祖母。', pt: 'as avós.' }],
    ['GRANDCHILD',
      { en: 'the grandchild.', it: 'il nipote.', fr: 'le petit-enfant.', de: 'das Enkelkind.', es: 'el nieto.', ja: '孫。', pt: 'o neto.' },
      { en: 'the grandchildren.', it: 'i nipoti.', fr: 'les petits-enfants.', de: 'die Enkelkinder.', es: 'los nietos.', ja: '孫。', pt: 'os netos.' }],
    ['GRANDSON',
      { en: 'the grandson.', it: 'il nipote.', fr: 'le petit-fils.', de: 'der Enkel.', es: 'el nieto.', ja: '孫息子。', pt: 'o neto.' },
      { en: 'the grandsons.', it: 'i nipoti.', fr: 'les petits-fils.', de: 'die Enkel.', es: 'los nietos.', ja: '孫息子。', pt: 'os netos.' }],
    ['GRANDDAUGHTER',
      { en: 'the granddaughter.', it: 'la nipote.', fr: 'la petite-fille.', de: 'die Enkelin.', es: 'la nieta.', ja: '孫娘。', pt: 'a neta.' },
      { en: 'the granddaughters.', it: 'le nipoti.', fr: 'les petites-filles.', de: 'die Enkelinnen.', es: 'las nietas.', ja: '孫娘。', pt: 'as netas.' }],
    ['UNCLE',
      { en: 'the uncle.', it: 'lo zio.', fr: "l'oncle.", de: 'der Onkel.', es: 'el tío.', ja: 'おじ。', pt: 'o tio.' },
      { en: 'the uncles.', it: 'gli zii.', fr: 'les oncles.', de: 'die Onkel.', es: 'los tíos.', ja: 'おじ。', pt: 'os tios.' }],
    ['AUNT',
      { en: 'the aunt.', it: 'la zia.', fr: 'la tante.', de: 'die Tante.', es: 'la tía.', ja: 'おば。', pt: 'a tia.' },
      { en: 'the aunts.', it: 'le zie.', fr: 'les tantes.', de: 'die Tanten.', es: 'las tías.', ja: 'おば。', pt: 'as tias.' }],
    ['COUSIN',
      { en: 'the cousin.', it: 'il cugino.', fr: 'le cousin.', de: 'der Cousin.', es: 'el primo.', ja: 'いとこ。', pt: 'o primo.' },
      { en: 'the cousins.', it: 'i cugini.', fr: 'les cousins.', de: 'die Cousins.', es: 'los primos.', ja: 'いとこ。', pt: 'os primos.' }],
    ['NEPHEW',
      { en: 'the nephew.', it: 'il nipote.', fr: 'le neveu.', de: 'der Neffe.', es: 'el sobrino.', ja: '甥。', pt: 'o sobrinho.' },
      { en: 'the nephews.', it: 'i nipoti.', fr: 'les neveux.', de: 'die Neffen.', es: 'los sobrinos.', ja: '甥。', pt: 'os sobrinhos.' }],
    ['NIECE',
      { en: 'the niece.', it: 'la nipote.', fr: 'la nièce.', de: 'die Nichte.', es: 'la sobrina.', ja: '姪。', pt: 'a sobrinha.' },
      { en: 'the nieces.', it: 'le nipoti.', fr: 'les nièces.', de: 'die Nichten.', es: 'las sobrinas.', ja: '姪。', pt: 'as sobrinhas.' }],
    ['MOTHER_IN_LAW',
      { en: 'the mother-in-law.', it: 'la suocera.', fr: 'la belle-mère.', de: 'die Schwiegermutter.', es: 'la suegra.', ja: '義母。', pt: 'a sogra.' },
      { en: 'the mothers-in-law.', it: 'le suocere.', fr: 'les belles-mères.', de: 'die Schwiegermütter.', es: 'las suegras.', ja: '義母。', pt: 'as sogras.' }],
    ['FATHER_IN_LAW',
      { en: 'the father-in-law.', it: 'il suocero.', fr: 'le beau-père.', de: 'der Schwiegervater.', es: 'el suegro.', ja: '義父。', pt: 'o sogro.' },
      { en: 'the fathers-in-law.', it: 'i suoceri.', fr: 'les beaux-pères.', de: 'die Schwiegerväter.', es: 'los suegros.', ja: '義父。', pt: 'os sogros.' }],
    ['SON_IN_LAW',
      { en: 'the son-in-law.', it: 'il genero.', fr: 'le gendre.', de: 'der Schwiegersohn.', es: 'el yerno.', ja: '婿。', pt: 'o genro.' },
      { en: 'the sons-in-law.', it: 'i generi.', fr: 'les gendres.', de: 'die Schwiegersöhne.', es: 'los yernos.', ja: '婿。', pt: 'os genros.' }],
    ['DAUGHTER_IN_LAW',
      { en: 'the daughter-in-law.', it: 'la nuora.', fr: 'la belle-fille.', de: 'die Schwiegertochter.', es: 'la nuera.', ja: '嫁。', pt: 'a nora.' },
      { en: 'the daughters-in-law.', it: 'le nuore.', fr: 'les belles-filles.', de: 'die Schwiegertöchter.', es: 'las nueras.', ja: '嫁。', pt: 'as noras.' }],
    ['BROTHER_IN_LAW',
      { en: 'the brother-in-law.', it: 'il cognato.', fr: 'le beau-frère.', de: 'der Schwager.', es: 'el cuñado.', ja: '義理の兄弟。', pt: 'o cunhado.' },
      { en: 'the brothers-in-law.', it: 'i cognati.', fr: 'les beaux-frères.', de: 'die Schwäger.', es: 'los cuñados.', ja: '義理の兄弟。', pt: 'os cunhados.' }],
    ['SISTER_IN_LAW',
      { en: 'the sister-in-law.', it: 'la cognata.', fr: 'la belle-sœur.', de: 'die Schwägerin.', es: 'la cuñada.', ja: '義理の姉妹。', pt: 'a cunhada.' },
      { en: 'the sisters-in-law.', it: 'le cognate.', fr: 'les belles-sœurs.', de: 'die Schwägerinnen.', es: 'las cuñadas.', ja: '義理の姉妹。', pt: 'as cunhadas.' }],
    ['STEPFATHER',
      { en: 'the stepfather.', it: 'il patrigno.', fr: 'le beau-père.', de: 'der Stiefvater.', es: 'el padrastro.', ja: '継父。', pt: 'o padrasto.' },
      { en: 'the stepfathers.', it: 'i patrigni.', fr: 'les beaux-pères.', de: 'die Stiefväter.', es: 'los padrastros.', ja: '継父。', pt: 'os padrastos.' }],
    ['STEPMOTHER',
      { en: 'the stepmother.', it: 'la matrigna.', fr: 'la belle-mère.', de: 'die Stiefmutter.', es: 'la madrastra.', ja: '継母。', pt: 'a madrasta.' },
      { en: 'the stepmothers.', it: 'le matrigne.', fr: 'les belles-mères.', de: 'die Stiefmütter.', es: 'las madrastras.', ja: '継母。', pt: 'as madrastas.' }],
    // A definite singular MOM or DAD is a name, bare and capitalized, except in Italian (P11-E3).
    ['MOM',
      { en: 'Mom.', it: 'la mamma.', fr: 'Maman.', de: 'Mama.', es: 'Mamá.', ja: 'お母さん。', pt: 'Mamãe.' },
      { en: 'the moms.', it: 'le mamme.', fr: 'les mamans.', de: 'die Mamas.', es: 'las mamás.', ja: 'お母さん。', pt: 'as mamães.' }],
    ['DAD',
      { en: 'Dad.', it: 'il papà.', fr: 'Papa.', de: 'Papa.', es: 'Papá.', ja: 'お父さん。', pt: 'Papai.' },
      { en: 'the dads.', it: 'i papà.', fr: 'les papas.', de: 'die Papas.', es: 'los papás.', ja: 'お父さん。', pt: 'os papais.' }],
    ['PARTNER',
      { en: 'the partner.', it: 'il compagno.', fr: 'le compagnon.', de: 'der Partner.', es: 'la pareja.', ja: 'パートナー。', pt: 'o companheiro.' },
      { en: 'the partners.', it: 'i compagni.', fr: 'les compagnons.', de: 'die Partner.', es: 'las parejas.', ja: 'パートナー。', pt: 'os companheiros.' }],
    ['BOYFRIEND',
      { en: 'the boyfriend.', it: 'il ragazzo.', fr: 'le petit ami.', de: 'der Freund.', es: 'el novio.', ja: '彼氏。', pt: 'o namorado.' },
      { en: 'the boyfriends.', it: 'i ragazzi.', fr: 'les petits amis.', de: 'die Freunde.', es: 'los novios.', ja: '彼氏。', pt: 'os namorados.' }],
    ['GIRLFRIEND',
      { en: 'the girlfriend.', it: 'la ragazza.', fr: 'la petite amie.', de: 'die Freundin.', es: 'la novia.', ja: '彼女。', pt: 'a namorada.' },
      { en: 'the girlfriends.', it: 'le ragazze.', fr: 'les petites amies.', de: 'die Freundinnen.', es: 'las novias.', ja: '彼女。', pt: 'as namoradas.' }],
    ['FIANCE',
      { en: 'the fiancé.', it: 'il fidanzato.', fr: 'le fiancé.', de: 'der Verlobte.', es: 'el prometido.', ja: '婚約者。', pt: 'o noivo.' },
      { en: 'the fiancés.', it: 'i fidanzati.', fr: 'les fiancés.', de: 'die Verlobten.', es: 'los prometidos.', ja: '婚約者。', pt: 'os noivos.' }],
    ['FRIEND',
      { en: 'the friend.', it: "l'amico.", fr: "l'ami.", de: 'der Freund.', es: 'el amigo.', ja: '友達。', pt: 'o amigo.' },
      { en: 'the friends.', it: 'gli amici.', fr: 'les amis.', de: 'die Freunde.', es: 'los amigos.', ja: '友達。', pt: 'os amigos.' }],
  ])('%s', (concept, singular, plural) => {
    expect(said(concept)).toEqual(singular);
    expect(said(concept, { number: 'plural' })).toEqual(plural);
  });
});

// ── The glosses (B68–B74) ─────────────────────────────────────────────

describe('the glosses the P11 seeding shipped', () => {
  test.each<[string, Record<ReadyLanguageCode, string>]>([
    ['RELATIVE', { en: 'a person of the same family.', it: 'una persona della stessa famiglia.', fr: 'une personne de la même famille.', de: 'eine Person der gleichen Familie.', es: 'una persona de la misma familia.', ja: '同じ家族の人。', pt: 'uma pessoa da mesma família.' }],
    ['FAMILY', { en: 'a group of relatives.', it: 'un gruppo di parenti.', fr: 'un groupe de parents.', de: 'eine Gruppe von Verwandten.', es: 'un grupo de parientes.', ja: '親戚のグループ。', pt: 'um grupo de parentes.' }],
    ['PARENT', { en: 'a person who has children.', it: 'una persona che ha figli.', fr: 'une personne qui a des enfants.', de: 'eine Person, die Kinder hat.', es: 'una persona que tiene hijos.', ja: '子供を持つ人。', pt: 'uma pessoa que tem filhos.' }],
    ['MOTHER', { en: 'a female parent.', it: 'una genitrice femminile.', fr: 'un parent féminin.', de: 'ein weibliches Elternteil.', es: 'una progenitora femenina.', ja: '女性の親。', pt: 'uma progenitora feminina.' }],
    ['CHILD_OFFSPRING', { en: 'a son or a daughter.', it: 'un figlio o una figlia.', fr: 'un fils ou une fille.', de: 'ein Sohn oder eine Tochter.', es: 'un hijo o una hija.', ja: '息子か娘。', pt: 'um filho ou uma filha.' }],
    ['SIBLING', { en: 'a person who has the same parents.', it: 'una persona che ha gli stessi genitori.', fr: 'une personne qui a les mêmes parents.', de: 'eine Person, die die gleichen Eltern hat.', es: 'una persona que tiene los mismos padres.', ja: '同じ両親を持つ人。', pt: 'uma pessoa que tem os mesmos pais.' }],
    ['BROTHER', { en: 'a male person who has the same parents.', it: 'una persona maschile che ha gli stessi genitori.', fr: 'une personne masculine qui a les mêmes parents.', de: 'eine männliche Person, die die gleichen Eltern hat.', es: 'una persona masculina que tiene los mismos padres.', ja: '同じ両親を持つ男性の人。', pt: 'uma pessoa masculina que tem os mesmos pais.' }],
    ['SISTER', { en: 'a female person who has the same parents.', it: 'una persona femminile che ha gli stessi genitori.', fr: 'une personne féminine qui a les mêmes parents.', de: 'eine weibliche Person, die die gleichen Eltern hat.', es: 'una persona femenina que tiene los mismos padres.', ja: '同じ両親を持つ女性の人。', pt: 'uma pessoa feminina que tem os mesmos pais.' }],
    ['ELDER', { en: 'of greater age.', it: 'di età più grande.', fr: "d'âge plus grand.", de: 'von größerem Alter.', es: 'de edad más grande.', ja: '年齢がもっと大きい。', pt: 'de idade maior.' }],
    ['YOUNGER', { en: 'of lower age.', it: 'di età più bassa.', fr: "d'âge plus bas.", de: 'von niedrigerem Alter.', es: 'de edad más baja.', ja: '年齢がもっと低い。', pt: 'de idade mais baixa.' }],
    ['SPOUSE', { en: 'a person who one marries.', it: 'una persona che si sposa.', fr: "une personne qu'on épouse.", de: 'eine Person, die man heiratet.', es: 'una persona con la que uno se casa.', ja: '結婚する人。', pt: 'uma pessoa com a qual se casa.' }],
    ['HUSBAND', { en: 'a male spouse.', it: 'un coniuge maschile.', fr: 'un conjoint masculin.', de: 'ein männlicher Ehepartner.', es: 'un cónyuge masculino.', ja: '男性の配偶者。', pt: 'um cônjuge masculino.' }],
    ['WIFE', { en: 'a female spouse.', it: 'una coniuge femminile.', fr: 'une conjointe féminine.', de: 'eine weibliche Ehepartnerin.', es: 'una cónyuge femenina.', ja: '女性の配偶者。', pt: 'uma cônjuge feminina.' }],
    ['MARRY', { en: 'to become a spouse.', it: 'diventare un coniuge.', fr: 'devenir un conjoint.', de: 'ein Ehepartner werden.', es: 'volverse un cónyuge.', ja: '配偶者になる。', pt: 'tornar-se um cônjuge.' }],
    ['GRANDPARENT', { en: "a parent's parent.", it: 'un genitore di un genitore.', fr: "un parent d'un parent.", de: 'ein Elternteil eines Elternteils.', es: 'un progenitor de un progenitor.', ja: '親の親。', pt: 'um progenitor de um progenitor.' }],
    ['GRANDFATHER', { en: "a parent's father.", it: 'il padre di un genitore.', fr: "le père d'un parent.", de: 'der Vater eines Elternteils.', es: 'el padre de un progenitor.', ja: '親の父親。', pt: 'o pai de um progenitor.' }],
    ['GRANDMOTHER', { en: "a parent's mother.", it: 'la madre di un genitore.', fr: "la mère d'un parent.", de: 'die Mutter eines Elternteils.', es: 'la madre de un progenitor.', ja: '親の母親。', pt: 'a mãe de um progenitor.' }],
    ['GRANDCHILD', { en: "a child's child.", it: 'un figlio di un figlio.', fr: "un enfant d'un enfant.", de: 'ein Kind eines Kindes.', es: 'un hijo de un hijo.', ja: '子供の子供。', pt: 'um filho de um filho.' }],
    ['GRANDSON', { en: 'a male grandchild.', it: 'un nipote maschile.', fr: 'un petit-enfant masculin.', de: 'ein männliches Enkelkind.', es: 'un nieto masculino.', ja: '男性の孫。', pt: 'um neto masculino.' }],
    ['GRANDDAUGHTER', { en: 'a female grandchild.', it: 'una nipote femminile.', fr: 'un petit-enfant féminin.', de: 'ein weibliches Enkelkind.', es: 'una nieta femenina.', ja: '女性の孫。', pt: 'uma neta feminina.' }],
    ['UNCLE', { en: "a parent's brother.", it: 'un fratello di un genitore.', fr: "un frère d'un parent.", de: 'ein Bruder eines Elternteils.', es: 'un hermano de un progenitor.', ja: '親の兄弟。', pt: 'um irmão de um progenitor.' }],
    ['AUNT', { en: "a parent's sister.", it: 'una sorella di un genitore.', fr: "une sœur d'un parent.", de: 'eine Schwester eines Elternteils.', es: 'una hermana de un progenitor.', ja: '親の姉妹。', pt: 'uma irmã de um progenitor.' }],
    ['COUSIN', { en: "a parent's sibling's child.", it: 'un figlio di un fratello di un genitore.', fr: "un enfant d'un frère d'un parent.", de: 'ein Kind eines Geschwisters eines Elternteils.', es: 'un hijo de un hermano de un progenitor.', ja: '親の兄弟の子供。', pt: 'um filho de um irmão de um progenitor.' }],
    ['NEPHEW', { en: "a sibling's son.", it: 'un figlio di un fratello.', fr: "un fils d'un frère.", de: 'ein Sohn eines Geschwisters.', es: 'un hijo de un hermano.', ja: '兄弟の息子。', pt: 'um filho de um irmão.' }],
    ['NIECE', { en: "a sibling's daughter.", it: 'una figlia di un fratello.', fr: "une fille d'un frère.", de: 'eine Tochter eines Geschwisters.', es: 'una hija de un hermano.', ja: '兄弟の娘。', pt: 'uma filha de um irmão.' }],
    ['MOTHER_IN_LAW', { en: "a spouse's mother.", it: 'la madre di un coniuge.', fr: "la mère d'un conjoint.", de: 'die Mutter eines Ehepartners.', es: 'la madre de un cónyuge.', ja: '配偶者の母親。', pt: 'a mãe de um cônjuge.' }],
    ['FATHER_IN_LAW', { en: "a spouse's father.", it: 'il padre di un coniuge.', fr: "le père d'un conjoint.", de: 'der Vater eines Ehepartners.', es: 'el padre de un cónyuge.', ja: '配偶者の父親。', pt: 'o pai de um cônjuge.' }],
    ['SON_IN_LAW', { en: "a child's husband.", it: 'il marito di un figlio.', fr: "le mari d'un enfant.", de: 'der Ehemann eines Kindes.', es: 'el marido de un hijo.', ja: '子供の夫。', pt: 'o marido de um filho.' }],
    ['DAUGHTER_IN_LAW', { en: "a child's wife.", it: 'la moglie di un figlio.', fr: "l'épouse d'un enfant.", de: 'die Ehefrau eines Kindes.', es: 'la esposa de un hijo.', ja: '子供の妻。', pt: 'a esposa de um filho.' }],
    ['BROTHER_IN_LAW', { en: "a spouse's brother.", it: 'il fratello di un coniuge.', fr: "le frère d'un conjoint.", de: 'der Bruder eines Ehepartners.', es: 'el hermano de un cónyuge.', ja: '配偶者の兄弟。', pt: 'o irmão de um cônjuge.' }],
    ['SISTER_IN_LAW', { en: "a spouse's sister.", it: 'la sorella di un coniuge.', fr: "la sœur d'un conjoint.", de: 'die Schwester eines Ehepartners.', es: 'la hermana de un cónyuge.', ja: '配偶者の姉妹。', pt: 'a irmã de um cônjuge.' }],
    ['STEPFATHER', { en: "a mother's husband who is not a father.", it: 'un marito di una madre che non è un padre.', fr: "un mari d'une mère qui n'est pas un père.", de: 'ein Ehemann einer Mutter, der kein Vater ist.', es: 'un marido de una madre que no es un padre.', ja: '父親ではない母親の夫。', pt: 'um marido de uma mãe que não é um pai.' }],
    ['STEPMOTHER', { en: "a father's wife who is not a mother.", it: 'una moglie di un padre che non è una madre.', fr: "une épouse d'un père qui n'est pas une mère.", de: 'eine Ehefrau eines Vaters, die keine Mutter ist.', es: 'una esposa de un padre que no es una madre.', ja: '母親ではない父親の妻。', pt: 'uma esposa de um pai que não é uma mãe.' }],
    ['PARTNER', { en: 'a person with whom one lives together.', it: 'una persona con la quale si abita insieme.', fr: 'une personne avec laquelle on habite ensemble.', de: 'eine Person, mit der man zusammen wohnt.', es: 'una persona con la que se vive junto.', ja: '一緒に住む人。', pt: 'uma pessoa com a qual se mora junto.' }],
    ['BOYFRIEND', { en: 'a male partner.', it: 'un compagno maschile.', fr: 'un compagnon masculin.', de: 'ein männlicher Partner.', es: 'una pareja masculina.', ja: '男性のパートナー。', pt: 'um companheiro masculino.' }],
    ['GIRLFRIEND', { en: 'a female partner.', it: 'una compagna femminile.', fr: 'une compagne féminine.', de: 'eine weibliche Partnerin.', es: 'una pareja femenina.', ja: '女性のパートナー。', pt: 'uma companheira feminina.' }],
    ['FIANCE', { en: 'a person who one is about to marry.', it: 'una persona che si sta per sposare.', fr: "une personne qu'on est sur le point d'épouser.", de: 'eine Person, die man im Begriff zu heiraten ist.', es: 'una persona con la que uno está a punto de casarse.', ja: '結婚しようとしている人。', pt: 'uma pessoa com a qual se está prestes a casar.' }],
    ['FRIEND', { en: 'a person who one knows well.', it: 'una persona che si conosce bene.', fr: "une personne qu'on connaît bien.", de: 'eine Person, die man gut kennt.', es: 'una persona que se conoce bien.', ja: 'よく知る人。', pt: 'uma pessoa que se conhece bem.' }],
  ])('%s', (concept, rendered) => {
    expect(definitionAll(concept)).toEqual(rendered);
  });
});

// ── Whose relative it is (D2, D3, D4) ─────────────────────────────────

describe('Japanese names one\'s own relative with one word and another\'s with another', () => {
  // 母 is my mother, お母さん is yours, and a mother who is nobody's in particular is 母親 — three
  // words for one concept, which is why they are three stored columns and not a prefix rule. 私の
  // drops in front of one's own: the word already says whose it is.
  test('mother: 母 / お母さん / 母親, and the 私の that goes', () => {
    expect(runs('MOTHER', { possessor: of('1') })).toEqual({
      en: 'my mother runs.', it: 'mia madre corre.', fr: 'ma mère court.', de: 'meine Mutter läuft.',
      es: 'mi madre corre.', ja: '母は走ります。', pt: 'a minha mãe corre.',
    });
    expect(runs('MOTHER', { possessor: of('2') })).toMatchObject({ ja: 'あなたのお母さんは走ります。' });
    expect(runs('MOTHER', { definiteness: 'indefinite' })).toMatchObject({ ja: '母親は走ります。' });
    // 私たちの stays: what it adds is that the relative is shared.
    expect(runs('MOTHER', { possessor: of('1', 'plural') })).toMatchObject({ ja: '私たちの母は走ります。' });
  });

  test('a possessor outside the family is honoured, a cat is not', () => {
    expect(runs('MOTHER', { possessor: np('BOY') })).toMatchObject({
      ja: '男の子のお母さんは走ります。', de: 'die Mutter des Jungen läuft.',
    });
    expect(runs('MOTHER', { possessor: np('CAT') })).toMatchObject({ ja: '猫の母は走ります。' });
  });

  test('husband, wife and son each split their own way', () => {
    expect(runs('WIFE', { possessor: of('1') })).toMatchObject({ ja: '妻は走ります。' });
    expect(runs('WIFE', { possessor: of('2') })).toMatchObject({ ja: 'あなたの奥さんは走ります。' });
    expect(runs('HUSBAND', { possessor: of('1') })).toMatchObject({ ja: '夫は走ります。' });
    expect(runs('HUSBAND', { possessor: of('2') })).toMatchObject({ ja: 'あなたのご主人は走ります。' });
    expect(runs('SON', { possessor: of('1') })).toMatchObject({ ja: '息子は走ります。' });
    expect(runs('SON', { possessor: of('2') })).toMatchObject({ ja: 'あなたの息子さんは走ります。' });
  });

  // FAMILY is a group, not a relative: it takes the honorific but keeps 私の, where a kin noun drops it.
  test('a family is ご家族 when it is somebody else\'s, and keeps its 私の', () => {
    expect(runs('FAMILY', { possessor: of('1') })).toMatchObject({ ja: '私の家族は走ります。' });
    expect(runs('FAMILY', { possessor: of('2') })).toMatchObject({ ja: 'あなたのご家族は走ります。' });
  });

  // D13: casual speech has one word for everyone's mother, so both rules follow the lexeme.
  test('MOM is お母さん whoever\'s mother she is, and Italian keeps its article', () => {
    expect(runs('MOM', { possessor: of('1') })).toMatchObject({ ja: 'お母さんは走ります。', it: 'la mia mamma corre.' });
    expect(runs('MOM', { possessor: of('2') })).toMatchObject({ ja: 'あなたのお母さんは走ります。' });
  });

  // D3: one's own all the way down the chain, and someone else's all the way down.
  test('the chain carries whose family it is through a genitive', () => {
    const wifeOfBrother = (person: '1' | '2') =>
      sayAll(clause(np('WIFE', { possessor: np('BROTHER', { adjectives: ['ELDER'], possessor: of(person) }) }), 'RUN'));
    expect(wifeOfBrother('1')).toMatchObject({ ja: '兄の妻は走ります。', de: 'die Frau meines älteren Bruders läuft.' });
    expect(wifeOfBrother('2')).toMatchObject({ ja: 'あなたのお兄さんの奥さんは走ります。' });
  });

  // D4: 私の drops before one's own kin noun and nowhere else — a book is not a relative.
  test('the dropped 私の is the kin noun\'s, not every noun\'s', () => {
    expect(sayAll(clause(np('FIRST_PERSON'), 'LOVE', { directObject: np('WIFE', { possessor: of('1') }) })))
      .toMatchObject({ ja: '私は妻を愛しています。', es: 'amo a mi esposa.' });
    expect(sayAll(clause(np('FIRST_PERSON'), 'SEE', { directObject: np('BOOK', { possessor: of('1') }) })))
      .toMatchObject({ ja: '私は私の本を見ます。' });
  });
});

// ── One word for the noun and the adjective (D5) ──────────────────────

describe('Japanese fuses ELDER and YOUNGER into the kin noun', () => {
  // 兄 is an older brother and 弟 a younger one: Japanese has no word for a brother of unstated age,
  // where the other six say it with an adjective. The honorific has its own fused word (お兄さん).
  test('brother and sister, one\'s own and another\'s', () => {
    expect(runs('BROTHER', { adjectives: ['ELDER'], possessor: of('1') })).toEqual({
      en: 'my older brother runs.', it: 'il mio fratello maggiore corre.', fr: 'mon frère aîné court.',
      de: 'mein älterer Bruder läuft.', es: 'mi hermano mayor corre.', ja: '兄は走ります。',
      pt: 'o meu irmão mais velho corre.',
    });
    expect(runs('BROTHER', { adjectives: ['ELDER'], possessor: of('2') })).toMatchObject({ ja: 'あなたのお兄さんは走ります。' });
    expect(runs('BROTHER', { adjectives: ['YOUNGER'], possessor: of('1') })).toMatchObject({ ja: '弟は走ります。', fr: 'mon frère cadet court.' });
    expect(runs('SISTER', { adjectives: ['ELDER'], possessor: of('1') })).toMatchObject({ ja: '姉は走ります。' });
    expect(runs('SISTER', { adjectives: ['YOUNGER'], possessor: of('1') })).toMatchObject({ ja: '妹は走ります。', fr: 'ma sœur cadette court.' });
  });

  test('a brother-in-law fuses too, and a son does not', () => {
    expect(runs('BROTHER_IN_LAW', { adjectives: ['ELDER'], possessor: of('1') })).toMatchObject({ ja: '義兄は走ります。' });
    // No column for the pair, so the adjective is said as itself: 上の息子, the older son.
    expect(runs('SON', { adjectives: ['ELDER'], possessor: of('1') })).toMatchObject({ ja: '上の息子は走ります。' });
  });

  test('the six other languages decline the adjective in every slot', () => {
    const elderBrother = (extra: Partial<NounPhrase>) => np('BROTHER', { adjectives: ['ELDER'], possessor: of('1'), ...extra });
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: elderBrother({}) })))
      .toMatchObject({ de: 'der Kater sieht meinen älteren Bruder.', es: 'el gato ve a mi hermano mayor.' });
    expect(sayAll(clause(np('CAT'), 'GIVE', {
      directObject: np('BOOK', { definiteness: 'indefinite' }),
      complements: { terminus: { phrase: elderBrother({}) } },
    }))).toMatchObject({ de: 'der Kater gibt meinem älteren Bruder ein Buch.' });
    // cadet is the French irregular the adjective rule would have given *cadetes.
    expect(said('COUSIN', { gender: 'fem', number: 'plural', adjectives: ['YOUNGER'] }))
      .toMatchObject({ fr: 'les cousines cadettes.', it: 'le cugine minori.', pt: 'as primas mais novas.' });
  });
});

// ── The word an owner shortens (D6) ───────────────────────────────────

describe('French and German shorten the spouse once she has an owner', () => {
  // "ma femme" but "une épouse", "meine Frau" but "eine Ehefrau": without a possessor the short word
  // reads as "woman". It applies under any possessor that names somebody in particular.
  test('a wife is femme / Frau under a possessor and épouse / Ehefrau without one', () => {
    expect(runs('WIFE', { possessor: of('1') })).toMatchObject({ fr: 'ma femme court.', de: 'meine Frau läuft.' });
    expect(runs('WIFE', { possessor: np('BOY') })).toMatchObject({ fr: 'la femme du garçon court.', de: 'die Frau des Jungen läuft.' });
    expect(runs('WIFE', { definiteness: 'indefinite' })).toMatchObject({ fr: 'une épouse court.', de: 'eine Ehefrau läuft.' });
  });

  // A definition's possessor is a kind of person, not a person, so the citation form stays — which is
  // what keeps "a child's wife" from reading "the woman of a child" (localization B73).
  test('an indefinite possessor is nobody in particular, and leaves the long word', () => {
    expect(definitionAll('DAUGHTER_IN_LAW')).toMatchObject({
      fr: "l'épouse d'un enfant.", de: 'die Ehefrau eines Kindes.', ja: '子供の妻。',
    });
    expect(definitionAll('GRANDMOTHER')).toMatchObject({ ja: '親の母親。' });
  });
});

// ── Plurals that are another word (D7) ────────────────────────────────

describe('a plural that is another word', () => {
  test('two parents are Eltern, padres, pais and 両親', () => {
    expect(runs('PARENT', { number: 'plural', possessor: of('1') })).toEqual({
      en: 'my parents run.', it: 'i miei genitori corrono.', fr: 'mes parents courent.',
      de: 'meine Eltern laufen.', es: 'mis padres corren.', ja: '両親は走ります。', pt: 'os meus pais correm.',
    });
    // The honorific has a plural of its own, ご両親.
    expect(runs('PARENT', { number: 'plural', possessor: of('2') })).toMatchObject({ ja: 'あなたのご両親は走ります。' });
  });

  test('siblings and grandparents are the other three', () => {
    expect(runs('SIBLING', { number: 'plural', possessor: of('1') }))
      .toMatchObject({ fr: 'mes frères et sœurs courent.', de: 'meine Geschwister laufen.' });
    expect(runs('GRANDPARENT', { number: 'plural', possessor: of('1') }))
      .toMatchObject({ de: 'meine Großeltern laufen.', pt: 'os meus avós correm.' });
  });
});

// ── The German adjectival noun (D8) ───────────────────────────────────

describe('a German relative declines like an adjective', () => {
  // *der Verwandte*, *ein Verwandter*, *einen Verwandten*, *meinem Verwandten*, bare plural
  // *Verwandte*: the ending its determiner and case select, and none of the noun rules.
  test('every determiner and case', () => {
    expect(said('RELATIVE')).toMatchObject({ de: 'der Verwandte.' });
    expect(runs('RELATIVE', { definiteness: 'indefinite' })).toMatchObject({ de: 'ein Verwandter läuft.' });
    expect(runs('RELATIVE', { definiteness: 'indefinite', gender: 'fem' })).toMatchObject({ de: 'eine Verwandte läuft.' });
    expect(said('RELATIVE', { number: 'plural' })).toMatchObject({ de: 'die Verwandten.' });
    expect(runs('RELATIVE', { definiteness: 'bare', number: 'plural' })).toMatchObject({ de: 'Verwandte laufen.' });
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('RELATIVE') }))).toMatchObject({ de: 'der Kater sieht den Verwandten.' });
    // The genitive takes the adjective ending too, never the noun's -(e)s.
    expect(sayAll(clause(np('BOOK', { possessor: np('RELATIVE') }), 'BURN'))).toMatchObject({ de: 'das Buch des Verwandten brennt.' });
    // The dative of a complement, which B68's seeding found reading "*meinem Verwandt".
    expect(sayAll(clause(np('CAT'), 'GIVE', {
      directObject: np('BOOK', { definiteness: 'indefinite' }),
      complements: { terminus: { phrase: np('RELATIVE', { possessor: of('1') }) } },
    }))).toMatchObject({ de: 'der Kater gibt meinem Verwandten ein Buch.' });
    // And the "von" + dative a genitive that would not show takes: FAMILY's own gloss.
    expect(definitionAll('FAMILY')).toMatchObject({ de: 'eine Gruppe von Verwandten.' });
  });

  test('a fiancé is the same declension', () => {
    expect(runs('FIANCE', { definiteness: 'indefinite' })).toMatchObject({ de: 'ein Verlobter läuft.' });
    expect(said('FIANCE', { number: 'plural' })).toMatchObject({ de: 'die Verlobten.' });
    expect(runs('FIANCE', { possessor: of('1') })).toMatchObject({ de: 'mein Verlobter läuft.', it: 'il mio fidanzato corre.' });
  });
});

// ── The Italian article (D9) ──────────────────────────────────────────

describe('Italian drops the article before a possessive on a kin noun', () => {
  // The flag is the lexeme's, not the concept's: "mia madre" but "la mia mamma", and the article
  // comes back in the plural, with loro, and under an adjective (A85).
  test('the flagged words drop it and the unflagged keep it', () => {
    expect(runs('HUSBAND', { possessor: of('1') })).toMatchObject({ it: 'mio marito corre.' });
    expect(runs('COUSIN', { gender: 'fem', possessor: of('1') })).toMatchObject({ it: 'mia cugina corre.' });
    expect(runs('FIANCE', { possessor: of('1') })).toMatchObject({ it: 'il mio fidanzato corre.' });
    expect(runs('FAMILY', { possessor: of('1') })).toMatchObject({ it: 'la mia famiglia corre.' });
    expect(runs('BROTHER', { number: 'plural', possessor: of('1') })).toMatchObject({ it: 'i miei fratelli corrono.' });
    expect(runs('FATHER', { possessor: of('3', 'plural') })).toMatchObject({ it: 'il loro padre corre.' });
  });
});

// ── MARRY (P11 §4) ────────────────────────────────────────────────────

describe('MARRY takes its spouse the way each language does', () => {
  // Data only in six languages: Spanish casarse is reflexive and takes con, Portuguese com, and
  // Japanese と — the columns the engine already reads.
  test('my son marries your daughter', () => {
    expect(sayAll(clause(np('SON', { possessor: of('1') }), 'MARRY', { directObject: np('DAUGHTER', { possessor: of('2') }) }))).toEqual({
      en: 'my son marries your daughter.', it: 'mio figlio sposa tua figlia.', fr: 'mon fils épouse ta fille.',
      de: 'mein Sohn heiratet deine Tochter.', es: 'mi hijo se casa con tu hija.',
      ja: '息子はあなたの娘さんと結婚します。', pt: 'o meu filho casa com a sua filha.',
    });
  });
});

// ── The Spanish personal "a" tener does not take (B69) ────────────────

describe('having somebody takes no personal a, seeing them does', () => {
  // The a marks the person an act reaches; having them is not doing anything to them. It is the
  // lexeme's flag, so the very same object keeps the a under ver.
  test('tiene los mismos padres, ve a los mismos padres', () => {
    const sameParents = np('PARENT', { number: 'plural', adjectives: ['SAME'] });
    expect(sayAll(clause(np('CAT'), 'HAVE', { directObject: sameParents }))).toMatchObject({ es: 'el gato tiene los mismos padres.' });
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: sameParents }))).toMatchObject({ es: 'el gato ve a los mismos padres.' });
    expect(definitionAll('SIBLING')).toMatchObject({ es: 'una persona que tiene los mismos padres.' });
  });
});

// ── Through the link (P11-E2 D3) ──────────────────────────────────────

describe('whose family it is, read through a possessor linked to the subject (P11-E2 D3)', () => {
  const link = { kind: 'coreferent', slot: 'subject' } as const;
  const myBrother = np('BROTHER', { adjectives: ['ELDER'], possessor: of('1') });

  // The genitive chain already carried it: my brother's mother is mine too, the boy's is not.
  test('my brother\'s mother is 兄の母, the boy\'s is 男の子のお母さん', () => {
    expect(runs('MOTHER', { possessor: myBrother })).toMatchObject({
      ja: '兄の母は走ります。', en: "my older brother's mother runs.", de: 'die Mutter meines älteren Bruders läuft.',
    });
    expect(runs('MOTHER', { possessor: np('BOY') })).toMatchObject({ ja: '男の子のお母さんは走ります。' });
  });

  // …and the link carries it the same way: "his" is my brother, so his mother is 母.
  test('my brother sees his mother: 自分の母, where the boy\'s is 自分のお母さん', () => {
    expect(sayAll(clause(myBrother, 'SEE', { directObject: np('MOTHER', { possessor: link }) }))).toEqual({
      en: 'my older brother sees his mother.', it: 'il mio fratello maggiore vede sua madre.',
      fr: 'mon frère aîné voit sa mère.', de: 'mein älterer Bruder sieht seine Mutter.',
      es: 'mi hermano mayor ve a su madre.', ja: '兄は自分の母を見ます。', pt: 'o meu irmão mais velho vê a sua mãe.',
    });
    expect(sayAll(clause(np('BOY'), 'SEE', { directObject: np('MOTHER', { possessor: link }) })))
      .toMatchObject({ ja: '男の子は自分のお母さんを見ます。', en: 'the boy sees his mother.' });
    // One link further down the chain: his mother's husband is the speaker's family too.
    expect(sayAll(clause(myBrother, 'SEE', { directObject: np('HUSBAND', { possessor: np('MOTHER', { possessor: link }) }) })))
      .toMatchObject({ ja: '兄は自分の母の夫を見ます。' });
  });

  // A group is the speaker's family only when every one of it is: my brother and my sister's mother is
  // 母, my brother and the boy's is お母さん.
  test('a coordinated subject is one\'s own family only when all of it is', () => {
    const mySister = np('SISTER', { adjectives: ['ELDER'], possessor: of('1') });
    expect(sayAll(clause({ conjuncts: [myBrother, mySister], conjunction: 'and' }, 'SEE', { directObject: np('MOTHER', { possessor: link }) }))).toEqual({
      en: 'my older brother and my older sister see their mother.',
      it: 'il mio fratello maggiore e la mia sorella maggiore vedono la loro madre.',
      fr: 'mon frère aîné et ma sœur aînée voient leur mère.',
      de: 'mein älterer Bruder und meine ältere Schwester sehen ihre Mutter.',
      es: 'mi hermano mayor y mi hermana mayor ven a su madre.', ja: '兄と姉は自分の母を見ます。',
      pt: 'o meu irmão mais velho e a minha irmã mais velha veem a sua mãe.',
    });
    expect(sayAll(clause({ conjuncts: [myBrother, np('BOY')], conjunction: 'and' }, 'SEE', { directObject: np('MOTHER', { possessor: link }) }))).toEqual({
      en: 'my older brother and the boy see their mother.',
      it: 'il mio fratello maggiore e il ragazzo vedono la loro madre.',
      fr: 'mon frère aîné et le garçon voient leur mère.',
      de: 'mein älterer Bruder und der Junge sehen ihre Mutter.',
      es: 'mi hermano mayor y el niño ven a su madre.', ja: '兄と男の子は自分のお母さんを見ます。',
      pt: 'o meu irmão mais velho e o menino veem a sua mãe.',
    });
  });

  // A subject relative binds to its head, which is my brother, so his mother is 母 there too.
  test('a subject relative on one\'s own relative binds to him', () => {
    const brother = np('BROTHER', { adjectives: ['ELDER'], possessor: of('1'), relative: { verbPhrase: { verb: 'SEE' }, directObject: np('MOTHER', { possessor: link }) } });
    expect(sayAll(clause(brother, 'RUN'))).toEqual({
      en: 'my older brother who sees his mother runs.', it: 'il mio fratello maggiore che vede sua madre corre.',
      fr: 'mon frère aîné qui voit sa mère court.', de: 'mein älterer Bruder, der seine Mutter sieht, läuft.',
      es: 'mi hermano mayor que ve a su madre corre.', ja: '自分の母を見る兄は走ります。',
      pt: 'o meu irmão mais velho que vê a sua mãe corre.',
    });
  });

  // The spouse splits the same way: my brother's wife is 妻, the man's 奥さん.
  test('my brother sees his wife: 自分の妻, where the man\'s is 自分の奥さん', () => {
    expect(sayAll(clause(myBrother, 'SEE', { directObject: np('WIFE', { possessor: link }) }))).toEqual({
      en: 'my older brother sees his wife.', it: 'il mio fratello maggiore vede sua moglie.',
      fr: 'mon frère aîné voit sa femme.', de: 'mein älterer Bruder sieht seine Frau.',
      es: 'mi hermano mayor ve a su esposa.', ja: '兄は自分の妻を見ます。',
      pt: 'o meu irmão mais velho vê a sua esposa.',
    });
    expect(sayAll(clause(np('MAN'), 'SEE', { directObject: np('WIFE', { possessor: link }) }))).toEqual({
      en: 'the man sees his wife.', it: "l'uomo vede sua moglie.", fr: "l'homme voit sa femme.",
      de: 'der Mann sieht seine Frau.', es: 'el hombre ve a su esposa.', ja: '男は自分の奥さんを見ます。',
      pt: 'o homem vê a sua esposa.',
    });
  });

  // Down the chain from someone else's: the boy's mother is お母さん, and her sister the plain 姉妹.
  test('the boy sees his mother\'s sister', () => {
    expect(sayAll(clause(np('BOY'), 'SEE', { directObject: np('SISTER', { possessor: np('MOTHER', { possessor: link }) }) }))).toEqual({
      en: "the boy sees his mother's sister.", it: 'il ragazzo vede la sorella di sua madre.',
      fr: 'le garçon voit la sœur de sa mère.', de: 'der Junge sieht die Schwester seiner Mutter.',
      es: 'el niño ve a la hermana de su madre.', ja: '男の子は自分のお母さんの姉妹を見ます。',
      pt: 'o menino vê a irmã da sua mãe.',
    });
  });

  // The narrowing P11's seeding found stays: a possessor nobody in particular takes neither word.
  test('an indefinite possessor still leaves the head its citation form', () => {
    expect(runs('MOTHER', { possessor: np('PARENT', { definiteness: 'indefinite' }) })).toMatchObject({ ja: '親の母親は走ります。' });
  });
});
