# Sistema POS - Pastelería 1000 Sabores

Sistema de punto de venta (POS) para pastelería desarrollado con React Router v7 y Material-UI.

## Requisitos previos

Antes de empezar necesitas tener instalado:

- Node.js (versión 18 o superior)
- npm (viene con Node.js)
- Git
- El backend del proyecto corriendo en `http://localhost:3006`

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Ijnacio/P3_FRONT_PRUEBA.git
cd P3_FRONT_PRUEBA
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto con:

```env
VITE_API_URL=http://localhost:3006/api/v1
```

**Nota:** Si tu backend está en otra URL, cambiar el valor de `VITE_API_URL`.

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Estructura del proyecto

```
tienda-front/
├── app/
│   ├── components/
│   │   └── layouts/
│   │       └── AdminLayout.tsx      # Layout del panel de administración
│   ├── config/
│   │   └── theme.ts                 # Configuración del tema Material-UI
│   ├── context/
│   │   ├── AuthContext.tsx          # Manejo de autenticación
│   │   └── CartContext.tsx          # Manejo del carrito de compras
│   ├── routes/
│   │   ├── admin/
│   │   │   ├── categorias.tsx       # CRUD de categorías
│   │   │   ├── cerrar-caja.tsx      # Cierre de caja admin
│   │   │   ├── dashboard.tsx        # Dashboard principal admin
│   │   │   ├── productos.tsx        # CRUD de productos
│   │   │   ├── usuarios.tsx         # CRUD de usuarios
│   │   │   └── ventas.tsx           # Historial de ventas
│   │   ├── cierre-caja.tsx          # Cierre de caja vendedor
│   │   ├── home.tsx                 # Página de inicio
│   │   ├── login.tsx                # Página de login
│   │   └── pos.tsx                  # Punto de venta (caja)
│   ├── services/
│   │   └── api.ts                   # Configuración de Axios y endpoints
│   ├── types/
│   │   └── index.ts                 # Tipos TypeScript
│   ├── utils/
│   │   └── dateUtils.ts             # Funciones para manejo de fechas
│   ├── app.css                      # Estilos globales
│   ├── root.tsx                     # Componente raíz
│   └── routes.ts                    # Configuración de rutas
├── public/                          # Archivos estáticos
├── .env                             # Variables de entorno (crear este)
├── package.json                     # Dependencias del proyecto
└── README.md                        # Este archivo

```

## Usuarios de prueba

Para probar el sistema puedes usar estos usuarios (si tu backend tiene datos de ejemplo):

**Administrador:**
- RUT: `12345678-9`
- Contraseña: `admin123`

**Vendedor:**
- RUT: `98765432-1`
- Contraseña: `vendedor123`

## Funcionalidades

### Para Administradores:
- Ver dashboard con estadísticas de ventas
- Gestionar productos (crear, editar, eliminar)
- Gestionar categorías
- Gestionar usuarios (vendedores y admins)
- Ver historial completo de ventas
- Imprimir boletas de ventas anteriores
- Cerrar caja del día

### Para Vendedores:
- Punto de venta (agregar productos, cobrar)
- Ver productos por categoría
- Calcular automáticamente IVA y totales
- Elegir método de pago (efectivo, débito, crédito)
- Imprimir boletas
- Ver mis ventas del día
- Cerrar mi caja

## Scripts disponibles

```bash
npm run dev          # Inicia servidor de desarrollo
npm run build        # Construye la aplicación para producción
npm run start        # Inicia la aplicación en modo producción
npm run typecheck    # Verifica los tipos de TypeScript
```

## Tecnologías usadas

- **React Router v7** - Framework principal
- **Material-UI v7** - Biblioteca de componentes UI
- **Axios** - Cliente HTTP para API
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **date-fns** - Manejo de fechas
- **jwt-decode** - Decodificación de tokens JWT

## Problemas comunes

### No se conecta al backend
- Verificar que el backend esté corriendo en el puerto 3006
- Revisar el archivo `.env` que tenga la URL correcta
- Verificar que no haya firewall bloqueando el puerto

### Error al hacer login
- Verificar que el backend tenga usuarios creados
- Revisar que las credenciales sean correctas
- Abrir la consola del navegador (F12) para ver errores específicos

### Los productos no se cargan
- Verificar que el backend tenga productos y categorías
- Revisar la consola del navegador para ver el error
- Verificar que el token de autenticación sea válido

## Deployment

### Docker Deployment

Para construir y ejecutar con Docker:

```bash
docker build -t my-app .

# Ejecutar el contenedor
docker run -p 3000:3000 tienda-front
```

La aplicación estará disponible en `http://localhost:3000`

## Notas importantes

- El backend debe estar corriendo antes de iniciar el frontend
- Las boletas se imprimen en formato de 80mm para impresoras térmicas
- Los datos se calculan automáticamente (IVA 19% en Chile)
- Las fechas se manejan en zona horaria local para evitar problemas de desfase
- Se usa Material-UI para todos los componentes visuales

## Capturas de pantalla

### Login
Pantalla de autenticación con validación de RUT y contraseña.

### Punto de Venta (POS)
Interfaz principal para vendedores con búsqueda de productos, carrito y métodos de pago.

### Dashboard Admin
Vista general de ventas del día con estadísticas y gráficos.

### Historial de Ventas
Lista completa de ventas con filtros por fecha, vendedor y método de pago.

## Contacto

Para dudas o problemas puedes contactar al desarrollador o revisar la documentación del backend.

---

**Proyecto desarrollado para Pastelería 1000 Sabores - Sistema POS**
