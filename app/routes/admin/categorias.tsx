import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { Add, Edit, Delete, Category } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getCategorias, createCategoria, updateCategoria, deleteCategoria, getProductos } from '../../services/api';
import type { Categoria, CreateCategoriaDto, UpdateCategoriaDto } from '../../types';

export default function AdminCategorias() {
  const { user } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState<CreateCategoriaDto>({
    nombre: '',
    descripcion: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const data = await getCategorias();
      setCategorias(data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      setError('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (categoria?: Categoria) => {
    setEditingCategoria(categoria || null);
    setFormData(categoria ? {
      nombre: categoria.nombre,
      descripcion: categoria.descripcion
    } : {
      nombre: '',
      descripcion: ''
    });
    setModalOpen(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCategoria(null);
    setFormData({ nombre: '', descripcion: '' });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async () => {
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategoria) {
        await updateCategoria(editingCategoria.id, formData as UpdateCategoriaDto);
        setSuccess('Categoría actualizada correctamente');
      } else {
        await createCategoria(formData);
        setSuccess('Categoría creada correctamente');
      }
      
      await cargarCategorias();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error guardando categoría:', error);
      setError(error.response?.data?.message || 'Error al guardar categoría');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (categoria: Categoria) => {
    if (!window.confirm(`¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await deleteCategoria(categoria.id);
      setSuccess('Categoría eliminada correctamente.');
      await cargarCategorias();
    } catch (error: any) {
      const errorMsg = (error.response?.status === 409)
        ? (error.response?.data?.message || 'No se puede eliminar esta categoría porque tiene productos asociados.')
        : (error.response?.data?.message || error.message || 'Error al eliminar categoría.');
      setError(errorMsg);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1}>
          <Category color="primary" />
          <Typography variant="h5" fontWeight="600">
            Gestión de Categorías
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenModal()}
        >
          Nueva Categoría
        </Button>
      </Box>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Tabla */}
      <Paper sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, boxShadow: 0 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categorias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay categorías registradas
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                categorias.map((categoria) => (
                  <TableRow key={categoria.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                    <TableCell>
                      <Chip label={categoria.id} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {categoria.nombre}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {categoria.descripcion || 'Sin descripción'}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenModal(categoria)}
                        sx={{ mr: 1 }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(categoria)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal de Crear/Editar */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
        </DialogTitle>
        <DialogContent>
          <Box pt={1}>
            <TextField
              label="Nombre"
              fullWidth
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              margin="normal"
              required
              error={!!error && !formData.nombre.trim()}
              helperText={!!error && !formData.nombre.trim() ? 'El nombre es requerido' : ''}
            />
            <TextField
              label="Descripción"
              fullWidth
              multiline
              rows={3}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              margin="normal"
              placeholder="Descripción opcional de la categoría"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || !formData.nombre.trim()}
            startIcon={submitting ? <CircularProgress size={16} /> : undefined}
          >
            {submitting ? 'Guardando...' : (editingCategoria ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}