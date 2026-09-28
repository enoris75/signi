import type { LanguageColumn } from '../types.js';
import { language } from './helpers.js';

// The Lithuanian nouns (P18-E5), keyed as Polish's are (style-lt.md): every case in both numbers,
// written with the declension-class helpers. Every form is (verify) until the native review (P18-E12).
export const LT_NOUNS: LanguageColumn = {
  // P18-E3: the language of the row. The name is the people's genitive plural + *kalba* (P18 §3).
  LITHUANIAN: language('lietuvių'),
};
