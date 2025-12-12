import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Página principal
  index("routes/home.tsx"),
  
  // Autenticación (Público)
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  
  // ========== RUTAS DE CLIENTE ==========
  route("productos", "routes/cliente/productos.tsx"),
  route("producto/:id", "routes/cliente/producto-detalle.tsx"),
  route("carrito", "routes/cliente/carrito.tsx"),
  route("checkout", "routes/cliente/checkout.tsx"),
  route("mis-pedidos", "routes/cliente/mis-pedidos.tsx"),
  route("perfil", "routes/cliente/perfil.tsx"),

  // ========== RUTAS DE ADMINISTRADOR ==========
  layout("components/layouts/AdminLayout.tsx", [
    route("admin", "routes/admin/dashboard.tsx"),
    route("admin/productos", "routes/admin/productos.tsx"),
    route("admin/usuarios", "routes/admin/usuarios.tsx"),
    route("admin/pedidos", "routes/admin/pedidos.tsx"),
  ]),

] satisfies RouteConfig;