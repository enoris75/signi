import { Box, MenuItem, Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import type { LanguageCode } from '@signi/shared';
import { LANGUAGES } from '@signi/shared';
import { FLAG } from '../i18n/flags.ts';
import { useUiLanguage } from '../i18n/LanguageContext.tsx';

const LANGUAGE_CODES = Object.keys(LANGUAGES) as LanguageCode[];

// Header control for choosing the app's UI language. For now it re-renders the
// engine-generated payoff; more UI strings can follow.
export function LanguageSelector() {
  const { uiLanguage, setUiLanguage } = useUiLanguage();

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
          {LANGUAGES[code]}
        </MenuItem>
      ))}
    </Select>
  );
}
