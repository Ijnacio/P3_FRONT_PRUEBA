import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { api } from "../services/api";
import { jwtDecode } from "jwt-decode";
import type { User, AuthResponse } from "../types";

interface ExtendedAuthResponse extends AuthResponse {
  nombre?: string;
}

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

  // cuando carga la app verificar si hay sesion guardada
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          jwtDecode(token);
          
          const storedUser = localStorage.getItem("user_data");
          if (storedUser) {
            setUser(JSON.parse(storedUser));
            // importante poner el token en axios
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          }
        } catch {
          // si el token no sirve lo borramos
          localStorage.removeItem("access_token");
          localStorage.removeItem("user_data");
        }
      }
    }
    setIsLoading(false);
  }, []);

  // funcion para hacer login
  const login = async (rut: string, pass: string) => {
    const { data } = await api.post<ExtendedAuthResponse>("/auth/login", { rut, password: pass });

    // guardar token en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem("access_token", data.access_token);
    }
    
    // el backend a veces manda name y a veces nombre, hay que revisar ambos
    const nombreUsuario = data.name || data.nombre || (data.rol === 'admin' ? 'Administrador' : 'Vendedor');
    
    const usuarioLogueado: User = {
      id: 0,
      rut: data.rut,
      name: nombreUsuario,
      rol: data.rol
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem("user_data", JSON.stringify(usuarioLogueado));
    }
    
    setUser(usuarioLogueado);
    api.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`;
  };

  // cerrar sesion y limpiar todo
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_data");
      window.location.href = "/login";
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}