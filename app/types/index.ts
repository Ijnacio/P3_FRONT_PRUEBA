// app/types/index.ts

export interface User {
  id: number;
  rut: string;
  name: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  rol: 'admin' | 'cliente';
}

export interface AuthResponse {
  access_token: string;
  rut: string;
  rol: 'admin' | 'cliente';
  name?: string;
  nombre?: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  imagen?: string;
  fotoUrl?: string;
  categoria?: Categoria;
  categoriaId?: number;
}

export interface DetalleVenta {
  id: number;
  producto?: Producto;
  productoId?: number;
  imagen?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Venta {
  id: number;
  boleta: string;
  fecha: string;
  cliente?: User;
  estadoPedido: string;
  tipoEntrega: string;
  direccionEntrega?: string;
  metodoPago: string;
  subtotal: number;
  costoEnvio: number;
  montoTotal: number;
  notas?: string;
  detalles?: DetalleVenta[];
}
export interface CreateUserDto {
  name: string;
  rut: string;
  password: string;
  rol: 'admin' | 'cliente';
}

export interface UpdateUserDto {
  name?: string;
  rut?: string;
  rol?: 'admin' | 'cliente';
  currentPassword?: string;
  newPassword?: string;
}

// Tipos para productos mejorados
export interface CreateProductoDto {
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  imagen?: string;
  categoriaId: number;
}

export interface UpdateProductoDto {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  stock?: number;
  imagen?: string;
  categoriaId?: number;
}

// Tipos para categorías
export interface CreateCategoriaDto {
  nombre: string;
  descripcion?: string;
}

export interface UpdateCategoriaDto {
  nombre?: string;
  descripcion?: string;
}

export interface CartItem {
  producto: Producto;
  cantidad: number;
}

export interface CreateVentaInput {
  items: { productoId: number; cantidad: number }[];
  tipoEntrega: 'RETIRO' | 'ENVIO';
  direccionDespacho?: string;
  medioPago: 'EFECTIVO' | 'DEBITO' | 'CREDITO';
  notasCliente?: string;
  clienteNombre?: string;
  clienteEmail?: string;
  clienteTelefono?: string;
  clienteRut?: string;
}