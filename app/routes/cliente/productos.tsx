import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useCart } from "../../context/CartContext";
import { 
  Box, Container, Typography, Grid, Card, CardMedia, CardContent, CardActions,
  Button, Chip, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem,
  Paper, Breadcrumbs, Link, IconButton, Tooltip
} from "@mui/material";
import { Search, Home, ShoppingCart } from "@mui/icons-material";
import { getProductos, getCategorias } from "../../services/api";
import type { Producto, Categoria } from "../../types";

export default function Productos() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState(searchParams.get('categoria') || '');
  const [ordenar, setOrdenar] = useState("nombre");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodData, catData] = await Promise.all([
        getProductos(),
        getCategorias()
      ]);
      setProductos(Array.isArray(prodData) ? prodData : []);
      setCategorias(Array.isArray(catData) ? catData : []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = productos
    .filter(p => {
      const matchSearch = !searchTerm || 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchCategoria = !categoriaFilter || 
        p.categoria?.id?.toString() === categoriaFilter;
      
      return matchSearch && matchCategoria;
    })
    .sort((a, b) => {
      switch (ordenar) {
        case 'precio-asc':
          return a.precio - b.precio;
        case 'precio-desc':
          return b.precio - a.precio;
        case 'nombre':
        default:
          return a.nombre.localeCompare(b.nombre);
      }
    });

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container>
        {/* BREADCRUMB */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link 
            underline="hover" 
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            color="inherit"
            onClick={() => navigate('/')}
          >
            <Home sx={{ mr: 0.5 }} fontSize="small" />
            Inicio
          </Link>
          <Typography color="text.primary">Productos</Typography>
        </Breadcrumbs>

        <Typography variant="h4" gutterBottom fontWeight="bold">
          Nuestros Productos
        </Typography>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={categoriaFilter}
                  label="Categoría"
                  onChange={(e) => setCategoriaFilter(e.target.value)}
                >
                  <MenuItem value="">Todas las categorías</MenuItem>
                  {categorias.map(cat => (
                    <MenuItem key={cat.id} value={cat.id.toString()}>
                      {cat.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Ordenar por</InputLabel>
                <Select
                  value={ordenar}
                  label="Ordenar por"
                  onChange={(e) => setOrdenar(e.target.value)}
                >
                  <MenuItem value="nombre">Nombre (A-Z)</MenuItem>
                  <MenuItem value="precio-asc">Precio (Menor a Mayor)</MenuItem>
                  <MenuItem value="precio-desc">Precio (Mayor a Menor)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* RESULTADOS */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}
        </Typography>

        {loading ? (
          <Typography textAlign="center" sx={{ py: 8 }}>Cargando productos...</Typography>
        ) : productosFiltrados.length === 0 ? (
          <Box textAlign="center" sx={{ py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No se encontraron productos
            </Typography>
            <Button variant="outlined" onClick={() => {
              setSearchTerm('');
              setCategoriaFilter('');
            }}>
              Limpiar Filtros
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {productosFiltrados.map((prod) => (
              <Grid key={prod.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="220"
                    image={prod.imagen || prod.fotoUrl ? `http://localhost:3006${prod.imagen || prod.fotoUrl}` : 'https://via.placeholder.com/300x220/8B4513/FFFFFF?text=Pasteleria'}
                    alt={prod.nombre}
                    sx={{ objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => navigate(`/producto/${prod.id}`)}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/producto/${prod.id}`)}
                    >
                      {prod.nombre}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        mb: 2
                      }}
                    >
                      {prod.descripcion || 'Producto de nuestra pastelería'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={prod.categoria?.nombre || 'Sin categoría'} 
                        size="small" 
                        sx={{ 
                          backgroundColor: '#8B4513',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                      {prod.stock === 0 && (
                        <Chip label="Agotado" size="small" color="error" />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                      ${prod.precio.toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Button 
                        variant="contained" 
                        size="small"
                        disabled={prod.stock === 0}
                        onClick={() => {
                          addToCart(prod);
                          // Trigger cart popup in navbar
                          window.dispatchEvent(new CustomEvent('cart-updated', { detail: { product: prod } }));
                        }}
                      >
                        {prod.stock === 0 ? 'Agotado' : 'Agregar'}
                      </Button>
                      <Tooltip title="Ir al carrito">
                        <IconButton 
                          color="primary" 
                          onClick={() => navigate('/carrito')}
                          sx={{ 
                            bgcolor: 'primary.main', 
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' }
                          }}
                        >
                          <ShoppingCart fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
