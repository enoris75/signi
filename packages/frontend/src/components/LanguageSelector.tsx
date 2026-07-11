import { Box, MenuItem, Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import TranslateIcon from '@mui/icons-material/Translate';
import type { LanguageCode } from '@signi/shared';
import { LANGUAGES } from '@signi/shared';
import { fetchLanguages } from '../api.ts';
import type { LanguageOption } from '../api.ts';
import { FLAG } from '../i18n/flags.ts';
import { useUiLanguage } from '../i18n/LanguageContext.tsx';

const LANGUAGE_CODES = Object.keys(LANGUAGES) as LanguageCode[];

// Uppercase the first character only (leaving multi-word labels alone). The engine renders
// language names lower-case outside English; a capitalised initial reads better in a menu
// and is a no-op for non-cased scripts (e.g. Japanese 日本語).
function capitalizeFirst(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

// Header control for choosing the app's UI language. Its option labels are rendered by the
// engine in the current UI language (fetched from /api/languages) — the same translation
// path as the rest of the app — falling back to the static English names while loading.
export function LanguageSelector() {
  const { uiLanguage, setUiLanguage } = useUiLanguage();
  const { data } = useQuery({
    queryKey: ['languages'],
    queryFn: fetchLanguages,
    staleTime: Infinity,
  });

  const byCode = new Map<LanguageCode, LanguageOption>(data?.map((o) => [o.code, o]));

  // The name of `code`'s language, rendered in the current UI language; static fallback.
  function label(code: LanguageCode): string {
    const text = byCode.get(code)?.translations.find((t) => t.language === uiLanguage)?.text;
    return text ? capitalizeFirst(text.replace(/[.。]\s*$/, '')) : LANGUAGES[code];
  }

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
          {label(code)}
        </MenuItem>
      ))}
    </Select>
  );
}
