import { describe, expect, it } from 'vitest';
import type { Concept, LanguageCode } from '@signi/shared';
import { ConceptWord } from '../../src/i18n/ConceptWord.tsx';
import { renderWithProviders, type SeededStrings } from '../render.tsx';

const CAT: Concept = {
  id: 'CAT',
  role: 'noun',
  description: 'a small domesticated feline',
  label: 'cat',
  labels: { en: 'cat', it: 'gatto', ja: '猫' },
  readings: { ja: 'ねこ' },
};

// A reading seeded for a language whose word is not: the word falls back to English.
const DOG: Concept = {
  id: 'DOG',
  role: 'noun',
  description: 'a domesticated canine',
  label: 'dog',
  labels: { en: 'dog' },
  readings: { ja: 'いぬ' },
};

const I: Concept = {
  id: 'I',
  role: 'pronoun',
  description: 'the speaker',
  label: 'I',
  labels: { en: 'I', ja: '私' },
  readings: { ja: 'わたし' },
  person: '1',
};

function renderWord(concept: Concept, language: LanguageCode, strings: SeededStrings = {}) {
  localStorage.setItem('signi:uiLanguage', language);
  return renderWithProviders(<ConceptWord concept={concept} />, { strings });
}

describe('ConceptWord', () => {
  it('renders just the bare word in the UI language when it has no reading', () => {
    const { container } = renderWord(CAT, 'it');

    expect(container.innerHTML).toBe('gatto');
  });

  it('sets the reading as furigana over a Japanese word', () => {
    const { container } = renderWord(CAT, 'ja');

    const ruby = container.querySelector('ruby');
    expect(container).toHaveTextContent(/^猫ねこ$/);
    expect(ruby).toHaveTextContent(/^猫ねこ$/);
    expect(ruby?.querySelector('rt')).toHaveTextContent(/^ねこ$/);
  });

  it('leaves out the reading when the word fell back to English', () => {
    const { container } = renderWord(DOG, 'ja');

    expect(container.innerHTML).toBe('dog');
  });

  it('names a pronoun by the person it stands for, in the UI language, without a reading', () => {
    const { container } = renderWord(I, 'ja', { 'pronoun.person.1': { ja: '一人称' } });

    expect(container.innerHTML).toBe('一人称');
  });
});
