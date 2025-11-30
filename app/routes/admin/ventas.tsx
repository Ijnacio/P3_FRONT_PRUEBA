import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button,
  IconButton, Collapse, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Alert, Snackbar
} from '@mui/material';
import {
  Search, AttachMoney, Receipt, TrendingUp, ExpandMore, ExpandLess,
  Visibility, Print, FilterList, Delete, Edit, CreditCard
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import type { Venta, CajaAdmin } from '~/types';
import { getHistorialAdmin, getCajaAdmin, deleteVenta, updateVenta } from '~/services/api';
import { getFechaHoy, extraerFecha } from '~/utils/dateUtils';

// Mostrar fecha y hora sin corrimiento a "ayer": tratar la fecha como UTC
const formatDateLocal = (isoString: string) => {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleString('es-CL', {
    timeZone: 'UTC',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export default function AdminVentas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cajaAdmin, setCajaAdmin] = useState<CajaAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [paymentFilter, setPaymentFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [detailDialog, setDetailDialog] = useState({ open: false, venta: null as Venta | null });
  const [editDialog, setEditDialog] = useState({ open: false, venta: null as Venta | null, medioPago: '' });
  const [notification, setNotification] = useState({ open: false, msg: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    cargarDatos();
  }, [dateFilter]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      // Convertir Date a string YYYY-MM-DD si existe
      const dateStr = dateFilter 
        ? `${dateFilter.getFullYear()}-${String(dateFilter.getMonth() + 1).padStart(2, '0')}-${String(dateFilter.getDate()).padStart(2, '0')}`
        : undefined;
      const [ventasData, cajaData] = await Promise.all([
        getHistorialAdmin(dateStr, dateStr),
        getCajaAdmin()
      ]);
      setVentas(ventasData || []);
      setCajaAdmin(cajaData);
    } catch (error) {
      console.error('❌ Error al cargar datos de ventas:', error);
      // Solo en caso de error, usar datos vacíos
      setVentas([]);
      setCajaAdmin({
        fecha: new Date().toISOString().split('T')[0],
        cantidadVentas: 0,
        detalleCaja: {
          efectivoEnCaja: 0,
          bancoDebito: 0,
          bancoCredito: 0,
          totalVendido: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // --- ELIMINAR VENTA ---
  const handleDelete = async (venta: Venta) => {
    const ventaId = venta.id || venta.folio;
    if (!ventaId) {
      setNotification({ open: true, msg: 'No se puede eliminar esta venta', type: 'error' });
      console.error('Venta sin ID:', venta);
      return;
    }
    
    if (!window.confirm(`¿Anular venta #${venta.folio}? El stock de los productos será devuelto.`)) return;

    try {
      console.log('🗑️ Eliminando venta:', ventaId);
      await deleteVenta(ventaId);
      setNotification({ open: true, msg: 'Venta anulada y stock devuelto', type: 'success' });
      cargarDatos(); // Recargar lista
    } catch (error) {
      console.error('❌ Error al eliminar:', error);
      setNotification({ open: true, msg: 'No se pudo eliminar la venta', type: 'error' });
    }
  };

  // --- EDITAR VENTA ---
  const handleEditClick = (venta: Venta) => {
    setEditDialog({ 
      open: true, 
      venta, 
      medioPago: venta.resumen?.medioPago || venta.medioPago || 'EFECTIVO' 
    });
  };

  const handleSaveEdit = async () => {
    if (!editDialog.venta) return;
    const ventaId = editDialog.venta.id || editDialog.venta.folio;
    if (!ventaId) {
      setNotification({ open: true, msg: 'No se puede actualizar esta venta', type: 'error' });
      console.error('Venta sin ID:', editDialog.venta);
      return;
    }
    try {
      console.log('✏️ Actualizando venta:', ventaId, 'Medio de pago:', editDialog.medioPago);
      await updateVenta(ventaId, { medioPago: editDialog.medioPago as any });
      setNotification({ open: true, msg: 'Medio de pago actualizado', type: 'success' });
      setEditDialog({ open: false, venta: null, medioPago: '' });
      cargarDatos();
    } catch (error) {
      console.error('❌ Error al actualizar:', error);
      setNotification({ open: true, msg: 'Error al actualizar', type: 'error' });
    }
  };

  const getMetodoPagoColor = (metodo: string) => {
    switch (metodo) {
      case 'EFECTIVO': return 'success';
      case 'DEBITO': return 'info';
      case 'CREDITO': return 'warning';
      default: return 'default';
    }
  };

  // Reemplazado por formatDateLocal

  const filteredVentas = ventas.filter(venta => {
    const cleanSearchTerm = searchTerm.replace('#', '').trim();
    const matchesSearch = !cleanSearchTerm ||
      venta.folio?.toString().includes(cleanSearchTerm) ||
      (venta.vendedor?.rut || '').includes(cleanSearchTerm);
    
    const matchesPayment = !paymentFilter || 
      (venta.resumen?.medioPago || venta.medioPago) === paymentFilter;

    const matchesVendor = !vendorFilter ||
      (venta.vendedor?.nombre || '') === vendorFilter;

    return matchesSearch && matchesPayment && matchesVendor;
  });

  // Calcular totales de las ventas filtradas
  const totalesFiltrados = filteredVentas.reduce((acc, venta) => {
    const total = venta.resumen?.total || venta.total || 0;
    const medioPago = venta.resumen?.medioPago || venta.medioPago || 'EFECTIVO';
    
    acc.total += total;
    if (medioPago === 'EFECTIVO') acc.efectivo += total;
    else if (medioPago === 'DEBITO') acc.debito += total;
    else if (medioPago === 'CREDITO') acc.credito += total;
    
    return acc;
  }, { total: 0, efectivo: 0, debito: 0, credito: 0 });

  // Determinar si se están usando filtros
  const hasFilters = dateFilter || paymentFilter || vendorFilter || searchTerm.trim();

  const handleRowExpand = (ventaId: number) => {
    setExpandedRow(expandedRow === ventaId ? null : ventaId);
  };

  const handleShowDetail = (venta: Venta) => {
    setDetailDialog({ open: true, venta });
  };

  const handlePrint = (venta: Venta) => {
    // TODO: Implementar impresión de boleta
    alert(`Imprimir boleta folio ${venta.folio}`);
  };

  if (loading) {
    return (
      <Box p={3} textAlign="center">
        <Typography>Cargando datos de ventas...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" mb={4}>
        Historial de Ventas
      </Typography>

      {/* Cuadritos flotantes de estadísticas */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <TrendingUp color="primary" sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="caption" color="text.secondary" display="block">
              Total Vendido
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              ${totalesFiltrados.total.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <AttachMoney color="success" sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="caption" color="text.secondary" display="block">
              Efectivo
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="success.main">
              ${totalesFiltrados.efectivo.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Receipt color="info" sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="caption" color="text.secondary" display="block">
              Débito
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="info.main">
              ${totalesFiltrados.debito.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Receipt color="warning" sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="caption" color="text.secondary" display="block">
              Crédito
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="warning.main">
              ${totalesFiltrados.credito.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              placeholder="Buscar por #folio o RUT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 2.5 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <DatePicker
                  label="Fecha"
                  value={dateFilter}
                  onChange={(newValue) => setDateFilter(newValue)}
                  maxDate={new Date()}
                  minDate={new Date('2020-01-01')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small'
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={() => setDateFilter(new Date())}
                  sx={{ minWidth: 'auto', px: 1.5 }}
                  title="Filtrar por hoy"
                >
                  Hoy
                </Button>
              </Box>
            </LocalizationProvider>
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Vendedor</InputLabel>
              <Select
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {/* Obtener vendedores únicos */}
                {Array.from(new Set(ventas.filter(v => v.vendedor?.nombre).map(v => v.vendedor!.nombre))).map((vendedor) => (
                  <MenuItem key={vendedor} value={vendedor}>{vendedor}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Método de Pago</InputLabel>
              <Select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                <MenuItem value="DEBITO">Débito</MenuItem>
                <MenuItem value="CREDITO">Crédito</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => {
                setSearchTerm('');
                setDateFilter(null);
                setPaymentFilter('');
                setVendorFilter('');
              }}
            >
              Limpiar Filtros
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de ventas */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="50px"></TableCell>
                <TableCell>Folio</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Vendedor</TableCell>
                <TableCell>Método de Pago</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVentas.filter(venta => venta.folio).map((venta) => (
                <React.Fragment key={venta.folio || venta.id}>
                  <TableRow hover>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => venta.folio && handleRowExpand(venta.folio)}
                      >
                        {expandedRow === venta.id ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" fontFamily="monospace">
                        #{venta.folio}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {formatDateLocal(venta.fecha)}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {venta.vendedor?.nombre || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {venta.vendedor?.rut || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={venta.resumen?.medioPago || venta.medioPago || 'N/A'}
                        color={getMetodoPagoColor(venta.resumen?.medioPago || venta.medioPago || 'EFECTIVO') as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="bold">
                        ${(venta.resumen?.total || venta.total || 0).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditClick(venta)}
                        title="Editar medio de pago"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(venta)}
                        title="Anular venta"
                      >
                        <Delete />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => handlePrint(venta)}
                        title="Imprimir"
                      >
                        <Print />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow key={`expand-${venta.folio || venta.id}`}>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                      <Collapse in={expandedRow === venta.id} timeout="auto" unmountOnExit>
                        <Box margin={2}>
                          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                            Detalle de productos:
                          </Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Producto</TableCell>
                                <TableCell align="right">Cantidad</TableCell>
                                <TableCell align="right">Precio Unit.</TableCell>
                                <TableCell align="right">Subtotal</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(venta.items || venta.detalles || []).map((detalle, index) => (
                                <TableRow key={index}>
                                  <TableCell>{detalle.producto}</TableCell>
                                  <TableCell align="right">{detalle.cantidad}</TableCell>
                                  <TableCell align="right">${detalle.precioUnitario.toLocaleString()}</TableCell>
                                  <TableCell align="right">${detalle.subtotal.toLocaleString()}</TableCell>
                                </TableRow>
                              ))}
                              <TableRow>
                                <TableCell colSpan={3} align="right">
                                  <Typography variant="body2">Neto:</Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2">${(venta.resumen?.neto || venta.neto || 0).toLocaleString()}</Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell colSpan={3} align="right">
                                  <Typography variant="body2">IVA (19%):</Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2">${(venta.resumen?.iva || venta.iva || 0).toLocaleString()}</Typography>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell colSpan={3} align="right">
                                  <Typography variant="body1" fontWeight="bold">Total:</Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body1" fontWeight="bold">${(venta.resumen?.total || venta.total || 0).toLocaleString()}</Typography>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredVentas.length === 0 && (
          <Box p={4} textAlign="center">
            <Typography color="text.secondary">
              No se encontraron ventas que coincidan con los filtros
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Dialog de detalle */}
      <Dialog 
        open={detailDialog.open} 
        onClose={() => setDetailDialog({ open: false, venta: null })}
        maxWidth="md"
        fullWidth
      >
        {detailDialog.venta && (
          <>
            <DialogTitle>
              Detalle de Venta - Folio #{detailDialog.venta.folio}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Fecha y Hora:</Typography>
                  <Typography variant="body1">{formatDateLocal(detailDialog.venta.fecha)}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Vendedor:</Typography>
                  <Typography variant="body1">{detailDialog.venta.vendedor?.nombre || 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Método de Pago:</Typography>
                  <Chip
                    label={detailDialog.venta.resumen?.medioPago || detailDialog.venta.medioPago || 'N/A'}
                    color={getMetodoPagoColor(detailDialog.venta.resumen?.medioPago || detailDialog.venta.medioPago || 'EFECTIVO') as any}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Total:</Typography>
                  <Typography variant="h6" fontWeight="bold">${(detailDialog.venta.resumen?.total || detailDialog.venta.total || 0).toLocaleString()}</Typography>
                </Grid>
              </Grid>
              
              <Box mt={3}>
                <Typography variant="subtitle2" color="text.secondary" mb={2}>Productos:</Typography>
                <Table>
                  <TableBody>
                    {(detailDialog.venta.items || detailDialog.venta.detalles || []).map((detalle, index) => (
                      <TableRow key={index}>
                        <TableCell>{detalle.producto}</TableCell>
                        <TableCell align="right">{detalle.cantidad}x</TableCell>
                        <TableCell align="right">${detalle.precioUnitario.toLocaleString()}</TableCell>
                        <TableCell align="right">${detalle.subtotal.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handlePrint(detailDialog.venta!)}>
                Imprimir
              </Button>
              <Button onClick={() => setDetailDialog({ open: false, venta: null })}>
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* DIALOGO EDITAR */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, venta: null, medioPago: '' })}>
        <DialogTitle>Editar Venta #{editDialog.venta?.folio}</DialogTitle>
        <DialogContent sx={{ minWidth: 300, mt: 1 }}>
          <FormControl fullWidth margin="dense">
            <InputLabel>Medio de Pago</InputLabel>
            <Select
              value={editDialog.medioPago}
              label="Medio de Pago"
              onChange={(e) => setEditDialog({ ...editDialog, medioPago: e.target.value })}
            >
              <MenuItem value="EFECTIVO">Efectivo</MenuItem>
              <MenuItem value="DEBITO">Débito</MenuItem>
              <MenuItem value="CREDITO">Crédito</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            * Para cambiar productos, anula esta venta y crea una nueva.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, venta: null, medioPago: '' })}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Guardar Cambios</Button>
        </DialogActions>
      </Dialog>

      {/* NOTIFICACIONES */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={4000} 
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.type} variant="filled">
          {notification.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}