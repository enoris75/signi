import { Box, MenuItem, Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { HTMLAttributes } from 'react';
import TranslateIcon from '@mui/icons-material/Translate';
import type { LanguageCode } from '@signi/shared';
import { READY_LANGUAGES } from '@signi/shared';
import { Flag } from '../i18n/flags.tsx';
import { useUiLanguage } from '../i18n/LanguageContext.tsx';
import { useUiString } from '../i18n/useUiString.ts';

// Header control for choosing the app's UI language. Its option labels are rendered by the
// engine in the current UI language (the `language.*` entries of the UI-string catalog) —
// the same translation path as the rest of the app. Only a ready language is offered: a preview one
// (P10-E1) is a row of the translations panel, not yet a language to live in.
export function LanguageSelector() {
  const { uiLanguage, setUiLanguage } = useUiLanguage();
  const t = useUiString();

  const handleChange = (e: SelectChangeEvent<LanguageCode>) => {
    setUiLanguage(e.target.value as LanguageCode);
  };

  return (
    <Select<LanguageCode>
      value={uiLanguage}
      onChange={handleChange}
      size="small"
      startAdornment={
        <TranslateIcon sx={{ fontSize: '1rem', color: 'text.secondary', mr: 0.75 }} />
      }
      // Through inputProps, so the name lands on the combobox itself rather than its outer box.
      inputProps={{ 'aria-label': t('language.selector') }}
      // The name follows the language the selector sets, so tests find the combobox by its test id.
      SelectDisplayProps={{ 'data-testid': 'language-selector' } as HTMLAttributes<HTMLDivElement>}
      sx={{
        fontFamily: '"Inter", sans-serif',
        fontSize: '0.8rem',
        '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 0.75, py: 0.75 },
      }}
    >
      {READY_LANGUAGES.map((code) => (
        <MenuItem
          key={code}
          value={code}
          sx={{ fontFamily: '"Inter", sans-serif', fontSize: '0.85rem', gap: 1 }}
        >
          <Box component="span" sx={{ fontSize: '1rem', lineHeight: 1 }}>
            <Flag language={code} />
          </Box>
          {t(`language.${code}`)}
        </MenuItem>
      ))}
    </Select>
  );
}
