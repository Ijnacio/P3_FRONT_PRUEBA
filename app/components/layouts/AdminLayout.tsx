// app/components/layouts/AdminLayout.tsx
import { Outlet, useNavigate, useLocation } from "react-router"; // Importa de "react-router" en v7
import { useAuth } from "../../context/AuthContext";
import { 
  Box, Drawer, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, Toolbar, AppBar, 
  Typography, IconButton, Button, Divider 
} from "@mui/material";
import { 
  Dashboard, Inventory, People, ReceiptLong, 
  Logout, Menu as MenuIcon, Category, MonetizationOn, PointOfSale
} from "@mui/icons-material";
import { useState, useEffect } from "react";

const drawerWidth = 240;

export default function AdminLayout() {
  const { logout, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // PROTECCIÓN DE RUTA
  useEffect(() => {
    // Si no hay usuario logueado, o si el usuario NO es admin
    if (!user || user.rol !== 'admin') {
      // Redirigir al login
      navigate("/login");
    }
  }, [user, navigate]);

  // Si no hay usuario, retornamos null mientras redirige para evitar flash de contenido
  if (!user) return null;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
    { text: 'Productos', icon: <Inventory />, path: '/admin/productos' },
    { text: 'Categorías', icon: <Category />, path: '/admin/categorias' },
    { text: 'Usuarios', icon: <People />, path: '/admin/usuarios' },
    { text: 'Historial Ventas', icon: <ReceiptLong />, path: '/admin/ventas' },
    { text: 'Cerrar Caja', icon: <MonetizationOn />, path: '/admin/cerrar-caja' },
    { text: 'Ir a Caja', icon: <PointOfSale />, path: '/caja' },
  ];

  const drawerContent = (
    <div>
      <Toolbar sx={{ bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" noWrap component="div" fontWeight="bold">
          1000 Sabores
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{ 
                '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.light' } },
                borderRadius: '0 24px 24px 0',
                mr: 2,
                my: 0.5
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'white' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={logout}>
            <ListItemIcon><Logout color="error" /></ListItemIcon>
            <ListItemText primary="Cerrar Sesión" primaryTypographyProps={{ color: 'error' }} />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Barra superior móvil */}
      <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` }, display: { sm: 'none' } }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Administración
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Menú Lateral (Drawer) */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        {/* Móvil */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
        >
          {drawerContent}
        </Drawer>
        {/* Escritorio */}
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none', boxShadow: 3 } }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Contenido Principal */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
        <Toolbar sx={{ display: { sm: 'none' } }} /> {/* Espaciador para móvil */}
        <Outlet />
      </Box>
    </Box>
  );
}