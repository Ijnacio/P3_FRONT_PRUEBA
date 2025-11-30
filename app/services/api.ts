import axios from "axios";
import type { 
  AuthResponse, User, 
  Categoria, Producto, 
  Venta, CreateVentaInput, 
  MiCaja, CajaAdmin,
  CreateUserDto, UpdateUserDto, CreateProductoDto, UpdateProductoDto,
  CreateCategoriaDto, UpdateCategoriaDto
} from "../types";

// url del backend
const API_URL = "http://localhost:3006/api/v1";

// crear instancia de axios
export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// funcion para verificar si el backend esta funcionando
export const checkBackendConnection = async () => {
  try {
    const response = await api.get("/health");
    return { connected: true, message: "Backend conectado", data: response.data };
  } catch (error) {
    return { connected: false, message: "Backend no disponible", error };
  }
};

// interceptor para agregar el token a todas las peticiones
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// interceptor para manejar errores, si el token expiro redirigir al login
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

// --- SERVICIOS ---

// Auth
export const login = (rut: string, password: string) => 
  api.post<AuthResponse>("/auth/login", { rut, password }).then(res => res.data);

export const getProfile = () => 
  api.get<User>("/auth/profile").then(res => res.data);

// Productos y Categorías
export const getCategorias = () => 
  api.get<Categoria[]>("/categorias").then(res => res.data);

export const getProductos = () => 
  api.get<Producto[]>("/productos").then(res => res.data);

// Ventas
export const createVenta = (data: CreateVentaInput) => 
  api.post<Venta>("/ventas", data).then(res => res.data);

export const getMiCaja = () => 
  api.get<MiCaja>("/ventas/mi-caja").then(res => res.data);

export const getCajaAdmin = () => 
  api.get<CajaAdmin>("/ventas/caja-admin").then(res => res.data);

export const getHistorialAdmin = (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const qs = params.toString();
  const url = `/ventas/historial-admin${qs ? `?${qs}` : ''}`;
  return api.get<Venta[]>(url).then(res => res.data);
};

export const getMisVentas = () => 
  api.get<Venta[]>("/ventas/mis-ventas").then(res => res.data);

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

// Ventas Admin
export const updateVenta = (id: number, data: Partial<CreateVentaInput>) => 
  api.patch<Venta>(`/ventas/${id}`, data).then(res => res.data);

export const deleteVenta = (id: number) => 
  api.delete(`/ventas/${id}`).then(res => res.data);

// Funciones faltantes de usuarios
export const updateUser = (id: number, data: UpdateUserDto) => 
  api.patch<User>(`/users/${id}`, data).then(res => res.data);

export const deleteUser = (id: number) => 
  api.delete(`/users/${id}`).then(res => res.data);

// Seed
export const runSeed = () => 
  api.post("/seed").then(res => res.data);