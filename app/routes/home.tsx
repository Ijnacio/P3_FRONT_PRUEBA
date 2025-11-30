// app/routes/home.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router"; // Ojo: en v7 se importa de "react-router"
import { useAuth } from "../context/AuthContext";
import { Button, Container, Box, Typography, Paper } from "@mui/material";
import { Storefront } from "@mui/icons-material"; // Asegúrate de tener @mui/icons-material instalado

export default function Home() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // redirigir segun el rol del usuario
  useEffect(() => {
    if (!isLoading && user) {
      if (user.rol === 'admin') navigate('/admin');
      else navigate('/caja');
    }
  }, [user, isLoading, navigate]);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #fce4ec 0%, #fff 100%)", // Fondo rosado suave
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 5, textAlign: "center", borderRadius: 4 }}>
          <Box sx={{ mb: 3, display: "inline-flex", p: 2, borderRadius: "50%", bgcolor: "primary.light", color: "white" }}>
            <Storefront sx={{ fontSize: 60 }} />
          </Box>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="primary">
            1000 Sabores
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Sistema de Punto de Venta y Gestión de Pastelería.
          </Typography>
          
          <Box sx={{ mt: 4 }}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate("/login")}
              sx={{ px: 5, py: 1.5, fontSize: "1.1rem" }}
            >
              Ingresar al Sistema
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}