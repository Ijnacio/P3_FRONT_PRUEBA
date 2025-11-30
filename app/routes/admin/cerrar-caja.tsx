import { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Button,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Divider
} from '@mui/material';
import {
  AttachMoney, AccountBalance, CreditCard, Receipt, 
  TrendingUp, People, Today, Assessment, Print
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getCajaAdmin, getHistorialAdmin } from '../../services/api';
import type { CajaAdmin, Venta } from '../../types';
import { getFechaHoy, extraerFecha } from '../../utils/dateUtils';

export default function AdminCerrarCaja() {
  const { user } = useAuth();
  const [cajaAdmin, setCajaAdmin] = useState<CajaAdmin | null>(null);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [success, setSuccess] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [cajaData, ventasData] = await Promise.all([
        getCajaAdmin(),
        getHistorialAdmin()
      ]);
      setCajaAdmin(cajaData);
      
      // Filtrar solo ventas del día actual
      const hoy = getFechaHoy();
      console.log('📅 ADMIN - Fecha de hoy (local):', hoy);
      console.log('📋 ADMIN - Fechas de ventas del backend:', (ventasData || []).map(v => ({
        id: v.id,
        folio: v.folio,
        vendedor: v.vendedor,
        fecha: v.fecha,
        fechaExtraida: extraerFecha(v.fecha || ''),
        esHoy: extraerFecha(v.fecha || '') === hoy
      })));
      
      const ventasDelDia = (ventasData || []).filter(v => {
        if (!v.fecha) return false;
        return extraerFecha(v.fecha) === hoy;
      });
      console.log('✅ ADMIN - Ventas filtradas del día:', ventasDelDia.length);
      setVentas(ventasDelDia);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setCajaAdmin({
        fecha: getFechaHoy(),
        cantidadVentas: 0,
        detalleCaja: {
          efectivoEnCaja: 0,
          bancoDebito: 0,
          bancoCredito: 0,
          totalVendido: 0
        }
      });
      setVentas([]);
    } finally {
      setLoading(false);
    }
  };

  const getVentasPorVendedor = () => {
    const vendedores = new Map();
    console.log('🔍 Resumen por vendedor - Ventas a procesar:', ventas.length);
    console.log('📋 Ventas para resumen:', ventas.map(v => ({ 
      folio: v.folio, 
      vendedor: v.vendedor?.nombre,
      fecha: v.fecha 
    })));
    
    ventas.forEach(venta => {
      const vendedor = venta.vendedor?.nombre || 'Desconocido';
      const rut = venta.vendedor?.rut || '';
      const total = venta.resumen?.total || venta.total || 0;
      const medioPago = venta.resumen?.medioPago || venta.medioPago || '';
      
      if (!vendedores.has(rut)) {
        vendedores.set(rut, {
          nombre: vendedor,
          rut,
          totalVentas: 0,
          cantidadVentas: 0,
          efectivo: 0,
          debito: 0,
          credito: 0
        });
      }
      
      const v = vendedores.get(rut);
      v.totalVentas += total;
      v.cantidadVentas += 1;
      
      if (medioPago === 'EFECTIVO') v.efectivo += total;
      else if (medioPago === 'DEBITO') v.debito += total;
      else if (medioPago === 'CREDITO') v.credito += total;
    });
    
    const resultado = Array.from(vendedores.values());
    console.log('✅ Resumen final por vendedor:', resultado);
    return resultado;
  };

  const handleCerrarCaja = async () => {
    // Aquí podrías implementar la lógica de cerrar caja en el backend
    setConfirmDialog(false);
    setShowReceipt(true);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const vendedoresData = getVentasPorVendedor();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  const BoletaCierre = () => (
    <Box 
      id="receipt-content"
      ref={receiptRef}
      sx={{
        maxWidth: '80mm',
        mx: 'auto',
        p: 2,
        fontFamily: 'monospace',
        '@media print': {
          maxWidth: '80mm',
          margin: 0,
          padding: '10mm'
        }
      }}
    >
      <Box textAlign="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">TIENDA DUOC</Typography>
        <Typography variant="body2">San Joaquín, Chile</Typography>
        <Typography variant="body2">RUT: 11.111.111-1</Typography>
        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle1" fontWeight="bold">CIERRE DE CAJA</Typography>
        <Typography variant="body2">Fecha: {new Date().toLocaleDateString('es-CL')}</Typography>
        <Typography variant="body2">Hora: {new Date().toLocaleTimeString('es-CL')}</Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box mb={2}>
        <Typography variant="body2" fontWeight="bold" gutterBottom>RESUMEN POR MEDIO DE PAGO</Typography>
        <Box display="flex" justifyContent="space-between" my={0.5}>
          <Typography variant="body2">Efectivo:</Typography>
          <Typography variant="body2" fontWeight="600">
            ${cajaAdmin?.detalleCaja?.efectivoEnCaja?.toLocaleString() || 0}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" my={0.5}>
          <Typography variant="body2">Débito:</Typography>
          <Typography variant="body2" fontWeight="600">
            ${cajaAdmin?.detalleCaja?.bancoDebito?.toLocaleString() || 0}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" my={0.5}>
          <Typography variant="body2">Crédito:</Typography>
          <Typography variant="body2" fontWeight="600">
            ${cajaAdmin?.detalleCaja?.bancoCredito?.toLocaleString() || 0}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box mb={2}>
        <Box display="flex" justifyContent="space-between" my={0.5}>
          <Typography variant="body2">Cantidad de ventas del día:</Typography>
          <Typography variant="body2" fontWeight="600">{ventas.length}</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Divider sx={{ my: 2 }} />

      <Box textAlign="center" mb={2}>
        <Typography variant="h6" fontWeight="bold" color="primary">
          TOTAL DEL DÍA
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          ${cajaAdmin?.detalleCaja?.totalVendido?.toLocaleString() || 0}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box textAlign="center" mt={2}>
        <Typography variant="caption" display="block" color="text.secondary">
          Administrador: {user?.name || 'Admin'}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1}>
          <Assessment color="primary" />
          <Typography variant="h5" fontWeight="600">
            Cerrar Caja del Día
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Receipt />}
            onClick={() => setConfirmDialog(true)}
            disabled={!cajaAdmin || cajaAdmin.detalleCaja.totalVendido === 0}
          >
            Procesar Cierre
          </Button>
        </Box>
      </Box>

      {/* Alerta de éxito */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Resumen General */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ border: '1px solid', borderColor: 'primary.main', boxShadow: 0 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">Total del Día</Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    ${cajaAdmin?.detalleCaja?.totalVendido?.toLocaleString() || 0}
                  </Typography>
                </Box>
                <TrendingUp color="primary" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ border: '1px solid', borderColor: 'success.main', boxShadow: 0 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">Efectivo</Typography>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    ${cajaAdmin?.detalleCaja?.efectivoEnCaja?.toLocaleString() || 0}
                  </Typography>
                </Box>
                <AttachMoney color="success" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ border: '1px solid', borderColor: 'info.main', boxShadow: 0 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">Débito</Typography>
                  <Typography variant="h6" fontWeight="bold" color="info.main">
                    ${cajaAdmin?.detalleCaja?.bancoDebito?.toLocaleString() || 0}
                  </Typography>
                </Box>
                <AccountBalance color="info" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ border: '1px solid', borderColor: 'warning.main', boxShadow: 0 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">Crédito</Typography>
                  <Typography variant="h6" fontWeight="bold" color="warning.main">
                    ${cajaAdmin?.detalleCaja?.bancoCredito?.toLocaleString() || 0}
                  </Typography>
                </Box>
                <CreditCard color="warning" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Resumen por Vendedor */}
      <Paper sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, boxShadow: 0 }}>
        <Box p={2} bgcolor="grey.50" borderBottom="1px solid" borderColor="divider">
          <Box display="flex" alignItems="center" gap={1}>
            <People color="primary" />
            <Typography variant="h6" fontWeight="600">
              Resumen por Vendedor
            </Typography>
          </Box>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Vendedor</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>RUT</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Ventas</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Efectivo</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Débito</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Crédito</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vendedoresData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay ventas registradas para hoy
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                vendedoresData.map((vendedor) => (
                  <TableRow key={vendedor.rut} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {vendedor.nombre}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {vendedor.rut}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={vendedor.cantidadVentas} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="success.main" fontWeight={vendedor.efectivo > 0 ? 600 : 400}>
                        ${vendedor.efectivo.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="info.main" fontWeight={vendedor.debito > 0 ? 600 : 400}>
                        ${vendedor.debito.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="warning.main" fontWeight={vendedor.credito > 0 ? 600 : 400}>
                        ${vendedor.credito.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="bold">
                        ${vendedor.totalVentas.toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog de confirmación */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirmar Cierre de Caja</DialogTitle>
        <DialogContent>
          <Typography variant="body1" mb={2}>
            ¿Está seguro de que desea procesar el cierre de caja del día?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Total del día:</strong> ${cajaAdmin?.detalleCaja?.totalVendido?.toLocaleString() || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Cantidad de ventas:</strong> {ventas.length}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleCerrarCaja}>
            Procesar Cierre
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de boleta de cierre */}
      <Dialog 
        open={showReceipt} 
        onClose={() => setShowReceipt(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Boleta de Cierre</Typography>
            <Button
              variant="contained"
              startIcon={<Print />}
              onClick={handlePrintReceipt}
              size="small"
            >
              Imprimir
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <BoletaCierre />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReceipt(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Estilos de impresión */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            ${receiptRef.current ? `
              #receipt-content,
              #receipt-content * {
                visibility: visible;
              }
              #receipt-content {
                position: absolute;
                left: 0;
                top: 0;
              }
            ` : ''}
          }
        `}
      </style>
    </Box>
  );
}