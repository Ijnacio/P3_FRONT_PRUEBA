import { Box, Typography, Card, CardContent, Grid, Paper, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button } from '@mui/material';
import { ArrowBack, AttachMoney, CreditCard, AccountBalance, Receipt } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { useAuth } from '~/context/AuthContext';
import { useState, useEffect } from 'react';
import type { MiCaja, Venta } from '~/types';
import { getMiCaja, getMisVentas } from '~/services/api';
import { getFechaHoy, extraerFecha } from '~/utils/dateUtils';

export default function CierreCaja() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [caja, setCaja] = useState<MiCaja>(() => ({
    vendedorId: 0,
    fecha: getFechaHoy(),
    resumen: {
      totalVendido: 0,
      totalEfectivo: 0,
      totalDebito: 0,
      totalCredito: 0,
      cantidadVentas: 0,
      ventasEfectivo: 0,
      ventasDebito: 0,
      ventasCredito: 0
    }
  }));
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔄 Cargando datos de caja para usuario:', user.rut);
        
        // Cargar resumen de caja
        const dataCaja = await getMiCaja();
        console.log('✅ Datos de caja recibidos:', dataCaja);
        setCaja(dataCaja);
        
        // Cargar ventas del vendedor
        const dataVentas = await getMisVentas();
        const hoy = getFechaHoy();
        console.log('Fecha de hoy:', hoy);
        console.log('Ventas recibidas del backend:', dataVentas?.length || 0);
        
        const ventasDelDia = (dataVentas || []).filter(v => {
          if (!v.fecha) return false;
          const fechaLocal = extraerFecha(v.fecha);
          console.log(`Venta #${v.folio}: fecha backend=${v.fecha}, fecha local=${fechaLocal}, esHoy=${fechaLocal === hoy}`);
          return fechaLocal === hoy;
        });
        
        console.log('Ventas del día filtradas:', ventasDelDia.length);
        setVentas(ventasDelDia);
        
      } catch (error: any) {
        console.error('❌ Error al cargar datos de caja:', error);
        
        // Si hay error de autenticación, redirigir al login
        if (error?.response?.status === 401) {
          console.log('🔐 Token inválido, redirigiendo al login');
          navigate('/login');
          return;
        }
        
        // Para otros errores, mostrar caja vacía con estructura correcta
        const cajaPorDefecto: MiCaja = {
          vendedorId: user.id,
          fecha: getFechaHoy(),
          resumen: {
            totalVendido: 0,
            totalEfectivo: 0,
            totalDebito: 0,
            totalCredito: 0,
            cantidadVentas: 0,
            ventasEfectivo: 0,
            ventasDebito: 0,
            ventasCredito: 0
          }
        };
        setCaja(cajaPorDefecto);
        setVentas([]);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [user, navigate]);

  const getMetodoPagoColor = (metodo: string) => {
    switch (metodo) {
      case 'EFECTIVO':
        return 'success';
      case 'DEBITO':
        return 'info';
      case 'CREDITO':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getMetodoPagoIcon = (metodo: string) => {
    switch (metodo) {
      case 'EFECTIVO':
        return <AttachMoney />;
      case 'DEBITO':
        return <AccountBalance />;
      case 'CREDITO':
        return <CreditCard />;
      default:
        return <Receipt />;
    }
  };

  if (loading) {
    return (
      <Box p={3} textAlign="center">
        <Typography>Cargando datos de caja...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3} maxWidth="1200px" mx="auto">
      
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} p={2} bgcolor="background.paper" borderRadius={1} border="1px solid" borderColor="divider">
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate('/caja')} sx={{ mr: 1.5 }} size="small">
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h6" fontWeight="600" color="text.primary">
              Mi Caja - {new Date().toLocaleDateString('es-CL')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.name} • {user?.rut}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          size="small"
          onClick={() => navigate('/caja')}
          startIcon={<Receipt />}
        >
          Volver a Ventas
        </Button>
      </Box>



      {/* Cards separadas por método de pago */}
      <Grid container spacing={3} mb={4}>
        
        {/* Efectivo */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ border: '1px solid', borderColor: 'success.main', boxShadow: 0 }}>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="body1" fontWeight="600" color="success.main">EFECTIVO</Typography>
                <AttachMoney sx={{ fontSize: 20, color: 'success.main' }} />
              </Box>
              <Typography variant="h5" fontWeight="600" mb={0.5} color="text.primary">
                ${(caja?.resumen?.totalEfectivo || 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {ventas.filter(v => (v.resumen?.medioPago || v.medioPago || 'EFECTIVO') === 'EFECTIVO').length} ventas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Débito */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ border: '1px solid', borderColor: 'info.main', boxShadow: 0 }}>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="body1" fontWeight="600" color="info.main">DÉBITO</Typography>
                <AccountBalance sx={{ fontSize: 20, color: 'info.main' }} />
              </Box>
              <Typography variant="h5" fontWeight="600" mb={0.5} color="text.primary">
                ${(caja?.resumen?.totalDebito || 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {ventas.filter(v => (v.resumen?.medioPago || v.medioPago) === 'DEBITO').length} ventas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Crédito */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ border: '1px solid', borderColor: 'warning.main', boxShadow: 0 }}>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="body1" fontWeight="600" color="warning.main">CRÉDITO</Typography>
                <CreditCard sx={{ fontSize: 20, color: 'warning.main' }} />
              </Box>
              <Typography variant="h5" fontWeight="600" mb={0.5} color="text.primary">
                ${(caja?.resumen?.totalCredito || 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {ventas.filter(v => (v.resumen?.medioPago || v.medioPago) === 'CREDITO').length} ventas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* Resumen Total */}
      <Paper sx={{ p: 2.5, borderRadius: 1, mb: 3, border: '2px solid', borderColor: 'primary.main', bgcolor: 'primary.50' }}>
        <Box textAlign="center">
          <Typography variant="body1" color="primary.main" fontWeight="600">TOTAL VENDIDO HOY</Typography>
          <Typography variant="h4" fontWeight="700" color="primary.main" sx={{ my: 1 }}>
            ${(caja?.resumen?.totalVendido || 0).toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {caja?.resumen?.cantidadVentas || 0} ventas realizadas
          </Typography>
        </Box>
      </Paper>

      {/* Tabla de ventas detallada */}
      <Paper sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, boxShadow: 0 }}>
        <Box p={2} borderBottom="1px solid" borderColor="divider" bgcolor="grey.50">
          <Typography variant="subtitle1" fontWeight="600">Detalle de Ventas del Día</Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Hora</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Vendedor</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Pago</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Items</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ventas.map((venta) => (
                <TableRow key={venta.folio || venta.id} hover sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.8rem' }}>
                      #{venta.folio || venta.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      {new Date(venta.fecha).toLocaleTimeString('es-CL', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      {venta.vendedor?.nombre || user?.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getMetodoPagoIcon(venta.resumen?.medioPago || venta.medioPago || 'EFECTIVO')}
                      label={(venta.resumen?.medioPago || venta.medioPago || 'EFECTIVO')}
                      color={getMetodoPagoColor(venta.resumen?.medioPago || venta.medioPago || 'EFECTIVO') as any}
                      size="small"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      {(venta.items || venta.detalles || []).slice(0, 2).map((item: any, index: number) => (
                        <Typography key={index} variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
                          {item.cantidad}x {item.producto}
                        </Typography>
                      ))}
                      {(venta.items || venta.detalles || []).length > 2 && (
                        <Typography variant="caption" color="text.secondary">
                          +{(venta.items || venta.detalles || []).length - 2} más
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.85rem' }}>
                      ${(venta.resumen?.total || venta.total || 0).toLocaleString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {ventas.length === 0 && (
          <Box p={4} textAlign="center">
            <Typography color="text.secondary">
              No hay ventas registradas para hoy
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Botón de cierre de caja */}
      <Box mt={3} textAlign="center">
        <Button
          variant="outlined"
          size="medium"
          onClick={() => {
            // TODO: Implementar cierre de caja
            alert('Funcionalidad de cierre de caja pendiente');
          }}
          sx={{ 
            minWidth: 160, 
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.dark',
              bgcolor: 'primary.50'
            }
          }}
        >
          Cerrar Caja
        </Button>
      </Box>
    </Box>
  );
}