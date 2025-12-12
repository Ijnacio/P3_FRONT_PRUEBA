import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { 
  Box, Container, Typography, Button, Grid, Card, CardMedia, CardContent, CardActions,
  AppBar, Toolbar, IconButton, Badge, Chip
} from "@mui/material";
import { 
  ShoppingCart, Person, Cake, LocalShipping, StarRate, Logout, Edit, Delete
} from "@mui/icons-material";
import { getProductos } from "../services/api";
import type { Producto } from "../types";

export default function Home() {
  const { user, logout } = useAuth();
  const { items, addToCart } = useCart();
  const navigate = useNavigate();
  
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const prodData = await getProductos();
      setProductos(Array.isArray(prodData) ? prodData : []);
    } catch (error) {
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const productosDestacados = Array.isArray(productos) ? productos.slice(0, 8) : [];
  const totalItemsCarrito = items.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <Box>
      <AppBar position="sticky" color="default" elevation={2}>
        <Toolbar>
          <Typography 
            variant="h5" 
            sx={{ 
              flexGrow: 1, 
              fontFamily: 'Pacifico, cursive', 
              color: 'primary.main',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            1000 Sabores
          </Typography>
          
          {user ? (
            <>
              <Typography variant="body2" sx={{ mr: 2 }}>
                Hola, {user.name}
              </Typography>
              {user.rol === 'admin' && (
                <Button color="primary" onClick={() => navigate('/admin')}>
                  Admin
                </Button>
              )}
              {user.rol === 'cliente' && (
                <Button color="primary" onClick={() => navigate('/mis-pedidos')}>
                  Mis Pedidos
                </Button>
              )}
              <IconButton color="error" onClick={() => {
                if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                  logout();
                }
              }} title="Cerrar Sesión">
                <Logout />
              </IconButton>
            </>
          ) : (
            <>
              <Button color="primary" onClick={() => navigate('/login')}>
                Iniciar Sesión
              </Button>
              <Button variant="contained" onClick={() => navigate('/register')} sx={{ ml: 1 }}>
                Registrarse
              </Button>
            </>
          )}
          
          {/* Carrito visible para todos */}
          <IconButton color="primary" onClick={() => navigate('/carrito')} sx={{ ml: 2 }}>
            <Badge badgeContent={totalItemsCarrito} color="secondary">
              <ShoppingCart />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* HERO SECTION */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #FFF5E1 0%, #FFE4E1 100%)',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container>
          <Typography variant="h2" gutterBottom>
            50 Años Endulzando Chile
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Desde 1973, creando momentos dulces e inolvidables
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            startIcon={<Cake />}
            onClick={() => navigate('/productos')}
            sx={{ mt: 2 }}
          >
            Ver Todos los Productos
          </Button>
        </Container>
      </Box>

      {/* PRODUCTOS DESTACADOS */}
      <Container sx={{ my: 6 }}>
        <Typography variant="h4" textAlign="center" gutterBottom fontWeight="bold">
          Productos Destacados
        </Typography>
        
        {loading ? (
          <Typography textAlign="center">Cargando productos...</Typography>
        ) : (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {productosDestacados.map((prod) => (
              <Grid key={prod.id} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  {/* Badges de stock */}
                  <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {prod.stock === 0 && (
                      <Chip label="Agotado" size="small" color="error" sx={{ fontWeight: 'bold' }} />
                    )}
                    {user?.rol === 'admin' && prod.stock > 0 && (
                      <Chip 
                        label={`Stock: ${prod.stock}`} 
                        size="small" 
                        sx={{ 
                          fontWeight: 'bold',
                          backgroundColor: '#8B4513',
                          color: 'white'
                        }} 
                      />
                    )}
                  </Box>
                  
                  {/* Botones de acción para admin */}
                  {user?.rol === 'admin' && (
                    <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1, display: 'flex', gap: 0.5 }}>
                      <IconButton 
                        size="small" 
                        sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'primary.light' } }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/productos`);
                        }}
                      >
                        <Edit fontSize="small" color="primary" />
                      </IconButton>
                    </Box>
                  )}
                  
                  <CardMedia
                    component="img"
                    height="200"
                    image={prod.imagen || prod.fotoUrl ? `http://localhost:3006${prod.imagen || prod.fotoUrl}` : 'https://via.placeholder.com/300x200?text=Sin+Imagen'}
                    alt={prod.nombre}
                    sx={{ objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => navigate(`/producto/${prod.id}`)}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {prod.nombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      mb: 1
                    }}>
                      {prod.descripcion}
                    </Typography>
                    <Chip 
                      label={prod.categoria?.nombre || 'Sin categoría'} 
                      size="small" 
                      sx={{ 
                        backgroundColor: '#8B4513',
                        color: 'white',
                        fontWeight: 'bold'
                      }} 
                    />
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                      ${prod.precio.toLocaleString()}
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="small"
                      disabled={prod.stock === 0}
                      onClick={() => addToCart(prod)}
                    >
                      {prod.stock === 0 ? 'Agotado' : 'Agregar'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* BENEFICIOS */}
      <Box sx={{ bgcolor: 'background.default', py: 6 }}>
        <Container>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: 'center' }}>
              <LocalShipping sx={{ fontSize: 48, color: 'primary.main' }} />
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Envío a Domicilio
              </Typography>
              <Typography color="text.secondary">
                Recibe tus pedidos en la comodidad de tu hogar
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: 'center' }}>
              <StarRate sx={{ fontSize: 48, color: 'primary.main' }} />
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Calidad Garantizada
              </Typography>
              <Typography color="text.secondary">
                50 años de experiencia en repostería
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: 'center' }}>
              <Cake sx={{ fontSize: 48, color: 'primary.main' }} />
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Personalización
              </Typography>
              <Typography color="text.secondary">
                Diseños únicos para tus celebraciones
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FOOTER */}
      <Box component="footer" sx={{ bgcolor: 'primary.main', color: 'white', py: 4, mt: 6 }}>
        <Container>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" gutterBottom fontFamily="Pacifico, cursive">
                Pastelería 1000 Sabores
              </Typography>
              <Typography variant="body2">
                50 años endulzando Chile desde 1973
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" gutterBottom>
                Contacto
              </Typography>
              <Typography variant="body2">
                Teléfono: +56 2 2828 8710
              </Typography>
              <Typography variant="body2">
                Email: contacto@1000sabores.cl
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" gutterBottom>
                Horario
              </Typography>
              <Typography variant="body2">
                Lunes a Domingo
              </Typography>
              <Typography variant="body2">
                09:00 - 20:00 hrs
              </Typography>
            </Grid>
          </Grid>
          <Typography variant="body2" textAlign="center" sx={{ mt: 4 }}>
            © 2025 Pastelería 1000 Sabores. Todos los derechos reservados.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
