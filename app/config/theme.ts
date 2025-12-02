import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#8880ffff', // Rosado Pastel (Tu color de marca)
      contrastText: '#fff',
    },
    secondary: {
      main: '#f50057', // Color de acento
    },
    background: {
      default: '#f8f9fa', // Fondo gris suave
      paper: '#ffffff',   // Tarjetas blancas
    },
    text: {
      primary: '#2c3e50',
    }
  },
  typography: {
    fontFamily: '"Poppins", "Nunito", "Roboto", sans-serif',
    button: {
      textTransform: 'none', // Botones con texto normal
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});