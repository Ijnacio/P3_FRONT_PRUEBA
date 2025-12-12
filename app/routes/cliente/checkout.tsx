import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { 
  Box, Container, Typography, Button, TextField, Paper, 
  RadioGroup, FormControlLabel, Radio, FormControl, FormLabel,
  Alert, Stepper, Step, StepLabel, Grid, Card, CardContent, Divider, Dialog, DialogContent, DialogActions
} from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';
import { createVenta } from '../../services/api';
import Boleta from '../../components/molecules/Boleta';

const steps = ['Información', 'Entrega', 'Pago', 'Confirmación'];

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, clearCart } = useCart();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pedidoRealizado, setPedidoRealizado] = useState<any>(null);
  const [showBoleta, setShowBoleta] = useState(false);
  const boletaRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    clienteNombre: user?.name || '',
    clienteEmail: user?.email || '',
    clienteTelefono: user?.telefono || '',
    clienteRut: user?.rut || '',
    tipoEntrega: 'RETIRO',
    direccionDespacho: '',
    medioPago: 'EFECTIVO',
    notasCliente: ''
  });
  const [showRutField, setShowRutField] = useState(!!user?.rut);

  const subtotal = items.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);
  const iva = Math.round(subtotal * 0.19); // 19% IVA
  const costoEnvio = formData.tipoEntrega === 'ENVIO' ? 3000 : 0;
  const total = subtotal + costoEnvio;

  // Auto-skip info step if user is logged in
  useEffect(() => {
    if (user && user.name && user.email && activeStep === 0) {
      // User is logged in with complete data, skip to delivery step
      setActiveStep(1);
    }
  }, [user]);

  if (items.length === 0 && !pedidoRealizado) {
    navigate('/carrito');
    return null;
  }

  const handleNext = () => {
    if (activeStep === 0 && (!formData.clienteNombre || !formData.clienteEmail)) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }
    if (activeStep === 1 && formData.tipoEntrega === 'ENVIO' && !formData.direccionDespacho) {
      setError('Por favor ingresa la dirección de envío');
      return;
    }
    setError('');
    if (activeStep === steps.length - 2) {
      handleSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      const ventaData = {
        items: items.map(item => ({
          productoId: item.producto.id,
          cantidad: item.cantidad
        })),
        medioPago: formData.medioPago as any,
        tipoEntrega: formData.tipoEntrega as any,
        clienteNombre: formData.clienteNombre,
        clienteEmail: formData.clienteEmail,
        clienteTelefono: formData.clienteTelefono || undefined,
        clienteRut: formData.clienteRut || undefined,
        direccionDespacho: formData.tipoEntrega === 'ENVIO' ? formData.direccionDespacho : undefined,
        notasCliente: formData.notasCliente || undefined
      };

      const result = await createVenta(ventaData);
      setPedidoRealizado(result);
      clearCart();
      setActiveStep(steps.length - 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant='h6' gutterBottom>Información de Contacto</Typography>
            {user ? (
              <Alert severity='info' sx={{ mb: 2 }}>
                ✓ Tus datos están guardados. Puedes editarlos si lo necesitas.
              </Alert>
            ) : (
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Necesitamos estos datos para confirmar tu pedido
              </Typography>
            )}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label='Nombre completo'
                  value={formData.clienteNombre}
                  onChange={(e) => setFormData({...formData, clienteNombre: e.target.value})}
                  required
                  placeholder='Juan Pérez González'
                  helperText='Ingresa tu nombre como aparece en tu cédula'
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label='Email'
                  type='email'
                  value={formData.clienteEmail}
                  onChange={(e) => setFormData({...formData, clienteEmail: e.target.value})}
                  required
                  placeholder='tu@email.com'
                  helperText='Recibirás la confirmación aquí'
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label='Teléfono de contacto'
                  value={formData.clienteTelefono}
                  onChange={(e) => setFormData({...formData, clienteTelefono: e.target.value})}
                  placeholder='+56 9 1234 5678'
                  helperText='Para coordinar la entrega'
                />
              </Grid>
              {!showRutField && (
                <Grid size={{ xs: 12 }}>
                  <Button 
                    variant='text' 
                    size='small'
                    onClick={() => setShowRutField(true)}
                    sx={{ textTransform: 'none' }}
                  >
                    + Agregar RUT (opcional, para factura)
                  </Button>
                </Grid>
              )}
              {showRutField && (
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label='RUT (opcional)'
                    value={formData.clienteRut}
                    onChange={(e) => setFormData({...formData, clienteRut: e.target.value})}
                    placeholder='12345678-9'
                    helperText='Solo si necesitas factura'
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant='h6' gutterBottom>Método de Entrega</Typography>
            <FormControl component='fieldset'>
              <RadioGroup
                value={formData.tipoEntrega}
                onChange={(e) => setFormData({...formData, tipoEntrega: e.target.value})}
              >
                <FormControlLabel 
                  value='RETIRO' 
                  control={<Radio />} 
                  label='Retiro en tienda (Gratis)' 
                />
                <FormControlLabel 
                  value='ENVIO' 
                  control={<Radio />} 
                  label='Envío a domicilio ($3.000)' 
                />
              </RadioGroup>
            </FormControl>

            {formData.tipoEntrega === 'ENVIO' && (
              <TextField
                fullWidth
                label='Dirección de envío'
                value={formData.direccionDespacho}
                onChange={(e) => setFormData({...formData, direccionDespacho: e.target.value})}
                required
                multiline
                rows={3}
                sx={{ mt: 2 }}
              />
            )}

            <TextField
              fullWidth
              label='Notas adicionales (opcional)'
              value={formData.notasCliente}
              onChange={(e) => setFormData({...formData, notasCliente: e.target.value})}
              multiline
              rows={3}
              sx={{ mt: 2 }}
              placeholder='Ej: Sin azúcar, entregar después de las 18:00...'
            />
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant='h6' gutterBottom>Método de Pago</Typography>
            <FormControl component='fieldset'>
              <RadioGroup
                value={formData.medioPago}
                onChange={(e) => setFormData({...formData, medioPago: e.target.value})}
              >
                <FormControlLabel 
                  value='EFECTIVO' 
                  control={<Radio />} 
                  label='Efectivo (Pago al recibir/retirar)' 
                />
                <FormControlLabel 
                  value='DEBITO' 
                  control={<Radio />} 
                  label='Tarjeta de Débito' 
                />
                <FormControlLabel 
                  value='CREDITO' 
                  control={<Radio />} 
                  label='Tarjeta de Crédito' 
                />
              </RadioGroup>
            </FormControl>

            <Alert severity='info' sx={{ mt: 2 }}>
              El pago se realizará al momento de {formData.tipoEntrega === 'RETIRO' ? 'retirar' : 'recibir'} tu pedido
            </Alert>
          </Box>
        );

      case 3:
        return pedidoRealizado && (
          <Box textAlign='center'>
            <Typography variant='h5' color='success.main' gutterBottom fontWeight='bold'>
              ¡Pedido Realizado con Éxito!
            </Typography>
            <Typography variant='h4' sx={{ my: 3 }}>
              Boleta N° {pedidoRealizado.numeroBoleta || pedidoRealizado.boleta || pedidoRealizado.id}
            </Typography>
            <Alert severity='success' sx={{ mb: 3 }}>
              Hemos recibido tu pedido correctamente. Te enviaremos un email de confirmación a {formData.clienteEmail}
            </Alert>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant='h6' gutterBottom>Resumen del Pedido</Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ textAlign: 'left' }}>
                  <Typography><strong>Nombre:</strong> {formData.clienteNombre}</Typography>
                  <Typography><strong>Email:</strong> {formData.clienteEmail}</Typography>
                  <Typography><strong>Entrega:</strong> {formData.tipoEntrega === 'RETIRO' ? 'Retiro en tienda' : 'Envío a domicilio'}</Typography>
                  <Typography><strong>Pago:</strong> {formData.medioPago}</Typography>
                  <Typography><strong>Total:</strong> ${pedidoRealizado.montoTotal?.toLocaleString() || pedidoRealizado.total?.toLocaleString() || '0'}</Typography>
                </Box>
              </CardContent>
            </Card>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                variant='contained' 
                size='large' 
                startIcon={<PrintIcon />}
                onClick={() => setShowBoleta(true)}
                color='secondary'
              >
                Ver/Imprimir Boleta
              </Button>
              <Button variant='contained' size='large' onClick={() => navigate('/')}>
                Volver al Inicio
              </Button>
              {user && (
                <Button variant='outlined' size='large' onClick={() => navigate('/mis-pedidos')}>
                  Ver Mis Pedidos
                </Button>
              )}
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth='md'>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Button 
            variant='outlined' 
            onClick={() => navigate('/carrito')}
            sx={{ visibility: activeStep < steps.length - 1 ? 'visible' : 'hidden' }}
          >
            ← Volver al Carrito
          </Button>
          <Typography variant='h4' fontWeight='bold' textAlign='center' sx={{ flex: 1 }}>
            Finalizar Compra
          </Typography>
          <Box sx={{ width: '140px' }} /> {/* Espaciador para centrar el título */}
        </Box>

        <Stepper activeStep={activeStep} sx={{ my: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && <Alert severity='error' sx={{ mb: 3 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3 }}>
              {renderStepContent(activeStep)}

              {activeStep < steps.length - 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button
                    onClick={handleBack}
                    variant="outlined"
                  >
                    Atrás
                  </Button>
                  <Button 
                    variant='contained' 
                    onClick={handleNext}
                    disabled={loading}
                  >
                    {activeStep === steps.length - 2 ? (loading ? 'Procesando...' : 'Confirmar Pedido') : 'Siguiente'}
                  </Button>
                </Box>
              )}
            </Paper>
          </Box>

          {activeStep < steps.length - 1 && (
            <Box sx={{ width: { xs: '100%', md: 350 } }}>
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom fontWeight='bold'>
                    Resumen
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />

                  {items.map(item => (
                    <Box key={item.producto.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant='body2'>
                        {item.producto.nombre} x{item.cantidad}
                      </Typography>
                      <Typography variant='body2' fontWeight='600'>
                        ${(item.producto.precio * item.cantidad).toLocaleString()}
                      </Typography>
                    </Box>
                  ))}

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
                    <Typography fontWeight='600'>
                      {costoEnvio === 0 ? 'Gratis' : `$${costoEnvio.toLocaleString()}`}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant='h6' fontWeight='bold'>Total:</Typography>
                    <Typography variant='h6' fontWeight='bold' color='primary'>
                      ${total.toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      </Container>

      {/* Boleta Dialog */}
      <Dialog 
        open={showBoleta} 
        onClose={() => setShowBoleta(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogContent>
          {pedidoRealizado && <Boleta venta={pedidoRealizado} ref={boletaRef} />}
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
                        <title>Boleta N° ${pedidoRealizado?.boleta || pedidoRealizado?.id}</title>
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
    </Box>
  );
}
