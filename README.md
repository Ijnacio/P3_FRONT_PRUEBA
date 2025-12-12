# 🎂 Tienda Pastelería - Frontend

Proyecto de frontend para una tienda de pastelería desarrollado con React Router v7, TypeScript y Material-UI. Este proyecto fue creado como parte de la asignatura de desarrollo web.

## 📝 Descripción

Este es el frontend de un sistema de e-commerce para una pastelería que permite a los clientes ver productos, agregar al carrito y realizar compras. Los administradores pueden gestionar productos, pedidos y usuarios desde un panel administrativo.

## 🚀 Tecnologías Utilizadas

- **React Router v7**: Framework de React para routing
- **TypeScript**: Tipado estático para JavaScript
- **Material-UI (MUI)**: Librería de componentes UI
- **Axios**: Cliente HTTP para consumir la API
- **Vite**: Build tool y dev server
- **Vitest**: Framework de testing

## 📦 Instalación

1. Clonar el repositorio:
```bash
git clone <url-repositorio>
cd tienda-front
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear un archivo `.env` en la raíz del proyecto:
```env
VITE_API_URL=http://localhost:3006/api/v1
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

El proyecto se ejecutará en `http://localhost:5173`

## 🔧 Scripts Disponibles

```bash
npm run dev           # Inicia el servidor de desarrollo
npm run build         # Genera el build de producción
npm start             # Inicia el servidor en producción
npm test              # Ejecuta los tests
npm run test:ui       # Abre la interfaz de Vitest
npm run test:coverage # Genera reporte de cobertura
```

## 📁 Estructura del Proyecto

El proyecto está organizado siguiendo **Atomic Design**:

```
app/
├── components/
│   ├── atoms/          # Componentes básicos (Button, Input, Card, Loader)
│   ├── molecules/      # Componentes compuestos (ProductCard, Boleta)
│   └── layouts/        # Layouts de página (AdminLayout)
├── routes/
│   ├── cliente/        # Rutas para clientes (productos, carrito, checkout)
│   └── admin/          # Rutas para administradores (dashboard, gestión)
├── context/            # Context API (AuthContext, CartContext)
├── services/           # Servicios de API (axios)
├── types/              # Definiciones de TypeScript
├── config/             # Configuraciones (theme de MUI)
└── utils/              # Funciones auxiliares
```

## 🎨 Características Principales

### Para Clientes:
- Ver catálogo de productos
- Buscar y filtrar productos
- Agregar productos al carrito
- Proceso de checkout con validación
- Ver historial de pedidos
- Gestionar perfil

### Para Administradores:
- Dashboard con estadísticas
- Gestión completa de productos (crear, editar, eliminar)
- Gestión de pedidos con cambio de estados
- Gestión de usuarios administradores
- Búsqueda y filtros avanzados en pedidos

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens) para autenticación:
- Los tokens se almacenan en `localStorage`
- Axios interceptors agregan automáticamente el token a las peticiones
- Las rutas protegidas verifican el rol del usuario (admin/cliente)

## 🌐 Configuración de la API

La URL base de la API se configura en el archivo `.env`:
```env
VITE_API_URL=http://localhost:3006/api/v1
```

El backend debe estar corriendo en el puerto 3006 para que el frontend funcione correctamente.

## 👤 Autor

Proyecto desarrollado para la asignatura de Desarrollo Web

## 📄 Notas

- El proyecto usa React 19 y Material-UI v7
- Los estilos usan el tema personalizado con color principal #8B4513 (marrón pastelería)
- El proyecto incluye tests unitarios con Vitest y Testing Library

