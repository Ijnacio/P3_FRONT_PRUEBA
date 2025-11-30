import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"), // Página pública (Landing o Login)
  
  route("login", "routes/login.tsx"), // /login
  
  // Rutas del Cajero (POS)
  route("caja", "routes/pos.tsx"), // /caja
  route("cierre-caja", "routes/cierre-caja.tsx"), // /cierre-caja (Resumen diario)

  // Rutas del Admin (Protegidas)
  // Usamos un layout especial para el menú lateral del admin
  layout("components/layouts/AdminLayout.tsx", [
    route("admin", "routes/admin/dashboard.tsx"), // /admin (Dashboard)
    route("admin/productos", "routes/admin/productos.tsx"),
    route("admin/categorias", "routes/admin/categorias.tsx"),
    route("admin/usuarios", "routes/admin/usuarios.tsx"),
    route("admin/ventas", "routes/admin/ventas.tsx"),
    route("admin/cerrar-caja", "routes/admin/cerrar-caja.tsx"),
  ]),

] satisfies RouteConfig;