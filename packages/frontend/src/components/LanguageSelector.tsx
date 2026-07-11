import { Box, MenuItem, Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import type { LanguageCode } from '@signi/shared';
import { LANGUAGES } from '@signi/shared';
import { FLAG } from '../i18n/flags.ts';
import { useUiLanguage } from '../i18n/LanguageContext.tsx';
import { useLanguageName } from '../i18n/useLanguageName.ts';

const LANGUAGE_CODES = Object.keys(LANGUAGES) as LanguageCode[];

// Header control for choosing the app's UI language. Its option labels are rendered by the
// engine in the current UI language (fetched from /api/languages) — the same translation
// path as the rest of the app — falling back to the static English names while loading.
export function LanguageSelector() {
  const { uiLanguage, setUiLanguage } = useUiLanguage();
  const languageName = useLanguageName();

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
      aria-label="Interface language"
      sx={{
        fontFamily: '"Inter", sans-serif',
        fontSize: '0.8rem',
        '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 0.75, py: 0.75 },
      }}
    >
      {LANGUAGE_CODES.map((code) => (
        <MenuItem
          key={code}
          value={code}
          sx={{ fontFamily: '"Inter", sans-serif', fontSize: '0.85rem', gap: 1 }}
        >
          <Box component="span" sx={{ fontSize: '1rem', lineHeight: 1 }}>
            {FLAG[code]}
          </Box>
          {languageName(code)}
        </MenuItem>
      ))}
    </Select>
  );
}
