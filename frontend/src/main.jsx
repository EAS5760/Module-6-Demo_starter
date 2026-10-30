import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { App } from './App';
import './styles.css';
const theme = createTheme({
  palette: {
    primary: { main: '#173d39', light: '#e2efe9', dark: '#0c2926' },
    background: { default: '#f5f4ef', paper: '#fffefa' }
  },
  typography: { fontFamily: 'Inter, system-ui, sans-serif' },
  shape: { borderRadius: 12 }
});
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}><CssBaseline /><App /></ThemeProvider>
  </React.StrictMode>
);
