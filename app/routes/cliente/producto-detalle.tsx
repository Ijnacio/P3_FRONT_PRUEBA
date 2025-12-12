import { useState, useEffect } from "react";
import { Rating, TextField, CircularProgress, Alert } from "@mui/material";
import { useParams, useNavigate } from "react-router";
import { useCart } from "../../context/CartContext";
import { 
  Box, Container, Typography, Grid, Card, CardMedia, Button, Paper,
  Breadcrumbs, Link, Chip, IconButton, Divider
} from "@mui/material";
import { Home, Remove, Add, ShoppingCart } from "@mui/icons-material";
import { getProducto } from "../../services/api";
import axios from "axios";
import type { Producto } from "../../types";
// Tipo para reseña
type Resena = {
  id: number;
  calificacion: number;
  comentario: string;
  usuario: { id: number; name: string };
  createdAt: string;
};
// Utilidad para obtener token y usuario
function getAuth() {
  try {
    const token = localStorage.getItem("access_token");
    const user = JSON.parse(localStorage.getItem("user_data") || '{}');
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [resenasLoading, setResenasLoading] = useState(false);
  const [form, setForm] = useState({ calificacion: 0, comentario: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProducto();
      loadResenas();
    }
    // eslint-disable-next-line
  }, [id]);
  // Cargar reseñas
  const loadResenas = async () => {
    if (!id) return;
    setResenasLoading(true);
    try {
      const { data } = await axios.get(`/api/v1/productos/${id}`);
      setResenas(Array.isArray(data.resenas) ? data.resenas : []);
    } catch {
      setResenas([]);
    } finally {
      setResenasLoading(false);
    }
  };
  // Enviar reseña
  const handleSubmitResena = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setFormLoading(true);
    const { token, user } = getAuth();
    if (!token || !user || user.rol !== "cliente") {
      setFormError("Debes iniciar sesión como cliente para dejar una reseña.");
      setFormLoading(false);
      return;
    }
    if (form.calificacion < 1 || form.calificacion > 5) {
      setFormError("La calificación debe ser entre 1 y 5 estrellas.");
      setFormLoading(false);
      return;
    }
    if (form.comentario.length < 10) {
      setFormError("El comentario debe tener al menos 10 caracteres.");
      setFormLoading(false);
      return;
    }
    try {
      await axios.post(
        "/api/v1/resenas",
        { productoId: Number(id), calificacion: form.calificacion, comentario: form.comentario },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormSuccess("¡Reseña enviada!");
      setForm({ calificacion: 0, comentario: "" });
      loadResenas();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || "Error al enviar reseña");
    } finally {
      setFormLoading(false);
    }
  };

  const loadProducto = async () => {
    try {
      setLoading(true);
      const data = await getProducto(Number(id));
      setProducto(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarCarrito = () => {
    if (producto) {
      for (let i = 0; i < cantidad; i++) {
        addToCart(producto);
      }
      navigate('/carrito');
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography textAlign="center">Cargando producto...</Typography>
      </Container>
    );
  }

  if (!producto) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h5" textAlign="center" gutterBottom>
          Producto no encontrado
        </Typography>
        <Box textAlign="center">
          <Button variant="contained" onClick={() => navigate('/productos')}>
            Ver Todos los Productos
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container>
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
          <Link 
            underline="hover" 
            sx={{ cursor: 'pointer' }}
            color="inherit"
            onClick={() => navigate('/productos')}
          >
            Productos
          </Link>
          <Typography color="text.primary">{producto.nombre}</Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardMedia
                component="img"
                image={producto.imagen || producto.fotoUrl ? `http://localhost:3006${producto.imagen || producto.fotoUrl}` : 'https://via.placeholder.com/600x600/8B4513/FFFFFF?text=Pasteleria'}
                alt={producto.nombre}
                sx={{ width: '100%', height: 'auto', maxHeight: 600, objectFit: 'cover' }}
              />
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              {producto.nombre}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Chip 
                label={producto.categoria?.nombre || 'Sin categoría'} 
                color="secondary"
              />
              {producto.stock === 0 && (
                <Chip label="Agotado" color="error" />
              )}
              {producto.stock > 0 && producto.stock < 10 && (
                <Chip label={`Solo ${producto.stock} disponibles`} color="warning" />
              )}
              {producto.stock >= 10 && (
                <Chip label="Disponible" color="success" />
              )}
            </Box>

            <Typography variant="h5" color="primary.main" fontWeight="bold" gutterBottom>
              ${producto.precio.toLocaleString()}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body1" paragraph>
              {producto.descripcion || 'Delicioso producto de nuestra pastelería, preparado con ingredientes frescos y de la mejor calidad.'}
            </Typography>

            <Paper sx={{ p: 3, mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Cantidad:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <IconButton 
                  color="primary"
                  disabled={cantidad <= 1}
                  onClick={() => setCantidad(c => Math.max(1, c - 1))}
                >
                  <Remove />
                </IconButton>
                <Typography variant="h5" fontWeight="bold" sx={{ minWidth: 50, textAlign: 'center' }}>
                  {cantidad}
                </Typography>
                <IconButton 
                  color="primary"
                  disabled={cantidad >= producto.stock}
                  onClick={() => setCantidad(c => Math.min(producto.stock, c + 1))}
                >
                  <Add />
                </IconButton>
              </Box>

              <Button 
                variant="contained" 
                size="large"
                fullWidth
                disabled={producto.stock === 0}
                startIcon={<ShoppingCart />}
                onClick={handleAgregarCarrito}
              >
                {producto.stock === 0 ? 'Agotado' : `Agregar al Carrito - $${(producto.precio * cantidad).toLocaleString()}`}
              </Button>
            </Paper>

            <Box sx={{ mt: 3 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/productos')}
              >
                Ver Más Productos
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* RESEÑAS */}
        <Box sx={{ mt: 8 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Reseñas
          </Typography>
          {resenasLoading ? (
            <CircularProgress />
          ) : resenas.length === 0 ? (
            <Typography color="text.secondary">Aún no hay reseñas para este producto.</Typography>
          ) : (
            resenas.map((r) => (
              <Paper key={r.id} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating value={r.calificacion} readOnly size="small" />
                  <Typography variant="body2" fontWeight="bold">{r.usuario?.name || 'Cliente'}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    {new Date(r.createdAt).toLocaleDateString('es-CL')}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>{r.comentario}</Typography>
              </Paper>
            ))
          )}

          {/* Formulario para crear reseña */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Deja tu reseña</Typography>
            <form onSubmit={handleSubmitResena}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Rating
                  value={form.calificacion}
                  onChange={(_, v) => setForm(f => ({ ...f, calificacion: v || 0 }))}
                  size="large"
                />
                <TextField
                  label="Comentario"
                  value={form.comentario}
                  onChange={e => setForm(f => ({ ...f, comentario: e.target.value }))}
                  multiline
                  minRows={2}
                  fullWidth
                  required
                  inputProps={{ maxLength: 300 }}
                />
              </Box>
              {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
              {formSuccess && <Alert severity="success" sx={{ mb: 2 }}>{formSuccess}</Alert>}
              <Button type="submit" variant="contained" disabled={formLoading}>
                {formLoading ? <CircularProgress size={24} /> : 'Enviar Reseña'}
              </Button>
            </form>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
