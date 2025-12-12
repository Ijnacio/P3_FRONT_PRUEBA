import { useNavigate } from "react-router";
import { useCart } from "../../context/CartContext";
import { 
  Box, Container, Typography, Button, Paper, IconButton, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Card, CardContent, Divider
} from '@mui/material';
import { Delete, Add, Remove, ShoppingCartOutlined, ArrowBack } from '@mui/icons-material';

export default function Carrito() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();

  const subtotal = items.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);
  const iva = Math.round(subtotal * 0.19); // 19% IVA
  const total = subtotal;

  if (items.length === 0) {
    return (
      <Container maxWidth='md' sx={{ py: 8, textAlign: 'center' }}>
        <ShoppingCartOutlined sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant='h5' gutterBottom>
          Tu carrito está vacío
        </Typography>
        <Typography color='text.secondary' paragraph>
          Agrega productos para continuar con tu compra
        </Typography>
        <Button variant='contained' onClick={() => navigate('/')}>
          Ir a la Tienda
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth='lg'>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/')}
          sx={{ mb: 3 }}
        >
          Seguir Comprando
        </Button>

        <Typography variant='h4' gutterBottom fontWeight='bold'>
          Carrito de Compras
        </Typography>

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ flex: 1 }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align='center'>Cantidad</TableCell>
                    <TableCell align='right'>Precio</TableCell>
                    <TableCell align='right'>Subtotal</TableCell>
                    <TableCell align='center'>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.producto.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            component='img'
                            src={item.producto.imagen || item.producto.fotoUrl ? `http://localhost:3006${item.producto.imagen || item.producto.fotoUrl}` : 'https://via.placeholder.com/80?text=Sin+Imagen'}
                            alt={item.producto.nombre}
                            sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                          />
                          <Box>
                            <Typography variant='body1' fontWeight='600'>
                              {item.producto.nombre}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {item.producto.categoria?.nombre}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align='center'>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <IconButton 
                            size='small' 
                            onClick={() => updateQuantity(item.producto.id, Math.max(1, item.cantidad - 1))}
                            disabled={item.cantidad <= 1}
                          >
                            <Remove fontSize='small' />
                          </IconButton>
                          <Typography fontWeight='bold'>{item.cantidad}</Typography>
                          <IconButton 
                            size='small' 
                            onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                            disabled={item.cantidad >= item.producto.stock}
                          >
                            <Add fontSize='small' />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align='right'>
                        ${item.producto.precio.toLocaleString()}
                      </TableCell>
                      <TableCell align='right'>
                        <Typography fontWeight='bold'>
                          ${(item.producto.precio * item.cantidad).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <IconButton 
                          color='error' 
                          onClick={() => removeFromCart(item.producto.id)}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button color='error' onClick={clearCart}>
                Vaciar Carrito
              </Button>
            </Box>
          </Box>

          <Box sx={{ width: { xs: '100%', md: 350 } }}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom fontWeight='bold'>
                  Resumen del Pedido
                </Typography>
                
                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography fontWeight='600'>${subtotal.toLocaleString()}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary" variant="body2">IVA incluido (19%):</Typography>
                  <Typography color="text.secondary" variant="body2">${iva.toLocaleString()}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Envío:</Typography>
                  <Typography color='success.main' fontWeight='600'>A calcular</Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant='h6' fontWeight='bold'>Total:</Typography>
                  <Typography variant='h6' fontWeight='bold' color='primary'>
                    ${total.toLocaleString()}
                  </Typography>
                </Box>

                <Button 
                  variant='contained' 
                  fullWidth 
                  size='large'
                  onClick={() => navigate('/checkout')}
                >
                  Proceder al Pago
                </Button>

                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                  El costo de envío se calculará en el siguiente paso
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
