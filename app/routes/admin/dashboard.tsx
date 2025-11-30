// app/routes/admin/dashboard.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getCajaAdmin, getHistorialAdmin } from "../../services/api";
import { 
  Box, Grid, Paper, Typography, Card, CardContent, // <--- CORRECCIÓN: Grid normal
  Table, TableBody, TableCell, TableHead, TableRow,
  CircularProgress, Chip, Button
} from "@mui/material";
import { 
  TrendingUp, AttachMoney, CreditCard, 
  Receipt, PointOfSale 
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import type { CajaAdmin, Venta } from "../../types";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<CajaAdmin | null>(null);
  const [ventasRecientes, setVentasRecientes] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);

  // cargar datos cuando abre la pagina
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [cajaData, historialData] = await Promise.all([
          getCajaAdmin(),
          getHistorialAdmin()
        ]);
        setStats(cajaData);
        setVentasRecientes(historialData);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
        
        // si falla poner datos vacios para que no se rompa
        setStats({
          fecha: new Date().toISOString(),
          cantidadVentas: 0,
          detalleCaja: {
            efectivoEnCaja: 0,
            bancoDebito: 0,
            bancoCredito: 0,
            totalVendido: 0
          }
        });
        setVentasRecientes([]);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* 1. HEADER DE BIENVENIDA */}
      <Box mb={3} p={2} bgcolor="background.paper" borderRadius={1} border="1px solid" borderColor="divider" display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            Panel de Administración
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.name} • {new Date().toLocaleDateString('es-CL')}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<PointOfSale />}
          onClick={() => navigate('/caja')}
          size="small"
        >
          Ir a POS
        </Button>
      </Box>

      {/* 2. SECCIONES DETALLADAS */}
      <Grid container spacing={3}>
        
        {/* TABLA DE VENTAS RECIENTES */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, boxShadow: 0 }}>
            <Box p={2} bgcolor="grey.50" borderBottom="1px solid" borderColor="divider" display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight="600">Últimas Ventas</Typography>
              <Button size="small" variant="text" onClick={() => navigate('/admin/ventas')}>Ver Todas</Button>
            </Box>
            <Box p={2}>
            
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Hora</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Vendedor</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Pago</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ventasRecientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No hay ventas hoy</TableCell>
                  </TableRow>
                ) : (
                  ventasRecientes.map((venta) => (
                    <TableRow key={venta.folio || venta.id}>
                      <TableCell>
                        {new Date(venta.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </TableCell>
                      <TableCell>{venta.vendedor?.nombre || "Desconocido"}</TableCell>
                      <TableCell>
                        <Chip 
                          label={venta.resumen?.medioPago || 'N/A'} 
                          size="small" 
                          color={venta.resumen?.medioPago === 'EFECTIVO' ? 'success' : 'info'} 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        ${venta.resumen?.total?.toLocaleString() || 0}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </Box>
          </Paper>
        </Grid>

        {/* RESUMEN DE MÉTODOS DE PAGO */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Desglose por Medio</Typography>
            
            <Box display="flex" flexDirection="column" gap={2}>
              <PaymentRow 
                label="Total Vendido" 
                amount={stats?.detalleCaja?.totalVendido || 0} 
                icon={<TrendingUp color="primary" />} 
              />
              <PaymentRow 
                label="Efectivo" 
                amount={stats?.detalleCaja?.efectivoEnCaja || 0} 
                icon={<AttachMoney color="success" />} 
              />
              <PaymentRow 
                label="Débito" 
                amount={stats?.detalleCaja?.bancoDebito || 0} 
                icon={<CreditCard color="info" />} 
              />
              <PaymentRow 
                label="Crédito" 
                amount={stats?.detalleCaja?.bancoCredito || 0} 
                icon={<CreditCard color="warning" />} 
              />
            </Box>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}

// --- COMPONENTES UI AUXILIARES ---

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
              color: `${color}.main`,
              p: 1,
              borderRadius: 1,
              display: 'flex',
              border: '1px solid',
              borderColor: `${color}.main`,
              bgcolor: `${color}.50`
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function PaymentRow({ label, amount, icon }: any) {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" p={1.5} bgcolor="#f8f9fa" borderRadius={2}>
      <Box display="flex" alignItems="center" gap={1}>
        {icon}
        <Typography fontWeight="medium">{label}</Typography>
      </Box>
      <Typography fontWeight="bold">${amount?.toLocaleString() || 0}</Typography>
    </Box>
  );
}