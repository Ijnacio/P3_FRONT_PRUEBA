import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getHistorialAdmin } from "../../services/api";
import { 
  Box, Grid, Paper, Typography, Card, CardContent,
  Table, TableBody, TableCell, TableHead, TableRow,
  CircularProgress, Chip, Button
} from "@mui/material";
import { 
  TrendingUp, ShoppingCart, LocalShipping, AttachMoney
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import type { Venta } from "../../types";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const historialData = await getHistorialAdmin();
        setVentas(Array.isArray(historialData) ? historialData : []);
      } catch (error) {
        setVentas([]);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  const totalVentas = ventas.length;
  const totalIngresos = ventas.reduce((sum, v) => sum + (v.montoTotal || 0), 0);
  const pedidosPendientes = ventas.filter(v => v.estadoPedido === 'PENDIENTE').length;
  const ventasHoy = ventas.filter(v => {
    const hoy = new Date().toDateString();
    const fechaVenta = new Date(v.fecha).toDateString();
    return hoy === fechaVenta;
  });

  return (
    <Box>
      <Box mb={3} p={2} bgcolor="background.paper" borderRadius={1} border="1px solid" borderColor="divider">
        <Typography variant="h6" fontWeight="600" gutterBottom>
          Panel de Administración
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.name} • {new Date().toLocaleDateString('es-CL')}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard 
            title="Total Ventas" 
            value={totalVentas}
            icon={<ShoppingCart />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard 
            title="Ingresos Totales" 
            value={'$' + totalIngresos.toLocaleString()}
            icon={<AttachMoney />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard 
            title="Ventas Hoy" 
            value={ventasHoy.length}
            icon={<TrendingUp />}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard 
            title="Pedidos Pendientes" 
            value={pedidosPendientes}
            icon={<LocalShipping />}
            color="warning"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, boxShadow: 0 }}>
            <Box p={2} bgcolor="grey.50" borderBottom="1px solid" borderColor="divider" display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight="600">Ventas Recientes</Typography>
              <Button size="small" variant="text" onClick={() => navigate('/admin/pedidos')}>Ver Todas</Button>
            </Box>
            <Box p={2}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Boleta</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Cliente</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Método Pago</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ventasHoy.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">No hay ventas hoy</TableCell>
                    </TableRow>
                  ) : (
                    ventasHoy.slice(0, 10).map((venta) => (
                      <TableRow key={venta.id}>
                        <TableCell><strong>#{venta.boleta || 'Sin folio'}</strong></TableCell>
                        <TableCell>
                          {new Date(venta.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </TableCell>
                        <TableCell>
                          {typeof venta.cliente === 'string' 
                            ? venta.cliente 
                            : (venta.cliente?.email || venta.cliente?.name || 'Invitado')}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={venta.estadoPedido || 'PENDIENTE'} 
                            size="small" 
                            color={(venta.estadoPedido || 'PENDIENTE') === 'PENDIENTE' ? 'warning' : 'success'} 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={venta.metodoPago || 'CREDITO'} 
                            size="small" 
                            variant="outlined"
                            color="primary"
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {'$' + (venta.montoTotal?.toLocaleString() || '0')}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function SummaryCard({ title, value, icon, color }: any) {
  return (
    <Card sx={{ 
      height: '100%', 
      border: '1px solid', 
      borderColor: 'divider', 
      boxShadow: 0,
      '&:hover': { boxShadow: 1 }
    }}>
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="start">
          <Box>
            <Typography color="text.secondary" variant="body2" sx={{ fontSize: '0.8rem', mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight="600" color="text.primary">
              {value}
            </Typography>
          </Box>
          <Box 
            sx={{ 
              color: (color + '.main'),
              p: 1,
              borderRadius: 1,
              display: 'flex',
              border: '1px solid',
              borderColor: (color + '.main'),
              bgcolor: (color + '.50')
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
