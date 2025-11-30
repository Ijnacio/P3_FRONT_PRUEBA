import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { api } from "../services/api"; // Tu conexión con Axios
import { jwtDecode } from "jwt-decode";
import type { User, AuthResponse } from "../types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (rut: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. AL CARGAR LA APP: Revisar si ya había una sesión guardada
  useEffect(() => {
    // Verificar si estamos en el cliente
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          // Decodificamos el token para validar que sea válido
          // (Opcional: Podrías llamar a /auth/profile aquí para estar más seguro)
          jwtDecode(token);
          
          // Reconstruimos el usuario desde el token (asegúrate que tu token traiga estos datos)
          // Si tu token solo trae ID, aquí deberías hacer una llamada a la API.
          // Por ahora, asumiremos que guardamos los datos básicos en localStorage también o los sacamos del token.
          
          const storedUser = localStorage.getItem("user_data");
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } catch (error) {
          console.error("Token inválido", error);
          localStorage.removeItem("access_token");
          localStorage.removeItem("user_data");
        }
      }
    }
    setIsLoading(false);
  }, []);

  // 2. FUNCIÓN LOGIN
  const login = async (rut: string, pass: string) => {
    try {
      // Llamamos a tu Backend NestJS
      const { data } = await api.post<AuthResponse>("/auth/login", { rut, password: pass });

      // Guardamos el token (La llave maestra) - Solo en el cliente
      if (typeof window !== 'undefined') {
        localStorage.setItem("access_token", data.access_token);
      }
      
      // Creamos el objeto usuario con nombres por defecto según rol
      const nombrePorDefecto = data.rol === 'admin' ? 'Administrador' : 'Vendedor';
      const usuarioLogueado: User = {
        id: 0, // El login a veces no devuelve ID directo, pero sí el token. 
        rut: data.rut,
        name: data.name || data.nombre || nombrePorDefecto,
        rol: data.rol
      };

      // Guardamos datos para que no se pierdan al recargar - Solo en el cliente
      if (typeof window !== 'undefined') {
        localStorage.setItem("user_data", JSON.stringify(usuarioLogueado));
      }
      
      setUser(usuarioLogueado);
      
      // Configurar Axios para que use el token en las siguientes llamadas
      api.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`;

    } catch (error) {
      console.error("❌ Error en login:", error);
      throw error; // Lanzamos el error para que la pantalla de Login muestre "Clave incorrecta"
    }
  };

  // 3. FUNCIÓN LOGOUT
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_data");
      window.location.href = "/login"; // Redirección forzada
    }
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto fácil
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}