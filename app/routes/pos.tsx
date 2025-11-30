import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getCategorias, getProductos, createVenta } from "../services/api";
import type { Producto, Categoria } from "../types";

import { 
  Box, Grid, 
  Paper, Typography, Button, Tabs, Tab, 
  Card, CardContent, CardMedia, CardActionArea,
  TextField, InputAdornment, IconButton, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio,
  Alert, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow
} from "@mui/material";
import { 
  Search, ShoppingCart, Delete, Add, Remove, 
  Logout, Assessment, Receipt 
} from "@mui/icons-material";

// Eliminamos el loader de servidor para evitar errores de token
export default function POS() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Estado de datos
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Estado de UI
  const [search, setSearch] = useState("");
  const [catId, setCatId] = useState<number | 'all'>('all');
  const [modalPago, setModalPago] = useState(false);
  
  // Cargar datos en el Cliente (donde sí existe el token)
  useEffect(() => {
    fetchData();
  }, []);

  // cargar categorias y productos del backend
  const fetchData = async () => {
    try {
      const [cats, prods] = await Promise.all([
        getCategorias(),
        getProductos()
      ]);
      setCategorias(cats);
      setProductos(prods);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoadingData(false);
    }
  };

  // esta funcion se llama despues de hacer una venta para actualizar el stock
  const recargarProductos = async () => {
    try {
      const prods = await getProductos();
      setProductos(prods);
    } catch (error) {
      console.error("Error recargando productos:", error);
    }
  };
  
  // filtrar productos por busqueda y categoria
  const productosFiltrados = useMemo(() => {
    return productos.filter((p: Producto) => {
      const matchText = p.nombre.toLowerCase().includes(search.toLowerCase());
      const matchCat = catId === 'all' || p.categoria?.id === catId;
      return matchText && matchCat;
    });
  }, [productos, search, catId]);

  // cerrar sesion
  const handleLogout = () => {
    logout();
  };

  if (loadingData) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
      
      {/* HEADER */}
      <Paper elevation={1} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box sx={{ width: 32, height: 32, bgcolor: 'primary.light', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Assessment fontSize="small" sx={{ color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" lineHeight={1.2}>
              Pastelería 1000 Sabores
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Cajero: {user?.name || user?.rut}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<Assessment />} 
            onClick={() => navigate('/cierre-caja')}
          >
            Mi Caja
          </Button>
          {user?.rol === 'admin' && (
            <Button 
              variant="contained" 
              size="small" 
              onClick={() => navigate('/admin')}
            >
              Panel Admin
            </Button>
          )}
          <Button 
            color="error" 
            size="small" 
            startIcon={<Logout />} 
            onClick={handleLogout}
          >
            Salir
          </Button>
        </Box>
      </Paper>

      {/* CONTENIDO PRINCIPAL */}
      <Grid container sx={{ flex: 1, overflow: 'hidden' }}>
        
        {/* IZQUIERDA: CATÁLOGO */}
        <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
          
          <Box sx={{ mb: 2 }}>
            <TextField 
              fullWidth 
              placeholder="Buscar producto..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                sx: { bgcolor: 'white', borderRadius: 2 }
              }}
              size="small"
            />
            <Tabs 
              value={catId} 
              onChange={(_, v) => setCatId(v)} 
              variant="scrollable" 
              scrollButtons="auto"
              sx={{ mt: 1, '& .MuiTab-root': { minHeight: 48 } }}
            >
              <Tab label="Todos" value="all" />
              {categorias.map(c => (
                <Tab key={c.id} label={c.nombre} value={c.id} />
              ))}
            </Tabs>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <Grid container spacing={2}>
              {productosFiltrados.map((prod: Producto) => (
                <Grid size={{ xs: 6, sm: 4, lg: 3 }} key={prod.id}>
                  <ProductoCard producto={prod} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>

        {/* DERECHA: CARRITO */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ height: '100%', borderLeft: '1px solid #ddd', bgcolor: 'white' }}>
          <CarritoPanel onPagar={() => setModalPago(true)} />
        </Grid>

      </Grid>

      <ModalPago open={modalPago} onClose={() => setModalPago(false)} onVentaCompletada={recargarProductos} />
    </Box>
  );
}

// (Mantén los subcomponentes ProductoCard, CarritoPanel y ModalPago igual que antes, 
//  solo asegúrate de que ProductoCard reciba la prop producto correctamente)
function ProductoCard({ producto }: { producto: Producto }) {
  const { addToCart, items, updateQuantity, removeFromCart } = useCart();
  const [cantidad, setCantidad] = useState(1);
  
  const imgUrl = producto.fotoUrl?.startsWith('/') 
    ? `http://localhost:3006${producto.fotoUrl}` 
    : (producto.fotoUrl || "https://via.placeholder.com/150");

  const itemEnCarrito = items.find(i => i.producto.id === producto.id);
  const cantidadEnCarrito = itemEnCarrito?.cantidad || 0;

  const agregarAlCarrito = () => {
    const stockDisponible = producto.stock - cantidadEnCarrito;
    const cantidadAAgregar = Math.min(cantidad, stockDisponible);
    
    if (cantidadAAgregar <= 0) {
      alert(`No hay stock suficiente. Stock disponible: ${stockDisponible}`);
      return;
    }
    
    if (cantidadAAgregar < cantidad) {
      alert(`Solo puedes agregar ${cantidadAAgregar} unidades más. Ya tienes ${cantidadEnCarrito} en el carrito.`);
    }
    
    for (let i = 0; i < cantidadAAgregar; i++) {
      addToCart(producto);
    }
    setCantidad(1);
  };

  return (
    <Card sx={{ 
      height: '200px', 
      display: 'flex', 
      flexDirection: 'column', 
      transition: '0.15s', 
      border: '1px solid',
      borderColor: cantidadEnCarrito > 0 ? 'success.main' : 'divider',
      boxShadow: 0,
      '&:hover': { 
        borderColor: 'primary.main',
        boxShadow: 1
      }
    }}>
      <CardMedia 
        component="img" 
        height="110" 
        image={imgUrl} 
        alt={producto.nombre} 
        sx={{ 
          objectFit: 'cover',
          cursor: cantidadEnCarrito >= producto.stock ? 'not-allowed' : 'pointer',
          transition: '0.15s',
          '&:hover': { opacity: cantidadEnCarrito >= producto.stock ? 1 : 0.9 },
          width: '100%',
          minHeight: '110px',
          maxHeight: '110px',
          opacity: cantidadEnCarrito >= producto.stock ? 0.5 : 1
        }}
        onClick={() => {
          if (cantidadEnCarrito < producto.stock) {
            addToCart(producto);
          } else {
            alert(`No hay más stock disponible. Ya tienes ${cantidadEnCarrito} en el carrito.`);
          }
        }}
      />
      <CardContent sx={{ flex: 1, p: 1.25, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.85rem', lineHeight: 1.2, mb: 0.5 }} noWrap>
            {producto.nombre}
          </Typography>
          <Typography variant="subtitle2" color="primary" fontWeight="600" sx={{ fontSize: '0.9rem' }}>
            ${producto.precio.toLocaleString()}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Stock: {producto.stock}
            </Typography>
            {cantidadEnCarrito > 0 && (
              <Typography variant="caption" color="success.main" fontWeight="600" sx={{ fontSize: '0.7rem' }}>
                En carrito: {cantidadEnCarrito}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton 
              size="small" 
              onClick={() => setCantidad(Math.max(1, cantidad - 1))}
              sx={{ width: 20, height: 20, fontSize: '0.7rem' }}
            >
              <Remove fontSize="inherit" />
            </IconButton>
            <Typography variant="caption" sx={{ minWidth: 16, textAlign: 'center', fontSize: '0.75rem' }}>
              {cantidad}
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => {
                const stockDisponible = producto.stock - cantidadEnCarrito;
                setCantidad(Math.min(stockDisponible, cantidad + 1));
              }}
              disabled={cantidadEnCarrito >= producto.stock}
              sx={{ width: 20, height: 20, fontSize: '0.7rem' }}
            >
              <Add fontSize="inherit" />
            </IconButton>
            <IconButton 
              size="small" 
              color="primary" 
              onClick={agregarAlCarrito}
              disabled={producto.stock === 0 || cantidadEnCarrito >= producto.stock}
              sx={{ 
                width: 24, 
                height: 24, 
                bgcolor: 'primary.main', 
                color: 'white', 
                ml: 0.5,
                '&:hover': { bgcolor: 'primary.dark' },
                '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' }
              }}
            >
              <ShoppingCart sx={{ fontSize: '0.8rem' }} />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
// (Agrega aquí CarritoPanel y ModalPago tal cual estaban en tu versión anterior corregida)
function CarritoPanel({ onPagar }: { onPagar: () => void }) {
  const { items, removeFromCart, updateQuantity, total, neto, iva, clearCart } = useCart();
  
  const handleUpdateQuantity = (productoId: number, cantidad: number, stock: number) => {
    if (cantidad > stock) {
      alert(`No hay suficiente stock. Stock disponible: ${stock}`);
      return;
    }
    updateQuantity(productoId, cantidad);
  };
  
  if (items.length === 0) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <ShoppingCart sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography color="text.secondary">Carrito Vacío</Typography>
          <Typography variant="caption" color="text.secondary">
            Agrega productos para comenzar una venta
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header del carrito */}
      <Box sx={{ p: 2, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">
          Carrito ({items.length})
        </Typography>
        <Button size="small" color="error" onClick={clearCart} startIcon={<Delete />}>
          Limpiar
        </Button>
      </Box>

      {/* Items del carrito */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {items.map((item: any) => (
          <Paper key={item.producto.id} elevation={0} sx={{ 
            p: 2, mb: 1, border: '1px solid #eee', 
            display: 'flex', alignItems: 'center' 
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                {item.producto.nombre}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ${item.producto.precio.toLocaleString()} c/u
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton 
                size="small" 
                onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)} 
                disabled={item.cantidad <= 1}
              >
                <Remove fontSize="small" />
              </IconButton>
              <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                {item.cantidad}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => handleUpdateQuantity(item.producto.id, item.cantidad + 1, item.producto.stock)}
                disabled={item.cantidad >= item.producto.stock}
              >
                <Add fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                color="error" 
                onClick={() => removeFromCart(item.producto.id)}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
            
            <Box sx={{ ml: 2, textAlign: 'right', minWidth: 80 }}>
              <Typography variant="body2" fontWeight="bold">
                ${(item.producto.precio * item.cantidad).toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Detalle de la boleta */}
      <Paper elevation={4} sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 0 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Detalle de Boleta
        </Typography>
        
        {/* Subtotal */}
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body2">Neto:</Typography>
          <Typography variant="body2">${neto.toLocaleString()}</Typography>
        </Box>
        
        {/* IVA */}
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body2">IVA (19%):</Typography>
          <Typography variant="body2">${iva.toLocaleString()}</Typography>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        {/* Total */}
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography variant="h6" fontWeight="bold">Total:</Typography>
          <Typography variant="h6" fontWeight="bold" color="primary">
            ${total.toLocaleString()}
          </Typography>
        </Box>
        
        <Button 
          variant="contained" 
          fullWidth 
          color="primary" 
          size="large"
          startIcon={<Receipt />}
          onClick={onPagar}
          sx={{ 
            bgcolor: 'primary.main', 
            '&:hover': { bgcolor: 'primary.dark' },
            py: 1.5
          }}
        >
          Procesar Pago
        </Button>
      </Paper>
    </Box>
  );
}
function ModalPago({ open, onClose, onVentaCompletada }: { open: boolean, onClose: () => void, onVentaCompletada: () => Promise<void> }) {
  const { items, total, neto, iva, clearCart } = useCart();
  const { user } = useAuth();
  const [medioPago, setMedioPago] = useState<'EFECTIVO' | 'DEBITO' | 'CREDITO'>('EFECTIVO');
  const [montoEntregado, setMontoEntregado] = useState("");
  const [loading, setLoading] = useState(false);
  const [ventaRealizada, setVentaRealizada] = useState<any>(null);

  const vuelto = medioPago === 'EFECTIVO' ? Math.max(0, (parseInt(montoEntregado) || 0) - total) : 0;
  const puedePagar = medioPago === 'EFECTIVO' ? (parseInt(montoEntregado) >= total) : true;

  const handlePago = async () => {
    if (!puedePagar) return;
    setLoading(true);
    
    try {
      const ventaData = {
        items: items.map((i: any) => ({ productoId: i.producto.id, cantidad: i.cantidad })),
        medioPago,
        montoEntregado: medioPago === 'EFECTIVO' ? parseInt(montoEntregado) : total
      };
      
      const venta = await createVenta(ventaData);
      setVentaRealizada({ ...venta, vuelto });
      clearCart();
      // Recargar productos para actualizar el stock
      await onVentaCompletada();
    } catch (error) {
      console.error('Error procesando venta:', error);
      alert('Error al procesar la venta');
    } finally {
      setLoading(false);
    }
  };

  const cerrarModal = () => {
    setVentaRealizada(null);
    setMontoEntregado("");
    setMedioPago('EFECTIVO');
    onClose();
  };

  if (ventaRealizada) {
    return (
      <Dialog open={open} onClose={cerrarModal} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <BoletaComponent 
            venta={ventaRealizada} 
            items={items} 
            vendedor={user} 
            onClose={cerrarModal}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Procesar Pago</DialogTitle>
      <DialogContent>
        <Typography variant="h5" fontWeight="bold" mb={2} textAlign="center">
          Total: ${total.toLocaleString()}
        </Typography>

        <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
          <FormLabel component="legend">Método de Pago</FormLabel>
          <RadioGroup
            value={medioPago}
            onChange={(e) => setMedioPago(e.target.value as any)}
            row
          >
            <FormControlLabel value="EFECTIVO" control={<Radio />} label="Efectivo" />
            <FormControlLabel value="DEBITO" control={<Radio />} label="Débito" />
            <FormControlLabel value="CREDITO" control={<Radio />} label="Crédito" />

          </RadioGroup>
        </FormControl>

        {medioPago === 'EFECTIVO' && (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Monto Entregado"
              type="number"
              value={montoEntregado}
              onChange={(e) => setMontoEntregado(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            />
            {montoEntregado && (
              <Typography 
                variant="body2" 
                color={vuelto >= 0 ? "success.main" : "error.main"}
                sx={{ mt: 1 }}
              >
                Vuelto: ${vuelto.toLocaleString()}
              </Typography>
            )}
          </Box>
        )}

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button 
          onClick={handlePago} 
          variant="contained" 
          disabled={!puedePagar || loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Confirmar Pago'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Componente de Boleta Profesional
function BoletaComponent({ venta, items, vendedor, onClose }: any) {
  const fechaActual = new Date();
  
  // Agregar estilos de impresión
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body * { visibility: hidden; }
        .boleta-print, .boleta-print * { visibility: visible; }
        .boleta-print { position: absolute; left: 0; top: 0; width: 100%; }
        .no-print { display: none !important; }
        .boleta-print { font-size: 12px; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <Box sx={{ bgcolor: 'white', maxWidth: '600px', mx: 'auto', '@media print': { display: 'block' } }}>
      {/* Header de la Boleta */}
      <Box sx={{ p: 3, borderBottom: '2px solid #000', textAlign: 'center' }}>
        <Typography variant="h5" fontWeight="bold" mb={1}>
          PASTELERÍA 1000 SABORES
        </Typography>
        <Typography variant="body2" mb={0.5}>
          RUT: 11.111.111-1
        </Typography>
        <Typography variant="body2" mb={0.5}>
          San Joaquín, Santiago - Chile
        </Typography>
        <Typography variant="body2" mb={1}>
          Giro: Elaboración y Venta de Productos de Pastelería
        </Typography>
        
        <Box sx={{ mt: 2, p: 1, border: '1px solid #000', display: 'inline-block' }}>
          <Typography variant="h6" fontWeight="bold">
            BOLETA DE VENTA Y SERVICIOS
          </Typography>
          <Typography variant="body1">
            N° {venta.folio || venta.id}
          </Typography>
        </Box>
      </Box>

      {/* Datos de la Venta */}
      <Box sx={{ p: 2, borderBottom: '1px solid #ddd' }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2">
              <strong>Fecha:</strong> {fechaActual.toLocaleDateString('es-CL')}
            </Typography>
            <Typography variant="body2">
              <strong>Hora:</strong> {fechaActual.toLocaleTimeString('es-CL')}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2">
              <strong>Vendedor:</strong> {venta.vendedor?.nombre || vendedor?.name || (vendedor?.rol === 'admin' ? 'Administrador' : 'Vendedor')}
            </Typography>
            <Typography variant="body2">
              <strong>Método de Pago:</strong> {venta.resumen?.medioPago || venta.medioPago || 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Detalle de Productos */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" mb={2}>
          DETALLE DE LA VENTA
        </Typography>
        
        <Table size="small" sx={{ mb: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell><strong>Producto</strong></TableCell>
              <TableCell align="center"><strong>Cant.</strong></TableCell>
              <TableCell align="right"><strong>P. Unit.</strong></TableCell>
              <TableCell align="right"><strong>Total</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(venta.items || items).map((item: any, index: number) => {
              // Manejar ambas estructuras: del backend (items) y del carrito local
              const nombreProducto = typeof item.producto === 'string' ? item.producto : item.producto?.nombre;
              const precioUnitario = item.precioUnitario || item.producto?.precio;
              const subtotal = item.subtotal || (item.producto?.precio * item.cantidad);
              
              return (
                <TableRow key={index}>
                  <TableCell sx={{ fontSize: '0.85rem' }}>
                    {nombreProducto}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: '0.85rem' }}>
                    {item.cantidad}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                    ${precioUnitario?.toLocaleString()}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                    ${subtotal?.toLocaleString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Totales */}
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #ddd' }}>
          <Grid container>
            <Grid size={{ xs: 6 }}>
              {/* Información adicional */}
              <Typography variant="caption" color="text.secondary">
                Boleta electrónica válida ante el SII
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ textAlign: 'right' }}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2">Neto:</Typography>
                  <Typography variant="body2">${(venta.resumen?.neto || venta.neto || 0).toLocaleString()}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2">IVA (19%):</Typography>
                  <Typography variant="body2">${(venta.resumen?.iva || venta.iva || 0).toLocaleString()}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" sx={{ borderTop: '1px solid #000', pt: 0.5 }}>
                  <Typography variant="h6" fontWeight="bold">TOTAL:</Typography>
                  <Typography variant="h6" fontWeight="bold">${(venta.resumen?.total || venta.total || 0).toLocaleString()}</Typography>
                </Box>
                
                {(venta.resumen?.medioPago || venta.medioPago) === 'EFECTIVO' && (
                  <>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography variant="body2">Recibido:</Typography>
                      <Typography variant="body2">${(venta.resumen?.montoEntregado || venta.montoEntregado || 0).toLocaleString()}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="success.main">Vuelto:</Typography>
                      <Typography variant="body2" color="success.main" fontWeight="bold">
                        ${(venta.resumen?.vuelto || venta.vuelto || 0).toLocaleString()}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, bgcolor: 'grey.100', textAlign: 'center', borderTop: '1px solid #ddd' }}>
        <Typography variant="caption" color="text.secondary" display="block">
          ¡Gracias por preferirnos!
        </Typography>
      </Box>

      {/* Botones de acción */}
      <Box sx={{ p: 2, display: 'flex', gap: 2, justifyContent: 'center', borderTop: '1px solid #ddd', '@media print': { display: 'none' } }}>
        <Button 
          variant="outlined" 
          onClick={() => window.print()}
          startIcon={<Receipt />}
        >
          Imprimir Boleta
        </Button>
        <Button 
          variant="contained" 
          onClick={onClose}
        >
          Nueva Venta
        </Button>
      </Box>
    </Box>
  );
}