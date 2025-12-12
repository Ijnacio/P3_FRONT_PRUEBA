import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { 
  Box, Container, Typography, Paper, TextField, Button, Grid, Avatar, Card, CardContent, Divider, Chip
} from "@mui/material";
import { Person, Save, AdminPanelSettings, ShoppingBag, AttachMoney, Inventory, TrendingUp } from "@mui/icons-material";
import { updateProfile, getVentas, getProductos, getUsuarios } from "../../services/api";

export default function Perfil() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    rut: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  // Estadísticas para admin
  const [stats, setStats] = useState({
    totalVentas: 0,
    ventasHoy: 0,
    totalProductos: 0,
    totalUsuarios: 0,
    ingresosMes: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFormData({
      nombre: user.nombre || user.name || "",
      email: user.email || "",
      telefono: user.telefono || "",
      rut: user.rut || ""
    });
    
    // Cargar estadísticas solo si es admin
    if (user.rol === 'admin') {
      loadAdminStats();
    }
  }, [user, navigate]);

  const loadAdminStats = async () => {
    try {
      const [ventas, productos, usuarios] = await Promise.all([
        getVentas(),
        getProductos(),
        getUsuarios()
      ]);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const ventasHoy = Array.isArray(ventas) ? ventas.filter((v: any) => {
        const ventaDate = new Date(v.fechaVenta);
        ventaDate.setHours(0, 0, 0, 0);
        return ventaDate.getTime() === today.getTime();
      }).length : 0;
      
      const ingresosMes = Array.isArray(ventas) ? ventas
        .filter((v: any) => {
          const ventaDate = new Date(v.fechaVenta);
          return ventaDate.getMonth() === today.getMonth() && 
                 ventaDate.getFullYear() === today.getFullYear();
        })
        .reduce((sum: number, v: any) => sum + (v.montoTotal || 0), 0) : 0;
      
      setStats({
        totalVentas: Array.isArray(ventas) ? ventas.length : 0,
        ventasHoy,
        totalProductos: Array.isArray(productos) ? productos.length : 0,
        totalUsuarios: Array.isArray(usuarios) ? usuarios.length : 0,
        ingresosMes
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    try {
      setLoading(true);
      const updated = await updateProfile(formData);
      setUser(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al actualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth={user?.rol === 'admin' ? 'lg' : 'md'}>
        {/* Panel de Administrador */}
        {user?.rol === 'admin' && (
          <>
            <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'white' }}>
                <AdminPanelSettings sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    Panel de Administrador
                  </Typography>
                  <Typography variant="body1">
                    Bienvenido de vuelta, {user.nombre || user.name}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Estadísticas del Admin */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'white' }}>
                      <ShoppingBag sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {stats.totalVentas}
                        </Typography>
                        <Typography variant="body2">
                          Ventas Totales
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'white' }}>
                      <TrendingUp sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {stats.ventasHoy}
                        </Typography>
                        <Typography variant="body2">
                          Ventas Hoy
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'white' }}>
                      <Inventory sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {stats.totalProductos}
                        </Typography>
                        <Typography variant="body2">
                          Productos
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'white' }}>
                      <AttachMoney sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          ${Math.round(stats.ingresosMes / 1000)}K
                        </Typography>
                        <Typography variant="body2">
                          Ingresos del Mes
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />
          </>
        )}

        {/* Formulario de Perfil */}
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: user?.rol === 'admin' ? '#8B4513' : 'primary.main', 
              mb: 2 
            }}>
              {user?.rol === 'admin' ? (
                <AdminPanelSettings sx={{ fontSize: 50 }} />
              ) : (
                <Person sx={{ fontSize: 50 }} />
              )}
            </Avatar>
            <Typography variant="h4" fontWeight="bold">
              {user?.rol === 'admin' ? 'Perfil de Administrador' : 'Mi Perfil'}
            </Typography>
            <Chip 
              label={user?.rol === 'admin' ? 'ADMINISTRADOR' : 'CLIENTE'} 
              color={user?.rol === 'admin' ? 'error' : 'primary'}
              sx={{ mt: 1, fontWeight: 'bold' }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {user?.email}
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Nombre Completo"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="RUT (Opcional)"
                  value={formData.rut}
                  onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                  helperText="Formato: 12345678-9"
                />
              </Grid>

              {error && (
                <Grid size={{ xs: 12 }}>
                  <Typography color="error" variant="body2">
                    {error}
                  </Typography>
                </Grid>
              )}

              {success && (
                <Grid size={{ xs: 12 }}>
                  <Typography color="success.main" variant="body2">
                    ✓ Perfil actualizado exitosamente
                  </Typography>
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  size="large"
                  fullWidth
                  disabled={loading}
                  startIcon={<Save />}
                  sx={user?.rol === 'admin' ? { 
                    bgcolor: '#8B4513',
                    '&:hover': { bgcolor: '#A0522D' }
                  } : {}}
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => navigate(user?.rol === 'admin' ? '/admin' : '/mis-pedidos')}
                  sx={user?.rol === 'admin' ? { 
                    borderColor: '#8B4513',
                    color: '#8B4513',
                    '&:hover': { 
                      borderColor: '#A0522D',
                      bgcolor: 'rgba(139, 69, 19, 0.04)'
                    }
                  } : {}}
                >
                  {user?.rol === 'admin' ? 'Ir al Dashboard' : 'Ver Mis Pedidos'}
                </Button>
              </Grid>
              
              {user?.rol === 'admin' && (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      onClick={() => navigate('/admin/productos')}
                      sx={{ 
                        borderColor: '#8B4513',
                        color: '#8B4513'
                      }}
                    >
                      Gestionar Productos
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      onClick={() => navigate('/admin/pedidos')}
                      sx={{ 
                        borderColor: '#8B4513',
                        color: '#8B4513'
                      }}
                    >
                      Ver Pedidos
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
