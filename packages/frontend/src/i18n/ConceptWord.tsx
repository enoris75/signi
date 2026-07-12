import { Box } from '@mui/material';
import type { Concept } from '@signi/shared';
import { conceptReading, conceptWord } from './conceptWord.ts';
import { useUiLanguage } from './LanguageContext.tsx';
import { useUiString } from './useUiString.ts';

/**
 * A concept's word as the pickers show it, carrying furigana when the UI language supplies a
 * reading (Japanese: 猫 with ねこ above it). It renders inline and inherits the size, family and
 * colour of the text around it, so a picker can drop it in wherever it used to interpolate the
 * bare word; without a reading it is exactly that bare word.
 */
export function ConceptWord({ concept }: { concept: Concept }) {
  const { uiLanguage } = useUiLanguage();
  const t = useUiString();
  const word = conceptWord(concept, uiLanguage, t);
  const reading = conceptReading(concept, uiLanguage);

  if (!reading) return <>{word}</>;

  return (
    <Box
      component="ruby"
      sx={{
        // The taller line-height on this inline box is what reserves the room the furigana sits
        // in; without it the reading collides with the row above in a tight list.
        lineHeight: 2,
        '& rt': {
          fontSize: '0.6em',
          fontStyle: 'normal',
          fontWeight: 400,
          userSelect: 'none',
        },
      }}
    >
      {word}
      <rt>{reading}</rt>
    </Box>
  );
}
