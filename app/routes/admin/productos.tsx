import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Avatar,
  FormControl, InputLabel, Select, MenuItem, Alert, Snackbar, InputAdornment
} from '@mui/material';
import {
  Add, Edit, Delete, Search, Inventory, AttachMoney, Category, Numbers
} from '@mui/icons-material';
import type { Producto, Categoria, CreateProductoDto, UpdateProductoDto } from '~/types';
import { getProductos, getCategorias, createProducto, updateProducto, deleteProducto } from '~/services/api';

export default function AdminProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Estado del formulario
  const [formData, setFormData] = useState<CreateProductoDto>({
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    fotoUrl: '',
    categoriaId: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  // traer productos y categorias del backend
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [productosData, categoriasData] = await Promise.all([
        getProductos(),
        getCategorias()
      ]);
      setProductos(productosData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      // datos de ejemplo por si falla
      setProductos([
        {
          id: 1,
          nombre: 'Coca Cola 500ml',
          precio: 1200,
          stock: 50,
          categoria: { id: 1, nombre: 'Bebidas' }
        },
        {
          id: 2,
          nombre: 'Pan Hallulla',
          precio: 800,
          stock: 20,
          categoria: { id: 2, nombre: 'Panadería' }
        }
      ]);
      setCategorias([
        { id: 1, nombre: 'Bebidas', descripcion: 'Bebidas y jugos' },
        { id: 2, nombre: 'Panadería', descripcion: 'Panes y masas' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (producto?: Producto) => {
    if (producto) {
      setEditingProduct(producto);
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.categoria?.descripcion || '',
        precio: producto.precio,
        stock: producto.stock,
        fotoUrl: producto.fotoUrl || '',
        categoriaId: producto.categoriaId || producto.categoria?.id || 0
      });
    } else {
      setEditingProduct(null);
      setFormData({
        nombre: '',
        descripcion: '',
        precio: 0,
        stock: 0,
        fotoUrl: '',
        categoriaId: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
  };

  const handleSave = async () => {
    try {
      if (editingProduct) {
        const updateData: UpdateProductoDto = {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          precio: formData.precio,
          stock: formData.stock,
          fotoUrl: formData.fotoUrl,
          categoriaId: formData.categoriaId
        };
        await updateProducto(editingProduct.id, updateData);
        setNotification({ open: true, message: 'Producto actualizado exitosamente', severity: 'success' });
      } else {
        await createProducto(formData);
        setNotification({ open: true, message: 'Producto creado exitosamente', severity: 'success' });
      }
      handleCloseDialog();
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      setNotification({ open: true, message: 'Error al guardar producto', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      try {
        await deleteProducto(id);
        setNotification({ open: true, message: 'Producto eliminado exitosamente', severity: 'success' });
        cargarDatos();
      } catch (error: any) {
        const errorMsg = (error.response?.status === 409)
          ? (error.response?.data?.message || 'No se puede eliminar este producto porque tiene ventas asociadas.')
          : (error.response?.data?.message || error.message || 'Error al eliminar producto');
        setNotification({ open: true, message: errorMsg, severity: 'error' });
      }
    }
  };

  const filteredProducts = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (producto.categoria?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const totalProducts = productos.length;
  const totalValue = productos.reduce((sum, p) => sum + (p.precio * p.stock), 0);
  const lowStockCount = productos.filter(p => p.stock < 10).length;

  if (loading) {
    return (
      <Box p={3} textAlign="center">
        <Typography>Cargando productos...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">
          Gestión de Productos
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Producto
        </Button>
      </Box>

      {/* Estadísticas */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="subtitle2">
                    TOTAL PRODUCTOS
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {totalProducts}
                  </Typography>
                </Box>
                <Inventory color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="subtitle2">
                    VALOR INVENTARIO
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ${totalValue.toLocaleString()}
                  </Typography>
                </Box>
                <AttachMoney color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="subtitle2">
                    STOCK BAJO
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {lowStockCount}
                  </Typography>
                </Box>
                <Category color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barra de búsqueda */}
      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Box>

      {/* Tabla de productos */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell align="right">Valor Total</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((producto) => (
                <TableRow key={producto.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        src={producto.fotoUrl?.startsWith('/') ? `http://localhost:3006${producto.fotoUrl}` : producto.fotoUrl}
                        sx={{ mr: 2, bgcolor: 'primary.main' }}
                      >
                        {producto.nombre.charAt(0)}
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {producto.nombre}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={producto.categoria?.nombre || 'Sin categoría'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold">
                      ${producto.precio.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={producto.stock}
                      color={producto.stock < 10 ? 'warning' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold">
                      ${(producto.precio * producto.stock).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleOpenDialog(producto)}
                      color="primary"
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(producto.id)}
                      color="error"
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredProducts.length === 0 && (
          <Box p={4} textAlign="center">
            <Typography color="text.secondary">
              No se encontraron productos
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Dialog para crear/editar producto */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              label="Nombre del producto"
              fullWidth
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
            
            <TextField
              label="Descripción"
              fullWidth
              multiline
              rows={3}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Precio"
                  type="text"
                  fullWidth
                  value={formData.precio}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFormData({ ...formData, precio: value ? Number(value) : 0 });
                  }}
                  inputMode="decimal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney sx={{ color: 'success.main' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Stock"
                  type="text"
                  fullWidth
                  value={formData.stock}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFormData({ ...formData, stock: value ? Number(value) : 0 });
                  }}
                  inputMode="numeric"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Numbers sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <FormControl fullWidth>
              <InputLabel id="categoria-label">Categoría</InputLabel>
              <Select
                labelId="categoria-label"
                label="Categoría"
                value={formData.categoriaId}
                onChange={(e) => setFormData({ ...formData, categoriaId: Number(e.target.value) })}
              >
                {categorias.map((categoria) => (
                  <MenuItem key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="URL de la imagen"
              fullWidth
              value={formData.fotoUrl}
              onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            {editingProduct ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}