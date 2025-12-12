import axios from "axios";
import type { 
  AuthResponse, User, 
  Categoria, Producto, 
  Venta, CreateVentaInput,
  CreateUserDto, UpdateUserDto, CreateProductoDto, UpdateProductoDto,
  CreateCategoriaDto, UpdateCategoriaDto
} from "../types";

const API_URL = "http://localhost:3006/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

export const checkBackendConnection = async () => {
  try {
    const response = await api.get("/health");
    return { connected: true, message: "Backend conectado", data: response.data };
  } catch (error) {
    return { connected: false, message: "Backend no disponible", error };
  }
};

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_data");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
export const login = (identifier: string, password: string) => 
  api.post<AuthResponse>("/auth/login", { identifier, password }).then(res => res.data);

export const register = (data: { name: string; rut?: string; email: string; password: string; telefono?: string }) => 
  api.post<User>("/users/register", data).then(res => res.data);

export const getProfile = () => 
  api.get<User>("/auth/profile").then(res => res.data);

export const updateProfile = (data: Partial<User>) => 
  api.patch<User>("/auth/profile", data).then(res => res.data);

// Productos y Categorías
export const getCategorias = () => 
  api.get<Categoria[]>("/categorias").then(res => res.data);

export const getProductos = () => 
  api.get<{ productos: Producto[]; total: number }>("/productos").then(res => res.data.productos);

export const createVenta = (data: CreateVentaInput) => 
  api.post<Venta>("/ventas", data).then(res => res.data);

export const getHistorialAdmin = (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const qs = params.toString();
  const url = `/ventas/historial-admin${qs ? `?${qs}` : ''}`;
  return api.get<Venta[]>(url).then(res => res.data);
};

export const getMisPedidos = () => 
  api.get<Venta[]>("/ventas/mis-pedidos").then(res => res.data);

export const updateEstadoPedido = (id: number, estado: string) => 
  api.patch<Venta>(`/ventas/${id}/estado`, { estado }).then(res => res.data);

// Usuarios (Solo Admin)
export const getUsers = () => 
  api.get<User[]>("/users").then(res => res.data);

export const createUser = (data: CreateUserDto) => 
  api.post<User>("/users", data).then(res => res.data);

// Productos CRUD
export const createProducto = (data: CreateProductoDto) => 
  api.post<Producto>("/productos", data).then(res => res.data);

export const updateProducto = (id: number, data: UpdateProductoDto) => 
  api.patch<Producto>(`/productos/${id}`, data).then(res => res.data);

export const deleteProducto = (id: number) => 
  api.delete(`/productos/${id}`).then(res => res.data);

export const getProducto = (id: number) => 
  api.get<Producto>(`/productos/${id}`).then(res => res.data);

// Categorías CRUD
export const createCategoria = (data: CreateCategoriaDto) => 
  api.post<Categoria>("/categorias", data).then(res => res.data);

export const updateCategoria = (id: number, data: UpdateCategoriaDto) => 
  api.patch<Categoria>(`/categorias/${id}`, data).then(res => res.data);

export const deleteCategoria = (id: number) => 
  api.delete(`/categorias/${id}`).then(res => res.data);

export const getCategoria = (id: number) => 
  api.get<Categoria>(`/categorias/${id}`).then(res => res.data);

export const updateVenta = (id: number, data: Partial<CreateVentaInput>) => 
  api.patch<Venta>(`/ventas/${id}`, data).then(res => res.data);

export const deleteVenta = (id: number) => 
  api.delete(`/ventas/${id}`).then(res => res.data);

export const updateUser = (id: number, data: UpdateUserDto) => 
  api.patch<User>(`/users/${id}`, data).then(res => res.data);

export const deleteUser = (id: number) => 
  api.delete(`/users/${id}`).then(res => res.data);