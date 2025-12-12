import { createTheme } from '@mui/material/styles';

// Tema de Pastelería 1000 Sabores - Inspirado en colores cálidos de repostería
export const theme = createTheme({
  palette: {
    primary: {
      main: '#8B4513', // Chocolate / Marrón
      light: '#A0522D',
      dark: '#5D2E0F',
      contrastText: '#fff',
    },
    secondary: {
      main: '#FFC0CB', // Rosa Suave / Crema
      light: '#FFD5DC',
      dark: '#FF9EB3',
      contrastText: '#5D4037',
    },
    background: {
      default: '#FFF5E1', // Crema Pastel
      paper: '#FFFFFF',
    },
    text: {
      primary: '#5D4037', // Marrón Oscuro
      secondary: '#8D6E63', // Marrón Claro
    },
    success: {
      main: '#81C784', // Verde suave
    },
    error: {
      main: '#E57373', // Rojo suave
    },
    warning: {
      main: '#FFB74D', // Naranja suave
    },
    info: {
      main: '#64B5F6', // Azul suave
    },
  },
  typography: {
    fontFamily: '"Lato", "Roboto", sans-serif',
    h1: {
      fontFamily: '"Pacifico", cursive', // Google Font - decorativa para títulos
      fontWeight: 400,
      color: '#8B4513',
    },
    h2: {
      fontFamily: '"Pacifico", cursive',
      fontWeight: 400,
      color: '#8B4513',
    },
    h3: {
      fontFamily: '"Lato", sans-serif',
      fontWeight: 700,
      color: '#5D4037',
    },
    h4: {
      fontFamily: '"Lato", sans-serif',
      fontWeight: 700,
      color: '#5D4037',
    },
    h5: {
      fontFamily: '"Lato", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Lato", sans-serif',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontFamily: '"Lato", sans-serif',
    },
    body1: {
      fontFamily: '"Lato", sans-serif',
    },
    body2: {
      fontFamily: '"Lato", sans-serif',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 24px',
          boxShadow: '0 2px 8px rgba(139, 69, 19, 0.15)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(139, 69, 19, 0.25)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(139, 69, 19, 0.15)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
});