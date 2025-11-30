import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Avatar,
  FormControl, InputLabel, Select, MenuItem, Alert, Snackbar, Checkbox,
  FormControlLabel, Divider
} from '@mui/material';
import {
  Add, Edit, Delete, Search, Person, AdminPanelSettings, Store
} from '@mui/icons-material';
import type { User, CreateUserDto, UpdateUserDto } from '~/types';
import { getUsers, createUser, updateUser, deleteUser } from '~/services/api';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({ open: false, userId: 0 });
  const [changePassword, setChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Estado del formulario
  const [formData, setFormData] = useState<CreateUserDto>({
    name: '',
    rut: '',
    password: '',
    rol: 'vendedor'
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const usuariosData = await getUsers();
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      // Datos de fallback
      setUsuarios([
        {
          id: 1,
          rut: '12345678-9',
          name: 'Admin Sistema',
          rol: 'admin'
        },
        {
          id: 2,
          rut: '98765432-1',
          name: 'Juan Pérez',
          rol: 'vendedor'
        },
        {
          id: 3,
          rut: '11223344-5',
          name: 'María García',
          rol: 'vendedor'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (usuario?: User) => {
    if (usuario) {
      setEditingUser(usuario);
      setFormData({
        name: usuario.name,
        rut: usuario.rut,
        password: '',
        rol: usuario.rol
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        rut: '',
        password: '',
        rol: 'vendedor'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Resetear completamente el estado después de que la animación termine
    setTimeout(() => {
      setEditingUser(null);
      setChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setFormData({
        name: '',
        rut: '',
        password: '',
        rol: 'vendedor'
      });
    }, 200);
  };

  const handleSave = async () => {
    // Validación básica
    if (!formData.name.trim()) {
      setNotification({ open: true, message: 'El nombre es obligatorio', severity: 'error' });
      return;
    }
    if (!formData.rut.trim()) {
      setNotification({ open: true, message: 'El RUT es obligatorio', severity: 'error' });
      return;
    }
    if (!editingUser && !formData.password.trim()) {
      setNotification({ open: true, message: 'La contraseña es obligatoria para usuarios nuevos', severity: 'error' });
      return;
    }

    try {
      if (editingUser) {
        const updateData: UpdateUserDto = {
          name: formData.name,
          rut: formData.rut,
          rol: formData.rol
        };
        // Nueva lógica de cambio de contraseña con currentPassword y newPassword
        if (changePassword) {
          if (!currentPassword.trim() || !newPassword.trim()) {
            setNotification({ open: true, message: 'Debes completar ambos campos de contraseña', severity: 'error' });
            return;
          }
          updateData.currentPassword = currentPassword;
          updateData.newPassword = newPassword;
        }
        await updateUser(editingUser.id, updateData);
        setNotification({ open: true, message: 'Usuario actualizado exitosamente', severity: 'success' });
      } else {
        await createUser(formData);
        setNotification({ open: true, message: 'Usuario creado exitosamente', severity: 'success' });
      }
      handleCloseDialog();
      cargarUsuarios();
    } catch (error: any) {
      console.error('Error al guardar usuario:', error);
      const errorMsg = error.response?.data?.message 
        || (Array.isArray(error.response?.data?.message) ? error.response?.data?.message.join(', ') : '')
        || error.message 
        || 'Error al guardar usuario';
      setNotification({ open: true, message: errorMsg, severity: 'error' });
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteConfirmDialog({ open: true, userId: id });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUser(deleteConfirmDialog.userId);
      setDeleteConfirmDialog({ open: false, userId: 0 });
      setNotification({ open: true, message: 'Usuario desactivado exitosamente. El RUT ha sido liberado.', severity: 'success' });
      cargarUsuarios();
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error al eliminar usuario';
      setNotification({ open: true, message: errorMsg, severity: 'error' });
      setDeleteConfirmDialog({ open: false, userId: 0 });
    }
  };

  const filteredUsers = usuarios.filter(usuario =>
    usuario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.rol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = usuarios.length;
  const adminCount = usuarios.filter(u => u.rol === 'admin').length;
  const vendedorCount = usuarios.filter(u => u.rol === 'vendedor').length;

  const getRolColor = (rol: string) => {
    return rol === 'admin' ? 'primary' : 'secondary';
  };

  const getRolIcon = (rol: string) => {
    return rol === 'admin' ? <AdminPanelSettings /> : <Store />;
  };

  if (loading) {
    return (
      <Box p={3} textAlign="center">
        <Typography>Cargando usuarios...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">
          Gestión de Usuarios
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Usuario
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
                    TOTAL USUARIOS
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {totalUsers}
                  </Typography>
                </Box>
                <Person color="primary" sx={{ fontSize: 40 }} />
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
                    ADMINISTRADORES
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {adminCount}
                  </Typography>
                </Box>
                <AdminPanelSettings color="primary" sx={{ fontSize: 40 }} />
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
                    VENDEDORES
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {vendedorCount}
                  </Typography>
                </Box>
                <Store color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barra de búsqueda */}
      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Box>

      {/* Tabla de usuarios */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>RUT</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((usuario) => (
                <TableRow key={usuario.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2, bgcolor: getRolColor(usuario.rol) + '.main' }}>
                        {getRolIcon(usuario.rol)}
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {usuario.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {usuario.rut}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getRolIcon(usuario.rol)}
                      label={usuario.rol.toUpperCase()}
                      color={getRolColor(usuario.rol) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleOpenDialog(usuario)}
                      color="primary"
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteClick(usuario.id)}
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

        {filteredUsers.length === 0 && (
          <Box p={4} textAlign="center">
            <Typography color="text.secondary">
              No se encontraron usuarios
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Dialog para crear/editar usuario */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              label="Nombre completo"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            
            <TextField
              label="RUT"
              fullWidth
              placeholder="12345678-9"
              value={formData.rut}
              onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
            />

            {!editingUser ? (
              <TextField
                label="Contraseña"
                type="password"
                fullWidth
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            ) : (
              <Box>
                <Divider sx={{ my: 2 }} />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={changePassword}
                      onChange={(e) => {
                        setChangePassword(e.target.checked);
                        if (!e.target.checked) {
                          setCurrentPassword('');
                          setNewPassword('');
                        }
                      }}
                      color="primary"
                    />
                  }
                  label="Cambiar contraseña"
                />
                {changePassword && (
                  <Box display="flex" flexDirection="column" gap={2} mt={2}>
                    <TextField
                      label="Contraseña Actual"
                      type="password"
                      fullWidth
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      helperText="Para autorizar el cambio"
                    />
                    <TextField
                      label="Nueva Contraseña"
                      type="password"
                      fullWidth
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </Box>
                )}
                <Divider sx={{ my: 2 }} />
              </Box>
            )}

            <FormControl fullWidth>
              <InputLabel id="rol-label">Rol</InputLabel>
              <Select
                labelId="rol-label"
                label="Rol"
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value as 'admin' | 'vendedor' })}
              >
                <MenuItem value="vendedor">Vendedor</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            {editingUser ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <Dialog
        open={deleteConfirmDialog.open}
        onClose={() => setDeleteConfirmDialog({ open: false, userId: 0 })}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de desactivar este usuario? Esta acción:
          </Typography>
          <Box component="ul" sx={{ mt: 2 }}>
            <li>Desactivará el usuario (soft delete)</li>
            <li>Liberará el RUT para poder reutilizarlo</li>
            <li>Mantendrá el historial de ventas intacto</li>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmDialog({ open: false, userId: 0 })}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Eliminar
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