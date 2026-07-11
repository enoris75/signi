import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import App from './App.tsx';
import { LanguageProvider } from './i18n/LanguageContext.tsx';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary:    { main: '#2c4a6e', light: '#4a7098', dark: '#1a2f46' },
    secondary:  { main: '#8b3e2a', light: '#b5614d', dark: '#5e2a1c' },
    success:    { main: '#3a6e3a' },
    warning:    { main: '#8b6914' },
    info:       { main: '#2a6e7c' },
    background: { default: '#f5efe4', paper: '#fdfaf4' },
    text:       { primary: '#1a1917', secondary: '#6b6459' },
    divider:    '#ddd4c4',
  },
  typography: {
    fontFamily: '"Lora", "Georgia", serif',
    h1: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 800 },
    h2: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 },
    h3: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 },
    h4: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 },
    h5: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 },
    h6: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600 },
    subtitle1: { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' },
    subtitle2: { fontFamily: '"Inter", sans-serif', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em' },
    overline:  { fontFamily: '"Inter", sans-serif', letterSpacing: '0.14em', fontWeight: 700, fontSize: '0.65rem' },
    body1:     { fontFamily: '"Lora", Georgia, serif', lineHeight: 1.75 },
    body2:     { fontFamily: '"Inter", sans-serif', lineHeight: 1.6, fontSize: '0.875rem' },
    caption:   { fontFamily: '"Inter", sans-serif', letterSpacing: '0.02em', fontSize: '0.75rem' },
    button:    { fontFamily: '"Inter", sans-serif', letterSpacing: '0.05em', textTransform: 'none' as const },
  },
  shape: { borderRadius: 4 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontFamily: '"Inter", sans-serif', borderRadius: 4, letterSpacing: '0.02em' },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: '#ddd4c4' },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { fontFamily: '"Inter", sans-serif' },
      },
    },
  },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
