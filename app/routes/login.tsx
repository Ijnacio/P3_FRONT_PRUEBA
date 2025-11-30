// app/routes/login.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router"; // Importación correcta para v7
import { useAuth } from "../context/AuthContext";
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  TextField, 
  Typography, 
  Alert, 
  InputAdornment,
  CircularProgress,
  Container
} from "@mui/material";
import { Person, Lock, Cake } from "@mui/icons-material";

export default function Login() {
  const [rut, setRut] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // si ya esta logueado mandarlo directo a la caja
  useEffect(() => {
    if (user) {
      navigate('/caja');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(rut, password);
    } catch (err: any) {
      console.error("Error Login:", err);
      
      if (err.message === "Network Error" || !err.response) {
        setError("No se pudo conectar con el servidor. Revisa que el Backend esté corriendo.");
      } else if (err.response?.status === 401) {
        setError("RUT o contraseña incorrectos.");
      } else {
        setError(`Error del servidor: ${err.response?.data?.message || err.message}`);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f0f2f5",
      }}
    >
      <Container maxWidth="xs">
        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 4 }}>
            <Box 
              sx={{ 
                bgcolor: "primary.main", 
                color: "white", 
                width: 64, 
                height: 64, 
                borderRadius: "50%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                mb: 2,
                boxShadow: 2
              }}
            >
              <Cake fontSize="large" />
            </Box>
            <Typography variant="h5" fontWeight="bold" color="primary">
              1000 Sabores
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Acceso al Sistema
            </Typography>
          </Box>

          <CardContent sx={{ pt: 3, pb: 4, px: 3 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                
                {error && (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <TextField
                  label="RUT de Usuario"
                  variant="outlined"
                  fullWidth
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  required
                  placeholder="Ej: 1-9"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Contraseña"
                  type="password"
                  variant="outlined"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button 
                  type="submit" 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  disabled={isSubmitting}
                  sx={{ 
                    mt: 1, 
                    height: 48, 
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    textTransform: 'none'
                  }}
                >
                  {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Ingresar"}
                </Button>

                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: 'grey.50', 
                  borderRadius: 2, 
                  border: '1px solid', 
                  borderColor: 'grey.200' 
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Credenciales de prueba:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => {
                        setRut("1-9");
                        setPassword("admin123");
                      }}
                      sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      👤 Admin: 1-9 / admin123
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => {
                        setRut("2-7");
                        setPassword("vendedor123");
                      }}
                      sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      🛒 Vendedor: 2-7 / vendedor123
                    </Button>
                  </Box>
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}