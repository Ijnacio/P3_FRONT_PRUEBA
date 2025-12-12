import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { 
  Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, Collapse, Card, CardContent, Grid, Button
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { getMisPedidos } from "../../services/api";
import type { Venta } from "../../types";

function Row({ pedido }: { pedido: Venta }) {
  const [open, setOpen] = useState(false);

  const getStatusColor = (estado: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (estado) {
      case 'PENDIENTE': return 'warning';
      case 'CONFIRMADO': return 'info';
      case 'EN_PREPARACION': return 'secondary';
      case 'ENTREGADO': return 'success';
      case 'CANCELADO': return 'error';
      default: return 'default';
    }
  };

  const getEntregaColor = (tipo: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (tipo) {
      case 'ENVIO': return 'info';
      case 'RETIRO': return 'secondary';
      default: return 'default';
    }
  };

  const getPagoColor = (metodo: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (metodo) {
      case 'EFECTIVO': return 'success';
      case 'CREDITO': return 'primary';
      case 'DEBITO': return 'warning';
      default: return 'default';
    }
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>#{pedido.boleta || `F-${String(pedido.id).padStart(6, '0')}`}</TableCell>
        <TableCell>{new Date(pedido.fecha).toLocaleDateString()}</TableCell>
        <TableCell>
          <Chip 
            label={pedido.estadoPedido || 'PENDIENTE'} 
            color={getStatusColor(pedido.estadoPedido || 'PENDIENTE')} 
            size="small" 
            sx={{ fontWeight: 'bold' }}
          />
        </TableCell>
        <TableCell>
          <Chip 
            label={pedido.tipoEntrega || 'ENVIO'} 
            color={getEntregaColor(pedido.tipoEntrega || 'ENVIO')}
            size="small" 
            sx={{ fontWeight: 'bold' }}
          />
        </TableCell>
        <TableCell>
          <Chip 
            label={pedido.metodoPago || 'CREDITO'} 
            color={getPagoColor(pedido.metodoPago || 'CREDITO')}
            size="small" 
            sx={{ fontWeight: 'bold' }}
          />
        </TableCell>
        <TableCell align="right" fontWeight="bold">
          ${pedido.montoTotal?.toLocaleString() || '0'}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="h6" gutterBottom>
                Detalle del Pedido
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Información de Entrega
                      </Typography>
                      <Typography variant="body2">
                        <strong>Tipo:</strong> {pedido.tipoEntrega}
                      </Typography>
                      {pedido.direccionEntrega && (
                        <Typography variant="body2">
                          <strong>Dirección:</strong> {pedido.direccionEntrega}
                        </Typography>
                      )}
                      {pedido.notas && (
                        <Typography variant="body2">
                          <strong>Notas:</strong> {pedido.notas}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Resumen de Pago
                      </Typography>
                      <Typography variant="body2">
                        <strong>Subtotal:</strong> ${pedido.subtotal?.toLocaleString() || '0'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Envío:</strong> ${pedido.costoEnvio?.toLocaleString() || '0'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Total:</strong> ${pedido.montoTotal?.toLocaleString() || '0'}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Método de Pago:</strong> {pedido.metodoPago}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Productos:
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width="60px"></TableCell>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Precio Unit.</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pedido.detalles?.map((detalle) => (
                    <TableRow key={detalle.id}>
                      <TableCell>
                        <Box
                          component="img"
                          src={detalle.imagen || detalle.producto?.imagen || detalle.producto?.fotoUrl ? `http://localhost:3006${detalle.imagen || detalle.producto?.imagen || detalle.producto?.fotoUrl}` : 'https://via.placeholder.com/50?text=Sin+Foto'}
                          alt={detalle.producto?.nombre || 'Producto'}
                          sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 1 }}
                        />
                      </TableCell>
                      <TableCell>{detalle.producto?.nombre || 'Producto'}</TableCell>
                      <TableCell align="right">{detalle.cantidad}</TableCell>
                      <TableCell align="right">${detalle.precioUnitario?.toLocaleString() || '0'}</TableCell>
                      <TableCell align="right">${detalle.subtotal?.toLocaleString() || '0'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function MisPedidos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadPedidos();
  }, [user]);

  const loadPedidos = async () => {
    try {
      setLoading(true);
      const data = await getMisPedidos();
      setPedidos(Array.isArray(data) ? data : []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            Mis Pedidos
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/')}
            >
              Volver a la Tienda
            </Button>
            <Button 
              variant="contained" 
              onClick={loadPedidos}
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Actualizar'}
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Typography textAlign="center" sx={{ py: 8 }}>Cargando pedidos...</Typography>
        ) : pedidos.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tienes pedidos aún
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ¡Empieza a comprar en nuestra pastelería!
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Boleta</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Entrega</TableCell>
                  <TableCell>Pago</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pedidos.map((pedido) => (
                  <Row key={pedido.id} pedido={pedido} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
}
