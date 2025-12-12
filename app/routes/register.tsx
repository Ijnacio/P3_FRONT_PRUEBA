import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Box, Container, TextField, Button, Typography, Paper, Alert } from '@mui/material';
import { register as registerUser } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    rut: '',
    email: '',
    password: '',
    telefono: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    
    try {
      await registerUser(formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth='sm' sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant='h4' textAlign='center' gutterBottom fontFamily='Pacifico, cursive' color='primary'>
          Registro
        </Typography>
        
        {error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity='success' sx={{ mb: 2 }}>¡Registrado con éxito! Redirigiendo al login...</Alert>}
        
        <Box component='form' onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label='Nombre completo'
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label='RUT (opcional)'
            value={formData.rut}
            onChange={(e) => setFormData({...formData, rut: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label='Email'
            type='email'
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label='Teléfono'
            value={formData.telefono}
            onChange={(e) => setFormData({...formData, telefono: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label='Contraseña'
            type='password'
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            sx={{ mb: 3 }}
          />
          
          <Button
            fullWidth
            variant='contained'
            type='submit'
            disabled={loading}
            size='large'
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </Button>
          
          <Button
            fullWidth
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
