import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, Collapse, FormControl, Select, MenuItem,
  Card, CardContent, Grid, Button, Dialog, DialogContent, DialogActions, TextField,
  InputAdornment, Stack
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp, Print as PrintIcon, Search as SearchIcon } from "@mui/icons-material";
import { getHistorialAdmin, updateEstadoPedido } from "../../services/api";
import Boleta from "../../components/molecules/Boleta";
import type { Venta } from "../../types";

function Row({ pedido, onUpdateEstado }: { pedido: Venta; onUpdateEstado: () => void }) {
  const [open, setOpen] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState(pedido.estadoPedido || 'PENDIENTE');
  const [showBoleta, setShowBoleta] = useState(false);
  const boletaRef = useRef<HTMLDivElement>(null);

  const estados = ['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO'];

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

  const handleCambiarEstado = async () => {
    if (nuevoEstado === pedido.estadoPedido) return;
    try {
      await updateEstadoPedido(pedido.id, nuevoEstado);
      onUpdateEstado();
    } catch (error) {
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
        <TableCell><strong>#{pedido.boleta || `F-${String(pedido.id).padStart(6, '0')}`}</strong></TableCell>
        <TableCell>{new Date(pedido.fecha).toLocaleString()}</TableCell>
        <TableCell>
          {typeof pedido.cliente === 'string' 
            ? pedido.cliente 
            : (pedido.cliente?.email || pedido.cliente?.name || 'Invitado')}
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Chip 
              label={pedido.estadoPedido || 'PENDIENTE'} 
              color={getStatusColor(pedido.estadoPedido || 'PENDIENTE')}
              size="small" 
              sx={{ fontWeight: 'bold' }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={nuevoEstado || 'PENDIENTE'}
                onChange={(e) => setNuevoEstado(e.target.value)}
              >
                {estados.map(estado => (
                  <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {nuevoEstado !== pedido.estadoPedido && (
              <Button size="small" onClick={handleCambiarEstado} variant="contained">
                Guardar
              </Button>
            )}
          </Box>
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
        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
          ${pedido.montoTotal?.toLocaleString() || '0'}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="h6" gutterBottom>
                Detalle del Pedido
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Cliente
                      </Typography>
                      <Typography variant="body2">
                        <strong>Nombre:</strong> {typeof pedido.cliente === 'string' ? pedido.cliente : pedido.cliente?.name || 'Invitado'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email:</strong> {typeof pedido.cliente === 'string' ? '-' : pedido.cliente?.email || '-'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>RUT:</strong> {typeof pedido.cliente === 'string' ? '-' : pedido.cliente?.rut || '-'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Entrega
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
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Pago
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
                        <strong>Método:</strong> {pedido.metodoPago}
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
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Precio Unit.</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pedido.detalles?.map((detalle) => (
                    <TableRow key={detalle.id}>
                      <TableCell>{detalle.producto?.nombre || 'Producto'}</TableCell>
                      <TableCell align="right">{detalle.cantidad}</TableCell>
                      <TableCell align="right">${detalle.precioUnitario?.toLocaleString() || '0'}</TableCell>
                      <TableCell align="right">${detalle.subtotal?.toLocaleString() || '0'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant='contained' 
                  startIcon={<PrintIcon />}
                  onClick={() => setShowBoleta(true)}
                  size='small'
                >
                  Ver/Imprimir Boleta
                </Button>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      {/* Boleta Dialog */}
      <Dialog 
        open={showBoleta} 
        onClose={() => setShowBoleta(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogContent>
          <Boleta venta={pedido} ref={boletaRef} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBoleta(false)}>Cerrar</Button>
          <Button 
            variant='contained' 
            startIcon={<PrintIcon />}
            onClick={() => {
              if (boletaRef.current) {
                const printContent = boletaRef.current.innerHTML;
                const printWindow = window.open('', '', 'width=800,height=600');
                if (printWindow) {
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Boleta N° ${pedido.boleta || pedido.id}</title>
                        <style>
                          body { font-family: monospace; padding: 20px; }
                          @media print {
                            body { padding: 0; }
                            button { display: none; }
                          }
                        </style>
                      </head>
                      <body>${printContent}</body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.focus();
                  setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                  }, 250);
                }
              }
            }}
          >
            Imprimir
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function AdminPedidos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');

  useEffect(() => {
    if (!user || user.rol !== 'admin') {
      navigate('/');
      return;
    }
    loadPedidos();
  }, [user]);

  const loadPedidos = async () => {
    try {
      setLoading(true);
      const data = await getHistorialAdmin();
      console.log('📦 DATOS DEL BACKEND:', data);
      if (data && data.length > 0) {
        console.log('📦 PRIMER PEDIDO:', data[0]);
        console.log('📦 DETALLES:', data[0].detalles);
        console.log('📦 CLIENTE:', data[0].cliente);
      }
      setPedidos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ ERROR AL CARGAR PEDIDOS:', error);
    } finally {
      setLoading(false);
    }
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    // Filtro por estado
    if (filtroEstado && pedido.estadoPedido !== filtroEstado) {
      return false;
    }

    // Filtro por búsqueda (correo, número de boleta)
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      const boleta = String(pedido.boleta || pedido.id).toLowerCase();
      
      let clienteEmail = '';
      if (pedido.cliente) {
        if (typeof pedido.cliente === 'string') {
          clienteEmail = String(pedido.cliente).toLowerCase();
        } else if (pedido.cliente.email) {
          clienteEmail = pedido.cliente.email.toLowerCase();
        }
      }
      
      if (!boleta.includes(busquedaLower) && !clienteEmail.includes(busquedaLower)) {
        return false;
      }
    }

    // Filtro por rango de fechas
    if (fechaInicio) {
      const fechaPedido = new Date(pedido.fecha);
      const inicio = new Date(fechaInicio);
      inicio.setHours(0, 0, 0, 0);
      
      // Comparar solo la fecha (día)
      const fechaPedidoStr = fechaPedido.toISOString().split('T')[0];
      const fechaInicioStr = inicio.toISOString().split('T')[0];
      
      if (fechaPedidoStr !== fechaInicioStr) return false;
    }

    return true;
  });

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Gestión de Pedidos
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          {/* Buscador */}
          <TextField
            fullWidth
            placeholder="Buscar por correo o número de boleta..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Filtro por Estado */}
            <FormControl sx={{ minWidth: 200 }}>
              <Select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                displayEmpty
                size="small"
              >
                <MenuItem value="">Todos los Estados</MenuItem>
                <MenuItem value="PENDIENTE">PENDIENTE</MenuItem>
                <MenuItem value="CONFIRMADO">CONFIRMADO</MenuItem>
                <MenuItem value="EN_PREPARACION">EN_PREPARACION</MenuItem>
                <MenuItem value="ENTREGADO">ENTREGADO</MenuItem>
                <MenuItem value="CANCELADO">CANCELADO</MenuItem>
              </Select>
            </FormControl>

            {/* Filtro por Fecha */}
            <TextField
              label="Fecha"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ minWidth: 180 }}
            />

            {/* Botón limpiar filtros */}
            {(busqueda || filtroEstado || fechaInicio) && (
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => {
                  setBusqueda('');
                  setFiltroEstado('');
                  setFechaInicio('');
                }}
              >
                Limpiar Filtros
              </Button>
            )}
          </Box>

          <Typography variant="body2" color="text.secondary">
            {pedidosFiltrados.length} pedido{pedidosFiltrados.length !== 1 ? 's' : ''} encontrado{pedidosFiltrados.length !== 1 ? 's' : ''}
          </Typography>
        </Stack>
      </Paper>

      {loading ? (
        <Typography textAlign="center" sx={{ py: 8 }}>Cargando pedidos...</Typography>
      ) : pedidosFiltrados.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No hay pedidos para mostrar
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
                <TableCell>Cliente</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Entrega</TableCell>
                <TableCell>Pago</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pedidosFiltrados.map((pedido) => (
                <Row key={pedido.id} pedido={pedido} onUpdateEstado={loadPedidos} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
