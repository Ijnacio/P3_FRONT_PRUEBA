import { forwardRef } from 'react';
import { Box, Typography, Divider, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import type { Venta } from '../../types';

interface BoletaProps {
  venta: Venta;
}

const Boleta = forwardRef<HTMLDivElement, BoletaProps>(({ venta }, ref) => {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRut = (rut?: string) => {
    if (!rut) return 'N/A';
    return rut;
  };

  return (
    <Box 
      ref={ref}
      sx={{ 
        p: 4, 
        bgcolor: 'white',
        maxWidth: 800,
        margin: '0 auto',
        fontFamily: 'monospace',
        '@media print': {
          p: 2,
          boxShadow: 'none',
        }
      }}
    >
      {/* ENCABEZADO */}
      <Box sx={{ textAlign: 'center', mb: 3, borderBottom: '2px solid black', pb: 2 }}>
        <Typography variant='h4' sx={{ fontWeight: 'bold', fontFamily: 'Pacifico, cursive', color: '#e91e63' }}>
          1000 Sabores
        </Typography>
        <Typography variant='body2' sx={{ mt: 1 }}>
          <strong>RUT:</strong> 76.XXX.XXX-X
        </Typography>
        <Typography variant='body2'>
          <strong>Razón Social:</strong> Pastelería 1000 Sabores Ltda.
        </Typography>
        <Typography variant='body2'>
          <strong>Dirección:</strong> Av. Principal #123, Santiago, Chile
        </Typography>
        <Typography variant='body2'>
          <strong>Teléfono:</strong> +56 2 2XXX XXXX
        </Typography>
      </Box>

      {/* TIPO DE DOCUMENTO */}
      <Box sx={{ textAlign: 'center', border: '2px solid black', p: 2, mb: 3 }}>
        <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
          BOLETA ELECTRÓNICA N° {venta.boleta || `F-${String(venta.id).padStart(6, '0')}`}
        </Typography>
        <Typography variant='body2' sx={{ mt: 1 }}>
          Fecha de Emisión: {formatDate(venta.fecha)}
        </Typography>
      </Box>

      {/* DATOS DEL CLIENTE */}
      <Box sx={{ mb: 3, border: '1px solid #ccc', p: 2 }}>
        <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 1, borderBottom: '1px solid #ccc', pb: 1 }}>
          DATOS DEL CLIENTE
        </Typography>
        <Typography variant='body2'>
          <strong>Nombre:</strong> {typeof venta.cliente === 'string' ? venta.cliente : venta.cliente?.name || 'Cliente'}
        </Typography>
        <Typography variant='body2'>
          <strong>RUT:</strong> {typeof venta.cliente === 'string' ? 'N/A' : formatRut(venta.cliente?.rut)}
        </Typography>
        <Typography variant='body2'>
          <strong>Email:</strong> {typeof venta.cliente === 'string' ? 'N/A' : venta.cliente?.email || 'N/A'}
        </Typography>
      </Box>

      {/* DETALLE DE PRODUCTOS */}
      <Box sx={{ mb: 3 }}>
        <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 2, borderBottom: '1px solid #ccc', pb: 1 }}>
          DETALLE DE LA VENTA
        </Typography>
        <Table size='small' sx={{ 
          '& .MuiTableCell-root': { 
            border: '1px solid #ccc',
            fontFamily: 'monospace' 
          } 
        }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell><strong>Cant.</strong></TableCell>
              <TableCell><strong>Descripción</strong></TableCell>
              <TableCell align='right'><strong>Precio Unit.</strong></TableCell>
              <TableCell align='right'><strong>Subtotal</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {venta.detalles?.map((detalle, index) => (
              <TableRow key={index}>
                <TableCell>{detalle.cantidad}</TableCell>
                <TableCell>{detalle.producto?.nombre || 'Producto'}</TableCell>
                <TableCell align='right'>${detalle.precioUnitario?.toLocaleString() || '0'}</TableCell>
                <TableCell align='right'>${detalle.subtotal?.toLocaleString() || '0'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* TOTALES */}
      <Box sx={{ mb: 3, border: '2px solid black', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant='body1'>Subtotal:</Typography>
          <Typography variant='body1'>${venta.subtotal?.toLocaleString() || '0'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant='body1'>Costo de Envío:</Typography>
          <Typography variant='body1'>${venta.costoEnvio?.toLocaleString() || '0'}</Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant='h6' sx={{ fontWeight: 'bold' }}>TOTAL:</Typography>
          <Typography variant='h6' sx={{ fontWeight: 'bold' }}>${venta.montoTotal?.toLocaleString() || '0'}</Typography>
        </Box>
        <Typography variant='caption' sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
          (Monto en Pesos Chilenos - CLP)
        </Typography>
      </Box>

      {/* INFORMACIÓN ADICIONAL */}
      <Box sx={{ mb: 3, bgcolor: '#f9f9f9', p: 2, border: '1px solid #ccc' }}>
        <Typography variant='body2' sx={{ mb: 1 }}>
          <strong>Tipo de Entrega:</strong> {venta.tipoEntrega === 'RETIRO' ? 'Retiro en Tienda' : 'Envío a Domicilio'}
        </Typography>
        {venta.direccionEntrega && (
          <Typography variant='body2' sx={{ mb: 1 }}>
            <strong>Dirección de Entrega:</strong> {venta.direccionEntrega}
          </Typography>
        )}
        <Typography variant='body2' sx={{ mb: 1 }}>
          <strong>Forma de Pago:</strong> {venta.metodoPago || 'EFECTIVO'}
        </Typography>
        {venta.notas && (
          <Typography variant='body2' sx={{ mb: 1 }}>
            <strong>Notas:</strong> {venta.notas}
          </Typography>
        )}
      </Box>

      {/* TIMBRE ELECTRÓNICO */}
      <Box sx={{ textAlign: 'center', border: '1px dashed #666', p: 2, mb: 2 }}>
        <Typography variant='caption' sx={{ display: 'block', mb: 1 }}>
          TIMBRE ELECTRÓNICO SII
        </Typography>
        <Typography variant='caption' sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
          {`TED-${venta.id}-${Date.now().toString(36).toUpperCase()}`}
        </Typography>
      </Box>

      {/* FOOTER LEGAL */}
      <Box sx={{ textAlign: 'center', borderTop: '1px solid #ccc', pt: 2 }}>
        <Typography variant='caption' sx={{ display: 'block', mb: 0.5 }}>
          Documento Tributario Electrónico
        </Typography>
        <Typography variant='caption' sx={{ display: 'block', mb: 0.5 }}>
          Este documento es válido sin sello ni firma
        </Typography>
        <Typography variant='caption' sx={{ display: 'block', fontStyle: 'italic' }}>
          ¡Gracias por su compra!
        </Typography>
        <Typography variant='caption' sx={{ display: 'block', mt: 1, color: '#e91e63' }}>
          www.1000sabores.cl
        </Typography>
      </Box>
    </Box>
  );
});

Boleta.displayName = 'Boleta';

export default Boleta;
