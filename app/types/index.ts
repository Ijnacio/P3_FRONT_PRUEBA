// app/types/index.ts

export interface User {
  id: number;
  rut: string;
  name: string;
  rol: 'admin' | 'vendedor';
}

export interface AuthResponse {
  access_token: string;
  rut: string;
  rol: 'admin' | 'vendedor';
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
  precio: number;
  stock: number;
  fotoUrl?: string;
  categoria?: Categoria;
  categoriaId?: number;
}

// --- TIPOS DE VENTAS Y CAJA (Los que faltaban) ---

export interface DetalleVenta {
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Venta {
  id?: number;
  folio?: number;
  fecha: string;
  vendedor?: {
    nombre: string;
    rut: string;
  };
  items?: DetalleVenta[];
  resumen?: {
    neto: number;
    iva: number;
    total: number;
    medioPago: 'EFECTIVO' | 'DEBITO' | 'CREDITO';
    montoEntregado: number;
    vuelto: number;
  };
  // Campos legacy para compatibilidad
  total?: number;
  neto?: number;
  iva?: number;
  medioPago?: 'EFECTIVO' | 'DEBITO' | 'CREDITO';
  montoEntregado?: number;
  vuelto?: number;
  detalles?: DetalleVenta[];
}

export interface CajaAdmin {
  fecha: string;
  cantidadVentas: number;
  detalleCaja: {
    efectivoEnCaja: number;
    bancoDebito: number;
    bancoCredito: number;
    totalVendido: number;
  };
}

export interface MiCaja {
  vendedorId: number;
  fecha: string;
  resumen: {
    totalEfectivo: number;
    totalDebito: number;
    totalCredito: number;
    totalVendido: number;
    cantidadVentas: number;
    // Separado por método de pago
    ventasEfectivo: number;
    ventasDebito: number;
    ventasCredito: number;
  };
}

// Nuevos tipos para usuarios
export interface CreateUserDto {
  name: string;
  rut: string;
  password: string;
  rol: 'admin' | 'vendedor';
}

export interface UpdateUserDto {
  name?: string;
  rut?: string;
  rol?: 'admin' | 'vendedor';
  currentPassword?: string;
  newPassword?: string;
}

// Tipos para productos mejorados
export interface CreateProductoDto {
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  fotoUrl?: string;
  categoriaId: number;
}

export interface UpdateProductoDto {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  stock?: number;
  fotoUrl?: string;
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

// Tipo para boleta/factura
export interface Boleta {
  venta: Venta;
  neto: number;
  iva: number;
  total: number;
  fecha: string;
  numero: number;
}

// Tipos para el Carrito
export interface CartItem {
  producto: Producto;
  cantidad: number;
}

// DTOs de Entrada
export interface CreateVentaInput {
  items: { productoId: number; cantidad: number }[];
  medioPago: 'EFECTIVO' | 'DEBITO' | 'CREDITO';
  montoEntregado?: number;
}

export interface UpdateVentaInput {
  medioPago?: 'EFECTIVO' | 'DEBITO' | 'CREDITO';
}

export interface UpdateVentaInput {
  medioPago?: 'EFECTIVO' | 'DEBITO' | 'CREDITO';
}