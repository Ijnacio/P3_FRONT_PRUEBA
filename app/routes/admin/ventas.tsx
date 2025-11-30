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
  const [boletaDialog, setBoletaDialog] = useState({ open: false, venta: null as Venta | null });
  const [notification, setNotification] = useState({ open: false, msg: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    cargarDatos();
  }, [dateFilter]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      // si hay filtro de fecha lo convertimos al formato que necesita el backend
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
      console.error('Error al cargar datos de ventas:', error);
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
      return;
    }
    
    if (!window.confirm(`¿Anular venta #${venta.folio}? El stock de los productos será devuelto.`)) return;

    try {
      await deleteVenta(ventaId);
      setNotification({ open: true, msg: 'Venta anulada y stock devuelto', type: 'success' });
      cargarDatos(); // Recargar lista
    } catch (error) {
      console.error('Error al eliminar:', error);
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
      return;
    }
    try {
      await updateVenta(ventaId, { medioPago: editDialog.medioPago as any });
      setNotification({ open: true, msg: 'Medio de pago actualizado', type: 'success' });
      setEditDialog({ open: false, venta: null, medioPago: '' });
      cargarDatos();
    } catch (error) {
      console.error('Error al actualizar:', error);
      setNotification({ open: true, msg: 'Error al actualizar', type: 'error' });
    }
  };

  // colores para los chips de metodo de pago
  const getMetodoPagoColor = (metodo: string) => {
    if (metodo === 'EFECTIVO') return 'success';
    if (metodo === 'DEBITO') return 'info';
    if (metodo === 'CREDITO') return 'warning';
    return 'default';
  };

  // Reemplazado por formatDateLocal

  // aca se filtran las ventas segun lo que busque el usuario
  const filteredVentas = ventas.filter(venta => {
    let matchesSearch = true;
    if (searchTerm.trim()) {
      const searchValue = searchTerm.trim();
      
      if (searchValue.startsWith('#')) {
        // Buscar solo por folio
        const folioSearch = searchValue.substring(1);
        matchesSearch = venta.folio?.toString().includes(folioSearch) ?? false;
      } else if (/^\d+$/.test(searchValue)) {
        // Buscar por folio o RUT
        matchesSearch = (venta.folio?.toString().includes(searchValue) ?? false) ||
               (venta.vendedor?.rut || '').includes(searchValue);
      } else {
        // Buscar por nombre de vendedor
        matchesSearch = (venta.vendedor?.nombre || '').toLowerCase().includes(searchValue.toLowerCase());
      }
    }
    
    // filtrar por metodo de pago
    const matchesPayment = !paymentFilter || 
      (venta.resumen?.medioPago || venta.medioPago) === paymentFilter;

    // filtrar por vendedor tambien
    const matchesVendor = !vendorFilter ||
      (venta.vendedor?.nombre || '') === vendorFilter;

    return matchesSearch && matchesPayment && matchesVendor;
  });

  // sumar los totales de las ventas que se estan mostrando
  const totalesFiltrados = filteredVentas.reduce((acc, venta) => {
    const total = venta.resumen?.total || venta.total || 0;
    const medioPago = venta.resumen?.medioPago || venta.medioPago || 'EFECTIVO';
    
    acc.total += total;
    if (medioPago === 'EFECTIVO') acc.efectivo += total;
    else if (medioPago === 'DEBITO') acc.debito += total;
    else if (medioPago === 'CREDITO') acc.credito += total;
    
    return acc;
  }, { total: 0, efectivo: 0, debito: 0, credito: 0 });

  const hasFilters = dateFilter || paymentFilter || vendorFilter || searchTerm.trim();

  // para expandir y contraer las filas de la tabla
  const handleRowExpand = (ventaId: number) => {
    setExpandedRow(expandedRow === ventaId ? null : ventaId);
  };

  const handleShowDetail = (venta: Venta) => {
    setDetailDialog({ open: true, venta });
  };

  // abrir dialog para ver la boleta antes de imprimir
  const handlePrint = (venta: Venta) => {
    setBoletaDialog({ open: true, venta });
  };

  // esta funcion realmente imprime la boleta
  const handleActualPrint = () => {
    if (!boletaDialog.venta) return;
    const venta = boletaDialog.venta;
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const items = venta.items || venta.detalles || [];
    const total = venta.resumen?.total || venta.total || 0;
    const neto = venta.resumen?.neto || venta.neto || Math.round(total / 1.19);
    const iva = venta.resumen?.iva || venta.iva || (total - neto);
    const medioPago = venta.resumen?.medioPago || venta.medioPago || 'EFECTIVO';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Boleta #${venta.folio}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { font-family: monospace; width: 80mm; margin: 10mm auto; padding: 0; font-size: 12px; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { border-top: 1px dashed #000; margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; margin: 8px 0; }
          td { padding: 2px 0; }
          .right { text-align: right; }
        </style>
      </head>
      <body>
        <div class="center bold">PASTELERÍA 1000 SABORES</div>
        <div class="center">San Joaquín, Chile</div>
        <div class="center">RUT: 11.111.111-1</div>
        <div class="line"></div>
        <div class="center bold">BOLETA ELECTRÓNICA</div>
        <div class="center">N° ${venta.folio}</div>
        <div class="line"></div>
        <div>Fecha: ${formatDateLocal(venta.fecha)}</div>
        <div>Vendedor: ${venta.vendedor?.nombre || 'N/A'}</div>
        <div>RUT: ${venta.vendedor?.rut || 'N/A'}</div>
        <div class="line"></div>
        <table>
          <thead>
            <tr>
              <td class="bold">Producto</td>
              <td class="bold right">Cant</td>
              <td class="bold right">Precio</td>
              <td class="bold right">Total</td>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>${item.producto}</td>
                <td class="right">${item.cantidad}</td>
                <td class="right">$${item.precioUnitario.toLocaleString()}</td>
                <td class="right">$${item.subtotal.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="line"></div>
        <table>
          <tr><td>NETO:</td><td class="right">$${neto.toLocaleString()}</td></tr>
          <tr><td>IVA (19%):</td><td class="right">$${iva.toLocaleString()}</td></tr>
          <tr class="bold"><td>TOTAL:</td><td class="right">$${total.toLocaleString()}</td></tr>
        </table>
        <div class="line"></div>
        <div>Medio de Pago: ${medioPago}</div>
        <div class="line"></div>
        <div class="center">¡Gracias por su compra!</div>
        <div class="center">www.1000sabores.cl</div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
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
                label="Vendedor"
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
                label="Método de Pago"
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

      {/* DIALOG BOLETA */}
      <Dialog 
        open={boletaDialog.open} 
        onClose={() => setBoletaDialog({ open: false, venta: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Vista Previa - Boleta #{boletaDialog.venta?.folio}</DialogTitle>
        <DialogContent>
          {boletaDialog.venta && (() => {
            const venta = boletaDialog.venta;
            const items = venta.items || venta.detalles || [];
            const total = venta.resumen?.total || venta.total || 0;
            const neto = venta.resumen?.neto || venta.neto || Math.round(total / 1.19);
            const iva = venta.resumen?.iva || venta.iva || (total - neto);
            const medioPago = venta.resumen?.medioPago || venta.medioPago || 'EFECTIVO';
            
            return (
              <Box sx={{ 
                fontFamily: 'monospace', 
                maxWidth: '300px', 
                margin: '0 auto',
                padding: 2,
                border: '1px solid #ccc',
                borderRadius: 1,
                backgroundColor: '#fff'
              }}>
                <Box textAlign="center" fontWeight="bold" mb={1}>PASTELERÍA 1000 SABORES</Box>
                <Box textAlign="center" fontSize="0.9em">San Joaquín, Chile</Box>
                <Box textAlign="center" fontSize="0.9em" mb={1}>RUT: 11.111.111-1</Box>
                <Box borderTop="1px dashed #000" my={1} />
                <Box textAlign="center" fontWeight="bold">BOLETA ELECTRÓNICA</Box>
                <Box textAlign="center" mb={1}>N° {venta.folio}</Box>
                <Box borderTop="1px dashed #000" my={1} />
                <Box fontSize="0.9em">Fecha: {formatDateLocal(venta.fecha)}</Box>
                <Box fontSize="0.9em">Vendedor: {venta.vendedor?.nombre || 'N/A'}</Box>
                <Box fontSize="0.9em" mb={1}>RUT: {venta.vendedor?.rut || 'N/A'}</Box>
                <Box borderTop="1px dashed #000" my={1} />
                
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontSize: '0.85em', fontWeight: 'bold', padding: '4px 0' }}>Producto</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.85em', fontWeight: 'bold', padding: '4px 0' }}>Cant</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.85em', fontWeight: 'bold', padding: '4px 0' }}>Precio</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.85em', fontWeight: 'bold', padding: '4px 0' }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ fontSize: '0.85em', padding: '2px 0' }}>{item.producto}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.85em', padding: '2px 0' }}>{item.cantidad}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.85em', padding: '2px 0' }}>${item.precioUnitario.toLocaleString()}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.85em', padding: '2px 0' }}>${item.subtotal.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <Box borderTop="1px dashed #000" my={1} />
                <Box display="flex" justifyContent="space-between" fontSize="0.9em">
                  <span>NETO:</span>
                  <span>${neto.toLocaleString()}</span>
                </Box>
                <Box display="flex" justifyContent="space-between" fontSize="0.9em">
                  <span>IVA (19%):</span>
                  <span>${iva.toLocaleString()}</span>
                </Box>
                <Box display="flex" justifyContent="space-between" fontSize="0.9em" fontWeight="bold">
                  <span>TOTAL:</span>
                  <span>${total.toLocaleString()}</span>
                </Box>
                <Box borderTop="1px dashed #000" my={1} />
                <Box fontSize="0.9em">Medio de Pago: {medioPago}</Box>
                <Box borderTop="1px dashed #000" my={1} />
                <Box textAlign="center" fontSize="0.85em">¡Gracias por su compra!</Box>
                <Box textAlign="center" fontSize="0.85em">www.1000sabores.cl</Box>
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBoletaDialog({ open: false, venta: null })}>
            Cerrar
          </Button>
          <Button variant="contained" onClick={handleActualPrint} startIcon={<Print />}>
            Imprimir
          </Button>
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